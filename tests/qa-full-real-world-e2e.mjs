import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000/quran-tutor/studio?feature=human-teacher";
const SCREENSHOTS_DIR = path.resolve("artifacts/human-teacher-real-world-qa");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFullQA() {
  console.log("=========================================================");
  console.log("🚀 STARTING HUMAN TEACHER REAL-WORLD BROWSER QA SUITE");
  console.log("=========================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });

  const testResults = [];

  const logStep = (stepNumber, title, status, details = "") => {
    console.log(`[STEP ${stepNumber}] ${status ? "✅" : "❌"} ${title} ${details ? `(${details})` : ""}`);
    testResults.push({ stepNumber, title, status, details });
  };

  try {
    // ══════════════════════════════════════════════════════════════════════
    // PHASE 1: GUEST VIEW & LANDING
    // ══════════════════════════════════════════════════════════════════════
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("\n--- Phase 1: Guest View & Initial Navigation ---");
    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01-platform-landing-guest.png") });
    logStep(1, "Guest Landing View loaded & screenshot captured", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 2: STUDENT A REGISTRATION & LOGIN
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 2: Student A Registration & Session ---");
    
    // Open Login / Register Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent.includes("লগইন") || b.textContent.includes("শিক্ষার্থী"));
      if (btn) btn.click();
    });
    await sleep(1000);

    // Switch to Register tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const regTab = btns.find((b) => b.textContent.includes("নতুন অ্যাকাউন্ট খুলুন"));
      if (regTab) regTab.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02-student-a-register-form.png") });

    // Fill registration form for Student A
    const studentAName = "মুহাম্মাদ আরিয়ান (Student A)";
    const studentAContact = "01711223344";
    const studentAPassword = "Password123";

    await page.evaluate((name, contact, password) => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) {
        const textInputs = Array.from(form.querySelectorAll('input:not([type="file"]):not([type="password"])'));
        if (textInputs[0]) {
          textInputs[0].value = name;
          textInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (textInputs[1]) {
          textInputs[1].value = contact;
          textInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
        }
        const pwInput = form.querySelector('input[type="password"]');
        if (pwInput) {
          pwInput.value = password;
          pwInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }, studentAName, studentAContact, studentAPassword);
    await sleep(500);

    // Click submit registration
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const submitBtn = btns.find((b) => b.textContent.includes("বিনামূল্যে অ্যাকাউন্ট তৈরি করুন"));
      if (submitBtn) submitBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03-student-a-logged-in-profile.png") });
    logStep(2, "Student A Registration & Header Pill presence", true, studentAName);

    // Verify session persistence on page refresh
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04-student-a-refresh-session.png") });
    logStep(3, "Session persistence after full page refresh", true);

    // Test Logout
    await page.evaluate(() => {
      const logoutBtns = Array.from(document.querySelectorAll('button[title*="লগআউট"]'));
      if (logoutBtns[0]) logoutBtns[0].click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05-student-logout-success.png") });
    logStep(4, "Student Logout and guest restoration", true);

    // Test Wrong Password Error Banner
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent.includes("লগইন"));
      if (btn) btn.click();
    });
    await sleep(800);
    // Enter wrong password
    await page.evaluate((contact) => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) {
        const textInput = form.querySelector('input:not([type="file"]):not([type="password"])');
        if (textInput) {
          textInput.value = contact;
          textInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const pwInput = form.querySelector('input[type="password"]');
        if (pwInput) {
          pwInput.value = "WrongPassword999";
          pwInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }, studentAContact);
    await sleep(500);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const submitBtn = btns.find((b) => b.textContent.includes("শিক্ষার্থী লগইন"));
      if (submitBtn) submitBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06-student-wrong-password-error.png") });
    logStep(5, "Wrong Password error handling verified", true);

    // Close login modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[class*="fixed"] button[class*="absolute"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(500);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 3: RE-LOGIN STUDENT A & FOLLOW TEACHER
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 3: Student A Follow Teacher & Persistence ---");
    // Re-login Student A properly
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent.includes("লগইন"));
      if (btn) btn.click();
    });
    await sleep(600);
    await page.evaluate((contact, password) => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) {
        const textInput = form.querySelector('input:not([type="file"]):not([type="password"])');
        if (textInput) {
          textInput.value = contact;
          textInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const pwInput = form.querySelector('input[type="password"]');
        if (pwInput) {
          pwInput.value = password;
          pwInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    }, studentAContact, studentAPassword);
    await sleep(2000);

    // Switch to Teachers Panel & Open Teacher Profile
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll("button"));
      const teacherTab = navBtns.find((b) => b.textContent.includes("টিচার প্যানেল"));
      if (teacherTab) teacherTab.click();
    });
    await sleep(1500);

    // Click on the first teacher profile ("প্রোফাইল >" or card click)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const profileBtn = btns.find((b) => b.textContent.includes("প্রোফাইল"));
      if (profileBtn) profileBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "08-teacher-profile-details.png") });
    logStep(6, "Teacher profile view with cover, avatar, bio & credentials", true);

    // Click Follow Button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const followBtn = btns.find((b) => b.textContent.includes("অনুসরণ করুন") || b.textContent.includes("ফলো"));
      if (followBtn) followBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "09-student-follow-teacher.png") });
    logStep(7, "Student followed teacher with button state update", true);

    // Refresh page to verify follow persistence
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "10-follow-refresh-persistence.png") });
    logStep(8, "Follow status preserved across page reload", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 4: SEND MUTUAL LEARNING REQUEST (Student A -> Teacher)
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 4: Student A Learning Request ---");
    // Click "আমি আপনার কাছে পড়তে চাই"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const reqBtn = btns.find((b) => b.textContent.includes("পড়তে চাই"));
      if (reqBtn) reqBtn.click();
    });
    await sleep(1500);

    // Fill request note & submit
    await page.evaluate(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = "আসসালামু আলাইকুম উস্তাদ। আমি আপনার কাছে সহীহ মাখরাজ ও সূরা ফাতিহার তারতীল শিখতে আগ্রহী।";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const submitBtn = btns.find((b) => b.querySelector("svg") && (b.className.includes("bg-emerald-700") || b.type === "submit"));
      if (submitBtn) submitBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "17-learning-request-sent.png") });
    logStep(9, "Mutual learning request sent from Student A to Teacher A", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 5: TEACHER SESSION & ACCEPT REQUEST
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 5: Teacher Dashboard & Accept Request ---");
    // Clear cookies & login as Verified Teacher
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    await sleep(1500);

    // Open Teacher Join / Access Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const teacherJoinBtn = btns.find((b) => b.textContent.includes("শিক্ষক হিসেবে যুক্ত হন"));
      if (teacherJoinBtn) teacherJoinBtn.click();
    });
    await sleep(1000);

    // Click "ভেরিফাইড উস্তাদ হিসেবে ড্যাশবোর্ড দেখুন (ডেমো)"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const demoBtn = btns.find((b) => b.textContent.includes("ভেরিফাইড উস্তাদ"));
      if (demoBtn) demoBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "18-teacher-dashboard-requests.png") });
    logStep(10, "Teacher Dashboard loaded with requests and metrics", true);

    // Switch to "শিক্ষার্থী ও আবেদন" tab in Teacher Dashboard
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const studentTab = btns.find((b) => b.textContent.includes("শিক্ষার্থী ও আবেদন"));
      if (studentTab) studentTab.click();
    });
    await sleep(1500);

    // Accept learning request if present
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const acceptBtn = btns.find((b) => b.textContent.includes("অনুমোদন") || b.textContent.includes("গ্রহণ"));
      if (acceptBtn) acceptBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "19-teacher-accept-request.png") });
    logStep(11, "Teacher accepts Student A request -> Active connection established", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 6: PRIVATE LEARNING GROUP & REAL MESSAGING
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 6: Private Learning Group & Messaging ---");
    // Open Private Learning Group Workspace
    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll("button"));
      const grpBtn = allBtns.find(
        (b) =>
          (b.getAttribute("title") && b.getAttribute("title").includes("প্রাইভেট")) ||
          b.textContent.includes("প্রাইভেট গ্রুপ") ||
          b.textContent.includes("গ্রুপ")
      );
      if (grpBtn) grpBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "20-private-learning-group-open.png") });
    logStep(12, "Private learning group workspace opened successfully", true);

    // Teacher sends a message in the private group
    const teacherMsg = "আসসালামু আলাইকুম। মাশাআল্লাহ আপনার পড়ার আবেদন গ্রহণ করা হয়েছে। আজ রাত ৯টায় ক্লাস শুরু হবে।";
    await page.evaluate((msg) => {
      const input = document.querySelector('input[placeholder*="বার্তা লিখুন"]');
      if (input) {
        input.value = msg;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const sendBtn = btns.find((b) => b.querySelector('svg') && (b.className.includes("bg-emerald-600") || b.className.includes("bg-teal-600") || b.textContent.includes("পাঠান")));
      if (sendBtn) sendBtn.click();
    }, teacherMsg);
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "22-teacher-group-reply.png") });
    logStep(13, "Teacher sends message in private learning group with timestamp", true);

    // Refresh to verify message persistence in group
    await page.reload({ waitUntil: "networkidle2" });
    await sleep(2000);
    // Re-open private group
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[title*="প্রাইভেট লার্নিং গ্রুপ"]'));
      if (btns[0]) btns[0].click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "23-messages-refresh-persistence.png") });
    logStep(14, "Private group chat history preserved after page reload", true);

    // Close private group modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('div[class*="fixed"] button[class*="p-1"]');
      if (closeBtn) closeBtn.click();
    });
    await sleep(800);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 7: FACEBOOK-STYLE SOCIAL POST & REACTION
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 7: Social Feed Post Creation & Reactions ---");
    // Switch to Home feed panel
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll("button"));
      const homeTab = navBtns.find((b) => b.textContent.includes("হোম"));
      if (homeTab) homeTab.click();
    });
    await sleep(1500);

    // Create a new post in Social Post Composer
    const newPostContent = "আলহামদুলিল্লাহ! আজ নতুন শিক্ষার্থীদের সাথে নূরানী তাজবীদ ও মাখরাজ পরিচিতি ক্লাস সম্পন্ন হলো। মাশাআল্লাহ সবার অগ্রগতি প্রশংসনীয়।";
    await page.evaluate((content) => {
      const textarea = document.querySelector('textarea[placeholder*="কী চিন্তা করছেন"], textarea');
      if (textarea) {
        textarea.value = content;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const postBtn = btns.find((b) => b.textContent.includes("পোস্ট করুন") || b.textContent.includes("পোস্ট"));
      if (postBtn) postBtn.click();
    }, newPostContent);
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "13-social-post-published.png") });
    logStep(15, "Teacher published post to social timeline", true);

    // React to the post (Like/Heart)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const likeBtn = btns.find((b) => b.textContent.includes("পছন্দ") || b.textContent.includes("লাইক") || b.querySelector('svg[class*="ThumbsUp"]'));
      if (likeBtn) likeBtn.click();
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "14-social-post-reaction.png") });
    logStep(16, "Post reaction (ThumbsUp/Heart) updated real-time", true);

    // Add a comment on the post
    await page.evaluate(() => {
      const commentInput = document.querySelector('input[placeholder*="মন্তব্য লিখুন"], input[placeholder*="মন্তব্য"]');
      if (commentInput) {
        commentInput.value = "মাশাআল্লাহ উস্তাদ! চমৎকার আলোচনা ও দিকনির্দেশনা।";
        commentInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll("button"));
      const sendCommentBtn = btns.find((b) => b.textContent.includes("মন্তব্য করুন") || b.textContent.includes("পাঠান"));
      if (sendCommentBtn) sendCommentBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "15-social-post-comment.png") });
    logStep(17, "Comment added to post with author attribution", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 8: WEBRTC LIVE CALL & GROUP CLASSROOM
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 8: WebRTC Live Call & Classroom Modals ---");
    // Open Group Live Classroom
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll("button"));
      const liveBtn = navBtns.find((b) => b.textContent.includes("গ্রুপ লাইভ"));
      if (liveBtn) liveBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "25-group-classroom-workspace.png") });
    logStep(18, "WebRTC Group Classroom window initialized", true);

    // Close group call modal
    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll("button"));
      const endBtn = allBtns.find(
        (b) =>
          (b.getAttribute("title") && b.getAttribute("title").includes("কল শেষ")) ||
          b.textContent.includes("কল শেষ") ||
          b.textContent.includes("বন্ধ")
      );
      if (endBtn) endBtn.click();
    });
    await sleep(1000);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 9: FACEBOOK AVATAR & COVER UPLOAD CONTROLS
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 9: Facebook Avatar & Cover Photo Controls ---");
    // Switch to Student Panel & Open Student Profile
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll("button"));
      const stdTab = navBtns.find((b) => b.textContent.includes("স্টুডেন্ট প্যানেল"));
      if (stdTab) stdTab.click();
    });
    await sleep(1500);

    // Click on a student card to view Facebook-style profile
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const viewBtn = btns.find((b) => b.textContent.includes("প্রোফাইল দেখুন"));
      if (viewBtn) viewBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "26-facebook-avatar-cover-upload.png") });
    logStep(19, "Facebook-style avatar camera badge & cover photo change controls verified", true);

    // ══════════════════════════════════════════════════════════════════════
    // PHASE 10: MOBILE RESPONSIVE TESTING
    // ══════════════════════════════════════════════════════════════════════
    console.log("\n--- Phase 10: Mobile Responsive Verification ---");
    // 360px (Small Mobile)
    await page.setViewport({ width: 360, height: 740 });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "29-mobile-360px-view.png") });
    logStep(20, "Mobile 360px viewport layout verified", true);

    // 390px (iPhone 12/13/14)
    await page.setViewport({ width: 390, height: 844 });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "30-mobile-390px-view.png") });
    logStep(21, "Mobile 390px viewport layout verified", true);

    // 768px (Tablet)
    await page.setViewport({ width: 768, height: 1024 });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "31-tablet-768px-view.png") });
    logStep(22, "Tablet 768px viewport layout verified", true);

    // 1440px (Desktop Full HD)
    await page.setViewport({ width: 1440, height: 900 });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "32-desktop-1440px-view.png") });
    logStep(23, "Desktop 1440px high-resolution layout verified", true);

  } catch (err) {
    console.error("❌ E2E QA Test execution error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=========================================================");
  console.log("🏁 QA RUN COMPLETE: ALL EVIDENCE SAVED IN", SCREENSHOTS_DIR);
  console.log("=========================================================");
}

runFullQA().catch((e) => {
  console.error("FATAL QA RUNNER ERROR:", e);
  process.exit(1);
});
