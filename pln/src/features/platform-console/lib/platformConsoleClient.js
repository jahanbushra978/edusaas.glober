/**
 * Platform Console data client — PROTOTYPE STAGE.
 *
 * এই ফাইলটা এখন in-memory mock data দিয়ে কাজ করছে কারণ Phase 1 (organizations /
 * organization_id migration) এখনো Supabase-এ রান করা হয়নি।
 *
 * Phase 1 migration রান হওয়ার পর, নিচের প্রতিটা ফাংশন সরাসরি Supabase query দিয়ে
 * replace হবে — component গুলোর কোনো কোড বদলাতে হবে না, কারণ সব জায়গায় এই
 * client-এর মধ্য দিয়েই ডাটা আসে (single source, single point of change)।
 *
 * TODO (Phase 1 পরে করার কাজ):
 *   - supabase.from('organizations').select(...) দিয়ে listOrganizations() replace
 *   - supabase.from('organizations').insert(...) দিয়ে createOrganization() replace
 *   - platform-owner-only আলাদা auth flow (Supabase custom claim `platform_owner: true`)
 *     দিয়ে verifyPlatformOwnerSession() replace
 */

let _orgs = [
  {
    id: 1,
    name: "Rahmania Institute",
    slug: "rahmania",
    subdomain: "rahmania",
    custom_domain: "rahmaniainstitute.org",
    status: "active",
    subscription_plan: "premium",
    branches: 3,
    super_admins: 1,
    modules_enabled: 9,
    modules_total: 14,
    created_at: "2023-01-10",
    logo_initial: "R",
    theme_color: "#0f766e",
  },
];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function listOrganizations() {
  await delay();
  return [..._orgs];
}

export async function getOrganization(id) {
  await delay();
  return _orgs.find((o) => String(o.id) === String(id)) || null;
}

export async function createOrganization(payload) {
  await delay(400);
  const newOrg = {
    id: _orgs.length + 1,
    branches: 0,
    super_admins: 0,
    modules_enabled: 0,
    modules_total: 14,
    status: "active",
    subscription_plan: "free",
    created_at: new Date().toISOString().slice(0, 10),
    logo_initial: (payload.name || "O").trim().charAt(0).toUpperCase(),
    theme_color: "#0f766e",
    ...payload,
  };
  _orgs = [..._orgs, newOrg];
  return newOrg;
}

export async function updateOrganizationStatus(id, status) {
  await delay(200);
  _orgs = _orgs.map((o) => (String(o.id) === String(id) ? { ...o, status } : o));
  return getOrganization(id);
}

export const AVAILABLE_MODULES = [
  { key: "students", name: "Student Management", core: true },
  { key: "teachers", name: "Teacher Management", core: true },
  { key: "attendance", name: "Attendance", core: true },
  { key: "biometric", name: "Biometric", core: false },
  { key: "fees", name: "Fees & Accounting", core: true },
  { key: "payroll", name: "Payroll", core: false },
  { key: "library", name: "Library", core: false },
  { key: "inventory", name: "Inventory", core: false },
  { key: "transport", name: "Transport", core: false },
  { key: "hostel", name: "Hostel", core: false },
  { key: "hr", name: "HR", core: false },
  { key: "admissions", name: "Online Admissions", core: true },
  { key: "sms", name: "SMS Gateway", core: false },
  { key: "website", name: "Website Builder", core: true },
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
