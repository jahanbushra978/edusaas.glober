import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/public/download-pdf?url=<encoded_file_url>
 *
 * Fail-safe server-side PDF download proxy.
 * Prevents Chrome "Failed - Needs authorization" (401) errors by handling Cloudinary URL
 * variations server-side and streaming clean PDF bytes with attachment disposition.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl || !/^https?:\/\//i.test(rawUrl.trim())) {
      return new NextResponse("Invalid or missing file URL.", { status: 400 });
    }

    const fileUrl = rawUrl.trim();
    let response = await fetch(fileUrl).catch(() => null);

    // If initial fetch failed or returned 401/403/404, try Cloudinary URL fallbacks
    if (!response || !response.ok) {
      if (/res\.cloudinary\.com/i.test(fileUrl)) {
        const candidateUrls = [
          fileUrl + ".pdf",
          fileUrl.replace(/\/raw\/upload\//i, "/raw/upload/fl_attachment/"),
          fileUrl.replace(/\/raw\/upload\//i, "/image/upload/"),
          fileUrl.replace(/\/raw\/upload\//i, "/image/upload/") + ".pdf",
          fileUrl.replace(/\/raw\/upload\//i, "/image/upload/fl_attachment/"),
          fileUrl.replace(/\/raw\/upload\//i, "/image/upload/fl_attachment/") + ".pdf",
          fileUrl.replace(/\/image\/upload\/(?!fl_attachment)/i, "/image/upload/fl_attachment/"),
          fileUrl.replace(/\/image\/upload\/(?!fl_attachment)/i, "/image/upload/fl_attachment/") + ".pdf",
          fileUrl.replace(/\/image\/upload\//i, "/raw/upload/"),
          fileUrl.replace(/\/image\/upload\//i, "/raw/upload/") + ".pdf",
        ];

        for (const candidate of candidateUrls) {
          try {
            const res = await fetch(candidate);
            if (res && res.ok) {
              response = res;
              break;
            }
          } catch (_) {}
        }
      }
    }

    let buffer = null;

    if (response && response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Fall back to local official admission-form.pdf
      try {
        const fs = await import("fs");
        const path = await import("path");
        const localPath = path.join(process.cwd(), "public", "admission-form.pdf");
        if (fs.existsSync(localPath)) {
          buffer = fs.readFileSync(localPath);
        }
      } catch (_) {}
    }

    if (!buffer) {
      console.error(`[download-pdf-proxy] Unable to fetch file from remote server: ${fileUrl}`);
      return new NextResponse("Form file not found or restricted. Please re-upload the form in Admin Panel.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    let filename = "admission-form.pdf";
    try {
      const urlPath = new URL(fileUrl).pathname;
      const base = urlPath.split("/").pop();
      if (base && (base.endsWith(".pdf") || base.endsWith(".doc") || base.endsWith(".docx") || base.endsWith(".png") || base.endsWith(".jpg"))) {
        filename = base;
      }
    } catch (_) {}

    const finalFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[download-pdf-proxy] Unexpected error:", error);
    return new NextResponse("Download failed. Please try again later.", { status: 500 });
  }
}
