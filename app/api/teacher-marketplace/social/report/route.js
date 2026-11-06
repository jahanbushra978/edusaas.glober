import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/teacher-marketplace/social/report
 * Submit a moderation report
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "রিপোর্ট করতে অনুগ্রহ করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const body = await req.json().catch(() => ({}));
    const { target_type, target_id, reason, details } = body;

    if (!target_type || !target_id || !reason) {
      return NextResponse.json(
        { ok: false, error: "target_type, target_id এবং কারণ (reason) উল্লেখ করুন।" },
        { status: 400 }
      );
    }

    if (!["post", "comment", "teacher_profile"].includes(target_type)) {
      return NextResponse.json(
        { ok: false, error: "অস্বীকৃত রিপোর্ট লক্ষ্যভেদ।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.from("teacher_social_reports").insert({
      reporter_user_id: currentUserId,
      target_type,
      target_id,
      reason: String(reason).trim(),
      details: details ? String(details).trim() : null,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ ok: false, error: "রিপোর্ট জমাদানে ব্যর্থ হয়েছে।" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "আপনার রিপোর্টটি একাডেমি মডারেশন টিমের পর্যালোচনার জন্য জমা নেওয়া হয়েছে। জাযাকাল্লাহু খাইরান।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

