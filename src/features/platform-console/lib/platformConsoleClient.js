/**
 * Platform Console Data Client
 * Communicates exclusively with secure server-side /api/platform/* endpoints.
 * Enforces strict authorization, immutable audit logging, and database persistence.
 */

export async function listOrganizations() {
  try {
    const res = await fetch("/api/platform/organizations", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.message || "Failed to fetch organizations");
    }

    const data = json.data || [];
    return data.map((org) => ({
      ...org,
      branches: org.branches || 1,
      modules_enabled: org.modules_config?.enabled?.length || 10,
      modules_total: 12,
      logo_initial: org.name ? org.name.charAt(0).toUpperCase() : "O",
      theme_color: org.theme_config?.primaryColor || "#0f766e",
    }));
  } catch (err) {
    console.error("Error listing organizations:", err?.message || err);
    return [];
  }
}

export async function getOrganization(id) {
  try {
    const res = await fetch(`/api/platform/organizations/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok) return null;

    const data = json.data;
    return {
      ...data,
      branches: data.branches || 1,
      logo_initial: data.name ? data.name.charAt(0).toUpperCase() : "O",
      theme_color: data.theme_config?.primaryColor || "#0f766e",
    };
  } catch (err) {
    console.error("Error fetching organization:", err?.message || err);
    return null;
  }
}

export async function createOrganization(payload) {
  const cleanSlug = (payload.slug || payload.name || "school")
    .toLowerCase()
    .trim()
    .replace(/%20|\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const res = await fetch("/api/platform/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      slug: cleanSlug,
      subdomain: payload.subdomain || cleanSlug,
      domain: payload.custom_domain || null,
      subscription_plan: payload.subscription_plan || "enterprise",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.message || "Failed to create organization in database.");
  }

  return json.data;
}

export async function updateOrganizationStatus(id, status) {
  try {
    const res = await fetch(`/api/platform/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.message || "Failed to update status");
    }

    return json.data;
  } catch (err) {
    console.error("Error updating organization status:", err?.message || err);
    return null;
  }
}

export async function listAuditLogs() {
  try {
    const res = await fetch("/api/platform/audit-logs", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok || !json.ok) return [];
    return json.data || [];
  } catch (err) {
    console.error("Error fetching audit logs:", err?.message || err);
    return [];
  }
}

export async function fetchModulesCatalog(organizationId = null) {
  try {
    const url = organizationId
      ? `/api/platform/modules?organizationId=${organizationId}`
      : "/api/platform/modules";
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error fetching modules:", err?.message || err);
    return { ok: false, catalog: [] };
  }
}

export async function toggleOrgModule(organizationId, moduleKey, enabled) {
  const res = await fetch("/api/platform/modules", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, moduleKey, enabled }),
  });
  return res.json();
}

export const AVAILABLE_MODULES = [
  { key: "students", name: "Student Management", core: true },
  { key: "teachers", name: "Teacher Management", core: true },
  { key: "attendance", name: "Attendance", core: true },
  { key: "biometric", name: "Biometric Bridge", core: true },
  { key: "fees", name: "Fees & Accounting", core: true },
  { key: "boarding", name: "Boarding & Hostel", core: false },
  { key: "notices", name: "Notice Board", core: true },
  { key: "gallery", name: "Media Gallery", core: false },
  { key: "events", name: "Events & Calendar", core: false },
  { key: "applications", name: "Online Admissions & Dorkhasto", core: true },
  { key: "ai_assistant", name: "AI Assistant & Automation", core: false },
];

export const PERMISSION_TREE = [
  {
    key: "org_admin",
    label: "Organization Super Admin",
    permissions: ["manage_branches", "manage_admins", "manage_settings", "manage_billing"],
  },
  {
    key: "branch_admin",
    label: "Branch Admin",
    permissions: ["manage_teachers", "manage_students", "manage_notices", "manage_results"],
  },
  {
    key: "staff",
    label: "Staff (Teacher / Accountant / Librarian)",
    permissions: ["view_attendance", "collect_fees", "issue_books", "mark_results"],
  },
];
