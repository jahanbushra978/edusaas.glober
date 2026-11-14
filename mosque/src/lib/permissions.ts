/** Permission keys are stored on Role rows, so each mosque can compose its own roles. */
export const PERMISSIONS = [
  "finance.view_all", // see every contributor and amount
  "members.view", // see the member directory
  "members.manage", // verify members, change pledge, suspend
  "payments.record", // record collections
  "roles.manage", // create roles, assign roles
  "expenses.submit", // create and submit expenses
  "expenses.approve", // approve / reject expenses
  "expenses.pay", // mark an approved expense as paid
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const DEFAULT_ROLES: { key: string; name: string; permissions: Permission[] }[] = [
  { key: "president", name: "President", permissions: [...PERMISSIONS] },
  {
    key: "treasurer",
    name: "Treasurer",
    permissions: ["finance.view_all", "members.view", "payments.record", "expenses.submit", "expenses.pay"],
  },
  { key: "imam", name: "Imam", permissions: ["members.view", "payments.record", "expenses.submit"] },
  { key: "member", name: "Member", permissions: [] },
];
