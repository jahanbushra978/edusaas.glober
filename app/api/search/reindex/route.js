import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
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
    if (!checkRateLimit(`search-reindex:${getClientIp(request)}`, { windowMs: 60000, max: 10 })) {
      return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
    }

    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validate super-admin role
    if (session.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Forbidden: Super-admin role required." },
        { status: 403 }
      );
    }

    // 3. Connect to database and trigger RPC
    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin.rpc("reindex_all_search_items");

    if (error) {
      console.error("[Reindex API Error]", error);
      throw error;
    }

    return NextResponse.json({
      ok: true,
      message: "Search index re-indexing completed successfully."
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, message: `Re-indexing failed: ${msg}` },
      { status: 500 }
    );
  }
}
