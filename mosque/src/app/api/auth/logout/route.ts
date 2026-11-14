export const dynamic = "force-dynamic";
import { route } from "@/lib/http";
import { clearSession } from "@/lib/session";

export const POST = route(async () => {
  clearSession();
  return { ok: true };
});
