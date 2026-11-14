export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const a = await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary credentials are configured, upload to Cloudinary API
    if (cloudName && ((apiKey && apiSecret) || uploadPreset)) {
      const cFormData = new FormData();
      const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
      cFormData.append("file", blob, file.name);

      if (apiKey && apiSecret) {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = `mosque_${a.mosque.slug || "uploads"}`;
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");
        cFormData.append("api_key", apiKey);
        cFormData.append("timestamp", String(timestamp));
        cFormData.append("folder", folder);
        cFormData.append("signature", signature);
      } else if (uploadPreset) {
        cFormData.append("upload_preset", uploadPreset);
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cFormData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Cloudinary upload error:", errData);
        throw new Error(errData?.error?.message || "ক্লাউডিনারি আপলোড সম্পন্ন হয়নি");
      }

      const data = await res.json();
      return NextResponse.json({ url: data.secure_url, provider: "cloudinary" });
    }

    // Fallback: save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl, provider: "local" });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err?.message || "আপলোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
