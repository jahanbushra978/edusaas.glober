import { AUTH_COOKIE_NAME } from "./auth-identity";
import { safeCompare } from "./safe-compare";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_TTL_SECONDS = 60 * 60 * 2;

function encodeBase64Url(input) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input).toString("base64url");
  }

  let binary = "";
  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(input, "base64url"));
  }

  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function sign(input, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return encodeBase64Url(new Uint8Array(signature));
}

function getSessionSecret() {
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    throw new Error("Missing server environment variable: SUPABASE_JWT_SECRET.");
  }

  return secret;
}

export async function createSessionToken(user, ttlSeconds = SESSION_TTL_SECONDS) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    ...user,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };
  const payloadJson = JSON.stringify(payload);
  const encodedPayload = encodeBase64Url(encoder.encode(payloadJson));
  const signature = await sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function generateSupabaseJwt(user, ttlSeconds = SESSION_TTL_SECONDS) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = encodeBase64Url(encoder.encode(JSON.stringify(header)));

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    role: "authenticated",
    aud: "authenticated",
    sub: user.authUserId || user.id || "00000000-0000-0000-0000-000000000000",
    exp: issuedAt + ttlSeconds,
    iat: issuedAt,
    user_metadata: {
      role: user.role || null,
      branchId: user.branch_id || null,
      organizationId: user.organization_id || null,
      allowedFeatures: user.allowed_features || null,
      profileId: user.profileId || null,
      loginId: user.loginId || null
    }
  };
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  
  const signInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(signInput, secret);

  return `${signInput}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return null;

    const [encodedPayload, providedSignature] = token.split(".");
    const expectedSignature = await sign(encodedPayload, secret);

    if (!safeCompare(providedSignature, expectedSignature)) {
      return null;
    }

    const payloadJson = decoder.decode(decodeBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieConfig() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createSocSessionToken(user, ttlSeconds = 600) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    role: user.role,
    branch_id: user.branch_id,
    type: "soc_session",
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };
  const payloadJson = JSON.stringify(payload);
  const encodedPayload = encodeBase64Url(encoder.encode(payloadJson));
  const signature = await sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifySocSessionToken(token) {
  if (!token || !token.includes(".")) return null;
  try {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return null;

    const [encodedPayload, providedSignature] = token.split(".");
    const expectedSignature = await sign(encodedPayload, secret);

    if (!safeCompare(providedSignature, expectedSignature)) return null;

    const payloadJson = decoder.decode(decodeBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson);

    if (payload.type !== "soc_session") return null;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
