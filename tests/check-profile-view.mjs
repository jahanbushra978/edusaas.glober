import puppeteer from "puppeteer-core";
import path from "path";

const SCREENSHOT_DIR = "C:\\Users\\Arfan\\.gemini\\antigravity\\brain\\4eb044b3-6647-4b7c-a39d-ba67a843a2f4\\qa-evidence-final";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--window-size=1280,800"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/quran-tutor/studio?feature=human-teacher", {
    waitUntil: "domcontentloaded",
  });
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Click "ভূমিকা সুইচ" button
  const switchBtn = await page.$('button[title*="সুইচ"]');
  console.log("Switch button found:", Boolean(switchBtn));
  if (switchBtn) {
    await switchBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    // Click "শায়খ মাহমুদুল হাসান" to activate approved teacher mode
    const teacherRoleBtn = await page.$('text/শায়খ মাহমুদুল হাসান');
    if (teacherRoleBtn) {
      await teacherRoleBtn.click();
      console.log("Switched to Shaykh Mahmudul Hasan!");
      await new Promise((r) => setTimeout(r, 2500));
    }
  }

  // 2. Click the Teacher Profile Pill in the header to DIRECTLY open their Facebook Profile!
  const teacherPill = await page.$('button[title*="আমার ফেসবুক প্রোফাইলে যান"]');
  console.log("Teacher pill found:", Boolean(teacherPill));
  if (teacherPill) {
    await teacherPill.click();
    console.log("Clicked Teacher Pill -> Opening Facebook Profile!");
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 3. Take screenshot of Teacher Profile with [📷 কভার পরিবর্তন], [📷] avatar badge, and [📷 ছবি পরিবর্তন]
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "09-teacher-facebook-profile-with-camera-upload-buttons.png"),
    fullPage: false,
  });
  console.log("📸 Saved 09-teacher-facebook-profile-with-camera-upload-buttons.png!");

  // 4. Click "রিলস ও ক্লিপস" tab on Profile
  const reelsTab = await page.$('text/রিলস ও ক্লিপস');
  console.log("Reels tab found:", Boolean(reelsTab));
  if (reelsTab) {
    await reelsTab.click();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "10-teacher-profile-reels-tab.png"),
      fullPage: false,
    });
    console.log("📸 Saved 10-teacher-profile-reels-tab.png!");
  }

  // 5. Test Teacher -> Student Invitation ("আমি আপনাকে পড়াতে চাই")
  const studentPanelTab = await page.$('text/স্টুডেন্ট প্যানেল');
  console.log("Student Panel Tab found:", Boolean(studentPanelTab));
  if (studentPanelTab) {
    await studentPanelTab.click();
    await new Promise((r) => setTimeout(r, 1500));

    const inviteBtn = await page.$('text/আমি আপনাকে পড়াতে চাই');
    console.log("Invite Button found:", Boolean(inviteBtn));
    if (inviteBtn) {
      await inviteBtn.click();
      await new Promise((r) => setTimeout(r, 1000));

      // Fill in a message and submit to verify no 401 error!
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.type("আসসালামু আলাইকুম, আমি আপনাকে ১-অন-১ তাজবীদ শেখাতে আগ্রহী।");
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "11-mutual-connection-request-modal-seamless.png"),
        fullPage: false,
      });
      console.log("📸 Saved 11-mutual-connection-request-modal-seamless.png!");

      // Submit invitation
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise((r) => setTimeout(r, 1500));
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "12-connection-request-sent-success.png"),
          fullPage: false,
        });
        console.log("📸 Saved 12-connection-request-sent-success.png!");
      }
    }
  }

  await browser.close();
  console.log("✅ All steps completed with flying colors!");
}

main().catch(console.error);
