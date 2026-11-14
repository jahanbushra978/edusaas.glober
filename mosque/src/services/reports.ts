import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { Cursor, decodeCursor, encodeCursor } from "@/lib/cursor";
import { MonthStatus, monthStatus, periodOf, periodsBetween } from "@/lib/period";
import type { AuthCtx } from "@/lib/auth";
import { ensureDues } from "./dues";

export type MonthOverview = {
  period: string;
  expected: number;
  collected: number;
  remaining: number;
  members: number;
  paidCount: number;
};

/** Verified monthly payments, summed per member and month. Always tenant-scoped. */
const paidSub = (mosqueId: string) => Prisma.sql`(
  SELECT "membershipId", period, SUM(amount) AS paid
  FROM "Payment"
  WHERE "mosqueId" = ${mosqueId} AND status = 'VERIFIED' AND period IS NOT NULL
  GROUP BY "membershipId", period
)`;

export async function monthsOverview(mosqueId: string, from: string, to: string): Promise<MonthOverview[]> {
  if (from > to) return [];
  return db.$queryRaw<MonthOverview[]>`
    SELECT d.period,
           SUM(d.amount)::float8 AS expected,
           COALESCE(SUM(LEAST(COALESCE(p.paid, 0), d.amount)), 0)::float8 AS collected,
           COALESCE(SUM(GREATEST(d.amount - COALESCE(p.paid, 0), 0)), 0)::float8 AS remaining,
           COUNT(*)::int AS members,
           (COUNT(*) FILTER (WHERE COALESCE(p.paid, 0) >= d.amount))::int AS "paidCount"
    FROM "MonthlyDue" d
    LEFT JOIN ${paidSub(mosqueId)} p ON p."membershipId" = d."membershipId" AND p.period = d.period
    WHERE d."mosqueId" = ${mosqueId} AND d.period BETWEEN ${from} AND ${to}
    GROUP BY d.period
    ORDER BY d.period`;
}

export type PersonRow = {
  id: string;
  membershipId: string;
  name: string;
  due: number;
  paid: number;
  status: MonthStatus;
};

export type Page<T> = { items: T[]; nextCursor: string | null };

function paginate<T extends { name: string; id: string }>(rows: T[], limit: number): Page<T> {
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  const more = rows.length > limit && last;
  return { items, nextCursor: more ? encodeCursor({ n: last.name, i: last.id }) : null };
}

const after = (c: Cursor | null) => (c ? Prisma.sql`WHERE (x.name, x.id) > (${c.n}, ${c.i})` : Prisma.empty);

/** Who paid and who is due for one month, keyset-paginated for infinite scroll. */
export async function monthPeople(
  mosqueId: string,
  period: string,
  filter: "all" | "paid" | "partial" | "unpaid",
  rawCursor: string | null,
  limit = 20,
  q = "",
): Promise<Page<PersonRow>> {
  const cond =
    filter === "paid"
      ? Prisma.sql`AND x.paid >= x.due`
      : filter === "partial"
        ? Prisma.sql`AND x.paid > 0 AND x.paid < x.due`
        : filter === "unpaid"
          ? Prisma.sql`AND x.paid = 0`
          : Prisma.empty;
  const like = q ? Prisma.sql`AND u.name ILIKE ${"%" + q.replace(/[\\%_]/g, "\\$&") + "%"}` : Prisma.empty;
  const c = decodeCursor(rawCursor);
  const cursorSql = c ? Prisma.sql`AND (x.name, x.id) > (${c.n}, ${c.i})` : Prisma.empty;
  const rows = await db.$queryRaw<Omit<PersonRow, "status">[]>`
    SELECT * FROM (
      SELECT d.id, d."membershipId", u.name, d.amount::float8 AS due, COALESCE(p.paid, 0)::float8 AS paid
      FROM "MonthlyDue" d
      JOIN "Membership" m ON m.id = d."membershipId"
      JOIN "User" u ON u.id = m."userId"
      LEFT JOIN ${paidSub(mosqueId)} p ON p."membershipId" = d."membershipId" AND p.period = d.period
      WHERE d."mosqueId" = ${mosqueId} AND d.period = ${period} ${like}
    ) x
    WHERE TRUE ${cond} ${cursorSql}
    ORDER BY x.name, x.id
    LIMIT ${limit + 1}`;
  const page = paginate(rows, limit);
  return { ...page, items: page.items.map((r) => ({ ...r, status: monthStatus(r.due, r.paid) })) };
}

export type MemberRow = {
  id: string;
  name: string;
  loginId?: string;
  role: string;
  status: string;
  pledge: number;
  due: number;
  paid: number;
};

export async function memberList(
  mosqueId: string,
  currentPeriod: string,
  q: string,
  rawCursor: string | null,
  limit = 20,
): Promise<Page<MemberRow>> {
  const like = q ? Prisma.sql`AND u.name ILIKE ${"%" + q.replace(/[\\%_]/g, "\\$&") + "%"}` : Prisma.empty;
  const c = decodeCursor(rawCursor);
  const rows = await db.$queryRaw<MemberRow[]>`
    SELECT * FROM (
      SELECT m.id, u.name, u."loginId" AS "loginId", r.name AS role, m.status::text AS status, m."monthlyPledge"::float8 AS pledge,
        COALESCE((SELECT SUM(amount) FROM "MonthlyDue" WHERE "membershipId" = m.id AND period <= ${currentPeriod}), 0)::float8 AS due,
        COALESCE((SELECT SUM(amount) FROM "Payment" WHERE "membershipId" = m.id AND status = 'VERIFIED' AND period IS NOT NULL), 0)::float8 AS paid
      FROM "Membership" m
      JOIN "User" u ON u.id = m."userId"
      JOIN "Role" r ON r.id = m."roleId"
      WHERE m."mosqueId" = ${mosqueId} ${like}
    ) x
    ${after(c)}
    ORDER BY x.name, x.id
    LIMIT ${limit + 1}`;
  return paginate(rows, limit);
}

export type StatementMonth = {
  period: string;
  due: number;
  paid: number;
  remaining: number;
  status: MonthStatus;
  payments: { id: string; amount: number; receiptNo: string; method: string; paidAt: string }[];
};

/** Month-by-month account for one member: what was due, what was paid, what is still owed. */
export async function memberStatement(mosqueId: string, membershipId: string, currentPeriod: string) {
  const member = await db.membership.findFirst({
    where: { id: membershipId, mosqueId },
    include: { user: { select: { name: true } }, role: { select: { id: true, name: true } } },
  });
  if (!member) throw new HttpError(404, "NOT_FOUND");
  const [dues, payments] = await Promise.all([
    db.monthlyDue.findMany({ where: { membershipId, mosqueId, period: { lte: currentPeriod } } }),
    db.payment.findMany({
      where: { membershipId, mosqueId, status: "VERIFIED", period: { not: null } },
      orderBy: { paidAt: "asc" },
    }),
  ]);
  const byPeriod = new Map<string, StatementMonth>();
  const get = (period: string) => {
    let m = byPeriod.get(period);
    if (!m) byPeriod.set(period, (m = { period, due: 0, paid: 0, remaining: 0, status: "UNPAID", payments: [] }));
    return m;
  };
  for (const d of dues) get(d.period).due = Number(d.amount);
  for (const p of payments) {
    const m = get(p.period as string);
    m.paid += Number(p.amount);
    m.payments.push({
      id: p.id,
      amount: Number(p.amount),
      receiptNo: p.receiptNo,
      method: p.method,
      paidAt: p.paidAt.toISOString(),
    });
  }
  const months = [...byPeriod.values()].sort((a, b) => (a.period < b.period ? 1 : -1));
  for (const m of months) {
    m.remaining = Math.max(m.due - m.paid, 0);
    m.status = monthStatus(m.due, m.paid);
  }
  return {
    member: {
      id: member.id,
      name: member.user.name,
      role: member.role.name,
      roleId: member.role.id,
      status: member.status,
      pledge: Number(member.monthlyPledge),
    },
    totals: {
      due: months.reduce((s, m) => s + m.due, 0),
      paid: months.reduce((s, m) => s + m.paid, 0),
      remaining: months.reduce((s, m) => s + m.remaining, 0),
    },
    months,
  };
}

export async function dashboard(a: AuthCtx) {
  await ensureDues(a.mosque);
  const mosqueId = a.mosque.id;
  const current = periodOf(new Date(), a.mosque.timezone);
  const recent = periodsBetween(a.mosque.startMonth, current).slice(-6);

  const [funds, income, spent, pending, series, mine] = await Promise.all([
    db.fund.findMany({ where: { mosqueId }, orderBy: { createdAt: "asc" } }),
    db.payment.groupBy({ by: ["fundId"], where: { mosqueId, status: "VERIFIED" }, _sum: { amount: true } }),
    db.expense.groupBy({ by: ["fundId"], where: { mosqueId, status: "PAID" }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { mosqueId, status: "PENDING_APPROVAL" }, _sum: { amount: true } }),
    recent.length ? monthsOverview(mosqueId, recent[0] as string, current) : Promise.resolve([]),
    memberStatement(mosqueId, a.membership.id, current),
  ]);
  const inMap = new Map(income.map((r) => [r.fundId, Number(r._sum.amount ?? 0)]));
  const outMap = new Map(spent.map((r) => [r.fundId, Number(r._sum.amount ?? 0)]));
  const fundRows = funds.map((f) => {
    const i = inMap.get(f.id) ?? 0;
    const o = outMap.get(f.id) ?? 0;
    return { id: f.id, name: f.name, restricted: f.restricted, income: i, expense: o, balance: i - o };
  });
  return {
    currency: a.mosque.currency,
    currentPeriod: current,
    funds: fundRows,
    totals: {
      income: fundRows.reduce((s, f) => s + f.income, 0),
      expense: fundRows.reduce((s, f) => s + f.expense, 0),
      balance: fundRows.reduce((s, f) => s + f.balance, 0),
      pendingApproval: Number(pending._sum.amount ?? 0),
    },
    thisMonth: series.find((s) => s.period === current) ?? null,
    series,
    mine: mine.totals,
  };
}
