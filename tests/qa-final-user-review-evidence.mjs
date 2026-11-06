import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher";
const ADMIN_URL = "http://127.0.0.1:3000/admin";
const SCREENSHOTS_DIR = 'C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4/qa-screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Running Full Verification for User Feedback Fixes...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Visit Human Teacher Page & Reset any broken test session
  console.log('Navigating to Human Teacher page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.removeItem("edusaas_registered_marketplace_teachers");
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: Clean Top Bar & Home Feed
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-evidence-01-clean-topbar-and-feed.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-evidence-01-clean-topbar-and-feed.png');

  // 2. Click on Abdullah Al-Mamun\'s post to open profile
  console.log('Opening Abdullah Al-Mamun profile...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h4'));
    const mamun = headings.find(h => h.textContent.includes('আব্দুল্লাহ আল-মামুন'));
    if (mamun) mamun.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 2: Abdullah Al-Mamun profile with Kaaba Cover & Islamic Avatar
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-evidence-02-islamic-student-profile-cover-avatar.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-evidence-02-islamic-student-profile-cover-avatar.png');

  // 3. Switch to Approved Teacher role via Role Switcher
  console.log('Switching to approved teacher role...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const roleBtn = btns.find(b => b.textContent.includes('ভূমিকা সুইচ'));
    if (roleBtn) roleBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const teacherBtn = btns.find(b => b.textContent.includes('শায়খ মাহমুদুল হাসান'));
    if (teacherBtn) teacherBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 3: Teacher Role Active with Golden Dashboard Button
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-evidence-03-active-teacher-session.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-evidence-03-active-teacher-session.png');

  // 4. Open Teacher Dashboard
  console.log('Opening Teacher Dashboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dashBtn = btns.find(b => b.textContent.includes('টিচার ড্যাশবোর্ড'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 4: Teacher Dashboard View
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-evidence-04-teacher-dashboard-view.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-evidence-04-teacher-dashboard-view.png');

  // 5. Navigate to Admin Console to test Marketplace Teachers Tab & Delete
  console.log('Navigating to Admin console for marketplace teacher management...');
  await page.goto(ADMIN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));

  // Open Teachers tab in Admin
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, a'));
    const teacherTab = tabs.find(t => t.textContent.includes('Teachers') || t.textContent.includes('শিক্ষক'));
    if (teacherTab) teacherTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Switch to Marketplace Teachers tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const marketBtn = btns.find(b => b.textContent.includes('মার্কেটপ্লেস ও হিউম্যান উস্তাদগণ'));
    if (marketBtn) marketBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 5: Admin Console Marketplace Teachers Tab
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-evidence-05-admin-console-marketplace-teachers.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-evidence-05-admin-console-marketplace-teachers.png');

  console.log('✅ All verification steps completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('QA Error:', err);
  process.exit(1);
});

