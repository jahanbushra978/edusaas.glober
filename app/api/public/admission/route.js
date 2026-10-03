import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { checkRateLimit } from "../../../../src/lib/rate-limit";
import { getClientIp } from "../../../../src/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  // Rate limit: max 3 admission applications per IP per 10 minutes
  const ip = getClientIp(request);
  if (!checkRateLimit(`admission:${ip}`, { windowMs: 10 * 60 * 1000, max: 3 })) {
    return NextResponse.json(
      { ok: false, message: "অনেক বেশি আবেদন। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    if (!body || !body.full_name_en) {
      return NextResponse.json({ ok: false, message: "শিক্ষার্থীর নাম প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const payload = {
      full_name_bn: body.full_name_bn ? String(body.full_name_bn).trim() : "",
      full_name_en: String(body.full_name_en).trim(),
      full_name_ar: body.full_name_ar ? String(body.full_name_ar).trim() : "",
      date_of_birth: body.date_of_birth || null,
      father_name: body.father_name ? String(body.father_name).trim() : "",
      mother_name: body.mother_name ? String(body.mother_name).trim() : "",
      mobile_number: body.mobile_number ? String(body.mobile_number).trim() : "",
      address: body.address ? String(body.address).trim() : "",
      desired_session: body.desired_session ? String(body.desired_session).trim() : "",
      previous_education: body.previous_education ? String(body.previous_education).trim() : "",
      photo_url: body.photo_url || "",
      branch_id: body.branch_id ? Number(body.branch_id) : null,
      status: "pending",
      created_date: now,
      updated_date: now,
    };

    const { data, error } = await adminClient.from("admission_applications").insert(payload).select().single();

    if (error) {
      console.error("[Admission API] Supabase Insert Error:", error);
      return NextResponse.json({ ok: false, message: error.message || "আবেদন প্রক্রিয়াকরণে সমস্যা হয়েছে।" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[Admission API] Server Error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
