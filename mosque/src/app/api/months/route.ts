export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { route } from "@/lib/http";
import { maxPeriod, minPeriod, periodOf } from "@/lib/period";
import { ensureDues } from "@/services/dues";
import { monthsOverview } from "@/services/reports";

/** Month totals for a year. Aggregates are published to all active members. */
export const GET = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const current = periodOf(new Date(), a.mosque.timezone);
  const year = Number(req.nextUrl.searchParams.get("year") ?? current.slice(0, 4));
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new HttpError(400, "INVALID_YEAR");
  await ensureDues(a.mosque);
  const from = maxPeriod(`${year}-01`, a.mosque.startMonth);
  const to = minPeriod(`${year}-12`, current);
  return {
    year,
    currentPeriod: current,
    startYear: Number(a.mosque.startMonth.slice(0, 4)),
    months: (await monthsOverview(a.mosque.id, from, to)).reverse(),
  };
});
