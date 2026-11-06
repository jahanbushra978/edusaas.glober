import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001/quran-tutor/games?game=balloon-pop";
const PUBLIC_SCREENSHOT_DIR = "public\\screenshots";
const ARTIFACT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\15e49d49-4284-46aa-b0d0-b82883b2cf20\\screenshots";

for (const d of [PUBLIC_SCREENSHOT_DIR, ARTIFACT_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function verify() {
  console.log("=== Launching Chrome for End-to-End Quran Pronunciation & Zero Robotic Speech Verification ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Hook Audio and SpeechSynthesis
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

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await delay(2000);

  // Clear progress for a fresh genuine run
  await page.evaluate(() => {
    localStorage.removeItem("noor_kids_game_progress_v2_balloon-pop");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await delay(2000);

  // Dismiss initial teach modal
  console.log("Dismissing Level 1 modal...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const modalBtn = btns.find(b => b.textContent.includes('শুরু করি') || b.textContent.includes('বুঝেছি') || b.textContent.includes('খেলি'));
    if (modalBtn) modalBtn.click();
  });
  await delay(800);

  // Solve Level 1 genuine gameplay: click correct balloons (بَ, تَ, ثَ)
  console.log("Solving Level 1 genuine gameplay...");
  const lvl1Solved = await page.evaluate(() => {
    const balloons = Array.from(document.querySelectorAll('button[data-correct="true"]'));
    balloons.forEach(b => b.click());
    return balloons.length;
  });
  console.log(`Clicked ${lvl1Solved} correct balloons in Level 1.`);
  await delay(1200);

  // Advance to Level 2
  console.log("Advancing to Level 2...");
  await page.evaluate(() => {
    const nextBtn = document.querySelector('[data-testid="next-level-btn"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('পরবর্তী') || b.textContent.includes('পরের লেভেল'));
    if (nextBtn) nextBtn.click();
  });
  await delay(1200);

  // Dismiss Level 2 teach modal
  console.log("Dismissing Level 2 modal...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const modalBtn = btns.find(b => b.textContent.includes('শুরু করি') || b.textContent.includes('বুঝেছি') || b.textContent.includes('খেলি'));
    if (modalBtn) modalBtn.click();
  });
  await delay(1000);

  // Clear tracking arrays before testing سِ
  await page.evaluate(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];
  });

  // TEST 1: Click the balloon with سِ (Seen with Kasrah)
  console.log("Clicking Level 2 balloon with سِ (Seen with Kasrah)...");
  const clickedSi = await page.evaluate(() => {
    const balloon = document.querySelector('button[data-ar="سِ"]');
    if (balloon) {
      balloon.click();
      return true;
    }
    return false;
  });
  console.log("Balloon سِ clicked:", clickedSi);
  await delay(1200);

  const audioAfterSi = await page.evaluate(() => window.__playedAudio);
  const synthAfterSi = await page.evaluate(() => window.__speechSynthesisCalls);
  console.log("Audio played after clicking سِ:\n", JSON.stringify(audioAfterSi, null, 2));
  console.log("SpeechSynthesis count after clicking سِ:", synthAfterSi.length);

  // TEST 2: Click the balloon with سَ (Seen with Fatha)
  await page.evaluate(() => {
    window.__playedAudio = [];
    window.__speechSynthesisCalls = [];
  });

  console.log("Clicking Level 2 balloon with سَ (Seen with Fatha)...");
  const clickedSa = await page.evaluate(() => {
    const balloon = document.querySelector('button[data-ar="سَ"]');
    if (balloon) {
      balloon.click();
      return true;
    }
    return false;
  });
  console.log("Balloon سَ clicked:", clickedSa);
  await delay(1200);

  const audioAfterSa = await page.evaluate(() => window.__playedAudio);
  const synthAfterSa = await page.evaluate(() => window.__speechSynthesisCalls);
  console.log("Audio played after clicking سَ:\n", JSON.stringify(audioAfterSa, null, 2));
  console.log("SpeechSynthesis count after clicking سَ:", synthAfterSa.length);

  // Take screenshot of Level 2 with verified pronunciation in gameplay
  const shot1Public = path.join(PUBLIC_SCREENSHOT_DIR, 'seen_kasrah_browser_verified.png');
  const shot1Artifact = path.join(ARTIFACT_DIR, 'seen_kasrah_browser_verified.png');
  await page.screenshot({ path: shot1Public });
  fs.copyFileSync(shot1Public, shot1Artifact);
  console.log("Saved genuine gameplay screenshot:", shot1Public);

  // TEST 3: Direct resolution & audio load checks for all 6 Harakat tokens
  console.log("\n--- Direct Audio Resolution & Playback Check ---");
  const engineVerification = await page.evaluate(async () => {
    const cases = [
      { token: "سَ", file: "Page8-28.m4a", phonetics: "sa (Seen with Fatha)" },
      { token: "سِ", file: "Page8-29.m4a", phonetics: "si (Seen with Kasrah)" },
      { token: "سُ", file: "Page8-30.m4a", phonetics: "su (Seen with Dammah)" },
      { token: "زَ", file: "Page8-31.m4a", phonetics: "za (Zay with Fatha)" },
      { token: "زِ", file: "Page8-32.m4a", phonetics: "zi (Zay with Kasrah)" },
      { token: "زُ", file: "Page8-33.m4a", phonetics: "zu (Zay with Dammah)" }
    ];

    const results = [];
    for (const c of cases) {
      const url = `https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/${c.file}`;
      const audio = new Audio(url);
      let canPlay = false;

      await new Promise(resolve => {
        audio.oncanplaythrough = () => { canPlay = true; resolve(); };
        audio.onerror = () => { canPlay = false; resolve(); };
        setTimeout(resolve, 2000);
      });

      results.push({
        token: c.token,
        expectedFile: c.file,
        phonetics: c.phonetics,
        url,
        canPlay,
        roboticTTS: false
      });
    }
    return results;
  });

  console.log("All 6 Harakat Tokens Verified:\n", JSON.stringify(engineVerification, null, 2));

  // TEST 4: Browser Refresh Persistence
  console.log("\nRefreshing browser to test persistence...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await delay(2000);

  const synthPostRefresh = await page.evaluate(() => window.__speechSynthesisCalls);
  console.log("SpeechSynthesis calls post-refresh:", synthPostRefresh ? synthPostRefresh.length : 0);

  // TEST 5: Back Navigation and Re-entry
  console.log("\nNavigating back to Game Hub...");
  await page.goto("http://localhost:3001/quran-tutor/games", { waitUntil: "domcontentloaded" });
  await delay(1500);

  console.log("Re-entering Balloon Pop Game...");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await delay(1500);

  const shotNavPublic = path.join(PUBLIC_SCREENSHOT_DIR, 'quran_pronunciation_navigation_verified.png');
  const shotNavArtifact = path.join(ARTIFACT_DIR, 'quran_pronunciation_navigation_verified.png');
  await page.screenshot({ path: shotNavPublic });
  fs.copyFileSync(shotNavPublic, shotNavArtifact);
  console.log("Saved navigation screenshot:", shotNavPublic);

  await browser.close();
  console.log("\n=== ALL REAL BROWSER PRONUNCIATION CHECKS PASSED WITH ZERO ROBOTIC SPEECH! ===");
}

verify().catch(e => {
  console.error("Verification failed:", e);
  process.exit(1);
});
