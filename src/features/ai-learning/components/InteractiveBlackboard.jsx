"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Eraser,
  PenTool,
  Download,
  Award,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Home,
  X,
  Play,
  Grid,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  playArabicSound,
  playMaShaAllahCelebration,
  playStarPopSound,
} from "../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../lib/confetti";
import { getStoredCoins, saveCoins } from "@/lib/quran/qaidaGameShop";

// ── 29 ARABIC ALPHABET LETTERS ──
export const ARABIC_ALPHABET = [
  { ar: "ا", nameBn: "আলিফ", nameEn: "Alif", color: "#ef4444", makhraj: "কণ্ঠনালীর নীচের অংশ থেকে" },
  { ar: "ب", nameBn: "বা", nameEn: "Ba", color: "#3b82f6", makhraj: "উভয় ঠোঁটের ভিজা অংশ মিলিয়ে" },
  { ar: "ت", nameBn: "তা", nameEn: "Ta", color: "#10b981", makhraj: "জিহ্বার ডগা ওপরের দাঁতের গোড়ায়" },
  { ar: "ث", nameBn: "ছা", nameEn: "Tha", color: "#f59e0b", makhraj: "জিহ্বার ডগা ওপরের দাঁতের মাথায় নরমভাবে" },
  { ar: "ج", nameBn: "জীম", nameEn: "Jeem", color: "#8b5cf6", makhraj: "জিহ্বার মধ্যভাগ শক্ত তালুর সাথে" },
  { ar: "ح", nameBn: "হা", nameEn: "Haa", color: "#ec4899", makhraj: "কণ্ঠনালীর মাঝখান থেকে পরিষ্কারভাবে" },
  { ar: "خ", nameBn: "খা", nameEn: "Kha", color: "#06b6d4", makhraj: "কণ্ঠনালীর শেষ অংশ থেকে মোটা হয়ে" },
  { ar: "د", nameBn: "দাল", nameEn: "Dal", color: "#f97316", makhraj: "জিহ্বার ডগা ওপরের দাঁতের গোড়ায়" },
  { ar: "ذ", nameBn: "যাল", nameEn: "Dhal", color: "#14b8a6", makhraj: "জিহ্বার ডগা ওপরের দাঁতের মাথায় নরমভাবে" },
  { ar: "ر", nameBn: "রা", nameEn: "Ra", color: "#6366f1", makhraj: "জিহ্বার পিঠ ওপরের তালুর সাথে" },
  { ar: "ز", nameBn: "যা", nameEn: "Zay", color: "#eab308", makhraj: "জিহ্বার ডগা নিচের দাঁতের মাথায় শিস দিয়ে" },
  { ar: "س", nameBn: "সীন", nameEn: "Seen", color: "#3b82f6", makhraj: "জিহ্বার ডগা নিচের দাঁতের মাথায় চিকন শিস" },
  { ar: "ش", nameBn: "শীন", nameEn: "Sheen", color: "#ec4899", makhraj: "জিহ্বার মধ্যভাগ তালুর সাথে বাতাস ছড়িয়ে" },
  { ar: "ص", nameBn: "ছোয়াদ", nameEn: "Saad", color: "#f59e0b", makhraj: "জিহ্বার ডগা নিচের দাঁতে, মুখ গোল করে মোটা" },
  { ar: "ض", nameBn: "দোয়াদ", nameEn: "Daad", color: "#10b981", makhraj: "জিহ্বার গোড়ার পাশ ওপরের মাড়ির দাঁতে" },
  { ar: "ط", nameBn: "ত্বোয়া", nameEn: "Taa", color: "#ef4444", makhraj: "জিহ্বার ডগা ওপরের দাঁতে, মুখ গোল ও ভারী" },
  { ar: "ظ", nameBn: "যোয়া", nameEn: "Dhaa", color: "#8b5cf6", makhraj: "জিহ্বার ডগা ওপরের দাঁতের মাথায় নরম ও মোটা" },
  { ar: "ع", nameBn: "আইন", nameEn: "Ayn", color: "#06b6d4", makhraj: "কণ্ঠনালীর মাঝখান থেকে চেপে" },
  { ar: "غ", nameBn: "গইন", nameEn: "Ghayn", color: "#f97316", makhraj: "কণ্ঠনালীর শেষ অংশ থেকে মোটা স্বরে" },
  { ar: "ف", nameBn: "ফা", nameEn: "Fa", color: "#14b8a6", makhraj: "ওপরের দাঁতের মাথা নিচের ঠোঁটের পেটে" },
  { ar: "ق", nameBn: "ক্বাফ", nameEn: "Qaaf", color: "#6366f1", makhraj: "জিহ্বার গোড়া নরম তালুতে চেপে ভারী" },
  { ar: "ك", nameBn: "কাফ", nameEn: "Kaaf", color: "#eab308", makhraj: "জিহ্বার গোড়ার একটু সামনে শক্ত তালুতে" },
  { ar: "ل", nameBn: "লাম", nameEn: "Laam", color: "#3b82f6", makhraj: "জিহ্বার ডগার কিনারা ওপরের মাড়িতে" },
  { ar: "م", nameBn: "মীম", nameEn: "Meem", color: "#ec4899", makhraj: "উভয় ঠোঁটের শুকনা অংশ মিলিয়ে" },
  { ar: "ن", nameBn: "নূন", nameEn: "Noon", color: "#10b981", makhraj: "জিহ্বার ডগা ওপরের দাঁতের গোড়ার মাড়িতে" },
  { ar: "و", nameBn: "ওয়াও", nameEn: "Waw", color: "#f59e0b", makhraj: "উভয় ঠোঁট গোল করে" },
  { ar: "هـ", nameBn: "হা", nameEn: "Haa", color: "#ef4444", makhraj: "কণ্ঠনালীর শেষ নীচের বুক থেকে" },
  { ar: "ء", nameBn: "হামযাহ", nameEn: "Hamzah", color: "#8b5cf6", makhraj: "কণ্ঠনালীর নীচের অংশ থেকে ঝটকা দিয়ে" },
  { ar: "ي", nameBn: "ইয়া", nameEn: "Yaa", color: "#06b6d4", makhraj: "জিহ্বার মধ্যভাগ তালুর সাথে মিলিয়ে" },
];

// ── CUTE ANIMATED MASCOTS & THEIR COLLECTIBLE FOOD ITEMS ──
// (Directly matching the user's reference images: Elephant/Balls, Lion/Meat, Mouse/Cheese, etc.)
export const MASCOTS = [
  { id: "elephant", name: "হাতি ছানা", emoji: "🐘", targetItem: "⚽", targetName: "রঙিন বল" },
  { id: "lion", name: "সিংহ ছানা", emoji: "🦁", targetItem: "🥩", targetName: "গোশত" },
  { id: "mouse", name: "ইঁদুর ছানা", emoji: "🐭", targetItem: "🧀", targetName: "পনির" },
  { id: "camel", name: "মরুর উট", emoji: "🐪", targetItem: "🍈", targetName: "মিষ্টি খেজুর" },
  { id: "sheep", name: "মিষ্টি ভেড়া", emoji: "🐑", targetItem: "🍎", targetName: "লাল আপেল" },
  { id: "dove", name: "নূরের পায়রা", emoji: "🕊️", targetItem: "🌟", targetName: "সোনার তারা" },
];

// ── CALLIGRAPHY STROKE CHECKPOINTS FOR ALL 29 ARABIC LETTERS ──
// Normalized relative coordinates [0, 1] mapped inside the hollow letter container
export const LETTER_ANCHORS = {
  "ا": {
    start: { x: 0.50, y: 0.16 },
    waypoints: [
      { x: 0.50, y: 0.35 },
      { x: 0.50, y: 0.52 },
      { x: 0.50, y: 0.70 },
    ],
    end: { x: 0.50, y: 0.88 },
  },
  "ب": {
    start: { x: 0.86, y: 0.46 },
    waypoints: [
      { x: 0.74, y: 0.60 },
      { x: 0.50, y: 0.64 },
      { x: 0.28, y: 0.60 },
    ],
    end: { x: 0.14, y: 0.46 },
  },
  "ت": {
    start: { x: 0.86, y: 0.48 },
    waypoints: [
      { x: 0.74, y: 0.62 },
      { x: 0.50, y: 0.66 },
      { x: 0.28, y: 0.62 },
    ],
    end: { x: 0.14, y: 0.48 },
  },
  "ث": {
    start: { x: 0.86, y: 0.52 },
    waypoints: [
      { x: 0.74, y: 0.66 },
      { x: 0.50, y: 0.70 },
      { x: 0.28, y: 0.66 },
    ],
    end: { x: 0.14, y: 0.52 },
  },
  "ج": {
    start: { x: 0.55, y: 0.28 },
    waypoints: [
      { x: 0.76, y: 0.30 },
      { x: 0.62, y: 0.48 },
      { x: 0.72, y: 0.66 },
      { x: 0.48, y: 0.82 },
    ],
    end: { x: 0.20, y: 0.74 },
  },
  "ح": {
    start: { x: 0.55, y: 0.28 },
    waypoints: [
      { x: 0.76, y: 0.30 },
      { x: 0.62, y: 0.48 },
      { x: 0.72, y: 0.66 },
      { x: 0.48, y: 0.82 },
    ],
    end: { x: 0.20, y: 0.74 },
  },
  "خ": {
    start: { x: 0.55, y: 0.34 },
    waypoints: [
      { x: 0.76, y: 0.36 },
      { x: 0.62, y: 0.52 },
      { x: 0.72, y: 0.70 },
      { x: 0.48, y: 0.84 },
    ],
    end: { x: 0.20, y: 0.76 },
  },
  "د": {
    start: { x: 0.74, y: 0.38 },
    waypoints: [
      { x: 0.60, y: 0.54 },
      { x: 0.45, y: 0.66 },
    ],
    end: { x: 0.26, y: 0.68 },
  },
  "ذ": {
    start: { x: 0.74, y: 0.46 },
    waypoints: [
      { x: 0.60, y: 0.60 },
      { x: 0.45, y: 0.70 },
    ],
    end: { x: 0.26, y: 0.72 },
  },
  "ر": {
    start: { x: 0.74, y: 0.42 },
    waypoints: [
      { x: 0.60, y: 0.58 },
      { x: 0.45, y: 0.72 },
    ],
    end: { x: 0.24, y: 0.82 },
  },
  "ز": {
    start: { x: 0.74, y: 0.48 },
    waypoints: [
      { x: 0.60, y: 0.62 },
      { x: 0.45, y: 0.76 },
    ],
    end: { x: 0.24, y: 0.84 },
  },
  "س": {
    start: { x: 0.88, y: 0.42 },
    waypoints: [
      { x: 0.72, y: 0.46 },
      { x: 0.56, y: 0.48 },
      { x: 0.44, y: 0.66 },
      { x: 0.28, y: 0.70 },
    ],
    end: { x: 0.14, y: 0.52 },
  },
  "ش": {
    start: { x: 0.88, y: 0.50 },
    waypoints: [
      { x: 0.72, y: 0.54 },
      { x: 0.56, y: 0.56 },
      { x: 0.44, y: 0.72 },
      { x: 0.28, y: 0.74 },
    ],
    end: { x: 0.14, y: 0.56 },
  },
  "ص": {
    start: { x: 0.75, y: 0.56 },
    waypoints: [
      { x: 0.88, y: 0.50 },
      { x: 0.68, y: 0.46 },
      { x: 0.52, y: 0.50 },
      { x: 0.38, y: 0.70 },
    ],
    end: { x: 0.14, y: 0.54 },
  },
  "ض": {
    start: { x: 0.75, y: 0.58 },
    waypoints: [
      { x: 0.88, y: 0.54 },
      { x: 0.68, y: 0.50 },
      { x: 0.52, y: 0.54 },
      { x: 0.38, y: 0.72 },
    ],
    end: { x: 0.14, y: 0.56 },
  },
  "ط": {
    start: { x: 0.52, y: 0.18 },
    waypoints: [
      { x: 0.52, y: 0.44 },
      { x: 0.78, y: 0.54 },
      { x: 0.50, y: 0.66 },
    ],
    end: { x: 0.22, y: 0.68 },
  },
  "ظ": {
    start: { x: 0.52, y: 0.22 },
    waypoints: [
      { x: 0.52, y: 0.48 },
      { x: 0.78, y: 0.58 },
      { x: 0.50, y: 0.68 },
    ],
    end: { x: 0.22, y: 0.70 },
  },
  "ع": {
    start: { x: 0.54, y: 0.28 },
    waypoints: [
      { x: 0.72, y: 0.32 },
      { x: 0.56, y: 0.48 },
      { x: 0.70, y: 0.66 },
      { x: 0.48, y: 0.82 },
    ],
    end: { x: 0.18, y: 0.76 },
  },
  "غ": {
    start: { x: 0.54, y: 0.34 },
    waypoints: [
      { x: 0.72, y: 0.38 },
      { x: 0.56, y: 0.52 },
      { x: 0.70, y: 0.70 },
      { x: 0.48, y: 0.84 },
    ],
    end: { x: 0.18, y: 0.78 },
  },
  "ف": {
    start: { x: 0.78, y: 0.42 },
    waypoints: [
      { x: 0.88, y: 0.38 },
      { x: 0.68, y: 0.58 },
      { x: 0.44, y: 0.64 },
    ],
    end: { x: 0.16, y: 0.54 },
  },
  "ق": {
    start: { x: 0.76, y: 0.40 },
    waypoints: [
      { x: 0.86, y: 0.36 },
      { x: 0.68, y: 0.54 },
      { x: 0.44, y: 0.70 },
    ],
    end: { x: 0.18, y: 0.56 },
  },
  "ك": {
    start: { x: 0.76, y: 0.22 },
    waypoints: [
      { x: 0.74, y: 0.48 },
      { x: 0.55, y: 0.64 },
      { x: 0.35, y: 0.64 },
    ],
    end: { x: 0.16, y: 0.58 },
  },
  "ل": {
    start: { x: 0.72, y: 0.18 },
    waypoints: [
      { x: 0.70, y: 0.46 },
      { x: 0.52, y: 0.70 },
      { x: 0.32, y: 0.70 },
    ],
    end: { x: 0.20, y: 0.54 },
  },
  "م": {
    start: { x: 0.66, y: 0.40 },
    waypoints: [
      { x: 0.78, y: 0.42 },
      { x: 0.58, y: 0.48 },
      { x: 0.40, y: 0.66 },
    ],
    end: { x: 0.30, y: 0.90 },
  },
  "ن": {
    start: { x: 0.82, y: 0.44 },
    waypoints: [
      { x: 0.68, y: 0.66 },
      { x: 0.48, y: 0.72 },
      { x: 0.30, y: 0.66 },
    ],
    end: { x: 0.18, y: 0.48 },
  },
  "و": {
    start: { x: 0.68, y: 0.38 },
    waypoints: [
      { x: 0.80, y: 0.40 },
      { x: 0.62, y: 0.56 },
      { x: 0.42, y: 0.72 },
    ],
    end: { x: 0.26, y: 0.82 },
  },
  "هـ": {
    start: { x: 0.76, y: 0.36 },
    waypoints: [
      { x: 0.55, y: 0.44 },
      { x: 0.65, y: 0.56 },
      { x: 0.45, y: 0.62 },
    ],
    end: { x: 0.24, y: 0.62 },
  },
  "ء": {
    start: { x: 0.68, y: 0.36 },
    waypoints: [
      { x: 0.50, y: 0.48 },
    ],
    end: { x: 0.34, y: 0.64 },
  },
  "ي": {
    start: { x: 0.76, y: 0.36 },
    waypoints: [
      { x: 0.60, y: 0.44 },
      { x: 0.72, y: 0.58 },
      { x: 0.48, y: 0.72 },
    ],
    end: { x: 0.16, y: 0.62 },
  },
};

export default function InteractiveBlackboard({ onClose = null, onNavigateBack = null }) {
  // Navigation View: 'tracing' | 'selector' | 'slate'
  const [viewMode, setViewMode] = useState("tracing");

  // Selected Letter State
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(0);
  const currentLetter = ARABIC_ALPHABET[selectedLetterIndex] || ARABIC_ALPHABET[0];

  // Active Mascot State (Default Elephant 🐘 matching Image 4)
  const [activeMascotIndex, setActiveMascotIndex] = useState(0);
  const currentMascot = MASCOTS[activeMascotIndex] || MASCOTS[0];

  // Tracing Progress & Gamification
  const [hitCheckpointIndex, setHitCheckpointIndex] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [coins, setCoins] = useState(150);
  const [completedLetterMap, setCompletedLetterMap] = useState({});

  // Freehand Slate State (Classic Chalk Mode)
  const [chalkColor, setChalkColor] = useState("#fbbf24");
  const [chalkTool, setChalkTool] = useState("pen"); // 'pen' | 'eraser'
  const canvasRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  // Letter Path Container Ref
  const stageRef = useRef(null);

  // Load coins and completed letters on mount
  useEffect(() => {
    setCoins(getStoredCoins());
    try {
      const saved = localStorage.getItem("noor_qaida_tracing_completed");
      if (saved) setCompletedLetterMap(JSON.parse(saved));
    } catch {}
  }, []);

  // Compute Checkpoints for Current Letter
  const checkpoints = useMemo(() => {
    const anchor = LETTER_ANCHORS[currentLetter.ar] || {
      start: { x: 0.5, y: 0.2 },
      waypoints: [{ x: 0.5, y: 0.5 }],
      end: { x: 0.5, y: 0.8 },
    };
    return [
      anchor.start,
      ...(anchor.waypoints || []),
      anchor.end,
    ];
  }, [currentLetter]);

  // Reset Tracing when Letter Changes
  useEffect(() => {
    setHitCheckpointIndex(-1);
    setIsCompleted(false);
    setShowCelebrationModal(false);
  }, [selectedLetterIndex]);

  // Play Letter Audio
  const playCurrentSound = useCallback(() => {
    try {
      playArabicSound(currentLetter.ar);
    } catch {}
  }, [currentLetter]);

  // Audio effect for collecting item
  const playCollectChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }, []);

  // Handle Tracing Pointer Interaction
  const handleStagePointerMove = (e) => {
    if (isCompleted || viewMode !== "tracing") return;
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    // Next required checkpoint index
    const nextIdx = hitCheckpointIndex + 1;
    if (nextIdx < checkpoints.length) {
      const target = checkpoints[nextIdx];
      const dist = Math.hypot(relX - target.x, relY - target.y);

      // Hit threshold: within 16% of normalized stage dimension
      if (dist < 0.16) {
        setHitCheckpointIndex(nextIdx);
        playCollectChime();

        // If completed all checkpoints
        if (nextIdx === checkpoints.length - 1) {
          setIsCompleted(true);
          setShowCelebrationModal(true);
          playMaShaAllahCelebration();
          fireCelebrationConfetti();
          setTimeout(() => playCurrentSound(), 1000);

          // Award +5 coins
          setCoins((c) => {
            const next = c + 5;
            saveCoins(next);
            return next;
          });

          // Mark completed in storage
          setCompletedLetterMap((prev) => {
            const next = { ...prev, [currentLetter.ar]: 3 };
            try {
              localStorage.setItem("noor_qaida_tracing_completed", JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      }
    }
  };

  // Move to Next Letter
  const handleNextLetter = () => {
    const nextIndex = (selectedLetterIndex + 1) % ARABIC_ALPHABET.length;
    setSelectedLetterIndex(nextIndex);
  };

  // Move to Previous Letter
  const handlePrevLetter = () => {
    const prevIndex = (selectedLetterIndex - 1 + ARABIC_ALPHABET.length) % ARABIC_ALPHABET.length;
    setSelectedLetterIndex(prevIndex);
  };

  // Tracing Progress Percentage
  const progressPercent = Math.round(
    ((hitCheckpointIndex + 1) / checkpoints.length) * 100
  );

  return (
    <div className="relative w-full min-h-[82vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col font-hind-siliguri select-none border-4 border-sky-400">
      {/* ══════════════════════════════════════════════════════════
          CARTOON MEADOW & SUNNY SKY BACKGROUND
          (Matching exact reference images: rolling green hills, windmills, blue sky, sparkling stars)
      ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#93c5fd]">
        {/* Floating Cartoon Clouds */}
        <div className="absolute top-8 left-12 w-32 h-14 bg-white/90 rounded-full blur-xs opacity-90 animate-pulse" />
        <div className="absolute top-16 right-24 w-40 h-16 bg-white/85 rounded-full blur-xs opacity-90 animate-pulse" />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-18 bg-white/70 rounded-full blur-xs opacity-75" />

        {/* Sparkling Stars & Sunbeam */}
        {[10, 25, 45, 70, 85].map((pos, i) => (
          <span
            key={i}
            className="absolute text-white text-base animate-ping opacity-85"
            style={{ top: `${8 + (i % 3) * 6}%`, left: `${pos}%` }}
          >
            ✦
          </span>
        ))}

        {/* Green Rolling Grassland Hills & Windmills SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56">
          <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            {/* Back Hill */}
            <path d="M0,180 Q350,110 700,160 T1200,140 L1200,300 L0,300 Z" fill="#22c55e" opacity="0.95" />
            {/* Front Hill */}
            <path d="M0,210 Q400,150 850,210 T1200,190 L1200,300 L0,300 Z" fill="#16a34a" />

            {/* Traditional Dutch Windmills on the right (Exact matching user images) */}
            <g transform="translate(940, 70)">
              {/* Main Windmill Tower */}
              <polygon points="50,150 60,40 85,40 95,150" fill="#3e2723" stroke="#1f140e" strokeWidth="2" />
              <polygon points="56,40 72,18 89,40" fill="#b91c1c" />
              {/* White Fence */}
              <line x1="20" y1="145" x2="160" y2="145" stroke="#ffffff" strokeWidth="3" />
              <line x1="30" y1="135" x2="30" y2="155" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="50" y1="135" x2="50" y2="155" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="110" y1="135" x2="110" y2="155" stroke="#ffffff" strokeWidth="2.5" />
              <line x1="130" y1="135" x2="130" y2="155" stroke="#ffffff" strokeWidth="2.5" />
              {/* Rotating Blades */}
              <g className="animate-spin origin-[72px_40px]" style={{ animationDuration: "14s" }}>
                <line x1="25" y1="40" x2="120" y2="40" stroke="#f8fafc" strokeWidth="4.5" />
                <line x1="72" y1="-8" x2="72" y2="88" stroke="#f8fafc" strokeWidth="4.5" />
              </g>
            </g>

            <g transform="translate(1060, 95) scale(0.8)">
              {/* Second Smaller Windmill */}
              <polygon points="50,150 60,40 85,40 95,150" fill="#2e1d16" />
              <polygon points="56,40 72,18 89,40" fill="#b91c1c" />
              <g className="animate-spin origin-[72px_40px]" style={{ animationDuration: "18s" }}>
                <line x1="25" y1="40" x2="120" y2="40" stroke="#f8fafc" strokeWidth="4" />
                <line x1="72" y1="-8" x2="72" y2="88" stroke="#f8fafc" strokeWidth="4" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TOP NAVIGATION BAR (MATCHING REFERENCE IMAGES)
          (Home, Mode Selector, Target Badge, Audio, Reset, Next Arrow)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 p-2.5 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        {/* Left: Home Button (Switch to Letter Grid or Exit) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              if (viewMode !== "selector") {
                setViewMode("selector");
              } else if (onClose || onNavigateBack) {
                if (onClose) onClose();
                else if (onNavigateBack) onNavigateBack();
              }
            }}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="হরফ নির্বাচন তালিকায় যান"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-1 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-lg">
            <button
              onClick={() => setViewMode("tracing")}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                viewMode === "tracing"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <span>🎨</span>
              <span>ট্রেসিং গেম</span>
            </button>
            <button
              onClick={() => setViewMode("selector")}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                viewMode === "selector"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>হরফ তালিকা</span>
            </button>
          </div>
        </div>

        {/* Center: Target Letter Badge & Audio */}
        {viewMode === "tracing" && (
          <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-3 sm:px-5 py-1.5 rounded-2xl sm:rounded-3xl border-2 border-sky-400 shadow-xl">
            <span className="text-xs font-black text-slate-700 hidden sm:inline">হরফ:</span>
            <div className="px-3 py-0.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-arabic font-black text-xl sm:text-2xl shadow-xs">
              {currentLetter.ar}
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              {currentLetter.nameBn}
            </span>
            <button
              onClick={playCurrentSound}
              className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition cursor-pointer active:scale-95"
              title="উচ্চারণ শুনুন"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Reset & Next Letter Arrow Button (Teal Circle with Arrow matching Images 1, 2, 4) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {viewMode === "tracing" && (
            <button
              onClick={() => {
                setHitCheckpointIndex(-1);
                setIsCompleted(false);
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 border-2 border-amber-300 shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="আবার নতুন করে আঁকো"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* ➔ Next Letter Button (Exact Teal Circle matching User Images) */}
          <button
            onClick={handleNextLetter}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white border-3 border-white shadow-xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
            title="পরবর্তী হরফে যাও"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: 📋 LETTER SELECTOR GRID (MATCHING IMAGE 3)
      ══════════════════════════════════════════════════════════ */}
      {viewMode === "selector" && (
        <div className="relative z-20 flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 overflow-y-auto animate-fade-in flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title Bar matching "Select Letter" in Image 3 */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-hind-siliguri">
                Select Letter • আরবী হরফ নির্বাচন করুন
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 font-bold drop-shadow">
                যে হরফটি আঁকতে ও মাশক করতে চাও, সেটিতে ট্যাপ করো!
              </p>
            </div>

            {/* Grid of 29 Arabic Letter Cards (Glassy with colorful borders like Image 3) */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3.5 max-h-[55vh] overflow-y-auto p-2">
              {ARABIC_ALPHABET.map((item, idx) => {
                const isCurrent = idx === selectedLetterIndex;
                const stars = completedLetterMap[item.ar] || 0;

                // Color cycling borders matching Image 3 (yellow, lime, cyan, purple, orange, red)
                const borderColors = [
                  "border-amber-300 hover:border-amber-400 text-amber-100",
                  "border-lime-300 hover:border-lime-400 text-lime-100",
                  "border-cyan-300 hover:border-cyan-400 text-cyan-100",
                  "border-purple-300 hover:border-purple-400 text-purple-100",
                  "border-orange-300 hover:border-orange-400 text-orange-100",
                  "border-rose-300 hover:border-rose-400 text-rose-100",
                  "border-sky-300 hover:border-sky-400 text-sky-100",
                ];
                const borderColor = borderColors[idx % borderColors.length];

                return (
                  <button
                    key={item.ar}
                    onClick={() => {
                      setSelectedLetterIndex(idx);
                      setViewMode("tracing");
                    }}
                    className={`relative p-3 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md border-3 transition-all duration-200 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg cursor-pointer ${borderColor} ${
                      isCurrent ? "ring-4 ring-white shadow-2xl scale-105 bg-white/40" : ""
                    }`}
                  >
                    <span className="font-arabic font-black text-3xl sm:text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                      {item.ar}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow">
                      {item.nameBn}
                    </span>
                    {stars > 0 && (
                      <span className="text-[10px] text-amber-300 drop-shadow">
                        ⭐⭐⭐
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 text-center">
            <button
              onClick={() => setViewMode("tracing")}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl active:scale-95 transition cursor-pointer"
            >
              <span>ট্রেসিং খেলায় ফিরে যাও</span>
              <span className="ml-2">➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 2: 🎨 ANIMATED TRACING GAME (MATCHING IMAGES 1, 2, 4)
          (Left: Solid Reference Letter; Right: Interactive Hollow Tracing Path)
      ══════════════════════════════════════════════════════════ */}
      {viewMode === "tracing" && (
        <div className="relative z-20 flex-1 max-w-5xl mx-auto w-full p-2 sm:p-4 flex flex-col justify-between">
          {/* Mascot Selector Pill Strip */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-2">
            <span className="text-xs font-bold text-white drop-shadow hidden xs:inline">
              সাথী প্রাণী:
            </span>
            {MASCOTS.map((m, mIdx) => (
              <button
                key={m.id}
                onClick={() => setActiveMascotIndex(mIdx)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeMascotIndex === mIdx
                    ? "bg-white text-slate-900 shadow-md font-black scale-105 ring-2 ring-amber-300"
                    : "bg-white/40 hover:bg-white/60 text-white drop-shadow"
                }`}
              >
                <span>{m.emoji}</span>
                <span className="hidden sm:inline">{m.name}</span>
              </button>
            ))}
          </div>

          {/* ── TWO-COLUMN SPLIT STAGE (MATCHING EXACT LAYOUT OF IMAGES 1, 2, 4) ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 my-auto">
            {/* LEFT COLUMN: SOLID BOLD REFERENCE LETTER (Image 1 Red W, Image 2 Yellow J, Image 4 Teal A) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-3xl bg-white/25 backdrop-blur-md border-3 border-white/50 shadow-2xl">
              <div
                className="font-arabic font-black text-[130px] sm:text-[170px] md:text-[200px] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-all animate-pulse"
                style={{
                  color: currentLetter.color || "#ef4444",
                  WebkitTextStroke: "4px #ffffff",
                }}
              >
                {currentLetter.ar}
              </div>

              <div className="space-y-1 mt-2">
                <div className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {currentLetter.nameBn} ({currentLetter.nameEn})
                </div>
                <div className="text-xs text-sky-100 font-bold drop-shadow">
                  {currentLetter.makhraj}
                </div>
              </div>

              <button
                onClick={playCurrentSound}
                className="mt-3 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>উচ্চারণ শোনো</span>
              </button>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE HOLLOW TRACING STAGE WITH MASCOT & COLLECTIBLES */}
            <div className="md:col-span-7 flex flex-col items-center justify-center">
              <div
                ref={stageRef}
                onPointerMove={handleStagePointerMove}
                onTouchMove={handleStagePointerMove}
                className="relative w-full max-w-md h-[340px] sm:h-[400px] rounded-3xl bg-white/20 backdrop-blur-md border-3 border-white/60 shadow-2xl flex items-center justify-center overflow-hidden cursor-crosshair touch-none"
              >
                {/* Hollow Glassy Letter Outline */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    color: isCompleted ? currentLetter.color : "transparent",
                    WebkitTextStroke: "5px rgba(255, 255, 255, 0.9)",
                    textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
                    transition: "color 0.4s ease",
                  }}
                >
                  <span className="font-arabic font-black text-[220px] sm:text-[280px] leading-none select-none">
                    {currentLetter.ar}
                  </span>
                </div>

                {/* Filled Solid Color Trace Background behind completed path */}
                {hitCheckpointIndex >= 0 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-85 transition-all"
                    style={{
                      color: currentLetter.color,
                      clipPath: `inset(0 ${100 - progressPercent}% 0 0)`,
                    }}
                  >
                    <span className="font-arabic font-black text-[220px] sm:text-[280px] leading-none select-none">
                      {currentLetter.ar}
                    </span>
                  </div>
                )}

                {/* Collectible Food / Items Placed along the Checkpoints */}
                {checkpoints.map((cp, idx) => {
                  const isHit = idx <= hitCheckpointIndex;
                  const isNext = idx === hitCheckpointIndex + 1;

                  return (
                    <div
                      key={idx}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${
                        isHit ? "scale-0 opacity-0" : isNext ? "scale-125 animate-bounce" : "scale-100"
                      }`}
                      style={{
                        left: `${cp.x * 100}%`,
                        top: `${cp.y * 100}%`,
                      }}
                    >
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 border-2 border-amber-300 shadow-md flex items-center justify-center text-lg sm:text-xl">
                        {currentMascot.targetItem}
                      </div>
                    </div>
                  );
                })}

                {/* Animated Cute Mascot Following Active Checkpoint */}
                {(() => {
                  const activePos =
                    hitCheckpointIndex >= 0
                      ? checkpoints[Math.min(hitCheckpointIndex, checkpoints.length - 1)]
                      : checkpoints[0];

                  return (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-30"
                      style={{
                        left: `${activePos.x * 100}%`,
                        top: `${activePos.y * 100}%`,
                      }}
                    >
                      <div className="relative">
                        <div className="text-4xl sm:text-5xl animate-bounce filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                          {currentMascot.emoji}
                        </div>
                        {/* Mascot Glow Pulse */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white animate-ping opacity-75" />
                      </div>
                    </div>
                  );
                })()}

                {/* Tracing Instruction Banner */}
                <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] sm:text-xs font-bold text-white shadow-xs">
                    👆 {currentMascot.name}-কে পথ ধরে টেনে নিয়ে হরফটি পূর্ণ করো!
                  </span>
                </div>
              </div>

              {/* Tracing Progress Meter */}
              <div className="w-full max-w-md mt-3 flex items-center justify-between gap-3 px-1">
                <div className="flex-1 h-3 rounded-full bg-white/40 border border-white/60 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-white drop-shadow font-mono">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Switcher: Jump to Previous / Next Letter */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevLetter}
              className="px-4 py-2 rounded-2xl bg-white/70 hover:bg-white/90 text-slate-800 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              ← আগের হরফ
            </button>

            <button
              onClick={handleNextLetter}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>পরবর্তী হরফে যাও</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          🎉 CELEBRATION MODAL (100% LETTER TRACED)
      ══════════════════════════════════════════════════════════ */}
      {showCelebrationModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-amber-400 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              {currentMascot.emoji}🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-amber-950 font-hind-siliguri">
                مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)
              </h2>
              <p className="text-sm font-bold text-emerald-800">
                তুমি সফলভাবে <strong>{currentLetter.nameBn} ({currentLetter.ar})</strong> হরফটি সঠিক নিয়মে এঁকেছো!
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-500 font-bold">অর্জন</span>
                <div className="text-xl">⭐⭐⭐</div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <span className="text-xs text-slate-500 font-bold">পুরস্কার</span>
                <div className="text-sm font-black text-amber-800">+৫ 🪙 পয়েন্ট</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  handleNextLetter();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>পরবর্তী হরফে যাও</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setHitCheckpointIndex(-1);
                  setIsCompleted(false);
                }}
                className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার আঁকো</span>
              </button>

              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setViewMode("selector");
                }}
                className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                হরফ তালিকায় ফেরো
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
