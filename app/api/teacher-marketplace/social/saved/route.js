import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/teacher-marketplace/social/saved
 * Toggle save / bookmark post
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "পোস্ট সংরক্ষণ করতে অনুগ্রহ করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const body = await req.json().catch(() => ({}));
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json({ ok: false, error: "post_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // Check existing saved post
    const { data: existingSaved } = await adminClient
      .from("teacher_social_saved_posts")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("post_id", post_id)
      .maybeSingle();

    let isSaved = false;
    if (existingSaved) {
      // Remove from saved
      await adminClient.from("teacher_social_saved_posts").delete().eq("id", existingSaved.id);
      isSaved = false;
    } else {
      // Save
      await adminClient.from("teacher_social_saved_posts").insert({
        user_id: currentUserId,
        post_id,
      });
      isSaved = true;
    }

    return NextResponse.json({
      ok: true,
      is_saved: isSaved,
      post_id,
      message: isSaved ? "পোস্টটি আপনার সংরক্ষিত তালিকায় যুক্ত হয়েছে।" : "পোস্টটি সংরক্ষিত তালিকা থেকে সরানো হয়েছে।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

