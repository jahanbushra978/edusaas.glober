export const dynamic = "force-dynamic";
import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { HttpError } from "@/lib/errors";
import { route } from "@/lib/http";
import { runReminders } from "@/services/reminders";

/** Call every few minutes from a scheduler (cron, Vercel Cron, systemd timer): Authorization: Bearer $CRON_SECRET */
export const POST = route(async (req: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  if (!secret || secret.length < 16) throw new HttpError(503, "CRON_NOT_CONFIGURED");
  const a = Buffer.from(given), b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpError(401, "UNAUTHENTICATED");
  return runReminders();
});
