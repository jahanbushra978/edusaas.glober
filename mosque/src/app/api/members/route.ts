export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { canViewContributors, requireAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { periodOf } from "@/lib/period";
import { ensureDues } from "@/services/dues";
import { createMember } from "@/services/members";
import { memberList } from "@/services/reports";

export const GET = route(async (req: NextRequest) => {
  const a = await requireAuth();
  if (!canViewContributors(a)) throw new HttpError(403, "FORBIDDEN");
  await ensureDues(a.mosque);
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 60);
  return memberList(a.mosque.id, periodOf(new Date(), a.mosque.timezone), q, sp.get("cursor"));
});

export const POST = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const body = (await jsonBody(req)) as any;
  return createMember(a, body);
});
