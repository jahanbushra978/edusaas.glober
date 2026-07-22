import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";
import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";
import pg from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { Pool } = pg;

function getAdminDb() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!url) return null;
  return new Pool({ connectionString: url, max: 1 });
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") return null;
  return session;
}

function getNextPeriod(currentKey) {
  const [yearStr, monthStr] = currentKey.split("-");
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month += 1;
  if (month > 12) { month = 1; year += 1; }
  return { year: String(year), month: String(month).padStart(2, "0"), key: `${year}-${String(month).padStart(2, "0")}` };
}

const PERIOD_TABLES = [
  { table: "student_fees", filterField: "accounting_period", type: "period" },
  { table: "fees", filterField: "accounting_period", type: "period" },
  { table: "hadiya", filterField: "accounting_period", type: "period" },
  { table: "expenses", filterField: "accounting_period", type: "period" },
  { table: "teacher_payments", filterField: "accounting_period", type: "period" },
  { table: "teacher_hadiya", filterField: "accounting_period", type: "period" },
  { table: "attendances", filterField: "date", type: "date" },
  { table: "teacher_attendance", filterField: "date", type: "date" },
  { table: "daily_lessons", filterField: "date", type: "date" },
  { table: "reading_logs", filterField: "date", type: "date" },
  { table: "boarding_daily_reports", filterField: "date", type: "date" },
  { table: "boarding_expenses", filterField: "date", type: "date" },
];

function getDateUpperBound(periodKey) {
  const [y, m] = periodKey.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${periodKey}-${String(lastDay).padStart(2, "0")}`;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "current_accounting_period")
    .maybeSingle();

  const currentKey = setting?.value || "2026-01";
  const previousPeriods = [];

  for (const entity of PERIOD_TABLES) {
    if (entity.type === "period") {
      const { count, error } = await supabaseAdmin
        .from(entity.table)
        .select("*", { count: "exact", head: true })
        .eq(entity.filterField, currentKey);
      if (!error && count > 0) {
        previousPeriods.push({ table: entity.table, recordCount: count });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    currentPeriod: currentKey,
    nextPeriod: getNextPeriod(currentKey),
    previousPeriodData: previousPeriods,
  });
}

export async function POST(request) {
  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`admin-period:${getClientIp(request)}`, { windowMs: 60000, max: 60 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const body = await request.json().catch(() => ({}));
  const targetPeriod = body?.period || null;
  const skipArchive = body?.skip_archive === true;

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "current_accounting_period")
    .maybeSingle();

  const currentKey = setting?.value || "2026-01";
  const nextPeriod = targetPeriod || getNextPeriod(currentKey).key;

  if (!skipArchive && nextPeriod <= currentKey) {
    return NextResponse.json({
      ok: false,
      message: `New period "${nextPeriod}" must be after current period "${currentKey}".`,
    }, { status: 400 });
  }

  const errors = [];

  if (!skipArchive) {
    // Ensure is_archived column exists on all 12 tables before archiving
    const pool = getAdminDb();
    if (pool) {
      const client = await pool.connect();
      try {
        const sqlTables = PERIOD_TABLES.map(e => e.table);
        // Run migration for all tables (idempotent — IF NOT EXISTS)
        for (const tbl of sqlTables) {
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;`);
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS archived_at timestamptz;`);
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS archive_reason text;`);
        }
        // Also ensure accounting_period columns on financial tables
        const periodTables = PERIOD_TABLES.filter(e => e.type === "period").map(e => e.table);
        for (const tbl of periodTables) {
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS accounting_year text;`);
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS accounting_month text;`);
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS accounting_period text;`);
        }
        // Ensure record_date on daily tables
        const dailyTables = PERIOD_TABLES.filter(e => e.type === "date").map(e => e.table);
        for (const tbl of dailyTables) {
          await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN IF NOT EXISTS record_date date;`);
        }
      } finally {
        client.release();
        await pool.end();
      }
    }

    // Archive period-based tables (student_fees, hadiya, expenses, etc.)
    for (const entity of PERIOD_TABLES) {
      if (entity.type === "period") {
        const { error: updateErr } = await supabaseAdmin
          .from(entity.table)
          .update({ is_archived: true, archived_at: new Date().toISOString(), archive_reason: `Period closed: ${currentKey}` })
          .eq(entity.filterField, currentKey);
        if (updateErr) errors.push(`${entity.table}: ${updateErr.message}`);
      }
    }

    // Archive date-based tables (attendances, teacher_attendance, etc.)
    const dateUpper = getDateUpperBound(currentKey);
    for (const entity of PERIOD_TABLES) {
      if (entity.type === "date") {
        const { error: updateErr } = await supabaseAdmin
          .from(entity.table)
          .update({ is_archived: true, archived_at: new Date().toISOString(), archive_reason: `Period closed: ${currentKey}` })
          .lte(entity.filterField, dateUpper);
        if (updateErr) errors.push(`${entity.table}: ${updateErr.message}`);
      }
    }
  }

  // Update current period in app_settings
  const existingSetting = await supabaseAdmin
    .from("app_settings")
    .select("id")
    .eq("key", "current_accounting_period")
    .maybeSingle();

  if (existingSetting.data) {
    await supabaseAdmin
      .from("app_settings")
      .update({ value: nextPeriod })
      .eq("key", "current_accounting_period");
  } else {
    await supabaseAdmin
      .from("app_settings")
      .insert({ key: "current_accounting_period", value: nextPeriod });
  }

  await supabaseAdmin
    .from("app_settings")
    .upsert({ key: "last_period_archived_at", value: new Date().toISOString() }, { onConflict: "key" });

  return NextResponse.json({
    ok: true,
    message: `New accounting period "${nextPeriod}" started successfully.`,
    previousPeriod: currentKey,
    nextPeriod,
    archivedTables: PERIOD_TABLES.map(e => e.table),
    errors: errors.length > 0 ? errors : null,
  });
}
