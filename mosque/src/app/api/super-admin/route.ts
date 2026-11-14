export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonBody, route } from "@/lib/http";
import { z } from "zod";

const patchSchema = z.object({
  mosqueId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const GET = route(async () => {
  const a = await requireAuth();

  const mosques = await db.mosque.findMany({
    include: {
      _count: {
        select: { memberships: true, payments: true, expenses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUsers = await db.user.count();
  const totalMosques = mosques.length;
  const activeMosques = mosques.filter((m) => m.status === "ACTIVE").length;

  return {
    currentMosqueId: a.mosque.id,
    stats: {
      totalMosques,
      activeMosques,
      suspendedMosques: totalMosques - activeMosques,
      totalUsers,
    },
    mosques: mosques.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      currency: m.currency,
      startMonth: m.startMonth,
      status: m.status,
      membersCount: m._count.memberships,
      paymentsCount: m._count.payments,
      createdAt: m.createdAt.toISOString(),
    })),
  };
});

export const PATCH = route(async (req: NextRequest) => {
  await requireAuth();
  const { mosqueId, status } = patchSchema.parse(await jsonBody(req));

  const updated = await db.mosque.update({
    where: { id: mosqueId },
    data: { status },
  });

  return { ok: true, mosque: updated };
});
