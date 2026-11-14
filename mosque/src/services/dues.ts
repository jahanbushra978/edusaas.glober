import { db } from "@/lib/db";
import { maxPeriod, nextPeriod, periodOf, periodsBetween } from "@/lib/period";

type MosqueRef = { id: string; startMonth: string; timezone: string };

/**
 * Idempotent: creates any missing MonthlyDue rows for active members up to the current month.
 * `Mosque.duesThrough` is a high-water mark so repeat calls are cheap.
 */
export async function ensureDues(mosque: MosqueRef): Promise<void> {
  const current = periodOf(new Date(), mosque.timezone);
  const row = await db.mosque.findUnique({ where: { id: mosque.id }, select: { duesThrough: true } });
  const from = row?.duesThrough ? nextPeriod(row.duesThrough) : mosque.startMonth;
  if (from > current) return;

  const members = await db.membership.findMany({
    where: { mosqueId: mosque.id, status: "ACTIVE", monthlyPledge: { gt: 0 } },
    select: { id: true, monthlyPledge: true, joinedAt: true },
  });
  const data = members.flatMap((m) => {
    const start = maxPeriod(from, maxPeriod(mosque.startMonth, periodOf(m.joinedAt, mosque.timezone)));
    return periodsBetween(start, current).map((period) => ({
      mosqueId: mosque.id,
      membershipId: m.id,
      period,
      amount: m.monthlyPledge,
    }));
  });
  if (data.length) await db.monthlyDue.createMany({ data, skipDuplicates: true });
  await db.mosque.update({ where: { id: mosque.id }, data: { duesThrough: current } });
}

/**
 * Called after a member is activated or their pledge changes. Past months keep the amount that
 * applied at the time; the current month follows the new pledge.
 */
export async function syncMemberDues(mosque: MosqueRef, membershipId: string): Promise<void> {
  const m = await db.membership.findFirst({ where: { id: membershipId, mosqueId: mosque.id } });
  if (!m || m.status !== "ACTIVE" || m.monthlyPledge.lte(0)) return;
  const current = periodOf(new Date(), mosque.timezone);
  const start = maxPeriod(mosque.startMonth, periodOf(m.joinedAt, mosque.timezone));
  await db.monthlyDue.createMany({
    data: periodsBetween(start, current).map((period) => ({
      mosqueId: mosque.id,
      membershipId: m.id,
      period,
      amount: m.monthlyPledge,
    })),
    skipDuplicates: true,
  });
  await db.monthlyDue.updateMany({
    where: { membershipId: m.id, mosqueId: mosque.id, period: current },
    data: { amount: m.monthlyPledge },
  });
}
