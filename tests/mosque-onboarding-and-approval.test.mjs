import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  saveMosqueOnboardingRequest,
  getMosqueOnboardingRequests,
  approveMosqueOnboardingRequest,
  getRegisteredMosques,
  switchActiveMosque,
  getMosqueDatabase,
} from "../src/features/mosque/services/mosqueStorage.js";

test("Mosque Onboarding & Admin Approval Workflow Suite", async (t) => {
  const apiRoutePath = path.resolve(process.cwd(), "app/api/mosque/onboarding-requests/route.js");
  const platformConsolePath = path.resolve(process.cwd(), "app/(platform-console)/platform-console/onboarding-requests/page.jsx");
  const registrationModalPath = path.resolve(process.cwd(), "src/features/mosque/components/modals/MosqueRegistrationModal.jsx");
  const approvalsModalPath = path.resolve(process.cwd(), "src/features/mosque/components/modals/MosqueApprovalsModal.jsx");
  const discoveryModalPath = path.resolve(process.cwd(), "src/features/mosque/components/modals/MosqueDiscoveryModal.jsx");
  const publicWebsitePath = path.resolve(process.cwd(), "src/features/mosque/components/PublicMosqueWebsite.jsx");
  const mosqueHubPath = path.resolve(process.cwd(), "src/features/mosque/components/MosqueHub.jsx");

  // 1. Verify all required files exist
  assert.ok(fs.existsSync(apiRoutePath), "API route /api/mosque/onboarding-requests/route.js must exist");
  assert.ok(fs.existsSync(platformConsolePath), "Platform Console onboarding-requests page must exist");
  assert.ok(fs.existsSync(registrationModalPath), "MosqueRegistrationModal.jsx must exist");
  assert.ok(fs.existsSync(approvalsModalPath), "MosqueApprovalsModal.jsx must exist");
  assert.ok(fs.existsSync(discoveryModalPath), "MosqueDiscoveryModal.jsx must exist");
  assert.ok(fs.existsSync(publicWebsitePath), "PublicMosqueWebsite.jsx must exist");
  assert.ok(fs.existsSync(mosqueHubPath), "MosqueHub.jsx must exist");

  const apiRouteContent = fs.readFileSync(apiRoutePath, "utf8");
  const platformConsoleContent = fs.readFileSync(platformConsolePath, "utf8");
  const registrationModalContent = fs.readFileSync(registrationModalPath, "utf8");
  const approvalsModalContent = fs.readFileSync(approvalsModalPath, "utf8");
  const discoveryModalContent = fs.readFileSync(discoveryModalPath, "utf8");
  const publicWebsiteContent = fs.readFileSync(publicWebsitePath, "utf8");
  const mosqueHubContent = fs.readFileSync(mosqueHubPath, "utf8");

  await t.test("1. Anyone can submit a new mosque onboarding application", () => {
    const testPayload = {
      name: "বাইতুল মামুর কেন্দ্রীয় জামে মসজিদ",
      name_en: "Baitul Mamur Central Mosque",
      district: "চট্টগ্রাম",
      upazila: "কোতোয়ালী",
      address: "আন্দরকিল্লা শাহী জামে মসজিদ সংলগ্ন",
      establishedYear: "২০১২",
      floorsCount: 4,
      musalliCapacity: 3000,
      submitterName: "মুহাম্মদ ফখরুল ইসলাম",
      submitterRole: "সভাপতি",
      submitterPhone: "০১৮১৯-৯৯৮৮৭৭",
      submitterEmail: "fakhrul.ctg@gmail.com",
      password: "secretpassword123",
      imamName: "মাওলানা মুফতি সাঈদ আহমদ",
      imamPhone: "০১৯১১-২২৩৩৪৪",
      facilities: ["শীতাতপ নিয়ন্ত্রিত (AC)", "জেনারেটর ব্যাকআপ", "সিসিটিভি সিকিউরিটি", "নূরানী শিশু মক্তব"],
      notes: "চট্টগ্রামের ঐতিহাসিক এলাকায় আধুনিক মসজিদ কমপ্লেক্স",
    };

    const res = saveMosqueOnboardingRequest(testPayload);
    assert.strictEqual(res.ok, true, "Submission must succeed");
    assert.ok(res.trackingId, "Must return unique trackingId");
    assert.match(res.trackingId, /^MREQ-2026-/, "Tracking ID must follow MREQ-2026-XXXX format");

    // Must be in pending_approval status
    assert.strictEqual(res.data.approval_status, "pending_approval", "Initial status must be pending_approval");
    assert.strictEqual(res.data.is_active, false, "Initial status must not be active");

    // Verify it is listed in getMosqueOnboardingRequests()
    const allRequests = getMosqueOnboardingRequests();
    const found = allRequests.find((r) => r.id === res.trackingId);
    assert.ok(found, "Request must be retrievable from getMosqueOnboardingRequests");
    assert.strictEqual(found.name, testPayload.name);
  });

  await t.test("2. Unapproved mosque is NOT live in the directory", () => {
    const registered = getRegisteredMosques();
    const isLiveBeforeApproval = registered.some((m) => m.name === "বাইতুল মামুর কেন্দ্রীয় জামে মসজিদ");
    assert.strictEqual(
      isLiveBeforeApproval,
      false,
      "Unapproved mosque must not appear in registered live directory before admin approval"
    );
  });

  await t.test("3. Admin approves request and mosque goes LIVE with dedicated workspace", () => {
    const allRequests = getMosqueOnboardingRequests();
    const targetRequest = allRequests.find((r) => r.name === "বাইতুল মামুর কেন্দ্রীয় জামে মসজিদ");
    assert.ok(targetRequest, "Target request must exist");

    // Admin approves
    const approvalResult = approveMosqueOnboardingRequest(
      targetRequest.id,
      "সুপার এডমিন (Platform Owner)",
      "যথাযথ তথ্য যাচাইকরণ সাপেক্ষে লাইভ অনুমোদন দেওয়া হলো"
    );

    assert.strictEqual(approvalResult.ok, true, "Approval must succeed");
    assert.strictEqual(approvalResult.request.approval_status, "approved", "Status must become approved");
    assert.strictEqual(approvalResult.request.is_active, true, "Must become active");
    assert.ok(approvalResult.mosque, "Must return newly provisioned live mosque");

    // Newly approved mosque must now appear in registered mosques
    const registeredAfter = getRegisteredMosques();
    const foundInLive = registeredAfter.find((m) => m.id === approvalResult.mosque.id || m.name === targetRequest.name);
    assert.ok(foundInLive, "Approved mosque must immediately appear in getRegisteredMosques()");
    assert.strictEqual(foundInLive.approval_status, "approved");
    assert.strictEqual(foundInLive.is_active, true);
  });

  await t.test("4. Autonomous Workspace Isolation for Approved Mosque", () => {
    const registered = getRegisteredMosques();
    const newlyLive = registered.find((m) => m.name === "বাইতুল মামুর কেন্দ্রীয় জামে মসজিদ");
    assert.ok(newlyLive, "Approved mosque must exist");

    // Switch active workspace to this new mosque
    const newDb = switchActiveMosque(newlyLive.id);
    assert.strictEqual(newDb.mosque.id, newlyLive.id, "Workspace mosque ID must match newly live mosque");
    assert.strictEqual(newDb.mosque.name, newlyLive.name, "Workspace mosque name must match");
    assert.strictEqual(newDb.funds.length, 10, "Must have 10 standard segregated funds");
    assert.strictEqual(newDb.members.length, 1, "Must initialize with applicant as administrator");
    assert.strictEqual(newDb.members[0].name, "মুহাম্মদ ফখরুল ইসলাম", "Admin member name must match applicant");
    assert.strictEqual(newDb.employees[0].name, "মাওলানা মুফতি সাঈদ আহমদ", "Pesh Imam employee must match");

    // Switch back to Baitun Noor and verify Baitun Noor data is intact
    const originalDb = switchActiveMosque("MAS-2026-0001");
    assert.strictEqual(originalDb.mosque.id, "MAS-2026-0001");
    assert.strictEqual(originalDb.mosque.name, "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স");
    assert.strictEqual(originalDb.members.length >= 10, true, "Original mosque members must remain intact");
  });

  await t.test("5. API Route /api/mosque/onboarding-requests integrity", () => {
    assert.match(apiRouteContent, /export async function GET/, "Must export GET handler");
    assert.match(apiRouteContent, /export async function POST/, "Must export POST handler");
    assert.match(apiRouteContent, /export async function PUT/, "Must export PUT handler");
    assert.match(apiRouteContent, /pending_approval/, "Must handle pending_approval status");
    assert.match(apiRouteContent, /action === ["']approve["']/, "Must handle approve action");
    assert.match(apiRouteContent, /action === ["']reject["']/, "Must handle reject action");
  });

  await t.test("6. UI Integration & Component Wiring", () => {
    // PublicMosqueWebsite has + আপনার মসজিদ যুক্ত করুন
    assert.match(publicWebsiteContent, /onOpenRegisterMosque/, "PublicMosqueWebsite must accept onOpenRegisterMosque");
    assert.match(publicWebsiteContent, /মসজিদ যুক্ত করুন/, "PublicMosqueWebsite must display add mosque button");

    // MosqueRegistrationModal has tracking ID display & pending review confirmation
    assert.match(registrationModalContent, /trackingId/, "Registration modal must display tracking ID");
    assert.match(registrationModalContent, /saveMosqueOnboardingRequest/, "Registration modal must save request");
    assert.match(registrationModalContent, /প্রশাসনিক পর্যালোচনার অপেক্ষায়/, "Registration modal must show pending approval banner");

    // MosqueDiscoveryModal has tracking tab & live directory
    assert.match(discoveryModalContent, /getRegisteredMosques/, "Discovery modal must load dynamic live mosques");
    assert.match(discoveryModalContent, /আবেদনের স্ট্যাটাস/, "Discovery modal must have application tracking feature");

    // MosqueApprovalsModal allows 1-click approval
    assert.match(approvalsModalContent, /approveMosqueOnboardingRequest/, "Approvals modal must call approve function");
    assert.match(approvalsModalContent, /অনুমোদন করুন ও লাইভ করুন/, "Approvals modal must have approve button");

    // Platform Console supports Mosque tab and approval
    assert.match(platformConsoleContent, /মসজিদ কমপ্লেক্স/, "Platform console must have Mosque filter tab");
    assert.match(platformConsoleContent, /approveMosqueOnboardingRequest/, "Platform console must approve mosques");

    // MosqueHub has modals wired
    assert.match(mosqueHubContent, /MosqueApprovalsModal/, "MosqueHub must import MosqueApprovalsModal");
    assert.match(mosqueHubContent, /activeModal === ["']mosque-approvals["']/, "MosqueHub must render approvals modal");
    assert.match(mosqueHubContent, /activeModal === ["']register-mosque["']/, "MosqueHub must render registration modal");
  });

  await t.test("7. Strict Invariants: No Base44 and No Sparkles", () => {
    assert.strictEqual(
      apiRouteContent.includes("Base44") || apiRouteContent.includes("base44"),
      false,
      "No Base44 allowed in API route"
    );
    assert.strictEqual(
      registrationModalContent.includes("Base44") || registrationModalContent.includes("Sparkles"),
      false,
      "No Base44 or Sparkles in Registration Modal"
    );
    assert.strictEqual(
      approvalsModalContent.includes("Base44") || approvalsModalContent.includes("Sparkles"),
      false,
      "No Base44 or Sparkles in Approvals Modal"
    );
    assert.strictEqual(
      discoveryModalContent.includes("Base44") || discoveryModalContent.includes("Sparkles"),
      false,
      "No Base44 or Sparkles in Discovery Modal"
    );
  });
});
