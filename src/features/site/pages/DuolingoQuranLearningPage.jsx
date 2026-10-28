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
  Gamepad2,
  Radio,
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
  QuranGamesHub,
  useLearningLanguage,
  useLearningProgress,
  NOORANI_QAIDA_MODULES,
} from "@/features/ai-learning";

// Reusing existing powerful sub-engines cleanly
import LiveVoiceQuranClass from "@/features/ai/components/LiveVoiceQuranClass";
import MakhrajVisualizer from "@/features/ai/components/MakhrajVisualizer";
import AdvancedHifzAssistant from "@/features/ai/components/AdvancedHifzAssistant";
import AiDawrTeacherCompanion from "@/features/ai/components/AiDawrTeacherCompanion";
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

  const [activePath, setActivePath] = useState("qaida"); // 'qaida' | 'teacher' | 'blackboard' | 'nazera' | 'tajweed' | 'hifz' | 'murajaah' | 'games' | 'progress'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isMistakesOpen, setIsMistakesOpen] = useState(false);
  const [showBlackboardView, setShowBlackboardView] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#F8FAF8] dark:bg-[#071912] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors"
    >
      {/* ── TOP HEADER (Onosaee Child-Friendly Style) ── */}
      <header className="h-16 border-b border-emerald-100 dark:border-emerald-900/60 bg-white/95 dark:bg-[#0a2318]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/quran-tutor"
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={t.nurAiTeacher}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nurAiTeacher}</span>
          </Link>
          <div className="h-5 w-px bg-emerald-200 dark:bg-emerald-900/80 hidden xs:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/50 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{t.appName}</span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/40 font-extrabold hidden xs:inline">
                  {t.duolingoStyle}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Actions: Games, Quests, Leaderboard, Live Class & Blackboard */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Games Button */}
          <button
            type="button"
            onClick={() => {
              setActivePath("games");
              setShowBlackboardView(false);
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              activePath === "games"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            }`}
            title="ছোটদের গেম জোন"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">গেমস</span>
          </button>

          {/* Quests Button */}
          <button
            type="button"
            onClick={() => setIsQuestsOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 border border-amber-300 dark:border-amber-600/70 text-amber-900 dark:text-amber-300 shadow-xs transition-all cursor-pointer"
            title={t.quests || "মিশন"}
          >
            <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">{t.quests || "মিশন"}</span>
          </button>

          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700/70 text-emerald-900 dark:text-emerald-300 shadow-xs transition-all cursor-pointer"
            title={t.leaderboard || "লিগ"}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">{t.leaderboard || "লিগ"}</span>
          </button>

          {/* Live Voice Class Link */}
          <Link
            href="/quran-tutor/live-class"
            className="hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 animate-pulse" />
            <span>{t.liveClass}</span>
          </Link>

          {/* Blackboard Toggle */}
          <button
            type="button"
            onClick={() => setShowBlackboardView(!showBlackboardView)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showBlackboardView
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-xs font-black"
                : "bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-emerald-300 border-slate-200 dark:border-emerald-700"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{showBlackboardView ? t.learningMap : t.blackboard}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN BODY CONTENT ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 md:p-6 flex flex-col space-y-5">
        {/* TOP HUD: XP, Streak, Lives, Language */}
        <LearningStatsBar
          xp={xp}
          streak={streak}
          lives={lives}
          mistakesCount={mistakeQueue.length}
          onOpenMistakes={() => setIsMistakesOpen(true)}
        />

        {/* 8-PATH CATEGORY SELECTOR (Includes Games!) */}
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
            <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 overflow-hidden shadow-xl">
              <QuranReader />
            </div>
          </div>
        ) : activePath === "tajweed" ? (
          /* VIEW 5: TAJWEED & 17 MAKHARIJ */
          <div className="w-full animate-fade-in space-y-6">
            <MakhrajVisualizer />
          </div>
        ) : activePath === "hifz" ? (
          /* VIEW 6: HIFZ & MEMORIZATION ASSISTANT (১১৪ সূরা ও ৩০ পারা) */
          <div className="w-full animate-fade-in space-y-6">
            <AdvancedHifzAssistant />
          </div>
        ) : activePath === "murajaah" ? (
          /* VIEW 7: LIVE AI DAWR TEACHER (মুরাযাআ ও দাওর শিক্ষক — পড়া শোনা ও লোকমা দেওয়া) */
          <div className="w-full animate-fade-in space-y-6">
            <AiDawrTeacherCompanion />
          </div>
        ) : activePath === "games" ? (
          /* VIEW 8: QURAN GAMES HUB (ছোটদের খেলে শিখি) */
          <div className="w-full animate-fade-in">
            <QuranGamesHub
              onEarnXP={(bonusXp) => {
                completeLesson("game-session-" + Date.now(), 100, 3);
                toast.success(`মাশাআল্লাহ! +${bonusXp} XP যোগ হয়েছে! 🎮`);
              }}
            />
          </div>
        ) : (
          /* VIEW 9: TESTS & PROGRESS REPORT */
          <div className="w-full p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-900/60 shadow-xl space-y-4 animate-fade-in">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{t.progressDashboard}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#05140d] border border-amber-200 dark:border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-amber-600 dark:text-amber-300">{xp}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">{t.totalXp}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#05140d] border border-emerald-200 dark:border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{completedLessons.length}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">{t.completedLessonsCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-[#05140d] border border-teal-200 dark:border-emerald-800 flex flex-col items-center text-center">
                <span className="text-3xl font-black text-teal-700 dark:text-teal-300">{streak} {t.days}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-semibold">{t.continuousStreak}</span>
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
