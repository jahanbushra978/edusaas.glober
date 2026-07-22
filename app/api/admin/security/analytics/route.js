import { NextResponse } from "next/server";
import { verifySessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "../../../../../src/lib/supabase-admin";
import { logger } from "../../../../../src/lib/logger";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, private" } });

    const session = await verifySessionToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store, private" } });
    }

    const supabase = createSupabaseAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const now = new Date().toISOString();

    // 1. Fetch Summary Stats in parallel
    const [
      { count: todaySuccess },
      { count: todayFailed },
      { count: activeBlocks },
      { count: permanentBans },
      { count: activeSessions },
    ] = await Promise.all([
      supabase.from("login_attempts").select("*", { count: "exact", head: true }).eq("status", "SUCCESS").gte("created_at", todayISO),
      supabase.from("login_attempts").select("*", { count: "exact", head: true }).neq("status", "SUCCESS").gte("created_at", todayISO),
      supabase.from("blocked_devices").select("*", { count: "exact", head: true }).eq("is_permanent", false).gt("blocked_until", now),
      supabase.from("blocked_devices").select("*", { count: "exact", head: true }).eq("is_permanent", true),
      supabase.from("active_sessions").select("*", { count: "exact", head: true }).eq("is_revoked", false),
    ]);

    // 2. Fetch login attempts for the last 7 days to calculate daily trend
    const { data: recentLogins } = await supabase
      .from("login_attempts")
      .select("created_at, status")
      .gte("created_at", sevenDaysAgoISO);

    const dailyTrendMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyTrendMap[dateStr] = { date: dateStr, success: 0, failed: 0 };
    }

    (recentLogins || []).forEach(log => {
      const d = new Date(log.created_at);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyTrendMap[dateStr]) {
        if (log.status === "SUCCESS") dailyTrendMap[dateStr].success++;
        else dailyTrendMap[dateStr].failed++;
      }
    });

    const daily_trend = Object.values(dailyTrendMap);

    // 3. Threat Breakdown (Last 30 days)
    const { data: recentEvents } = await supabase
      .from("security_events")
      .select("event_type")
      .gte("created_at", thirtyDaysAgoISO);

    const threatCounts = {};
    (recentEvents || []).forEach(ev => {
      threatCounts[ev.event_type] = (threatCounts[ev.event_type] || 0) + 1;
    });

    const threat_breakdown = Object.keys(threatCounts)
      .map(key => ({ name: key, value: threatCounts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 threats

    // 4. Calculate Risk Score
    // Formula: (Failed Today * 2) + (Active Blocks * 5) + (Permanent Bans * 10)
    let risk_score = ((todayFailed || 0) * 2) + ((activeBlocks || 0) * 5) + ((permanentBans || 0) * 10);
    risk_score = Math.min(100, Math.max(0, risk_score)); // Cap at 100

    let threat_level = "LOW";
    if (risk_score >= 80) threat_level = "CRITICAL";
    else if (risk_score >= 50) threat_level = "HIGH";
    else if (risk_score >= 20) threat_level = "MEDIUM";

    return NextResponse.json({
      ok: true,
      data: {
        today_success: todaySuccess || 0,
        today_failed: todayFailed || 0,
        active_blocks: activeBlocks || 0,
        permanent_bans: permanentBans || 0,
        active_sessions: activeSessions || 0,
        risk_score,
        threat_level,
        daily_trend,
        threat_breakdown,
      }
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    logger.security.error("SOC Analytics Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500, headers: { "Cache-Control": "no-store, private" } });
  }
}
