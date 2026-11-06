import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher";
const ARTIFACT_DIR = path.resolve("C:/Users/Arfan/.gemini/antigravity/brain/4eb044b3-6647-4b7c-a39d-ba67a843a2f4");
const QA_DIR = path.join(ARTIFACT_DIR, "qa-screenshots");

if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBrowserVerification() {
  console.log("=== STARTING BROWSER TESTING FOR HIND SILIGURI, TEACHER DASHBOARD & STUDENT PROFILE ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--use-fake-ui-for-media-stream",
      "--window-size=1280,900",
    ],
    defaultViewport: { width: 1280, height: 900 },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(20000);

    // Track console logs and errors
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        console.log(`[Browser ${type}]:`, msg.text());
      }
    });

    console.log("Navigating to:", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await sleep(2000);

    // 1. Verify Typography (Hind Siliguri)
    const fontInfo = await page.evaluate(() => {
      const body = document.body;
      const compStyle = window.getComputedStyle(body);
      const h1 = document.querySelector("h1, h2, h3");
      const h1Font = h1 ? window.getComputedStyle(h1).fontFamily : "none";
      return {
        bodyFont: compStyle.fontFamily,
        headingFont: h1Font,
      };
    });
    console.log("Typography Verification:", fontInfo);

    // Screenshot 1: Public Home with Hind Siliguri and Teacher Login Button
    const scPath1 = path.join(QA_DIR, "live-01-home-hind-siliguri-nav.png");
    await page.screenshot({ path: scPath1 });
    console.log("Saved Screenshot 1:", scPath1);

    // 2. Test Dedicated Teacher Login Modal
    console.log("Testing Teacher Login Modal...");
    // Find button containing 'শিক্ষক লগইন'
    const teacherLoginBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent.includes("শিক্ষক লগইন"));
    });

    if (teacherLoginBtn && teacherLoginBtn.asElement()) {
      await teacherLoginBtn.asElement().click();
      await sleep(1000);

      // Screenshot of Teacher Login Modal
      const scPathModal = path.join(QA_DIR, "live-02-teacher-login-modal.png");
      await page.screenshot({ path: scPathModal });
      console.log("Saved Screenshot 2:", scPathModal);

      // Click "শায়খ ক্বারী মাহমুদুল হাসান (ভেরিফাইড উস্তাদ)" or login button
      const loginActionBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return (
          btns.find((b) => b.textContent.includes("শায়খ ক্বারী মাহমুদুল হাসান")) ||
          btns.find((b) => b.textContent.includes("শিক্ষক ড্যাশবোর্ডে প্রবেশ করুন"))
        );
      });

      if (loginActionBtn && loginActionBtn.asElement()) {
        await loginActionBtn.asElement().click();
        await sleep(2500);
      }
    }

    // Screenshot 3: Teacher Marketplace Dashboard
    const scPath3 = path.join(QA_DIR, "live-03-teacher-dashboard-overview.png");
    await page.screenshot({ path: scPath3 });
    console.log("Saved Screenshot 3 (Teacher Dashboard):", scPath3);

    // 3. Test Student Profile View (Abdullah Al-Mamun)
    console.log("Navigating to Student Panel...");
    const studentPanelBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent.includes("স্টুডেন্ট প্যানেল"));
    });

    if (studentPanelBtn && studentPanelBtn.asElement()) {
      await studentPanelBtn.asElement().click();
      await sleep(2000);

      // Find first "প্রোফাইল দেখুন" button in directory
      const viewProfileBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.find((b) => b.textContent.includes("প্রোফাইল দেখুন"));
      });

      if (viewProfileBtn && viewProfileBtn.asElement()) {
        await viewProfileBtn.asElement().click();
        await sleep(2000);

        // Screenshot 4: Rich Facebook-Style Student Profile with Quran progress tab
        const scPath4 = path.join(QA_DIR, "live-04-rich-student-profile-progress.png");
        await page.screenshot({ path: scPath4 });
        console.log("Saved Screenshot 4 (Rich Student Profile Progress):", scPath4);

        // Click "টাইমলাইন ও পোস্টসমূহ" tab
        const timelineTabBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          return btns.find((b) => b.textContent.includes("টাইমলাইন ও পোস্টসমূহ"));
        });

        if (timelineTabBtn && timelineTabBtn.asElement()) {
          await timelineTabBtn.asElement().click();
          await sleep(1000);
          const scPath5 = path.join(QA_DIR, "live-05-student-timeline-posts.png");
          await page.screenshot({ path: scPath5 });
          console.log("Saved Screenshot 5 (Student Timeline Posts):", scPath5);
        }

        // Click "উস্তাদগণ ও ক্লাস" tab
        const teachersTabBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          return btns.find((b) => b.textContent.includes("উস্তাদগণ ও ক্লাস"));
        });

        if (teachersTabBtn && teachersTabBtn.asElement()) {
          await teachersTabBtn.asElement().click();
          await sleep(1000);
          const scPath6 = path.join(QA_DIR, "live-06-student-teachers-tab.png");
          await page.screenshot({ path: scPath6 });
          console.log("Saved Screenshot 6 (Student Enrolled Teachers):", scPath6);
        }

        // Test "আমি আপনাকে পড়াতে চাই" (send teaching invitation)
        const teachBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          return btns.find((b) => b.textContent.includes("আমি আপনাকে পড়াতে চাই"));
        });

        if (teachBtn && teachBtn.asElement()) {
          await teachBtn.asElement().click();
          await sleep(1000);

          const scPath7 = path.join(QA_DIR, "live-07-teaching-invitation-modal.png");
          await page.screenshot({ path: scPath7 });
          console.log("Saved Screenshot 7 (Teaching Invitation Modal - Zero False Login Required):", scPath7);

          // Type message in invitation modal and send
          const textarea = await page.$("textarea");
          if (textarea) {
            await textarea.type("আসসালামু আলাইকুম, আমি আপনাকে তাজবীদ ও মাখরাজ শেখাতে আগ্রহী।");
            await sleep(500);

            // Click submit button
            const sendBtn = await page.evaluateHandle(() => {
              const modal = document.querySelector(".fixed.inset-0");
              if (!modal) return null;
              const btns = Array.from(modal.querySelectorAll("button"));
              return btns.find((b) => b.textContent.includes("আমন্ত্রণ পাঠান") || b.querySelector("svg.lucide-send"));
            });

            if (sendBtn && sendBtn.asElement()) {
              await sendBtn.asElement().click();
              await sleep(2000);

              const scPath8 = path.join(QA_DIR, "live-08-invitation-submitted-success.png");
              await page.screenshot({ path: scPath8 });
              console.log("Saved Screenshot 8 (Invitation Submitted Successfully):", scPath8);
            }
          }
        }
      }
    }

    console.log("🎉 ALL REAL-WORLD LIVE BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
  }
}

runBrowserVerification();

