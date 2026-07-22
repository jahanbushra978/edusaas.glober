import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session || (session.role !== "teacher" && session.role !== "admin" && session.role !== "branch_admin")) {
      return NextResponse.json({ ok: false, students: [] }, { status: 200 });
    }

    const adminClient = createSupabaseAdminClient();

    if (session.role === "admin" || session.role === "branch_admin") {
      const { data } = await adminClient
        .from("students")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(2000);
      return NextResponse.json({ ok: true, students: data || [] });
    }

    // Resolve teacher record flexibly by profileId, loginId, or username
    let teacher = null;
    if (session.profileId) {
      const { data } = await adminClient
        .from("teachers")
        .select("id, teacher_id, assigned_batches, branch_id, full_name_en")
        .eq("id", Number(session.profileId))
        .maybeSingle();
      teacher = data;
    }

    if (!teacher && (session.loginId || session.username)) {
      const loginIdVal = session.loginId || session.username;
      const { data } = await adminClient
        .from("teachers")
        .select("id, teacher_id, assigned_batches, branch_id, full_name_en")
        .or(`teacher_id.eq.${loginIdVal},employee_code.eq.${loginIdVal}`)
        .maybeSingle();
      teacher = data;
    }

    const teacherDbId = teacher?.id ? String(teacher.id) : (session.profileId ? String(session.profileId) : null);
    const teacherCode = teacher?.teacher_id ? String(teacher.teacher_id) : (session.loginId ? String(session.loginId) : null);
    const assignedBatchesStr = teacher?.assigned_batches || "";

    // 1. Fetch students assigned directly to this teacher (by integer ID or string teacher_id)
    const { data: directStudents } = await adminClient
      .from("students")
      .select("*")
      .order("created_date", { ascending: false })
      .limit(2000);

    const allBranchStudents = directStudents || [];

    // Filter assigned students in JS for max reliability
    let result = allBranchStudents.filter((s) => {
      const studentTeacherId = s.assigned_teacher_id !== null && s.assigned_teacher_id !== undefined ? String(s.assigned_teacher_id) : "";
      const matchesId = teacherDbId && studentTeacherId === teacherDbId;
      const matchesCode = teacherCode && studentTeacherId.toLowerCase() === teacherCode.toLowerCase();
      return matchesId || matchesCode;
    });

    // 2. If teacher has assigned batches, include batch students
    if (assignedBatchesStr.trim()) {
      const batches = assignedBatchesStr.split(",").map((b) => b.trim().toLowerCase());
      const existingIds = new Set(result.map((r) => r.id));

      if (batches.includes("all classes")) {
        result = allBranchStudents;
      } else {
        const batchStudents = allBranchStudents.filter((s) => {
          if (!s.batch) return false;
          const studentBatch = s.batch.toLowerCase();
          return batches.some((b) => studentBatch.includes(b));
        });
        result = [...result, ...batchStudents.filter((s) => !existingIds.has(s.id))];
      }
    }

    // 3. Fallback: if still empty and teacher belongs to a branch, return branch students
    if (result.length === 0 && teacher?.branch_id) {
      result = allBranchStudents.filter((s) => String(s.branch_id) === String(teacher.branch_id));
    }

    return NextResponse.json({ ok: true, students: result });
  } catch (err) {
    console.error("[teacher/students] Error:", err);
    return NextResponse.json({ ok: false, students: [] }, { status: 500 });
  }
}
