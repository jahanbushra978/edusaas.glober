import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../../src/lib/auth-identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || !["admin", "branch_admin", "boarding_manager"].includes(session.role)) return null;
  return session;
}

export async function GET() {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const systemPeriodKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "current_accounting_period")
    .maybeSingle();

  let storedPeriod = setting?.value || systemPeriodKey;

  // Auto sync: If stored period was pushed ahead of current real calendar month (e.g. 2026-09 > 2026-07), sync back to real month
  if (storedPeriod > systemPeriodKey) {
    storedPeriod = systemPeriodKey;
    await supabaseAdmin
      .from("app_settings")
      .update({ value: systemPeriodKey })
      .eq("key", "current_accounting_period");
  }

  const needsNewPeriod = systemPeriodKey > storedPeriod;

  const { data: autoSetting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "auto_archive_enabled")
    .maybeSingle();

  const autoArchive = autoSetting?.value === "true";

  return NextResponse.json({
    ok: true,
    needsNewPeriod,
    currentPeriod: storedPeriod,
    systemPeriod: systemPeriodKey,
    autoArchive,
    role: session.role,
  });
}
