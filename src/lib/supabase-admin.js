import "server-only";

import { createClient } from "@supabase/supabase-js";

function requireServerEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}.`);
  }

  return value;
}

export function getSupabaseServerEnv() {
  return {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    jwtSecret: process.env.SUPABASE_JWT_SECRET || "",
  };
}

export function getPostgresConfig() {
  const pooledUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "";
  const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || "";

  return {
    pooledUrl,
    directUrl,
    user: process.env.POSTGRES_USER || "",
    host: process.env.POSTGRES_HOST || "",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DATABASE || "",
  };
}

export function createSupabaseAdminClient() {
  const url = requireServerEnv("SUPABASE_URL");
  const serviceRoleKey = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseAuthClient() {
  const url = requireServerEnv("SUPABASE_URL");
  const anonKey = requireServerEnv("SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).");
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
