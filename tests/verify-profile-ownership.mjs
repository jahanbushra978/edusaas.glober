import puppeteer from "puppeteer-core";
import path from "path";

const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\809c0225-ee3c-407d-b4af-93a4f253c1cd";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1280,800"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to studio...");
  await page.goto("http://localhost:3000/quran-tutor/studio?feature=human-teacher", {
    waitUntil: "domcontentloaded",
  });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Switch to Abdullah Al-Mamun
  const switchBtn = await page.$('button[title*="সুইচ"]');
  if (switchBtn) {
    await switchBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    const abdullahBtn = await page.$('text/আব্দুল্লাহ আল-মামুন');
    if (abdullahBtn) {
      await abdullahBtn.click();
      console.log("Switched to Abdullah Al-Mamun!");
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // 2. Open Student Directory (স্টুডেন্ট প্যানেল)
  const studentPanelTab = await page.$('text/স্টুডেন্ট প্যানেল');
  if (studentPanelTab) {
    await studentPanelTab.click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 3. Click on Fatema Zohra
  const fatemaCard = await page.$('text/ফাতেমা জোহরা');
  if (fatemaCard) {
    await fatemaCard.click();
    console.log("Clicked on Fatema Zohra profile!");
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Check if "কভার পরিবর্তন" is visible when Abdullah views Fatema
  const coverChangeBtn = await page.$('text/কভার পরিবর্তন');
  console.log("Viewing someone else: Is [কভার পরিবর্তন] visible?", Boolean(coverChangeBtn));

  // Take screenshot of someone else viewing Fatema's profile
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "evidence-viewing-other-student-profile.png"),
    fullPage: false,
  });
  console.log("Saved evidence-viewing-other-student-profile.png");

  // 4. Now switch to Fatema Zohra from Role Switcher
  const switchBtn2 = await page.$('button[title*="সুইচ"]');
  if (switchBtn2) {
    await switchBtn2.click();
    await new Promise((r) => setTimeout(r, 600));
    const fatemaRoleBtn = await page.$('text/ফাতেমা জোহরা');
    if (fatemaRoleBtn) {
      await fatemaRoleBtn.click();
      console.log("Switched to Fatema Zohra!");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Re-open Fatema's profile
  const studentPanelTab2 = await page.$('text/স্টুডেন্ট প্যানেল');
  if (studentPanelTab2) {
    await studentPanelTab2.click();
    await new Promise((r) => setTimeout(r, 1000));
    const fatemaCard2 = await page.$('text/ফাতেমা জোহরা');
    if (fatemaCard2) {
      await fatemaCard2.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Check if "কভার পরিবর্তন" is visible when Fatema views her OWN profile
  const coverChangeBtnOwn = await page.$('text/কভার পরিবর্তন');
  console.log("Viewing OWN profile: Is [কভার পরিবর্তন] visible?", Boolean(coverChangeBtnOwn));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "evidence-viewing-own-student-profile.png"),
    fullPage: false,
  });
  console.log("Saved evidence-viewing-own-student-profile.png");

  await browser.close();
}

run().catch(console.error);
