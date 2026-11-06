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
// GAME 2: MEMORY MATCH (Noor Cottage - 7 Levels)
// ─────────────────────────────────────────────────────────────
async function verifyMemoryMatch(page) {
  console.log("\n=======================================================");
  console.log("🎮 2. VERIFYING MEMORY MATCH (NOOR COTTAGE - 7 LEVELS)");
  console.log("=======================================================");

  await resetToHub(page, "letter-match");

  await page.waitForSelector('[data-testid="game-btn-letter-match"]', { visible: true });
  await page.click('[data-testid="game-btn-letter-match"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 1. Initial State (0/7)
  await saveScreenshot(page, "memory_1_initial_0_of_7.png");

  // Helper to solve memory match level
  async function solveMemoryLevel() {
    await dismissTeachModalIfPresent(page);
    await page.waitForSelector('[data-testid^="memory-card-"]', { visible: true });

    // Read all card pairIds
    const cards = await page.$$('[data-testid^="memory-card-"]');
    const pairMap = {};
    for (let i = 0; i < cards.length; i++) {
      const pid = await cards[i].evaluate((el) => el.getAttribute("data-pair-id"));
      if (!pairMap[pid]) pairMap[pid] = [];
      pairMap[pid].push(i);
    }

    // Match each pair
    for (const pid of Object.keys(pairMap)) {
      const [idx1, idx2] = pairMap[pid];
      const card1 = await page.$(`[data-testid="memory-card-${idx1}"]`);
      await card1.click();
      await delay(250);

      const card2 = await page.$(`[data-testid="memory-card-${idx2}"]`);
      await card2.click();
      await delay(450);
    }

    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600);
  }

  // 2. Complete Level 1 -> 1/7 (foundation)
  console.log("Completing Memory Match Level 1...");
  await solveMemoryLevel();
  await saveScreenshot(page, "memory_2_level1_complete_1_of_7.png");

  // Advance to Level 2
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  // 3. Complete Level 2 -> 2/7 (walls)
  console.log("Completing Memory Match Level 2...");
  await solveMemoryLevel();
  await saveScreenshot(page, "memory_3_level2_complete_2_of_7.png");

  // Advance to Level 3 screen
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 4. Refresh persistence test
  console.log("Testing browser refresh on Memory Match...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);
  await dismissTeachModalIfPresent(page);
  await saveScreenshot(page, "memory_4_refresh_2_of_7_persisted.png");

  // 5. Back Navigation test
  console.log("Testing Back navigation to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  await page.waitForSelector('[data-testid="game-btn-letter-match"]', { visible: true });
  await page.click('[data-testid="game-btn-letter-match"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // Solve remaining levels (3 through 7)
  console.log("Solving remaining Memory Match levels (3 to 7)...");
  for (let lvl = 3; lvl <= 7; lvl++) {
    console.log(`Solving Memory Match Level ${lvl}...`);
    await solveMemoryLevel();
    if (lvl === 7) {
      await saveScreenshot(page, "memory_5_all_7_complete_cottage_assembled.png");
    } else {
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);
    }
  }

  const finalMemoryStorage = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_letter-match");
    return JSON.parse(raw || "{}");
  });
  console.log("Memory Match Final State:", JSON.stringify(finalMemoryStorage));
  console.log("✅ Memory Match Verified Successfully!");
}

// ─────────────────────────────────────────────────────────────
// GAME 3: SOUND DETECTIVE (Noor Space Rocket - 7 Levels)
// ─────────────────────────────────────────────────────────────
async function verifySoundDetective(page) {
  console.log("\n=======================================================");
  console.log("🎮 3. VERIFYING SOUND DETECTIVE (SPACE ROCKET - 7 LEVELS)");
  console.log("=======================================================");

  await resetToHub(page, "sound-detective");

  await page.waitForSelector('[data-testid="game-btn-sound-detective"]', { visible: true });
  await page.click('[data-testid="game-btn-sound-detective"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 1. Initial State (0/7)
  await saveScreenshot(page, "sound_1_initial_0_of_7.png");

  // Helper to solve sound detective level (5 rounds)
  async function solveSoundDetectiveLevel() {
    await dismissTeachModalIfPresent(page);

    for (let r = 1; r <= 5; r++) {
      await delay(400);
      const container = await page.waitForSelector('[data-target-ar]', { visible: true });
      const targetAr = await container.evaluate((el) => el.getAttribute("data-target-ar"));
      const targetName = await container.evaluate((el) => el.getAttribute("data-target-name"));

      const options = await page.$$('[data-testid^="sound-option-"]');
      let clicked = false;
      for (const opt of options) {
        const ar = await opt.evaluate((el) => el.getAttribute("data-ar"));
        const name = await opt.evaluate((el) => el.getAttribute("data-name"));
        if ((targetAr && ar === targetAr) || (targetName && name === targetName)) {
          await opt.click();
          clicked = true;
          break;
        }
      }
      if (!clicked && options.length > 0) {
        await options[0].click();
      }
      await delay(850);
    }

    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600);
  }

  // 2. Complete Level 1 -> 1/7 (thruster)
  console.log("Completing Sound Detective Level 1...");
  await solveSoundDetectiveLevel();
  await saveScreenshot(page, "sound_2_level1_complete_1_of_7.png");

  // Advance to Level 2
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  // 3. Complete Level 2 -> 2/7 (fuel-tank)
  console.log("Completing Sound Detective Level 2...");
  await solveSoundDetectiveLevel();
  await saveScreenshot(page, "sound_3_level2_complete_2_of_7.png");

  // Advance to Level 3 screen
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 4. Refresh persistence test
  console.log("Testing browser refresh on Sound Detective...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);
  await dismissTeachModalIfPresent(page);
  await saveScreenshot(page, "sound_4_refresh_2_of_7_persisted.png");

  // 5. Back Navigation test
  console.log("Testing Back navigation to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  await page.waitForSelector('[data-testid="game-btn-sound-detective"]', { visible: true });
  await page.click('[data-testid="game-btn-sound-detective"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // Solve remaining levels (3 through 7)
  console.log("Solving remaining Sound Detective levels (3 to 7)...");
  for (let lvl = 3; lvl <= 7; lvl++) {
    console.log(`Solving Sound Detective Level ${lvl}...`);
    await solveSoundDetectiveLevel();
    if (lvl === 7) {
      await saveScreenshot(page, "sound_5_all_7_complete_rocket_assembled.png");
    } else {
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);
    }
  }

  const finalSoundStorage = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_sound-detective");
    return JSON.parse(raw || "{}");
  });
  console.log("Sound Detective Final State:", JSON.stringify(finalSoundStorage));
  console.log("✅ Sound Detective Verified Successfully!");
}

// ─────────────────────────────────────────────────────────────
// GAME 4: DOT COUNT (Amal Fruit Garden - 6 Levels)
// ─────────────────────────────────────────────────────────────
async function verifyDotCount(page) {
  console.log("\n=======================================================");
  console.log("🎮 4. VERIFYING DOT COUNT (AMAL FRUIT GARDEN - 6 LEVELS)");
  console.log("=======================================================");

  await resetToHub(page, "dot-count");

  await page.waitForSelector('[data-testid="game-btn-dot-count"]', { visible: true });
  await page.click('[data-testid="game-btn-dot-count"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 1. Initial State (0/6)
  await saveScreenshot(page, "dot_1_initial_0_of_6.png");

  // Helper to solve dot count level (5 rounds)
  async function solveDotCountLevel() {
    await dismissTeachModalIfPresent(page);

    for (let r = 1; r <= 5; r++) {
      await delay(400);
      const card = await page.waitForSelector('[data-testid="current-letter-card"]', { visible: true });
      const dots = await card.evaluate((el) => Number(el.getAttribute("data-target-dots")));

      const choiceBtn = await page.waitForSelector(`[data-testid="dot-choice-${dots}"]`, { visible: true });
      await choiceBtn.click();
      await delay(800);
    }

    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600);
  }

  // 2. Complete Level 1 -> 1/6 (soil)
  console.log("Completing Dot Count Level 1...");
  await solveDotCountLevel();
  await saveScreenshot(page, "dot_2_level1_complete_1_of_6.png");

  // Advance to Level 2
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  // 3. Complete Level 2 -> 2/6 (palms)
  console.log("Completing Dot Count Level 2...");
  await solveDotCountLevel();
  await saveScreenshot(page, "dot_3_level2_complete_2_of_6.png");

  // Advance to Level 3 screen
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // 4. Refresh persistence test
  console.log("Testing browser refresh on Dot Count...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);
  await dismissTeachModalIfPresent(page);
  await saveScreenshot(page, "dot_4_refresh_2_of_6_persisted.png");

  // 5. Back Navigation test
  console.log("Testing Back navigation to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  await page.waitForSelector('[data-testid="game-btn-dot-count"]', { visible: true });
  await page.click('[data-testid="game-btn-dot-count"]');
  await delay(800);
  await dismissTeachModalIfPresent(page);

  // Solve remaining levels (3 through 6)
  console.log("Solving remaining Dot Count levels (3 to 6)...");
  for (let lvl = 3; lvl <= 6; lvl++) {
    console.log(`Solving Dot Count Level ${lvl}...`);
    await solveDotCountLevel();
    if (lvl === 6) {
      await saveScreenshot(page, "dot_5_all_6_complete_garden_assembled.png");
    } else {
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);
    }
  }

  const finalDotStorage = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_dot-count");
    return JSON.parse(raw || "{}");
  });
  console.log("Dot Count Final State:", JSON.stringify(finalDotStorage));
  console.log("✅ Dot Count Verified Successfully!");
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

  // Helper to trace one letter and advance
  async function traceOneLetter() {
    const canvas = await page.waitForSelector('canvas', { visible: true });
    const rect = await canvas.boundingBox();

    // Trigger stroke on canvas
    await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.25);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5, { steps: 5 });
    await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.75, { steps: 5 });
    await page.mouse.up();
    await delay(350);

    const nextLetterBtn = await page.$('[data-testid="trace-next-letter-btn"]');
    if (nextLetterBtn) {
      await nextLetterBtn.click();
      await delay(450);
    }
  }

  // Helper to solve an entire group of letters
  async function solveTraceGroup(lettersCount) {
    await dismissTeachModalIfPresent(page);
    for (let l = 0; l < lettersCount; l++) {
      await traceOneLetter();
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

// ─────────────────────────────────────────────────────────────
// MAIN TEST ORCHESTRATOR
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("=== STARTING COMPLETE BROWSER VERIFICATION OF 5 REMAINING GAMES (2 through 6) ===");
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
      "--window-size=1280,950",
    ],
    defaultViewport: { width: 1280, height: 950 },
  });

  const page = await browser.newPage();

  try {
    // 2. Memory Match
    await verifyMemoryMatch(page);

    // 3. Sound Detective
    await verifySoundDetective(page);

    // 4. Dot Count
    await verifyDotCount(page);

    // 5. Trace Letter
    await verifyTraceLetter(page);

    // 6. Harakat Master
    await verifyHarakatMaster(page);

    console.log("\n=======================================================");
    console.log("🎉 ALL REMAINING FIVE GAMES FULLY VERIFIED IN REAL BROWSER!");
    console.log("=======================================================");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("FATAL ERROR IN REMAINING-GAMES VERIFICATION:", err);
  process.exit(1);
});
