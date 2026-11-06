"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { KIDS_HARAKAT_GAME_LEVELS } from "../../data/kidsGameData";
import { universalAudioEngine } from "@/lib/quran/audio";
import {
  playArabicSound,
  playCorrectChime,
  playWrongBuzzer,
  playStarPopSound,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import { playVoicePrompt } from "../../lib/voicePrompts";
import NuruMascot from "../kids/NuruMascot";
import { useQuranGameProgress } from "../../hooks/useQuranGameProgress";
import BuildingRewardCelebrationModal from "./BuildingRewardCelebrationModal";
import TeachBeforePlayModal from "./TeachBeforePlayModal";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

export default function HarakatGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("harakat-master");

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);

  const activeLevel = KIDS_HARAKAT_GAME_LEVELS.find((l) => l.id === currentLevelId) || KIDS_HARAKAT_GAME_LEVELS[0];

  const playHarakatAudio = useCallback((item) => {
    if (!item) return;
    if (item.audio) {
      universalAudioEngine.playWord(item.audio, {
        onError: () => {
          if (item.ar) playArabicSound(item.ar);
        },
      });
    } else if (item.ar) {
      playArabicSound(item.ar);
    }
  }, []);

  const startRound = useCallback(() => {
    let pool = activeLevel.items;
    if (activeLevel.mixed) {
      pool = [
        { ar: "بَ", nameBn: "বা যবর বা", harakat: "যবর", symbol: "َ" },
        { ar: "بِ", nameBn: "বা যের বি", harakat: "যের", symbol: "ِ" },
        { ar: "بُ", nameBn: "বা পেশ বু", harakat: "পেশ", symbol: "ُ" },
        { ar: "تَ", nameBn: "তা যবর তা", harakat: "যবর", symbol: "َ" },
        { ar: "تِ", nameBn: "তা যের তি", harakat: "যের", symbol: "ِ" },
        { ar: "تُ", nameBn: "তা পেশ তু", harakat: "পেশ", symbol: "ُ" },
        { ar: "جَ", nameBn: "জীম যবর জা", harakat: "যবর", symbol: "َ" },
        { ar: "جِ", nameBn: "জীম যের জি", harakat: "যের", symbol: "ِ" },
        { ar: "جُ", nameBn: "জীম পেশ জু", harakat: "পেশ", symbol: "ُ" },
      ];
    }

    if (!pool || !pool.length) return;
    const rand = pool[Math.floor(Math.random() * pool.length)];
    setTarget(rand);
    setWrongAttempts(0);
    setShowHint(false);

    const timer = setTimeout(() => {
      playHarakatAudio(rand);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeLevel, playHarakatAudio]);

  useEffect(() => {
    startRound();
  }, [round, currentLevelId, startRound]);

  // Open teach modal if level not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevelId)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevelId, completedLevels]);

  const handleHearAgain = () => {
    if (target) {
      playHarakatAudio(target);
    }
  };

  const handleSelectHarakat = (harakatName) => {
    if (!target || isWon) return;
    playTapSound();

    const isWordPractice = Boolean(
      activeLevel.words || activeLevel.jazm || activeLevel.tashdeed || activeLevel.madd
    );

    const isMatch = target.harakat
      ? target.harakat === harakatName || target.harakat.includes(harakatName)
      : isWordPractice || activeLevel.harakat === harakatName;

    if (isMatch) {
      playCorrectChime();
      playStarPopSound(2);
      const points = wrongAttempts === 0 ? 15 : 10;
      const nextScore = score + points;
      setScore(nextScore);

      if (round >= 5) {
        setIsWon(true);
        const earnedStars = nextScore >= 60 ? 3 : nextScore >= 40 ? 2 : 1;
        const rewardResult = completeLevel(currentLevelId, earnedStars, nextScore, KIDS_HARAKAT_GAME_LEVELS.length);
        setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
        setIsCelebrationOpen(true);
        if (onEarnReward) onEarnReward(30);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
        }, 750);
      }
    } else {
      playWrongBuzzer();
      playVoicePrompt("try_again");
      setWrongAttempts((w) => w + 1);
      setShowHint(true);
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    if (currentLevelId < KIDS_HARAKAT_GAME_LEVELS.length) {
      setCurrentLevel(currentLevelId + 1);
      setRound(1);
      setScore(0);
      setIsWon(false);
    } else {
      setCurrentLevel(1);
      setRound(1);
      setScore(0);
      setIsWon(false);
    }
  };

  const handleRetryLevel = () => {
    setIsCelebrationOpen(false);
    setRound(1);
    setScore(0);
    setIsWon(false);
    startRound();
  };

  // Keyboard support: 1 = যবর, 2 = যের, 3 = পেশ
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon || isCelebrationOpen || isTeachModalOpen) return;
      if (e.key === "1") handleSelectHarakat("যবর");
      if (e.key === "2") handleSelectHarakat("যের");
      if (e.key === "3") handleSelectHarakat("পেশ");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const levelItemsPreview = (activeLevel.items || []).slice(0, 6);

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FFF8] border-3 sm:border-4 border-emerald-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
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
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-200">
            <span>{journey.icon}</span>
            <span>{earnedRewardIds.length}/{journey.totalMilestones} নির্মাণ</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="হরকত ও উচ্চারণ দেখে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিখে নাও</span>
          </button>

          <span className="kids-font text-xs font-bold text-slate-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            প্রশ্ন {round}/৫ · পয়েন্ট: {score}
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

      {/* ── LEVEL SELECTOR CAROUSEL ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {KIDS_HARAKAT_GAME_LEVELS.map((lvl, idx) => {
          const lvlStars = stars[lvl.id] || 0;
          const isActive = lvl.id === currentLevelId;
          const unlocked = isLevelUnlocked(lvl.id, idx);
          const isDone = completedLevels.includes(lvl.id);
          return (
            <button
              key={lvl.id}
              type="button"
              disabled={!unlocked}
              onClick={() => {
                if (unlocked) {
                  playTapSound();
                  setCurrentLevel(lvl.id);
                  setRound(1);
                  setScore(0);
                  setIsWon(false);
                }
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                isActive
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md scale-105"
                  : isDone
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : unlocked
                  ? "bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {lvlStars > 0 && <span className="text-amber-400 text-[10px]">{"⭐".repeat(lvlStars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── 🕌 INTERACTIVE NOOR CITY & GRAND MOSQUE BUILDING SCENE ── */}
      <InteractiveBuildingVisualizer
        gameId="harakat-master"
        earnedRewardIds={earnedRewardIds}
        currentLevel={currentLevelId}
      />

      {/* ── LEVEL BANNER ── */}
      <div className="text-center space-y-1">
        <h2 className="text-sm sm:text-base font-black text-emerald-900">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="space-y-4">
        {/* Letter / Harakat Card */}
        {target && (
          <div
            data-testid="current-harakat-card"
            data-target-harakat={target.harakat || activeLevel.harakat || "যবর"}
            data-target-ar={target.ar}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-emerald-100/60 border-3 border-emerald-300 shadow-md flex flex-col items-center justify-center gap-2 group"
          >
            <button
              type="button"
              onClick={handleHearAgain}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs cursor-pointer transition active:scale-95"
              title="আবার শুনুন"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <span className="font-uthmani text-6xl sm:text-7xl text-emerald-950 font-bold leading-tight select-none drop-shadow-sm">
              {target.ar}
            </span>

            {target.nameBn && (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-3 py-0.5 rounded-full">
                {target.nameBn}
              </span>
            )}
          </div>
        )}

        {/* Hint */}
        {showHint && activeLevel.tipBn && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 animate-fade-in">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>ইঙ্গিত:</strong> {activeLevel.tipBn}
            </span>
          </div>
        )}

        {/* 3 Choices (Fatha / Kasra / Damma) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <button
            type="button"
            data-testid="harakat-btn-zabar"
            onClick={() => handleSelectHarakat("যবর")}
            className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 shadow-[0_4px_0_0_#34D399] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span className="text-xl sm:text-2xl font-black text-emerald-950">যবর (َ )</span>
            <span className="text-[10px] font-bold text-slate-500">উপরে দাগ</span>
          </button>

          <button
            type="button"
            data-testid="harakat-btn-zer"
            onClick={() => handleSelectHarakat("যের")}
            className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 shadow-[0_4px_0_0_#34D399] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span className="text-xl sm:text-2xl font-black text-emerald-950">যের (ِ )</span>
            <span className="text-[10px] font-bold text-slate-500">নিচে দাগ</span>
          </button>

          <button
            type="button"
            data-testid="harakat-btn-pesh"
            onClick={() => handleSelectHarakat("পেশ")}
            className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 shadow-[0_4px_0_0_#34D399] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span className="text-xl sm:text-2xl font-black text-emerald-950">পেশ (ُ )</span>
            <span className="text-[10px] font-bold text-slate-500">উপরে ওয়াও-এর মতো</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400">
          💡 কীবোর্ডের 1 (যবর), 2 (যের), 3 (পেশ) চেপেও উত্তর দিতে পারবে
        </p>
      </div>

      {/* Mascot Dialogue */}
      <div className="flex justify-center pt-1">
        <NuruMascot
          size="sm"
          mood={isWon ? "celebrating" : wrongAttempts > 0 ? "thinking" : "happy"}
          dialogue={
            isWon
              ? "মাশাআল্লাহ! হরকত একদম নির্ভুল চিনেছো!"
              : wrongAttempts > 0
              ? "চিন্তা নেই! হরকতটি হরফের উপরে নাকি নিচে ভালো করে দেখো।"
              : "উচ্চারণটি শুনে বলো— এটি যবর, যের নাকি পেশ?"
          }
        />
      </div>

      {/* ── TEACH BEFORE PLAY MODAL ── */}
      <TeachBeforePlayModal
        isOpen={isTeachModalOpen}
        title={activeLevel.title}
        instructionsBn="খেলা শুরুর আগে এই লেভেলের হরকত ও উদাহরণগুলো শুনে নাও!"
        learningItems={levelItemsPreview.map((it) => ({
          ar: it.ar,
          nameBn: it.nameBn || it.ar,
          audio: it.audio,
          tip: it.harakat ? `হরকত: ${it.harakat}` : activeLevel.instructionBn,
        }))}
        onStartGame={() => setIsTeachModalOpen(false)}
      />

      {/* ── BUILDING REWARD CELEBRATION MODAL ── */}
      <BuildingRewardCelebrationModal
        isOpen={isCelebrationOpen}
        levelId={currentLevelId}
        stars={score >= 60 ? 3 : score >= 40 ? 2 : 1}
        score={score}
        journey={journey}
        newlyEarnedComponent={newlyEarnedComponent}
        earnedRewardIds={earnedRewardIds}
        onNextLevel={handleNextLevel}
        onReplay={handleRetryLevel}
      />
    </div>
  );
}
