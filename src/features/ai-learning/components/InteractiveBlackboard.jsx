"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Target
} from "lucide-react";
import { toast } from "sonner";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import {
  playArabicSound,
  playMaShaAllahCelebration,
  playStarPopSound
} from "../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../lib/confetti";

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
  { ar: "ي", nameBn: "ইয়া", nameEn: "Yaa", forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } },
];

const HARAKAT_LIST = [
  { id: "none", symbol: "", labelBn: "মূল রূপ", labelEn: "Base", labelAr: "الأصل" },
  { id: "fathah", symbol: "\u064E", labelBn: "যবর (Fathah)", labelEn: "Fathah (a)", labelAr: "الفتحة" },
  { id: "kasrah", symbol: "\u0650", labelBn: "যের (Kasrah)", labelEn: "Kasrah (i)", labelAr: "الكسرة" },
  { id: "dammah", symbol: "\u064F", labelBn: "পেশ (Dammah)", labelEn: "Dammah (u)", labelAr: "الضمة" },
  { id: "sukoon", symbol: "\u0652", labelBn: "জযম (Sukoon)", labelEn: "Sukoon (o)", labelAr: "السكون" },
];

const HARAKAT_PRONUNCIATION_MAP = {
  "ا": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ب": { fathah: "বা", kasrah: "বি", dammah: "বু", sukoon: "আব্ (ক্বলক্বলাহ)" },
  "ت": { fathah: "তা", kasrah: "তি", dammah: "তু", sukoon: "আৎ" },
  "ث": { fathah: "ছা (নরম)", kasrah: "ছি", dammah: "ছু", sukoon: "আছ্" },
  "ج": { fathah: "জা", kasrah: "জি", dammah: "জু", sukoon: "আজ্ (ক্বলক্বলাহ)" },
  "ح": { fathah: "হা (হলকী)", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "خ": { fathah: "খা (মোটা)", kasrah: "খি", dammah: "খু", sukoon: "আখ্" },
  "د": { fathah: "দা", kasrah: "দি", dammah: "দু", sukoon: "আদ্ (ক্বলক্বলাহ)" },
  "ذ": { fathah: "যা (নরম)", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "ر": { fathah: "রা (মোটা)", kasrah: "রি", dammah: "রু (মোটা)", sukoon: "আর্" },
  "ز": { fathah: "যা (শিস)", kasrah: "যি", dammah: "যু", sukoon: "আয্" },
  "س": { fathah: "সা (শিস)", kasrah: "সি", dammah: "সু", sukoon: "আস্" },
  "ش": { fathah: "শা", kasrah: "শি", dammah: "শু", sukoon: "আশ্" },
  "ص": { fathah: "সোয়া (মোটা)", kasrah: "সি", dammah: "সু", sukoon: "আছ্" },
  "ض": { fathah: "দোয়া (ভারী)", kasrah: "দি", dammah: "দু", sukoon: "আদ্" },
  "ط": { fathah: "তোয়া (মোটা)", kasrah: "ত্বি", dammah: "ত্বু", sukoon: "আত্ব্ (ক্বলক্বলাহ)" },
  "ظ": { fathah: "জোয়া (মোটা)", kasrah: "যি", dammah: "যু", sukoon: "আজ্" },
  "ع": { fathah: "আ' (হলকী)", kasrah: "ই'", dammah: "উ'", sukoon: "আ'আ্" },
  "غ": { fathah: "গা (মোটা)", kasrah: "গি", dammah: "গু", sukoon: "আগ্" },
  "ف": { fathah: "ফা", kasrah: "ফি", dammah: "ফু", sukoon: "আফ্" },
  "ق": { fathah: "ক্বা (ভারী)", kasrah: "ক্বি", dammah: "ক্বু", sukoon: "আক্ব্ (ক্বলক্বলাহ)" },
  "ك": { fathah: "কা", kasrah: "কি", dammah: "কু", sukoon: "আক্" },
  "ل": { fathah: "লা", kasrah: "লি", dammah: "লু", sukoon: "আল্" },
  "م": { fathah: "মা", kasrah: "মি", dammah: "মু", sukoon: "আম্" },
  "ن": { fathah: "না", kasrah: "নি", dammah: "নু", sukoon: "আন্" },
  "و": { fathah: "ওয়া", kasrah: "ওয়ি", dammah: "উ", sukoon: "আও" },
  "هـ": { fathah: "হা", kasrah: "হি", dammah: "হু", sukoon: "আহ্" },
  "ء": { fathah: "আ", kasrah: "ই", dammah: "উ", sukoon: "আহ্" },
  "ي": { fathah: "ইয়া", kasrah: "য়ি", dammah: "য়ু", sukoon: "আই" },
};

// ── AUTHENTIC CALLIGRAPHY STROKE ANCHORS FOR ALL 29 ARABIC LETTERS ──
// Normalized relative coordinates [0, 1] mapped directly inside the rendered letter bounds
const LETTER_ANCHORS = {
  // Alif (Top to Bottom)
  "ا": {
    start: { x: 0.50, y: 0.16 },
    waypoints: [
      { x: 0.50, y: 0.38 },
      { x: 0.50, y: 0.60 },
      { x: 0.50, y: 0.76 },
    ],
    end: { x: 0.50, y: 0.88 },
  },
  // Baa, Taa, Thaa (Right tip -> Baseline -> Left tip)
  "ب": {
    start: { x: 0.86, y: 0.46 },
    waypoints: [
      { x: 0.75, y: 0.58 },
      { x: 0.55, y: 0.62 },
      { x: 0.35, y: 0.62 },
      { x: 0.20, y: 0.56 },
    ],
    end: { x: 0.12, y: 0.46 },
  },
  "ت": {
    start: { x: 0.86, y: 0.48 },
    waypoints: [
      { x: 0.75, y: 0.60 },
      { x: 0.55, y: 0.64 },
      { x: 0.35, y: 0.64 },
      { x: 0.20, y: 0.58 },
    ],
    end: { x: 0.12, y: 0.48 },
  },
  "ث": {
    start: { x: 0.86, y: 0.52 },
    waypoints: [
      { x: 0.75, y: 0.64 },
      { x: 0.55, y: 0.68 },
      { x: 0.35, y: 0.68 },
      { x: 0.20, y: 0.62 },
    ],
    end: { x: 0.12, y: 0.52 },
  },
  // Jeem, Haa, Khaa (Top brow -> center tuck -> crescent belly -> left tail tip)
  "ج": {
    start: { x: 0.55, y: 0.26 },
    waypoints: [
      { x: 0.76, y: 0.28 },
      { x: 0.62, y: 0.46 },
      { x: 0.74, y: 0.64 },
      { x: 0.50, y: 0.82 },
      { x: 0.30, y: 0.80 },
    ],
    end: { x: 0.16, y: 0.72 },
  },
  "ح": {
    start: { x: 0.55, y: 0.26 },
    waypoints: [
      { x: 0.76, y: 0.28 },
      { x: 0.62, y: 0.46 },
      { x: 0.74, y: 0.64 },
      { x: 0.50, y: 0.82 },
      { x: 0.30, y: 0.80 },
    ],
    end: { x: 0.16, y: 0.72 },
  },
  "خ": {
    start: { x: 0.55, y: 0.32 },
    waypoints: [
      { x: 0.76, y: 0.34 },
      { x: 0.62, y: 0.50 },
      { x: 0.74, y: 0.68 },
      { x: 0.50, y: 0.84 },
      { x: 0.30, y: 0.82 },
    ],
    end: { x: 0.16, y: 0.74 },
  },
  // Dal, Dhal (Top -> curve down-left)
  "د": {
    start: { x: 0.74, y: 0.36 },
    waypoints: [
      { x: 0.60, y: 0.52 },
      { x: 0.45, y: 0.64 },
    ],
    end: { x: 0.24, y: 0.66 },
  },
  "ذ": {
    start: { x: 0.74, y: 0.44 },
    waypoints: [
      { x: 0.60, y: 0.58 },
      { x: 0.45, y: 0.68 },
    ],
    end: { x: 0.24, y: 0.70 },
  },
  // Ra, Zay (Top -> curve down-left under baseline)
  "ر": {
    start: { x: 0.72, y: 0.42 },
    waypoints: [
      { x: 0.60, y: 0.56 },
      { x: 0.44, y: 0.70 },
    ],
    end: { x: 0.22, y: 0.80 },
  },
  "ز": {
    start: { x: 0.72, y: 0.48 },
    waypoints: [
      { x: 0.60, y: 0.60 },
      { x: 0.44, y: 0.74 },
    ],
    end: { x: 0.22, y: 0.82 },
  },
  // Seen, Sheen (Right teeth -> middle teeth -> deep bowl)
  "س": {
    start: { x: 0.88, y: 0.42 },
    waypoints: [
      { x: 0.72, y: 0.46 },
      { x: 0.56, y: 0.48 },
      { x: 0.44, y: 0.66 },
      { x: 0.28, y: 0.70 },
    ],
    end: { x: 0.12, y: 0.50 },
  },
  "ش": {
    start: { x: 0.88, y: 0.50 },
    waypoints: [
      { x: 0.72, y: 0.54 },
      { x: 0.56, y: 0.56 },
      { x: 0.44, y: 0.72 },
      { x: 0.28, y: 0.74 },
    ],
    end: { x: 0.12, y: 0.54 },
  },
  // Saad, Daad (Oval loop -> tooth -> deep bowl)
  "ص": {
    start: { x: 0.75, y: 0.56 },
    waypoints: [
      { x: 0.88, y: 0.50 },
      { x: 0.70, y: 0.46 },
      { x: 0.54, y: 0.48 },
      { x: 0.42, y: 0.68 },
      { x: 0.26, y: 0.72 },
    ],
    end: { x: 0.12, y: 0.52 },
  },
  "ض": {
    start: { x: 0.75, y: 0.58 },
    waypoints: [
      { x: 0.88, y: 0.54 },
      { x: 0.70, y: 0.50 },
      { x: 0.54, y: 0.52 },
      { x: 0.42, y: 0.70 },
      { x: 0.26, y: 0.74 },
    ],
    end: { x: 0.12, y: 0.54 },
  },
  // Taa, Dhaa (Vertical mast -> oval loop)
  "ط": {
    start: { x: 0.52, y: 0.18 },
    waypoints: [
      { x: 0.52, y: 0.44 },
      { x: 0.78, y: 0.52 },
      { x: 0.50, y: 0.64 },
    ],
    end: { x: 0.20, y: 0.66 },
  },
  "ظ": {
    start: { x: 0.52, y: 0.22 },
    waypoints: [
      { x: 0.52, y: 0.48 },
      { x: 0.78, y: 0.56 },
      { x: 0.50, y: 0.66 },
    ],
    end: { x: 0.20, y: 0.68 },
  },
  // Ayn, Ghayn (Top crescent brow -> large bottom belly)
  "ع": {
    start: { x: 0.54, y: 0.28 },
    waypoints: [
      { x: 0.72, y: 0.32 },
      { x: 0.56, y: 0.46 },
      { x: 0.72, y: 0.64 },
      { x: 0.50, y: 0.82 },
      { x: 0.30, y: 0.80 },
    ],
    end: { x: 0.16, y: 0.74 },
  },
  "غ": {
    start: { x: 0.54, y: 0.34 },
    waypoints: [
      { x: 0.72, y: 0.38 },
      { x: 0.56, y: 0.50 },
      { x: 0.72, y: 0.68 },
      { x: 0.50, y: 0.84 },
      { x: 0.30, y: 0.82 },
    ],
    end: { x: 0.16, y: 0.76 },
  },
  // Fa (Head circle -> baseline -> left tip)
  "ف": {
    start: { x: 0.78, y: 0.42 },
    waypoints: [
      { x: 0.88, y: 0.38 },
      { x: 0.70, y: 0.56 },
      { x: 0.50, y: 0.62 },
      { x: 0.30, y: 0.62 },
    ],
    end: { x: 0.14, y: 0.52 },
  },
  // Qaaf (Head circle -> deep bowl)
  "ق": {
    start: { x: 0.76, y: 0.40 },
    waypoints: [
      { x: 0.86, y: 0.36 },
      { x: 0.68, y: 0.54 },
      { x: 0.46, y: 0.70 },
      { x: 0.28, y: 0.70 },
    ],
    end: { x: 0.16, y: 0.54 },
  },
  // Kaaf (Top mast -> down -> baseline)
  "ك": {
    start: { x: 0.76, y: 0.22 },
    waypoints: [
      { x: 0.74, y: 0.48 },
      { x: 0.55, y: 0.64 },
      { x: 0.35, y: 0.64 },
    ],
    end: { x: 0.14, y: 0.58 },
  },
  // Laam (Top mast -> deep bowl)
  "ل": {
    start: { x: 0.72, y: 0.18 },
    waypoints: [
      { x: 0.70, y: 0.46 },
      { x: 0.55, y: 0.68 },
      { x: 0.35, y: 0.70 },
    ],
    end: { x: 0.18, y: 0.54 },
  },
  // Meem (Top circle -> tail)
  "م": {
    start: { x: 0.66, y: 0.40 },
    waypoints: [
      { x: 0.78, y: 0.42 },
      { x: 0.60, y: 0.46 },
      { x: 0.42, y: 0.62 },
      { x: 0.32, y: 0.80 },
    ],
    end: { x: 0.28, y: 0.90 },
  },
  // Noon (Right tip -> deep bowl -> left tip)
  "ن": {
    start: { x: 0.82, y: 0.44 },
    waypoints: [
      { x: 0.70, y: 0.64 },
      { x: 0.50, y: 0.72 },
      { x: 0.30, y: 0.66 },
    ],
    end: { x: 0.16, y: 0.46 },
  },
  // Waw (Top loop -> tail)
  "و": {
    start: { x: 0.68, y: 0.38 },
    waypoints: [
      { x: 0.80, y: 0.40 },
      { x: 0.64, y: 0.54 },
      { x: 0.44, y: 0.70 },
    ],
    end: { x: 0.24, y: 0.80 },
  },
  // Haa
  "هـ": {
    start: { x: 0.76, y: 0.36 },
    waypoints: [
      { x: 0.55, y: 0.44 },
      { x: 0.65, y: 0.56 },
      { x: 0.45, y: 0.62 },
    ],
    end: { x: 0.22, y: 0.62 },
  },
  // Hamzah
  "ء": {
    start: { x: 0.68, y: 0.36 },
    waypoints: [
      { x: 0.50, y: 0.48 },
    ],
    end: { x: 0.32, y: 0.64 },
  },
  // Yaa (Head -> curve -> wide tail)
  "ي": {
    start: { x: 0.76, y: 0.36 },
    waypoints: [
      { x: 0.60, y: 0.42 },
      { x: 0.74, y: 0.56 },
      { x: 0.50, y: 0.72 },
      { x: 0.30, y: 0.70 },
    ],
    end: { x: 0.14, y: 0.60 },
  },
};

export default function InteractiveBlackboard({ onCompleteExercise: _onCompleteExercise }) {
  const { t, isRTL: _isRTL, dir, lang } = useLearningLanguage();

  const [selectedLetter, setSelectedLetter] = useState(ARABIC_ALPHABET[1]); // Default 'Ba'
  const [selectedForm, setSelectedForm] = useState("isolated"); // 'isolated' | 'initial' | 'medial' | 'final'
  const [selectedHarakat, setSelectedHarakat] = useState("none");
  const [tool, setTool] = useState("pen"); // 'pen' | 'eraser'
  const [penColor, setPenColor] = useState("#fbbf24"); // Rich golden amber chalk
  const [penWidth, setPenWidth] = useState(10); // 6, 10, 16 px
  const [showGuide, setShowGuide] = useState(true);
  const [showLines, setShowLines] = useState(true);

  // Gamification & Real-Time Tracing Metrics
  const [showCelebration, setShowCelebration] = useState(false);
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [tracingProgress, setTracingProgress] = useState(0); // 0% to 100%
  const [guideMarkers, setGuideMarkers] = useState(null); // Real pixel coordinates: { start: {x, y}, end: {x, y} }
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 });

  const boardContainerRef = useRef(null);
  const letterSpanRef = useRef(null);
  const drawCanvasRef = useRef(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const checkpointsRef = useRef([]);
  const isCelebrationFiredRef = useRef(false);

  // Active Arabic character with harakat
  const activeChar = (selectedLetter.forms[selectedForm] || selectedLetter.ar) +
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

  // Play pronunciation
  const playPronunciation = useCallback(() => {
    try {
      const charToSpeak = getAudioToken(selectedLetter.ar, selectedHarakat);
      playArabicSound(charToSpeak);
    } catch {}
  }, [getAudioToken, selectedHarakat, selectedLetter]);

  // Clear Canvas and reset stroke tracking
  const handleClear = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (checkpointsRef.current) {
      checkpointsRef.current.forEach((cp) => {
        cp.hit = false;
      });
    }
    isCelebrationFiredRef.current = false;
    setTracingProgress(0);
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

    return () => starTimers.forEach(clearTimeout);
  }, [playPronunciation]);

  // ── 1. RESIZE OBSERVER: DYNAMIC 1:1 PIXEL CANVAS DIMENSIONS ──
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

  // ── 2. SYNCHRONIZED PATH & ACCURATE TARGET MARKERS COMPUTATION ──
  const updateLetterPathMetrics = useCallback(() => {
    if (!letterSpanRef.current || !boardContainerRef.current) return;
    const letterRect = letterSpanRef.current.getBoundingClientRect();
    const boardRect = boardContainerRef.current.getBoundingClientRect();

    if (letterRect.width <= 0 || letterRect.height <= 0) return;

    const box = {
      left: letterRect.left - boardRect.left,
      top: letterRect.top - boardRect.top,
      width: letterRect.width,
      height: letterRect.height,
    };

    const anchor = LETTER_ANCHORS[selectedLetter.ar] || {
      start: { x: 0.85, y: 0.45 },
      waypoints: [
        { x: 0.65, y: 0.55 },
        { x: 0.45, y: 0.55 },
      ],
      end: { x: 0.15, y: 0.45 },
    };

    const startPt = {
      x: Math.round(box.left + box.width * anchor.start.x),
      y: Math.round(box.top + box.height * anchor.start.y),
    };

    const endPt = {
      x: Math.round(box.left + box.width * anchor.end.x),
      y: Math.round(box.top + box.height * anchor.end.y),
    };

    const waypoints = anchor.waypoints.map((wp) => ({
      x: Math.round(box.left + box.width * wp.x),
      y: Math.round(box.top + box.height * wp.y),
      hit: false,
    }));

    checkpointsRef.current = [
      { x: startPt.x, y: startPt.y, hit: false, isStart: true },
      ...waypoints,
      { x: endPt.x, y: endPt.y, hit: false, isEnd: true },
    ];

    setGuideMarkers({ start: startPt, end: endPt });
  }, [selectedLetter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLetterPathMetrics();
    }, 60);

    return () => clearTimeout(timer);
  }, [activeChar, dimensions, updateLetterPathMetrics]);

  // Coordinate normalizer for Canvas (1:1 pixel perfection)
  const getPos = (e) => {
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

  // Drawing event handlers
  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPointRef.current = pos;

    // Check hit on start point
    if (tool === "pen" && !isCelebrationFiredRef.current && checkpointsRef.current.length > 0) {
      const cps = checkpointsRef.current;
      for (let i = 0; i < cps.length; i++) {
        if (!cps[i].hit && Math.hypot(pos.x - cps[i].x, pos.y - cps[i].y) < 55) {
          cps[i].hit = true;
        }
      }
      const hitCount = cps.filter((c) => c.hit).length;
      setTracingProgress(Math.min(100, Math.round((hitCount / cps.length) * 100)));
    }
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = penWidth * 3.5;
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.shadowBlur = 3;
      ctx.shadowColor = penColor;
    }

    ctx.stroke();

    // ── ACCURATE REAL-TIME TRACING EVALUATION ──
    if (tool === "pen" && !isCelebrationFiredRef.current && checkpointsRef.current.length > 0) {
      const cps = checkpointsRef.current;

      // Hit test checkpoints along the true letter stroke
      // Waypoint radius: 44px; End target radius: 30px (tight precision so it only triggers at the actual end tip)
      for (let i = 0; i < cps.length; i++) {
        const cp = cps[i];
        if (!cp.hit) {
          const dist = Math.hypot(pos.x - cp.x, pos.y - cp.y);
          const hitRadius = cp.isEnd ? 30 : 44;
          if (dist < hitRadius) {
            cp.hit = true;
          }
        }
      }

      const hitCount = cps.filter((c) => c.hit).length;
      const progressPercent = Math.min(100, Math.round((hitCount / cps.length) * 100));
      setTracingProgress(progressPercent);

      // Check genuine letter completion:
      // 1. User MUST have started near the beginning (cps[0].hit is true)
      // 2. User MUST have traced the ENTIRE letter (hitCount >= requiredCount, at least 90% of stroke)
      // 3. User MUST have reached the actual END tip (lastCheckpoint.hit is true OR distToEnd <= 30px)
      const firstCheckpoint = cps[0];
      const lastCheckpoint = cps[cps.length - 1];
      const requiredCount = Math.max(cps.length - 1, Math.ceil(cps.length * 0.90));
      const distToEnd = guideMarkers
        ? Math.hypot(pos.x - guideMarkers.end.x, pos.y - guideMarkers.end.y)
        : 999;

      if (
        firstCheckpoint.hit &&
        hitCount >= requiredCount &&
        (lastCheckpoint.hit || distToEnd <= 30)
      ) {
        triggerCelebration();
      }
    }

    lastPointRef.current = pos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;

    // Fallback: If user finishes tracing the entire letter and lifts chalk at the end tip
    if (tool === "pen" && !isCelebrationFiredRef.current && checkpointsRef.current.length > 0) {
      const cps = checkpointsRef.current;
      const firstCheckpoint = cps[0];
      const lastCheckpoint = cps[cps.length - 1];
      const hitCount = cps.filter((c) => c.hit).length;
      const requiredCount = Math.max(cps.length - 1, Math.ceil(cps.length * 0.90));
      const distToEnd = guideMarkers
        ? Math.hypot(lastPointRef.current.x - guideMarkers.end.x, lastPointRef.current.y - guideMarkers.end.y)
        : 999;

      if (
        firstCheckpoint.hit &&
        hitCount >= requiredCount &&
        (lastCheckpoint.hit || distToEnd <= 36)
      ) {
        triggerCelebration();
      }
    }
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

  // Manual Check Button (Verifies honest letter tracing)
  const handleManualVerify = () => {
    if (checkpointsRef.current && checkpointsRef.current.length > 0) {
      const cps = checkpointsRef.current;
      const firstCheckpoint = cps[0];
      const lastCheckpoint = cps[cps.length - 1];
      const hitCount = cps.filter((c) => c.hit).length;
      const requiredCount = Math.max(cps.length - 1, Math.ceil(cps.length * 0.90));

      if (firstCheckpoint.hit && (lastCheckpoint.hit || hitCount >= requiredCount)) {
        triggerCelebration();
        return;
      }
    }
    toast.info("হরফটি চক দিয়ে শুরুর মাথা থেকে শেষ মাথা পর্যন্ত সম্পূর্ণ আঁকুন।");
  };

  // Download drawn handwriting as PNG
  const handleDownloadImage = () => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
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

      // Draw user's chalk strokes
      tCtx.drawImage(drawCanvas, 0, 0);

      const link = document.createElement("a");
      link.download = `arabic-blackboard-${selectedLetter.nameBn || "letter"}.png`;
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
      toast.success("মাশাআল্লাহ! আপনার হাতের লেখার ছবি ডাউনলোড হয়েছে।");
    } catch {
      toast.error("ছবি সেভ করতে সমস্যা হয়েছে।");
    }
  };

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
              নিখুঁত ট্রেসিং গেম: <span className="text-emerald-400 font-bold">শুরুর মাথা</span> থেকে চক ঘুরিয়ে হরফটি সম্পূর্ণ করে <span className="text-amber-400 font-bold">শেষের মাথায়</span> স্পর্শ করুন! 🎮
            </p>
          </div>
        </div>

        {/* Real-time Progress Bar & Audio Action */}
        <div className="flex items-center gap-3">
          {/* Tracing Progress Meter */}
          <div className="flex flex-col items-end gap-1 min-w-[150px]">
            <div className="flex items-center justify-between w-full text-[11px] font-bold">
              <span className="text-slate-300">ট্রেসিং অগ্রগতি:</span>
              <span className={`font-mono font-black ${tracingProgress === 100 ? "text-emerald-400" : "text-amber-400"}`}>
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
              className="relative rounded-[24px] bg-[#04140d] border-2 border-emerald-950 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden h-[460px] sm:h-[520px] md:h-[560px] w-full select-none"
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

              {/* LAYER 1: 🌟 LUMINOUS EMERALD ARABIC GUIDE LETTER (সর্বদা স্পষ্ট ও উজ্জ্বল জলছাপ) */}
              {showGuide && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span
                    ref={letterSpanRef}
                    dir="rtl"
                    className="font-amiri text-[230px] sm:text-[290px] md:text-[340px] font-bold text-emerald-400/35 drop-shadow-[0_0_35px_rgba(52,211,153,0.45)] leading-none select-none"
                  >
                    {activeChar}
                  </span>
                </div>
              )}

              {/* LAYER 2: 🎯 PRECISE START & END TARGET INDICATORS (সরাসরি হরফের মাথায় নিখুঁতভাবে স্থাপিত) */}
              {showGuide && guideMarkers && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {/* 🟢 START POINT (শুরুর মাথা) */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-pulse"
                    style={{ left: `${guideMarkers.start.x}px`, top: `${guideMarkers.start.y}px` }}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-400 border-2 border-white shadow-lg shadow-emerald-500/80 flex items-center justify-center ring-4 ring-emerald-500/40">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-300 bg-black/90 px-2 py-0.5 rounded-md border border-emerald-500/70 shadow whitespace-nowrap">
                      শুরু 🟢
                    </span>
                  </div>

                  {/* 🏁 END POINT (শেষের মাথা — এখানে এসে লাগলেই মাশাআল্লাহ সেলিব্রেশন!) */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-bounce"
                    style={{ left: `${guideMarkers.end.x}px`, top: `${guideMarkers.end.y}px` }}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border-2 border-white shadow-xl shadow-amber-500/80 flex items-center justify-center ring-4 ring-amber-400/50">
                      <Target className="w-4.5 h-4.5 text-slate-950 font-black" />
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-black/90 px-2 py-0.5 rounded-md border border-amber-500/70 shadow whitespace-nowrap">
                      শেষের মাথা 🏁
                    </span>
                  </div>
                </div>
              )}

              {/* LAYER 3: Interactive Chalk Canvas */}
              <canvas
                ref={drawCanvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 cursor-crosshair touch-none z-20"
              />

              {/* 🌟 GAME CELEBRATION MODAL OVERLAY (মাশাআল্লাহ! ১০০% নিখুঁত সেলিব্রেশন স্ক্রিন) */}
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
                    <span>১০০% নিখুঁত ট্রেসিং সম্পন্ন · ৩ স্টার পারফেক্ট! 🎮</span>
                  </div>

                  <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                    দারুণ! হরফটি ক্রমান্বয়ে নিখুঁতভাবে শেষ হয়েছে!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/90 max-w-sm mb-5">
                    আপনি <span className="font-bold text-amber-300">"{selectedLetter.nameBn}"</span> হরফের সম্পূর্ণ রূপরেখা সুন্দরভাবে শেষ মাথা পর্যন্ত টেনে মিলিয়েছেন।
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRepeatCurrentLetter}
                      className="px-4 py-2.5 rounded-2xl bg-black/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-emerald-900 font-bold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 shadow"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>আবার লিখুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextLetter}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/80 transition cursor-pointer active:scale-95"
                    >
                      <span>পরবর্তী হরফ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WOODEN CHALK TRAY & TOOLBAR (স্লেটের কাঠের চক ও ডাস্টার তাক) */}
            <div className="mt-3 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-md border border-amber-900/60 shadow-lg flex flex-wrap items-center justify-between gap-2.5 z-30">
              
              {/* Left Group: Tools & Colors */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Pen (Chalk) */}
                <button
                  type="button"
                  onClick={() => setTool("pen")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    tool === "pen"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black ring-1 ring-amber-300"
                      : "text-slate-300 hover:bg-slate-800/80 bg-black/40 border border-emerald-900/50"
                  }`}
                  title="চকখড়ি দিয়ে লিখুন"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{t.pen}</span>
                </button>

                {/* Eraser (Duster) */}
                <button
                  type="button"
                  onClick={() => setTool("eraser")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    tool === "eraser"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black ring-1 ring-amber-300"
                      : "text-slate-300 hover:bg-slate-800/80 bg-black/40 border border-emerald-900/50"
                  }`}
                  title="ডাস্টার দিয়ে মুছুন"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{t.eraser}</span>
                </button>

                {/* Pen Width Selector */}
                {tool === "pen" && (
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
                )}

                {/* Chalk Colors Palette */}
                {tool === "pen" && (
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
                          penColor === c.color ? "border-white scale-125 shadow-md ring-2 ring-amber-400" : "border-black/50 hover:scale-110"
                        }`}
                        title={`${c.name} চক`}
                      />
                    ))}
                  </div>
                )}
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
                  {lang === "ar" ? "أشكال الحرف في الكلمة:" : lang === "en" ? "4 Forms of the Letter:" : "শব্দে হরফের ৪টি রূপ:"}
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
                  subtitle: "শব্দের শুরুতে যুক্ত",
                  label: t.letters.initial,
                  form: selectedLetter.forms.initial,
                },
                {
                  id: "medial",
                  title: "মাঝের রূপ",
                  subtitle: "শব্দের মাঝে দুই পাশে যুক্ত",
                  label: t.letters.medial,
                  form: selectedLetter.forms.medial,
                },
                {
                  id: "final",
                  title: "শেষের রূপ",
                  subtitle: "শব্দের শেষে যুক্ত",
                  label: t.letters.final,
                  form: selectedLetter.forms.final,
                },
              ].map((f) => {
                const isActive = selectedForm === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedForm(f.id);
                      handleClear();
                      const charToSpeak = getAudioToken(selectedLetter.ar, selectedHarakat);
                      playArabicSound(charToSpeak);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border relative overflow-hidden group ${
                      isActive
                        ? "bg-gradient-to-br from-emerald-950 via-[#0a3323] to-[#051a11] border-emerald-400 text-emerald-100 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-400/60 scale-[1.02]"
                        : "bg-[#05140d]/90 hover:bg-[#071f15] border-emerald-950 text-slate-300 hover:border-emerald-700/80 shadow-md"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
                    )}

                    <span className="font-amiri text-3xl sm:text-4xl font-extrabold tracking-wide py-1 text-amber-300 drop-shadow-sm group-hover:scale-110 transition-transform">
                      {f.form}
                    </span>

                    <span className="text-xs font-bold text-white">
                      {f.title}
                    </span>

                    <span className="text-[10px] text-slate-400 text-center leading-tight">
                      {f.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Harakat Overlay Selection */}
            <div className="pt-3 border-t border-emerald-900/40 flex flex-col space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-300 mr-1">{t.harakat}:</span>
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
                  {lang === "ar" ? "النطق الصحيح:" : lang === "en" ? "Correct Pronunciation:" : "বিশুদ্ধ নূরানী উচ্চারণ গাইড:"}
                </span>
                <span className="font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/40 font-amiri text-sm sm:text-base flex items-center gap-2 shadow-xs">
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>
                    {selectedHarakat === "none"
                      ? (lang === "en" ? selectedLetter.nameEn : selectedLetter.nameBn)
                      : (HARAKAT_PRONUNCIATION_MAP[selectedLetter.ar]?.[selectedHarakat] || activeChar)}
                  </span>
                </span>
              </div>
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

            {/* Grid of 29 Arabic Letters - Taller to match the new grand blackboard */}
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
