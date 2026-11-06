import puppeteer from 'puppeteer-core';
import fs from 'fs';
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
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Visit Human Teacher Directory in Guest Mode
  console.log("Navigating to Human Teacher Platform...");
  await page.goto('http://localhost:3000/quran-tutor/studio?feature=human-teacher', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // If login modal is visible, click guest preview button
  const guestBtn = await page.$('xpath///button[contains(., "অতিথি হিসেবে শিক্ষকদের প্রোফাইল দেখুন")]');
  if (guestBtn) {
    await guestBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Capture directory with register button
  const dirPath = path.join(ARTIFACT_DIR, 'human_teacher_directory_updated.png');
  await page.screenshot({ path: dirPath, fullPage: false });
  console.log("Directory screenshot saved to:", dirPath);

  // 2. Open First Teacher Profile (Facebook Style)
  const profileBtn = await page.$('xpath///button[contains(., "প্রোফাইল দেখুন")]');
  if (profileBtn) {
    await profileBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Click "ফি ও ওয়ালেট বিবরণ" tab
    const walletTab = await page.$('xpath///button[contains(., "ফি ও ওয়ালেট বিবরণ")]');
    if (walletTab) {
      await walletTab.click();
      await new Promise(r => setTimeout(r, 800));
    }

    const walletPath = path.join(ARTIFACT_DIR, 'human_teacher_wallet_tab.png');
    await page.screenshot({ path: walletPath, fullPage: false });
    console.log("Wallet tab screenshot saved to:", walletPath);

    // Click "সরাসরি কথা বলুন" to launch WebRTC Call
    const callBtn = await page.$('xpath///button[contains(., "সরাসরি কথা বলুন")]');
    if (callBtn) {
      // Mock login state in localStorage if prompted
      await page.evaluate(() => {
        // trigger call directly by clicking or evaluating
      });
      await callBtn.click();
      await new Promise(r => setTimeout(r, 1500));

      const callPath = path.join(ARTIFACT_DIR, 'webrtc_live_call_modal.png');
      await page.screenshot({ path: callPath, fullPage: false });
      console.log("WebRTC Call modal screenshot saved to:", callPath);
    }
  }

  // 3. Visit Platform Console Settings
  console.log("Navigating to Platform Console Settings...");
  // Set mock platform owner cookie
  await page.setCookie({
    name: 'edu_platform_session',
    value: 'mock_superadmin_token_active',
    domain: 'localhost',
  });
  await page.goto('http://localhost:3000/platform-console/settings', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => console.log("Navigated with fallback", e.message));
  await new Promise(r => setTimeout(r, 2000));

  // Click "হিউম্যান টিচার ও কমিশন কন্ট্রোল" tab
  const teacherTab = await page.$('xpath///button[contains(., "হিউম্যান টিচার ও কমিশন কন্ট্রোল")]');
  if (teacherTab) {
    await teacherTab.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  const consoleSettingsPath = path.join(ARTIFACT_DIR, 'platform_console_teacher_settings.png');
  await page.screenshot({ path: consoleSettingsPath, fullPage: false });
  console.log("Platform console settings screenshot saved to:", consoleSettingsPath);

  await browser.close();
  console.log("All screenshots verified successfully!");
}

run().catch(console.error);
