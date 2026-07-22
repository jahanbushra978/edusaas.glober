import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, createSocSessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";
import { authenticatePortalUser } from "../../../../../src/lib/managed-auth-server";
import { logger } from "../../../../../src/lib/logger";
import { verifyCsrfOrigin, getClientIp } from "../../../../../src/lib/security";
import { checkRateLimit } from "../../../../../src/lib/rate-limit";

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`security-verify:${ip}`, { windowMs: 60000, max: 10 })) {
      return NextResponse.json({ ok: false, message: "Too many attempts. Please try again shortly." }, { status: 429 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session || !['admin', 'branch_admin', 'boarding_manager'].includes(session.role)) {
      return NextResponse.json({ ok: false, message: "Invalid session or insufficient permissions" }, { status: 403 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ ok: false, message: "Password is required" }, { status: 400 });
    }

    // Verify Password using existing authenticatePortalUser flow
    try {
      await authenticatePortalUser({
        role: session.role,
        loginId: session.loginId,
        password: password,
      });
    } catch (authErr) {
      return NextResponse.json({ ok: false, message: "Incorrect password" }, { status: 401 });
    }

    const socToken = await createSocSessionToken({ role: session.role, branch_id: session.branch_id });
    if (!socToken) throw new Error("Failed to sign SOC session");

    const response = NextResponse.json({ ok: true, message: "SOC Verified" });

    // Enforce No-Cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Set the HttpOnly Cookie scoped to /api/admin/security
    response.cookies.set('soc_session', socToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 600, // 10 minutes
      path: "/api/admin/security",
    });

    return response;

  } catch (error) {
    logger.security.error("SOC Verify Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
