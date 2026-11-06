import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teacher-marketplace/social/posts/[id]
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "পোস্ট আইডি প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: post, error } = await adminClient
      .from("teacher_social_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !post) {
      return NextResponse.json({ ok: false, error: "পোস্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    const currentUserId = session?.authUserId || session?.profileId || session?.id || null;
    const isPlatformAdmin = session?.role === "admin" || session?.role === "platform_owner";

    // Visibility Check
    if (post.visibility === "private" && !isPlatformAdmin && post.author_user_id !== currentUserId) {
      return NextResponse.json({ ok: false, error: "এই পোস্টটি ব্যক্তিগত।" }, { status: 403 });
    }

    if (post.visibility === "followers" && !isPlatformAdmin && post.author_user_id !== currentUserId) {
      if (!currentUserId) {
        return NextResponse.json(
          { ok: false, error: "এই পোস্টটি শুধুমাত্র উস্তাদের অনুসারীদের (Followers) জন্য উন্মুক্ত।" },
          { status: 403 }
        );
      }
      const { data: followRecord } = await adminClient
        .from("teacher_social_follows")
        .select("id")
        .eq("follower_user_id", currentUserId)
        .eq("following_teacher_id", post.teacher_id)
        .maybeSingle();

      if (!followRecord) {
        return NextResponse.json(
          { ok: false, error: "এই পোস্টটি দেখতে উস্তাদকে অনুসরণ (Follow) করা আবশ্যক।" },
          { status: 403 }
        );
      }
    }

    let currentUserReaction = null;
    let isSaved = false;

    if (currentUserId) {
      const [reactionRow, savedRow] = await Promise.all([
        adminClient
          .from("teacher_social_reactions")
          .select("reaction_type")
          .eq("post_id", id)
          .eq("user_id", currentUserId)
          .maybeSingle(),
        adminClient
          .from("teacher_social_saved_posts")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", currentUserId)
          .maybeSingle(),
      ]);

      currentUserReaction = reactionRow.data?.reaction_type || null;
      isSaved = Boolean(savedRow.data?.id);
    }

    return NextResponse.json({
      ok: true,
      post: {
        ...post,
        current_user_reaction: currentUserReaction,
        is_saved_by_current_user: isSaved,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teacher-marketplace/social/posts/[id]
 * Edit own post text or visibility
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json({ ok: false, error: "অননুমোদিত অ্যাক্সেস।" }, { status: 401 });
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";

    const adminClient = createSupabaseAdminClient();
    const { data: post, error: fetchError } = await adminClient
      .from("teacher_social_posts")
      .select("id, author_user_id, teacher_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !post) {
      return NextResponse.json({ ok: false, error: "পোস্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Ownership check (Anti-IDOR)
    if (!isPlatformAdmin && post.author_user_id !== currentUserId) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা লঙ্ঘন: আপনি কেবল আপনার নিজের পোস্ট সম্পাদনা করতে পারবেন।" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updates = { updated_at: new Date().toISOString() };

    if (typeof body.content_text === "string") {
      updates.content_text = body.content_text.trim();
    }
    if (typeof body.visibility === "string" && ["public", "followers", "private"].includes(body.visibility)) {
      updates.visibility = body.visibility;
    }

    const { data: updatedPost, error: updateError } = await adminClient
      .from("teacher_social_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ ok: false, error: "পোস্ট সম্পাদনা ব্যর্থ।" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "পোস্ট সফলভাবে হালনাগাদ করা হয়েছে।",
      post: updatedPost,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/teacher-marketplace/social/posts/[id]
 * Delete own post
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json({ ok: false, error: "অননুমোদিত অ্যাক্সেস।" }, { status: 401 });
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";

    const adminClient = createSupabaseAdminClient();
    const { data: post, error: fetchError } = await adminClient
      .from("teacher_social_posts")
      .select("id, author_user_id, teacher_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !post) {
      return NextResponse.json({ ok: false, error: "পোস্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Ownership check (Anti-IDOR)
    if (!isPlatformAdmin && post.author_user_id !== currentUserId) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা লঙ্ঘন: আপনি কেবল আপনার নিজের পোস্ট মুছতে পারবেন।" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await adminClient
      .from("teacher_social_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ ok: false, error: "পোস্ট মুছতে ব্যর্থ হয়েছে।" }, { status: 500 });
    }

    // Decrement posts count
    const { data: teacherProfile } = await adminClient
      .from("teacher_marketplace_profiles")
      .select("posts_count")
      .eq("teacher_id", post.teacher_id)
      .maybeSingle();

    if (teacherProfile) {
      await adminClient
        .from("teacher_marketplace_profiles")
        .update({ posts_count: Math.max(0, (Number(teacherProfile.posts_count) || 1) - 1) })
        .eq("teacher_id", post.teacher_id)
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      message: "পোস্টটি সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

