// The name of the secure cookie that holds the Device ID
export const DEVICE_FINGERPRINT_COOKIE = "rm_device_id";

/**
 * Gets the current Device UUID from cookies, or generates a new one.
 * It does NOT set the cookie in the response here. That must be done in the route handler.
 */
export function getOrCreateDeviceId(request) {
  let existingId = null;
  if (request && typeof request.cookies?.get === 'function') {
    existingId = request.cookies.get(DEVICE_FINGERPRINT_COOKIE)?.value;
  }
  
  if (existingId && existingId.length > 10) {
    return { deviceId: existingId, isNew: false };
  }
  
  return { deviceId: `dev_${crypto.randomUUID().replace(/-/g, '')}`, isNew: true };
}

/**
 * Validates a Cloudflare Turnstile token
 */
export async function verifyTurnstileToken(token, ipAddress) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return true;
  }

  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ipAddress) {
      formData.append("remoteip", ipAddress);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

/**
 * CSRF Protection: Verify Origin/Referer for state-changing requests.
 * Returns true if the request origin is allowed.
 */
export function verifyCsrfOrigin(request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const source = origin || referer;

  if (!source) {
    // Direct API calls (from server-side or same-origin) may not have origin
    // In production, block requests without origin for state-changing methods
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const sourceUrl = new URL(source);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

    // Allow same-origin requests
    if (sourceUrl.host === host) {
      return true;
    }

    // In production, block cross-origin requests
    if (process.env.NODE_ENV === 'production') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates a simple risk score based on provided signals.
 * Lower is better. > 50 means high risk.
 */
export function calculateRiskScore(signals) {
  let score = 0;
  
  // Example signals logic
  if (signals.isNewDevice) score += 20;
  if (signals.recentFailures > 3) score += 30;
  if (signals.recentFailures > 10) score += 60;
  if (signals.isImpossibleTravel) score += 50;
  if (signals.isVPNOrTor) score += 40; // If you had an IP enrichment API

  return score;
}

/**
 * Extracts Client IP address in a Next.js App Router context.
 */
export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Helper to get User Agent and other headers
 */
export function getClientMetadata(request) {
  const ua = request.headers.get("user-agent") || "Unknown";
  // Very basic OS/Browser extraction, consider using a proper library like 'ua-parser-js' if needed
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "Unknown";

  return { userAgent: ua, os, browser, country };
}
