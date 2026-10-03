import { arrayToPermissions } from "./permissions-definitions";

export function isAdminUser(user) {
  if (!user) return false;
  return user.role === "admin" || user.role === "super_admin" || user.role === "superadmin";
}

export function hasPermission(user, module, action = "view") {
  if (!user) return false;
  if (isAdminUser(user)) return true;

  let allowed = user.allowed_features;
  if (!Array.isArray(allowed)) {
    allowed = user.role === "boarding_manager"
      ? ["boarding"]
      : [
          "students", "teachers", "student-attendance", "teacher-attendance", "biometric-attendance",
          "daily-lesson-tracker", "exams", "fees", "hadiya",
          "notices", "academic-structure", "branches", "gallery",
          "videos", "messages", "downloadform", "sponsors",
        ];
  }

  const normalizedAction = normalizeAction(action);

  if (allowed.includes(module)) return true;
  if (allowed.includes(`${module}:${normalizedAction}`)) return true;

  if (user.role === "branch_admin" || user.role === "boarding_manager") {
    if (allowed.includes(`${module}:view_own_branch`) || allowed.includes(`${module}:manage_own_branch`)) {
      return true;
    }
  }

  return false;
}

export function hasAnyPermission(user, module) {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const allowed = user.allowed_features;
  if (!Array.isArray(allowed)) return false;
  if (allowed.includes(module)) return true;
  return allowed.some((p) => p.startsWith(`${module}:`));
}

export function canManageAllBranches(user, module) {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const allowed = user.allowed_features;
  if (!Array.isArray(allowed)) return false;
  return allowed.includes(module) || allowed.includes(`${module}:manage_all_branches`);
}

export function canManageOwnBranch(user, module) {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const allowed = user.allowed_features;
  if (!Array.isArray(allowed)) return false;
  if (canManageAllBranches(user, module)) return true;
  return allowed.includes(`${module}:manage_own_branch`);
}

export function getPermissionObject(user) {
  if (!user || !user.allowed_features) return {};
  return arrayToPermissions(user.allowed_features);
}

function normalizeAction(action) {
  if (["read", "list", "get", "filter"].includes(action)) return "view";
  if (action === "update") return "edit";
  if (action === "destroy") return "delete";
  return action;
}
