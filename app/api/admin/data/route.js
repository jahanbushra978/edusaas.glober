import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") return null;
  return session;
}

const ENTITY_CONFIG = {
  fees: {
    table: "student_fees",
    label: "Student Fees",
    fields: "id,student_id,month,paid_amount,due_amount,status,created_date",
    hasBranch: false,
    hasPeriod: true,
  },
  hadiya: {
    table: "hadiya",
    label: "Hadiya",
    fields: "id,student_id,month,amount,created_date",
    hasBranch: false,
    hasPeriod: true,
  },
  teacher_hadiya: {
    table: "teacher_hadiya",
    label: "Teacher Hadiya",
    fields: "id,teacher_id,month,amount,created_date",
    hasBranch: false,
    hasPeriod: true,
  },
  expenses: {
    table: "expenses",
    label: "Expenses",
    fields: "id,month,date,amount,category,description",
    hasBranch: false,
    hasPeriod: true,
  },
  boarding_expenses: {
    table: "boarding_expenses",
    label: "Boarding Expenses",
    fields: "id,date,amount,category,description",
    hasBranch: false,
    hasPeriod: false,
  },
  attendance: {
    table: "attendances",
    label: "Student Attendance",
    fields: "id,student_id,date,status",
    hasBranch: false,
    hasPeriod: false,
  },
  teacher_attendance: {
    table: "teacher_attendance",
    label: "Teacher Attendance",
    fields: "id,teacher_id,date,status",
    hasBranch: false,
    hasPeriod: false,
  },
  exam_results: {
    table: "exam_results",
    label: "Exam Results",
    fields: "id,student_id,exam_id,marks,grade",
    hasBranch: false,
    hasPeriod: false,
  },
  notices: {
    table: "notices",
    label: "Notices",
    fields: "id,title,type,is_active,created_date",
    hasBranch: true,
    hasPeriod: false,
  },
  gallery: {
    table: "gallery",
    label: "Gallery",
    fields: "id,title,category,created_date",
    hasBranch: false,
    hasPeriod: false,
  },
  gallery_items: {
    table: "gallery_items",
    label: "Gallery Items",
    fields: "id,gallery_id,image_url,created_date",
    hasBranch: false,
    hasPeriod: false,
  },
  videos: {
    table: "videos",
    label: "Video Gallery",
    fields: "id,title,category,created_date",
    hasBranch: false,
    hasPeriod: false,
  },
  contact_messages: {
    table: "contact_messages",
    label: "Contact Messages",
    fields: "id,name,email,created_date",
    hasBranch: false,
    hasPeriod: false,
  },
};

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-data:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const {
    entity,
    branch_id,
    month,
    year,
    confirm_phrase,
    action = "delete",
    export_format,
  } = body;

  if (confirm_phrase !== "YES, DELETE") {
    return NextResponse.json({
      ok: false,
      message: "Confirmation phrase required. Type 'YES, DELETE' to confirm.",
    }, { status: 400 });
  }
  if (!entity || !ENTITY_CONFIG[entity]) {
    return NextResponse.json({
      ok: false,
      message: `Unknown entity "${entity}". Valid: ${Object.keys(ENTITY_CONFIG).join(", ")}`,
    }, { status: 400 });
  }

  const config = ENTITY_CONFIG[entity];
  if (!config) {
    return NextResponse.json({
      ok: false,
      message: `Unknown entity "${entity}". Valid: ${Object.keys(ENTITY_CONFIG).join(", ")}`,
    }, { status: 400 });
  }

  const { table, fields, label, hasBranch, hasPeriod } = config;

  let listQuery = supabaseAdmin.from(table).select(fields);

  if (hasBranch && branch_id && branch_id !== "all") {
    listQuery = listQuery.eq("branch_id", Number(branch_id));
  }

  if (hasPeriod && month && year) {
    const periodKey = `${year}-${String(month).padStart(2, "0")}`;
    listQuery = listQuery.eq("accounting_period", periodKey);
  } else if (month && year) {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    listQuery = listQuery.like("date", `${prefix}%`);
  }

  const { data: records, error: listErr } = await listQuery;

  if (listErr) {
    return NextResponse.json({
      ok: false,
      message: "Failed to list records",
    }, { status: 500 });
  }

  if (!records || records.length === 0) {
    return NextResponse.json({
      ok: true,
      message: `No ${label} records found matching the criteria.`,
      deleted: 0,
    });
  }

  if (action === "delete") {
    const ids = records.map((r) => r.id);
    const batchSize = 100;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const { error: delErr } = await supabaseAdmin
        .from(table)
        .delete()
        .in("id", batch);

      if (delErr) {
        return NextResponse.json({
          ok: false,
          message: "Delete failed",
          deleted,
        }, { status: 500 });
      }
      deleted += batch.length;
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully deleted ${deleted} ${label} records.`,
      deleted,
      entity,
      branch_id: branch_id || "all",
      month: month || null,
      year: year || null,
    });
  }

  return NextResponse.json({
    ok: true,
    records: records || [],
    count: records?.length || 0,
  });
}
