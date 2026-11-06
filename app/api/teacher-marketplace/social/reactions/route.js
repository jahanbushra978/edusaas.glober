import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_REACTIONS = Object.freeze(["like", "love", "care", "haha", "wow", "sad", "insightful"]);

/**
 * GET /api/teacher-marketplace/social/reactions
 * Fetch users who reacted to a post
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");
    const reactionType = searchParams.get("reaction_type");
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    if (!postId) {
      return NextResponse.json({ ok: false, error: "post_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    let query = adminClient
      .from("teacher_social_reactions")
      .select("id, post_id, user_id, user_role, user_name, user_avatar, reaction_type, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (reactionType && VALID_REACTIONS.includes(reactionType)) {
      query = query.eq("reaction_type", reactionType);
    }

    const { data: reactions, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      reactions: reactions || [],
      hasMore: (reactions || []).length === limit,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/social/reactions
 * Add, change, or remove (toggle) reaction
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "প্রতিক্রিয়া জানাতে অনুগ্রহ করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const currentUserName = session.name || session.full_name_bn || session.full_name_en || "ব্যবহারকারী";
    const currentUserAvatar = session.avatar_url || null;
    const currentUserRole = session.role || "student";

    const body = await req.json().catch(() => ({}));
    const { post_id, reaction_type } = body;

    if (!post_id || !reaction_type || !VALID_REACTIONS.includes(reaction_type)) {
      return NextResponse.json(
        { ok: false, error: "সঠিক post_id এবং রিঅ্যাকশন টাইপ (like, love, care, haha, wow, sad, insightful) প্রদান করুন।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // 1. Try atomic PostgreSQL RPC if migration is applied
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc(
        "toggle_teacher_post_reaction",
        {
          p_post_id: post_id,
          p_user_id: currentUserId,
          p_user_name: currentUserName,
          p_user_avatar: currentUserAvatar,
          p_user_role: currentUserRole,
          p_reaction_type: reaction_type,
        }
      );

      if (!rpcError && rpcData) {
        return NextResponse.json({
          ok: true,
          ...rpcData,
        });
      }
    } catch {
      // Fallback to transactional client logic below
    }

    // 2. Resilient Server-Side Transaction Fallback (if RPC not yet pushed to remote DB)
    const { data: existingReaction } = await adminClient
      .from("teacher_social_reactions")
      .select("id, reaction_type")
      .eq("post_id", post_id)
      .eq("user_id", currentUserId)
      .maybeSingle();

    const { data: post } = await adminClient
      .from("teacher_social_posts")
      .select("reactions_summary, likes_count")
      .eq("id", post_id)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ ok: false, error: "পোস্টটি পাওয়া যায়নি।" }, { status: 404 });
    }

    const summary = {
      like: 0,
      love: 0,
      care: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      insightful: 0,
      ...(post.reactions_summary || {}),
    };

    let action = "added";
    let activeReactionType = reaction_type;

    if (existingReaction) {
      if (existingReaction.reaction_type === reaction_type) {
        // Toggle OFF (Remove reaction)
        await adminClient
          .from("teacher_social_reactions")
          .delete()
          .eq("id", existingReaction.id);

        summary[reaction_type] = Math.max(0, (summary[reaction_type] || 1) - 1);
        action = "removed";
        activeReactionType = null;
      } else {
        // Change reaction type
        const oldType = existingReaction.reaction_type;
        await adminClient
          .from("teacher_social_reactions")
          .update({
            reaction_type,
            user_name: currentUserName,
            user_avatar: currentUserAvatar,
          })
          .eq("id", existingReaction.id);

        if (summary[oldType] !== undefined) {
          summary[oldType] = Math.max(0, summary[oldType] - 1);
        }
        summary[reaction_type] = (summary[reaction_type] || 0) + 1;
        action = "changed";
      }
    } else {
      // New reaction
      await adminClient.from("teacher_social_reactions").insert({
        post_id,
        user_id: currentUserId,
        user_name: currentUserName,
        user_avatar: currentUserAvatar,
        user_role: currentUserRole,
        reaction_type,
      });

      summary[reaction_type] = (summary[reaction_type] || 0) + 1;
      action = "added";
    }

    const totalLikes = VALID_REACTIONS.reduce((sum, r) => sum + (summary[r] || 0), 0);

    await adminClient
      .from("teacher_social_posts")
      .update({
        reactions_summary: summary,
        likes_count: totalLikes,
      })
      .eq("id", post_id);

    return NextResponse.json({
      ok: true,
      action,
      reaction_type: activeReactionType,
      reactions_summary: summary,
      likes_count: totalLikes,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

