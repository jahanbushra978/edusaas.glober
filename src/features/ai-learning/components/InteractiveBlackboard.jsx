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

// ── 29 ARABIC ALPHABET WITH FORMS (ISOLATED, INITIAL, MEDIAL, FINAL) ──
const ARABIC_ALPHABET = [
  { ar: "ا", nameBn: "আলিফ", nameEn: "Alif", forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { ar: "ب", nameBn: "বা", nameEn: "Ba", forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { ar: "ت", nameBn: "তা", nameEn: "Ta", forms: { isolated: "ت", initial: "تـ", medial: "ـতـ", final: "ـত" } },
  { ar: "ث", nameBn: "ছা", nameEn: "Tha", forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { ar: "ج", nameBn: "জীম", nameEn: "Jeem", forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { ar: "ح", nameBn: "হা", nameEn: "Haa", forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { ar: "خ", nameBn: "খা", nameEn: "Kha", forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { ar: "د", nameBn: "দাল", nameEn: "Dal", forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { ar: "ذ", nameBn: "যাল", nameEn: "Dhal", forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { ar: "ر", nameBn: "রা", nameEn: "Ra", forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { ar: "ز", nameBn: "যা", nameEn: "Zay", forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { ar: "س", nameBn: "সীন", nameEn: "Seen", forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" } },
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

// Phonetic Bengali transliteration lookup for Harakat
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

// ── 🎨 HIGH-DEFINITION HOLLOW CALLIGRAPHY VECTOR PATHS & CHECKPOINTS ──
// Standard SVG Coordinate System: viewBox 0 0 900 560
// Center: (450, 280), Calligraphy Baseline: y = 350
// Every checkpoint is 100% MATHEMATICALLY LOCKED DEAD CENTER on the stroke path!
const ARABIC_TRACING_PATHS = {
  // Alif (Top to Bottom)
  "ا": {
    path: "M 450 110 L 450 350",
    dots: [],
    checkpoints: [
      { x: 450, y: 110, label: "১", isStart: true },
      { x: 450, y: 190, label: "২" },
      { x: 450, y: 270, label: "৩" },
      { x: 450, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Baa (Right tip -> Baseline -> Left tip + 1 dot below)
  "ب": {
    path: "M 640 230 Q 610 350 450 350 Q 290 350 260 230",
    dots: [{ x: 450, y: 415, r: 18 }],
    checkpoints: [
      { x: 640, y: 230, label: "১", isStart: true },
      { x: 590, y: 320, label: "২" },
      { x: 450, y: 350, label: "৩" },
      { x: 310, y: 320, label: "৪" },
      { x: 260, y: 230, label: "শেষ", isEnd: true },
    ],
  },
  // Taa (Right tip -> Baseline -> Left tip + 2 dots on top)
  "ت": {
    path: "M 640 230 Q 610 350 450 350 Q 290 350 260 230",
    dots: [
      { x: 480, y: 155, r: 16 },
      { x: 420, y: 155, r: 16 },
    ],
    checkpoints: [
      { x: 640, y: 230, label: "১", isStart: true },
      { x: 590, y: 320, label: "২" },
      { x: 450, y: 350, label: "৩" },
      { x: 310, y: 320, label: "৪" },
      { x: 260, y: 230, label: "শেষ", isEnd: true },
    ],
  },
  // Thaa (Right tip -> Baseline -> Left tip + 3 dots on top)
  "ث": {
    path: "M 640 230 Q 610 350 450 350 Q 290 350 260 230",
    dots: [
      { x: 450, y: 120, r: 15 },
      { x: 480, y: 160, r: 15 },
      { x: 420, y: 160, r: 15 },
    ],
    checkpoints: [
      { x: 640, y: 230, label: "১", isStart: true },
      { x: 590, y: 320, label: "২" },
      { x: 450, y: 350, label: "৩" },
      { x: 310, y: 320, label: "৪" },
      { x: 260, y: 230, label: "শেষ", isEnd: true },
    ],
  },
  // Jeem (Top brow -> tuck in -> crescent belly below baseline + 1 dot inside)
  "ج": {
    path: "M 370 170 L 530 170 Q 460 250 440 260 Q 560 330 520 440 Q 450 510 320 470 Q 240 430 220 360",
    dots: [{ x: 380, y: 370, r: 18 }],
    checkpoints: [
      { x: 370, y: 170, label: "১", isStart: true },
      { x: 530, y: 170, label: "২" },
      { x: 440, y: 260, label: "৩" },
      { x: 520, y: 370, label: "৪" },
      { x: 450, y: 480, label: "৫" },
      { x: 220, y: 360, label: "শেষ", isEnd: true },
    ],
  },
  // Haa (Same crescent without dots)
  "ح": {
    path: "M 370 170 L 530 170 Q 460 250 440 260 Q 560 330 520 440 Q 450 510 320 470 Q 240 430 220 360",
    dots: [],
    checkpoints: [
      { x: 370, y: 170, label: "১", isStart: true },
      { x: 530, y: 170, label: "২" },
      { x: 440, y: 260, label: "৩" },
      { x: 520, y: 370, label: "৪" },
      { x: 450, y: 480, label: "৫" },
      { x: 220, y: 360, label: "শেষ", isEnd: true },
    ],
  },
  // Kha (Same crescent + 1 dot on top)
  "خ": {
    path: "M 370 170 L 530 170 Q 460 250 440 260 Q 560 330 520 440 Q 450 510 320 470 Q 240 430 220 360",
    dots: [{ x: 460, y: 105, r: 18 }],
    checkpoints: [
      { x: 370, y: 170, label: "১", isStart: true },
      { x: 530, y: 170, label: "২" },
      { x: 440, y: 260, label: "৩" },
      { x: 520, y: 370, label: "৪" },
      { x: 450, y: 480, label: "৫" },
      { x: 220, y: 360, label: "শেষ", isEnd: true },
    ],
  },
  // Dal (Top slope down -> flat baseline left)
  "د": {
    path: "M 540 210 Q 490 300 460 330 Q 440 350 330 350",
    dots: [],
    checkpoints: [
      { x: 540, y: 210, label: "১", isStart: true },
      { x: 475, y: 315, label: "২" },
      { x: 420, y: 350, label: "৩" },
      { x: 330, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Dhal (Same + 1 dot on top)
  "ذ": {
    path: "M 540 210 Q 490 300 460 330 Q 440 350 330 350",
    dots: [{ x: 540, y: 140, r: 18 }],
    checkpoints: [
      { x: 540, y: 210, label: "১", isStart: true },
      { x: 475, y: 315, label: "২" },
      { x: 420, y: 350, label: "৩" },
      { x: 330, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Ra (Starts above baseline, plunges down and sweeps into tail)
  "ر": {
    path: "M 520 270 Q 480 340 430 400 Q 380 460 280 470",
    dots: [],
    checkpoints: [
      { x: 520, y: 270, label: "১", isStart: true },
      { x: 470, y: 355, label: "২" },
      { x: 405, y: 425, label: "৩" },
      { x: 280, y: 470, label: "শেষ", isEnd: true },
    ],
  },
  // Zay (Same + 1 dot on top)
  "ز": {
    path: "M 520 270 Q 480 340 430 400 Q 380 460 280 470",
    dots: [{ x: 520, y: 200, r: 18 }],
    checkpoints: [
      { x: 520, y: 270, label: "১", isStart: true },
      { x: 470, y: 355, label: "২" },
      { x: 405, y: 425, label: "৩" },
      { x: 280, y: 470, label: "শেষ", isEnd: true },
    ],
  },
  // Seen (Three teeth -> deep bowl)
  "س": {
    path: "M 650 250 Q 630 320 590 320 Q 580 250 550 250 Q 530 320 490 320 L 490 340 Q 470 470 360 470 Q 250 470 230 360 L 230 330",
    dots: [],
    checkpoints: [
      { x: 650, y: 250, label: "১", isStart: true },
      { x: 590, y: 320, label: "২" },
      { x: 550, y: 250, label: "৩" },
      { x: 490, y: 330, label: "৪" },
      { x: 420, y: 460, label: "৫" },
      { x: 230, y: 330, label: "শেষ", isEnd: true },
    ],
  },
  // Sheen (Three teeth -> deep bowl + 3 dots)
  "ش": {
    path: "M 650 250 Q 630 320 590 320 Q 580 250 550 250 Q 530 320 490 320 L 490 340 Q 470 470 360 470 Q 250 470 230 360 L 230 330",
    dots: [
      { x: 570, y: 160, r: 15 },
      { x: 595, y: 200, r: 15 },
      { x: 545, y: 200, r: 15 },
    ],
    checkpoints: [
      { x: 650, y: 250, label: "১", isStart: true },
      { x: 590, y: 320, label: "২" },
      { x: 550, y: 250, label: "৩" },
      { x: 490, y: 330, label: "৪" },
      { x: 420, y: 460, label: "৫" },
      { x: 230, y: 330, label: "শেষ", isEnd: true },
    ],
  },
  // Saad (Oval head loop -> tooth -> deep bowl)
  "ص": {
    path: "M 480 350 Q 540 260 620 280 Q 660 310 630 350 L 470 350 L 470 320 L 450 350 Q 430 470 340 470 Q 240 470 220 360 L 220 330",
    dots: [],
    checkpoints: [
      { x: 480, y: 350, label: "১", isStart: true },
      { x: 580, y: 270, label: "২" },
      { x: 640, y: 330, label: "৩" },
      { x: 460, y: 335, label: "৪" },
      { x: 380, y: 460, label: "৫" },
      { x: 220, y: 330, label: "শেষ", isEnd: true },
    ],
  },
  // Daad (Same + 1 dot on top of oval)
  "ض": {
    path: "M 480 350 Q 540 260 620 280 Q 660 310 630 350 L 470 350 L 470 320 L 450 350 Q 430 470 340 470 Q 240 470 220 360 L 220 330",
    dots: [{ x: 580, y: 195, r: 18 }],
    checkpoints: [
      { x: 480, y: 350, label: "১", isStart: true },
      { x: 580, y: 270, label: "২" },
      { x: 640, y: 330, label: "৩" },
      { x: 460, y: 335, label: "৪" },
      { x: 380, y: 460, label: "৫" },
      { x: 220, y: 330, label: "শেষ", isEnd: true },
    ],
  },
  // Taa (Vertical mast -> oval loop)
  "ط": {
    path: "M 430 110 L 430 350 Q 520 270 610 290 Q 650 320 620 350 L 300 350",
    dots: [],
    checkpoints: [
      { x: 430, y: 110, label: "১", isStart: true },
      { x: 430, y: 260, label: "২" },
      { x: 550, y: 280, label: "৩" },
      { x: 630, y: 330, label: "৪" },
      { x: 300, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Dhaa (Vertical mast -> oval loop + 1 dot)
  "ظ": {
    path: "M 430 110 L 430 350 Q 520 270 610 290 Q 650 320 620 350 L 300 350",
    dots: [{ x: 480, y: 180, r: 18 }],
    checkpoints: [
      { x: 430, y: 110, label: "১", isStart: true },
      { x: 430, y: 260, label: "২" },
      { x: 550, y: 280, label: "৩" },
      { x: 630, y: 330, label: "৪" },
      { x: 300, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Ayn (Small top crescent -> large bottom belly)
  "ع": {
    path: "M 400 230 Q 480 180 520 220 Q 520 270 450 280 Q 560 360 520 450 Q 440 520 310 470 Q 230 420 210 350",
    dots: [],
    checkpoints: [
      { x: 400, y: 230, label: "১", isStart: true },
      { x: 500, y: 200, label: "২" },
      { x: 450, y: 280, label: "৩" },
      { x: 520, y: 390, label: "৪" },
      { x: 410, y: 490, label: "৫" },
      { x: 210, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Ghayn (Same + 1 dot on top)
  "غ": {
    path: "M 400 230 Q 480 180 520 220 Q 520 270 450 280 Q 560 360 520 450 Q 440 520 310 470 Q 230 420 210 350",
    dots: [{ x: 480, y: 125, r: 18 }],
    checkpoints: [
      { x: 400, y: 230, label: "১", isStart: true },
      { x: 500, y: 200, label: "২" },
      { x: 450, y: 280, label: "৩" },
      { x: 520, y: 390, label: "৪" },
      { x: 410, y: 490, label: "৫" },
      { x: 210, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Fa (Head circle on right -> baseline -> left tip + 1 dot)
  "ف": {
    path: "M 560 270 Q 530 220 580 200 Q 630 220 600 280 L 590 350 Q 450 350 310 350 Q 270 350 250 270",
    dots: [{ x: 580, y: 135, r: 18 }],
    checkpoints: [
      { x: 560, y: 270, label: "১", isStart: true },
      { x: 580, y: 200, label: "২" },
      { x: 590, y: 320, label: "৩" },
      { x: 450, y: 350, label: "৪" },
      { x: 250, y: 270, label: "শেষ", isEnd: true },
    ],
  },
  // Qaaf (Head circle on right -> deep bowl below baseline + 2 dots)
  "ق": {
    path: "M 560 250 Q 530 200 580 180 Q 630 200 600 260 L 590 310 Q 550 460 420 460 Q 290 460 270 340 L 270 300",
    dots: [
      { x: 605, y: 120, r: 16 },
      { x: 555, y: 120, r: 16 },
    ],
    checkpoints: [
      { x: 560, y: 250, label: "১", isStart: true },
      { x: 580, y: 185, label: "২" },
      { x: 590, y: 290, label: "৩" },
      { x: 490, y: 440, label: "৪" },
      { x: 350, y: 450, label: "৫" },
      { x: 270, y: 300, label: "শেষ", isEnd: true },
    ],
  },
  // Kaaf (Top mast -> flat baseline + center hamzah)
  "ك": {
    path: "M 580 130 L 580 330 Q 570 350 320 350 Q 280 350 270 300",
    dots: [{ x: 440, y: 270, r: 18 }],
    checkpoints: [
      { x: 580, y: 130, label: "১", isStart: true },
      { x: 580, y: 260, label: "২" },
      { x: 540, y: 350, label: "৩" },
      { x: 400, y: 350, label: "৪" },
      { x: 270, y: 300, label: "শেষ", isEnd: true },
    ],
  },
  // Laam (Tall mast -> deep bowl)
  "ل": {
    path: "M 540 110 L 540 330 Q 520 470 390 470 Q 260 470 240 350 L 240 320",
    dots: [],
    checkpoints: [
      { x: 540, y: 110, label: "১", isStart: true },
      { x: 540, y: 250, label: "২" },
      { x: 490, y: 430, label: "৩" },
      { x: 360, y: 460, label: "৪" },
      { x: 240, y: 320, label: "শেষ", isEnd: true },
    ],
  },
  // Meem (Circle on baseline -> tail down)
  "م": {
    path: "M 490 320 Q 540 270 580 320 Q 540 360 480 350 L 350 350 L 350 490",
    dots: [],
    checkpoints: [
      { x: 490, y: 320, label: "১", isStart: true },
      { x: 560, y: 280, label: "২" },
      { x: 540, y: 350, label: "৩" },
      { x: 350, y: 350, label: "৪" },
      { x: 350, y: 490, label: "শেষ", isEnd: true },
    ],
  },
  // Noon (Deep bowl + 1 center dot)
  "ن": {
    path: "M 610 270 Q 590 450 450 450 Q 310 450 290 270",
    dots: [{ x: 450, y: 290, r: 18 }],
    checkpoints: [
      { x: 610, y: 270, label: "১", isStart: true },
      { x: 560, y: 390, label: "২" },
      { x: 450, y: 450, label: "৩" },
      { x: 340, y: 390, label: "৪" },
      { x: 290, y: 270, label: "শেষ", isEnd: true },
    ],
  },
  // Waw (Loop at baseline -> tail below)
  "و": {
    path: "M 490 280 Q 530 220 580 250 Q 610 290 560 320 Q 500 370 450 440 Q 400 480 320 480",
    dots: [],
    checkpoints: [
      { x: 490, y: 280, label: "১", isStart: true },
      { x: 560, y: 230, label: "২" },
      { x: 560, y: 320, label: "৩" },
      { x: 450, y: 420, label: "৪" },
      { x: 320, y: 480, label: "শেষ", isEnd: true },
    ],
  },
  // Haa (Outer curve and inner loop)
  "هـ": {
    path: "M 560 260 Q 490 200 420 280 Q 400 350 510 350 Q 570 330 540 280 Q 510 250 460 320 L 320 350",
    dots: [],
    checkpoints: [
      { x: 560, y: 260, label: "১", isStart: true },
      { x: 440, y: 230, label: "২" },
      { x: 480, y: 350, label: "৩" },
      { x: 520, y: 280, label: "৪" },
      { x: 320, y: 350, label: "শেষ", isEnd: true },
    ],
  },
  // Hamzah
  "ء": {
    path: "M 430 230 Q 490 190 510 240 Q 500 280 440 290 L 490 320",
    dots: [],
    checkpoints: [
      { x: 430, y: 230, label: "১", isStart: true },
      { x: 500, y: 210, label: "২" },
      { x: 440, y: 290, label: "৩" },
      { x: 490, y: 320, label: "শেষ", isEnd: true },
    ],
  },
  // Yaa (Swan neck -> wide bowl + 2 dots below)
  "ي": {
    path: "M 540 220 Q 580 200 590 240 Q 580 280 500 300 Q 450 320 460 360 Q 460 460 350 460 Q 250 460 230 360 L 230 330",
    dots: [
      { x: 380, y: 505, r: 16 },
      { x: 330, y: 505, r: 16 },
    ],
    checkpoints: [
      { x: 540, y: 220, label: "১", isStart: true },
      { x: 580, y: 240, label: "২" },
      { x: 480, y: 310, label: "৩" },
      { x: 410, y: 450, label: "৪" },
      { x: 230, y: 330, label: "শেষ", isEnd: true },
    ],
  },
};

// SVG standard coordinate system constants
const SVG_VIEWBOX_WIDTH = 900;
const SVG_VIEWBOX_HEIGHT = 560;

export default function InteractiveBlackboard({ onCompleteExercise: _onCompleteExercise }) {
  const { t, isRTL: _isRTL, dir, lang } = useLearningLanguage();

  const [selectedLetter, setSelectedLetter] = useState(ARABIC_ALPHABET[1]); // Default 'Ba'
  const [selectedForm, setSelectedForm] = useState("isolated"); // 'isolated' | 'initial' | 'medial' | 'final'
  const [selectedHarakat, setSelectedHarakat] = useState("none");

  // Mode: "trace" (Hollow path guided tracing) vs "freehand" (Open drawing slate)
  const [boardMode, setBoardMode] = useState("trace");

  // Chalk & Duster Tools
  const [tool, setTool] = useState("pen"); // 'pen' | 'eraser'
  const [penColor, setPenColor] = useState("#fbbf24"); // Rich golden amber chalk
  const [penWidth, setPenWidth] = useState(10); // 6, 10, 16 px
  const [showGuide, setShowGuide] = useState(true);
  const [showLines, setShowLines] = useState(true);

  // Tracing State
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [hitCheckpoints, setHitCheckpoints] = useState([]);
  const [strokePoints, setStrokePoints] = useState([]);
  const [tracingProgress, setTracingProgress] = useState(0);

  // Gamification & Celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });

  const boardContainerRef = useRef(null);
  const svgRef = useRef(null);
  const drawCanvasRef = useRef(null);

  const isTracingDraggingRef = useRef(false);
  const isFreehandDrawingRef = useRef(false);
  const lastFreehandPointRef = useRef({ x: 0, y: 0 });
  const isCelebrationFiredRef = useRef(false);

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
        path: "M 640 230 Q 610 350 450 350 Q 290 350 260 230",
        dots: [],
        checkpoints: [
          { x: 640, y: 230, label: "১", isStart: true },
          { x: 450, y: 350, label: "২" },
          { x: 260, y: 230, label: "শেষ", isEnd: true },
        ],
      }
    );
  }, [selectedLetter.ar]);

  const checkpoints = currentTracingDef.checkpoints;

  // Clear Canvas and reset stroke tracking
  const handleClear = useCallback(() => {
    // Clear freehand canvas
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clear guided tracing
    setHitCheckpoints([]);
    setActiveCheckpointIndex(0);
    setStrokePoints([]);
    isCelebrationFiredRef.current = false;
    isTracingDraggingRef.current = false;
    setTracingProgress(0);
    setShowCelebration(false);
  }, []);

  // ── TRIGGER MA SHA ALLAH GAME CELEBRATION (Only on 100% Genuine Completion) ──
  const triggerCelebration = useCallback(() => {
    if (isCelebrationFiredRef.current) return;
    isCelebrationFiredRef.current = true;
    setTracingProgress(100);
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
    const ro = new ResizeObserver(updateDimensions);
    if (boardContainerRef.current) ro.observe(boardContainerRef.current);

    return () => {
      window.removeEventListener("resize", updateDimensions);
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

  // ── 🎨 GUIDED HOLLOW TRACING EVENT HANDLERS (CLICK & DRAG INSIDE HOLLOW LETTER) ──
  const handleTracingPointerDown = (e) => {
    if (boardMode !== "trace" || isCelebrationFiredRef.current) return;
    const p = getSvgPoint(e);

    const firstCp = checkpoints[0];
    const distToFirst = Math.hypot(p.x - firstCp.x, p.y - firstCp.y);

    const currentCp = checkpoints[activeCheckpointIndex];
    const distToCurrent = currentCp ? Math.hypot(p.x - currentCp.x, p.y - currentCp.y) : 999;

    // Start at bead 0 or continue from current active bead
    if (activeCheckpointIndex === 0 && distToFirst < 80) {
      isTracingDraggingRef.current = true;
      setHitCheckpoints([true]);
      setActiveCheckpointIndex(0);
      setStrokePoints([{ x: firstCp.x, y: firstCp.y }, { x: p.x, y: p.y }]);
      playStarPopSound(1);
      setTracingProgress(Math.round((1 / checkpoints.length) * 100));
    } else if (distToCurrent < 80) {
      isTracingDraggingRef.current = true;
      setStrokePoints((prev) => [...prev, { x: p.x, y: p.y }]);
    }
  };

  const handleTracingPointerMove = (e) => {
    if (!isTracingDraggingRef.current || boardMode !== "trace" || isCelebrationFiredRef.current) return;
    const p = getSvgPoint(e);

    setStrokePoints((prev) => [...prev, { x: p.x, y: p.y }]);

    // Check hit against next checkpoint
    const nextIdx = activeCheckpointIndex + 1;
    if (nextIdx < checkpoints.length) {
      const nextCp = checkpoints[nextIdx];
      const dist = Math.hypot(p.x - nextCp.x, p.y - nextCp.y);

      if (dist < 56) {
        setActiveCheckpointIndex(nextIdx);
        setHitCheckpoints((prev) => {
          const next = [...prev];
          next[nextIdx] = true;
          return next;
        });
        playStarPopSound(nextIdx + 1);

        const progress = Math.min(100, Math.round(((nextIdx + 1) / checkpoints.length) * 100));
        setTracingProgress(progress);

        // When final target is reached
        if (nextIdx === checkpoints.length - 1) {
          isTracingDraggingRef.current = false;
          triggerCelebration();
        }
      }
    }
  };

  const handleTracingPointerUp = () => {
    isTracingDraggingRef.current = false;
  };

  // ── ✏️ FREEHAND CHALK DRAWING EVENT HANDLERS ──
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
      ctx.shadowBlur = 0;
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

  // Next Letter Handler (moves to next of 29 letters)
  const handleNextLetter = () => {
    const currentIndex = ARABIC_ALPHABET.findIndex((item) => item.ar === selectedLetter.ar);
    const nextIndex = (currentIndex + 1) % ARABIC_ALPHABET.length;
    const nextLetter = ARABIC_ALPHABET[nextIndex];

    setSelectedLetter(nextLetter);
    setShowCelebration(false);
    handleClear();

    const charToSpeak = getAudioToken(nextLetter.ar, selectedHarakat);
    playArabicSound(charToSpeak);
    toast.success(`মাশাআল্লাহ! পরবর্তী হরফ "${nextLetter.nameBn}" নির্বাচিত হয়েছে।`);
  };

  // Repeat current letter
  const handleRepeatCurrentLetter = () => {
    setShowCelebration(false);
    handleClear();
    playPronunciation();
  };

  // Manual Check Button (Verifies letter tracing)
  const handleManualVerify = () => {
    if (activeCheckpointIndex >= checkpoints.length - 1) {
      triggerCelebration();
      return;
    }
    toast.info("হরফটি শুরুর ১ নম্বর পয়েন্ট থেকে টেনে শেষ পর্যন্ত পূর্ণ করুন।");
  };

  // Download drawn handwriting as PNG
  const handleDownloadImage = () => {
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = dimensions.width;
      tempCanvas.height = dimensions.height;
      const tCtx = tempCanvas.getContext("2d");

      // Draw rich chalkboard background
      tCtx.fillStyle = "#051810";
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw watermark guide if enabled
      if (showGuide) {
        tCtx.fillStyle = "rgba(52, 211, 153, 0.25)";
        tCtx.font = "bold 260px 'Amiri', 'Traditional Arabic', serif";
        tCtx.textAlign = "center";
        tCtx.textBaseline = "middle";
        tCtx.fillText(activeChar, tempCanvas.width / 2, tempCanvas.height / 2);
      }

      // Draw user's freehand strokes if any
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

  // SVG Filled Chalk Stroke Path String
  const strokePathD = useMemo(() => {
    if (!strokePoints || strokePoints.length < 2) return "";
    let d = `M ${strokePoints[0].x} ${strokePoints[0].y}`;
    for (let i = 1; i < strokePoints.length; i++) {
      d += ` L ${strokePoints[i].x} ${strokePoints[i].y}`;
    }
    return d;
  }, [strokePoints]);

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
              নিখুঁত ট্রেসিং গেম: হরফের ভেতরে <span className="text-emerald-400 font-bold">১ নম্বর সবুজ পয়েন্টে</span> টাচ করে পথ ধরে টেনে <span className="text-amber-400 font-bold">শেষ পয়েন্টে</span> যান! 🎮
            </p>
          </div>
        </div>

        {/* Real-time Progress Bar & Audio Action */}
        <div className="flex items-center gap-3">
          {/* Tracing Progress Meter */}
          <div className="flex flex-col items-end gap-1 min-w-[150px]">
            <div className="flex items-center justify-between w-full text-[11px] font-bold">
              <span className="text-slate-300">ট্রেসিং অগ্রগতি:</span>
              <span
                className={`font-mono font-black ${
                  tracingProgress === 100 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {tracingProgress}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/60 border border-emerald-900/60 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  tracingProgress === 100
                    ? "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-md shadow-emerald-500/50"
                    : "bg-gradient-to-r from-emerald-600 via-amber-500 to-amber-400"
                }`}
                style={{ width: `${tracingProgress}%` }}
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
          {/* WOODEN SLATE CASING (আসল কাঠের ফ্রেমযুক্ত ঐতিহ্যবাহী স্লেট) */}
          <div className="relative rounded-[32px] p-2.5 sm:p-4 bg-gradient-to-b from-[#3d1f11] via-[#24130a] to-[#140a04] border-4 border-[#522a16] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.18),inset_0_-2px_4px_rgba(0,0,0,0.8)] ring-1 ring-amber-700/60 flex flex-col">
            {/* Wooden Slate Corner Studs */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 shadow border border-amber-900/60" />

            {/* BLACKBOARD WRITING SURFACE (উঁচু, গভীর ও প্রশস্ত স্লেট) */}
            <div
              ref={boardContainerRef}
              className="relative rounded-[24px] bg-[#04140d] border-2 border-emerald-950 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden h-[480px] sm:h-[540px] md:h-[580px] w-full select-none"
            >
              {/* Slate Gradient & Chalk Dust Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#092b1d] via-[#05170f] to-[#020b06] pointer-events-none" />

              {/* Calligraphy Ruled Guidelines (খাতার মতো ক্যালিগ্রাফি নির্দেশিকা লাইন) */}
              {showLines && (
                <div className="absolute inset-0 flex flex-col justify-between py-16 sm:py-20 px-6 pointer-events-none z-0 opacity-40">
                  {/* Top Ascender Line */}
                  <div className="w-full border-b border-dashed border-emerald-400/35 relative">
                    <span className="absolute -top-4 right-0 text-[10px] text-emerald-400/70 font-english-italic">
                      Ascender Line
                    </span>
                  </div>

                  {/* Central Baseline */}
                  <div className="w-full border-b-2 border-amber-400/50 relative shadow-xs">
                    <span className="absolute -top-4 right-0 text-[10px] text-amber-300/80 font-english-italic">
                      Base Line
                    </span>
                  </div>

                  {/* Bottom Descender Line */}
                  <div className="w-full border-b border-dashed border-emerald-400/35 relative">
                    <span className="absolute -top-4 right-0 text-[10px] text-emerald-400/70 font-english-italic">
                      Descender Line
                    </span>
                  </div>
                </div>
              )}

              {/* 🎯 PRECISION SVG HOLLOW TRACING LAYER */}
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
                className={`absolute inset-0 w-full h-full z-15 ${
                  boardMode === "trace" ? "cursor-crosshair touch-none" : "pointer-events-none"
                }`}
              >
                {/* 🌟 1. HOLLOW ARABIC LETTER (থ্রি-ডি ফাঁপা রূপরেখা — ছবি অনুযায়ী বড় ও স্পষ্ট) */}
                {showGuide && (
                  <g>
                    {/* Outer Glow & White Outline Tube */}
                    <path
                      d={currentTracingDef.path}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.95)"
                      strokeWidth="62"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        filter: "drop-shadow(0 0 16px rgba(52, 211, 153, 0.6))",
                      }}
                      className="pointer-events-none"
                    />

                    {/* Inner Hollow Tube Channel (Blackboard Emerald) */}
                    <path
                      d={currentTracingDef.path}
                      fill="none"
                      stroke="#04140d"
                      strokeWidth="44"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none"
                    />

                    {/* Dots (নুক্তা) with matching hollow white border */}
                    {currentTracingDef.dots?.map((d, i) => (
                      <g key={i} className="pointer-events-none">
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={d.r + 7}
                          fill="#ffffff"
                          style={{ filter: "drop-shadow(0 0 10px rgba(52, 211, 153, 0.6))" }}
                        />
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={d.r}
                          fill={isCelebrationFiredRef.current ? penColor : "#04140d"}
                          style={{ transition: "fill 0.4s ease" }}
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* 〰️ 2. DASHED CALLIGRAPHY DIRECTIONAL GUIDE LINE */}
                {showGuide && (
                  <path
                    d={currentTracingDef.path}
                    fill="none"
                    stroke="rgba(251, 191, 36, 0.45)"
                    strokeWidth="3.5"
                    strokeDasharray="6 6"
                    className="pointer-events-none"
                  />
                )}

                {/* 🎨 3. FILLED CHALK STROKE (হরফের ভেতরে নিখুঁতভাবে চক দিয়ে ভরাট হওয়া রেখা) */}
                {strokePathD && (
                  <path
                    d={strokePathD}
                    fill="none"
                    stroke={penColor}
                    strokeWidth="44"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                    style={{
                      filter: `drop-shadow(0 0 16px ${penColor})`,
                    }}
                  />
                )}

                {/* 🟢 4. CHECKPOINTS (১, ২, ৩... শেষ পয়েন্টসমূহ — হরফের ভেতরে ১০০% নিখুঁতভাবে স্থাপিত) */}
                {showGuide &&
                  boardMode === "trace" &&
                  checkpoints.map((cp, idx) => {
                    const isHit = hitCheckpoints[idx];
                    const isNext = idx === activeCheckpointIndex + 1;
                    const isInitialStart = idx === 0 && !isHit;

                    return (
                      <g key={idx} transform={`translate(${cp.x}, ${cp.y})`}>
                        {/* Outer Pulse Ring for active or start target */}
                        {(isInitialStart || isNext) && (
                          <circle
                            r="28"
                            fill="none"
                            stroke={isInitialStart ? "#34d399" : "#fbbf24"}
                            strokeWidth="3.5"
                            className="animate-ping opacity-75 pointer-events-none"
                          />
                        )}

                        {/* Main Checkpoint Bead Circle */}
                        <circle
                          r={isHit ? "16" : isInitialStart || isNext ? "22" : "15"}
                          fill={
                            isHit
                              ? "#fbbf24"
                              : isInitialStart
                              ? "#10b981"
                              : isNext
                              ? "#f59e0b"
                              : "rgba(5, 40, 25, 0.9)"
                          }
                          stroke={isHit ? "#ffffff" : isInitialStart ? "#6ee7b7" : "#fde68a"}
                          strokeWidth="3"
                          filter="drop-shadow(0 3px 6px rgba(0,0,0,0.6))"
                          className="pointer-events-none"
                        />

                        {/* Number label inside bead */}
                        <text
                          y="5"
                          textAnchor="middle"
                          fill={isHit ? "#0f172a" : "#ffffff"}
                          fontSize={isHit ? "14" : "13"}
                          fontWeight="bold"
                          className="select-none pointer-events-none font-sans"
                        >
                          {isHit ? "✓" : cp.isStart ? "১" : cp.isEnd ? "শেষ" : cp.label}
                        </text>

                        {/* Start Prompt Banner if not started */}
                        {isInitialStart && (
                          <g transform="translate(0, -38)">
                            <rect
                              x="-68"
                              y="-14"
                              width="136"
                              height="28"
                              rx="14"
                              fill="rgba(16, 185, 129, 0.95)"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                              className="pointer-events-none"
                            />
                            <text
                              y="4"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              className="select-none pointer-events-none font-sans"
                            >
                              👆 স্পর্শ করে টানুন
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
              </svg>

              {/* ✏️ FREEHAND CHALK CANVAS (মুক্ত ড্রয়িং মোড) */}
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

              {/* 🌟 GAME CELEBRATION MODAL OVERLAY (মাশাআল্লাহ! ১০০% নিখুঁত সেলিব্রেশন) */}
              {showCelebration && (
                <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md rounded-[24px] flex flex-col items-center justify-center p-6 text-center animate-fade-in select-none">
                  {/* Floating celebratory ribbon */}
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

                  {/* Title & XP Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 text-xs font-black mb-2 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>১০০% নিখুঁত ট্রেসিং সম্পন্ন · ৩ স্টার পারফেক্ট! +৫ 🪙</span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                    দারুণ! হরফটি ক্রমান্বয়ে নিখুঁতভাবে শেষ হয়েছে!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 max-w-sm mb-5">
                    আপনি <span className="font-bold text-amber-300 font-amiri text-base">{activeChar}</span> হরফটি সঠিক নিয়মে এবং খাঁটি মাখরাজে পূর্ণ করেছেন।
                  </p>

                  {/* Celebration Action Buttons */}
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
              {/* Left Group: Mode Selector & Chalk Tools */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Mode Toggle: Trace vs Freehand */}
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
                    title="মুক্তভাবে চক দিয়ে লেখার স্লেটের মোড"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>মুক্ত চকখড়ি</span>
                  </button>
                </div>

                {/* Pen / Eraser (Active only in freehand or color selector) */}
                {boardMode === "freehand" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTool("pen")}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                        tool === "pen"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black ring-1 ring-amber-300"
                          : "text-slate-300 hover:bg-slate-800/80 bg-black/40 border border-emerald-900/50"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>চক</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTool("eraser")}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                        tool === "eraser"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black ring-1 ring-amber-300"
                          : "text-slate-300 hover:bg-slate-800/80 bg-black/40 border border-emerald-900/50"
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>ডাস্টার</span>
                    </button>
                  </>
                )}

                {/* Chalk Width Selector */}
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-emerald-900/50">
                  {[
                    { size: 6, label: "চিকন" },
                    { size: 10, label: "স্বাভাবিক" },
                    { size: 16, label: "মোটা" },
                  ].map((w) => (
                    <button
                      key={w.size}
                      type="button"
                      onClick={() => setPenWidth(w.size)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        penWidth === w.size
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                      title={`চকের ঘনত্ব: ${w.label}`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {/* Chalk Colors Palette */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-900/60">
                  {[
                    { color: "#ffffff", name: "সাদা" },
                    { color: "#fbbf24", name: "সোনালী" },
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
                {/* Manual Verify Button */}
                <button
                  type="button"
                  onClick={handleManualVerify}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer active:scale-95"
                  title="লেখা শেষে নিখুঁতভাবে যাচাই করুন"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>যাচাই</span>
                </button>

                {/* Tracing Toggle */}
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    showGuide
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-xs"
                      : "bg-slate-900/80 text-slate-400 border border-slate-800"
                  }`}
                  title="ট্রেসিং হরফের রূপরেখা দেখান বা লুকান"
                >
                  {showGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{showGuide ? "ট্রেসিং অন" : "ট্রেসিং অফ"}</span>
                </button>

                {/* Calligraphy Lines Toggle */}
                <button
                  type="button"
                  onClick={() => setShowLines(!showLines)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    showLines
                      ? "bg-amber-950/80 text-amber-300 border border-amber-700 shadow-xs"
                      : "bg-slate-900/80 text-slate-400 border border-slate-800"
                  }`}
                  title="ক্যালিগ্রাফি রুলড লাইন দেখান বা লুকান"
                >
                  <span className="font-mono text-xs">📏</span>
                  <span className="hidden sm:inline">{showLines ? "দাগ অন" : "দাগ অফ"}</span>
                </button>

                {/* Save/Download Canvas Drawing */}
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-emerald-900/70 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="আপনার হাতের লেখা ছবি হিসেবে সেভ করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">সেভ</span>
                </button>

                {/* Clear Board */}
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

        {/* RIGHT COLUMN: 29 ARABIC ALPHABET SELECTOR (col-span-4) */}
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
