import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teacher-marketplace/social/comments/reactions
 * Fetch users who reacted to a comment
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("comment_id");

    if (!commentId) {
      return NextResponse.json({ ok: false, error: "comment_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: reactions, error } = await adminClient
      .from("teacher_social_comment_reactions")
      .select("id, comment_id, user_id, user_name, user_role, reaction_type, created_at")
      .eq("comment_id", commentId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      reactions: reactions || [],
      count: (reactions || []).length,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/social/comments/reactions
 * Toggle like/reaction on a comment
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "মন্তব্যে লাইক দিতে অনুগ্রহ করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const currentUserName = session.name || session.full_name_bn || session.full_name_en || "ব্যবহারকারী";
    const currentUserRole = session.role || "student";

    const body = await req.json().catch(() => ({}));
    const { comment_id, reaction_type = "like" } = body;

    if (!comment_id) {
      return NextResponse.json({ ok: false, error: "comment_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // Verify comment exists
    const { data: comment, error: commentError } = await adminClient
      .from("teacher_social_comments")
      .select("id, likes_count")
      .eq("id", comment_id)
      .maybeSingle();

    if (commentError || !comment) {
      return NextResponse.json({ ok: false, error: "মন্তব্যটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Check existing reaction
    const { data: existingReaction } = await adminClient
      .from("teacher_social_comment_reactions")
      .select("id")
      .eq("comment_id", comment_id)
      .eq("user_id", currentUserId)
      .maybeSingle();

    let isLiked = false;
    let newLikesCount = Number(comment.likes_count) || 0;

    if (existingReaction) {
      // Toggle off (remove reaction)
      await adminClient
        .from("teacher_social_comment_reactions")
        .delete()
        .eq("id", existingReaction.id);

      newLikesCount = Math.max(0, newLikesCount - 1);
      isLiked = false;
    } else {
      // Toggle on (insert reaction)
      await adminClient
        .from("teacher_social_comment_reactions")
        .insert({
          comment_id,
          user_id: currentUserId,
          user_name: currentUserName,
          user_role: currentUserRole,
          reaction_type: String(reaction_type).trim().slice(0, 20),
        });

      newLikesCount = newLikesCount + 1;
      isLiked = true;
    }

    // Update parent comment likes count
    await adminClient
      .from("teacher_social_comments")
      .update({ likes_count: newLikesCount })
      .eq("id", comment_id);

    return NextResponse.json({
      ok: true,
      comment_id,
      is_liked: isLiked,
      likes_count: newLikesCount,
      message: isLiked ? "মন্তব্যে লাইক দেওয়া হয়েছে।" : "লাইক প্রত্যাহার করা হয়েছে।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

