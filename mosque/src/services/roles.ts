import type { Prisma } from "@prisma/client";
import { HttpError } from "@/lib/errors";

type Tx = Prisma.TransactionClient;

/** A mosque must always keep at least one active member who can manage roles, or nobody could fix a mistake. */
export async function assertAdminRemains(tx: Tx, mosqueId: string) {
  const n = await tx.membership.count({
    where: { mosqueId, status: "ACTIVE", role: { permissions: { has: "roles.manage" } } },
  });
  if (n < 1) throw new HttpError(409, "LAST_ADMIN");
}
