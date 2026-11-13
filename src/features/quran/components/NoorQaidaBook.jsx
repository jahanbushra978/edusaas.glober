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
  Sparkles, // Wait, remember rule: strict prohibition on Sparkles icon! We must NOT import Sparkles from lucide-react!
  Star,
  Check,
  Maximize2,
  Minimize2,
  HelpCircle,
  Trophy,
  ArrowRight,
  RefreshCw,
  Bookmark,
  Gamepad2,
  LayoutGrid,
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

export default function NoorQaidaBook({ initialClass = 1, onNavigateBack }) {
  // Navigation State
  const [currentPage, setCurrentPage] = useState(initialClass); // 1 to 78 or special pages
  const [activeTab, setActiveTab] = useState("class"); // 'class' | 'game' | 'chart' | 'certificate'
  const [activeGameId, setActiveGameId] = useState(1);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState("");
  const [selectedParvaFilter, setSelectedParvaFilter] = useState("all");

  // Playback & Sound State
  const [activeItemId, setActiveItemId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState(1);
  const playAllAbortRef = useRef(false);

  // Student Gamification & Star Collection
  const [completedClasses, setCompletedClasses] = useState([]);
  const [earnedStars, setEarnedStars] = useState({});
  const [celebrationToast, setCelebrationToast] = useState(null);
  const [studentName, setStudentName] = useState("মুহাম্মদ আবদুল্লাহ");

  // Load progress on mount
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem("noor_qaida_completed_classes");
      if (savedCompleted) setCompletedClasses(JSON.parse(savedCompleted));
      const savedStars = localStorage.getItem("noor_qaida_earned_stars");
      if (savedStars) setEarnedStars(JSON.parse(savedStars));
      const savedName = localStorage.getItem("noor_qaida_student_name");
      if (savedName) setStudentName(savedName);
    } catch { }
  }, []);

  // Save student name
  const handleSaveStudentName = (name) => {
    setStudentName(name);
    try {
      localStorage.setItem("noor_qaida_student_name", name);
    } catch { }
  };

  // Current Class & Parva Objects
  const currentClass = useMemo(
    () => getClassByNumber(currentPage),
    [currentPage]
  );
  const currentParva = useMemo(
    () => getParvaById(currentClass.parvaNumber),
    [currentClass.parvaNumber]
  );
  const parvaTheme = useMemo(
    () => PARVA_THEMES[currentClass.parvaNumber] || PARVA_THEMES[1],
    [currentClass.parvaNumber]
  );

  // Stop sound when page changes
  useEffect(() => {
    playAllAbortRef.current = true;
    setIsPlayingAll(false);
    setActiveItemId(null);
    universalAudioEngine.stop();
  }, [currentPage, activeTab]);

  // Audio Play Function for Any Item
  const playItemSound = async (item, speed = audioSpeed) => {
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
      setCelebrationToast(`মাশাআল্লাহ! ক্লাস ${classNum}-এর তারা অর্জিত হয়েছে!`);
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

  // Sequential Play All ("একটানা মাশক")
  const handlePlayAll = async () => {
    if (isPlayingAll) {
      playAllAbortRef.current = true;
      setIsPlayingAll(false);
      universalAudioEngine.stop();
      setActiveItemId(null);
      return;
    }

    setIsPlayingAll(true);
    playAllAbortRef.current = false;

    const items = currentClass.items;
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

  // Navigation handlers
  const handleNextPage = () => {
    if (currentPage < NOOR_QAIDA_CLASSES.length) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const isClassStarEarned = !!earnedStars[currentPage];
  const completionPercent = Math.round(
    (completedClasses.length / NOOR_QAIDA_CLASSES.length) * 100
  );

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-slate-800 font-sans select-none pb-24">
      {/* ── TOP PLATFORM NAVIGATION HUD ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/90 shadow-sm px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2.5">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                title="ফিরে যান"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📗</span>
                <h1 className="text-base sm:text-lg font-black text-emerald-950 font-hind-siliguri">
                  নূর কায়দা
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  মক্তব শিক্ষা পাঠ্যপাঠিকা (৭৮ ক্লাস)
                </span>
              </div>
            </div>
          </div>

          {/* Center / Right: Mode Switchers & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Switchers */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab("class")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === "class"
                    ? "bg-white text-emerald-900 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📖 বইয়ের পাঠ
              </button>
              <button
                onClick={() => setActiveTab("game")}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "game"
                    ? "bg-amber-400 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">মজার খেলা</span>
              </button>
              <button
                onClick={() => setActiveTab("chart")}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "chart"
                    ? "bg-emerald-600 text-white shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">অগ্রগতি</span>
              </button>
              <button
                onClick={() => setActiveTab("certificate")}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === "certificate"
                    ? "bg-purple-600 text-white shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সনদ</span>
              </button>
            </div>

            {/* TOC Modal Trigger */}
            <button
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-800 transition"
              title="সূচিপত্র খুলুন"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">সূচিপত্র</span>
              <span className="bg-emerald-900/60 text-[11px] px-1.5 py-0.5 rounded-md font-mono">
                {currentPage}/৭৮
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CELEBRATION TOAST ── */}
      {celebrationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white px-6 py-3 rounded-3xl shadow-2xl border-2 border-amber-300 flex items-center gap-3 animate-bounce">
          <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          <span className="text-sm font-black font-hind-siliguri">
            {celebrationToast}
          </span>
        </div>
      )}

      {/* ── MAIN BOOK CONTAINER (FAITHFUL TO 104-PAGE PDF) ── */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-5">
        {/* ══════════════════════════════════════════════════════════
            VIEW 1: CLASS / LESSON PAGE (PDF EXACT REPLICATION)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && (
          <div className="bg-white rounded-[2rem] border-4 border-slate-300 shadow-xl overflow-hidden transition-all duration-300">
            {/* ── PDF EXACT TOP HEADER BAR ── */}
            <div className={`p-4 sm:p-6 bg-gradient-to-r ${parvaTheme.headerBg} text-white relative flex items-center justify-between overflow-hidden shadow-inner`}>
              {/* Left: Round Class Badge + Titles */}
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                {/* Circular Class Badge (exact PDF circle inside rounded square) */}
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
                      <span className="hidden sm:inline text-xs text-amber-200 font-arabic font-medium" dir="rtl">
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

            {/* ── TARGET BANNER: 🎯 আমি পারব / আমি জানব (PDF EXACT YELLOW DASHED BOX) ── */}
            <div className="p-4 sm:p-5 bg-amber-50/90 border-b-2 border-dashed border-amber-400/90 m-4 sm:m-5 rounded-2xl flex items-start gap-3 shadow-2xs">
              <span className="text-2xl shrink-0 select-none">🎯</span>
              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-hind-siliguri">
                <strong className="font-black text-amber-900 text-sm mr-1.5">
                  আমি পারব:
                </strong>
                {currentClass.objectiveBn}
              </div>
            </div>

            {/* ── PLAY ALL & SPEED CONTROLS ROW ── */}
            <div className="px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-bold text-emerald-950">
                  যেকোনো হরফ, শব্দ বা সিলেবলে ক্লিক করলেই ক্বারীর খাঁটি তিলাওয়াত বাজবে
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed toggle */}
                <button
                  onClick={() => setAudioSpeed((s) => (s === 1.0 ? 0.75 : 1.0))}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-[11px]"
                  title="গতি পরিবর্তন"
                >
                  {audioSpeed === 0.75 ? "🐢 ০.৭৫x (ধীরে)" : "🐇 ১.০x (স্বাভাবিক)"}
                </button>

                {/* Repeat toggle */}
                <button
                  onClick={() => setRepeatMode((r) => (r === 1 ? 3 : 1))}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-[11px]"
                  title="পুনরাবৃত্তি সংখ্যা"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1 text-emerald-600" />
                  {repeatMode}x মাশক
                </button>

                {/* Play All Button */}
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
                      <span>একটানা সব শুনুন</span>
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
                  {/* Green Pill Subheader */}
                  <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm">
                    <span>আরবি বর্ণমালা — ২৯টি হরফ</span>
                    <span className="text-amber-200 font-black">
                      👉 আরবি পড়ি ডান দিক থেকে বাম দিকে 👈
                    </span>
                  </div>

                  {/* 29 Letters Grid (7 rows x 4 columns) */}
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
                    {currentClass.items.map((item, idx) => {
                      const isItemActive = activeItemId === (item.id || item.ar);
                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => playItemSound(item)}
                          className={`group relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center select-none ${
                            isItemActive
                              ? "bg-emerald-100 border-emerald-600 ring-4 ring-emerald-400 shadow-xl scale-105"
                              : "bg-[#FBFDFB] border-emerald-200 hover:border-emerald-500 hover:bg-white hover:shadow-md"
                          }`}
                        >
                          <div
                            className={`font-arabic text-4xl sm:text-5xl font-bold transition-all ${
                              isItemActive
                                ? "text-emerald-800 scale-110"
                                : "text-slate-900 group-hover:text-emerald-700"
                            }`}
                          >
                            {item.ar}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-700 mt-2 font-hind-siliguri">
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
              ) : currentPage === 16 ? (
                /* ── TYPE B: CLASS 16 (জবরের পরিচয় — 3 QUESTIONS + 4 CARDS) ── */
                <div className="space-y-6">
                  {/* Big Card: জবর চিনি (The large Alif with Jabar) */}
                  <div className="border-3 border-blue-300 rounded-3xl p-5 sm:p-6 bg-blue-50/40 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Big Letter Card */}
                    <div
                      onClick={() => playItemSound({ ar: "اَ", sound: "اَ" })}
                      className="w-40 h-44 rounded-2xl bg-white border-2 border-blue-400 shadow-md flex items-center justify-center cursor-pointer hover:border-blue-600 hover:scale-105 transition"
                    >
                      <div className="font-arabic text-7xl font-bold text-slate-900">
                        اَ
                      </div>
                    </div>

                    {/* 3 Interactive Question Cards (from PDF page 24) */}
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

                  {/* 4 Cards: এই চারটি হরফে জবর (اَ بَ تَ ثَ) */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 inline-block">
                      এই চারটি হরফে জবর
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" dir="rtl">
                      {currentClass.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          onClick={() => playItemSound(it)}
                          className="p-4 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-500 hover:shadow-md cursor-pointer text-center space-y-2 group"
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
                /* ── TYPE C: CLASS 18 (জবর: দুই হরফ মিলাই + মদ-এর ছোট্ট ধারণা) ── */
                <div className="space-y-6">
                  {/* Two Letters Equation Card: বা তা -> بَتَ */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border-2 border-blue-300 text-center font-bold">
                    <div className="text-xs text-blue-700 mb-2">দুই হরফ জবর দিয়ে মিলাই</div>
                    <div className="font-arabic text-3xl sm:text-4xl text-blue-950 flex items-center justify-center gap-4">
                      <span>بَتَ</span>
                      <span>=</span>
                      <span>تَ</span>
                      <span>+</span>
                      <span>بَ</span>
                    </div>
                  </div>

                  {/* মদ-এর ছোট্ট ধারণা 🌟 (PDF page 26 exact box) */}
                  <div className="border-3 border-amber-300 rounded-3xl p-5 bg-gradient-to-r from-amber-50 to-orange-50 space-y-3">
                    <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                      <span>মদ-এর ছোট্ট ধারণা</span>
                      <span className="text-amber-500">🌟</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1 Harakat */}
                      <div
                        onClick={() => playItemSound({ ar: "بَ", sound: "بَ" })}
                        className="p-4 rounded-2xl bg-white border-2 border-amber-200 cursor-pointer hover:border-amber-400 text-center space-y-1"
                      >
                        <div className="font-arabic text-4xl font-bold text-slate-900">بَ</div>
                        <div className="text-xs font-bold text-amber-900">ছোট আওয়াজ • ১ হরকত</div>
                        <div className="text-xs text-slate-500">✊ → ✋ (১ বার হাত বন্ধ ও খোলা)</div>
                      </div>

                      {/* 2 Harakat */}
                      <div
                        onClick={() => playItemSound({ ar: "بَا", sound: "بَا" })}
                        className="p-4 rounded-2xl bg-white border-2 border-amber-300 cursor-pointer hover:border-amber-500 text-center space-y-1"
                      >
                        <div className="font-arabic text-4xl font-bold text-slate-900">بَا</div>
                        <div className="text-xs font-bold text-amber-900">টানা আওয়াজ • ২ হরকত</div>
                        <div className="text-xs text-slate-500">✊✋ ✊✋ (২ বার হাত বন্ধ ও খোলা)</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800 text-center">
                      জবরের পরে আলিফ থাকলে আওয়াজ একটু টেনে পড়তে হয়—একে বলে মদ।
                    </p>
                  </div>

                  {/* Practice row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentClass.items.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        onClick={() => playItemSound(it)}
                        className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-400 text-center cursor-pointer group"
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
              ) : (currentPage >= 56 && currentPage <= 65) || (currentPage >= 19 && currentPage <= 20) ? (
                /* ── TYPE D: BROKEN-DOWN SYLLABLES (PAGES 68-85 EXACT PDF STYLE) ── */
                <div className="space-y-4">
                  <div className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 inline-block">
                    শব্দ ভেঙে ভেঙে পড়ি (ডান থেকে বামে)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentClass.items.map((item, idx) => {
                      const isItemActive = activeItemId === item.id;
                      // Check if broken syllables data exists
                      const brokenEntry = BROKEN_SYLLABLES_DATA.fatiha_p1?.find((b) => b.word === item.ar) ||
                        BROKEN_SYLLABLES_DATA.surah_105?.find((b) => b.word === item.ar) ||
                        BROKEN_SYLLABLES_DATA.surah_112?.find((b) => b.word === item.ar);

                      return (
                        <div
                          key={item.id || idx}
                          className={`p-4 rounded-3xl border-2 transition-all space-y-3 bg-white ${
                            isItemActive
                              ? "border-emerald-500 shadow-lg ring-3 ring-emerald-300"
                              : "border-slate-200 hover:border-emerald-300 shadow-2xs"
                          }`}
                        >
                          {/* Full Word Top Bar */}
                          <div
                            onClick={() => playItemSound(item)}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 cursor-pointer border border-emerald-200 transition"
                          >
                            <span className="text-xs font-bold text-emerald-800 font-hind-siliguri">
                              পূর্ণ শব্দ: {item.nameBn}
                            </span>
                            <div className="font-arabic text-3xl font-bold text-slate-900" dir="rtl">
                              {item.ar}
                            </div>
                          </div>

                          {/* Broken Syllables Capsules (from PDF page 68-85) */}
                          {brokenEntry ? (
                            <div className="flex items-center justify-center gap-2 pt-1" dir="rtl">
                              {brokenEntry.syllables.map((syl, sIdx) => {
                                const isSylActive = activeItemId === (syl.ar + sIdx);
                                return (
                                  <div
                                    key={sIdx}
                                    onClick={() => playItemSound({ ar: syl.ar, sound: syl.sound, id: syl.ar + sIdx })}
                                    className={`px-3 py-2 rounded-2xl border-2 cursor-pointer text-center transition flex flex-col items-center min-w-[55px] ${
                                      isSylActive
                                        ? "bg-rose-100 border-rose-500 shadow-md scale-110"
                                        : "bg-red-50/80 border-rose-300 hover:bg-rose-100 hover:border-rose-400"
                                    }`}
                                  >
                                    <span className="font-arabic text-xl font-bold text-slate-900">
                                      {syl.ar}
                                    </span>
                                    <span className="text-[11px] font-bold text-rose-950 font-hind-siliguri mt-0.5">
                                      {syl.bn}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center text-xs text-slate-500">
                              {item.tip}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ── TYPE E: STANDARD COLOR-CODED LESSON CARDS GRID ── */
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
                        className={`group relative p-4 sm:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between min-h-[140px] text-center bg-white ${
                          isItemActive
                            ? "border-emerald-600 ring-4 ring-emerald-300 shadow-xl scale-105 bg-emerald-50/50"
                            : "border-slate-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Audio Icon Header */}
                        <div className="w-full flex items-center justify-between text-xs text-slate-400">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        </div>

                        {/* Arabic Calligraphy */}
                        <div
                          className={`my-auto font-arabic font-bold text-slate-900 transition-all ${
                            item.ar.length > 20
                              ? "text-xl sm:text-2xl leading-relaxed"
                              : item.ar.length > 8
                              ? "text-2xl sm:text-3xl"
                              : "text-4xl sm:text-5xl"
                          } ${
                            isItemActive ? "text-emerald-800 scale-105" : ""
                          }`}
                        >
                          {item.ar}
                        </div>

                        {/* Bengali subtitle */}
                        <div className="mt-2" dir="ltr">
                          <div className="text-xs sm:text-sm font-bold text-slate-800 font-hind-siliguri">
                            {item.nameBn}
                          </div>
                          {item.tip && (
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.tip}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── EXERCISE ROW: ✏️ অনুশীলনী (PDF EXACT SECTION) ── */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm font-hind-siliguri">
                  <span>✏️</span>
                  <span>অনুশীলনী</span>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-900 font-medium">
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

              {/* ── BOTTOM DUAL BOXES: আজ আমি পারলাম ⭐ & শিক্ষকের জন্য 👩‍🏫 (PDF EXACT) ── */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {/* Left Box: আজ আমি পারলাম ⭐ */}
                <div
                  onClick={() => handleClaimStar(currentPage)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                    isClassStarEarned
                      ? "bg-amber-100 border-amber-400 text-amber-950 shadow-md scale-102"
                      : "bg-amber-50/50 border-amber-300 text-amber-900 hover:bg-amber-100"
                  }`}
                  title="তারা পেতে এখানে ক্লিক করো"
                >
                  <Star
                    className={`w-8 h-8 transition-all ${
                      isClassStarEarned
                        ? "text-amber-500 fill-amber-400 animate-spin-slow scale-110"
                        : "text-amber-400 fill-transparent"
                    }`}
                  />
                  <div className="text-xs font-black font-hind-siliguri">
                    আজ আমি পারলাম
                  </div>
                  <div className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900">
                    {isClassStarEarned ? "অর্জিত! ⭐" : "ক্লিক করে তারা নাও"}
                  </div>
                </div>

                {/* Right Box: শিক্ষকের জন্য নির্দেশিকা (PDF EXACT) */}
                <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <span>👩‍🏫</span>
                    <span>শিক্ষকের জন্য (ছাত্র এই অংশ না পড়লেও চলবে)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-hind-siliguri">
                    {currentClass.teacherNoteBn ||
                      "হরফের নাম ও মাখরাজ আলাদা করে শোনান। তাড়াহুড়ো না করে বিশুদ্ধ উচ্চারণে ছাত্রকে অভ্যস্ত করান।"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── FOOTER PAGE CONTROLS (PREVIOUS & NEXT PAGE) ── */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  currentPage <= 1
                    ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী ক্লাস</span>
              </button>

              <div className="flex items-center gap-1.5 font-hind-siliguri">
                <span>মক্তব শিক্ষা পাঠ্যপাঠিকা</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-emerald-800">
                  পৃষ্ঠা নং {currentPage + 7} (ক্লাস {currentClass.classNumberBn})
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= NOOR_QAIDA_CLASSES.length}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  currentPage >= NOOR_QAIDA_CLASSES.length
                    ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                }`}
              >
                <span>পরবর্তী ক্লাস</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 2: মজার খেলা (GAMES 1, 2, 3, 4 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "game" && (
          <div className="bg-white rounded-[2rem] border-4 border-amber-400 shadow-xl p-5 sm:p-7 space-y-6">
            {/* Game Selector Tabs */}
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
                  <p className="text-xs text-slate-600">
                    হরফে ক্লিক করে খাঁটি উচ্চারণ শোনো এবং ধাঁধাঁর উত্তর দাও!
                  </p>
                </div>

                {/* 8 Pairs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPECIAL_PAGES[18].pairs.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: p.ar, sound: p.sound })}
                      className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-300 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition space-y-1"
                    >
                      <div className="font-arabic text-4xl font-bold text-slate-900">
                        {p.ar}
                      </div>
                      <div className="text-xs font-bold text-amber-950 font-hind-siliguri">
                        {p.bn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Riddles: আমি কে? */}
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3">
                  <div className="text-sm font-black text-emerald-950">
                    ❓ আমি কে? (ধাঁধাঁ যাচাই)
                  </div>
                  <div className="space-y-2">
                    {SPECIAL_PAGES[18].riddles.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
                        <span className="text-slate-800">{r.q}</span>
                        <div className="flex items-center gap-1.5" dir="rtl">
                          {r.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                playItemSound({ ar: opt, sound: opt });
                                if (opt === r.correct) {
                                  setCelebrationToast("মাশাআল্লাহ! সঠিক উত্তর!");
                                  setTimeout(() => setCelebrationToast(null), 2500);
                                }
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white font-arabic text-lg font-bold transition flex items-center justify-center border border-slate-300"
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
                  <p className="text-xs text-slate-600">
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
                        className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition space-y-1 ${
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
                  <p className="text-xs text-slate-600">
                    যেকোনো ঘরে ক্লিক করে ক্বারীর কণ্ঠ শোনো এবং তাজবীদ নিয়ম মিলিয়ে বিঙ্গো জেতো!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="rtl">
                  {SPECIAL_PAGES[56].bingoWords.map((w, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: w.ar, sound: w.sound })}
                      className="p-4 rounded-2xl bg-white border-2 border-teal-300 hover:border-teal-500 hover:bg-teal-50/60 shadow-xs cursor-pointer text-center space-y-1.5 transition"
                    >
                      <div className="font-arabic text-3xl font-bold text-slate-900">
                        {w.ar}
                      </div>
                      <div className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 font-hind-siliguri" dir="ltr">
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
                  <p className="text-xs text-slate-600">
                    প্রথম আয়াতে ক্লিক করে মিষ্টি তিলাওয়াত শোনো
                  </p>
                </div>

                <div className="space-y-2.5">
                  {SPECIAL_PAGES[88].surahs.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: s.firstAyah, ayahRef: s.ref })}
                      className="p-3.5 rounded-2xl bg-red-50/50 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
          <div className="bg-white rounded-[2rem] border-4 border-emerald-400 shadow-xl p-5 sm:p-7 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black">
                <span>🏁</span>
                <span>অগ্রগতি চার্ট: ৭৮টি ক্লাসের যাত্রা</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-hind-siliguri">
                তোমার ৭টি পর্বের শিখন মাইলফলক
              </h3>
              <p className="text-xs text-slate-600">
                সম্পন্ন হয়েছে: {completedClasses.length}/৭৮টি ক্লাস ({completionPercent}%)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>

            {/* 11 Parvas Milestone Rows */}
            <div className="space-y-5">
              {NOOR_QAIDA_PARVAS.map((parva) => {
                const parvaClasses = NOOR_QAIDA_CLASSES.filter(
                  (c) => c.parvaNumber === parva.parvaNumber
                );

                return (
                  <div key={parva.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{parva.emoji}</span>
                        <span>{parva.titleBn}</span>
                      </span>
                      <span className="text-slate-500">{parva.classesRangeBn}</span>
                    </div>

                    {/* Circular class buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {parvaClasses.map((cls) => {
                        const isDone = completedClasses.includes(cls.classNumber);
                        const isStar = earnedStars[cls.classNumber];

                        return (
                          <button
                            key={cls.id}
                            onClick={() => {
                              setCurrentPage(cls.classNumber);
                              setActiveTab("class");
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
          <div className="bg-[#FFFDF7] rounded-[2rem] border-8 border-double border-amber-500 shadow-2xl p-6 sm:p-10 space-y-8 text-center relative overflow-hidden">
            {/* Top decorative header */}
            <div className="text-amber-600 text-2xl select-none">
              🌙 ⭐ 🕌 ⭐ 🌙
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900 font-hind-siliguri tracking-wide">
                নূর কায়দা সনদপত্র
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                মক্তব শিক্ষা পাঠ্যপাঠিকা (হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত)
              </p>
            </div>

            {/* Recipient Box */}
            <div className="py-4 space-y-3">
              <p className="text-xs sm:text-sm text-slate-700 font-bold">
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
              <p className="text-xs sm:text-sm text-emerald-800 font-bold italic pt-1">
                আল্লাহ তা‘আলা তাঁর ইলমে বরকত দান করুন। আমীন।
              </p>
            </div>

            {/* Signatures */}
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

            {/* Print Button */}
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

      {/* ── TABLE OF CONTENTS (TOC) MODAL ── */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-emerald-400 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black font-hind-siliguri">
                  নূর কায়দা — সূচিপত্র ও ক্লাস নির্বাচন
                </h3>
                <p className="text-xs text-emerald-200">
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

            {/* Search */}
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

            {/* List */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-100">
              {NOOR_QAIDA_CLASSES.filter((c) =>
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
                      setCurrentPage(cls.classNumber);
                      setActiveTab("class");
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
                        <div className="text-xs sm:text-sm font-bold">
                          {cls.titleBn}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cls.parvaTitleBn}
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
