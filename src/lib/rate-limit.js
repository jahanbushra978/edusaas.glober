// M4 fix: previously only login, the biometric device webhook, and
// admin/security/actions had any rate limiting. This gives every other
// mutating endpoint a lightweight, dependency-free shared limiter instead of
// each route reinventing its own Map-based counter (or having none at all).
//
// This is in-process/in-memory (matches the existing pattern used elsewhere
// in this codebase, e.g. app/api/attendance/device/route.js). On serverless
// platforms with multiple instances this is a best-effort per-instance
// limit, not a global guarantee — for a hard global limit it would need to
// move to a shared store (e.g. a Supabase table or Redis). It still meaningfully
// raises the cost of hammering an endpoint from a single connection/instance.

const buckets = new Map();
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweep(now) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > entry.windowMs) {
      buckets.delete(key);
    }
  }
  lastSweep = now;
}

/**
 * Sliding-window-ish rate limiter (fixed window, reset per key).
 * Returns true if the request is allowed, false if it should be rejected.
 *
 * @param {string} key - unique bucket key, e.g. `${routeName}:${ip}`
 * @param {{ windowMs?: number, max?: number }} options
 */
export function checkRateLimit(key, { windowMs = 60000, max = 30 } = {}) {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, windowMs, count: 1 });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

export default checkRateLimit;
