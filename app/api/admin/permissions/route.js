import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";
import { getDefaultPermissions } from "../../../../src/lib/permissions-definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  return session;
}

function verifySuperAdmin(session) {
  return session && session.role === "admin";
}

export async function GET(request) {
  const session = await requireAuth();
  if (!verifySuperAdmin(session)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, private" } });
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branch_id");

  if (!branchId) {
    return NextResponse.json({ ok: false, message: "branch_id required" }, { status: 400, headers: { "Cache-Control": "no-store, private" } });
  }

  const supabase = createSupabaseAdminClient();

  const { data: branch, error } = await supabase
    .from("branches")
    .select("allowed_features, admin_username")
    .eq("id", Number(branchId))
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: "Failed to fetch branch permissions" }, { status: 500, headers: { "Cache-Control": "no-store, private" } });
  }

  const defaultPerms = getDefaultPermissions();
  const currentPerms = branch?.allowed_features
    ? arrayToPermissions(branch.allowed_features)
    : defaultPerms;

  return NextResponse.json({
    ok: true,
    data: {
      permissions: currentPerms,
      allowed_features: branch?.allowed_features || [],
      admin_username: branch?.admin_username || "",
    },
  }, { headers: { "Cache-Control": "no-store, private" } });
}

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-permissions:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const session = await requireAuth();
  if (!verifySuperAdmin(session)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch_id, permissions } = body;

    if (!branch_id || !permissions) {
      return NextResponse.json({ ok: false, message: "branch_id and permissions required" }, { status: 400 });
    }

    const allowed_features = [];
    for (const [mod, actions] of Object.entries(permissions)) {
      let allTrue = true;
      let anyTrue = false;
      for (const [act, val] of Object.entries(actions)) {
        if (val) {
          allowed_features.push(`${mod}:${act}`);
          anyTrue = true;
        } else {
          allTrue = false;
        }
      }
      if (anyTrue && allTrue) {
        allowed_features.push(mod);
      }
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("branches")
      .update({ allowed_features })
      .eq("id", Number(branch_id));

    if (error) {
      return NextResponse.json({ ok: false, message: "Failed to update branch permissions" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: { allowed_features } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "An internal error occurred" }, { status: 500 });
  }
}

function arrayToPermissions(arr) {
  const perms = getDefaultPermissions();
  if (!Array.isArray(arr)) return perms;
  for (const entry of arr) {
    if (entry.includes(":")) {
      const [mod, act] = entry.split(":", 2);
      if (perms[mod] && act in perms[mod]) {
        perms[mod][act] = true;
      }
    } else if (perms[entry]) {
      for (const k of Object.keys(perms[entry])) {
        perms[entry][k] = true;
      }
    }
  }
  return perms;
}
