"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  playArabicSound,
  playCorrectChime,
  playWrongBuzzer,
  playStarPopSound,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import NuruMascot from "../kids/NuruMascot";
import { useQuranGameProgress } from "../../hooks/useQuranGameProgress";
import BuildingRewardCelebrationModal from "./BuildingRewardCelebrationModal";
import TeachBeforePlayModal from "./TeachBeforePlayModal";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

const BALLOON_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: যবর (َ ) বেলুন পপ",
    target: "যবর (َ )",
    targetChar: "َ",
    instructionBn: "যেসব বেলুনে যবর ( َ ) আছে সেগুলো খুঁজে খুঁজে ফাটাও!",
    letters: [
      { ar: "بَ", correct: true, sound: "بَ", nameBn: "বা যবর বা" },
      { ar: "بِ", correct: false, sound: "بِ", nameBn: "বা যের বি" },
      { ar: "بُ", correct: false, sound: "بُ", nameBn: "বা পেশ বু" },
      { ar: "تَ", correct: true, sound: "تَ", nameBn: "তা যবর তা" },
      { ar: "ثَ", correct: true, sound: "ثَ", nameBn: "ছা যবর ছা" },
      { ar: "جِ", correct: false, sound: "جِ", nameBn: "জীম যের জি" },
    ],
  },
  {
    id: 2,
    title: "লেভেল ২: যের (ِ ) বেলুন পপ",
    target: "যের (ِ )",
    targetChar: "ِ",
    instructionBn: "যেসব বেলুনে যের ( ِ ) আছে সেগুলো সাবধানে ফাটাও!",
    letters: [
      { ar: "سِ", correct: true, sound: "سِ", nameBn: "সীন যের সি" },
      { ar: "سَ", correct: false, sound: "سَ", nameBn: "সীন যবর সা" },
      { ar: "مِ", correct: true, sound: "مِ", nameBn: "মীম যের মি" },
      { ar: "مُ", correct: false, sound: "مُ", nameBn: "মীম পেশ মু" },
      { ar: "رِ", correct: true, sound: "رِ", nameBn: "রা যের রি" },
      { ar: "دَ", correct: false, sound: "دَ", nameBn: "দাল যবর দা" },
    ],
  },
  {
    id: 3,
    title: "লেভেল ৩: পেশ (ُ ) বেলুন পপ",
    target: "পেশ (ُ )",
    targetChar: "ُ",
    instructionBn: "যেসব বেলুনে পেশ ( ُ ) আছে সেগুলো খুঁজে বের করো!",
    letters: [
      { ar: "نُ", correct: true, sound: "نُ", nameBn: "নূন পেশ নু" },
      { ar: "نَ", correct: false, sound: "نَ", nameBn: "নূন যবর না" },
      { ar: "رُ", correct: true, sound: "رُ", nameBn: "রা পেশ রু" },
      { ar: "رِ", correct: false, sound: "رِ", nameBn: "রা যের রি" },
      { ar: "كُ", correct: true, sound: "كُ", nameBn: "কাফ পেশ কু" },
      { ar: "لَ", correct: false, sound: "لَ", nameBn: "লাম যবর লা" },
    ],
  },
];

export default function BalloonPopGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("balloon-pop");

  const [score, setScore] = useState(0);
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);

  const activeLevel =
    BALLOON_LEVELS.find((l) => l.id === currentLevelId) || BALLOON_LEVELS[0];

  const initLevel = useCallback(() => {
    setPoppedBalloons([]);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initLevel();
  }, [currentLevelId, initLevel]);

  // Open teach modal if level not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevelId)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevelId, completedLevels]);

  const handlePopBalloon = (item, idx) => {
    if (poppedBalloons.includes(idx) || isWon || isCelebrationOpen) return;
    playTapSound();
    playArabicSound(item.sound);

    if (item.correct) {
      playCorrectChime();
      playStarPopSound(1);
      const nextPopped = [...poppedBalloons, idx];
      setPoppedBalloons(nextPopped);
      const nextScore = score + 10;
      setScore(nextScore);

      // Check if all correct balloons are popped
      const remainingCorrect = activeLevel.letters.filter(
        (l, i) => l.correct && !nextPopped.includes(i)
      );

      if (remainingCorrect.length === 0) {
        setIsWon(true);
        const rewardResult = completeLevel(
          currentLevelId,
          3,
          nextScore,
          BALLOON_LEVELS.length
        );
        setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
        setIsCelebrationOpen(true);

        if (onEarnReward) onEarnReward(20);
      }
    } else {
      playWrongBuzzer();
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    if (currentLevelId < BALLOON_LEVELS.length) {
      setCurrentLevel(currentLevelId + 1);
    } else {
      setCurrentLevel(1);
    }
    initLevel();
  };

  const handleRetryLevel = () => {
    setIsCelebrationOpen(false);
    initLevel();
  };

  const learningPool = activeLevel.letters
    .filter((l) => l.correct)
    .map((l) => ({
      ar: l.ar,
      nameBn: l.nameBn,
      tip: `হরকত: ${activeLevel.target}`,
    }));

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FDF4] border-3 sm:border-4 border-emerald-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-2.5 sm:pb-3 flex-wrap gap-2">
        <button
          type="button"
          data-testid="game-back-btn"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-200">
            <span>{journey.icon}</span>
            <span>{earnedRewardIds.length}/{journey.totalMilestones} উপাদান</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="হরকত দেখে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিখে নাও</span>
          </button>

          <span className="kids-font text-xs font-bold text-slate-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            পয়েন্ট: {score}
          </span>

          <button
            type="button"
            onClick={handleRetryLevel}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="নতুন করে শুরু"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── LEVEL SELECTOR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {BALLOON_LEVELS.map((lvl, idx) => {
          const lvlStars = stars[lvl.id] || 0;
          const isActive = lvl.id === currentLevelId;
          const unlocked = isLevelUnlocked(lvl.id, idx);

          return (
            <button
              key={lvl.id}
              type="button"
              disabled={!unlocked}
              onClick={() => {
                if (!unlocked) return;
                playTapSound();
                setCurrentLevel(lvl.id);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                isActive
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md scale-105"
                  : unlocked
                  ? "bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
              }`}
            >
              <span>{unlocked ? lvl.title : `🔒 ${lvl.title}`}</span>
              {lvlStars > 0 && (
                <span className="text-amber-300 text-[10px]">
                  {"⭐".repeat(lvlStars)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 🎡 INTERACTIVE KIDS FUN PARK BUILDING SCENE ── */}
      <InteractiveBuildingVisualizer
        gameId="balloon-pop"
        earnedRewardIds={earnedRewardIds}
        currentLevel={currentLevelId}
      />

      {/* ── LEVEL OBJECTIVE ── */}
      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-emerald-950">
          🎯 খুঁজে বের করো: {activeLevel.target} যুক্ত বেলুন!
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          {activeLevel.instructionBn}
        </p>
      </div>

      {/* ── BALLOONS GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto py-2">
        {activeLevel.letters.map((item, idx) => {
          const isPopped = poppedBalloons.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              data-testid={`balloon-${idx}`}
              data-correct={item.correct ? "true" : "false"}
              data-ar={item.ar}
              disabled={isPopped}
              onClick={() => handlePopBalloon(item, idx)}
              className={`h-28 sm:h-36 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-2.5 sm:p-3 relative transition-all duration-300 select-none cursor-pointer ${
                isPopped
                  ? "opacity-20 scale-75 bg-slate-100 border-dashed border-2 border-slate-300"
                  : "bg-gradient-to-t from-emerald-500 via-teal-500 to-emerald-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 border-2 border-emerald-200"
              }`}
            >
              <span className="text-3xl sm:text-5xl font-bold font-arabic mb-0.5 sm:mb-1 leading-tight">
                {item.ar}
              </span>
              <span className="text-[10px] font-semibold opacity-90">
                {isPopped ? "ফুটেছে 🎈" : "ট্যাপ করো 🎈"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mascot Guidance */}
      <div className="flex justify-center pt-1">
        <NuruMascot
          size="sm"
          mood={isWon ? "celebrating" : "happy"}
          dialogue={
            isWon
              ? "মাশাআল্লাহ! আনন্দ পার্কের নতুন অংশ আনলক হয়েছে!"
              : `যেসব হরফে ${activeLevel.target} আছে সেগুলো খুঁজে বেলুনে চাপ দাও!`
          }
        />
      </div>

      {/* ── TEACH BEFORE PLAY MODAL ── */}
      <TeachBeforePlayModal
        isOpen={isTeachModalOpen}
        title={activeLevel.title}
        instructionsBn={activeLevel.instructionBn}
        learningItems={learningPool}
        onStartGame={() => setIsTeachModalOpen(false)}
      />

      {/* ── BUILDING REWARD CELEBRATION MODAL ── */}
      <BuildingRewardCelebrationModal
        isOpen={isCelebrationOpen}
        journey={journey}
        earnedStars={3}
        earnedScore={score}
        newlyEarnedComponent={newlyEarnedComponent}
        earnedRewardIds={earnedRewardIds}
        journeyProgressPercent={Math.min(
          100,
          Math.round((earnedRewardIds.length / journey.totalMilestones) * 100)
        )}
        isJourneyComplete={earnedRewardIds.length >= journey.totalMilestones}
        onNextLevel={handleNextLevel}
        onRetryLevel={handleRetryLevel}
        onBackToMenu={onBack}
      />
    </div>
  );
}

