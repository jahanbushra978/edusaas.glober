import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { getSession, requireAdmin, safeCompare } from "./helpers.js";
import {
  handleStats, handleLive, handleReport, handleDevices,
  handleDeviceSyncLogs, handleBranches, handleBridges,
  handleDeviceMappings, handleUnmappedStudents, handleBiometricProfile,
  handleHRShifts, handleHRTodayStats, handleHRUserShift,
  handleHRMonthlyReport, handleHRTimeline, handleHRCalendar,
} from "./get-handlers.js";
import {
  handleRegisterDevice, handleUpdateDevice, handleDeleteDevice,
  handleCreateMapping, handleDeleteMapping, handleManualCorrection,
  handleHeartbeat, handleSaveBiometricProfile, handleTestDeviceConnection,
  handleBulkImportPreview, handleBulkImportExecute,
  handleMarkOffline, handleCleanup,
  handleCreateShift, handleUpdateShift, handleDeleteShift,
  handleAssignUserShift,
} from "./post-handlers.js";
import { logger } from "../../../../src/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const user = await requireAdmin(supabase, session);
  if (!user || !["admin", "branch_admin"].includes(user.role)) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const branchId = parseInt(searchParams.get("branch_id") || user.branch_id || "0");

  try {
    let result;

    if (action === "stats") {
      result = await handleStats(supabase, branchId);
    } else if (action === "live") {
      const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
      result = await handleLive(supabase, branchId, limit);
    } else if (action === "report") {
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");
      const userType = searchParams.get("user_type") || undefined;
      const userId = searchParams.get("user_id");
      const status = searchParams.get("status") || undefined;
      const format = searchParams.get("format");
      const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
      result = await handleReport(supabase, { branchId, startDate, endDate, userType, userId, status, format, limit });
    } else if (action === "devices") {
      result = await handleDevices(supabase);
    } else if (action === "device_sync_logs") {
      const deviceSerial = searchParams.get("device_serial");
      const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
      result = await handleDeviceSyncLogs(supabase, deviceSerial, limit);
    } else if (action === "branches") {
      result = await handleBranches(supabase);
    } else if (action === "bridges") {
      result = await handleBridges(supabase);
    } else if (action === "device_mappings") {
      const deviceSerial = searchParams.get("device_serial");
      result = await handleDeviceMappings(supabase, deviceSerial);
    } else if (action === "unmapped_students") {
      const deviceSerial = searchParams.get("device_serial");
      result = await handleUnmappedStudents(supabase, branchId, deviceSerial);
    } else if (action === "biometric_profile") {
      const userType = searchParams.get("user_type");
      const userId = searchParams.get("user_id");
      result = await handleBiometricProfile(supabase, userType, userId);
    } else if (action === "bulk_import_preview") {
      return NextResponse.json({ ok: false, message: "Use POST for bulk_import_preview" }, { status: 400 });
    } else if (action === "hr_shifts") {
      result = await handleHRShifts(supabase, { branch_id: branchId, shift_type: searchParams.get("shift_type") });
    } else if (action === "hr_today_stats") {
      result = await handleHRTodayStats(supabase, { branch_id: branchId });
    } else if (action === "hr_user_shift") {
      result = await handleHRUserShift(supabase, { user_type: searchParams.get("user_type"), user_id: searchParams.get("user_id") });
    } else if (action === "hr_monthly_report") {
      result = await handleHRMonthlyReport(supabase, { user_type: searchParams.get("user_type"), user_id: searchParams.get("user_id"), year: searchParams.get("year"), month: searchParams.get("month") });
    } else if (action === "hr_timeline") {
      result = await handleHRTimeline(supabase, { user_type: searchParams.get("user_type"), user_id: searchParams.get("user_id"), date: searchParams.get("date") });
    } else if (action === "hr_calendar") {
      result = await handleHRCalendar(supabase, { user_type: searchParams.get("user_type"), user_id: searchParams.get("user_id"), year: searchParams.get("year"), month: searchParams.get("month") });
    } else {
      return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
    }

    if (result.headers) {
      return new NextResponse(result.csv, { headers: result.headers });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.attendance.error("GET handler error", { error: error instanceof Error ? error.message : String(error), action });
    return NextResponse.json({ ok: false, message: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request) {
  const apiKeyHeader = request.headers.get("x-api-key");
  const expectedApiKey = process.env.BIOMETRIC_API_KEY;
  const validApiKey = !!(apiKeyHeader && expectedApiKey && safeCompare(apiKeyHeader.trim(), expectedApiKey));

  if (apiKeyHeader && !validApiKey) {
    return NextResponse.json({ ok: false, message: "Invalid API key" }, { status: 401 });
  }

  let supabase, user;
  if (!validApiKey) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    supabase = createSupabaseAdminClient();
    user = await requireAdmin(supabase, session);
    if (!user || !["admin", "branch_admin"].includes(user.role)) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }
  } else {
    supabase = createSupabaseAdminClient();
    user = null;
  }

  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json({ ok: false, message: "action required" }, { status: 400 });
    }

    let result;
    switch (action) {
      case "register_device": result = await handleRegisterDevice(supabase, data); break;
      case "update_device": result = await handleUpdateDevice(supabase, data); break;
      case "delete_device": result = await handleDeleteDevice(supabase, data); break;
      case "create_mapping": result = await handleCreateMapping(supabase, data, user); break;
      case "delete_mapping": result = await handleDeleteMapping(supabase, data); break;
      case "manual_correction": result = await handleManualCorrection(supabase, data, user); break;
      case "heartbeat": result = await handleHeartbeat(supabase, data); break;
      case "save_biometric_profile": result = await handleSaveBiometricProfile(supabase, data); break;
      case "test_device_connection": result = await handleTestDeviceConnection(supabase, data); break;
      case "bulk_import_preview": result = await handleBulkImportPreview(supabase, data); break;
      case "bulk_import_execute": result = await handleBulkImportExecute(supabase, data); break;
      case "mark_offline": result = await handleMarkOffline(); break;
      case "cleanup": result = await handleCleanup(supabase, data, user); break;
      case "create_shift": result = await handleCreateShift(supabase, data); break;
      case "update_shift": result = await handleUpdateShift(supabase, data); break;
      case "delete_shift": result = await handleDeleteShift(supabase, data); break;
      case "assign_user_shift": result = await handleAssignUserShift(supabase, data); break;
      default: return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json(result, { status: result.status || 200 });
  } catch (error) {
    logger.attendance.error("POST handler error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "An internal error occurred" }, { status: 500 });
  }
}
