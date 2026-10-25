/**
 * Tajweed Canon & Symbolic Rules Database
 * Authoritative, non-hallucinatory reference for all 17 Makharij, Sifat Al-Huroof,
 * Noon/Meem Saakin rules, and Madd durations.
 */

// 1. The 17 Articulation Points (Makharij Al-Huroof)
export const MAKHARIJ_CANON = [
  // --- 1. Al-Jawf (The Empty Space in Mouth and Throat) ---
  {
    id: "jawf_1",
    category: "Al-Jawf",
    categoryBn: "আল-জাওফ (মুখ ও কণ্ঠনালীর খালি জায়গা)",
    nameAr: "الجوف",
    nameBn: "আল-জাওফ",
    letters: ["ا", "و", "ي"],
    articulationDescBn: "মুখ ও কণ্ঠনালীর খালি জায়গা থেকে মদ্দের ৩টি হরফ (আলিফ, ওয়াও, ইয়া) উচ্চারিত হয়।",
    commonErrorsBn: "হরকত যথাযথ না টেনে ছেড়ে দেওয়া অথবা অতিরিক্ত টানা।",
    correctionTipBn: "শব্দটি উচ্চারণের সময় মুখ স্বাভাবিকভাবে উন্মুক্ত রাখুন এবং শ্বাস স্বাভাবিকভাবে প্রবাহিত হতে দিন।"
  },

  // --- 2. Al-Halq (The Throat - 3 Makharij) ---
  {
    id: "halq_deep",
    category: "Al-Halq",
    categoryBn: "আল-হালক (কণ্ঠনালী)",
    nameAr: "أقصى الحلق",
    nameBn: "আকসাল হালক (কণ্ঠনালীর শেষ ভাগ/মূল)",
    letters: ["ء", "ه"],
    articulationDescBn: "কণ্ঠনালীর একবারে নিচের বা শেষ ভাগ থেকে হামযাহ্ (ء) ও হা (هـ) উচ্চারিত হয়।",
    commonErrorsBn: "হামযাহকে অতিরিক্ত শক্ত করা কিংবা হাকে নরম করতে গিয়ে ছেড়ে দেওয়া।",
    correctionTipBn: "বুকের কাছাকাছি কণ্ঠের নিচ থেকে হালকা বাতাস সহ 'হা' উচ্চারণ করুন।"
  },
  {
    id: "halq_mid",
    category: "Al-Halq",
    categoryBn: "আল-হালক (কণ্ঠনালী)",
    nameAr: "وسط الحلق",
    nameBn: "অসতুল হালক (কণ্ঠনালীর মধ্যভাগ)",
    letters: ["ع", "ح"],
    articulationDescBn: "কণ্ঠনালীর মধ্যভাগ সংকুচিত করে আইন (ع) এবং বাতাসসহ ধারালো হা (ح) উচ্চারিত হয়।",
    commonErrorsBn: "আইন (ع)-কে আলিফ বা হামযাহর মতো উচ্চারণ করা এবং হা (ح)-কে সাধারণ 'হ'-এর মতো নরম করে ফেলা।",
    correctionTipBn: "গলার মধ্যভাগকে সামান্য চেপে ধরে স্পষ্ট ও ধারালো আওয়াজ বের করুন।"
  },
  {
    id: "halq_top",
    category: "Al-Halq",
    categoryBn: "আল-হালক (কণ্ঠনালী)",
    nameAr: "أدنى الحلق",
    nameBn: "আদনাল হালক (কণ্ঠনালীর শুরুর ভাগ/মুখের নিকটবর্তী)",
    letters: ["غ", "خ"],
    articulationDescBn: "কণ্ঠনালীর ওপরের অংশ (আলজিহ্বার কাছাকাছি) থেকে গইন (غ) এবং খরখরে খা (خ) উচ্চারিত হয়।",
    commonErrorsBn: "গইন ও খাকে পাতলা করে ফেলা; এগুলো সর্বদা পুর বা ভারী (মুস্তা'লিয়াহ) হরফ।",
    correctionTipBn: "গলার ওপরের অংশে বাতাস হালকা ঘর্ষণে প্রবাহিত করে আওয়াজ মোটা করুন।"
  },

  // --- 3. Al-Lisan (The Tongue - 10 Makharij) ---
  {
    id: "lisan_qaf",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "أقصى اللسان - قاف",
    nameBn: "জিহ্বার গোড়া ও ওপরের নরম তালু",
    letters: ["ق"],
    articulationDescBn: "জিহ্বার গোড়া তার বরাবর ওপরের নরম তালুর সাথে লাগিয়ে ক্বাফ (ق) উচ্চারিত হয়।",
    commonErrorsBn: "ক্বাফকে কাফ (ك) বা সাধারণ বাংলা 'ক'-এর মতো পাতলা করা।",
    correctionTipBn: "জিহ্বার একবারে পেছনের অংশ ওপরের নরম তালুতে লাগিয়ে মোটা ও ভারী আওয়াজ করুন।"
  },
  {
    id: "lisan_kaf",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "أقصى اللسان - كاف",
    nameBn: "ক্বাফের সামান্য সামনে জিহ্বার গোড়া ও শক্ত তালু",
    letters: ["ك"],
    articulationDescBn: "ক্বাফের মাখরাজ থেকে সামান্য মুখের দিকে এগিয়ে জিহ্বার গোড়া ও শক্ত তালু মিলিয়ে কাফ (ك) উচ্চারিত হয়।",
    commonErrorsBn: "হামস (হালকা বাতাসের প্রবাহ) বাদ দেওয়া অথবা অতিরিক্ত বাতাস বের করা।",
    correctionTipBn: "জিহ্বা তালু থেকে ছাড়ার মুহূর্তে হালকা বাতাসের স্ফুলিঙ্গ (হামস) বের করুন।"
  },
  {
    id: "lisan_mid",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "وسط اللسان",
    nameBn: "জিহ্বার মধ্যভাগ ও ওপরের তালু",
    letters: ["ج", "ش", "ي"],
    articulationDescBn: "জিহ্বার মধ্যভাগ তার বরাবর ওপরের শক্ত তালুর সাথে মিলিয়ে জীম (ج), শীন (ش) এবং ইয়া (ي) উচ্চারিত হয়।",
    commonErrorsBn: "জীমকে নরম ইংরেজি 'J' এর মতো বলা অথবা শীন-এ যথেষ্ট বাতাস না ছাড়ানো।",
    correctionTipBn: "জীমের ক্ষেত্রে জিহ্বার মধ্যভাগ তালুর সাথে শক্তভাবে লাগান যাতে বাতাস আটকে যায়।"
  },
  {
    id: "lisan_dad",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "حافة اللسان",
    nameBn: "জিহ্বার পাশ/কিনারা ও ওপরের মাড়ির দাঁত",
    letters: ["ض"],
    articulationDescBn: "জিহ্বার এক বা উভয় পাশ ওপরের মাড়ির দাঁতের গোড়ার সাথে লাগিয়ে দদ (ض) উচ্চারিত হয়।",
    commonErrorsBn: "দদকে সাধারণ 'দ' বা 'জ'-এর মতো উচ্চারণ করা; ইস্তিতালাহ (দীর্ঘায়িত স্পর্শ) বাদ দেওয়া।",
    correctionTipBn: "জিহ্বার পাশ মাড়ির দাঁতের সাথে চেপে সামান্য সামনের দিকে প্রসারিত করুন।"
  },
  {
    id: "lisan_lam",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "طرف اللسان - لام",
    nameBn: "জিহ্বার অগ্রভাগের কিনারা ও সামনের দাঁতের তালু",
    letters: ["ل"],
    articulationDescBn: "জিহ্বার অগ্রভাগের এক পাশ থেকে অন্য পাশ পর্যন্ত সামনের দাঁতগুলোর তালুর সাথে লাগিয়ে লাম (ل) উচ্চারিত হয়।",
    commonErrorsBn: "আল্লাহ শব্দের লাম ছাড়া সাধারণ লামকে অকারণে মোটা করে ফেলা।",
    correctionTipBn: "সাধারণ অবস্থায় লাম সর্বদা পাতলা ও হালকাভাবে উচ্চারণ করুন।"
  },
  {
    id: "lisan_noon",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "طرف اللسان - نون",
    nameBn: "জিহ্বার ডগা ও সামনের ওপরের দাঁতের মাড়ি",
    letters: ["ن"],
    articulationDescBn: "জিহ্বার ডগা সামনের ওপরের দাঁতের মাড়ির সাথে লাগিয়ে নূন (ن) উচ্চারিত হয় (গুন্নাহসহ)।",
    commonErrorsBn: "নূনের স্বাভাবিক গুন্নাহ একেবারে বাদ দেওয়া।",
    correctionTipBn: "জিহ্বার ডগা দাঁতের মাড়িতে স্পর্শ করান এবং নাকের বাঁশি থেকে হালকা স্বাভাবিক ধ্বনি বজায় রাখুন।"
  },
  {
    id: "lisan_ra",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "طرف اللسان - راء",
    nameBn: "জিহ্বার ডগার পিঠ ও ওপরের তালু",
    letters: ["ر"],
    articulationDescBn: "জিহ্বার ডগার পিঠ সামান্য উল্টিয়ে ওপরের তালুর সাথে লাগিয়ে র (ر) উচ্চারিত হয়।",
    commonErrorsBn: "অতিরিক্ত কাঁপন সৃষ্টি করা (তাকরিরের আধিক্য) অথবা একেবারেই কাঁপন না রাখা।",
    correctionTipBn: "জিহ্বার ডগায় মাত্র একটি সূক্ষ্ম কম্পন হতে দিন, অতিরিক্ত কাঁপাবেন না।"
  },
  {
    id: "lisan_tiyyah",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "الحروف النطعية",
    nameBn: "জিহ্বার ডগা ও ওপরের সামনের দুই দাঁতের গোড়া",
    letters: ["ط", "د", "ت"],
    articulationDescBn: "জিহ্বার ডগা ওপরের সামনের দুই দাঁতের (ছানায়া উলইয়া) গোড়ার সাথে লাগিয়ে ত্বা (ط), দাল (د), তা (ت) উচ্চারিত হয়।",
    commonErrorsBn: "ত্বা (ط)-কে তা (ت)-এর মতো পাতলা করা অথবা তা-তে অতিরিক্ত বাতাস ছাড়া।",
    correctionTipBn: "ত্বা উচ্চারণে জিহ্বার পেছনের অংশ তুলে মুখ ভর্তি করে মোটা করুন।"
  },
  {
    id: "lisan_asaliyyah",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "حروف الصفير",
    nameBn: "জিহ্বার ডগা ও নিচের সামনের দাঁতের পেট",
    letters: ["ص", "س", "ز"],
    articulationDescBn: "জিহ্বার ডগা নিচের সামনের দাঁতের ভেতরের অংশে রেখে বাতাস বের করে সাদ (ص), সীন (س), যা (ز) উচ্চারিত হয়।",
    commonErrorsBn: "সাদ (ص)-কে সীন (س)-এর মতো শিস দিয়ে ফেলা; সাদ মোটা হরফ।",
    correctionTipBn: "সাদ উচ্চারণে জিহ্বার পেছনের অংশ উঠিয়ে তীব্র শিস ধ্বনির সাথে আওয়াজ ভারী করুন।"
  },
  {
    id: "lisan_lathawiyyah",
    category: "Al-Lisan",
    categoryBn: "আল-লিসান (জিহ্বা)",
    nameAr: "الحروف اللثوية",
    nameBn: "জিহ্বার ডগা ও ওপরের সামনের দুই দাঁতের ধার",
    letters: ["ظ", "ذ", "ث"],
    articulationDescBn: "জিহ্বার ডগা ওপরের সামনের দুই দাঁতের ধারের সাথে সামান্য বের করে জোয়া (ظ), যাল (ذ), ছা (ث) উচ্চারিত হয়।",
    commonErrorsBn: "ছা (ث) বা যাল (ذ)-কে 'স' বা 'জ'-এর মতো দাঁত চেপে উচ্চারণ করা।",
    correctionTipBn: "জিহ্বার সামান্য ডগা দাঁতের ফাঁক দিয়ে মৃদুভাবে স্পর্শ করুন, দাঁত শক্ত করে চাপবেন না।"
  },

  // --- 4. Ash-Shafatayn (The Lips - 2 Makharij) ---
  {
    id: "shafatan_fa",
    category: "Ash-Shafatayn",
    categoryBn: "আশ-শাফাতাইন (ঠোঁটদ্বয়)",
    nameAr: "بطن الشفة السفلى",
    nameBn: "নিচের ঠোঁটের পেট ও ওপরের সামনের দুই দাঁতের ধার",
    letters: ["ف"],
    articulationDescBn: "নিচের ঠোঁটের ভেতরের অংশ (পেট) ওপরের সামনের দুই দাঁতের ধারের সাথে লাগিয়ে ফা (ف) উচ্চারিত হয়।",
    commonErrorsBn: "উভয় ঠোঁট চেপে বাংলা 'ফ'-এর মতো উচ্চারণ করা।",
    correctionTipBn: "কেবলমাত্র ওপরের দাঁত নিচের ঠোঁটের পেটে লাগিয়ে বাতাস ছাড়ুন, দুই ঠোঁট মেলবেন না।"
  },
  {
    id: "shafatan_ba_meem_waw",
    category: "Ash-Shafatayn",
    categoryBn: "আশ-শাফাতাইন (ঠোঁটদ্বয়)",
    nameAr: "الشفتان معاً",
    nameBn: "দুই ঠোঁটের সম্মিলিত মিলন ও গোল হওয়া",
    letters: ["ب", "م", "و"],
    articulationDescBn: "দুই ঠোঁট চেপে বা (ب) ও মীম (م) এবং ঠোঁট দুটি গোল করে ওয়াও (و) উচ্চারিত হয়।",
    commonErrorsBn: "বা-তে কলক্বলাহ না করা অথবা মীমে ঠোঁট অতিরিক্ত শক্ত করে চেপে ধরা।",
    correctionTipBn: "মীম উচ্চারণে ঠোঁটের ভেতরের ভিজা অংশ হালকাভাবে মেলান এবং স্বাভাবিক গুন্নাহ রাখুন।"
  },

  // --- 5. Al-Khayshum (The Nasal Cavity) ---
  {
    id: "khayshum",
    category: "Al-Khayshum",
    categoryBn: "আল-খাইশূম (নাকের বাঁশি)",
    nameAr: "الخيشوم",
    nameBn: "নাকের বাঁশি/নাসারন্ধ্র",
    letters: ["غنة"],
    articulationDescBn: "নাকের ভেতর থেকে গুন্নাহর সুমধুর রেশ বের হয় (ইদগাম, ইখফা, এবং তাশদীদযুক্ত নূন ও মীমে)।",
    commonErrorsBn: "গুন্নাহ ২ হরকতের কম সময় রাখা বা অতিরিক্ত টেনে ফেলা।",
    correctionTipBn: "আওয়াজ মুখের ভেতর না রেখে নাকের বাঁশির কম্পনে পূর্ণ ২ হরকত পরিমাণ ধরে রাখুন।"
  }
];

// 2. Tajweed Rules Classification
export const TAJWEED_RULES = {
  noon_saakin: [
    { key: "izhar", nameBn: "ইযহার (স্পষ্ট করা)", harakat: 0, letters: ["ء", "ه", "ع", "ح", "غ", "خ"] },
    { key: "idgham_ghunnah", nameBn: "ইদগামে বাগুন্নাহ (মিলিয়ে গুন্নাহসহ)", harakat: 2, letters: ["ي", "ن", "م", "و"] },
    { key: "idgham_bila_ghunnah", nameBn: "ইদগামে বেলাগুন্নাহ (গুন্নাহ ছাড়া মিলিয়ে)", harakat: 0, letters: ["ل", "ر"] },
    { key: "iqlab", nameBn: "ইক্বলাব (বদলানো)", harakat: 2, letters: ["ب"] },
    { key: "ikhfa", nameBn: "ইখফা (গোপন করে গুন্নাহ)", harakat: 2, letters: ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"] }
  ],
  meem_saakin: [
    { key: "ikhfa_shafawi", nameBn: "ইখফায়ে শাফাভী", harakat: 2, letters: ["ب"] },
    { key: "idgham_shafawi", nameBn: "ইদগামে শাফাভী", harakat: 2, letters: ["م"] },
    { key: "izhar_shafawi", nameBn: "ইযহারে শাফাভী", harakat: 0, letters: ["all_other"] }
  ],
  madd: [
    { key: "madd_asli", nameBn: "মদ্দে আসলী/ত্ববায়্যী", count: 2, descBn: "২ হরকত পরিমাণ টানুন।" },
    { key: "madd_muttasil", nameBn: "মদ্দে মুত্তাসিল (যুক্ত মদ)", count: 4, descBn: "৪ বা ৫ হরকত পরিমাণ টানুন।" },
    { key: "madd_munfasil", nameBn: "মদ্দে মুনফাসিল (বিযুক্ত মদ)", count: 4, descBn: "৪ বা ৫ হরকত পরিমাণ টানুন।" },
    { key: "madd_lazim", nameBn: "মদ্দে লাযিম (অপরিহার্য মদ)", count: 6, descBn: "পূর্ণ ৬ হরকত পরিমাণ টানুন।" },
    { key: "madd_arid", nameBn: "মদ্দে আরেয লিসসুকূন", count: 4, descBn: "থামার ক্ষেত্রে ২, ৪ বা ৬ হরকত টানুন।" }
  ],
  qalqalah: [
    { key: "qalqalah", nameBn: "ক্বলক্বলাহ (প্রতিধ্বনি)", letters: ["ق", "ط", "ب", "ج", "د"], descBn: "সাকিন অবস্থায় আওয়াজ ধাক্কা লেগে সুন্দরভাবে স্পষ্ট হবে।" }
  ]
};

/**
 * Resolves pedagogical guidance for a detected mistake
 */
export function getTajweedCorrectionAdvice(ruleKey, detectedError) {
  if (ruleKey === "ikhfa") {
    return {
      titleBn: "ইখফা করার সঠিক নিয়ম",
      ruleName: "Ikhfa Haqiqi",
      adviceBn: "নূন সাকিন বা তানভীনের পর ইখফার হরফ এলে জিহ্বার ডগা ওপরের তালুতে না লাগিয়ে নাকের ভেতর থেকে মৃদু গুন্নাহর আওয়াজ ২ হরকত ধরে রাখুন।",
      lipAction: "ঠোঁট স্বাভাবিক ও শিথিল রাখুন।",
      tongueAction: "জিহ্বা তালুর সাথে জড়াবেন না, সামান্য ফাঁকা থাকবে।",
      audioSnippetPrompt: "Hold nasal hum for 2 Harakat smoothly."
    };
  }

  if (ruleKey === "qalqalah") {
    return {
      titleBn: "ক্বলক্বলাহর ধাক্কা দিন",
      ruleName: "Qalqalah",
      adviceBn: "ক্বাফ, ত্বা, বা, জীম, দাল (قطب جد) হরফে সাকিন হলে আওয়াজ আটকে না রেখে মৃদু ধাক্কা দিয়ে প্রতিধ্বনিত করুন।",
      lipAction: "হরফ উচ্চারণের পর মাখরাজ দ্রুত উন্মুক্ত করুন।",
      tongueAction: "মাখরাজে আঘাত দিয়ে দ্রুত সরিয়ে নিন।",
      audioSnippetPrompt: "Produce a crisp echo sound upon release."
    };
  }

  return {
    titleBn: "উচ্চারণ সংশোধন",
    ruleName: ruleKey || "General Tajweed",
    adviceBn: "হরফটির মাখরাজ ও সিফাত বজায় রেখে ধীরেসুস্থে উচ্চারণ করুন।",
    lipAction: "স্বাভাবিক রাখুন।",
    tongueAction: "সংশ্লিষ্ট মাখরাজে স্পর্শ নিশ্চিত করুন।",
    audioSnippetPrompt: "Recite with measured calm and clear articulation."
  };
}
