import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { safeCompare } from "../../../../src/lib/safe-compare";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    // Fail-closed verification: CRON_SECRET is strictly required
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { ok: false, message: "CRON_SECRET is not configured on the server." },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const expectedHeader = `Bearer ${cronSecret}`;
    if (!safeCompare(authHeader, expectedHeader)) {
      return NextResponse.json({ ok: false, message: "Unauthorized cron execution" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Clean up login_attempts older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { count: loginDeletions, error: loginErr } = await supabase
      .from('login_attempts')
      .delete({ count: 'exact' })
      .lt('created_at', ninetyDaysAgo);

    if (loginErr) throw loginErr;

    // Optional: Clean up expired blocked devices (if not marked permanent)
    const { count: blockDeletions, error: blockErr } = await supabase
      .from('blocked_devices')
      .delete({ count: 'exact' })
      .eq('is_permanent', false)
      .lt('blocked_until', new Date().toISOString());

    if (blockErr) throw blockErr;

    return NextResponse.json({ 
      ok: true, 
      message: "Cleanup successful",
      deletedLoginAttempts: loginDeletions,
      deletedExpiredBlocks: blockDeletions
    });

  } catch (error) {
    console.error("[Cron Security Cleanup Error]", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
