"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  HelpCircle,
  Volume2,
  BookOpen,
} from "lucide-react";
import { KIDS_ARABIC_LETTERS, KIDS_DOT_GAME_LEVELS } from "../../data/kidsGameData";
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

const DOT_CHOICES = [
  { count: 0, label: "০", dotsUi: "খালি (০)", key: "0" },
  { count: 1, label: "১", dotsUi: "●", key: "1" },
  { count: 2, label: "২", dotsUi: "● ●", key: "2" },
  { count: 3, label: "৩", dotsUi: "● ● ●", key: "3" },
];

export default function DotCountGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("dot-count");

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);

  const activeLevel = KIDS_DOT_GAME_LEVELS.find((l) => l.id === currentLevelId) || KIDS_DOT_GAME_LEVELS[0];

  // Get letter pool based on level configuration
  const getLevelPool = useCallback(() => {
    if (activeLevel.pool) {
      return KIDS_ARABIC_LETTERS.filter((l) => activeLevel.pool.includes(l.ar));
    }
    return KIDS_ARABIC_LETTERS;
  }, [activeLevel]);

  const startRound = useCallback(() => {
    const pool = getLevelPool();
    if (!pool.length) return;
    const rand = pool[Math.floor(Math.random() * pool.length)];
    setCurrentLetter(rand);
    setWrongAttempts(0);
    setShowHint(false);

    playVoicePrompt("how_many_dots");
    const timer = setTimeout(() => {
      playArabicSound(rand.ar);
    }, 600);
    return () => clearTimeout(timer);
  }, [getLevelPool]);

  useEffect(() => {
    startRound();
  }, [round, currentLevelId, startRound]);

  // Open teach modal if level not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevelId)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevelId, completedLevels]);

  // Keyboard navigation for desktop: 0, 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon || isCelebrationOpen || isTeachModalOpen) return;
      const foundChoice = DOT_CHOICES.find((c) => c.key === e.key);
      if (foundChoice) {
        handleSelectChoice(foundChoice);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSelectChoice = (choice) => {
    if (!currentLetter || isWon) return;
    playTapSound();

    if (choice.count === currentLetter.dots) {
      playArabicSound(currentLetter.ar);
      playCorrectChime();
      playStarPopSound(2);
      const points = wrongAttempts === 0 ? 15 : 10;
      const nextScore = score + points;
      setScore(nextScore);

      if (round >= 5) {
        setIsWon(true);
        const earnedStars = nextScore >= 60 ? 3 : nextScore >= 40 ? 2 : 1;
        const rewardResult = completeLevel(currentLevelId, earnedStars, nextScore, KIDS_DOT_GAME_LEVELS.length);
        setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
        setIsCelebrationOpen(true);
        if (onEarnReward) onEarnReward(30);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
        }, 700);
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
    if (currentLevelId < KIDS_DOT_GAME_LEVELS.length) {
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

  const levelPoolLetters = getLevelPool().slice(0, 6);

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F5F0FF] border-3 sm:border-4 border-purple-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-purple-100 pb-2.5 sm:pb-3 flex-wrap gap-2">
        <button
          type="button"
          data-testid="game-back-btn"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 text-purple-900 text-xs font-bold border border-purple-200">
            <span>{journey.icon}</span>
            <span>{earnedRewardIds.length}/{journey.totalMilestones} উপাদান</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="হরফ ও নুকতা দেখে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিখে নাও</span>
          </button>

          <span className="kids-font text-xs font-bold text-slate-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
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
        {KIDS_DOT_GAME_LEVELS.map((lvl, idx) => {
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
                  ? "bg-purple-600 border-purple-700 text-white shadow-md scale-105"
                  : isDone
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : unlocked
                  ? "bg-white border-purple-200 text-purple-900 hover:bg-purple-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {lvlStars > 0 && <span className="text-amber-400 text-[10px]">{"⭐".repeat(lvlStars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── 🌴 INTERACTIVE AMAL FRUIT GARDEN BUILDING SCENE ── */}
      <InteractiveBuildingVisualizer
        gameId="dot-count"
        earnedRewardIds={earnedRewardIds}
        currentLevel={currentLevelId}
      />

      {/* ── LEVEL BANNER & OBJECTIVE ── */}
      <div className="text-center space-y-1">
        <h2 className="text-sm sm:text-base font-black text-purple-900">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="space-y-4">
        {/* Letter Card */}
        {currentLetter && (
          <div
            data-testid="current-letter-card"
            data-target-dots={currentLetter.dots}
            data-ar={currentLetter.ar}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-50 via-white to-purple-100/60 border-3 border-purple-300 shadow-md flex flex-col items-center justify-center gap-2 group"
          >
            <button
              type="button"
              onClick={() => playArabicSound(currentLetter.ar)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs cursor-pointer transition active:scale-95"
              title="উচ্চারণ শুনুন"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <span className="font-uthmani text-7xl sm:text-8xl text-purple-950 font-bold leading-none select-none drop-shadow-sm">
              {currentLetter.ar}
            </span>
            <span className="text-xs font-black text-purple-800 bg-purple-100/80 px-3 py-0.5 rounded-full">
              {currentLetter.nameBn}
            </span>
          </div>
        )}

        {/* Hint Card */}
        {showHint && activeLevel.tipBn && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 animate-fade-in">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>ইঙ্গিত:</strong> {activeLevel.tipBn}
            </span>
          </div>
        )}

        {/* 4 Choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {DOT_CHOICES.map((choice) => (
            <button
              key={choice.count}
              type="button"
              data-testid={`dot-choice-${choice.count}`}
              data-count={choice.count}
              onClick={() => handleSelectChoice(choice)}
              className="p-3 sm:p-4 rounded-2xl bg-white hover:bg-purple-50 border-3 border-purple-300 hover:border-purple-500 shadow-[0_4px_0_0_#C084FC] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <span className="text-2xl sm:text-3xl font-black text-purple-950">{choice.label}</span>
              <span className="text-[11px] font-bold text-slate-500">{choice.dotsUi}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-slate-400">
          💡 কীবোর্ডের 0, 1, 2, 3 চেপেও উত্তর দিতে পারবে
        </p>
      </div>

      {/* Mascot Guidance */}
      <div className="flex justify-center pt-1">
        <NuruMascot
          size="sm"
          mood={isWon ? "celebrating" : wrongAttempts > 0 ? "thinking" : "happy"}
          dialogue={
            isWon
              ? "দারুণ নুকতা গণনা করেছো! চলো পরের লেভেলে যাই!"
              : wrongAttempts > 0
              ? "চিন্তা নেই! হরফটির উপরে বা নিচে ভালো করে দেখো।"
              : "হরফটির নুকতা গুনে সঠিক বাটনটিতে চাপ দাও!"
          }
        />
      </div>

      {/* ── TEACH BEFORE PLAY MODAL ── */}
      <TeachBeforePlayModal
        isOpen={isTeachModalOpen}
        title={activeLevel.title}
        instructionsBn="খেলা শুরুর আগে এই লেভেলের হরফগুলো শোনো এবং নুকতার অবস্থান খেয়াল করো!"
        learningItems={levelPoolLetters.map((l) => ({
          ar: l.ar,
          nameBn: `${l.nameBn} (${l.dots === 0 ? "নুকতাহীন" : `${l.dots}টি নুকতা`})`,
          tip: l.dotPos === "bottom" ? "নিচে নুকতা" : l.dotPos === "top" ? "উপরে নুকতা" : l.dotPos === "inside" ? "পেটে নুকতা" : "নুকতাহীন",
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
