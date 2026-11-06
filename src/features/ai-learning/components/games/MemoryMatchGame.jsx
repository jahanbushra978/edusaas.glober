"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import {
  KIDS_ARABIC_LETTERS,
  KIDS_HARAKAT_DRILL_DATA,
  KIDS_MURAKKABAT_DATA,
  KIDS_MEMORY_GAME_LEVELS,
} from "../../data/kidsGameData";
import { universalAudioEngine } from "@/lib/quran/audio";
import {
  playArabicSound,
  playCorrectChime,
  playStarPopSound,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import NuruMascot from "../kids/NuruMascot";
import { useQuranGameProgress } from "../../hooks/useQuranGameProgress";
import BuildingRewardCelebrationModal from "./BuildingRewardCelebrationModal";
import TeachBeforePlayModal from "./TeachBeforePlayModal";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

export default function MemoryMatchGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("letter-match");

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);
  const [earnedStarsCount, setEarnedStarsCount] = useState(3);
  const [earnedScore, setEarnedScore] = useState(50);

  const activeLevel =
    KIDS_MEMORY_GAME_LEVELS.find((l) => l.id === currentLevelId) ||
    KIDS_MEMORY_GAME_LEVELS[0];

  const getSourcePool = useCallback(() => {
    let sourcePool = KIDS_ARABIC_LETTERS;
    if (activeLevel.id === 3) {
      sourcePool = KIDS_HARAKAT_DRILL_DATA;
    } else if (activeLevel.id === 4) {
      sourcePool = KIDS_MURAKKABAT_DATA;
    } else if (activeLevel.pool) {
      sourcePool = activeLevel.pool.map((item) => {
        if (typeof item === "string") {
          const letterMatch = KIDS_ARABIC_LETTERS.find((l) => l.ar === item);
          return letterMatch || { ar: item, nameBn: item };
        }
        return item;
      });
    }
    return sourcePool;
  }, [activeLevel]);

  const initGame = useCallback(() => {
    const sourcePool = getSourcePool();

    // Pick pairsCount unique items
    const shuffledPool = [...sourcePool].sort(() => 0.5 - Math.random());
    const selected = shuffledPool.slice(0, activeLevel.pairsCount);

    // Duplicate each item to create pairs
    const deck = [];
    selected.forEach((item, index) => {
      deck.push({ ...item, uniqueId: `a-${index}`, pairId: index });
      deck.push({ ...item, uniqueId: `b-${index}`, pairId: index });
    });

    // Shuffle the deck
    setCards(deck.sort(() => 0.5 - Math.random()));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  }, [activeLevel, getSourcePool]);

  useEffect(() => {
    initGame();
  }, [currentLevelId, initGame]);

  // Open teach modal if level not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevelId)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevelId, completedLevels]);

  const playCardAudio = (targetCard) => {
    if (!targetCard) return;
    if (targetCard.audio) {
      universalAudioEngine.playWord(targetCard.audio, {
        onError: () => {
          if (targetCard.ar) playArabicSound(targetCard.ar);
        },
      });
    } else if (targetCard.ar) {
      playArabicSound(targetCard.ar);
    }
  };

  const handleCardClick = (idx) => {
    if (
      flipped.length >= 2 ||
      flipped.includes(idx) ||
      matched.includes(idx) ||
      isWon ||
      isCelebrationOpen ||
      isTeachModalOpen
    ) {
      return;
    }

    playTapSound();
    const targetCard = cards[idx];
    playCardAudio(targetCard);

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Matched!
        playCorrectChime();
        playStarPopSound(2);
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);

        // Check if all pairs are matched
        if (newMatched.length === cards.length && cards.length > 0) {
          setIsWon(true);

          // Calculate 1 to 3 stars based on moves
          const maxOptimalMoves = activeLevel.pairsCount + 2;
          const starsEarned =
            nextMoves <= maxOptimalMoves
              ? 3
              : nextMoves <= maxOptimalMoves + 3
              ? 2
              : 1;
          const calculatedScore =
            starsEarned * 20 + Math.max(10, 50 - nextMoves * 2);

          setEarnedStarsCount(starsEarned);
          setEarnedScore(calculatedScore);

          const rewardResult = completeLevel(
            currentLevelId,
            starsEarned,
            calculatedScore,
            KIDS_MEMORY_GAME_LEVELS.length
          );
          setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
          setIsCelebrationOpen(true);

          if (onEarnReward) onEarnReward(30);
        }
      } else {
        // Not a match: flip back after short delay
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    if (currentLevelId < KIDS_MEMORY_GAME_LEVELS.length) {
      setCurrentLevel(currentLevelId + 1);
    } else {
      setCurrentLevel(1);
    }
  };

  const handleRetryLevel = () => {
    setIsCelebrationOpen(false);
    initGame();
  };

  const learningPool = getSourcePool().slice(0, 6);

  // Responsive grid class
  const gridLayout =
    activeLevel.pairsCount === 2
      ? "grid-cols-2 max-w-xs"
      : activeLevel.pairsCount === 3
      ? "grid-cols-2 sm:grid-cols-3 max-w-md"
      : activeLevel.pairsCount <= 4
      ? "grid-cols-2 sm:grid-cols-4 max-w-lg"
      : "grid-cols-3 sm:grid-cols-4 max-w-xl";

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FBF7] border-3 sm:border-4 border-teal-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-teal-100 pb-2.5 sm:pb-3 flex-wrap gap-2">
        <button
          type="button"
          data-testid="game-back-btn"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold border border-teal-200">
            <span>{journey.icon}</span>
            <span>{earnedRewardIds.length}/{journey.totalMilestones} উপাদান</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="হরফ ও পাঠ দেখে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিখে নাও</span>
          </button>

          <span className="kids-font text-xs font-bold text-slate-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            মুভ: {moves} · জোড়া: {matched.length / 2}/{activeLevel.pairsCount}
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
        {KIDS_MEMORY_GAME_LEVELS.map((lvl, idx) => {
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
                  ? "bg-teal-600 border-teal-700 text-white shadow-md scale-105"
                  : unlocked
                  ? "bg-white border-teal-200 text-teal-900 hover:bg-teal-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
              }`}
            >
              <span>{unlocked ? `লেভেল ${lvl.id}` : `🔒 লেভেল ${lvl.id}`}</span>
              {lvlStars > 0 && (
                <span className="text-amber-300 text-[10px]">
                  {"⭐".repeat(lvlStars)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 🏡 INTERACTIVE NOOR COTTAGE BUILDING SCENE ── */}
      <InteractiveBuildingVisualizer
        gameId="letter-match"
        earnedRewardIds={earnedRewardIds}
        currentLevel={currentLevelId}
      />

      {/* ── LEVEL OBJECTIVE ── */}
      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-teal-950">
          {activeLevel.title}
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          {activeLevel.instructionBn}
        </p>
      </div>

      {/* ── CARDS GRID ── */}
      <div className={`grid ${gridLayout} gap-2.5 sm:gap-3.5 mx-auto py-2`}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          const isMatched = matched.includes(idx);

          return (
            <button
              key={card.uniqueId}
              type="button"
              data-testid={`memory-card-${idx}`}
              data-pair-id={card.pairId}
              data-card-ar={card.ar}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square min-h-[4.5rem] sm:min-h-[6.5rem] rounded-2xl sm:rounded-3xl border-3 flex items-center justify-center transition-all duration-300 cursor-pointer transform ${
                isFlipped
                  ? isMatched
                    ? "bg-emerald-100 border-emerald-500 scale-95 shadow-xs"
                    : "bg-white border-teal-500 shadow-md scale-100 ring-4 ring-teal-200"
                  : "bg-gradient-to-tr from-teal-500 to-emerald-500 border-teal-600 shadow-[0_5px_0_0_#0D9488] hover:scale-105 active:translate-y-1 active:shadow-none"
              }`}
            >
              {isFlipped ? (
                <div className="text-center animate-kids-pop px-1">
                  <span
                    className={`font-uthmani font-bold text-teal-950 leading-tight block ${
                      card.ar && card.ar.length > 2
                        ? "text-xl sm:text-3xl md:text-4xl"
                        : "text-3xl sm:text-5xl"
                    }`}
                  >
                    {card.ar}
                  </span>
                  {card.nameBn && (
                    <p className="text-[9px] sm:text-[10px] font-black text-teal-700 mt-0.5 truncate max-w-full">
                      {card.nameBn}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl select-none opacity-80">
                  ❓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mascot Guidance */}
      <div className="flex justify-center pt-1">
        <NuruMascot
          size="sm"
          mood={
            isWon
              ? "celebrating"
              : matched.length > 0
              ? "happy"
              : "thinking"
          }
          dialogue={
            isWon
              ? "মাশাআল্লাহ! তোমার স্মৃতিশক্তি দারুণ! পরের লেভেলে আরও বড় চ্যালেঞ্জ আছে!"
              : "কার্ড উল্টে উল্টে একই হরফের জোড়া মেলাও!"
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
        earnedStars={earnedStarsCount}
        earnedScore={earnedScore}
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
