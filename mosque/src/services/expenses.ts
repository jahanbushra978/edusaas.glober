import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { PUBLIC_STATUSES, canTransition, ExpenseStatus } from "@/lib/expenseFlow";
import type { AuthCtx } from "@/lib/auth";
import { audit } from "./audit";
import { dispatch } from "./dispatch";
import { notify, usersWithPermission } from "./notify";

export type ExpenseInput = {
  fundId?: string | undefined;
  category: string;
  description: string;
  amount: number;
  spentAt: string;
  attachmentUrl?: string;
  buyerSignature?: string;
};

const PRIVILEGED = ["expenses.submit", "expenses.approve", "expenses.pay", "finance.view_all"];
export const isPrivileged = (a: AuthCtx) => PRIVILEGED.some((p) => a.perms.has(p));

const notifData = (e: { id: string; voucherNo: string; category: string; amount: Prisma.Decimal | number }, mosque: string, submittedAt: Date) => ({
  expenseId: e.id,
  voucherNo: e.voucherNo,
  category: e.category,
  amount: Number(e.amount),
  mosque,
  submittedAt: submittedAt.toISOString(),
});

/** Creates an expense and submits it for approval in one step; step 0 of the reminder schedule fires now. */
export async function createExpense(a: AuthCtx, input: ExpenseInput) {
  if (!a.perms.has("expenses.submit")) throw new HttpError(403, "FORBIDDEN");
  const mosqueId = a.mosque.id;
  let sent = null as { to: string[]; data: ReturnType<typeof notifData> } | null;
  const created = await db.$transaction(async (tx) => {
    const fund = await tx.fund.findFirst({ where: input.fundId ? { id: input.fundId, mosqueId } : { mosqueId, isMonthly: true } });
    if (!fund) throw new HttpError(404, "FUND_NOT_FOUND");
    const { voucherSeq } = await tx.mosque.update({ where: { id: mosqueId }, data: { voucherSeq: { increment: 1 } }, select: { voucherSeq: true } });
    const now = new Date();
    const e = await tx.expense.create({
      data: {
        mosqueId, fundId: fund.id, voucherNo: `EXP-${String(voucherSeq).padStart(4, "0")}`,
        category: input.category, description: input.description, amount: input.amount,
        status: "PENDING_APPROVAL", spentAt: new Date(input.spentAt), createdById: a.user.id, submittedAt: now,
        attachmentUrl: input.attachmentUrl || null,
        buyerSignature: input.buyerSignature || `সাবমিটার: ${a.user.name}`,
      },
    });
    const approvers = await usersWithPermission(tx, mosqueId, "expenses.approve", a.user.id);
    const data = notifData(e, a.mosque.name, now);
    await notify(tx, mosqueId, approvers, { kind: "APPROVAL_REQUEST", data, link: `/expenses/${e.id}` });
    sent = { to: approvers, data };
    await tx.reminderEvent.create({ data: { mosqueId, expenseId: e.id, step: 0, recipients: approvers.length } });
    await audit(tx, { mosqueId, actorId: a.user.id, action: "EXPENSE_SUBMITTED", entity: "Expense", entityId: e.id, meta: { voucherNo: e.voucherNo, amount: input.amount } });
    return e;
  });
  // After commit: SMS/email/push (no-op until a provider is registered).
  if (sent) await dispatch(mosqueId, sent.to, { kind: "APPROVAL_REQUEST", data: sent.data, link: `/expenses/${created.id}` }, a.mosque.currency);
  return created;
}

export async function decideExpense(a: AuthCtx, id: string, decision: "APPROVE" | "REJECT", reason?: string, approverSignature?: string) {
  if (!a.perms.has("expenses.approve")) throw new HttpError(403, "FORBIDDEN");
  const to: ExpenseStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  if (to === "REJECTED" && (reason?.trim().length ?? 0) < 3) throw new HttpError(400, "REASON_REQUIRED");
  let sent = null as { to: string; kind: string; data: Record<string, unknown> } | null;
  const result = await db.$transaction(async (tx) => {
    const e = await tx.expense.findFirst({ where: { id, mosqueId: a.mosque.id } });
    if (!e) throw new HttpError(404, "NOT_FOUND");
    if (e.createdById === a.user.id) throw new HttpError(403, "SELF_APPROVAL_FORBIDDEN");
    if (!canTransition(e.status, to)) throw new HttpError(409, "INVALID_TRANSITION");
    // Conditional update: two approvers deciding at once cannot both win.
    const r = await tx.expense.updateMany({
      where: { id, mosqueId: a.mosque.id, status: "PENDING_APPROVAL" },
      data: {
        status: to, decidedById: a.user.id, decidedAt: new Date(), decisionReason: reason?.trim() || null,
        approverSignature: approverSignature?.trim() || `অনুমোদনকারী: ${a.user.name}`,
      },
    });
    if (r.count !== 1) throw new HttpError(409, "INVALID_TRANSITION");
    await audit(tx, { mosqueId: a.mosque.id, actorId: a.user.id, action: `EXPENSE_${to}`, entity: "Expense", entityId: id, meta: { reason: reason ?? null } });
    const kind = to === "APPROVED" ? "EXPENSE_APPROVED" : "EXPENSE_REJECTED";
    const data = { ...notifData(e, a.mosque.name, e.submittedAt ?? e.createdAt), reason: reason ?? null };
    await notify(tx, a.mosque.id, [e.createdById], { kind, data, link: `/expenses/${id}` });
    sent = { to: e.createdById, kind, data };
    return { status: to };
  });
  if (sent) await dispatch(a.mosque.id, [sent.to], { kind: sent.kind, data: sent.data, link: `/expenses/${id}` }, a.mosque.currency);
  return result;
}

export async function payExpense(a: AuthCtx, id: string, paymentRef?: string) {
  if (!a.perms.has("expenses.pay")) throw new HttpError(403, "FORBIDDEN");
  let sent = null as { to: string; data: ReturnType<typeof notifData> } | null;
  const result = await db.$transaction(async (tx) => {
    const e = await tx.expense.findFirst({ where: { id, mosqueId: a.mosque.id } });
    if (!e) throw new HttpError(404, "NOT_FOUND");
    if (!canTransition(e.status, "PAID")) throw new HttpError(409, "INVALID_TRANSITION");
    // A fund can never go negative; restricted funds (zakat etc.) stay separate by construction.
    const [inc, out] = await Promise.all([
      tx.payment.aggregate({ where: { mosqueId: a.mosque.id, fundId: e.fundId, status: "VERIFIED" }, _sum: { amount: true } }),
      tx.expense.aggregate({ where: { mosqueId: a.mosque.id, fundId: e.fundId, status: "PAID" }, _sum: { amount: true } }),
    ]);
    const balance = Number(inc._sum.amount ?? 0) - Number(out._sum.amount ?? 0);
    if (balance < Number(e.amount)) throw new HttpError(409, "INSUFFICIENT_FUND");
    const r = await tx.expense.updateMany({
      where: { id, mosqueId: a.mosque.id, status: "APPROVED" },
      data: { status: "PAID", paidAt: new Date(), paymentRef: paymentRef?.trim() || null },
    });
    if (r.count !== 1) throw new HttpError(409, "INVALID_TRANSITION");
    await audit(tx, { mosqueId: a.mosque.id, actorId: a.user.id, action: "EXPENSE_PAID", entity: "Expense", entityId: id, meta: { paymentRef: paymentRef ?? null } });
    const data = notifData(e, a.mosque.name, e.submittedAt ?? e.createdAt);
    await notify(tx, a.mosque.id, [e.createdById], { kind: "EXPENSE_PAID", data, link: `/expenses/${id}` });
    sent = { to: e.createdById, data };
    return { status: "PAID" as const };
  });
  if (sent) await dispatch(a.mosque.id, [sent.to], { kind: "EXPENSE_PAID", data: sent.data, link: `/expenses/${id}` }, a.mosque.currency);
  return result;
}

export type ExpenseRow = {
  id: string; voucherNo: string; category: string; description: string; amount: number;
  status: ExpenseStatus; spentAt: string; overdue: boolean; submitter: string | null;
};

/** Newest first, keyset-paginated. Members see only published (approved/paid/reversed) expenses. */
export async function listExpenses(a: AuthCtx, rawCursor: string | null, status: string | null, limit = 20) {
  const priv = isPrivileged(a);
  let cur: { t: Date; i: string } | null = null;
  if (rawCursor) {
    try {
      const v = JSON.parse(Buffer.from(rawCursor, "base64url").toString("utf8"));
      cur = { t: new Date(v.t), i: String(v.i) };
    } catch { /* ignore bad cursor */ }
  }
  const rows = await db.expense.findMany({
    where: {
      mosqueId: a.mosque.id,
      ...(priv ? (status ? { status: status as ExpenseStatus } : {}) : { status: { in: PUBLIC_STATUSES } }),
      ...(cur ? { OR: [{ createdAt: { lt: cur.t } }, { createdAt: cur.t, id: { lt: cur.i } }] } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });
  const names = priv ? new Map((await db.user.findMany({ where: { id: { in: [...new Set(rows.map((r) => r.createdById))] } }, select: { id: true, name: true } })).map((u) => [u.id, u.name])) : new Map<string, string>();
  const items: ExpenseRow[] = rows.slice(0, limit).map((e) => ({
    id: e.id, voucherNo: e.voucherNo, category: e.category, description: e.description, amount: Number(e.amount),
    status: e.status, spentAt: e.spentAt.toISOString(), overdue: !!e.overdueAt && e.status === "PENDING_APPROVAL",
    submitter: names.get(e.createdById) ?? null,
  }));
  const last = rows[limit - 1];
  const nextCursor = rows.length > limit && last ? Buffer.from(JSON.stringify({ t: last.createdAt, i: last.id })).toString("base64url") : null;
  return { items, nextCursor };
}

export async function getExpense(a: AuthCtx, id: string) {
  const e = await db.expense.findFirst({ where: { id, mosqueId: a.mosque.id }, include: { fund: { select: { name: true, restricted: true } } } });
  const priv = isPrivileged(a);
  if (!e || (!priv && !PUBLIC_STATUSES.includes(e.status))) throw new HttpError(404, "NOT_FOUND");
  let history: { action: string; at: string; by: string | null; reason: string | null }[] = [];
  let submitter: string | null = null, decider: string | null = null;
  if (priv) {
    const logs = await db.auditLog.findMany({ where: { mosqueId: a.mosque.id, entity: "Expense", entityId: id }, orderBy: { createdAt: "asc" } });
    const ids = [...new Set([e.createdById, e.decidedById, ...logs.map((l) => l.actorId)].filter(Boolean) as string[])];
    const users = new Map((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
    history = logs.map((l) => ({ action: l.action, at: l.createdAt.toISOString(), by: l.actorId ? users.get(l.actorId) ?? null : null, reason: ((l.meta as { reason?: string | null } | null)?.reason) ?? null }));
    submitter = users.get(e.createdById) ?? null;
    decider = e.decidedById ? users.get(e.decidedById) ?? null : null;
  }
  return {
    id: e.id, voucherNo: e.voucherNo, category: e.category, description: e.description, amount: Number(e.amount), status: e.status,
    spentAt: e.spentAt.toISOString(), submittedAt: e.submittedAt?.toISOString() ?? null, decidedAt: e.decidedAt?.toISOString() ?? null,
    decisionReason: priv ? e.decisionReason : null, paidAt: e.paidAt?.toISOString() ?? null, paymentRef: priv ? e.paymentRef : null,
    overdue: !!e.overdueAt && e.status === "PENDING_APPROVAL", fund: e.fund, submitter, decider, history,
    attachmentUrl: e.attachmentUrl ?? null,
    buyerSignature: e.buyerSignature ?? null,
    approverSignature: e.approverSignature ?? null,
    can: {
      decide: e.status === "PENDING_APPROVAL" && a.perms.has("expenses.approve") && e.createdById !== a.user.id,
      pay: e.status === "APPROVED" && a.perms.has("expenses.pay"),
    },
  };
}
