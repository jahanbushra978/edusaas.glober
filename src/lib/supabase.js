import { createClient } from "@supabase/supabase-js";

const requiredPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const missingPublicEnv = Object.entries(requiredPublicEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingPublicEnv.length > 0) {
  throw new Error(
    `Missing Supabase public environment variables: ${missingPublicEnv.join(", ")}.`,
  );
}

const supabaseUrl = requiredPublicEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = requiredPublicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export let currentSupabaseToken = null;

export const setSupabaseToken = (token) => {
  currentSupabaseToken = token;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: async (url, options = {}) => {
      const headers = new Headers(options.headers || {});
      if (currentSupabaseToken) {
        headers.set("Authorization", `Bearer ${currentSupabaseToken}`);
      }
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401 && currentSupabaseToken) {
        setSupabaseToken(null);
        const fallbackHeaders = new Headers(options.headers || {});
        return fetch(url, { ...options, headers: fallbackHeaders });
      }
      return response;
    },
  },
});

/**
 * A plain anon-key client that ALWAYS uses the anon key in Authorization header.
 * Never reads or writes any session. Never sends a user JWT.
 * Use for all public entity reads (Teachers, Notices, etc.) to prevent 401 errors
 * when a stale session token is in memory.
 *
 * Uses a unique storageKey to avoid the "Multiple GoTrueClient instances" warning
 * and a custom fetch to hard-pin the anon key regardless of internal auth state.
 */
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: `sb-anon-${supabaseUrl.replace(/[^a-z0-9]/gi, "")}`,
  },
  global: {
    fetch: async (url, options = {}) => {
      // Hard-pin the anon key — never use a session JWT for public queries.
      const headers = new Headers(options.headers || {});
      headers.set("Authorization", `Bearer ${supabaseAnonKey}`);
      headers.set("apikey", supabaseAnonKey);
      return fetch(url, { ...options, headers });
    },
  },
});

export default supabase;
