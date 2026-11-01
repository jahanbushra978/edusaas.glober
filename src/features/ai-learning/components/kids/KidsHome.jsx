"use client";

import React, { useState, useEffect } from "react";
import { Settings, Gamepad2, X, BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";
import BigChoiceButton from "./BigChoiceButton";
import NuruMascot from "./NuruMascot";
import ParentGate from "./ParentGate";
import KidsLesson from "./KidsLesson";
import StarJar from "./StarJar";
import MemoryMatchGame from "../games/MemoryMatchGame";
import SoundDetectiveGame from "../games/SoundDetectiveGame";
import DotCountGame from "../games/DotCountGame";
import TraceLetterGame from "../games/TraceLetterGame";
import HarakatGame from "../games/HarakatGame";
import DragDropLetterGame from "../games/DragDropLetterGame";
import { playVoicePrompt } from "../../lib/voicePrompts";
import {
  playCorrectChime,
  playWrongBuzzer,
  playStarPopSound,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import { KIDS_CURRICULUM_STAGES } from "../../data/kidsGameData";

export default function KidsHome({
  onSwitchToAdult,
  _onOpenLearning,
  _onOpenGames,
}) {
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isStagesMenuOpen, setIsStagesMenuOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("stage-huruf");
  const [isStarJarOpen, setIsStarJarOpen] = useState(false);
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const [activeGame, setActiveGame] = useState(null); // 'memory' | 'detective' | 'dot' | 'trace' | 'harakat'
  const [stars, setStars] = useState(15);
  const [lessonLetterIndex, setLessonLetterIndex] = useState(0);
  const [mascotDialogue, setMascotDialogue] = useState("আসসালামু আলাইকুম! চলো, খেলি!");

  // Load saved stars and lesson letter from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("noor_kids_stars");
      if (saved) {
        setStars(parseInt(saved, 10) || 15);
      }
      const savedLetter = localStorage.getItem("noor_kids_letter_idx");
      if (savedLetter !== null) {
        setLessonLetterIndex(parseInt(savedLetter, 10) || 0);
      }
      const savedStage = localStorage.getItem("noor_kids_stage");
      if (savedStage) {
        setSelectedStage(savedStage);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleEarnStars = (count = 1) => {
    setStars((prev) => {
      const next = prev + count;
      try {
        localStorage.setItem("noor_kids_stars", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLessonAdvance = (newIdx) => {
    setLessonLetterIndex(newIdx);
    try {
      localStorage.setItem("noor_kids_letter_idx", String(newIdx));
    } catch {
      // ignore
    }
  };

  // Unlock browser audio context on first user tap
  const handleStart = () => {
    setHasStartedAudio(true);
    playTapSound();
    setTimeout(() => {
      playVoicePrompt("welcome");
      playCorrectChime();
    }, 150);
  };

  const handleLearnClick = () => {
    playVoicePrompt("learn_mode");
    setMascotDialogue("চলো, কি শিখবে বেছে নাও!");
    setTimeout(() => {
      setIsStagesMenuOpen(true);
    }, 250);
  };

  const handleSelectStage = (stageId) => {
    const stage = KIDS_CURRICULUM_STAGES.find((s) => s.id === stageId);
    const required = stage?.minStarsToUnlock || 0;
    if (stars < required) {
      playWrongBuzzer();
      const needed = required - stars;
      setMascotDialogue(`আরও ${needed}টি তারা পেলে এই ধাপটি খুলে যাবে, সোনা! আগের খেলা ও পাঠ শেষ করো!`);
      toast.info(`এই ধাপটি আনলক করতে মোট ${required}টি তারা প্রয়োজন (আরও ${needed}টি বাকি)`);
      return;
    }

    playTapSound();
    setSelectedStage(stageId);
    try {
      localStorage.setItem("noor_kids_stage", stageId);
    } catch {
      // ignore
    }
    setIsStagesMenuOpen(false);
    setTimeout(() => {
      setIsLessonOpen(true);
    }, 200);
  };

  const handleGamesClick = () => {
    playVoicePrompt("game_mode");
    setMascotDialogue("মজার মজার খেলা খেলি!");
    setTimeout(() => {
      setIsGamesMenuOpen(true);
    }, 300);
  };

  const handleStarsClick = () => {
    playVoicePrompt("star_mode");
    playStarPopSound(3);
    setMascotDialogue(`মাশাআল্লাহ! তোমার কাছে ${stars}টি তারা আছে!`);
    setTimeout(() => {
      setIsStarJarOpen(true);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#F4FBF7] to-[#EAF7FF] text-slate-800 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* ── TOP KIDS HUD ── */}
      <header className="h-20 px-4 sm:px-8 flex items-center justify-between z-30 max-w-5xl w-full mx-auto">
        {/* Star Jar / Star Counter */}
        <button
          type="button"
          onClick={handleStarsClick}
          className="kids-tap px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 border-4 border-amber-500 shadow-[0_6px_0_0_#D97706] flex items-center gap-2 cursor-pointer active:translate-y-1"
          title="তোমার জমানো তারা"
        >
          <span className="text-2xl animate-kids-twinkle">⭐</span>
          <span className="kids-font text-lg sm:text-2xl font-black text-slate-950">
            {stars}
          </span>
        </button>

        {/* Center Tag & Offline Indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 border-2 border-emerald-300 shadow-xs">
            <span className="text-xl">🧒</span>
            <span className="kids-font text-sm font-black text-emerald-900">
              ছোটদের নূর এআই
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/90 border-2 border-emerald-400 text-emerald-950 shadow-xs"
            title="সব পাঠ ও খেলা অফলাইনেও ১০০% প্রস্তুত"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="kids-font text-xs font-black">
              📶 অফলাইন সক্রিয়
            </span>
          </div>
        </div>

        {/* Parent Gate Button */}
        <button
          type="button"
          onClick={() => setIsParentGateOpen(true)}
          className="kids-tap p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-white/90 hover:bg-white border-3 border-emerald-300 shadow-[0_4px_0_0_#10B981] flex items-center gap-2 text-slate-700 cursor-pointer active:translate-y-1"
          title="অভিভাবক নিয়ন্ত্রণ (Parent Settings)"
        >
          <Settings className="w-5 h-5 text-emerald-700" />
          <span className="kids-font text-xs sm:text-sm font-extrabold text-slate-800 hidden xs:inline">
            অভিভাবক
          </span>
        </button>
      </header>

      {/* ── MAIN STAGE ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-center">
        {/* STATE 1: BROWSER AUTOPLAY UNLOCK (GIANT START BUTTON) */}
        {!hasStartedAudio ? (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-kids-pop">
            <NuruMascot
              size="lg"
              message="আসসালামু আলাইকুম! চলো শুরু করি!"
              showSpeechBubble={true}
            />

            <button
              type="button"
              onClick={handleStart}
              className="kids-tap px-8 sm:px-12 py-6 sm:py-8 rounded-[3rem] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-2xl sm:text-4xl shadow-[0_14px_0_0_#065F46] border-4 border-emerald-300 active:translate-y-3 cursor-pointer flex items-center gap-4 transition-all"
            >
              <span className="text-4xl sm:text-5xl animate-bounce">▶️</span>
              <span className="kids-font tracking-wide">শুরু করি!</span>
            </button>

            <p className="kids-font text-xs sm:text-sm text-slate-500 font-semibold max-w-xs">
              শুরু করতে বড় বোতামটিতে ছোঁও!
            </p>
          </div>
        ) : (
          /* STATE 2: 4 GIANT TILES KIDS PORTAL + CURRICULUM SHELF */
          <div className="w-full flex flex-col items-center space-y-6 sm:space-y-8 animate-kids-pop">
            {/* Center Mascot with Voice Greeting */}
            <div className="flex flex-col items-center">
              <NuruMascot
                size="md"
                message={mascotDialogue}
                showSpeechBubble={true}
                onClick={() => playVoicePrompt("welcome")}
              />
            </div>

            {/* 4 Giant Child-Friendly Action Tiles */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xl">
              {/* Tile 1: শিখি (Learn) */}
              <BigChoiceButton
                arabic="ا"
                label="শিখি"
                subLabel="৬টি পূর্ণ ধাপ"
                color="mint"
                size="lg"
                badge="মক্তব"
                voicePromptKey="learn_mode"
                onClick={handleLearnClick}
              />

              {/* Tile 2: খেলি (Play Games) */}
              <BigChoiceButton
                icon="🎮"
                label="খেলি"
                subLabel="মজার খেলা"
                color="amber"
                size="lg"
                badge="৬টি গেম"
                voicePromptKey="game_mode"
                onClick={handleGamesClick}
              />

              {/* Tile 3: আমার তারা (My Stars) */}
              <BigChoiceButton
                icon="⭐"
                label="আমার তারা"
                subLabel={`${stars}টি জমানো`}
                color="sky"
                size="lg"
                voicePromptKey="star_mode"
                onClick={handleStarsClick}
              />

              {/* Tile 4: বড়দের মোড (Parents / Grown-ups) */}
              <BigChoiceButton
                icon="🧑"
                label="বড়দের মোড"
                subLabel="সেটিংস"
                color="lavender"
                size="lg"
                onClick={() => setIsParentGateOpen(true)}
              />
            </div>

            {/* QUICK MAKTAB CURRICULUM STRIP (HORIZONTAL SCROLLER) */}
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xs rounded-3xl p-4 border-2 border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="kids-font text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  মক্তব কুরআন সিলেবাস (৬টি ধাপ)
                </span>
                <button
                  type="button"
                  onClick={() => setIsStagesMenuOpen(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  সব ধাপ দেখো ➔
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {KIDS_CURRICULUM_STAGES.map((stg) => (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleSelectStage(stg.id)}
                    className={`kids-tap shrink-0 px-3 py-2 rounded-2xl border-2 flex items-center gap-2 cursor-pointer transition active:scale-95 ${
                      selectedStage === stg.id
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <span className="font-arabic text-lg font-bold">{stg.icon}</span>
                    <span className="kids-font text-xs font-black whitespace-nowrap">
                      {stg.number}. {stg.titleBn.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── STAGES SELECTION MODAL (6 MAKTAB STEPS) ── */}
      {isStagesMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-kids-pop select-none overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-[3rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FDF4] border-4 border-emerald-400 p-5 sm:p-7 shadow-2xl space-y-6 text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setIsStagesMenuOpen(false);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition active:scale-95 cursor-pointer z-10 border border-emerald-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-black">
                <BookOpen className="w-4 h-4" />
                <span>মক্তব কুরআন পাঠ্যক্রম</span>
              </div>
              <h3 className="kids-font text-2xl sm:text-3xl font-black text-slate-900">
                কোন ধাপটি শিখবে, সোনা?
              </h3>
            </div>

            {/* 8 Maktab Stage Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-left">
              {KIDS_CURRICULUM_STAGES.map((stg) => {
                const isLocked = stars < (stg.minStarsToUnlock || 0);
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleSelectStage(stg.id)}
                    className={`kids-tap p-4 rounded-[2rem] border-4 shadow-[0_6px_0_0_rgba(0,0,0,0.12)] flex flex-col justify-between cursor-pointer active:translate-y-1 transition-all relative overflow-hidden ${
                      isLocked
                        ? "bg-slate-100 border-slate-300 text-slate-500 opacity-80"
                        : stg.id === "stage-huruf"
                        ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-950"
                        : stg.id === "stage-murakkabat"
                        ? "bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-950"
                        : stg.id === "stage-harakat"
                        ? "bg-sky-50 hover:bg-sky-100 border-sky-400 text-sky-950"
                        : stg.id === "stage-tanween"
                        ? "bg-purple-50 hover:bg-purple-100 border-purple-400 text-purple-950"
                        : stg.id === "stage-qalqalah"
                        ? "bg-rose-50 hover:bg-rose-100 border-rose-400 text-rose-950"
                        : "bg-teal-50 hover:bg-teal-100 border-teal-400 text-teal-950"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="w-8 h-8 rounded-full bg-white/80 border-2 border-current flex items-center justify-center font-bold text-xs">
                        {isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : stg.number}
                      </span>
                      <span className="font-arabic text-3xl font-bold">
                        {stg.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="kids-font text-base sm:text-lg font-black leading-tight flex items-center gap-1.5">
                        <span>{stg.titleBn}</span>
                        {isLocked && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">🔒 লক</span>}
                      </h4>
                      <p className="kids-font text-[11px] sm:text-xs opacity-80 mt-1 font-semibold line-clamp-1">
                        {isLocked ? `আনলক করতে ${stg.minStarsToUnlock}টি তারা দরকার` : stg.subTitleBn}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-bold">
                      <span>{stg.itemCount}টি পাঠ</span>
                      <span className="underline">{isLocked ? "লক করা 🔒" : "শুরু করো ➔"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── KIDS LESSON EXPERIENCE MODAL ── */}
      <KidsLesson
        isOpen={isLessonOpen}
        onClose={() => setIsLessonOpen(false)}
        initialStage={selectedStage}
        initialLetterIndex={lessonLetterIndex}
        onLetterChange={handleLessonAdvance}
        onEarnStar={() => handleEarnStars(1)}
      />

      {/* ── STAR JAR MODAL ── */}
      <StarJar
        isOpen={isStarJarOpen}
        onClose={() => setIsStarJarOpen(false)}
        stars={stars}
      />

      {/* ── KIDS GAMES SHELF MODAL / SCREEN ── */}
      {isGamesMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-kids-pop select-none overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-[3rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#FEF3C7] border-4 border-amber-400 p-5 sm:p-7 shadow-2xl space-y-6 text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setIsGamesMenuOpen(false);
              }}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 transition active:scale-95 cursor-pointer z-10 border border-amber-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs font-black">
                <Gamepad2 className="w-4 h-4" />
                <span>মজার খেলাঘর</span>
              </div>
              <h3 className="kids-font text-2xl sm:text-3xl font-black text-slate-900">
                কোন খেলাটি খেলবে?
              </h3>
            </div>

            {/* 5 Big Child-Friendly Game Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
              {/* Game 1: হরফ মেলানো */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("memory");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#D1FAE5] hover:bg-[#A7F3D0] border-4 border-emerald-400 shadow-[0_8px_0_0_#10B981] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-xs">
                  🃏
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-emerald-950">
                    হরফ জোড়া
                  </h4>
                  <p className="kids-font text-xs font-bold text-emerald-700">
                    মেমোরি কার্ড মেলাও
                  </p>
                </div>
              </button>

              {/* Game 2: আওয়াজ চিনো */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("detective");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#E0F2FE] hover:bg-[#BAE6FD] border-4 border-sky-400 shadow-[0_8px_0_0_#0284C7] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center text-3xl shadow-xs">
                  👂
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-sky-950">
                    আওয়াজ চিনো
                  </h4>
                  <p className="kids-font text-xs font-bold text-sky-700">
                    শুনে সঠিক হরফ ধরো
                  </p>
                </div>
              </button>

              {/* Game 3: নুকতা গোনো */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("dot");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#FEF3C7] hover:bg-[#FDE68A] border-4 border-amber-400 shadow-[0_8px_0_0_#D97706] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-xs">
                  🎯
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-amber-950">
                    নুকতা গোনো
                  </h4>
                  <p className="kids-font text-xs font-bold text-amber-700">
                    ডট গুনে পয়েন্ট নাও
                  </p>
                </div>
              </button>

              {/* Game 4: হরফ আঁকো */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("trace");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#EDE9FE] hover:bg-[#DDD6FE] border-4 border-purple-400 shadow-[0_8px_0_0_#7C3AED] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-purple-300 flex items-center justify-center text-3xl shadow-xs">
                  ✍️
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-purple-950">
                    হরফ আঁকো
                  </h4>
                  <p className="kids-font text-xs font-bold text-purple-700">
                    আঙুল দিয়ে ক্যানভাসে দাগাও
                  </p>
                </div>
              </button>

              {/* Game 5: হরকত মাস্টার */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("harakat");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#FFE4E6] hover:bg-[#FECDD3] border-4 border-rose-400 shadow-[0_8px_0_0_#E11D48] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-300 flex items-center justify-center text-3xl shadow-xs">
                  🎶
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-rose-950">
                    হরকত মাস্টার (যবর, যের, পেশ)
                  </h4>
                  <p className="kids-font text-xs font-bold text-rose-700">
                    ক্বারীর খাঁটি সুরে হরকত শনাক্ত করো
                  </p>
                </div>
              </button>

              {/* Game 6: ড্র্যাগ-অ্যান্ড-ড্রপ হরফ মেলানো */}
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGame("dragdrop");
                }}
                className="kids-tap p-4 rounded-[2rem] bg-[#CCFBF1] hover:bg-[#99F6E4] border-4 border-teal-400 shadow-[0_8px_0_0_#0D9488] flex items-center gap-4 cursor-pointer active:translate-y-1.5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-teal-300 flex items-center justify-center text-3xl shadow-xs">
                  🎯
                </div>
                <div>
                  <h4 className="kids-font text-lg font-black text-teal-950">
                    হরফ মেলানো (ড্র্যাগ ও ড্রপ)
                  </h4>
                  <p className="kids-font text-xs font-bold text-teal-700">
                    কার্ড টেনে সঠিক বাক্সে মেলাও ও ক্বারীর কণ্ঠ শোনো
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEDICATED FULL-SCREEN GAME MODAL (WHEN A GAME IS SELECTED) ── */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-kids-pop select-none overflow-y-auto">
          <div className="relative w-full max-w-2xl">
            {activeGame === "memory" && (
              <MemoryMatchGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(2)}
              />
            )}
            {activeGame === "detective" && (
              <SoundDetectiveGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(2)}
              />
            )}
            {activeGame === "dot" && (
              <DotCountGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(2)}
              />
            )}
            {activeGame === "trace" && (
              <TraceLetterGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(3)}
              />
            )}
            {activeGame === "harakat" && (
              <HarakatGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(2)}
              />
            )}
            {activeGame === "dragdrop" && (
              <DragDropLetterGame
                onBack={() => setActiveGame(null)}
                onEarnReward={() => handleEarnStars(3)}
              />
            )}
          </div>
        </div>
      )}

      {/* ── PARENT GATE MODAL ── */}
      <ParentGate
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSwitchToAdult={onSwitchToAdult}
        onResetChoice={() => {
          setHasStartedAudio(false);
          setIsParentGateOpen(false);
        }}
      />
    </div>
  );
}
