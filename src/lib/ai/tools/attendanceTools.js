import { createSupabaseAdminClient } from "../../supabase-admin";

/**
 * 🟡 CONTROLLED WRITE: Mark student attendance with compound key idempotency.
 */
export async function markClassAttendance(args, context) {
  const { userId, role, branchId, teacherAssignedClasses, isSuperAdmin } = context.scope;
  const studentId = args?.studentId || args?.student_id;
  const status = (args?.status || "present").toLowerCase();
  const date = args?.date || new Date().toISOString().slice(0, 10);
  const notes = args?.notes || "Marked via AI Assistant";

  if (!studentId) {
    return { ok: false, message: "Please provide a valid Student ID." };
  }

  const supabase = createSupabaseAdminClient();

  // 1. Fetch student to verify branch and class scope
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name, name_bn, roll_number, branch_id, class_id, class_name")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return { ok: false, message: `Student #${studentId} not found.` };
  }

  // 2. Validate Branch Scope
  if (!isSuperAdmin && branchId && String(student.branch_id) !== String(branchId)) {
    return { ok: false, message: "Unauthorized: Cannot mark attendance for students outside your branch." };
  }

  // 3. Validate Teacher Scope (if teacher)
  if (role === "teacher" && Array.isArray(teacherAssignedClasses) && teacherAssignedClasses.length > 0) {
    const isAssigned = teacherAssignedClasses.some((batch) => {
      if (typeof batch === "string") return batch === student.class_name || batch === String(student.class_id);
      return batch?.class_name === student.class_name || String(batch?.class_id) === String(student.class_id);
    });

    if (!isAssigned && !isSuperAdmin) {
      return {
        ok: false,
        message: `Teacher scope restriction: Student ${student.name_bn || student.name} is in class '${student.class_name}', which is not in your assigned teaching batches.`,
      };
    }
  }

  // 4. Idempotent Write to attendances table
  const attendancePayload = {
    student_id: student.id,
    date,
    status: ["present", "absent", "late", "leave"].includes(status) ? status : "present",
    notes,
    marked_by: userId || "AI_ASSISTANT",
  };

  // Upsert or insert check
  const { data: existing } = await supabase
    .from("attendances")
    .select("id, status")
    .eq("student_id", student.id)
    .eq("date", date)
    .maybeSingle();

  let result;
  if (existing) {
    const { data: updated, error: updateErr } = await supabase
      .from("attendances")
      .update({ status: attendancePayload.status, notes, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (updateErr) return { ok: false, message: updateErr.message };
    result = { action: "updated", record: updated };
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("attendances")
      .insert(attendancePayload)
      .select()
      .single();
    if (insertErr) return { ok: false, message: insertErr.message };
    result = { action: "inserted", record: inserted };
  }

  return {
    ok: true,
    message: `Attendance marked successfully for ${student.name_bn || student.name} (Roll: ${student.roll_number}, Class: ${student.class_name}) on ${date} as '${status.toUpperCase()}'.`,
    details: {
      student_name: student.name_bn || student.name,
      roll_number: student.roll_number,
      class_name: student.class_name,
      date,
      status,
      action: result.action,
    },
  };
}

/**
 * 🟡 CONTROLLED WRITE: Draft a school announcement / notice.
 */
export async function draftNotice(args, context) {
  const { userId, branchId, isSuperAdmin } = context.scope;
  const title = args?.title || "Important Notice";
  const content = args?.content || "";
  const category = args?.category || "general";

  if (!content) {
    return { ok: false, message: "Notice content cannot be empty." };
  }

  const supabase = createSupabaseAdminClient();
  const noticePayload = {
    title,
    content,
    category,
    branch_id: isSuperAdmin ? (args?.branchId || null) : branchId,
    published: false, // Draft by default for safety
    created_at: new Date().toISOString(),
    author_id: userId,
  };

  const { data, error } = await supabase.from("notices").insert(noticePayload).select().single();
  if (error) {
    return { ok: false, message: `Failed to save notice draft: ${error.message}` };
  }

  return {
    ok: true,
    message: `Notice titled "${title}" has been saved as a draft for review and publishing.`,
    noticeId: data.id,
  };
}
