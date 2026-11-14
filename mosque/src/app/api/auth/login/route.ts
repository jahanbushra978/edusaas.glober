export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { rateLimit } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

// Hash computed once so an unknown account takes as long as a wrong password.
const DUMMY = bcrypt.hashSync("not-a-real-password", 12);

export const POST = route(async (req: NextRequest) => {
  const input = loginSchema.parse(await jsonBody(req));
  rateLimit(`login:${input.loginId}`, 8, 15 * 60_000);
  rateLimit(`login-ip:${req.headers.get("x-forwarded-for") ?? "local"}`, 40, 15 * 60_000);

  const user = await db.user.findUnique({ where: { loginId: input.loginId } });
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY);
  const membership = user
    ? await db.membership.findFirst({ where: { userId: user.id, mosque: { slug: input.mosqueSlug, status: "ACTIVE" } } })
    : null;
  if (!user || !ok || !membership || membership.status === "SUSPENDED") throw new HttpError(401, "INVALID_CREDENTIALS");
  await createSession(user.id, membership.mosqueId);
  return { ok: true, status: membership.status };
});
