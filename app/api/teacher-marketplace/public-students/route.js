import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import { REAL_STUDENTS_10 } from "@/features/teachers/data/marketplaceSeedData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// High-fidelity Seed Global Public Students (Independent 10 learners with discoverability enabled)
const SEED_PUBLIC_STUDENTS = REAL_STUDENTS_10;

/**
 * GET /api/teacher-marketplace/public-students
 * Search and list discoverable Global Public Students.
 * Strictly excludes institutional madrasa data.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("search") || "").trim().toLowerCase();
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const adminClient = createSupabaseAdminClient();
    let dbStudents = [];

    if (adminClient) {
      try {
        let dbQuery = adminClient
          .from("public_student_directory")
          .select("student_public_id, username, display_name, avatar_url, cover_url, bio, learning_interests, followers_count, following_count, is_discoverable, created_at");

        if (query) {
          dbQuery = dbQuery.or(
            `display_name.ilike.%${query}%,username.ilike.%${query}%,student_public_id.ilike.%${query}%`
          );
        }

        const { data, error } = await dbQuery
          .order("followers_count", { ascending: false })
          .range(offset, offset + limit - 1);

        if (!error && data) {
          dbStudents = data.map((s) => ({
            ...s,
            id: s.student_public_id, // Map public ID for client key stability without leaking internal UUID
          }));
        } else if (error) {
          // Fallback to table if view has not yet been executed in target DB
          let fbQuery = adminClient
            .from("public_student_profiles")
            .select("student_public_id, username, display_name, avatar_url, cover_url, bio, learning_interests, followers_count, following_count, is_discoverable, created_at")
            .eq("is_discoverable", true);

          if (query) {
            fbQuery = fbQuery.or(
              `display_name.ilike.%${query}%,username.ilike.%${query}%,student_public_id.ilike.%${query}%`
            );
          }

          const { data: fbData, error: fbError } = await fbQuery
            .order("followers_count", { ascending: false })
            .range(offset, offset + limit - 1);

          if (!fbError && fbData) {
            dbStudents = fbData.map((s) => ({
              ...s,
              id: s.student_public_id,
            }));
          }
        }
      } catch (e) {
        console.warn("Could not query public students from DB:", e.message);
      }
    }

    // Merge database students with seed students (deduping by student_public_id)
    const existingIds = new Set(dbStudents.map((s) => s.student_public_id));
    const matchingSeed = SEED_PUBLIC_STUDENTS.filter((seed) => {
      if (existingIds.has(seed.student_public_id)) return false;
      if (!query) return true;
      return (
        seed.display_name.toLowerCase().includes(query) ||
        seed.username.toLowerCase().includes(query) ||
        seed.student_public_id.toLowerCase().includes(query) ||
        seed.learning_interests.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    const combined = [...dbStudents, ...matchingSeed];
    const paginated = combined.slice(offset, offset + limit);

    return NextResponse.json({
      ok: true,
      students: paginated,
      total: combined.length,
      hasMore: offset + limit < combined.length,
    });
  } catch (err) {
    console.error("GET public-students error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/teacher-marketplace/public-students
 * Upsert public student profile with strict session identity verification.
 * Enforces ownership: Prevents Anti-IDOR profile overwriting.
 */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.role) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to update student profile" },
        { status: 401 }
      );
    }

    // Role check: Only students (or platform admins) can manage student profiles
    if (session.role !== "student" && session.role !== "admin" && session.role !== "platform_owner") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Only students can manage a student profile" },
        { status: 403 }
      );
    }

    const authUserId = session.authUserId || session.profileId || session.id;
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Invalid user session identity" }, { status: 401 });
    }

    const body = await req.json();
    const {
      student_public_id,
      username,
      display_name,
      avatar_url,
      cover_url,
      bio,
      learning_interests = [],
      is_discoverable = true,
    } = body;

    const cleanDisplayName = typeof display_name === "string" ? display_name.trim() : "";
    if (!cleanDisplayName || cleanDisplayName.length < 2 || cleanDisplayName.length > 100) {
      return NextResponse.json(
        { ok: false, error: "ডিসপ্লে নাম ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।" },
        { status: 400 }
      );
    }

    const cleanUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json(
        { ok: false, error: "ইউজারনেম ৩ থেকে ৩০ অক্ষরের মধ্যে হতে হবে।" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: false, error: "Database client unavailable" }, { status: 503 });
    }

    // 1. Anti-IDOR Check: Lookup existing profile belonging to this authenticated user
    const { data: existingProfile } = await adminClient
      .from("public_student_profiles")
      .select("id, student_public_id, user_id, username")
      .eq("user_id", authUserId)
      .maybeSingle();

    // 2. Prevent overwriting another user's profile if student_public_id is passed
    if (student_public_id) {
      const { data: idTaken } = await adminClient
        .from("public_student_profiles")
        .select("id, user_id, student_public_id")
        .eq("student_public_id", student_public_id)
        .maybeSingle();

      if (idTaken && idTaken.user_id && idTaken.user_id !== authUserId) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized: You cannot modify another student's profile" },
          { status: 403 }
        );
      }
    }

    // 3. Check username uniqueness
    const { data: usernameTaken } = await adminClient
      .from("public_student_profiles")
      .select("id, user_id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (usernameTaken && usernameTaken.user_id !== authUserId) {
      return NextResponse.json(
        { ok: false, error: "এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে অন্যটি বেছে নিন।" },
        { status: 409 }
      );
    }

    const canonicalPublicId =
      existingProfile?.student_public_id ||
      student_public_id ||
      session.studentPublicId ||
      `STU-${authUserId.slice(0, 8).toUpperCase()}`;

    const payload = {
      user_id: authUserId,
      student_public_id: canonicalPublicId,
      username: cleanUsername,
      display_name: cleanDisplayName,
      avatar_url: avatar_url || null,
      cover_url: cover_url || null,
      bio: bio ? String(bio).slice(0, 500) : null,
      learning_interests: Array.isArray(learning_interests) ? learning_interests.slice(0, 10) : [],
      is_discoverable: Boolean(is_discoverable),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: upsertErr } = await adminClient
      .from("public_student_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (upsertErr) {
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, student: updatedProfile });
  } catch (err) {
    console.error("POST public-students error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
