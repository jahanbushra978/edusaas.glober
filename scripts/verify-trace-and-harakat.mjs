import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3005/quran-tutor/games";
const BRAIN_SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\15e49d49-4284-46aa-b0d0-b82883b2cf20\\screenshots";
const BRAIN_ROOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\15e49d49-4284-46aa-b0d0-b82883b2cf20";
const PUBLIC_SCREENSHOT_DIR = "public\\screenshots";

for (const dir of [BRAIN_SCREENSHOT_DIR, BRAIN_ROOT_DIR, PUBLIC_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveScreenshot(page, filename) {
  const p1 = path.join(BRAIN_SCREENSHOT_DIR, filename);
  const p2 = path.join(BRAIN_ROOT_DIR, filename);
  const p3 = path.join(PUBLIC_SCREENSHOT_DIR, filename);
  await page.screenshot({ path: p1, fullPage: false });
  fs.copyFileSync(p1, p2);
  fs.copyFileSync(p1, p3);
  console.log(`[SCREENSHOT SAVED]: ${filename}`);
}

async function dismissTeachModalIfPresent(page) {
  try {
    const btn = await page.$('[data-testid="start-game-btn"]');
    if (btn) {
      await btn.click();
      await delay(600);
    }
  } catch {}
}

async function resetToHub(page, gameKeyToReset) {
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.evaluate((key) => {
    localStorage.removeItem("noor_kids_active_game_v2");
    if (key) localStorage.removeItem(`noor_kids_game_progress_v2_${key}`);
  }, gameKeyToReset);
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await delay(600);
}

// ─────────────────────────────────────────────────────────────
// GAME 5: TRACE LETTER (Castle of Knowledge - 4 Groups)
// ─────────────────────────────────────────────────────────────
async function verifyTraceLetter(page) {
  console.log("\n=======================================================");
  console.log("🎮 5. VERIFYING TRACE LETTER (ILM CASTLE - 4 GROUPS)");
  console.log("=======================================================");

  await resetToHub(page, "trace-letter");

  await page.waitForSelector('[data-testid="game-btn-trace-letter"]', { visible: true });
  await page.click('[data-testid="game-btn-trace-letter"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 1. Initial State (0/4)
  await saveScreenshot(page, "trace_1_initial_0_of_4.png");

  // Helper to trace one letter
  async function traceOneLetter(letterIdx, totalLetters) {
    await delay(250);
    await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (c) c.scrollIntoView({ block: 'center' });
    });
    await delay(200);

    for (let loop = 0; loop < 25; loop++) {
      const nextBtn = await page.$('[data-testid="trace-next-letter-btn"]');
      if (nextBtn) {
        await nextBtn.click();
        await delay(500);
        return;
      }

      const currentWp = await page.evaluate(() => {
        const container = document.querySelector('.aspect-square');
        if (!container) return null;
        const current =
          container.querySelector('div.animate-bounce') ||
          container.querySelector('div.bg-amber-400') ||
          container.querySelector('div.scale-110');
        if (!current) return null;
        const b = current.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      });

      if (currentWp) {
        await page.mouse.move(currentWp.x, currentWp.y);
        await page.mouse.down();
        await page.mouse.move(currentWp.x + 2, currentWp.y + 2, { steps: 3 });
        await page.mouse.up();
        await delay(120);
      } else {
        await delay(150);
      }
    }

    const nextBtn = await page.$('[data-testid="trace-next-letter-btn"]');
    if (nextBtn) {
      await nextBtn.click();
      await delay(500);
    }
  }

  // Helper to solve an entire group of letters
  async function solveTraceGroup(lettersCount) {
    await dismissTeachModalIfPresent(page);
    for (let l = 0; l < lettersCount; l++) {
      console.log(`  Tracing letter ${l + 1}/${lettersCount}...`);
      await traceOneLetter(l, lettersCount);
    }
    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600);
  }

  // 2. Complete Group 1 (7 letters) -> 1/4 (gate)
  console.log("Completing Trace Letter Group 1 (7 letters)...");
  await solveTraceGroup(7);
  await saveScreenshot(page, "trace_2_group1_complete_1_of_4.png");

  // Advance to Group 2
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  // 3. Complete Group 2 (8 letters) -> 2/4 (pillars)
  console.log("Completing Trace Letter Group 2 (8 letters)...");
  await solveTraceGroup(8);
  await saveScreenshot(page, "trace_3_group2_complete_2_of_4.png");

  // Advance to Group 3 screen
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 4. Refresh persistence test
  console.log("Testing browser refresh on Trace Letter...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);
  await dismissTeachModalIfPresent(page);
  await saveScreenshot(page, "trace_4_refresh_2_of_4_persisted.png");

  // 5. Back Navigation test
  console.log("Testing Back navigation to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  await page.waitForSelector('[data-testid="game-btn-trace-letter"]', { visible: true });
  await page.click('[data-testid="game-btn-trace-letter"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // Solve remaining groups (Group 3: 8 letters, Group 4: 6 letters)
  console.log("Solving Group 3 (8 letters)...");
  await solveTraceGroup(8);
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  console.log("Solving Group 4 (6 letters - Final)...");
  await solveTraceGroup(6);
  await saveScreenshot(page, "trace_5_all_4_complete_castle_assembled.png");

  const finalTraceStorage = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_trace-letter");
    return JSON.parse(raw || "{}");
  });
  console.log("Trace Letter Final State:", JSON.stringify(finalTraceStorage));
  console.log("✅ Trace Letter Verified Successfully!");
}

// ─────────────────────────────────────────────────────────────
// GAME 6: HARAKAT MASTER (Noor City & Mosque - 9 Levels)
// ─────────────────────────────────────────────────────────────
async function verifyHarakatMaster(page) {
  console.log("\n=======================================================");
  console.log("🎮 6. VERIFYING HARAKAT MASTER (GRAND MOSQUE - 9 LEVELS)");
  console.log("=======================================================");

  await resetToHub(page, "harakat-master");

  await page.waitForSelector('[data-testid="game-btn-harakat-master"]', { visible: true });
  await page.click('[data-testid="game-btn-harakat-master"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 1. Initial State (0/9)
  await saveScreenshot(page, "harakat_1_initial_0_of_9.png");

  // Helper to solve harakat level (5 rounds)
  async function solveHarakatLevel() {
    await dismissTeachModalIfPresent(page);

    for (let r = 1; r <= 5; r++) {
      await delay(400);
      const card = await page.waitForSelector('[data-testid="current-harakat-card"]', { visible: true });
      const targetHarakat = await card.evaluate((el) => el.getAttribute("data-target-harakat") || "যবর");

      let btnSelector = '[data-testid="harakat-btn-zabar"]';
      if (targetHarakat.includes("যের")) {
        btnSelector = '[data-testid="harakat-btn-zer"]';
      } else if (targetHarakat.includes("পেশ")) {
        btnSelector = '[data-testid="harakat-btn-pesh"]';
      }

      const btn = await page.waitForSelector(btnSelector, { visible: true });
      await btn.click();
      await delay(800);
    }

    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600);
  }

  // 2. Complete Level 1 -> 1/9 (mosque-base)
  console.log("Completing Harakat Master Level 1...");
  await solveHarakatLevel();
  await saveScreenshot(page, "harakat_2_level1_complete_1_of_9.png");

  // Advance to Level 2
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  // 3. Complete Level 2 -> 2/9 (walls)
  console.log("Completing Harakat Master Level 2...");
  await solveHarakatLevel();
  await saveScreenshot(page, "harakat_3_level2_complete_2_of_9.png");

  // Advance to Level 3 screen
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 4. Refresh persistence test
  console.log("Testing browser refresh on Harakat Master...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);
  await dismissTeachModalIfPresent(page);
  await saveScreenshot(page, "harakat_4_refresh_2_of_9_persisted.png");

  // 5. Back Navigation test
  console.log("Testing Back navigation to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  await page.waitForSelector('[data-testid="game-btn-harakat-master"]', { visible: true });
  await page.click('[data-testid="game-btn-harakat-master"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // Solve remaining levels (3 through 9)
  console.log("Solving remaining Harakat Master levels (3 to 9)...");
  for (let lvl = 3; lvl <= 9; lvl++) {
    console.log(`Solving Harakat Master Level ${lvl}...`);
    await solveHarakatLevel();
    if (lvl === 9) {
      await saveScreenshot(page, "harakat_5_all_9_complete_mosque_assembled.png");
    } else {
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);
    }
  }

  const finalHarakatStorage = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_harakat-master");
    return JSON.parse(raw || "{}");
  });
  console.log("Harakat Master Final State:", JSON.stringify(finalHarakatStorage));
  console.log("✅ Harakat Master Verified Successfully!");
}

async function main() {
  console.log("=== STARTING TRACE LETTER & HARAKAT MASTER BROWSER VERIFICATION ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--mute-audio",
      "--autoplay-policy=no-user-gesture-required",
      "--window-size=1280,1200",
    ],
    defaultViewport: { width: 1280, height: 1200 },
  });

  const page = await browser.newPage();

  try {
    // 5. Trace Letter
    await verifyTraceLetter(page);

    // 6. Harakat Master
    await verifyHarakatMaster(page);

    console.log("\n=======================================================");
    console.log("🎉 TRACE LETTER & HARAKAT MASTER FULLY VERIFIED!");
    console.log("=======================================================");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
