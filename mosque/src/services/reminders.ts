import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_REMINDER_STEPS, ReminderStep } from "@/lib/expenseFlow";
import { dispatch } from "./dispatch";
import { notify, usersWithPermission } from "./notify";

function stepsFor(raw: Prisma.JsonValue | null): ReminderStep[] {
  if (Array.isArray(raw) && raw.every((s) => s && typeof s === "object" && "afterMinutes" in s && "kind" in s)) return raw as unknown as ReminderStep[];
  return DEFAULT_REMINDER_STEPS;
}

/**
 * Sends due reminders for every pending expense. Safe to run on many instances and to re-run:
 * the unique (expenseId, step) row is claimed first, and the expense status is re-checked in the
 * same transaction, so an approved/rejected request never gets another reminder.
 * A reminder never changes the request itself — only the overdue flag is set.
 */
export async function runReminders(now = new Date()) {
  const pending = await db.expense.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: { mosque: { select: { name: true, currency: true, reminderSteps: true } } },
  });
  let sent = 0, checked = 0;
  for (const e of pending) {
    const steps = stepsFor(e.mosque.reminderSteps);
    const since = e.submittedAt ?? e.createdAt;
    const elapsed = (now.getTime() - since.getTime()) / 60_000;
    for (const [i, s] of steps.entries()) {
      if (s.afterMinutes > elapsed) continue;
      checked += 1;
      try {
        let out = null as { to: string[]; data: Record<string, unknown> } | null;
        const n = await db.$transaction(async (tx) => {
          const fresh = await tx.expense.findFirst({ where: { id: e.id, status: "PENDING_APPROVAL" }, select: { id: true } });
          if (!fresh) return -1;
          const approvers = await usersWithPermission(tx, e.mosqueId, "expenses.approve", e.createdById);
          const leaders = s.to === "escalation" ? await usersWithPermission(tx, e.mosqueId, "roles.manage", e.createdById) : [];
          const to = [...new Set([...approvers, ...leaders])];
          await tx.reminderEvent.create({ data: { mosqueId: e.mosqueId, expenseId: e.id, step: i, recipients: to.length } });
          const data = { expenseId: e.id, voucherNo: e.voucherNo, category: e.category, amount: Number(e.amount), mosque: e.mosque.name, submittedAt: since.toISOString(), hoursPending: Math.floor(elapsed / 60) };
          const count = await notify(tx, e.mosqueId, to, { kind: s.kind, data, link: `/expenses/${e.id}` });
          out = { to, data };
          if (s.flagOverdue) await tx.expense.updateMany({ where: { id: e.id, overdueAt: null }, data: { overdueAt: now } });
          return count;
        });
        if (n >= 0) sent += n;
        // Only a committed, first-time claim of this step reaches here (a duplicate raises P2002 above the dispatch).
        if (n >= 0 && out) await dispatch(e.mosqueId, out.to, { kind: s.kind, data: out.data, link: `/expenses/${e.id}` }, e.mosque.currency);
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err; // already sent
      }
    }
  }
  return { pending: pending.length, stepsDue: checked, notificationsCreated: sent };
}
