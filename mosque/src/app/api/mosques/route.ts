export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { DEFAULT_ROLES } from "@/lib/permissions";
import { periodOf } from "@/lib/period";
import { createSession } from "@/lib/session";
import { mosqueCreateSchema } from "@/lib/validation";
import { audit } from "@/services/audit";
import { rateLimit } from "@/lib/rateLimit";

/** Public: lets a visitor pick their mosque when signing up. Exposes name and slug only. */
export const GET = route(async (req: NextRequest) => {
  rateLimit(`mosques:${req.headers.get("x-forwarded-for") ?? "local"}`, 60, 60_000);
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  const mosques = await db.mosque.findMany({
    where: { status: "ACTIVE", ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
    take: 20,
  });
  return { mosques };
});

/** Dynamic tenants: anyone can open a new mosque and becomes its first administrator (president role, ACTIVE). */
export const POST = route(async (req: NextRequest) => {
  rateLimit(`mosque-create:${req.headers.get("x-forwarded-for") ?? "local"}`, 5, 60 * 60_000);
  const input = mosqueCreateSchema.parse(await jsonBody(req));
  if (await db.mosque.findUnique({ where: { slug: input.mosqueSlug } })) throw new HttpError(409, "SLUG_TAKEN");
  if (await db.user.findUnique({ where: { loginId: input.loginId } })) throw new HttpError(409, "LOGIN_ID_TAKEN");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const startMonth = input.startMonth ?? periodOf(new Date(), "Asia/Dhaka");
  const { user, mosqueId } = await db.$transaction(async (tx) => {
    const mosque = await tx.mosque.create({ data: { slug: input.mosqueSlug, name: input.mosqueName, startMonth } });
    const roleIds: Record<string, string> = {};
    for (const r of DEFAULT_ROLES) {
      const row = await tx.role.create({ data: { mosqueId: mosque.id, key: r.key, name: r.name, permissions: r.permissions, isSystem: true } });
      roleIds[r.key] = row.id;
    }
    await tx.fund.create({ data: { mosqueId: mosque.id, name: "General fund", isMonthly: true } });
    const u = await tx.user.create({ data: { loginId: input.loginId, name: input.name, passwordHash } });
    const m = await tx.membership.create({ data: { mosqueId: mosque.id, userId: u.id, roleId: roleIds.president!, status: "ACTIVE" } });
    await audit(tx, { mosqueId: mosque.id, actorId: u.id, action: "MOSQUE_CREATED", entity: "Mosque", entityId: mosque.id });
    await audit(tx, { mosqueId: mosque.id, actorId: u.id, action: "MEMBER_REGISTERED", entity: "Membership", entityId: m.id });
    return { user: u, mosqueId: mosque.id };
  });
  await createSession(user.id, mosqueId);
  return { ok: true };
});
