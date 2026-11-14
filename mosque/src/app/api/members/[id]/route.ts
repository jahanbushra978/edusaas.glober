export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { canViewContributors, requireAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { jsonBody, route } from "@/lib/http";
import { periodOf } from "@/lib/period";
import { memberPatchSchema } from "@/lib/validation";
import { ensureDues } from "@/services/dues";
import { deleteMember, updateMember } from "@/services/members";
import { memberStatement } from "@/services/reports";

type Ctx = { params: { id: string } };

/** `id` may be "me". Anyone can read their own account; others need contributor visibility. */
export const GET = route<Ctx>(async (_req, { params }) => {
  const a = await requireAuth();
  const id = params.id === "me" ? a.membership.id : params.id;
  if (id !== a.membership.id && !canViewContributors(a)) throw new HttpError(403, "FORBIDDEN");
  await ensureDues(a.mosque);
  const statement = await memberStatement(a.mosque.id, id, periodOf(new Date(), a.mosque.timezone));
  return { ...statement, canManage: a.perms.has("members.manage"), canRecord: a.perms.has("payments.record") };
});

export const PATCH = route<Ctx>(async (req: NextRequest, { params }) => {
  const a = await requireAuth();
  return updateMember(a, params.id, memberPatchSchema.parse(await jsonBody(req)));
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const a = await requireAuth();
  return deleteMember(a, params.id);
});
