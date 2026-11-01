// Complete verified Kids Arabic Educational Curriculum & Game Dataset
// Covers all fundamental Maktab stages: Huruf (29), Murakkabat, Harakat, Tanween, Qalqalah, Tashdeed, Madd, and Full Ampara (Juz 30)

import { AMPARA_JUZ_30_SURAHS } from "./amparaCurriculum.js";

export const KIDS_ARABIC_LETTERS = [
  {
    ar: "ا",
    nameBn: "আলিফ",
    nameEn: "Alif",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#10B981",
    isMaddVowel: true,
    shapes: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" },
    makhraj: { number: 1, zone: "Jawf", zoneBn: "মৌখিক গহ্বর (মুখের খালি জায়গা)", descriptionBn: "মুখের খালি জায়গা হইতে ১ আলিফ দীর্ঘস্বর হিসেবে উচ্চারিত হয়।" }
  },
  {
    ar: "ب",
    nameBn: "বা",
    nameEn: "Baa",
    dots: 1,
    dotPos: "bottom",
    category: "single",
    color: "#F59E0B",
    shapes: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
    makhraj: { number: 16, zone: "Shafataan", zoneBn: "দুই ঠোঁটের ভিজা অংশ", descriptionBn: "দুই ঠোঁটের ভিজা অংশ পরস্পরের সঙ্গে মিলিয়ে উচ্চারিত হয়।" }
  },
  {
    ar: "ت",
    nameBn: "তা",
    nameEn: "Taa",
    dots: 2,
    dotPos: "top",
    category: "two",
    color: "#3B82F6",
    shapes: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
    makhraj: { number: 12, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের গোড়া", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ث",
    nameBn: "ছা",
    nameEn: "Thaa",
    dots: 3,
    dotPos: "top",
    category: "three",
    color: "#8B5CF6",
    shapes: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
    makhraj: { number: 13, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের আগা", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া নরম সুরে।" }
  },
  {
    ar: "ج",
    nameBn: "জীম",
    nameEn: "Jeem",
    dots: 1,
    dotPos: "inside",
    category: "single",
    color: "#EC4899",
    shapes: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
    makhraj: { number: 7, zone: "Lisaan", zoneBn: "জিহ্বার মধ্যভাগ", descriptionBn: "জিহ্বার মধ্যভাগ তার বরাবর উপরের তালুর সঙ্গে শক্তভাবে লাগাইয়া।" }
  },
  {
    ar: "ح",
    nameBn: "হা",
    nameEn: "Haa",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#14B8A6",
    shapes: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
    makhraj: { number: 3, zone: "Halaq", zoneBn: "হলকের মধ্যভাগ", descriptionBn: "হলকের মধ্যভাগ হইতে পরিষ্কার ও শিসযুক্ত কণ্ঠে।" }
  },
  {
    ar: "خ",
    nameBn: "খা",
    nameEn: "Khaa",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#F97316",
    shapes: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
    makhraj: { number: 4, zone: "Halaq", zoneBn: "হলকের শুরুভাগ", descriptionBn: "হলকের উপরের অংশ (মুখের নিকটবর্তী) হইতে মোটা গলায়।" }
  },
  {
    ar: "د",
    nameBn: "দাল",
    nameEn: "Daal",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#06B6D4",
    shapes: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
    makhraj: { number: 12, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের গোড়া", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ذ",
    nameBn: "যাল",
    nameEn: "Dhaal",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#6366F1",
    shapes: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
    makhraj: { number: 13, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের আগা", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া নরম সুরে।" }
  },
  {
    ar: "ر",
    nameBn: "রা",
    nameEn: "Raa",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#84CC16",
    shapes: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
    makhraj: { number: 11, zone: "Lisaan", zoneBn: "জিহ্বার আগার পিঠ", descriptionBn: "জিহ্বার আগার উল্টা পিঠ তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ز",
    nameBn: "যা",
    nameEn: "Zaa",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#EAB308",
    shapes: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
    makhraj: { number: 14, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও নিচের দাঁত", descriptionBn: "জিহ্বার আগা সামনের নিচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া তীক্ষ্ণ শিসধ্বনি।" }
  },
  {
    ar: "س",
    nameBn: "সীন",
    nameEn: "Seen",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#10B981",
    shapes: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
    makhraj: { number: 14, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও নিচের দাঁত", descriptionBn: "জিহ্বার আগা সামনের নিচের দুই দাঁতের পেট ও আগার সঙ্গে লাগাইয়া স্পষ্ট শিসধ্বনি।" }
  },
  {
    ar: "ش",
    nameBn: "শীন",
    nameEn: "Sheen",
    dots: 3,
    dotPos: "top",
    category: "three",
    color: "#A855F7",
    shapes: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
    makhraj: { number: 7, zone: "Lisaan", zoneBn: "জিহ্বার মধ্যভাগ", descriptionBn: "জিহ্বার মধ্যভাগ তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া বাতাস ছড়িয়ে।" }
  },
  {
    ar: "ص",
    nameBn: "ছোয়াদ",
    nameEn: "Saad",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#0EA5E9",
    shapes: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
    makhraj: { number: 14, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও নিচের দাঁত", descriptionBn: "জিহ্বার আগা সামনের নিচের দুই দাঁতের সঙ্গে লাগাইয়া মোটা ও ভরাট শিসধ্বনি সহকারে।" }
  },
  {
    ar: "ض",
    nameBn: "দোয়াদ",
    nameEn: "Daad",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#F43F5E",
    shapes: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
    makhraj: { number: 8, zone: "Lisaan", zoneBn: "জিহ্বার গোড়ার কিনারা", descriptionBn: "জিহ্বার গোড়ার ডান বা বাম কিনারা উপরের মাড়ির দাঁতের গোড়ার সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ط",
    nameBn: "ত্বোয়া",
    nameEn: "Twaa",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#D97706",
    shapes: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
    makhraj: { number: 12, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের গোড়া", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের গোড়ার সঙ্গে লাগাইয়া অতি মোটা ও ভারী আওয়াজে।" }
  },
  {
    ar: "ظ",
    nameBn: "যোয়া",
    nameEn: "Zwaa",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#7C3AED",
    shapes: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
    makhraj: { number: 13, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও দাঁতের আগা", descriptionBn: "জিহ্বার আগা সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া মোটা ও নরম সুরে।" }
  },
  {
    ar: "ع",
    nameBn: "আইন",
    nameEn: "Ain",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#059669",
    shapes: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
    makhraj: { number: 3, zone: "Halaq", zoneBn: "হলকের মধ্যভাগ", descriptionBn: "হলকের মধ্যভাগ হইতে চাপ দিয়া গভীরভাবে।" }
  },
  {
    ar: "غ",
    nameBn: "গইন",
    nameEn: "Ghain",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#D946EF",
    shapes: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
    makhraj: { number: 4, zone: "Halaq", zoneBn: "হলকের শুরুভাগ", descriptionBn: "হলকের উপরের অংশ (মুখের নিকটবর্তী) হইতে মোটা গরগর আওয়াজে।" }
  },
  {
    ar: "ف",
    nameBn: "ফা",
    nameEn: "Faa",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#2563EB",
    shapes: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
    makhraj: { number: 15, zone: "Shafataan", zoneBn: "নিচের ঠোঁট ও উপরের দাঁত", descriptionBn: "নিচের ঠোঁটের ভেতরের পেট সামনের উপরের দুই দাঁতের আগার সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ق",
    nameBn: "ক্বাফ",
    nameEn: "Qaaf",
    dots: 2,
    dotPos: "top",
    category: "two",
    color: "#DC2626",
    shapes: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
    makhraj: { number: 5, zone: "Lisaan", zoneBn: "জিহ্বার গোড়া ও নরম তালু", descriptionBn: "জিহ্বার গোড়া তার বরাবর উপরের নরম তালুর সঙ্গে শক্তভাবে লাগাইয়া (মোটা ও ক্বলক্বলাহ)।" }
  },
  {
    ar: "ك",
    nameBn: "কাফ",
    nameEn: "Kaaf",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#0D9488",
    shapes: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
    makhraj: { number: 6, zone: "Lisaan", zoneBn: "জিহ্বার গোড়ার অগ্রভাগ", descriptionBn: "জিহ্বার গোড়া থেকে একটু আগে বাড়াইয়া শক্ত তালুর সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "ل",
    nameBn: "লাম",
    nameEn: "Laam",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#4F46E5",
    shapes: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
    makhraj: { number: 9, zone: "Lisaan", zoneBn: "জিহ্বার আগার কিনারা", descriptionBn: "জিহ্বার আগার কিনারা সামনের উপরের দাঁতের মাড়ির সঙ্গে লাগাইয়া।" }
  },
  {
    ar: "م",
    nameBn: "মীম",
    nameEn: "Meem",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#EA580C",
    shapes: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
    makhraj: { number: 16, zone: "Shafataan", zoneBn: "দুই ঠোঁটের শুষ্ক অংশ", descriptionBn: "দুই ঠোঁটের শুকনা অংশ পরস্পরের সঙ্গে মিলিয়ে।" }
  },
  {
    ar: "ن",
    nameBn: "নূন",
    nameEn: "Noon",
    dots: 1,
    dotPos: "top",
    category: "single",
    color: "#16A34A",
    shapes: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
    makhraj: { number: 10, zone: "Lisaan", zoneBn: "জিহ্বার আগা ও উপরের তালু", descriptionBn: "জিহ্বার আগা তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া (নাসারন্ধ্রের সুর সহকারে)।" }
  },
  {
    ar: "و",
    nameBn: "ওয়াও",
    nameEn: "Waaw",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#CA8A04",
    shapes: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
    makhraj: { number: 16, zone: "Shafataan", zoneBn: "দুই ঠোঁট গোল করিয়া", descriptionBn: "দুই ঠোঁট গোলাকার করিয়া ফাঁক রাখিয়া উচ্চারিত হয়।" }
  },
  {
    ar: "هـ",
    nameBn: "হা",
    nameEn: "Haa",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#0284C7",
    shapes: { isolated: "هـ", initial: "هـ", medial: "ـهـ", final: "ـه" },
    makhraj: { number: 2, zone: "Halaq", zoneBn: "হলকের শেষভাগ (বুকের নিকট)", descriptionBn: "হলকের সর্বনিম্ন অংশ (বুকের নিকটবর্তী) হইতে মৃদু নিঃশ্বাসে।" }
  },
  {
    ar: "ء",
    nameBn: "হামযাহ",
    nameEn: "Hamzah",
    dots: 0,
    dotPos: "none",
    category: "dotless",
    color: "#E11D48",
    isGlottalStop: true,
    shapes: { isolated: "ء", initial: "ء", medial: "ـء", final: "ـء" },
    makhraj: { number: 2, zone: "Halaq", zoneBn: "হলকের শেষভাগ (বুকের নিকট)", descriptionBn: "হলকের সর্বনিম্ন অংশ হইতে শক্ত ঝটকা আওয়াজে উচ্চারিত হয়।" }
  },
  {
    ar: "ي",
    nameBn: "ইয়া",
    nameEn: "Yaa",
    dots: 2,
    dotPos: "bottom",
    category: "two",
    color: "#9333EA",
    shapes: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
    makhraj: { number: 7, zone: "Lisaan", zoneBn: "জিহ্বার মধ্যভাগ", descriptionBn: "জিহ্বার মধ্যভাগ তার বরাবর উপরের তালুর সঙ্গে লাগাইয়া।" }
  }
];

// Classical Nuqta Taxonomy (নূরানী কায়দার নুকতা বিন্যাস)
export const NUQTA_CATEGORIES = {
  dotless: { count: 14, nameBn: "নুকতাহীন হরফ (মুহমালাহ)", letters: ["ا", "ح", "د", "ر", "س", "ص", "ط", "ع", "ك", "ل", "م", "و", "هـ", "ء"] },
  singleDot: { count: 10, nameBn: "এক নুকতাযুক্ত হরফ (মু'জামা)", letters: ["ب", "ج", "خ", "ذ", "ز", "ض", "ظ", "غ", "ف", "ن"] },
  twoDots: { count: 3, nameBn: "দুই নুকতাযুক্ত হরফ (মুসান্নাহ)", letters: ["ت", "ق", "ي"] },
  threeDots: { count: 2, nameBn: "তিন নুকতাযুক্ত হরফ (মুসাল্লাসাহ)", letters: ["ث", "ش"] }
};

export const DOT_POSITIONS_SUMMARY = {
  top: { count: 12, nameBn: "উপরে নুকতা (১২টি হরফ)", letters: ["ت", "ث", "خ", "ذ", "ز", "ش", "ض", "ظ", "غ", "ف", "ق", "ن"] },
  bottom: { count: 2, nameBn: "নিচে নুকতা (২টি হরফ)", letters: ["ب", "ي"] },
  inside: { count: 1, nameBn: "পেটের ভিতর নুকতা (১টি হরফ)", letters: ["ج"] },
  none: { count: 14, nameBn: "নুকতাহীন হরফ (১৪টি হরফ)", letters: ["ا", "ح", "د", "ر", "س", "ص", "ط", "ع", "ك", "ل", "م", "و", "هـ", "ء"] }
};

export const ALIF_HAMZAH_DISTINCTION = {
  alif: {
    symbol: "ا",
    nameBn: "আলিফ",
    ruleBn: "হরকতবিহীন খালি আলিফ সর্বদা মাদ্দ (দীর্ঘস্বর) হিসেবে ব্যবহৃত হয় এবং নিজে কোনো হরকত নেয় না।"
  },
  hamzah: {
    symbol: "ء",
    nameBn: "হামযাহ",
    ruleBn: "হলকের শেষভাগ হতে উচ্চারিত ব্যঞ্জনধ্বনি যা যবর, যের, পেশ ও জযম গ্রহণ করে।"
  }
};

export const KIDS_HARAKAT_DATA = [
  {
    id: "fathah",
    nameBn: "যবর",
    symbol: "َ",
    sample: "بَ",
    actionName: "উপরে লাফায়",
    audio: "/sounds/noorani/baa_zabar.mp3",
    color: "#F59E0B",
  },
  {
    id: "kasrah",
    nameBn: "যের",
    symbol: "ِ",
    sample: "بِ",
    actionName: "নিচে নামে",
    audio: "/sounds/noorani/baa_zer.mp3",
    color: "#3B82F6",
  },
  {
    id: "dammah",
    nameBn: "পেশ",
    symbol: "ُ",
    sample: "بُ",
    actionName: "ঘুরে গোল হয়",
    audio: "/sounds/noorani/baa_pesh.mp3",
    color: "#10B981",
  },
];

// Stage 2: মুরাক্কাবাত (যুক্তাক্ষর)
export const KIDS_MURAKKABAT_DATA = [
  { ar: "لَا", nameBn: "লাম-আলিফ", components: ["ل", "ا"], audio: "/sounds/noorani/murakkab_lam_alif.mp3", tip: "লাম ও আলিফ জোড়া লেগে তৈরি হয়।" },
  { ar: "بَا", nameBn: "বা-আলিফ", components: ["ب", "ا"], audio: "/sounds/noorani/murakkab_baa_alif.mp3", tip: "বা-এর ১ নুকতা নিচে, সাথে আলিফ উপরে।" },
  { ar: "بَلْ", nameBn: "বা-লাম", components: ["ب", "ل"], audio: "/sounds/noorani/murakkab_baa_laam.mp3", tip: "বা এবং লাম যুক্ত হয়েছে।" },
  { ar: "جَا", nameBn: "জীম-আলিফ", components: ["ج", "ا"], audio: "/sounds/noorani/murakkab_jeem_alif.mp3", tip: "জীমের পেটের নুকতা নিচে নেমে এসেছে।" },
  { ar: "تَه", nameBn: "তা-হা", components: ["ت", "ه"], audio: "/sounds/noorani/murakkab_taa_haa.mp3", tip: "তা-এর ২ নুকতা উপরে এবং গোল হা।" },
  { ar: "تَا", nameBn: "তা-আলিফ", components: ["ت", "ا"], audio: "/sounds/noorani/qari_taa_haa.m4a", tip: "তা ও আলিফ যুক্ত।" },
  { ar: "ثَا", nameBn: "ছা-আলিফ", components: ["ث", "ا"], audio: "/sounds/noorani/qari_thaa.mp3", tip: "ছা-এর ৩ নুকতা উপরে নরমভাবে পড়তে হয়।" },
  { ar: "نَا", nameBn: "নূন-আলিফ", components: ["ن", "ا"], audio: "/sounds/noorani/Page1-25.m4a", tip: "নূনের ১ নুকতা উপরে।" },
  { ar: "يَا", nameBn: "ইয়া-আলিফ", components: ["ي", "ا"], audio: "/sounds/noorani/Page1-29.m4a", tip: "ইয়ার ২ নুকতা নিচে।" },
];

// Stage 3: হরকত মাশক ড্রিল (এক আলিফও না টেনে পড়া)
export const KIDS_HARAKAT_DRILL_DATA = [
  { ar: "بَ", nameBn: "বা যবর বা", harakat: "যবর", base: "ب", audio: "/sounds/noorani/baa_zabar.mp3" },
  { ar: "بِ", nameBn: "বা যের বি", harakat: "যের", base: "ب", audio: "/sounds/noorani/baa_zer.mp3" },
  { ar: "بُ", nameBn: "বা পেশ বু", harakat: "পেশ", base: "ب", audio: "/sounds/noorani/baa_pesh.mp3" },
  { ar: "تَ", nameBn: "তা যবর তা", harakat: "যবর", base: "ت", audio: "/sounds/noorani/taa_zabar.mp3" },
  { ar: "تِ", nameBn: "তা যের তি", harakat: "যের", base: "ت", audio: "/sounds/noorani/taa_zer.mp3" },
  { ar: "تُ", nameBn: "তা পেশ তু", harakat: "পেশ", base: "ت", audio: "/sounds/noorani/taa_pesh.mp3" },
  { ar: "ثَ", nameBn: "ছা যবর ছা", harakat: "যবর", base: "ث", audio: "/sounds/noorani/thaa_zabar.mp3" },
  { ar: "ثِ", nameBn: "ছা যের ছি", harakat: "যের", base: "ث", audio: "/sounds/noorani/thaa_zer.mp3" },
  { ar: "ثُ", nameBn: "ছা পেশ ছু", harakat: "পেশ", base: "ث", audio: "/sounds/noorani/thaa_pesh.mp3" },
  { ar: "جَ", nameBn: "জীম যবর জা", harakat: "যবর", base: "ج", audio: "/sounds/noorani/jeem_zabar.mp3" },
  { ar: "جِ", nameBn: "জীম যের জি", harakat: "যের", base: "ج", audio: "/sounds/noorani/jeem_zer.mp3" },
  { ar: "جُ", nameBn: "জীম পেশ জু", harakat: "পেশ", base: "ج", audio: "/sounds/noorani/jeem_pesh.mp3" },
  { ar: "دَ", nameBn: "দাল যবর দা", harakat: "যবর", base: "د", audio: "/sounds/noorani/Page1-8.m4a" },
  { ar: "رَ", nameBn: "রা যবর র (মোটা)", harakat: "যবর", base: "ر", audio: "/sounds/noorani/Page1-10.m4a" },
  { ar: "مَ", nameBn: "মীম যবর মা", harakat: "যবর", base: "م", audio: "/sounds/noorani/Page1-24.m4a" },
];

// Stage 4: তানভীন শিক্ষা (দুই যবর, দুই যের, দুই পেশ)
export const KIDS_TANWEEN_DATA = [
  { ar: "بً", nameBn: "বা দুই যবর বান", symbol: "ً", type: "দুই যবর", sound: "বান", base: "ب" },
  { ar: "بٍ", nameBn: "বা দুই যের বিন", symbol: "ٍ", type: "দুই যের", sound: "বিন", base: "ب" },
  { ar: "بٌ", nameBn: "বা দুই পেশ বুন", symbol: "ٌ", type: "দুই পেশ", sound: "বুন", base: "ب" },
  { ar: "تً", nameBn: "তা দুই যবর তান", symbol: "ً", type: "দুই যবর", sound: "তান", base: "ت" },
  { ar: "تٍ", nameBn: "তা দুই যের তিন", symbol: "ٍ", type: "দুই যের", sound: "তিন", base: "ت" },
  { ar: "تٌ", nameBn: "তা দুই পেশ তুন", symbol: "ٌ", type: "দুই পেশ", sound: "তুন", base: "ت" },
  { ar: "مً", nameBn: "মীম দুই যবর মান", symbol: "ً", type: "দুই যবর", sound: "মান", base: "م" },
  { ar: "مٍ", nameBn: "মীম দুই যের মিন", symbol: "ٍ", type: "দুই যের", sound: "মিন", base: "م" },
  { ar: "مٌ", nameBn: "মীম দুই পেশ মুন", symbol: "ٌ", type: "দুই পেশ", sound: "মুন", base: "م" },
];

// Stage 5: জযম ও ক্বলক্বলাহ (ধাক্কা ধ্বনি)
export const KIDS_JAZM_QALQALAH_DATA = [
  { ar: "أَقْ", nameBn: "আক্ব (ক্বলক্বলাহ)", isQalqalah: true, letter: "ق", audio: "/sounds/noorani/qari_aq.wav", tip: "ক্বাফ-এ জযম হলে প্রতিধ্বনি বা ধাক্কা দিয়ে পড়তে হয়।" },
  { ar: "أَطْ", nameBn: "আত্ব (ক্বলক্বলাহ)", isQalqalah: true, letter: "ط", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page20-13.m4a", tip: "ত্বোয়া হরফে প্রতিধ্বনি হয়।" },
  { ar: "أَبْ", nameBn: "আব (ক্বলক্বলাহ)", isQalqalah: true, letter: "ب", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a", tip: "বা হরফে ধাক্কা লাগে।" },
  { ar: "أَجْ", nameBn: "আজ (ক্বলক্বলাহ)", isQalqalah: true, letter: "ج", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-10.m4a", tip: "জীম হরফে ক্বলক্বলাহ।" },
  { ar: "أَدْ", nameBn: "আদ (ক্বলক্বলাহ)", isQalqalah: true, letter: "د", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-19.m4a", tip: "দাল হরফে ক্বলক্বলাহ।" },
];

// Stage 6: ছোট সূরা তিলাওয়াত (আমপারা মাশক)
export const KIDS_SURAHS_DATA = AMPARA_JUZ_30_SURAHS;

export const KIDS_TASHDEED_DATA = [
  { ar: "إِنَّ", nameBn: "ইন্না (ওয়াজিব গুন্নাহ)", isGhunnah: true, audio: "https://audio.qurancdn.com/wbw/108_001_001.mp3", tip: "নূনে তাশদীদ হলে ১ আলিফ পরিমাণ সময় নাক দিয়ে গুন্নাহ করে পড়তে হয়।" },
  { ar: "ثُمَّ", nameBn: "ছুম্মা (ওয়াজিব গুন্নাহ)", isGhunnah: true, audio: "https://audio.qurancdn.com/wbw/102_004_001.mp3", tip: "মীমে তাশদীদ হলেও ওয়াজিব গুন্নাহ করতে হয়।" },
  { ar: "رَبِّ", nameBn: "রব্বি", audio: "https://audio.qurancdn.com/wbw/001_002_002.mp3", tip: "তাশদীদযুক্ত হরফ শক্ত করে দুইবার পড়তে হয়।" },
  { ar: "مَدَّ", nameBn: "মাদ্দা", audio: "https://audio.qurancdn.com/wbw/025_045_005.mp3", tip: "প্রথমে সাকিন মিলন, পরে যবর দিয়ে উচ্চারণ।" },
  { ar: "حَقَّ", nameBn: "হাক্বক্বা", audio: "https://audio.qurancdn.com/wbw/022_074_002.mp3", tip: "ক্বাফ হরফে তাশদীদ শক্তভাবে আদায় করতে হয়।" },
  { ar: "عَدَّ", nameBn: "আদ্দা", audio: "https://audio.qurancdn.com/wbw/019_094_003.mp3", tip: "আইন যবর আ, দাল তাশদীদ দা।" },
];

// Stage 7: মাদ্দে আসলী (১ আলিফ টেনে পড়া - তখতী ৭ ও ৮)
export const KIDS_MADD_DATA = [
  { ar: "بَا", nameBn: "বা-আলিফ (বাআ)", maddLetter: "ا", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-26.m4a", tip: "যবরের বামে খালি আলিফ থাকলে ১ আলিফ টেনে পড়তে হয়।" },
  { ar: "بُو", nameBn: "বা-ওয়াও (বূ)", maddLetter: "و", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-27.m4a", tip: "পেশের বামে জযমওয়ালা ওয়াও থাকলে ১ আলিফ টানতে হয়।" },
  { ar: "بِي", nameBn: "বা-ইয়া (বী)", maddLetter: "ي", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-28.m4a", tip: "যেরের বামে জযমওয়ালা ইয়া থাকলে ১ আলিফ টানতে হয়।" },
  { ar: "نُوحِيهَا", nameBn: "নূ-হী-হা (৩ মাদ্দ)", audio: "https://audio.qurancdn.com/wbw/011_049_003.mp3", tip: "এই শব্দটিতে ৩টি মাদ্দের হরফই একত্রে এসেছে (নূ, হী, হা)।" },
  { ar: "قَالَ", nameBn: "ক্বা-লা", audio: "https://audio.qurancdn.com/wbw/002_030_006.mp3", tip: "ক্বাফ আলিফ যবর ক্বা, লাম যবর লা।" },
  { ar: "يَقُولُ", nameBn: "ইয়া-কূ-লু", audio: "https://audio.qurancdn.com/wbw/002_008_002.mp3", tip: "ক্বাফ ওয়াও পেশ কূ ১ আলিফ টানতে হবে।" },
];

// Stages Definition for Kids Stage Selector
// Stages Definition for Kids Stage Selector (Comprehensive Maktab Curriculum: Zero to Quran Reading)
export const KIDS_CURRICULUM_STAGES = [
  {
    id: "stage-huruf",
    number: "১",
    titleBn: "হরফ শিক্ষা (২৯টি হরফ)",
    subTitleBn: "আলিফ থেকে ইয়া খাঁটি মাখরাজে চেনা ও পড়া",
    icon: "ا",
    color: "mint",
    itemCount: 29,
    minStarsToUnlock: 0,
    desc: "আরবি ২৯টি একক হরফের সঠিক নাম ও বিশুদ্ধ উচ্চারণ মাশক।"
  },
  {
    id: "stage-murakkabat",
    number: "২",
    titleBn: "যুক্তাক্ষর (মুরাক্কাবাত)",
    subTitleBn: "হরফের শুরু, মধ্য ও শেষ রূপ চেনা",
    icon: "لَا",
    color: "amber",
    itemCount: 9,
    minStarsToUnlock: 10,
    desc: "হরফগুলো যখন একসাথে জোড়া লাগে তখন কেমন দেখায় তা চেনা।"
  },
  {
    id: "stage-harakat",
    number: "৩",
    titleBn: "হরকত (যবর, যের, পেশ)",
    subTitleBn: "এক আলিফও না টেনে দ্রুত পড়া (আ, ই, উ)",
    icon: "بَ",
    color: "sky",
    itemCount: 15,
    minStarsToUnlock: 20,
    desc: "স্বল্প স্বরধ্বনি: যবর (উপরে), যের (নিচে) ও পেশ (উপরে গোল)।"
  },
  {
    id: "stage-tanween",
    number: "৪",
    titleBn: "তানভীন (দুই যবর, দুই যের, দুই পেশ)",
    subTitleBn: "নূন সাকিনের মতো পড়া (বান-বিন-বুন)",
    icon: "بً",
    color: "purple",
    itemCount: 9,
    minStarsToUnlock: 30,
    desc: "দুই যবর, দুই যের ও দুই পেশে লুকানো নূন সাকিন থাকে।"
  },
  {
    id: "stage-qalqalah",
    number: "৫",
    titleBn: "জযম ও ক্বলক্বলাহ (ধাক্কা ধ্বনি)",
    subTitleBn: "ক্বাফ, ত্বো, বা, জিম, দাল প্রতিধ্বনি",
    icon: "أَقْ",
    color: "rose",
    itemCount: 5,
    minStarsToUnlock: 40,
    desc: "সাকিন হরফকে আগের হরফের সাথে মেলানো ও ৫টি হরফে ধাক্কা দেওয়া।"
  },
  {
    id: "stage-tashdeed",
    number: "৬",
    titleBn: "তাশদীদ ও ওয়াজিব গুন্নাহ",
    subTitleBn: "দুইবার পড়া ও নূন-মীমে নাক দিয়ে গুন্নাহ",
    icon: "إِنَّ",
    color: "emerald",
    itemCount: 6,
    minStarsToUnlock: 50,
    desc: "তাশদীদযুক্ত হরফকে শক্তভাবে দুইবার পড়া।"
  },
  {
    id: "stage-madd",
    number: "৭",
    titleBn: "মাদ্দে আসলী (টেনে পড়া)",
    subTitleBn: "১ আলিফ টেনে পড়ার ৩টি হরফ (আলিফ, ওয়াও, ইয়া)",
    icon: "بَا",
    color: "blue",
    itemCount: 6,
    minStarsToUnlock: 60,
    desc: "খাড়া যবর, খাড়া যের, উল্টা পেশ ও মাদ্দের হরফে ১ আলিফ টানা।"
  },
  {
    id: "stage-surahs",
    number: "৮",
    titleBn: "আমপারা তিলাওয়াত (৩০তম পারা)",
    subTitleBn: "সূরা নাবা (৭৮) থেকে আন্-নাস (১১৪) ও ফাতিহা (মোট ৩৮টি সূরা)",
    icon: "📖",
    color: "gold",
    itemCount: 38,
    minStarsToUnlock: 70,
    desc: "কুরআনের ৩০তম পারার (আমপারা) সকল সূরার বিশুদ্ধ তিলাওয়াত ও অডিও মাশক।"
  },
];

export const KIDS_BADGES = [
  { id: "star-collector", title: "তারা সংগ্রাহক", icon: "⭐", minStars: 5, desc: "৫টি তারা জিতেছো!" },
  { id: "dot-master", title: "নুকতা মাস্টার", icon: "🔍", minStars: 10, desc: "১০টি নুকতা চিনেছো!" },
  { id: "harakat-expert", title: "হরকত ওস্তাদ", icon: "🎯", minStars: 20, desc: "যবর, যের, পেশে দক্ষ হয়েছো!" },
  { id: "sound-detective", title: "আওয়াজ গোয়েন্দা", icon: "🕵️", minStars: 30, desc: "সব আওয়াজ সঠিকভাবে মিলিয়েছো!" },
  { id: "tajweed-hero", title: "তাজবীদ হিরো", icon: "💎", minStars: 45, desc: "কলকলাহ ও গুন্নাহ চিনেছো!" },
  { id: "little-qari", title: "ছোট ক্বারী", icon: "👑", minStars: 60, desc: "আমপারার সূরা তিলাওয়াত করেছো!" },
];

// ─────────────────────────────────────────
// 1. DOT COUNT GAME LEVELS (নুকতা গণনা গেমের ৫টি স্তর)
// ─────────────────────────────────────────
export const KIDS_DOT_GAME_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: নুকতাহীন হরফ (০ নুকতা)",
    instructionBn: "কোন হরফটিতে কোনো নুকতা নেই? খুঁজে বের করো!",
    targetDots: 0,
    pool: ["ا", "ح", "د", "ر", "س", "ص", "ط", "ع", "ك", "ل", "م", "و", "هـ"],
    tipBn: "আলিফ, হা, দাল, রার শরীরে কোনো ফোঁটা বা নুকতা থাকে না।"
  },
  {
    id: 2,
    title: "লেভেল ২: ১ নুকতার হরফ",
    instructionBn: "১টি নুকতা আছে এমন হরফটি চিনে বের করো!",
    targetDots: 1,
    pool: ["ب", "ج", "خ", "ذ", "ز", "ض", "ظ", "غ", "ف", "ن"],
    tipBn: "বা-এর নিচে ১ নুকতা, খ-এর উপরে ১ নুকতা, জীমের পেটে ১ নুকতা।"
  },
  {
    id: 3,
    title: "লেভেল ৩: ২ নুকতার হরফ",
    instructionBn: "২টি নুকতাযুক্ত হরফটি বাছাই করো!",
    targetDots: 2,
    pool: ["ت", "ق", "ي"],
    tipBn: "তা-এর উপরে ২ নুকতা, ক্বাফের উপরে ২ নুকতা, ইয়ার নিচে ২ নুকতা।"
  },
  {
    id: 4,
    title: "লেভেল ৪: ৩ নুকতার হরফ",
    instructionBn: "৩টি নুকতাযুক্ত হরফটি নির্বাচন করো!",
    targetDots: 3,
    pool: ["ث", "ش"],
    tipBn: "ছা এবং শীন — এই দুটি হরফেই কেবল ৩টি করে নুকতা থাকে।"
  },
  {
    id: 5,
    title: "লেভেল ৫: নুকতা চ্যাম্পিয়ন চ্যালেঞ্জ",
    instructionBn: "স্ক্রিনের হরফটিতে কয়টি নুকতা আছে গুনে সঠিক সংখ্যাটি চাপো!",
    mixed: true,
    tipBn: "সাবধানে দেখো নুকতাটি উপরে, নিচে নাকি ভেতরে রয়েছে।"
  },
  {
    id: 6,
    title: "লেভেল ৬: নুকতার অবস্থান ও সাদৃশ্য পার্থক্য",
    instructionBn: "নিচে নাকি উপরে? নুকতার সঠিক অবস্থান চিনে হরফ পৃথক করো!",
    positionalDistinction: true,
    pairs: [
      { top: "ن", bottom: "ب", tip: "নূনের উপরে ১ নুকতা, বা-এর নিচে ১ নুকতা" },
      { top: "ت", bottom: "ي", tip: "তা-এর উপরে ২ নুকতা, ইয়ার নিচে ২ নুকতা" },
      { top: "خ", inside: "ج", none: "ح", tip: "খ-এর উপরে ১, জীমের পেটে ১, হা নুকতাহীন" },
      { top: "ش", topThree: "ث", tip: "শীন ও ছা উভয়েই ৩ নুকতা" },
    ],
    tipBn: "নুকতার সংখ্যা ও অবস্থানই হরফের মূল পরিচয়।"
  }
];

// ─────────────────────────────────────────
// 2. HARAKAT MASTER GAME LEVELS (হরকত মাস্টারের ৬টি স্তর)
// ─────────────────────────────────────────
export const KIDS_HARAKAT_GAME_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: যবর (Fathah) মাশক",
    instructionBn: "যবর হরফের উপরে থাকে এবং 'আ'-কার স্বর তৈরি করে।",
    harakat: "যবর",
    symbol: "َ",
    color: "amber",
    items: [
      { ar: "بَ", nameBn: "বা যবর বা", audio: "/sounds/noorani/baa_zabar.mp3" },
      { ar: "تَ", nameBn: "তা যবর তা", audio: "/sounds/noorani/taa_zabar.mp3" },
      { ar: "ثَ", nameBn: "ছা যবর ছা", audio: "/sounds/noorani/thaa_zabar.mp3" },
      { ar: "جَ", nameBn: "জীম যবর জা", audio: "/sounds/noorani/jeem_zabar.mp3" },
      { ar: "دَ", nameBn: "দাল যবর দা", audio: "/sounds/noorani/Page1-8.m4a" },
    ]
  },
  {
    id: 2,
    title: "লেভেল ২: যের (Kasrah) মাশক",
    instructionBn: "যের হরফের নিচে থাকে এবং 'ই'-কার স্বর তৈরি করে।",
    harakat: "যের",
    symbol: "ِ",
    color: "blue",
    items: [
      { ar: "بِ", nameBn: "বা যের বি", audio: "/sounds/noorani/baa_zer.mp3" },
      { ar: "تِ", nameBn: "তা যের তি", audio: "/sounds/noorani/taa_zer.mp3" },
      { ar: "ثِ", nameBn: "ছা যের ছি", audio: "/sounds/noorani/thaa_zer.mp3" },
      { ar: "جِ", nameBn: "জীম যের জি", audio: "/sounds/noorani/jeem_zer.mp3" },
      { ar: "دِ", nameBn: "দাল যের দি", audio: "/sounds/noorani/Page1-8.m4a" },
    ]
  },
  {
    id: 3,
    title: "লেভেল ৩: পেশ (Dammah) মাশক",
    instructionBn: "পেশ হরফের উপরে থাকে এবং 'উ'-কার স্বর তৈরি করে।",
    harakat: "পেশ",
    symbol: "ُ",
    color: "emerald",
    items: [
      { ar: "بُ", nameBn: "বা পেশ বু", audio: "/sounds/noorani/baa_pesh.mp3" },
      { ar: "تُ", nameBn: "তা পেশ তু", audio: "/sounds/noorani/taa_pesh.mp3" },
      { ar: "ثُ", nameBn: "ছা পেশ ছু", audio: "/sounds/noorani/thaa_pesh.mp3" },
      { ar: "جُ", nameBn: "জীম পেশ জু", audio: "/sounds/noorani/jeem_pesh.mp3" },
      { ar: "دُ", nameBn: "দাল পেশ দু", audio: "/sounds/noorani/Page1-8.m4a" },
    ]
  },
  {
    id: 4,
    title: "লেভেল ৪: হরকত ট্রায়ো চ্যালেঞ্জ",
    instructionBn: "আওয়াজ শুনে বলো — যবর (আ), যের (ই) নাকি পেশ (উ) বেজেছে?",
    mixed: true,
    tipBn: "হরকতের আওয়াজ এক আলিফও টানা নিষেধ, দ্রুত পড়তে হয়।"
  },
  {
    id: 5,
    title: "লেভেল ৫: তানভীন মাশক (দুই যবর, দুই যের, দুই পেশ)",
    instructionBn: "তানভীন চিনে বের করো (বান-বিন-বুন)",
    tanween: true,
    items: [
      { ar: "بً", nameBn: "বা দুই যবর বান", symbol: "ً", harakat: "দুই যবর" },
      { ar: "بٍ", nameBn: "বা দুই যের বিন", symbol: "ٍ", harakat: "দুই যের" },
      { ar: "بٌ", nameBn: "বা দুই পেশ বুন", symbol: "ٌ", harakat: "দুই পেশ" },
      { ar: "تً", nameBn: "তা দুই যবর তান", symbol: "ً", harakat: "দুই যবর" },
      { ar: "تٍ", nameBn: "তা দুই যের তিন", symbol: "ٍ", harakat: "দুই যের" },
      { ar: "تٌ", nameBn: "তা দুই পেশ তুন", symbol: "ٌ", harakat: "দুই পেশ" },
    ]
  },
  {
    id: 6,
    title: "লেভেল ৬: ৩-হরফী পূর্ণ শব্দ পাঠ (তখতী ৬)",
    instructionBn: "হরকত মিলিয়ে কুরআন পড়ার প্রথম শব্দগুলো উচ্চারণ করো!",
    words: true,
    items: [
      { ar: "دَرَسَ", nameBn: "দা-রা-সা (দারাছা)", audio: "https://audio.qurancdn.com/wbw/006_105_005.mp3", tip: "দাল যবর দা, রা যবর রা, সীন যবর সা।" },
      { ar: "وَجَدَ", nameBn: "ওয়া-জা-দা (ওয়াজাদা)", audio: "https://audio.qurancdn.com/wbw/093_007_001.mp3", tip: "ওয়াও যবর ওয়া, জীম যবর জা, দাল যবর দা।" },
      { ar: "كَتَبَ", nameBn: "কা-তা-বা (কাতাবা)", audio: "https://audio.qurancdn.com/wbw/058_021_001.mp3", tip: "কাফ যবর কা, তা যবর তা, বা যবর বা।" },
      { ar: "خَلَقَ", nameBn: "খা-লা-ক্বা (খালাক্বা)", audio: "https://audio.qurancdn.com/wbw/096_001_003.mp3", tip: "খা যবর খা, লাম যবর লা, ক্বাফ যবর ক্বা।" },
    ]
  },
  {
    id: 7,
    title: "লেভেল ৭: জযম ও ক্বলক্বলাহ শব্দ (তখতী ৮ ও ৯)",
    instructionBn: "সাকিনযুক্ত ধাক্কা ধ্বনি শনাক্ত করো ও পড়ো!",
    jazm: true,
    items: [
      { ar: "قُلْ", nameBn: "ক্বুল", audio: "https://audio.qurancdn.com/wbw/112_001_001.mp3", tip: "ক্বাফ পেশ ও লাম সাকিন" },
      { ar: "أَبْ", nameBn: "আব (ক্বলক্বলাহ ধাক্কা)", audio: "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter10/Page19-1.m4a", tip: "হামযাহ যবর ও বা সাকিন" },
      { ar: "فَلَقْ", nameBn: "ফালাক্ব (ওয়াকফ ধাক্কা)", audio: "https://audio.qurancdn.com/wbw/113_001_003.mp3", tip: "ক্বলক্বলাহ কুবরা" },
    ]
  },
  {
    id: 8,
    title: "লেভেল ৮: তাশদীদ ও ওয়াজিব গুন্নাহ (তখতী ১১ ও ১২)",
    instructionBn: "তাশদীদযুক্ত দ্বিত্ব হরফ ও গুন্নাহ মাশক করো!",
    tashdeed: true,
    items: [
      { ar: "رَبِّ", nameBn: "রব্বি", audio: "https://audio.qurancdn.com/wbw/001_002_002.mp3", tip: "রা যবর ও বা তাশদীদ" },
      { ar: "إِنَّ", nameBn: "ইন্না (১ আলিফ গুন্নাহ)", audio: "https://audio.qurancdn.com/wbw/108_001_001.mp3", tip: "নূন মুশাদ্দাদ" },
      { ar: "ثُمَّ", nameBn: "ছুম্মা (১ আলিফ গুন্নাহ)", audio: "https://audio.qurancdn.com/wbw/102_004_001.mp3", tip: "মীম মুশাদ্দাদ" },
    ]
  },
  {
    id: 9,
    title: "লেভেল ৯: মাদ্দের হরফ ও কুরআন শব্দ (তখতী ৪ ও ৭)",
    instructionBn: "১ আলিফ টেনে পড়ার মাদ্দ শব্দগুলো মেলাও!",
    madd: true,
    items: [
      { ar: "قَالَ", nameBn: "ক্ব-লা (আলিফ মাদ্দ)", audio: "https://audio.qurancdn.com/wbw/002_030_006.mp3", tip: "১ আলিফ টান" },
      { ar: "نُورٌ", nameBn: "নূ-রুন (ওয়াও মাদ্দ)", audio: "https://audio.qurancdn.com/wbw/024_035_012.mp3", tip: "১ আলিফ টান" },
      { ar: "فِيهِ", nameBn: "ফী-হি (ইয়া মাদ্দ)", audio: "https://audio.qurancdn.com/wbw/002_002_003.mp3", tip: "১ আলিফ টান" },
    ]
  }
];

// ─────────────────────────────────────────
// 3. SOUND DETECTIVE GAME LEVELS (আওয়াজ গোয়েন্দার ৫টি স্তর)
// ─────────────────────────────────────────
export const KIDS_SOUND_DETECTIVE_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: স্পষ্ট মৌলিক হরফ",
    instructionBn: "আওয়াজটি মনোযোগ দিয়ে শোনো এবং সঠিক হরফটিতে চাপো।",
    letters: ["ا", "ب", "م", "ر", "و", "د"],
    tipBn: "আলিফ, বা, মীম — স্পষ্ট উচ্চারণের হরফ।"
  },
  {
    id: 2,
    title: "লেভেল ২: কাছাকাছি মাখরাজের হরফ জোড়া",
    instructionBn: "সদৃশ হরফের সূক্ষ্ম পার্থক্য ধরতে পারো কি না দেখো!",
    similarPairs: [
      { pair: ["ت", "ط"], tip: "তা চিকন ও নরম, ত্বোয়া মোটা ও ভারী।" },
      { pair: ["س", "ص"], tip: "সীন শিসযুক্ত চিকন, ছোয়াদ শিসযুক্ত ভারী।" },
      { pair: ["د", "ض"], tip: "দাল জিহ্বার ডগায়, দোয়াদ জিহ্বার গোড়ায়।" },
      { pair: ["ك", "ق"], tip: "কাফ চিকন, ক্বাফ কণ্ঠনালীর গোড়ায় ভারী।" },
      { pair: ["ح", "هـ"], tip: "হা গলার মাঝখান থেকে, গোল হা বুকের কাছে।" },
      { pair: ["ذ", "ز"], tip: "যাল নরম হরফ, যা মধুমক্ষিকার তীক্ষ্ণ ধ্বনি।" },
    ]
  },
  {
    id: 3,
    title: "লেভেল ৩: হরকত ধ্বনি গোয়েন্দা",
    instructionBn: "কোন হরকতের উচ্চারণ বেজেছে? চিহ্নিত করো!",
    harakatPool: true,
    tipBn: "যবর (আ), যের (ই) নাকি পেশ (উ) মনোযোগ দিয়ে লক্ষ্য করো।"
  },
  {
    id: 4,
    title: "লেভেল ৪: কলকলাহ ধাক্কা ধ্বনি গোয়েন্দা",
    instructionBn: "ক্বলক্বলাহর ধাক্কা বা প্রতিধ্বনি চিনতে পারো কি না পরীক্ষা করো!",
    qalqalahPool: true,
    tipBn: "ক্বাফ, ত্বো, বা, জিম, দাল — এই ৫ হরফে জযম হলে ধাক্কা লাগে।"
  },
  {
    id: 5,
    title: "লেভেল ৫: মাস্টার অডিও গোয়েন্দা চ্যালেঞ্জ",
    instructionBn: "কুরআনের আসল শব্দ শুনে সঠিক শব্দটি বাছাই করো!",
    wordPool: true,
    tipBn: "মাশাআল্লাহ! তুমি প্রায় কুরআন পড়ার কাছাকাছি এসে গেছো!"
  },
  {
    id: 6,
    title: "লেভেল ৬: সিফাত গোয়েন্দা (হামস, সাফীর ও ইস্তি'লা)",
    instructionBn: "আওয়াজ শুনে বলো — এতে শিস (সাফীর), ফিসফিস বাতাস (হামস) নাকি মোটা আওয়াজ (ইস্তি'লা)?",
    sifatPool: true,
    challenges: [
      { letter: "ص", sifat: "সাফীর ও ইতবাক্ব", tip: "তীব্র শিস ও ভারী আওয়াজ" },
      { letter: "ش", sifat: "তাফাশশী ও হামস", tip: "মুখে বাতাস ছড়িয়ে পড়া" },
      { letter: "ط", sifat: "ইতবাক্ব ও ক্বলক্বলাহ", tip: "সবচেয়ে শক্তিশালী হরফ" },
      { letter: "س", sifat: "সাফীর", tip: "চিকন বাঁশির আওয়াজ" },
    ],
    tipBn: "সিফাত হরফের ধ্বনিগত পরিচয় ফুটিয়ে তোলে।"
  },
  {
    id: 7,
    title: "লেভেল ৭: তাজবিদ হুকুম গোয়েন্দা",
    instructionBn: "আয়াত শুনে চিহ্নিত করো — এটি কি ইযহার, ইদগাম নাকি ইক্বলাব?",
    tajweedPool: true,
    challenges: [
      { ayahAr: "مَنْ ءَامَنَ", rule: "ইযহার", tip: "স্পষ্ট উচ্চারণ, কোনো গুন্নাহ নেই" },
      { ayahAr: "مَن يَقُولُ", rule: "ইদগাম বা-গুন্নাহ", tip: "নাকের বাঁশিতে ১ আলিফ গুন্নাহ" },
      { ayahAr: "مِن بَعْدِ", rule: "ইক্বলাব", tip: "নূনকে ছোট মীমে রূপান্তর" },
    ],
    tipBn: "তাজবিদের সঠিক প্রয়োগে তিলাওয়াত সুরময় ও খাঁটি হয়।"
  }
];

// ─────────────────────────────────────────
// 4. MEMORY MATCH GAME LEVELS (মেমোরি কার্ড মেলাও স্তর)
// ─────────────────────────────────────────
export const KIDS_MEMORY_GAME_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: ছোটদের ৪ কার্ড (২ জোড়া)",
    pairsCount: 2,
    gridClass: "grid-cols-2",
    instructionBn: "একই রকম দেখতে ২টি হরফ উল্টে জোড়া মেলাও!",
    pool: ["ا", "ب", "ت", "ج"]
  },
  {
    id: 2,
    title: "লেভেল ২: ৬ কার্ড (৩ জোড়া)",
    pairsCount: 3,
    gridClass: "grid-cols-3",
    instructionBn: "৩টি জোড়া খুঁজে বের করে পয়েন্ট বাড়াও!",
    pool: ["ب", "ت", "ث", "ج", "ح", "خ"]
  },
  {
    id: 3,
    title: "লেভেল ৩: হরকত জোড়া (৮ কার্ড)",
    pairsCount: 4,
    gridClass: "grid-cols-4",
    instructionBn: "একই হরকতের জোড়া হরফ খুঁজে বের করো!",
    pool: ["بَ", "تَ", "بِ", "تِ", "بُ", "تُ"]
  },
  {
    id: 4,
    title: "লেভেল ৪: যুক্তাক্ষর মুরাক্কাবাত জোড়া (৮ কার্ড)",
    pairsCount: 4,
    gridClass: "grid-cols-4",
    instructionBn: "যুক্তাক্ষরের জোড়া মিলিয়ে মেমোরি মাস্টার হও!",
    pool: ["لَا", "بَا", "تَا", "جَا"]
  },
  {
    id: 5,
    title: "লেভেল ৫: সুপার মেমোরি চ্যাম্পিয়ন (১২ কার্ড)",
    pairsCount: 6,
    gridClass: "grid-cols-4",
    instructionBn: "খুব কম মুভে সবগুলো জোড়া মেলাও এবং ৩ তারা অর্জন করো!",
    pool: ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ر", "س", "ش", "ص"]
  },
  {
    id: 6,
    title: "লেভেল ৬: মাখরাজ ও সিফাত জোড়া (৮ কার্ড)",
    pairsCount: 4,
    gridClass: "grid-cols-4",
    instructionBn: "মাখরাজ ও সিফাত ভিত্তিক জোড়া হরফ খুঁজে মেলাও!",
    pool: ["ق", "ك", "ط", "ت", "ص", "س", "ح", "هـ"]
  },
  {
    id: 7,
    title: "লেভেল ৭: আমপারা কুরআন শব্দ জোড়া (৮ কার্ড)",
    pairsCount: 4,
    gridClass: "grid-cols-4",
    instructionBn: "কুরআনের ছোট ছোট আমপারা শব্দ জোড়া মিলিয়ে ৩ তারা পাও!",
    pool: ["الْحَمْدُ", "الْفَلَقِ", "أَحَدٌ", "الصَّمَدُ"]
  }
];

// ─────────────────────────────────────────
// 5. TRACE LETTER GROUPS (ফিঙ্গার ট্রেসিং গ্রুপ)
// ─────────────────────────────────────────
export const KIDS_TRACING_GROUPS = [
  {
    id: 1,
    title: "গ্রুপ ১: আলিফ থেকে খা (৭ হরফ)",
    letters: [
      { ar: "ا", nameBn: "আলিফ", guide: "উপর থেকে সোজা নিচে ১টি সরলরেখা নামাও।" },
      { ar: "ب", nameBn: "বা", guide: "ডান দিক থেকে বাঁয়ে বাটি বানিয়ে নিচে ১টি নুকতা দাও।" },
      { ar: "ت", nameBn: "তা", guide: "বাটির মতো এঁকে উপরে পাশাপাশি ২টি নুকতা দাও।" },
      { ar: "ث", nameBn: "ছা", guide: "বাটি এঁকে উপরে ত্রিভুজের মতো ৩টি নুকতা আঁকো।" },
      { ar: "ج", nameBn: "জীম", guide: "উপরে ঢেউ খেলিয়ে নিচে বড় পেট এঁকে পেটের ভেতর ১টি নুকতা দাও।" },
      { ar: "ح", nameBn: "হা", guide: "উপরে ঢেউ এঁকে নিচে পেট ঘোরাও, এতে কোনো নুকতা নেই।" },
      { ar: "خ", nameBn: "খা", guide: "হা-এর মতো এঁকে মাথার উপরে ১টি নুকতা দাও।" },
    ]
  },
  {
    id: 2,
    title: "গ্রুপ ২: দাল থেকে দোয়াদ (৮ হরফ)",
    letters: [
      { ar: "د", nameBn: "দাল", guide: "উপর থেকে অর্ধবৃত্তাকার করে নিচে বাঁয়ে বাঁকাও।" },
      { ar: "ذ", nameBn: "যাল", guide: "দাল এঁকে মাথার উপরে ১টি নুকতা দাও।" },
      { ar: "ر", nameBn: "রা", guide: "উপর থেকে বাঁকা হয়ে নিচে ঢালু করো।" },
      { ar: "ز", nameBn: "যা", guide: "রা-এর মতো এঁকে উপরে ১টি নুকতা দাও।" },
      { ar: "س", nameBn: "সীন", guide: "ছোট ২টি দাঁত এঁকে নিচে বড় গোল বাটি নামাও।" },
      { ar: "ش", nameBn: "শীন", guide: "সীনের মতো এঁকে উপরে ৩টি নুকতা দাও।" },
      { ar: "ص", nameBn: "ছোয়াদ", guide: "ডানে ডিম্বাকৃতি করে বাঁয়ে বড় বাটি টানো।" },
      { ar: "ض", nameBn: "দোয়াদ", guide: "ছোয়াদ এঁকে উপরে ১টি নুকতা দাও।" },
    ]
  },
  {
    id: 3,
    title: "গ্রুপ ৩: ত্বোয়া থেকে লাম (৮ হরফ)",
    letters: [
      { ar: "ط", nameBn: "ত্বোয়া", guide: "সোজা আলিফ নামিয়ে ডানে পেট ফোলাও।" },
      { ar: "ظ", nameBn: "যোয়া", guide: "ত্বোয়ার মতো এঁকে ডানে ১টি নুকতা দাও।" },
      { ar: "ع", nameBn: "আইন", guide: "ছোট অর্ধবৃত্ত এঁকে নিচে বড় পেট নামাও।" },
      { ar: "غ", nameBn: "গইন", guide: "আইন এঁকে উপরে ১টি নুকতা দাও।" },
      { ar: "ف", nameBn: "ফা", guide: "উপরে ছোট গোল মাথা করে বাঁয়ে লম্বা বাটি টানো ও ১ নুকতা দাও।" },
      { ar: "ق", nameBn: "ক্বাফ", guide: "গোল মাথা করে নিচে গভীর বাটি এঁকে ২টি নুকতা দাও।" },
      { ar: "ك", nameBn: "কাফ", guide: "বড় লাম নামিয়ে ভেতরে ছোট হামযাহ আঁকো।" },
      { ar: "ل", nameBn: "লাম", guide: "সোজা উপর থেকে এসে নিচে সুন্দর বাটি বানিয়ে তোলো।" },
    ]
  },
  {
    id: 4,
    title: "গ্রুপ ৪: মীম থেকে ইয়া (৬ হরফ)",
    letters: [
      { ar: "م", nameBn: "মীম", guide: "ছোট ত্রিভুজ করে নিচে সোজা লেজ নামাও।" },
      { ar: "ن", nameBn: "নূন", guide: "গভীর বাটি বানিয়ে মাঝখানে ১টি নুকতা বসাও।" },
      { ar: "و", nameBn: "ওয়াও", guide: "গোল মাথা করে নিচে রার মতো বাঁকাও।" },
      { ar: "هـ", nameBn: "হা", guide: "বাইরে বড় গোল করে ভেতরে ছোট বৃত্ত ঘোরাও।" },
      { ar: "ء", nameBn: "হামযাহ", guide: "ছোট বাঁকা মাথা দিয়ে নিচে ডান কোণে টান দাও।" },
      { ar: "ي", nameBn: "ইয়া", guide: "হাঁসের গলার মতো এঁকে নিচে ২টি নুকতা দাও।" },
    ]
  }
];
