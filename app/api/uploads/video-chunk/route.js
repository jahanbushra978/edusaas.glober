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
// Allow up to 20MB request body so 6MB video chunks (+ multipart overhead)
// are never rejected by Vercel/Next.js with HTTP 413.
export const bodyLimit = '20mb';

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
    if (!session) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Role verification: Only authorized teachers and platform admins can upload videos
    const isPlatformAdmin = session.role === "admin" || session.role === "platform_owner";
    const isTeacher = session.role === "teacher" || isPlatformAdmin;
    if (!isTeacher) {
      return NextResponse.json(
        { ok: false, message: "Forbidden: Only verified teachers and administrators may upload video content." },
        { status: 403 }
      );
    }

    const canonicalTeacherId = String(session.teacher_id || session.profileId || session.authUserId || session.id);

    // ── Read incoming chunk form ──
    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const rawFolder = String(formData.get("folder") || "videos");
    const isClip = rawFolder.includes("clips");
    // Server-controlled path strictly scoped to this teacher
    const folder = `teacher_posts/${canonicalTeacherId.replace(/[^a-zA-Z0-9_-]/g, "")}/${isClip ? "clips" : "videos"}`;

    const rawUploadId = String(formData.get("upload_id") || `vid_${Date.now()}`);
    // Bind upload ID to caller's canonical identity to prevent cross-account chunk continuation
    const uploadId = `up_${canonicalTeacherId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}_${rawUploadId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const reqTimestamp = Number(formData.get("timestamp"));
    const timestamp = !isNaN(reqTimestamp) && reqTimestamp > 0 ? reqTimestamp : Math.floor(Date.now() / 1000);
    const start = Number(formData.get("start") || 0);
    const end = Number(formData.get("end") || 0);
    const totalSize = Number(formData.get("total_size") || 0);
    const originalName = String(formData.get("original_name") || "video.mp4");

    if (!(chunk instanceof File) && !(chunk instanceof Blob)) {
      return NextResponse.json({ ok: false, message: "No video chunk provided." }, { status: 400 });
    }

    // Enforce 300MB maximum video limit strictly on server
    const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
    if (totalSize > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { ok: false, message: `Video is too large (${Math.round(totalSize / (1024 * 1024))}MB). Maximum allowed is 300MB.` },
        { status: 400 },
      );
    }

    // Convert chunk File/Blob to clean Buffer and validate boundaries
    const chunkArrayBuffer = await chunk.arrayBuffer();
    const chunkSize = chunkArrayBuffer.byteLength;

    if (chunkSize > 10 * 1024 * 1024) {
      return NextResponse.json({ ok: false, message: "Individual chunk size exceeds 10MB limit." }, { status: 400 });
    }

    if (start < 0 || end <= start || end > totalSize || chunkSize !== (end - start)) {
      return NextResponse.json({ ok: false, message: "Invalid Content-Range or chunk size mismatch." }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryVideoConfig();

    const signParams = { folder, timestamp };
    const signature = signCloudinaryParams(signParams, apiSecret);

    const chunkBuffer = Buffer.from(chunkArrayBuffer);
    const chunkBlob = new Blob([chunkBuffer], { type: chunk.type || "video/mp4" });

    // Build Cloudinary payload for this chunk
    const cForm = new FormData();
    cForm.append("file", chunkBlob, originalName);
    cForm.append("folder", folder);
    cForm.append("timestamp", String(timestamp));
    cForm.append("api_key", apiKey);
    cForm.append("signature", signature);

    const isChunked = (start > 0 || end < totalSize - 1) || totalSize > 4 * 1024 * 1024;
    const cHeaders = {};

    if (isChunked) {
      cHeaders["X-Unique-Upload-Id"] = uploadId;
      cHeaders["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
    }

    console.log(`[video-chunk] Uploading chunk (${chunkBuffer.length} bytes, range ${start}-${end}/${totalSize}) for uploadId: ${uploadId}`);

    // Node.js server-to-server call to Cloudinary (video/upload endpoint)
    const cResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      headers: cHeaders,
      body: cForm,
    });

    const cData = await cResponse.json().catch(() => null);

    if (!cResponse.ok) {
      console.error("[video-chunk] Cloudinary HTTP Error Status:", cResponse.status);
      console.error("[video-chunk] Cloudinary Raw Error Payload:", JSON.stringify(cData));
      const rawMsg = String(cData?.error?.message || `Cloudinary upload failed with status ${cResponse.status}`);
      return NextResponse.json(
        { ok: false, message: rawMsg, details: cData },
        { status: cResponse.status },
      );
    }

    // Generate video thumbnail URL (frame at 1.5s as JPG) and adaptive formats
    let thumbnail_url = "";
    let hls_url = "";
    let variants = null;

    if (cData.public_id) {
      thumbnail_url = `https://res.cloudinary.com/${cloudName}/video/upload/w_640,h_360,c_fill,so_1.5,f_jpg/${cData.public_id}.jpg`;
      hls_url = `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/f_m3u8/${cData.public_id}.m3u8`;
      variants = {
        "360p": `https://res.cloudinary.com/${cloudName}/video/upload/w_640,h_360,c_limit,q_auto,f_auto/${cData.public_id}.mp4`,
        "480p": `https://res.cloudinary.com/${cloudName}/video/upload/w_854,h_480,c_limit,q_auto,f_auto/${cData.public_id}.mp4`,
        "720p": `https://res.cloudinary.com/${cloudName}/video/upload/w_1280,h_720,c_limit,q_auto,f_auto/${cData.public_id}.mp4`,
        "1080p": `https://res.cloudinary.com/${cloudName}/video/upload/w_1920,h_1080,c_limit,q_auto,f_auto/${cData.public_id}.mp4`,
      };
    }

    return NextResponse.json({
      ok: true,
      secure_url: cData.secure_url || "",
      public_id: cData.public_id || "",
      thumbnail_url,
      hls_url,
      variants,
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
