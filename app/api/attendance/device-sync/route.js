import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ⚠️ DEPRECATED: This endpoint uses legacy tables (attendances, teacher_attendance).
// Use /api/attendance/device for new biometric integrations.

const API_KEY_HEADER = "x-api-key";

function verifyApiKey(request) {
  const apiKey = request.headers.get(API_KEY_HEADER);
  if (!apiKey) return false;
  const expectedKey = process.env.BIOMETRIC_API_KEY;
  if (!expectedKey) return false;
  if (apiKey.trim().length !== expectedKey.length) return false;
  let result = 0;
  for (let i = 0; i < apiKey.trim().length; i++) {
    result |= apiKey.trim().charCodeAt(i) ^ expectedKey.charCodeAt(i);
  }
  return result === 0;
}

function sanitizeErrorMessage(msg) {
  if (!msg) return "";
  return String(msg).replace(/[<>"'&]/g, "");
}

export async function POST(request) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON body provided." },
        { status: 400 },
      );
    }

    const punches = Array.isArray(body) ? body : [body];

    if (punches.length > 100) {
      return NextResponse.json({ ok: false, message: "Batch too large (max 100)" }, { status: 413 });
    }

    let processed = 0;
    let savedStudents = 0;
    let savedTeachers = 0;
    let skipped = 0;
    let errors = [];

    for (const punch of punches) {
      const { user_id, timestamp, status = "present" } = punch;

      if (!user_id) {
        skipped++;
        continue;
      }

      processed++;
      const normalizedUserId = String(user_id).trim();
      const punchTime = timestamp || new Date().toISOString();
      const punchDate = punchTime.split("T")[0];

      const { data: student, error: studentErr } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("roll_number", normalizedUserId)
        .eq("status", "active")
        .maybeSingle();

      if (studentErr) {
        errors.push(sanitizeErrorMessage(studentErr.message));
      }

      if (student) {
        const { data: existingAttendance } = await supabaseAdmin
          .from("attendances")
          .select("id")
          .eq("student_id", student.id)
          .eq("date", punchDate)
          .maybeSingle();

        if (!existingAttendance) {
          const { error: insertErr } = await supabaseAdmin
            .from("attendances")
            .insert({
              student_id: student.id,
              date: punchDate,
              status: status === "present" ? "present" : status,
              marked_by: "Fingerprint Device",
              notes: `Auto-synced via ZKTeco Device.`,
            });

          if (insertErr) {
            errors.push(sanitizeErrorMessage(insertErr.message));
            skipped++;
          } else {
            savedStudents++;
          }
        } else {
          skipped++;
        }
      } else {
        const { data: teacher, error: teacherErr } = await supabaseAdmin
          .from("teachers")
          .select("id")
          .eq("teacher_id", normalizedUserId)
          .maybeSingle();

        if (teacherErr) {
          errors.push(sanitizeErrorMessage(teacherErr.message));
        }

        if (teacher) {
          const { data: existingTeacherAttendance } = await supabaseAdmin
            .from("teacher_attendance")
            .select("id")
            .eq("teacher_id", teacher.id)
            .eq("date", punchDate)
            .maybeSingle();

          if (!existingTeacherAttendance) {
            const { error: insertErr } = await supabaseAdmin
              .from("teacher_attendance")
              .insert({
                teacher_id: teacher.id,
                date: punchDate,
                status: status === "present" ? "present" : status,
                marked_by: "Fingerprint Device",
                notes: `Auto-synced via ZKTeco Device.`,
              });

            if (insertErr) {
              errors.push(sanitizeErrorMessage(insertErr.message));
              skipped++;
            } else {
              savedTeachers++;
            }
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        total_received: punches.length,
        processed,
        saved_students: savedStudents,
        saved_teachers: savedTeachers,
        skipped,
      },
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Fingerprint device sync failed unexpectedly.",
      },
      { status: 500 },
    );
  }
}
