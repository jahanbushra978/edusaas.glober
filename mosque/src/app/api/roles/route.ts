export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth, requirePerm } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { roleCreateSchema } from "@/lib/validation";
import { audit } from "@/services/audit";

export const GET = route(async () => {
  const a = await requireAuth();
  if (!a.perms.has("members.manage") && !a.perms.has("roles.manage")) throw new HttpError(403, "FORBIDDEN");
  const roles = await db.role.findMany({
    where: { mosqueId: a.mosque.id },
    select: { id: true, key: true, name: true, permissions: true, isSystem: true },
    orderBy: { name: "asc" },
  });
  return { roles };
});

/** Dynamic roles: a mosque composes its own role from the permission list. */
export const POST = route(async (req: NextRequest) => {
  const a = await requirePerm("roles.manage");
  const input = roleCreateSchema.parse(await jsonBody(req));
  const key = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `role-${Date.now()}`;
  if (await db.role.findUnique({ where: { mosqueId_key: { mosqueId: a.mosque.id, key } } })) {
    throw new HttpError(409, "ROLE_EXISTS");
  }
  const role = await db.role.create({
    data: { mosqueId: a.mosque.id, key, name: input.name, permissions: input.permissions },
  });
  await audit(db, { mosqueId: a.mosque.id, actorId: a.user.id, action: "ROLE_CREATED", entity: "Role", entityId: role.id });
  return { id: role.id };
});
