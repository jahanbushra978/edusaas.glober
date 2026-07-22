import { markDevicesOffline, invalidateStats, createShift, updateShift, deleteShift, assignUserShift } from "../../../../src/lib/attendance.js";

export async function handleRegisterDevice(supabase, data) {
  if (!data.device_serial || !data.branch_id) {
    return { ok: false, message: "device_serial and branch_id required" };
  }
  const { error } = await supabase.from("attendance_devices").insert({
    device_serial: data.device_serial.trim(),
    device_name: data.device_name || data.device_serial.trim(),
    branch_id: Number(data.branch_id),
    model: data.device_model || data.model || "K40",
    ip_address: data.ip_address || "",
    port: data.port || 4370,
    status: data.status || "offline",
    webhook_secret: data.webhook_secret || "",
    metadata: data.description ? { description: data.description } : {},
    is_active: true,
  });
  if (error) return { ok: false, message: "Failed to register device", status: 409 };
  return { ok: true };
}

export async function handleUpdateDevice(supabase, data) {
  const { id, ...updates } = data;
  if (!id) return { ok: false, message: "id required" };
  const { error } = await supabase.from("attendance_devices").update(updates).eq("id", id);
  if (error) { console.error("[UpdateDevice]", error.message); return { ok: false, message: "Failed to update device", status: 500 }; }
  return { ok: true };
}

export async function handleDeleteDevice(supabase, data) {
  if (!data.id) return { ok: false, message: "id required" };
  const { error } = await supabase.from("attendance_devices").delete().eq("id", data.id);
  if (error) { console.error("[DeleteDevice]", error.message); return { ok: false, message: "Failed to delete device", status: 500 }; }
  return { ok: true };
}

export async function handleCreateMapping(supabase, data, user) {
  if (!data.device_serial || !data.device_user_id || !data.user_id) {
    return { ok: false, message: "device_serial, device_user_id, user_id required" };
  }
  if (!user && !data.branch_id) {
    return { ok: false, message: "Session required for this action", status: 401 };
  }
  const { error } = await supabase.from("device_user_mappings").insert({
    device_serial: data.device_serial,
    device_user_id: String(data.device_user_id),
    user_type: data.user_type || "student",
    user_id: Number(data.user_id),
    full_name: data.full_name || "",
    branch_id: Number(data.branch_id || user?.branch_id),
  });
  if (error) { console.error("[CreateMapping]", error.message); return { ok: false, message: "Failed to create mapping", status: 409 }; }
  return { ok: true };
}

export async function handleDeleteMapping(supabase, data) {
  if (!data.id) return { ok: false, message: "id required" };
  const { error } = await supabase.from("device_user_mappings").delete().eq("id", data.id);
  if (error) { console.error("[DeleteMapping]", error.message); return { ok: false, message: "Failed to delete mapping", status: 500 }; }
  return { ok: true };
}

export async function handleManualCorrection(supabase, data, user) {
  const { id, user_type, user_id, attendance_date, status, correction_note } = data;
  if (!user_type || !user_id || !attendance_date || !status) {
    return { ok: false, message: "user_type, user_id, attendance_date, status required" };
  }
  if (!user) return { ok: false, message: "Session required for this action", status: 401 };
  const { error } = await supabase.from("attendance_records").upsert({
    id: id || undefined,
    user_type,
    user_id: Number(user_id),
    attendance_date,
    status,
    is_manual: true,
    corrected_by: user.name || user.email || "admin",
    correction_note: correction_note || "",
    updated_at: new Date().toISOString(),
  });
  if (error) { console.error("[ManualCorrection]", error.message); return { ok: false, message: "Failed to save correction", status: 500 }; }
  invalidateStats(Number(data.branch_id || user.branch_id));
  return { ok: true };
}

export async function handleHeartbeat(supabase, data) {
  if (!data.device_serial) return { ok: false, message: "device_serial required" };
  const { error } = await supabase.from("attendance_device_heartbeats").insert({
    bridge_id: data.bridge_id || null,
    device_serial: data.device_serial,
    ip_address: data.ip_address || "",
    status: data.status || "online",
    branch_id: data.branch_id ? Number(data.branch_id) : null,
    computer_name: data.computer_name || null,
    software_version: data.software_version || null,
    battery_level: data.battery_level || null,
    signal_strength: data.signal_strength || null,
    metadata: data.metadata || {},
  });
  if (error) return { ok: false, message: "Failed to record heartbeat", status: 500 };

  const { error: updateError } = await supabase
    .from("attendance_devices")
    .update({
      bridge_id: data.bridge_id || null,
      computer_name: data.computer_name || null,
      software_version: data.software_version || null,
      last_sync_at: new Date().toISOString(),
    })
    .eq("device_serial", data.device_serial);
  if (updateError) console.error("[Heartbeat] Failed to update device:", updateError.message);

  return { ok: true };
}

export async function handleSaveBiometricProfile(supabase, data) {
  const { user_type, user_id, machine_user_id, card_number, fingerprint_enabled, face_enabled, enable_biometric } = data;
  if (!user_type || !user_id) return { ok: false, message: "user_type and user_id required" };

  if (enable_biometric && !machine_user_id) {
    return { ok: false, message: "machine_user_id required when biometric is enabled" };
  }

  if (machine_user_id) {
    const { data: existing } = await supabase
      .from("biometric_profiles")
      .select("id, user_type, user_id")
      .eq("machine_user_id", machine_user_id);
    if (existing && existing.length > 0) {
      const conflict = existing.find(e => e.user_type !== user_type || Number(e.user_id) !== Number(user_id));
      if (conflict) {
        return { ok: false, message: `Machine User ID ${machine_user_id} is already assigned to another ${conflict.user_type}`, status: 409 };
      }
    }
  }

  const { data: existingProfile } = await supabase
    .from("biometric_profiles")
    .select("id")
    .eq("user_type", user_type)
    .eq("user_id", Number(user_id))
    .maybeSingle();

  let error;
  if (existingProfile) {
    if (enable_biometric) {
      const r = await supabase
        .from("biometric_profiles")
        .update({ machine_user_id, card_number, fingerprint_enabled, face_enabled, enable_biometric, updated_at: new Date().toISOString() })
        .eq("id", existingProfile.id);
      error = r.error;
    } else {
      const r = await supabase
        .from("biometric_profiles")
        .update({ enable_biometric: false, updated_at: new Date().toISOString() })
        .eq("id", existingProfile.id);
      error = r.error;
    }
  } else if (enable_biometric) {
    const r = await supabase
      .from("biometric_profiles")
      .insert({ user_type, user_id: Number(user_id), machine_user_id, card_number, fingerprint_enabled, face_enabled, enable_biometric });
    error = r.error;
  }

  if (error) return { ok: false, message: "Failed to save biometric profile", status: 500 };
  return { ok: true };
}

export async function handleTestDeviceConnection(supabase, data) {
  const { ip_address, port } = data;
  if (!ip_address) return { ok: false, message: "IP Address required" };

  const blockedPatterns = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.)/;
  if (!blockedPatterns.test(ip_address)) {
    return { ok: true, online: false, message: "Connection test only supports local network IPs" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`http://${ip_address}:${port || 4370}/`, {
      signal: controller.signal, method: "GET",
    });
    clearTimeout(timeout);
    if (response.ok || response.status < 500) {
      return { ok: true, online: true, message: "Device is online" };
    }
    return { ok: true, online: false, message: "Device responded with unexpected status" };
  } catch (err) {
    return { ok: true, online: false, message: "Connection test failed: Connection error" };
  }
}

export async function handleBulkImportPreview(supabase, data) {
  const { rows } = data;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { ok: false, message: "No data to preview" };
  }

  const machineIds = [...new Set(rows.map(r => String(r.machine_user_id || "").trim()).filter(Boolean))];
  const dupMap = {};

  if (machineIds.length > 0) {
    const { data: existing } = await supabase
      .from("biometric_profiles")
      .select("machine_user_id, user_type, user_id")
      .in("machine_user_id", machineIds);
    if (existing) for (const p of existing) dupMap[p.machine_user_id] = p;
  }

  const studentIds = [...new Set(rows.map(r => r.student_id).filter(Boolean).map(Number))];
  const regNums = [...new Set(rows.map(r => r.registration_number).filter(Boolean).map(Number))];
  const rollNums = [...new Set(rows.map(r => r.roll_number).filter(Boolean).map(String))];
  const teacherIds = [...new Set(rows.map(r => r.teacher_id).filter(Boolean).map(Number))];
  const empCodes = [...new Set(rows.map(r => r.employee_id).filter(Boolean).map(String))];

  const studentsById = {};
  const studentsByRoll = {};
  const teachersById = {};
  const teachersByCode = {};

  const allStudentIds = [...new Set([...studentIds, ...regNums])];
  if (allStudentIds.length > 0) {
    const { data: s } = await supabase.from("students").select("id").in("id", allStudentIds);
    if (s) for (const x of s) studentsById[x.id] = x;
  }
  if (rollNums.length > 0) {
    const { data: s } = await supabase.from("students").select("id, roll_number").in("roll_number", rollNums);
    if (s) for (const x of s) studentsByRoll[x.roll_number] = x;
  }
  if (teacherIds.length > 0) {
    const { data: t } = await supabase.from("teachers").select("id").in("id", teacherIds);
    if (t) for (const x of t) teachersById[x.id] = x;
  }
  if (empCodes.length > 0) {
    const { data: t } = await supabase.from("teachers").select("id, employee_code").in("employee_code", empCodes);
    if (t) for (const x of t) teachersByCode[x.employee_code] = x;
  }

  const matched = [];
  const unmatched = [];
  const duplicate = [];
  const matchUserIdsByType = { student: [], teacher: [] };

  for (const row of rows) {
    const machineUserId = String(row.machine_user_id || "").trim();
    if (!machineUserId) {
      unmatched.push({ ...row, reason: "Missing Machine User ID" });
      continue;
    }

    const dup = dupMap[machineUserId];
    if (dup) {
      duplicate.push({ ...row, reason: `Already assigned to ${dup.user_type} #${dup.user_id}` });
      continue;
    }

    let foundUser = null;
    let foundType = null;

    if (row.student_id && studentsById[Number(row.student_id)]) {
      foundUser = studentsById[Number(row.student_id)]; foundType = "student";
    }
    if (!foundUser && row.registration_number && studentsById[Number(row.registration_number)]) {
      foundUser = studentsById[Number(row.registration_number)]; foundType = "student";
    }
    if (!foundUser && row.roll_number && studentsByRoll[String(row.roll_number)]) {
      foundUser = studentsByRoll[String(row.roll_number)]; foundType = "student";
    }
    if (!foundUser && row.teacher_id && teachersById[Number(row.teacher_id)]) {
      foundUser = teachersById[Number(row.teacher_id)]; foundType = "teacher";
    }
    if (!foundUser && row.employee_id && teachersByCode[String(row.employee_id)]) {
      foundUser = teachersByCode[String(row.employee_id)]; foundType = "teacher";
    }

    if (foundUser && foundType) {
      matchUserIdsByType[foundType === "student" ? "student" : "teacher"].push(Number(foundUser.id));
      matched.push({ ...row, matched_user_type: foundType, matched_user_id: foundUser.id });
    } else {
      unmatched.push({ ...row, reason: "No matching student or teacher found" });
    }
  }

  const existingProfileSet = new Set();
  if (matchUserIdsByType.student.length > 0) {
    const { data: existingStudentProfiles } = await supabase
      .from("biometric_profiles")
      .select("user_type, user_id")
      .eq("user_type", "student")
      .in("user_id", [...new Set(matchUserIdsByType.student)]);
    if (existingStudentProfiles) {
      for (const p of existingStudentProfiles) existingProfileSet.add(`${p.user_type}:${p.user_id}`);
    }
  }
  if (matchUserIdsByType.teacher.length > 0) {
    const { data: existingTeacherProfiles } = await supabase
      .from("biometric_profiles")
      .select("user_type, user_id")
      .eq("user_type", "teacher")
      .in("user_id", [...new Set(matchUserIdsByType.teacher)]);
    if (existingTeacherProfiles) {
      for (const p of existingTeacherProfiles) existingProfileSet.add(`${p.user_type}:${p.user_id}`);
    }
  }

  const finalMatched = [];
  const finalDuplicate = [...duplicate];
  for (let i = matched.length - 1; i >= 0; i--) {
    const key = `${matched[i].matched_user_type}:${matched[i].matched_user_id}`;
    if (existingProfileSet.has(key)) {
      finalDuplicate.push({ ...matched[i], reason: `User already has a biometric profile (${matched[i].matched_user_type} #${matched[i].matched_user_id})` });
      matched.splice(i, 1);
    } else {
      finalMatched.push(matched[i]);
    }
  }

  return { ok: true, total: rows.length, matched_count: finalMatched.length, duplicate_count: finalDuplicate.length, unmatched_count: unmatched.length, matched: finalMatched, duplicate: finalDuplicate, unmatched };
}

export async function handleBulkImportExecute(supabase, data) {
  const { matched_rows } = data;
  if (!matched_rows || !Array.isArray(matched_rows) || matched_rows.length === 0) {
    return { ok: false, message: "No matched rows to import" };
  }

  const records = matched_rows.map(row => ({
    user_type: row.matched_user_type,
    user_id: Number(row.matched_user_id),
    machine_user_id: String(row.machine_user_id).trim(),
    card_number: row.card_number || null,
    fingerprint_enabled: true,
    face_enabled: false,
    enable_biometric: true,
  }));

  const chunkSize = 50;
  let createdCount = 0;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase.from("biometric_profiles").insert(chunk);
    if (!error) createdCount += chunk.length;
  }

  return { ok: true, created_count: createdCount };
}

export async function handleMarkOffline() {
  const result = await markDevicesOffline();
  return { ok: result.ok, count: result.count };
}

export async function handleCleanup(supabase, data, user) {
  if (!user || user.role !== "admin") return { ok: false, message: "Admin only", status: 403 };
  const { data: cleanupResult } = await supabase.rpc("fn_cleanup_old_data", { p_retention_days: data.retention_days || 90 });
  return { ok: true, data: cleanupResult };
}

// ── HR: Shift Management ──

export async function handleCreateShift(supabase, data) {
  try {
    await createShift(data);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message, status: 500 };
  }
}

export async function handleUpdateShift(supabase, data) {
  const { id, ...updates } = data;
  if (!id) return { ok: false, message: "id required" };
  try {
    await updateShift(id, updates);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message, status: 500 };
  }
}

export async function handleDeleteShift(supabase, data) {
  if (!data.id) return { ok: false, message: "id required" };
  try {
    await deleteShift(data.id);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message, status: 500 };
  }
}

export async function handleAssignUserShift(supabase, data) {
  if (!data.user_type || !data.user_id || !data.shift_id) {
    return { ok: false, message: "user_type, user_id, shift_id required" };
  }
  try {
    await assignUserShift(data);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message, status: 500 };
  }
}
