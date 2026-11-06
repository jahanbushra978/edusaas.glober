import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_POST_TYPES = Object.freeze(["text", "photo", "multi_photo", "video", "clip"]);
const VALID_VISIBILITIES = Object.freeze(["public", "followers", "private"]);

/**
 * GET /api/teacher-marketplace/social/posts
 *
 * Query params:
 * - teacher_id: string (optional, filter by teacher)
 * - tab: 'posts' | 'clips' | 'liked' | 'saved' (defaults to 'posts')
 * - feed: 'following' (optional, fetch feed from followed teachers)
 * - limit: number (defaults to 10, max 50)
 * - offset: number (defaults to 0)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacher_id");
    const tab = searchParams.get("tab") || "posts";
    const feed = searchParams.get("feed");
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 10), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    const currentUserId = session?.authUserId || session?.profileId || session?.id || null;

    const adminClient = createSupabaseAdminClient();

    // ── Tab: SAVED (Strictly Private to the saving user) ──
    if (tab === "saved") {
      if (!currentUserId) {
        return NextResponse.json({ ok: true, posts: [], hasMore: false });
      }

      const { data: savedEntries, error: savedError } = await adminClient
        .from("teacher_social_saved_posts")
        .select("post_id, created_at")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (savedError || !savedEntries || savedEntries.length === 0) {
        return NextResponse.json({ ok: true, posts: [], hasMore: false });
      }

      const postIds = savedEntries.map((s) => s.post_id);
      const { data: savedPosts } = await adminClient
        .from("teacher_social_posts")
        .select("*")
        .in("id", postIds)
        .eq("status", "published");

      // Sort in order of saved timestamp
      const postMap = new Map((savedPosts || []).map((p) => [p.id, p]));
      const orderedPosts = postIds.map((id) => postMap.get(id)).filter(Boolean);

      return NextResponse.json({
        ok: true,
        posts: orderedPosts.map((p) => ({ ...p, is_saved_by_current_user: true })),
        hasMore: savedEntries.length === limit,
      });
    }

    // ── Tab: LIKED (Posts liked by current user) ──
    if (tab === "liked") {
      if (!currentUserId) {
        return NextResponse.json({ ok: true, posts: [], hasMore: false });
      }

      const { data: likedEntries } = await adminClient
        .from("teacher_social_reactions")
        .select("post_id, reaction_type, created_at")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!likedEntries || likedEntries.length === 0) {
        return NextResponse.json({ ok: true, posts: [], hasMore: false });
      }

      const postIds = likedEntries.map((l) => l.post_id);
      const { data: likedPosts } = await adminClient
        .from("teacher_social_posts")
        .select("*")
        .in("id", postIds)
        .eq("status", "published");

      const postMap = new Map((likedPosts || []).map((p) => [p.id, p]));
      const reactionMap = new Map(likedEntries.map((l) => [l.post_id, l.reaction_type]));
      const orderedPosts = postIds
        .map((id) => {
          const p = postMap.get(id);
          if (!p) return null;
          return {
            ...p,
            current_user_reaction: reactionMap.get(id) || null,
          };
        })
        .filter(Boolean);

      return NextResponse.json({
        ok: true,
        posts: orderedPosts,
        hasMore: likedEntries.length === limit,
      });
    }

    // ── Feed from Followed Teachers ──
    let followingTeacherIds = [];
    if (feed === "following" && currentUserId) {
      const { data: followRows } = await adminClient
        .from("teacher_social_follows")
        .select("following_teacher_id")
        .eq("follower_user_id", currentUserId);

      followingTeacherIds = (followRows || []).map((r) => r.following_teacher_id);
      if (followingTeacherIds.length === 0) {
        return NextResponse.json({ ok: true, posts: [], hasMore: false });
      }
    }

    // ── Standard Feed / Profile Posts Query ──
    const authorUserId = searchParams.get("author_user_id");
    const authorRole = searchParams.get("author_role");
    const postType = searchParams.get("post_type");

    let query = adminClient
      .from("teacher_social_posts")
      .select("*")
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    } else if (feed === "following" && followingTeacherIds.length > 0) {
      query = query.in("teacher_id", followingTeacherIds);
    }

    if (authorUserId) {
      query = query.eq("author_user_id", authorUserId);
    }
    if (authorRole) {
      query = query.eq("author_role", authorRole);
    }

    if (tab === "clips") {
      query = query.eq("post_type", "clip");
    } else if (tab === "videos") {
      query = query.in("post_type", ["video", "clip"]);
    } else if (tab === "photos") {
      query = query.in("post_type", ["photo", "multi_photo"]);
    } else if (postType && VALID_POST_TYPES.includes(postType)) {
      query = query.eq("post_type", postType);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json({
        ok: true,
        source: "database_error",
        posts: [],
        warning: error.message,
        hasMore: false,
      });
    }

    const safePosts = posts || [];
    const isPlatformAdmin = session?.role === "admin" || session?.role === "platform_owner";

    // Batch resolve follow relationships for 'followers' visibility (anti-N+1)
    const followerPosts = safePosts.filter(
      (p) => p.visibility === "followers" && p.author_user_id !== currentUserId && !isPlatformAdmin
    );
    let followedTeacherIds = new Set();
    if (followerPosts.length > 0 && currentUserId) {
      const teacherIdsToCheck = [...new Set(followerPosts.map((p) => p.teacher_id))];
      const { data: followRecords } = await adminClient
        .from("teacher_social_follows")
        .select("following_teacher_id")
        .eq("follower_user_id", currentUserId)
        .in("following_teacher_id", teacherIdsToCheck);
      followedTeacherIds = new Set((followRecords || []).map((r) => r.following_teacher_id));
    }

    // Filter by Visibility
    const filteredPosts = safePosts.filter((post) => {
      if (post.visibility === "public") return true;
      if (!currentUserId) return false;
      if (isPlatformAdmin || post.author_user_id === currentUserId) return true;
      if (post.visibility === "private") return false;
      if (post.visibility === "followers") {
        return followedTeacherIds.has(post.teacher_id);
      }
      return false;
    });

    // Populate Current User Reactions & Saved status if authenticated
    if (currentUserId && filteredPosts.length > 0) {
      const postIds = filteredPosts.map((p) => p.id);

      const [reactionsRes, savedRes] = await Promise.all([
        adminClient
          .from("teacher_social_reactions")
          .select("post_id, reaction_type")
          .in("post_id", postIds)
          .eq("user_id", currentUserId),
        adminClient
          .from("teacher_social_saved_posts")
          .select("post_id")
          .in("post_id", postIds)
          .eq("user_id", currentUserId),
      ]);

      const userReactions = new Map((reactionsRes.data || []).map((r) => [r.post_id, r.reaction_type]));
      const userSaved = new Set((savedRes.data || []).map((s) => s.post_id));

      const enrichedPosts = filteredPosts.map((post) => ({
        ...post,
        current_user_reaction: userReactions.get(post.id) || null,
        is_saved_by_current_user: userSaved.has(post.id),
      }));

      return NextResponse.json({
        ok: true,
        posts: enrichedPosts,
        hasMore: safePosts.length === limit,
      });
    }

    return NextResponse.json({
      ok: true,
      posts: filteredPosts.map((p) => ({
        ...p,
        current_user_reaction: null,
        is_saved_by_current_user: false,
      })),
      hasMore: safePosts.length === limit,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher-marketplace/social/posts
 *
 * Body:
 * - content_text: string
 * - post_type: 'text' | 'photo' | 'multi_photo' | 'video' | 'clip'
 * - media_urls: array of { url, type, thumbnail, width, height, duration }
 * - video_metadata: object
 * - visibility: 'public' | 'followers' | 'private'
 * - original_post_id: optional UUID for reposting with commentary
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "পোস্ট প্রকাশ করতে অনুগ্রহ করে উস্তাদ অ্যাকাউন্টে লগইন করুন।" },
        { status: 401 }
      );
    }

    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";
    const isTeacher = session.role === "teacher" || isPlatformAdmin;
    const isStudent = session.role === "student";

    if (!isTeacher && !isStudent) {
      return NextResponse.json(
        { ok: false, error: "পোস্ট প্রকাশ করতে অনুগ্রহ করে অনুমোদিত উস্তাদ অথবা শিক্ষার্থী অ্যাকাউন্টে লগইন করুন।" },
        { status: 403 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const sessionUserId = session.authUserId || session.id;
    const sessionProfileId = session.profileId || session.teacher_id;

    let authorTeacherId = null;
    let authorRole = isTeacher ? "teacher" : "student";
    let authorName = session.full_name_bn || session.name || (isTeacher ? "উস্তাদ" : "শিক্ষার্থী");
    let authorAvatar = session.avatar_url || session.avatar || null;
    let teacherProfile = null;

    if (isTeacher) {
      // Resolve Authoritative Teacher Profile
      const { data: profile } = await adminClient
        .from("teacher_marketplace_profiles")
        .select("teacher_id, name_bn, name_en, avatar_url, status, posts_count")
        .or(`user_id.eq.${sessionUserId},teacher_id.eq.${sessionProfileId || sessionUserId}`)
        .maybeSingle();

      teacherProfile = profile;

      if (!teacherProfile && !isPlatformAdmin) {
        return NextResponse.json(
          { ok: false, error: "অনুমোদিত শিক্ষক প্রোফাইল পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      authorTeacherId = teacherProfile?.teacher_id || sessionProfileId || sessionUserId;
      if (teacherProfile?.name_bn) authorName = teacherProfile.name_bn;
      if (teacherProfile?.avatar_url) authorAvatar = teacherProfile.avatar_url;
    }

    const body = await req.json().catch(() => ({}));
    const {
      content_text = "",
      post_type = "text",
      media_urls = [],
      video_metadata = null,
      visibility = "public",
      original_post_id = null,
    } = body;

    const trimmedText = String(content_text || "").trim();

    if (!trimmedText && (!Array.isArray(media_urls) || media_urls.length === 0) && !original_post_id) {
      return NextResponse.json(
        { ok: false, error: "পোস্টে কোনো টেক্সট, ছবি অথবা ভিডিও যুক্ত করা আবশ্যক।" },
        { status: 400 }
      );
    }

    const safePostType = VALID_POST_TYPES.includes(post_type) ? post_type : "text";
    const safeVisibility = VALID_VISIBILITIES.includes(visibility) ? visibility : "public";

    // Handle Repost Snapshot if original_post_id provided
    let originalPostSnapshot = null;
    if (original_post_id) {
      const { data: originalPost } = await adminClient
        .from("teacher_social_posts")
        .select("id, teacher_id, author_name, author_avatar, content_text, post_type, media_urls, created_at")
        .eq("id", original_post_id)
        .maybeSingle();

      if (originalPost) {
        originalPostSnapshot = originalPost;
        // Increment shares count on original post
        await adminClient
          .from("teacher_social_posts")
          .update({ shares_count: adminClient.rpc ? undefined : 1 })
          .eq("id", original_post_id)
          .catch(() => {});
      }
    }

    const newPostPayload = {
      teacher_id: authorTeacherId || session.studentPublicId || sessionUserId,
      author_role: authorRole,
      author_user_id: sessionUserId,
      author_name: authorName,
      author_avatar: authorAvatar,
      content_text: trimmedText,
      content: trimmedText,
      post_type: safePostType,
      media_urls: Array.isArray(media_urls) ? media_urls : [],
      media_url: Array.isArray(media_urls) && media_urls.length > 0 ? (typeof media_urls[0] === 'string' ? media_urls[0] : media_urls[0]?.url) : null,
      video_metadata: video_metadata && typeof video_metadata === "object" ? video_metadata : null,
      visibility: safeVisibility,
      likes_count: 0,
      reactions_summary: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, insightful: 0 },
      comments_count: 0,
      shares_count: 0,
      original_post_id: original_post_id || null,
      original_post_data: originalPostSnapshot,
      status: "published",
    };

    const { data: createdPost, error: insertError } = await adminClient
      .from("teacher_social_posts")
      .insert(newPostPayload)
      .select()
      .maybeSingle();

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: "পোস্ট ডেটাবেজে সংরক্ষণ ব্যর্থ: " + insertError.message },
        { status: 500 }
      );
    }

    // Increment teacher posts count
    if (teacherProfile) {
      await adminClient
        .from("teacher_marketplace_profiles")
        .update({ posts_count: (Number(teacherProfile.posts_count) || 0) + 1 })
        .eq("teacher_id", authorTeacherId)
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      message: "মাশাআল্লাহ! আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে।",
      post: createdPost,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "পোস্ট সংরক্ষণে অনাকাঙ্ক্ষিত ত্রুটি" },
      { status: 500 }
    );
  }
}

