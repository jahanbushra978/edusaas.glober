import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = 'C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  console.log("Navigating to Human Teacher Platform...");
  await page.goto('http://localhost:3000/quran-tutor/studio?feature=human-teacher', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  // Dismiss guest modal if visible
  const guestBtn = await page.$('xpath///button[contains(., "অতিথি হিসেবে শিক্ষকদের প্রোফাইল দেখুন")]');
  if (guestBtn) {
    await guestBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Click "স্টুডেন্ট প্রোফাইল"
  const studentBtn = await page.$('xpath///button[contains(., "স্টুডেন্ট প্রোফাইল")]');
  if (studentBtn) {
    await studentBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'student_marketplace_profile.png'), fullPage: false });
    console.log("Captured student_marketplace_profile.png successfully!");
  } else {
    console.log("Student profile button not found");
  }

  await browser.close();
}

run().catch(console.error);
