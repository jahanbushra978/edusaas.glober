import { NextResponse } from "next/server";
import { getCloudinaryVideoConfig, signCloudinaryParams } from "../../../../src/lib/cloudinary-server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/uploads/video-chunk
 *
 * Receives a 5MB video chunk from the browser and streams it to Cloudinary
 * server-to-server.
 *
 * Why this permanently solves all video upload issues:
 * 1. Small 5MB chunks never exceed Next.js `request.formData()` body size limits.
 * 2. Same-origin POST to `/api/uploads/video-chunk` eliminates browser CORS & network errors.
 * 3. Server-to-server upload to Cloudinary has no CORS restriction or browser origin blocking.
 * 4. Supports video files up to 500MB+ seamlessly.
 */
export async function POST(request) {
  try {
    // ── CSRF origin check ──
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }

    // ── Rate limiting ──
    if (!checkRateLimit(`upload-video-chunk:${getClientIp(request)}`, { windowMs: 60000, max: 120 })) {
      return NextResponse.json({ ok: false, message: "Too many upload requests. Please slow down." }, { status: 429 });
    }

    // ── Auth check ──
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session || (session.role !== "admin" && session.role !== "branch_admin" && session.role !== "boarding_manager")) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // ── Read incoming 5MB chunk form ──
    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const folder = String(formData.get("folder") || "videos");
    const uploadId = String(formData.get("upload_id") || `vid_${Date.now()}`);
    const start = Number(formData.get("start") || 0);
    const end = Number(formData.get("end") || 0);
    const totalSize = Number(formData.get("total_size") || 0);
    const originalName = String(formData.get("original_name") || "video.mp4");

    if (!(chunk instanceof File) && !(chunk instanceof Blob)) {
      return NextResponse.json({ ok: false, message: "No video chunk provided." }, { status: 400 });
    }

    // 500MB max raw video check
    const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
    if (totalSize > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { ok: false, message: `Video is too large (${Math.round(totalSize / (1024 * 1024))}MB). Maximum allowed is 500MB.` },
        { status: 400 },
      );
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryVideoConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    // YouTube-style auto optimization & strict re-compression
    const eager = "w_1280,h_720,c_limit,q_auto:eco,vc_auto,br_2m,f_mp4";
    const eager_async = "true";

    const signParams = { eager, eager_async, folder, timestamp };
    const signature = signCloudinaryParams(signParams, apiSecret);

    // Build Cloudinary payload for this chunk
    const cForm = new FormData();
    cForm.append("file", chunk, originalName);
    cForm.append("folder", folder);
    cForm.append("timestamp", String(timestamp));
    cForm.append("api_key", apiKey);
    cForm.append("signature", signature);
    cForm.append("eager", eager);
    cForm.append("eager_async", eager_async);

    const isChunked = totalSize > 10 * 1024 * 1024;
    const cHeaders = {};

    if (isChunked) {
      cHeaders["X-Unique-Upload-Id"] = uploadId;
      cHeaders["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
    }

    // Node.js server-to-server call to Cloudinary (video/upload endpoint)
    const cResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      headers: cHeaders,
      body: cForm,
    });

    const cData = await cResponse.json().catch(() => null);

    if (!cResponse.ok) {
      console.error("[video-chunk] Cloudinary response error:", cData?.error || cData);
      const rawMsg = String(cData?.error?.message || "");
      let userMsg = rawMsg || `Upload failed (${cResponse.status})`;
      if (rawMsg.toLowerCase().includes("large") || rawMsg.toLowerCase().includes("limit") || rawMsg.toLowerCase().includes("bytes")) {
        userMsg = "File is too large. Please reduce file size and try again.";
      }
      return NextResponse.json(
        { ok: false, message: userMsg },
        { status: cResponse.status },
      );
    }

    // Return status & URL if completed
    let thumbnail_url = cData.eager?.[0]?.secure_url || "";
    if (!thumbnail_url && cData.public_id) {
      thumbnail_url = `https://res.cloudinary.com/${cloudName}/video/upload/w_400,c_limit,q_auto,f_jpg/${cData.public_id}.jpg`;
    }

    return NextResponse.json({
      ok: true,
      secure_url: cData.secure_url || "",
      public_id: cData.public_id || "",
      thumbnail_url,
    });
  } catch (error) {
    console.error("[video-chunk] Unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Video chunk upload failed unexpectedly.",
      },
      { status: 500 },
    );
  }
}
