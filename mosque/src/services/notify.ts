import { Prisma, PrismaClient } from "@prisma/client";

type Client = PrismaClient | Prisma.TransactionClient;

/** Active members of a mosque whose role holds `permission`. */
export async function usersWithPermission(client: Client, mosqueId: string, permission: string, excludeUserId?: string) {
  const rows = await client.membership.findMany({
    where: { mosqueId, status: "ACTIVE", role: { permissions: { has: permission } } },
    select: { userId: true },
  });
  return [...new Set(rows.map((r) => r.userId))].filter((id) => id !== excludeUserId);
}

/** Creates in-app notifications. Returns how many were created. */
export async function notify(
  client: Client,
  mosqueId: string,
  userIds: string[],
  n: { kind: string; data: Prisma.InputJsonValue; link?: string },
): Promise<number> {
  if (!userIds.length) return 0;
  const r = await client.notification.createMany({
    data: userIds.map((userId) => ({ mosqueId, userId, kind: n.kind, data: n.data, link: n.link ?? null })),
  });
  return r.count;
}
