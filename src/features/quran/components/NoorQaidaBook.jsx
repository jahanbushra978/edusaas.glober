"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Award,
  Layers,
  Printer,
  X,
  GraduationCap,
  Star,
  Check,
  Maximize2,
  Minimize2,
  HelpCircle,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Bookmark,
  Gamepad2,
  LayoutGrid,
  Sliders,
  Smartphone,
  Eye,
  Smile,
  Compass,
  Heart,
} from "lucide-react";
import {
  NOOR_QAIDA_PARVAS,
  NOOR_QAIDA_CLASSES,
  getClassByNumber,
  getParvaById,
} from "../data/noorQaidaCurriculumData";
import {
  PARVA_THEMES,
  SPECIAL_PAGES,
  BROKEN_SYLLABLES_DATA,
} from "../data/noorQaidaPagesData";
import { universalAudioEngine } from "@/lib/quran/audio";

// Full sequence of pages including special intro pages
const PAGE_SEQUENCE = [
  "cover",       // পৃষ্ঠা ১: প্রচ্ছদ
  "rules",       // পৃষ্ঠা ৩: ব্যবহারের নিয়ম
  "color-code",  // পৃষ্ঠা ৫: চিহ্ন ও রঙ-সংকেত
  ...Array.from({ length: 78 }, (_, i) => i + 1), // ক্লাস ১ থেকে ৭৮ (পৃষ্ঠা ৮ থেকে ১০১)
];

export default function NoorQaidaBook({ initialClass = "cover", onNavigateBack }) {
  // Navigation State
  const [currentPage, setCurrentPage] = useState(initialClass); // 'cover' | 'rules' | 'color-code' | 1..78
  const [activeTab, setActiveTab] = useState("class"); // 'class' | 'game' | 'chart' | 'certificate'
  const [activeGameId, setActiveGameId] = useState(1);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState("");

  // 3 Distinct Reading Modes: '3d' (3D Flipbook), 'scroll' (Continuous Scroll), 'single' (Normal Card)
  const [viewMode, setViewMode] = useState("3d"); // '3d' | 'scroll' | 'single'
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("next"); // 'next' | 'prev'
  const [flipProgress, setFlipProgress] = useState(0); // 0 to 100 for visual turn progress
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playback & Sound State
  const [activeItemId, setActiveItemId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState(1);
  const playAllAbortRef = useRef(false);

  // Ball bounce animation for Qalqalah (Class 39)
  const [ballBouncing, setBallBouncing] = useState(false);

  // Student Gamification & Star Collection
  const [completedClasses, setCompletedClasses] = useState([]);
  const [earnedStars, setEarnedStars] = useState({});
  const [celebrationToast, setCelebrationToast] = useState(null);
  const [studentName, setStudentName] = useState("মুহাম্মদ আবদুল্লাহ");

  // Touch Swipe Handling for Mobile
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Scroll View references
  const scrollContainerRef = useRef(null);

  // Load progress on mount
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem("noor_qaida_completed_classes");
      if (savedCompleted) setCompletedClasses(JSON.parse(savedCompleted));
      const savedStars = localStorage.getItem("noor_qaida_earned_stars");
      if (savedStars) setEarnedStars(JSON.parse(savedStars));
      const savedName = localStorage.getItem("noor_qaida_student_name");
      if (savedName) setStudentName(savedName);
      const savedMode = localStorage.getItem("noor_qaida_view_mode");
      if (savedMode) setViewMode(savedMode);
    } catch { }
  }, []);

  // Save student name
  const handleSaveStudentName = (name) => {
    setStudentName(name);
    try {
      localStorage.setItem("noor_qaida_student_name", name);
    } catch { }
  };

  // Toggle View Mode
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("noor_qaida_view_mode", mode);
    } catch { }
  };

  // ── 1. ULTRA-REALISTIC CRISP PAPER RUSTLE SOUND SYNTHESIS ──
  // Plays a rich, multi-layered realistic book page turn sound (noise burst + whoosh + paper flap)
  const playCrispPaperSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      // Layer 1: Band-pass filtered white noise for crisp paper texture
      const bufferSize = Math.floor(ctx.sampleRate * 0.22); // 220ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const envelope = Math.sin((t / 0.22) * Math.PI) * Math.exp(-t * 11);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.42;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bpf = ctx.createBiquadFilter();
      bpf.type = "bandpass";
      bpf.frequency.setValueAtTime(2400, now);
      bpf.frequency.exponentialRampToValueAtTime(1200, now + 0.22);
      bpf.Q.setValueAtTime(1.8, now);

      // Layer 2: Gentle air displacement whoosh
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      oscGain.gain.setValueAtTime(0.09, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(bpf);
      bpf.connect(ctx.destination);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch { }
  };

  // ── 2. CUTE KID-FRIENDLY BUBBLE POP SOUND FOR CLICKING TILES ──
  const playCuteBubbleSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch { }
  };

  // Stop sound when page changes
  useEffect(() => {
    playAllAbortRef.current = true;
    setIsPlayingAll(false);
    setActiveItemId(null);
    universalAudioEngine.stop();
  }, [currentPage, activeTab]);

  // Audio Play Function for Any Item
  const playItemSound = async (item, speed = audioSpeed) => {
    playCuteBubbleSound();
    const soundKey = typeof item === "string" ? item : (item.sound || item.ar);
    const itemId = typeof item === "string" ? item : (item.id || item.ar);
    setActiveItemId(itemId);

    try {
      if (item && item.ayahRef) {
        await universalAudioEngine.playAyah(
          item.ayahRef.surah,
          item.ayahRef.ayah,
          "alafasy",
          { rate: speed }
        );
      } else if (item && item.audioUrl) {
        await universalAudioEngine.playWord(item.audioUrl, { rate: speed });
      } else {
        await universalAudioEngine.playArabicSound(soundKey, { rate: speed });
      }
    } catch (err) {
      console.warn("Audio play error:", err);
    } finally {
      setActiveItemId((curr) => (curr === itemId ? null : curr));
    }
  };

  // "আজ আমি পারলাম ⭐" Star Claim Action
  const handleClaimStar = (classNum) => {
    const isAlreadyClaimed = earnedStars[classNum];
    const newEarned = { ...earnedStars, [classNum]: !isAlreadyClaimed };
    setEarnedStars(newEarned);

    let updatedCompleted;
    if (!isAlreadyClaimed) {
      updatedCompleted = Array.from(new Set([...completedClasses, classNum]));
      setCelebrationToast(`মাশাআল্লাহ! ক্লাস ${classNum}-এর তারা অর্জিত হয়েছে! ⭐`);
      setTimeout(() => setCelebrationToast(null), 3500);
    } else {
      updatedCompleted = completedClasses.filter((c) => c !== classNum);
    }
    setCompletedClasses(updatedCompleted);

    try {
      localStorage.setItem("noor_qaida_earned_stars", JSON.stringify(newEarned));
      localStorage.setItem("noor_qaida_completed_classes", JSON.stringify(updatedCompleted));
    } catch { }
  };

  // ── 3. VISIBLE 3D PAGE TURN NAVIGATION ──
  // The page turning animation is distinctly visible (500ms sheet rotation with lighting & shadow)
  const navigateToPage = (targetPage, direction = "next") => {
    if (currentPage === targetPage) return;

    if (viewMode === "3d") {
      playCrispPaperSound();
      setFlipDirection(direction);
      setIsFlipping(true);

      // Step 1: Flap turns over 0 -> 100%
      setFlipProgress(50);

      setTimeout(() => {
        setCurrentPage(targetPage);
        setActiveTab("class");
        setFlipProgress(100);

        setTimeout(() => {
          setIsFlipping(false);
          setFlipProgress(0);
        }, 260);
      }, 240);
    } else if (viewMode === "scroll") {
      setCurrentPage(targetPage);
      setActiveTab("class");
      // Scroll smoothly to target class element
      setTimeout(() => {
        const el = document.getElementById(`qaida-page-${targetPage}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    } else {
      setCurrentPage(targetPage);
      setActiveTab("class");
    }
  };

  const handleNextPage = () => {
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    if (currentIndex < PAGE_SEQUENCE.length - 1) {
      navigateToPage(PAGE_SEQUENCE[currentIndex + 1], "next");
    }
  };

  const handlePrevPage = () => {
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    if (currentIndex > 0) {
      navigateToPage(PAGE_SEQUENCE[currentIndex - 1], "prev");
    }
  };

  // Touch Swipe Handlers for Mobile Phones
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Minimum swipe threshold: 45px and dominant horizontal movement
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped Left -> Next Page
        handleNextPage();
      } else {
        // Swiped Right -> Previous Page
        handlePrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Sequential Play All ("একটানা মাশক")
  const handlePlayAll = async () => {
    if (isPlayingAll) {
      playAllAbortRef.current = true;
      setIsPlayingAll(false);
      universalAudioEngine.stop();
      setActiveItemId(null);
      return;
    }

    if (typeof currentPage !== "number") return;
    const cls = getClassByNumber(currentPage);
    if (!cls || !cls.items || cls.items.length === 0) return;

    setIsPlayingAll(true);
    playAllAbortRef.current = false;

    const items = cls.items;
    const repetitions = repeatMode;

    for (let rep = 0; rep < repetitions; rep++) {
      if (playAllAbortRef.current) break;

      for (let i = 0; i < items.length; i++) {
        if (playAllAbortRef.current) break;
        const item = items[i];
        setActiveItemId(item.id || item.ar);

        try {
          if (item.ayahRef) {
            await universalAudioEngine.playAyah(
              item.ayahRef.surah,
              item.ayahRef.ayah,
              "alafasy",
              { rate: audioSpeed }
            );
          } else if (item.audioUrl) {
            await universalAudioEngine.playWord(item.audioUrl, { rate: audioSpeed });
          } else {
            await universalAudioEngine.playArabicSound(item.sound || item.ar, {
              rate: audioSpeed,
            });
          }
        } catch { }

        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setIsPlayingAll(false);
    setActiveItemId(null);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Current Class & Parva Objects (only when on numeric class page)
  const isClassPage = typeof currentPage === "number";
  const currentClass = useMemo(
    () => (isClassPage ? getClassByNumber(currentPage) : null),
    [currentPage, isClassPage]
  );
  const currentParva = useMemo(
    () => (currentClass ? getParvaById(currentClass.parvaNumber) : null),
    [currentClass]
  );
  const parvaTheme = useMemo(
    () => (currentClass ? PARVA_THEMES[currentClass.parvaNumber] || PARVA_THEMES[1] : PARVA_THEMES[1]),
    [currentClass]
  );

  const isClassStarEarned = isClassPage ? !!earnedStars[currentPage] : false;
  const completionPercent = Math.round(
    (completedClasses.length / NOOR_QAIDA_CLASSES.length) * 100
  );

  // Label for current page
  const getPageHeaderLabel = () => {
    if (currentPage === "cover") return "প্রচ্ছদ (পৃষ্ঠা ১)";
    if (currentPage === "rules") return "পড়ার নিয়ম (পৃষ্ঠা ৩)";
    if (currentPage === "color-code") return "রঙ-সংকেত (পৃষ্ঠা ৫)";
    return `ক্লাস ${currentClass?.classNumberBn} • পৃষ্ঠা ${currentPage + 7}`;
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8EE] text-slate-800 font-sans select-none pb-28 sm:pb-20 relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP CUTE PLATFORM NAVIGATION HUD ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="p-2 rounded-2xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
                title="ফিরে যান"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-2xl animate-pulse">📗</span>
                <h1 className="text-base sm:text-lg font-black text-emerald-950 font-hind-siliguri tracking-tight flex items-center gap-1.5">
                  <span>নূর কায়দা</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold hidden sm:inline shadow-xs">
                    ছোটদের পাঠশালা
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-800 font-bold hidden sm:block">
                {getPageHeaderLabel()}
              </p>
            </div>
          </div>

          {/* Center / Right: 3 Modes & Switchers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Switchers (Book, Games, Chart, Certificate) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-inner">
              <button
                onClick={() => setActiveTab("class")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "class"
                    ? "bg-white text-emerald-900 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📖 <span className="hidden sm:inline">বই</span>
              </button>
              <button
                onClick={() => setActiveTab("game")}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "game"
                    ? "bg-amber-400 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="মজার খেলা"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">খেলা</span>
              </button>
              <button
                onClick={() => setActiveTab("chart")}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "chart"
                    ? "bg-emerald-600 text-white shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="অগ্রগতি চার্ট"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">চার্ট</span>
              </button>
              <button
                onClick={() => setActiveTab("certificate")}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "certificate"
                    ? "bg-purple-600 text-white shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="সনদপত্র"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সনদ</span>
              </button>
            </div>

            {/* ── 3 READING MODES TOGGLE: 3D FLIP, SCROLL, SINGLE ── */}
            <div className="flex items-center bg-amber-100/80 p-0.5 rounded-2xl border border-amber-300 text-xs font-bold">
              {/* 3D Flip Mode */}
              <button
                onClick={() => handleSetViewMode("3d")}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  viewMode === "3d"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md font-black ring-1 ring-emerald-300"
                    : "text-amber-950 hover:bg-amber-200/50"
                }`}
                title="৩ডি ফ্লিপ বই (বাস্তব পাতা উল্টানোর মতো)"
              >
                <span>📖</span>
                <span className="hidden md:inline font-hind-siliguri">৩ডি বই</span>
              </button>

              {/* Continuous Scroll Mode */}
              <button
                onClick={() => handleSetViewMode("scroll")}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  viewMode === "scroll"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md font-black ring-1 ring-blue-300"
                    : "text-amber-950 hover:bg-amber-200/50"
                }`}
                title="একটানা স্ক্রোল মোড (স্মুথ স্ক্রোল করে পড়া)"
              >
                <span>📜</span>
                <span className="hidden md:inline font-hind-siliguri">স্ক্রোল</span>
              </button>

              {/* Single Page Normal Mode */}
              <button
                onClick={() => handleSetViewMode("single")}
                className={`px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  viewMode === "single"
                    ? "bg-white text-slate-900 shadow-sm font-black"
                    : "text-amber-950 hover:bg-amber-200/50"
                }`}
                title="সাধারণ একক পৃষ্ঠা"
              >
                <span>📄</span>
                <span className="hidden md:inline font-hind-siliguri">কার্ড</span>
              </button>
            </div>

            {/* Table of Contents (TOC) */}
            <button
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-900 transition"
              title="সূচিপত্র খুলুন"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden lg:inline">সূচিপত্র</span>
              <span className="bg-emerald-950/70 text-[11px] px-1.5 py-0.5 rounded-md font-mono">
                {typeof currentPage === "number" ? `${currentPage}/৭৮` : "সূচি"}
              </span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition hidden sm:inline-flex"
              title={isFullscreen ? "ফুলস্ক্রিন বন্ধ" : "ফুলস্ক্রিন মোড"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── CUTE PLAYFUL MASCOT BANNER FOR KIDS ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border-2 border-amber-300 shadow-xs text-xs font-bold text-amber-950">
          <span className="text-base animate-bounce">🧒</span>
          <span className="font-hind-siliguri">
            নূর বন্ধু: <strong>"আজকের পাঠে মনোযোগ দাও, তারার মালা জেতো!"</strong>
          </span>
        </div>

        {/* View Mode Indicator Tag */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
          <span>{viewMode === "3d" ? "📖 ৩ডি পাতা উল্টানো মোড" : viewMode === "scroll" ? "📜 একটানা স্ক্রোল মোড" : "📄 সাধারণ কার্ড মোড"}</span>
        </div>
      </div>

      {/* ── CELEBRATION TOAST ── */}
      {celebrationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white px-6 py-3.5 rounded-3xl shadow-2xl border-2 border-amber-300 flex items-center gap-3 animate-bounce">
          <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-spin-slow" />
          <span className="text-sm font-black font-hind-siliguri">
            {celebrationToast}
          </span>
        </div>
      )}

      {/* ── MAIN BOOK CONTAINER (FAITHFUL TO 104-PAGE PDF + ULTRA CUTE) ── */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 relative">
        {/* ── FLOATING LEFT & RIGHT TURN BUTTONS (DESKTOP) ── */}
        {activeTab === "class" && viewMode === "3d" && (
          <>
            <button
              onClick={handlePrevPage}
              className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center w-12 h-20 rounded-2xl bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-700 border-2 border-amber-300 shadow-xl transition-all hover:scale-110 active:scale-95 group"
              title="পূর্ববর্তী পাতা উল্টাও"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[9px] font-bold mt-1">আগের</span>
            </button>

            <button
              onClick={handleNextPage}
              className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center w-12 h-20 rounded-2xl bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-700 border-2 border-amber-300 shadow-xl transition-all hover:scale-110 active:scale-95 group"
              title="পরবর্তী পাতা উল্টাও"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-[9px] font-bold mt-1">পরের</span>
            </button>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW MODE A & C: 3D FLIPBOOK OR SINGLE CARD VIEW
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && viewMode !== "scroll" && (
          <div
            className={`transition-all duration-300 ${
              viewMode === "3d" ? "perspective-[2000px]" : ""
            }`}
          >
            {/* ── 3D PHYSICAL BOOK FRAME ── */}
            <div
              className={`relative bg-white rounded-[2.5rem] border-4 shadow-2xl overflow-hidden transition-all duration-500 ${
                viewMode === "3d"
                  ? `border-amber-400 shadow-[0_25px_60px_rgba(0,0,0,0.18)] ${
                      isFlipping && flipDirection === "next"
                        ? "-rotate-y-16 scale-[0.97] -translate-x-4 shadow-[-35px_25px_50px_rgba(0,0,0,0.32)]"
                        : isFlipping && flipDirection === "prev"
                        ? "rotate-y-16 scale-[0.97] translate-x-4 shadow-[35px_25px_50px_rgba(0,0,0,0.32)]"
                        : "rotate-y-0 scale-100 translate-x-0"
                    }`
                  : "border-slate-300"
              }`}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: flipDirection === "next" ? "left center" : "right center",
              }}
            >
              {/* Realistic 3D Book Spine Shadow on Left */}
              {viewMode === "3d" && (
                <div className="absolute top-0 bottom-0 left-0 w-10 pointer-events-none z-30 bg-gradient-to-r from-stone-900/25 via-stone-700/10 to-transparent"></div>
              )}

              {/* Realistic 3D Dynamic Turning Flap Overlay (Visible Page Flip) */}
              {viewMode === "3d" && isFlipping && (
                <div
                  className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-300 flex items-center justify-center ${
                    flipDirection === "next"
                      ? "bg-gradient-to-r from-transparent via-amber-100/30 to-black/20"
                      : "bg-gradient-to-l from-transparent via-amber-100/30 to-black/20"
                  }`}
                >
                  <div className="px-4 py-2 rounded-2xl bg-white/95 border-2 border-amber-400 shadow-2xl text-xs font-black text-emerald-950 font-hind-siliguri flex items-center gap-2 animate-pulse">
                    <span>📖</span>
                    <span>পাতা উল্টানো হচ্ছে...</span>
                  </div>
                </div>
              )}

              {/* Realistic Golden Page Flip Dog-Ear in 3D Mode */}
              {viewMode === "3d" && (
                <button
                  onClick={handleNextPage}
                  className="absolute top-3 right-3 z-30 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-500"
                  title="পরবর্তী পাতা উল্টাও"
                >
                  <span>পাতা উল্টাও</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* ══════════════════════════════════════════════════════════
                  PAGE 1: প্রচ্ছদ / COVER PAGE (PDF PAGE 1 + ULTRA CUTE)
              ══════════════════════════════════════════════════════════ */}
              {currentPage === "cover" && (
                <div className="p-6 sm:p-10 bg-gradient-to-b from-emerald-100/70 via-amber-50/50 to-emerald-200/50 text-center space-y-6">
                  {/* Mosque & Smiling Sun Sky Vector */}
                  <div className="relative py-4 flex flex-col items-center">
                    <div className="text-6xl sm:text-7xl animate-bounce select-none">
                      🕌
                    </div>
                    <div className="flex items-center justify-center gap-3 text-amber-400 text-2xl mt-2 select-none">
                      <span>☀️</span>
                      <span>🌙</span>
                      <span>⭐</span>
                      <span>⭐</span>
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-2">
                    <span className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md inline-block">
                      মক্তব শিক্ষা পাঠ্যপাঠিকা
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-emerald-950 font-hind-siliguri tracking-tight drop-shadow-xs">
                      নূর কায়দা
                    </h2>
                    <p className="text-base sm:text-lg font-black text-amber-900 font-hind-siliguri">
                      হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত
                    </p>
                  </div>

                  {/* Cute Student Avatars & Feature Cards */}
                  <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-6 border-3 border-emerald-300 shadow-xl space-y-5">
                    <div className="flex items-center justify-center gap-8 text-5xl select-none">
                      <div className="flex flex-col items-center hover:scale-110 transition">
                        <span>🧒</span>
                        <span className="text-xs font-black text-emerald-900 mt-1">আহমদ</span>
                      </div>
                      <div className="text-3xl text-emerald-600 font-arabic font-bold bg-emerald-50 px-4 py-2 rounded-2xl border-2 border-emerald-300">
                        ا ب ت ث
                      </div>
                      <div className="flex flex-col items-center hover:scale-110 transition">
                        <span>🧕</span>
                        <span className="text-xs font-black text-emerald-900 mt-1">ফাতিমা</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-left text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50 text-emerald-950 border-2 border-emerald-200">
                        <span className="text-xl">🔤</span>
                        <span>২৯টি হরফের মাশক</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-50 text-blue-950 border-2 border-blue-200">
                        <span className="text-xl">🔵</span>
                        <span>রঙ-সংকেত হরকত</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 text-amber-950 border-2 border-amber-200">
                        <span className="text-xl">🗣️</span>
                        <span>সচিত্র ১৭ মাখরাজ</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-50 text-purple-950 border-2 border-purple-200">
                        <span className="text-xl">🎮</span>
                        <span>৪টি আনন্দময় খেলা</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-hind-siliguri font-bold">
                      📖 ছবি • রঙ • চার্ট • অনুশীলনী — শিক্ষক ও ছাত্র দুজনের জন্য
                    </p>
                  </div>

                  {/* Big Pulsating CTA Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigateToPage("rules", "next")}
                      className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-300"
                    >
                      <BookOpen className="w-6 h-6 text-amber-300" />
                      <span>বই পড়া শুরু করো ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  PAGE 2: পড়ার নিয়মাবলী (PDF PAGE 3)
              ══════════════════════════════════════════════════════════ */}
              {currentPage === "rules" && (
                <div className="p-5 sm:p-8 space-y-6 bg-slate-50/50">
                  <div className="text-center space-y-1">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                      পৃষ্ঠা ৩ • উস্তাদ ও অভিভাবকের নির্দেশিকা
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hind-siliguri">
                      কীভাবে ব্যবহার করবেন — শিক্ষক ও অভিভাবকের জন্য
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      সহজ, মিষ্টি ও কার্যকর মক্তব পাঠ্যপদ্ধতি
                    </p>
                  </div>

                  <div className="space-y-3">
                    {SPECIAL_PAGES[3].items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-emerald-300 hover:shadow-md transition"
                      >
                        <span className="text-3xl shrink-0 select-none">{item.icon}</span>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-slate-900 font-hind-siliguri">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed font-hind-siliguri font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigateToPage("color-code", "next")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95"
                    >
                      <span>পরবর্তী: চিহ্ন ও রঙ-সংকেত ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  PAGE 3: চিহ্ন ও রঙ-সংকেতের চার্ট (PDF PAGE 5)
              ══════════════════════════════════════════════════════════ */}
              {currentPage === "color-code" && (
                <div className="p-5 sm:p-8 space-y-6">
                  <div className="text-center space-y-1">
                    <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 font-black text-xs border border-blue-300">
                      পৃষ্ঠা ৫ • সর্বজনীন রঙ-সংকেত
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hind-siliguri">
                      চিহ্ন ও রঙ-সংকেত
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      সারা বইয়ে একই রঙ, একই চিহ্ন — যেকোনো কার্ডে ক্লিক করলেই খাঁটি উচ্চারণ শুনবে
                    </p>
                  </div>

                  {/* 8 Pastel Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
                    {SPECIAL_PAGES[5].cards.map((card, idx) => {
                      const isItemActive = activeItemId === card.nameBn;
                      return (
                        <div
                          key={idx}
                          onClick={() => playItemSound({ ar: card.ar, id: card.nameBn, sound: card.ar })}
                          className={`p-4 rounded-3xl border-3 text-center cursor-pointer transition-all ${card.bg} ${card.border} ${
                            isItemActive
                              ? "scale-105 ring-4 ring-emerald-400 shadow-xl"
                              : "hover:scale-102 hover:shadow-md"
                          }`}
                        >
                          <div className="font-arabic text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
                            {card.ar}
                          </div>
                          <div className="text-sm font-black text-slate-800 font-hind-siliguri" dir="ltr">
                            {card.nameBn}
                          </div>
                          <div className="text-[11px] text-slate-600 font-hind-siliguri mt-1" dir="ltr">
                            {card.ruleBn}
                          </div>
                          <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-300 text-slate-700 mt-2 inline-block shadow-2xs" dir="ltr">
                            আওয়াজ: {card.soundBn}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center text-xs text-amber-900 font-bold">
                    {SPECIAL_PAGES[5].footerTip}
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => navigateToPage(1, "next")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95"
                    >
                      <span>পরবর্তী: ক্লাস ১ (হরফ পরিচয়) ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════
                  PAGE 4: CLASSES 1 TO 78 (REGULAR CURRICULUM PAGES)
              ══════════════════════════════════════════════════════════ */}
              {isClassPage && currentClass && (
                <>
                  {/* ── TOP HEADER BAR ── */}
                  <div
                    className={`p-4 sm:p-6 bg-gradient-to-r ${parvaTheme.headerBg} text-white relative flex items-center justify-between overflow-hidden shadow-inner`}
                  >
                    {/* Left: Round Class Badge + Titles */}
                    <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-emerald-950 flex flex-col items-center justify-center shadow-lg border-3 border-amber-300 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          ক্লাস
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-emerald-900 font-hind-siliguri -mt-1">
                          {currentClass.classNumberBn}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-hind-siliguri drop-shadow-sm">
                          {currentClass.titleBn}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-emerald-100 font-bold">
                            {currentClass.parvaTitleBn}
                          </span>
                          {currentClass.titleAr && (
                            <span
                              className="hidden sm:inline text-xs text-amber-200 font-arabic font-medium"
                              dir="rtl"
                            >
                              • {currentClass.titleAr}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Golden Crescent Moon 🌙 and Twinkling Star ⭐ */}
                    <div className="flex items-center gap-1.5 text-amber-300 drop-shadow-md select-none shrink-0">
                      <span className="text-3xl sm:text-4xl">🌙</span>
                      <span className="text-2xl sm:text-3xl text-amber-200">⭐</span>
                    </div>
                  </div>

                  {/* ── TARGET BANNER: 🎯 আমি পারব / আমি জানব ── */}
                  <div className="p-4 sm:p-5 bg-amber-50/90 border-b-2 border-dashed border-amber-400/90 m-4 sm:m-5 rounded-3xl flex items-start gap-3 shadow-2xs">
                    <span className="text-2xl shrink-0 select-none">🎯</span>
                    <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-hind-siliguri">
                      <strong className="font-black text-amber-900 text-sm mr-1.5">
                        আমি পারব:
                      </strong>
                      {currentClass.objectiveBn}
                    </div>
                  </div>

                  {/* ── PLAY ALL & SPEED CONTROLS ROW ── */}
                  <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                      <span className="font-black text-emerald-950 text-[11px] sm:text-xs font-hind-siliguri">
                        যেকোনো হরফ বা শব্দে ক্লিক করলেই ক্বারীর খাঁটি তিলাওয়াত বাজবে
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAudioSpeed((s) => (s === 1.0 ? 0.75 : 1.0))}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-[11px] shadow-2xs"
                        title="গতি পরিবর্তন"
                      >
                        {audioSpeed === 0.75 ? "🐢 ০.৭৫x" : "🐇 ১.০x"}
                      </button>

                      <button
                        onClick={() => setRepeatMode((r) => (r === 1 ? 3 : 1))}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-[11px] shadow-2xs"
                        title="পুনরাবৃত্তি সংখ্যা"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1 text-emerald-600" />
                        {repeatMode}x মাশক
                      </button>

                      <button
                        onClick={handlePlayAll}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shadow-xs transition-all ${
                          isPlayingAll
                            ? "bg-rose-600 text-white"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isPlayingAll ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>থামুন</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>একটানা শুনুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════════════
                      LESSON BODY (DYNAMIC ADAPTIVE BY CLASS TYPE)
                  ══════════════════════════════════════════════════════════ */}
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* ── TYPE A: CLASS 1 (29 LETTERS GRID IN RTL ORDER) ── */}
                    {currentPage === 1 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm">
                          <span>আরবি বর্ণমালা — ২৯টি হরফ</span>
                          <span className="text-amber-200 font-black">
                            👉 আরবি পড়ি ডান দিক থেকে বাম দিকে 👈
                          </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-4" dir="rtl">
                          {currentClass.items.map((item, idx) => {
                            const isItemActive = activeItemId === (item.id || item.ar);
                            return (
                              <div
                                key={item.id || idx}
                                onClick={() => playItemSound(item)}
                                className={`group relative p-3 sm:p-5 rounded-3xl border-3 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center select-none ${
                                  isItemActive
                                    ? "bg-emerald-100 border-emerald-600 ring-4 ring-emerald-400 shadow-xl scale-105"
                                    : "bg-[#FBFDFB] border-emerald-200 hover:border-emerald-500 hover:bg-white hover:shadow-md hover:-translate-y-1 active:translate-y-0.5 active:border-b-2"
                                }`}
                              >
                                <div
                                  className={`font-arabic text-3xl sm:text-5xl font-bold transition-all ${
                                    isItemActive
                                      ? "text-emerald-800 scale-110"
                                      : "text-slate-900 group-hover:text-emerald-700"
                                  }`}
                                >
                                  {item.ar}
                                </div>
                                <div className="text-[11px] sm:text-xs font-black text-slate-700 mt-1 sm:mt-2 font-hind-siliguri">
                                  {item.nameBn}
                                </div>
                                {isItemActive && (
                                  <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-slate-400 text-center font-medium">
                          * আলিফ ও হামযাহ আলাদা ধরলে ২৯টি হরফ; কেউ কেউ ২৮টি গণনা করেন।
                        </p>
                      </div>
                    ) : currentPage >= 11 && currentPage <= 15 ? (
                      /* ── TYPE B: CLASSES 11-15 (MAKHRAJ & 5 ANATOMICAL ORGANS) ── */
                      <div className="space-y-6">
                        <div className="p-4 rounded-3xl bg-amber-50/70 border-3 border-amber-300 space-y-3">
                          <div className="text-sm font-black text-amber-950 flex items-center gap-2 font-hind-siliguri">
                            <span>মাখরাজের ৫টি প্রধান অঙ্গ ও স্থান</span>
                            <span>🗣️</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                            <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
                              <span className="text-2xl block">🫁</span>
                              <span className="text-amber-950 block mt-1 font-hind-siliguri">হলক (কণ্ঠনালী)</span>
                              <span className="text-[10px] text-slate-500">৬টি হরফ</span>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
                              <span className="text-2xl block">👅</span>
                              <span className="text-amber-950 block mt-1 font-hind-siliguri">লিসান (জিহ্বা)</span>
                              <span className="text-[10px] text-slate-500">১৮টি হরফ</span>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
                              <span className="text-2xl block">👄</span>
                              <span className="text-amber-950 block mt-1 font-hind-siliguri">শাফাতান (ঠোঁট)</span>
                              <span className="text-[10px] text-slate-500">৪টি হরফ</span>
                            </div>
                            <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
                              <span className="text-2xl block">👃</span>
                              <span className="text-amber-950 block mt-1 font-hind-siliguri">খয়শূম (নাক)</span>
                              <span className="text-[10px] text-slate-500">গুন্নাহর ধ্বনি</span>
                            </div>
                            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
                              <span className="text-2xl block">🗣️</span>
                              <span className="text-amber-950 block mt-1 font-hind-siliguri">জওফ (মুখের খালি)</span>
                              <span className="text-[10px] text-slate-500">মদের ৩ হরফ</span>
                            </div>
                          </div>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" dir="rtl">
                          {currentClass.items.map((item, idx) => {
                            const isItemActive = activeItemId === item.id;
                            return (
                              <div
                                key={item.id || idx}
                                onClick={() => playItemSound(item)}
                                className={`p-4 rounded-3xl border-3 text-center cursor-pointer transition-all ${
                                  isItemActive
                                    ? "bg-amber-100 border-amber-600 ring-4 ring-amber-300 shadow-lg scale-105"
                                    : "bg-white border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-1"
                                }`}
                              >
                                <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900">
                                  {item.ar}
                                </div>
                                <div className="text-xs font-bold text-slate-800 font-hind-siliguri mt-2" dir="ltr">
                                  {item.nameBn}
                                </div>
                                {item.tip && (
                                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-2" dir="ltr">
                                    {item.tip}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : currentPage === 16 ? (
                      /* ── TYPE C: CLASS 16 (জবরের পরিচয় — 3 QUESTIONS + 4 CARDS) ── */
                      <div className="space-y-6">
                        <div className="border-3 border-blue-300 rounded-3xl p-4 sm:p-6 bg-blue-50/40 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div
                            onClick={() => playItemSound({ ar: "اَ", sound: "اَ" })}
                            className="w-36 h-40 sm:w-40 sm:h-44 rounded-3xl bg-white border-3 border-blue-400 shadow-md flex items-center justify-center cursor-pointer hover:border-blue-600 hover:scale-105 transition shrink-0"
                          >
                            <div className="font-arabic text-7xl font-bold text-slate-900">
                              اَ
                            </div>
                          </div>

                          <div className="flex-1 w-full space-y-3 font-hind-siliguri">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-emerald-300 shadow-2xs">
                              <span className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                  ১
                                </span>
                                হরফের নাম কী?
                              </span>
                              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm border border-emerald-300">
                                আলিফ
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-blue-300 shadow-2xs">
                              <span className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                  ২
                                </span>
                                এই হরফের আওয়াজ কী হবে?
                              </span>
                              <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-950 font-black text-xs sm:text-sm border border-blue-300">
                                আ
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-slate-300 shadow-2xs">
                              <span className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                                  ৩
                                </span>
                                হরফের ওপরে যা আছে, তার নাম কী?
                              </span>
                              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-900 font-black text-xs sm:text-sm border border-slate-300">
                                জবর
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 inline-block font-hind-siliguri">
                            এই চারটি হরফে জবর
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
                            {currentClass.items.map((it, idx) => (
                              <div
                                key={it.id || idx}
                                onClick={() => playItemSound(it)}
                                className="p-4 rounded-3xl bg-white border-2 border-blue-200 hover:border-blue-500 hover:shadow-md cursor-pointer text-center space-y-2 group transition hover:-translate-y-1"
                              >
                                <div className="font-arabic text-4xl sm:text-5xl font-bold text-slate-900 group-hover:text-blue-700">
                                  {it.ar}
                                </div>
                                <div className="text-xs font-bold text-slate-700 font-hind-siliguri">
                                  {it.nameBn}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : currentPage === 18 ? (
                      /* ── TYPE D: CLASS 18 (জবর: দুই হরফ মিলাই + মদ-এর ছোট্ট ধারণা) ── */
                      <div className="space-y-6">
                        <div className="p-4 sm:p-5 rounded-3xl bg-blue-50 border-3 border-blue-300 text-center font-bold">
                          <div className="text-xs text-blue-700 mb-2 font-hind-siliguri">দুই হরফ জবর দিয়ে মিলাই</div>
                          <div className="font-arabic text-3xl sm:text-4xl text-blue-950 flex items-center justify-center gap-4">
                            <span>بَتَ</span>
                            <span>=</span>
                            <span>تَ</span>
                            <span>+</span>
                            <span>بَ</span>
                          </div>
                        </div>

                        <div className="border-3 border-amber-300 rounded-3xl p-5 bg-gradient-to-r from-amber-50 to-orange-50 space-y-3">
                          <div className="text-sm font-black text-amber-950 flex items-center gap-2 font-hind-siliguri">
                            <span>মদ-এর ছোট্ট ধারণা</span>
                            <span className="text-amber-500">🌟</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                              onClick={() => playItemSound({ ar: "بَ", sound: "بَ" })}
                              className="p-4 rounded-3xl bg-white border-2 border-amber-200 cursor-pointer hover:border-amber-400 text-center space-y-1 transition hover:-translate-y-1"
                            >
                              <div className="font-arabic text-4xl font-bold text-slate-900">بَ</div>
                              <div className="text-xs font-black text-amber-900 font-hind-siliguri">ছোট আওয়াজ • ১ হরকত</div>
                              <div className="text-xs text-slate-500 font-hind-siliguri">✊ → ✋ (১ বার হাত বন্ধ ও খোলা)</div>
                            </div>

                            <div
                              onClick={() => playItemSound({ ar: "بَا", sound: "بَا" })}
                              className="p-4 rounded-3xl bg-white border-2 border-amber-300 cursor-pointer hover:border-amber-500 text-center space-y-1 transition hover:-translate-y-1"
                            >
                              <div className="font-arabic text-4xl font-bold text-slate-900">بَا</div>
                              <div className="text-xs font-black text-amber-900 font-hind-siliguri">টানা আওয়াজ • ২ হরকত</div>
                              <div className="text-xs text-slate-500 font-hind-siliguri">✊✋ ✊✋ (২ বার হাত বন্ধ ও খোলা)</div>
                            </div>
                          </div>
                          <p className="text-[11px] text-amber-800 text-center font-hind-siliguri font-bold">
                            জবরের পরে খালি আলিফ থাকলে আওয়াজ একটু টেনে পড়তে হয়—একে বলে মদ।
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {currentClass.items.map((it, idx) => (
                            <div
                              key={it.id || idx}
                              onClick={() => playItemSound(it)}
                              className="p-3.5 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-400 text-center cursor-pointer group transition hover:-translate-y-1"
                            >
                              <div className="font-arabic text-3xl font-bold text-slate-900 group-hover:text-blue-700">
                                {it.ar}
                              </div>
                              <div className="text-xs font-bold text-slate-700 mt-1 font-hind-siliguri">
                                {it.nameBn}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : currentPage === 39 ? (
                      /* ── TYPE E: CLASS 39 (ক্বলক্বলা হরফ ও বাউন্সিং বল ⚽) ── */
                      <div className="space-y-6">
                        <div className="p-5 rounded-3xl bg-teal-50 border-3 border-teal-300 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex-1 space-y-2">
                            <span className="px-3.5 py-1 rounded-full bg-teal-200 text-teal-950 font-black text-xs">
                              ক্বলক্বলার ৫টি হরফ (قطبجد - কুতবু জাদ)
                            </span>
                            <h3 className="text-lg font-black text-teal-950 font-hind-siliguri">
                              প্রতিধ্বনি বা বল বাউন্সিংয়ের মতো আওয়াজ
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-hind-siliguri font-medium">
                              বল দেয়ালে মারলে যেমন ড্রপ খেয়ে লাফিয়ে ওঠে, তেমনি ق ط ب ج د হরফে জযম হলে আওয়াজ লাফিয়ে উঠবে!
                            </p>
                          </div>

                          {/* Bouncing Soccer Ball Interactive Feature */}
                          <div
                            onClick={() => {
                              setBallBouncing(true);
                              playItemSound({ ar: "أَبْ", sound: "أَبْ" });
                              setTimeout(() => setBallBouncing(false), 1200);
                            }}
                            className="w-32 h-32 rounded-3xl bg-white border-3 border-teal-400 shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition shrink-0 hover:scale-105 active:scale-95"
                            title="ক্লিক করে বলের মতো ক্বলক্বলা শোনো"
                          >
                            <span
                              className={`text-5xl select-none transition-transform ${
                                ballBouncing ? "animate-bounce" : ""
                              }`}
                            >
                              ⚽
                            </span>
                            <span className="text-[10px] font-black text-teal-900 mt-1 font-hind-siliguri">
                              ট্যাপ করে লাফাও
                            </span>
                          </div>
                        </div>

                        {/* 5 Qalqalah Letters Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" dir="rtl">
                          {currentClass.items.map((it, idx) => (
                            <div
                              key={it.id || idx}
                              onClick={() => playItemSound(it)}
                              className="p-4 rounded-3xl bg-white border-2 border-teal-200 hover:border-teal-500 hover:shadow-md cursor-pointer text-center space-y-2 group transition hover:-translate-y-1"
                            >
                              <div className="font-arabic text-4xl font-bold text-slate-900 group-hover:text-teal-700">
                                {it.ar}
                              </div>
                              <div className="text-xs font-black text-teal-950 font-hind-siliguri" dir="ltr">
                                {it.nameBn}
                              </div>
                              {it.tip && (
                                <div className="text-[10px] text-slate-500 font-hind-siliguri" dir="ltr">
                                  {it.tip}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (currentPage >= 56 && currentPage <= 65) ? (
                      /* ── TYPE F: BROKEN-DOWN SYLLABLES (PAGES 68-85 EXACT PDF STYLE) ── */
                      <div className="space-y-4">
                        <div className="text-xs font-black text-emerald-900 bg-emerald-100 px-3.5 py-1.5 rounded-2xl border border-emerald-300 inline-block font-hind-siliguri">
                          শব্দ ভেঙে ভেঙে পড়ি (ডান থেকে বামে)
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentClass.items.map((item, idx) => {
                            const isItemActive = activeItemId === item.id;
                            const brokenEntry =
                              BROKEN_SYLLABLES_DATA.fatiha_p1?.find((b) => b.word === item.ar) ||
                              BROKEN_SYLLABLES_DATA.surah_105?.find((b) => b.word === item.ar) ||
                              BROKEN_SYLLABLES_DATA.surah_112?.find((b) => b.word === item.ar);

                            return (
                              <div
                                key={item.id || idx}
                                className={`p-4 rounded-3xl border-3 transition-all space-y-3 bg-white ${
                                  isItemActive
                                    ? "border-emerald-500 shadow-lg ring-3 ring-emerald-300"
                                    : "border-slate-200 hover:border-emerald-300 shadow-2xs hover:-translate-y-1"
                                }`}
                              >
                                {/* Full Word Top Bar */}
                                <div
                                  onClick={() => playItemSound(item)}
                                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 cursor-pointer border border-emerald-200 transition"
                                >
                                  <span className="text-xs font-black text-emerald-900 font-hind-siliguri">
                                    পূর্ণ শব্দ: {item.nameBn}
                                  </span>
                                  <div className="font-arabic text-3xl font-bold text-slate-900" dir="rtl">
                                    {item.ar}
                                  </div>
                                </div>

                                {/* Broken Syllables Capsules (from PDF page 68-85) */}
                                {brokenEntry ? (
                                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1" dir="rtl">
                                    {brokenEntry.syllables.map((syl, sIdx) => {
                                      const isSylActive = activeItemId === syl.ar + sIdx;
                                      return (
                                        <div
                                          key={sIdx}
                                          onClick={() =>
                                            playItemSound({
                                              ar: syl.ar,
                                              sound: syl.sound,
                                              id: syl.ar + sIdx,
                                            })
                                          }
                                          className={`px-3 py-2 rounded-2xl border-2 cursor-pointer text-center transition flex flex-col items-center min-w-[55px] ${
                                            isSylActive
                                              ? "bg-rose-100 border-rose-500 shadow-md scale-110"
                                              : "bg-red-50/80 border-rose-300 hover:bg-rose-100 hover:border-rose-400 hover:scale-105"
                                          }`}
                                        >
                                          <span className="font-arabic text-xl font-bold text-slate-900">
                                            {syl.ar}
                                          </span>
                                          <span className="text-[11px] font-black text-rose-950 font-hind-siliguri mt-0.5">
                                            {syl.bn}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center text-xs text-slate-500 font-hind-siliguri font-medium">
                                    {item.tip}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* ── TYPE G: STANDARD COLOR-CODED LESSON CARDS GRID ── */
                      <div
                        className={`grid gap-3 sm:gap-4 ${
                          currentClass.items.length <= 4
                            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                            : currentClass.items.length <= 6
                            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
                            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                        }`}
                        dir="rtl"
                      >
                        {currentClass.items.map((item, idx) => {
                          const isItemActive = activeItemId === item.id;
                          return (
                            <div
                              key={item.id || idx}
                              onClick={() => playItemSound(item)}
                              className={`group relative p-4 sm:p-5 rounded-3xl border-3 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between min-h-[140px] text-center bg-white ${
                                isItemActive
                                  ? "border-emerald-600 ring-4 ring-emerald-300 shadow-xl scale-105 bg-emerald-50/50"
                                  : "border-slate-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-1"
                              }`}
                            >
                              <div className="w-full flex items-center justify-between text-xs text-slate-400">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                              </div>

                              <div
                                className={`my-auto font-arabic font-bold text-slate-900 transition-all ${
                                  item.ar.length > 20
                                    ? "text-xl sm:text-2xl leading-relaxed"
                                    : item.ar.length > 8
                                    ? "text-2xl sm:text-3xl"
                                    : "text-4xl sm:text-5xl"
                                } ${isItemActive ? "text-emerald-800 scale-105" : ""}`}
                              >
                                {item.ar}
                              </div>

                              <div className="mt-2" dir="ltr">
                                <div className="text-xs sm:text-sm font-black text-slate-800 font-hind-siliguri">
                                  {item.nameBn}
                                </div>
                                {item.tip && (
                                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-hind-siliguri">
                                    {item.tip}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── EXERCISE ROW: ✏️ অনুশীলনী ── */}
                    <div className="p-4 rounded-3xl bg-emerald-50/70 border-3 border-emerald-300 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm font-hind-siliguri">
                        <span>✏️</span>
                        <span>অনুশীলনী</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-emerald-900 font-medium font-hind-siliguri">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            ১
                          </span>
                          <span>আঙুল রেখে ডান থেকে বামে প্রতিটি হরফ ও শব্দ দেখে দেখে পড়ো।</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            ২
                          </span>
                          <span>প্রতিটি শব্দের উপরে ক্লিক করে ক্বারীর খাঁটি আওয়াজের সাথে মিলিয়ে নাও।</span>
                        </div>
                      </div>
                    </div>

                    {/* ── BOTTOM DUAL BOXES: আজ আমি পারলাম ⭐ & শিক্ষকের জন্য 👩‍🏫 ── */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                      <div
                        onClick={() => handleClaimStar(currentPage)}
                        className={`p-4 rounded-3xl border-3 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                          isClassStarEarned
                            ? "bg-amber-100 border-amber-400 text-amber-950 shadow-md scale-102"
                            : "bg-amber-50/50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:-translate-y-0.5"
                        }`}
                        title="তারা পেতে এখানে ক্লিক করো"
                      >
                        <Star
                          className={`w-9 h-9 transition-all ${
                            isClassStarEarned
                              ? "text-amber-500 fill-amber-400 scale-110"
                              : "text-amber-400 fill-transparent"
                          }`}
                        />
                        <div className="text-xs font-black font-hind-siliguri">
                          আজ আমি পারলাম
                        </div>
                        <div className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 shadow-2xs">
                          {isClassStarEarned ? "অর্জিত! ⭐" : "ক্লিক করে তারা নাও"}
                        </div>
                      </div>

                      <div className="md:col-span-3 p-4 rounded-3xl bg-slate-50 border-2 border-slate-200 text-slate-800 space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                          <span>👩‍🏫</span>
                          <span>শিক্ষকের জন্য (উস্তাদের পরামর্শ)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-hind-siliguri font-medium">
                          {currentClass.teacherNoteBn ||
                            "হরফের নাম ও মাখরাজ আলাদা করে শোনান। তাড়াহুড়ো না করে বিশুদ্ধ উচ্চারণে ছাত্রকে অভ্যস্ত করান।"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── FOOTER PAGE CONTROLS (DESKTOP BAR) ── */}
                  <div className="p-4 bg-slate-100 border-t border-slate-200 hidden sm:flex items-center justify-between text-xs font-bold text-slate-700">
                    <button
                      onClick={handlePrevPage}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-50 shadow-2xs transition hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>পূর্ববর্তী পাতা</span>
                    </button>

                    <div className="flex items-center gap-1.5 font-hind-siliguri">
                      <span>মক্তব শিক্ষা পাঠ্যপাঠিকা</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-emerald-800 font-black">
                        পৃষ্ঠা নং {currentPage + 7} (ক্লাস {currentClass.classNumberBn})
                      </span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= 78}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl transition shadow-md hover:scale-105 active:scale-95 ${
                        currentPage >= 78
                          ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-400"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <span>পরবর্তী পাতা</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW MODE B: CONTINUOUS SCROLL MODE (একটানা স্ক্রোল)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && viewMode === "scroll" && (
          <div className="space-y-8" ref={scrollContainerRef}>
            {/* Scroll Mode Sticky Helper */}
            <div className="p-3 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-between text-xs font-bold text-blue-950">
              <span className="flex items-center gap-1.5 font-hind-siliguri">
                <span>📜</span>
                <span>একটানা স্ক্রোল মোড: নিচে স্ক্রোল করে সব পাতা পড়ুন। যেকোনো হরফে ক্লিক করলেই আওয়াজ শুনবেন।</span>
              </span>
              <button
                onClick={() => handleSetViewMode("3d")}
                className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
              >
                ৩ডি বইয়ে ফিরুন ➔
              </button>
            </div>

            {/* Render 10 sequential classes around current page for smooth scroll */}
            {NOOR_QAIDA_CLASSES.slice(
              Math.max(0, (typeof currentPage === "number" ? currentPage : 1) - 4),
              Math.min(78, (typeof currentPage === "number" ? currentPage : 1) + 8)
            ).map((cls) => {
              const theme = PARVA_THEMES[cls.parvaNumber] || PARVA_THEMES[1];
              return (
                <div
                  key={cls.id}
                  id={`qaida-page-${cls.classNumber}`}
                  className="bg-white rounded-[2.5rem] border-4 border-slate-200 shadow-xl overflow-hidden scroll-mt-20"
                >
                  {/* Class Header */}
                  <div className={`p-4 sm:p-5 bg-gradient-to-r ${theme.headerBg} text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white text-emerald-950 flex flex-col items-center justify-center font-bold text-sm shadow-md border-2 border-amber-300">
                        <span className="text-[9px] text-slate-500">ক্লাস</span>
                        <span className="text-base font-black font-hind-siliguri -mt-1">{cls.classNumberBn}</span>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black font-hind-siliguri">{cls.titleBn}</h3>
                        <p className="text-xs text-emerald-100">{cls.parvaTitleBn}</p>
                      </div>
                    </div>
                    <span className="text-2xl">⭐</span>
                  </div>

                  {/* Objective */}
                  <div className="p-3.5 bg-amber-50 border-b border-amber-200 m-3 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <span><strong>আমি পারব:</strong> {cls.objectiveBn}</span>
                  </div>

                  {/* Items Grid */}
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3" dir="rtl">
                    {cls.items.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        onClick={() => playItemSound(it)}
                        className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 text-center cursor-pointer transition hover:shadow-md"
                      >
                        <div className="font-arabic text-3xl font-bold text-slate-900">{it.ar}</div>
                        <div className="text-xs font-bold text-slate-700 font-hind-siliguri mt-1" dir="ltr">{it.nameBn}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 2: মজার খেলা (GAMES 1, 2, 3, 4 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "game" && (
          <div className="bg-white rounded-[2.5rem] border-4 border-amber-400 shadow-xl p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              {[1, 2, 3, 4].map((gNum) => (
                <button
                  key={gNum}
                  onClick={() => setActiveGameId(gNum)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition ${
                    activeGameId === gNum
                      ? "bg-amber-400 text-slate-950 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🎮 মজার খেলা {gNum}
                </button>
              ))}
            </div>

            {/* Game 1: হরফ চিনি, রেখা টানি (Page 18) */}
            {activeGameId === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-hind-siliguri">
                    মজার খেলা ১: হরফ চিনি, নাম মেলাই
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    হরফে ক্লিক করে খাঁটি উচ্চারণ শোনো এবং ধাঁধাঁর উত্তর দাও!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPECIAL_PAGES[18].pairs.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: p.ar, sound: p.sound })}
                      className="p-4 rounded-3xl bg-amber-50/60 border-2 border-amber-300 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition space-y-1 hover:-translate-y-1"
                    >
                      <div className="font-arabic text-4xl font-bold text-slate-900">
                        {p.ar}
                      </div>
                      <div className="text-xs font-black text-amber-950 font-hind-siliguri">
                        {p.bn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Riddles: আমি কে? */}
                <div className="p-4 rounded-3xl bg-emerald-50 border-3 border-emerald-300 space-y-3">
                  <div className="text-sm font-black text-emerald-950 font-hind-siliguri">
                    ❓ আমি কে? (ধাঁধাঁ যাচাই)
                  </div>
                  <div className="space-y-2">
                    {SPECIAL_PAGES[18].riddles.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold"
                      >
                        <span className="text-slate-800">{r.q}</span>
                        <div className="flex items-center gap-1.5" dir="rtl">
                          {r.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                playItemSound({ ar: opt, sound: opt });
                                if (opt === r.correct) {
                                  setCelebrationToast("মাশাআল্লাহ! সঠিক উত্তর! ⭐");
                                  setTimeout(() => setCelebrationToast(null), 2500);
                                }
                              }}
                              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white font-arabic text-xl font-bold transition flex items-center justify-center border border-slate-300 active:scale-95"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game 2: হরকত চিনে রঙ করি (Page 39) */}
            {activeGameId === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-hind-siliguri">
                    মজার খেলা ২: হরকত চিনে রঙ করি
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    🔵 জবর (নীল), 🟠 যের (কমলা), 🟣 পেশ (বেগুনী) — ক্লিক করলেই উচ্চারণ শুনবে
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="rtl">
                  {SPECIAL_PAGES[39].items.map((it, idx) => {
                    const isJabar = it.expected === "jabar";
                    const isZer = it.expected === "zer";
                    return (
                      <div
                        key={idx}
                        onClick={() => playItemSound({ ar: it.ar, sound: it.ar })}
                        className={`p-4 rounded-3xl border-3 text-center cursor-pointer transition space-y-1 hover:-translate-y-1 ${
                          isJabar
                            ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                            : isZer
                            ? "bg-orange-50 border-orange-400 hover:bg-orange-100"
                            : "bg-purple-50 border-purple-400 hover:bg-purple-100"
                        }`}
                      >
                        <div className="font-arabic text-4xl font-bold text-slate-900">
                          {it.ar}
                        </div>
                        <div className="text-xs font-bold text-slate-700 font-hind-siliguri" dir="ltr">
                          {it.nameBn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game 3: নিয়ম-বিঙ্গো (Page 56) */}
            {activeGameId === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-teal-950 font-hind-siliguri">
                    মজার খেলা ৩: নিয়ম-বিঙ্গো 🎉
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    যেকোনো ঘরে ক্লিক করে ক্বারীর কণ্ঠ শোনো এবং তাজবীদ নিয়ম মিলিয়ে বিঙ্গো জেতো!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="rtl">
                  {SPECIAL_PAGES[56].bingoWords.map((w, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: w.ar, sound: w.sound })}
                      className="p-4 rounded-3xl bg-white border-2 border-teal-300 hover:border-teal-500 hover:bg-teal-50/60 shadow-xs cursor-pointer text-center space-y-1.5 transition hover:-translate-y-1"
                    >
                      <div className="font-arabic text-3xl font-bold text-slate-900">
                        {w.ar}
                      </div>
                      <div
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 font-hind-siliguri"
                        dir="ltr"
                      >
                        {w.rule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game 4: সূরাগুলো চিনি (Page 88) */}
            {activeGameId === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-red-950 font-hind-siliguri">
                    মজার খেলা ৪: শেষ ১০টি ছোট সূরা চিনি
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    প্রথম আয়াতে ক্লিক করে মিষ্টি তিলাওয়াত শোনো
                  </p>
                </div>

                <div className="space-y-2.5">
                  {SPECIAL_PAGES[88].surahs.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: s.firstAyah, ayahRef: s.ref })}
                      className="p-3.5 rounded-3xl bg-red-50/50 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-900 font-hind-siliguri">
                            {s.nameBn}
                          </div>
                          <div className="text-xs text-slate-500">
                            মোট আয়াত: {s.count}টি
                          </div>
                        </div>
                      </div>

                      <div className="font-arabic text-xl font-bold text-slate-800 text-right" dir="rtl">
                        {s.firstAyah}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 3: অগ্রগতি চার্ট (PAGE 102 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "chart" && (
          <div className="bg-white rounded-[2.5rem] border-4 border-emerald-400 shadow-xl p-5 sm:p-7 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black">
                <span>🏁</span>
                <span>অগ্রগতি চার্ট: ৭৮টি ক্লাসের যাত্রা</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-hind-siliguri">
                তোমার ১১টি পর্বের শিখন মাইলফলক
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                সম্পন্ন হয়েছে: {completedClasses.length}/৭৮টি ক্লাস ({completionPercent}%)
              </p>
            </div>

            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>

            <div className="space-y-5">
              {NOOR_QAIDA_PARVAS.map((parva) => {
                const parvaClasses = NOOR_QAIDA_CLASSES.filter(
                  (c) => c.parvaNumber === parva.parvaNumber
                );

                return (
                  <div key={parva.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{parva.emoji}</span>
                        <span>{parva.titleBn}</span>
                      </span>
                      <span className="text-slate-500">{parva.classesRangeBn}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {parvaClasses.map((cls) => {
                        const isDone = completedClasses.includes(cls.classNumber);
                        const isStar = earnedStars[cls.classNumber];

                        return (
                          <button
                            key={cls.id}
                            onClick={() => {
                              navigateToPage(cls.classNumber, "next");
                            }}
                            className={`w-9 h-9 rounded-full font-black text-xs transition-all flex items-center justify-center border-2 ${
                              isDone || isStar
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105"
                                : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400"
                            }`}
                            title={`ক্লাস ${cls.classNumber}: ${cls.titleBn}`}
                          >
                            {isStar ? "⭐" : cls.classNumberBn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 4: সনদপত্র (PAGE 103 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "certificate" && (
          <div className="bg-[#FFFDF7] rounded-[2.5rem] border-8 border-double border-amber-500 shadow-2xl p-6 sm:p-10 space-y-8 text-center relative overflow-hidden">
            <div className="text-amber-600 text-2xl select-none">
              🌙 ⭐ 🕌 ⭐ 🌙
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900 font-hind-siliguri tracking-wide">
                নূর কায়দা সনদপত্র
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium font-hind-siliguri">
                মক্তব শিক্ষা পাঠ্যপাঠিকা (হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত)
              </p>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 font-bold font-hind-siliguri">
                এই মর্মে সনদ প্রদান করা হলো যে,
              </p>
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleSaveStudentName(e.target.value)}
                className="text-xl sm:text-2xl font-black text-emerald-900 border-b-2 border-dashed border-amber-600 bg-transparent text-center focus:outline-none max-w-md w-full mx-auto"
                placeholder="শিক্ষার্থীর নাম লিখুন..."
              />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto pt-2 font-hind-siliguri">
                তিনি সফলভাবে <strong>মক্তব শিক্ষা পাঠ্যপাঠিকার ৭৮টি ক্লাস</strong> ও সকল মাখরাজ-তাজবীদ পাঠ সমাপ্ত করেছেন এবং নাজেরা কুরআন পাঠের যোগ্যতা অর্জন করেছেন।
              </p>
              <p className="text-xs sm:text-sm text-emerald-800 font-bold italic pt-1 font-hind-siliguri">
                আল্লাহ তা‘আলা তাঁর ইলমে বরকত দান করুন। আমীন।
              </p>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-4 text-xs font-bold text-slate-600 border-t border-amber-200">
              <div className="space-y-1">
                <div className="h-8 border-b border-slate-400 mx-4"></div>
                <span>শিক্ষকের স্বাক্ষর</span>
              </div>
              <div className="space-y-1">
                <div className="h-8 border-b border-slate-400 mx-4 flex items-center justify-center font-mono text-[11px] text-slate-800">
                  {new Date().toLocaleDateString("bn-BD")}
                </div>
                <span>তারিখ</span>
              </div>
              <div className="space-y-1">
                <div className="h-8 border-b border-slate-400 mx-4"></div>
                <span>মুহতামিম / প্রধান শিক্ষক</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-amber-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>সনদপত্র প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE PHONE STICKY BOTTOM TOOLBAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-emerald-300 px-3 py-2 sm:hidden flex items-center justify-between shadow-2xl">
        <button
          onClick={handlePrevPage}
          className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-xs active:scale-95 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>পূর্ববর্তী</span>
        </button>

        {/* Center Page Quick Jump Button */}
        <button
          onClick={() => setIsQuickJumpOpen(true)}
          className="flex flex-col items-center px-3 py-1 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold active:scale-95"
        >
          <span className="text-xs font-hind-siliguri">
            {getPageHeaderLabel()}
          </span>
          <span className="text-[9px] text-slate-500 font-bold">ট্যাপ করে পৃষ্ঠা বদলান ▾</span>
        </button>

        <button
          onClick={handleNextPage}
          className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs active:scale-95 shadow-md"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── QUICK JUMP SLIDER MODAL FOR MOBILE & DESKTOP ── */}
      {isQuickJumpOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border-2 border-emerald-400">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 font-hind-siliguri">
                দ্রুত পৃষ্ঠা বদলান
              </h3>
              <button
                onClick={() => setIsQuickJumpOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  navigateToPage("cover", "prev");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-900 border-2 border-emerald-300 text-center"
              >
                📕 প্রচ্ছদ
              </button>
              <button
                onClick={() => {
                  navigateToPage("rules", "next");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-amber-50 text-amber-900 border-2 border-amber-300 text-center"
              >
                📋 নিয়মাবলী
              </button>
              <button
                onClick={() => {
                  navigateToPage("color-code", "next");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-blue-50 text-blue-900 border-2 border-blue-300 text-center"
              >
                🎨 রঙ-সংকেত
              </button>
            </div>

            {/* Slider for Class 1 to 78 */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 font-hind-siliguri">
                <span>ক্লাস ১</span>
                <span className="text-emerald-700 font-black">
                  {typeof currentPage === "number" ? `ক্লাস ${currentPage}` : "ক্লাস নির্বাচন করুন"}
                </span>
                <span>ক্লাস ৭৮</span>
              </div>
              <input
                type="range"
                min="1"
                max="78"
                value={typeof currentPage === "number" ? currentPage : 1}
                onChange={(e) => {
                  navigateToPage(parseInt(e.target.value), "next");
                }}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsQuickJumpOpen(false);
                  setIsTocOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                সম্পূর্ণ সূচিপত্র দেখুন ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE OF CONTENTS (TOC) MODAL ── */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-emerald-400 overflow-hidden">
            <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black font-hind-siliguri">
                  নূর কায়দা — সূচিপত্র ও পাঠ নির্বাচন
                </h3>
                <p className="text-xs text-emerald-200 font-hind-siliguri">
                  ১১টি পর্ব • ৭৮টি ক্লাস • সম্পন্ন: {completedClasses.length}/৭৮
                </p>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/60 border-b border-emerald-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => {
                  navigateToPage("cover", "prev");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                📕 প্রচ্ছদ (পৃষ্ঠা ১)
              </button>
              <button
                onClick={() => {
                  navigateToPage("rules", "next");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                📋 পড়ার নিয়ম (পৃষ্ঠা ৩)
              </button>
              <button
                onClick={() => {
                  navigateToPage("color-code", "next");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                🎨 রঙ-সংকেত (পৃষ্ঠা ৫)
              </button>
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ক্লাস নম্বর বা বিষয় লিখে খুঁজুন..."
                  value={tocSearch}
                  onChange={(e) => setTocSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-100">
              {NOOR_QAIDA_CLASSES.filter(
                (c) =>
                  !tocSearch ||
                  c.titleBn.toLowerCase().includes(tocSearch.toLowerCase()) ||
                  c.classNumber.toString().includes(tocSearch)
              ).map((cls) => {
                const isCur = cls.classNumber === currentPage;
                const isDone = completedClasses.includes(cls.classNumber);

                return (
                  <div
                    key={cls.id}
                    onClick={() => {
                      navigateToPage(cls.classNumber, "next");
                      setIsTocOpen(false);
                    }}
                    className={`pt-1.5 first:pt-0 flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isCur
                        ? "bg-emerald-50 border-2 border-emerald-400 font-black text-emerald-950"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {cls.classNumberBn}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold font-hind-siliguri">
                          {cls.titleBn}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cls.parvaTitleBn} • পৃষ্ঠা {cls.classNumber + 7}
                        </div>
                      </div>
                    </div>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
