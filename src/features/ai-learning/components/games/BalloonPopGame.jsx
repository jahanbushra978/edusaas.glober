"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Trophy,
} from "lucide-react";
import {
  playArabicSound,
  playCorrectChime,
  playWrongBuzzer,
  playStarPopSound,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import NuruMascot from "../kids/NuruMascot";
import { useQuranGameProgress } from "../../hooks/useQuranGameProgress";
import BuildingRewardCelebrationModal from "./BuildingRewardCelebrationModal";
import TeachBeforePlayModal from "./TeachBeforePlayModal";
import InteractiveBuildingVisualizer from "../rewards/InteractiveBuildingVisualizer";

// 🎈 Realistic Web Audio Balloon Pop Sound Synthesizer (Instant 0ms, Zero Delay)
function playRealisticBalloonPop() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.85, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {}
}

// 🌈 6 Vivid Candy Balloon Themes (Glossy & Tactile)
const BALLOON_COLOR_THEMES = [
  {
    gradient: "from-rose-500 via-red-500 to-rose-600",
    text: "text-white",
    knot: "bg-rose-700",
    shadow: "shadow-rose-400/40",
    border: "border-rose-300",
  },
  {
    gradient: "from-amber-400 via-amber-500 to-orange-500",
    text: "text-amber-950",
    knot: "bg-amber-600",
    shadow: "shadow-amber-400/40",
    border: "border-amber-200",
  },
  {
    gradient: "from-sky-400 via-blue-500 to-cyan-500",
    text: "text-white",
    knot: "bg-blue-700",
    shadow: "shadow-sky-400/40",
    border: "border-sky-300",
  },
  {
    gradient: "from-purple-500 via-indigo-500 to-violet-600",
    text: "text-white",
    knot: "bg-purple-700",
    shadow: "shadow-purple-400/40",
    border: "border-purple-300",
  },
  {
    gradient: "from-emerald-400 via-teal-500 to-emerald-600",
    text: "text-white",
    knot: "bg-emerald-700",
    shadow: "shadow-emerald-400/40",
    border: "border-emerald-300",
  },
  {
    gradient: "from-pink-400 via-rose-400 to-pink-600",
    text: "text-white",
    knot: "bg-pink-700",
    shadow: "shadow-pink-400/40",
    border: "border-pink-300",
  },
];

// 🎈 Comprehensive 6 Progressive Quranic Levels (Noorani Qaida Stages)
export const BALLOON_LEVELS = [
  {
    id: 1,
    title: "লেভেল ১: যবর ( َ ) বেলুন উৎসব",
    target: "যবর ( َ )",
    targetChar: "َ",
    instructionBn: "যেসব বেলুনে যবর ( َ ) আছে সেগুলো খুঁজে খুঁজে ফাটাও!",
    letters: [
      { ar: "بَ", correct: true, sound: "بَ", nameBn: "বা যবর বা" },
      { ar: "بِ", correct: false, sound: "بِ", nameBn: "বা যের বি" },
      { ar: "تَ", correct: true, sound: "تَ", nameBn: "তা যবর তা" },
      { ar: "بُ", correct: false, sound: "بُ", nameBn: "বা পেশ বু" },
      { ar: "ثَ", correct: true, sound: "ثَ", nameBn: "ছা যবর ছা" },
      { ar: "جِ", correct: false, sound: "جِ", nameBn: "জীম যের জি" },
    ],
  },
  {
    id: 2,
    title: "লেভেল ২: যের ( ِ ) বেলুন উৎসব",
    target: "যের ( ِ )",
    targetChar: "ِ",
    instructionBn: "যেসব বেলুনে যের ( ِ ) আছে সেগুলো সাবধানে ফাটাও!",
    letters: [
      { ar: "سِ", correct: true, sound: "سِ", nameBn: "সীন যের সি" },
      { ar: "سَ", correct: false, sound: "سَ", nameBn: "সীন যবর সা" },
      { ar: "مِ", correct: true, sound: "مِ", nameBn: "মীম যের মি" },
      { ar: "مُ", correct: false, sound: "مُ", nameBn: "মীম পেশ মু" },
      { ar: "رِ", correct: true, sound: "رِ", nameBn: "রা যের রি" },
      { ar: "دَ", correct: false, sound: "دَ", nameBn: "দাল যবর দা" },
    ],
  },
  {
    id: 3,
    title: "লেভেল ৩: পেশ ( ُ ) বেলুন উৎসব",
    target: "পেশ ( ُ )",
    targetChar: "ُ",
    instructionBn: "যেসব বেলুনে পেশ ( ُ ) আছে সেগুলো খুঁজে বের করো!",
    letters: [
      { ar: "نُ", correct: true, sound: "نُ", nameBn: "নূন পেশ নু" },
      { ar: "نَ", correct: false, sound: "نَ", nameBn: "নূন যবর না" },
      { ar: "رُ", correct: true, sound: "رُ", nameBn: "রা পেশ রু" },
      { ar: "رِ", correct: false, sound: "رِ", nameBn: "রা যের রি" },
      { ar: "كُ", correct: true, sound: "كُ", nameBn: "কাফ পেশ কু" },
      { ar: "لَ", correct: false, sound: "لَ", nameBn: "লাম যবর লা" },
    ],
  },
  {
    id: 4,
    title: "লেভেল ৪: তানভীন ( ً ٍ ٌ ) বেলুন চ্যালেঞ্জ",
    target: "তানভীন (দুই যবর, দুই যের, দুই পেশ)",
    targetChar: "ً",
    instructionBn: "যেসব বেলুনে তানভীন (বান, বিন, বুন) আছে সেগুলো ফাটাও!",
    letters: [
      { ar: "بً", correct: true, sound: "بً", nameBn: "বা দুই যবর বান" },
      { ar: "بَ", correct: false, sound: "بَ", nameBn: "বা যবর বা" },
      { ar: "تٍ", correct: true, sound: "تٍ", nameBn: "তা দুই যের তিন" },
      { ar: "تِ", correct: false, sound: "تِ", nameBn: "তা যের তি" },
      { ar: "ثٌ", correct: true, sound: "ثٌ", nameBn: "ছা দুই পেশ ছুন" },
      { ar: "جَ", correct: false, sound: "جَ", nameBn: "জীম যবর জা" },
    ],
  },
  {
    id: 5,
    title: "লেভেল ৫: জযম ও সুকুন ( ْ ) বেলুন",
    target: "জযম / সুকুন ( ْ )",
    targetChar: "ْ",
    instructionBn: "যেসব বেলুনে সুকুন বা জযম আছে সেগুলো খুঁজে ফাটাও!",
    letters: [
      { ar: "أَبْ", correct: true, sound: "أَبْ", nameBn: "হামযাহ বা যবর আব" },
      { ar: "بَا", correct: false, sound: "بَا", nameBn: "বা আলিফ যবর বা" },
      { ar: "قُلْ", correct: true, sound: "قُلْ", nameBn: "ক্বাফ লাম পেশ ক্বুল" },
      { ar: "قَالَ", correct: false, sound: "قَالَ", nameBn: "ক্বালা" },
      { ar: "مَنْ", correct: true, sound: "مَنْ", nameBn: "মীম নূন যবর মান" },
      { ar: "مَا", correct: false, sound: "مَا", nameBn: "মা" },
    ],
  },
  {
    id: 6,
    title: "লেভেল ৬: ক্বলক্বলাহর ধাক্কা (ق ط ب ج د)",
    target: "ক্বলক্বলাহর ৫টি হরফ",
    targetChar: "ق",
    instructionBn: "ক্বলক্বলাহর ৫টি ধাক্কা ধ্বনির হরফ (ক্বাফ, ত্বো, বা, জিম, দাল) খুঁজে ফাটাও!",
    letters: [
      { ar: "أَقْ", correct: true, sound: "أَقْ", nameBn: "আক্ব (ক্বলক্বলাহ)" },
      { ar: "أَسْ", correct: false, sound: "أَسْ", nameBn: "আস (সীন)" },
      { ar: "أَطْ", correct: true, sound: "أَطْ", nameBn: "আত্ব (ক্বলক্বলাহ)" },
      { ar: "أَلْ", correct: false, sound: "أَلْ", nameBn: "আল (লাম)" },
      { ar: "أَدْ", correct: true, sound: "أَدْ", nameBn: "আদ (ক্বলক্বলাহ)" },
      { ar: "أَمْ", correct: false, sound: "أَمْ", nameBn: "আম (মীম)" },
    ],
  },
];

export default function BalloonPopGame({ onBack, onEarnReward }) {
  const {
    journey,
    currentLevelId,
    completedLevels,
    earnedRewardIds,
    stars,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
  } = useQuranGameProgress("balloon-pop");

  const [score, setScore] = useState(0);
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [poppingIndex, setPoppingIndex] = useState(null);
  const [floatingScoreTag, setFloatingScoreTag] = useState(null);
  const [shakeIndex, setShakeIndex] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [newlyEarnedComponent, setNewlyEarnedComponent] = useState(null);
  const [isTeachModalOpen, setIsTeachModalOpen] = useState(false);

  const activeLevel =
    BALLOON_LEVELS.find((l) => l.id === currentLevelId) || BALLOON_LEVELS[0];

  const initLevel = useCallback(() => {
    setPoppedBalloons([]);
    setPoppingIndex(null);
    setFloatingScoreTag(null);
    setShakeIndex(null);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initLevel();
  }, [currentLevelId, initLevel]);

  // Open teach modal if level not completed yet
  useEffect(() => {
    if (!completedLevels.includes(currentLevelId)) {
      setIsTeachModalOpen(true);
    }
  }, [currentLevelId, completedLevels]);

  const handlePopBalloon = (item, idx) => {
    if (poppedBalloons.includes(idx) || isWon || isCelebrationOpen) return;
    playTapSound();

    if (item.correct) {
      // 🎈 Realistic Vina-Kids Balloon Pop Reaction
      playRealisticBalloonPop();
      playArabicSound(item.sound);
      playStarPopSound(1);

      // Trigger pop explosion animation
      setPoppingIndex(idx);
      setFloatingScoreTag({ idx, text: "+১০ ⭐" });

      const nextPopped = [...poppedBalloons, idx];
      setPoppedBalloons(nextPopped);
      const nextScore = score + 10;
      setScore(nextScore);

      setTimeout(() => {
        setPoppingIndex(null);
        setFloatingScoreTag(null);
      }, 700);

      // Check if all correct balloons are popped
      const remainingCorrect = activeLevel.letters.filter(
        (l, i) => l.correct && !nextPopped.includes(i)
      );

      if (remainingCorrect.length === 0) {
        setIsWon(true);
        setTimeout(() => {
          playCorrectChime();
          const rewardResult = completeLevel(
            currentLevelId,
            3,
            nextScore,
            BALLOON_LEVELS.length
          );
          setNewlyEarnedComponent(rewardResult.newlyEarnedComponent);
          setIsCelebrationOpen(true);
          if (onEarnReward) onEarnReward(20);
        }, 500);
      }
    } else {
      // Wrong item wiggle
      playWrongBuzzer();
      playArabicSound(item.sound);
      setShakeIndex(idx);
      setTimeout(() => setShakeIndex(null), 500);
    }
  };

  const handleNextLevel = () => {
    setIsCelebrationOpen(false);
    if (currentLevelId < BALLOON_LEVELS.length) {
      setCurrentLevel(currentLevelId + 1);
    } else {
      setCurrentLevel(1);
    }
    initLevel();
  };

  const handleRetryLevel = () => {
    setIsCelebrationOpen(false);
    initLevel();
  };

  const learningPool = activeLevel.letters
    .filter((l) => l.correct)
    .map((l) => ({
      ar: l.ar,
      nameBn: l.nameBn,
      tip: `হরকত: ${activeLevel.target}`,
    }));

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 rounded-3xl sm:rounded-[3rem] bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 border-4 border-sky-300 shadow-2xl space-y-4 select-none relative overflow-hidden">
      {/* ☁️ Whimsical Sky Cartoon Background with Floating Clouds */}
      <div className="absolute top-2 left-6 text-2xl sm:text-3xl opacity-70 animate-float-slow pointer-events-none">
        ☁️
      </div>
      <div
        className="absolute top-10 right-8 text-3xl sm:text-4xl opacity-70 animate-float-slow pointer-events-none"
        style={{ animationDelay: "2s" }}
      >
        ☁️
      </div>
      <div className="absolute top-3 right-1/2 translate-x-1/2 text-2xl opacity-60 pointer-events-none">
        ☀️
      </div>

      {/* ── TOP HEADER (HUD) ── */}
      <div className="flex items-center justify-between border-b-2 border-sky-200/80 pb-3 flex-wrap gap-2 relative z-10 bg-white/70 backdrop-blur-xs p-2.5 rounded-2xl">
        <button
          type="button"
          data-testid="game-back-btn"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 border-2 border-sky-200 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Journey Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 shadow-xs">
            <span>{journey.icon}</span>
            <span>
              {earnedRewardIds.length}/{journey.totalMilestones} উপাদান
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeachModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition"
            title="হরকত দেখে নাও"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিখে নাও</span>
          </button>

          <span className="kids-font text-xs font-black text-slate-800 bg-white px-3.5 py-1.5 rounded-full border-2 border-amber-300 shadow-xs flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{score} পয়েন্ট</span>
          </span>

          <button
            type="button"
            onClick={handleRetryLevel}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="নতুন করে শুরু"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 6 LEVEL SELECTOR DOCK ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
        {BALLOON_LEVELS.map((lvl, idx) => {
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
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 border-sky-600 text-white shadow-lg scale-105"
                  : unlocked
                  ? "bg-white border-sky-200 text-sky-950 hover:bg-sky-50 shadow-xs"
                  : "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
              }`}
            >
              <span>{unlocked ? lvl.title : `🔒 ${lvl.title}`}</span>
              {lvlStars > 0 && (
                <span className="text-amber-300 text-[10px]">
                  {"⭐".repeat(lvlStars)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 🎡 INTERACTIVE KIDS FUN PARK BUILDING SCENE ── */}
      <div className="relative z-10">
        <InteractiveBuildingVisualizer
          gameId="balloon-pop"
          earnedRewardIds={earnedRewardIds}
          currentLevel={currentLevelId}
        />
      </div>

      {/* ── LEVEL MISSION BANNER ── */}
      <div className="text-center space-y-1 relative z-10 py-1 bg-white/80 backdrop-blur-xs rounded-2xl border-2 border-sky-200 px-4 max-w-lg mx-auto shadow-xs">
        <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center justify-center gap-2">
          <span>🎯 মিশন:</span>
          <span className="text-rose-600 underline decoration-wavy decoration-rose-400">
            {activeLevel.target}
          </span>
          <span>যুক্ত বেলুন ফাটাও!</span>
        </h2>
        <p className="text-xs text-slate-600 font-bold">
          {activeLevel.instructionBn}
        </p>
      </div>

      {/* ── 🎈 VINA-KIDS STYLE REAL FLOATING BALLOONS PLAYGROUND ── */}
      <div className="relative z-10 min-h-[340px] sm:min-h-[380px] p-2 flex items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-xl mx-auto w-full py-4">
          {activeLevel.letters.map((item, idx) => {
            const isPopped = poppedBalloons.includes(idx);
            const isPopping = poppingIndex === idx;
            const isShaking = shakeIndex === idx;
            const theme = BALLOON_COLOR_THEMES[idx % BALLOON_COLOR_THEMES.length];
            const floatDelay = `${(idx * 0.45).toFixed(2)}s`;

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-center"
              >
                {/* 🎈 The 3D Tactile Balloon */}
                <button
                  type="button"
                  data-testid={`balloon-${idx}`}
                  data-correct={item.correct ? "true" : "false"}
                  data-ar={item.ar}
                  disabled={isPopped || isPopping}
                  onClick={() => handlePopBalloon(item, idx)}
                  style={{
                    animationDelay: floatDelay,
                  }}
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer group ${
                    isPopped
                      ? "opacity-0 scale-0 pointer-events-none transition-all duration-500"
                      : isPopping
                      ? "scale-130 rotate-12 opacity-80 animate-ping"
                      : isShaking
                      ? "animate-kids-wiggle"
                      : "animate-kids-float hover:scale-105 active:scale-95"
                  }`}
                >
                  {/* Balloon Body: Realistic Oval with Glossy Highlights */}
                  <div
                    className={`w-24 h-32 sm:w-28 sm:h-36 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-b ${theme.gradient} ${theme.text} ${theme.shadow} border-2 ${theme.border} shadow-xl flex flex-col items-center justify-center relative p-2 overflow-hidden`}
                  >
                    {/* Glossy Curved Light Spot (Juicy 3D Shine) */}
                    <div className="absolute top-2.5 left-3.5 w-3.5 h-7 sm:w-4 sm:h-8 bg-white/45 blur-[0.5px] rounded-full rotate-[-30deg] pointer-events-none" />

                    {/* Secondary subtle rim shine */}
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/20 rounded-full pointer-events-none" />

                    {/* Sacred Arabic Text */}
                    <span className="text-3xl sm:text-5xl font-bold font-arabic leading-tight drop-shadow-md z-10 group-hover:scale-110 transition-transform">
                      {item.ar}
                    </span>

                    <span className="text-[10px] font-black opacity-90 mt-1 z-10 bg-black/15 px-2 py-0.5 rounded-full">
                      {item.nameBn}
                    </span>
                  </div>

                  {/* Balloon Bottom Knot */}
                  <div
                    className={`w-3.5 h-2.5 ${theme.knot} rounded-full -mt-1 shadow-xs z-10 border border-white/20`}
                  />

                  {/* Swaying SVG Balloon String */}
                  <svg
                    className="w-6 h-12 text-slate-400/80 stroke-current fill-none stroke-[2] -mt-0.5 pointer-events-none"
                    viewBox="0 0 30 50"
                  >
                    <path
                      d="M15 0 Q8 15 20 30 T15 50"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* 💥 Popping Explosion Splash Particles */}
                {isPopping && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 animate-ping" />
                    <div className="text-2xl animate-bounce">🎈🎉🎈</div>
                  </div>
                )}

                {/* 🌟 Floating Score Tag */}
                {floatingScoreTag && floatingScoreTag.idx === idx && (
                  <div className="absolute -top-6 text-emerald-700 font-black text-sm bg-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400 shadow-md animate-kids-pop z-30">
                    {floatingScoreTag.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌿 Grassy Meadow Ground Footer with Little Flowers */}
      <div className="relative z-10 border-t-2 border-emerald-300/60 pt-2 flex items-center justify-between px-3 text-sm text-emerald-800">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span>🌸 🌼</span>
          <span>নূর পার্কের আনন্দভূমি</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span>আজকের অবশিষ্ট বেলুন:</span>
          <span className="font-black text-emerald-950 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
            {
              activeLevel.letters.filter(
                (l, i) => l.correct && !poppedBalloons.includes(i)
              ).length
            }
            টি
          </span>
          <span>🌺</span>
        </div>
      </div>

      {/* 🤖 Friendly Nuru Mascot Advice */}
      <div className="flex justify-center pt-1 relative z-10">
        <NuruMascot
          size="sm"
          mood={isWon ? "celebrating" : "happy"}
          dialogue={
            isWon
              ? "মাশাআল্লাহ! আনন্দ পার্কের বেলুন মিশন সম্পন্ন হয়েছে!"
              : `সোনামণি, যে বেলুনগুলোতে ${activeLevel.target} আছে সেগুলো হাত দিয়ে ফাটাও!`
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
        earnedStars={3}
        earnedScore={score}
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
