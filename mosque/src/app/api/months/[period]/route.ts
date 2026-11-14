export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { canViewContributors, requireAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { route } from "@/lib/http";
import { isPeriod, periodOf } from "@/lib/period";
import { ensureDues } from "@/services/dues";
import { monthPeople, monthsOverview } from "@/services/reports";

type Ctx = { params: { period: string } };
const FILTERS = ["all", "paid", "partial", "unpaid"] as const;

/** Who paid and who is due in one month. Names are shown only when the mosque allows it. */
export const GET = route<Ctx>(async (req: NextRequest, { params }) => {
  const a = await requireAuth();
  const { period } = params;
  if (!isPeriod(period) || period < a.mosque.startMonth || period > periodOf(new Date(), a.mosque.timezone)) {
    throw new HttpError(404, "NOT_FOUND");
  }
  await ensureDues(a.mosque);
  const sp = req.nextUrl.searchParams;
  const filter = FILTERS.find((f) => f === sp.get("filter")) ?? "all";
  const q = (sp.get("q") ?? "").trim().slice(0, 60);
  const [summary] = await monthsOverview(a.mosque.id, period, period);
  if (!canViewContributors(a)) return { period, summary: summary ?? null, items: [], nextCursor: null, restricted: true };
  const page = await monthPeople(a.mosque.id, period, filter, sp.get("cursor"), 20, q);
  return { period, summary: summary ?? null, ...page, restricted: false };
});
