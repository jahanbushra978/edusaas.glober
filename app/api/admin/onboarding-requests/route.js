import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("branches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, data: data || [] });
  } catch (err) {
    console.error("[GET /api/admin/onboarding-requests] Error:", err);
    return NextResponse.json({ ok: false, data: [] }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, action, customData } = body;

    if (!id) {
      return NextResponse.json({ ok: false, message: "আইডি প্রয়োজন।" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (action === "approve") {
      const { data, error } = await supabaseAdmin
        .from("branches")
        .update({
          approval_status: "approved",
          is_active: true,
          updated_at: new Date().toISOString(),
          ...(customData || {}),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, message: "ওয়েবসাইট সফলভাবে এপ্রুভ ও লাইভ করা হয়েছে!", data });
    }

    if (action === "update") {
      const { data, error } = await supabaseAdmin
        .from("branches")
        .update({
          ...customData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, message: "তথ্য সফলভাবে আপডেট ও কাস্টমাইজ করা হয়েছে!", data });
    }

    return NextResponse.json({ ok: false, message: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("[PUT /api/admin/onboarding-requests] Error:", err);
    return NextResponse.json({ ok: false, message: err.message || "Failed to update record." }, { status: 500 });
  }
}
