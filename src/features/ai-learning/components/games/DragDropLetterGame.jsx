"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  Star,
  Award,
  CheckCircle2,
  Zap,
  BookOpen,
} from "lucide-react";
import {
  universalAudioEngine,
  playArabicSound,
  playFeedbackChime,
} from "@/lib/quran/universal-audio-engine";
import NuruMascot from "../kids/NuruMascot";
import { DRAG_DROP_LEVELS } from "../../data/dragDropGameData";
import { useQuranGameProgress } from "../../hooks/useQuranGameProgress";
import BuildingRewardCelebrationModal from "./BuildingRewardCelebrationModal";
import TeachBeforePlayModal from "./TeachBeforePlayModal";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

export default function DragDropLetterGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    percentComplete,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("drag-drop-letter");

  // levelIndex 0-based
  const levelIndex = Math.max(0, Math.min(DRAG_DROP_LEVELS.length - 1, currentLevelId - 1));
  const currentLevel = DRAG_DROP_LEVELS[levelIndex] || DRAG_DROP_LEVELS[0];

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [placedSlots, setPlacedSlots] = useState({});
  const [shuffledCards, setShuffledCards] = useState([]);
  const [score, setScore] = useState(0);
  const [isLevelWon, setIsLevelWon] = useState(false);
  const [mascotFeedback, setMascotFeedback] = useState("হরফগুলোতে চাপ দিয়ে সঠিক ঘরে মেলাও!");
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);

  // Initialize round
  const setupLevel = useCallback((lvl) => {
    const shuffled = [...lvl.letters].sort(() => 0.5 - Math.random());
    setShuffledCards(shuffled);
    setPlacedSlots({});
    setSelectedLetter(null);
    setIsLevelWon(false);
    setIsCelebrationOpen(false);
    setMascotFeedback("হরফগুলোতে চাপ দিয়ে সঠিক ঘরে মেলাও!");
  }, []);

  useEffect(() => {
    setupLevel(currentLevel);
  }, [currentLevel, setupLevel]);

  // Show intro learning screen on new level if not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevel.id)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevel.id, completedLevels]);

  // Handle letter select
  const handleSelectLetter = (letter) => {
    const isAlreadyPlaced = Object.values(placedSlots).some((p) => p.ar === letter.ar);
    if (isAlreadyPlaced) return;

    setSelectedLetter(letter);
    if (letter.audio) {
      universalAudioEngine.playWord(letter.audio);
    } else {
      playArabicSound(letter.ar);
    }
    playFeedbackChime("tap");
    const isWord = letter.nameBn && (currentLevel.id >= 11 || letter.ar.length > 2);
    setMascotFeedback(`এটি '${letter.nameBn}' ${isWord ? "শব্দ" : "হরফ"}। এবার নিচের সঠিক খোপে বসাও!`);
  };

  // Handle slot click
  const handleSlotClick = (slotTarget, slotIndex) => {
    if (placedSlots[slotIndex]) {
      const placed = placedSlots[slotIndex];
      if (placed.audio) {
        universalAudioEngine.playWord(placed.audio);
      } else {
        playArabicSound(placed.ar);
      }
      return;
    }

    if (!selectedLetter) {
      if (slotTarget.audio) {
        universalAudioEngine.playWord(slotTarget.audio);
      } else {
        playArabicSound(slotTarget.ar);
      }
      const isWord = slotTarget.nameBn && (currentLevel.id >= 11 || slotTarget.ar.length > 2);
      setMascotFeedback(`আগে '${slotTarget.nameBn}' ${isWord ? "শব্দটির" : "হরফটির"} কার্ডে ক্লিক করো, তারপর এখানে বসাও!`);
      return;
    }

    // Check Match
    if (selectedLetter.ar === slotTarget.ar) {
      playFeedbackChime("correct");
      if (selectedLetter.audio) {
        universalAudioEngine.playWord(selectedLetter.audio);
      } else {
        playArabicSound(selectedLetter.ar);
      }

      const newPlaced = { ...placedSlots, [slotIndex]: selectedLetter };
      setPlacedSlots(newPlaced);
      setSelectedLetter(null);
      const newScore = score + 10;
      setScore(newScore);
      setMascotFeedback(`মাশাআল্লাহ! '${selectedLetter.nameBn}' সঠিকভাবে মিলেছে!`);

      // Check Level Win
      if (Object.keys(newPlaced).length === currentLevel.letters.length) {
        setIsLevelWon(true);
        const rewardResult = completeLevel(currentLevel.id, 3, newScore, DRAG_DROP_LEVELS.length);
        setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
        setIsCelebrationOpen(true);
        if (onEarnReward) onEarnReward(30);
      }
    } else {
      playFeedbackChime("wrong");
      setMascotFeedback(`না, এটি '${slotTarget.nameBn}'-এর ঘর। আবার চেষ্টা করো!`);
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    if (levelIndex < DRAG_DROP_LEVELS.length - 1) {
      setCurrentLevel(DRAG_DROP_LEVELS[levelIndex + 1].id);
    } else {
      setCurrentLevel(DRAG_DROP_LEVELS[0].id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5 p-2 sm:p-5 font-hind-siliguri animate-fade-in">
      {/* ── TOP HEADER & SCORE BAR ── */}
      <div className="flex items-center justify-between bg-white dark:bg-[#071912] border border-emerald-100 dark:border-emerald-900/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              data-testid="game-back-btn"
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="গেম লিস্টে ফিরুন"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> নূর হরফ মেলানো • লেভেল {currentLevel.id} / {DRAG_DROP_LEVELS.length}
            </span>
            <h2 className="text-sm sm:text-lg font-black text-slate-800 dark:text-white leading-tight">
              {currentLevel.title}
            </h2>
          </div>
        </div>

        {/* Level Controls & Building Journey Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Badge */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold shadow-2xs">
            <span>{journey.icon}</span>
            <span>{earnedRewardIds.length}/{journey.totalMilestones} যন্ত্রাংশ</span>
          </div>

          {/* Teach / Instructions Button */}
          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
            title="পাঠ ও উচ্চারণ শুনে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">শিখে নাও</span>
          </button>

          {/* Score Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-black shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{score} পয়েন্ট</span>
          </div>

          <button
            type="button"
            onClick={() => setupLevel(currentLevel)}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all cursor-pointer"
            title="পুনরায় শুরু"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* ── LEVEL SELECTOR BAR ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
        {DRAG_DROP_LEVELS.map((lvl, idx) => {
          const unlocked = isLevelUnlocked(lvl.id, idx);
          const isCurrent = lvl.id === currentLevel.id;
          const isDone = completedLevels.includes(lvl.id);
          return (
            <button
              key={lvl.id}
              type="button"
              disabled={!unlocked}
              onClick={() => {
                if (unlocked) setCurrentLevel(lvl.id);
              }}
              className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
                isCurrent
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105 ring-2 ring-emerald-300"
                  : isDone
                  ? "bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                  : unlocked
                  ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <span>{lvl.id}</span>
              {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* ── 🚗 INTERACTIVE VEHICLE BUILDING WORKSHOP CANVAS ── */}
      <InteractiveBuildingVisualizer
        gameId="drag-drop-letter"
        earnedRewardIds={earnedRewardIds}
        currentLevel={currentLevel.id}
      />

      {/* ── MASCOT COMPANION DIALOGUE ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center">
          <NuruMascot
            mood={isLevelWon ? "celebrating" : selectedLetter ? "encouraging" : "happy"}
            size={40}
            showName={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 leading-snug">
            {mascotFeedback}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {currentLevel.desc}
          </span>
        </div>
      </div>

      {/* ── GAME PLAYGROUND ── */}
      <div className="bg-white dark:bg-[#071912] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl flex flex-col gap-5 sm:gap-7">
        {/* ROW 1: TARGET SLOTS */}
        <div className="space-y-2">
          <span className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 text-center">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" /> সঠিক স্থানে মিলিয়ে হরফটি বসাও:
          </span>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-xl mx-auto w-full">
            {currentLevel.letters.map((target, idx) => {
              const isFilled = placedSlots[idx] !== undefined;
              const isTargetWord = target.ar.length > 2;
              return (
                <div
                  key={idx}
                  data-testid={`slot-${idx}`}
                  data-target-ar={target.ar}
                  onClick={() => handleSlotClick(target, idx)}
                  className={`min-h-[96px] sm:h-36 md:h-40 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-dashed flex flex-col items-center justify-center p-1.5 sm:p-3 transition-all cursor-pointer relative overflow-hidden ${
                    isFilled
                      ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-md ring-2 sm:ring-4 ring-emerald-400/30"
                      : selectedLetter?.ar === target.ar
                      ? "border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 animate-pulse scale-102"
                      : "border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/60 dark:bg-slate-900/40"
                  }`}
                >
                  {isFilled ? (
                    <>
                      <span
                        className={`font-amiri font-bold text-emerald-700 dark:text-emerald-300 leading-tight px-1 text-center ${
                          isTargetWord
                            ? "text-lg sm:text-2xl md:text-4xl"
                            : "text-3xl sm:text-5xl md:text-6xl"
                        }`}
                      >
                        {placedSlots[idx].ar}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 truncate max-w-full px-1">
                        {placedSlots[idx].nameBn} ✓
                      </span>
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 dark:text-slate-500 truncate max-w-full px-1 text-center">
                        {target.nameBn}
                      </span>
                      <span
                        className={`font-amiri text-slate-300 dark:text-slate-700 select-none mt-0.5 leading-tight px-1 text-center ${
                          isTargetWord
                            ? "text-base sm:text-xl md:text-3xl"
                            : "text-2xl sm:text-3xl md:text-4xl"
                        }`}
                      >
                        {target.ar}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                        (এখানে বসাও)
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 2: SOURCE CARDS POOL */}
        <div className="space-y-2.5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-emerald-900/60">
          <span className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 text-center">
            হরফ কার্ড নির্বাচন করো:
          </span>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto w-full">
            {shuffledCards.map((letter) => {
              const isPlaced = Object.values(placedSlots).some((p) => p.ar === letter.ar);
              const isSelected = selectedLetter?.ar === letter.ar;
              const isWord = letter.ar.length > 2;

              return (
                <button
                  key={letter.ar}
                  type="button"
                  data-testid={`card-${letter.ar}`}
                  data-card-ar={letter.ar}
                  disabled={isPlaced}
                  onClick={() => handleSelectLetter(letter)}
                  className={`w-full min-h-[88px] sm:min-h-[105px] md:h-28 rounded-2xl sm:rounded-3xl font-amiri font-bold flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer relative p-1 sm:p-2 ${
                    isPlaced
                      ? "opacity-20 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400"
                      : isSelected
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 ring-4 sm:ring-6 ring-amber-300 shadow-xl scale-105 animate-pulse"
                      : `bg-gradient-to-tr ${letter.color} text-white hover:scale-102 shadow-md`
                  }`}
                >
                  <span
                    className={`leading-tight px-1 text-center ${
                      isWord
                        ? "text-lg sm:text-2xl md:text-3xl"
                        : "text-3xl sm:text-4xl md:text-5xl"
                    }`}
                  >
                    {letter.ar}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-hind-siliguri font-bold opacity-90 truncate max-w-full px-1">
                    {letter.nameBn}
                  </span>
                  {!isPlaced && (
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute top-1.5 right-1.5 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEACH BEFORE PLAY MODAL ── */}
      <TeachBeforePlayModal
        isOpen={isTeachModalOpen}
        title={currentLevel.title}
        instructionsBn="খেলা শুরুর আগে প্রতিটি হরফের খাঁটি উচ্চারণ মনোযোগ দিয়ে শোনো এবং মুখে পুনরাবৃত্তি করো!"
        learningItems={currentLevel.letters}
        onStartGame={() => setIsTeachModalOpen(false)}
      />

      {/* ── BUILDING REWARD CELEBRATION MODAL ── */}
      <BuildingRewardCelebrationModal
        isOpen={isCelebrationOpen}
        levelId={currentLevel.id}
        stars={3}
        score={score}
        journey={journey}
        newlyEarnedComponent={newlyEarnedComponent}
        earnedRewardIds={earnedRewardIds}
        onNextLevel={handleNextLevel}
        onReplay={() => {
          setIsCelebrationOpen(false);
          setupLevel(currentLevel);
        }}
      />
    </div>
  );
}
