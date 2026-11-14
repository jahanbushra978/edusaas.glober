export const dynamic = "force-dynamic";
import { requireAuth, toMe } from "@/lib/auth";
import { route } from "@/lib/http";

export const GET = route(async () => toMe(await requireAuth({ allowPending: true })));
