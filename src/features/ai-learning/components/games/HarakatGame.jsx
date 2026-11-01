"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { KIDS_HARAKAT_GAME_LEVELS } from "../../data/kidsGameData";
import { universalAudioEngine } from "@/lib/quran/audio";
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

export default function HarakatGame({ onBack, onEarnReward }) {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [levelStars, setLevelStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_harakat_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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
      // Pick random items across Fatha, Kasra, Damma
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
      ? target.harakat === harakatName
      : isWordPractice || activeLevel.harakat === harakatName;

    if (isMatch) {
      playCorrectChime();
      playStarPopSound(2);
      const points = wrongAttempts === 0 ? 15 : 10;
      setScore((s) => s + points);

      if (round >= 5) {
        setIsWon(true);
        fireCelebrationConfetti();
        playMaShaAllahCelebration();

        const earnedStars = score >= 60 ? 3 : score >= 40 ? 2 : 1;
        const updatedStars = { ...levelStars, [currentLevelId]: Math.max(levelStars[currentLevelId] || 0, earnedStars) };
        setLevelStars(updatedStars);
        try {
          localStorage.setItem("noor_kids_harakat_stars", JSON.stringify(updatedStars));
        } catch {}

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
    if (currentLevelId < KIDS_HARAKAT_GAME_LEVELS.length) {
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

  // Keyboard support: 1 = যবর, 2 = যের, 3 = পেশ
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon) return;
      if (activeLevel.tanween) {
        if (e.key === "1") handleSelectHarakat("দুই যবর");
        if (e.key === "2") handleSelectHarakat("দুই যের");
        if (e.key === "3") handleSelectHarakat("দুই পেশ");
      } else if (!activeLevel.words) {
        if (e.key === "1") handleSelectHarakat("যবর");
        if (e.key === "2") handleSelectHarakat("যের");
        if (e.key === "3") handleSelectHarakat("পেশ");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#EFFCF6] border-4 border-emerald-400 shadow-xl space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2">
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

      {/* ── LEVEL SELECTOR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {KIDS_HARAKAT_GAME_LEVELS.map((lvl) => {
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
                  ? "bg-emerald-600 border-emerald-700 text-white shadow-md scale-105"
                  : "bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {stars > 0 && <span className="text-amber-300 text-[10px]">{"⭐".repeat(stars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── LEVEL OBJECTIVE BANNER ── */}
      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-emerald-950">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {!isWon ? (
        <div className="space-y-4">
          {/* Target Card */}
          {target && (
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-emerald-100/60 border-3 border-emerald-300 shadow-md flex flex-col items-center justify-center gap-2 group">
              <button
                type="button"
                onClick={handleHearAgain}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1 text-xs font-bold"
                title="আবার শুনুন"
              >
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">শুনুন</span>
              </button>

              <span className="font-uthmani text-6xl sm:text-8xl text-emerald-950 font-bold leading-none select-none drop-shadow-sm">
                {target.ar}
              </span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-3 py-0.5 rounded-full">
                {target.nameBn}
              </span>
            </div>
          )}

          {/* Hint Card */}
          {showHint && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 animate-fade-in">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>ইঙ্গিত:</strong>{" "}
                {activeLevel.tipBn ||
                  (target?.harakat === "যবর"
                    ? "হরফের উপরে এক দাগ থাকলে তাকে যবর বলে ('আ' ধ্বনি)।"
                    : target?.harakat === "যের"
                    ? "হরফের নিচে এক দাগ থাকলে তাকে যের বলে ('ই' ধ্বনি)।"
                    : "হরফের উপরে গোল প্যাঁচানো চিহ্ন থাকলে তাকে পেশ বলে ('উ' ধ্বনি)।")}
              </span>
            </div>
          )}

          {/* Choice Buttons */}
          {activeLevel.tanween ? (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { name: "দুই যবর", symbol: "ً", sound: "বান / তান", key: "1", color: "from-amber-400 to-amber-500" },
                { name: "দুই যের", symbol: "ٍ", sound: "বিন / তিন", key: "2", color: "from-blue-400 to-blue-500" },
                { name: "দুই পেশ", symbol: "ٌ", sound: "বুন / তুন", key: "3", color: "from-emerald-400 to-emerald-500" },
              ].map((btn) => (
                <button
                  key={btn.name}
                  type="button"
                  onClick={() => handleSelectHarakat(btn.name)}
                  className="p-3.5 sm:p-5 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 shadow-[0_4px_0_0_#10B981] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span className="text-3xl font-bold font-uthmani text-emerald-950">{btn.symbol}</span>
                  <span className="text-xs font-black text-slate-800">{btn.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{btn.sound}</span>
                </button>
              ))}
            </div>
          ) : (activeLevel.words || activeLevel.jazm || activeLevel.tashdeed || activeLevel.madd) ? (
            <div className="text-center p-3">
              <button
                type="button"
                onClick={() => handleSelectHarakat("correct")}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-900/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2 hover:brightness-105"
              >
                <span>মাশক করেছি ও সঠিক পড়েছি! পরবর্তী শব্দ ➔</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { name: "যবর", symbol: "َ", tip: "উপরে এক দাগ (আ)", key: "1" },
                { name: "যের", symbol: "ِ", tip: "নিচে এক দাগ (ই)", key: "2" },
                { name: "পেশ", symbol: "ُ", tip: "উপরে গোল (উ)", key: "3" },
              ].map((btn) => (
                <button
                  key={btn.name}
                  type="button"
                  onClick={() => handleSelectHarakat(btn.name)}
                  className="p-3.5 sm:p-5 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-300 hover:border-emerald-500 shadow-[0_4px_0_0_#10B981] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span className="text-4xl font-bold font-uthmani text-emerald-950">{btn.symbol}</span>
                  <span className="text-xs font-black text-slate-800">{btn.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{btn.tip}</span>
                </button>
              ))}
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400">
            💡 কীবোর্ডের 1 (যবর), 2 (যের), 3 (পেশ) চেপেও উত্তর দিতে পারবে
          </p>
        </div>
      ) : (
        /* ── LEVEL COMPLETE MODAL ── */
        <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950 to-teal-950 text-white text-center space-y-4 shadow-2xl animate-kids-pop">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg animate-bounce">
            🏆
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-amber-300">মাশাআল্লাহ! লেভেল সম্পূর্ণ!</h3>
            <p className="text-xs text-emerald-200">
              তুমি {activeLevel.title} সফলভাবে শেষ করেছো। অর্জিত পয়েন্ট: {score}
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
      <NuruMascot
        mood={isWon ? "celebrating" : wrongAttempts > 0 ? "thinking" : "happy"}
        dialogue={
          isWon
            ? "দারুণ হরকত চিনেছো! মাশাআল্লাহ, এভাবে পড়লে দ্রুত কুরআন রিডিং শিখবে!"
            : wrongAttempts > 0
            ? "চিহ্নটি দেখো — উপরে এক দাগ যবর, নিচে যের, আর গোল মাথা হলো পেশ!"
            : "হরকতের চিহ্ন দেখে সঠিক বাটনটিতে চাপ দাও!"
        }
      />
    </div>
  );
}
