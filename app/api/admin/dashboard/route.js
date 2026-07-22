import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAccountingPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthBounds(periodKey) {
  const [y, m] = periodKey.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const endDate = new Date(y, m, 0);
  return {
    start,
    end: `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`,
    periodKey,
  };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateMonthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// ── Fallback helpers (REST API parallel queries) ──

function isMissingTable(error) {
  return error?.code === "PGRST205" || (error?.message && error.message.includes("Could not find the table"));
}

async function safeQuery(supabase, table, config) {
  const { columns, filter } = config;
  try {
    let q = supabase.from(table).select(columns.join(","));
    if (filter) q = filter(q);
    const r = await q;
    if (isMissingTable(r.error)) return { data: [], ok: true };
    if (r.error) {
      console.error(`[Dashboard] Query error on ${table}:`, r.error);
      return { data: [], ok: false };
    }
    return { data: r.data || [], ok: true };
  } catch (e) {
    console.error(`[Dashboard] Query exception on ${table}:`, e);
    return { data: [], ok: false };
  }
}

function sum(arr, key) {
  return arr.reduce((a, b) => a + Number(b[key] || 0), 0);
}

function countBy(arr, key, value) {
  return arr.filter((r) => r[key] === value).length;
}

function countIn(arr, key, values) {
  const s = new Set(values);
  return arr.filter((r) => s.has(r[key])).length;
}

function distinctCount(arr, key) {
  return new Set(arr.map((r) => r[key])).size;
}

async function fallbackParallelQueries(supabase, periodKey, period, today, thirtyDaysAgo, sixMonthsAgo, userBranchId, isSuperAdmin, isBoardingManager, branchStudentIds, branchTeacherIds) {
  const feeIds =
    branchStudentIds && branchStudentIds.length > 0
      ? branchStudentIds
      : branchStudentIds
        ? [-1]
        : null;
  const tchIds =
    branchTeacherIds && branchTeacherIds.length > 0
      ? branchTeacherIds
      : branchTeacherIds
        ? [-1]
        : null;

  const bf = (q) => (userBranchId ? q.eq("branch_id", userBranchId) : q);

  const [
    studentsRaw, teachersRaw, feesRaw, expensesRaw,
    teacherPaymentsRaw, salaryProfilesRaw,
    attendanceTodayRaw, teacherAttendanceTodayRaw,
    attendance30dRaw, topReadersRaw, branchesRaw,
    contactMsgsRaw, pendingAdmissionsRaw,
    readingLogsRaw, boardingRaw,
    recentMsgsRaw, recentAdmsRaw, eventsRaw,
  ] = await Promise.all([
    safeQuery(supabase, "students", { columns: ["id", "status"], filter: bf }),
    safeQuery(supabase, "teachers", { columns: ["id", "status"], filter: bf }),
    safeQuery(supabase, "student_fees", {
      columns: ["paid_amount", "due_amount", "status", "student_id"],
      filter: (q) => {
        q = q.eq("accounting_period", periodKey).not("is_archived", "is", true);
        if (feeIds) q = q.in("student_id", feeIds);
        return q;
      },
    }),
    safeQuery(supabase, "expenses", {
      columns: ["amount"],
      filter: (q) => {
        q = q.eq("month", periodKey).not("is_archived", "is", true);
        if (userBranchId) q = q.eq("branch_id", userBranchId);
        return q;
      },
    }),
    safeQuery(supabase, "teacher_payments", {
      columns: ["paid_amount"],
      filter: (q) => q.eq("accounting_period", periodKey).not("is_archived", "is", true),
    }),
    safeQuery(supabase, "teacher_salary_profiles", {
      columns: ["amount"],
      filter: (q) => q.eq("status", "active"),
    }),
    safeQuery(supabase, "attendances", {
      columns: ["status", "student_id"],
      filter: (q) => {
        q = q.eq("date", today);
        if (userBranchId) q = q.eq("branch_id", userBranchId);
        return q;
      },
    }),
    safeQuery(supabase, "teacher_attendance", {
      columns: ["status", "teacher_id"],
      filter: (q) => {
        q = q.eq("date", today);
        if (tchIds) q = q.in("teacher_id", tchIds);
        return q;
      },
    }),
    safeQuery(supabase, "attendances", {
      columns: ["student_id", "status", "date"],
      filter: (q) => {
        q = q.gte("date", thirtyDaysAgo).lte("date", today);
        if (userBranchId) q = q.eq("branch_id", userBranchId);
        return q;
      },
    }),
    safeQuery(supabase, "students", {
      columns: ["id", "full_name_en", "photo_url", "total_pages_read"],
      filter: (q) => {
        q = q.order("total_pages_read", { ascending: false, nullsFirst: false }).limit(5);
        if (userBranchId) q = q.eq("branch_id", userBranchId);
        return q;
      },
    }),
    safeQuery(supabase, "branches", {
      columns: ["id", "name_bn", "name_en", "branch_name"],
      filter: (q) => {
        q = q.order("name_en");
        if (userBranchId) q = q.eq("id", userBranchId);
        return q;
      },
    }),
    safeQuery(supabase, "contact_messages", {
      columns: ["id"],
      filter: (q) => q.not("is_read", "is", true),
    }),
    safeQuery(supabase, "admission_applications", {
      columns: ["id"],
      filter: (q) => q.eq("status", "pending"),
    }),
    safeQuery(supabase, "reading_logs", {
      columns: ["date", "pages_read"],
      filter: (q) => q.gte("date", sixMonthsAgo),
    }),
    safeQuery(supabase, "boarding_daily_reports", {
      columns: ["date", "grand_total", "total_saved_amount", "status"],
      filter: (q) => { if (userBranchId) q = q.eq("branch_id", userBranchId); return q; },
    }),
    isSuperAdmin
      ? safeQuery(supabase, "contact_messages", {
          columns: ["id", "name", "subject", "message", "created_date", "is_read"],
          filter: (q) => q.order("created_date", { ascending: false }).limit(8),
        })
      : Promise.resolve({ data: [], ok: true }),
    isSuperAdmin
      ? safeQuery(supabase, "admission_applications", {
          columns: ["id", "full_name_bn", "full_name_en", "desired_session", "created_date", "status"],
          filter: (q) => q.order("created_date", { ascending: false }).limit(8),
        })
      : Promise.resolve({ data: [], ok: true }),
    isSuperAdmin
      ? safeQuery(supabase, "events", {
          columns: ["id", "title", "date", "time"],
          filter: (q) => q.gte("date", today).order("date", { ascending: true }).limit(3),
        })
      : Promise.resolve({ data: [], ok: true }),
  ]);

  const stData = studentsRaw.data || [];
  const tchData = teachersRaw.data || [];
  const feeData = feesRaw.data || [];
  const attTodayData = attendanceTodayRaw.data || [];
  const tAttData = teacherAttendanceTodayRaw.data || [];
  const att30dData = attendance30dRaw.data || [];

  let lowAttendanceCount = 0;
  if (att30dData.length > 0) {
    const grouped = {};
    for (const rec of att30dData) {
      if (!grouped[rec.student_id]) grouped[rec.student_id] = { total: 0, present: 0 };
      grouped[rec.student_id].total++;
      if (rec.status === "present") grouped[rec.student_id].present++;
    }
    lowAttendanceCount = Object.values(grouped).filter(
      (g) => g.total >= 5 && g.present / g.total < 0.75,
    ).length;
  }

  const readingData = readingLogsRaw.data || [];
  let readingChart = [];
  if (readingData.length > 0) {
    const monthly = {};
    for (const r of readingData) {
      const mk = r.date ? r.date.substring(0, 7) : null;
      if (mk) monthly[mk] = (monthly[mk] || 0) + Number(r.pages_read || 0);
    }
    readingChart = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, pages]) => ({ month, pages }));
  }

  let boarding = { todayExpense: 0, monthlyExpense: 0, monthlySaved: 0, pendingApprovals: 0 };
  if (isSuperAdmin || isBoardingManager) {
    for (const rec of boardingRaw.data || []) {
      if (rec.date === today) boarding.todayExpense += Number(rec.grand_total || 0);
      if (rec.date >= period.start && rec.date <= period.end) {
        boarding.monthlyExpense += Number(rec.grand_total || 0);
        boarding.monthlySaved += Number(rec.total_saved_amount || 0);
      }
      if (rec.status === "Pending") boarding.pendingApprovals++;
    }
  }

  const paidSalary = sum(teacherPaymentsRaw.data || [], "paid_amount");
  const rawExpense = sum(expensesRaw.data || [], "amount");

  return {
    students: { total: stData.length, active: countBy(stData, "status", "active") },
    teachers: { total: tchData.length, active: countBy(tchData, "status", "active") },
    income: { monthly: sum(feeData, "paid_amount") },
    expense: { monthly: rawExpense + paidSalary, rawExpense },
    attendance: {
      today: {
        present: countBy(attTodayData, "status", "present"),
        absent: countBy(attTodayData, "status", "absent"),
        total: attTodayData.length,
      },
      teacherToday: {
        present: countIn(tAttData, "status", ["present", "late"]),
        absent: countBy(tAttData, "status", "absent"),
        total: tAttData.length,
      },
      lowAttendanceStudents: lowAttendanceCount,
    },
    fees: {
      totalDue: sum(feeData, "due_amount"),
      overdueCount: countIn(feeData, "status", ["due", "partial", "overdue"]),
      studentsPaid: distinctCount(feeData.filter(r => r.status === "paid" || r.status === "partial"), "student_id"),
    },
    teacherSalary: {
      expectedMonthly: sum(salaryProfilesRaw.data || [], "amount"),
      paidThisMonth: paidSalary,
      remaining: sum(salaryProfilesRaw.data || [], "amount") - paidSalary,
    },
    boarding,
    topReaders: (topReadersRaw.data || []).map(r => ({
      id: r.id, full_name_en: r.full_name_en, photo_url: r.photo_url,
      total_pages_read: Number(r.total_pages_read || 0),
    })),
    readingChart,
    notifications: {
      unreadMessages: (contactMsgsRaw.data || []).length,
      pendingAdmissions: (pendingAdmissionsRaw.data || []).length,
      recentMessages: recentMsgsRaw.ok ? recentMsgsRaw.data || [] : [],
      recentAdmissions: recentAdmsRaw.ok ? recentAdmsRaw.data || [] : [],
    },
    events: eventsRaw.ok ? eventsRaw.data || [] : [],
    branches: (branchesRaw.data || []).map(r => ({
      id: r.id, name_bn: r.name_bn, name_en: r.name_en, branch_name: r.branch_name,
    })),
  };
}

export async function GET() {
  const startTs = Date.now();

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session || !["admin", "branch_admin", "boarding_manager"].includes(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, private" } });
  }

  const supabase = createSupabaseAdminClient();
  const userBranchId = session.branch_id ? Number(session.branch_id) : null;
  const isSuperAdmin = session.role === "admin";
  const isBoardingManager = session.role === "boarding_manager";

  // ── Setup: period + branch IDs ──
  let periodKey = getAccountingPeriod();
  try {
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "current_accounting_period")
      .maybeSingle();
    if (setting?.value) periodKey = setting.value;
  } catch (e) {
    console.warn("[Dashboard] Could not fetch app_settings:", e.message);
  }

  const period = getMonthBounds(periodKey);
  const today = todayStr();
  const thirtyDaysAgo = getDateDaysAgo(30);
  const sixMonthsAgo = getDateMonthsAgo(6);

  let branchStudentIds = null;
  let branchTeacherIds = null;
  if (userBranchId) {
    const [stuRes, tchRes] = await Promise.all([
      supabase.from("students").select("id").eq("branch_id", userBranchId),
      supabase.from("teachers").select("id").eq("branch_id", userBranchId),
    ]);
    branchStudentIds = (stuRes.data || []).map((s) => s.id);
    branchTeacherIds = (tchRes.data || []).map((t) => t.id);
  }

  try {
    let data;

    const { data: rpcData, error: rpcErr } = await supabase.rpc("get_dashboard_data", {
      p_period_key: periodKey,
      p_today: today,
      p_thirty_days_ago: thirtyDaysAgo,
      p_six_months_ago: sixMonthsAgo,
      p_branch_id: userBranchId,
      p_is_super_admin: isSuperAdmin,
      p_is_boarding_manager: isBoardingManager,
    });

    if (rpcData && (!rpcErr || rpcErr.code !== "PGRST202")) {
      data = rpcData;
    }

    if (!data) {
      data = await fallbackParallelQueries(
        supabase, periodKey, period, today, thirtyDaysAgo, sixMonthsAgo,
        userBranchId, isSuperAdmin, isBoardingManager,
        branchStudentIds, branchTeacherIds,
      );
    }

    const elapsed = Date.now() - startTs;

    return NextResponse.json({
      ok: true,
      period: periodKey,
      elapsed,
      ...data,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=1800', // 30 minutes cache for this specific admin
      }
    });
  } catch (error) {
    console.error("[Dashboard]", error?.message);
    return NextResponse.json(
      { ok: false, message: "Failed to load dashboard data" },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
