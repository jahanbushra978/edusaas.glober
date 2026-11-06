// 🎮 Complete Progressive 14-Stage Quran Reading Curriculum for Drag & Drop Game
// Based on Authentic Rahmania Noorani Qaida & Quranic Word Recognition Progression
// From 29 Letters -> Joined Shapes -> Murakkabat -> Harakat -> 3-Letter Words ->
// Tanween -> Sukoon -> Qalqalah -> Tashdeed -> Madd/Leen -> Quran Vocabulary -> Ayah Phrases

export const DRAG_DROP_LEVELS = [
  {
    id: 1,
    title: "মৌলিক হরফ চেনা (Mufradat)",
    desc: "আরবি প্রথম ৩টি হরফ চিনে সঠিক বাক্সে মেলাও",
    tip: "আলিফ, বা এবং তা — প্রতিটি হরফের মাখরাজ ও আকৃতি আলাদা।",
    letters: [
      { ar: "ا", nameBn: "আলিফ", color: "from-emerald-500 to-teal-600", tip: "মুখের খালি জায়গা হতে ১ আলিফ খালি আওয়াজ" },
      { ar: "ب", nameBn: "বা", color: "from-amber-500 to-yellow-600", tip: "দুই ঠোঁটের ভেজা অংশ থেকে উচ্চারিত হয়" },
      { ar: "ت", nameBn: "তা", color: "from-blue-500 to-indigo-600", tip: "জিহ্বার আগা উপরের দাঁতের গোড়ায় লাগিয়ে" },
    ],
  },
  {
    id: 2,
    title: "সংযুক্ত হরফের রূপ (Letter Shapes)",
    desc: "শব্দের শুরুতে, মাঝে ও শেষে হরফের আকৃতি চিনে মেলাও",
    tip: "আরবি হরফ যুক্ত হলে মূল মাথা ঠিক রেখে শরীর পরিবর্তন করে।",
    letters: [
      { ar: "بـ", nameBn: "বা (শুরুর রূপ)", color: "from-purple-500 to-indigo-600", tip: "শব্দের শুরুতে নিচে ১ নুকতা থাকে" },
      { ar: "ـتـ", nameBn: "তা (মাঝের রূপ)", color: "from-rose-500 to-pink-600", tip: "শব্দের মাঝে দুই পাশে হাত বাড়িয়ে উপরে ২ নুকতা" },
      { ar: "ـث", nameBn: "ছা (শেষের রূপ)", color: "from-teal-500 to-emerald-600", tip: "শব্দের শেষে পূর্ণাঙ্গ বাটির রূপ নিয়ে উপরে ৩ নুকতা" },
    ],
  },
  {
    id: 3,
    title: "মুরাক্কাবাত / যুক্ত হরফ (Murakkabat)",
    desc: "দুটি হরফ জোড়া লেগে তৈরি হওয়া যুক্তাক্ষরগুলো সাজাও",
    tip: "তখতী ২: একাধিক হরফ একত্রে যুক্ত হয়ে মুরাক্কাবাত গঠন করে।",
    letters: [
      { ar: "لَا", nameBn: "লাম-আলিফ", color: "from-orange-500 to-amber-600", audio: "https://audio.qurancdn.com/wbw/002_002_002.mp3", tip: "লাম ও আলিফ একসাথে যুক্ত রূপ" },
      { ar: "بَا", nameBn: "বা-আলিফ", color: "from-cyan-500 to-blue-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter9/Page16-2.m4a", tip: "বা-এর সাথে আলিফ জুড়ে লম্বা ১ আলিফ মাদ্দ" },
      { ar: "بَلْ", nameBn: "বা-লাম (বাল)", color: "from-indigo-500 to-violet-600", audio: "https://audio.qurancdn.com/wbw/002_088_005.mp3", tip: "বা ও লাম একসাথে সংযুক্ত শব্দ" },
    ],
  },
  {
    id: 4,
    title: "হরকত পরিচিতি (Harakat: Fathah, Kasrah, Dammah)",
    desc: "যবর, যের ও পেশের ১ হরকত দ্রুত উচ্চারণ করো",
    tip: "তখতী ৪: এক যবর, এক যের, এক পেশকে হরকত বলে। হরকতের উচ্চারণ তাড়াতাড়ি পড়তে হয়।",
    letters: [
      { ar: "دَ", nameBn: "দাল যবর দা", color: "from-lime-500 to-green-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter4/Page8-8.m4a", tip: "যবর হরফের উপরে থাকে এবং 'আ'-কার দেয়" },
      { ar: "بِ", nameBn: "বা যের বি", color: "from-sky-500 to-blue-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter4/Page9-2.m4a", tip: "যের হরফের নিচে থাকে এবং 'ই'-কার দেয়" },
      { ar: "تُ", nameBn: "তা পেশ তু", color: "from-amber-500 to-yellow-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter4/Page10-3.m4a", tip: "পেশ হরফের উপরে গোল হয়ে থাকে এবং 'উ'-কার দেয়" },
    ],
  },
  {
    id: 5,
    title: "৩ হরফের পূর্ণ শব্দ (3-Letter Words)",
    desc: "হরকত মিলিয়ে কুরআন পড়ার প্রথম শব্দগুলো মেলাও",
    tip: "তখতী ৬: হরকত মিলিয়ে এক নিঃশ্বাসে না টেনে দ্রুত পড়তে হয়।",
    letters: [
      { ar: "دَرَسَ", nameBn: "দারাছা (সে পাঠ করেছে)", color: "from-purple-500 to-violet-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter6/Page13-1.m4a", tip: "দাল যবর দা, র যবর রা, সীন যবর ছা" },
      { ar: "كَتَبَ", nameBn: "কাতাবা (সে লিখেছে)", color: "from-emerald-600 to-teal-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter6/Page13-2.m4a", tip: "কাফ যবর কা, তা যবর তা, বা যবর বা" },
      { ar: "وَلَدَ", nameBn: "ওয়ালাদা (সন্তান জন্ম দিয়েছে)", color: "from-rose-500 to-pink-600", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter6/Page13-5.m4a", tip: "ওয়াও যবর ওয়া, লাম যবর লা, দাল যবর দা" },
    ],
  },
  {
    id: 6,
    title: "তানভীন পাঠ (Tanween: An, In, Un)",
    desc: "দুই যবর, দুই যের ও দুই পেশযুক্ত তানভীন মেলাও",
    tip: "তখতী ৭: দুই যবর, দুই যের, দুই পেশকে তানভীন বলে। তানভীনের মধ্যে নূন সাকিন লুকিয়ে থাকে।",
    letters: [
      { ar: "بً", nameBn: "বা দুই যবর বান", color: "from-amber-600 to-orange-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter7/Page14-1.m4a", tip: "দুই যবর উপরে নূনসহ 'আন' আওয়াজ দেয়" },
      { ar: "تٍ", nameBn: "তা দুই যের তিন", color: "from-blue-600 to-indigo-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter7/Page14-4.m4a", tip: "দুই যের নিচে নূনসহ 'ইন' আওয়াজ দেয়" },
      { ar: "ثٌ", nameBn: "ছা দুই পেশ ছুন", color: "from-emerald-600 to-teal-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter7/Page14-9.m4a", tip: "দুই পেশ উপরে নূনসহ 'উন' আওয়াজ দেয়" },
    ],
  },
  {
    id: 7,
    title: "সুকুন ও জযম পাঠ (Sukoon / Jazm)",
    desc: "জযমযুক্ত হরফকে আগের হরকতের সাথে মিলিয়ে পড়ো",
    tip: "তখতী ৮: জযমযুক্ত হরফ নিজে উচ্চারিত হতে পারে না, ডানদিকের হরকতের সাথে মিলিয়ে পড়তে হয়।",
    letters: [
      { ar: "أَبْ", nameBn: "হামযাহ-বা যবর আব", color: "from-teal-600 to-cyan-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter8/Page15-1.m4a", tip: "হামযাহ যবর আ, বা সাকিন ব — আব" },
      { ar: "رَبْ", nameBn: "রা-বা যবর রাব", color: "from-rose-600 to-pink-700", audio: "https://audio.qurancdn.com/wbw/001_002_003.mp3", tip: "রা যবর র, বা সাকিন ব — রাব" },
      { ar: "قُلْ", nameBn: "ক্বাফ-লাম পেশ ক্বুল", color: "from-amber-600 to-yellow-700", audio: "https://audio.qurancdn.com/wbw/112_001_001.mp3", tip: "ক্বাফ পেশ কু, লাম সাকিন ল — ক্বুল" },
    ],
  },
  {
    id: 8,
    title: "ক্বলক্বলাহর হরফ ও প্রতিধ্বনি (Qalqalah)",
    desc: "ক্বলক্বলাহর হরফে সাকিন হলে ধাক্কা দিয়ে প্রতিধ্বনি করো",
    tip: "ক্বলক্বলাহর হরফ ৫টি: ক্বাফ, ত্বোয়া, বা, জীম, দাল (ق ط ب ج د)। জযম হলে ধাক্কা দিতে হয়।",
    letters: [
      { ar: "أَبْ", nameBn: "আব (বা-তে ক্বলক্বলাহ)", color: "from-blue-600 to-indigo-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a", tip: "বা সাকিন অবস্থায় দুই ঠোঁট খুলে ধাক্কা খায়" },
      { ar: "فَلَقْ", nameBn: "ফালাক্ব (ক্বাফে ক্বলক্বলাহ)", color: "from-emerald-600 to-teal-700", audio: "https://audio.qurancdn.com/wbw/113_001_004.mp3", tip: "ক্বাফ সাকিন অবস্থায় কণ্ঠনালীর গোড়ায় ধাক্কা খায়" },
      { ar: "حَبْلٌ", nameBn: "হাবলুন (বা-তে ক্বলক্বলাহ)", color: "from-purple-600 to-violet-700", audio: "https://audio.qurancdn.com/wbw/111_005_002.mp3", tip: "শব্দের মাঝে বা সাকিন ধাক্কা দিয়ে ক্বলক্বলাহ" },
    ],
  },
  {
    id: 9,
    title: "তাশদীদ — দ্বিত্ব হরফ (Tashdeed)",
    desc: "তাশদীদযুক্ত হরফকে দুইবার শক্ত করে মেলাও",
    tip: "তখতী ১০: তাশদীদযুক্ত হরফ দুইবার পড়তে হয় — প্রথমটি সাকিন ও দ্বিতীয়টি হরকত দিয়ে।",
    letters: [
      { ar: "رَبِّ", nameBn: "রব্বি (রা যবর র, বা তাশদীদ)", color: "from-cyan-600 to-blue-700", audio: "https://audio.qurancdn.com/wbw/001_002_003.mp3", tip: "রা-বা যবর রব, বা যের বি — রব্বি" },
      { ar: "ثُمَّ", nameBn: "ছুম্মা (মীম মুশাদ্দাদ গুন্নাহ)", color: "from-amber-600 to-orange-700", audio: "https://audio.qurancdn.com/wbw/102_004_001.mp3", tip: "মীমের তাশদীদে ১ আলিফ পরিমাণ ওয়াজিব গুন্নাহ করতে হয়" },
      { ar: "حَقّ", nameBn: "হাক্ব (ক্বাফ তাশদীদ ওয়াকফ)", color: "from-lime-600 to-emerald-700", audio: "https://audio.qurancdn.com/wbw/002_026_015.mp3", tip: "ক্বাফ শক্তভাবে জোড়া লেগে ক্বলক্বলাহসহ থামে" },
    ],
  },
  {
    id: 10,
    title: "মাদ্দে আসলী ও লীন (Madd & Leen)",
    desc: "১ আলিফ দীর্ঘ টান ও নরম সুরের লীন অনুশীলন করো",
    tip: "তখতী ৯ ও ১১: আলিফ, ওয়াও, ইয়া মাদ্দের হরফ হলে ১ আলিফ টানতে হয়; যবরের পর ওয়াও/ইয়া হলে লীন হয়।",
    letters: [
      { ar: "بَا", nameBn: "বাআ (আলিফ মাদ্দ ১ আলিফ)", color: "from-rose-600 to-red-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter9/Page16-2.m4a", tip: "যবরের বামে খালি আলিফ থাকলে ১ আলিফ টানতে হয়" },
      { ar: "نُوحٍ", nameBn: "নূহিন (ওয়াও মাদ্দ)", color: "from-purple-600 to-indigo-700", audio: "https://audio.qurancdn.com/wbw/071_001_002.mp3", tip: "পেশের বামে জযমযুক্ত ওয়াও থাকলে ১ আলিফ টান" },
      { ar: "بَيْتٍ", nameBn: "বাইতিন (ইয়া লীন নরম সুর)", color: "from-teal-600 to-cyan-700", audio: "https://audio.qurancdn.com/wbw/106_003_003.mp3", tip: "যবরের বামে জযমযুক্ত ইয়া থাকলে নরম করে তাড়াতাড়ি পড়া" },
    ],
  },
  {
    id: 11,
    title: "কুরআনিক শব্দভাণ্ডার — সূরা ফাতিহা (Surah Al-Fatihah)",
    desc: "উম্মুল কুরআন সূরা ফাতিহার মূল শব্দগুলো চিনে মেলাও",
    tip: "পবিত্র কুরআনের প্রথম ও শ্রেষ্ঠ সূরার শব্দ চিনে সহীহভাবে পাঠ করো।",
    letters: [
      { ar: "الْحَمْدُ", nameBn: "আলহামদু (সকল প্রশংসা)", color: "from-emerald-600 to-teal-700", audio: "https://audio.qurancdn.com/wbw/001_002_001.mp3", tip: "সূরা ফাতিহা আয়াত ২: আলহামদু লিল্লাহি রব্বিল আলামীন" },
      { ar: "مَالِكِ", nameBn: "মালিকি (মালিক / অধিপতি)", color: "from-amber-600 to-orange-700", audio: "https://audio.qurancdn.com/wbw/001_004_001.mp3", tip: "সূরা ফাতিহা আয়াত ৪: মালিকি ইয়াওমিদ্দীন" },
      { ar: "يَوْمِ", nameBn: "ইয়াওমি (দিবসের)", color: "from-blue-600 to-indigo-700", audio: "https://audio.qurancdn.com/wbw/001_004_002.mp3", tip: "প্রতিদান দিবসের মালিক মহান আল্লাহ" },
    ],
  },
  {
    id: 12,
    title: "সূরা ফালাকের শব্দভাণ্ডার (Surah Al-Falaq)",
    desc: "সূরা আল-ফালাক্বের গুরুত্বপূর্ণ শব্দগুলো সাজাও",
    tip: "প্রভাতের রবের নিকট অনিষ্ট থেকে আশ্রয় প্রার্থনার পবিত্র শব্দ।",
    letters: [
      { ar: "الْفَلَقِ", nameBn: "আল-ফালাক্বি (প্রভাত)", color: "from-cyan-600 to-blue-700", audio: "https://audio.qurancdn.com/wbw/113_001_004.mp3", tip: "সূরা ফালাক্ব আয়াত ১: ক্বুল আউযু বি-রব্বিল ফালাক্ব" },
      { ar: "غَاسِقٍ", nameBn: "গাসিক্বিন (অন্ধকার রাত)", color: "from-rose-600 to-red-700", audio: "https://audio.qurancdn.com/wbw/113_003_001.mp3", tip: "সূরা ফালাক্ব আয়াত ৩: ওয়া মিন শাররি গাসিক্বিন ইযা ওয়াক্বাব" },
      { ar: "وَقَبَ", nameBn: "ওয়াক্বাবা (যখন তা আচ্ছন্ন হয়)", color: "from-purple-600 to-violet-700", audio: "https://audio.qurancdn.com/wbw/113_003_003.mp3", tip: "ওয়াক্বাব শব্দটির বা-তে ওয়াকফের ক্বলক্বলাহ হয়" },
    ],
  },
  {
    id: 13,
    title: "তাশদীদ ও ওয়াজিব গুন্নাহ — সূরা নাস (Surah An-Nas)",
    desc: "সূরা আন-নাসের তাশদীদ ও গুন্নাহযুক্ত পবিত্র শব্দ মেলাও",
    tip: "নূন মুশাদ্দাদে ১ আলিফ গুন্নাহ করে সহীহ সুর বজায় রাখা আবশ্যক।",
    letters: [
      { ar: "النَّاسِ", nameBn: "আন-নাসি (মানুষজাতি)", color: "from-purple-600 to-pink-700", audio: "https://audio.qurancdn.com/wbw/114_001_004.mp3", tip: "নূনের তাশদীদে ওয়াজিব গুন্নাহসহ পাঠ" },
      { ar: "الْوَسْوَاسِ", nameBn: "আল-ওয়াসওয়াসি (কুমন্ত্রণাদাতা)", color: "from-teal-600 to-emerald-700", audio: "https://audio.qurancdn.com/wbw/114_004_002.mp3", tip: "লুকিয়ে কুমন্ত্রণাদানকারী শয়তান থেকে আশ্রয়" },
      { ar: "شَرِّ", nameBn: "শাররি (অনিষ্ট / ক্ষতি)", color: "from-rose-600 to-red-700", audio: "https://audio.qurancdn.com/wbw/113_002_001.mp3", tip: "রা তাশদীদে যের দিয়ে শক্তভাবে উচ্চারণ" },
    ],
  },
  {
    id: 14,
    title: "পূর্ণ কুরআনিক আয়াত বাক্য গঠন (Ayah Phrase Mastery)",
    desc: "কুরআনের পূর্ণ বাক্য ও ছোট আয়াত সাজিয়ে সুপার নূর কার সম্পন্ন করো!",
    tip: "মাশাআল্লাহ! তুমি এখন পবিত্র কুরআনের একাধিক শব্দযুক্ত পূর্ণ বাক্য পড়তে সক্ষম!",
    letters: [
      { ar: "رَبِّ الْعَالَمِينَ", nameBn: "রব্বিল আলামীন (বিশ্বজগতের প্রতিপালক)", color: "from-emerald-600 to-teal-700", audio: "https://audio.qurancdn.com/wbw/001_002_003.mp3", tip: "সূরা আল-ফাতিহা আয়াত ২-এর শেষাংশ" },
      { ar: "إِيَّاكَ نَعْبُدُ", nameBn: "ইয়্যাকা নাবুদু (আমরা কেবল তোমারই ইবাদত করি)", color: "from-amber-500 to-yellow-600", audio: "https://audio.qurancdn.com/wbw/001_005_001.mp3", tip: "সূরা আল-ফাতিহা আয়াত ৫: ইয়্যাকা নাবুদু ওয়া ইয়্যাকা নাস্তাঈন" },
      { ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", nameBn: "ক্বুল হুওয়াল্লাহু আহাদ (বলুন, তিনি আল্লাহ একক)", color: "from-blue-600 to-indigo-700", audio: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3", tip: "সূরা আল-ইখলাস আয়াত ১: মহান আল্লাহর তাওহীদের ঘোষণা" },
    ],
  },
];
