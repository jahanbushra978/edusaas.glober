"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  ArrowLeft,
  Award,
  PenTool,
  Trophy,
  Gift,
} from "lucide-react";
import {
  LearningStatsBar,
  PathCategorySelector,
  LearningPathMap,
  InteractiveBlackboard,
  LessonExperienceModal,
  ReviewMistakesModal,
  QuranRecitationAssessment,
  NuruCompanion,
  DailyQuestsModal,
  LeagueLeaderboardModal,
  useLearningLanguage,
  useLearningProgress,
  NOORANI_QAIDA_MODULES,
} from "@/features/ai-learning";

// Reusing existing powerful sub-engines cleanly
import LiveVoiceQuranClass from "@/features/ai/components/LiveVoiceQuranClass";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import AdvancedHifzAssistant from "@/features/ai/components/AdvancedHifzAssistant";
import QuranReader from "@/features/quran/components/QuranReader";

export default function DuolingoQuranLearningPage() {
  const { t, dir, lang } = useLearningLanguage();
  const {
    completedLessons,
    lessonStars,
    xp,
    streak,
    lives,
    loseLife,
    mistakeQueue,
    completeLesson,
    recordMistake,
    resolveMistake,
  } = useLearningProgress();

  const [activePath, setActivePath] = useState("qaida"); // 'qaida' | 'teacher' | 'blackboard' | 'nazera' | 'tajweed' | 'hifz' | 'murajaah' | 'progress'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isMistakesOpen, setIsMistakesOpen] = useState(false);
  const [showBlackboardView, setShowBlackboardView] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#06130d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* ── TOP HEADER ── */}
      <header className="h-16 border-b border-emerald-900/60 bg-[#091a14]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/quran-tutor"
            className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={t.nurAiTeacher}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nurAiTeacher}</span>
          </Link>
          <div className="h-5 w-px bg-emerald-900/80" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/50 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{t.appName}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold hidden xs:inline">
                  {t.duolingoStyle}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Actions: Quests, Leaderboard, Live Class & Blackboard */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsQuestsOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 shadow transition-all cursor-pointer"
            title={t.quests || "মিশন"}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">{t.quests || "মিশন"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 text-emerald-300 shadow transition-all cursor-pointer"
            title={t.leaderboard || "লিগ"}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.leaderboard || "লিগ"}</span>
          </button>

          <Link
            href="/quran-tutor/live-class"
            className="hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
          >
            <span>{t.liveClass}</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowBlackboardView(!showBlackboardView)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showBlackboardView
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black"
                : "bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-700"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{showBlackboardView ? t.learningMap : t.blackboard}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN BODY CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
        {/* TOP HUD: XP, Streak, Lives, Language */}
        <LearningStatsBar
          xp={xp}
          streak={streak}
          lives={lives}
          mistakesCount={mistakeQueue.length}
          onOpenMistakes={() => setIsMistakesOpen(true)}
        />

        {/* 7-PATH CATEGORY SELECTOR */}
        <PathCategorySelector
          activePath={activePath}
          onSelectPath={(pathId) => {
            setActivePath(pathId);
            setShowBlackboardView(false);
          }}
        />

        {/* ── ACTIVE PATH VIEW RENDERER ── */}

        {/* VIEW 1: ARABIC BLACKBOARD */}
        {showBlackboardView ? (
          <div className="w-full animate-fade-in">
            <InteractiveBlackboard
              onCompleteExercise={() => completeLesson("blackboard-exercise", 100)}
            />
          </div>
        ) : activePath === "qaida" ? (
          /* VIEW 2: NOORANI QAIDA DUOLINGO LEARNING PATH MAP */
          <div className="w-full flex flex-col items-center animate-fade-in">
            <LearningPathMap
              modules={NOORANI_QAIDA_MODULES}
              completedLessons={completedLessons}
              lessonStars={lessonStars}
              onSelectLesson={(lesson) => {
                if (lives <= 0) {
                  toast.info(
                    lang === "en"
                      ? "Out of hearts — you can still freely listen to Qari recitation and practice!"
                      : "আপনার লাইফ (❤️) ০ হয়েছে, তবে ক্বারীর অডিও ও শেখার উপকরণ উন্মুক্ত রয়েছে!"
                  );
                }
                setSelectedLesson(lesson);
              }}
            />
          </div>
        ) : activePath === "teacher" ? (
          /* VIEW 3: LIVE AI TEACHER CLASSROOM */
          <div className="w-full animate-fade-in">
            <LiveVoiceQuranClass />
          </div>
        ) : activePath === "nazera" ? (
          /* VIEW 4: NAZERA QURAN READING */
          <div className="w-full animate-fade-in space-y-6">
            <QuranRecitationAssessment
              verseAr="الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
              verseMeaning="সকল প্রশংসা মহান আল্লাহর, যিনি সমস্ত সৃষ্টির প্রতিপালক।"
              referenceAudio="https://everyayah.com/data/Alafasy_128kbps/001002.mp3"
              onPassed={() => completeLesson("nazera-fatiha-2", 95, 3)}
            />
            <div className="rounded-3xl border border-emerald-900/60 overflow-hidden shadow-2xl">
              <QuranReader />
            </div>
          </div>
        ) : activePath === "tajweed" ? (
          /* VIEW 5: TAJWEED & 17 MAKHARIJ */
          <div className="w-full animate-fade-in space-y-6">
            <MakhrajVisualizer />
          </div>
        ) : activePath === "hifz" || activePath === "murajaah" ? (
          /* VIEW 6: HIFZ & MURAJA'AH ASSISTANT */
          <div className="w-full animate-fade-in space-y-6">
            <AdvancedHifzAssistant />
          </div>
        ) : (
          /* VIEW 7: TESTS & PROGRESS REPORT */
          <div className="w-full p-6 rounded-3xl bg-[#091a14] border border-emerald-900/60 shadow-xl space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{t.progressDashboard}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#05140d] border border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-amber-300">{xp}</span>
                <span className="text-xs text-slate-300 mt-1">{t.totalXp}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#05140d] border border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-emerald-300">{completedLessons.length}</span>
                <span className="text-xs text-slate-300 mt-1">{t.completedLessonsCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#05140d] border border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-teal-300">{streak} {t.days}</span>
                <span className="text-xs text-slate-300 mt-1">{t.continuousStreak}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {selectedLesson && (
        <LessonExperienceModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={(lessonId, score, stars) => completeLesson(lessonId, score, stars)}
          lives={lives}
          onLoseLife={loseLife}
          onRecordMistake={recordMistake}
          onOpenBlackboard={() => {
            setSelectedLesson(null);
            setShowBlackboardView(true);
          }}
        />
      )}

      {isMistakesOpen && (
        <ReviewMistakesModal
          mistakes={mistakeQueue}
          onClose={() => setIsMistakesOpen(false)}
          onResolveMistake={(id) => resolveMistake(id)}
        />
      )}

      {/* 🧕 Nuru Interactive Mascot Companion */}
      <NuruCompanion
        lives={lives}
        streak={streak}
        xp={xp}
        onOpenQuests={() => setIsQuestsOpen(true)}
      />

      {/* 🎁 Duolingo Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        completedLessonsCount={completedLessons.length}
        xp={xp}
        onClaimReward={(_quest) => {
          completeLesson("quest-reward-" + Date.now(), 100, 3);
        }}
      />

      {/* 🏆 Weekly Madrasa League Leaderboard Modal */}
      <LeagueLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userXp={xp}
      />
    </div>
  );
}
