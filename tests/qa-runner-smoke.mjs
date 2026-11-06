import puppeteer from "puppeteer-core";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher";
const SCREENSHOTS_DIR = path.resolve("artifacts/human-teacher-real-world-qa");

async function runSmoke() {
  console.log("Launching Chrome with puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    console.log("Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshotPath = path.join(SCREENSHOTS_DIR, "00-smoke-home.png");
    await page.screenshot({ path: screenshotPath });
    console.log("Smoke screenshot saved to:", screenshotPath);
  } finally {
    await browser.close();
  }
}

runSmoke().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});

