export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/auth";
import { route } from "@/lib/http";
import { dashboard } from "@/services/reports";

export const GET = route(async () => dashboard(await requireAuth()));
