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

export default supabase;
