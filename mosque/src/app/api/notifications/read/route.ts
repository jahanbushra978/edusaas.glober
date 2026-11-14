export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { route } from "@/lib/http";

export const POST = route(async () => {
  const a = await requireAuth();
  const r = await db.notification.updateMany({ where: { userId: a.user.id, mosqueId: a.mosque.id, readAt: null }, data: { readAt: new Date() } });
  return { marked: r.count };
});
