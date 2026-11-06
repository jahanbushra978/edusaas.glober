"use client";

import React, { useEffect } from "react";
import {
  Trophy,
  ArrowRight,
  RotateCcw,
  Star,
  Award,
} from "lucide-react";
import { fireCelebrationConfetti } from "../../lib/confetti";
import {
  playLevelCompleteFanfare,
  playMaShaAllahCelebration,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

/**
 * BuildingRewardCelebrationModal
 * Celebrates level completion, reveals the newly unlocked building component,
 * and displays the progressive construction of the vehicle/house/rocket/garden.
 */
export default function BuildingRewardCelebrationModal({
  isOpen,
  levelId,
  stars,
  earnedStars,
  score,
  earnedScore,
  journey,
  newlyEarnedComponent,
  earnedRewardIds = [],
  onNextLevel,
  onReplay,
  onRetryLevel,
  onBackToMenu,
}) {
  const finalStars = stars ?? earnedStars ?? 3;
  const finalScore = score ?? earnedScore ?? 0;
  const handleReplay = onReplay || onRetryLevel;
  useEffect(() => {
    if (isOpen) {
      playLevelCompleteFanfare();
      const timer = setTimeout(() => {
        playMaShaAllahCelebration();
      }, 400);
      fireCelebrationConfetti();
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !journey) return null;

  const totalComponents = journey.components.length;
  const earnedCount = earnedRewardIds.length;
  const progressPercent = Math.min(
    100,
    Math.round((earnedCount / totalComponents) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#081f15] border-2 border-emerald-300 dark:border-emerald-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Celebration Ribbon */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black shadow-sm">
            <Trophy className="w-3.5 h-3.5 fill-amber-950" />
            <span>মাশাআল্লাহ! লেভেল {levelId} সম্পন্ন!</span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            مَا شَاءَ اللَّهُ! চমৎকার খেলেছো!
          </h3>

          {/* 3-Star Rating Display */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 ${
                  starIdx <= finalStars
                    ? "fill-amber-400 text-amber-500 scale-110 drop-shadow-md animate-bounce"
                    : "fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-700"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            তুমি এই লেভেলে <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{finalScore} পয়েন্ট</span> অর্জন করেছো!
          </p>
        </div>

        {/* Newly Earned Component Spotlight */}
        {newlyEarnedComponent ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border-2 border-amber-300 dark:border-amber-600/80 shadow-md flex items-center gap-3.5 animate-scale-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 dark:from-amber-500 dark:to-amber-400 flex items-center justify-center text-2xl sm:text-3xl shadow-md shrink-0 animate-pulse">
              {newlyEarnedComponent.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                <Award className="w-3 h-3" /> নতুন যন্ত্রাংশ আনলক হয়েছে!
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {newlyEarnedComponent.nameBn}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                {newlyEarnedComponent.descBn}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
            🔄 লেভেলটি পুনরায় সফলভাবে সম্পন্ন হয়েছে! তোমার পূর্বের যন্ত্রাংশ সুরক্ষিত আছে।
          </div>
        )}

        {/* Interactive Layered Building Construction Visual Scene */}
        <div className="pt-1">
          <InteractiveBuildingVisualizer
            gameId={journey.id}
            earnedRewardIds={earnedRewardIds}
            newlyEarnedId={newlyEarnedComponent?.id}
            isCelebration={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          {onNextLevel && (
            <button
              type="button"
              data-testid="next-level-btn"
              onClick={() => {
                playTapSound();
                onNextLevel();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>পরবর্তী লেভেলে চলো</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {handleReplay && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                handleReplay();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>আবার খেলো</span>
            </button>
          )}

          {onBackToMenu && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onBackToMenu();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>গেম তালিকা</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
