export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import { audit } from "@/services/audit";

export const POST = route(async (req: NextRequest) => {
  rateLimit(`register:${req.headers.get("x-forwarded-for") ?? "local"}`, 10, 15 * 60_000);
  const input = registerSchema.parse(await jsonBody(req));
  const mosque = await db.mosque.findUnique({ where: { slug: input.mosqueSlug } });
  if (!mosque || mosque.status !== "ACTIVE") throw new HttpError(404, "MOSQUE_NOT_FOUND");
  if (await db.user.findUnique({ where: { loginId: input.loginId } })) throw new HttpError(409, "LOGIN_ID_TAKEN");
  const role = await db.role.findUnique({ where: { mosqueId_key: { mosqueId: mosque.id, key: "member" } } });
  if (!role) throw new HttpError(500, "MEMBER_ROLE_MISSING");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const status = mosque.requireVerification ? "PENDING" : "ACTIVE";
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { loginId: input.loginId, name: input.name, passwordHash } });
    const m = await tx.membership.create({ data: { mosqueId: mosque.id, userId: u.id, roleId: role.id, status } });
    await audit(tx, { mosqueId: mosque.id, actorId: u.id, action: "MEMBER_REGISTERED", entity: "Membership", entityId: m.id });
    return u;
  });
  await createSession(user.id, mosque.id);
  return { ok: true, status };
});
