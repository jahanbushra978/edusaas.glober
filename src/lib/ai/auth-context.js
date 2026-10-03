import { cookies } from "next/headers";
import { verifySessionToken } from "../auth-session";
import { AUTH_COOKIE_NAME } from "../auth-identity";
import { createSupabaseAdminClient } from "../supabase-admin";
import { isAdminUser } from "../permissions";

/**
 * Resolves the authoritative real-time identity & permissions of the caller.
 * Never trusts role, branch_id, or permissions sent by the client.
 */
export async function resolveAuthContext(request) {
  let token = null;

  // 1. Try reading from Request cookies
  try {
    const cookieStore = await cookies();
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  } catch {
    // In edge cases or standalone calls
  }

  // 2. Fallback to Authorization Header
  if (!token && request) {
    const authHeader = request.headers?.get?.("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      role: "guest",
      scope: { branchId: null, classIds: [], isSuperAdmin: false },
      allowedTools: [],
    };
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return {
      isAuthenticated: false,
      user: null,
      role: "guest",
      scope: { branchId: null, classIds: [], isSuperAdmin: false },
      allowedTools: [],
    };
  }

  const supabase = createSupabaseAdminClient();
  const userId = session.id || session.profileId || session.authUserId;
  const userRole = session.role || "student";
  const branchId = session.branch_id ? String(session.branch_id) : null;

  let freshUser = { ...session };
  let teacherAssignedClasses = [];
  let studentRecord = null;

  // Refresh user information from the specific entity table
  try {
    if (userRole === "teacher") {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id, name, name_bn, branch_id, assigned_batches, status, phone, email")
        .or(`id.eq.${userId},phone.eq.${session.loginId || ''}`)
        .maybeSingle();

      if (teacher) {
        freshUser = { ...freshUser, ...teacher };
        if (teacher.assigned_batches) {
          try {
            teacherAssignedClasses = Array.isArray(teacher.assigned_batches)
              ? teacher.assigned_batches
              : JSON.parse(teacher.assigned_batches);
          } catch {
            teacherAssignedClasses = [];
          }
        }
      }
    } else if (userRole === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("id, name, name_bn, roll_number, branch_id, class_id, class_name, branch_name, status, phone, custom_fields")
        .or(`id.eq.${userId},roll_number.eq.${session.loginId || ''}`)
        .maybeSingle();

      if (student) {
        studentRecord = student;
        freshUser = { ...freshUser, ...student };
      }
    }
  } catch (err) {
    console.warn("AI Auth Context refresh warning:", err?.message);
  }

  const isSuper = isAdminUser(freshUser);

  // Compute allowed tools based on 4-Tier Risk Security model in agenAi.md
  const allowedTools = [];

  // Low risk read tools
  if (userRole === "student") {
    allowedTools.push("get_my_profile", "get_my_attendance", "get_my_result", "get_my_due_fees");
  }

  if (userRole === "teacher") {
    allowedTools.push(
      "get_my_profile",
      "search_students",
      "generate_academic_summary",
      "mark_class_attendance",
      "draft_notice"
    );
  }

  if (userRole === "admin" || userRole === "branch_admin" || userRole === "super_admin" || isSuper) {
    allowedTools.push(
      "get_my_profile",
      "search_students",
      "generate_academic_summary",
      "mark_class_attendance",
      "draft_notice",
      "collect_student_fee",
      "reverse_payment_ledger",
      "request_student_deactivation"
    );
  }

  return {
    isAuthenticated: true,
    user: freshUser,
    role: userRole,
    studentRecord,
    isSuperAdmin: isSuper,
    scope: {
      userId,
      role: userRole,
      branchId: isSuper ? null : branchId,
      branchName: freshUser.branch_name || null,
      teacherAssignedClasses,
      studentId: studentRecord?.id || (userRole === "student" ? userId : null),
      allowedFeatures: freshUser.allowed_features || [],
    },
    allowedTools,
  };
}
