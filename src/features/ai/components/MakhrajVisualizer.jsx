"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  Pause,
  Info,
  BookOpen,
  CheckCircle2,
  User,
  Layers,
  Award,
  Headphones,
  Maximize2,
  X,
  Eye,
  ImageIcon,
} from "lucide-react";
import {
  SHAYKH_REGISTRY,
  getActiveShaykhId,
  setActiveShaykhId,
  getQariAudioUrl,
} from "@/lib/ai/qari-registry";

// High-Resolution Authentic Tajweed Anatomy Illustrations
export const ORGAN_IMAGES = {
  halq: {
    src: "/images/makhraj/halq_throat.jpg",
    alt: "আল-হালক্ব (কণ্ঠনালীর মাখরাজ চিত্র)",
    titleBn: "কণ্ঠনালীর ৩টি স্তর ও ৬টি হরফ",
    titleAr: "مخارج الحلق الثلاثة (أدنى، وسط، أقصى)",
    captionBn: "আদনাল হালক্ব (غ, خ), ওয়াসাতুল হালক্ব (ع, ح), এবং আক্বসাল হালক্ব (ء, هـ)",
  },
  lisan: {
    src: "/images/makhraj/lisan_tongue.jpg",
    alt: "আল-লিসান (জিহ্বার মাখরাজ চিত্র)",
    titleBn: "জিহ্বার ১০টি মাখরাজ ও ১৮টি হরফ",
    titleAr: "مخارج اللسان وتوزيع الحروف",
    captionBn: "গোড়া (ق, ك), মধ্যভাগ (ج, ش, ي), কিনারা (ض), ও আগা (ল, ন, র, তোয়া, দাল, তা, ইত্যাদি)",
  },
  shafatan: {
    src: "/images/makhraj/shafatan_lips.jpg",
    alt: "আশ-শাফাতান (ঠোঁটের মাখরাজ চিত্র)",
    titleBn: "দুই ঠোঁটের ৪টি হরফের অঙ্গ-ভঙ্গি",
    titleAr: "مخارج الشفتين (ف، ب، م، و)",
    captionBn: "ফা (ف - নিচের ঠোঁট ও ওপরের দাঁত), বা (ب), মীম (م), ওয়াও (و - গোল ঠোঁট)",
  },
  khayshum: {
    src: "/images/makhraj/overview_sagittal.jpg",
    alt: "আল-খয়শূম (নাকের বাঁশি ও গুন্নাহ)",
    titleBn: "নাকের বাঁশি ও গুন্নাহর ধ্বনি প্রবাহ",
    titleAr: "مخرج الخيشوم وصوت الغنة",
    captionBn: "নূন ও মীমে তাশদীদ, ইদগাম ও ইখফায় ১ আলিফ পরিমাণ নাকের বাঁশিতে ধ্বনি ধারণ",
  },
  jawf: {
    src: "/images/makhraj/overview_sagittal.jpg",
    alt: "আল-জাওফ (মুখের খালি জায়গা ও মাদ্দের প্রবাহ)",
    titleBn: "মুখ ও কণ্ঠের খালি জায়গা (মাদ্দাহ)",
    titleAr: "مخرج الجوف وحروف المد الثلاثة",
    captionBn: "খালি আলিফ (ا), ওয়াও সাকিন (ـُـوْ), ইয়া সাকিন (ـِـيْ)-এর প্রলম্বিত বায়বীয় স্বর",
  },
};

// Noorani Qaida (Takhti 1: Huruf Mufradat) audio mapping
export const NOORANI_TRACK_MAP = {
  "ا": 1,
  "ب": 2,
  "ت": 3,
  "ث": 4,
  "ج": 5,
  "ح": 6,
  "خ": 7,
  "د": 8,
  "ذ": 9,
  "ر": 10,
  "ز": 11,
  "س": 12,
  "ش": 13,
  "ص": 14,
  "ض": 15,
  "ط": 16,
  "ظ": 17,
  "ع": 18,
  "غ": 19,
  "ف": 20,
  "ق": 21,
  "ك": 22,
  "ل": 23,
  "م": 24,
  "ن": 25,
  "و": 26,
  "هـ": 27,
  "ه": 27,
  "ء": 28,
  "ي": 29,
};

export const NOORANI_BASE_URL =
  "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-";

// Fallback studio soundboard map
export const ARABIC_LETTER_AUDIO_MAP = {
  "ا": "1_alif.mp3",
  "ب": "2_baa.mp3",
  "ت": "3_taa.mp3",
  "ث": "4_thaa.mp3",
  "ج": "5_jeem.mp3",
  "ح": "6_haa.mp3",
  "خ": "7_khaa.mp3",
  "د": "8_daal.mp3",
  "ذ": "9_zaal.mp3",
  "ر": "10_raa.mp3",
  "ز": "11_zaa.mp3",
  "س": "12_seen.mp3",
  "ش": "13_sheen.mp3",
  "ص": "14_saad.mp3",
  "ض": "15_daad.mp3",
  "ط": "16_taah.mp3",
  "ظ": "17_zhaa.mp3",
  "ع": "18_ain.mp3",
  "غ": "19_ghain.mp3",
  "ف": "20_faa.mp3",
  "ق": "21_qaaf.mp3",
  "ك": "22_kaaf.mp3",
  "ل": "23_laam.mp3",
  "م": "24_meem.mp3",
  "ن": "25_noon.mp3",
  "ه": "26_haah.mp3",
  "هـ": "26_haah.mp3",
  "و": "27_waw.mp3",
  "ء": "28_hamzah.mp3",
  "ي": "30_yaa.mp3",
};

export const ARABIC_AUDIO_BASE_URL =
  "https://cdn.jsdelivr.net/gh/adnan/Arabic-Alphabet@master/sounds/";

// All 29 Arabic Letters with Comprehensive Tajweed Data, Posture Guides, & Benchmark Verses
export const LETTER_MAKHRAJ_DATABASE = {
  "ا": {
    letter: "ا",
    nameBn: "আলিফ",
    nameAr: "أَلِف",
    organId: "jawf",
    organNameBn: "জাওফ (মুখের খালি জায়গা)",
    makhrajNo: 1,
    makhrajNameBn: "মুখ ও কণ্ঠনালীর খালি অংশ",
    contactAr: "الجوف (تجويف الحلق والفم)",
    postureBn: "মুখ ও কণ্ঠনালীর মধ্য দিয়ে কোনো অঙ্গ স্পর্শ না করে বায়ুর স্বাভাবিক অবাধ প্রবাহে স্বরতন্ত্রী থেকে স্বর বের হয়।",
    qaidaTrackNo: 1,
    surahNo: 1,
    ayahNo: 2,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ২",
    targetWord: "الْحَمْدُ لِلَّهِ",
    verseAr: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    verseBn: "সকল প্রশংসা আল্লাহর জন্য, যিনি সকল সৃষ্টির পালনকর্তা।",
    sifatBn: "হুরূফে মাদ্দাহ (১ আলিফ দীর্ঘ প্রলম্বিত স্বর)",
    tipsBn: "আলিফ খালি অবস্থায় তার পূর্ববর্তী হরফের যবরকে ১ আলিফ টেনে স্বাভাবিক প্রবাহে পড়তে হয়।",
  },
  "ب": {
    letter: "ب",
    nameBn: "বা",
    nameAr: "بَاء",
    organId: "shafatan",
    organNameBn: "শাফাতান (দুই ঠোঁট)",
    makhrajNo: 15,
    makhrajNameBn: "দুই ঠোঁটের ভেজা অংশ পরস্পরের সাথে মিলিয়ে",
    contactAr: "انطباق الشفتين من الجزء الرطب",
    postureBn: "দুই ঠোঁটের ভিতরের ভেজা অংশ পরস্পরের সাথে শক্তভাবে চেপে আটকে ধরে হঠাৎ ছেড়ে দিয়ে ধাক্কা সহ আদায় করতে হয়।",
    qaidaTrackNo: 2,
    surahNo: 1,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ১",
    targetWord: "بِسْمِ",
    verseAr: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    verseBn: "পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।",
    sifatBn: "জাহর, শিদ্দাহ, কলকলাহ (সাকিন অবস্থায় ধাক্কা ধ্বনি)",
    tipsBn: "দুই ঠোঁটের ভেজা অংশে চাপ দিয়ে পরিষ্কারভাবে আদায় করুন। সাকিন হলে স্পষ্ট কলকলাহ হবে।",
  },
  "ت": {
    letter: "ت",
    nameBn: "তা",
    nameAr: "تَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 11,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া",
    contactAr: "طرف اللسان مع أصول الثنايا العليا",
    postureBn: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের গোড়ার সাথে শক্তভাবে লেগে বাতাস আটকে যায়, তারপর মৃদু বাতাস (হাম্স) সহ পাতলা স্বরে উন্মুক্ত হয়।",
    qaidaTrackNo: 3,
    surahNo: 95,
    ayahNo: 1,
    surahNameBn: "সূরা আত-তীন, আয়াত ১",
    targetWord: "وَالتِّينِ",
    verseAr: "وَالتِّينِ وَالزَّيْتُونِ",
    verseBn: "শপথ ডুমুর ও জলপাইয়ের।",
    sifatBn: "হামস (মৃদু বাতাস), শিদ্দাহ, তারকীক (পাতলা)",
    tipsBn: "বাংলা 'ত' এর মতো ভারি না করে জিহ্বার আগা ওপরের দুই দাঁতের গোড়ায় লাগিয়ে মৃদু বাতাস সহ পাতলা স্বরে উচ্চারণ করুন।",
  },
  "ث": {
    letter: "ث",
    nameBn: "ছা",
    nameAr: "ثَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 13,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের দুই দাঁতের ধার/আগা",
    contactAr: "طرف اللسان مع أطراف الثنايا العليا",
    postureBn: "জিহ্বার আগা সামান্য সামনের দুই দাঁতের ধার/আগার ফাঁক দিয়ে বাইরে বের করে নরমভাবে বাতাস সহ স্পর্শ করতে হয়। শিস দেওয়া যাবে না।",
    qaidaTrackNo: 4,
    surahNo: 102,
    ayahNo: 4,
    surahNameBn: "সূরা আত-তাকাসুর, আয়াত ৪",
    targetWord: "ثُمَّ كَلَّا",
    verseAr: "ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ",
    verseBn: "অতঃপর কখনোই না, শীঘ্রই তোমরা জানতে পারবে।",
    sifatBn: "হামস, রাখাওয়াহ, তারকীক (নরম ও পাতলা)",
    tipsBn: "জিহ্বার আগা সামান্য সামনের দুই দাঁতের ফাঁক থেকে বের করে নরমভাবে উচ্চারণ করতে হয়। শিস দেওয়া যাবে না।",
  },
  "ج": {
    letter: "ج",
    nameBn: "জীম",
    nameAr: "جِيم",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 6,
    makhrajNameBn: "জিহ্বার মধ্যভাগ ও সোজাসুজি ওপরের শক্ত তালু",
    contactAr: "وسط اللسان مع ما يحاذيه من الحنك الأعلى",
    postureBn: "জিহ্বার মধ্যভাগ ওপরের শক্ত তালুর সাথে পূর্ণভাবে চেপে আটকে ধরে শব্দ স্পষ্ট ও দৃঢ়ভাবে ধাক্কা দিয়ে (কলকলাহ) উচ্চারণ করতে হয়।",
    qaidaTrackNo: 5,
    surahNo: 114,
    ayahNo: 6,
    surahNameBn: "সূরা আন-নাস, আয়াত ৬",
    targetWord: "الْجِنَّةِ",
    verseAr: "مِنَ الْجِنَّةِ وَالنَّاسِ",
    verseBn: "জিন ও মানুষের মধ্য থেকে।",
    sifatBn: "জাহর, শিদ্দাহ, কলকলাহ (সাকিন অবস্থায়)",
    tipsBn: "জিহ্বার মধ্যভাগ তালুর সাথে শক্তভাবে চেপে আটকে ধরে স্পষ্ট ও দৃঢ় ধ্বনিতে উচ্চারণ করতে হবে।",
  },
  "ح": {
    letter: "ح",
    nameBn: "হা (বড় হা)",
    nameAr: "حَاء",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 3,
    makhrajNameBn: "কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)",
    contactAr: "وسط الحلق عند لسان المزمار",
    postureBn: "কণ্ঠনালীর মধ্যভাগ (এপিগ্লোটিস / লিসানুল মিযমার) সংকুচিত করে পরিষ্কার ঝরঝরে গরম বাতাস সহ বের করতে হয়।",
    qaidaTrackNo: 6,
    surahNo: 1,
    ayahNo: 3,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ৩",
    targetWord: "الرَّحْمَٰنِ الرَّحِيمِ",
    verseAr: "الرَّحْمَٰنِ الرَّحِيمِ",
    verseBn: "তিনি পরম করুণাময় ও অতিশয় দয়ালু।",
    sifatBn: "হামস, রাখাওয়াহ, তারকীক (বাতাসযুক্ত ও পরিষ্কার)",
    tipsBn: "গলার মাঝখান কিছুটা সংকুচিত করে গরম বাতাস বের হওয়ার মতো পরিষ্কার ঝরঝরে শব্দে উচ্চারণ করুন। গোল হা (هـ) এর সাথে গুলিয়ে ফেলবেন না।",
  },
  "خ": {
    letter: "خ",
    nameBn: "খা",
    nameAr: "خَاء",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 4,
    makhrajNameBn: "কণ্ঠনালীর ওপরের অংশ (আদনাল হালক্ব)",
    contactAr: "أدنى الحلق مما يلي الفم مع الحنك اللحمي",
    postureBn: "কণ্ঠনালীর ওপরের অংশ (আল-জিহ্বা ও নরম তালুর সংযোগস্থল) থেকে হালকা ঘর্ষণ ও খসখসে ভাব সহ মোটা স্বরে আদায় করতে হয়।",
    qaidaTrackNo: 7,
    surahNo: 113,
    ayahNo: 2,
    surahNameBn: "সূরা আল-ফালাক্ব, আয়াত ২",
    targetWord: "خَلَقَ",
    verseAr: "مِن شَرِّ مَا خَلَقَ",
    verseBn: "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে।",
    sifatBn: "হামস, রাখাওয়াহ, ইস্তিলা (মোটা/তাফখীম)",
    tipsBn: "কণ্ঠনালীর ওপরের প্রান্ত থেকে মৃদু খসখসে ভাব সহ মোটা স্বরে উচ্চারণ করুন।",
  },
  "د": {
    letter: "د",
    nameBn: "দাল",
    nameAr: "دَال",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 11,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া",
    contactAr: "طرف اللسان مع أصول الثنايا العليا",
    postureBn: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের গোড়ায় শক্তভাবে চেপে আটকে ধরে পাতলা স্বরে স্পষ্ট কলকলাহ সহ আদায় করতে হয়।",
    qaidaTrackNo: 8,
    surahNo: 112,
    ayahNo: 3,
    surahNameBn: "সূরা আল-ইখলাস, আয়াত ৩",
    targetWord: "يَلِدْ وَلَمْ يُولَدْ",
    verseAr: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    verseBn: "তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি।",
    sifatBn: "জাহর, শিদ্দাহ, কলকলাহ (সাকিন অবস্থায় ধাক্কা ধ্বনি)",
    tipsBn: "জিহ্বার আগা দাঁতের গোড়ায় লাগিয়ে পাতলা স্বরে উচ্চারণ করুন। সাকিন হলে স্পষ্ট কলকলাহ হবে।",
  },
  "ذ": {
    letter: "ذ",
    nameBn: "যাল",
    nameAr: "ذَال",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 13,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের দুই দাঁতের ধার/আগা",
    contactAr: "طرف اللسان مع أطراف الثنايا العليا",
    postureBn: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের ধার স্পর্শ করবে, নরম ও পাতলা স্বরে ঝাঁঝাঁলো ভাব ছাড়া আদায় করতে হয়।",
    qaidaTrackNo: 9,
    surahNo: 114,
    ayahNo: 5,
    surahNameBn: "সূরা আন-নাস, আয়াত ৫",
    targetWord: "الَّذِي",
    verseAr: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
    verseBn: "যে মানুষের অন্তরে কুমন্ত্রণা দেয়।",
    sifatBn: "জাহর, রাখাওয়াহ, তারকীক (নরম ও পাতলা)",
    tipsBn: "জিহ্বার আগা ওপরের দাঁতের নিচে স্পর্শ করিয়ে নরমভাবে উচ্চারণ করুন। 'ঝ' বা 'য'-এর মতো ঝাঁঝাঁলো হবে না।",
  },
  "ر": {
    letter: "ر",
    nameBn: "রা",
    nameAr: "رَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 10,
    makhrajNameBn: "জিহ্বার আগার পিঠ ও ওপরের দাঁতের মাড়ি",
    contactAr: "طرف اللسان مع ما يحاذيه من لثة الثنايا العليا",
    postureBn: "জিহ্বার আগার উল্টো পিঠ ওপরের দাঁতের মাড়িতে হালকা কম্পন সৃষ্টি করে আদায় হয়। অতিরিক্ত কম্পন প্রতিরোধ করতে হয়।",
    qaidaTrackNo: 10,
    surahNo: 108,
    ayahNo: 2,
    surahNameBn: "সূরা আল-কাওসার, আয়াত ২",
    targetWord: "وَانْحَرْ",
    verseAr: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
    verseBn: "অতএব আপনার প্রতিপালকের উদ্দেশ্যে নামায পড়ুন এবং কুরবানী করুন।",
    sifatBn: "ইনহিরাফ, তাকরার (মৃদু কম্পন), তাফখীম (যবর/পেশে মোটা) ও তারকীক (যেরে পাতলা)",
    tipsBn: "জিহ্বার আগার উল্টো পিঠ মাড়িতে লাগিয়ে কম্পন অতিরিক্ত না করে পরিমিতভাবে উচ্চারণ করুন।",
  },
  "ز": {
    letter: "ز",
    nameBn: "যা",
    nameAr: "زَاي",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 12,
    makhrajNameBn: "জিহ্বার আগা ও নিচের দুই দাঁতের পেট/মাড়ি",
    contactAr: "طرف اللسان مع الصفحة الداخلية للثنايا السفلى",
    postureBn: "জিহ্বার আগা নিচের দুই দাঁতের পেটে থাকবে, বাতাস দুই দাঁতের ফাঁক দিয়ে তীব্র শিসধ্বনির মতো পরিষ্কারভাবে বের হবে।",
    qaidaTrackNo: 11,
    surahNo: 99,
    ayahNo: 1,
    surahNameBn: "সূরা আল-যিলযাল, আয়াত ১",
    targetWord: "زُلْزِلَتِ",
    verseAr: "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا",
    verseBn: "যখন পৃথিবী তার প্রকম্পনে প্রকম্পিত হবে।",
    sifatBn: "জাহর, সাফীর (তীব্র শিসধ্বনি), তারকীক",
    tipsBn: "মৌমাছির গুঞ্জনের মতো তীব্র শিসধ্বনি সহ স্পষ্টভাবে উচ্চারণ করতে হয়।",
  },
  "س": {
    letter: "س",
    nameBn: "সীন",
    nameAr: "سِين",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 12,
    makhrajNameBn: "জিহ্বার আগা ও নিচের দুই দাঁতের পেট",
    contactAr: "طرف اللسان مع ما بين الثنايا العليا والسفلى",
    postureBn: "জিহ্বার আগা নিচের দাঁতের পেটে অবস্থান করবে, মৃদু বাতাস ও হালকা শিসধ্বনি সহ পাতলা স্বরে আদায় করতে হয়।",
    qaidaTrackNo: 12,
    surahNo: 114,
    ayahNo: 1,
    surahNameBn: "সূরা আন-নাস, আয়াত ১",
    targetWord: "النَّاسِ",
    verseAr: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    verseBn: "বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের।",
    sifatBn: "হামস, সাফীর (হালকা শিসধ্বনি), তারকীক (পাতলা)",
    tipsBn: "হালকা বাতাসের সাথে শিসধ্বনি বের হবে, পাতলাভাবে উচ্চারিত হবে।",
  },
  "ش": {
    letter: "ش",
    nameBn: "শীন",
    nameAr: "شِين",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 6,
    makhrajNameBn: "জিহ্বার মধ্যভাগ ও সোজাসুজি ওপরের তালু",
    contactAr: "وسط اللسان مع الحنك الأعلى مع انتشار الهواء",
    postureBn: "জিহ্বার মধ্যভাগ ওপরের শক্ত তালুর কাছে উঁচিয়ে থাকবে, বাতাস সম্পূর্ণ মুখের ভেতর ছড়িয়ে পড়ে (তাফাশ্শী) আদায় হয়।",
    qaidaTrackNo: 13,
    surahNo: 94,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ইনশিরাহ, আয়াত ১",
    targetWord: "نَشْرَحْ",
    verseAr: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ",
    verseBn: "আমরা কি আপনার বক্ষকে প্রশস্ত করে দেইনি?",
    sifatBn: "হামস, রাখাওয়াহ, তাফাশ্শী (মুখের ভেতর বাতাস ছড়িয়ে পড়া)",
    tipsBn: "জিহ্বার মাঝখান তালুর কাছে নিয়ে মুখে বাতাস ছড়িয়ে দিয়ে উচ্চারণ করুন।",
  },
  "ص": {
    letter: "ص",
    nameBn: "সোয়াদ",
    nameAr: "صَاد",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 12,
    makhrajNameBn: "জিহ্বার আগা ও নিচের দুই দাঁতের পেট",
    contactAr: "طرف اللسان مع الثنايا السفلى مع استعلاء اللسان وإطباقه",
    postureBn: "জিহ্বার আগা নিচের দাঁতের গোড়ায় থাকবে এবং জিহ্বার পেছনের অংশ ও মধ্যভাগ তালুর দিকে তুলে (ইতবাক্ব) মুখ ভরাট করে মোটা শিসধ্বনিতে আদায় করতে হয়।",
    qaidaTrackNo: 14,
    surahNo: 112,
    ayahNo: 2,
    surahNameBn: "সূরা আল-ইখলাস, আয়াত ২",
    targetWord: "الصَّمَدُ",
    verseAr: "اللَّهُ الصَّمَدُ",
    verseBn: "আল্লাহ কারো মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।",
    sifatBn: "ইস্তিলা (মোটা), ইতবাক্ব (মুখ ভরাট), সাফীর (ভারী শিসধ্বনি)",
    tipsBn: "মুখ গোল না করে জিহ্বার গোড়া ও মাঝখান উঁচু করে মোটা ভারী স্বরে উচ্চারণ করুন।",
  },
  "ض": {
    letter: "ض",
    nameBn: "দোয়াদ (দাদ)",
    nameAr: "ضَاد",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 7,
    makhrajNameBn: "জিহ্বার পাশ/কিনারা ও ওপরের মাড়ির দাঁত",
    contactAr: "حافة اللسان مما يلي الأضراس العليا (يساراً أو يميناً)",
    postureBn: "জিহ্বার বাম অথবা ডান পাশের ধার ওপরের মাড়ির দাঁত (الأضراس العليا)-এর গোড়ায় শক্তভাবে চেপে ধরে সামনের দিকে দীর্ঘায়িত করে (ইস্তিতালাহ) উচ্চারণ করতে হয়।",
    qaidaTrackNo: 15,
    surahNo: 1,
    ayahNo: 7,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ৭",
    targetWord: "الضَّالِّينَ",
    verseAr: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    verseBn: "তাদের পথ নয় যারা ভ্রষ্ট হয়েছে।",
    sifatBn: "ইস্তিতালাহ (প্রলম্বিত হওয়া), ইতবাক্ব, তাফখীম (মোটা)",
    tipsBn: "আরবি ভাষার অনন্য হরফ। জিহ্বার কিনারা ওপরের মাড়ির দাঁতের গোড়ায় চেপে লম্বা করে মোটা স্বরে আদায় করুন।",
  },
  "ط": {
    letter: "ط",
    nameBn: "তোয়া",
    nameAr: "طَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 11,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া",
    contactAr: "طرف اللسان مع أصول الثنايا العليا مع إطباق اللسان",
    postureBn: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের গোড়ায় লেগে থাকবে এবং জিহ্বার পেছনের অংশ উঁচু করে শক্তভাবে মুখ ভরাট করে কলকলাহ সহ আদায় করতে হয়।",
    qaidaTrackNo: 16,
    surahNo: 1,
    ayahNo: 6,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ৬",
    targetWord: "الصِّرَاطَ",
    verseAr: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    verseBn: "আমাদেরকে সরল পথ প্রদর্শন করুন।",
    sifatBn: "সবচেয়ে শক্তিশালী হরফ; শিদ্দাহ, ইস্তিলা, ইতবাক্ব, কলকলাহ",
    tipsBn: "মুখ ভরাট করে অত্যন্ত মোটা স্বরে উচ্চারণ করতে হয়। সাকিন হলে শক্তিশালী কলকলাহ হয়।",
  },
  "ظ": {
    letter: "ظ",
    nameBn: "যোয়া",
    nameAr: "ظَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 13,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের দুই দাঁতের ধার/আগা",
    contactAr: "طرف اللسان مع أطراف الثنايا العليا مع الاستعلاء والإطباق",
    postureBn: "জিহ্বার আগা ওপরের সামনের দুই দাঁতের ধারের সাথে সামান্য স্পর্শ করবে এবং জিহ্বা উঁচিয়ে মুখ ভরাট করে মোটা স্বরে নরমভাবে আদায় করতে হয়।",
    qaidaTrackNo: 17,
    surahNo: 94,
    ayahNo: 3,
    surahNameBn: "সূরা আল-ইনশিরাহ, আয়াত ৩",
    targetWord: "ظَهْرَكَ",
    verseAr: "الَّذِي أَنقَضَ ظَهْرَكَ",
    verseBn: "যা আপনার পিঠকে ভেঙে দিচ্ছিল।",
    sifatBn: "জাহর, রাখাওয়াহ, ইস্তিলা (মোটা), ইতবাক্ব",
    tipsBn: "জিহ্বার আগা দাঁতের ধার স্পর্শ করবে, মুখ ভরাট করে মোটা স্বরে নরমভাবে বের করতে হবে।",
  },
  "ع": {
    letter: "ع",
    nameBn: "আইন",
    nameAr: "عَيْن",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 3,
    makhrajNameBn: "কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)",
    contactAr: "وسط الحلق برجوع لسان المزمار للخلف",
    postureBn: "কণ্ঠনালীর মধ্যভাগ (এপিগ্লোটিস ও পেছনের দেয়াল) ভালো করে চেপে সংকুচিত করে গভীর বিশুদ্ধ গমগমে ধ্বনি বের করতে হয়।",
    qaidaTrackNo: 18,
    surahNo: 1,
    ayahNo: 5,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ৫",
    targetWord: "نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    verseAr: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    verseBn: "আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই নিকট সাহায্য চাই।",
    sifatBn: "তাওয়াসসুত (মধ্যম স্থায়িত্ব), জাহর, তারকীক",
    tipsBn: "কণ্ঠনালীর মধ্যভাগ ভালো করে চেপে সংকুচিত করে গভীর বিশুদ্ধ শব্দ বের করুন। হামযাহ বা আলিফের মতো বলবেন না।",
  },
  "غ": {
    letter: "غ",
    nameBn: "গইন",
    nameAr: "غَيْن",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 4,
    makhrajNameBn: "কণ্ঠনালীর ওপরের অংশ (আদনাল হালক্ব)",
    contactAr: "أدنى الحلق عند منطقة اللهاة والحنك الرخو",
    postureBn: "কণ্ঠনালীর ওপরের অংশ নরম তালুর সাথে লেগে কোনো খসখসে বাতাস ছাড়া মসৃণভাবে মোটা স্বরে আদায় করতে হয়।",
    qaidaTrackNo: 19,
    surahNo: 113,
    ayahNo: 3,
    surahNameBn: "সূরা আল-ফালাক্ব, আয়াত ৩",
    targetWord: "غَاسِقٍ",
    verseAr: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    verseBn: "এবং অন্ধকার রাতের অনিষ্ট হতে যখন তা সমাগত হয়।",
    sifatBn: "জাহর, রাখাওয়াহ, ইস্তিলা (মোটা)",
    tipsBn: "কণ্ঠনালীর প্রথম অংশ থেকে কোনো খসখসে বাতাস ছাড়া মসৃণভাবে মোটা স্বরে উচ্চারণ করতে হবে।",
  },
  "ف": {
    letter: "ف",
    nameBn: "ফা",
    nameAr: "فَاء",
    organId: "shafatan",
    organNameBn: "শাফাতান (দুই ঠোঁট)",
    makhrajNo: 14,
    makhrajNameBn: "নিচের ঠোঁটের পেট ও ওপরের দুই দাঁতের ধার",
    contactAr: "أطراف الثنايا العليا مع بطن الشفة السفلى",
    postureBn: "উপরের সামনের দুই দাঁতের আগা নিচের ঠোঁটের ভিতরের ভেজা অংশে হালকা স্পর্শ করবে এবং মৃদু বাতাস বের হবে।",
    qaidaTrackNo: 20,
    surahNo: 113,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ফালাক্ব, আয়াত ১",
    targetWord: "الْفَلَقِ",
    verseAr: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    verseBn: "বলুন, আমি আশ্রয় প্রার্থনা করছি প্রভাতের পালনকর্তার।",
    sifatBn: "হামস (প্রচুর বাতাস), রাখাওয়াহ, তারকীক",
    tipsBn: "উপরের সামনের দুই দাঁতের আগা নিচের ঠোঁটের ভিতরের অংশে লাগিয়ে বাতাস সহ উচ্চারণ করুন। দুই ঠোঁট মেলানো যাবে না।",
  },
  "ق": {
    letter: "ق",
    nameBn: "ক্বাফ",
    nameAr: "قَاف",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 5,
    makhrajNameBn: "জিহ্বার গোড়া ও ওপরের নরম তালু",
    contactAr: "أقصى اللسان مع ما يحاذيه من الحنك اللحمي (الرخو)",
    postureBn: "জিহ্বার পেছনের গোড়া ওপরের নরম ও মাংসল তালুর সাথে লেগে পুরোপুরি বাতাস আটকে দিয়ে ধাক্কা দিয়ে (কলকলাহ) মোটা স্বরে বের হয়।",
    qaidaTrackNo: 21,
    surahNo: 112,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ইখলাস, আয়াত ১",
    targetWord: "قُلْ",
    verseAr: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    verseBn: "বলুন, তিনিই আল্লাহ, একক ও অদ্বিতীয়।",
    sifatBn: "শিদ্দাহ, ইস্তিলা (মোটা), কলকলাহ (সাকিন অবস্থায় প্রতিধ্বনি)",
    tipsBn: "জিহ্বার গোড়া ওপরের নরম তালুর সাথে চেপে মোটা স্বরে আদায় করুন। সাকিন হলে শক্তিশালী কলকলাহ হবে। কাফ (ك) এর সাথে গুলিয়ে ফেলবেন না।",
  },
  "ك": {
    letter: "ك",
    nameBn: "কাফ",
    nameAr: "كَاف",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 5,
    makhrajNameBn: "জিহ্বার গোড়া থেকে একটু সামনে ও শক্ত তালু",
    contactAr: "أقصى اللسان مع ما يحاذيه من الحنك العظمي واللحمي",
    postureBn: "জিহ্বার গোড়া নরম তালু থেকে একটু সামনে শক্ত ও নরম তালুর সংযোগস্থলে লেগে মৃদু বাতাস (হাম্স) সহ পাতলা স্বরে আদায় হয়।",
    qaidaTrackNo: 22,
    surahNo: 112,
    ayahNo: 4,
    surahNameBn: "সূরা আল-ইখলাস, আয়াত ৪",
    targetWord: "يَكُن لَّهُ كُفُوًا",
    verseAr: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    verseBn: "এবং তাঁর সমকক্ষ কেউই নেই।",
    sifatBn: "শিদ্দাহ, হামস (মৃদু বাতাস), তারকীক (পাতলা)",
    tipsBn: "জিহ্বার গোড়া শক্ত তালুর সাথে ছুঁয়ে মৃদু বাতাস (হামস) সহ পাতলা স্বরে উচ্চারণ করুন।",
  },
  "ل": {
    letter: "ل",
    nameBn: "লাম",
    nameAr: "لَام",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 8,
    makhrajNameBn: "জিহ্বার আগার কিনারা ও ওপরের দাঁতের মাড়ি",
    contactAr: "أدنى حافتي اللسان إلى منتهى طرفه مع لثة الأسنان العليا",
    postureBn: "জিহ্বার আগার দুই পাশের চওড়া কিনারা ওপরের সামনের দাঁতের মাড়ির সাথে লেগে আদায় হয় এবং বাতাস জিহ্বার দুই পাশ দিয়ে গলে যায় (ইনহিরাফ)।",
    qaidaTrackNo: 23,
    surahNo: 1,
    ayahNo: 2,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ২",
    targetWord: "الْحَمْدُ لِلَّهِ",
    verseAr: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    verseBn: "সমস্ত প্রশংসা আল্লাহর জন্য যিনি সকল সৃষ্টির রব।",
    sifatBn: "তাওয়াসসুত, ইনহিরাফ, তারকীক (আল্লাহ শব্দের আগে যবর/পেশ থাকলে মোটা)",
    tipsBn: "জিহ্বার আগার চওড়া অংশ ওপরের সামনের দাঁতের মাড়ির সাথে লাগিয়ে মসৃণভাবে উচ্চারণ করুন।",
  },
  "م": {
    letter: "م",
    nameBn: "মীম",
    nameAr: "مِيم",
    organId: "shafatan",
    organNameBn: "শাফাতান (দুই ঠোঁট)",
    makhrajNo: 15,
    makhrajNameBn: "দুই ঠোঁটের শুকনা অংশ মিলিয়ে",
    contactAr: "انطباق الشفتين من الجزء الجاف مع غنة الخيشوم",
    postureBn: "দুই ঠোঁটের বাইরের শুকনো অংশ স্বাভাবিকভাবে মিলিয়ে নাকের বাঁশি দিয়ে গুন্নাহর প্রবাহ সহ উচ্চারণ করতে হয়।",
    qaidaTrackNo: 24,
    surahNo: 1,
    ayahNo: 4,
    surahNameBn: "সূরা আল-ফাতিহা, আয়াত ৪",
    targetWord: "مَالِكِ",
    verseAr: "مَالِكِ يَوْمِ الدِّينِ",
    verseBn: "যিনি বিচার দিবসের অধিপতি।",
    sifatBn: "তাওয়াসসুত, গুন্নাহ (নাকের বাঁশি থেকে ধ্বনি)",
    tipsBn: "দুই ঠোঁটের বাইরের শুকনো অংশ স্বাভাবিকভাবে মিলিয়ে নাকের গুন্নাহ সহ উচ্চারণ করুন।",
  },
  "ن": {
    letter: "ن",
    nameBn: "নূন",
    nameAr: "نُون",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 9,
    makhrajNameBn: "জিহ্বার আগা ও ওপরের দাঁতের মাড়ি",
    contactAr: "طرف اللسان مع لثة الثنايا العليا مع غنة من الخيشوم",
    postureBn: "জিহ্বার আগা ওপরের দাঁতের মাড়িতে লেগে অর্ধেক অংশ মুখে এবং বাকি অর্ধেক অংশ নাকের বাঁশি দিয়ে গুন্নাহ সহ আদায় হয়।",
    qaidaTrackNo: 25,
    surahNo: 114,
    ayahNo: 2,
    surahNameBn: "সূরা আন-নাস, আয়াত ২",
    targetWord: "النَّاسِ",
    verseAr: "مَلِكِ النَّاسِ",
    verseBn: "যিনি মানবজাতির অধিপতি।",
    sifatBn: "তাওয়াসসুত, গুন্নাহ (খয়শূম থেকে অর্ধধ্বনি নির্গত হয়)",
    tipsBn: "জিহ্বার আগা ওপরের সামনের দাঁতের মাড়িতে লেগে উচ্চারিত হয় এবং অর্ধেক অংশ নাকের বাঁশি দিয়ে গুন্নাহ আকারে বের হয়।",
  },
  "و": {
    letter: "و",
    nameBn: "ওয়াও",
    nameAr: "وَاو",
    organId: "shafatan",
    organNameBn: "শাফাতান (দুই ঠোঁট)",
    makhrajNo: 15,
    makhrajNameBn: "দুই ঠোঁট গোল করে মধ্যখানের ফাঁক থেকে",
    contactAr: "انضمام الشفتين إلى الأمام مع إبقاء فتحة في الوسط",
    postureBn: "দুই ঠোঁট সামনে বৃত্তাকার গোল করে মাঝখানের ফাঁকা অংশ দিয়ে মসৃণভাবে উচ্চারণ করতে হয়, দাঁত লাগানো যাবে না।",
    qaidaTrackNo: 26,
    surahNo: 114,
    ayahNo: 4,
    surahNameBn: "সূরা আন-নাস, আয়াত ৪",
    targetWord: "الْوَسْوَاسِ",
    verseAr: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
    verseBn: "আত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট হতে।",
    sifatBn: "জাহর, রাখাওয়াহ, তারকীক (পাতলা)",
    tipsBn: "দুই ঠোঁট সামনে বৃত্তাকার গোল করে মাঝখানের ফাঁকা অংশ দিয়ে মসৃণভাবে উচ্চারণ করুন। দাঁত লাগানো যাবে না।",
  },
  "هـ": {
    letter: "هـ",
    nameBn: "হা (গোল হা)",
    nameAr: "هَاء",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 2,
    makhrajNameBn: "কণ্ঠনালীর শেষভাগ (আক্বসাল হালক্ব - সীনার দিক)",
    contactAr: "أقصى الحلق عند الحبلين الصوتيين",
    postureBn: "সীনার দিক থেকে স্বরতন্ত্রীর মধ্য দিয়ে উন্মুক্ত হালকা বাতাস সহ স্বাভাবিকভাবে নির্গত হয়।",
    qaidaTrackNo: 27,
    surahNo: 112,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ইখলাস, আয়াত ১",
    targetWord: "هُوَ",
    verseAr: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    verseBn: "বলুন, তিনিই আল্লাহ, এক ও একক।",
    sifatBn: "সবচেয়ে দুর্বল হরফ; খাফা (লুক্কায়িত), হামস, তারকীক",
    tipsBn: "সীনার সংযোগস্থল থেকে গভীর হালকা বাতাস সহ সাবলীলভাবে উচ্চারণ করুন। বড় হা (ح) এর মতো গলার মাঝখান চিপবেন না।",
  },
  "ء": {
    letter: "ء",
    nameBn: "হামযাহ",
    nameAr: "هَمْزَة",
    organId: "halq",
    organNameBn: "হলক্ব (কণ্ঠনালী)",
    makhrajNo: 2,
    makhrajNameBn: "কণ্ঠনালীর শেষভাগ (আক্বসাল হালক্ব)",
    contactAr: "أقصى الحلق بانطباق الحبلين الصوتيين ثم انفتاحهما",
    postureBn: "কণ্ঠনালীর গভীর থেকে স্বরতন্ত্রী পুরোপুরি বন্ধ হয়ে ঝটকা দিয়ে খুলে গিয়ে তীব্র স্পষ্ট ধ্বনিতে আদায় হয়।",
    qaidaTrackNo: 28,
    surahNo: 113,
    ayahNo: 1,
    surahNameBn: "সূরা আল-ফালাক্ব, আয়াত ১",
    targetWord: "أَعُوذُ",
    verseAr: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    verseBn: "বলুন, আমি আশ্রয় চাই প্রভাতের রবের।",
    sifatBn: "জাহর, শিদ্দাহ (কণ্ঠনালীর স্বরতন্ত্র বন্ধ হয়ে ঝটকা দেওয়া)",
    tipsBn: "গলার গভীর থেকে স্পষ্ট ও দৃঢ় ঝটকা দিয়ে উচ্চারণ করতে হয়।",
  },
  "ي": {
    letter: "ي",
    nameBn: "ইয়া",
    nameAr: "يَاء",
    organId: "lisan",
    organNameBn: "লিসান (জিহ্বা)",
    makhrajNo: 6,
    makhrajNameBn: "জিহ্বার মধ্যভাগ ও সোজাসুজি ওপরের তালু",
    contactAr: "وسط اللسان مع ما يحاذيه من الحنك الصلب",
    postureBn: "জিহ্বার মধ্যভাগ ওপরের শক্ত তালুর কাছে উঁচিয়ে মুখের ভেতর স্থান রেখে মসৃণ ও পাতলা স্বরে আদায় করতে হয়।",
    qaidaTrackNo: 29,
    surahNo: 106,
    ayahNo: 1,
    surahNameBn: "সূরা কুরাইশ, আয়াত ১",
    targetWord: "لِإِيلَافِ",
    verseAr: "لِإِيلَافِ قُرَيْشٍ",
    verseBn: "কুরাইশদের আসক্তির কারণে।",
    sifatBn: "জাহর, রাখাওয়াহ, লীন (যবরের পর সাকিন হলে নরম স্বর), তারকীক",
    tipsBn: "জিহ্বার মাঝখান তালুর কাছে তুলে পাতলা ও মসৃণ স্বরে উচ্চারণ করুন।",
  },
};

// Aliases
LETTER_MAKHRAJ_DATABASE["ه"] = LETTER_MAKHRAJ_DATABASE["هـ"];

// The 5 Major Makhraj Zones & 17 Articulation Points
export const MAKHRAJ_ZONES = [
  {
    id: "halq",
    nameBn: "হলক্ব (কণ্ঠনালী)",
    nameAr: "الحَلْق",
    nameEn: "Throat",
    color: "#059669",
    glowColor: "rgba(5, 150, 105, 0.4)",
    descBn: "কণ্ঠনালীর ৩টি অংশ থেকে ৬টি হরফ উচ্চারিত হয় (হুরূফে হালক্বী)।",
    subZones: [
      {
        nameBn: "আক্বসাল হলক্ব (কণ্ঠনালীর শেষভাগ - সীনার দিক)",
        letters: ["ء", "هـ"],
        ruleBn:
          "হামযাহ (ء) ও গোল হা (هـ) সীনার সংযোগস্থল থেকে স্পষ্টভাবে বের হয়।",
      },
      {
        nameBn: "ওয়াসাতুল হলক্ব (কণ্ঠনালীর মধ্যভাগ)",
        letters: ["ع", "ح"],
        ruleBn:
          "আইন (ع) ও বড় হা (ح) কণ্ঠনালীর মাঝখান সংকুচিত করে পরিষ্কার শব্দে উচ্চারিত হয়।",
      },
      {
        nameBn: "আদনাল হলক্ব (কণ্ঠনালীর ওপরের অংশ - মুখের দিক)",
        letters: ["غ", "خ"],
        ruleBn:
          "গইন (غ) ও খা (خ) কণ্ঠনালীর ওপরের অংশ থেকে মোটা (পুর/তাফখীম) হয়ে উচ্চারিত হয়।",
      },
    ],
  },
  {
    id: "lisan",
    nameBn: "লিসান (জিহ্বা)",
    nameAr: "اللِّسَان",
    nameEn: "Tongue",
    color: "#0284c7",
    glowColor: "rgba(2, 132, 199, 0.4)",
    descBn: "জিহ্বার ১০টি মাখরাজ থেকে ১৮টি হরফ উচ্চারিত হয়।",
    subZones: [
      {
        nameBn: "জিহ্বার গোড়া ও নরম তালু",
        letters: ["ق"],
        ruleBn:
          "ক্বফ (ق) জিহ্বার গোড়া ওপরের নরম তালুর সাথে লেগে মোটা স্বরে উচ্চারিত হয় (কলকলাহ)।",
      },
      {
        nameBn: "জিহ্বার গোড়া থেকে একটু সামনে ও শক্ত তালু",
        letters: ["ك"],
        ruleBn:
          "কাফ (ك) পাতলা স্বরে মৃদু বাতাসসহ (হামস) উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার মধ্যভাগ ও শক্ত তালু",
        letters: ["ج", "ش", "ي"],
        ruleBn:
          "জীম (ج), শীন (ش), ইয়া (ي) জিহ্বার মধ্যভাগ শক্ত তালুর সাথে ঘর্ষণে উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার পাশ ও ওপরের মাড়ির দাঁত",
        letters: ["ض"],
        ruleBn:
          "দোয়াদ (ض) সবচেয়ে বৈশিষ্ট্যপূর্ণ হরফ; জিহ্বার পাশ ওপরের মাড়ির দাঁতে চেপে উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার আগা ও ওপরের দাঁতের মাড়ি",
        letters: ["ل", "ن", "ر"],
        ruleBn:
          "লাম (ل), নূন (ن), রা (ر) জিহ্বার আগা ওপরের সামনের দাঁতের মাড়ির সাথে লেগে উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া",
        letters: ["ط", "د", "ت"],
        ruleBn:
          "তোয়া (ط) মোটা, দাল (د) ও তা (ت) পাতলাভাবে মাড়িতে লেগে উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার আগা ও নিচের দুই দাঁতের পেট/মাড়ি",
        letters: ["ص", "ز", "س"],
        ruleBn:
          "সোয়াদ (ص), যা (ز), সীন (س) শিসধ্বনির মতো তীক্ষ্ণ শব্দে (সাফীর) উচ্চারিত হয়।",
      },
      {
        nameBn: "জিহ্বার আগা ও ওপরের দুই দাঁতের ধার/আগা",
        letters: ["ظ", "ذ", "ث"],
        ruleBn:
          "যোয়া (ظ), যাল (ذ), ছা (ث) জিহ্বার আগা সামান্য বের করে নরম উচ্চারণে বের হয়।",
      },
    ],
  },
  {
    id: "shafatan",
    nameBn: "শাফাতান (দুই ঠোঁট)",
    nameAr: "الشَّفَتَان",
    nameEn: "Lips",
    color: "#d97706",
    glowColor: "rgba(217, 119, 6, 0.4)",
    descBn: "দুই ঠোঁট থেকে ৪টি হরফ উচ্চারিত হয়।",
    subZones: [
      {
        nameBn: "নিচের ঠোঁটের পেট ও ওপরের দুই দাঁতের আগা",
        letters: ["ف"],
        ruleBn:
          "ফা (ف) নিচের ঠোঁটের ভিতরের অংশে ওপরের দাঁত ছুঁয়ে বাতাস সহ উচ্চারিত হয়।",
      },
      {
        nameBn: "দুই ঠোঁটের পারস্পরিক মিলন ও গোল হওয়া",
        letters: ["ب", "م", "و"],
        ruleBn:
          "বা (ب) ভিজা অংশে চেপে, মীম (م) শুকনা অংশে লেগে, এবং ওয়াও (و) ঠোঁট গোল করে বের হয়।",
      },
    ],
  },
  {
    id: "khayshum",
    nameBn: "খয়শূম (নাকের বাঁশি)",
    nameAr: "الخَيْشُوم",
    nameEn: "Nasal Cavity",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.4)",
    descBn: "নাকের বাঁশি থেকে গুন্নাহ (Ghunnah) ধ্বনি নির্গত হয়।",
    subZones: [
      {
        nameBn: "গুন্নাহ ধ্বনির উৎস",
        letters: ["نّ", "مّ", "إِخْفَاء"],
        ruleBn:
          "নূন ও মীমে তাশদীদ থাকলে এবং ইখফা/ইদগামে ১ আলিফ পরিমাণ নাকের বাঁশিতে ধ্বনি ধরে রাখা ওয়াজিব।",
      },
    ],
  },
  {
    id: "jawf",
    nameBn: "জাওফ (মুখের খালি জায়গা)",
    nameAr: "الجَوْف",
    nameEn: "Oral Cavity",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    descBn: "মুখ ও কণ্ঠের খালি অংশ থেকে ৩টি মাদ্দের হরফ প্রবাহিত হয়।",
    subZones: [
      {
        nameBn: "হুরূফে মাদ্দাহ (প্রলম্বিত স্বর)",
        letters: ["ا", "ـُـوْ", "ـِـيْ"],
        ruleBn:
          "যবরের পর খালি আলিফ, পেশের পর ওয়াও সাকিন, এবং যেরের পর ইয়া সাকিন ১ আলিফ দীর্ঘ করে পড়তে হয়।",
      },
    ],
  },
];

// 29 Arabic Alphabet Array for the Quick Grid
export const ALL_29_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ",
  "د", "ذ", "ر", "ز", "س", "ش", "ص",
  "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "و", "هـ", "ء", "ي",
];

// High-fidelity vector cross-section diagram
function AnatomicalVectorDiagram({ activeZoneId }) {
  const isActive = (zone) => activeZoneId === zone;

  return (
    <svg
      viewBox="0 0 240 280"
      className="w-full h-full drop-shadow-2xl"
      style={{ filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.5))" }}
    >
      <defs>
        <radialGradient id="hglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="jglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Skull outline profile */}
      <path
        d="M 68 250 L 68 215 C 65 198 56 182 54 162 C 50 135 54 108 58 88 C 65 56 80 25 115 14 C 148 2 180 12 196 32 C 212 52 218 80 212 108 C 208 128 198 144 190 160 C 182 176 180 192 180 208 L 180 250"
        fill="none"
        stroke="#334155"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Nasal Cavity (Al-Khayshum) */}
      <path
        d="M 135 55 Q 165 42 182 62 Q 165 82 145 74 Z"
        fill={isActive("khayshum") ? "rgba(139,92,246,0.3)" : "rgba(51,65,85,0.2)"}
        stroke={isActive("khayshum") ? "#a78bfa" : "#475569"}
        strokeWidth={isActive("khayshum") ? "2.5" : "1.2"}
        className="transition-all duration-300"
      />
      {isActive("khayshum") && (
        <circle cx="160" cy="62" r="6" fill="#a78bfa" className="animate-ping" />
      )}

      {/* Hard Palate & Soft Palate */}
      <path
        d="M 96 106 Q 128 98 158 106"
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 148 108 Q 155 116 150 125"
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Tongue (Al-Lisan) with anatomical muscle contour */}
      <path
        d="M 92 142 Q 102 126 126 124 Q 152 124 162 136 Q 158 158 146 164 Q 124 170 102 160 Q 90 154 92 142 Z"
        fill={isActive("lisan") ? "rgba(2,132,199,0.4)" : "rgba(71,85,105,0.25)"}
        stroke={isActive("lisan") ? "#38bdf8" : "#64748b"}
        strokeWidth={isActive("lisan") ? "3" : "1.8"}
        className="transition-all duration-300"
      />
      {isActive("lisan") && (
        <>
          <ellipse cx="128" cy="144" rx="42" ry="26" fill="url(#lglow)" />
          <circle cx="128" cy="142" r="5" fill="#38bdf8" className="animate-ping" />
        </>
      )}

      {/* Upper & Lower Teeth */}
      <path d="M 86 120 Q 88 112 94 110 L 98 112 L 98 120 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <path d="M 86 162 Q 88 170 94 171 L 98 170 L 98 162 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />

      {/* Lips (Ash-Shafatan) */}
      <path
        d="M 76 138 Q 82 128 88 126 Q 82 132 76 138"
        fill={isActive("shafatan") ? "rgba(217,119,6,0.45)" : "rgba(100,116,139,0.3)"}
        stroke={isActive("shafatan") ? "#f59e0b" : "#64748b"}
        strokeWidth={isActive("shafatan") ? "3" : "1.8"}
        className="transition-all duration-300"
      />
      <path
        d="M 76 150 Q 82 162 88 166 Q 82 158 76 150"
        fill={isActive("shafatan") ? "rgba(217,119,6,0.45)" : "rgba(100,116,139,0.3)"}
        stroke={isActive("shafatan") ? "#f59e0b" : "#64748b"}
        strokeWidth={isActive("shafatan") ? "3" : "1.8"}
        className="transition-all duration-300"
      />
      {isActive("shafatan") && (
        <circle cx="82" cy="145" r="4.5" fill="#f59e0b" className="animate-ping" />
      )}

      {/* Throat / Al-Halq */}
      <rect
        x="96" y="168" width="60" height="74" rx="12"
        fill={isActive("halq") ? "rgba(5,150,105,0.25)" : "rgba(30,41,59,0.4)"}
        stroke={isActive("halq") ? "#10b981" : "#334155"}
        strokeWidth={isActive("halq") ? "3" : "1.8"}
        className="transition-all duration-300"
      />
      <line x1="97" y1="192" x2="155" y2="192" stroke={isActive("halq") ? "#6ee7b7" : "#334155"} strokeWidth="1" strokeDasharray="3,2" />
      <line x1="97" y1="214" x2="155" y2="214" stroke={isActive("halq") ? "#6ee7b7" : "#334155"} strokeWidth="1" strokeDasharray="3,2" />
      {isActive("halq") && (
        <>
          <ellipse cx="126" cy="205" rx="44" ry="38" fill="url(#hglow)" />
          <circle cx="126" cy="205" r="5" fill="#10b981" className="animate-ping" />
          <text x="126" y="186" textAnchor="middle" fontSize="8" fill="#6ee7b7" fontFamily="serif">أدنى</text>
          <text x="126" y="208" textAnchor="middle" fontSize="8" fill="#6ee7b7" fontFamily="serif">وسط</text>
          <text x="126" y="230" textAnchor="middle" fontSize="8" fill="#6ee7b7" fontFamily="serif">أقصى</text>
        </>
      )}

      {/* Epiglottis & Larynx */}
      <path
        d="M 112 167 Q 120 160 126 164 Q 132 160 140 167"
        fill="none"
        stroke={isActive("halq") ? "#6ee7b7" : "#475569"}
        strokeWidth={isActive("halq") ? "2.5" : "1.5"}
      />
    </svg>
  );
}

export default function MakhrajVisualizer({
  onSelectLetter,
  initialZoneId,
  initialLetter,
  activeZone: controlledZone,
  onZoneChange,
  interactive: _interactive = true,
}) {
  const [activeZoneId, setActiveZoneId] = useState(
    controlledZone || initialZoneId || "halq"
  );
  const [selectedLetter, setSelectedLetter] = useState(initialLetter || "ع");
  const [activeTab, setActiveTab] = useState("organ"); // "organ" | "all29"
  const [diagramMode, setDiagramMode] = useState("illustration"); // "illustration" | "vector"
  const [activeShaykhId, setShaykhIdState] = useState("husary_muallim");
  const [playbackMode, setPlaybackMode] = useState("qari"); // "qari" (Quranic Ayah mashq) | "qaida" (Noorani Qaida)
  const [playingAudio, setPlayingAudio] = useState(false);
  const [currentAudioType, setCurrentAudioType] = useState(null); // "qari" | "qaida"
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const audioPlayerRef = useRef(null);

  // Sync active Shaykh from local storage on mount
  useEffect(() => {
    setShaykhIdState(getActiveShaykhId());
    const handleShaykhChanged = (e) => {
      if (e.detail?.shaykhId) setShaykhIdState(e.detail.shaykhId);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("rahmania:shaykh_changed", handleShaykhChanged);
      return () => {
        window.removeEventListener("rahmania:shaykh_changed", handleShaykhChanged);
      };
    }
  }, []);

  // Keyboard shortcut: Escape to close zoom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isZoomOpen) {
        setIsZoomOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomOpen]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        } catch {}
      }
    };
  }, []);

  // Sync external controlled props
  useEffect(() => {
    if (controlledZone && controlledZone !== activeZoneId) {
      setActiveZoneId(controlledZone);
    }
  }, [controlledZone]);

  useEffect(() => {
    if (initialZoneId && initialZoneId !== activeZoneId) {
      setActiveZoneId(initialZoneId);
    }
    if (initialLetter && initialLetter !== selectedLetter) {
      setSelectedLetter(initialLetter);
    }
  }, [initialZoneId, initialLetter]);

  const handleSelectShaykh = (shaykhId) => {
    setShaykhIdState(shaykhId);
    setActiveShaykhId(shaykhId);
  };

  const activeZone =
    MAKHRAJ_ZONES.find((z) => z.id === activeZoneId) || MAKHRAJ_ZONES[0];

  const letterDetails =
    LETTER_MAKHRAJ_DATABASE[selectedLetter] ||
    LETTER_MAKHRAJ_DATABASE["ع"];

  const activeSubZone =
    activeZone.subZones.find((sz) => sz.letters.includes(selectedLetter)) ||
    activeZone.subZones[0];

  const currentShaykh =
    SHAYKH_REGISTRY.find((q) => q.id === activeShaykhId) || SHAYKH_REGISTRY[0];

  const currentOrganImage = ORGAN_IMAGES[activeZoneId] || ORGAN_IMAGES.halq;

  // SpeechSynthesis Fallback
  const fallbackSpeech = (letter) => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = "ar-SA";
        utterance.rate = 0.75;
        utterance.pitch = 1.1;
        utterance.onend = () => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        };
        utterance.onerror = () => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        }, 800);
      }
    } catch {
      setPlayingAudio(false);
      setCurrentAudioType(null);
    }
  };

  const stopCurrentAudio = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch {}
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setPlayingAudio(false);
    setCurrentAudioType(null);
  };

  // Play Noorani Qaida (Takhti 1: Huruf Mufradat)
  const playQaidaLetterAudio = (letter) => {
    if (typeof window === "undefined") return;
    stopCurrentAudio();
    setPlayingAudio(true);
    setCurrentAudioType("qaida");

    const trackNumber = NOORANI_TRACK_MAP[letter];
    if (trackNumber) {
      try {
        const audio = new Audio(`${NOORANI_BASE_URL}${trackNumber}.m4a`);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        };
        audio.onerror = () => {
          playStudioFallback(letter);
        };
        audio.play().catch(() => {
          playStudioFallback(letter);
        });
        return;
      } catch {
        playStudioFallback(letter);
        return;
      }
    }

    playStudioFallback(letter);
  };

  // Fallback to studio alphabet or speech
  const playStudioFallback = (letter) => {
    const soundFile = ARABIC_LETTER_AUDIO_MAP[letter];
    if (soundFile) {
      try {
        const audio = new Audio(`${ARABIC_AUDIO_BASE_URL}${soundFile}`);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        };
        audio.onerror = () => fallbackSpeech(letter);
        audio.play().catch(() => fallbackSpeech(letter));
        return;
      } catch {
        fallbackSpeech(letter);
        return;
      }
    }
    fallbackSpeech(letter);
  };

  // Play Qari Quranic Makhraj Recitation (Benchmark Ayah)
  const playQariMashqAudio = (letter, explicitShaykhId) => {
    if (typeof window === "undefined") return;
    stopCurrentAudio();
    setPlayingAudio(true);
    setCurrentAudioType("qari");

    const targetDetails = LETTER_MAKHRAJ_DATABASE[letter] || LETTER_MAKHRAJ_DATABASE["ع"];
    const shaykhToUse = explicitShaykhId || activeShaykhId;

    if (targetDetails?.surahNo && targetDetails?.ayahNo) {
      const qariUrl = getQariAudioUrl(
        shaykhToUse,
        targetDetails.surahNo,
        targetDetails.ayahNo
      );
      try {
        const audio = new Audio(qariUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingAudio(false);
          setCurrentAudioType(null);
        };
        audio.onerror = () => {
          playQaidaLetterAudio(letter);
        };
        audio.play().catch(() => {
          playQaidaLetterAudio(letter);
        });
        return;
      } catch {
        playQaidaLetterAudio(letter);
        return;
      }
    }

    playQaidaLetterAudio(letter);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    const target = LETTER_MAKHRAJ_DATABASE[letter];
    if (target?.organId && target.organId !== activeZoneId) {
      setActiveZoneId(target.organId);
      if (onZoneChange) onZoneChange(target.organId);
    }

    if (playbackMode === "qari") {
      playQariMashqAudio(letter);
    } else {
      playQaidaLetterAudio(letter);
    }

    if (onSelectLetter) onSelectLetter(letter, activeZone);
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-3xl p-4 sm:p-5 text-slate-800 shadow-sm backdrop-blur-md">
      {/* ── TOP HEADER: TITLE & STATS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d7a5f] to-[#064e3b] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
            <BookOpen className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              মাখরাজ ভিজ্যুয়ালাইজার ও অঙ্গ-ভঙ্গি স্টুডিও
              <span className="text-xs text-emerald-700 font-sans font-normal hidden md:inline">
                (Tajweed Makhraj Studio)
              </span>
            </h3>
            <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
              নিখুঁত অ্যানাটমিক্যাল চিত্র, ১৭টি মাখরাজ ও খাঁটি ক্বারীর তিলাওয়াত মশক্ব
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Organ View vs All 29 Letters Grid */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#faf8f2] p-1 rounded-full border border-emerald-100">
          <button
            onClick={() => setActiveTab("organ")}
            className={`px-3 py-1 text-xs rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "organ"
                ? "bg-[#0d7a5f] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>মাখরাজ অঙ্গ</span>
          </button>
          <button
            onClick={() => setActiveTab("all29")}
            className={`px-3 py-1 text-xs rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all29"
                ? "bg-[#0d7a5f] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>সকল ২৯টি হরফ</span>
          </button>
        </div>
      </div>

      {/* ── QARI & AUDIO MODE SELECTOR BAR ── */}
      <div className="bg-[#faf8f2] border border-emerald-100 rounded-2xl p-3 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Qari Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>ক্বারী নির্বাচন:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SHAYKH_REGISTRY.map((shaykh) => {
                const isSelected = shaykh.id === activeShaykhId;
                return (
                  <button
                    key={shaykh.id}
                    onClick={() => handleSelectShaykh(shaykh.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-br from-[#0d7a5f] to-[#0a634d] text-white border-2 border-[#d4af37] shadow-xs"
                        : "bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    <span>{shaykh.flagEmoji}</span>
                    <span className="truncate max-w-[120px]">{shaykh.displayTitleBn}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Audio Mode Selector (Quran Mashq vs Noorani Qaida) */}
          <div className="flex items-center gap-2 self-start lg:self-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-emerald-200">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">মোড:</span>
            </span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-emerald-200">
              <button
                onClick={() => setPlaybackMode("qari")}
                className={`px-3 py-1 text-xs rounded-full transition-all font-bold cursor-pointer ${
                  playbackMode === "qari"
                    ? "bg-[#0d7a5f] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                কুরআনিক মশক্ব
              </button>
              <button
                onClick={() => setPlaybackMode("qaida")}
                className={`px-3 py-1 text-xs rounded-full transition-all font-bold cursor-pointer ${
                  playbackMode === "qaida"
                    ? "bg-[#0d7a5f] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                নূরানী কায়েদা হরফ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW 1: ORGAN TABS VIEW (Anatomical Diagram + Organ Sub-zones) ── */}
      {activeTab === "organ" && (
        <>
          {/* Onosaee Child-Friendly "মাখরাজ কি?" Educational Card */}
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200">
                  মাখরাজ কি? (উচ্চারণের মূল স্থানসমূহ)
                </h4>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 font-medium leading-relaxed mt-0.5">
                  মাখরাজ হলো আরবি হরফ শুদ্ধভাবে উচ্চারণের স্থান। কণ্ঠনালী, জিহ্বা, ঠোঁট, মুখের ভেতর ও নাকের বাঁশি — এই ৫টি প্রধান অঙ্গের ১৭টি নির্দিষ্ট স্থান থেকে ২৯টি হরফ উচ্চারিত হয়।
                </p>
              </div>
            </div>
          </div>

          {/* 5 Major Organ Zone Tabs */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-4">
            {MAKHRAJ_ZONES.map((zone) => {
              const isActive = zone.id === activeZoneId;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZoneId(zone.id);
                    if (onZoneChange) onZoneChange(zone.id);
                    setSelectedLetter(zone.subZones[0].letters[0]);
                  }}
                  className={`py-2 px-1 text-center rounded-2xl transition-all duration-200 text-xs border relative overflow-hidden cursor-pointer active:scale-95 ${
                    isActive
                      ? "text-white font-extrabold shadow-md scale-102"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-900"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${zone.color}, ${zone.color}dd)`,
                          borderColor: zone.color,
                          boxShadow: `0 4px 12px ${zone.glowColor}`,
                        }
                      : {}
                  }
                >
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"
                    />
                  )}
                  <div
                    className="text-xs sm:text-sm font-extrabold truncate"
                  >
                    {zone.nameBn.split("(")[0].trim()}
                  </div>
                  <div className="text-[10px] sm:text-xs opacity-90 font-serif hidden sm:block mt-0.5">
                    {zone.nameAr}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Anatomical + Sub-zone Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            {/* Left: High-Definition Anatomical Articulation Viewer */}
            <div className="md:col-span-5 bg-slate-950/90 rounded-2xl p-3 border border-slate-800/90 flex flex-col justify-between relative overflow-hidden shadow-xl">
              {/* Header inside Diagram Card */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                  style={{
                    color: activeZone.color,
                    borderColor: `${activeZone.color}50`,
                    background: `${activeZone.color}15`,
                  }}
                >
                  <Eye className="w-3 h-3" />
                  <span>{activeZone.nameBn.split("(")[0].trim()}</span>
                </span>

                {/* View Switcher: High-Def Medical Illustration vs Vector Diagram */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDiagramMode("illustration")}
                    title="তাজবীদ অ্যানাটমিক্যাল রঙিন চিত্র"
                    className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all flex items-center gap-1 ${
                      diagramMode === "illustration"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>চিত্ররূপ</span>
                  </button>
                  <button
                    onClick={() => setDiagramMode("vector")}
                    title="ভেক্টর অ্যানাটমিক্যাল ম্যাপ"
                    className={`px-2 py-0.5 text-[10px] rounded font-medium transition-all flex items-center gap-1 ${
                      diagramMode === "vector"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>ভেক্টর</span>
                  </button>
                </div>
              </div>

              {/* Display Viewport: Illustration Image or Vector Map */}
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[220px] max-h-[260px] group">
                {diagramMode === "illustration" ? (
                  <div
                    className="relative w-full h-[230px] cursor-pointer overflow-hidden flex items-center justify-center bg-black/40"
                    onClick={() => setIsZoomOpen(true)}
                  >
                    <Image
                      src={currentOrganImage.src}
                      alt={currentOrganImage.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>পূর্ণাঙ্গ চিত্র দেখতে ক্লিক করুন</span>
                      </span>
                    </div>

                    {/* Bottom Title Pill */}
                    <div className="absolute bottom-1.5 left-2 right-2 text-center pointer-events-none">
                      <span className="bg-slate-950/80 text-[10px] text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 shadow-sm backdrop-blur-sm truncate inline-block max-w-full">
                        {currentOrganImage.titleBn}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[200px] h-[220px] flex items-center justify-center">
                    <AnatomicalVectorDiagram activeZoneId={activeZoneId} />
                  </div>
                )}
              </div>

              {/* Dedicated Precision Articulation Posture Guide (অঙ্গ-ভঙ্গি ও স্পর্শবিন্দু) */}
              <div
                className="rounded-xl p-3 border mt-2"
                style={{
                  background: `${activeZone.color}15`,
                  borderColor: `${activeZone.color}35`,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs sm:text-sm font-bold flex items-center gap-1.5"
                    style={{ color: activeZone.color }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>অঙ্গ-ভঙ্গি ও স্পর্শবিন্দু:</span>
                  </span>
                  <span className="text-xs sm:text-sm text-amber-300 font-serif font-bold">
                    {letterDetails.contactAr}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                  {letterDetails.postureBn}
                </p>
              </div>
            </div>

            {/* Right: Sub-zone Letters & Articulation Details */}
            <div className="md:col-span-7 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm text-emerald-900 font-bold mb-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl">
                  <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>হরফ নির্বাচন করুন ও ক্বারীর মশক্ব শুনুন:</span>
                </div>

                {/* Subzone Letter Pills */}
                <div className="space-y-2.5">
                  {activeZone.subZones.map((sz, szIdx) => {
                    const isSubZoneActive = sz.letters.includes(selectedLetter);
                    return (
                      <div
                        key={szIdx}
                        className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-200 border ${
                          isSubZoneActive
                            ? "bg-amber-50/80 border-2 border-amber-400 shadow-xs ring-1 ring-amber-300"
                            : "bg-[#faf8f2] border-emerald-100/80 hover:bg-white hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
                                isSubZoneActive
                                  ? "bg-amber-500 scale-125 shadow-xs animate-pulse"
                                  : "bg-emerald-600"
                              }`}
                            />
                            <h5
                              className={`text-sm sm:text-[15px] font-bold tracking-normal transition-colors ${
                                isSubZoneActive
                                  ? "text-amber-950 font-extrabold"
                                  : "text-slate-800"
                              }`}
                            >
                              {sz.nameBn}
                            </h5>
                          </div>
                          {isSubZoneActive && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold hidden sm:inline-block">
                              নির্বাচিত মাখরাজ
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sz.letters.map((letter) => {
                            const isSelected = letter === selectedLetter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleLetterClick(letter)}
                                className={`h-11 min-w-[44px] px-3.5 rounded-2xl font-serif text-lg sm:text-xl font-bold transition-all duration-150 flex items-center justify-center border cursor-pointer ${
                                  isSelected
                                    ? "text-white border-opacity-90 scale-110 shadow-md ring-2"
                                    : "bg-white text-slate-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 hover:text-[#0d7a5f] shadow-xs"
                                }`}
                                style={
                                  isSelected
                                    ? {
                                        background: `linear-gradient(135deg, ${activeZone.color}ee, ${activeZone.color}aa)`,
                                        borderColor: activeZone.color,
                                        boxShadow: `0 0 14px ${activeZone.glowColor}`,
                                        ringColor: activeZone.color,
                                      }
                                    : {}
                                }
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-zone Rule Description */}
              <div
                className="rounded-2xl p-3 sm:p-3.5 border mt-2"
                style={{
                  background: `${activeZone.color}10`,
                  borderColor: `${activeZone.color}30`,
                }}
              >
                <div
                  className="text-sm sm:text-base font-bold mb-1 flex items-center gap-2"
                  style={{ color: activeZone.color }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{activeSubZone?.nameBn}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {activeSubZone?.ruleBn}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── VIEW 2: ALL 29 LETTERS QUICK GRID ── */}
      {activeTab === "all29" && (
        <div className="mb-4">
          <div className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>আরবি ২৯টি হরফের পূর্ণ তালিকা (মাখরাজ অনুযায়ী নির্দেশিত):</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {ALL_29_LETTERS.map((letter) => {
              const details = LETTER_MAKHRAJ_DATABASE[letter];
              const isSelected = letter === selectedLetter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-emerald-950/90 border-emerald-400 text-white scale-105 shadow-lg ring-2 ring-emerald-400"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="font-serif text-2xl font-bold">{letter}</span>
                  <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                    {details?.nameBn || letter}
                  </span>
                  <span className="text-[8px] text-emerald-400/90 font-mono mt-0.5 truncate max-w-full">
                    {details?.organNameBn?.split("(")[0]?.trim() || "মাখরাজ"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LETTER TAJWEED SHOWCASE & AUDIO PLAYER CARD ── */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mt-2">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Letter Visual & Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-3xl font-bold border shadow-inner"
              style={{
                color: activeZone.color,
                borderColor: `${activeZone.color}60`,
                background: `${activeZone.color}15`,
                textShadow: `0 0 10px ${activeZone.glowColor}`,
              }}
            >
              {selectedLetter}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  হরফ: <span className="text-amber-300">{letterDetails.nameBn}</span> ({letterDetails.nameAr})
                </h4>
                <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 font-bold">
                  মাখরাজ নং {letterDetails.makhrajNo || "—"}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 mt-1 font-medium">
                <span className="text-emerald-400 font-bold">উচ্চারণের স্থান:</span>{" "}
                <span className="text-amber-200 font-bold">{letterDetails.makhrajNameBn}</span>
              </p>
            </div>
          </div>

          {/* Audio Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Primary Action Button: Qari Quranic Ayah Mashq */}
            <button
              onClick={() => {
                if (playingAudio && currentAudioType === "qari") {
                  stopCurrentAudio();
                } else {
                  playQariMashqAudio(selectedLetter);
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
            >
              {playingAudio && currentAudioType === "qari" ? (
                <>
                  <Pause className="w-4 h-4 animate-pulse text-amber-300" />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-200" />
                  <span>ক্বারীর মশক্ব ({currentShaykh.displayTitleBn})</span>
                </>
              )}
            </button>

            {/* Secondary Action Button: Noorani Qaida Letter Audio */}
            <button
              onClick={() => {
                if (playingAudio && currentAudioType === "qaida") {
                  stopCurrentAudio();
                } else {
                  playQaidaLetterAudio(selectedLetter);
                }
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              {playingAudio && currentAudioType === "qaida" ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-300" />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>নূরানী হরফ</span>
                </>
              )}
            </button>

            {playingAudio && (
              <button
                onClick={stopCurrentAudio}
                title="বন্ধ করুন"
                className="p-2 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-all"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── QURANIC MASHQ BENCHMARK VERSE ── */}
        <div className="mt-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>কুরআনিক নমুনা আয়াত ও মাখরাজ মশক্ব ({currentShaykh.nameBn}):</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {letterDetails.surahNameBn}
            </span>
          </div>

          {/* Arabic Ayah Box with Glowing Highlight */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-serif text-amber-200/90 leading-loose tracking-wide">
              {letterDetails.verseAr}
            </div>
            <div className="text-xs text-slate-300 mt-2 font-sans italic">
              &quot;{letterDetails.verseBn}&quot;
            </div>
          </div>

          {/* Sifat & Practical Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-slate-400 font-medium block mb-0.5">হরফের সিফাত (বৈশিষ্ট্য):</span>
              <span className="text-slate-200 leading-relaxed">{letterDetails.sifatBn}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5">
              <span className="text-emerald-400 font-medium block mb-0.5">মশক্ব ও উচ্চারণ টিপস:</span>
              <span className="text-slate-300 leading-relaxed">{letterDetails.tipsBn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ZOOM MODAL FOR TAJWEED ANATOMY ILLUSTRATION ── */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  {currentOrganImage.titleBn} — {currentOrganImage.titleAr}
                </h4>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="relative w-full h-[60vh] max-h-[550px] bg-black flex items-center justify-center p-2">
              <Image
                src={currentOrganImage.src}
                alt={currentOrganImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 95vw, 800px"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>{currentOrganImage.captionBn}</span>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs shadow-sm"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
