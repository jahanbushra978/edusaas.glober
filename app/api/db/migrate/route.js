import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import pg from "pg";

import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { safeCompare } from "../../../../src/lib/safe-compare";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { Pool } = pg;

function getConnectionString() {
  if (process.env.POSTGRES_URL_NON_POOLING) {
    return process.env.POSTGRES_URL_NON_POOLING;
  }
  if (process.env.POSTGRES_PRISMA_URL) {
    return process.env.POSTGRES_PRISMA_URL;
  }
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }
  const { POSTGRES_USER, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_DATABASE } = process.env;
  if (POSTGRES_USER && POSTGRES_HOST && POSTGRES_PASSWORD && POSTGRES_DATABASE) {
    return `postgresql://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(POSTGRES_PASSWORD)}@${POSTGRES_HOST}:5432/${encodeURIComponent(POSTGRES_DATABASE)}`;
  }
  return null;
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session || session.role !== "admin") {
    return null;
  }

  return session;
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: "Database migrations must be run with an authenticated POST request.",
    },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request) {
  // C2 fix: this endpoint opens a raw Postgres connection that completely
  // bypasses Supabase's RLS/PostgREST layer. It must never be reachable in
  // production. It stays available in non-production environments (local/dev/
  // preview) where running a one-off migration this way is still useful.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        message:
          "This endpoint is disabled in production. Apply migrations via the Supabase CLI/Dashboard SQL editor instead.",
      },
      { status: 404 },
    );
  }

  // Defense-in-depth even outside production: require a dedicated, explicit
  // one-time secret in addition to an authenticated admin session, so that a
  // compromised admin session alone is not sufficient to run raw SQL.
  const migrationSecret = process.env.DB_MIGRATE_SECRET;
  if (!migrationSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "DB_MIGRATE_SECRET is not configured. Set it in your non-production environment to enable this endpoint.",
      },
      { status: 503 },
    );
  }
  const providedSecret = request.headers.get("x-migration-secret") || "";
  if (!safeCompare(providedSecret, migrationSecret)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }
  if (!checkRateLimit(`db-migrate:${getClientIp(request)}`, { windowMs: 60000, max: 5 })) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
  }

  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const connStr = getConnectionString();
  if (!connStr) {
    return NextResponse.json(
      {
        ok: false,
        message: "No Postgres connection string configured. Set POSTGRES_URL_NON_POOLING, POSTGRES_PRISMA_URL, or individual POSTGRES_* env vars.",
        hint: "You can also run the migration manually in Supabase SQL Editor: run the contents of supabase/migrations/create_global_search_index.sql",
      },
      { status: 400 },
    );
  }

  let pool;
  let client;
  try {
    pool = new Pool({ connectionString: connStr, max: 1 });
    client = await pool.connect();

    // 1. Run student class_name migration
    await client.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name TEXT;");

    // 2. Run global search index migration
    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "create_global_search_index.sql");
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, "utf8");
      await client.query(sql);
    }

    // 3. Run RBAC RLS policies migration
    const rbacMigrationPath = path.join(process.cwd(), "supabase", "migrations", "create_rbac_rls_policies.sql");
    if (fs.existsSync(rbacMigrationPath)) {
      const sql = fs.readFileSync(rbacMigrationPath, "utf8");
      await client.query(sql);
    }

    // 4. Run multilingual and public support migration
    const customMigrationPath = path.join(process.cwd(), "supabase", "migrations", "add_multilingual_and_public_support.sql");
    if (fs.existsSync(customMigrationPath)) {
      const sql = fs.readFileSync(customMigrationPath, "utf8");
      await client.query(sql);
    }

    // 5. Run session_id and class_group_id migrations
    const groupMigrationPath = path.join(process.cwd(), "supabase", "migrations", "add_class_group_id_column.sql");
    if (fs.existsSync(groupMigrationPath)) {
      const sql = fs.readFileSync(groupMigrationPath, "utf8");
      await client.query(sql);
    }

    // 6. Run home dynamic blog and event features migrations
    const featuresMigrationPath = path.join(process.cwd(), "supabase", "migrations", "add_home_dynamic_features.sql");
    if (fs.existsSync(featuresMigrationPath)) {
      const sql = fs.readFileSync(featuresMigrationPath, "utf8");
      await client.query(sql);
    }

    // 7. Run public RLS policies fix migration
    const rlsFixPath = path.join(process.cwd(), "supabase", "migrations", "fix_all_public_rls_policies.sql");
    if (fs.existsSync(rlsFixPath)) {
      const sql = fs.readFileSync(rlsFixPath, "utf8");
      await client.query(sql);
    }

    // 8. Run enterprise security fixes migration
    const securityFixPath = path.join(process.cwd(), "supabase", "migrations", "z_enterprise_security_fixes.sql");
    if (fs.existsSync(securityFixPath)) {
      const sql = fs.readFileSync(securityFixPath, "utf8");
      await client.query(sql);
    }

    // 9. Run enterprise security hardening migration
    const securityHardenPath = path.join(process.cwd(), "supabase", "migrations", "z_enterprise_security_hardening.sql");
    if (fs.existsSync(securityHardenPath)) {
      const sql = fs.readFileSync(securityHardenPath, "utf8");
      await client.query(sql);
    }

    await client.query("SELECT pg_notify('pgrst', 'reload schema');");

    client.release();
    await pool.end();

    return NextResponse.json({
      ok: true,
      message: "Migration successful: ran student class_name, global search index, multilingual/public support, group migrations, and blog/event features, and refreshed schema cache.",
    });
  } catch (error) {
    if (client) {
      try { client.release(); } catch {}
    }
    if (pool) {
      try { await pool.end(); } catch {}
    }
    return NextResponse.json(
      {
        ok: false,
        message: "Migration failed",
        hint: "Run the failing migration manually in the Supabase SQL Editor (see supabase/migrations/).",
      },
      { status: 500 },
    );
  }
}
