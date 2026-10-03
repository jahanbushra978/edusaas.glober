/**
 * permissionEngine.js
 * Dynamic Permission Engine — Application Management System
 * Loads permissions from application_permissions table.
 * Super Admin can change any permission from the UI.
 */

import { appClient } from "@/api/appClient";

let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 60_000; // 1 min

async function loadPermissions() {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache;
  try {
    const all = await appClient.entities.ApplicationPermission.listAll();
    _cache = all;
    _cacheTs = Date.now();
    return all;
  } catch {
    return [];
  }
}

export function invalidatePermissionCache() {
  _cache = null;
}

// ─────────────────────────────────────────────────
// Get resolved permissions for a role + type
// Priority: exact type match > '*' wildcard
// ─────────────────────────────────────────────────
export async function getPermissionsFor(role, applicationType = "*") {
  const all = await loadPermissions();

  const exact = all.find(p => p.role === role && p.application_type === applicationType);
  if (exact) return exact;

  const wild = all.find(p => p.role === role && p.application_type === "*");
  return wild || getDefaultPermissions(role);
}

function getDefaultPermissions(role) {
  const defaults = {
    super_admin:  { can_submit: true,  can_view_own: true, can_view_branch: true,  can_view_all: true,  can_edit: true,  can_recommend: true,  can_approve: true,  can_reject: true,  can_cancel: true,  can_generate_pdf: true  },
    admin:        { can_submit: true,  can_view_own: true, can_view_branch: true,  can_view_all: true,  can_edit: true,  can_recommend: true,  can_approve: true,  can_reject: true,  can_cancel: true,  can_generate_pdf: true  },
    branch_admin: { can_submit: true,  can_view_own: true, can_view_branch: true,  can_view_all: false, can_edit: true,  can_recommend: true,  can_approve: false, can_reject: true,  can_cancel: true,  can_generate_pdf: true  },
    teacher:      { can_submit: true,  can_view_own: true, can_view_branch: false, can_view_all: false, can_edit: true,  can_recommend: true,  can_approve: false, can_reject: false, can_cancel: true,  can_generate_pdf: true  },
    student:      { can_submit: true,  can_view_own: true, can_view_branch: false, can_view_all: false, can_edit: true,  can_recommend: false, can_approve: false, can_reject: false, can_cancel: true,  can_generate_pdf: true  },
  };
  return defaults[role] || { can_submit: false, can_view_own: true, can_view_branch: false, can_view_all: false, can_edit: false, can_recommend: false, can_approve: false, can_reject: false, can_cancel: false, can_generate_pdf: false };
}

// ─────────────────────────────────────────────────
// Check a single permission (sync — requires pre-loaded perms)
// ─────────────────────────────────────────────────
export function can(permissions, action) {
  if (!permissions) return false;
  return !!permissions[`can_${action}`];
}

// ─────────────────────────────────────────────────
// Determine if a user can act on a specific application
// ─────────────────────────────────────────────────
export function canActOnApplication(user, application, action) {
  if (!user || !application) return false;
  const role = user.role;

  // Cancelled/Approved apps — no editing
  if (["approved", "cancelled"].includes(application.status)) {
    if (["edit", "recommend", "approve", "reject"].includes(action)) return false;
  }

  const userIdStr = String(user.profileId || user.id);
  const isOwn = String(application.applicant_id) === userIdStr;

  // Only applicant can cancel their own (or admin)
  if (action === "cancel") {
    const isAdmin = ["super_admin", "admin", "branch_admin"].includes(role);
    return isOwn || isAdmin;
  }

  // Edit: only if editable and own app (or admin)
  if (action === "edit") {
    if (!application.is_editable) return false;
    return isOwn || ["super_admin", "admin", "branch_admin"].includes(role);
  }

  // Approve/Recommend/Reject: only current reviewer role
  if (["approve", "recommend", "reject"].includes(action)) {
    const currentRole = application.current_reviewer_role;
    if (!currentRole) return false;
    if (role === "super_admin" || role === "admin") return true;
    return role === currentRole;
  }

  return true;
}

// ─────────────────────────────────────────────────
// Admin: update permissions for a role+type
// ─────────────────────────────────────────────────
export async function updatePermissions(role, applicationType, permissionsObj) {
  const all = await loadPermissions();
  const existing = all.find(p => p.role === role && p.application_type === applicationType);

  if (existing) {
    await appClient.entities.ApplicationPermission.update(existing.id, permissionsObj);
  } else {
    await appClient.entities.ApplicationPermission.create({ role, application_type: applicationType, ...permissionsObj });
  }
  invalidatePermissionCache();
}
