import { NextResponse } from "next/server";
import {
  verifyPlatformSession,
  getPlatformCookieConfig,
  recordPlatformAudit,
} from "@/lib/platform-auth";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await verifyPlatformSession(request);
  const ipAddress = getClientIp(request);

  if (session) {
    await recordPlatformAudit({
      actorEmail: session.email,
      action: "PLATFORM_LOGOUT",
      targetType: "AUTH",
      details: {},
      ipAddress,
    });
  }

  const response = NextResponse.json({ ok: true });
  const cookieConfig = getPlatformCookieConfig();
  response.cookies.set(cookieConfig.name, "", {
    ...cookieConfig,
    maxAge: 0,
  });

  return response;
}
