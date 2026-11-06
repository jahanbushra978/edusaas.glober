import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3005/quran-tutor/games";

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function debugTrace() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,1200"],
    defaultViewport: { width: 1280, height: 1200 },
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.removeItem("noor_kids_active_game_v2");
    localStorage.removeItem("noor_kids_game_progress_v2_trace-letter");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await delay(500);

  await page.waitForSelector('[data-testid="game-btn-trace-letter"]');
  await page.click('[data-testid="game-btn-trace-letter"]');
  await delay(800);

  const teachBtn = await page.$('[data-testid="start-game-btn"]');
  if (teachBtn) await teachBtn.click();
  await delay(500);

  // Scroll canvas into center
  await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (c) c.scrollIntoView({ block: 'center' });
  });
  await delay(300);

  for (let l = 0; l < 7; l++) {
    console.log(`Debug tracing letter ${l + 1}/7...`);
    await delay(300);
    const letterInfo = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2 ? h2.textContent : 'none';
    });
    console.log(`Current letter heading: ${letterInfo}`);

    let letterFinished = false;
    for (let loop = 0; loop < 20; loop++) {
      const nextBtn = await page.$('[data-testid="trace-next-letter-btn"]');
      if (nextBtn) {
        console.log(`Found next letter button on letter ${l + 1}! Clicking...`);
        await nextBtn.click();
        await delay(600);
        letterFinished = true;
        break;
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
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, label: current.textContent.trim() };
      });

      if (currentWp) {
        console.log(`  Hit waypoint ${currentWp.label} at (${Math.round(currentWp.x)}, ${Math.round(currentWp.y)})`);
        await page.mouse.move(currentWp.x, currentWp.y);
        await page.mouse.down();
        await page.mouse.move(currentWp.x + 2, currentWp.y + 2, { steps: 3 });
        await page.mouse.up();
        await delay(150);
      } else {
        console.log(`  No current bouncing waypoint found at loop ${loop}`);
        await delay(200);
      }
    }

    if (!letterFinished) {
      console.log(`FAILED TO FINISH LETTER ${l + 1}!`);
      break;
    }
  }

  // Check celebration modal
  await delay(1000);
  const celebrationModal = await page.$('[data-testid="next-level-btn"]');
  console.log(`Celebration modal next-level-btn present? ${!!celebrationModal}`);

  await browser.close();
}

debugTrace().catch(console.error);
