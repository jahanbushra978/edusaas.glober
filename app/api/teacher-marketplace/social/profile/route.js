import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-identity";
import { verifySessionToken } from "@/lib/auth-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/teacher-marketplace/social/profile
 * Update teacher's own social profile details and media
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || (!session.authUserId && !session.profileId && !session.id)) {
      return NextResponse.json(
        { ok: false, error: "প্রোফাইল সম্পাদনা করতে অনুগ্রহ করে লগইন করুন।" },
        { status: 401 }
      );
    }

    const currentUserId = session.authUserId || session.profileId || session.id;
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";
    const isTeacher = session.role === "teacher" || isPlatformAdmin;

    if (!isTeacher) {
      return NextResponse.json(
        { ok: false, error: "শুধুমাত্র অনুমোদিত শিক্ষকগণ প্রোফাইল সম্পাদনা করতে পারেন।" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      teacher_id,
      name_bn,
      name_en,
      title_bn,
      avatar_url,
      cover_url,
      bio,
      location,
      languages,
      qualifications,
      specialties,
      username,
    } = body;

    const adminClient = createSupabaseAdminClient();

    // 1. Resolve Target Profile & Enforce Anti-IDOR
    const targetTeacherId = teacher_id || session.profileId || session.teacher_id || currentUserId;

    const { data: existingProfile, error: fetchError } = await adminClient
      .from("teacher_marketplace_profiles")
      .select("id, teacher_id, user_id, is_verified, status")
      .or(`teacher_id.eq.${targetTeacherId},user_id.eq.${currentUserId}`)
      .maybeSingle();

    if (fetchError || !existingProfile) {
      return NextResponse.json(
        { ok: false, error: "শিক্ষক প্রোফাইল পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Anti-IDOR: Non-admin can NEVER edit another teacher's profile
    if (!isPlatformAdmin && existingProfile.user_id && existingProfile.user_id !== currentUserId && existingProfile.teacher_id !== session.teacher_id) {
      return NextResponse.json(
        { ok: false, error: "নিরাপত্তা লঙ্ঘন: অন্য শিক্ষকের প্রোফাইল সম্পাদনা সম্পূর্ণ নিষিদ্ধ।" },
        { status: 403 }
      );
    }

    // 2. Validate Username if changing
    const updates = { updated_at: new Date().toISOString() };

    if (username !== undefined) {
      const cleanUsername = String(username || "").trim().toLowerCase();
      if (cleanUsername) {
        if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
          return NextResponse.json(
            { ok: false, error: "ইউজারনেম ৩-৩০ অক্ষরের ইংরেজি বর্ণ, সংখ্যা বা আন্ডারস্কোর হতে হবে।" },
            { status: 400 }
          );
        }

        // Check uniqueness
        const { data: usernameConflict } = await adminClient
          .from("teacher_marketplace_profiles")
          .select("id")
          .eq("username", cleanUsername)
          .neq("teacher_id", existingProfile.teacher_id)
          .maybeSingle();

        if (usernameConflict) {
          return NextResponse.json(
            { ok: false, error: "এই ইউজারনেমটি ইতিমধ্যে অন্য একজন ব্যবহার করছেন।" },
            { status: 409 }
          );
        }
        updates.username = cleanUsername;
      } else {
        updates.username = null;
      }
    }

    // 3. Authorized Fields (Teacher CANNOT modify is_verified or status)
    if (typeof name_bn === "string" && name_bn.trim()) updates.name_bn = name_bn.trim();
    if (typeof name_en === "string") updates.name_en = name_en.trim();
    if (typeof title_bn === "string") updates.title_bn = title_bn.trim();
    if (typeof avatar_url === "string" && avatar_url.trim()) updates.avatar_url = avatar_url.trim();
    if (typeof cover_url === "string" && cover_url.trim()) updates.cover_url = cover_url.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof location === "string") updates.location = location.trim();

    if (Array.isArray(languages)) updates.languages = languages;
    if (Array.isArray(qualifications)) updates.qualifications = qualifications;
    if (Array.isArray(specialties)) updates.specialties = specialties;

    // 4. Update Profile
    const { data: updatedProfile, error: updateError } = await adminClient
      .from("teacher_marketplace_profiles")
      .update(updates)
      .eq("teacher_id", existingProfile.teacher_id)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "প্রোফাইল সংরক্ষণে ব্যর্থ হয়েছে: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "মাশাআল্লাহ! আপনার প্রোফাইল সফলভাবে হালনাগাদ করা হয়েছে।",
      profile: updatedProfile,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Server error" }, { status: 500 });
  }
}

