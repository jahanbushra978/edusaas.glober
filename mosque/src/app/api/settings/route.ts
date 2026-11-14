export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requirePerm } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonBody, route } from "@/lib/http";
import { settingsSchema } from "@/lib/validation";
import { audit } from "@/services/audit";

export const GET = route(async () => {
  const a = await requirePerm("roles.manage", "members.manage");
  const m = await db.mosque.findUniqueOrThrow({ where: { id: a.mosque.id } });
  return { name: m.name, slug: m.slug, currency: m.currency, timezone: m.timezone, startMonth: m.startMonth, showContributors: m.showContributors, requireVerification: m.requireVerification };
});

export const PATCH = route(async (req: NextRequest) => {
  const a = await requirePerm("roles.manage");
  const input = settingsSchema.parse(await jsonBody(req));
  await db.$transaction(async (tx) => {
    await tx.mosque.update({ where: { id: a.mosque.id }, data: input });
    await audit(tx, { mosqueId: a.mosque.id, actorId: a.user.id, action: "SETTINGS_UPDATED", entity: "Mosque", entityId: a.mosque.id, meta: input });
  });
  return { ok: true };
});
