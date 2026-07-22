export const AUTH_COOKIE_NAME = "rahmania_session";
export const MANAGED_PASSWORD_PLACEHOLDER = "__managed_by_supabase_auth__";

const ROLE_PREFIX = {
  admin: "admin",
  branch_admin: "branch_admin",
  teacher: "teacher",
  student: "student",
  boarding_manager: "boarding_manager",
};

const ROLE_LOGIN_ROUTE = {
  admin: "/admin",
  branch_admin: "/admin",
  teacher: "/TeacherLogin",
  student: "/StudentLogin",
  boarding_manager: "/admin",
};

export function normalizeLoginId(value) {
  return String(value || "").trim().toUpperCase();
}

export function slugifyLoginId(value) {
  return normalizeLoginId(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getManagedAuthEmail(role, loginId = role) {
  const prefix = ROLE_PREFIX[role] || "user";
  const slug = slugifyLoginId(loginId || role);

  return `${prefix}+${slug || prefix}@school.local`;
}

export function getLoginRoute(role) {
  return ROLE_LOGIN_ROUTE[role] || "/";
}

export function sanitizePasswordMarker(password) {
  if (!password) {
    return "";
  }

  return MANAGED_PASSWORD_PLACEHOLDER;
}

export function hasUsableStoredPassword(password) {
  if (!password) {
    return false;
  }

  return password !== MANAGED_PASSWORD_PLACEHOLDER;
}
