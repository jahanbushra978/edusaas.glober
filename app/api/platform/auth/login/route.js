import { NextResponse } from "next/server";
import {
  verifyPlatformCredentials,
  createPlatformToken,
  getPlatformCookieConfig,
  recordPlatformAudit,
} from "@/lib/platform-auth";
import { getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    const ipAddress = getClientIp(request);

    const verification = await verifyPlatformCredentials(email, password);

    if (!verification.ok) {
      await recordPlatformAudit({
        actorEmail: email,
        action: "PLATFORM_LOGIN_FAILED",
        targetType: "AUTH",
        details: { reason: verification.message },
        ipAddress,
      });

      return NextResponse.json(
        { ok: false, message: verification.message || "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await createPlatformToken(verification.owner);
    await recordPlatformAudit({
      actorEmail: verification.owner.email,
      action: "PLATFORM_LOGIN_SUCCESS",
      targetType: "AUTH",
      details: { role: verification.owner.role },
      ipAddress,
    });

    const response = NextResponse.json({
      ok: true,
      owner: verification.owner,
    });

    const cookieConfig = getPlatformCookieConfig();
    response.cookies.set(cookieConfig.name, token, cookieConfig);

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
