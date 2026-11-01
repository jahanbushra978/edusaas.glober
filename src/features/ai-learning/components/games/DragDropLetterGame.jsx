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
} from "lucide-react";
import {
  universalAudioEngine,
  playArabicSound,
  playFeedbackChime,
} from "@/lib/quran/universal-audio-engine";
import { fireCelebrationConfetti } from "../../lib/confetti";
import NuruMascot from "../kids/NuruMascot";
import { DRAG_DROP_LEVELS } from "../../data/dragDropGameData";

export default function DragDropLetterGame({ onBack, onEarnReward }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [placedSlots, setPlacedSlots] = useState({}); // slotIndex -> letterObj
  const [shuffledCards, setShuffledCards] = useState([]);
  const [score, setScore] = useState(0);
  const [isLevelWon, setIsLevelWon] = useState(false);
  const [mascotFeedback, setMascotFeedback] = useState("হরফগুলোতে চাপ দিয়ে সঠিক ঘরে মেলাও!");
  const [levelStars, setLevelStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_dragdrop_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentLevel = DRAG_DROP_LEVELS[levelIndex] || DRAG_DROP_LEVELS[0];

  // Initialize round
  const setupLevel = useCallback((idx) => {
    const lvl = DRAG_DROP_LEVELS[idx] || DRAG_DROP_LEVELS[0];
    const shuffled = [...lvl.letters].sort(() => 0.5 - Math.random());
    setShuffledCards(shuffled);
    setPlacedSlots({});
    setSelectedLetter(null);
    setIsLevelWon(false);
    setMascotFeedback("হরফগুলোতে চাপ দিয়ে সঠিক ঘরে মেলাও!");
  }, []);

  useEffect(() => {
    setupLevel(levelIndex);
  }, [levelIndex, setupLevel]);

  // Handle letter / word select or tap
  const handleSelectLetter = (letter) => {
    // Already placed?
    const isAlreadyPlaced = Object.values(placedSlots).some((p) => p.ar === letter.ar);
    if (isAlreadyPlaced) return;

    setSelectedLetter(letter);
    // Play authentic studio Qari voice from universal engine
    if (letter.audio) {
      universalAudioEngine.playWord(letter.audio);
    } else {
      playArabicSound(letter.ar);
    }
    playFeedbackChime("tap");
    const isWord = letter.nameBn && (currentLevel.id >= 11 || letter.ar.length > 2);
    setMascotFeedback(`এটি '${letter.nameBn}' ${isWord ? "শব্দ" : "হরফ"}। এবার নিচের সঠিক খোপে বসাও!`);
  };

  // Handle slot tap or drop
  const handleSlotClick = (slotTarget, slotIndex) => {
    if (placedSlots[slotIndex]) {
      // Re-play already placed slot
      const placed = placedSlots[slotIndex];
      if (placed.audio) {
        universalAudioEngine.playWord(placed.audio);
      } else {
        playArabicSound(placed.ar);
      }
      return;
    }

    if (!selectedLetter) {
      // Guide student
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
      // Correct!
      playFeedbackChime("correct");
      // Re-play Qari's melodious letter / word recitation
      if (selectedLetter.audio) {
        universalAudioEngine.playWord(selectedLetter.audio);
      } else {
        playArabicSound(selectedLetter.ar);
      }

      const newPlaced = { ...placedSlots, [slotIndex]: selectedLetter };
      setPlacedSlots(newPlaced);
      setSelectedLetter(null);
      setScore((s) => s + 10);
      setMascotFeedback(`মাশাআল্লাহ! '${selectedLetter.nameBn}' সঠিকভাবে মিলেছে!`);

      // Check if level complete
      if (Object.keys(newPlaced).length === currentLevel.letters.length) {
        setIsLevelWon(true);
        playFeedbackChime("celebrate");
        fireCelebrationConfetti();

        const updatedStars = { ...levelStars, [currentLevel.id]: 3 };
        setLevelStars(updatedStars);
        try {
          localStorage.setItem("noor_kids_dragdrop_stars", JSON.stringify(updatedStars));
        } catch {}

        if (onEarnReward) onEarnReward(3);
        setMascotFeedback("আলহামদুলিল্লাহ! সম্পূর্ণ স্তর সফলভাবে সম্পন্ন হয়েছে!");
      }
    } else {
      // Wrong slot
      playFeedbackChime("wrong");
      setMascotFeedback(`না, এটি '${slotTarget.nameBn}'-এর ঘর। আবার চেষ্টা করো!`);
    }
  };

  // Next level
  const handleNextLevel = () => {
    if (levelIndex < DRAG_DROP_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
    } else {
      setLevelIndex(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5 p-2.5 sm:p-6 font-hind-siliguri animate-fade-in">
      {/* ── TOP HEADER & SCORE BAR ── */}
      <div className="flex items-center justify-between bg-white dark:bg-[#071912] border border-emerald-100 dark:border-emerald-900/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> নূর হরফ মেলানো খেলা
            </span>
            <h2 className="text-sm sm:text-lg font-black text-slate-800 dark:text-white leading-tight">
              {currentLevel.title}
            </h2>
          </div>
        </div>

        {/* Score & Level Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-black shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{score} পয়েন্ট</span>
          </div>

          <button
            type="button"
            onClick={() => setupLevel(levelIndex)}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all cursor-pointer"
            title="পুনরায় শুরু"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

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

      {/* ── GAME PLAYGROUND (TARGET SLOTS & SOURCE CARDS) ── */}
      <div className="bg-white dark:bg-[#071912] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl flex flex-col gap-5 sm:gap-7">
        {/* ROW 1: TARGET SLOTS (WHERE TO DROP/PLACE) */}
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

        {/* ROW 2: DRAGGABLE/TAPPABLE CARDS POOL */}
        <div className="space-y-2.5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-emerald-900/60">
          <span className="text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 text-center">
            হরফ কার্ড নির্বাচন করো:
          </span>

          {/* Equal 3-column responsive grid: fits 3 cards side-by-side cleanly even on 320px screens */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto w-full">
            {shuffledCards.map((letter) => {
              const isPlaced = Object.values(placedSlots).some((p) => p.ar === letter.ar);
              const isSelected = selectedLetter?.ar === letter.ar;
              const isWord = letter.ar.length > 2;

              return (
                <button
                  key={letter.ar}
                  type="button"
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

        {/* LEVEL COMPLETE BANNER & NEXT LEVEL BUTTON */}
        {isLevelWon && (
          <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-xl animate-fade-in flex-wrap gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                🏆
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black">মাশাআল্লাহ! স্তর সম্পন্ন হয়েছে!</h4>
                <p className="text-[11px] sm:text-xs opacity-90">+৩টি ডেমো স্টার অর্জিত হয়েছে</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextLevel}
              className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              পরবর্তী স্তর ➔
            </button>
          </div>
        )}
      </div>

      {/* ── AUDIO POLICY BADGE ── */}
      <div className="text-center text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 px-2">
        🎙️ প্রতিটি হরফের অডিও সরাসরি নূর একক অডিও ইঞ্জিন থেকে সুমধুর স্টুডিও ক্বারীর কণ্ঠে পরিবেশিত।
      </div>
    </div>
  );
}

