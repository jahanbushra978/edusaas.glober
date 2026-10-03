/**
 * Two-Tier Rate Limiter for AI Gateway
 * 1. Per-User Quota by ERP Role
 * 2. Global Provider Ceiling (OpenRouter free tier protection: 45/day, 15 RPM)
 */

const userRequests = new Map(); // key -> [{ timestamp }]
const globalRequests = []; // [{ timestamp, provider }]

const ROLE_HOURLY_LIMITS = {
  student: 10,
  teacher: 20,
  branch_admin: 30,
  super_admin: 100,
  admin: 100,
  guest: 3,
};

const GLOBAL_CEILING = {
  dailyMax: 45, // Safety buffer on 50/day OpenRouter free limit
  rpmMax: 15,
};

/**
 * Checks and records rate limit for a user and global provider.
 * @param {Object} params
 * @param {string} params.userId - Authenticated user identifier or IP
 * @param {string} params.role - User role
 * @param {string} params.provider - AI provider name ('openrouter', 'gemini', 'openai', 'anthropic')
 * @param {boolean} params.isBYOK - Whether request uses Bring-Your-Own-Key
 * @returns {{ allowed: boolean, reason?: string, remainingUser?: number, remainingGlobal?: number }}
 */
export function checkAIRateLimit({ userId, role = "student", provider = "openrouter", isBYOK = false }) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneMinuteAgo = now - 60 * 1000;

  // 1. Check Global Provider Ceiling only for shared central OpenRouter free tier
  if (!isBYOK && provider === "openrouter") {
    // Clean old global entries
    while (globalRequests.length > 0 && globalRequests[0].timestamp < oneDayAgo) {
      globalRequests.shift();
    }

    const past24hGlobal = globalRequests.filter((r) => r.timestamp >= oneDayAgo).length;
    const past1mGlobal = globalRequests.filter((r) => r.timestamp >= oneMinuteAgo).length;

    if (past24hGlobal >= GLOBAL_CEILING.dailyMax) {
      return {
        allowed: false,
        reason: "Global daily AI quota reached for free provider. Please use your own API Key (BYOK) in settings or try again tomorrow.",
        remainingGlobal: 0,
      };
    }

    if (past1mGlobal >= GLOBAL_CEILING.rpmMax) {
      return {
        allowed: false,
        reason: "Too many concurrent requests. Please wait a few seconds and try again.",
        remainingGlobal: GLOBAL_CEILING.dailyMax - past24hGlobal,
      };
    }
  }

  // 2. Check Per-User Role Quota
  const userKey = `user:${userId || "anon"}`;
  let timestamps = userRequests.get(userKey) || [];
  timestamps = timestamps.filter((ts) => ts >= oneHourAgo);
  userRequests.set(userKey, timestamps);

  const limit = ROLE_HOURLY_LIMITS[role] || ROLE_HOURLY_LIMITS.student;
  if (!isBYOK && timestamps.length >= limit) {
    return {
      allowed: false,
      reason: `Hourly AI message quota (${limit}/hour) exceeded for role '${role}'. You can add your own API key in AI Settings to continue immediately.`,
      remainingUser: 0,
    };
  }

  // Record request
  timestamps.push(now);
  userRequests.set(userKey, timestamps);

  if (!isBYOK && provider === "openrouter") {
    globalRequests.push({ timestamp: now, provider });
  }

  const remainingUser = Math.max(0, limit - timestamps.length);
  const remainingGlobal = Math.max(0, GLOBAL_CEILING.dailyMax - globalRequests.filter((r) => r.timestamp >= oneDayAgo).length);

  return {
    allowed: true,
    remainingUser,
    remainingGlobal,
  };
}

/**
 * Returns current quota stats for a user
 */
export function getAIRateLimitStats({ userId, role = "student" }) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const userKey = `user:${userId || "anon"}`;
  const timestamps = (userRequests.get(userKey) || []).filter((ts) => ts >= oneHourAgo);
  const limit = ROLE_HOURLY_LIMITS[role] || ROLE_HOURLY_LIMITS.student;

  const past24hGlobal = globalRequests.filter((r) => r.timestamp >= oneDayAgo).length;

  return {
    userUsed: timestamps.length,
    userLimit: limit,
    userRemaining: Math.max(0, limit - timestamps.length),
    globalDailyUsed: past24hGlobal,
    globalDailyLimit: GLOBAL_CEILING.dailyMax,
    globalDailyRemaining: Math.max(0, GLOBAL_CEILING.dailyMax - past24hGlobal),
  };
}
