import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";
import { createSupabaseAdminClient } from "../../../../../src/lib/supabase-admin";
import { getClientIp, getClientMetadata, verifyCsrfOrigin } from "../../../../../src/lib/security";
import { logger } from "../../../../../src/lib/logger";
import { checkRateLimit } from "../../../../../src/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    // Only Super Admin can access this
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, message: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }
    if (!checkRateLimit(`admin-security-settings:${getClientIp(request)}`, { windowMs: 60000, max: 20 })) {
      return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
    }

    const body = await request.json();
    const { password, settings } = body;

    if (!password || !settings || !Array.isArray(settings)) {
      return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Verify Password against the existing Authentication System
    let adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
    if (adminPassword) adminPassword = adminPassword.trim();
    if (!adminPassword) {
      const { data: dbSetting } = await supabaseAdmin
        .from("app_settings")
        .select("value")
        .eq("key", "admin_login_password")
        .maybeSingle();
      if (dbSetting?.value) {
        adminPassword = dbSetting.value;
      }
    }

    let isValid = false;
    if (adminPassword) {
      if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
        isValid = await bcrypt.compare(password, adminPassword);
      } else {
        isValid = password === adminPassword;
      }
    }

    if (!isValid) {
      // Log failed attempt
      const ip = getClientIp(request);
      const meta = getClientMetadata(request);
      await supabaseAdmin.from("security_events").insert({
        event_type: "UNAUTHORIZED_SETTINGS_ACCESS",
        severity: "CRITICAL",
        description: "Failed password verification during security settings modification.",
        related_login_id: session.loginId || "admin",
        related_ip: ip,
        metadata: { ...meta }
      });

      return NextResponse.json({ ok: false, message: "Incorrect Master Password." }, { status: 401 });
    }

    // 2. Update Settings
    const changedKeys = [];
    for (const item of settings) {
      if (item.key && item.value !== undefined) {
        await supabaseAdmin
          .from("security_settings")
          .update({ value: item.value })
          .eq("key", item.key);
        changedKeys.push(item.key);
      }
    }

    // 3. Create Audit Log
    const ip = getClientIp(request);
    const meta = getClientMetadata(request);
    await supabaseAdmin.from("security_events").insert({
      event_type: "SETTINGS_CHANGED",
      severity: "HIGH",
      description: "Super Admin modified enterprise security settings.",
      related_login_id: session.loginId || "admin",
      related_ip: ip,
      metadata: {
        admin_id: session.id || session.userId,
        admin_role: session.role,
        changed_keys: changedKeys,
        updated_settings: settings,
        browser: meta.browser,
        os: meta.os,
        user_agent: meta.userAgent
      }
    });

    return NextResponse.json({ ok: true, message: "Security settings updated successfully." });

  } catch (error) {
    logger.security.error("Failed to update security settings", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}
