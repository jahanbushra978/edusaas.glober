import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Mosque Platform Suite: Landing Page, Prayer Schedule, Mosque Details, Platform Info & Role-Based Dashboard Routing", async (t) => {
  const mosqueHubPath = path.resolve(process.cwd(), "src/features/mosque/components/MosqueHub.jsx");
  const publicWebsitePath = path.resolve(process.cwd(), "src/features/mosque/components/PublicMosqueWebsite.jsx");
  const loginModalPath = path.resolve(process.cwd(), "src/features/mosque/components/modals/MosqueLoginModal.jsx");
  const calendarModalPath = path.resolve(process.cwd(), "src/features/mosque/components/modals/MonthlyPrayerCalendarModal.jsx");

  // 1. Verify files exist
  assert.ok(fs.existsSync(mosqueHubPath), "MosqueHub.jsx must exist");
  assert.ok(fs.existsSync(publicWebsitePath), "PublicMosqueWebsite.jsx must exist");
  assert.ok(fs.existsSync(loginModalPath), "MosqueLoginModal.jsx must exist");
  assert.ok(fs.existsSync(calendarModalPath), "MonthlyPrayerCalendarModal.jsx must exist");

  const mosqueHubContent = fs.readFileSync(mosqueHubPath, "utf8");
  const publicWebsiteContent = fs.readFileSync(publicWebsitePath, "utf8");
  const loginModalContent = fs.readFileSync(loginModalPath, "utf8");
  const calendarModalContent = fs.readFileSync(calendarModalPath, "utf8");

  await t.test("1. Clicking Mosque Card opens Public Landing Page by default", () => {
    // viewMode must default to 'public'
    assert.match(
      mosqueHubContent,
      /useState\(["']public["']\)/,
      "MosqueHub must default viewMode to 'public' so clicking mosque card opens the landing page first"
    );

    // MosqueHub must render PublicMosqueWebsite when viewMode === 'public'
    assert.match(
      mosqueHubContent,
      /if\s*\(\s*viewMode\s*===\s*["']public["']\s*\)\s*\{\s*return\s*\(\s*<PublicMosqueWebsite/,
      "MosqueHub must return PublicMosqueWebsite in public mode"
    );
  });

  await t.test("2. Top Prayer Times Schedule, Live Hijri & Gregorian Calendar Widget", () => {
    // Check Top Prayer Timetable Grid in PublicMosqueWebsite
    assert.match(publicWebsiteContent, /PRAYER_TIMETABLE/, "Must define prayer timetable");
    assert.match(publicWebsiteContent, /ফজর/, "Must contain Fajr");
    assert.match(publicWebsiteContent, /যোহর/, "Must contain Dhuhr");
    assert.match(publicWebsiteContent, /আসর/, "Must contain Asr");
    assert.match(publicWebsiteContent, /মাগরিব/, "Must contain Maghrib");
    assert.match(publicWebsiteContent, /এশা/, "Must contain Isha");
    assert.match(publicWebsiteContent, /পবিত্র জুমু'আ/, "Must contain Jumu'ah");

    // Check Live Clock & Islamic Calendar
    assert.match(publicWebsiteContent, /currentTime/, "Must track live time");
    assert.match(publicWebsiteContent, /formatBangladeshHijriDate|হিজরি/, "Must display Islamic Hijri month dynamically");
    assert.match(publicWebsiteContent, /formattedGregorianDate/, "Must display Gregorian / Bengali date");

    // Check Countdown & Next Jama'at
    assert.match(publicWebsiteContent, /nextJamaatDisplay/, "Must display next Jama'at");
    assert.match(publicWebsiteContent, /countdownDisplay/, "Must display countdown to next prayer");

    // Check Prohibited times
    assert.match(publicWebsiteContent, /showProhibitedTimes/, "Must provide prohibited times toggle");
    assert.match(publicWebsiteContent, /সূর্যোদয়ের সময়/, "Must explain sunrise prohibited time");
    assert.match(publicWebsiteContent, /ঠিক দ্বিপ্রহর/, "Must explain noon prohibited time");
    assert.match(publicWebsiteContent, /সূর্যাস্তের সময়/, "Must explain sunset prohibited time");

    // Check Monthly Calendar Sheet modal
    assert.match(publicWebsiteContent, /MonthlyPrayerCalendarModal/, "Must integrate 30-day monthly calendar modal");
    assert.match(calendarModalContent, /CALENDAR_DAYS/, "Monthly calendar must generate 30 days");
    assert.match(calendarModalContent, /window\.print\(\)/, "Monthly calendar must have print function");
  });

  await t.test("3. Rich Mosque Information (History, Facilities, Scholars, Committee)", () => {
    // 8 Modern Facilities
    assert.match(publicWebsiteContent, /সেন্ট্রাল এসি ও প্রধান হল/, "Must feature central AC");
    assert.match(publicWebsiteContent, /আধুনিক অজুখানা ও ওয়াটার ফিল্টার/, "Must feature modern wudu and water filter");
    assert.match(publicWebsiteContent, /মা-বোনদের পৃথক সালাতখানা/, "Must feature women's prayer area");
    assert.match(publicWebsiteContent, /সার্বক্ষণিক জেনারেটর ব্যাকআপ/, "Must feature generator backup");
    assert.match(publicWebsiteContent, /২৪ ঘণ্টা সিসিটিভি ও নিরাপত্তা/, "Must feature CCTV security");
    assert.match(publicWebsiteContent, /ইসলামিক রিসার্চ লাইব্রেরি/, "Must feature research library");
    assert.match(publicWebsiteContent, /ফ্রি কাফন-দাফন ও অ্যাম্বুলেন্স/, "Must feature ghusl and ambulance service");
    assert.match(publicWebsiteContent, /সুপরিসর জানাযার মাঠ ও পার্কিং/, "Must feature parking and janazah ground");

    // Scholars & Imams
    assert.match(publicWebsiteContent, /মাওলানা মাহমুদ হাসান|মাওলানা মুফতি আব্দুল্লাহ/, "Must feature Khatib/Imam");
    assert.match(publicWebsiteContent, /হাফেজ ক্বারী নাজমুল হুদা/, "Must feature Pesh Imam");
    assert.match(publicWebsiteContent, /মুহাম্মদ বিলাল হোসেন|ক্বারী আহমাদুল্লাহ/, "Must feature Muezzin");

    // Committee & Ongoing Project
    assert.match(publicWebsiteContent, /মসজিদ কমপ্লেক্সের ৩য় তলা সম্প্রসারণ/, "Must feature 3rd floor expansion project");
    assert.match(publicWebsiteContent, /আগামী জুমার বিশেষ নোটিশ/, "Must feature Friday Jumu'ah notice");
  });

  await t.test("4. SaaS Platform Section (Edusaas Digital Mosque ERP Cloud)", () => {
    assert.match(publicWebsiteContent, /Edusaas এন্টারপ্রাইজ ক্লাউড/, "Must introduce Edusaas enterprise cloud");
    assert.match(publicWebsiteContent, /edusaas\.global/, "Must reference edusaas.global");
    assert.match(publicWebsiteContent, /১০০% ডিজিটাল কালেকশন ও ইনস্ট্যান্ট রসিদ/, "Must highlight cashless collection & SMS receipt");
    assert.match(publicWebsiteContent, /রিয়েল-টাইম ১০টি ডেডিকেটেড ফান্ড ও লেজার/, "Must highlight 10 realtime dedicated funds");
    assert.match(publicWebsiteContent, /ডিজিটাল ইমাম মেস \(খানা\) রোস্টার/, "Must highlight automated Imam meal roster");
    assert.match(publicWebsiteContent, /নূরানী মক্তব ও শিশু কুরআন ট্র্যাকিং/, "Must highlight Noorani maktab student tracking");
    assert.match(publicWebsiteContent, /প্রতিটি মসজিদের নিজস্ব ব্র্যান্ডেড ফ্রি ওয়েবসাইট/, "Must highlight free custom domain / website");
    assert.match(publicWebsiteContent, /নিরাপদ ক্লাউড ডেটাবেজ ও এনক্রিপ্টেড ব্যাকআপ/, "Must highlight secure cloud backup");
  });

  await t.test("5. Role-Based Login Modal & Dashboard Routing", () => {
    // MosqueLoginModal features
    assert.match(loginModalContent, /handleQuickLogin/, "Must support 1-click fast preset login");
    assert.match(loginModalContent, /handleManualLogin/, "Must support manual ID/phone login");

    // Presets for all 5 roles
    assert.match(loginModalContent, /PRESIDENT/, "Must support President role");
    assert.match(loginModalContent, /TREASURER/, "Must support Treasurer role");
    assert.match(loginModalContent, /IMAM/, "Must support Imam role");
    assert.match(loginModalContent, /MEMBER/, "Must support Member role");
    assert.match(loginModalContent, /STAFF/, "Must support Staff/Muezzin role");

    // Check handleLoginRole implementation in MosqueHub
    assert.match(mosqueHubContent, /handleLoginRole/, "MosqueHub must implement handleLoginRole");
    assert.match(mosqueHubContent, /setViewMode\(["']erp["']\)/, "handleLoginRole must transition viewMode to 'erp'");

    // Role-specific routing targets
    assert.match(mosqueHubContent, /role === "IMAM"|role === 'IMAM'/, "Must handle Imam routing");
    assert.match(mosqueHubContent, /setActiveTab\("prayer"\)|setActiveTab\('prayer'\)/, "Imam must route to prayer dashboard");
    assert.match(mosqueHubContent, /role === "TREASURER"|role === 'TREASURER'/, "Must handle Treasurer routing");
    assert.match(mosqueHubContent, /setActiveTab\("income"\)|setActiveTab\('income'\)/, "Treasurer must route to income dashboard");
    assert.match(mosqueHubContent, /role === "MEMBER"|role === 'MEMBER'/, "Must handle Member routing");
    assert.match(mosqueHubContent, /setActiveTab\("member-portal"\)|setActiveTab\('member-portal'\)/, "Member must route to member-portal");
    assert.match(mosqueHubContent, /role === "STAFF"|role === 'STAFF'/, "Must handle Staff routing");
    assert.match(mosqueHubContent, /setActiveTab\("assets"\)|setActiveTab\('assets'\)/, "Staff must route to assets dashboard");
  });

  await t.test("6. Dedicated Prayer & Imam Operations Dashboard in ERP", () => {
    assert.match(
      mosqueHubContent,
      /activeTab\s*===\s*["']prayer["']/,
      "MosqueHub must have dedicated in-page view for activeTab === 'prayer'"
    );
    assert.match(
      mosqueHubContent,
      /সালাত, জামাত ও ইমাম-খতিব কার্যপরিচালনা ড্যাশবোর্ড/,
      "Must have Imam & Prayer Management Suite header"
    );
    assert.match(
      mosqueHubContent,
      /ইমাম খানা রোস্টার/,
      "Must have Imam Meal Roster action in prayer dashboard"
    );
  });

  await t.test("7. ERP Navigation Header: Role Badge, Public Site & Logout Controls", () => {
    assert.match(mosqueHubContent, /সভাপতি: আলহাজ্ব মোস্তাফিজুর/, "Must display President identity in header");
    assert.match(mosqueHubContent, /কোষাধ্যক্ষ: জনাব শাহিনুর/, "Must display Treasurer identity in header");
    assert.match(mosqueHubContent, /পেশ ইমাম: মুফতি আব্দুল্লাহ/, "Must display Imam identity in header");
    assert.match(mosqueHubContent, /সদস্য:/, "Must display Member identity in header");
    assert.match(mosqueHubContent, /পাবলিক সাইট/, "Must have Public Site toggle button in header");
    assert.match(mosqueHubContent, /লগআউট/, "Must have Logout button in header returning to public landing page");
  });

  await t.test("8. Strict Rule Compliance: Zero Sparkles and Zero Base44", () => {
    assert.doesNotMatch(publicWebsiteContent, /Sparkles/, "Must NOT import or use Sparkles in PublicMosqueWebsite");
    assert.doesNotMatch(publicWebsiteContent, /✨/, "Must NOT use ✨ sparkle emoji in PublicMosqueWebsite");
    assert.doesNotMatch(loginModalContent, /Sparkles/, "Must NOT import or use Sparkles in MosqueLoginModal");
    assert.doesNotMatch(loginModalContent, /✨/, "Must NOT use ✨ sparkle emoji in MosqueLoginModal");
    assert.doesNotMatch(calendarModalContent, /Sparkles/, "Must NOT import or use Sparkles in MonthlyPrayerCalendarModal");
    assert.doesNotMatch(calendarModalContent, /✨/, "Must NOT use ✨ sparkle emoji in MonthlyPrayerCalendarModal");
    assert.doesNotMatch(mosqueHubContent, /base44/i, "Base44 is strictly prohibited");
  });
});
