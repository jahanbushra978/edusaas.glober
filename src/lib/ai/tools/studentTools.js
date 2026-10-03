import { createSupabaseAdminClient } from "../../supabase-admin";

/**
 * 🟢 LOW RISK: Reads the caller's own student profile.
 */
export async function getMyProfile(args, context) {
  const { studentId, userId } = context.scope;
  const targetId = studentId || userId;

  if (!targetId) {
    return { ok: false, message: "No active student profile linked to this session." };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, name_bn, roll_number, class_name, branch_name, status, admission_date, phone")
    .eq("id", targetId)
    .single();

  if (error || !data) {
    return { ok: false, message: "Could not retrieve student profile." };
  }

  return {
    ok: true,
    profile: {
      name: data.name_bn || data.name,
      roll: data.roll_number,
      class: data.class_name,
      branch: data.branch_name,
      status: data.status,
      admissionDate: data.admission_date,
    },
  };
}

/**
 * 🟢 LOW RISK: Reads caller's own attendance summary and recent records.
 */
export async function getMyAttendance(args, context) {
  const { studentId, userId } = context.scope;
  const targetId = studentId || userId;

  if (!targetId) {
    return { ok: false, message: "No student profile linked." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: records = [], error } = await supabase
    .from("attendances")
    .select("date, status, notes")
    .eq("student_id", targetId)
    .order("date", { ascending: false })
    .limit(30);

  if (error) {
    return { ok: false, message: "Could not fetch attendance records." };
  }

  const total = records.length;
  const present = records.filter((r) => r.status === "present" || r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 100;

  return {
    ok: true,
    summary: {
      totalDaysRecorded: total,
      presentDays: present,
      absentDays: absent,
      attendancePercentage: `${attendanceRate}%`,
    },
    recentAttendance: records.slice(0, 7),
  };
}

/**
 * 🟢 LOW RISK: Reads caller's own exam results.
 */
export async function getMyResult(args, context) {
  const { studentId, userId } = context.scope;
  const targetId = studentId || userId;

  if (!targetId) {
    return { ok: false, message: "No student profile linked." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: results = [], error } = await supabase
    .from("exam_results")
    .select("exam_id, subject_id, subject_name, obtained_marks, full_marks, highest_marks, grade, gpa")
    .eq("student_id", targetId)
    .order("id", { ascending: false })
    .limit(20);

  if (error) {
    return { ok: false, message: "Could not fetch exam results." };
  }

  return {
    ok: true,
    count: results.length,
    results,
  };
}

/**
 * 🔵 SCOPED READ: Scoped student search with strict pseudonymization.
 * Never passes real names, rolls, phones, or NID to external AI.
 */
export async function searchStudents(args, context, pseudonymMap) {
  const { branchId, teacherAssignedClasses, isSuperAdmin } = context.scope;
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("students")
    .select("id, name, name_bn, roll_number, class_name, branch_name, branch_id, status")
    .eq("status", "active")
    .limit(args?.limit || 20);

  // Enforce branch isolation
  if (!isSuperAdmin && branchId) {
    query = query.eq("branch_id", branchId);
  }

  if (args?.className) {
    query = query.ilike("class_name", `%${args.className}%`);
  }

  const { data: students = [], error } = await query;
  if (error) {
    return { ok: false, message: "Search failed." };
  }

  // Transform data using Pseudonymization (STUDENT_A1, STUDENT_A2...)
  const sanitizedList = students.map((s, index) => {
    const pseudoCode = `STUDENT_A${index + 1}`;
    if (pseudonymMap) {
      pseudonymMap.set(pseudoCode, {
        id: s.id,
        name: s.name_bn || s.name,
        roll: s.roll_number,
        class: s.class_name,
        branch: s.branch_name,
      });
    }

    return {
      student_ref: pseudoCode,
      class_name: s.class_name,
      branch_name: s.branch_name,
      status: s.status,
    };
  });

  return {
    ok: true,
    totalFound: sanitizedList.length,
    students: sanitizedList,
  };
}

/**
 * 🔵 SCOPED READ: Aggregated academic summary report for a class or branch.
 */
export async function generateAcademicSummary(args, context) {
  const { branchId, isSuperAdmin } = context.scope;
  const supabase = createSupabaseAdminClient();

  const targetBranch = !isSuperAdmin && branchId ? branchId : args?.branchId;

  // Student count
  let studentCountQuery = supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active");
  if (targetBranch) studentCountQuery = studentCountQuery.eq("branch_id", targetBranch);
  const { count: studentCount } = await studentCountQuery;

  // Attendance rate
  let attQuery = supabase.from("attendances").select("status").limit(500);
  const { data: attRecords = [] } = await attQuery;
  const totalAtt = attRecords.length;
  const presentCount = attRecords.filter((a) => a.status === "present").length;
  const avgAttendance = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 95;

  return {
    ok: true,
    summary: {
      scopeBranch: targetBranch || "All Branches",
      activeStudents: studentCount || 0,
      averageAttendanceRate: `${avgAttendance}%`,
      academicStanding: avgAttendance >= 80 ? "Satisfactory" : "Needs Attention",
      generatedAt: new Date().toISOString(),
    },
  };
}
