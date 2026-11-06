import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4";
const EVIDENCE_DIR = path.join(ARTIFACT_DIR, "qa-evidence-final");

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log("Starting QA Browser verification for Messenger, Roles, and Media Assets...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,850"],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  // Test 1: Load Human Teacher Platform
  console.log("Navigating to http://localhost:3000/quran-tutor/studio?feature=human-teacher...");
  await page.goto("http://localhost:3000/quran-tutor/studio?feature=human-teacher", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "01-home-feed-and-messenger-topbar.png") });
  console.log("Saved: 01-home-feed-and-messenger-topbar.png");

  // Test 2: Switch to Messenger Tab
  console.log("Clicking Messenger tab...");
  const messengerButtons = await page.$$("button");
  for (const b of messengerButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("মেসেঞ্জার")) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "02-messenger-chat-hub-inbox.png") });
  console.log("Saved: 02-messenger-chat-hub-inbox.png");

  // Test 3: Type and send a message in Messenger
  console.log("Sending a message in Messenger...");
  const inputs = await page.$$("input");
  for (const input of inputs) {
    const ph = await page.evaluate(el => el.placeholder, input);
    if (ph && ph.includes("বার্তা লিখুন")) {
      await input.type("আসসালামু আলাইকুম উস্তাদ, আমি তাজবীদ ও মাখরাজ শিখতে আগ্রহী।");
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));
  // Click send button
  const sendButtons = await page.$$("button");
  for (const b of sendButtons) {
    const title = await page.evaluate(el => el.title || el.innerText, b);
    if (title && (title.includes("পাঠান") || title.includes("বার্তা পাঠান"))) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "03-messenger-message-sent-and-reply.png") });
  console.log("Saved: 03-messenger-message-sent-and-reply.png");

  // Test 4: Check Student Directory and Student Profile
  console.log("Clicking Student Panel...");
  const navBtns = await page.$$("button");
  for (const b of navBtns) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("স্টুডেন্ট প্যানেল")) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "04-student-directory.png") });
  console.log("Saved: 04-student-directory.png");

  // Open first student profile (আব্দুল্লাহ আল-মামুন)
  const viewProfileBtns = await page.$$("button");
  for (const b of viewProfileBtns) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("প্রোফাইল দেখুন")) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "05-abdullah-mamun-profile-pure-islamic.png") });
  console.log("Saved: 05-abdullah-mamun-profile-pure-islamic.png");

  // Test 5: Switch Role cleanly via Quick Role Switcher
  console.log("Testing 1-click Role Switcher...");
  const roleButtons = await page.$$("button");
  for (const b of roleButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("ভূমিকা সুইচ")) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(EVIDENCE_DIR, "06-role-switcher-dropdown.png") });
  console.log("Saved: 06-role-switcher-dropdown.png");

  await browser.close();
  console.log("All tests and screenshots completed successfully!");
}

run().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
