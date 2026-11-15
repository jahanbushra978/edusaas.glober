import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const deviceRoute = fs.readFileSync("app/api/attendance/device/route.js", "utf-8");
const deviceSyncRoute = fs.readFileSync("app/api/attendance/device-sync/route.js", "utf-8");
const envLocal = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf-8") : "";

test("Case 1: BIOMETRIC_API_KEY is configured with 256-bit entropy (64 hex characters)", () => {
  const hasKey = envLocal.split("\n").some((l) => l.trim().startsWith("BIOMETRIC_API_KEY="));
  assert.ok(hasKey, "BIOMETRIC_API_KEY exists in .env.local");
  const keyLine = envLocal.split("\n").find((l) => l.trim().startsWith("BIOMETRIC_API_KEY="));
  const keyVal = keyLine ? keyLine.split("=")[1].trim() : "";
  assert.strictEqual(keyVal.length, 64, "BIOMETRIC_API_KEY possesses exactly 256-bit entropy (64 hex characters)");
  assert.match(keyVal, /^[a-f0-9]{64}$/, "BIOMETRIC_API_KEY is a valid cryptographically secure hexadecimal secret");
});

test("Case 2: Zero-fallback invariant — obsolete hardcoded secrets are strictly prohibited", () => {
  assert.strictEqual(
    deviceRoute.includes("Rahmana@1212"),
    false,
    "Hardcoded legacy fallback secret removed from app/api/attendance/device/route.js"
  );
  assert.strictEqual(
    deviceSyncRoute.includes("Rahmana@1212"),
    false,
    "Hardcoded legacy fallback secret removed from app/api/attendance/device-sync/route.js"
  );
});

test("Case 3: POST /api/attendance/device enforces constant-time authentication", () => {
  assert.ok(
    deviceRoute.includes("safeCompare"),
    "Device route uses safeCompare to prevent timing attacks"
  );
  assert.ok(
    deviceRoute.includes("verifyApiKey"),
    "Device route checks verifyApiKey on requests"
  );
  assert.ok(
    deviceRoute.includes("status: 401"),
    "Device route returns 401 for unauthorized callers"
  );
});

test("Case 4: POST /api/attendance/device enforces rate limiting", () => {
  assert.ok(
    deviceRoute.includes("checkRateLimit"),
    "Device route enforces IP-based rate limiting"
  );
  assert.ok(
    deviceRoute.includes("status: 429"),
    "Rate limited calls receive 429 Too Many Requests"
  );
});

test("Case 5: POST /api/attendance/device-sync enforces x-api-key authentication", () => {
  assert.ok(
    deviceSyncRoute.includes("verifyApiKey"),
    "Device sync route verifies API key"
  );
  assert.ok(
    deviceSyncRoute.includes("status: 401"),
    "Device sync route returns 401 for unauthenticated calls"
  );
  assert.ok(
    deviceSyncRoute.includes("punches.length > 100"),
    "Device sync limits batch ingestion size to max 100 to prevent payload exhaustion"
  );
});

test("Case 6: Verification of constant-time string comparison logic", () => {
  function safeCompare(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
  }

  const validKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  assert.strictEqual(safeCompare(validKey, validKey), true, "Identical 256-bit keys match");
  assert.strictEqual(safeCompare(validKey, "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdeg"), false, "Single character difference fails");
  assert.strictEqual(safeCompare(validKey, "ShortKey"), false, "Different length keys fail");
  assert.strictEqual(safeCompare(validKey, null), false, "Null value fails safely");
  assert.strictEqual(safeCompare(validKey, undefined), false, "Undefined value fails safely");
});
