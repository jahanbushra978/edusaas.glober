"use client";

import React, { useMemo, useState } from "react";
import { BookOpen, Trophy, CheckCircle2 } from "lucide-react";
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
  const activeLessonId = useMemo(() => {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return lesson.id;
        }
      }
    }
    return modules[0]?.lessons[0]?.id;
  }, [modules, completedLessons]);

  // Filter modules if user selected a specific level
  const displayedModules = useMemo(() => {
    if (selectedModuleFilter === "all") return modules;
    return modules.filter((m) => m.id === selectedModuleFilter);
  }, [modules, selectedModuleFilter]);

  // Total course completion stats
  const totalCourseLessons = allLessons.length;
  const totalCourseCompleted = allLessons.filter((l) => completedLessons.includes(l.id)).length;
  const coursePercentage = Math.round((totalCourseCompleted / Math.max(1, totalCourseLessons)) * 100);

  let globalLessonIndex = 0;

  return (
    <div dir={dir} className="w-full flex flex-col items-center py-4 px-2 sm:px-4">
      {/* ── TOP LEVEL NAVIGATION TABS (Level 1 to 5) ── */}
      <div className="w-full max-w-xl mb-8 space-y-3">
        {/* Course Overview Mini Banner */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#071d13] via-[#09291b] to-[#071d13] border border-emerald-700/60 shadow-lg flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>কুরআন শেখার সহজ উপায়</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-950 text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-700 font-semibold shrink-0">
                  ৩৫টি পাঠ
                </span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 truncate">
                মাওলানা মুহাম্মাদ জামাল উদ্দিন (পানভিশন টিভি) প্রণীত সিলেবাস
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-black text-amber-300">
              {totalCourseCompleted}/{totalCourseLessons} সম্পন্ন
            </span>
            <div className="w-20 h-2 rounded-full bg-slate-900 mt-1 overflow-hidden border border-emerald-900">
              <div
                style={{ width: `${coursePercentage}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedModuleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
              selectedModuleFilter === "all"
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow font-black"
                : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-emerald-900"
            }`}
          >
            সব লেভেল (৩৫)
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
                    ? "bg-emerald-600 text-white border-emerald-400 shadow font-black"
                    : isFinished
                    ? "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/80"
                    : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-emerald-900"
                }`}
              >
                <span>লেভেল {idx + 1}</span>
                {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                <span className="text-[10px] opacity-80">
                  ({completedInMod}/{m.lessons.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODULE CARDS & ZIGZAG NODES ── */}
      {displayedModules.map((mod) => {
        const modTitle = mod.title[lang] || mod.title.bn || mod.title.en;
        const modDesc = mod.desc[lang] || mod.desc.bn || mod.desc.en;

        const totalInMod = mod.lessons.length;
        const completedInMod = mod.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const isModComplete = completedInMod === totalInMod;

        // Calculate total stars in this module
        const modStars = mod.lessons.reduce((acc, l) => acc + (lessonStars[l.id] || 0), 0);

        return (
          <div key={mod.id} className="w-full max-w-xl flex flex-col items-center mb-14">
            {/* ── MODULE BANNER HEADER ── */}
            <div className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#061810] via-[#092217] to-[#061810] border-2 border-emerald-700/60 shadow-xl mb-6 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3.5 z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md border ${
                    isModComplete
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-emerald-600/30 border-emerald-400/50 text-emerald-300"
                  }`}
                >
                  {isModComplete ? (
                    <Trophy className="w-6 h-6 text-amber-300 animate-pulse" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-emerald-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {modTitle}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-sm mt-0.5">{modDesc}</p>
                </div>
              </div>

              {/* Progress Count Badge & Parent Certificate Trigger */}
              <div className="text-right z-10 shrink-0 flex flex-col items-end">
                <span className="text-xs font-black text-amber-300">
                  {completedInMod}/{totalInMod}
                </span>
                <div className="w-16 h-2 rounded-full bg-slate-800 mt-1 overflow-hidden border border-emerald-900/60">
                  <div
                    style={{ width: `${(completedInMod / Math.max(1, totalInMod)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
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
                    className="mt-2 text-[10px] font-black text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/40 transition-colors cursor-pointer flex items-center gap-1"
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
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all ${
                  isModComplete
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 scale-105"
                    : "bg-slate-900 border-slate-700 text-slate-500"
                }`}
              >
                <Trophy className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5">
                {isModComplete ? (
                  <span className="text-amber-300 font-black">লেভেল সম্পন্ন · মাশাআল্লাহ 🎉</span>
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
