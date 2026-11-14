export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { route } from "@/lib/http";

/** A receipt is visible to the member it belongs to and to roles that record or review collections. */
export const GET = route<{ params: { id: string } }>(async (_req, { params }) => {
  const a = await requireAuth();
  const p = await db.payment.findFirst({
    where: { id: params.id, mosqueId: a.mosque.id },
    include: { fund: { select: { name: true } }, recordedBy: { select: { name: true } }, membership: { select: { id: true, user: { select: { name: true } } } } },
  });
  const allowed = p && (p.membershipId === a.membership.id || a.perms.has("payments.record") || a.perms.has("finance.view_all"));
  if (!p || !allowed) throw new HttpError(404, "NOT_FOUND");
  return {
    receiptNo: p.receiptNo, mosque: a.mosque.name, currency: a.mosque.currency, member: p.membership.user.name,
    amount: Number(p.amount), period: p.period, method: p.method, status: p.status, fund: p.fund.name,
    collector: p.recordedBy.name, paidAt: p.paidAt.toISOString(),
  };
});
