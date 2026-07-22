import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { processAttendanceEvent } from "../../../../src/lib/attendance.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let ipHits;
try { ipHits = new Map(); } catch { ipHits = null; }
const RATE_WINDOW = 1000;
const MAX_PER_WINDOW = 20;
const CLEANUP_INTERVAL = 60000;
let lastCleanup = Date.now();

function checkRateLimit(ip) {
  if (!ipHits) return true;
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    const cutoff = now - RATE_WINDOW;
    for (const [key, timestamps] of ipHits) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) ipHits.delete(key);
      else ipHits.set(key, valid);
    }
    lastCleanup = now;
  }
  const windowStart = now - RATE_WINDOW;
  const hits = (ipHits.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length <= MAX_PER_WINDOW;
}

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function verifySecret(authHeader, deviceSecret) {
  if (!deviceSecret) return false;
  if (!authHeader) return false;
  return safeCompare(authHeader.replace("Bearer ", "").trim(), deviceSecret);
}

function verifyApiKey(apiKeyHeader) {
  if (!apiKeyHeader) return false;
  const expectedKey = process.env.BIOMETRIC_API_KEY;
  if (!expectedKey) return false;
  return safeCompare(apiKeyHeader.trim(), expectedKey);
}

function normalizeEvent(body) {
  return {
    deviceSerial: body.device_serial || body.DeviceSerial || body.serial || body.SN,
    deviceUserId: String(body.device_user_id || body.DeviceUserId || body.UserId || body.PIN || ""),
    punchTime: body.punch_time || body.PunchTime || body.Time || body.RecordTime,
    punchType: (body.punch_type || body.PunchType || body.VerifyMode || "").toLowerCase(),
    packetId: String(body.packet_id || body.PacketID || body.TransactionID || body.uid || ""),
    bridgeId: body.bridge_id || null,
    computerName: body.computer_name || null,
    rawData: body,
  };
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "rate_limit", retry_after: 1 }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const events = Array.isArray(body) ? body : [body];
    if (events.length > 50) {
      return NextResponse.json({ ok: false, error: "batch_too_large", max_batch: 50 }, { status: 413 });
    }

    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");

    // Bridge connections bypass per-device webhook secret (authenticated via x-api-key)
    const isBridgeRequest = apiKeyHeader && verifyApiKey(apiKeyHeader);
    if (apiKeyHeader && !isBridgeRequest) {
      return NextResponse.json({ ok: false, error: "invalid_api_key" }, { status: 401 });
    }

    const first = normalizeEvent(events[0]);

    if (!first.deviceSerial || !first.deviceUserId) {
      return NextResponse.json({ ok: false, error: "missing_fields", required: ["device_serial", "device_user_id"] }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: device } = await supabase
      .from("attendance_devices")
      .select("id, device_serial, webhook_secret, is_active, branch_id")
      .eq("device_serial", first.deviceSerial)
      .maybeSingle();

    if (!device) {
      return NextResponse.json({ ok: false, error: "unknown_device" }, { status: 401 });
    }

    if (!device.is_active) {
      return NextResponse.json({ ok: false, error: "device_inactive" }, { status: 403 });
    }

    if (!isBridgeRequest && !verifySecret(authHeader, device.webhook_secret)) {
      return NextResponse.json({ ok: false, error: "invalid_secret" }, { status: 401 });
    }

    const results = [];
    for (const event of events) {
      const normalized = normalizeEvent(event);
      const cleanTime = normalized.punchTime
        ? new Date(normalized.punchTime).toISOString()
        : new Date().toISOString();
      const punchType = ["in", "out"].includes(normalized.punchType)
        ? normalized.punchType
        : new Date(cleanTime).getHours() < 12 ? "in" : "out";

      const result = await processAttendanceEvent({
        deviceSerial: device.device_serial,
        deviceUserId: normalized.deviceUserId,
        punchTime: cleanTime,
        punchType,
        packetId: normalized.packetId,
        rawData: normalized.rawData,
        branchId: device.branch_id,
      });

      results.push({
        device_user_id: normalized.deviceUserId,
        ok: result.ok,
        warning: !result.ok ? result.message : result.is_duplicate ? result.message : undefined,
        data: result.data || null,
      });
    }

    const okCount = results.filter((r) => r.ok).length;
    return NextResponse.json({
      ok: true,
      processed: results.length,
      successful: okCount,
      results,
    });
  } catch (error) {
    console.error("[Attendance Webhook]", error);
    return NextResponse.json({ ok: false, error: "internal", message: "An internal error occurred" }, { status: 500 });
  }
}
