import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/daily-bonus
 * Secure endpoint to claim 20-point daily login bonus.
 * Validates authenticated session token server-side.
 * Strictly enforces 24-hour interval between claims.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.authUserId) {
      return NextResponse.json(
        { ok: false, message: "অননুমোদিত: লগইন সেশন আবশ্যক।" },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const { data: bonusResult, error } = await adminClient.rpc(
      "claim_daily_login_bonus",
      { p_target_user_id: session.authUserId }
    );

    if (error) {
      // If table/rpc is not yet applied to Supabase, handle gracefully
      return NextResponse.json(
        { ok: false, error: error.message, message: "বোনাস প্রক্রিয়াকরণে ত্রুটি।" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      bonus: bonusResult,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "অভ্যন্তরীণ ত্রুটি।" },
      { status: 500 }
    );
  }
}
