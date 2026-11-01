"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  KIDS_ARABIC_LETTERS,
  KIDS_HARAKAT_DRILL_DATA,
  KIDS_JAZM_QALQALAH_DATA,
  KIDS_SOUND_DETECTIVE_LEVELS,
} from "../../data/kidsGameData";
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

export default function SoundDetectiveGame({ onBack, onEarnReward }) {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [levelStars, setLevelStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_sound_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activeLevel = KIDS_SOUND_DETECTIVE_LEVELS.find((l) => l.id === currentLevelId) || KIDS_SOUND_DETECTIVE_LEVELS[0];

  const playItemSound = useCallback((item) => {
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
    let targetCandidate = null;
    let choices = [];

    if (activeLevel.id === 1) {
      // Clear letters
      const subset = KIDS_ARABIC_LETTERS.filter((l) => activeLevel.letters.includes(l.ar));
      targetCandidate = subset[Math.floor(Math.random() * subset.length)];
      const distractors = subset.filter((l) => l.ar !== targetCandidate.ar).sort(() => 0.5 - Math.random()).slice(0, 2);
      choices = [targetCandidate, ...distractors].sort(() => 0.5 - Math.random());
    } else if (activeLevel.id === 2) {
      // Similar sounding pairs
      const pairObj = activeLevel.similarPairs[Math.floor(Math.random() * activeLevel.similarPairs.length)];
      const targetAr = pairObj.pair[Math.floor(Math.random() * pairObj.pair.length)];
      targetCandidate = KIDS_ARABIC_LETTERS.find((l) => l.ar === targetAr) || { ar: targetAr, nameBn: targetAr };
      targetCandidate.tip = pairObj.tip;

      // Other letter in pair + 1 other distractor
      const otherPairLetter = pairObj.pair.find((l) => l !== targetAr);
      const otherObj = KIDS_ARABIC_LETTERS.find((l) => l.ar === otherPairLetter) || { ar: otherPairLetter, nameBn: otherPairLetter };
      const randomExtra = KIDS_ARABIC_LETTERS.filter((l) => !pairObj.pair.includes(l.ar)).sort(() => 0.5 - Math.random())[0];
      choices = [targetCandidate, otherObj, randomExtra].sort(() => 0.5 - Math.random());
    } else if (activeLevel.id === 3) {
      // Harakat drill
      targetCandidate = KIDS_HARAKAT_DRILL_DATA[Math.floor(Math.random() * KIDS_HARAKAT_DRILL_DATA.length)];
      const distractors = KIDS_HARAKAT_DRILL_DATA.filter((l) => l.ar !== targetCandidate.ar).sort(() => 0.5 - Math.random()).slice(0, 2);
      choices = [targetCandidate, ...distractors].sort(() => 0.5 - Math.random());
    } else if (activeLevel.id === 4) {
      // Qalqalah
      targetCandidate = KIDS_JAZM_QALQALAH_DATA[Math.floor(Math.random() * KIDS_JAZM_QALQALAH_DATA.length)];
      const distractors = KIDS_JAZM_QALQALAH_DATA.filter((l) => l.ar !== targetCandidate.ar).sort(() => 0.5 - Math.random()).slice(0, 2);
      choices = [targetCandidate, ...distractors].sort(() => 0.5 - Math.random());
    } else if (activeLevel.sifatPool && activeLevel.challenges) {
      // Sifat Detective (Level 6)
      const ch = activeLevel.challenges[Math.floor(Math.random() * activeLevel.challenges.length)];
      targetCandidate = {
        ar: ch.letter,
        nameBn: ch.letter,
        tip: ch.tip,
        sifat: ch.sifat,
      };
      choices = activeLevel.challenges.map((c) => ({
        ar: c.letter,
        nameBn: `${c.letter} (${c.sifat})`,
        tip: c.tip,
      })).sort(() => 0.5 - Math.random());
    } else if (activeLevel.tajweedPool && activeLevel.challenges) {
      // Tajweed Rule Detective (Level 7)
      const ch = activeLevel.challenges[Math.floor(Math.random() * activeLevel.challenges.length)];
      targetCandidate = {
        ar: ch.ayahAr,
        nameBn: ch.rule,
        rule: ch.rule,
        tip: ch.tip,
      };
      choices = activeLevel.challenges.map((c) => ({
        ar: c.ayahAr,
        nameBn: c.rule,
        rule: c.rule,
        tip: c.tip,
      })).sort(() => 0.5 - Math.random());
    } else {
      // Mixed master
      targetCandidate = KIDS_ARABIC_LETTERS[Math.floor(Math.random() * KIDS_ARABIC_LETTERS.length)];
      const distractors = KIDS_ARABIC_LETTERS.filter((l) => l.ar !== targetCandidate.ar).sort(() => 0.5 - Math.random()).slice(0, 2);
      choices = [targetCandidate, ...distractors].sort(() => 0.5 - Math.random());
    }

    setTarget(targetCandidate);
    setOptions(choices);
    setWrongAttempts(0);
    setShowHint(false);

    // Play target sound after short pause
    const timer = setTimeout(() => {
      playItemSound(targetCandidate);
    }, 450);

    return () => clearTimeout(timer);
  }, [activeLevel, playItemSound]);

  useEffect(() => {
    startRound();
  }, [round, currentLevelId, startRound]);

  const handleHearAgain = () => {
    if (target) {
      playItemSound(target);
    }
  };

  const handleSelectOption = (opt) => {
    if (!target || isWon) return;
    playTapSound();

    const isMatch =
      (opt.ar && opt.ar === target.ar) ||
      opt.nameBn === target.nameBn ||
      (opt.rule && opt.rule === target.rule);

    if (isMatch) {
      handleHearAgain();
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
          localStorage.setItem("noor_kids_sound_stars", JSON.stringify(updatedStars));
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
    if (currentLevelId < KIDS_SOUND_DETECTIVE_LEVELS.length) {
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

  // Keyboard 1, 2, 3 selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isWon) return;
      if (e.key === "1" && options[0]) handleSelectOption(options[0]);
      if (e.key === "2" && options[1]) handleSelectOption(options[1]);
      if (e.key === "3" && options[2]) handleSelectOption(options[2]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6 rounded-2xl sm:rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FDF4] border-3 sm:border-4 border-amber-400 shadow-xl space-y-3.5 sm:space-y-4 animate-kids-pop select-none">
      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between border-b-2 border-amber-100 pb-2.5 sm:pb-3 flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="kids-font text-xs font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
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
        {KIDS_SOUND_DETECTIVE_LEVELS.map((lvl) => {
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
                  ? "bg-amber-500 border-amber-600 text-white shadow-md scale-105"
                  : "bg-white border-amber-200 text-amber-950 hover:bg-amber-50"
              }`}
            >
              <span>লেভেল {lvl.id}</span>
              {stars > 0 && <span className="text-amber-200 text-[10px]">{"⭐".repeat(stars)}</span>}
            </button>
          );
        })}
      </div>

      {/* ── LEVEL OBJECTIVE ── */}
      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-amber-950">{activeLevel.title}</h2>
        <p className="text-xs text-slate-600 font-medium">{activeLevel.instructionBn}</p>
      </div>

      {!isWon ? (
        <div className="space-y-4">
          {/* Big Speaker Button */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-100/60 border-3 border-amber-300 shadow-md flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleHearAgain}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer border-4 border-white ring-4 ring-amber-300"
              title="আওয়াজটি শুনুন"
            >
              <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
            </button>
            <p className="kids-font text-xs font-black text-amber-900">
              🔊 বাটনে চেপে তিলাওয়াত শোনো
            </p>
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 animate-fade-in">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>গোয়েন্দা ইঙ্গিত:</strong>{" "}
                {target?.tip || activeLevel.tipBn || "আওয়াজের প্রতিধ্বনি ও মাখরাজের দিকে খেয়াল করো।"}
              </span>
            </div>
          )}

          {/* 3 Choices */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {options.map((opt, i) => (
              <button
                key={opt.ar || opt.nameBn || i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white hover:bg-amber-50 border-3 border-amber-300 hover:border-amber-500 shadow-[0_4px_0_0_#F59E0B] active:translate-y-1 active:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <span className={`font-uthmani text-amber-950 font-bold leading-none block px-1 ${
                  opt.ar?.length > 2 ? "text-2xl sm:text-4xl md:text-5xl" : "text-3xl sm:text-6xl"
                }`}>
                  {opt.ar}
                </span>
                <span className="text-[10px] sm:text-xs font-black text-slate-700 truncate max-w-full px-1">
                  {opt.nameBn}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-400">কীবোর্ড: {i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── LEVEL COMPLETE MODAL ── */
        <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-950 to-orange-950 text-white text-center space-y-4 shadow-2xl animate-kids-pop">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg animate-bounce">
            🕵️
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-amber-300">মাশাআল্লাহ! দুর্দান্ত গোয়েন্দাগিরি!</h3>
            <p className="text-xs text-amber-200">
              তুমি সব আওয়াজ নিখুঁতভাবে শনাক্ত করেছো। মোট পয়েন্ট: {score}
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
              ? "দারুণ গোয়েন্দা তুমি! মাশাআল্লাহ, সূক্ষ্ম আওয়াজও ধরে ফেলেছো!"
              : wrongAttempts > 0
              ? "স্পিকারে আবার চাপ দাও এবং সাবধানে শুনে সঠিক হরফে চাপো।"
              : "কান পেতে তিলাওয়াত শোনো এবং সঠিক হরফটি বের করো!"
          }
        />
      </div>
    </div>
  );
}
