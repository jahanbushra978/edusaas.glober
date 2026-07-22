import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { authenticatePortalUser, syncManagedPortalUser } from "../../../../src/lib/managed-auth-server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";
import { logger } from "../../../../src/lib/logger";
import { apiError } from "../../../../src/lib/api-error";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }
    if (!checkRateLimit(`change-password:${getClientIp(request)}`, { windowMs: 60000, max: 10 })) {
      return NextResponse.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ ok: false, message: "Invalid session" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ ok: false, message: "Current password and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ ok: false, message: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (newPassword.length > 128) {
      return NextResponse.json({ ok: false, message: "New password is too long." }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    try {
      await authenticatePortalUser({
        role: session.role,
        loginId: session.loginId,
        password: currentPassword
      });
    } catch {
      logger.security.warn("Incorrect current password for password change", { loginId: session.loginId, role: session.role });
      return NextResponse.json({ ok: false, message: "Incorrect current password." }, { status: 403 });
    }

    if (session.role === "admin") {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const { data: dbSetting } = await adminClient.from("app_settings").select("id").eq("key", "admin_login_password").maybeSingle();
      if (dbSetting) {
        await adminClient.from("app_settings").update({ value: hashedPassword }).eq("id", dbSetting.id);
      } else {
        await adminClient.from("app_settings").insert({ key: "admin_login_password", value: hashedPassword });
      }

      await syncManagedPortalUser({
        role: "admin",
        action: "upsert",
        currentLoginId: "MAIN",
        password: newPassword,
      });

    } else if (session.role === "branch_admin") {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await adminClient.from("branches").update({ admin_password: hashedPassword }).eq("id", session.profileId);
      await syncManagedPortalUser({
        role: "branch_admin",
        action: "upsert",
        currentLoginId: session.loginId,
        password: newPassword,
      });

    } else if (session.role === "boarding_manager") {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await adminClient.from("branches").update({ boarding_manager_password: hashedPassword }).eq("id", session.profileId);
      await syncManagedPortalUser({
        role: "boarding_manager",
        action: "upsert",
        currentLoginId: session.loginId,
        password: newPassword,
      });

    } else {
      return NextResponse.json({ ok: false, message: "Password change not supported for this role." }, { status: 400 });
    }

    try {
      await adminClient.from("security_events").insert({
        event_type: "Password Changed",
        severity: "MEDIUM",
        description: `Password changed for ${session.role} (${session.loginId})`,
        user_id: session.loginId,
        is_resolved: true
      });
    } catch {}

    logger.security.info("Password changed successfully", { loginId: session.loginId, role: session.role });
    return NextResponse.json({ ok: true, message: "Password updated successfully." });
  } catch (error) {
    logger.security.error("Change Password failed", { error: error instanceof Error ? error.message : String(error) });
    return apiError(error, { status: 500, context: "ChangePassword" });
  }
}
