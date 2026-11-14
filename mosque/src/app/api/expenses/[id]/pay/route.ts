export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonBody, route } from "@/lib/http";
import { paySchema } from "@/lib/validation";
import { payExpense } from "@/services/expenses";

export const POST = route<{ params: { id: string } }>(async (req: NextRequest, { params }) => {
  const a = await requireAuth();
  return payExpense(a, params.id, paySchema.parse(await jsonBody(req)).paymentRef);
});
