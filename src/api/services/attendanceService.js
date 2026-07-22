import { supabaseAdmin } from "@/lib/supabase-admin-client";

export function fetchTeacherAttendanceByDateRange(startDate, endDate, maxRecords = 2000) {
  return supabaseAdmin
    .from("teacher_attendance")
    .select("id, teacher_id, date, status, marked_by, notes, created_at")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .limit(maxRecords)
    .then(({ data, error }) => {
      if (error) throw error;
      return data || [];
    });
}

export function fetchStudentAttendanceByDateRange(startDate, endDate, maxRecords = 2000) {
  return supabaseAdmin
    .from("attendances")
    .select("id, student_id, date, status, marked_by, notes, created_at")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .limit(maxRecords)
    .then(({ data, error }) => {
      if (error) throw error;
      return data || [];
    });
}
