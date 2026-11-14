export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonBody, route } from "@/lib/http";
import { expenseSchema } from "@/lib/validation";
import { createExpense, listExpenses } from "@/services/expenses";

export const GET = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const sp = req.nextUrl.searchParams;
  return listExpenses(a, sp.get("cursor"), sp.get("status"));
});

export const POST = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const e = await createExpense(a, expenseSchema.parse(await jsonBody(req)));
  return { id: e.id, voucherNo: e.voucherNo };
});
