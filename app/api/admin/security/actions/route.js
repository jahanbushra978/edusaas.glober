import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { verifySessionToken, verifySocSessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";
import { createSupabaseAdminClient } from "../../../../../src/lib/supabase-admin";
import { getClientIp, verifyCsrfOrigin } from "../../../../../src/lib/security";
import { logger } from "../../../../../src/lib/logger";

export const runtime = "nodejs";

let rateLimits = null;
try { rateLimits = new Map(); } catch { rateLimits = null; }

function isRateLimited(ip) {
  if (!rateLimits) return false;
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 20;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  const record = rateLimits.get(ip);
  if (now > record.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= maxRequests) return true;
  record.count += 1;
  return false;
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
    }

    const headersList = await headers();
    const origin = headersList.get('origin');
    const referer = headersList.get('referer');
    const host = headersList.get('host');
    
    // CSRF Check: Ensure request comes from same origin
    if (process.env.NODE_ENV === 'production') {
      const expectedOrigin = process.env.SITE_URL || `https://${host}`;
      if (!origin || origin !== expectedOrigin) {
         if (!origin || !origin.startsWith(`https://${host}`) && !origin.startsWith(`http://${host}`)) {
           return NextResponse.json({ ok: false, message: "CSRF verification failed" }, { status: 403 });
         }
      }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const socToken = cookieStore.get('soc_session')?.value;

    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    if (!socToken) return NextResponse.json({ ok: false, message: "SOC Session Required" }, { status: 403 });

    const session = await verifySessionToken(token);
    const socSession = await verifySocSessionToken(socToken);

    if (!session || !socSession) {
      return NextResponse.json({ ok: false, message: "Invalid session" }, { status: 403 });
    }
    
    if (!['admin', 'branch_admin', 'boarding_manager'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, payload } = body;
    const supabase = createSupabaseAdminClient();

    let result = null;

    if (action === 'ban_device') {
      const { data, error } = await supabase.rpc('soc_ban_device_atomic', {
        p_device_id: payload.device_id,
        p_ip_address: payload.ip_address || ip,
        p_browser_fingerprint: payload.browser_fingerprint || 'unknown',
        p_reason: payload.reason,
        p_lock_level: 99,
        p_is_permanent: payload.is_permanent || false,
        p_blocked_until: payload.is_permanent ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        p_blocked_by: session.loginId || session.role
      });
      if (error) throw error;
      result = data;
    } 
    else if (action === 'unban_device') {
      const { data, error } = await supabase.rpc('soc_unban_device_atomic', {
        p_device_id: payload.device_id,
        p_unblocked_by: session.loginId || session.role,
        p_ip_address: ip
      });
      if (error) throw error;
      result = data;
    }
    else if (action === 'revoke_session') {
      const { data, error } = await supabase.rpc('soc_revoke_session_atomic', {
        p_session_id: payload.session_id,
        p_revoked_by: session.loginId || session.role,
        p_ip_address: ip
      });
      if (error) throw error;
      result = data;
    }
    else if (action === 'update_policy') {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert({ 
          key: 'lockout_thresholds', 
          value: payload.lockout_thresholds 
        }, { onConflict: 'key' });
      if (error) throw error;
      
      await supabase.from('security_events').insert({
        event_type: 'POLICY_UPDATE',
        description: 'Admin updated security policies and thresholds.',
        severity: 'HIGH',
        related_login_id: session.loginId || session.role,
        related_ip: ip
      });
      result = { success: true };
    }
    else if (action === 'delete_event') {
      const { error } = await supabase.from('security_events').delete().eq('id', payload.event_id);
      if (error) throw error;
      result = { success: true };
    }
    else if (action === 'clear_events') {
      const { error } = await supabase.from('security_events').delete().neq('id', -1); // delete all valid events
      if (error) throw error;
      result = { success: true };
    }
    else {
      return NextResponse.json({ ok: false, message: "Invalid action" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, data: result, message: "Action executed atomically" });
    
    // Strict No-Cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    logger.security.error("Security Action API Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}
