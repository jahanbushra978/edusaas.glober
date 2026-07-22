import { createSupabaseAdminClient } from "./supabase-admin";

// Write batching: events trigger the timer, NOT a periodic interval
const SYNC_BATCH_FLUSH_MS = 30000;
// Read cache: prevents redundant DB reads when events arrive in rapid succession
const CACHE_TTL_MS = 30000;
const CONFIG = {
  lateThreshold: "09:30:00",
  workingHourThreshold: 4,
};

let syncBatch = [];
let syncTimer = null;
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  cache.delete(key);
  return null;
}

function cacheSet(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 100) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

function enqueueSyncLog(entry) {
  syncBatch.push({
    ...entry,
    created_at: new Date().toISOString(),
  });
  if (!syncTimer) {
    syncTimer = setTimeout(async () => {
      const batch = syncBatch.splice(0, syncBatch.length);
      syncTimer = null;
      if (batch.length === 0) return;
      try {
        const supabase = createSupabaseAdminClient();
        await supabase.from("attendance_sync_logs").insert(batch);
      } catch {
      }
    }, SYNC_BATCH_FLUSH_MS);
  }
}

export function calcLateMinutes(date) {
  const time = date.toTimeString().slice(0, 8);
  if (time <= CONFIG.lateThreshold) return 0;
  const [ph, pm] = time.split(":").map(Number);
  const [lh, lm] = CONFIG.lateThreshold.split(":").map(Number);
  return (ph * 60 + pm) - (lh * 60 + lm);
}

export function calcWorkingHours(punchIn, punchOut) {
  if (!punchIn || !punchOut) return 0;
  return Math.round(((new Date(punchOut) - new Date(punchIn)) / 3600000) * 100) / 100;
}

export async function processAttendanceEvent({ deviceSerial, deviceUserId, punchTime, punchType, packetId, rawData, branchId }) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("fn_process_attendance_event", {
    p_device_serial: deviceSerial,
    p_device_user_id: String(deviceUserId),
    p_punch_time: punchTime,
    p_punch_type: punchType || null,
    p_packet_id: packetId || null,
    p_raw_data: rawData || {},
    p_verified: true,
  });

  if (error) {
    enqueueSyncLog({ device_serial: deviceSerial, event_type: "attendance_punch", status: "failed", message: error.message });
    return { ok: false, error: "db_error", message: error.message };
  }

  const result = typeof data === "string" ? JSON.parse(data) : data;

  if (!result.ok) {
    enqueueSyncLog({ device_serial: deviceSerial, event_type: "attendance_punch", status: "failed", message: result.error, raw_payload: rawData });
    return { ok: false, error: result.error, message: result.message || "Processing failed" };
  }

  if (result.is_duplicate) {
    return { ok: true, is_duplicate: true, message: result.message };
  }

  enqueueSyncLog({ device_serial: deviceSerial, event_type: "attendance_punch", status: "success", processed_count: 1, raw_payload: rawData });

  cacheSet(`record:${result.user_type}:${result.user_id}:punch_time`, punchTime);
  if (branchId) invalidateStats(branchId);

  return {
    ok: true,
    data: { log_id: result.log_id, record_id: result.record_id, user_type: result.user_type, user_id: result.user_id },
  };
}

export async function getTodayStats(branchId) {
  const cached = cacheGet(`stats:${branchId}`);
  if (cached) return cached;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("fn_get_today_stats", { p_branch_id: Number(branchId) });

  const stats = (typeof data === "string" ? JSON.parse(data) : data) || {};
  cacheSet(`stats:${branchId}`, stats);
  return stats;
}

export async function getLiveFeed(branchId, limit = 50) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("fn_get_live_feed", { p_branch_id: Number(branchId), p_limit: limit });

  return (typeof data === "string" ? JSON.parse(data) : data) || [];
}

export async function getAttendanceReport({ branchId, userType, startDate, endDate, status }) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("fn_get_attendance_report", {
    p_branch_id: Number(branchId),
    p_start_date: startDate,
    p_end_date: endDate,
    p_user_type: userType || null,
    p_status: status || null,
    p_limit: 500,
  });

  return (typeof data === "string" ? JSON.parse(data) : data) || [];
}

export async function getDeviceStatus(deviceSerial) {
  const cached = cacheGet(`device:${deviceSerial}`);
  if (cached) return cached;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("attendance_devices")
    .select("id, device_serial, device_name, status, last_online_at, last_sync_at, last_attendance_at, ip_address, branch_id")
    .eq("device_serial", deviceSerial)
    .maybeSingle();

  if (data) cacheSet(`device:${deviceSerial}`, data);
  return data;
}

export async function markDevicesOffline() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("fn_mark_devices_offline");
  return { ok: !error, count: error ? 0 : (data || 0) };
}

export async function getDeviceSyncLogs(deviceSerial, limit = 50) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("attendance_sync_logs")
    .select("id, device_serial, event_type, status, message, processed_count, failed_count, created_at")
    .eq("device_serial", deviceSerial)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export function invalidateStats(branchId) {
  cache.delete(`stats:${branchId}`);
}

export function recordToCSV(records) {
  if (!records || records.length === 0) return "";
  const header = "User ID,Type,Date,Punch In,Punch Out,Status,Late Minutes,Early Leave,Overtime,Total Work Hours";
  const rows = records.map((r) =>
    [r.user_id, r.user_type, r.attendance_date, r.punch_in || "", r.punch_out || "", r.status, r.late_minutes || 0, r.early_leave_minutes || 0, r.overtime_minutes || 0, r.working_hours || 0].join(",")
  );
  return [header, ...rows].join("\n");
}

// ── Shift & Schedule Management ──

export async function getShifts(branchId, shiftType) {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("attendance_shifts").select("*");
  if (branchId) q = q.eq("branch_id", Number(branchId));
  if (shiftType) q = q.eq("shift_type", shiftType);
  const { data } = await q.order("start_time", { ascending: true });
  return data || [];
}

export async function createShift(data) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("attendance_shifts").insert(data);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateShift(id, data) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("attendance_shifts").update({ ...data, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteShift(id) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("attendance_shifts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getUserShift(userType, userId) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("attendance_user_shifts")
    .select("*, attendance_shifts(*)")
    .eq("user_type", userType)
    .eq("user_id", Number(userId))
    .eq("is_active", true)
    .maybeSingle();
  return data || null;
}

export async function assignUserShift(data) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("attendance_user_shifts").insert(data);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getUserMonthlyReport(userType, userId, year, month) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("fn_get_user_monthly_report", {
    p_user_type: userType,
    p_user_id: Number(userId),
    p_year: year,
    p_month: month,
  });
  return (typeof data === "string" ? JSON.parse(data) : data) || null;
}

export async function getHrTodayStats(branchId) {
  const cached = cacheGet(`hr_stats:${branchId}`);
  if (cached) return cached;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("fn_get_hr_today_stats", { p_branch_id: Number(branchId) });
  const stats = (typeof data === "string" ? JSON.parse(data) : data) || {};
  cacheSet(`hr_stats:${branchId}`, stats);
  return stats;
}

export function invalidateHrStats(branchId) {
  cache.delete(`hr_stats:${branchId}`);
}

// ── Timeline / Daily Log ──

export async function getDailyTimeline(userType, userId, date) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("id, user_type, user_id, attendance_date, punch_in, punch_out, status, late_minutes, early_leave_minutes, overtime_minutes, total_work_minutes, working_hours")
    .eq("user_type", userType)
    .eq("user_id", Number(userId))
    .eq("attendance_date", date)
    .maybeSingle();
  return data || null;
}

export async function getAttendanceCalendar(userType, userId, year, month) {
  const supabase = createSupabaseAdminClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const { data } = await supabase
    .from("attendance_records")
    .select("attendance_date, punch_in, punch_out, status, late_minutes, working_hours")
    .eq("user_type", userType)
    .eq("user_id", Number(userId))
    .gte("attendance_date", startDate)
    .lte("attendance_date", `${year}-${String(month).padStart(2, "0")}-31`)
    .order("attendance_date", { ascending: true });
  return data || [];
}
