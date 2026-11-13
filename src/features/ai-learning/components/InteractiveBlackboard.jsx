"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  RotateCcw,
  Eraser,
  PenTool,
  Download,
  Eye,
  EyeOff,
  Award,
  ArrowRight,
  CheckCircle2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import {
  playArabicSound,
  playMaShaAllahCelebration,
  playStarPopSound,
} from "../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../lib/confetti";

// ── 29 ARABIC ALPHABET WITH FORMS ──
const ARABIC_ALPHABET = [
  { ar: "ا", nameBn: "আলিফ", nameEn: "Alif", forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { ar: "ب", nameBn: "বা", nameEn: "Ba", forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { ar: "ت", nameBn: "তা", nameEn: "Ta", forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" } },
  { ar: "ث", nameBn: "ছা", nameEn: "Tha", forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { ar: "ج", nameBn: "জীম", nameEn: "Jeem", forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { ar: "ح", nameBn: "হা", nameEn: "Haa", forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { ar: "خ", nameBn: "খা", nameEn: "Kha", forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { ar: "د", nameBn: "দাল", nameEn: "Dal", forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { ar: "ذ", nameBn: "যাল", nameEn: "Dhal", forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { ar: "ر", nameBn: "রা", nameEn: "Ra", forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { ar: "ز", nameBn: "যা", nameEn: "Zay", forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { ar: "س", nameBn: "সীন", nameEn: "Seen", forms: { isolated: "س", initial: "সـ", medial: "ـسـ", final: "ـس" } },
  { ar: "ش", nameBn: "শীন", nameEn: "Sheen", forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" } },
  { ar: "ص", nameBn: "ছোয়াদ", nameEn: "Saad", forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" } },
  { ar: "ض", nameBn: "দোয়াদ", nameEn: "Daad", forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" } },
  { ar: "ط", nameBn: "ত্বোয়া", nameEn: "Taa", forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" } },
  { ar: "ظ", nameBn: "যোয়া", nameEn: "Dhaa", forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" } },
  { ar: "ع", nameBn: "আইন", nameEn: "Ayn", forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" } },
  { ar: "غ", nameBn: "গইন", nameEn: "Ghayn", forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" } },
  { ar: "ف", nameBn: "ফা", nameEn: "Fa", forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" } },
  { ar: "ق", nameBn: "ক্বাফ", nameEn: "Qaaf", forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" } },
  { ar: "ك", nameBn: "কাফ", nameEn: "Kaaf", forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" } },
  { ar: "ل", nameBn: "লাম", nameEn: "Laam", forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" } },
  { ar: "م", nameBn: "মীম", nameEn: "Meem", forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" } },
  { ar: "ن", nameBn: "নূন", nameEn: "Noon", forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" } },
  { ar: "و", nameBn: "ওয়াও", nameEn: "Waw", forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" } },
  { ar: "هـ", nameBn: "হা", nameEn: "Haa", forms: { isolated: "هـ", initial: "هـ", medial: "ـهـ", final: "ـه" } },
  { ar: "ء", nameBn: "হামযাহ", nameEn: "Hamzah", forms: { isolated: "ء", initial: "ء", medial: "ء", final: "ء" } },
  { ar: "ي", nameBn: "ইয়া", nameEn: "Yaa", forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } }
];

// ── 5 HARAKAT (DIACRITICS) ──
const HARAKAT_LIST = [
  { id: "none", labelBn: "হরকত ছাড়া", labelEn: "None", labelAr: "بدون حركة", symbol: "" },
  { id: "fathah", labelBn: "যবর (—َ)", labelEn: "Fathah", labelAr: "فَتْحَة", symbol: "َ" },
  { id: "kasrah", labelBn: "যের (—ِ)", labelEn: "Kasrah", labelAr: "كَسْرَة", symbol: "ِ" },
  { id: "dammah", labelBn: "পেশ (—ُ)", labelEn: "Dammah", labelAr: "ضَمَّة", symbol: "ُ" },
  { id: "sukoon", labelBn: "সাকিন (—ْ)", labelEn: "Sukoon", labelAr: "سُكُون", symbol: "ْ" }
];

const HARAKAT_PRONUNCIATION_MAP = {
  "ا": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ب": { fathah: "বা", kasrah: "বি", dammah: "বু", sukoon: "আব্" },
  "ت": { fathah: "তা", kasrah: "তি", dammah: "তু", sukoon: "আৎ" },
  "ث": { fathah: "ছা", kasrah: "ছি", dammah: "ছু", sukoon: "আছ্" },
  "ج": { fathah: "জা", kasrah: "জি", dammah: "জু", sukoon: "আজ্" },
  "ح": { fathah: "হা", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "خ": { fathah: "খা", kasrah: "খি", dammah: "খু", sukoon: "আখ্" },
  "د": { fathah: "দা", kasrah: "দি", dammah: "দু", sukoon: "আদ্" },
  "ذ": { fathah: "যা", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "ر": { fathah: "র", kasrah: "রি", dammah: "রু", sukoon: "আর্" },
  "ز": { fathah: "যা", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "س": { fathah: "সা", kasrah: "সি", dammah: "সু", sukoon: "আস্" },
  "ش": { fathah: "শা", kasrah: "শি", dammah: "শু", sukoon: "আশ্" },
  "ص": { fathah: "ছ", kasrah: "ছি", dammah: "ছু", sukoon: "আছ্" },
  "ض": { fathah: "দ", kasrah: "দি", dammah: "দু", sukoon: "আদ্" },
  "ط": { fathah: "ত্ব", kasrah: "ত্বি", dammah: "ত্বু", sukoon: "আত্ব্" },
  "ظ": { fathah: "য্ব", kasrah: "য্বি", dammah: "য্বু", sukoon: "আয্ব্" },
  "ع": { fathah: "আ'", kasrah: "ই'", dammah: "উ'", sukoon: "আ'" },
  "غ": { fathah: "গ", kasrah: "গি", dammah: "গু", sukoon: "আগ্" },
  "ف": { fathah: "ফা", kasrah: "ফি", dammah: "ফু", sukoon: "আফ্" },
  "ق": { fathah: "ক্বা", kasrah: "ক্বি", dammah: "ক্বু", sukoon: "আক্ব্" },
  "ك": { fathah: "কা", kasrah: "কি", dammah: "কু", sukoon: "আক্" },
  "ل": { fathah: "লা", kasrah: "লি", dammah: "লু", sukoon: "আল্" },
  "م": { fathah: "মা", kasrah: "মি", dammah: "মু", sukoon: "আম্" },
  "ن": { fathah: "না", kasrah: "নি", dammah: "নু", sukoon: "আন্" },
  "و": { fathah: "ওয়া", kasrah: "ওয়ি", dammah: "উ", sukoon: "আও" },
  "هـ": { fathah: "হা", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "ء": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ي": { fathah: "ইয়া", kasrah: "য়ি", dammah: "য়ু", sukoon: "আই" },
};

// ── 🎨 ALL 29 AUTHENTIC ARABIC LETTERS (PRECISELY CALIBRATED TO AMIRI CALLIGRAPHY) ──
// ViewBox 0 0 900 560 | Center: (450, 280)
const ARABIC_TRACING_PATHS = {
  "ا": {
    "ar": "ا",
    "nameBn": "আলিফ",
    "scale": 1.15,
    "fontSize": 350,
    "y": 380,
    "path": "M 449 145 L 449 375",
    "arrow": "⬇️",
    "arrowText": "ওপর থেকে সোজা নিচে নামুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 449,
        "y": 145,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 449,
        "y": 205,
        "pct": 0.25,
        "label": "২"
      },
      {
        "x": 449,
        "y": 265,
        "pct": 0.5,
        "label": "৩"
      },
      {
        "x": 449,
        "y": 320,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 449,
        "y": 375,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ب": {
    "ar": "ب",
    "nameBn": "বা",
    "scale": 1.25,
    "fontSize": 340,
    "y": 375,
    "path": "M 575 260 C 565 340, 530 365, 450 365 C 370 365, 335 340, 325 260",
    "arrow": "↙️",
    "arrowText": "ডান থেকে বাঁয়ে টেনে নিচে ১টি নুকতা দিন",
    "dots": [
      {
        "x": 450,
        "y": 440,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 575,
        "y": 260,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 550,
        "y": 345,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 450,
        "y": 365,
        "pct": 0.5,
        "label": "৩"
      },
      {
        "x": 350,
        "y": 345,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 325,
        "y": 260,
        "pct": 0.9,
        "label": "৫"
      },
      {
        "x": 450,
        "y": 440,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ت": {
    "ar": "ت",
    "nameBn": "তা",
    "scale": 1.25,
    "fontSize": 340,
    "y": 375,
    "path": "M 575 260 C 565 340, 530 365, 450 365 C 370 365, 335 340, 325 260",
    "arrow": "↙️",
    "arrowText": "ডান থেকে বাঁয়ে টেনে উপরে ২টি নুকতা দিন",
    "dots": [
      {
        "x": 430,
        "y": 215
      },
      {
        "x": 470,
        "y": 215
      }
    ],
    "checkpoints": [
      {
        "x": 575,
        "y": 260,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 550,
        "y": 345,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 450,
        "y": 365,
        "pct": 0.5,
        "label": "৩"
      },
      {
        "x": 350,
        "y": 345,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 325,
        "y": 260,
        "pct": 0.88,
        "label": "৫"
      },
      {
        "x": 450,
        "y": 215,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ث": {
    "ar": "ث",
    "nameBn": "ছা",
    "scale": 1.25,
    "fontSize": 340,
    "y": 375,
    "path": "M 575 260 C 565 340, 530 365, 450 365 C 370 365, 335 340, 325 260",
    "arrow": "↙️",
    "arrowText": "ডান থেকে বাঁয়ে টেনে উপরে ৩টি নুকতা দিন",
    "dots": [
      {
        "x": 450,
        "y": 180
      },
      {
        "x": 430,
        "y": 215
      },
      {
        "x": 470,
        "y": 215
      }
    ],
    "checkpoints": [
      {
        "x": 575,
        "y": 260,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 550,
        "y": 345,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 450,
        "y": 365,
        "pct": 0.5,
        "label": "৩"
      },
      {
        "x": 350,
        "y": 345,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 325,
        "y": 260,
        "pct": 0.88,
        "label": "৫"
      },
      {
        "x": 450,
        "y": 195,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ج": {
    "ar": "ج",
    "nameBn": "জীম",
    "scale": 1.1,
    "fontSize": 350,
    "y": 370,
    "path": "M 390 295 C 430 280, 510 275, 580 280 C 530 310, 460 325, 420 340 C 375 375, 370 440, 420 500 C 470 540, 540 535, 580 505",
    "arrow": "➡️",
    "arrowText": "ভ্রু ডানে গিয়ে পেটের ভেতর গোল ঘুরে আসুন",
    "dots": [
      {
        "x": 475,
        "y": 430,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 390,
        "y": 295,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 485,
        "y": 280,
        "pct": 0.18,
        "label": "২"
      },
      {
        "x": 580,
        "y": 280,
        "pct": 0.35,
        "label": "৩"
      },
      {
        "x": 430,
        "y": 335,
        "pct": 0.52,
        "label": "৪"
      },
      {
        "x": 375,
        "y": 430,
        "pct": 0.7,
        "label": "৫"
      },
      {
        "x": 460,
        "y": 520,
        "pct": 0.88,
        "label": "৬"
      },
      {
        "x": 580,
        "y": 505,
        "pct": 0.95,
        "label": "৭"
      },
      {
        "x": 475,
        "y": 430,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ح": {
    "ar": "ح",
    "nameBn": "হা",
    "scale": 1.1,
    "fontSize": 350,
    "y": 370,
    "path": "M 390 295 C 430 280, 510 275, 580 280 C 530 310, 460 325, 420 340 C 375 375, 370 440, 420 500 C 470 540, 540 535, 580 505",
    "arrow": "➡️",
    "arrowText": "ভ্রু ডানে গিয়ে পেটের ভেতর গোল ঘুরে আসুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 390,
        "y": 295,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 485,
        "y": 280,
        "pct": 0.18,
        "label": "২"
      },
      {
        "x": 580,
        "y": 280,
        "pct": 0.35,
        "label": "৩"
      },
      {
        "x": 430,
        "y": 335,
        "pct": 0.52,
        "label": "৪"
      },
      {
        "x": 375,
        "y": 430,
        "pct": 0.7,
        "label": "৫"
      },
      {
        "x": 460,
        "y": 520,
        "pct": 0.88,
        "label": "৬"
      },
      {
        "x": 580,
        "y": 505,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "خ": {
    "ar": "خ",
    "nameBn": "খা",
    "scale": 1.1,
    "fontSize": 350,
    "y": 370,
    "path": "M 390 295 C 430 280, 510 275, 580 280 C 530 310, 460 325, 420 340 C 375 375, 370 440, 420 500 C 470 540, 540 535, 580 505",
    "arrow": "➡️",
    "arrowText": "ভ্রু ডানে গিয়ে পেটের ভেতর ঘুরে মাথায় নুকতা দিন",
    "dots": [
      {
        "x": 490,
        "y": 220,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 390,
        "y": 295,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 485,
        "y": 280,
        "pct": 0.18,
        "label": "২"
      },
      {
        "x": 580,
        "y": 280,
        "pct": 0.35,
        "label": "৩"
      },
      {
        "x": 430,
        "y": 335,
        "pct": 0.52,
        "label": "৪"
      },
      {
        "x": 375,
        "y": 430,
        "pct": 0.7,
        "label": "৫"
      },
      {
        "x": 460,
        "y": 520,
        "pct": 0.88,
        "label": "৬"
      },
      {
        "x": 580,
        "y": 505,
        "pct": 0.95,
        "label": "৭"
      },
      {
        "x": 490,
        "y": 220,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "د": {
    "ar": "د",
    "nameBn": "দাল",
    "scale": 1.45,
    "fontSize": 340,
    "y": 375,
    "path": "M 495 255 C 480 300, 465 340, 445 365 C 430 368, 415 368, 405 365",
    "arrow": "↙️",
    "arrowText": "ওপর থেকে কোণায় নেমে বাঁয়ে সোজা যান",
    "dots": [],
    "checkpoints": [
      {
        "x": 495,
        "y": 255,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 475,
        "y": 315,
        "pct": 0.35,
        "label": "২"
      },
      {
        "x": 445,
        "y": 365,
        "pct": 0.7,
        "label": "৩"
      },
      {
        "x": 405,
        "y": 365,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ذ": {
    "ar": "ذ",
    "nameBn": "যাল",
    "scale": 1.45,
    "fontSize": 340,
    "y": 375,
    "path": "M 495 255 C 480 300, 465 340, 445 365 C 430 368, 415 368, 405 365",
    "arrow": "↙️",
    "arrowText": "ওপর থেকে কোণায় নেমে বাঁয়ে গিয়ে ১টি নুকতা দিন",
    "dots": [
      {
        "x": 450,
        "y": 185,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 495,
        "y": 255,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 475,
        "y": 315,
        "pct": 0.35,
        "label": "২"
      },
      {
        "x": 445,
        "y": 365,
        "pct": 0.7,
        "label": "৩"
      },
      {
        "x": 405,
        "y": 365,
        "pct": 0.9,
        "label": "৪"
      },
      {
        "x": 450,
        "y": 185,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ر": {
    "ar": "ر",
    "nameBn": "রা",
    "scale": 1.35,
    "fontSize": 340,
    "y": 375,
    "path": "M 490 285 C 480 340, 455 410, 420 445 C 390 460, 365 460, 355 455",
    "arrow": "↙️",
    "arrowText": "ওপর থেকে সুন্দর করে বাঁকা হয়ে নিচে নামুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 490,
        "y": 285,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 475,
        "y": 350,
        "pct": 0.33,
        "label": "২"
      },
      {
        "x": 435,
        "y": 435,
        "pct": 0.7,
        "label": "৩"
      },
      {
        "x": 355,
        "y": 455,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ز": {
    "ar": "ز",
    "nameBn": "যা",
    "scale": 1.35,
    "fontSize": 340,
    "y": 375,
    "path": "M 490 285 C 480 340, 455 410, 420 445 C 390 460, 365 460, 355 455",
    "arrow": "↙️",
    "arrowText": "বাঁকা হয়ে নিচে নেমে মাথায় ১টি নুকতা দিন",
    "dots": [
      {
        "x": 470,
        "y": 205,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 490,
        "y": 285,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 475,
        "y": 350,
        "pct": 0.33,
        "label": "২"
      },
      {
        "x": 435,
        "y": 435,
        "pct": 0.7,
        "label": "৩"
      },
      {
        "x": 355,
        "y": 455,
        "pct": 0.9,
        "label": "৪"
      },
      {
        "x": 470,
        "y": 205,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "س": {
    "ar": "س",
    "nameBn": "সীন",
    "scale": 1.2,
    "fontSize": 340,
    "y": 370,
    "path": "M 590 260 C 585 305, 565 310, 555 265 C 545 305, 520 310, 500 270 C 470 360, 430 450, 375 450 C 335 450, 310 400, 310 345",
    "arrow": "↙️",
    "arrowText": "তিন দাঁত এঁকে নিচে গভীর পেয়ালা বানান",
    "dots": [],
    "checkpoints": [
      {
        "x": 590,
        "y": 260,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 555,
        "y": 265,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 500,
        "y": 270,
        "pct": 0.4,
        "label": "৩"
      },
      {
        "x": 445,
        "y": 390,
        "pct": 0.65,
        "label": "৪"
      },
      {
        "x": 375,
        "y": 450,
        "pct": 0.85,
        "label": "৫"
      },
      {
        "x": 310,
        "y": 345,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ش": {
    "ar": "ش",
    "nameBn": "শীন",
    "scale": 1.2,
    "fontSize": 340,
    "y": 370,
    "path": "M 590 260 C 585 305, 565 310, 555 265 C 545 305, 520 310, 500 270 C 470 360, 430 450, 375 450 C 335 450, 310 400, 310 345",
    "arrow": "↙️",
    "arrowText": "তিন দাঁত ও পেয়ালা এঁকে উপরে ৩টি নুকতা দিন",
    "dots": [
      {
        "x": 545,
        "y": 160
      },
      {
        "x": 525,
        "y": 195
      },
      {
        "x": 565,
        "y": 195
      }
    ],
    "checkpoints": [
      {
        "x": 590,
        "y": 260,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 555,
        "y": 265,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 500,
        "y": 270,
        "pct": 0.4,
        "label": "৩"
      },
      {
        "x": 445,
        "y": 390,
        "pct": 0.65,
        "label": "৪"
      },
      {
        "x": 375,
        "y": 450,
        "pct": 0.85,
        "label": "৫"
      },
      {
        "x": 310,
        "y": 345,
        "pct": 0.92,
        "label": "৬"
      },
      {
        "x": 545,
        "y": 180,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ص": {
    "ar": "ص",
    "nameBn": "ছোয়াদ",
    "scale": 1.1,
    "fontSize": 340,
    "y": 370,
    "path": "M 500 330 C 540 280, 600 280, 625 320 C 600 335, 540 335, 490 290 C 460 380, 420 455, 360 455 C 310 455, 275 400, 275 345",
    "arrow": "↗️",
    "arrowText": "ডিম্বাকৃতি লুপ এঁকে দাঁত ও পেয়ালা বানান",
    "dots": [],
    "checkpoints": [
      {
        "x": 500,
        "y": 330,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 570,
        "y": 285,
        "pct": 0.2,
        "label": "২"
      },
      {
        "x": 625,
        "y": 320,
        "pct": 0.35,
        "label": "৩"
      },
      {
        "x": 490,
        "y": 290,
        "pct": 0.52,
        "label": "৪"
      },
      {
        "x": 430,
        "y": 400,
        "pct": 0.72,
        "label": "৫"
      },
      {
        "x": 360,
        "y": 455,
        "pct": 0.88,
        "label": "৬"
      },
      {
        "x": 275,
        "y": 345,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ض": {
    "ar": "ض",
    "nameBn": "দোয়াদ",
    "scale": 1.1,
    "fontSize": 340,
    "y": 370,
    "path": "M 500 330 C 540 280, 600 280, 625 320 C 600 335, 540 335, 490 290 C 460 380, 420 455, 360 455 C 310 455, 275 400, 275 345",
    "arrow": "↗️",
    "arrowText": "লুপ ও পেয়ালা এঁকে দাঁতের মাথায় ১টি নুকতা দিন",
    "dots": [
      {
        "x": 510,
        "y": 205,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 500,
        "y": 330,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 570,
        "y": 285,
        "pct": 0.2,
        "label": "২"
      },
      {
        "x": 625,
        "y": 320,
        "pct": 0.35,
        "label": "৩"
      },
      {
        "x": 490,
        "y": 290,
        "pct": 0.52,
        "label": "৪"
      },
      {
        "x": 430,
        "y": 400,
        "pct": 0.72,
        "label": "৫"
      },
      {
        "x": 360,
        "y": 455,
        "pct": 0.88,
        "label": "৬"
      },
      {
        "x": 275,
        "y": 345,
        "pct": 0.94,
        "label": "৭"
      },
      {
        "x": 510,
        "y": 205,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ط": {
    "ar": "ط",
    "nameBn": "তোয়া",
    "scale": 1.2,
    "fontSize": 340,
    "y": 370,
    "path": "M 450 355 C 490 315, 540 315, 555 350 C 530 365, 460 365, 350 365 M 430 135 L 430 365",
    "arrow": "⬇️",
    "arrowText": "লুপ এঁকে ওপর থেকে সোজা লাঠি নামান",
    "dots": [],
    "checkpoints": [
      {
        "x": 430,
        "y": 135,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 430,
        "y": 250,
        "pct": 0.3,
        "label": "২"
      },
      {
        "x": 430,
        "y": 365,
        "pct": 0.55,
        "label": "৩"
      },
      {
        "x": 495,
        "y": 325,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 555,
        "y": 350,
        "pct": 0.88,
        "label": "৫"
      },
      {
        "x": 350,
        "y": 365,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ظ": {
    "ar": "ظ",
    "nameBn": "যোয়া",
    "scale": 1.2,
    "fontSize": 340,
    "y": 370,
    "path": "M 450 355 C 490 315, 540 315, 555 350 C 530 365, 460 365, 350 365 M 430 135 L 430 365",
    "arrow": "⬇️",
    "arrowText": "তোয়া এঁকে লাঠির ডানে ১টি নুকতা দিন",
    "dots": [
      {
        "x": 470,
        "y": 230,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 430,
        "y": 135,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 430,
        "y": 250,
        "pct": 0.3,
        "label": "২"
      },
      {
        "x": 430,
        "y": 365,
        "pct": 0.55,
        "label": "৩"
      },
      {
        "x": 495,
        "y": 325,
        "pct": 0.75,
        "label": "৪"
      },
      {
        "x": 555,
        "y": 350,
        "pct": 0.88,
        "label": "৫"
      },
      {
        "x": 350,
        "y": 365,
        "pct": 0.94,
        "label": "৬"
      },
      {
        "x": 470,
        "y": 230,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ع": {
    "ar": "ع",
    "nameBn": "আইন",
    "scale": 1.1,
    "fontSize": 340,
    "y": 370,
    "path": "M 535 240 C 490 225, 465 245, 490 280 C 445 325, 390 390, 420 480 C 460 535, 540 530, 590 510",
    "arrow": "↙️",
    "arrowText": "ছোট মাথা এঁকে নিচে বড় পেট ঘুরিয়ে আনুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 535,
        "y": 240,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 480,
        "y": 230,
        "pct": 0.2,
        "label": "২"
      },
      {
        "x": 495,
        "y": 280,
        "pct": 0.38,
        "label": "৩"
      },
      {
        "x": 410,
        "y": 390,
        "pct": 0.6,
        "label": "৪"
      },
      {
        "x": 440,
        "y": 505,
        "pct": 0.82,
        "label": "৫"
      },
      {
        "x": 590,
        "y": 510,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "غ": {
    "ar": "غ",
    "nameBn": "গাইন",
    "scale": 1.1,
    "fontSize": 340,
    "y": 370,
    "path": "M 535 240 C 490 225, 465 245, 490 280 C 445 325, 390 390, 420 480 C 460 535, 540 530, 590 510",
    "arrow": "↙️",
    "arrowText": "আইন এঁকে মাথায় ১টি নুকতা দিন",
    "dots": [
      {
        "x": 490,
        "y": 175,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 535,
        "y": 240,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 480,
        "y": 230,
        "pct": 0.2,
        "label": "২"
      },
      {
        "x": 495,
        "y": 280,
        "pct": 0.38,
        "label": "৩"
      },
      {
        "x": 410,
        "y": 390,
        "pct": 0.6,
        "label": "৪"
      },
      {
        "x": 440,
        "y": 505,
        "pct": 0.82,
        "label": "৫"
      },
      {
        "x": 590,
        "y": 510,
        "pct": 0.94,
        "label": "৬"
      },
      {
        "x": 490,
        "y": 175,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ف": {
    "ar": "ف",
    "nameBn": "ফা",
    "scale": 1.2,
    "fontSize": 340,
    "y": 375,
    "path": "M 550 250 C 575 220, 540 205, 520 235 C 515 285, 485 365, 420 365 C 365 365, 325 340, 315 270",
    "arrow": "🔄",
    "arrowText": "গোল মাথা ঘুরিয়ে বাঁয়ে বোট বানান",
    "dots": [
      {
        "x": 545,
        "y": 160,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 550,
        "y": 250,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 530,
        "y": 215,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 515,
        "y": 285,
        "pct": 0.4,
        "label": "৩"
      },
      {
        "x": 420,
        "y": 365,
        "pct": 0.68,
        "label": "৪"
      },
      {
        "x": 315,
        "y": 270,
        "pct": 0.9,
        "label": "৫"
      },
      {
        "x": 545,
        "y": 160,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ق": {
    "ar": "ق",
    "nameBn": "ক্বাফ",
    "scale": 1.2,
    "fontSize": 340,
    "y": 370,
    "path": "M 495 240 C 525 215, 490 200, 470 230 C 460 300, 425 435, 375 435 C 335 435, 355 355, 365 330",
    "arrow": "🔄",
    "arrowText": "গোল মাথা ঘুরিয়ে গভীর কাপ এঁকে ২টি নুকতা দিন",
    "dots": [
      {
        "x": 470,
        "y": 180
      },
      {
        "x": 510,
        "y": 180
      }
    ],
    "checkpoints": [
      {
        "x": 495,
        "y": 240,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 480,
        "y": 210,
        "pct": 0.22,
        "label": "২"
      },
      {
        "x": 460,
        "y": 290,
        "pct": 0.42,
        "label": "৩"
      },
      {
        "x": 410,
        "y": 425,
        "pct": 0.7,
        "label": "৪"
      },
      {
        "x": 365,
        "y": 330,
        "pct": 0.9,
        "label": "৫"
      },
      {
        "x": 490,
        "y": 180,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "ك": {
    "ar": "ك",
    "nameBn": "কাফ",
    "scale": 1.25,
    "fontSize": 340,
    "y": 375,
    "path": "M 515 115 L 515 315 C 500 365, 450 365, 365 365",
    "arrow": "⬇️",
    "arrowText": "ওপর থেকে নেমে বাঁয়ে ঘুরে যান",
    "dots": [
      {
        "x": 445,
        "y": 260,
        "label": "চিহ্ন"
      }
    ],
    "checkpoints": [
      {
        "x": 515,
        "y": 115,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 515,
        "y": 220,
        "pct": 0.3,
        "label": "২"
      },
      {
        "x": 515,
        "y": 320,
        "pct": 0.6,
        "label": "৩"
      },
      {
        "x": 440,
        "y": 365,
        "pct": 0.85,
        "label": "৪"
      },
      {
        "x": 365,
        "y": 365,
        "pct": 0.94,
        "label": "৫"
      },
      {
        "x": 445,
        "y": 260,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "চিহ্ন"
      }
    ]
  },
  "ل": {
    "ar": "ل",
    "nameBn": "লাম",
    "scale": 1.25,
    "fontSize": 340,
    "y": 370,
    "path": "M 505 125 L 505 310 C 505 385, 440 405, 395 395 C 375 375, 375 340, 380 325",
    "arrow": "⬇️",
    "arrowText": "ওপর থেকে সোজা নেমে নিচে বক্র কাপ বানান",
    "dots": [],
    "checkpoints": [
      {
        "x": 505,
        "y": 125,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 505,
        "y": 220,
        "pct": 0.3,
        "label": "২"
      },
      {
        "x": 505,
        "y": 315,
        "pct": 0.6,
        "label": "৩"
      },
      {
        "x": 450,
        "y": 395,
        "pct": 0.85,
        "label": "৪"
      },
      {
        "x": 380,
        "y": 325,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "م": {
    "ar": "م",
    "nameBn": "মীম",
    "scale": 1.2,
    "fontSize": 340,
    "y": 360,
    "path": "M 485 280 C 465 265, 440 280, 465 305 L 470 545",
    "arrow": "🔄",
    "arrowText": "মাথা গোল করে সোজা নিচে লম্বা টান দিন",
    "dots": [],
    "checkpoints": [
      {
        "x": 485,
        "y": 280,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 445,
        "y": 280,
        "pct": 0.25,
        "label": "২"
      },
      {
        "x": 468,
        "y": 305,
        "pct": 0.45,
        "label": "৩"
      },
      {
        "x": 470,
        "y": 420,
        "pct": 0.72,
        "label": "৪"
      },
      {
        "x": 470,
        "y": 545,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ن": {
    "ar": "ن",
    "nameBn": "নূন",
    "scale": 1.35,
    "fontSize": 340,
    "y": 370,
    "path": "M 515 275 C 515 385, 435 405, 385 275",
    "arrow": "↙️",
    "arrowText": "ডান থেকে নিচে গোল ঘুরে বাঁয়ে এসে নুকতা দিন",
    "dots": [
      {
        "x": 450,
        "y": 200,
        "label": "নুকতা"
      }
    ],
    "checkpoints": [
      {
        "x": 515,
        "y": 275,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 495,
        "y": 370,
        "pct": 0.35,
        "label": "২"
      },
      {
        "x": 450,
        "y": 395,
        "pct": 0.6,
        "label": "৩"
      },
      {
        "x": 385,
        "y": 275,
        "pct": 0.88,
        "label": "৪"
      },
      {
        "x": 450,
        "y": 200,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  },
  "و": {
    "ar": "و",
    "nameBn": "ওয়াও",
    "scale": 1.35,
    "fontSize": 340,
    "y": 375,
    "path": "M 465 305 C 485 275, 455 270, 440 295 C 450 355, 420 425, 360 450",
    "arrow": "🔄",
    "arrowText": "মাথা গোল করে বাঁকা হয়ে নিচে নামুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 465,
        "y": 305,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 455,
        "y": 275,
        "pct": 0.25,
        "label": "২"
      },
      {
        "x": 440,
        "y": 320,
        "pct": 0.5,
        "label": "৩"
      },
      {
        "x": 410,
        "y": 420,
        "pct": 0.78,
        "label": "৪"
      },
      {
        "x": 360,
        "y": 450,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ه": {
    "ar": "ه",
    "nameBn": "হা (গোল)",
    "scale": 1.45,
    "fontSize": 340,
    "y": 375,
    "path": "M 450 360 C 485 320, 465 275, 435 295 C 415 325, 435 360, 450 360",
    "arrow": "🔄",
    "arrowText": "নিচ থেকে ঘুরে গোল বৃত্ত আঁকুন",
    "dots": [],
    "checkpoints": [
      {
        "x": 450,
        "y": 360,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 480,
        "y": 310,
        "pct": 0.3,
        "label": "২"
      },
      {
        "x": 450,
        "y": 275,
        "pct": 0.6,
        "label": "৩"
      },
      {
        "x": 420,
        "y": 315,
        "pct": 0.85,
        "label": "৪"
      },
      {
        "x": 450,
        "y": 360,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ء": {
    "ar": "ء",
    "nameBn": "হামযা",
    "scale": 1.5,
    "fontSize": 340,
    "y": 370,
    "path": "M 480 290 C 450 275, 440 290, 465 325 L 420 370",
    "arrow": "↙️",
    "arrowText": "ছোট মাথা এঁকে বাঁয়ে তির্যক দাগ দিন",
    "dots": [],
    "checkpoints": [
      {
        "x": 480,
        "y": 290,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 445,
        "y": 280,
        "pct": 0.35,
        "label": "২"
      },
      {
        "x": 465,
        "y": 325,
        "pct": 0.7,
        "label": "৩"
      },
      {
        "x": 420,
        "y": 370,
        "pct": 1,
        "isEnd": true,
        "label": "শেষ"
      }
    ]
  },
  "ي": {
    "ar": "ي",
    "nameBn": "ইয়া",
    "scale": 1.15,
    "fontSize": 340,
    "y": 370,
    "path": "M 495 255 C 455 275, 480 305, 520 325 C 475 390, 420 460, 360 435 C 340 420, 345 375, 350 365",
    "arrow": "〰️",
    "arrowText": "হাঁসের গলার মতো এঁকে নিচে ২টি নুকতা দিন",
    "dots": [
      {
        "x": 430,
        "y": 495
      },
      {
        "x": 470,
        "y": 495
      }
    ],
    "checkpoints": [
      {
        "x": 495,
        "y": 255,
        "pct": 0,
        "isStart": true,
        "label": "১"
      },
      {
        "x": 460,
        "y": 280,
        "pct": 0.2,
        "label": "২"
      },
      {
        "x": 520,
        "y": 325,
        "pct": 0.4,
        "label": "৩"
      },
      {
        "x": 430,
        "y": 435,
        "pct": 0.68,
        "label": "৪"
      },
      {
        "x": 350,
        "y": 365,
        "pct": 0.9,
        "label": "৫"
      },
      {
        "x": 450,
        "y": 495,
        "pct": 1,
        "isEnd": true,
        "isDot": true,
        "label": "নুকতা"
      }
    ]
  }
};

const SVG_VIEWBOX_WIDTH = 900;
const SVG_VIEWBOX_HEIGHT = 560;

// Mascot Choices matching User Reference Images
const MASCOTS = [
  { id: "elephant", name: "হাতি ছানা", emoji: "🐘", item: "⚽" },
  { id: "lion", name: "সিংহ ছানা", emoji: "🦁", item: "🥩" },
  { id: "mouse", name: "ইঁদুর", emoji: "🐭", item: "🧀" },
  { id: "camel", name: "মরু উট", emoji: "🐪", item: "🍈" },
];

export default function InteractiveBlackboard({ onCompleteExercise: _onCompleteExercise }) {
  const { t, isRTL: _isRTL, dir, lang } = useLearningLanguage();

  const [selectedLetter, setSelectedLetter] = useState(ARABIC_ALPHABET[0]); // Default 'Alif' (as user requested)
  const [selectedForm, setSelectedForm] = useState("isolated");
  const [selectedHarakat, setSelectedHarakat] = useState("none");

  // Mode: "trace" (Default, strictly bounded inside two walls) vs "freehand"
  const [boardMode, setBoardMode] = useState("trace");

  // Chalk & Duster Tools
  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("#fbbf24"); // Rich golden amber
  const [penWidth, setPenWidth] = useState(10);
  const [showGuide, setShowGuide] = useState(true);

  // Mascot Selection
  const [selectedMascotIndex, setSelectedMascotIndex] = useState(0);

  // Bounded Tracing State: tracks how many checkpoints have been reached (0..N-1)
  const [reachedIndex, setReachedIndex] = useState(-1);
  const [fillProgress, setFillProgress] = useState(0); // 0 to 1

  // Gamification & Celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });

  const boardContainerRef = useRef(null);
  const svgRef = useRef(null);
  const fullPathRef = useRef(null);
  const drawCanvasRef = useRef(null);

  const isDraggingRef = useRef(false);
  const isFreehandDrawingRef = useRef(false);
  const lastFreehandPointRef = useRef({ x: 0, y: 0 });
  const isCelebrationFiredRef = useRef(false);
  const [totalPathLength, setTotalPathLength] = useState(1000);

  // Active Arabic character with harakat
  const activeChar =
    (selectedLetter.forms[selectedForm] || selectedLetter.ar) +
    (HARAKAT_LIST.find((h) => h.id === selectedHarakat)?.symbol || "");

  // Canonical token for sound playback
  const getAudioToken = useCallback((letterAr, harakatId) => {
    let char = letterAr;
    if (harakatId === "fathah") char += "َ";
    else if (harakatId === "kasrah") char += "ِ";
    else if (harakatId === "dammah") char += "ُ";
    else if (harakatId === "sukoon") char += "ْ";
    return char;
  }, []);

  // Play authentic pronunciation
  const playPronunciation = useCallback(() => {
    try {
      const charToSpeak = getAudioToken(selectedLetter.ar, selectedHarakat);
      playArabicSound(charToSpeak);
    } catch {}
  }, [getAudioToken, selectedHarakat, selectedLetter]);

  // Active Calligraphy Tracing Definition
  const currentTracingDef = useMemo(() => {
    return (
      ARABIC_TRACING_PATHS[selectedLetter.ar] || {
        path: "M 450 100 L 450 440",
        arrow: "⬇️",
        arrowText: "নিচে টানুন",
        dots: [],
        checkpoints: [
          { x: 450, y: 100, label: "১", isStart: true },
          { x: 450, y: 270, label: "২" },
          { x: 450, y: 440, label: "শেষ", isEnd: true },
        ],
      }
    );
  }, [selectedLetter.ar]);

  
  // Compute scaled root coordinate for hit testing
  const getCheckpointRootPos = useCallback((cp) => {
    if (!cp) return { x: 450, y: 280 };
    const s = currentTracingDef.scale || 1.0;
    return {
      x: 450 + (cp.x - 450) * s,
      y: 280 + (cp.y - 280) * s,
    };
  }, [currentTracingDef.scale]);

  const checkpoints = currentTracingDef.checkpoints;
  const currentMascot = MASCOTS[selectedMascotIndex];

  // Measure path length dynamically
  useEffect(() => {
    if (fullPathRef.current) {
      try {
        const len = fullPathRef.current.getTotalLength();
        if (len > 0) setTotalPathLength(len);
      } catch {}
    }
  }, [currentTracingDef]);

  // Clear Board and reset stroke tracking
  const handleClear = useCallback(() => {
    // Clear freehand canvas
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Reset bounded tracing
    setReachedIndex(-1);
    setFillProgress(0);
    isCelebrationFiredRef.current = false;
    isDraggingRef.current = false;
    setShowCelebration(false);
  }, []);

  // ── TRIGGER MA SHA ALLAH GAME CELEBRATION (Only on 100% Genuine Completion) ──
  const triggerCelebration = useCallback(() => {
    if (isCelebrationFiredRef.current) return;
    isCelebrationFiredRef.current = true;
    setFillProgress(1);
    setShowCelebration(true);

    // 1. Triumphant fanfare audio
    playMaShaAllahCelebration();

    // 2. Confetti explosion
    fireCelebrationConfetti();

    // 3. Sequential star pop animation
    setStarsRevealed(0);
    const starTimers = [1, 2, 3].map((starIdx) =>
      setTimeout(() => {
        setStarsRevealed(starIdx);
        playStarPopSound(starIdx);
      }, starIdx * 320)
    );

    // 4. Pronounce the completed letter proudly
    setTimeout(() => {
      playPronunciation();
    }, 1100);

    // 5. Award +5 Coins to student wallet
    try {
      const currentCoins = parseInt(localStorage.getItem("nur_student_coins") || "150", 10);
      localStorage.setItem("nur_student_coins", String(currentCoins + 5));
    } catch {}

    return () => starTimers.forEach(clearTimeout);
  }, [playPronunciation]);

  // Dynamic 1:1 Pixel Canvas Dimensions Observer
  useEffect(() => {
    const updateDimensions = () => {
      if (!boardContainerRef.current) return;
      const rect = boardContainerRef.current.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(300, Math.floor(rect.height));
      setDimensions((prev) => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const stopDrag = () => {
      isDraggingRef.current = false;
      isFreehandDrawingRef.current = false;
    };
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("touchend", stopDrag);
    const ro = new ResizeObserver(updateDimensions);
    if (boardContainerRef.current) ro.observe(boardContainerRef.current);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
      ro.disconnect();
    };
  }, []);

  // Reset tracing state when active letter changes
  useEffect(() => {
    handleClear();
  }, [selectedLetter, selectedHarakat, selectedForm, handleClear]);

  // Accurate SVG Coordinate Mapper using matrix inversion
  const getSvgPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: Math.round(p.x), y: Math.round(p.y) };
  }, []);

  // ── ADVANCE TO CHECKPOINT ──
  const advanceToCheckpoint = useCallback(
    (targetIdx) => {
      if (isCelebrationFiredRef.current) return;
      if (targetIdx < 0 || targetIdx >= checkpoints.length) return;
      // Only allow advancing one step at a time, in order
      if (targetIdx !== reachedIndex + 1) return;

      setReachedIndex(targetIdx);
      playStarPopSound(targetIdx + 1);

      const targetCp = checkpoints[targetIdx];
      const progress =
        targetCp.pct !== undefined
          ? targetCp.pct
          : (targetIdx + 1) / checkpoints.length;

      setFillProgress(Math.min(1, progress));

      if (targetIdx === checkpoints.length - 1) {
        isDraggingRef.current = false;
        triggerCelebration();
      }
    },
    [checkpoints, reachedIndex, triggerCelebration]
  );

  // ── POINTER DOWN: শুধুমাত্র মাউস/আঙুল চাপলে শুরু হবে, hover করলে নয় ──
  const handleTracingPointerDown = (e) => {
    if (boardMode !== "trace" || isCelebrationFiredRef.current) return;
    if (e.button !== undefined && e.button !== 0) return; // Left mouse button or touch only
    if (e.target?.setPointerCapture && e.pointerId !== undefined) {
      try { e.target.setPointerCapture(e.pointerId); } catch {}
    }
    const p = getSvgPoint(e);

    // If tracing hasn't started yet, user must press near Ball 0 (the start checkpoint)
    if (reachedIndex < 0) {
      if (checkpoints[0]) {
        const root0 = getCheckpointRootPos(checkpoints[0]);
        const dist = Math.hypot(p.x - root0.x, p.y - root0.y);
        if (dist < 55) {
          isDraggingRef.current = true;
          advanceToCheckpoint(0);
        }
      }
      return;
    }

    // If tracing already started, check if pressing near the NEXT ball
    const nextIdx = reachedIndex + 1;
    if (nextIdx < checkpoints.length) {
      const nextCp = checkpoints[nextIdx];
      const nextRoot = getCheckpointRootPos(nextCp);
      const distToNext = Math.hypot(p.x - nextRoot.x, p.y - nextRoot.y);
      if (distToNext < 55) {
        isDraggingRef.current = true;
        advanceToCheckpoint(nextIdx);
        return;
      }
    }

    // Or resuming drag from current ball
    const currentCp = checkpoints[reachedIndex];
    if (currentCp) {
      const curRoot = getCheckpointRootPos(currentCp);
      const distToCurrent = Math.hypot(p.x - curRoot.x, p.y - curRoot.y);
      if (distToCurrent < 65) {
        isDraggingRef.current = true;
      }
    }
  };

  // ── POINTER MOVE: শুধুমাত্র isDraggingRef=true এবং মাউস বাটন চাপা থাকলেই কাজ করবে ──
  const handleTracingPointerMove = (e) => {
    if (!isDraggingRef.current || boardMode !== "trace" || isCelebrationFiredRef.current) return;
    // Mouse button release safety check (e.buttons === 1 means primary button held down)
    if (e.pointerType === "mouse" && e.buttons !== 1) {
      isDraggingRef.current = false;
      return;
    }
    const p = getSvgPoint(e);

    const nextIdx = reachedIndex + 1;
    if (nextIdx < checkpoints.length) {
      const nextCp = checkpoints[nextIdx];
      const nextRoot = getCheckpointRootPos(nextCp);
      const dist = Math.hypot(p.x - nextRoot.x, p.y - nextRoot.y);
      if (dist < 46) {
        advanceToCheckpoint(nextIdx);
      }
    }
  };

  const handleTracingPointerUp = (e) => {
    isDraggingRef.current = false;
    if (e?.target?.releasePointerCapture && e?.pointerId !== undefined) {
      try { e.target.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  // ── ✏️ FREEHAND CANVAS EVENTS ──
  const getFreehandPos = (e) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startFreehandDrawing = (e) => {
    if (boardMode !== "freehand") return;
    isFreehandDrawingRef.current = true;
    const pos = getFreehandPos(e);
    lastFreehandPointRef.current = pos;
  };

  const drawFreehand = (e) => {
    if (!isFreehandDrawingRef.current || boardMode !== "freehand") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getFreehandPos(e);

    ctx.beginPath();
    ctx.moveTo(lastFreehandPointRef.current.x, lastFreehandPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = penWidth * 3.5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.shadowBlur = 4;
      ctx.shadowColor = penColor;
    }

    ctx.stroke();
    lastFreehandPointRef.current = pos;
  };

  const stopFreehandDrawing = () => {
    isFreehandDrawingRef.current = false;
  };

  // Next Letter Handler
  const handleNextLetter = () => {
    const currentIndex = ARABIC_ALPHABET.findIndex((item) => item.ar === selectedLetter.ar);
    const nextIndex = (currentIndex + 1) % ARABIC_ALPHABET.length;
    const nextLetter = ARABIC_ALPHABET[nextIndex];

    setSelectedLetter(nextLetter);
    setShowCelebration(false);
    handleClear();

    const charToSpeak = getAudioToken(nextLetter.ar, selectedHarakat);
    playArabicSound(charToSpeak);
    toast.success(`মাশাআল্লাহ! পরবর্তী হরফ "${nextLetter.nameBn}" শুরু হয়েছে।`);
  };

  // Repeat current letter
  const handleRepeatCurrentLetter = () => {
    setShowCelebration(false);
    handleClear();
    playPronunciation();
  };

  // Download drawn handwriting as PNG
  const handleDownloadImage = () => {
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = dimensions.width;
      tempCanvas.height = dimensions.height;
      const tCtx = tempCanvas.getContext("2d");

      tCtx.fillStyle = "#38bdf8";
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      if (drawCanvasRef.current) {
        tCtx.drawImage(drawCanvasRef.current, 0, 0);
      }

      const link = document.createElement("a");
      link.download = `arabic-blackboard-${selectedLetter.nameBn || "letter"}.png`;
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
      toast.success("মাশাআল্লাহ! আপনার হাতের লেখার ছবি ডাউনলোড হয়েছে।");
    } catch {
      toast.error("ছবি সেভ করতে সমস্যা হয়েছে।");
    }
  };

  // Active Mascot Position along the path
  const activeMascotPos = useMemo(() => {
    if (reachedIndex >= 0 && reachedIndex < checkpoints.length) {
      return checkpoints[reachedIndex];
    }
    return checkpoints[0];
  }, [checkpoints, reachedIndex]);

  // Dash offset for progressive ink fill:
  // Starts with total length (0% revealed), reveals smoothly to 0 (100% revealed)
  const strokeDashOffset = useMemo(() => {
    if (fillProgress >= 0.98) return 0;
    if (fillProgress <= 0) return totalPathLength;
    return totalPathLength * (1 - fillProgress);
  }, [totalPathLength, fillProgress]);

  const tracingPercent = Math.min(100, Math.round(fillProgress * 100));

  return (
    <div dir={dir} className="w-full flex flex-col space-y-6">
      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#091a14] via-[#0b241b] to-[#071610] border border-emerald-900/60 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold text-2xl font-amiri shadow-md shadow-amber-950/40 ring-1 ring-amber-400/30">
            {activeChar}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{t.blackboard}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-600 text-emerald-200 font-bold shadow-xs">
                {lang === "en" ? selectedLetter.nameEn : selectedLetter.nameBn}
              </span>
            </h2>
            <p className="text-xs text-slate-300/80">
              নিখুঁত ট্রেসিং: হরফের দুই দেওয়ালের ভেতরে তীর অনুযায়ী টেনে যান—বল ফুটবে এবং হরফ ভরাট হবে! 🎮
            </p>
          </div>
        </div>

        {/* Real-time Progress Bar & Audio Action */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1 min-w-[150px]">
            <div className="flex items-center justify-between w-full text-[11px] font-bold">
              <span className="text-slate-300">ট্রেসিং অগ্রগতি:</span>
              <span
                className={`font-mono font-black ${
                  tracingPercent === 100 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {tracingPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/60 border border-emerald-900/60 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  tracingPercent === 100
                    ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/50"
                    : "bg-gradient-to-r from-emerald-600 via-amber-500 to-amber-400"
                }`}
                style={{ width: `${tracingPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={playPronunciation}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
            title="বিশুদ্ধ ক্বারীর কণ্ঠে উচ্চারণ শুনুন"
          >
            <Volume2 className="w-4 h-4 text-slate-950" />
            <span>{t.listenAudio}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN BLACKBOARD CANVAS STAGE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: THE GRAND BLACKBOARD (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* WOODEN SLATE CASING (আসল কাঠের ফ্রেমযুক্ত স্লেট) */}
          <div className="relative rounded-[32px] p-2.5 sm:p-4 bg-gradient-to-b from-[#3d1f11] via-[#24130a] to-[#140a04] border-4 border-[#522a16] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.18),inset_0_-2px_4px_rgba(0,0,0,0.8)] ring-1 ring-amber-700/60 flex flex-col">
            {/* Wooden Slate Corner Studs */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />

            {/* 🌄 THE BEAUTIFUL WRITING STAGE (SUNNY MEADOW, CLOUDS & WINDMILLS BACKGROUND) */}
            <div
              ref={boardContainerRef}
              className="relative rounded-[24px] border-2 border-emerald-950 shadow-[inset_0_10px_30px_rgba(0,0,0,0.7)] overflow-hidden h-[490px] sm:h-[550px] md:h-[600px] w-full select-none"
            >
              {/* 1. SUNNY BLUE SKY GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#7dd3fc] to-[#bae6fd] pointer-events-none" />

              {/* 2. SUN FLARE IN TOP-RIGHT */}
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-200/90 blur-2xl pointer-events-none" />

              {/* 3. FLUFFY ANIMATED CLOUDS */}
              <div className="absolute top-6 left-8 flex items-center gap-1.5 opacity-80 pointer-events-none">
                <div className="w-16 h-8 rounded-full bg-white shadow-sm" />
                <div className="w-24 h-12 rounded-full bg-white -ml-8 -mt-2 shadow-sm" />
                <div className="w-14 h-8 rounded-full bg-white -ml-6 shadow-sm" />
              </div>
              <div className="absolute top-12 right-28 flex items-center gap-1.5 opacity-70 pointer-events-none hidden sm:flex">
                <div className="w-20 h-10 rounded-full bg-white shadow-sm" />
                <div className="w-28 h-14 rounded-full bg-white -ml-10 -mt-2 shadow-sm" />
              </div>

              {/* 4. ROLLING GREEN HILLS AT BOTTOM */}
              <svg
                className="absolute bottom-0 inset-x-0 w-full h-[160px] sm:h-[190px] pointer-events-none"
                viewBox="0 0 900 180"
                preserveAspectRatio="none"
              >
                {/* Far Hill */}
                <path
                  d="M 0 70 Q 220 20 450 70 Q 680 120 900 50 L 900 180 L 0 180 Z"
                  fill="#84cc16"
                  opacity="0.9"
                />
                {/* Near Hill */}
                <path
                  d="M 0 100 Q 300 50 600 100 Q 760 140 900 80 L 900 180 L 0 180 Z"
                  fill="#65a30d"
                />
              </svg>

              {/* 5. ROTATING DUTCH WINDMILLS (MATCHING USER REFERENCE IMAGES) */}
              <div className="absolute bottom-14 right-6 sm:right-14 flex items-end gap-3 pointer-events-none opacity-90">
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 animate-spin [animation-duration:12s] relative flex items-center justify-center">
                    <div className="absolute w-14 h-1.5 bg-[#451a03] rounded-full" />
                    <div className="absolute h-14 w-1.5 bg-[#451a03] rounded-full" />
                  </div>
                  <div
                    className="w-7 h-10 bg-[#78350f] border-t-2 border-[#451a03] -mt-7 shadow-md"
                    style={{ clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)" }}
                  />
                </div>
                <div className="relative flex flex-col items-center hidden xs:flex">
                  <div className="w-10 h-10 animate-spin [animation-duration:8s] relative flex items-center justify-center">
                    <div className="absolute w-10 h-1 bg-[#451a03] rounded-full" />
                    <div className="absolute h-10 w-1 bg-[#451a03] rounded-full" />
                  </div>
                  <div
                    className="w-5 h-7 bg-[#78350f] -mt-5 shadow-sm"
                    style={{ clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)" }}
                  />
                </div>
              </div>

              {/* 6. MASCOT PICKER PILL (TOP-LEFT INSIDE STAGE) */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-md">
                <span className="text-[10px] font-black text-slate-700 pl-1.5 hidden xs:inline">সাথী:</span>
                {MASCOTS.map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMascotIndex(idx)}
                    className={`px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMascotIndex === idx
                        ? "bg-amber-400 text-slate-950 shadow-md scale-105 font-black ring-1 ring-white"
                        : "bg-white/40 hover:bg-white/70 text-slate-700"
                    }`}
                  >
                    <span>{m.emoji}</span>
                  </button>
                ))}
              </div>

              {/* 🧭 DIRECTIONAL INSTRUCTION PILL (TOP-CENTER, ZERO LETTER OVERLAP) */}
              {reachedIndex < 0 && (
                <div className="absolute top-3.5 inset-x-0 flex justify-center z-30 pointer-events-none animate-fade-in">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-800/95 backdrop-blur-md border border-emerald-400/80 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2">
                    <span className="text-sm">{currentTracingDef.arrow}</span>
                    <span>{currentTracingDef.arrowText}</span>
                  </div>
                </div>
              )}

              {/* 🎯 7. GRAND AUTHENTIC ARABIC LETTER TRACING ENGINE (DUOLINGO / ABC TRACING STYLE) */}
              {/* শিশু যখন অক্ষর নির্বাচন করবে, মাঝখানে সেই অক্ষরটি ক্যালিগ্রাফি ফন্টে বড় ও স্পষ্ট দেখা যাবে! */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                onPointerDown={handleTracingPointerDown}
                onPointerMove={handleTracingPointerMove}
                onPointerUp={handleTracingPointerUp}
                onPointerCancel={handleTracingPointerUp}
                className={`absolute inset-0 w-full h-full z-20 ${
                  boardMode === "trace" ? "cursor-crosshair touch-none" : "pointer-events-none"
                }`}
              >
                <defs>
                  {/* Clip Path of Authentic Arabic Glyph */}
                  <clipPath id={`letter-clip-${selectedLetter.ar}`}>
                    <text
                      x="450"
                      y={currentTracingDef.y || 380}
                      textAnchor="middle"
                      fontFamily="'Amiri', 'Traditional Arabic', 'Scheherazade New', serif"
                      fontSize={currentTracingDef.fontSize || 340}
                      fontWeight="700"
                    >
                      {selectedLetter.ar}
                    </text>
                  </clipPath>
                </defs>

                {/* 🌟 SCALED GROUP AROUND BOARD CENTER (450, 280) */}
                <g transform={`translate(450, 280) scale(${currentTracingDef.scale || 1.1}) translate(-450, -280)`}>
                  {/* 🛡️ 1. THICK OUTER WHITE CALLIGRAPHIC WALL (রেফারেন্স ছবির মতো স্পষ্ট সাদা সীমানা) */}
                  <text
                    x="450"
                    y={currentTracingDef.y || 380}
                    textAnchor="middle"
                    fontFamily="'Amiri', 'Traditional Arabic', 'Scheherazade New', serif"
                    fontSize={currentTracingDef.fontSize || 340}
                    fontWeight="700"
                    stroke="#ffffff"
                    strokeWidth="28"
                    strokeLinejoin="round"
                    fill="#ffffff"
                    style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.5))" }}
                    className="pointer-events-none select-none"
                  >
                    {selectedLetter.ar}
                  </text>

                  {/* 🕳️ 2. TRANSLUCENT DARK BODY (রেফারেন্স ছবির মতো ব্লু-গ্রে শেড যা ট্রেস করলে পূরণ হবে) */}
                  <text
                    x="450"
                    y={currentTracingDef.y || 380}
                    textAnchor="middle"
                    fontFamily="'Amiri', 'Traditional Arabic', 'Scheherazade New', serif"
                    fontSize={currentTracingDef.fontSize || 340}
                    fontWeight="700"
                    fill="rgba(15, 30, 55, 0.72)"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    className="pointer-events-none select-none"
                  >
                    {selectedLetter.ar}
                  </text>

                  {/* 🎨 3. VIBRANT GOLDEN INK CLIPPED STRICTLY INSIDE THE LETTER GLYPH! (ZERO LEAK!) */}
                  <g clipPath={`url(#letter-clip-${selectedLetter.ar})`}>
                    <path
                      ref={fullPathRef}
                      d={currentTracingDef.path}
                      fill="none"
                      stroke={penColor || "#fbbf24"}
                      strokeWidth="105"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={totalPathLength}
                      strokeDashoffset={strokeDashOffset}
                      style={{
                        transition: isDraggingRef.current ? "none" : "stroke-dashoffset 0.3s ease-out",
                        filter: `drop-shadow(0 0 25px ${penColor || "#fbbf24"})`,
                      }}
                      className="pointer-events-none"
                    />
                  </g>

                  {/* 🧭 4. SUBTLE STROKE GUIDE DASHED LINE (হালকা গাইড পথ) */}
                  <path
                    d={currentTracingDef.path}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="3.5"
                    strokeDasharray="6 6"
                    className="pointer-events-none"
                  />

                  {/* ⚽ 5. COLLECTIBLE BALLS / ITEMS ALONG THE REAL STROKE PATH */}
                  {checkpoints.map((cp, idx) => {
                    const isPopped = idx <= reachedIndex;
                    const isNext = idx === reachedIndex + 1;
                    const isInitialStart = reachedIndex < 0 && idx === 0;
                    const isTarget = isInitialStart || isNext;

                    return (
                      <g
                        key={idx}
                        transform={`translate(${cp.x}, ${cp.y})`}
                        className="pointer-events-none select-none"
                      >
                        {/* Active target pulse ring */}
                        {isTarget && (
                          <circle
                            r="28"
                            fill="none"
                            stroke={isInitialStart ? "#10b981" : cp.isDot ? "#ef4444" : "#fbbf24"}
                            strokeWidth="3.5"
                            className="animate-ping opacity-85 pointer-events-none"
                          />
                        )}

                        {/* Ball / Item Circle */}
                        {!isPopped ? (
                          <g className="pointer-events-none">
                            <circle
                              r={isTarget ? "22" : "17"}
                              fill={
                                cp.isDot
                                  ? "#ef4444"
                                  : isInitialStart
                                  ? "#10b981"
                                  : isNext
                                  ? "#f59e0b"
                                  : "#ffffff"
                              }
                              stroke="#ffffff"
                              strokeWidth="3"
                              style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" }}
                            />
                            <text
                              y="5"
                              textAnchor="middle"
                              fill={isTarget || cp.isDot ? "#ffffff" : "#0f172a"}
                              fontSize={isTarget ? "13" : "11"}
                              fontWeight="black"
                              className="select-none pointer-events-none font-sans"
                            >
                              {cp.isDot ? "ন" : cp.isStart ? "১" : cp.isEnd ? "শেষ" : currentMascot.item}
                            </text>
                          </g>
                        ) : (
                          // Popped State: Golden Checkmark Star
                          <g className="pointer-events-none animate-scale-up">
                            <circle
                              r="16"
                              fill="#fbbf24"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                              style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
                            />
                            <text
                              y="5"
                              textAnchor="middle"
                              fill="#0f172a"
                              fontSize="13"
                              fontWeight="black"
                              className="select-none pointer-events-none font-sans"
                            >
                              ✓
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* 🐘 6. CUTE ANIMATED MASCOT SITTING DIRECTLY ON THE ACTIVE BALL / TOUCH POINT */}
                  {activeMascotPos && (
                    <g
                      transform={`translate(${activeMascotPos.x}, ${activeMascotPos.y})`}
                      className="pointer-events-none transition-all duration-200 ease-out"
                    >
                      <circle
                        r="24"
                        fill="#ffffff"
                        stroke="#fbbf24"
                        strokeWidth="3.5"
                        style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.4))" }}
                      />
                      <text
                        y="9"
                        textAnchor="middle"
                        fontSize="26"
                        className="select-none pointer-events-none font-sans"
                      >
                        {currentMascot.emoji}
                      </text>
                    </g>
                  )}
                </g>
              </svg>

              {/* ✏️ FREEHAND CANVAS (মুক্ত ড্রয়িং মোড চালু করলে) */}
              <canvas
                ref={drawCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={startFreehandDrawing}
                onMouseMove={drawFreehand}
                onMouseUp={stopFreehandDrawing}
                onMouseLeave={stopFreehandDrawing}
                onTouchStart={startFreehandDrawing}
                onTouchMove={drawFreehand}
                onTouchEnd={stopFreehandDrawing}
                className={`absolute inset-0 z-20 ${
                  boardMode === "freehand"
                    ? "cursor-crosshair touch-none"
                    : "pointer-events-none opacity-0"
                }`}
              />

              {/* 🌟 GAME CELEBRATION MODAL OVERLAY */}
              {showCelebration && (
                <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
                  <div className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-amber-500/60 mb-3 border-2 border-white animate-bounce">
                    مَا شَاءَ اللَّهُ! মাশাআল্লাহ!
                  </div>

                  {/* 3 Popping Stars */}
                  <div className="flex items-center gap-2.5 mb-3">
                    {[1, 2, 3].map((starIdx) => (
                      <div
                        key={starIdx}
                        className={`transition-all duration-300 transform ${
                          starIdx <= starsRevealed
                            ? "scale-110 opacity-100 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                            : "scale-75 opacity-25 text-slate-600"
                        }`}
                      >
                        <Award className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
                      </div>
                    ))}
                  </div>

                  {/* Big Arabic Letter with golden aura */}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-900 to-[#03150d] border-2 border-amber-400/90 flex items-center justify-center font-amiri text-5xl font-extrabold text-amber-300 shadow-2xl mb-2.5 shadow-amber-500/30 ring-4 ring-emerald-500/40">
                    {activeChar}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-black mb-2 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>১০০% নিখুঁতভাবে সম্পূর্ণ হয়েছে · ৩ স্টার! +৫ 🪙</span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                    দারুণ! হরফটি সঠিক নিয়মে শেষ হয়েছে!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 max-w-sm mb-5">
                    আপনি <span className="font-bold text-amber-300 font-amiri text-base">{activeChar}</span> হরফটি খাঁটি মাখরাজে পূর্ণ করেছেন।
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleNextLetter}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-900/60 transition-all cursor-pointer active:scale-95"
                    >
                      <span>পরবর্তী হরফে যাও</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRepeatCurrentLetter}
                      className="px-5 py-3 rounded-2xl bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-500/60 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>আবার আঁকো</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── TOOLBAR UNDER BLACKBOARD (টুলস ও প্যালেট) ── */}
            <div className="mt-3 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#071912] via-[#05140e] to-[#04100b] border border-emerald-900/70 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
              {/* Left Group: Mode Selector & Chalk Colors */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-black/60 border border-emerald-900/60">
                  <button
                    type="button"
                    onClick={() => {
                      setBoardMode("trace");
                      handleClear();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      boardMode === "trace"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="হরফের ভেতরের পথ ধরে নিখুঁত ট্রেসিং"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>গাইড ট্রেসিং</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBoardMode("freehand");
                      handleClear();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      boardMode === "freehand"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title="মুক্তভাবে চক দিয়ে লেখার স্লেট"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>মুক্ত চকখড়ি</span>
                  </button>
                </div>

                {/* Chalk Colors Palette */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-900/60">
                  {[
                    { color: "#fbbf24", name: "সোনালী" },
                    { color: "#ffffff", name: "সাদা" },
                    { color: "#34d399", name: "সবুজ" },
                    { color: "#38bdf8", name: "আকাশি" },
                    { color: "#f472b6", name: "গোলাপী" },
                    { color: "#c084fc", name: "বেগুনী" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setPenColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer shadow-xs ${
                        penColor === c.color
                          ? "border-white scale-125 shadow-md ring-2 ring-amber-400"
                          : "border-black/50 hover:scale-110"
                      }`}
                      title={`${c.name} চক`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Group: Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-emerald-900/70 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="আপনার হাতের লেখা ছবি হিসেবে সেভ করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">সেভ</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="স্লেট পরিষ্কার করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.clear}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── LETTER FORMS SELECTION (শব্দে হরফের ৪টি রূপ — একক, শুরু, মাঝ, শেষ) ── */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#091a14] via-[#071912] to-[#04120c] border border-emerald-900/60 shadow-xl flex flex-col space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span className="text-amber-400">❖</span>
                <span>
                  {lang === "ar"
                    ? "أشكال الحرف في الكلمة:"
                    : lang === "en"
                    ? "4 Forms of the Letter:"
                    : "শব্দে হরফের ৪টি রূপ:"}
                </span>
              </span>
              <span className="text-[11px] text-emerald-300/80">
                হরফ ক্লিক করে বোর্ডে লেখার ধরন পরিবর্তন করুন
              </span>
            </div>

            {/* 4 Large Rich Form Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: "isolated",
                  title: "একক রূপ",
                  subtitle: "স্বাধীন বা পূর্ণাঙ্গ রূপ",
                  label: t.letters.isolated,
                  form: selectedLetter.forms.isolated,
                },
                {
                  id: "initial",
                  title: "শুরুর রূপ",
                  subtitle: "শব্দের শুরুতে বসার রূপ",
                  label: t.letters.initial,
                  form: selectedLetter.forms.initial,
                },
                {
                  id: "medial",
                  title: "মাঝের রূপ",
                  subtitle: "শব্দের মাঝে যুক্ত রূপ",
                  label: t.letters.medial,
                  form: selectedLetter.forms.medial,
                },
                {
                  id: "final",
                  title: "শেষের রূপ",
                  subtitle: "শব্দের শেষে যুক্ত রূপ",
                  label: t.letters.final,
                  form: selectedLetter.forms.final,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedForm(f.id);
                    handleClear();
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    selectedForm === f.id
                      ? "bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-[#052818] border-amber-400 text-white shadow-lg ring-2 ring-amber-400/50 scale-102"
                      : "bg-[#061810]/80 border-emerald-950/80 text-slate-300 hover:border-emerald-700/80 hover:bg-emerald-950/50"
                  }`}
                >
                  <span className="font-amiri text-3xl sm:text-4xl font-extrabold text-amber-300 drop-shadow-xs mb-1">
                    {f.form}
                  </span>
                  <span className="text-xs font-bold text-white">{f.title}</span>
                  <span className="text-[10px] text-emerald-300/70">{f.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── HARAKAT SELECTION (হরকত ও বিশুদ্ধ মাখরাজ উচ্চারণ) ── */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#091a14] via-[#071912] to-[#04120c] border border-emerald-900/60 shadow-xl flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span className="text-amber-400">❖</span>
                <span>
                  {lang === "ar"
                    ? "الحركات الإعرابية:"
                    : lang === "en"
                    ? "Select Harakat (Vowels):"
                    : "হরকত যুক্ত করুন (উচ্চারণ পরিবর্তন):"}
                </span>
              </span>
              <span className="text-[11px] text-emerald-300/85 font-medium">
                হরকত বাছাই করলে বোর্ডে চিহ্ন যুক্ত হবে
              </span>
            </div>

            {/* 5 Harakat Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {HARAKAT_LIST.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setSelectedHarakat(h.id);
                    handleClear();
                    const charToSpeak = getAudioToken(selectedLetter.ar, h.id);
                    playArabicSound(charToSpeak);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedHarakat === h.id
                      ? "bg-gradient-to-r from-amber-600 to-amber-700 border-amber-300 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105"
                      : "bg-[#05140d] border-emerald-900/70 text-slate-300 hover:border-emerald-600 hover:bg-emerald-950"
                  }`}
                >
                  {lang === "ar" ? h.labelAr : lang === "en" ? h.labelEn : h.labelBn}
                </button>
              ))}
            </div>

            {/* Active Sound Pronunciation Indicator */}
            <div className="w-full pt-2 flex items-center justify-between text-xs border-t border-emerald-900/40">
              <span className="text-slate-300 font-medium">
                {lang === "ar"
                  ? "النطق الصحيح:"
                  : lang === "en"
                  ? "Correct Pronunciation:"
                  : "বিশুদ্ধ নূরানী উচ্চারণ গাইড:"}
              </span>
              <span className="font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/40 font-amiri text-sm sm:text-base flex items-center gap-2 shadow-xs">
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  {selectedHarakat === "none"
                    ? lang === "en"
                      ? selectedLetter.nameEn
                      : selectedLetter.nameBn
                    : HARAKAT_PRONUNCIATION_MAP[selectedLetter.ar]?.[selectedHarakat] || activeChar}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 29 ARABIC ALPHABET SELECTOR (col-span-4) - KEPT 100% INTACT */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#091a14] via-[#071a13] to-[#04120c] border border-emerald-900/60 shadow-xl flex flex-col space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center justify-between border-b border-emerald-900/50 pb-2.5">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">❖</span>
                <span>{t.selectLetterForPractice}</span>
              </span>
              <span className="text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60">
                {t.lettersCount29}
              </span>
            </h3>

            {/* Grid of 29 Arabic Letters */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2.5 max-h-[580px] md:max-h-[640px] overflow-y-auto pr-1 select-none">
              {ARABIC_ALPHABET.map((item) => {
                const isSelected = selectedLetter.ar === item.ar;
                return (
                  <button
                    key={item.ar}
                    type="button"
                    onClick={() => {
                      setSelectedLetter(item);
                      setShowCelebration(false);
                      handleClear();
                      const charToSpeak = getAudioToken(item.ar, selectedHarakat);
                      playArabicSound(charToSpeak);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-200 text-slate-950 font-black shadow-lg shadow-amber-950/50 scale-105 ring-2 ring-amber-300"
                        : "bg-[#05140d]/90 border-emerald-950/80 text-slate-200 hover:border-emerald-500 hover:bg-emerald-950/80"
                    }`}
                  >
                    <span className="font-amiri text-2xl sm:text-3xl font-extrabold drop-shadow-xs">
                      {item.ar}
                    </span>
                    <span
                      className={`text-[11px] mt-0.5 font-bold ${
                        isSelected ? "text-slate-950" : "text-slate-400"
                      }`}
                    >
                      {lang === "en" ? item.nameEn : lang === "ar" ? item.ar : item.nameBn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
