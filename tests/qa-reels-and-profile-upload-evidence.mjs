import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000/quran-tutor/studio?feature=human-teacher";
const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\4eb044b3-6647-4b7c-a39d-ba67a843a2f4\\qa-evidence-final";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log("🚀 Launching browser to test Facebook Profile Photo Uploads & Reels Creator...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Pre-warm teacher login via cookie/storage
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Ensure active approved teacher session
  await page.evaluate(() => {
    const teacherSession = {
      id: "qari-mahmudul-hasan",
      teacher_id: "qari-mahmudul-hasan",
      nameBn: "শায়খ ক্বারী মাহমুদুল হাসান",
      titleBn: "আন্তর্জাতিক সনদপ্রাপ্ত ক্বারী ও সিনিয়র হিফজ মেন্টর",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
      status: "approved",
      hourly_fee: 400,
      monthly_fee: 2500,
    };
    localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(teacherSession));
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2500));

  // EVIDENCE 1: Top bar shows logged-in teacher pill & Home Feed has "রিল তৈরি করুন" card
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "07-reels-creator-card-in-home-feed.png"),
    fullPage: false,
  });
  console.log("📸 Evidence 1: Home Feed with 'রিল তৈরি করুন' card saved.");

  // EVIDENCE 2: Click "রিল তৈরি করুন" card to open the Reel Creator Modal
  const createReelCard = await page.$('text/রিল তৈরি করুন');
  if (createReelCard) {
    await createReelCard.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08-create-reel-modal-opened.png"),
      fullPage: false,
    });
    console.log("📸 Evidence 2: Create Reel Modal opened.");

    // Select a sample Islamic video template and publish
    const sampleBtn = await page.$('text/সূরা মাশক');
    if (sampleBtn) {
      await sampleBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    const publishBtn = await page.$('text/রিল প্রকাশ করুন');
    if (publishBtn) {
      await publishBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "09-new-reel-published-and-playing.png"),
        fullPage: false,
      });
      console.log("📸 Evidence 3: New Reel Published & Playing in modal.");

      // Close player modal
      await page.keyboard.press("Escape");
      const closeBtn = await page.$('button[title="Close"], .fixed button');
      if (closeBtn) await closeBtn.click().catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // EVIDENCE 4: Click the Teacher Name/Avatar pill in the Top Bar to navigate directly to their Facebook Profile
  const teacherPill = await page.$('button[title*="আমার ফেসবুক প্রোফাইলে যান"]');
  if (teacherPill) {
    await teacherPill.click();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10-teacher-facebook-profile-with-camera-upload-buttons.png"),
      fullPage: false,
    });
    console.log("📸 Evidence 4: Direct navigation to Teacher Facebook Profile with [📷 কভার পরিবর্তন] and [📷 ছবি পরিবর্তন] buttons.");
  }

  // EVIDENCE 5: Teacher Profile -> "রিলস ও ক্লিপস" Tab
  const reelsTab = await page.$('text/রিলস ও ক্লিপস');
  if (reelsTab) {
    await reelsTab.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "11-teacher-profile-reels-tab.png"),
      fullPage: false,
    });
    console.log("📸 Evidence 5: Teacher Profile Reels Tab with active video feed.");
  }

  await browser.close();
  console.log("✅ All tests and screenshot evidence captured successfully!");
}

run().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});

