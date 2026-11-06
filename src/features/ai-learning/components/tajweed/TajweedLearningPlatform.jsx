"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Award,
  ChevronRight,
  Play,
  Pause,
  Heart,
  Flame,
  Star,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  GraduationCap,
  Radio,
  Compass,
} from "lucide-react";
import {
  TAJWEED_LEVELS,
  MASTER_TAJWEED_UNITS,
  getLessonById,
  getCurriculumStats,
} from "../../data/masterTajweedCurriculum";
import { useLearningProgress } from "../../hooks/useLearningProgress";
import { universalAudioEngine } from "@/lib/quran/audio";

// Safe synthesized Web Audio sound effects (Zero external dependencies)
function playBeepTone(freq = 440, type = "sine", duration = 0.15) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playCelebrationFanfare() {
  playBeepTone(523.25, "triangle", 0.15); // C5
  setTimeout(() => playBeepTone(659.25, "triangle", 0.15), 140); // E5
  setTimeout(() => playBeepTone(783.99, "triangle", 0.18), 280); // G5
  setTimeout(() => playBeepTone(1046.5, "sine", 0.35), 440); // C6
}

function playErrorBuzzer() {
  playBeepTone(220, "sawtooth", 0.2);
  setTimeout(() => playBeepTone(196, "sawtooth", 0.25), 180);
}

export default function TajweedLearningPlatform({
  onClose,
  _onLaunchLiveClass,
  onOpenMakhrajVisualizer,
  isStandalonePage = false,
}) {
  const {
    completedLessons,
    lessonStars,
    streak,
    lives,
    gainLife,
    loseLife,
    completeLesson,
  } = useLearningProgress();

  const [activeLevelId, setActiveLevelId] = useState("beginner");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonStage, setLessonStage] = useState("learn"); // "learn" | "practise" | "assess" | "celebrate"
  
  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 1.0 or 0.75

  // Practice & Quiz state
  const [practiceCount, setPracticeCount] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizMistakeCount, setQuizMistakeCount] = useState(0);

  // Free Learning Mode (all lessons open to explore & learn without artificial locks)
  const [freeStudyMode, setFreeStudyMode] = useState(true);

  const stats = useMemo(() => getCurriculumStats(), []);

  // Filter units for active level
  const activeUnits = useMemo(() => {
    return MASTER_TAJWEED_UNITS.filter((u) => u.levelId === activeLevelId);
  }, [activeLevelId]);

  // Overall curriculum progress calculation
  const totalCompletedCount = useMemo(() => {
    return completedLessons.filter((id) => getLessonById(id)).length;
  }, [completedLessons]);

  const totalStarsCount = useMemo(() => {
    return Object.values(lessonStars).reduce((acc, curr) => acc + curr, 0);
  }, [lessonStars]);

  const progressPercentage = Math.min(
    100,
    Math.round((totalCompletedCount / Math.max(1, stats.totalLessons)) * 100)
  );

  // Find next recommended lesson to feature in Hero banner
  const recommendedLesson = useMemo(() => {
    for (const lvl of TAJWEED_LEVELS) {
      const units = MASTER_TAJWEED_UNITS.filter((u) => u.levelId === lvl.id);
      for (const u of units) {
        for (const l of u.lessons) {
          if (!completedLessons.includes(l.id)) {
            return { ...l, unit: u, level: lvl };
          }
        }
      }
    }
    // If all completed, return first
    const firstUnit = MASTER_TAJWEED_UNITS[0];
    return { ...firstUnit.lessons[0], unit: firstUnit, level: TAJWEED_LEVELS[0] };
  }, [completedLessons]);

  // Safe stop audio helper
  const safeStopAudio = () => {
    try {
      if (typeof universalAudioEngine?.stopAll === "function") {
        universalAudioEngine.stopAll();
      } else if (typeof universalAudioEngine?.stop === "function") {
        universalAudioEngine.stop();
      }
    } catch {}
    setIsPlayingAudio(false);
  };

  // Stop audio on unmount or modal close
  useEffect(() => {
    return () => {
      safeStopAudio();
    };
  }, []);

  // Handle playing authentic Qari audio
  const handlePlayLessonAudio = (audioUrl, surahNo, ayahNo) => {
    if (isPlayingAudio) {
      safeStopAudio();
      return;
    }

    setIsPlayingAudio(true);

    if (surahNo && ayahNo) {
      universalAudioEngine.playAyah(surahNo, ayahNo, {
        playbackRate: playbackSpeed,
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    } else if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    }
  };

  // Open lesson modal
  const handleOpenLesson = (lesson) => {
    safeStopAudio();
    setSelectedLesson(lesson);
    setLessonStage("learn");
    setPracticeCount(0);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizMistakeCount(0);
  };

  // Handle quiz option selection
  const handleSelectQuiz = (option) => {
    if (quizAnswered) return;
    setQuizSelectedOption(option);
    setQuizAnswered(true);

    if (option.correct) {
      playCelebrationFanfare();
      let earnedStars = 3;
      if (quizMistakeCount === 1) earnedStars = 2;
      else if (quizMistakeCount >= 2) earnedStars = 1;

      completeLesson(selectedLesson.id, 95, earnedStars);

      if (earnedStars === 3) {
        gainLife();
      }

      setTimeout(() => {
        setLessonStage("celebrate");
      }, 700);
    } else {
      playErrorBuzzer();
      loseLife();
      setQuizMistakeCount((prev) => prev + 1);
      setTimeout(() => {
        setQuizAnswered(false);
        setQuizSelectedOption(null);
      }, 1400);
    }
  };

  // Proceed to next lesson
  const handleProceedNextLesson = () => {
    const allCurriculumLessons = [];
    for (const lvl of TAJWEED_LEVELS) {
      const units = MASTER_TAJWEED_UNITS.filter((u) => u.levelId === lvl.id);
      for (const u of units) {
        for (const l of u.lessons) {
          allCurriculumLessons.push(l);
        }
      }
    }
    const currentIdx = allCurriculumLessons.findIndex((l) => l.id === selectedLesson.id);
    if (currentIdx !== -1 && currentIdx < allCurriculumLessons.length - 1) {
      const nextLesson = allCurriculumLessons[currentIdx + 1];
      handleOpenLesson(nextLesson);
    } else {
      setSelectedLesson(null);
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-800 dark:text-slate-100 font-sans animate-fade-in">
      {/* ── OPTIONAL STANDALONE TOP APP BAR (Only rendered when accessed directly at /quran-tutor/teacher) ── */}
      {isStandalonePage && (
        <header className="h-16 border-b border-emerald-100 dark:border-emerald-900/60 bg-white/95 dark:bg-[#0a2318]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs rounded-2xl mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/quran-tutor"
              className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="কুরআন টিউটর হোমে ফিরুন"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              <span className="hidden sm:inline">টিউটর হোম</span>
            </Link>

            <div className="h-5 w-px bg-emerald-200 dark:bg-emerald-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>তাজবিদ শিখি</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
                    পূর্ণাঙ্গ পাঠ্যক্রম
                  </span>
                </h1>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium hidden md:block">
                  নূর এআই-এর সহায়তায় ধাপে ধাপে শুদ্ধ কুরআন তিলাওয়াত শিখি
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMakhrajVisualizer && onOpenMakhrajVisualizer()}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">১৭ মাখরাজ মানচিত্র</span>
            </button>
            <Link
              href="/quran-tutor/live-class"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span>লাইভ ক্লাস</span>
            </Link>
          </div>
        </header>
      )}

      {/* ── FLOATING STATS BAR (Matches LearningStatsBar Clean Style) ── */}
      <section className="bg-white dark:bg-[#0a2318] p-3 sm:p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: User Welcome & Lives */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60">
            <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
              তাজবিদ শিক্ষার্থী
            </span>
          </div>

          {/* Hearts / Lives */}
          <div
            className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-3 py-1.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-black text-xs"
            title="জীবন (প্রতি ৫ ঘণ্টায় ১টি রিচার্জ)"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            <span>{lives} জীবন</span>
          </div>

          {/* Stars */}
          <div
            className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 font-black text-xs"
            title="মোট অর্জিত ৩-স্টার"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{totalStarsCount} স্টার</span>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/60 px-3 py-1.5 rounded-2xl border border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-400 font-black text-xs"
            title="ধারাবাহিক পড়ার দিন"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>{streak} দিন</span>
          </div>
        </div>

        {/* Right: Quick Controls & Free Study Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFreeStudyMode(!freeStudyMode)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              freeStudyMode
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
            }`}
            title="সব পাঠ উন্মুক্ত রেখে স্বাধীনভাবে পড়ার মোড"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{freeStudyMode ? "মুক্ত পাঠ চালু ✓" : "ক্রমিক লক মোড"}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* ── HERO BANNER: RECOMMENDED / NEXT LESSON (Duolingo Style Focus) ── */}
      <section className="bg-gradient-to-br from-[#0F3829] via-[#0D2F22] to-[#0A261C] text-white p-5 sm:p-7 rounded-3xl border border-emerald-700/40 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
              আজকের নির্ধারিত পাঠ
            </span>
            <span className="text-xs text-emerald-200 font-bold bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
              {recommendedLesson.level?.titleBn} • ইউনিট {recommendedLesson.unit?.unitNo}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
            {recommendedLesson.titleBn}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            {recommendedLesson.introBn}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => handleOpenLesson(recommendedLesson)}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/60 flex items-center gap-2 transition-all transform hover:scale-102 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              পাঠ শুরু করুন
            </button>
            <span className="text-xs text-emerald-300/80 font-medium hidden sm:inline">
              হরফ: {recommendedLesson.keyLetters}
            </span>
          </div>
        </div>

        {/* Right: Progress Circular/Card summary */}
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto relative z-10">
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {totalCompletedCount} <span className="text-sm text-emerald-300 font-bold">/ {stats.totalLessons}</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 font-bold mt-0.5">
            সম্পন্ন পাঠ
          </p>
          <div className="w-36 h-2 bg-emerald-900/80 rounded-full mx-auto mt-2 overflow-hidden border border-emerald-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-amber-300 font-black mt-1 inline-block">
            {progressPercentage}% সম্পূর্ণ
          </span>
        </div>

        {/* Ambient Decorative Pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-9xl font-surah text-white select-none">
          تَجْوِيد
        </div>
      </section>

      {/* ── 4-LEVEL PILL TABS (Clean Mint Card Navigation) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {TAJWEED_LEVELS.map((lvl) => {
          const isActive = lvl.id === activeLevelId;
          const levelUnits = MASTER_TAJWEED_UNITS.filter((u) => u.levelId === lvl.id);
          const levelTotalLessons = levelUnits.reduce((acc, u) => acc + u.lessons.length, 0);
          const levelCompleted = levelUnits.reduce((acc, u) => {
            return acc + u.lessons.filter((l) => completedLessons.includes(l.id)).length;
          }, 0);

          return (
            <button
              key={lvl.id}
              onClick={() => setActiveLevelId(lvl.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/20 scale-[1.01]"
                  : "bg-white dark:bg-[#0a2318] border-emerald-100 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-200 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isActive
                      ? "bg-emerald-700/80 text-amber-300"
                      : "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                  }`}
                >
                  স্তর {lvl.levelNumber}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-emerald-100" : "text-slate-400 dark:text-emerald-400"
                  }`}
                >
                  {levelCompleted}/{levelTotalLessons} সম্পন্ন
                </span>
              </div>
              <h3
                className={`text-sm sm:text-base font-extrabold ${
                  isActive ? "text-white" : "text-slate-900 dark:text-white"
                }`}
              >
                {lvl.titleBn}
              </h3>
              <p
                className={`text-[11px] line-clamp-1 mt-0.5 ${
                  isActive ? "text-emerald-100" : "text-slate-500 dark:text-emerald-300/80"
                }`}
              >
                {lvl.subtitleBn}
              </p>
            </button>
          );
        })}
      </section>

      {/* ── UNITS & LESSONS FEED (Generous Cards, Clean Typography) ── */}
      <main className="space-y-6">
        {activeUnits.map((unit) => (
          <section
            key={unit.id}
            className="bg-white dark:bg-[#0a2318] rounded-3xl border border-emerald-100 dark:border-emerald-900/60 p-4 sm:p-6 shadow-xs space-y-4"
          >
            {/* Unit Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
              <div>
                <span className="text-[11px] font-black text-emerald-600 dark:text-amber-400 uppercase tracking-widest">
                  ইউনিট {unit.unitNo}
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {unit.titleBn}
                  </h3>
                  <span className="text-sm font-surah text-emerald-700 dark:text-emerald-300">
                    {unit.titleAr}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-1 max-w-3xl">
                  {unit.summaryBn}
                </p>
              </div>

              <div className="text-xs font-bold text-slate-400 dark:text-emerald-400/80">
                {unit.lessons.filter((l) => completedLessons.includes(l.id)).length} / {unit.lessons.length} সম্পন্ন
              </div>
            </div>

            {/* Lesson Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
              {unit.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const stars = lessonStars[lesson.id] || 0;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLesson(lesson)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer group ${
                      isCompleted
                        ? "bg-emerald-50/50 dark:bg-[#0E2C20] border-emerald-200 dark:border-emerald-700/60 hover:border-emerald-400 dark:hover:border-amber-400 shadow-2xs hover:shadow-md"
                        : "bg-[#FAFCFA] dark:bg-[#0C241B] border-emerald-100 dark:border-emerald-800/60 hover:border-emerald-400 dark:hover:border-amber-400 shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-extrabold text-emerald-800 dark:text-amber-400">
                          পাঠ {lesson.lessonNo}
                        </span>

                        {isCompleted ? (
                          <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <div className="flex text-amber-500">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= stars
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-emerald-300 dark:text-emerald-800"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700">
                            উন্মুক্ত পাঠ
                          </span>
                        )}
                      </div>

                      {/* Lesson Titles */}
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                        {lesson.titleBn}
                      </h4>
                      <p className="text-xs font-surah text-emerald-700 dark:text-emerald-400 line-clamp-1 mt-0.5">
                        {lesson.titleAr}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-emerald-200/80 mt-2 line-clamp-2 leading-relaxed">
                        {lesson.introBn}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-amber-300/80 font-medium">
                        হরফ: {lesson.keyLetters}
                      </span>
                      <button
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                          isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 group-hover:bg-emerald-200"
                            : "bg-emerald-600 text-white group-hover:bg-emerald-700 shadow-2xs font-extrabold"
                        }`}
                      >
                        {isCompleted ? "পুনরাবৃত্তি" : "পড়ুন ও মাশক"}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* ── 12-STEP INTERACTIVE PEDAGOGICAL LESSON MODAL (Polished Sanctuary) ── */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#0A261C] border border-emerald-200 dark:border-emerald-700 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between p-5 sm:p-7 space-y-6 animate-scale-in text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-emerald-100 dark:border-emerald-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-full">
                    পাঠ {selectedLesson.lessonNo}
                  </span>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    {selectedLesson.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedLesson.titleBn}
                </h3>
                <p className="text-sm font-surah text-emerald-700 dark:text-amber-300">
                  {selectedLesson.titleAr}
                </p>
              </div>

              <button
                onClick={() => {
                  universalAudioEngine.stop();
                  setIsPlayingAudio(false);
                  setSelectedLesson(null);
                }}
                className="w-9 h-9 rounded-full bg-stone-100 dark:bg-emerald-950 hover:bg-stone-200 text-slate-600 dark:text-emerald-300 flex items-center justify-center border border-stone-200 dark:border-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage: LEARN (Step 1-5) */}
            {lessonStage === "learn" && (
              <div className="space-y-5 text-sm sm:text-base">
                {/* 1. সহজ পরিচয় (Introduce) */}
                <div className="bg-emerald-50/70 dark:bg-[#0D2A1F] p-4 rounded-2xl border border-emerald-200 dark:border-emerald-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> ১. সহজ পরিচয়
                  </h4>
                  <p className="text-slate-800 dark:text-emerald-100 font-medium leading-relaxed">
                    {selectedLesson.introBn}
                  </p>
                </div>

                {/* 2. নিয়ম ও কারণ (Explain) */}
                <div className="bg-[#FAF8F5] dark:bg-[#071912] p-4 rounded-2xl border border-stone-200 dark:border-emerald-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> ২. বিস্তারিত তাজবিদ নিয়ম ও কারণ
                  </h4>
                  <p className="text-slate-700 dark:text-emerald-200/90 whitespace-pre-line leading-relaxed">
                    {selectedLesson.ruleExplanationBn}
                  </p>
                  <div className="mt-3 inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-amber-300 text-xs px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 font-bold">
                    প্রযোজ্য হরফ / শব্দ: {selectedLesson.keyLetters}
                  </div>
                </div>

                {/* 3. ক্বারীর মানবকণ্ঠে কুরআনিক তিলাওয়াত (Demonstrate & Listen) */}
                {selectedLesson.quranExample && (
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-[#0C3325] dark:to-[#0A261C] p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-amber-500/40 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" /> ৩. ক্বারীর মানবকণ্ঠে বিশুদ্ধ উদাহরণ
                      </h4>
                      <span className="text-xs bg-white dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700 font-bold">
                        সূরা {selectedLesson.quranExample.surahNo} : আয়াত {selectedLesson.quranExample.ayahNo}
                      </span>
                    </div>

                    <div className="text-center py-2.5">
                      <p className="text-2xl sm:text-3xl font-surah text-emerald-950 dark:text-amber-300 tracking-wide leading-relaxed">
                        {selectedLesson.quranExample.wordAr}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 mt-1 font-medium">
                        &quot;{selectedLesson.quranExample.translationBn}&quot;
                      </p>
                    </div>

                    {/* Audio Player Controls */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() =>
                          handlePlayLessonAudio(
                            selectedLesson.quranExample.audioUrl,
                            selectedLesson.quranExample.surahNo,
                            selectedLesson.quranExample.ayahNo
                          )
                        }
                        className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                          isPlayingAudio
                            ? "bg-amber-500 text-slate-950 animate-pulse"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 fill-slate-950" /> তিলাওয়াত থামান
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" /> ক্বারীর কণ্ঠে শুনুন
                          </>
                        )}
                      </button>

                      {/* Speed toggle: 1x / 0.75x */}
                      <button
                        onClick={() => {
                          const nextSpeed = playbackSpeed === 1.0 ? 0.75 : 1.0;
                          setPlaybackSpeed(nextSpeed);
                        }}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-emerald-950 text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 cursor-pointer"
                        title="তিলাওয়াতের গতি পরিবর্তন করুন"
                      >
                        গতি: {playbackSpeed}x
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. সঠিক বনাম ভুল পার্থক্যের তুলনা (Compare) */}
                {selectedLesson.comparison && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-600/40">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> সঠিক পদ্ধতি
                      </span>
                      <p className="text-xs text-emerald-950 dark:text-emerald-100 mt-1 leading-relaxed">
                        {selectedLesson.comparison.correctBn}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40">
                      <span className="text-xs font-black text-rose-800 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-rose-600" /> সাধারণ ভুল
                      </span>
                      <p className="text-xs text-rose-950 dark:text-rose-200 mt-1 leading-relaxed">
                        {selectedLesson.comparison.incorrectBn}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage: PRACTISE (Step 6) */}
            {lessonStage === "practise" && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-800/60 border border-emerald-300 dark:border-emerald-600 flex items-center justify-center mx-auto text-emerald-700 dark:text-amber-300">
                  <Volume2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    মুখে মুখে মাশক অনুশীলন
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 mt-1 max-w-md mx-auto">
                    ক্বারীর অডিও শুনে আয়াতটি মুখে দুইবার উচ্চারণের অনুশীলন করো।
                  </p>
                </div>

                <div className="bg-[#FAF8F5] dark:bg-[#071912] p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 max-w-md mx-auto">
                  <p className="text-2xl sm:text-3xl font-surah text-emerald-900 dark:text-amber-300">
                    {selectedLesson.quranExample?.wordAr}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-bold">
                    অনুশীলন সম্পন্ন: {practiceCount} / ২
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      handlePlayLessonAudio(
                        selectedLesson.quranExample?.audioUrl,
                        selectedLesson.quranExample?.surahNo,
                        selectedLesson.quranExample?.ayahNo
                      );
                      setPracticeCount((prev) => Math.min(2, prev + 1));
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    আবার শুনে বলো ({practiceCount}/২)
                  </button>
                </div>
              </div>
            )}

            {/* Stage: ASSESS / QUIZ (Step 8) */}
            {lessonStage === "assess" && selectedLesson.quiz && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-800 dark:text-amber-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> বাস্তব উদাহরণভিত্তিক পরীক্ষা
                  </span>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    ভুল উত্তরে ১টি জীবন কমবে
                  </span>
                </div>

                <div className="bg-emerald-50/50 dark:bg-[#071912] p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {selectedLesson.quiz.questionBn}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedLesson.quiz.options.map((option) => {
                    const isSelected = quizSelectedOption?.id === option.id;
                    let optionStyle =
                      "bg-white dark:bg-[#0D271D] border-stone-200 dark:border-emerald-800/60 hover:border-emerald-400 text-slate-800 dark:text-emerald-100";

                    if (quizAnswered && isSelected) {
                      optionStyle = option.correct
                        ? "bg-emerald-100 dark:bg-emerald-900 border-emerald-500 text-emerald-950 dark:text-white ring-2 ring-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500";
                    }

                    return (
                      <button
                        key={option.id}
                        disabled={quizAnswered}
                        onClick={() => handleSelectQuiz(option)}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <span className="text-xs sm:text-sm">{option.text}</span>
                        {quizAnswered && isSelected && (
                          <span>
                            {option.correct ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium ${
                      quizSelectedOption?.correct
                        ? "bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {quizSelectedOption?.correct ? (
                      <p>মাশাআল্লাহ! সঠিক উত্তর! {selectedLesson.quiz.explanationBn}</p>
                    ) : (
                      <p>ভুল উত্তর! আবার চেষ্টা করো। সঠিক ধারণাটি পুনরায় স্মরণ করো।</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stage: CELEBRATE (Step 11-12) */}
            {lessonStage === "celebrate" && (
              <div className="text-center py-6 space-y-5 animate-scale-in">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center mx-auto text-slate-950 font-black shadow-xl shadow-amber-500/30">
                  <Award className="w-10 h-10 text-slate-950" />
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-amber-300 font-surah">
                    مَا شَاءَ اللَّهُ
                  </h4>
                  <h5 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    মাশাআল্লাহ! পাঠ সফলভাবে সম্পন্ন হয়েছে!
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 mt-1 max-w-sm mx-auto">
                    তুমি এই পাঠের তাজবিদ নিয়ম ও তিলাওয়াত চমৎকারভাবে শিখেছো।
                  </p>
                </div>

                {/* Stars Won Banner */}
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const starsWon = quizMistakeCount === 0 ? 3 : quizMistakeCount === 1 ? 2 : 1;
                    return (
                      <Star
                        key={s}
                        className={`w-9 h-9 transition-all ${
                          s <= starsWon
                            ? "fill-amber-400 text-amber-500 scale-110 drop-shadow-[0_0_8px_#fbbf24]"
                            : "text-stone-300 dark:text-emerald-900"
                        }`}
                      />
                    );
                  })}
                </div>

                {quizMistakeCount === 0 && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/80 py-1.5 px-4 rounded-full border border-emerald-300 dark:border-emerald-700/50 inline-block">
                    পবিত্র ৩-স্টার অর্জন করায় +১ জীবন (❤️) যোগ হয়েছে!
                  </p>
                )}

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleProceedNextLesson}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    পরবর্তী পাঠে যান <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-5 py-3 rounded-2xl bg-stone-100 dark:bg-[#0D271D] hover:bg-stone-200 text-slate-800 dark:text-emerald-200 font-bold text-xs sm:text-sm border border-stone-200 dark:border-emerald-700 cursor-pointer"
                  >
                    তালিকা দেখুন
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Stage Navigation Bar */}
            {lessonStage !== "celebrate" && (
              <div className="border-t border-emerald-100 dark:border-emerald-800/80 pt-4 flex items-center justify-between">
                <div>
                  {lessonStage !== "learn" && (
                    <button
                      onClick={() => {
                        if (lessonStage === "practise") setLessonStage("learn");
                        else if (lessonStage === "assess") setLessonStage("practise");
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-emerald-950 hover:bg-stone-200 text-slate-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-stone-200 dark:border-emerald-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> পেছনে
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lessonStage === "learn" && (
                    <button
                      onClick={() => setLessonStage("practise")}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      মাশক অনুশীলনে যান <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {lessonStage === "practise" && (
                    <button
                      onClick={() => setLessonStage("assess")}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      পরীক্ষা শুরু করুন <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
