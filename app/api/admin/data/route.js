import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ADMIN_ROLES = ["admin", "branch_admin", "boarding_manager", "superadmin", "super_admin"];

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || !ALLOWED_ADMIN_ROLES.includes(session.role)) return null;
  return session;
}

const ENTITY_CONFIG = {
  fees: {
    table: "student_fees",
    label: "Student Fees",
    fields: "id,student_id,month,paid_amount,due_amount,status,created_date",
    hasBranch: false,
    hasPeriod: true,
    hasOrg: true,
  },
  hadiya: {
    table: "hadiya",
    label: "Hadiya",
    fields: "id,student_id,month,amount,created_date",
    hasBranch: false,
    hasPeriod: true,
    hasOrg: true,
  },
  teacher_hadiya: {
    table: "teacher_hadiya",
    label: "Teacher Hadiya",
    fields: "id,teacher_id,month,amount,created_date",
    hasBranch: false,
    hasPeriod: true,
    hasOrg: true,
  },
  expenses: {
    table: "expenses",
    label: "Expenses",
    fields: "id,month,date,amount,category,description",
    hasBranch: false,
    hasPeriod: true,
    hasOrg: true,
  },
  boarding_expenses: {
    table: "boarding_expenses",
    label: "Boarding Expenses",
    fields: "id,date,amount,category,description",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  attendance: {
    table: "attendances",
    label: "Student Attendance",
    fields: "id,student_id,date,status",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  teacher_attendance: {
    table: "teacher_attendance",
    label: "Teacher Attendance",
    fields: "id,teacher_id,date,status",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  exam_results: {
    table: "exam_results",
    label: "Exam Results",
    fields: "id,student_id,exam_id,marks,grade",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  notices: {
    table: "notices",
    label: "Notices",
    fields: "id,title,type,is_active,created_date",
    hasBranch: true,
    hasPeriod: false,
    hasOrg: true,
  },
  gallery: {
    table: "gallery",
    label: "Gallery",
    fields: "id,title,category,created_date",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  gallery_items: {
    table: "gallery_items",
    label: "Gallery Items",
    fields: "id,gallery_id,image_url,created_date",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: false,
  },
  videos: {
    table: "videos",
    label: "Video Gallery",
    fields: "id,title,category,created_date",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
  },
  contact_messages: {
    table: "contact_messages",
    label: "Contact Messages",
    fields: "id,name,email,created_date",
    hasBranch: false,
    hasPeriod: false,
    hasOrg: true,
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

  const userRole = session.role;
  const userBranchId = session.branch_id ? Number(session.branch_id) : null;
  const orgId = session.organizationId || session.organization_id;

  // Zero-Trust Tenant Resolution: Fail-closed if organization cannot be resolved
  if (!orgId) {
    return NextResponse.json({
      ok: false,
      message: "Forbidden: No organization scope associated with this session.",
    }, { status: 403 });
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

  // ── Role Authorization Guard ──
  if (userRole === "boarding_manager") {
    if (entity !== "boarding_expenses") {
      return NextResponse.json({
        ok: false,
        message: "Forbidden: Boarding manager is only authorized to manage boarding expenses.",
      }, { status: 403 });
    }
  } else if (userRole === "branch_admin") {
    const branchAllowedEntities = [
      "fees",
      "hadiya",
      "teacher_hadiya",
      "expenses",
      "attendance",
      "teacher_attendance",
      "exam_results",
      "notices",
    ];
    if (!branchAllowedEntities.includes(entity)) {
      return NextResponse.json({
        ok: false,
        message: "Forbidden: Branch admin cannot manage institution-wide media or global assets.",
      }, { status: 403 });
    }
  }

  // ── Branch Scoping Guard ──
  let effectiveBranchId = branch_id;
  if (userRole === "branch_admin") {
    if (!userBranchId) {
      return NextResponse.json({
        ok: false,
        message: "Forbidden: Branch admin has no assigned branch ID.",
      }, { status: 403 });
    }
    effectiveBranchId = userBranchId;
  }

  const config = ENTITY_CONFIG[entity];
  const { table, fields, label, hasBranch, hasPeriod, hasOrg } = config;

  // ── Multi-Tenant Isolated List Query ──
  let listQuery = supabaseAdmin.from(table).select(fields);

  if (hasOrg !== false) {
    listQuery = listQuery.eq("organization_id", orgId);
  }

  if (hasBranch && effectiveBranchId && effectiveBranchId !== "all") {
    listQuery = listQuery.eq("branch_id", Number(effectiveBranchId));
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
      let delQuery = supabaseAdmin
        .from(table)
        .delete()
        .in("id", batch);

      // Defense-in-depth: Enforce organization and branch isolation on the delete operation itself
      if (hasOrg !== false) {
        delQuery = delQuery.eq("organization_id", orgId);
      }
      if (hasBranch && effectiveBranchId && effectiveBranchId !== "all") {
        delQuery = delQuery.eq("branch_id", Number(effectiveBranchId));
      }

      const { error: delErr } = await delQuery;

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
      branch_id: effectiveBranchId || "all",
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
