export type ExpenseStatus =
  | "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  | "CHANGES_REQUESTED" | "CANCELLED" | "PAID" | "REVERSED";

/** Valid status transitions. Enforced on the server; clients never set a status directly. */
export const TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "CHANGES_REQUESTED", "CANCELLED"],
  CHANGES_REQUESTED: ["PENDING_APPROVAL", "CANCELLED"],
  APPROVED: ["PAID", "CANCELLED"],
  PAID: ["REVERSED"],
  REJECTED: [],
  CANCELLED: [],
  REVERSED: [],
};

export const canTransition = (from: ExpenseStatus, to: ExpenseStatus) => TRANSITIONS[from].includes(to);

/** Statuses every member may see once published. */
export const PUBLIC_STATUSES: ExpenseStatus[] = ["APPROVED", "PAID", "REVERSED"];

export type ReminderStep = { afterMinutes: number; kind: string; to: "approvers" | "escalation"; flagOverdue?: boolean };

/** Default schedule; a mosque can override it in Mosque.reminderSteps. Step 0 is sent at submission. */
export const DEFAULT_REMINDER_STEPS: ReminderStep[] = [
  { afterMinutes: 0, kind: "APPROVAL_REQUEST", to: "approvers" },
  { afterMinutes: 120, kind: "APPROVAL_REMINDER", to: "approvers" },
  { afterMinutes: 360, kind: "APPROVAL_REMINDER", to: "approvers" },
  { afterMinutes: 1440, kind: "APPROVAL_ESCALATION", to: "escalation" },
  { afterMinutes: 2880, kind: "APPROVAL_OVERDUE", to: "escalation", flagOverdue: true },
];
