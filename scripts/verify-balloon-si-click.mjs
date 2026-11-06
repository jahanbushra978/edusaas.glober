import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001/quran-tutor/games?game=balloon-pop";
const PUBLIC_SCREENSHOT_DIR = "public\\screenshots";
const ARTIFACT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\15e49d49-4284-46aa-b0d0-b82883b2cf20\\screenshots";

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("=== Detailed In-Game Audio Click Test for سِ and سَ ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.evaluateOnNewDocument(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];

    const originalPlay = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function() {
      const src = this.src || this.currentSrc;
      window.__playedAudio.push({
        src,
        time: Date.now()
      });
      return originalPlay.apply(this, arguments);
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      const origSpeak = window.speechSynthesis.speak;
      window.speechSynthesis.speak = function(utterance) {
        window.__speechSynthesisCalls.push({
          text: utterance ? utterance.text : null,
          lang: utterance ? utterance.lang : null,
          time: Date.now()
        });
        return origSpeak.apply(this, arguments);
      };
    }
  });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await delay(2000);

  // Clear progress
  await page.evaluate(() => {
    localStorage.removeItem("noor_kids_game_progress_v2_balloon-pop");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await delay(2000);

  // 1. Dismiss Level 1 Teach modal
  console.log("1. Dismissing Level 1 teach modal...");
  const startBtn1 = await page.$('[data-testid="start-game-btn"]');
  if (startBtn1) {
    await startBtn1.click();
    await delay(800);
  }

  // 2. Solve Level 1 (click correct balloons: 0, 3, 4)
  console.log("2. Solving Level 1...");
  const correctBalloonsLvl1 = await page.$$('button[data-correct="true"]');
  console.log(`Found ${correctBalloonsLvl1.length} correct balloons in Level 1.`);
  for (const b of correctBalloonsLvl1) {
    await b.click();
    await delay(300);
  }
  await delay(1200);

  // 3. Advance to Level 2
  console.log("3. Advancing to Level 2...");
  const nextBtn = await page.waitForSelector('[data-testid="next-level-btn"]', { timeout: 5000 });
  await nextBtn.click();
  await delay(1200);

  // 4. In Level 2 Teach modal, click the card for سِ
  console.log("4. In Level 2 Teach modal, clicking card for سِ...");
  await page.evaluate(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];
  });

  const clickedTeachSi = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div.fixed button'));
    const siCard = cards.find(c => c.textContent.includes('سِ'));
    if (siCard) {
      siCard.click();
      return true;
    }
    return false;
  });
  console.log("Clicked Teach Modal card for سِ:", clickedTeachSi);
  await delay(1200);

  const audioAfterTeachSi = await page.evaluate(() => window.__playedAudio);
  console.log("Audio played from Teach Modal for سِ:\n", JSON.stringify(audioAfterTeachSi, null, 2));

  // Dismiss Level 2 modal
  console.log("5. Dismissing Level 2 modal to enter game...");
  const startBtn2 = await page.$('[data-testid="start-game-btn"]');
  if (startBtn2) {
    await startBtn2.click();
    await delay(800);
  }

  // 6. In Level 2 balloon grid, click balloon with سِ
  console.log("6. Clicking balloon with سِ (Seen with Kasrah)...");
  await page.evaluate(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];
  });

  const clickedGameSi = await page.evaluate(() => {
    const balloon = document.querySelector('button[data-ar="سِ"]');
    if (balloon) {
      balloon.click();
      return true;
    }
    return false;
  });
  console.log("Clicked in-game balloon سِ:", clickedGameSi);
  await delay(1200);

  const audioAfterGameSi = await page.evaluate(() => window.__playedAudio);
  const synthAfterGameSi = await page.evaluate(() => window.__speechSynthesisCalls);
  console.log("Audio played when popping balloon سِ:\n", JSON.stringify(audioAfterGameSi, null, 2));
  console.log("SpeechSynthesis count when popping سِ:", synthAfterGameSi.length);

  // 7. In Level 2 balloon grid, click balloon with سَ
  console.log("7. Clicking balloon with سَ (Seen with Fatha)...");
  await page.evaluate(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];
  });

  const clickedGameSa = await page.evaluate(() => {
    const balloon = document.querySelector('button[data-ar="سَ"]');
    if (balloon) {
      balloon.click();
      return true;
    }
    return false;
  });
  console.log("Clicked in-game balloon سَ:", clickedGameSa);
  await delay(1200);

  const audioAfterGameSa = await page.evaluate(() => window.__playedAudio);
  const synthAfterGameSa = await page.evaluate(() => window.__speechSynthesisCalls);
  console.log("Audio played when clicking balloon سَ:\n", JSON.stringify(audioAfterGameSa, null, 2));
  console.log("SpeechSynthesis count when clicking سَ:", synthAfterGameSa.length);

  // Save screenshot of Level 2 with popped balloon
  const shotPath = path.join(PUBLIC_SCREENSHOT_DIR, 'seen_kasrah_actual_gameplay_verified.png');
  const shotArtifact = path.join(ARTIFACT_DIR, 'seen_kasrah_actual_gameplay_verified.png');
  await page.screenshot({ path: shotPath });
  fs.copyFileSync(shotPath, shotArtifact);
  console.log("Screenshot saved:", shotPath);

  await browser.close();
  console.log("=== End-to-End Test Finished! ===");
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
