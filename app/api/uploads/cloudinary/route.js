import { NextResponse } from "next/server";
import { getCloudinaryConfig, getCloudinaryVideoConfig, signCloudinaryParams } from "../../../../src/lib/cloudinary-server";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
// Allow up to 30MB so image/PDF uploads are never rejected with 413.
export const bodyLimit = '30mb';

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../../../../src/lib/auth-identity";
import { verifySessionToken } from "../../../../src/lib/auth-session";
import { verifyCsrfOrigin, getClientIp } from "../../../../src/lib/security";
import { checkRateLimit } from "../../../../src/lib/rate-limit";

export async function POST(request) {
  try {
    if (process.env.NODE_ENV === "production" && !verifyCsrfOrigin(request)) {
      return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
    }
    if (!checkRateLimit(`uploads-cloudinary:${getClientIp(request)}`, { windowMs: 60000, max: 40 })) {
      return NextResponse.json({ ok: false, message: "Too many requests. Please slow down." }, { status: 429 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session || (session.role !== "admin" && session.role !== "branch_admin" && session.role !== "boarding_manager")) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "rahmania");
    const imageType = String(formData.get("image_type") || "gallery");
    const originalName = String(formData.get("original_name") || "");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "No file was provided." },
        { status: 400 },
      );
    }

    // H3 fix: previously any file type/size was forwarded straight to
    // Cloudinary. Enforce a MIME allowlist and per-category size ceiling so a
    // compromised/malicious admin account can't burn through the Cloudinary
    // quota with oversized files or upload something like HTML/executables.
    const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
    const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"]);
    const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf"]);
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500MB
    const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024; // 20MB

    const fileType = file.type || "";
    const isImageType = ALLOWED_IMAGE_TYPES.has(fileType);
    const isVideoType = ALLOWED_VIDEO_TYPES.has(fileType) || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name || "");
    const isDocumentType = ALLOWED_DOCUMENT_TYPES.has(fileType);

    if (!isImageType && !isVideoType && !isDocumentType) {
      return NextResponse.json(
        { ok: false, message: `File type "${fileType || "unknown"}" is not allowed. Allowed: images, video, and PDF.` },
        { status: 400 },
      );
    }

    const maxBytes = isVideoType ? MAX_VIDEO_BYTES : isDocumentType ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, message: `File is too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))}MB.` },
        { status: 400 },
      );
    }

    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const { cloudName, apiKey, apiSecret } = isVideo 
      ? getCloudinaryVideoConfig() 
      : getCloudinaryConfig();

    const resourceType = isVideo ? "video" : (isPdf ? "raw" : (file.type.startsWith("image/") ? "image" : "auto"));

    const timestamp = Math.floor(Date.now() / 1000);
    
    // YouTube-style auto optimization & strict re-compression for videos (720p HD, 2Mbps bitrate ceiling, q_auto:eco)
    const eagerParams = isVideo 
      ? "w_1280,h_720,c_limit,q_auto:eco,vc_auto,br_2m,f_mp4" 
      : (!isVideo && !isPdf && imageType !== "document" ? "w_400,c_limit,q_80,f_webp" : "");

    const signParams = { access_mode: "public", folder, timestamp };
    if (eagerParams) {
      signParams.eager = eagerParams;
    }
    if (isVideo) {
      signParams.eager_async = "true";
    }

    const signature = signCloudinaryParams(signParams, apiSecret);
    const uploadForm = new FormData();

    uploadForm.append("file", file);
    uploadForm.append("folder", folder);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("api_key", apiKey);
    uploadForm.append("signature", signature);
    uploadForm.append("access_mode", "public");
    
    if (eagerParams) {
      uploadForm.append("eager", eagerParams);
    }
    if (isVideo) {
      uploadForm.append("eager_async", "true");
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: uploadForm,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Cloudinary upload error:", data?.error || data);
      return NextResponse.json(
        {
          ok: false,
          message: data?.error?.message || "Cloudinary upload failed",
        },
        { status: response.status },
      );
    }

    // Save image metadata in Supabase if this is an image (not a video)
    let thumbnail_url = "";
    if (data.eager?.[0]?.secure_url) {
      thumbnail_url = data.eager[0].secure_url;
    }

    if (!isVideo && imageType !== "document") {
      try {
        const supabaseAdmin = createSupabaseAdminClient();

        const { error: dbError } = await supabaseAdmin
          .from("image_metadata")
          .insert({
            public_id: data.public_id,
            url: data.secure_url,
            thumbnail_url,
            width: data.width,
            height: data.height,
            format: data.format,
            size_bytes: data.bytes,
            image_type: imageType,
            original_name: originalName || file.name,
          });

        if (dbError) {
          console.error("Failed to save image metadata in Supabase:", dbError);
        }
      } catch (dbErr) {
        console.error("Supabase image metadata storage crashed:", dbErr);
      }
    }

    return NextResponse.json({
      ok: true,
      file_url: data.secure_url,
      public_id: data.public_id,
      thumbnail_url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Cloudinary upload failed unexpectedly.",
      },
      { status: 500 },
    );
  }
}
