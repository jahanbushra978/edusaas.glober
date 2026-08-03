import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(`public-contact:${ip}`, { windowMs: 60000, max: 10 })) {
      return NextResponse.json(
        { ok: false, message: "অতিরিক্ত বার্তা পাঠানো হয়েছে। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, phone, email, institution, message } = body;

    if (!name || (!phone && !email) || !message) {
      return NextResponse.json(
        { ok: false, message: "দয়া করে নাম, মোবাইল/ইমেইল এবং আপনার বার্তা লিখে পাঠাল।" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const payload = {
      name: String(name).trim(),
      email: email ? String(email).trim() : (phone ? `${String(phone).trim()}@phone.contact` : "unknown@contact.message"),
      message: `${institution ? `[প্রতিষ্ঠান: ${institution}] ` : ""}${String(message).trim()}${phone ? ` (ফোন: ${phone})` : ""}`,
      created_date: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[POST /api/contact] Error inserting contact_messages:", error);
      return NextResponse.json(
        { ok: false, message: "বার্তা জমা হতে সমস্যা হয়েছে: " + (error.message || "Unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "আপনার মেসেজটি সফলভাবে আমাদের এডমিন প্যানেলে পাঠানো হয়েছে! আমরা খুব শীঘ্রই যোগাযোগ করব।",
      data,
    });
  } catch (err) {
    console.error("[POST /api/contact] Server error:", err);
    return NextResponse.json(
      { ok: false, message: "সার্ভার সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
