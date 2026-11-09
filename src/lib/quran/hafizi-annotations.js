/**
 * Authoritative Hafizi Quran Annotations Engine (হাফেজী কুরআন অ্যানোটেশন ও তাজবীদ বিজ্ঞান)
 * 1. Hafizi Header Metadata (Surah, Surah No, Para, Para Page, Manzil, Global Page)
 * 2. Mutashabihat Cross-Referencing (মুতাশাবিহাত আয়াত, টেক্সট মার্কিং ও মার্জিন হাশিয়া রেফারেন্স)
 * 3. Waqf & Ibtida for Long Ayahs (ওয়াকফে ইবতিদাইয়া — দীর্ঘ আয়াতে থামার স্টার (*) ও শুরুর টিক (✓) মার্কার)
 * 4. Thematic Page Banners (বিষয়ভিত্তিক ওয়াকফ ও পৃষ্ঠার মূল আলোচ্য বিষয়)
 */

import { ALL_SURAHS } from "./quran-meta.js";
import { HAFIZI_PARAS, TOTAL_UTHMANI_PAGES } from "./hafizi-pages.js";

// Manzil Division (৭টি মনজিল)
export function getManzilForSurah(surahId) {
  const s = Number(surahId) || 1;
  if (s <= 4) return 1;
  if (s <= 9) return 2;
  if (s <= 16) return 3;
  if (s <= 25) return 4;
  if (s <= 36) return 5;
  if (s <= 49) return 6;
  return 7;
}

// Convert English digits to Bengali digits
export const toBnNum = (num) => {
  if (num === null || num === undefined) return "০";
  const enToBn = { "0":"০", "1":"১", "2":"২", "3":"৩", "4":"৪", "5":"৫", "6":"৬", "7":"৭", "8":"৮", "9":"৯" };
  return String(num).replace(/\d/g, (d) => enToBn[d] || d);
};

// Convert English digits to Arabic/Urdu digits
export const toArNum = (num) => {
  if (num === null || num === undefined) return "٠";
  const enToAr = { "0":"٠", "1":"١", "2":"٢", "3":"٣", "4":"٤", "5":"٥", "6":"٦", "7":"٧", "8":"٨", "9":"٩" };
  return String(num).replace(/\d/g, (d) => enToAr[d] || d);
};

/**
 * 1. Page Header Metadata Builder
 * - Right: Surah Name, Surah Number, Para Number, Para Page Number
 * - Left: Para Name (Arabic), Manzil Number
 * - Center: Global Hafizi Page Number
 */
export function getHafiziHeaderMetadata(pageNum, paraInfo, currentSurah) {
  const p = paraInfo || HAFIZI_PARAS[0];
  const s = currentSurah || ALL_SURAHS[0];
  const manzil = getManzilForSurah(s.id);
  const paraPage = Math.max(1, (pageNum - p.startPage) + 1);

  return {
    // Right Header (Arabic & Bengali layout)
    headerRightAr: `سُوْرَةُ ${s.nameAr} ${toArNum(s.id)} - پاره ${toArNum(p.juz)} - صفحه ${toArNum(paraPage)}`,
    headerRightBn: `সূরা ${s.nameBn} (${toBnNum(s.id)}) • পারা ${toBnNum(p.juz)} • পৃষ্ঠা ${toBnNum(paraPage)}`,
    
    // Left Header
    headerLeftAr: `${p.nameAr} - مَنْزِل ${toArNum(manzil)}`,
    headerLeftBn: `${p.nameBn} • মনজিল ${toBnNum(manzil)}`,

    // Center Global Page
    centerPageBn: toBnNum(pageNum),
    centerPageAr: toArNum(pageNum),
    globalPage: pageNum,
    para: p.juz,
    paraPage,
    manzil,
  };
}

/**
 * 2. Famous Mutashabihat Cross-References Registry (সদৃশ আয়াত অভিধান)
 * Keyed by text fragments (≥ 3 words) with exact margin cross-references
 */
export const MUTASHABIHAT_REGISTRY = [
  {
    phraseAr: "يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ",
    phraseClean: "يا بني اسرائيل اذكروا نعمتي التي انعمت عليكم",
    meaningBn: "হে বনী ইসরাঈল! আমার সে নিয়ামতের কথা স্মরণ কর যা আমি তোমাদের দান করেছি",
    references: [
      { para: 1, page: 7, surah: 2, ayah: 40, note: "সূরা আল-বাকারা ৪০" },
      { para: 1, page: 8, surah: 2, ayah: 47, note: "সূরা আল-বাকারা ৪৭" },
      { para: 1, page: 19, surah: 2, ayah: 122, note: "সূরা আল-বাকারা ১২২" }
    ]
  },
  {
    phraseAr: "وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا",
    phraseClean: "واتقوا يوما لا تجزي نفس عن نفس شيئا",
    meaningBn: "আর সেই দিনকে ভয় কর যেদিন কেউ কারও সামান্যতম উপকারে আসবে না",
    references: [
      { para: 1, page: 8, surah: 2, ayah: 48, note: "সূরা আল-বাকারা ৪৮ (শাফাআত অগ্রাহ্য)" },
      { para: 1, page: 19, surah: 2, ayah: 123, note: "সূরা আল-বাকারা ১২৩ (বিনিময় অগ্রাহ্য)" }
    ]
  },
  {
    phraseAr: "وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ",
    phraseClean: "واذ وقلنا ادخلوا هذه القرية",
    meaningBn: "আর যখন আমি বললাম, এ জনপদে প্রবেশ কর...",
    references: [
      { para: 1, page: 9, surah: 2, ayah: 58, note: "সূরা আল-বাকারা ৫৮" },
      { para: 9, page: 171, surah: 7, ayah: 161, note: "সূরা আল-আ'রাফ ১৬১" }
    ]
  },
  {
    phraseAr: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي",
    phraseClean: "قل ان كنتم تحبون الله فاتبعوني",
    meaningBn: "বলুন, যদি তোমরা আল্লাহকে ভালোবাস তবে আমাকে অনুসরণ কর...",
    references: [
      { para: 3, page: 54, surah: 3, ayah: 31, note: "সূরা আলে ইমরান ৩১" }
    ]
  },
  {
    phraseAr: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    phraseClean: "فباي الاء ربكما تكذبان",
    meaningBn: "অতএব তোমরা উভয়ে তোমাদের রবের কোন কোন নিয়ামতকে অস্বীকার করবে?",
    references: [
      { para: 27, page: 531, surah: 55, ayah: 13, note: "সূরা আর-রহমানে ৩১ বার এসেছে" }
    ]
  },
  {
    phraseAr: "وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ",
    phraseClean: "ويل يومئذ للمكذبين",
    meaningBn: "সেদিন মিথ্যাজ্ঞানকারীদের জন্য মহা দুর্ভোগ!",
    references: [
      { para: 29, page: 580, surah: 77, ayah: 15, note: "সূরা আল-মুরসালাতে ১০ বার এসেছে" }
    ]
  },
  {
    phraseAr: "تِلْكَ الرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ",
    phraseClean: "تلك الرسل فضلنا بعضهم على بعض",
    meaningBn: "এসব রসূল—আমি তাদের একজনের ওপর অপরজনকে মর্যাদা দিয়েছি...",
    references: [
      { para: 3, page: 42, surah: 2, ayah: 253, note: "সূরা আল-বাকারা ২৫৩" },
      { para: 15, page: 287, surah: 17, ayah: 55, note: "সূরা বনী ইসরাঈল ৫৫" }
    ]
  },
  {
    phraseAr: "إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ",
    phraseClean: "ان الذين امنوا والذين هادوا والنصارى والصابئين",
    meaningBn: "নিশ্চয় যারা ঈমান এনেছে, এবং যারা ইহুদী, খ্রিস্টান ও সাবেঈ হয়েছে...",
    references: [
      { para: 1, page: 10, surah: 2, ayah: 62, note: "সূরা আল-বাকারা ৬২" },
      { para: 6, page: 120, surah: 5, ayah: 69, note: "সূরা আল-মা'ইদাহ ৬৯" }
    ]
  }
];

/**
 * 3. Waqf & Ibtida Registry (দীর্ঘ আয়াতে থামার স্টার (*) ও শুরুর টিক (✓) মার্কার)
 * Defines for long verses:
 * - stopWordText: The exact word where recitation pauses (ওয়াকফ) with an asterisk [*]
 * - resumeWordText: The word from which recitation restarts (ইবতিদা) with a checkmark [✓]
 */
export const WAQF_IBTIDA_REGISTRY = {
  // Surah 2, Ayah 255 (Ayatul Kursi)
  "2-255": [
    {
      stopAfterWord: "نَوْمٌ",
      resumeAtWord: "لَّهُ",
      stopSign: "ج",
      note: "লা তা'খুযুহু সিনাতুওঁ ওয়ালা নাওম (এখানে থামা যায়) * পুনরায়: লাহূ মা ফিস সামাওয়াতি (✓)"
    },
    {
      stopAfterWord: "بِإِذْنِهِ",
      resumeAtWord: "يَعْلَمُ",
      stopSign: "ط",
      note: "ইল্লা বিইযনিহী (এখানে থামা আবশ্যক) * পুনরায়: ইয়া'লামু মা বাইনা আইদীহিম (✓)"
    },
    {
      stopAfterWord: "شَاءَ",
      resumeAtWord: "وَسِعَ",
      stopSign: "ج",
      note: "ইল্লা বিমা শা-আ * পুনরায়: ওয়াসি'আ কুরসিয়্যুহুস সামাওয়াতি (✓)"
    }
  ],
  // Surah 2, Ayah 282 (Ayat ad-Dayn - longest Ayah in Quran)
  "2-282": [
    {
      stopAfterWord: "فَاكْتُبُوهُ",
      resumeAtWord: "وَلْيَكْتُب",
      stopSign: "ط",
      note: "মুসাম্মান ফাকতুবূহ * পুনরায়: ওয়াল ইয়াকতুব বাইনাকুম কাতিবুম বিল 'আদল (✓)"
    },
    {
      stopAfterWord: "بِالْعَدْلِ",
      resumeAtWord: "وَلَا",
      stopSign: "ج",
      note: "কাতিবুম বিল 'আদল * পুনরায়: ওয়ালা ইয়া'বা কাতিবুন (✓)"
    },
    {
      stopAfterWord: "شَيْئًا",
      resumeAtWord: "فَإِن",
      stopSign: "ط",
      note: "ওয়ালা ইয়াবখাস মিনহু শাই-আ * পুনরায়: ফা ইন কানাল্লাযী 'আলাইহিল হাক্কু (✓)"
    }
  ],
  // Surah 2, Ayah 253
  "2-253": [
    {
      stopAfterWord: "دَرَجَاتٍ",
      resumeAtWord: "وَآتَيْنَا",
      stopSign: "ج",
      note: "ওয়া রাফা'আ বা'দাহুম দারাজাত * পুনরায়: ওয়া আতাইনা 'ঈসাবনা মারইয়ামা (✓)"
    },
    {
      stopAfterWord: "الْقُدُسِ",
      resumeAtWord: "وَلَوْ",
      stopSign: "ط",
      note: "ওয়া আইয়্যাদনা-হু বিরূহিল কুদুস * পুনরায়: ওয়া লাও শা-আল্লাহু মাকতাতালাল্লাযীনা (✓)"
    }
  ]
};

/**
 * 4. Thematic Page Summaries (বিষয়ভিত্তিক কুরআনিক শিরোনাম)
 * Brief topic overview for pages so students understand the message of each Hafizi page
 */
export const THEMATIC_PAGE_SUMMARIES = {
  1: "সূরা আল-ফাতিহা — উম্মুল কুরআন, তাওহীদ, প্রার্থনা ও সিরাতুল মুস্তাকীম",
  2: "সূরা আল-বাকারা ১-৫ — কুরআন মুত্তাকীদের পথনির্দেশক ও সফল মুমিনের গুণাবলী",
  3: "সূরা আল-বাকারা ৬-১৬ — মুনাফিকদের কপটতা, আত্মপ্রবঞ্চনা ও তাদের করুণ পরিণাম",
  4: "সূরা আল-বাকারা ১৭-২৫ — মানবজাতির প্রতি আল্লাহর একত্ববাদের আহ্বান ও জান্নাতের সুসংবাদ",
  5: "সূরা আল-বাকারা ২৬-২৯ — মশক বা ক্ষুদ্র সৃষ্টির দৃষ্টান্ত ও মানব সৃষ্টির মহিমা",
  6: "সূরা আল-বাকারা ৩০-৩৯ — আদম (আঃ)-এর সৃষ্টি, ফেরেশতাদের সিজদা ও শয়তানের অবাধ্যতা",
  7: "সূরা আল-বাকারা ৪০-৪৮ — বনী ইসরাঈলকে প্রদত্ত নেয়ামত ও আল্লাহর প্রতি অঙ্গীকার",
  42: "পারা ৩ শুরু • রাসূলদের মর্যাদা, আয়াতুল কুরসী ও দ্বীনে কোনো জোর-জবরদস্তি নেই",
  43: "সূরা আল-বাকারা ২৫৭-২৫৯ — ইব্রাহীম (আঃ) ও নমরূদের বিতর্ক, মৃত্যু ও পুনরুত্থানের প্রমাণ",
  180: "পারা ১০ • সূরা আল-আনফাল সমাপ্তি ও সূরা আত-তাওবাহ শুরু — আল্লাহর আনুগত্য ও যুদ্ধলব্ধ সম্পদ",
  182: "পারা ১০ • সূরা আত-তাওবাহ — কাফেরদের সাথে চুক্তি ও তাওবার সুযোগ",
  586: "পারা ৩০ • সূরা আন-নাবা — মহাপ্রলয় কিয়ামতের বর্ণনা ও জাহান্নামীদের শাস্তি",
  604: "সূরা আল-ইখলাস, আল-ফালাক ও আন-নাস — তাওহীদের পূর্ণতা ও সর্বপ্রকার অনিষ্ট থেকে আশ্রয়"
};

/**
 * Get full thematic summary for any page
 */
export function getThematicSummaryForPage(pageNum, surahMeta) {
  if (THEMATIC_PAGE_SUMMARIES[pageNum]) {
    return THEMATIC_PAGE_SUMMARIES[pageNum];
  }
  const s = surahMeta || ALL_SURAHS[0];
  return `সূরা ${s.nameBn} (${s.typeBn || "মাক্কী"}) — আয়াতভিত্তিক নির্দেশিকা ও উপদেশ`;
}
