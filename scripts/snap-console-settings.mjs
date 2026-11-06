import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/platform-console/settings', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const teacherTab = await page.$('xpath///button[contains(., "হিউম্যান টিচার ও কমিশন কন্ট্রোল")]');
  if (teacherTab) {
    await teacherTab.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  await page.screenshot({ path: 'C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4/platform_console_teacher_settings.png' });
  await browser.close();
  console.log('Console settings snap complete');
}
run().catch(console.error);

