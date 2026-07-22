import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
  getPostgresConfig,
  getSupabaseServerEnv,
} from "../../../../src/lib/supabase-admin.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValue(value) {
  return Boolean(value && String(value).trim());
}

export async function GET() {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: hasValue(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: hasValue(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
  };

  const serverEnv = {
    SUPABASE_URL: hasValue(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_JWT_SECRET: hasValue(process.env.SUPABASE_JWT_SECRET),
    POSTGRES_URL: hasValue(process.env.POSTGRES_URL),
    POSTGRES_PRISMA_URL: hasValue(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL_NON_POOLING: hasValue(process.env.POSTGRES_URL_NON_POOLING),
    POSTGRES_USER: hasValue(process.env.POSTGRES_USER),
    POSTGRES_HOST: hasValue(process.env.POSTGRES_HOST),
    POSTGRES_PASSWORD: hasValue(process.env.POSTGRES_PASSWORD),
    POSTGRES_DATABASE: hasValue(process.env.POSTGRES_DATABASE),
  };

  const checks = {
    authAdminApi: { ok: false, message: "Not checked" },
    storageApi: { ok: false, message: "Not checked" },
    databaseConfig: { ok: false, message: "Missing Postgres connection info" },
  };

  try {
    getSupabaseServerEnv();
    const supabaseAdmin = createSupabaseAdminClient();

    const usersResult = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    checks.authAdminApi = usersResult.error
      ? { ok: false, message: "Supabase Auth admin API unreachable" }
      : { ok: true, message: "Supabase Auth admin API reachable" };

    const bucketsResult = await supabaseAdmin.storage.listBuckets();
    checks.storageApi = bucketsResult.error
      ? { ok: false, message: "Supabase Storage API unreachable" }
      : { ok: true, message: "Supabase Storage API reachable" };
  } catch (error) {
    checks.authAdminApi = { ok: false, message: "Supabase server check failed" };
    checks.storageApi = { ok: false, message: "Supabase server check failed" };
  }

  const postgres = getPostgresConfig();
  const hasDatabaseConfig =
    hasValue(postgres.pooledUrl) &&
    hasValue(postgres.directUrl) &&
    hasValue(postgres.user) &&
    hasValue(postgres.host) &&
    hasValue(postgres.password) &&
    hasValue(postgres.database);

  checks.databaseConfig = hasDatabaseConfig
    ? { ok: true, message: "Postgres connection variables are configured" }
    : { ok: false, message: "One or more Postgres environment variables are missing" };

  const ok =
    Object.values(publicEnv).every(Boolean) &&
    Object.values(serverEnv).every(Boolean) &&
    Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      ok,
      publicEnv,
      serverEnv,
      checks,
    },
    { status: ok ? 200 : 500 },
  );
}
