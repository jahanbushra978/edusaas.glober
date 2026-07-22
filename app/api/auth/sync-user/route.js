import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { syncManagedPortalUser } from "../../../../src/lib/managed-auth-server";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";

async function requireAuthorizedSession(body) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.role === "admin") {
    return session;
  }

  if (session.role !== "branch_admin" && session.role !== "boarding_manager") {
    throw new Error("Unauthorized");
  }

  // Validate module permissions
  const allowed = session.allowed_features;
  const hasModulePermission = (module) => {
    if (!Array.isArray(allowed)) {
      return true; // backwards compatibility fallback
    }
    return allowed.includes(module) || allowed.some(p => p.startsWith(`${module}:`));
  };

  if (body.role === "student" && !hasModulePermission("students")) {
    throw new Error("Unauthorized: Student management permission is required.");
  }

  if (body.role === "teacher" && !hasModulePermission("teachers")) {
    throw new Error("Unauthorized: Teacher management permission is required.");
  }

  if (body.profileId) {
    const tableName = body.role === "student" ? "students" : "teachers";
    const supabaseAdmin = createSupabaseAdminClient();
    const { data } = await supabaseAdmin
      .from(tableName)
      .select("branch_id")
      .eq("id", body.profileId)
      .single();
    if (data && String(data.branch_id) !== String(session.branch_id)) {
      throw new Error("Unauthorized");
    }
  }

  return session;
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }
    if (!checkRateLimit(`auth-sync-user:${getClientIp(request)}`, { windowMs: 60000, max: 30 })) {
      return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
    }

    const body = await request.json();
    const session = await requireAuthorizedSession(body);

    const resolvedMetadata = { ...(body.metadata || {}) };
    if (session.role !== "admin") {
      resolvedMetadata.branchId = session.branch_id;
    }

    const user = await syncManagedPortalUser({
      role: body.role,
      action: body.action,
      currentLoginId: body.currentLoginId,
      nextLoginId: body.nextLoginId,
      password: body.password,
      profileId: body.profileId,
      metadata: resolvedMetadata,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Unauthorized";

    return NextResponse.json(
      { ok: false, message: unauthorized ? "Unauthorized" : "An internal error occurred" },
      { status: unauthorized ? 401 : 400 },
    );
  }
}
