import { NextResponse } from "next/server";
import { getCloudinaryVideoConfig, signCloudinaryParams } from "../../../../src/lib/cloudinary-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

/**
 * POST /api/uploads/sign-video
 *
 * Returns signed Cloudinary upload parameters so the browser can upload
 * large video files directly to Cloudinary without proxying through this
 * server.  Only authenticated admin / branch_admin / boarding_manager
 * users are allowed.
 */
export async function POST(request) {
  try {
    // ── CSRF origin check (production only) ──
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json(
        { ok: false, message: "Invalid request origin." },
        { status: 403 },
      );
    }

    // ── Rate limiting ──
    if (
      !checkRateLimit(`sign-video:${getClientIp(request)}`, {
        windowMs: 60_000,
        max: 20,
      })
    ) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please slow down." },
        { status: 429 },
      );
    }

    // ── Auth ──
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (
      !session ||
      (session.role !== "admin" &&
        session.role !== "branch_admin" &&
        session.role !== "boarding_manager")
    ) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // ── Read the lightweight JSON body ──
    const body = await request.json().catch(() => ({}));
    const folder = String(body.folder || "videos");

    // ── Build signed params for YouTube-like video optimization ──
    const { cloudName, apiKey, apiSecret } = getCloudinaryVideoConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    // YouTube-style auto optimization & strict re-compression:
    // w_1280,h_720,c_limit (max 720p HD), q_auto:eco (economical auto quality compression),
    // br_2m (max 2 Mbps bitrate ceiling ensuring final size is under 400MB), f_mp4
    const eager = "w_1280,h_720,c_limit,q_auto:eco,vc_auto,br_2m,f_mp4";
    const eager_async = "true";

    const signParams = { eager, eager_async, folder, timestamp };
    const signature = signCloudinaryParams(signParams, apiSecret);

    return NextResponse.json({
      ok: true,
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      eager,
      eager_async,
    });
  } catch (error) {
    console.error("[sign-video] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate upload signature.",
      },
      { status: 500 },
    );
  }
}
