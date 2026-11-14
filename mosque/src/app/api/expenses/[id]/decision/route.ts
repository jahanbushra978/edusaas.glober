export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonBody, route } from "@/lib/http";
import { decisionSchema } from "@/lib/validation";
import { decideExpense } from "@/services/expenses";

export const POST = route<{ params: { id: string } }>(async (req: NextRequest, { params }) => {
  const a = await requireAuth();
  const { decision, reason, approverSignature } = decisionSchema.parse(await jsonBody(req));
  return decideExpense(a, params.id, decision, reason, approverSignature);
});
