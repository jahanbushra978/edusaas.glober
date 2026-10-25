import { NextResponse } from "next/server";
import { verifyPlatformSession } from "@/lib/platform-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await verifyPlatformSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: logs, error } = await admin
      .from("platform_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ ok: true, data: logs || [] });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err?.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
