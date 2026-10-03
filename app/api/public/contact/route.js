import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { checkRateLimit } from "../../../../src/lib/rate-limit";
import { getClientIp } from "../../../../src/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  // Rate limit: max 5 contact messages per IP per 10 minutes
  const ip = getClientIp(request);
  if (!checkRateLimit(`contact:${ip}`, { windowMs: 10 * 60 * 1000, max: 5 })) {
    return NextResponse.json(
      { ok: false, message: "অনেক বেশি অনুরোধ। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body || {};

    if (!name || !message) {
      return NextResponse.json({ ok: false, message: "নাম এবং বার্তা প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const payload = {
      name: String(name).trim(),
      email: email ? String(email).trim() : "",
      subject: subject ? String(subject).trim() : "",
      message: String(message).trim(),
      is_read: false,
      created_date: new Date().toISOString(),
    };

    const { data, error } = await adminClient.from("contact_messages").insert(payload).select().single();

    if (error) {
      console.error("[Contact API] Supabase Insert Error:", error);
      return NextResponse.json({ ok: false, message: error.message || "মেসেজ পাঠাতে সমস্যা হয়েছে।" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[Contact API] Server Error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}
