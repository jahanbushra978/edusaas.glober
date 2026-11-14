export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requirePerm } from "@/lib/auth";
import { jsonBody, route } from "@/lib/http";
import { paymentSchema } from "@/lib/validation";
import { recordPayment } from "@/services/payments";

export const POST = route(async (req: NextRequest) => {
  const a = await requirePerm("payments.record");
  const { payment, duplicate } = await recordPayment(a, paymentSchema.parse(await jsonBody(req)));
  return { id: payment.id, receiptNo: payment.receiptNo, duplicate };
});
