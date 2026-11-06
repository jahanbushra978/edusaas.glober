import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher";
const SCREENSHOTS_DIR = 'C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4/qa-screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Puppeteer verification with Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Visit Human Teacher Platform
  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-01-home-hind-siliguri.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-01-home-hind-siliguri.png');

  // 2. Click Student Panel to view the 10 students
  console.log('Clicking Student Panel...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('স্টুডেন্ট প্যানেল'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-02-student-directory-10-students.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-02-student-directory-10-students.png');

  // 3. Click Profile of STU-1001 (আব্দুল্লাহ আল-মামুন) to verify cover photo is Islamic (NO FLOWERS)
  console.log('Opening STU-1001 profile...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('প্রোফাইল দেখুন'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-03-student-profile-authentic-islamic-cover.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-03-student-profile-authentic-islamic-cover.png');

  // 4. Set Teacher Session to verify Teacher Dashboard & Account Deletion Danger Zone
  console.log('Logging in as Teacher (শায়খ ক্বারী মাহমুদুল হাসান)...');
  await page.evaluate(() => {
    const demoTeacher = {
      id: "qari-mahmudul-hasan",
      teacher_id: "qari-mahmudul-hasan",
      nameBn: "শায়খ ক্বারী মাহমুদুল হাসান",
      name_bn: "শায়খ ক্বারী মাহমুদুল হাসান",
      titleBn: "সিনিয়র কিরাআত ও তাজবীদ শিক্ষক",
      status: "approved",
      hourly_fee: 450,
      monthly_fee: 3200,
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      coverPhoto: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80"
    };
    localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(demoTeacher));
    window.location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-04-teacher-logged-in-badge.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-04-teacher-logged-in-badge.png');

  // 5. Open Teacher Dashboard
  console.log('Opening Teacher Dashboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('টিচার ড্যাশবোর্ড'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-05-teacher-dashboard-overview.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-05-teacher-dashboard-overview.png');

  // 6. Go to Settings/Profile tab in Teacher Dashboard to show Account Deletion Danger Zone
  console.log('Navigating to Profile Settings...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('প্রোফাইল সেটিংস') || b.textContent.includes('সেটিংস'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-06-teacher-profile-danger-zone.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-06-teacher-profile-danger-zone.png');

  // 7. Click Delete Account to show Confirmation Modal
  console.log('Clicking Delete Account button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('মুছে ফেলুন') || b.textContent.includes('Delete Account'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'fix-07-delete-account-confirmation-modal.png'),
    fullPage: false,
  });
  console.log('📸 Captured fix-07-delete-account-confirmation-modal.png');

  await browser.close();
  console.log('✅ All verification steps completed successfully!');
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
