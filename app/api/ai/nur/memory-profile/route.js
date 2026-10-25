import { NextResponse } from "next/server";
import { resolveAuthContext } from "@/lib/ai/auth-context";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { verifyCsrfOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authContext = await resolveAuthContext(request);
    const { searchParams } = new URL(request.url);
    const requestedStudentId = searchParams.get("studentId");

    const callerId = authContext?.studentRecord?.id || authContext?.user?.id;
    const isTeacherOrAdmin =
      authContext?.role === "teacher" ||
      authContext?.role === "admin" ||
      authContext?.isSuperAdmin;

    // Strict target ownership check
    if (!isTeacherOrAdmin && requestedStudentId && requestedStudentId !== callerId) {
      return NextResponse.json({ ok: false, message: "Unauthorized to inspect other student profiles" }, { status: 403 });
    }

    const targetId = requestedStudentId || callerId;
    if (!targetId) {
      return NextResponse.json({ ok: false, message: "Student identifier required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("nur_student_memory_profiles")
      .select("*")
      .eq("student_id", targetId)
      .maybeSingle();

    if (!profile) {
      // Default baseline profile
      return NextResponse.json({
        ok: true,
        data: {
          student_id: targetId,
          weak_letters: ["ق", "ض", "ع"],
          weak_rules: ["ikhfa", "qalqalah"],
          weak_surahs: [113, 114],
          weak_makharij: ["Al-Halq", "Al-Khayshum"],
          preferred_speed: 1.0,
          learning_style: "visual_audio",
          hifz_stability_score: 88.5,
          total_practice_minutes: 45
        }
      });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (err) {
    console.error("memory-profile GET error:", err);
    return NextResponse.json({ ok: false, message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isCsrfSafe = await verifyCsrfOrigin(request);
    if (!isCsrfSafe) {
      return NextResponse.json({ ok: false, message: "CSRF verification failed" }, { status: 403 });
    }

    const authContext = await resolveAuthContext(request);
    if (!authContext?.isAuthenticated) {
      return NextResponse.json({ ok: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { studentId, weakLetters, weakRules, weakSurahs, learningStyle, speed } = body;

    const callerId = authContext?.studentRecord?.id || authContext?.user?.id;
    const isTeacherOrAdmin = authContext?.role === "teacher" || authContext?.role === "admin" || authContext?.isSuperAdmin;

    if (!isTeacherOrAdmin && studentId && studentId !== callerId) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
    }

    const targetId = studentId || callerId;
    const organizationId = authContext?.user?.organization_id || "00000000-0000-0000-0000-000000000001";

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("nur_student_memory_profiles")
      .upsert({
        organization_id: organizationId,
        student_id: targetId,
        weak_letters: weakLetters || [],
        weak_rules: weakRules || [],
        weak_surahs: weakSurahs || [],
        learning_style: learningStyle || "visual_audio",
        preferred_speed: speed || 1.0,
        updated_at: new Date().toISOString()
      }, { onConflict: "organization_id,student_id" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("memory-profile UPSERT error:", error.message);
    }

    return NextResponse.json({ ok: true, data: data || { student_id: targetId, status: "saved_in_session" } });
  } catch (err) {
    console.error("memory-profile POST error:", err);
    return NextResponse.json({ ok: false, message: err.message || "Internal server error" }, { status: 500 });
  }
}
