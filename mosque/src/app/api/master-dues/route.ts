export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { route } from "@/lib/http";
import { periodOf, periodsBetween } from "@/lib/period";

/**
 * Returns a unified master sheet of all members and their dues/payments across all months.
 * Powers the "masik hisab ek sathe ekta list er maje" requirement.
 */
export const GET = route(async () => {
  const a = await requireAuth();
  const mosqueId = a.mosque.id;
  const nowPeriod = periodOf(new Date(), a.mosque.timezone);
  const periods = periodsBetween(a.mosque.startMonth, nowPeriod).reverse(); // latest first

  // Get all members
  const members = await db.membership.findMany({
    where: { mosqueId, status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, loginId: true } },
      role: { select: { key: true, name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  // Get all payments and dues in one query
  const [payments, dues] = await Promise.all([
    db.payment.findMany({
      where: { mosqueId, status: "VERIFIED" },
      select: { membershipId: true, period: true, amount: true },
    }),
    db.monthlyDue.findMany({
      where: { mosqueId },
      select: { membershipId: true, period: true, amount: true },
    }),
  ]);

  // Aggregate by member + period
  const paidMap: Record<string, number> = {};
  for (const p of payments) {
    if (!p.period) continue;
    const k = `${p.membershipId}:${p.period}`;
    paidMap[k] = (paidMap[k] || 0) + Number(p.amount);
  }

  const dueMap: Record<string, number> = {};
  for (const d of dues) {
    const k = `${d.membershipId}:${d.period}`;
    dueMap[k] = Number(d.amount);
  }

  const items = members.map((m) => {
    let memberTotalDue = 0;
    let memberTotalPaid = 0;

    const periodData = periods.map((period: string) => {
      const k = `${m.id}:${period}`;
      const due = dueMap[k] ?? Number(m.monthlyPledge);
      const paid = paidMap[k] ?? 0;
      const outstanding = Math.max(0, due - paid);

      memberTotalDue += due;
      memberTotalPaid += paid;

      return {
        period,
        due,
        paid,
        outstanding,
        status: paid >= due && due > 0 ? "PAID" as const : paid > 0 ? "PARTIAL" as const : due > 0 ? "UNPAID" as const : "EXEMPT" as const,
      };
    });

    return {
      membershipId: m.id,
      name: m.user.name,
      loginId: m.user.loginId,
      role: m.role.name,
      monthlyPledge: Number(m.monthlyPledge),
      totalDue: memberTotalDue,
      totalPaid: memberTotalPaid,
      totalOutstanding: Math.max(0, memberTotalDue - memberTotalPaid),
      periods: periodData,
    };
  });

  // Mosque-level grand totals
  const grandTotalDue = items.reduce((s, i) => s + i.totalDue, 0);
  const grandTotalPaid = items.reduce((s, i) => s + i.totalPaid, 0);
  const grandTotalOutstanding = Math.max(0, grandTotalDue - grandTotalPaid);

  return {
    periods,
    items,
    totals: {
      due: grandTotalDue,
      paid: grandTotalPaid,
      outstanding: grandTotalOutstanding,
      memberCount: items.length,
    },
  };
});
