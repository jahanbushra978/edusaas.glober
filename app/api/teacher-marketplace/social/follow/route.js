import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teacher-marketplace/social/follow
 * - teacher_id: string
 * - type: 'status' | 'followers' | 'following'
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacher_id");
    const type = searchParams.get("type") || "status";
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    if (!teacherId) {
      return NextResponse.json({ ok: false, error: "teacher_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    const currentUserId = session?.authUserId || session?.profileId || session?.id || null;

    const adminClient = createSupabaseAdminClient();

    if (type === "followers") {
      const { data: followers, error } = await adminClient
        .from("teacher_social_follows")
        .select("id, follower_user_id, follower_name, follower_avatar, follower_role, created_at")
        .eq("following_teacher_id", teacherId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        followers: followers || [],
        hasMore: (followers || []).length === limit,
      });
    }

    // Default: Check follow status
    let isFollowing = false;
    if (currentUserId) {
      const { data: followRecord } = await adminClient
        .from("teacher_social_follows")
        .select("id")
        .eq("follower_user_id", currentUserId)
        .eq("following_teacher_id", teacherId)
        .maybeSingle();

      isFollowing = Boolean(followRecord?.id);
    }

    const { data: teacherProfile } = await adminClient
      .from("teacher_marketplace_profiles")
      .select("followers_count, following_count")
      .eq("teacher_id", teacherId)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      teacher_id: teacherId,
      is_following: isFollowing,
      followers_count: Number(teacherProfile?.followers_count) || 0,
      following_count: Number(teacherProfile?.following_count) || 0,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/social/follow
 * Toggle follow/unfollow
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "অনুসরণ (Follow) করতে অনুগ্রহ করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const currentUserName = session.name || session.full_name_bn || session.full_name_en || "শিক্ষার্থী";
    const currentUserAvatar = session.avatar_url || null;
    const currentUserRole = session.role || "student";

    const body = await req.json().catch(() => ({}));
    const { teacher_id } = body;

    if (!teacher_id) {
      return NextResponse.json({ ok: false, error: "teacher_id প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    // Invariant: Prevent self-follow
    if (String(currentUserId) === String(teacher_id) || session.teacher_id === teacher_id) {
      return NextResponse.json(
        { ok: false, error: "আপনি নিজেকে অনুসরণ করতে পারবেন না।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // 1. Try atomic PostgreSQL RPC if migration is applied
    try {
      const { data: rpcData, error: rpcError } = await adminClient.rpc("toggle_teacher_follow", {
        p_follower_user_id: currentUserId,
        p_follower_name: currentUserName,
        p_follower_avatar: currentUserAvatar,
        p_follower_role: currentUserRole,
        p_following_teacher_id: teacher_id,
      });

      if (!rpcError && rpcData) {
        return NextResponse.json({ ok: true, ...rpcData });
      }
    } catch {
      // Fallback below
    }

    // 2. Transactional Fallback
    const { data: existingFollow } = await adminClient
      .from("teacher_social_follows")
      .select("id")
      .eq("follower_user_id", currentUserId)
      .eq("following_teacher_id", teacher_id)
      .maybeSingle();

    let isFollowing = false;
    if (existingFollow) {
      // Unfollow
      await adminClient.from("teacher_social_follows").delete().eq("id", existingFollow.id);
      isFollowing = false;
    } else {
      // Follow
      await adminClient.from("teacher_social_follows").insert({
        follower_user_id: currentUserId,
        follower_name: currentUserName,
        follower_avatar: currentUserAvatar,
        follower_role: currentUserRole,
        following_teacher_id: teacher_id,
      });
      isFollowing = true;
    }

    // Count real followers
    const { count } = await adminClient
      .from("teacher_social_follows")
      .select("id", { count: "exact", head: true })
      .eq("following_teacher_id", teacher_id);

    const followersCount = count || 0;
    await adminClient
      .from("teacher_marketplace_profiles")
      .update({ followers_count: followersCount })
      .eq("teacher_id", teacher_id)
      .catch(() => {});

    return NextResponse.json({
      ok: true,
      is_following: isFollowing,
      followers_count: followersCount,
      teacher_id,
      message: isFollowing ? "উস্তাদকে সফলভাবে ফলো করা হয়েছে।" : "উস্তাদকে আনফলো করা হয়েছে।",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

