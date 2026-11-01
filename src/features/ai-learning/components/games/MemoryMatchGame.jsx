"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import {
  KIDS_ARABIC_LETTERS,
  KIDS_HARAKAT_DRILL_DATA,
  KIDS_MURAKKABAT_DATA,
  KIDS_MEMORY_GAME_LEVELS,
} from "../../data/kidsGameData";
import {
  playArabicSound,
  playCorrectChime,
  playStarPopSound,
  playMaShaAllahCelebration,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../../lib/confetti";
import NuruMascot from "../kids/NuruMascot";

export default function MemoryMatchGame({ onBack, onEarnReward }) {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [levelStars, setLevelStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_memory_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activeLevel = KIDS_MEMORY_GAME_LEVELS.find((l) => l.id === currentLevelId) || KIDS_MEMORY_GAME_LEVELS[0];

  const initGame = useCallback(() => {
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
  }, [activeLevel]);

  useEffect(() => {
    initGame();
  }, [currentLevelId, initGame]);

  const handleCardClick = (idx) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx) || isWon) {
      return;
    }

    playTapSound();
    const targetCard = cards[idx];
    if (targetCard && targetCard.ar) {
      playArabicSound(targetCard.ar);
    }

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
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
          fireCelebrationConfetti();
          playMaShaAllahCelebration();

          // Calculate 1 to 3 stars based on moves
          const maxOptimalMoves = activeLevel.pairsCount + 2;
          const earnedStars = moves <= maxOptimalMoves ? 3 : moves <= maxOptimalMoves + 3 ? 2 : 1;
          const updatedStars = { ...levelStars, [currentLevelId]: Math.max(levelStars[currentLevelId] || 0, earnedStars) };
          setLevelStars(updatedStars);
          try {
            localStorage.setItem("noor_kids_memory_stars", JSON.stringify(updatedStars));
          } catch {}

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
    if (currentLevelId < KIDS_MEMORY_GAME_LEVELS.length) {
      setCurrentLevelId((l) => l + 1);
    } else {
      if (onBack) onBack();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FBF7] border-4 border-teal-400 shadow-xl space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-teal-100 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="kids-font text-xs font-bold text-slate-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            মুভ: {moves} · জোড়া: {matched.length / 2}/{activeLevel.pairsCount}
          </span>
          <button
            type="button"
            onClick={initGame}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="নতুন করে শুরু"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── LEVEL SELECTOR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {KIDS_MEMORY_GAME_LEVELS.map((lvl) => {
          const stars = levelStars[lvl.id] || 0;
          const isActive = lvl.id === currentLevelId;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                playTapSound();
                setCurrentLevelId(lvl.id);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                isActive
                  ? "bg-teal-600 border-teal-700 text-white shadow-md scale-105"
                  : "bg-white border-teal-200 text-teal-900 hover:bg-teal-50"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {stars > 0 && <span className="text-amber-300 text-[10px]">{"⭐".repeat(stars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── LEVEL OBJECTIVE ── */}
      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-teal-950">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {!isWon ? (
        <div className={`grid ${activeLevel.gridClass || "grid-cols-3"} gap-2.5 sm:gap-3.5 max-w-lg mx-auto py-2`}>
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const isMatched = matched.includes(idx);

            return (
              <button
                key={card.uniqueId}
                type="button"
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-2xl sm:rounded-3xl border-3 flex items-center justify-center transition-all duration-300 cursor-pointer transform ${
                  isFlipped
                    ? isMatched
                      ? "bg-emerald-100 border-emerald-500 scale-95 shadow-xs"
                      : "bg-white border-teal-500 shadow-md scale-100 ring-4 ring-teal-200"
                    : "bg-gradient-to-tr from-teal-500 to-emerald-500 border-teal-600 shadow-[0_5px_0_0_#0D9488] hover:scale-105 active:translate-y-1 active:shadow-none"
                }`}
              >
                {isFlipped ? (
                  <div className="text-center animate-kids-pop">
                    <span className="font-uthmani text-4xl sm:text-5xl font-bold text-teal-950">
                      {card.ar}
                    </span>
                    {card.nameBn && (
                      <p className="text-[10px] font-black text-teal-700 mt-1">
                        {card.nameBn}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl select-none opacity-80">❓</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* ── LEVEL COMPLETE MODAL ── */
        <div className="p-6 rounded-3xl bg-gradient-to-b from-teal-950 to-emerald-950 text-white text-center space-y-4 shadow-2xl animate-kids-pop">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg animate-bounce">
            🏆
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-amber-300">মাশাআল্লাহ! অসাধারণ স্মৃতিশক্তি!</h3>
            <p className="text-xs text-teal-200">
              তুমি মাত্র {moves}টি মুভে সব জোড়া মিলিয়েছো!
            </p>
          </div>

          <div className="flex justify-center gap-2 text-2xl py-2">
            {"⭐".repeat(levelStars[currentLevelId] || 3)}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={initGame}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার খেলো</span>
            </button>

            <button
              type="button"
              onClick={handleNextLevel}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 cursor-pointer active:scale-95"
            >
              <span>পরবর্তী লেভেল</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mascot Guidance */}
      <NuruMascot
        mood={isWon ? "celebrating" : matched.length > 0 ? "happy" : "thinking"}
        dialogue={
          isWon
            ? "মাশাআল্লাহ! তোমার স্মৃতিশক্তি দারুণ! পরের লেভেলে আরও বড় চ্যালেঞ্জ আছে!"
            : "কার্ড উল্টে উল্টে একই হরফের জোড়া মেলাও!"
        }
      />
    </div>
  );
}
