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
  BookCheck,
  Layers,
  Printer,
  X,
  Info,
  GraduationCap,
  Volume1,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  NOOR_QAIDA_PARVAS,
  NOOR_QAIDA_CLASSES,
  getClassByNumber,
  getParvaById,
} from "../data/noorQaidaCurriculumData";
import { universalAudioEngine } from "@/lib/quran/audio";

export default function NoorQaidaBook({ initialClass = 1, onNavigateBack }) {
  // Navigation State
  const [currentClassNum, setCurrentClassNum] = useState(initialClass);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState("");
  const [selectedParvaFilter, setSelectedParvaFilter] = useState("all");

  // Audio Playback State
  const [activeItemId, setActiveItemId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0); // 1.0x or 0.75x
  const [repeatMode, setRepeatMode] = useState(1); // 1x or 3x
  const [isMuted, setIsMuted] = useState(false);

  // Settings & View State
  const [showTeacherNotes, setShowTeacherNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [celebrationBanner, setCelebrationBanner] = useState(false);

  // Current Class & Parva Objects
  const currentClass = useMemo(
    () => getClassByNumber(currentClassNum),
    [currentClassNum]
  );
  const currentParva = useMemo(
    () => getParvaById(currentClass.parvaNumber),
    [currentClass.parvaNumber]
  );

  // Cancel any ongoing sequence when changing class or unmounting
  const playAllAbortRef = useRef(false);

  // Load completed classes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("noor_qaida_completed_classes");
      if (saved) {
        setCompletedClasses(JSON.parse(saved));
      }
    } catch { }
  }, []);

  // Save completed classes to localStorage
  const toggleClassCompleted = (classNum) => {
    setCompletedClasses((prev) => {
      let updated;
      if (prev.includes(classNum)) {
        updated = prev.filter((c) => c !== classNum);
      } else {
        updated = [...prev, classNum];
        // Trigger celebratory banner if finishing class
        setCelebrationBanner(true);
        setTimeout(() => setCelebrationBanner(false), 4000);
      }
      try {
        localStorage.setItem("noor_qaida_completed_classes", JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  // Stop all audio on class change
  useEffect(() => {
    playAllAbortRef.current = true;
    setIsPlayingAll(false);
    setActiveItemId(null);
    universalAudioEngine.stop();
  }, [currentClassNum]);

  // Clean audio play function
  const playItemSound = async (item, speed = audioSpeed) => {
    if (isMuted) return;
    setActiveItemId(item.id);

    try {
      if (item.ayahRef) {
        await universalAudioEngine.playAyah(
          item.ayahRef.surah,
          item.ayahRef.ayah,
          "alafasy",
          { rate: speed }
        );
      } else if (item.audioUrl) {
        await universalAudioEngine.playWord(item.audioUrl, { rate: speed });
      } else {
        await universalAudioEngine.playArabicSound(item.sound || item.ar, {
          rate: speed,
        });
      }
    } catch (err) {
      console.warn("Audio play error:", err);
    } finally {
      setActiveItemId((curr) => (curr === item.id ? null : curr));
    }
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
        setActiveItemId(item.id);

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

        // Short breathing pause between cards (400ms)
        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setIsPlayingAll(false);
    setActiveItemId(null);
  };

  // Class Jump & Navigation Handlers
  const handleNextClass = () => {
    if (currentClassNum < NOOR_QAIDA_CLASSES.length) {
      setCurrentClassNum((prev) => prev + 1);
    }
  };

  const handlePrevClass = () => {
    if (currentClassNum > 1) {
      setCurrentClassNum((prev) => prev - 1);
    }
  };

  const handleSelectClass = (num) => {
    setCurrentClassNum(num);
    setIsTocOpen(false);
  };

  // Filtered classes for the TOC modal
  const filteredClasses = useMemo(() => {
    return NOOR_QAIDA_CLASSES.filter((c) => {
      const matchesParva =
        selectedParvaFilter === "all" ||
        c.parvaNumber === Number(selectedParvaFilter);
      const matchesSearch =
        !tocSearch.trim() ||
        c.titleBn.toLowerCase().includes(tocSearch.toLowerCase()) ||
        c.classNumber.toString().includes(tocSearch) ||
        c.objectiveBn.toLowerCase().includes(tocSearch.toLowerCase());
      return matchesParva && matchesSearch;
    });
  }, [selectedParvaFilter, tocSearch]);

  const isCurrentCompleted = completedClasses.includes(currentClassNum);
  const completionPercentage = Math.round(
    (completedClasses.length / NOOR_QAIDA_CLASSES.length) * 100
  );

  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] text-slate-800 transition-all duration-300 font-sans ${
        isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : "relative"
      }`}
    >
      {/* ── TOP STICKY APP BAR ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Branding & Back Button */}
          <div className="flex items-center gap-3">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="ফিরে যান"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-950 font-hind-siliguri">
                    নূর কায়দা
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    মক্তব শিক্ষা পাঠ্যপাঠিকা
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত • ৭৮টি ক্লাস
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2">
            {/* Speed Toggle (0.75x vs 1.0x) */}
            <button
              onClick={() => setAudioSpeed((s) => (s === 1.0 ? 0.75 : 1.0))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                audioSpeed === 0.75
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-inner"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title="উচ্চারণের গতি পরিবর্তন করুন"
            >
              {audioSpeed === 0.75 ? "🐢 ০.৭৫x (ধীরে)" : "🐇 ১.০x (স্বাভাবিক)"}
            </button>

            {/* Repeat Toggle */}
            <button
              onClick={() => setRepeatMode((m) => (m === 1 ? 3 : 1))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                repeatMode === 3
                  ? "bg-purple-100 text-purple-900 border-purple-300"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title="মাশক পুনরাবৃত্তি সংখ্যা"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              {repeatMode}x মাশক
            </button>

            {/* TOC Drawer Trigger */}
            <button
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span>সূচিপত্র</span>
              <span className="hidden md:inline bg-emerald-800/60 px-1.5 py-0.5 rounded text-[11px]">
                {currentClassNum}/৭৮
              </span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors hidden sm:inline-flex"
              title={isFullscreen ? "স্বাভাবিক ভিউ" : "ফুলস্ক্রিন"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── CELEBRATION TOAST ── */}
      {celebrationBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 animate-bounce">
          <Award className="w-6 h-6 text-amber-300" />
          <div className="text-sm font-bold">
            مَا شَاءَ اللَّهُ! ক্লাস {currentClass.classNumberBn} সফলভাবে সম্পন্ন হয়েছে!
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* ── PARVA & CLASS HEADER BANNER (PDF DESIGN) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-200/90 shadow-sm relative overflow-hidden">
          {/* Subtle Decorative Arabic Calligraphy Watermark */}
          <div className="absolute -right-6 -bottom-8 select-none pointer-events-none opacity-5 font-arabic text-8xl text-emerald-950">
            نور
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              {/* Parva Tag & Class Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span className="text-base">{currentParva.emoji}</span>
                  {currentParva.titleBn}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  ক্লাস নং {currentClass.classNumberBn} (মোট ৭৮)
                </span>
                {isCurrentCompleted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    সম্পন্ন
                  </span>
                )}
              </div>

              {/* Class Titles */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-hind-siliguri">
                {currentClass.titleBn}
              </h2>
              {currentClass.titleAr && (
                <p className="text-lg text-emerald-800 font-arabic font-medium" dir="rtl">
                  {currentClass.titleAr}
                </p>
              )}
            </div>

            {/* Play All & Completion Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={handlePlayAll}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md transition-all ${
                  isPlayingAll
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/20"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20"
                }`}
              >
                {isPlayingAll ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>থামুন</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>একটানা সব শুনুন</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleClassCompleted(currentClassNum)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isCurrentCompleted
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                title={isCurrentCompleted ? "সম্পন্ন বাতিল করুন" : "ক্লাসটি সম্পন্ন হিসেবে চিহ্নিত করুন"}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Objective Banner (🎯 আমি পারব:) */}
          <div className="mt-4 pt-4 border-t border-amber-100 flex items-start gap-3 bg-amber-50/70 p-3.5 rounded-2xl">
            <span className="text-lg select-none">🎯</span>
            <div className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              <strong className="font-bold text-amber-900 mr-1.5">
                আমি পারব:
              </strong>
              {currentClass.objectiveBn}
            </div>
          </div>
        </section>

        {/* ── COLOR CODE LEGEND (FOR HARAKAT, JABAR, ZER, PESH) ── */}
        {currentClass.parvaNumber === 3 && (
          <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
            <span className="text-slate-400">রঙের নির্দেশিকা:</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              🔵 জবর (আওয়াজ: আ)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              🟠 যের (আওয়াজ: ই)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              🟣 পেশ (আওয়াজ: উ)
            </span>
          </div>
        )}

        {/* ── INTERACTIVE ARABIC PRACTICE GRID (CLICK TO RECITE!) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>যেকোনো হরফ বা শব্দের উপরে ক্লিক করলেই ক্বারীর তিলাওয়াত বাজবে</span>
            </div>
            <span>মোট {currentClass.items.length}টি অংশ</span>
          </div>

          <div
            className={`grid gap-4 sm:gap-5 ${
              currentClass.items.length <= 4
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
                : currentClass.items.length <= 6
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            }`}
          >
            {currentClass.items.map((item, idx) => {
              const isItemActive = activeItemId === item.id;

              // Tag badge color styling
              let tagBadgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
              if (item.tag === "jabar") {
                tagBadgeStyle = "bg-blue-50 text-blue-800 border-blue-300";
              } else if (item.tag === "zer") {
                tagBadgeStyle = "bg-orange-50 text-orange-800 border-orange-300";
              } else if (item.tag === "pesh") {
                tagBadgeStyle = "bg-purple-50 text-purple-800 border-purple-300";
              } else if (item.tag === "tanween" || item.tag === "madd") {
                tagBadgeStyle = "bg-pink-50 text-pink-800 border-pink-300";
              } else if (item.tag === "qalqalah") {
                tagBadgeStyle = "bg-cyan-50 text-cyan-800 border-cyan-300";
              } else if (item.tag === "tashdid") {
                tagBadgeStyle = "bg-teal-50 text-teal-800 border-teal-300";
              } else if (item.tag === "waqf") {
                tagBadgeStyle = "bg-rose-50 text-rose-800 border-rose-300";
              }

              return (
                <div
                  key={item.id || idx}
                  onClick={() => playItemSound(item)}
                  className={`group relative bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between min-h-[170px] select-none text-center ${
                    isItemActive
                      ? "border-emerald-500 shadow-xl shadow-emerald-600/20 ring-4 ring-emerald-400/40 scale-105 bg-emerald-50/40"
                      : "border-slate-200/90 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1"
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.ar} - ${item.nameBn}`}
                >
                  {/* Top Header inside card: Index and Sound Icon */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                      {idx + 1}
                    </span>
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        isItemActive
                          ? "bg-emerald-600 text-white animate-pulse"
                          : "text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50"
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Large Crisp Arabic Calligraphy */}
                  <div
                    className={`my-auto font-arabic font-bold text-slate-900 transition-all ${
                      item.ar.length > 25
                        ? "text-xl sm:text-2xl leading-loose"
                        : item.ar.length > 10
                        ? "text-2xl sm:text-3xl leading-relaxed"
                        : "text-4xl sm:text-5xl"
                    } ${
                      isItemActive
                        ? "text-emerald-700 scale-110 drop-shadow-sm"
                        : "group-hover:text-emerald-800"
                    }`}
                    dir="rtl"
                  >
                    {item.ar}
                  </div>

                  {/* Bengali Phonetic Subtitle */}
                  <div className="mt-3 w-full">
                    <div className="font-bold text-sm sm:text-base text-slate-800 font-hind-siliguri group-hover:text-emerald-950 transition-colors">
                      {item.nameBn}
                    </div>
                    {item.tip && (
                      <div className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {item.tip}
                      </div>
                    )}
                  </div>

                  {/* Active playing indicator badge */}
                  {isItemActive && (
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md animate-fade-in flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      বাজছে...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TEACHER'S PEDAGOGICAL NOTES (PDF DIRECT GUIDE) ── */}
        {currentClass.teacherNoteBn && (
          <section className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-3xl p-5 sm:p-6 border-2 border-emerald-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                <span>শিক্ষকের জন্য পাঠ্য নির্দেশিকা (Teacher's Guide)</span>
              </div>
              <button
                onClick={() => setShowTeacherNotes((v) => !v)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                {showTeacherNotes ? "লুকান" : "দেখুন"}
              </button>
            </div>

            {showTeacherNotes && (
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-hind-siliguri">
                {currentClass.teacherNoteBn}
              </p>
            )}
          </section>
        )}

        {/* ── BOTTOM CLASS NAVIGATION CONTROLS ── */}
        <nav className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handlePrevClass}
            disabled={currentClassNum <= 1}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
              currentClassNum <= 1
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-emerald-400 shadow-sm"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী ক্লাস</span>
          </button>

          <button
            onClick={() => setIsTocOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            ক্লাস {currentClass.classNumberBn} / ৭৮ (সূচিপত্র)
          </button>

          <button
            onClick={handleNextClass}
            disabled={currentClassNum >= NOOR_QAIDA_CLASSES.length}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
              currentClassNum >= NOOR_QAIDA_CLASSES.length
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <span>পরবর্তী ক্লাস</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </main>

      {/* ── TOC / CLASS SELECTOR MODAL (11 PARVAS & 78 CLASSES) ── */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-emerald-300 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">নূর কায়দা — সূচিপত্র ও ক্লাস নির্বাচন</h3>
                  <p className="text-xs text-emerald-100">
                    ১১টি পর্ব • ৭৮টি ক্লাস • সম্পন্ন: {completedClasses.length}/৭৮ ({completionPercentage}%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ক্লাস নম্বর, বিষয়বস্তু বা হরকত লিখে খুঁজুন..."
                  value={tocSearch}
                  onChange={(e) => setTocSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Parva Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedParvaFilter("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedParvaFilter === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  সকল পর্ব (১১টি)
                </button>
                {NOOR_QAIDA_PARVAS.map((parva) => (
                  <button
                    key={parva.id}
                    onClick={() => setSelectedParvaFilter(parva.parvaNumber.toString())}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      selectedParvaFilter === parva.parvaNumber.toString()
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{parva.emoji}</span>
                    <span>পর্ব {parva.parvaNumberBn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Classes List */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100 flex-1">
              {filteredClasses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  কোনো ক্লাস খুঁজে পাওয়া যায়নি
                </div>
              ) : (
                filteredClasses.map((cls) => {
                  const isCurrent = cls.classNumber === currentClassNum;
                  const isCompleted = completedClasses.includes(cls.classNumber);

                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleSelectClass(cls.classNumber)}
                      className={`pt-2.5 first:pt-0 flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent
                              ? "bg-emerald-600 text-white shadow-md"
                              : isCompleted
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {cls.classNumberBn}
                        </div>
                        <div>
                          <div className="text-sm text-slate-900 font-semibold">
                            {cls.titleBn}
                          </div>
                          <div className="text-xs text-slate-500">
                            {cls.parvaTitleBn} • {cls.items.length}টি অনুশীলন
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>অগ্রগতি: {completionPercentage}% সম্পূর্ণ</span>
              <button
                onClick={() => setIsTocOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
