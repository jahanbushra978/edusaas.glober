import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { periodOf } from "@/lib/period";
import type { AuthCtx } from "@/lib/auth";
import type { paymentSchema } from "@/lib/validation";
import { audit } from "./audit";

type Input = z.infer<typeof paymentSchema>;

/** Records a verified collection. Safe to retry: the idempotency key makes it exactly-once. */
export async function recordPayment(a: AuthCtx, input: Input) {
  const mosqueId = a.mosque.id;
  const current = periodOf(new Date(), a.mosque.timezone);
  if (input.period < a.mosque.startMonth || input.period > current) throw new HttpError(400, "INVALID_PERIOD");

  const find = () =>
    db.payment.findUnique({ where: { mosqueId_idempotencyKey: { mosqueId, idempotencyKey: input.idempotencyKey } } });

  const existing = await find();
  if (existing) return { payment: existing, duplicate: true };

  try {
    const payment = await db.$transaction(async (tx) => {
      const member = await tx.membership.findFirst({ where: { id: input.membershipId, mosqueId, status: "ACTIVE" } });
      if (!member) throw new HttpError(404, "MEMBER_NOT_FOUND");
      const fund = await tx.fund.findFirst({
        where: input.fundId ? { id: input.fundId, mosqueId } : { mosqueId, isMonthly: true },
      });
      if (!fund) throw new HttpError(404, "FUND_NOT_FOUND");
      if (!fund.isMonthly) throw new HttpError(400, "FUND_NOT_MONTHLY");

      const { receiptSeq } = await tx.mosque.update({
        where: { id: mosqueId },
        data: { receiptSeq: { increment: 1 } },
        select: { receiptSeq: true },
      });
      const receiptNo = `R-${input.period.slice(0, 4)}-${String(receiptSeq).padStart(5, "0")}`;
      const created = await tx.payment.create({
        data: {
          mosqueId,
          membershipId: member.id,
          fundId: fund.id,
          period: input.period,
          amount: input.amount,
          method: input.method,
          status: "VERIFIED",
          receiptNo,
          idempotencyKey: input.idempotencyKey,
          recordedById: a.user.id,
          note: input.note ?? null,
        },
      });
      await audit(tx, {
        mosqueId,
        actorId: a.user.id,
        action: "PAYMENT_RECORDED",
        entity: "Payment",
        entityId: created.id,
        meta: { membershipId: member.id, amount: input.amount, period: input.period, receiptNo },
      });
      return created;
    });
    return { payment, duplicate: false };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const again = await find();
      if (again) return { payment: again, duplicate: true };
    }
    throw e;
  }
}
