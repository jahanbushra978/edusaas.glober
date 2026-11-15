/**
 * নূর কায়দা (মক্তব শিক্ষা পাঠ্যপাঠিকা) — সচিত্র ও রঙ-সংকেতযুক্ত পূর্ণাঙ্গ পৃষ্ঠা ডেটাবেজ
 * PDF-এর হুবহু লেআউট, রঙ-সংকেত, সচিত্র মাখরাজ, শব্দ ভেঙে পড়া (সিলেবল), মজার খেলা ও সনদপত্র
 */

// 🎨 কালার থিম ও প্যার্ভা সংকেত
export const PARVA_THEMES = {
  1: {
    number: 1,
    name: "পর্ব ১: হরফ পরিচয় ও আকৃতি",
    headerBg: "from-emerald-600 via-teal-700 to-emerald-800",
    badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
    pillBorder: "border-emerald-400",
    accent: "text-emerald-700",
    emoji: "🔤",
    pageRange: "৮–১৮",
  },
  2: {
    number: 2,
    name: "পর্ব ২: মাখরাজের প্রাথমিক শিক্ষা",
    headerBg: "from-teal-600 via-cyan-700 to-teal-800",
    badgeBg: "bg-cyan-100 text-cyan-950 border-cyan-300",
    pillBorder: "border-cyan-400",
    accent: "text-cyan-700",
    emoji: "🗣️",
    pageRange: "১৯–২৩",
  },
  3: {
    number: 3,
    name: "পর্ব ৩: জবর, যের, পেশ (হরকত)",
    headerBg: "from-blue-600 via-indigo-700 to-blue-800",
    badgeBg: "bg-blue-100 text-blue-950 border-blue-300",
    pillBorder: "border-blue-400",
    accent: "text-blue-700",
    emoji: "🔵",
    pageRange: "২৪–৩৯",
  },
  4: {
    number: 4,
    name: "পর্ব ৪: তানবিন, মদ ও লীন",
    headerBg: "from-purple-600 via-pink-700 to-purple-800",
    badgeBg: "bg-pink-100 text-pink-950 border-pink-300",
    pillBorder: "border-pink-400",
    accent: "text-pink-700",
    emoji: "🎵",
    pageRange: "৪০–৪৬",
  },
  5: {
    number: 5,
    name: "পর্ব ৫: সুকুন (জযম), ক্বলক্বলা ও তাশদীদ",
    headerBg: "from-amber-600 via-orange-700 to-amber-800",
    badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
    pillBorder: "border-amber-400",
    accent: "text-amber-700",
    emoji: "⚡",
    pageRange: "৪৭–৫৬",
  },
  6: {
    number: 6,
    name: "পর্ব ৬: গুন্নাহ, ওয়াকফ ও প্রাথমিক তাজবিদ",
    headerBg: "from-rose-600 via-red-700 to-rose-800",
    badgeBg: "bg-rose-100 text-rose-950 border-rose-300",
    pillBorder: "border-rose-400",
    accent: "text-rose-700",
    emoji: "🛑",
    pageRange: "৫৭–৬২",
  },
  7: {
    number: 7,
    name: "পর্ব ৭: ১৭ মাখরাজ ও সিফাত",
    headerBg: "from-teal-700 via-emerald-800 to-teal-900",
    badgeBg: "bg-teal-100 text-teal-950 border-teal-300",
    pillBorder: "border-teal-400",
    accent: "text-teal-700",
    emoji: "🧭",
    pageRange: "৬৩–৬৫",
  },
  8: {
    number: 8,
    name: "পর্ব ৮: সূরা ফাতিহা শিক্ষা",
    headerBg: "from-yellow-600 via-amber-700 to-yellow-800",
    badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
    pillBorder: "border-amber-400",
    accent: "text-amber-700",
    emoji: "📖",
    pageRange: "৬৬–৭২",
  },
  9: {
    number: 9,
    name: "পর্ব ৯: শেষ ১০ সূরা (নাজেরা প্রস্তুতি)",
    headerBg: "from-red-600 via-rose-700 to-red-800",
    badgeBg: "bg-red-100 text-red-950 border-red-300",
    pillBorder: "border-red-400",
    accent: "text-red-700",
    emoji: "📖",
    pageRange: "৭৩–৮৮",
  },
  10: {
    number: 10,
    name: "পর্ব ১০: বিস্তারিত তাজবিদ নিয়মাবলী",
    headerBg: "from-indigo-600 via-purple-700 to-indigo-800",
    badgeBg: "bg-indigo-100 text-indigo-950 border-indigo-300",
    pillBorder: "border-indigo-400",
    accent: "text-indigo-700",
    emoji: "🎓",
    pageRange: "৮৯–৯৫",
  },
  11: {
    number: 11,
    name: "পর্ব ১১: ইজরা ও নাজেরা কুরআন",
    headerBg: "from-purple-700 via-indigo-800 to-purple-900",
    badgeBg: "bg-purple-100 text-purple-950 border-purple-300",
    pillBorder: "border-purple-400",
    accent: "text-purple-700",
    emoji: "🏆",
    pageRange: "৯৬–১০১",
  },
};

// 🌟 স্পেশাল পেজ ডেটা (কভার, গেমস, চার্ট, সনদ)
export const SPECIAL_PAGES = {
  // পৃষ্ঠা ১: প্রচ্ছদ (Cover)
  1: {
    type: "cover",
    titleBn: "মক্তব শিক্ষা পাঠ্যপাঠিকা",
    subtitleBn: "হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত",
    classesCountText: "৭৮টি সুশৃঙ্খল ক্লাস",
    ageRangeText: "৫–১২ বছর বয়সীদের জন্য",
    taglineBn: "📖 ছবি • রঙ • চার্ট • অনুশীলনী — শিক্ষক ও ছাত্র দুজনের জন্য",
  },

  // পৃষ্ঠা ৩: ব্যবহারের নিয়ম
  3: {
    type: "rules",
    titleBn: "কীভাবে ব্যবহার করবেন — শিক্ষক ও অভিভাবকের জন্য",
    items: [
      { icon: "🧒", title: "ছাত্রের জন্য", desc: "প্রতিদিন ১টি পাতা। ওপরে 'আজকের লক্ষ্য', মাঝে বড় পাঠ, নিচে অনুশীলনী। পারলে ⭐ বক্সে ✓ দাও।" },
      { icon: "👩‍🏫", title: "শিক্ষকের জন্য", desc: "প্রতি পাতার নিচে ধূসর বক্সে করণীয়, প্রশ্ন ও 'পরের ক্লাসে যাওয়ার শর্ত' আছে। শর্ত পূরণ না হলে একই ক্লাস আবার নিন।" },
      { icon: "🔁", title: "ক্লাস নম্বর ≠ দিন", desc: "ক্লাস মানে ধাপ, দিন নয়। ছাত্র না বুঝলে একই ক্লাস একাধিক দিন চলবে।" },
      { icon: "🎯", title: "বয়স ৫–১২", desc: "ছোটরা শুধু বড় হরফ ও রঙ দেখে শুনে শিখবে; বড়রা অনুশীলনীর লেখা ও ভুল-খাতা নিজে ব্যবহার করবে।" },
      { icon: "✏️", title: "রঙের নিয়ম", desc: "হরকত সব জায়গায় একই রঙের বক্সে: জবর 🔵, যের 🟠, পেশ 🟣।" },
    ],
  },

  // পৃষ্ঠা ৫: চিহ্ন ও রঙ-সংকেত (Color code reference)
  5: {
    type: "color-code",
    titleBn: "চিহ্ন ও রঙ-সংকেত",
    subtitleBn: "সারা বইয়ে একই রঙ, একই চিহ্ন",
    cards: [
      { ar: "جَ", nameBn: "জবর", ruleBn: "ওপরে ছোট দাঁড়ি", soundBn: "আ", colorTag: "jabar", color: "blue", border: "border-blue-400", bg: "bg-blue-50" },
      { ar: "جِ", nameBn: "যের", ruleBn: "নিচে ছোট দাঁড়ি", soundBn: "ই", colorTag: "zer", color: "orange", border: "border-orange-400", bg: "bg-orange-50" },
      { ar: "جُ", nameBn: "পেশ", ruleBn: "ওপরে ছোট গোল মাথা", soundBn: "উ", colorTag: "pesh", color: "purple", border: "border-purple-400", bg: "bg-purple-50" },
      { ar: "جً", nameBn: "দুই জবর", ruleBn: "দুটি দাঁড়ি", soundBn: "আন", colorTag: "tanween", color: "pink", border: "border-pink-400", bg: "bg-pink-50", audioStatus: "unverified" },
      { ar: "جٍ", nameBn: "দুই যের", ruleBn: "নিচে দুটি দাঁড়ি", soundBn: "ইন", colorTag: "tanween", color: "pink", border: "border-pink-400", bg: "bg-pink-50", audioStatus: "unverified" },
      { ar: "جٌ", nameBn: "দুই পেশ", ruleBn: "দুটি মাথা", soundBn: "উন", colorTag: "tanween", color: "pink", border: "border-pink-400", bg: "bg-pink-50", audioStatus: "unverified" },
      { ar: "جْ", nameBn: "সুকুন", ruleBn: "ছোট গোল চিহ্ন", soundBn: "স্থির", colorTag: "sukoon", color: "cyan", border: "border-cyan-400", bg: "bg-cyan-50" },
      { ar: "جّ", nameBn: "তাশদীদ", ruleBn: "ছোট 'শ'-এর মতো", soundBn: "দুইবার", colorTag: "tashdid", color: "teal", border: "border-teal-400", bg: "bg-teal-50", audioStatus: "unverified" },
    ],
    footerTip: "💡 ~ মানে টেনে পড়ো (মদ)। বাংলা লেখা শুধু সাহায্য।",
  },

  // পৃষ্ঠা ১৮: মজার খেলা ১ — হরফের সঙ্গে নাম মেলাও
  18: {
    type: "game",
    gameNumber: 1,
    titleBn: "মজার খেলা ১: হরফ চিনি, রেখা টানি",
    subtitleBn: "হরফের সঙ্গে নাম মেলাও — ক্লিক করে শোনো",
    pairs: [
      { ar: "ب", bn: "বা", sound: "ب" },
      { ar: "ت", bn: "তা", sound: "ت" },
      { ar: "ث", bn: "ছা", sound: "ث" },
      { ar: "ج", bn: "জীম", sound: "ج" },
      { ar: "ح", bn: "হা", sound: "ح" },
      { ar: "خ", bn: "খা", sound: "خ" },
      { ar: "د", bn: "দাল", sound: "د" },
      { ar: "ذ", bn: "যাল", sound: "ذ" },
    ],
    riddles: [
      { q: "আমার নিচে ১টি বিন্দু। আমি কে?", options: ["ب", "ت", "ث", "ج"], correct: "ب" },
      { q: "আমার ওপরে ২টি বিন্দু। আমি কে?", options: ["ب", "ت", "ث", "ج"], correct: "ت" },
      { q: "আমার ওপরে ৩টি বিন্দু। আমি কে?", options: ["ب", "ت", "ث", "ج"], correct: "ث" },
      { q: "আমার পেটের ভেতরে ১টি বিন্দু। আমি কে?", options: ["ب", "ت", "ث", "ج"], correct: "ج" },
    ],
  },

  // পৃষ্ঠা ৩৯: মজার খেলা ২ — হরকত চিনে রঙ করি
  39: {
    type: "game",
    gameNumber: 2,
    titleBn: "মজার খেলা ২: হরকত চিনে রঙ করি",
    subtitleBn: "🔵 জবর, 🟠 যের, 🟣 পেশ",
    items: [
      { ar: "بَ", expected: "jabar", nameBn: "বা জবর বা" },
      { ar: "تِ", expected: "zer", nameBn: "তা যের তি" },
      { ar: "ثُ", expected: "pesh", nameBn: "ছা পেশ ছু" },
      { ar: "جَ", expected: "jabar", nameBn: "জীম জবর জা" },
      { ar: "حِ", expected: "zer", nameBn: "হা যের হি" },
      { ar: "خُ", expected: "pesh", nameBn: "খা পেশ খু" },
      { ar: "دَ", expected: "jabar", nameBn: "দাল জবর দা" },
      { ar: "رِ", expected: "zer", nameBn: "রা যের রি" },
      { ar: "سُ", expected: "pesh", nameBn: "সীন পেশ সু" },
      { ar: "كَ", expected: "jabar", nameBn: "কাফ জবর কা" },
      { ar: "مِ", expected: "zer", nameBn: "মীম যের মি" },
      { ar: "نُ", expected: "pesh", nameBn: "নূন পেশ নু" },
    ],
    oddOneOut: [
      { row: ["بَ", "بَ", "بِ", "بَ"], oddIndex: 2, ruleBn: "যের আলাদা" },
      { row: ["تُ", "تُ", "تُ", "تَ"], oddIndex: 3, ruleBn: "জবর আলাদা" },
      { row: ["سِ", "سَ", "سِ", "سِ"], oddIndex: 1, ruleBn: "জবর আলাদা" },
    ],
  },

  // পৃষ্ঠা ৫৬: মজার খেলা ৩ — নিয়ম-বিঙ্গো
  56: {
    type: "game",
    gameNumber: 3,
    titleBn: "মজার খেলা ৩: নিয়ম-বিঙ্গো",
    subtitleBn: "সুকুন, তাশদীদ, মদ, তানবিন, ক্বলক্বলা, লীন ও গুন্নাহ",
    bingoWords: [
      { ar: "قُلْ", rule: "সুকুন", sound: "قُلْ" },
      { ar: "رَبِّ", rule: "তাশদীদ", sound: "رَبِّ" },
      { ar: "مِنْ", rule: "সুকুন", sound: "مِنْ", audioStatus: "unverified" },
      { ar: "إِنَّ", rule: "ওয়াজিব গুন্নাহ", sound: "إِنَّ" },
      { ar: "قَالَ", rule: "মদ", sound: "قَالَ" },
      { ar: "عَلِيمٌ", rule: "তানবিন", sound: "عَلِيمٌ" },
      { ar: "يَجْعَلْ", rule: "ক্বলক্বলা", sound: "يَجْعَلْ" },
      { ar: "خَوْفٍ", rule: "লীন", sound: "خَوْفٍ" },
      { ar: "بَيْتٍ", rule: "লীন", sound: "بَيْتٍ" },
      { ar: "نَصْرُ", rule: "সুকুন", sound: "نَصْرُ" },
      { ar: "حَكِيمًا", rule: "তানবিন", sound: "حَكِيمًا" },
      { ar: "ثُمَّ", rule: "ওয়াজিব গুন্নাহ", sound: "ثُمَّ" },
      { ar: "قِيلَ", rule: "মদ", sound: "قِيلَ" },
      { ar: "أَحَدٌ", rule: "তানবিন", sound: "أَحَدٌ" },
      { ar: "لَمْ", rule: "সুকুন", sound: "لَمْ" },
      { ar: "يَقُولُ", rule: "মদ", sound: "يَقُولُ" },
    ],
  },

  // পৃষ্ঠা ৮৮: মজার খেলা ৪ — সূরাগুলো চিনি
  88: {
    type: "game",
    gameNumber: 4,
    titleBn: "মজার খেলা ৪: শেষ ১০টি ছোট সূরা চিনি",
    subtitleBn: "সূরার প্রথম আয়াত ও আয়াত সংখ্যা",
    surahs: [
      { nameBn: "সূরা আল-ফীল", firstAyah: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", count: "৫", ref: { surah: 105, ayah: 1 } },
      { nameBn: "সূরা কুরাইশ", firstAyah: "لِإِيلَافِ قُرَيْشٍ", count: "৪", ref: { surah: 106, ayah: 1 } },
      { nameBn: "সূরা আল-মাউন", firstAyah: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", count: "৭", ref: { surah: 107, ayah: 1 } },
      { nameBn: "সূরা আল-কাওসার", firstAyah: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", count: "৩", ref: { surah: 108, ayah: 1 } },
      { nameBn: "সূরা আল-কাফিরুন", firstAyah: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", count: "৬", ref: { surah: 109, ayah: 1 } },
      { nameBn: "সূরা আন-নাসর", firstAyah: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", count: "৩", ref: { surah: 110, ayah: 1 } },
      { nameBn: "সূরা আল-লাহাব", firstAyah: "تَبَّتْ যَدَا أَبِي لَهَبٍ وَتَبَّ", count: "৫", ref: { surah: 111, ayah: 1 } },
      { nameBn: "সূরা আল-ইখলাস", firstAyah: "قُلْ هُوَ اللَّهُ أَحَدٌ", count: "৪", ref: { surah: 112, ayah: 1 } },
      { nameBn: "সূরা আল-ফালাক", firstAyah: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", count: "৫", ref: { surah: 113, ayah: 1 } },
      { nameBn: "সূরা আন-নাস", firstAyah: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", count: "৬", ref: { surah: 114, ayah: 1 } },
    ],
  },

  // পৃষ্ঠা ১০২: অগ্রগতি চার্ট
  102: {
    type: "chart",
    titleBn: "অগ্রগতি চার্ট: ৭৮টি ক্লাসের যাত্রা",
    subtitleBn: "পারলে নম্বরটি রঙ করো বা টিক দাও",
  },

  // পৃষ্ঠা ১০৩: সনদপত্র (Certificate of Completion)
  103: {
    type: "certificate",
    titleBn: "নূর কায়দা সনদপত্র",
    subtitleBn: "মক্তব শিক্ষা পাঠ্যপাঠিকার ৭৮টি ক্লাস সমাপ্তির প্রশংসাপত্র",
  },
};

// 📖 শব্দ ভেঙে ভেঙে পড়ার জন্য বিস্তারিত ডেটা (সিলেবল ক্যাপসুল)
export const BROKEN_SYLLABLES_DATA = {
  // সূরা আল-ফাতিহা ১ম ভাগ (পৃষ্ঠা ৬৮)
  fatiha_p1: [
    {
      word: "بِسْمِ",
      sound: "بِسْمِ",
      syllables: [
        { ar: "بِسْ", bn: "বিস", sound: "بِسْ" },
        { ar: "مِ", bn: "মি", sound: "مِ" },
      ],
    },
    {
      word: "اللَّهِ",
      sound: "اللَّهِ",
      syllables: [
        { ar: "ٱل", bn: "আ", sound: "اَ" },
        { ar: "لَّٰ", bn: "ল্লা~", sound: "لَّٰ" },
        { ar: "هِ", bn: "হি", sound: "هِ" },
      ],
    },
    {
      word: "الرَّحْمَٰنِ",
      sound: "الرَّحْمَٰنِ",
      syllables: [
        { ar: "ٱل", bn: "আ", sound: "اَ" },
        { ar: "رَّحْ", bn: "র্রাহ", sound: "رَّحْ" },
        { ar: "مَٰ", bn: "মা~", sound: "مَٰ" },
        { ar: "نِ", bn: "নি", sound: "نِ" },
      ],
    },
    {
      word: "الرَّحِيمِ",
      sound: "الرَّحِيمِ",
      syllables: [
        { ar: "ٱل", bn: "আ", sound: "اَ" },
        { ar: "رَّ", bn: "র্রা", sound: "رَّ" },
        { ar: "حِي", bn: "হী~", sound: "حِي" },
        { ar: "مِ", bn: "মি", sound: "مِ" },
      ],
    },
    {
      word: "الْحَمْدُ",
      sound: "الْحَمْدُ",
      syllables: [
        { ar: "ٱلْ", bn: "আল", sound: "الْ" },
        { ar: "حَمْ", bn: "হাম", sound: "حَمْ" },
        { ar: "دُ", bn: "দু", sound: "دُ" },
      ],
    },
    {
      word: "لِلَّهِ",
      sound: "لِلَّهِ",
      syllables: [
        { ar: "لِ", bn: "লি", sound: "لِ" },
        { ar: "لَّٰ", bn: "ল্লা~", sound: "لَّٰ" },
        { ar: "هِ", bn: "হি", sound: "هِ" },
      ],
    },
    {
      word: "رَبِّ",
      sound: "رَبِّ",
      syllables: [
        { ar: "رَ", bn: "রা", sound: "رَ" },
        { ar: "بِّ", bn: "ব্বি", sound: "بِّ" },
      ],
    },
    {
      word: "الْعَالَمِينَ",
      sound: "الْعَالَمِينَ",
      syllables: [
        { ar: "ٱلْ", bn: "আল", sound: "الْ" },
        { ar: "عَٰ", bn: "‘আ~", sound: "عَٰ" },
        { ar: "لَ", bn: "লা", sound: "لَ" },
        { ar: "مِي", bn: "মী~", sound: "مِي" },
        { ar: "نَ", bn: "না", sound: "نَ" },
      ],
    },
  ],

  // সূরা আল-ফীল (পৃষ্ঠা ৭৪)
  surah_105: [
    {
      word: "أَلَمْ",
      sound: "أَلَمْ",
      syllables: [
        { ar: "أَ", bn: "আ", sound: "أَ" },
        { ar: "لَمْ", bn: "লাম", sound: "لَمْ" },
      ],
    },
    {
      word: "تَرَ",
      sound: "تَرَ",
      syllables: [
        { ar: "تَ", bn: "তা", sound: "تَ" },
        { ar: "رَ", bn: "রা", sound: "رَ" },
      ],
    },
    {
      word: "كَيْفَ",
      sound: "كَيْفَ",
      syllables: [
        { ar: "كَيْ", bn: "কাই", sound: "كَيْ" },
        { ar: "فَ", bn: "ফা", sound: "فَ" },
      ],
    },
    {
      word: "فَعَلَ",
      sound: "فَعَلَ",
      syllables: [
        { ar: "فَ", bn: "ফা", sound: "فَ" },
        { ar: "عَ", bn: "‘আ", sound: "عَ" },
        { ar: "لَ", bn: "লা", sound: "لَ" },
      ],
    },
    {
      word: "رَبُّكَ",
      sound: "رَبُّكَ",
      syllables: [
        { ar: "رَ", bn: "রা", sound: "رَ" },
        { ar: "بُّ", bn: "ব্বু", sound: "بُّ" },
        { ar: "كَ", bn: "কা", sound: "كَ" },
      ],
    },
    {
      word: "بِأَصْحَابِ",
      sound: "بِأَصْحَابِ",
      syllables: [
        { ar: "بِ", bn: "বি", sound: "بِ" },
        { ar: "أَصْ", bn: "আছ", sound: "أَصْ" },
        { ar: "حَٰ", bn: "হা~", sound: "حَٰ" },
        { ar: "بِ", bn: "বি", sound: "بِ" },
      ],
    },
    {
      word: "الْفِيلِ",
      sound: "الْفِيلِ",
      syllables: [
        { ar: "ٱلْ", bn: "আল", sound: "الْ" },
        { ar: "فِي", bn: "ফী~", sound: "فِي" },
        { ar: "لِ", bn: "লি", sound: "لِ" },
      ],
    },
  ],

  // সূরা আল-ইখলাস (পৃষ্ঠা ৮২)
  surah_112: [
    {
      word: "قُلْ",
      sound: "قُلْ",
      syllables: [{ ar: "قُلْ", bn: "ক্বুল", sound: "قُلْ" }],
    },
    {
      word: "هُوَ",
      sound: "هُوَ",
      syllables: [
        { ar: "هُ", bn: "হু", sound: "هُ" },
        { ar: "وَ", bn: "ওয়া", sound: "وَ" },
      ],
    },
    {
      word: "اللَّهُ",
      sound: "اللَّهُ",
      syllables: [
        { ar: "ٱل", bn: "আ", sound: "اَ" },
        { ar: "لَّٰ", bn: "ল্লা~", sound: "لَّٰ" },
        { ar: "هُ", bn: "হু", sound: "هُ" },
      ],
    },
    {
      word: "أَحَدٌ",
      sound: "أَحَدٌ",
      syllables: [
        { ar: "أَ", bn: "আ", sound: "أَ" },
        { ar: "حَ", bn: "হা", sound: "حَ" },
        { ar: "দٌ", bn: "দুন", sound: "دٌ" },
      ],
    },
    {
      word: "الصَّمَدُ",
      sound: "الصَّمَدُ",
      syllables: [
        { ar: "ٱل", bn: "আ", sound: "اَ" },
        { ar: "صَّ", bn: "ছ্ছা", sound: "صَّ" },
        { ar: "مَ", bn: "মা", sound: "مَ" },
        { ar: "দُ", bn: "দু", sound: "دُ" },
      ],
    },
    {
      word: "لَمْ",
      sound: "لَمْ",
      syllables: [{ ar: "لَمْ", bn: "লাম", sound: "لَمْ" }],
    },
    {
      word: "يَلِدْ",
      sound: "يَلِدْ",
      syllables: [
        { ar: "يَ", bn: "য়া", sound: "يَ" },
        { ar: "لِدْ", bn: "লিদ", sound: "لِدْ" },
      ],
    },
    {
      word: "وَلَمْ",
      sound: "وَلَمْ",
      syllables: [
        { ar: "وَ", bn: "ওয়া", sound: "وَ" },
        { ar: "لَمْ", bn: "লাম", sound: "لَمْ" },
      ],
    },
    {
      word: "يُولَدْ",
      sound: "يُولَدْ",
      syllables: [
        { ar: "يُو", bn: "য়ূ~", sound: "يُو" },
        { ar: "لَدْ", bn: "লাদ", sound: "لَدْ" },
      ],
    },
    {
      word: "وَلَمْ",
      sound: "وَلَمْ",
      syllables: [
        { ar: "وَ", bn: "ওয়া", sound: "وَ" },
        { ar: "لَمْ", bn: "লাম", sound: "لَمْ" },
      ],
    },
    {
      word: "يَكُن",
      sound: "يَكُن",
      syllables: [
        { ar: "يَ", bn: "য়া", sound: "يَ" },
        { ar: "كُن", bn: "কুন", sound: "كُن" },
      ],
    },
    {
      word: "لَّهُ",
      sound: "لَّهُ",
      syllables: [
        { ar: "لَّ", bn: "ল্লা", sound: "لَّ" },
        { ar: "هُ", bn: "হু", sound: "هُ" },
      ],
    },
    {
      word: "كُفُوًا",
      sound: "كُفُوًا",
      syllables: [
        { ar: "كُ", bn: "কু", sound: "كُ" },
        { ar: "فُ", bn: "ফু", sound: "فُ" },
        { ar: "وًا", bn: "ওয়ান", sound: "وًا" },
      ],
    },
    {
      word: "أَحَدٌ",
      sound: "أَحَدٌ",
      syllables: [
        { ar: "أَ", bn: "আ", sound: "أَ" },
        { ar: "حَ", bn: "হা", sound: "حَ" },
        { ar: "দٌ", bn: "দুন", sound: "দٌ" },
      ],
    },
  ],
};
