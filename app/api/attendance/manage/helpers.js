import { cookies } from "next/headers";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";

export function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function sanitize(val) {
  if (typeof val !== "string") return val;
  return val.replace(/[<>"'&]/g, "").slice(0, 1000);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin(supabase, session) {
  if (!session) return null;
  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, role, branch_id, name, email")
      .eq("id", session.id)
      .maybeSingle();
    if (user) return user;
  } catch {}

  if (session.role === "admin" || session.role === "branch_admin") {
    return {
      id: session.id,
      role: session.role,
      branch_id: session.branch_id || null,
      name: session.name || "Administrator",
      email: session.email || ""
    };
  }
  return null;
}
