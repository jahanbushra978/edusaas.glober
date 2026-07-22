import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken, createSessionToken, generateSupabaseJwt, getSessionCookieConfig } from "../../../../src/lib/auth-session";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }
    if (!checkRateLimit(`auth-refresh:${getClientIp(request)}`, { windowMs: 60000, max: 120 })) {
      return NextResponse.json({ ok: false, authenticated: false, user: null }, { status: 429 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, authenticated: false, user: null },
        { status: 401 },
      );
    }

    const adminClient = createSupabaseAdminClient();
    let allowedFeatures = session.allowed_features || null;
    const branchId = session.branch_id || null;

    if (session.role === "branch_admin" || session.role === "boarding_manager") {
      if (branchId) {
        const { data: branch } = await adminClient
          .from("branches")
          .select("is_active, allowed_features, boarding_enabled")
          .eq("id", branchId)
          .maybeSingle();

        if (!branch || !branch.is_active) {
          return NextResponse.json(
            { ok: false, authenticated: false, user: null },
            { status: 401 },
          );
        }

        if (session.role === "boarding_manager" && !branch.boarding_enabled) {
          return NextResponse.json(
            { ok: false, authenticated: false, user: null },
            { status: 401 },
          );
        }

        if (session.role === "boarding_manager") {
          allowedFeatures = ["boarding"];
        } else {
          allowedFeatures = branch.allowed_features || null;
        }
      }
    }

    const userObj = {
      id: session.authUserId,
      role: session.role,
      loginId: session.loginId,
      profileId: session.profileId,
      email: session.email,
      branch_id: branchId,
      allowed_features: allowedFeatures,
    };

    const newToken = await createSessionToken(userObj, 60 * 60 * 2);
    const supabaseToken = await generateSupabaseJwt(userObj);

    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      user: userObj,
      supabaseToken,
    });

    response.cookies.set({
      ...getSessionCookieConfig(),
      value: newToken,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, authenticated: false, user: null },
      { status: 401 },
    );
  }
}
