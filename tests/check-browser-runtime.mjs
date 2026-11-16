import puppeteer from "puppeteer-core";

async function checkConsoleAndErrors() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1280,800"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.toString());
  });

  console.log("Navigating to http://localhost:3000/quran-tutor/studio?feature=human-teacher ...");
  const response = await page.goto("http://localhost:3000/quran-tutor/studio?feature=human-teacher", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  console.log("Status code:", response.status());

  await new Promise((r) => setTimeout(r, 4000));

  console.log("--- BROWSER CONSOLE ERRORS / WARNINGS ---");
  consoleLogs.filter((l) => l.includes("[error]") || l.includes("[warn]")).forEach((l) => console.log(l));

  console.log("--- PAGE UNCAUGHT ERRORS ---");
  pageErrors.forEach((e) => console.log("PAGE ERROR:", e));

  // Check if page redirected or is still on the right URL
  console.log("Current URL after 4 seconds:", page.url());

  // Check if Human Teacher Platform is rendered
  const hasHumanTeacher = await page.evaluate(() => {
    return document.body.innerText.includes("Human Teacher") || document.body.innerText.includes("হিউম্যান টিচার");
  });
  console.log("Human Teacher rendered:", hasHumanTeacher);

  await browser.close();
}

checkConsoleAndErrors().catch(console.error);

