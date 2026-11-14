export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth, requirePerm } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonBody, route } from "@/lib/http";
import { fundCreateSchema } from "@/lib/validation";
import { audit } from "@/services/audit";

export const GET = route(async () => {
  const a = await requireAuth();
  const funds = await db.fund.findMany({
    where: { mosqueId: a.mosque.id },
    select: { id: true, name: true, restricted: true, isMonthly: true },
    orderBy: { createdAt: "asc" },
  });
  return { funds };
});

export const POST = route(async (req: NextRequest) => {
  const a = await requirePerm("roles.manage");
  const input = fundCreateSchema.parse(await jsonBody(req));
  const fund = await db.$transaction(async (tx) => {
    const f = await tx.fund.create({ data: { mosqueId: a.mosque.id, name: input.name, restricted: input.restricted ?? false } });
    await audit(tx, { mosqueId: a.mosque.id, actorId: a.user.id, action: "FUND_CREATED", entity: "Fund", entityId: f.id });
    return f;
  });
  return { id: fund.id };
});
