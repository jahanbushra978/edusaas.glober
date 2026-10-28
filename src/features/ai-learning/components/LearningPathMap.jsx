"use client";

import React, { useMemo, useState } from "react";
import { BookOpen, Trophy, CheckCircle2, Play, Flame, Award, Star } from "lucide-react";
import DuolingoNode from "./DuolingoNode";
import ParentCelebrationCard from "./ParentCelebrationCard";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function LearningPathMap({
  modules,
  completedLessons = [],
  lessonStars = {},
  onSelectLesson,
}) {
  const { t, lang, dir } = useLearningLanguage();
  const [selectedModuleFilter, setSelectedModuleFilter] = useState("all");
  const [celebrationModalData, setCelebrationModalData] = useState(null);

  // Flatten all lessons across all modules to enforce strict sequential progression
  const allLessons = useMemo(() => {
    return modules.flatMap((m) => m.lessons);
  }, [modules]);

  // Find the first uncompleted lesson to mark as active "START"
  const activeLesson = useMemo(() => {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return lesson;
        }
      }
    }
    return modules[0]?.lessons[0];
  }, [modules, completedLessons]);

  const activeLessonId = activeLesson?.id;

  // Filter modules if user selected a specific level
  const displayedModules = useMemo(() => {
    if (selectedModuleFilter === "all") return modules;
    return modules.filter((m) => m.id === selectedModuleFilter);
  }, [modules, selectedModuleFilter]);

  // Total course completion stats
  const totalCourseLessons = allLessons.length;
  const totalCourseCompleted = allLessons.filter((l) => completedLessons.includes(l.id)).length;
  const coursePercentage = Math.round((totalCourseCompleted / Math.max(1, totalCourseLessons)) * 100);

  // Calculate total stars earned
  const totalStarsEarned = Object.values(lessonStars).reduce((acc, s) => acc + (s || 0), 0);

  let globalLessonIndex = 0;

  const activeLessonTitle = activeLesson
    ? activeLesson.title[lang] || activeLesson.title.bn || activeLesson.title.en
    : "কুরআন শিক্ষা শুরু করুন";

  return (
    <div dir={dir} className="w-full flex flex-col items-center py-2 px-2 sm:px-4 space-y-6">
      
      {/* ── 🌟 1. "আজকের পাঠ" (TODAY'S LESSON) HERO CARD (Inspired by Onosaee) ── */}
      <div className="w-full max-w-xl p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-950/5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex-1 space-y-2 text-center sm:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>আজকের পাঠ</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
            {activeLessonTitle}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            শোনো, দেখো এবং আমার সাথে বিশুদ্ধ মাখরাজে পড়ো।
          </p>

          {/* Action Button: পাঠ শুরু করুন */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => activeLesson && onSelectLesson(activeLesson)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>পাঠ শুরু করুন</span>
            </button>
          </div>
        </div>

        {/* Visual Illustration Badge */}
        <div className="shrink-0 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-8 h-8 text-emerald-100" />
          </div>
          <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 mt-2">
            {totalCourseCompleted} / {totalCourseLessons} সম্পন্ন
          </span>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* ── 📊 2. "আমার অগ্রগতি" (MY PROGRESS STATS ROW) (From Onosaee Mockup) ── */}
      <div className="w-full max-w-xl grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Completed Lessons */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0c241a] border border-emerald-100 dark:border-emerald-800/70 shadow-xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 leading-tight">
            {totalCourseCompleted}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            সম্পন্ন পাঠ
          </span>
        </div>

        {/* Total Stars */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0c241a] border border-amber-100 dark:border-amber-800/70 shadow-xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300 leading-tight">
            {totalStarsEarned}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            মোট তারা
          </span>
        </div>

        {/* Badges / Levels */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0c241a] border border-teal-100 dark:border-teal-800/70 shadow-xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 mb-1">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-teal-800 dark:text-teal-300 leading-tight">
            {modules.length}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            মোট লেভেল
          </span>
        </div>
      </div>

      {/* ── 🧭 3. COURSE LEVEL SELECTOR TABS ── */}
      <div className="w-full max-w-xl space-y-3">
        {/* Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedModuleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
              selectedModuleFilter === "all"
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-xs font-black"
                : "bg-white dark:bg-slate-900/90 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900 shadow-xs"
            }`}
          >
            সব লেভেল ({totalCourseLessons})
          </button>

          {modules.map((m, idx) => {
            const isSelected = selectedModuleFilter === m.id;
            const completedInMod = m.lessons.filter((l) => completedLessons.includes(l.id)).length;
            const isFinished = completedInMod === m.lessons.length;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModuleFilter(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-xs font-black"
                    : isFinished
                    ? "bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80"
                    : "bg-white dark:bg-slate-900/90 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900 shadow-xs"
                }`}
              >
                <span>লেভেল {idx + 1}</span>
                {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                <span className="text-[10px] opacity-80">
                  ({completedInMod}/{m.lessons.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 🗺️ 4. MODULE CARDS & ZIGZAG DUOLINGO NODES ── */}
      {displayedModules.map((mod) => {
        const modTitle = mod.title[lang] || mod.title.bn || mod.title.en;
        const modDesc = mod.desc[lang] || mod.desc.bn || mod.desc.en;

        const totalInMod = mod.lessons.length;
        const completedInMod = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const isModComplete = completedInMod === totalInMod;

        // Calculate total stars in this module
        const modStars = mod.lessons.reduce((acc, l) => acc + (lessonStars[l.id] || 0), 0);

        return (
          <div key={mod.id} className="w-full max-w-xl flex flex-col items-center mb-10">
            {/* ── MODULE BANNER HEADER ── */}
            <div className="w-full p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c241a] border-2 border-emerald-200 dark:border-emerald-700/60 shadow-md mb-6 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3.5 z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs border ${
                    isModComplete
                      ? "bg-amber-50 dark:bg-amber-500/20 border-amber-300 text-amber-600 dark:text-amber-300"
                      : "bg-emerald-50 dark:bg-emerald-600/30 border-emerald-300 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {isModComplete ? (
                    <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
                    {modTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 max-w-sm mt-0.5 font-medium">{modDesc}</p>
                </div>
              </div>

              {/* Progress Count Badge & Parent Certificate Trigger */}
              <div className="text-right z-10 shrink-0 flex flex-col items-end">
                <span className="text-xs font-black text-amber-600 dark:text-amber-300">
                  {completedInMod}/{totalInMod}
                </span>
                <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-1 overflow-hidden border border-slate-200 dark:border-emerald-900/60">
                  <div
                    style={{ width: `${(completedInMod / Math.max(1, totalInMod)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  />
                </div>

                {isModComplete && (
                  <button
                    type="button"
                    onClick={() =>
                      setCelebrationModalData({
                        levelTitle: modTitle,
                        levelNumber: mod.levelId || mod.moduleNumber,
                        completedCount: completedInMod,
                        totalCount: totalInMod,
                        totalStars: modStars,
                      })
                    }
                    className="mt-2 text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-400/40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>প্রশংসাপত্র 📜</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── ZIGZAG DUOLINGO LESSON NODES ── */}
            <div className="flex flex-col items-center space-y-3 w-full">
              {mod.lessons.map((lesson) => {
                const currentIndex = globalLessonIndex;
                globalLessonIndex += 1;

                const isCompleted = completedLessons.includes(lesson.id);
                const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

                // Strict rule: Step 0 is unlocked. Step N unlocked IF AND ONLY IF Step N-1 is completed!
                const isUnlocked =
                  currentIndex === 0 ||
                  isCompleted ||
                  (prevLesson && completedLessons.includes(prevLesson.id));

                const isActive = lesson.id === activeLessonId;
                const stars = lessonStars[lesson.id] || 0;

                return (
                  <DuolingoNode
                    key={lesson.id}
                    lesson={lesson}
                    index={currentIndex}
                    isCompleted={isCompleted}
                    isUnlocked={isUnlocked}
                    isActive={isActive}
                    stars={stars}
                    onSelectLesson={onSelectLesson}
                  />
                );
              })}
            </div>

            {/* Module Milestone Checkpoint */}
            <div className="mt-8 flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-md transition-all ${
                  isModComplete
                    ? "bg-amber-50 dark:bg-amber-500/20 border-amber-300 text-amber-500 scale-105"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"
                }`}
              >
                <Trophy className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5">
                {isModComplete ? (
                  <span className="text-amber-600 dark:text-amber-300 font-black">লেভেল সম্পন্ন · মাশাআল্লাহ 🎉</span>
                ) : (
                  t.chapterTrophy
                )}
              </span>
            </div>
          </div>
        );
      })}

      {/* 📜 Parent Celebration & WhatsApp Certificate Modal */}
      {celebrationModalData && (
        <ParentCelebrationCard
          isOpen={true}
          onClose={() => setCelebrationModalData(null)}
          levelTitle={celebrationModalData.levelTitle}
          levelNumber={celebrationModalData.levelNumber}
          completedCount={celebrationModalData.completedCount}
          totalCount={celebrationModalData.totalCount}
          totalStars={celebrationModalData.totalStars}
        />
      )}
    </div>
  );
}
