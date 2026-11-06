import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox"]
});

const page = await browser.newPage();
page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
page.on("pageerror", err => console.log("PAGE ERROR:", err.message));

console.log("Navigating...");
await page.goto("http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher", { waitUntil: "networkidle2" });
await new Promise(r => setTimeout(r, 2000));

const title = await page.title();
console.log("PAGE TITLE:", title);
const bodyText = await page.evaluate(() => document.body.innerText);
console.log("BODY TEXT FIRST 600 CHARS:\n", bodyText.slice(0, 600));

await browser.close();

