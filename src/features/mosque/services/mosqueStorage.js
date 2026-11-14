/**
 * REALTIME MOSQUE ERP DATABASE & PERSISTENCE ENGINE
 * 
 * Provides production-grade data modeling, dynamic balance calculation,
 * double-entry ledgering, role-based privacy segregation, and JSON backup/restore.
 */

const STORAGE_KEY = "mosque_erp_database_v2";

// 10 Segregated Funds (Strictly Isolated, Section 6.6)
export const DEFAULT_FUNDS = [
  { id: "f1", name: "সাধারণ পরিচালন ফান্ড", initialBalance: 85000, currentBalance: 85000, restricted: false, purpose: "বিদ্যুৎ বিল, গ্যাস, ওয়াশরুম ক্লিনার ও নিয়মিত রক্ষণাবেক্ষণ", category: "OPERATING" },
  { id: "f2", name: "নির্মাণ ও সংস্কার ফান্ড", initialBalance: 75000, currentBalance: 75000, restricted: true, purpose: "দ্বিতীয় তলার ছাদ ঢালাই ও মসজিদ সম্প্রসারণ কাজ", category: "CAPITAL" },
  { id: "f3", name: "ইমাম-মুয়াজ্জিন সম্মানী ফান্ড", initialBalance: 25000, currentBalance: 25000, restricted: false, purpose: "খতীব, ইমাম ও মুয়াজ্জিন সাহেবের মাসিক হাদিয়া", category: "SALARY" },
  { id: "f4", name: "যাকাত ফান্ড", initialBalance: 13600, currentBalance: 13600, restricted: true, purpose: "কুরআনে নির্ধারিত ৮টি খাতে বাধ্যতামূলক যাকাত বিতরণ", category: "ZAKAT" },
  { id: "f5", name: "ফিতরা ফান্ড", initialBalance: 8500, currentBalance: 8500, restricted: true, purpose: "ঈদুল ফিতরের পূর্বে প্রকৃত হকদারদের মাঝে খাদ্য/অর্থ বিতরণ", category: "FITRA" },
  { id: "f6", name: "সদকা ও লিল্লাহ ফান্ড", initialBalance: 12200, currentBalance: 12200, restricted: false, purpose: "অসহায় মুসল্লিদের তাৎক্ষণিক খাবার ও বস্ত্র সহায়তা", category: "CHARITY" },
  { id: "f7", name: "ওয়াকফ ফান্ড", initialBalance: 50000, currentBalance: 50000, restricted: true, purpose: "ওয়াকফকৃত জমি ও সম্পদ হতে অর্জিত রাজস্বের মূল ফান্ড", category: "WAQF" },
  { id: "f8", name: "রমজান ও ইফতার ফান্ড", initialBalance: 18000, currentBalance: 18000, restricted: false, purpose: "প্রতিদিন মুসল্লি ও পথচারীদের জন্য উন্মুক্ত ইফতার আয়োজন", category: "RAMADAN" },
  { id: "f9", name: "মক্তব ও শিক্ষা ফান্ড", initialBalance: 14400, currentBalance: 14400, restricted: false, purpose: "নূরানী কায়দা, কুরআন ক্লাসের শিক্ষক ভাতা ও কিতাব প্রদান", category: "EDUCATION" },
  { id: "f10", name: "জরুরি দুর্যোগ ও সমাজকল্যাণ", initialBalance: 10000, currentBalance: 10000, restricted: true, purpose: "বন্যা, অগ্নিকাণ্ড ও আকস্মিক দুর্ঘটনায় চিকিৎসা ও কাফন-দাফন", category: "EMERGENCY" },
];

export const DEFAULT_MEMBERS = [
  { id: "M-101", name: "মুহাম্মদ আব্দুল্লাহ", phone: "০১৭১১-২২৩৩৪৪", address: "বাড়ি #১২, রোড #৩, হাড়িনাল, গাজীপুর", role: "সভাপতি", type: "COMMITTEE", status: "ACTIVE", pledge: 2000, paid: 2000, remaining: 0, loginId: "member01", joinedDate: "২০২১-০১-১৫" },
  { id: "M-102", name: "হাজী রফিকুল ইসলাম", phone: "০১৮১৯-১১২২৩৩", address: "মোল্লাপাড়া, হাড়িনাল, গাজীপুর", role: "সহ-সভাপতি", type: "COMMITTEE", status: "ACTIVE", pledge: 1500, paid: 1500, remaining: 0, loginId: "member02", joinedDate: "২০২১-০৩-১০" },
  { id: "M-103", name: "মাওলানা মাহমুদ হাসান", phone: "০১৯১১-৪৪৫৫৬৬", address: "মসজিদ স্টাফ কোয়ার্টার", role: "খতীব ও ইমাম", type: "STAFF", status: "ACTIVE", pledge: 1000, paid: 1000, remaining: 0, loginId: "member03", joinedDate: "২০২০-০৭-০১" },
  { id: "M-104", name: "জনাব শাহিনুর রহমান", phone: "০১৭২১-৯৯৮৮৭৭", address: "মধ্যপাড়া, হাড়িনাল", role: "কোষাধ্যক্ষ", type: "COMMITTEE", status: "ACTIVE", pledge: 1000, paid: 500, remaining: 500, loginId: "member04", joinedDate: "২০২১-০১-২০" },
  { id: "M-105", name: "ডা. আরিফুল ইসলাম", phone: "০১৫২১-৩৩৪৪৫৫", address: "হাসপাতাল রোড, গাজীপুর", role: "সাধারণ সদস্য", type: "GENERAL", status: "ACTIVE", pledge: 2000, paid: 0, remaining: 2000, loginId: "member05", joinedDate: "২০২২-০২-১৪" },
  { id: "M-106", name: "মো. কামরুল হাসান", phone: "০১৮১২-৫৬৭৮৯০", address: "মাস্টারপাড়া, হাড়িনাল", role: "সাধারণ সদস্য", type: "GENERAL", status: "ACTIVE", pledge: 1000, paid: 1000, remaining: 0, loginId: "member06", joinedDate: "২০২২-০৫-১১" },
  { id: "M-107", name: "ইঞ্জি. মোস্তাফিজুর রহমান", phone: "০১৭৩৩-১১২২৪৪", address: "দক্ষিণ হাড়িনাল", role: "উপদেষ্টা", type: "COMMITTEE", status: "ACTIVE", pledge: 3000, paid: 3000, remaining: 0, loginId: "member07", joinedDate: "২০১৯-১১-০৫" },
  { id: "M-108", name: "ফারুক আহমেদ", phone: "০১৯২২-৮৮৯৯০০", address: "বাজার রোড, হাড়িনাল", role: "সাধারণ সদস্য", type: "GENERAL", status: "ACTIVE", pledge: 500, paid: 0, remaining: 500, loginId: "member08", joinedDate: "২০২৩-০১-১০" },
  { id: "M-109", name: "আলহাজ্ব জয়নাল আবেদীন", phone: "০১৭৮৮-৩৩৪৪৫৫", address: "পূর্বপাড়া, হাড়িনাল", role: "আজীবন দাতা", type: "DONOR", status: "ACTIVE", pledge: 1500, paid: 1500, remaining: 0, loginId: "member09", joinedDate: "২০২০-০৪-১৮" },
  { id: "M-110", name: "মো. হাফিজুর রহমান", phone: "০১৮৩৩-৪৪৩৩২২", address: "উত্তর হাড়িনাল", role: "সাধারণ সদস্য", type: "GENERAL", status: "ACTIVE", pledge: 800, paid: 800, remaining: 0, loginId: "member10", joinedDate: "২০২৩-০৬-২২" },
];

export const DEFAULT_EMPLOYEES = [
  { id: "EMP-01", name: "মাওলানা মাহমুদ হাসান", role: "পেশ ইমাম ও খতীব", phone: "০১৯১১-৪৪৫৫৬৬", salary: 18000, joinedAt: "২০২৩-০১-০১", status: "ACTIVE" },
  { id: "EMP-02", name: "হাফেজ ক্বারী বিলাল হোসেন", role: "মুয়াজ্জিন ও সহকারী শিক্ষক", phone: "০১৮২২-৩৩৪৪৫৫", salary: 12000, joinedAt: "২০২৩-০৩-১৫", status: "ACTIVE" },
  { id: "EMP-03", name: "মো. হাফিজুর রহমান", role: "মসজিদ খাদেম ও পরিচ্ছন্নতাকর্মী", phone: "০১৭৩৩-৬৬৭৭৮৮", salary: 8000, joinedAt: "২০২৪-০৭-০১", status: "ACTIVE" },
];

export const DEFAULT_MEAL_ROSTER = [
  { id: "meal-1", date: "২০২৬-১১-১৪", displayDate: "১৪ নভেম্বর ২০২৬", dayName: "শনিবার", mealType: "দুপুর ও রাত", family: "হাজী মুহাম্মদ আব্দুল্লাহর পরিবার", memberId: "M-101", phone: "০১৭১১-২২৩৩৪৪", status: "COMPLETED", notes: "খাবার যথাসময়ে প্রদান করা হয়েছে।" },
  { id: "meal-2", date: "২০২৬-১১-১৫", displayDate: "১৫ নভেম্বর ২০২৬ (আজ)", dayName: "রবিবার", mealType: "দুপুর ও রাত", family: "হাজী রফিকুল ইসলামের পরিবার", memberId: "M-102", phone: "০১৮১৯-১১২২৩৩", status: "CONFIRMED", notes: "নির্ধারিত সময়ে হুজরার দস্তরখানে খাবার পৌঁছানো হবে।" },
  { id: "meal-3", date: "২০২৬-১১-১৬", displayDate: "১৬ নভেম্বর ২০২৬ (আগামীকাল)", dayName: "সোমবার", mealType: "দুপুর ও রাত", family: "জনাব শাহিনুর রহমানের পরিবার", memberId: "M-104", phone: "০১৭২১-৯৯৮৮৭৭", status: "CONFIRMED", notes: "সম্মতি প্রদান করেছেন।" },
  { id: "meal-4", date: "২০২৬-১১-১৭", displayDate: "১৭ নভেম্বর ২০২৬", dayName: "মঙ্গলবার", mealType: "দুপুর ও রাত", family: "ডা. আরিফুল ইসলামের পরিবার", memberId: "M-105", phone: "০১৫২১-৩৩৪৪৫৫", status: "PENDING_TRANSFER", notes: "জরুরি পারিবারিক সফরে থাকায় বদল আবেদন করেছেন।" },
  { id: "meal-5", date: "২০২৬-১১-১৮", displayDate: "১৮ নভেম্বর ২০২৬", dayName: "বুধবার", mealType: "দুপুর ও রাত", family: "মো. কামরুল হাসানের পরিবার", memberId: "M-106", phone: "০১৮১২-৫৬৭৮৯০", status: "CONFIRMED", notes: "সম্মতি জ্ঞাপন করেছেন।" },
  { id: "meal-6", date: "২০২৬-১১-১৯", displayDate: "১৯ নভেম্বর ২০২৬", dayName: "বৃহস্পতিবার", mealType: "দুপুর ও রাত", family: "ইঞ্জি. মোস্তাফিজুর রহমানের পরিবার", memberId: "M-107", phone: "০১৭৩৩-১১২২৪৪", status: "CONFIRMED", notes: "নির্ধারিত।" },
  { id: "meal-7", date: "২০২৬-১১-২০", displayDate: "২০ নভেম্বর ২০২৬", dayName: "শুক্রবার", mealType: "দুপুর ও রাত", family: "ফারুক আহমেদের পরিবার", memberId: "M-108", phone: "০১৯২২-৮৮৯৯০০", status: "CONFIRMED", notes: "জুমার দিনের খানা।" },
];

export const DEFAULT_INFLOWS = [
  { id: "INF-001", receiptNo: "RCPT-2026-081", donorId: "M-101", donorName: "মুহাম্মদ আব্দুল্লাহ", phone: "০১৭১১-২২৩৩৪৪", fundId: "f1", fundName: "সাধারণ পরিচালন ফান্ড", amount: 2000, category: "মাসিক সদস্য চাঁদা", date: "২০২৬-১১-০১", method: "নগদ (Cash)", status: "VERIFIED", notes: "নভেম্বর ২০২৬ মাসিক চাঁদা" },
  { id: "INF-002", receiptNo: "RCPT-2026-082", donorId: "M-102", donorName: "হাজী রফিকুল ইসলাম", phone: "০১৮১৯-১১২২৩৩", fundId: "f1", fundName: "সাধারণ পরিচালন ফান্ড", amount: 1500, category: "মাসিক সদস্য চাঁদা", date: "২০২৬-১১-০২", method: "বিকাশ (bKash)", status: "VERIFIED", notes: "নভেম্বর ২০২৬ মাসিক চাঁদা" },
  { id: "INF-003", receiptNo: "RCPT-2026-083", donorId: "M-107", donorName: "ইঞ্জি. মোস্তাফিজুর রহমান", phone: "০১৭৩৩-১১২২৪৪", fundId: "f2", fundName: "নির্মাণ ও সংস্কার ফান্ড", amount: 50000, category: "নির্মাণ বিশেষ অনুদান", date: "২০২৬-১১-০৩", method: "ব্যাংক ডিপোজিট (Bank)", status: "VERIFIED", notes: "ছাদ ঢালাইয়ের অনুদান চেক" },
  { id: "INF-004", receiptNo: "RCPT-2026-084", donorId: null, donorName: "জুমার সাধারণ মুসল্লিবৃন্দ", phone: "N/A", fundId: "f1", fundName: "সাধারণ পরিচালন ফান্ড", amount: 18400, category: "জুমার দিনের দান বাক্স", date: "২০২৬-১১-০৭", method: "দান বাক্স (Box)", status: "VERIFIED", notes: "০৭ নভেম্বর জুমা কালেকশন" },
  { id: "INF-005", receiptNo: "RCPT-2026-085", donorId: "M-109", donorName: "আলহাজ্ব জয়নাল আবেদীন", phone: "০১৭৮৮-৩৩৪৪৫৫", fundId: "f4", fundName: "যাকাত ফান্ড", amount: 25000, category: "যাকাত অনুদান", date: "২০২৬-১১-০৯", method: "নগদ (Cash)", status: "VERIFIED", notes: "বার্ষিক ব্যবসায়িক যাকাত" },
  { id: "INF-006", receiptNo: "RCPT-2026-086", donorId: null, donorName: "প্রবাসী ভাই (অনলাইন)", phone: "০১৭XX-XXXXXX", fundId: "f2", fundName: "নির্মাণ ও সংস্কার ফান্ড", amount: 10000, category: "অনলাইন দান", date: "২০২৬-১১-১০", method: "অনলাইন পেমেন্ট গেটওয়ে", status: "VERIFIED", notes: "ওয়েবসাইট থেকে সরাসরি দান" },
];

export const DEFAULT_EXPENSES = [
  {
    id: "VCH-2026-089",
    voucherNo: "VCH-2026-089",
    title: "মাইক ও আইপিএস ব্যাটারি মেরামত ও এসিড চার্জ",
    category: "সাউন্ড সিস্টেম",
    fundId: "f1",
    fundName: "সাধারণ পরিচালন ফান্ড",
    amount: 12500,
    submittedBy: "খতীব মাওলানা মাহমুদ হাসান",
    spentAt: "১২ নভেম্বর ২০২৬",
    status: "PENDING_APPROVAL", // PENDING_APPROVAL -> APPROVED -> PAID
    notes: "জুমার নামাজের পূর্বে সাউন্ড সিস্টেম ঠিক করার জরুরি বিল।",
    signatures: { applicant: "মাওলানা মাহমুদ হাসান", receiver: "মুহাম্মদ আলী (টেকনিশিয়ান)", treasurer: null, president: null },
  },
  {
    id: "VCH-2026-088",
    voucherNo: "VCH-2026-088",
    title: "মসজিদের অজুখানা ও ওয়াশরুম ক্লিনার ও সামগ্রী ক্রয়",
    category: "পরিষ্কার-পরিচ্ছন্নতা",
    fundId: "f1",
    fundName: "সাধারণ পরিচালন ফান্ড",
    amount: 3200,
    submittedBy: "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)",
    spentAt: "০৮ নভেম্বর ২০২৬",
    status: "PAID",
    notes: "অনুমোদিত ও ক্যাশ পরিশোধিত।",
    signatures: { applicant: "শাহিনুর রহমান", receiver: "রহিম স্টোর", treasurer: "শাহিনুর রহমান", president: "মুহাম্মদ আব্দুল্লাহ" },
  },
  {
    id: "VCH-2026-087",
    voucherNo: "VCH-2026-087",
    title: "দ্বিতীয় তলার ছাদ ঢালাইয়ের রড ও সিমেন্ট বিল",
    category: "উন্নয়ন কাজ",
    fundId: "f2",
    fundName: "নির্মাণ ও সংস্কার ফান্ড",
    amount: 45000,
    submittedBy: "ইঞ্জি. মোস্তাফিজুর রহমান",
    spentAt: "০৩ নভেম্বর ২০২৬",
    status: "PAID",
    notes: "চেক নং #৯৮৭৬৩৪৫ মাধ্যমে পরিশোধিত।",
    signatures: { applicant: "মোস্তাফিজুর রহমান", receiver: "মেসার্স কবির ট্রেডার্স", treasurer: "শাহিনুর রহমান", president: "মুহাম্মদ আব্দুল্লাহ" },
  },
  {
    id: "VCH-2026-086",
    voucherNo: "VCH-2026-086",
    title: "অক্টোবর মাসের মসজিদ ও মক্তবের বিদ্যুৎ বিল পরিশোধ",
    category: "বিদ্যুৎ বিল",
    fundId: "f1",
    fundName: "সাধারণ পরিচালন ফান্ড",
    amount: 8750,
    submittedBy: "মুহাম্মদ আব্দুল্লাহ (সভাপতি)",
    spentAt: "০১ নভেম্বর ২০২৬",
    status: "APPROVED",
    notes: "অনুমোদিত, কোষাধ্যক্ষ পরিশোধের অপেক্ষায়।",
    signatures: { applicant: "মুহাম্মদ আব্দুল্লাহ", receiver: "পল্লী বিদ্যুৎ সমিতি", treasurer: null, president: "মুহাম্মদ আব্দুল্লাহ" },
  },
];

export const DEFAULT_AUDIT_LOGS = [
  { id: "LOG-001", timestamp: "২০২৬-১১-০১ ১০:৩০ AM", actor: "মুহাম্মদ আব্দুল্লাহ (সভাপতি)", role: "PRESIDENT", action: "MONTHLY_BUDGET_INIT", targetType: "BUDGET", targetId: "NOV-2026", details: "নভেম্বর ২০২৬ মাসের প্রাথমিক বাজেট ও হিসাব উন্মুক্তকরণ" },
  { id: "LOG-002", timestamp: "২০২৬-১১-০৩ ০৪:১৫ PM", actor: "মুহাম্মদ আব্দুল্লাহ (সভাপতি)", role: "PRESIDENT", action: "EXPENSE_APPROVED", targetType: "VOUCHER", targetId: "VCH-2026-087", details: "ছাদ ঢালাইয়ের রড ও সিমেন্ট বিল (৳৪৫,০০০) অনুমোদন" },
  { id: "LOG-003", timestamp: "২০২৬-১১-০৮ ১১:০০ AM", actor: "শাহিনুর রহমান (কোষাধ্যক্ষ)", role: "TREASURER", action: "EXPENSE_PAID", targetType: "VOUCHER", targetId: "VCH-2026-088", details: "অজুখানা ক্লিনার ক্রয় বিল (৳৩,২০০) ক্যাশ প্রদান" },
  { id: "LOG-004", timestamp: "২০২৬-১১-১০ ০৯:৪৫ AM", actor: "সিস্টেম স্বয়ংক্রিয় গেটওয়ে", role: "SYSTEM", action: "ONLINE_DONATION_VERIFIED", targetType: "INFLOW", targetId: "RCPT-2026-086", details: "অনলাইন পোর্টাল হতে ৳১০,০০০ অনুদান নির্মাণ ফান্ডে ক্রেডিট" },
  { id: "LOG-005", timestamp: "২০২৬-১১-১২ ০২:২০ PM", actor: "মাওলানা মাহমুদ হাসান", role: "IMAM", action: "EXPENSE_SUBMITTED", targetType: "VOUCHER", targetId: "VCH-2026-089", details: "সাউন্ড সিস্টেম ও ব্যাটারি মেরামত রিকুইজিশন দাখিল" },
];

/**
 * Initialize or retrieve the database
 */
export function getMosqueDatabase() {
  if (typeof window === "undefined") {
    return createInitialDatabase();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDatabase();
      saveMosqueDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return recalculateDatabase(parsed);
  } catch (err) {
    console.error("Failed to read mosque database from storage:", err);
    return createInitialDatabase();
  }
}

/**
 * Save database to localStorage and return recalculated state
 */
export function saveMosqueDatabase(db) {
  if (typeof window === "undefined") return db;
  try {
    const recalculated = recalculateDatabase(db);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));
    return recalculated;
  } catch (err) {
    console.error("Failed to save mosque database:", err);
    return db;
  }
}

function createInitialDatabase() {
  const db = {
    version: "2.0",
    mosque: {
      id: "MAS-2026-0001",
      name: "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
      slug: "baitun-noor",
      district: "গাজীপুর",
      address: "হাড়িনাল, গাজীপুর সিটি কর্পোরেশন",
      established: "১৯৯৮",
      membersCount: DEFAULT_MEMBERS.length,
      logoLetter: "বা",
      customDomain: "baitunnoormasjid.org",
      phone: "০১৭১১-২২৩৩৪৪",
      email: "info@baitunnoor.org",
    },
    currentUserRole: "PRESIDENT", // "SUPER_ADMIN" | "PRESIDENT" | "TREASURER" | "IMAM" | "MEMBER"
    currentMemberId: "M-101",
    funds: DEFAULT_FUNDS,
    members: DEFAULT_MEMBERS,
    employees: DEFAULT_EMPLOYEES,
    mealRoster: DEFAULT_MEAL_ROSTER,
    inflows: DEFAULT_INFLOWS,
    expenses: DEFAULT_EXPENSES,
    auditLogs: DEFAULT_AUDIT_LOGS,
    assets: [
      { id: "AST-01", name: "প্রধান সাউন্ড এমপ্লিফায়ার (TOA 240W)", category: "সাউন্ড সিস্টেম", location: "ইমাম ডেস্ক", purchaseDate: "২০২৪-০৩-১৫", cost: 35000, condition: "ভালো", warrantyTill: "২০২৬-০৩-১৫", lastMaintenance: "২০২৬-১১-১২" },
      { id: "AST-02", name: "গ্রি ইনভার্টার এসি ৪ টন (২টি)", category: "কুলিং ও হিটিং", location: "মূল জামাত হল", purchaseDate: "২০২৩-০৫-২০", cost: 240000, condition: "চমৎকার", warrantyTill: "২০২৮-০৫-২০", lastMaintenance: "২০২৬-১০-০৫" },
      { id: "AST-03", name: "তুর্কি মসজিদ কার্পেট (৬ রোল)", category: "আসবাবপত্র", location: "১ম ও ২য় তলা", purchaseDate: "২০২২-০২-১০", cost: 480000, condition: "ভালো", warrantyTill: "N/A", lastMaintenance: "২০২৬-০৯-২০" },
      { id: "AST-04", name: "সিসিটিভি ক্যামেরা সিস্টেম (১৬ চ্যানেল)", category: "নিরাপত্তা", location: "মসজিদ প্রাঙ্গণ", purchaseDate: "২০২৪-০১-১৮", cost: 65000, condition: "সক্রিয়", warrantyTill: "২০২৭-০১-১৮", lastMaintenance: "২০২৬-১০-১৫" },
    ],
    maktab: {
      studentsCount: 42,
      teachersCount: 2,
      activeSession: "নূরানী কায়দা ও নাযেরা ২০২৬",
      monthlyFee: 500,
    },
    prayerSchedule: [
      { name: "ফজর", arabic: "الفجر", start: "০৫:০২ AM", end: "০৬:১৮ AM", jamaat: "০৫:২৫ AM", isActive: false },
      { name: "সূর্যোদয়", arabic: "الشروق", start: "০৬:১৯ AM", end: "—", jamaat: "—", isForbidden: true },
      { name: "যোহর", arabic: "الظهر", start: "১১:৪৬ AM", end: "০৩:৪৩ PM", jamaat: "০১:১৫ PM", isActive: false },
      { name: "আসর", arabic: "العصر", start: "০৩:৪৪ PM", end: "০৫:০৮ PM", jamaat: "০৪:১৫ PM", isActive: true },
      { name: "মাগরিব", arabic: "المغرب", start: "০৫:০৯ PM", end: "০৬:২৩ PM", jamaat: "০৫:১৫ PM", isActive: false },
      { name: "এশা", arabic: "العشاء", start: "০৬:২৪ PM", end: "০৪:৫৯ AM", jamaat: "০৭:৩০ PM", isActive: false },
      { name: "জুমা", arabic: "الجمعة", start: "১১:৪৬ AM", end: "০৩:৪৩ PM", jamaat: "০১:৩০ PM", isJummah: true },
    ],
  };

  return recalculateDatabase(db);
}

/**
 * RECALCULATE DYNAMIC BALANCES
 * 
 * Strict Double-Entry Invariant:
 * 1. An inflow increases a fund's balance ONLY IF status === "VERIFIED".
 * 2. An expense decreases a fund's balance ONLY IF status === "PAID".
 *    (Pending and Approved expenses DO NOT deduct money until physically paid!).
 * 3. Member's paid & remaining pledges are calculated from verified member inflows.
 */
export function recalculateDatabase(db) {
  const fundsMap = {};
  db.funds.forEach((f) => {
    fundsMap[f.id] = {
      ...f,
      inflowTotal: 0,
      outflowTotal: 0,
      pendingOutflow: 0,
      currentBalance: f.initialBalance || 0,
    };
  });

  // Calculate verified inflows per fund
  (db.inflows || []).forEach((inf) => {
    if (inf.status === "VERIFIED" && fundsMap[inf.fundId]) {
      fundsMap[inf.fundId].inflowTotal += Number(inf.amount || 0);
      fundsMap[inf.fundId].currentBalance += Number(inf.amount || 0);
    }
  });

  // Calculate outflows per fund
  (db.expenses || []).forEach((exp) => {
    if (fundsMap[exp.fundId]) {
      if (exp.status === "PAID") {
        fundsMap[exp.fundId].outflowTotal += Number(exp.amount || 0);
        fundsMap[exp.fundId].currentBalance -= Number(exp.amount || 0);
      } else if (exp.status === "PENDING_APPROVAL" || exp.status === "APPROVED") {
        fundsMap[exp.fundId].pendingOutflow += Number(exp.amount || 0);
      }
    }
  });

  const updatedFunds = Object.values(fundsMap);

  // Recalculate members' individual payment progress from inflows
  const memberPaymentTotals = {};
  (db.inflows || []).forEach((inf) => {
    if (inf.status === "VERIFIED" && inf.donorId) {
      memberPaymentTotals[inf.donorId] = (memberPaymentTotals[inf.donorId] || 0) + Number(inf.amount || 0);
    }
  });

  const updatedMembers = (db.members || []).map((m) => {
    const verifiedPaid = memberPaymentTotals[m.id] || 0;
    const pledge = Number(m.pledge || 0);
    const remaining = Math.max(0, pledge - verifiedPaid);
    return {
      ...m,
      paid: verifiedPaid,
      remaining: remaining,
    };
  });

  return {
    ...db,
    funds: updatedFunds,
    members: updatedMembers,
    employees: db.employees && db.employees.length > 0 ? db.employees : DEFAULT_EMPLOYEES,
    mealRoster: db.mealRoster && db.mealRoster.length > 0 ? db.mealRoster : DEFAULT_MEAL_ROSTER,
  };
}

/**
 * ADD A NEW MEMBER
 */
export function addMemberToDatabase(memberData, actor = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const nextNum = (db.members || []).length + 101;
  const newMember = {
    id: `M-${nextNum}`,
    name: memberData.name.trim(),
    phone: memberData.phone.trim(),
    address: memberData.address.trim() || "হাড়িনাল, গাজীপুর",
    role: memberData.role || "সাধারণ সদস্য",
    type: memberData.type || "GENERAL",
    status: "ACTIVE",
    pledge: Number(memberData.pledge || 1000),
    paid: 0,
    remaining: Number(memberData.pledge || 1000),
    loginId: `member${nextNum}`,
    joinedDate: new Date().toISOString().split("T")[0],
  };

  db.members = [newMember, ...(db.members || [])];

  // Append Audit Log
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "ADMIN",
    action: "MEMBER_REGISTERED",
    targetType: "MEMBER",
    targetId: newMember.id,
    details: `নতুন সদস্য নিবন্ধন: ${newMember.name} (মাসিক অঙ্গীকার: ৳${newMember.pledge})`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * RECORD INFLOW / DONATION
 */
export function recordDonationInDatabase(donationData, actor = "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)") {
  const db = getMosqueDatabase();
  const nextNum = (db.inflows || []).length + 87;
  const targetFund = db.funds.find((f) => f.id === donationData.fundId) || db.funds[0];

  const newInflow = {
    id: `INF-${Date.now().toString().slice(-4)}`,
    receiptNo: `RCPT-2026-${String(nextNum).padStart(3, "0")}`,
    donorId: donationData.donorId || null,
    donorName: donationData.donorName.trim() || "শ্রদ্ধেয় মুসল্লি",
    phone: donationData.phone.trim() || "০১৭XX-XXXXXX",
    fundId: targetFund.id,
    fundName: targetFund.name,
    amount: Number(donationData.amount),
    category: donationData.category || "সাধারণ অনুদান",
    date: new Date().toISOString().split("T")[0],
    method: donationData.method || "নগদ (Cash)",
    status: donationData.status || "VERIFIED", // Can be PENDING if online payment unconfirmed
    notes: donationData.notes || "রসিদ প্রস্তুতকৃত",
  };

  db.inflows = [newInflow, ...(db.inflows || [])];

  // Audit Log
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "TREASURER",
    action: "DONATION_RECEIVED",
    targetType: "INFLOW",
    targetId: newInflow.receiptNo,
    details: `অনুদান গ্রহণ: ${newInflow.donorName} হতে ৳${newInflow.amount} (${newInflow.fundName})`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * SUBMIT EXPENSE REQUISITION
 */
export function submitExpenseToDatabase(expenseData, actor = "আবেদনকারী কর্মকর্তা") {
  const db = getMosqueDatabase();
  const nextNum = (db.expenses || []).length + 90;
  const targetFund = db.funds.find((f) => f.id === expenseData.fundId) || db.funds[0];

  const newExpense = {
    id: `VCH-2026-${String(nextNum).padStart(3, "0")}`,
    voucherNo: `VCH-2026-${String(nextNum).padStart(3, "0")}`,
    title: expenseData.title.trim(),
    category: expenseData.category || "রক্ষণাবেক্ষণ",
    fundId: targetFund.id,
    fundName: targetFund.name,
    amount: Number(expenseData.amount),
    submittedBy: actor,
    spentAt: formatCurrentTimeBangla().split(" ")[0],
    status: "PENDING_APPROVAL", // Strict: does not deduct balance yet!
    notes: expenseData.notes || "",
    signatures: {
      applicant: actor,
      receiver: expenseData.receiverName || "সরবরাহকারী",
      treasurer: null,
      president: null,
    },
  };

  db.expenses = [newExpense, ...(db.expenses || [])];

  // Audit Log
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "STAFF",
    action: "EXPENSE_REQUISITION_SUBMITTED",
    targetType: "VOUCHER",
    targetId: newExpense.voucherNo,
    details: `ক্রয়/খরচ রিকুইজিশন দাখিল: ${newExpense.title} (৳${newExpense.amount})`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * APPROVE EXPENSE (By President / Committee)
 */
export function approveExpenseInDatabase(voucherNo, approver = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const exp = db.expenses.find((e) => e.voucherNo === voucherNo || e.id === voucherNo);
  if (!exp) return db;

  exp.status = "APPROVED";
  exp.signatures.president = approver;

  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: approver,
    role: "PRESIDENT",
    action: "EXPENSE_APPROVED",
    targetType: "VOUCHER",
    targetId: voucherNo,
    details: `ভাউচার অনুমোদন: ${exp.title} (৳${exp.amount})`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * PAY EXPENSE (By Treasurer — Deducts fund balance now!)
 */
export function payExpenseInDatabase(voucherNo, treasurer = "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)", method = "নগদ (Cash)") {
  const db = getMosqueDatabase();
  const exp = db.expenses.find((e) => e.voucherNo === voucherNo || e.id === voucherNo);
  if (!exp) return db;

  exp.status = "PAID";
  exp.signatures.treasurer = treasurer;
  exp.paymentMethod = method;

  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: treasurer,
    role: "TREASURER",
    action: "EXPENSE_PAID",
    targetType: "VOUCHER",
    targetId: voucherNo,
    details: `ভাউচার বিল পরিশোধ: ${exp.title} (৳${exp.amount} ফান্ড হতে কর্তন)`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * REJECT EXPENSE (Mandatory Reason)
 */
export function rejectExpenseInDatabase(voucherNo, rejector = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)", reason = "অতিরিক্ত খরচ") {
  const db = getMosqueDatabase();
  const exp = db.expenses.find((e) => e.voucherNo === voucherNo || e.id === voucherNo);
  if (!exp) return db;

  exp.status = "REJECTED";
  exp.rejectionReason = reason;

  const newLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: formatCurrentTimeBangla(),
    actor: rejector,
    role: "PRESIDENT",
    action: "EXPENSE_REJECTED",
    targetType: "VOUCHER",
    targetId: voucherNo,
    details: `ভাউচার প্রত্যাখ্যান: ${exp.title} (কারণ: ${reason})`,
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}


/**
 * PAY SALARY / DISBURSE HADIA TO IMAM OR STAFF
 * Automatically records an official expense voucher in Fund f3 (ইমাম-মুয়াজ্জিন ফান্ড),
 * deducts the balance, generates voucher number, and registers audit trail.
 */
export function paySalaryInDatabase(paymentData, actor = "জনাব শাহিনুর রহমান (কোষাধ্যক্ষ)") {
  const db = getMosqueDatabase();
  const nextNum = (db.expenses || []).length + 95;
  const voucherNo = "VCH-SAL-" + String(nextNum).padStart(3, "0");
  const totalAmount = Number(paymentData.amount || 0) + Number(paymentData.bonus || 0);

  const salaryExpense = {
    id: voucherNo,
    voucherNo: voucherNo,
    title: paymentData.employeeName + " (" + paymentData.role + ") - " + paymentData.month + " সম্মানী হাদিয়া",
    category: "ইমাম-কর্মচারী সম্মানী",
    fundId: "f3",
    fundName: "ইমাম-মুয়াজ্জিন সম্মানী ফান্ড",
    amount: totalAmount,
    submittedBy: actor,
    spentAt: formatCurrentTimeBangla().split(" ")[0],
    status: "PAID",
    paymentMethod: paymentData.method || "নগদ (Cash)",
    notes: "মাস: " + paymentData.month + " · মূল হাদিয়া: ৳" + paymentData.amount + " · অতিরিক্ত/বোনাস: ৳" + (paymentData.bonus || 0) + " · মাধ্যম: " + (paymentData.method || "নগদ"),
    signatures: {
      applicant: actor,
      receiver: paymentData.employeeName,
      treasurer: actor,
      president: "মুহাম্মদ আব্দুল্লাহ (অনুমোদিত)",
    },
    empId: paymentData.empId,
    month: paymentData.month,
  };

  db.expenses = [salaryExpense, ...(db.expenses || [])];

  const newLog = {
    id: "LOG-" + Date.now().toString().slice(-4),
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "TREASURER",
    action: "SALARY_PAID",
    targetType: "SALARY",
    targetId: voucherNo,
    details: paymentData.employeeName + "-এর " + paymentData.month + "-এর সম্মানী ৳" + totalAmount + " পরিশোধ সম্পন্ন",
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * ADD NEW STAFF / IMAM PROFILE
 */
export function addEmployeeToDatabase(empData, actor = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const nextId = "EMP-0" + ((db.employees || []).length + 1);
  const newEmp = {
    id: nextId,
    name: empData.name.trim(),
    role: empData.role.trim() || "সহকারী ইমাম",
    phone: empData.phone.trim() || "০১৭XX-XXXXXX",
    salary: Number(empData.salary || 10000),
    joinedAt: empData.joinedAt || formatCurrentTimeBangla().split(" ")[0],
    status: "ACTIVE",
  };

  db.employees = [...(db.employees || []), newEmp];

  const newLog = {
    id: "LOG-" + Date.now().toString().slice(-4),
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "ADMIN",
    action: "EMPLOYEE_ADDED",
    targetType: "STAFF",
    targetId: newEmp.id,
    details: "নতুন স্টাফ যুক্ত: " + newEmp.name + " (" + newEmp.role + ", মাসিক সম্মানী: ৳" + newEmp.salary + ")",
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * UPDATE EMPLOYEE DESIGNATED SALARY
 */
export function updateEmployeeSalaryInDatabase(empId, newSalary, actor = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const emp = (db.employees || []).find((e) => e.id === empId);
  if (!emp) return db;

  const oldSalary = emp.salary;
  emp.salary = Number(newSalary);

  const newLog = {
    id: "LOG-" + Date.now().toString().slice(-4),
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "ADMIN",
    action: "SALARY_UPDATED",
    targetType: "STAFF",
    targetId: empId,
    details: emp.name + "-এর মাসিক সম্মানী ৳" + oldSalary + " হতে ৳" + emp.salary + " নির্ধারণ করা হয়েছে",
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * ASSIGN / SCHEDULE IMAM MEAL HOST
 */
export function assignMealScheduleToDatabase(scheduleData, actor = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const nextId = "meal-" + Date.now().toString().slice(-5);
  const newEntry = {
    id: nextId,
    date: scheduleData.date,
    displayDate: scheduleData.displayDate || scheduleData.date,
    dayName: scheduleData.dayName || "নির্ধারিত দিন",
    mealType: scheduleData.mealType || "দুপুর ও রাত",
    family: scheduleData.family.trim(),
    memberId: scheduleData.memberId || null,
    phone: scheduleData.phone.trim(),
    status: "CONFIRMED",
    notes: scheduleData.notes || "খানা সিডিউল নির্ধারিত",
  };

  const roster = [...(db.mealRoster || DEFAULT_MEAL_ROSTER)];
  const existingIdx = roster.findIndex((m) => m.date === scheduleData.date);
  if (existingIdx >= 0) {
    roster[existingIdx] = { ...roster[existingIdx], ...newEntry };
  } else {
    roster.unshift(newEntry);
  }
  db.mealRoster = roster;

  const newLog = {
    id: "LOG-" + Date.now().toString().slice(-4),
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "ADMIN",
    action: "MEAL_ASSIGNED",
    targetType: "MEAL",
    targetId: newEntry.id,
    details: "ইমামের খানা সিডিউল: " + newEntry.displayDate + " - " + newEntry.family + " (" + newEntry.mealType + ")",
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}

/**
 * UPDATE MEMBER PLEDGE / COMMITMENT
 */
export function updateMemberPledgeInDatabase(memberId, newPledge, actor = "মুহাম্মদ আব্দুল্লাহ (সভাপতি)") {
  const db = getMosqueDatabase();
  const mem = (db.members || []).find((m) => m.id === memberId);
  if (!mem) return db;

  const oldPledge = mem.pledge;
  mem.pledge = Number(newPledge);

  const newLog = {
    id: "LOG-" + Date.now().toString().slice(-4),
    timestamp: formatCurrentTimeBangla(),
    actor: actor,
    role: "ADMIN",
    action: "PLEDGE_UPDATED",
    targetType: "MEMBER",
    targetId: memberId,
    details: mem.name + "-এর মাসিক অঙ্গীকার ৳" + oldPledge + " হতে ৳" + mem.pledge + " আপডেট করা হয়েছে",
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];

  return saveMosqueDatabase(db);
}


/**
 * GET MEMBER'S PRIVATE STATEMENT
 * Enforces strict member privacy: returns only member's receipts and pledges!
 */
export function getMemberPrivateStatement(memberId) {
  const db = getMosqueDatabase();
  const member = db.members.find((m) => m.id === memberId || m.loginId === memberId);
  if (!member) return null;

  const memberInflows = db.inflows.filter((inf) => inf.donorId === member.id);
  const totalPaid = memberInflows.reduce((acc, inf) => acc + (inf.status === "VERIFIED" ? inf.amount : 0), 0);

  return {
    member,
    inflows: memberInflows,
    totalPledge: member.pledge,
    totalPaid: totalPaid,
    remaining: Math.max(0, member.pledge - totalPaid),
    publicMosqueSummary: {
      mosqueName: db.mosque.name,
      totalFundsAvailable: db.funds.reduce((acc, f) => acc + f.currentBalance, 0),
      fundsCount: db.funds.length,
    },
  };
}

/**
 * JSON BACKUP EXPORT
 */
export function exportDatabaseBackupJSON() {
  const db = getMosqueDatabase();
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `masjid_erp_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * JSON BACKUP RESTORE
 */
export function restoreDatabaseBackupJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.funds || !parsed.members || !parsed.inflows) {
      throw new Error("Invalid Mosque ERP database schema");
    }
    return saveMosqueDatabase(parsed);
  } catch (err) {
    console.error("Backup restoration failed:", err);
    throw err;
  }
}

function formatCurrentTimeBangla() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}
