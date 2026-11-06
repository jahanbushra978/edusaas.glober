import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teacher-marketplace/social/comments
 * Fetch threaded comments for a post
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    const parentCommentId = searchParams.get("parent_comment_id"); // null for top-level
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 30), 100);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    if (!postId) {
      return NextResponse.json({ ok: false, error: "post_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    let query = adminClient
      .from("teacher_social_comments")
      .select("id, post_id, parent_comment_id, user_id, user_role, user_name, user_avatar, comment_text, likes_count, status, created_at, updated_at")
      .eq("post_id", postId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (parentCommentId) {
      query = query.eq("parent_comment_id", parentCommentId);
    } else {
      query = query.is("parent_comment_id", null);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    const currentUserId = session?.authUserId || session?.profileId || session?.id || null;

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Fetch reply counts for each top-level comment
    const commentList = comments || [];
    let allCommentIds = commentList.map((c) => c.id);
    let replyMap = new Map();

    if (!parentCommentId && commentList.length > 0) {
      const parentIds = commentList.map((c) => c.id);
      const { data: replies } = await adminClient
        .from("teacher_social_comments")
        .select("id, parent_comment_id, user_id, user_role, user_name, user_avatar, comment_text, likes_count, created_at")
        .in("parent_comment_id", parentIds)
        .eq("status", "active")
        .order("created_at", { ascending: true });

      for (const r of replies || []) {
        if (!replyMap.has(r.parent_comment_id)) {
          replyMap.set(r.parent_comment_id, []);
        }
        replyMap.get(r.parent_comment_id).push(r);
        allCommentIds.push(r.id);
      }
    }

    // Check user's comment reactions if authenticated
    let userLikedCommentIds = new Set();
    if (currentUserId && allCommentIds.length > 0) {
      const { data: likedRows } = await adminClient
        .from("teacher_social_comment_reactions")
        .select("comment_id")
        .eq("user_id", currentUserId)
        .in("comment_id", allCommentIds);

      userLikedCommentIds = new Set((likedRows || []).map((r) => r.comment_id));
    }

    const threadedComments = commentList.map((c) => ({
      ...c,
      is_liked_by_current_user: userLikedCommentIds.has(c.id),
      replies: (replyMap.get(c.id) || []).map((r) => ({
        ...r,
        is_liked_by_current_user: userLikedCommentIds.has(r.id),
      })),
      replies_count: (replyMap.get(c.id) || []).length,
    }));

    return NextResponse.json({
      ok: true,
      comments: threadedComments,
      hasMore: commentList.length === limit,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/social/comments
 * Create a new comment or reply
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "মন্তব্য করতে অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const currentUserName = session.name || session.full_name_bn || session.full_name_en || "ব্যবহারকারী";
    const currentUserAvatar = session.avatar_url || null;
    const currentUserRole = session.role || "student";

    const body = await req.json().catch(() => ({}));
    const { post_id, parent_comment_id = null, comment_text = "" } = body;

    const trimmedText = String(comment_text || "").trim();
    if (!post_id || !trimmedText) {
      return NextResponse.json(
        { ok: false, error: "মন্তব্য টেক্সট এবং post_id প্রদান করা আবশ্যক।" },
        { status: 400 }
      );
    }

    if (trimmedText.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "মন্তব্য সর্বোচ্চ ২,০০০ অক্ষরের মধ্যে হতে হবে।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // Verify post exists
    const { data: post } = await adminClient
      .from("teacher_social_posts")
      .select("id, comments_count")
      .eq("id", post_id)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ ok: false, error: "পোস্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Insert comment
    const { data: newComment, error: insertError } = await adminClient
      .from("teacher_social_comments")
      .insert({
        post_id,
        parent_comment_id: parent_comment_id || null,
        user_id: currentUserId,
        user_role: currentUserRole,
        user_name: currentUserName,
        user_avatar: currentUserAvatar,
        comment_text: trimmedText,
        likes_count: 0,
        status: "active",
      })
      .select()
      .maybeSingle();

    if (insertError) {
      return NextResponse.json({ ok: false, error: "মন্তব্য প্রকাশে ব্যর্থ হয়েছে।" }, { status: 500 });
    }

    // Increment comments_count on post
    await adminClient
      .from("teacher_social_posts")
      .update({ comments_count: (Number(post.comments_count) || 0) + 1 })
      .eq("id", post_id)
      .catch(() => {});

    return NextResponse.json({
      ok: true,
      message: "মন্তব্য সফলভাবে যুক্ত হয়েছে।",
      comment: newComment,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/teacher-marketplace/social/comments
 * Edit own comment
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json({ ok: false, error: "অননুমোদিত অ্যাক্সেস।" }, { status: 401 });
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";

    const body = await req.json().catch(() => ({}));
    const { comment_id, comment_text } = body;

    const trimmedText = String(comment_text || "").trim();
    if (!comment_id || !trimmedText) {
      return NextResponse.json({ ok: false, error: "সঠিক comment_id এবং টেক্সট দিন।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: existingComment } = await adminClient
      .from("teacher_social_comments")
      .select("id, user_id")
      .eq("id", comment_id)
      .maybeSingle();

    if (!existingComment) {
      return NextResponse.json({ ok: false, error: "মন্তব্যটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Ownership check (Anti-IDOR)
    if (!isPlatformAdmin && existingComment.user_id !== currentUserId) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা লঙ্ঘন: আপনি কেবল আপনার নিজের মন্তব্য সম্পাদনা করতে পারেন।" },
        { status: 403 }
      );
    }

    const { data: updatedComment, error } = await adminClient
      .from("teacher_social_comments")
      .update({
        comment_text: trimmedText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", comment_id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: "সম্পাদনা ব্যর্থ।" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "মন্তব্য সফলভাবে হালনাগাদ করা হয়েছে।",
      comment: updatedComment,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/teacher-marketplace/social/comments
 * Delete own comment
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("comment_id");

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json({ ok: false, error: "অননুমোদিত অ্যাক্সেস।" }, { status: 401 });
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";

    const adminClient = createSupabaseAdminClient();
    const { data: existingComment } = await adminClient
      .from("teacher_social_comments")
      .select("id, user_id, post_id")
      .eq("id", commentId)
      .maybeSingle();

    if (!existingComment) {
      return NextResponse.json({ ok: false, error: "মন্তব্যটি পাওয়া যায়নি।" }, { status: 404 });
    }

    // Ownership check (Anti-IDOR)
    if (!isPlatformAdmin && existingComment.user_id !== currentUserId) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা লঙ্ঘন: আপনি কেবল আপনার নিজের মন্তব্য মুছতে পারেন।" },
        { status: 403 }
      );
    }

    await adminClient
      .from("teacher_social_comments")
      .delete()
      .eq("id", commentId);

    // Decrement comments count on post
    const { data: post } = await adminClient
      .from("teacher_social_posts")
      .select("comments_count")
      .eq("id", existingComment.post_id)
      .maybeSingle();

    if (post) {
      await adminClient
        .from("teacher_social_posts")
        .update({ comments_count: Math.max(0, (Number(post.comments_count) || 1) - 1) })
        .eq("id", existingComment.post_id)
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      message: "মন্তব্যটি মুছে ফেলা হয়েছে।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

