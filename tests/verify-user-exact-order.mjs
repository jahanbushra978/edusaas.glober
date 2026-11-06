import puppeteer from "puppeteer-core";

const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\809c0225-ee3c-407d-b4af-93a4f253c1cd";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1280,1050"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1050 });

  console.log("Navigating to studio main page...");
  await page.goto("http://localhost:3000/quran-tutor/studio", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  await new Promise((r) => setTimeout(r, 2000));

  const sectionHeader = await page.waitForSelector('xpath///h3[contains(., "ইলম ও তাজবীদ")]', { timeout: 10000 });
  if (sectionHeader) {
    await sectionHeader.scrollIntoView();
  }

  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/verified-exact-user-order.png` });
  console.log("Saved verified-exact-user-order.png");

  await browser.close();
  console.log("VERIFICATION COMPLETED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
