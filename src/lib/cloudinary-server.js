import "server-only";

import crypto from "node:crypto";

function parseCloudinaryUrl() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    return null;
  }

  const parsed = new URL(cloudinaryUrl);

  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
  };
}

function parseCloudinaryVideoUrl() {
  const cloudinaryVideoUrl = process.env.CLOUDINARY_VIDEO_URL;

  if (!cloudinaryVideoUrl) {
    return null;
  }

  const parsed = new URL(cloudinaryVideoUrl);

  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
  };
}

export function getCloudinaryConfig() {
  const fromUrl = parseCloudinaryUrl();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || fromUrl?.cloudName || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || fromUrl?.apiKey || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || fromUrl?.apiSecret || "";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary server environment variables. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryVideoConfig() {
  const fromUrl = parseCloudinaryVideoUrl();
  const cloudName = process.env.CLOUDINARY_VIDEO_CLOUD_NAME || fromUrl?.cloudName || "";
  const apiKey = process.env.CLOUDINARY_VIDEO_API_KEY || fromUrl?.apiKey || "";
  const apiSecret = process.env.CLOUDINARY_VIDEO_API_SECRET || fromUrl?.apiSecret || "";

  // Fallback to default Cloudinary config if no video-specific account is configured
  if (!cloudName || !apiKey || !apiSecret) {
    return getCloudinaryConfig();
  }

  return { cloudName, apiKey, apiSecret };
}

export function signCloudinaryParams(params, apiSecret) {
  const toSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}
