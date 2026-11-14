import { db } from "@/lib/db";
import type { AuthCtx } from "@/lib/auth";

export type FundMonth = { period: string; income: number; expense: number };

/** Fund summary plus month-by-month income and posted (paid) expenses, last 12 months. Aggregates only. */
export async function fundDetail(a: AuthCtx, fundId: string) {
  const fund = await db.fund.findFirst({ where: { id: fundId, mosqueId: a.mosque.id } });
  if (!fund) return null;
  const tz = a.mosque.timezone;
  const rows = await db.$queryRaw<FundMonth[]>`
    WITH inc AS (
      SELECT to_char(("paidAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM') AS period, SUM(amount)::float8 AS v
      FROM "Payment" WHERE "mosqueId" = ${a.mosque.id} AND "fundId" = ${fundId} AND status = 'VERIFIED' GROUP BY 1),
    exp AS (
      SELECT to_char((COALESCE("paidAt", "spentAt") AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM') AS period, SUM(amount)::float8 AS v
      FROM "Expense" WHERE "mosqueId" = ${a.mosque.id} AND "fundId" = ${fundId} AND status = 'PAID' GROUP BY 1)
    SELECT COALESCE(inc.period, exp.period) AS period, COALESCE(inc.v, 0)::float8 AS income, COALESCE(exp.v, 0)::float8 AS expense
    FROM inc FULL JOIN exp ON inc.period = exp.period
    ORDER BY 1 DESC LIMIT 12`;
  const all = await db.$queryRaw<{ income: number; expense: number }[]>`
    SELECT (SELECT COALESCE(SUM(amount),0) FROM "Payment" WHERE "mosqueId"=${a.mosque.id} AND "fundId"=${fundId} AND status='VERIFIED')::float8 AS income,
           (SELECT COALESCE(SUM(amount),0) FROM "Expense" WHERE "mosqueId"=${a.mosque.id} AND "fundId"=${fundId} AND status='PAID')::float8 AS expense`;
  const t = all[0] ?? { income: 0, expense: 0 };
  return { id: fund.id, name: fund.name, restricted: fund.restricted, currency: a.mosque.currency, totals: { income: t.income, expense: t.expense, balance: t.income - t.expense }, months: rows };
}
