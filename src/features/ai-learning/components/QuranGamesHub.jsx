"use client";

import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Award,
  Trophy,
  Play,
  RotateCcw,
  CheckCircle2,
  Volume2,
  ArrowLeft,
  Star,
  Flame,
  HelpCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { fireCelebrationConfetti } from "../lib/confetti";
import {
  playCorrectChime,
  playWrongBuzzer,
  playTapSound,
  playStarPopSound,
  playArabicSound,
  playMaShaAllahCelebration,
} from "../lib/arabicSoundPlayer";

// 🎮 Curated Quran Educational Games
const QURAN_GAMES = [
  {
    id: "balloon-pop",
    title: "হরকত বেলুন পপ",
    titleEn: "Harakat Balloon Pop",
    desc: "সঠিক হরকত (যবর, যের, পেশ) চিনে বেলুন ফাটাও এবং দ্রুত পয়েন্ট অর্জন করো!",
    badge: "জনপ্রিয় খেলা",
    difficulty: "সহজ",
    xpReward: 20,
    playable: true,
    colorGradient: "from-emerald-500 to-teal-600",
    bgTint: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "letter-match",
    title: "হরফ মেলানো মেমোরি কার্ড",
    titleEn: "Arabic Letter Memory Match",
    desc: "কার্ড উল্টিয়ে একই আরবী হরফের জোড়া মেলাও ও মাখরাজ ধ্বনি শোনো।",
    badge: "স্মৃতি পরীক্ষা",
    difficulty: "সহজ",
    xpReward: 25,
    playable: true,
    colorGradient: "from-amber-500 to-orange-600",
    bgTint: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  {
    id: "makhraj-challenge",
    title: "মাখরাজ অঙ্গ লক্ষ্যভেদ",
    titleEn: "Makhraj Target Challenge",
    desc: "হরফ দেখে বলো এটি কণ্ঠনালী, জিহ্বা, নাকি ঠোঁট থেকে উচ্চারিত হয়।",
    badge: "তাজবীদ জ্ঞান",
    difficulty: "মাঝারি",
    xpReward: 30,
    playable: true,
    colorGradient: "from-sky-500 to-blue-600",
    bgTint: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
  },
  {
    id: "tajweed-gem-hunt",
    title: "তাজবীদ রত্ন শিকার",
    titleEn: "Tajweed Gem Hunt",
    desc: "আয়াতের ভেতর থেকে গুন্নাহ, ইখফা ও ক্বলক্বলাহ খুঁজে বের করে রত্ন জেতো।",
    badge: "উচ্চতর তাজবীদ",
    difficulty: "উস্তাদ",
    xpReward: 50,
    playable: false,
    comingSoon: true,
    colorGradient: "from-purple-500 to-indigo-600",
    bgTint: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  {
    id: "word-builder",
    title: "কুরআনিক শব্দ গঠন",
    titleEn: "Quranic Word Builder",
    desc: "বিচ্ছিন্ন হরফগুলোকে সঠিকভাবে যুক্ত করে পবিত্র কুরআনের শব্দ বানাও।",
    badge: "আরবী হরফ জোড়া",
    difficulty: "মাঝারি",
    xpReward: 35,
    playable: false,
    comingSoon: true,
    colorGradient: "from-rose-500 to-pink-600",
    bgTint: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
  },
];

// Balloon Pop Game Data
const BALLOON_LEVELS = [
  { target: "যবর (َ )", targetChar: "َ", letters: [{ ar: "بَ", correct: true, sound: "بَ" }, { ar: "بِ", correct: false, sound: "بِ" }, { ar: "بُ", correct: false, sound: "بُ" }, { ar: "تَ", correct: true, sound: "تَ" }] },
  { target: "যের (ِ )", targetChar: "ِ", letters: [{ ar: "سِ", correct: true, sound: "سِ" }, { ar: "سَ", correct: false, sound: "سَ" }, { ar: "مِ", correct: true, sound: "مِ" }, { ar: "مُ", correct: false, sound: "مُ" }] },
  { target: "পেশ (ُ )", targetChar: "ُ", letters: [{ ar: "نُ", correct: true, sound: "نُ" }, { ar: "نَ", correct: false, sound: "نَ" }, { ar: "رُ", correct: true, sound: "رُ" }, { ar: "رِ", correct: false, sound: "رِ" }] },
];

// Makhraj Quiz Data
const MAKHRAJ_LEVELS = [
  { letter: "ق", name: "ক্বাফ", options: ["জিহ্বার গোড়া (আক্বসাল লিসান)", "দুই ঠোঁট", "কণ্ঠনালীর নিম্নাংশ"], correctIdx: 0, makhraj: "জিহ্বার গোড়া ওপরের নরম তালুর সাথে লাগিয়ে ভারী হরফ ক্বাফ (ق)।" },
  { letter: "ع", name: "আইন", options: ["দুই ঠোঁটের মধ্যখান", "কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)", "জিহ্বার আগা"], correctIdx: 1, makhraj: "কণ্ঠনালীর মধ্যভাগ থেকে চাপ দিয়ে খাঁটি হরফ আইন (ع)।" },
  { letter: "ب", name: "বা", options: ["জিহ্বার কিনারা", "কণ্ঠনালী", "দুই ঠোঁটের ভিজা অংশ (আশ-শাফাতান)"], correctIdx: 2, makhraj: "দুই ঠোঁটের ভিজা অংশ মিলিয়ে উচ্চারিত হয় বা (ب)।" },
];

export default function QuranGamesHub({ onEarnXP }) {
  const [activeGameId, setActiveGameId] = useState(null);

  // Balloon Pop State
  const [balloonLevelIdx, setBalloonLevelIdx] = useState(0);
  const [balloonScore, setBalloonScore] = useState(0);
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [balloonGameOver, setBalloonGameOver] = useState(false);

  // Makhraj Quiz State
  const [makhrajLevelIdx, setMakhrajLevelIdx] = useState(0);
  const [makhrajScore, setMakhrajScore] = useState(0);
  const [selectedMakhrajOption, setSelectedMakhrajOption] = useState(null);
  const [isMakhrajAnswered, setIsMakhrajAnswered] = useState(false);
  const [makhrajGameOver, setMakhrajGameOver] = useState(false);

  // Reset Balloon Game
  const startBalloonGame = () => {
    setActiveGameId("balloon-pop");
    setBalloonLevelIdx(0);
    setBalloonScore(0);
    setPoppedBalloons([]);
    setBalloonGameOver(false);
  };

  // Reset Makhraj Game
  const startMakhrajGame = () => {
    setActiveGameId("makhraj-challenge");
    setMakhrajLevelIdx(0);
    setMakhrajScore(0);
    setSelectedMakhrajOption(null);
    setIsMakhrajAnswered(false);
    setMakhrajGameOver(false);
  };

  // Handle Balloon Click
  const handlePopBalloon = (item, idx) => {
    if (poppedBalloons.includes(idx)) return;
    playTapSound();
    playArabicSound(item.sound);

    if (item.correct) {
      playCorrectChime();
      setPoppedBalloons((prev) => [...prev, idx]);
      setBalloonScore((s) => s + 10);
      toast.success("মাশাআল্লাহ! সঠিক হরকত বেলুন ফুটেছে! 🎈");

      // Check if all correct popped in current level
      const currentLevel = BALLOON_LEVELS[balloonLevelIdx];
      const remainingCorrect = currentLevel.letters.filter((l, i) => l.correct && !poppedBalloons.includes(i) && i !== idx);

      if (remainingCorrect.length === 0) {
        setTimeout(() => {
          if (balloonLevelIdx + 1 < BALLOON_LEVELS.length) {
            setBalloonLevelIdx((prev) => prev + 1);
            setPoppedBalloons([]);
            playStarPopSound();
          } else {
            setBalloonGameOver(true);
            playMaShaAllahCelebration();
            fireCelebrationConfetti();
            if (onEarnXP) onEarnXP(20);
          }
        }, 800);
      }
    } else {
      playWrongBuzzer();
      toast.error("ওহো! এটি সঠিক হরকত নয়, আবার দেখে ট্যাপ করো!");
    }
  };

  // Handle Makhraj Option Select
  const handleSelectMakhraj = (optionIdx) => {
    if (isMakhrajAnswered) return;
    setSelectedMakhrajOption(optionIdx);
    setIsMakhrajAnswered(true);

    const currentQ = MAKHRAJ_LEVELS[makhrajLevelIdx];
    if (optionIdx === currentQ.correctIdx) {
      playCorrectChime();
      setMakhrajScore((s) => s + 15);
      toast.success("মাশাআল্লাহ! একদম নিখুঁত মাখরাজ!");
    } else {
      playWrongBuzzer();
      toast.error("ভুল উত্তর, সঠিক মাখরাজ দেখে নাও!");
    }
  };

  const handleNextMakhraj = () => {
    if (makhrajLevelIdx + 1 < MAKHRAJ_LEVELS.length) {
      setMakhrajLevelIdx((prev) => prev + 1);
      setSelectedMakhrajOption(null);
      setIsMakhrajAnswered(false);
    } else {
      setMakhrajGameOver(true);
      playMaShaAllahCelebration();
      fireCelebrationConfetti();
      if (onEarnXP) onEarnXP(30);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── ACTIVE GAME CONTAINER ── */}
      {activeGameId === "balloon-pop" ? (
        /* 🎈 BALLOON POP GAME VIEW */
        <div className="w-full p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 shadow-xl space-y-5 animate-fade-in">
          {/* Top Game Bar */}
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900 pb-3">
            <button
              type="button"
              onClick={() => setActiveGameId(null)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>গেম লিস্টে ফিরুন</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                লেভেল {balloonLevelIdx + 1} / {BALLOON_LEVELS.length}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-extrabold">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{balloonScore} পয়েন্ট</span>
              </div>
            </div>
          </div>

          {!balloonGameOver ? (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 text-xs sm:text-sm font-black border border-emerald-300 dark:border-emerald-700">
                🎯 খুঁজে বের করো: {BALLOON_LEVELS[balloonLevelIdx].target} যুক্ত বেলুন!
              </div>

              {/* Balloons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-xl pt-4">
                {BALLOON_LEVELS[balloonLevelIdx].letters.map((item, idx) => {
                  const isPopped = poppedBalloons.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPopped}
                      onClick={() => handlePopBalloon(item, idx)}
                      className={`h-28 sm:h-36 rounded-3xl flex flex-col items-center justify-center p-3 relative transition-all duration-300 select-none cursor-pointer ${
                        isPopped
                          ? "opacity-20 scale-75 bg-slate-100 dark:bg-slate-900 border-dashed border-2 border-slate-300"
                          : "bg-gradient-to-t from-emerald-500 via-teal-500 to-emerald-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-2 active:scale-95 border-2 border-emerald-200"
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl font-bold font-arabic mb-1 leading-tight">
                        {item.ar}
                      </span>
                      <span className="text-[10px] font-semibold opacity-90">ট্যাপ করো 🎈</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Celebration Screen */
            <div className="flex flex-col items-center text-center space-y-4 py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center border-2 border-amber-300 shadow-md">
                <Trophy className="w-10 h-10 text-amber-500 fill-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white">
                مَا شَاءَ اللَّهُ! চমৎকার খেলেছো!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
                তুমি সফলভাবে সবগুলো হরকত বেলুন চিনেছো এবং {balloonScore} পয়েন্ট অর্জন করেছো!
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startBalloonGame}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>আবার খেলো</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGameId(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  অন্য গেম বেছে নাও
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeGameId === "makhraj-challenge" ? (
        /* 🎯 MAKHRAJ TARGET GAME VIEW */
        <div className="w-full p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 shadow-xl space-y-5 animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900 pb-3">
            <button
              type="button"
              onClick={() => setActiveGameId(null)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>গেম লিস্টে ফিরুন</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                প্রশ্ন {makhrajLevelIdx + 1} / {MAKHRAJ_LEVELS.length}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-extrabold">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{makhrajScore} পয়েন্ট</span>
              </div>
            </div>
          </div>

          {!makhrajGameOver ? (
            <div className="flex flex-col items-center text-center space-y-5 py-2 max-w-xl mx-auto">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex flex-col items-center justify-center text-white shadow-lg border-2 border-emerald-200">
                <span className="text-5xl sm:text-6xl font-bold font-arabic">
                  {MAKHRAJ_LEVELS[makhrajLevelIdx].letter}
                </span>
                <span className="text-[11px] font-bold opacity-90">
                  {MAKHRAJ_LEVELS[makhrajLevelIdx].name}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                হরফটির সঠিক মাখরাজ (উচ্চারণ স্থান) কোনটি?
              </h4>

              {/* Options */}
              <div className="w-full space-y-2.5">
                {MAKHRAJ_LEVELS[makhrajLevelIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedMakhrajOption === oIdx;
                  const isCorrect = oIdx === MAKHRAJ_LEVELS[makhrajLevelIdx].correctIdx;

                  let btnStyle = "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-emerald-800 hover:border-emerald-400 text-slate-800 dark:text-slate-200";
                  if (isMakhrajAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-100 dark:bg-emerald-900 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-extrabold";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-950 dark:text-rose-100";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isMakhrajAnswered}
                      onClick={() => handleSelectMakhraj(oIdx)}
                      className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isMakhrajAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isMakhrajAnswered && (
                <div className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 animate-fade-in">
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                    💡 {MAKHRAJ_LEVELS[makhrajLevelIdx].makhraj}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextMakhraj}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:scale-101 active:scale-98 transition-all cursor-pointer"
                  >
                    পরবর্তী প্রশ্ন ➔
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Celebration Screen */
            <div className="flex flex-col items-center text-center space-y-4 py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center border-2 border-amber-300 shadow-md">
                <Trophy className="w-10 h-10 text-amber-500 fill-amber-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-white">
                মাশাআল্লাহ! মাখরাজ চ্যালেঞ্জ সম্পন্ন!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
                তুমি সফলভাবে ১৭ মাখরাজের গুরুত্বপূর্ণ অঙ্গ শনাক্ত করেছো এবং {makhrajScore} পয়েন্ট অর্জন করেছো!
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startMakhrajGame}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>আবার খেলো</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGameId(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  অন্য গেম বেছে নাও
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── GAMES HUB DIRECTORY (Onosaee Visual Gallery) ── */
        <div className="w-full space-y-6 animate-fade-in">
          {/* Hero Banner for Games Hub */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold text-amber-300">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>ছোটদের কুরআন লার্নিং গেম জোন</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                খেলে খেলে কুরআন শিখি, পয়েন্ট ও উপহার জিতি!
              </h2>
              <p className="text-xs text-emerald-100 max-w-md">
                হরকত, মাখরাজ ও তাজবীদের আনন্দদায়ক গেম খেলে নিজের স্মৃতিশক্তি ও পড়ার শুদ্ধতা বাড়াও।
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={startBalloonGame}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-amber-950" />
                <span>প্রথম গেম খেলো</span>
              </button>
            </div>

            {/* Subtle background decorative shapes */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Games Grid (Extensible Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QURAN_GAMES.map((game) => (
              <div
                key={game.id}
                className={`p-4 sm:p-5 rounded-3xl border ${game.bgTint} shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-200 relative group`}
              >
                <div className="space-y-2.5">
                  {/* Card Header & Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      {game.badge}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-black text-amber-600 dark:text-amber-400">
                      <Trophy className="w-3.5 h-3.5 fill-amber-500" />
                      <span>+{game.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.colorGradient} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {game.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {game.titleEn}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {game.desc}
                  </p>
                </div>

                {/* Card Action Button */}
                <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    লেভেল: <span className="text-emerald-700 dark:text-emerald-300">{game.difficulty}</span>
                  </span>

                  {game.playable ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (game.id === "balloon-pop") startBalloonGame();
                        else if (game.id === "makhraj-challenge") startMakhrajGame();
                        else toast.info("গেমটি লোড হচ্ছে...");
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>খেলুন</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                      শীঘ্রই আসছে
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
