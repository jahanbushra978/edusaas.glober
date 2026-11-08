import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PAGE_TUTORIAL_REGISTRY, getTutorialForRoute } from "../src/features/admin/tutorials/pageTutorialRegistry.js";

test("1. Registry: All major admin routes are registered with 4 mandatory pillars", () => {
  const requiredRoutes = [
    "analytics", "students", "reserve", "teachers", "exams",
    "academic-structure", "promotion", "certificates",
    "student-attendance", "teacher-attendance", "live-attendance",
    "attendance", "biometric-import", "fees", "hadiya",
    "boarding", "branches", "messages", "notices",
    "gallery", "videos", "security", "settings", "period", "data-mgmt",
    // Nur AI & Quran Academy Routes
    "nur", "voice-tutor", "live-class", "quran-studio",
    "quran-reader", "quran-search", "qurani-amal",
    "human-teacher", "duolingo-link", "games-hub",
    "makhraj-3d", "hifz-assistant", "dawr-companion"
  ];

  for (const r of requiredRoutes) {
    const entry = PAGE_TUTORIAL_REGISTRY[r];
    assert.ok(entry, `Route ${r} must exist in registry`);
    assert.ok(entry.pageTitle, `Route ${r} must have pageTitle`);
    assert.ok(entry.badge, `Route ${r} must have badge`);
    assert.ok(entry.shortSummary, `Route ${r} must have shortSummary`);
    assert.ok(entry.purpose, `Route ${r} must have Pillar 1: purpose`);
    assert.ok(Array.isArray(entry.steps) && entry.steps.length >= 3, `Route ${r} must have Pillar 2: at least 3 steps`);
    assert.ok(Array.isArray(entry.tips) && entry.tips.length >= 1, `Route ${r} must have Pillar 3: tips`);
    assert.ok(Array.isArray(entry.aiAssistantHelp) && entry.aiAssistantHelp.length >= 1, `Route ${r} must have Pillar 4: aiAssistantHelp`);
  }
});

test("2. Registry: getTutorialForRoute provides resilient fallback for unmapped routes", () => {
  const fallback = getTutorialForRoute("unknown-custom-tab-xyz");
  assert.ok(fallback);
  assert.equal(fallback.routeKey, "unknown-custom-tab-xyz");
  assert.ok(fallback.purpose);
  assert.ok(fallback.steps.length > 0);
});

test("3. Clean Language: Zero technical jargon in merchant/admin guides", () => {
  const jargonWords = ["endpoint", "database", "DOM", "payload", "state", "schema", "prop", "component"];
  for (const [key, t] of Object.entries(PAGE_TUTORIAL_REGISTRY)) {
    const combined = `${t.purpose} ${t.steps.join(" ")} ${t.tips.join(" ")}`.toLowerCase();
    for (const jargon of jargonWords) {
      assert.ok(
        !combined.includes(` ${jargon} `),
        `Route ${key} contains developer jargon: "${jargon}"`
      );
    }
  }
});

test("4. Strict Invariant: Zero Sparkles or magic star emojis in tutorial system", () => {
  const filesToCheck = [
    "src/features/admin/tutorials/pageTutorialRegistry.js",
    "src/features/admin/components/tutorials/PageTutorialModal.jsx",
    "src/features/admin/components/tutorials/PageTutorialBanner.jsx",
    "app/api/platform/tutorials/route.js",
  ];

  for (const rel of filesToCheck) {
    const full = path.resolve(rel);
    const content = fs.readFileSync(full, "utf-8");
    assert.ok(!content.includes("Sparkles"), `${rel} must not import or use Sparkles`);
    assert.ok(!content.includes("✨"), `${rel} must not contain magic star emoji ✨`);
  }
});

test("5. API: /api/platform/tutorials returns expected structure", async () => {
  const res = await fetch("http://localhost:3001/api/platform/tutorials");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(typeof data.globalEnabled, "boolean");
  assert.equal(typeof data.customVideos, "object");
});
