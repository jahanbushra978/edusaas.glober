export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { jsonBody, route } from "@/lib/http";
import { updateMemberCredentials } from "@/services/members";

export const POST = route<{ params: { id: string } }>(async (req: NextRequest, { params }) => {
  const a = await requireAuth();
  const body = (await jsonBody(req)) as { loginId?: string; password?: string };
  return updateMemberCredentials(a, params.id, body || {});
});
