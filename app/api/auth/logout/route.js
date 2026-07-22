import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { getSessionCookieConfig, verifySessionToken } from "../../../../src/lib/auth-session";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`auth-logout:${getClientIp(request)}`, { windowMs: 60000, max: 30 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const response = NextResponse.json({ ok: true });

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (session) {
      const supabase = createSupabaseAdminClient();
      await supabase
        .from("active_sessions")
        .update({ is_revoked: true, revoked_reason: "user_logout", last_activity: new Date().toISOString() })
        .eq("login_id", session.loginId)
        .is("is_revoked", false);
      if (session.authUserId) {
        try {
          await supabase.auth.admin.signOut(session.authUserId);
        } catch {
          try {
            await supabase.auth.admin.signOut(session.authUserId);
          } catch {}
        }
      }
    }
  } catch {}

  response.cookies.set({
    ...getSessionCookieConfig(),
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
  });

  return response;
}
