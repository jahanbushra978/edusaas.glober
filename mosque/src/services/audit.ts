import { Prisma, PrismaClient } from "@prisma/client";

type Client = PrismaClient | Prisma.TransactionClient;

export type AuditEvent = {
  mosqueId: string | null;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  meta?: Prisma.InputJsonValue;
};

/** Append-only; a database trigger rejects UPDATE/DELETE on this table. */
export async function audit(client: Client, e: AuditEvent) {
  await client.auditLog.create({ data: { ...e, meta: e.meta ?? Prisma.JsonNull } });
}
