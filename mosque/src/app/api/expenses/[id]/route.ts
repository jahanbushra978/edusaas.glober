export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { route } from "@/lib/http";
import { getExpense } from "@/services/expenses";

export const GET = route<{ params: { id: string } }>(async (_req, { params }) => getExpense(await requireAuth(), params.id));
