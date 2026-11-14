export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { route } from "@/lib/http";
import { fundDetail } from "@/services/funds";

export const GET = route<{ params: { id: string } }>(async (_req, { params }) => {
  const d = await fundDetail(await requireAuth(), params.id);
  if (!d) throw new HttpError(404, "NOT_FOUND");
  return d;
});
