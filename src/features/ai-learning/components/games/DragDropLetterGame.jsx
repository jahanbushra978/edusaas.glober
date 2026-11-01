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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 p-3 sm:p-6 font-hind-siliguri animate-fade-in">
      {/* ── TOP HEADER & SCORE BAR ── */}
      <div className="flex items-center justify-between bg-white dark:bg-[#071912] border border-emerald-100 dark:border-emerald-900/60 rounded-3xl p-4 shadow-lg flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> নূর হরফ মেলানো খেলা
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
              {currentLevel.title}
            </h2>
          </div>
        </div>

        {/* Score & Level Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 text-xs font-black shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{score} পয়েন্ট</span>
          </div>

          <button
            type="button"
            onClick={() => setupLevel(levelIndex)}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all cursor-pointer"
            title="পুনরায় শুরু"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MASCOT COMPANION DIALOGUE ── */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 rounded-3xl p-3 sm:p-4">
        <div className="w-12 h-12 shrink-0">
          <NuruMascot
            mood={isLevelWon ? "celebrating" : selectedLetter ? "encouraging" : "happy"}
            size={48}
          />
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
            {mascotFeedback}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {currentLevel.desc}
          </span>
        </div>
      </div>

      {/* ── GAME PLAYGROUND (TARGET SLOTS & SOURCE CARDS) ── */}
      <div className="bg-white dark:bg-[#071912] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col gap-8">
        {/* ROW 1: TARGET SLOTS (WHERE TO DROP/PLACE) */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> সঠিক স্থানে মিলিয়ে হরফটি বসাও:
          </span>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto">
            {currentLevel.letters.map((target, idx) => {
              const isFilled = placedSlots[idx] !== undefined;
              return (
                <div
                  key={idx}
                  onClick={() => handleSlotClick(target, idx)}
                  className={`h-32 sm:h-40 rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-3 transition-all cursor-pointer relative ${
                    isFilled
                      ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-md ring-4 ring-emerald-400/30"
                      : selectedLetter?.ar === target.ar
                      ? "border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 animate-pulse scale-102"
                      : "border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/60 dark:bg-slate-900/40"
                  }`}
                >
                  {isFilled ? (
                    <>
                      <span className="font-amiri text-5xl sm:text-6xl text-emerald-700 dark:text-emerald-300 font-bold">
                        {placedSlots[idx].ar}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                        {placedSlots[idx].nameBn} ✓
                      </span>
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                        {target.nameBn}
                      </span>
                      <span className="font-amiri text-3xl sm:text-4xl text-slate-300 dark:text-slate-700 select-none mt-1">
                        {target.ar}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
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
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-emerald-900/60">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            হরফ কার্ড নির্বাচন করো:
          </span>

          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            {shuffledCards.map((letter) => {
              const isPlaced = Object.values(placedSlots).some((p) => p.ar === letter.ar);
              const isSelected = selectedLetter?.ar === letter.ar;

              return (
                <button
                  key={letter.ar}
                  type="button"
                  disabled={isPlaced}
                  onClick={() => handleSelectLetter(letter)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl font-amiri text-4xl sm:text-5xl font-bold flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer relative ${
                    isPlaced
                      ? "opacity-20 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400"
                      : isSelected
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 ring-6 ring-amber-300 shadow-xl scale-110 animate-bounce"
                      : `bg-gradient-to-tr ${letter.color} text-white hover:scale-105 shadow-md`
                  }`}
                >
                  <span>{letter.ar}</span>
                  <span className="text-[11px] font-hind-siliguri font-bold opacity-90 -mt-1">
                    {letter.nameBn}
                  </span>
                  {!isPlaced && (
                    <Volume2 className="w-3.5 h-3.5 absolute top-2 right-2 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LEVEL COMPLETE BANNER & NEXT LEVEL BUTTON */}
        {isLevelWon && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-xl animate-fade-in flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h4 className="text-base font-black">মাশাআল্লাহ! স্তর সম্পন্ন হয়েছে!</h4>
                <p className="text-xs opacity-90">+৩টি ডেমো স্টার অর্জিত হয়েছে</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextLevel}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              পরবর্তী স্তর ➔
            </button>
          </div>
        )}
      </div>

      {/* ── AUDIO POLICY BADGE ── */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
        🎙️ প্রতিটি হরফের অডিও সরাসরি নূর একক অডিও ইঞ্জিন থেকে সুমধুর স্টুডিও ক্বারীর কণ্ঠে পরিবেশিত।
      </div>
    </div>
  );
}

