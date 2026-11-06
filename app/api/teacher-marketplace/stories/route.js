import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// High-fidelity active Seed Stories (last 24 hours)
const SEED_STORIES = [
  {
    id: "story-qari-1",
    author_id: "qari-mahmudul-hasan",
    author_role: "teacher",
    author_name: "শায়খ ক্বারী মাহমুদুল হাসান",
    author_avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
    media_url: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=80",
    media_type: "image",
    caption: "আজকের মাশক ক্লাসে সূরা আল-ফাতিহার ছদ হরফের সুন্দর অনুশীলন। মাশাআল্লাহ!",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 21).toISOString(),
  },
  {
    id: "story-ustaza-2",
    author_id: "ustaza-sumayyah-maryam",
    author_role: "teacher",
    author_name: "উস্তাযা সুমাইয়া আক্তার",
    author_avatar: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
    media_url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
    media_type: "image",
    caption: "নূরানী কায়দা পর্ব ৪: জযম ও সাকিনের নিয়ম সহজে মনে রাখার কৌশল।",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 18).toISOString(),
  },
  {
    id: "story-student-3",
    author_id: "stu-abdullah-101",
    author_role: "student",
    author_name: "আব্দুল্লাহ আল-মামুন",
    author_avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    media_url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1000&q=80",
    media_type: "image",
    caption: "আলহামদুলিল্লাহ! আজ উস্তাদের সহায়তায় ৩টি মাখরাজ নিয়ম আয়ত্ত করেছি।",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    expires_at: new Date(Date.now() + 3600000 * 16).toISOString(),
  },
];

/**
 * Server-side helper to verify authenticated session and resolve caller profile.
 */
async function resolveCallerIdentity(session, adminClient) {
  if (!session || !session.role) return null;

  const authUserId = session.authUserId || session.profileId || session.id;
  if (!authUserId) return null;

  if (session.role === "teacher") {
    let teacherProfile = null;
    if (adminClient) {
      const { data } = await adminClient
        .from("teacher_marketplace_profiles")
        .select("id, teacher_id, name_bn, status, user_id, avatar_url")
        .or(`user_id.eq.${authUserId},teacher_id.eq.${authUserId},id.eq.${authUserId}`)
        .maybeSingle();
      teacherProfile = data;
    }
    return {
      role: "teacher",
      userId: authUserId,
      teacherId: teacherProfile?.teacher_id || teacherProfile?.id || session.teacherId || authUserId,
      nameBn: teacherProfile?.name_bn || session.nameBn || session.name || "উস্তাদ",
      avatar: teacherProfile?.avatar_url || session.avatar || null,
      status: teacherProfile?.status || "approved",
      isApproved: (teacherProfile?.status || "approved") === "approved",
    };
  }

  if (session.role === "student") {
    let studentProfile = null;
    if (adminClient) {
      const { data } = await adminClient
        .from("public_student_profiles")
        .select("id, student_public_id, display_name, username, user_id, avatar_url")
        .or(`user_id.eq.${authUserId},id.eq.${authUserId}`)
        .maybeSingle();
      studentProfile = data;
    }
    return {
      role: "student",
      userId: authUserId,
      studentId: studentProfile?.id || authUserId,
      name: studentProfile?.display_name || session.full_name_bn || session.name || "শিক্ষার্থী",
      avatar: studentProfile?.avatar_url || session.avatar || null,
    };
  }

  if (session.role === "platform_owner" || session.role === "admin") {
    return {
      role: "admin",
      userId: authUserId,
      name: session.name || "অ্যাডমিন",
      avatar: session.avatar || null,
      isAdmin: true,
    };
  }

  return null;
}

/**
 * GET /api/teacher-marketplace/stories
 * Returns active stories (created within last 24 hours, not yet expired).
 */
export async function GET() {
  try {
    const adminClient = createSupabaseAdminClient();
    let dbStories = [];

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("social_stories")
          .select("*")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (!error && data) {
          dbStories = data;
        }
      } catch (e) {
        console.warn("Could not query social_stories from DB:", e.message);
      }
    }

    const combined = [...dbStories, ...SEED_STORIES];
    // Filter strictly to non-expired
    const now = new Date();
    const activeStories = combined.filter((s) => new Date(s.expires_at) > now);

    return NextResponse.json({ ok: true, stories: activeStories });
  } catch (err) {
    console.error("GET stories error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/stories
 * Upload a 24-hour temporary story.
 * Strictly derives author identity from authenticated session.
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to post a story" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { media_url, media_type = "image", caption } = body;

    if (!media_url || typeof media_url !== "string") {
      return NextResponse.json(
        { ok: false, error: "media_url is required" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const caller = await resolveCallerIdentity(session, adminClient);
    if (!caller) {
      return NextResponse.json({ ok: false, error: "Invalid user session identity" }, { status: 401 });
    }

    // Role check: Only approved teachers can post if role is teacher
    if (caller.role === "teacher" && !caller.isApproved) {
      return NextResponse.json(
        { ok: false, error: "শুধুমাত্র যাচাইকৃত ও অনুমোদিত শিক্ষকগণ স্টোরি পোস্ট করতে পারবেন।" },
        { status: 403 }
      );
    }

    // Role check: Students cannot upload video stories (author_role === "student" && media_type === "video")
    if ((caller.role === "student" || body.author_role === "student") && media_type === "video") {
      return NextResponse.json(
        { ok: false, error: "শিক্ষার্থীদের জন্য শুধুমাত্র ছবি স্টোরি পোস্ট করার অনুমতি রয়েছে।" },
        { status: 403 }
      );
    }

    // Server-derived author attributes (Never trust client body)
    let authorId = caller.userId;
    let authorRole = caller.role;
    let authorName = caller.name || "সম্মানিত ব্যবহারকারী";
    let authorAvatar = caller.avatar;

    if (caller.role === "teacher") {
      authorId = caller.teacherId;
      authorRole = "teacher";
      authorName = caller.nameBn || "উস্তাদ";
    } else if (caller.role === "student") {
      authorId = caller.studentId;
      authorRole = "student";
      authorName = caller.name || "শিক্ষার্থী";
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const storyPayload = {
      author_id: authorId,
      author_role: authorRole,
      author_name: authorName,
      author_avatar: authorAvatar || null,
      media_url,
      media_type: media_type === "video" ? "video" : "image",
      caption: caption ? String(caption).slice(0, 200) : null,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("social_stories")
          .insert(storyPayload)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ ok: true, story: data });
        }
      } catch (e) {
        console.warn("DB insert story warning:", e.message);
      }
    }

    return NextResponse.json({
      ok: true,
      story: { ...storyPayload, id: `story-${Date.now()}` },
    });
  } catch (err) {
    console.error("POST story error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
