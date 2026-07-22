import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, verifySocSessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";
import { createSupabaseAdminClient } from "../../../../../src/lib/supabase-admin";
import { getClientIp } from "../../../../../src/lib/security";
import { logger } from "../../../../../src/lib/logger";

export const runtime = "nodejs";

let rateLimits = null;
try { rateLimits = new Map(); } catch { rateLimits = null; }

function isRateLimited(ip) {
  if (!rateLimits) return false;
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 60;

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

function sanitizeSearchQuery(query) {
  if (!query) return '';
  return query.replace(/[%_]/g, '').slice(0, 100);
}

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
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
    
    // Verify role / granular permissions
    // For this implementation, admins and branch admins have security.view implicitly.
    if (!['admin', 'branch_admin', 'boarding_manager'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 20;
    const query = searchParams.get('query') || '';
    
    const supabase = createSupabaseAdminClient();
    const offset = (page - 1) * pageSize;
    
    let result = { rows: [], totalPages: 0, totalRecords: 0 };
    
    const applySearch = (q, fields) => {
      const sanitized = sanitizeSearchQuery(query);
      if (!sanitized) return q;
      const orString = fields.map(f => `${f}.ilike.%${sanitized}%`).join(',');
      return q.or(orString);
    };

    if (type === 'logins') {
      let q = supabase.from('login_attempts').select('*', { count: 'exact' });
      q = applySearch(q, ['login_id', 'ip_address', 'country', 'browser', 'os', 'device_id']);
      const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      if (!error && data) result = { rows: data, totalRecords: count, totalPages: Math.ceil(count / pageSize) };
    } 
    else if (type === 'blocks') {
      let q = supabase.from('blocked_devices').select('*', { count: 'exact' });
      q = applySearch(q, ['device_id', 'ip_address', 'reason']);
      const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      if (!error && data) result = { rows: data, totalRecords: count, totalPages: Math.ceil(count / pageSize) };
    }
    else if (type === 'sessions') {
      let q = supabase.from('active_sessions').select('*', { count: 'exact' });
      q = applySearch(q, ['login_id', 'ip_address', 'user_agent', 'country']);
      const { data, count, error } = await q.order('login_time', { ascending: false }).range(offset, offset + pageSize - 1);
      if (!error && data) result = { rows: data, totalRecords: count, totalPages: Math.ceil(count / pageSize) };
    }
    else if (type === 'events') {
      let q = supabase.from('security_events').select('*', { count: 'exact' });
      q = applySearch(q, ['event_type', 'description', 'related_login_id', 'related_ip']);
      const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      if (!error && data) result = { rows: data, totalRecords: count, totalPages: Math.ceil(count / pageSize) };
    }
    else {
      return NextResponse.json({ ok: false, message: "Invalid type" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, data: result });
    
    // Strict No-Cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    logger.security.error("Security Data API Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
