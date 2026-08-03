import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken, generateSupabaseJwt } from "../../../../src/lib/auth-session";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, authenticated: false, user: null },
        { status: 200 },
      );
    }

    let allowedFeatures = session.allowed_features || null;
    const branchId = session.branch_id || null;
    let organizationId = session.organization_id || null;

    if (session.role === "branch_admin" || session.role === "boarding_manager") {
      if (branchId) {
        const adminClient = createSupabaseAdminClient();
        const { data: branch, error } = await adminClient
          .from("branches")
          .select("is_active, allowed_features, boarding_enabled, organization_id")
          .eq("id", branchId)
          .maybeSingle();

        if (error || !branch || !branch.is_active) {
          return NextResponse.json(
            { ok: false, authenticated: false, user: null },
            { status: 200 },
          );
        }

        if (session.role === "boarding_manager" && !branch.boarding_enabled) {
          return NextResponse.json(
            { ok: false, authenticated: false, user: null },
            { status: 200 },
          );
        }

        if (session.role === "boarding_manager") {
          allowedFeatures = ["boarding"];
        } else {
          allowedFeatures = branch.allowed_features || null;
        }
        if (branch.organization_id) {
          organizationId = branch.organization_id;
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
      organization_id: organizationId,
      allowed_features: allowedFeatures,
    };

    const supabaseToken = await generateSupabaseJwt(userObj);

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: userObj,
      supabaseToken,
    });
  } catch {
    return NextResponse.json(
      { ok: false, authenticated: false, user: null },
      { status: 200 },
    );
  }
}
