export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { route } from "@/lib/http";

/** The signed-in user's own notifications, newest first (keyset on createdAt,id). */
export const GET = route(async (req: NextRequest) => {
  const a = await requireAuth();
  const limit = 20;
  const raw = req.nextUrl.searchParams.get("cursor");
  let cur: { t: Date; i: string } | null = null;
  if (raw) {
    try {
      const v = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
      cur = { t: new Date(v.t), i: String(v.i) };
    } catch { /* ignore */ }
  }
  const where = { userId: a.user.id, mosqueId: a.mosque.id };
  const [rows, unread] = await Promise.all([
    db.notification.findMany({
      where: { ...where, ...(cur ? { OR: [{ createdAt: { lt: cur.t } }, { createdAt: cur.t, id: { lt: cur.i } }] } : {}) },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    }),
    db.notification.count({ where: { ...where, readAt: null } }),
  ]);
  const last = rows[limit - 1];
  return {
    unread,
    items: rows.slice(0, limit).map((n) => ({ id: n.id, kind: n.kind, data: n.data, link: n.link, read: !!n.readAt, createdAt: n.createdAt.toISOString() })),
    nextCursor: rows.length > limit && last ? Buffer.from(JSON.stringify({ t: last.createdAt, i: last.id })).toString("base64url") : null,
  };
});
