import {
  getTodayStats, getLiveFeed, getAttendanceReport,
  getDeviceSyncLogs, recordToCSV,
  getShifts, getUserShift, getUserMonthlyReport,
  getHrTodayStats, getDailyTimeline, getAttendanceCalendar
} from "../../../../src/lib/attendance.js";

export async function handleStats(supabase, branchId) {
  if (!branchId) return { ok: false, message: "Branch required" };
  const stats = await getTodayStats(branchId);
  return { ok: true, data: stats };
}

export async function handleLive(supabase, branchId, limit = 50) {
  if (!branchId) return { ok: false, message: "Branch required" };
  const feed = await getLiveFeed(branchId, limit);
  return { ok: true, data: feed };
}

export async function handleReport(supabase, params) {
  const { branchId, startDate, endDate, userType, userId, status, format, limit = 50 } = params;

  if (userId && userType) {
    const { data } = await supabase
      .from("attendance_records")
      .select("id, user_type, user_id, attendance_date, punch_in, punch_out, status, late_minutes, working_hours")
      .eq("user_type", userType)
      .eq("user_id", Number(userId))
      .order("attendance_date", { ascending: false })
      .limit(limit);
    return { ok: true, data: data || [] };
  }

  if (!branchId || !startDate || !endDate) {
    return { ok: false, message: "branch_id, start_date, end_date required for report" };
  }

  const report = await getAttendanceReport({ branchId, userType, startDate, endDate, status });

  if (format === "csv") {
    const csv = recordToCSV(report);
    return { ok: true, csv, headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${startDate}_${endDate}.csv"`,
    }};
  }

  return { ok: true, data: report };
}

export async function handleDevices(supabase) {
  const { data } = await supabase
    .from("attendance_devices")
    .select("id, device_serial, device_name, branch_id, model, ip_address, port, status, last_online_at, last_sync_at, last_attendance_at, is_active, created_at")
    .order("created_at", { ascending: false });
  return { ok: true, data: data || [] };
}

export async function handleDeviceSyncLogs(supabase, deviceSerial, limit) {
  if (!deviceSerial) return { ok: false, message: "device_serial required" };
  const logs = await getDeviceSyncLogs(deviceSerial, limit);
  return { ok: true, data: logs };
}

export async function handleBranches(supabase) {
  const { data } = await supabase
    .from("branches")
    .select("id, name_en, name_bn, branch_name")
    .order("name_en", { ascending: true });
  return { ok: true, data: data || [] };
}

export async function handleBridges(supabase) {
  const { data } = await supabase
    .from("attendance_device_heartbeats")
    .select("bridge_id, device_serial, computer_name, branch_id, software_version, status, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const bridgeMap = new Map();
  for (const h of data || []) {
    const key = h.bridge_id || h.device_serial;
    if (!bridgeMap.has(key)) bridgeMap.set(key, h);
  }

  const deviceSerials = [...new Set([...bridgeMap.values()].map(h => h.device_serial))];
  const branchIds = [...new Set([...bridgeMap.values()].map(h => h.branch_id).filter(Boolean))];

  const [devicesRes, branchesRes] = await Promise.all([
    deviceSerials.length > 0
      ? supabase.from("attendance_devices")
          .select("device_serial, device_name, model, last_sync_at, last_attendance_at, is_active")
          .in("device_serial", deviceSerials)
      : Promise.resolve({ data: [] }),
    branchIds.length > 0
      ? supabase.from("branches")
          .select("id, name_en, name_bn")
          .in("id", branchIds)
      : Promise.resolve({ data: [] }),
  ]);

  const devMap = new Map((devicesRes.data || []).map(d => [d.device_serial, d]));
  const branchMap = new Map((branchesRes.data || []).map(b => [b.id, b]));

  const bridges = [];
  for (const [bridgeId, h] of bridgeMap) {
    const dev = devMap.get(h.device_serial);
    const branch = h.branch_id ? branchMap.get(h.branch_id) : null;
    bridges.push({
      bridge_id: bridgeId,
      device_serial: h.device_serial,
      computer_name: h.computer_name || "Unknown",
      branch_id: h.branch_id || null,
      branch_name: branch?.name_en || branch?.name_bn || "Unknown",
      software_version: h.software_version || "N/A",
      status: h.status || "offline",
      device_name: dev?.device_name || h.device_serial,
      device_model: dev?.model || "K40",
      ip_address: h.ip_address || "",
      last_heartbeat_at: h.created_at,
      last_sync_at: dev?.last_sync_at || null,
      last_attendance_at: dev?.last_attendance_at || null,
      is_active: dev?.is_active ?? true,
      is_online: h.status === "online" && Date.now() - new Date(h.created_at).getTime() < 300000,
    });
  }

  return { ok: true, data: bridges };
}

export async function handleDeviceMappings(supabase, deviceSerial) {
  let q = supabase
    .from("device_user_mappings")
    .select("id, device_serial, device_user_id, user_type, user_id, full_name, is_active, branch_id, created_at");
  if (deviceSerial) q = q.eq("device_serial", deviceSerial);
  const { data } = await q.order("created_at", { ascending: false });
  return { ok: true, data: data || [] };
}

export async function handleUnmappedStudents(supabase, branchId, deviceSerial) {
  if (!branchId || !deviceSerial) {
    return { ok: false, message: "branch_id and device_serial required" };
  }
  const { data: mapped } = await supabase
    .from("device_user_mappings")
    .select("user_id")
    .eq("device_serial", deviceSerial)
    .eq("user_type", "student");
  const mappedIds = (mapped || []).map((m) => m.user_id);

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name_bn, full_name_en, roll_number, class_name")
    .eq("branch_id", branchId)
    .eq("status", "active")
    .limit(200);

  const unmapped = (students || []).filter((s) => !mappedIds.includes(s.id));
  return { ok: true, data: unmapped };
}

export async function handleBiometricProfile(supabase, userType, userId) {
  if (!userType || !userId) {
    return { ok: false, message: "user_type and user_id required" };
  }
  const { data } = await supabase
    .from("biometric_profiles")
    .select("id, user_type, user_id, machine_user_id, card_number, fingerprint_enabled, face_enabled, enable_biometric, created_at, updated_at")
    .eq("user_type", userType)
    .eq("user_id", Number(userId))
    .maybeSingle();
  return { ok: true, data: data || null };
}

// ── HR: Shift Management ──

export async function handleHRShifts(supabase, params) {
  const { branch_id, shift_type } = params;
  const data = await getShifts(branch_id, shift_type);
  return { ok: true, data };
}

export async function handleHRTodayStats(supabase, params) {
  const { branch_id } = params;
  if (!branch_id) return { ok: false, message: "Branch required" };
  const stats = await getHrTodayStats(branch_id);
  return { ok: true, data: stats };
}

export async function handleHRUserShift(supabase, params) {
  const { user_type, user_id } = params;
  if (!user_type || !user_id) return { ok: false, message: "user_type and user_id required" };
  const shift = await getUserShift(user_type, user_id);
  return { ok: true, data: shift };
}

export async function handleHRMonthlyReport(supabase, params) {
  const { user_type, user_id, year, month } = params;
  if (!user_type || !user_id || !year || !month) {
    return { ok: false, message: "user_type, user_id, year, month required" };
  }
  const report = await getUserMonthlyReport(user_type, user_id, Number(year), Number(month));
  return { ok: true, data: report };
}

export async function handleHRTimeline(supabase, params) {
  const { user_type, user_id, date } = params;
  if (!user_type || !user_id || !date) {
    return { ok: false, message: "user_type, user_id, date required" };
  }
  const timeline = await getDailyTimeline(user_type, user_id, date);
  return { ok: true, data: timeline };
}

export async function handleHRCalendar(supabase, params) {
  const { user_type, user_id, year, month } = params;
  if (!user_type || !user_id || !year || !month) {
    return { ok: false, message: "user_type, user_id, year, month required" };
  }
  const calendar = await getAttendanceCalendar(user_type, user_id, Number(year), Number(month));
  return { ok: true, data: calendar };
}
