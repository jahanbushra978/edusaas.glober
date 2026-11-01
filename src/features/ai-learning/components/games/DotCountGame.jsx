"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  HelpCircle,
  Volume2,
  ChevronRight,
} from "lucide-react";
import { KIDS_ARABIC_LETTERS, KIDS_DOT_GAME_LEVELS } from "../../data/kidsGameData";
import {
  playArabicSound,
  playCorrectChime,
  playWrongBuzzer,
  playStarPopSound,
  playMaShaAllahCelebration,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import { playVoicePrompt } from "../../lib/voicePrompts";
import { fireCelebrationConfetti } from "../../lib/confetti";
import NuruMascot from "../kids/NuruMascot";

const DOT_CHOICES = [
  { count: 0, label: "০", dotsUi: "খালি (০)", key: "0" },
  { count: 1, label: "১", dotsUi: "●", key: "1" },
  { count: 2, label: "২", dotsUi: "● ●", key: "2" },
  { count: 3, label: "৩", dotsUi: "● ● ●", key: "3" },
];

export default function DotCountGame({ onBack, onEarnReward }) {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [levelStars, setLevelStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_dot_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  // Keyboard navigation for desktop: 0, 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon) return;
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
      setScore((s) => s + points);

      if (round >= 5) {
        setIsWon(true);
        fireCelebrationConfetti();
        playMaShaAllahCelebration();

        // Calculate 1 to 3 stars based on score
        const earnedStars = score >= 60 ? 3 : score >= 40 ? 2 : 1;
        const updatedStars = { ...levelStars, [currentLevelId]: Math.max(levelStars[currentLevelId] || 0, earnedStars) };
        setLevelStars(updatedStars);
        try {
          localStorage.setItem("noor_kids_dot_stars", JSON.stringify(updatedStars));
        } catch {}

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
    if (currentLevelId < KIDS_DOT_GAME_LEVELS.length) {
      setCurrentLevelId((l) => l + 1);
      setRound(1);
      setScore(0);
      setIsWon(false);
    } else {
      if (onBack) onBack();
    }
  };

  const handleRetryLevel = () => {
    setRound(1);
    setScore(0);
    setIsWon(false);
    startRound();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F5F0FF] border-3 sm:border-4 border-purple-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-purple-100 pb-2.5 sm:pb-3 flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2">
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
        {KIDS_DOT_GAME_LEVELS.map((lvl) => {
          const stars = levelStars[lvl.id] || 0;
          const isActive = lvl.id === currentLevelId;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                playTapSound();
                setCurrentLevelId(lvl.id);
                setRound(1);
                setScore(0);
                setIsWon(false);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                isActive
                  ? "bg-purple-600 border-purple-700 text-white shadow-md scale-105"
                  : "bg-white border-purple-200 text-purple-900 hover:bg-purple-50"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {stars > 0 && <span className="text-amber-300 text-[10px]">{"⭐".repeat(stars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── LEVEL BANNER & OBJECTIVE ── */}
      <div className="text-center space-y-1">
        <h2 className="text-sm sm:text-base font-black text-purple-900">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {/* ── MAIN CARD OR WIN MODAL ── */}
      {!isWon ? (
        <div className="space-y-4">
          {/* Letter Card */}
          {currentLetter && (
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-50 via-white to-purple-100/60 border-3 border-purple-300 shadow-md flex flex-col items-center justify-center gap-2 group">
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
      ) : (
        /* ── LEVEL COMPLETE CELEBRATION MODAL ── */
        <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-900 to-indigo-950 text-white text-center space-y-4 shadow-2xl animate-kids-pop">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg animate-bounce">
            🏆
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-amber-300">মাশাআল্লাহ! লেভেল সম্পূর্ণ!</h3>
            <p className="text-xs text-purple-200">
              তুমি {activeLevel.title} সফলভাবে শেষ করেছো। মোট পয়েন্ট: {score}
            </p>
          </div>

          <div className="flex justify-center gap-2 text-2xl py-2">
            {"⭐".repeat(levelStars[currentLevelId] || 3)}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetryLevel}
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
    </div>
  );
}
