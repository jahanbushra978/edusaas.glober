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

// ── 🎨 HIGH-DEFINITION CALLIGRAPHY PATHS (DOUBLE-WALLED CHANNELS WITH EXACT PERCENTAGES) ──
// Standard SVG Coordinate System: viewBox 0 0 900 560
// Designed with authentic Islamic calligraphy curves (Naskh/Thuluth) and exact path-matching checkpoints!
const ARABIC_TRACING_PATHS = {
  // Alif (Top to Bottom calligraphic vertical)
  "ا": {
    path: "M 450 110 L 450 430",
    arrow: "⬇️",
    arrowText: "নিচে টানুন",
    dots: [],
    checkpoints: [
      { x: 450, y: 110, label: "১", pct: 0.15, isStart: true },
      { x: 450, y: 190, label: "২", pct: 0.35 },
      { x: 450, y: 270, label: "৩", pct: 0.55 },
      { x: 450, y: 350, label: "৪", pct: 0.80 },
      { x: 450, y: 430, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Baa (Right tip -> Baseline curve -> Left tip + 1 diamond dot below)
  "ب": {
    path: "M 670 240 C 640 370, 560 415, 450 415 C 340 415, 260 370, 230 240",
    arrow: "↙️",
    arrowText: "ডান থেকে বাঁয়ে",
    dots: [{ x: 450, y: 485, r: 18 }],
    checkpoints: [
      { x: 670, y: 240, label: "১", pct: 0.12, isStart: true },
      { x: 620, y: 350, label: "২", pct: 0.28 },
      { x: 540, y: 410, label: "৩", pct: 0.44 },
      { x: 450, y: 415, label: "৪", pct: 0.58 },
      { x: 360, y: 410, label: "৫", pct: 0.72 },
      { x: 280, y: 350, label: "৬", pct: 0.86 },
      { x: 230, y: 240, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Taa (Right tip -> Baseline -> Left tip + 2 diamond dots on top)
  "ت": {
    path: "M 670 240 C 640 370, 560 415, 450 415 C 340 415, 260 370, 230 240",
    arrow: "↙️",
    arrowText: "ডান থেকে বাঁয়ে",
    dots: [
      { x: 420, y: 165, r: 16 },
      { x: 480, y: 165, r: 16 },
    ],
    checkpoints: [
      { x: 670, y: 240, label: "১", pct: 0.12, isStart: true },
      { x: 620, y: 350, label: "২", pct: 0.28 },
      { x: 540, y: 410, label: "৩", pct: 0.44 },
      { x: 450, y: 415, label: "৪", pct: 0.58 },
      { x: 360, y: 410, label: "৫", pct: 0.72 },
      { x: 280, y: 350, label: "৬", pct: 0.86 },
      { x: 230, y: 240, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Thaa (Right tip -> Baseline -> Left tip + 3 diamond dots on top)
  "ث": {
    path: "M 670 240 C 640 370, 560 415, 450 415 C 340 415, 260 370, 230 240",
    arrow: "↙️",
    arrowText: "ডান থেকে বাঁয়ে",
    dots: [
      { x: 450, y: 125, r: 15 },
      { x: 420, y: 170, r: 15 },
      { x: 480, y: 170, r: 15 },
    ],
    checkpoints: [
      { x: 670, y: 240, label: "১", pct: 0.12, isStart: true },
      { x: 620, y: 350, label: "২", pct: 0.28 },
      { x: 540, y: 410, label: "৩", pct: 0.44 },
      { x: 450, y: 415, label: "৪", pct: 0.58 },
      { x: 360, y: 410, label: "৫", pct: 0.72 },
      { x: 280, y: 350, label: "৬", pct: 0.86 },
      { x: 230, y: 240, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Jeem (Masterpiece Arabic Calligraphy: Arched Eyebrow -> Inward Waist -> Crescent Belly + Diamond Nukta inside)
  "ج": {
    path: "M 370 180 C 420 160, 490 160, 550 180 C 500 220, 470 235, 450 245 C 530 280, 570 360, 520 440 C 470 485, 340 485, 240 400",
    arrow: "➡️",
    arrowText: "ডানে গিয়ে নিচে গোল",
    dots: [{ x: 395, y: 345, r: 20 }],
    checkpoints: [
      { x: 370, y: 180, label: "১", pct: 0.12, isStart: true },
      { x: 460, y: 165, label: "২", pct: 0.25 },
      { x: 550, y: 180, label: "৩", pct: 0.38 },
      { x: 450, y: 245, label: "৪", pct: 0.50 },
      { x: 545, y: 350, label: "৫", pct: 0.65 },
      { x: 480, y: 450, label: "৬", pct: 0.80 },
      { x: 360, y: 470, label: "৭", pct: 0.90 },
      { x: 240, y: 400, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Haa (Same crescent without dots)
  "ح": {
    path: "M 370 180 C 420 160, 490 160, 550 180 C 500 220, 470 235, 450 245 C 530 280, 570 360, 520 440 C 470 485, 340 485, 240 400",
    arrow: "➡️",
    arrowText: "ডানে গিয়ে নিচে গোল",
    dots: [],
    checkpoints: [
      { x: 370, y: 180, label: "১", pct: 0.12, isStart: true },
      { x: 460, y: 165, label: "২", pct: 0.25 },
      { x: 550, y: 180, label: "৩", pct: 0.38 },
      { x: 450, y: 245, label: "৪", pct: 0.50 },
      { x: 545, y: 350, label: "৫", pct: 0.65 },
      { x: 480, y: 450, label: "৬", pct: 0.80 },
      { x: 360, y: 470, label: "৭", pct: 0.90 },
      { x: 240, y: 400, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Kha (Same crescent + 1 diamond dot on top)
  "خ": {
    path: "M 370 180 C 420 160, 490 160, 550 180 C 500 220, 470 235, 450 245 C 530 280, 570 360, 520 440 C 470 485, 340 485, 240 400",
    arrow: "➡️",
    arrowText: "ডানে গিয়ে নিচে গোল",
    dots: [{ x: 470, y: 105, r: 18 }],
    checkpoints: [
      { x: 370, y: 180, label: "১", pct: 0.12, isStart: true },
      { x: 460, y: 165, label: "২", pct: 0.25 },
      { x: 550, y: 180, label: "৩", pct: 0.38 },
      { x: 450, y: 245, label: "৪", pct: 0.50 },
      { x: 545, y: 350, label: "৫", pct: 0.65 },
      { x: 480, y: 450, label: "৬", pct: 0.80 },
      { x: 360, y: 470, label: "৭", pct: 0.90 },
      { x: 240, y: 400, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Dal (Slanted descent to flat baseline)
  "د": {
    path: "M 560 210 C 530 290, 480 370, 420 380 L 300 380",
    arrow: "↙️",
    arrowText: "বাঁকা হয়ে নিচে",
    dots: [],
    checkpoints: [
      { x: 560, y: 210, label: "১", pct: 0.18, isStart: true },
      { x: 510, y: 310, label: "২", pct: 0.45 },
      { x: 420, y: 380, label: "৩", pct: 0.72 },
      { x: 300, y: 380, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Dhal (Same Dal + 1 diamond dot on top)
  "ذ": {
    path: "M 560 210 C 530 290, 480 370, 420 380 L 300 380",
    arrow: "↙️",
    arrowText: "বাঁকা হয়ে নিচে",
    dots: [{ x: 480, y: 150, r: 18 }],
    checkpoints: [
      { x: 560, y: 210, label: "১", pct: 0.18, isStart: true },
      { x: 510, y: 310, label: "২", pct: 0.45 },
      { x: 420, y: 380, label: "৩", pct: 0.72 },
      { x: 300, y: 380, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Ra (Crescent stroke sweeping below baseline)
  "ر": {
    path: "M 540 230 C 520 290, 470 380, 390 440 C 340 475, 290 485, 250 480",
    arrow: "↙️",
    arrowText: "নিচে বাঁকা চাঁদ",
    dots: [],
    checkpoints: [
      { x: 540, y: 230, label: "১", pct: 0.20, isStart: true },
      { x: 490, y: 320, label: "২", pct: 0.50 },
      { x: 390, y: 440, label: "৩", pct: 0.78 },
      { x: 250, y: 480, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Zay (Same Ra + 1 diamond dot on top)
  "ز": {
    path: "M 540 230 C 520 290, 470 380, 390 440 C 340 475, 290 485, 250 480",
    arrow: "↙️",
    arrowText: "নিচে বাঁকা চাঁদ",
    dots: [{ x: 510, y: 170, r: 18 }],
    checkpoints: [
      { x: 540, y: 230, label: "১", pct: 0.20, isStart: true },
      { x: 490, y: 320, label: "২", pct: 0.50 },
      { x: 390, y: 440, label: "৩", pct: 0.78 },
      { x: 250, y: 480, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Seen (Three teeth + deep crescent bowl)
  "س": {
    path: "M 660 250 C 640 295, 605 300, 585 255 C 570 300, 535 300, 515 255 C 505 360, 440 460, 320 460 C 230 460, 195 380, 215 330",
    arrow: "↙️",
    arrowText: "তিন দাঁত ঘুরে নিচে বাটি",
    dots: [],
    checkpoints: [
      { x: 660, y: 250, label: "১", pct: 0.12, isStart: true },
      { x: 585, y: 255, label: "২", pct: 0.28 },
      { x: 515, y: 255, label: "৩", pct: 0.44 },
      { x: 470, y: 380, label: "৪", pct: 0.62 },
      { x: 370, y: 460, label: "৫", pct: 0.78 },
      { x: 280, y: 440, label: "৬", pct: 0.90 },
      { x: 215, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Sheen (Same Seen + 3 diamond dots on top)
  "ش": {
    path: "M 660 250 C 640 295, 605 300, 585 255 C 570 300, 535 300, 515 255 C 505 360, 440 460, 320 460 C 230 460, 195 380, 215 330",
    arrow: "↙️",
    arrowText: "তিন দাঁত ঘুরে নিচে বাটি",
    dots: [
      { x: 585, y: 150, r: 16 },
      { x: 550, y: 195, r: 16 },
      { x: 620, y: 195, r: 16 },
    ],
    checkpoints: [
      { x: 660, y: 250, label: "১", pct: 0.12, isStart: true },
      { x: 585, y: 255, label: "২", pct: 0.28 },
      { x: 515, y: 255, label: "৩", pct: 0.44 },
      { x: 470, y: 380, label: "৪", pct: 0.62 },
      { x: 370, y: 460, label: "৫", pct: 0.78 },
      { x: 280, y: 440, label: "৬", pct: 0.90 },
      { x: 215, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Saad (Loop + deep crescent bowl)
  "ص": {
    path: "M 480 320 C 530 250, 650 250, 650 320 L 460 320 C 450 380, 410 460, 300 460 C 210 460, 180 380, 200 330",
    arrow: "↗️",
    arrowText: "মাথা ঘুরে নিচে বাটি",
    dots: [],
    checkpoints: [
      { x: 480, y: 320, label: "১", pct: 0.15, isStart: true },
      { x: 570, y: 260, label: "২", pct: 0.32 },
      { x: 650, y: 320, label: "৩", pct: 0.45 },
      { x: 460, y: 320, label: "৪", pct: 0.58 },
      { x: 380, y: 440, label: "৫", pct: 0.75 },
      { x: 280, y: 450, label: "৬", pct: 0.88 },
      { x: 200, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Daad (Same Saad + 1 diamond dot on top)
  "ض": {
    path: "M 480 320 C 530 250, 650 250, 650 320 L 460 320 C 450 380, 410 460, 300 460 C 210 460, 180 380, 200 330",
    arrow: "↗️",
    arrowText: "মাথা ঘুরে নিচে বাটি",
    dots: [{ x: 570, y: 195, r: 18 }],
    checkpoints: [
      { x: 480, y: 320, label: "১", pct: 0.15, isStart: true },
      { x: 570, y: 260, label: "২", pct: 0.32 },
      { x: 650, y: 320, label: "৩", pct: 0.45 },
      { x: 460, y: 320, label: "৪", pct: 0.58 },
      { x: 380, y: 440, label: "৫", pct: 0.75 },
      { x: 280, y: 450, label: "৬", pct: 0.88 },
      { x: 200, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Taa (Taw) (Vertical ascender + loop)
  "ط": {
    path: "M 460 110 L 460 330 C 530 250, 650 250, 650 330 L 330 330",
    arrow: "⬇️",
    arrowText: "সোজা নেমে মাথা ঘোরান",
    dots: [],
    checkpoints: [
      { x: 460, y: 110, label: "১", pct: 0.20, isStart: true },
      { x: 460, y: 330, label: "২", pct: 0.42 },
      { x: 565, y: 260, label: "৩", pct: 0.62 },
      { x: 650, y: 330, label: "৪", pct: 0.78 },
      { x: 330, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Dhaa (Zwa) (Same Taa + 1 diamond dot on top)
  "ظ": {
    path: "M 460 110 L 460 330 C 530 250, 650 250, 650 330 L 330 330",
    arrow: "⬇️",
    arrowText: "সোজা নেমে মাথা ঘোরান",
    dots: [{ x: 570, y: 200, r: 18 }],
    checkpoints: [
      { x: 460, y: 110, label: "১", pct: 0.20, isStart: true },
      { x: 460, y: 330, label: "২", pct: 0.42 },
      { x: 565, y: 260, label: "৩", pct: 0.62 },
      { x: 650, y: 330, label: "৪", pct: 0.78 },
      { x: 330, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Ayn (Small open head + wide sweeping crescent belly)
  "ع": {
    path: "M 520 205 C 470 165, 410 205, 440 265 C 540 295, 575 385, 510 455 C 445 495, 330 490, 230 410",
    arrow: "↖️",
    arrowText: "ছোট মাথা ঘুরে বড় পেট",
    dots: [],
    checkpoints: [
      { x: 520, y: 205, label: "১", pct: 0.15, isStart: true },
      { x: 435, y: 185, label: "২", pct: 0.30 },
      { x: 440, y: 265, label: "৩", pct: 0.45 },
      { x: 540, y: 360, label: "৪", pct: 0.65 },
      { x: 470, y: 465, label: "৫", pct: 0.82 },
      { x: 340, y: 480, label: "৬", pct: 0.92 },
      { x: 230, y: 410, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Ghayn (Same Ayn + 1 diamond dot on top)
  "غ": {
    path: "M 520 205 C 470 165, 410 205, 440 265 C 540 295, 575 385, 510 455 C 445 495, 330 490, 230 410",
    arrow: "↖️",
    arrowText: "ছোট মাথা ঘুরে বড় পেট",
    dots: [{ x: 480, y: 120, r: 18 }],
    checkpoints: [
      { x: 520, y: 205, label: "১", pct: 0.15, isStart: true },
      { x: 435, y: 185, label: "২", pct: 0.30 },
      { x: 440, y: 265, label: "৩", pct: 0.45 },
      { x: 540, y: 360, label: "৪", pct: 0.65 },
      { x: 470, y: 465, label: "৫", pct: 0.82 },
      { x: 340, y: 480, label: "৬", pct: 0.92 },
      { x: 230, y: 410, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Fa (Head loop + wide boat bowl + 1 diamond dot on top)
  "ف": {
    path: "M 570 260 C 610 210, 670 240, 650 290 L 620 320 C 570 395, 360 405, 240 260",
    arrow: "↗️",
    arrowText: "গোল মাথা ঘুরে বাটি",
    dots: [{ x: 615, y: 165, r: 18 }],
    checkpoints: [
      { x: 570, y: 260, label: "১", pct: 0.15, isStart: true },
      { x: 645, y: 235, label: "২", pct: 0.32 },
      { x: 620, y: 320, label: "৩", pct: 0.48 },
      { x: 480, y: 395, label: "৪", pct: 0.68 },
      { x: 350, y: 390, label: "৫", pct: 0.84 },
      { x: 240, y: 260, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Qaaf (Head loop + deep crescent bowl + 2 diamond dots on top)
  "ق": {
    path: "M 570 240 C 610 190, 670 220, 650 270 L 620 300 C 580 410, 440 470, 310 470 C 230 470, 195 400, 215 330",
    arrow: "↗️",
    arrowText: "গোল মাথা ঘুরে গভীর বাটি",
    dots: [
      { x: 580, y: 140, r: 16 },
      { x: 645, y: 140, r: 16 },
    ],
    checkpoints: [
      { x: 570, y: 240, label: "১", pct: 0.15, isStart: true },
      { x: 645, y: 215, label: "২", pct: 0.32 },
      { x: 620, y: 300, label: "৩", pct: 0.46 },
      { x: 480, y: 440, label: "৪", pct: 0.68 },
      { x: 340, y: 470, label: "৫", pct: 0.84 },
      { x: 215, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Kaaf (Tall vertical + boat bowl with inner mark)
  "ك": {
    path: "M 610 110 L 610 340 C 560 410, 370 410, 250 260",
    arrow: "⬇️",
    arrowText: "সোজা নেমে বাঁয়ে বাটি",
    dots: [{ x: 460, y: 280, r: 16 }],
    checkpoints: [
      { x: 610, y: 110, label: "১", pct: 0.20, isStart: true },
      { x: 610, y: 240, label: "২", pct: 0.42 },
      { x: 610, y: 340, label: "৩", pct: 0.60 },
      { x: 450, y: 405, label: "৪", pct: 0.80 },
      { x: 250, y: 260, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Laam (Tall vertical + deep crescent bowl)
  "ل": {
    path: "M 570 110 L 570 330 C 560 440, 440 480, 330 480 C 230 480, 190 400, 220 330",
    arrow: "⬇️",
    arrowText: "সোজা নেমে নিচে গোল",
    dots: [],
    checkpoints: [
      { x: 570, y: 110, label: "১", pct: 0.20, isStart: true },
      { x: 570, y: 240, label: "২", pct: 0.42 },
      { x: 570, y: 330, label: "৩", pct: 0.60 },
      { x: 450, y: 460, label: "৪", pct: 0.78 },
      { x: 330, y: 480, label: "৫", pct: 0.88 },
      { x: 220, y: 330, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Meem (Top circle loop + descending vertical tail)
  "م": {
    path: "M 540 250 C 590 200, 640 240, 610 290 L 520 290 L 520 470",
    arrow: "↗️",
    arrowText: "মাথা ঘুরে নিচে লেজ",
    dots: [],
    checkpoints: [
      { x: 540, y: 250, label: "১", pct: 0.18, isStart: true },
      { x: 610, y: 230, label: "২", pct: 0.38 },
      { x: 590, y: 290, label: "৩", pct: 0.55 },
      { x: 520, y: 290, label: "৪", pct: 0.72 },
      { x: 520, y: 470, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Noon (Deep bowl + 1 diamond dot in center)
  "ن": {
    path: "M 620 260 C 610 420, 480 470, 360 470 C 240 470, 200 380, 220 280",
    arrow: "↙️",
    arrowText: "ডান থেকে নিচে গভীর গোল",
    dots: [{ x: 420, y: 300, r: 18 }],
    checkpoints: [
      { x: 620, y: 260, label: "১", pct: 0.15, isStart: true },
      { x: 570, y: 390, label: "২", pct: 0.38 },
      { x: 450, y: 465, label: "৩", pct: 0.60 },
      { x: 330, y: 460, label: "৪", pct: 0.80 },
      { x: 220, y: 280, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Waw (Top loop + descending curved tail)
  "و": {
    path: "M 510 270 C 550 210, 620 240, 600 290 C 570 360, 480 460, 350 490",
    arrow: "↗️",
    arrowText: "মাথা ঘুরে নিচে লেজ",
    dots: [],
    checkpoints: [
      { x: 510, y: 270, label: "১", pct: 0.18, isStart: true },
      { x: 580, y: 230, label: "২", pct: 0.38 },
      { x: 595, y: 290, label: "৩", pct: 0.55 },
      { x: 490, y: 410, label: "৪", pct: 0.78 },
      { x: 350, y: 490, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Haa (Outer curve + inner loop)
  "هـ": {
    path: "M 580 270 C 510 200, 420 270, 420 340 C 420 380, 520 380, 550 330 C 570 280, 510 260, 460 320 L 320 350",
    arrow: "↖️",
    arrowText: "বাইরে ঘুরে ভেতরে নট",
    dots: [],
    checkpoints: [
      { x: 580, y: 270, label: "১", pct: 0.18, isStart: true },
      { x: 450, y: 230, label: "২", pct: 0.38 },
      { x: 480, y: 375, label: "৩", pct: 0.58 },
      { x: 550, y: 310, label: "৪", pct: 0.78 },
      { x: 320, y: 350, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Hamzah (Compact curved head + angled foot)
  "ء": {
    path: "M 420 230 C 470 180, 530 220, 510 270 L 440 290 L 490 350",
    arrow: "↗️",
    arrowText: "ছোট বাঁকা মাথা",
    dots: [],
    checkpoints: [
      { x: 420, y: 230, label: "১", pct: 0.22, isStart: true },
      { x: 500, y: 200, label: "২", pct: 0.48 },
      { x: 440, y: 290, label: "৩", pct: 0.75 },
      { x: 490, y: 350, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
  // Yaa (Swan neck + deep crescent bowl + 2 diamond dots below)
  "ي": {
    path: "M 540 220 C 590 190, 620 240, 590 280 C 540 310, 460 320, 470 370 C 470 470, 350 480, 270 480 C 200 480, 180 410, 210 350",
    arrow: "➡️",
    arrowText: "ঘাড় ঘুরে নিচে বাটি",
    dots: [
      { x: 330, y: 535, r: 18 },
      { x: 390, y: 535, r: 18 },
    ],
    checkpoints: [
      { x: 540, y: 220, label: "১", pct: 0.15, isStart: true },
      { x: 595, y: 230, label: "২", pct: 0.30 },
      { x: 510, y: 310, label: "৩", pct: 0.45 },
      { x: 470, y: 390, label: "৪", pct: 0.65 },
      { x: 360, y: 475, label: "৫", pct: 0.82 },
      { x: 210, y: 350, label: "শেষ", pct: 1.0, isEnd: true },
    ],
  },
};

// SVG standard coordinate system constants
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

  // ── ADVANCE TO CHECKPOINT (HANDLES BOTH CLICKS AND DRAGS 100% NIKHUD!) ──
  const advanceToCheckpoint = useCallback(
    (targetIdx) => {
      if (isCelebrationFiredRef.current) return;
      if (targetIdx < 0 || targetIdx >= checkpoints.length) return;
      if (targetIdx !== reachedIndex + 1) return;

      setReachedIndex(targetIdx);
      playStarPopSound(targetIdx + 1); // "টুস" popping sound!

      const targetCp = checkpoints[targetIdx];
      const progress =
        targetCp.pct !== undefined
          ? targetCp.pct
          : (targetIdx + 1) / checkpoints.length;

      setFillProgress(Math.min(1, progress));

      // When reaching the final checkpoint:
      if (targetIdx === checkpoints.length - 1) {
        isDraggingRef.current = false;
        triggerCelebration();
      }
    },
    [checkpoints, reachedIndex, triggerCelebration]
  );

  // ── 🎯 STRICTLY BOUNDED TRACING: ZERO INK CAN EVER LEAK OUTSIDE! ──
  // The ink ONLY flows through the hollow channel between the two walls!
  const handleTracingPointerDown = (e) => {
    if (boardMode !== "trace" || isCelebrationFiredRef.current) return;
    const p = getSvgPoint(e);

    const nextIdx = reachedIndex + 1;
    const nextCp = checkpoints[nextIdx];

    // 1. Direct Click / Tap on the next target ball (or close to it, radius 85px):
    if (nextCp) {
      const distToNext = Math.hypot(p.x - nextCp.x, p.y - nextCp.y);
      if (distToNext < 85) {
        isDraggingRef.current = true;
        advanceToCheckpoint(nextIdx);
        return;
      }
    }

    // 2. If at start (reachedIndex < 0), click on Ball 1:
    if (reachedIndex < 0 && checkpoints[0]) {
      const distToFirst = Math.hypot(p.x - checkpoints[0].x, p.y - checkpoints[0].y);
      if (distToFirst < 95) {
        isDraggingRef.current = true;
        advanceToCheckpoint(0);
        return;
      }
    }

    // 3. User pressed on the current/previous ball to continue dragging:
    if (reachedIndex >= 0 && checkpoints[reachedIndex]) {
      const currentCp = checkpoints[reachedIndex];
      const distToCurrent = Math.hypot(p.x - currentCp.x, p.y - currentCp.y);
      if (distToCurrent < 95) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleTracingPointerMove = (e) => {
    if (boardMode !== "trace" || isCelebrationFiredRef.current) return;
    const p = getSvgPoint(e);

    // If child touched and dragged into Ball 1 from outside:
    if (!isDraggingRef.current && reachedIndex < 0 && checkpoints[0]) {
      const distToFirst = Math.hypot(p.x - checkpoints[0].x, p.y - checkpoints[0].y);
      if (distToFirst < 85) {
        isDraggingRef.current = true;
        advanceToCheckpoint(0);
        return;
      }
    }

    // While dragging: check if next checkpoint is reached
    if (isDraggingRef.current) {
      let curr = reachedIndex;
      while (curr + 1 < checkpoints.length) {
        const nextIdx = curr + 1;
        const nextCp = checkpoints[nextIdx];
        const dist = Math.hypot(p.x - nextCp.x, p.y - nextCp.y);
        if (dist < 80) {
          advanceToCheckpoint(nextIdx);
          curr = nextIdx;
        } else {
          break;
        }
      }
    }
  };

  const handleTracingPointerUp = () => {
    isDraggingRef.current = false;
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

              {/* 🎯 7. SVG DOUBLE-WALLED HOLLOW LETTER TRACING ENGINE */}
              {/* Zero ink can leak outside! The walls are 100% solid! */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                onPointerDown={handleTracingPointerDown}
                onPointerMove={handleTracingPointerMove}
                onPointerUp={handleTracingPointerUp}
                onPointerCancel={handleTracingPointerUp}
                onTouchStart={handleTracingPointerDown}
                onTouchMove={handleTracingPointerMove}
                onTouchEnd={handleTracingPointerUp}
                className={`absolute inset-0 w-full h-full z-20 ${
                  boardMode === "trace" ? "cursor-crosshair touch-none" : "pointer-events-none"
                }`}
              >
                {/* 🛡️ THE TWO SOLID WALLS OF THE LETTER (৬২ পিক্সেল পুরু সাদা আউটলাইন) */}
                <path
                  d={currentTracingDef.path}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="68"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))",
                  }}
                  className="pointer-events-none"
                />

                {/* 🕳️ THE HOLLOW CHANNEL BETWEEN THE TWO WALLS (৪৮ পিক্সেল ফাঁপা চ্যানেল) */}
                <path
                  d={currentTracingDef.path}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="48"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                />

                {/* 🎨 THE FILLED INK (STRICTLY CLAMPED INSIDE THE TWO WALLS!) */}
                {/* Ink flows strictly along the hollow channel — zero ink leaks outside! */}
                <path
                  ref={fullPathRef}
                  d={currentTracingDef.path}
                  fill="none"
                  stroke={penColor || "#fbbf24"}
                  strokeWidth="48"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={totalPathLength}
                  strokeDashoffset={strokeDashOffset}
                  style={{
                    transition: isDraggingRef.current ? "none" : "stroke-dashoffset 0.3s ease-out",
                    filter: `drop-shadow(0 0 16px ${penColor})`,
                  }}
                  className="pointer-events-none"
                />

                {/* ⚪ CALLIGRAPHIC RHOMBIC DIAMOND NUKTA (AUTHENTIC ARABIC NUKTA) */}
                {currentTracingDef.dots?.map((d, i) => {
                  const isDotsFilled = fillProgress >= 0.98;
                  const size = (d.r || 18) * 1.5;
                  return (
                    <g key={i} className="pointer-events-none">
                      {/* Outer White Calligraphic Diamond Wall */}
                      <rect
                        x={d.x - size / 2 - 6}
                        y={d.y - size / 2 - 6}
                        width={size + 12}
                        height={size + 12}
                        rx="6"
                        transform={`rotate(45 ${d.x} ${d.y})`}
                        fill="#ffffff"
                        style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))" }}
                      />
                      {/* Inner Translucent Channel / Golden Filled Nukta */}
                      <rect
                        x={d.x - size / 2}
                        y={d.y - size / 2}
                        width={size}
                        height={size}
                        rx="4"
                        transform={`rotate(45 ${d.x} ${d.y})`}
                        fill={isDotsFilled ? (penColor || "#fbbf24") : "rgba(255, 255, 255, 0.45)"}
                        style={{ transition: "fill 0.4s ease" }}
                      />
                    </g>
                  );
                })}

                {/* ⚽ 8. COLLECTIBLE BALLS / ITEMS ALONG THE PATH (ক্লিক বা ড্র্যাগ করলেই সাথে সাথে টুস টুস শব্দে ফুটবে!) */}
                {checkpoints.map((cp, idx) => {
                  const isPopped = idx <= reachedIndex;
                  const isCurrent = idx === reachedIndex;
                  const isNext = idx === reachedIndex + 1;
                  const isInitialStart = reachedIndex < 0 && idx === 0;
                  const isTarget = isInitialStart || isNext;

                  return (
                    <g
                      key={idx}
                      transform={`translate(${cp.x}, ${cp.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTarget) {
                          advanceToCheckpoint(idx);
                        }
                      }}
                      className={isTarget ? "cursor-pointer" : "pointer-events-none"}
                    >
                      {/* 🎯 INVISIBLE EXPANDED TOUCH HIT AREA (RADIUS 45 = 90x90px) — ১ ক্লিকেই নিখুঁত রেসপন্স */}
                      {isTarget && (
                        <circle
                          r="45"
                          fill="transparent"
                          className="cursor-pointer"
                        />
                      )}

                      {/* Active target pulse ring */}
                      {isTarget && (
                        <circle
                          r="30"
                          fill="none"
                          stroke={isInitialStart ? "#10b981" : "#fbbf24"}
                          strokeWidth="3.5"
                          className="animate-ping opacity-85 pointer-events-none"
                        />
                      )}

                      {/* Ball Circle (বাচ্চাদের পছন্দের বল / খাবার) */}
                      {!isPopped ? (
                        <g className="pointer-events-none">
                          <circle
                            r={isTarget ? "22" : "16"}
                            fill={isInitialStart ? "#10b981" : isNext ? "#f59e0b" : "#ffffff"}
                            stroke="#ffffff"
                            strokeWidth="3.5"
                            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
                          />
                          <text
                            y="6"
                            textAnchor="middle"
                            fill={isTarget ? "#ffffff" : "#0f172a"}
                            fontSize={isTarget ? "14" : "12"}
                            fontWeight="bold"
                            className="select-none pointer-events-none font-sans"
                          >
                            {cp.isStart ? "১" : cp.isEnd ? "শেষ" : currentMascot.item}
                          </text>
                        </g>
                      ) : (
                        // Popped State: Golden Star with Checkmark
                        <g className="pointer-events-none animate-scale-up">
                          <circle
                            r="16"
                            fill="#fbbf24"
                            stroke="#ffffff"
                            strokeWidth="3"
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

                      {/* ⬇️ DIRECTIONAL ARROW BANNER AT START (ব্যবহারকারীর চাহিদা অনুযায়ী তীর চিহ্ন) */}
                      {isInitialStart && (
                        <g transform="translate(0, -46)">
                          <rect
                            x="-90"
                            y="-18"
                            width="180"
                            height="36"
                            rx="18"
                            fill="rgba(16, 185, 129, 0.95)"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.35))"
                          />
                          <text
                            y="6"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="bold"
                            className="select-none pointer-events-none font-sans"
                          >
                            {currentTracingDef.arrow} {currentTracingDef.arrowText}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 🐘 9. ANIMATED MASCOT FOLLOWING DIRECTLY ON THE ACTIVE BALL */}
                {activeMascotPos && (
                  <g
                    transform={`translate(${activeMascotPos.x}, ${activeMascotPos.y - 34})`}
                    className="pointer-events-none transition-all duration-300 ease-out"
                  >
                    <circle
                      r="22"
                      fill="#ffffff"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" }}
                    />
                    <text
                      y="8"
                      textAnchor="middle"
                      fontSize="24"
                      className="select-none pointer-events-none animate-bounce"
                    >
                      {currentMascot.emoji}
                    </text>
                  </g>
                )}
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
