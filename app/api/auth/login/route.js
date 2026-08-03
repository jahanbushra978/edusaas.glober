import { NextResponse } from "next/server";

import { createSessionToken, getSessionCookieConfig, generateSupabaseJwt } from "../../../../src/lib/auth-session";
import { authenticatePortalUser } from "../../../../src/lib/managed-auth-server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { 
  getOrCreateDeviceId, 
  getClientIp, 
  getClientMetadata, 
  DEVICE_FINGERPRINT_COOKIE,
  verifyTurnstileToken,
  verifyCsrfOrigin 
} from "../../../../src/lib/security";
import { apiError } from "../../../../src/lib/api-error";
import { logger } from "../../../../src/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60000;
let loginAttempts = null;
try { loginAttempts = new Map(); } catch { loginAttempts = null; }

function checkLoginRateLimit(ip, deviceId) {
  if (!loginAttempts) return true;
  const now = Date.now();
  const key = `${ip}:${deviceId}`;
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = (loginAttempts.get(key) || []).filter(t => t > windowStart);
  if (attempts.length >= 10) return false;
  attempts.push(now);
  loginAttempts.set(key, attempts);
  return true;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const role = body?.role;
    const password = String(body?.password || "");
    const loginId = body?.loginId || "";
    const turnstileToken = body?.turnstileToken;

    // CSRF check for production
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    // Security context
    const ipAddress = getClientIp(request);
    const { userAgent, browser, os, country } = getClientMetadata(request);
    const { deviceId, isNew } = getOrCreateDeviceId(request);

    // Rate limiting check (best-effort in serverless)
    if (!checkLoginRateLimit(ipAddress, deviceId)) {
      return NextResponse.json(
        { ok: false, message: "অনেক বেশি চেষ্টা। কিছুক্ষণ পরে আবার চেষ্টা করুন।", is_locked: true },
        { status: 429 },
      );
    }

    if (!role || !password) {
      return NextResponse.json(
        { ok: false, message: "Login তথ্য অসম্পূর্ণ।" },
        { status: 400 },
      );
    }

    const adminClient = createSupabaseAdminClient();

    // 1. Verify Turnstile (required in production, optional in dev)
    if (process.env.NODE_ENV === "production" || turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken, ipAddress);
      if (!isValid) {
        return NextResponse.json({ ok: false, message: "Security check failed. Please try again." }, { status: 403 });
      }
    }

    // 2. Check Security Block Status
    try {
      const { data: securityCheck, error: secError } = await adminClient.rpc("verify_login_security", {
        p_device_id: deviceId,
        p_login_id: loginId || (role === "admin" ? "admin" : "UNKNOWN"),
        p_ip_address: ipAddress
      });

      if (!secError && securityCheck && !securityCheck.ok) {
        return NextResponse.json(
          { 
            ok: false, 
            message: securityCheck.message || "Too many suspicious attempts. Access temporarily locked.",
            blocked_until: securityCheck.blocked_until,
            is_locked: true
          },
          { status: 429 }
        );
      }
    } catch (secErr) {
      logger.security.warn("Security check failed, bypassing", { error: secErr instanceof Error ? secErr.message : String(secErr) });
    }

    // Admin password fallback logic
    if (role === "admin") {
      let adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
      if (adminPassword) adminPassword = adminPassword.trim();
      if (!adminPassword) {
        try {
          const { data: dbSetting } = await adminClient
            .from("app_settings")
            .select("value")
            .eq("key", "admin_login_password")
            .maybeSingle();
          if (dbSetting?.value) {
            adminPassword = dbSetting.value;
          }
        } catch (e) {
          logger.security.warn("Failed to query DB for admin_login_password", { error: e instanceof Error ? e.message : String(e) });
        }
      }

      if (!adminPassword) {
        adminPassword = "admin123";
      }
    }

    // 3. Attempt Authentication
    let result;
    try {
      result = await authenticatePortalUser({ role, loginId, password });
    } catch (authError) {
      // 4. Log Failed Attempt
      try {
        await adminClient.rpc("record_login_attempt", {
          p_login_id: loginId || (role === "admin" ? "admin" : "UNKNOWN"),
          p_device_id: deviceId,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
          p_browser: browser,
          p_os: os,
          p_country: country,
          p_status: 'FAILED',
          p_failure_reason: authError instanceof Error ? authError.message : "Invalid credentials"
        });
      } catch (logErr) {
        logger.security.warn("Failed to log login attempt", { error: logErr instanceof Error ? logErr.message : String(logErr) });
      }

      throw authError; // re-throw to be caught by main catch block
    }

    // 5. Log Successful Attempt
    try {
      await adminClient.rpc("record_login_attempt", {
        p_login_id: loginId || (role === "admin" ? "admin" : "UNKNOWN"),
        p_device_id: deviceId,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_browser: browser,
        p_os: os,
        p_country: country,
        p_status: 'SUCCESS',
        p_failure_reason: null
      });
      
      // Also record active session
      await adminClient.from("active_sessions").insert({
        user_id: result.user.id,
        login_id: loginId || (role === "admin" ? "admin" : "UNKNOWN"),
        device_id: deviceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        country: country
      }).select("id").maybeSingle();
    } catch (logErr) {
      logger.security.warn("Failed to log success or session", { error: logErr instanceof Error ? logErr.message : String(logErr) });
    }

    let organizationId = result.profile?.organization_id || result.organization_id || null;

    if (!organizationId && result.profile?.branch_id) {
      try {
        const { data: branch } = await adminClient
          .from("branches")
          .select("organization_id")
          .eq("id", result.profile.branch_id)
          .maybeSingle();
        if (branch?.organization_id) {
          organizationId = branch.organization_id;
        }
      } catch (e) {
        console.warn("Could not resolve org from branch:", e);
      }
    }

    const sessionToken = await createSessionToken({
      authUserId: result.user.id,
      role: result.role,
      loginId: result.loginId,
      profileId: result.profile?.id || null,
      email: result.user.email || null,
      branch_id: result.profile?.branch_id || null,
      organization_id: organizationId,
      allowed_features: result.profile?.allowed_features || null,
    });

    if (!sessionToken) {
      return NextResponse.json(
        { ok: false, message: "সার্ভার কনফিগারেশন ত্রুটি: SUPABASE_JWT_SECRET সেট করা নেই।" },
        { status: 500 },
      );
    }

    const userObj = {
      id: result.user.id,
      role: result.role,
      loginId: result.loginId,
      profileId: result.profile?.id || null,
      email: result.user.email || null,
      branch_id: result.profile?.branch_id || null,
      organization_id: organizationId || null,
      allowed_features: result.profile?.allowed_features || null,
    };

    const supabaseToken = await generateSupabaseJwt(userObj);

    const response = NextResponse.json({
      ok: true,
      user: userObj,
      profile: result.profile,
      supabaseToken,
    });

    // 6. Issue Cookies (Session & Device ID)
    response.cookies.set({
      ...getSessionCookieConfig(),
      value: sessionToken,
    });

    // Issue Device Fingerprint Cookie (never expires, or very long lived)
    response.cookies.set({
      name: DEVICE_FINGERPRINT_COOKIE,
      value: deviceId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    });

    return response;
  } catch (error) {
    logger.security.warn("Login failed", { error: error instanceof Error ? error.message : String(error) });
    return apiError(error, { status: 401, context: "Login", logLevel: "warn" });
  }
}
