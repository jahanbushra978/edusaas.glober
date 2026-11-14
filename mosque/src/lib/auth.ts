import { db } from "./db";
import { HttpError } from "./errors";
import { readSession } from "./session";
import type { Permission } from "./permissions";

export type AuthCtx = {
  user: { id: string; name: string };
  membership: { id: string; status: "PENDING" | "ACTIVE" | "SUSPENDED" };
  role: { key: string; name: string };
  mosque: {
    id: string;
    slug: string;
    name: string;
    currency: string;
    timezone: string;
    startMonth: string;
    showContributors: boolean;
  };
  perms: Set<string>;
};

/** Always re-reads role and status from the database; the cookie only carries identity. */
export async function getAuth(): Promise<AuthCtx | null> {
  const s = await readSession();
  if (!s) return null;
  const m = await db.membership.findFirst({
    where: { userId: s.userId, mosqueId: s.mosqueId },
    include: { user: true, role: true, mosque: true },
  });
  if (!m || m.status === "SUSPENDED" || m.mosque.status !== "ACTIVE") return null;
  return {
    user: { id: m.user.id, name: m.user.name },
    membership: { id: m.id, status: m.status },
    role: { key: m.role.key, name: m.role.name },
    mosque: {
      id: m.mosque.id,
      slug: m.mosque.slug,
      name: m.mosque.name,
      currency: m.mosque.currency,
      timezone: m.mosque.timezone,
      startMonth: m.mosque.startMonth,
      showContributors: m.mosque.showContributors,
    },
    perms: new Set(m.role.permissions),
  };
}

export async function requireAuth(opts: { allowPending?: boolean } = {}): Promise<AuthCtx> {
  const a = await getAuth();
  if (!a) throw new HttpError(401, "UNAUTHENTICATED");
  if (!opts.allowPending && a.membership.status !== "ACTIVE") throw new HttpError(403, "PENDING_VERIFICATION");
  return a;
}

export async function requirePerm(...perms: Permission[]): Promise<AuthCtx> {
  const a = await requireAuth();
  if (!perms.some((p) => a.perms.has(p))) throw new HttpError(403, "FORBIDDEN");
  return a;
}

/** Contributor names are private unless the mosque opted in or the role is a finance role. */
export function canViewContributors(a: AuthCtx): boolean {
  return (
    a.mosque.showContributors ||
    a.perms.has("finance.view_all") ||
    a.perms.has("members.view") ||
    a.perms.has("members.manage")
  );
}

/** Serializable identity summary shared by /api/me and the app shell. */
export function toMe(a: AuthCtx) {
  return {
    user: a.user,
    membershipId: a.membership.id,
    status: a.membership.status,
    role: a.role,
    mosque: a.mosque,
    permissions: [...a.perms],
    canViewContributors: a.membership.status === "ACTIVE" && canViewContributors(a),
  };
}
export type Me = ReturnType<typeof toMe>;
