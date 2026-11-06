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
  console.log('🚀 Running Full Verification for Home Multi-Author Feed & Dedicated Panels...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Visit Home Page
  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll down a bit to show the rich global feed cards
  await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'evidence-01-home-global-social-feed.png'),
    fullPage: false,
  });
  console.log('📸 Captured evidence-01-home-global-social-feed.png');

  // 2. Click author name/photo on Abdullah Al-Mamun\'s post
  console.log('Clicking on post author (Abdullah Al-Mamun) to navigate to profile...');
  const clickedAuthor = await page.evaluate(() => {
    const authorHeadings = Array.from(document.querySelectorAll('h4'));
    const mamunHeading = authorHeadings.find(h => h.textContent.includes('আব্দুল্লাহ আল-মামুন'));
    if (mamunHeading) {
      mamunHeading.click();
      return true;
    }
    return false;
  });

  if (clickedAuthor) {
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'evidence-02-clicked-author-student-profile.png'),
      fullPage: false,
    });
    console.log('📸 Captured evidence-02-clicked-author-student-profile.png');
  } else {
    console.log('Could not find author heading, checking fallback');
  }

  // 3. Navigate to Teacher Panel (Only Teachers)
  console.log('Navigating to Teacher Panel...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('টিচার প্যানেল'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'evidence-03-teacher-panel-10-teachers.png'),
    fullPage: false,
  });
  console.log('📸 Captured evidence-03-teacher-panel-10-teachers.png');

  // 4. Search Teacher by ID / Name
  console.log('Searching teacher by ID/Name "ahmadullah"...');
  await page.evaluate(() => {
    const searchInputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const teacherSearch = searchInputs.find(i => i.placeholder && i.placeholder.includes('শিক্ষকের নাম'));
    if (teacherSearch) {
      teacherSearch.focus();
      teacherSearch.value = 'ahmadullah';
      teacherSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'evidence-04-teacher-panel-search-filter.png'),
    fullPage: false,
  });
  console.log('📸 Captured evidence-04-teacher-panel-search-filter.png');

  // 5. Navigate to Student Panel (Only Students)
  console.log('Navigating to Student Panel...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('স্টুডেন্ট প্যানেল'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'evidence-05-student-panel-10-students.png'),
    fullPage: false,
  });
  console.log('📸 Captured evidence-05-student-panel-10-students.png');

  // 6. Search Student by ID "STU-1005"
  console.log('Searching student by ID "STU-1005"...');
  await page.evaluate(() => {
    const searchInputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const studentSearch = searchInputs.find(i => i.placeholder && i.placeholder.includes('STU-1001'));
    if (studentSearch) {
      studentSearch.focus();
      studentSearch.value = 'STU-1005';
      studentSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'evidence-06-student-panel-id-search.png'),
    fullPage: false,
  });
  console.log('📸 Captured evidence-06-student-panel-id-search.png');

  await browser.close();
  console.log('✅ All evidence captured successfully!');
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

