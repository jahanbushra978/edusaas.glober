export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requirePerm } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { rolePatchSchema } from "@/lib/validation";
import { audit } from "@/services/audit";
import { assertAdminRemains } from "@/services/roles";

type Ctx = { params: { id: string } };

export const PATCH = route<Ctx>(async (req: NextRequest, { params }) => {
  const a = await requirePerm("roles.manage");
  const input = rolePatchSchema.parse(await jsonBody(req));
  const role = await db.role.findFirst({ where: { id: params.id, mosqueId: a.mosque.id } });
  if (!role) throw new HttpError(404, "NOT_FOUND");
  await db.$transaction(async (tx) => {
    await tx.role.update({ where: { id: role.id }, data: { name: input.name, permissions: input.permissions } });
    await assertAdminRemains(tx, a.mosque.id);
    await audit(tx, {
      mosqueId: a.mosque.id, actorId: a.user.id, action: "ROLE_UPDATED", entity: "Role", entityId: role.id,
      meta: { before: { name: role.name, permissions: role.permissions }, after: input },
    });
  });
  return { ok: true };
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const a = await requirePerm("roles.manage");
  const role = await db.role.findFirst({ where: { id: params.id, mosqueId: a.mosque.id }, include: { _count: { select: { memberships: true } } } });
  if (!role) throw new HttpError(404, "NOT_FOUND");
  if (role.isSystem) throw new HttpError(409, "ROLE_IS_SYSTEM");
  if (role._count.memberships > 0) throw new HttpError(409, "ROLE_IN_USE");
  await db.$transaction(async (tx) => {
    await tx.role.delete({ where: { id: role.id } });
    await audit(tx, { mosqueId: a.mosque.id, actorId: a.user.id, action: "ROLE_DELETED", entity: "Role", entityId: role.id, meta: { name: role.name } });
  });
  return { ok: true };
});
