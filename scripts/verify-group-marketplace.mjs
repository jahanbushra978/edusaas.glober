import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = 'C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  // 1. Visit Human Teacher Platform
  console.log("Navigating to Human Teacher Platform...");
  await page.goto('http://localhost:3000/quran-tutor/studio?feature=human-teacher', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Dismiss guest modal if visible
  const guestBtn = await page.$('xpath///button[contains(., "অতিথি হিসেবে শিক্ষকদের প্রোফাইল দেখুন")]');
  if (guestBtn) {
    await guestBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Capture directory with upgraded buttons
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'human_teacher_directory_upgraded.png'), fullPage: false });
  console.log("Captured human_teacher_directory_upgraded.png");

  // 2. Open Teacher Dashboard
  const dashboardBtn = await page.$('xpath///button[contains(., "টিচার ড্যাশবোর্ড")]');
  if (dashboardBtn) {
    await dashboardBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'teacher_marketplace_dashboard.png'), fullPage: false });
    console.log("Captured teacher_marketplace_dashboard.png");

    // Click "গ্রুপ লাইভ ক্লাস শুরু করুন" from dashboard
    const launchGroupBtn = await page.$('xpath///button[contains(., "গ্রুপ লাইভ ক্লাস শুরু করুন")]');
    if (launchGroupBtn) {
      await launchGroupBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'webrtc_group_classroom.png'), fullPage: false });
      console.log("Captured webrtc_group_classroom.png");
    }
  }

  await browser.close();
  console.log("Verification screenshots captured successfully!");
}

run().catch(console.error);

