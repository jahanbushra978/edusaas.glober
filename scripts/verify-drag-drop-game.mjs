import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_URL = "http://localhost:3005/quran-tutor/games";
const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\15e49d49-4284-46aa-b0d0-b82883b2cf20\\screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("=== STARTING DRAG & DROP REAL GAMEPLAY VERIFICATION ===");
  console.log(`Connecting to: ${TARGET_URL}`);
  console.log(`Using Chrome: ${CHROME_PATH}`);

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
  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

  // Step 1: Open Hub
  console.log("\n[STEP 1] Navigating to Quran Games Hub...");
  await page.goto(TARGET_URL, { waitUntil: "networkidle0" });

  // Clear localStorage for Drag & Drop game to guarantee 0/14 starting baseline
  console.log("Resetting progress to 0/14 starting baseline in localStorage...");
  await page.evaluate(() => {
    localStorage.removeItem("noor_kids_game_progress_v2_drag-drop-letter");
  });
  await page.reload({ waitUntil: "networkidle0" });

  // Open Drag & Drop from Hub by clicking its button
  console.log("Clicking 'খেলুন' on Drag & Drop Letter Matching game card...");
  await page.waitForSelector('[data-testid="game-btn-drag-drop-letter"]', { visible: true });
  await page.click('[data-testid="game-btn-drag-drop-letter"]');
  await delay(800);

  // Check if TeachBeforePlayModal is open and dismiss it
  const teachBtn = await page.$('[data-testid="start-game-btn"]');
  if (teachBtn) {
    console.log("Dismissing TeachBeforePlayModal for Level 1...");
    await teachBtn.click();
    await delay(600);
  }

  // Verify 0/14 components
  const initialProgress = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    return {
      localStorage: raw ? JSON.parse(raw) : null,
      text: document.body.innerText.includes("0/14") ? "0/14 detected" : "not found",
    };
  });
  console.log("[VERIFY] Initial State:", JSON.stringify(initialProgress));

  const shot1 = path.join(SCREENSHOT_DIR, "1_drag_drop_initial_0_of_14.png");
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`[SCREENSHOT 1 SAVED]: ${shot1}`);

  // Helper to solve the currently displayed level
  async function solveCurrentLevel(expectedLevelNum) {
    console.log(`\n--- SOLVING LEVEL ${expectedLevelNum} VIA REAL UI CLICKS ---`);

    // Dismiss Teach modal if open
    const teachModalBtn = await page.$('[data-testid="start-game-btn"]');
    if (teachModalBtn) {
      console.log(`Dismissing Teach modal on Level ${expectedLevelNum}...`);
      await teachModalBtn.click();
      await delay(500);
    }

    // Wait for slots to be present
    await page.waitForSelector('[data-testid^="slot-"]', { visible: true });
    const slots = await page.$$('[data-testid^="slot-"]');
    console.log(`Found ${slots.length} target slots for Level ${expectedLevelNum}.`);

    for (let i = 0; i < slots.length; i++) {
      // Re-query slots and get target AR
      const slotElement = await page.$(`[data-testid="slot-${i}"]`);
      const targetAr = await slotElement.evaluate((el) => el.getAttribute("data-target-ar"));
      console.log(`Slot ${i} needs letter/phrase: '${targetAr}'`);

      // Find card with matching data-card-ar
      const cardSelector = `[data-card-ar="${targetAr}"]`;
      await page.waitForSelector(cardSelector, { visible: true });
      const cardElement = await page.$(cardSelector);

      // Click source card
      await cardElement.click();
      await delay(350);

      const afterCardFeedback = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log(`After card click for ${targetAr}:`, afterCardFeedback.split('\n').find(l => l.includes("হরফ") || l.includes("শব্দ")));

      // Click target slot
      await slotElement.click();
      await delay(450);

      const afterSlotFeedback = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log(`After slot click for ${targetAr}:`, afterSlotFeedback.split('\n').find(l => l.includes("হরফ") || l.includes("মিলেছে") || l.includes("চেষ্টা")));
    }

    // Wait for BuildingRewardCelebrationModal
    console.log("Waiting for Level Complete celebration modal...");
    await page.waitForSelector('[data-testid="next-level-btn"]', { visible: true, timeout: 8000 });
    await delay(600); // let confetti and fanfare trigger
  }

  // Step 4: Complete Level 1 -> 1/14
  console.log("\n[STEP 4] Completing Level 1...");
  await solveCurrentLevel(1);

  const level1Progress = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    return JSON.parse(raw || "{}");
  });
  console.log("[VERIFY] After Level 1 localStorage:", JSON.stringify(level1Progress));

  const shot2 = path.join(SCREENSHOT_DIR, "2_level1_complete_1_of_14.png");
  await page.screenshot({ path: shot2, fullPage: false });
  console.log(`[SCREENSHOT 2 SAVED]: ${shot2}`);

  // Step 5: Complete Level 2 -> 2/14
  console.log("\n[STEP 5] Advancing to Level 2...");
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);

  await solveCurrentLevel(2);

  const level2Progress = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    return JSON.parse(raw || "{}");
  });
  console.log("[VERIFY] After Level 2 localStorage:", JSON.stringify(level2Progress));

  const shot3 = path.join(SCREENSHOT_DIR, "3_level2_complete_2_of_14.png");
  await page.screenshot({ path: shot3, fullPage: false });
  console.log(`[SCREENSHOT 3 SAVED]: ${shot3}`);

  // Dismiss Level 2 celebration modal to see Level 3 board with 2/14 components
  await page.click('[data-testid="next-level-btn"]');
  await delay(800);
  const teach3 = await page.$('[data-testid="start-game-btn"]');
  if (teach3) {
    await teach3.click();
    await delay(500);
  }

  // Step 6: Refresh Browser and verify both components remain
  console.log("\n[STEP 6] Refreshing browser to verify persistence...");
  await page.reload({ waitUntil: "networkidle0" });
  await delay(800);

  // If teach modal opened for Level 3 after reload, dismiss it
  const teachReload = await page.$('[data-testid="start-game-btn"]');
  if (teachReload) {
    await teachReload.click();
    await delay(500);
  }

  const postRefreshProgress = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      localStorage: parsed,
      hasTwoFourteen: document.body.innerText.includes("2/14"),
      currentLevelId: parsed?.currentLevelId,
      earnedCount: parsed?.earnedRewardIds?.length,
      earnedRewardIds: parsed?.earnedRewardIds,
      completedLevels: parsed?.completedLevels,
    };
  });
  console.log("[VERIFY] Post-Refresh State:", JSON.stringify(postRefreshProgress, null, 2));

  const shot4 = path.join(SCREENSHOT_DIR, "4_refreshed_browser_2_of_14_persisted.png");
  await page.screenshot({ path: shot4, fullPage: false });
  console.log(`[SCREENSHOT 4 SAVED]: ${shot4}`);

  // Step 7: Navigate Back, return to the game and verify that progress remains
  console.log("\n[STEP 7] Navigating Back to Hub...");
  await page.waitForSelector('[data-testid="game-back-btn"]', { visible: true });
  await page.click('[data-testid="game-back-btn"]');
  await delay(800);

  const shot5a = path.join(SCREENSHOT_DIR, "5a_games_hub_after_back.png");
  await page.screenshot({ path: shot5a, fullPage: false });
  console.log(`[SCREENSHOT 5a SAVED]: ${shot5a}`);

  console.log("Re-entering Drag & Drop game from Hub...");
  await page.waitForSelector('[data-testid="game-btn-drag-drop-letter"]', { visible: true });
  await page.click('[data-testid="game-btn-drag-drop-letter"]');
  await delay(800);

  const teachReturn = await page.$('[data-testid="start-game-btn"]');
  if (teachReturn) {
    await teachReturn.click();
    await delay(500);
  }

  const returnedProgress = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      localStorage: parsed,
      hasTwoFourteen: document.body.innerText.includes("2/14"),
      earnedCount: parsed?.earnedRewardIds?.length,
      earnedRewardIds: parsed?.earnedRewardIds,
    };
  });
  console.log("[VERIFY] Returned State:", JSON.stringify(returnedProgress, null, 2));

  const shot5b = path.join(SCREENSHOT_DIR, "5b_returned_to_game_2_of_14_intact.png");
  await page.screenshot({ path: shot5b, fullPage: false });
  console.log(`[SCREENSHOT 5b SAVED]: ${shot5b}`);

  // Step 8: Play through all remaining levels (3 to 14) via genuine UI interaction
  console.log("\n[STEP 8] Playing through all remaining levels (Level 3 to 14)...");
  for (let lvl = 3; lvl <= 14; lvl++) {
    await solveCurrentLevel(lvl);

    const midProgress = await page.evaluate(() => {
      const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        completedLevels: parsed?.completedLevels,
        earnedCount: parsed?.earnedRewardIds?.length,
      };
    });
    console.log(`[VERIFY] Level ${lvl} complete -> Earned count: ${midProgress.earnedCount}/14`);

    if (lvl === 14) {
      // Level 14 Celebration Modal with full 14/14
      console.log("\n=== LEVEL 14 CELEBRATION MODAL WITH ALL 14 COMPONENTS ===");
      const shot6 = path.join(SCREENSHOT_DIR, "6_all_14_levels_complete_car_assembled.png");
      await page.screenshot({ path: shot6, fullPage: false });
      console.log(`[SCREENSHOT 6 SAVED]: ${shot6}`);

      // Dismiss modal to show final workshop with all 14 components
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);

      const shot7 = path.join(SCREENSHOT_DIR, "7_final_workshop_14_of_14_full_vehicle.png");
      await page.screenshot({ path: shot7, fullPage: false });
      console.log(`[SCREENSHOT 7 SAVED]: ${shot7}`);
    } else {
      // Advance to next level
      await page.click('[data-testid="next-level-btn"]');
      await delay(800);
    }
  }

  const finalStored = await page.evaluate(() => {
    const raw = localStorage.getItem("noor_kids_game_progress_v2_drag-drop-letter");
    return JSON.parse(raw || "{}");
  });

  console.log("\n=== FINAL VERIFIED PROGRESS IN LOCALSTORAGE ===");
  console.log(JSON.stringify(finalStored, null, 2));

  await browser.close();
  console.log("\n=== DRAG & DROP REAL PLAYTHROUGH COMPLETED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error("FATAL ERROR IN DRAG & DROP VERIFICATION:", err);
  process.exit(1);
});
