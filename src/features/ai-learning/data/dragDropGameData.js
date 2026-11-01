// 🎮 Expanded Multi-Stage Levels for Drag & Drop Letter Game
// Covers all 29 Arabic Letters, Sukoon, Tashdeed, Tanween, Madd, and Ampara Words

export const DRAG_DROP_LEVELS = [
  {
    id: 1,
    title: "মৌলিক হরফ (Level 1)",
    desc: "হরফগুলো টেনে বা চাপ দিয়ে সঠিক বাক্সে মেলাও",
    letters: [
      { ar: "ا", nameBn: "আলিফ", color: "from-emerald-500 to-teal-600" },
      { ar: "ب", nameBn: "বা", color: "from-amber-500 to-yellow-600" },
      { ar: "ت", nameBn: "তা", color: "from-blue-500 to-indigo-600" },
    ],
  },
  {
    id: 2,
    title: "তিন নুকতার হরফ (Level 2)",
    desc: "ছা, জীম ও হা হরফগুলো সঠিক স্থানে বসাও",
    letters: [
      { ar: "ث", nameBn: "ছা", color: "from-purple-500 to-pink-600" },
      { ar: "ج", nameBn: "জীম", color: "from-rose-500 to-red-600" },
      { ar: "ح", nameBn: "হা", color: "from-teal-500 to-emerald-600" },
    ],
  },
  {
    id: 3,
    title: "কণ্ঠনালীর হরফ (Level 3)",
    desc: "খা, দাল ও যাল হরফগুলো মিলিয়ে নাও",
    letters: [
      { ar: "خ", nameBn: "খা", color: "from-orange-500 to-amber-600" },
      { ar: "د", nameBn: "দাল", color: "from-cyan-500 to-blue-600" },
      { ar: "ذ", nameBn: "যাল", color: "from-indigo-500 to-violet-600" },
    ],
  },
  {
    id: 4,
    title: "জিহ্বার হরফ (Level 4)",
    desc: "রা, যা ও সীন হরফের মাশক করো",
    letters: [
      { ar: "ر", nameBn: "রা", color: "from-lime-500 to-green-600" },
      { ar: "ز", nameBn: "যা", color: "from-amber-500 to-yellow-600" },
      { ar: "س", nameBn: "সীন", color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    id: 5,
    title: "ভারী হরফ (Level 5)",
    desc: "শীন, ছোয়াদ ও দোয়াদ মেলাও",
    letters: [
      { ar: "ش", nameBn: "শীন", color: "from-purple-500 to-violet-600" },
      { ar: "ص", nameBn: "ছোয়াদ", color: "from-sky-500 to-blue-600" },
      { ar: "ض", nameBn: "দোয়াদ", color: "from-rose-500 to-pink-600" },
    ],
  },
  {
    id: 6,
    title: "উন্নত মাখরাজ (Level 6)",
    desc: "ত্বোয়া, যোয়া ও আইন চিনে মেলাও",
    letters: [
      { ar: "ط", nameBn: "ত্বোয়া", color: "from-amber-600 to-orange-700" },
      { ar: "ظ", nameBn: "যোয়া", color: "from-violet-600 to-purple-700" },
      { ar: "ع", nameBn: "আইন", color: "from-emerald-600 to-teal-700" },
    ],
  },
  {
    id: 7,
    title: "কণ্ঠ ও ঠোঁটের হরফ (Level 7)",
    desc: "গাইন, ফা ও ক্বাফ মিলিয়ে নাও",
    letters: [
      { ar: "غ", nameBn: "গাইন", color: "from-teal-600 to-cyan-700" },
      { ar: "ف", nameBn: "ফা", color: "from-rose-600 to-pink-700" },
      { ar: "ق", nameBn: "ক্বাফ", color: "from-amber-600 to-yellow-700" },
    ],
  },
  {
    id: 8,
    title: "তালু ও জিহ্বার হরফ (Level 8)",
    desc: "কাফ, লাম ও মীম মেলাও",
    letters: [
      { ar: "ك", nameBn: "কাফ", color: "from-blue-600 to-indigo-700" },
      { ar: "ل", nameBn: "লাম", color: "from-emerald-600 to-teal-700" },
      { ar: "م", nameBn: "মীম", color: "from-purple-600 to-violet-700" },
    ],
  },
  {
    id: 9,
    title: "শেষ হরফসমূহ (Level 9)",
    desc: "নূন, ওয়াও ও হা মিলিয়ে নাও",
    letters: [
      { ar: "ن", nameBn: "নূন", color: "from-cyan-600 to-blue-700" },
      { ar: "و", nameBn: "ওয়াও", color: "from-amber-600 to-orange-700" },
      { ar: "هـ", nameBn: "হা (গোল)", color: "from-lime-600 to-emerald-700" },
    ],
  },
  {
    id: 10,
    title: "সম্পূর্ণ হরফমালা সমাপ্তি (Level 10)",
    desc: "হামযাহ ও ইয়া বসিয়ে ২৯ হরফ শেষ করো!",
    letters: [
      { ar: "ء", nameBn: "হামযাহ", color: "from-rose-600 to-red-700" },
      { ar: "ي", nameBn: "ইয়া", color: "from-purple-600 to-indigo-700" },
    ],
  },
  {
    id: 11,
    title: "সাকিন ও ক্বলক্বলাহ শব্দ গঠন (Level 11)",
    desc: "জযমযুক্ত ক্বলক্বলাহ শব্দগুলোর হরফ মেলাও",
    letters: [
      { ar: "قُلْ", nameBn: "ক্বুল (ক্বাফ পেশ ও লাম সাকিন)", color: "from-emerald-600 to-teal-700", audio: "https://audio.qurancdn.com/wbw/112_001_001.mp3" },
      { ar: "أَبْ", nameBn: "আব (হামযাহ যবর ও বা সাকিন ধাক্কা)", color: "from-amber-600 to-orange-700", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a" },
      { ar: "يَدْ", nameBn: "ইয়াদ (ইয়া যবর ও দাল সাকিন)", color: "from-blue-600 to-indigo-700", audio: "https://audio.qurancdn.com/wbw/111_001_001.mp3" },
    ],
  },
  {
    id: 12,
    title: "তাশদীদ ও ওয়াজিব গুন্নাহ শব্দ (Level 12)",
    desc: "তাশদীদযুক্ত দ্বিত্ব হরফ শব্দগুলো সাজাও",
    letters: [
      { ar: "رَبِّ", nameBn: "রব্বি (রা যবর ও বা তাশদীদ)", color: "from-rose-600 to-red-700", audio: "https://audio.qurancdn.com/wbw/001_002_002.mp3" },
      { ar: "إِنَّ", nameBn: "ইন্না (ওয়াজিব গুন্নাহ)", color: "from-teal-600 to-emerald-700", audio: "https://audio.qurancdn.com/wbw/108_001_001.mp3" },
      { ar: "ثُمَّ", nameBn: "ছুম্মা (মীম মুশাদ্দাদ গুন্নাহ)", color: "from-purple-600 to-violet-700", audio: "https://audio.qurancdn.com/wbw/102_004_001.mp3" },
    ],
  },
  {
    id: 13,
    title: "তানভীন শব্দ মালা (Level 13)",
    desc: "দুই যবর, দুই যের ও দুই পেশ যুক্ত শব্দ মেলাও",
    letters: [
      { ar: "أَحَدٌ", nameBn: "আহাদুন (দাল দুই পেশ দুন)", color: "from-amber-500 to-yellow-600", audio: "https://audio.qurancdn.com/wbw/112_001_004.mp3" },
      { ar: "صَمَدٌ", nameBn: "সমাদুন", color: "from-emerald-500 to-teal-600", audio: "https://audio.qurancdn.com/wbw/112_002_002.mp3" },
      { ar: "كُفُوًا", nameBn: "কুফুওয়ান (ওয়াও দুই যবর ওয়ান)", color: "from-blue-500 to-indigo-600", audio: "https://audio.qurancdn.com/wbw/112_004_003.mp3" },
    ],
  },
  {
    id: 14,
    title: "আমপারা সূরা শব্দ গঠন (Level 14)",
    desc: "সূরা আল-ফাতিহা ও আল-ফালাক্বের শব্দ চিনে মেলাও",
    letters: [
      { ar: "الْحَمْدُ", nameBn: "আলহামদু", color: "from-emerald-600 to-teal-700", audio: "https://audio.qurancdn.com/wbw/001_002_001.mp3" },
      { ar: "الْفَلَقِ", nameBn: "আল-ফালাক্বি", color: "from-cyan-600 to-blue-700", audio: "https://audio.qurancdn.com/wbw/113_001_003.mp3" },
      { ar: "النَّاسِ", nameBn: "আন-নাসি", color: "from-purple-600 to-pink-700", audio: "https://audio.qurancdn.com/wbw/114_001_003.mp3" },
    ],
  },
];

