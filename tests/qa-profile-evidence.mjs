import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000/quran-tutor/studio?feature=human-teacher";
const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\4eb044b3-6647-4b7c-a39d-ba67a843a2f4\\qa-evidence-final";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Set active approved teacher in localStorage
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
  await new Promise((r) => setTimeout(r, 2000));

  // Click the teacher profile pill in the header to open Facebook-style profile directly!
  const teacherPill = await page.$('button[title*="আমার ফেসবুক প্রোফাইলে যান"]');
  if (teacherPill) {
    await teacherPill.click();
    await new Promise((r) => setTimeout(r, 1500));
  } else {
    // Fallback: click on teacher card from directory
    const teacherCard = await page.$('text/শায়খ ক্বারী মাহমুদুল হাসান');
    if (teacherCard) {
      await teacherCard.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Screenshot: Teacher Facebook Profile with [📷 কভার পরিবর্তন], [📷] avatar badge, and [📷 ছবি পরিবর্তন]
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "09-teacher-facebook-profile-with-camera-upload-buttons.png"),
    fullPage: false,
  });
  console.log("📸 Saved 09-teacher-facebook-profile-with-camera-upload-buttons.png");

  // Click on "রিলস ও ক্লিপস" tab
  const reelsTab = await page.$('text/রিলস ও ক্লিপস');
  if (reelsTab) {
    await reelsTab.click();
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10-teacher-profile-reels-tab.png"),
      fullPage: false,
    });
    console.log("📸 Saved 10-teacher-profile-reels-tab.png");
  }

  // Now test student invitation connection request: switch to student directory tab
  await page.evaluate(() => {
    window.location.hash = "";
  });
  const studentDirectoryTab = await page.$('text/স্টুডেন্ট প্যানেল');
  if (studentDirectoryTab) {
    await studentDirectoryTab.click();
    await new Promise((r) => setTimeout(r, 1500));

    // Click "আমি আপনাকে পড়াতে চাই" on the first student card
    const inviteBtn = await page.$('text/আমি আপনাকে পড়াতে চাই');
    if (inviteBtn) {
      await inviteBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "11-mutual-connection-request-modal-seamless.png"),
        fullPage: false,
      });
      console.log("📸 Saved 11-mutual-connection-request-modal-seamless.png");
    }
  }

  await browser.close();
  console.log("✅ All evidence captured!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});

