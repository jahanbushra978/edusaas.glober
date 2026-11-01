"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Volume2, ArrowRight } from "lucide-react";
import {
  KIDS_ARABIC_LETTERS, KIDS_MURAKKABAT_DATA, KIDS_HARAKAT_DRILL_DATA, KIDS_TANWEEN_DATA,
  KIDS_JAZM_QALQALAH_DATA, KIDS_TASHDEED_DATA, KIDS_MADD_DATA, KIDS_SURAHS_DATA, KIDS_CURRICULUM_STAGES,
} from "../../data/kidsGameData";
import { playCorrectChime, playStarPopSound, playMaShaAllahCelebration, playTapSound } from "../../lib/arabicSoundPlayer";
import { universalAudioEngine } from "@/lib/quran/audio";
import { playVoicePrompt } from "../../lib/voicePrompts";
import { fireCelebrationConfetti } from "../../lib/confetti";
import NuruMascot from "./NuruMascot";
import SurahRecitationView from "./SurahRecitationView.jsx";

export default function KidsLesson({
  isOpen,
  onClose,
  initialStage = "stage-huruf",
  initialLetterIndex = 0,
  onLetterChange,
  onEarnStar,
}) {
  const [activeStage, setActiveStage] = useState(initialStage);
  const [currentIdx, setCurrentIdx] = useState(initialLetterIndex);
  const [step, setStep] = useState(1); // 1: শুনি, 2: ছুঁয়ে দেখি, 3: খুঁজি, 4: তারা!
  const [touchCount, setTouchCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [mascotText, setMascotText] = useState("");
  const [options, setOptions] = useState([]);

  // Resolve current dataset based on stage
  const getStageItems = useCallback((stage) => {
    const map = {
      "stage-murakkabat": KIDS_MURAKKABAT_DATA,
      "stage-harakat": KIDS_HARAKAT_DRILL_DATA,
      "stage-tanween": KIDS_TANWEEN_DATA,
      "stage-qalqalah": KIDS_JAZM_QALQALAH_DATA,
      "stage-tashdeed": KIDS_TASHDEED_DATA,
      "stage-madd": KIDS_MADD_DATA,
      "stage-surahs": KIDS_SURAHS_DATA,
    };
    return map[stage] || KIDS_ARABIC_LETTERS;
  }, []);

  const currentItems = getStageItems(activeStage);
  const currentItem = currentItems[currentIdx] || currentItems[0] || {};

  // Sync initial letter/stage props
  useEffect(() => {
    if (initialStage) setActiveStage(initialStage);
  }, [initialStage]);

  useEffect(() => {
    if (initialLetterIndex !== undefined && initialLetterIndex !== null) {
      setCurrentIdx(Math.min(initialLetterIndex, currentItems.length - 1));
    }
  }, [initialLetterIndex, currentItems.length]);

  // Generate 3 choices for step 3 (খুঁজি)
  const generateOptions = useCallback((target) => {
    const distractors = currentItems
      .filter((l) => (l.ar || l.nameBn) !== (target.ar || target.nameBn))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    const pool = [target, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(pool);
  }, [currentItems]);

  // Audio Player for Current Item via Central Universal Audio Engine
  const playItemAudio = useCallback(() => {
    if (currentItem?.audio) {
      universalAudioEngine.playWord(currentItem.audio, {
        onError: () => {
          if (currentItem.ar) universalAudioEngine.playArabicSound(currentItem.ar);
        },
      });
    } else if (currentItem?.ar) {
      universalAudioEngine.playArabicSound(currentItem.ar);
    }
  }, [currentItem]);

  // Step 1: Initialize audio and speech
  useEffect(() => {
    if (!isOpen) return;

    if (activeStage === "stage-surahs") {
      setMascotText(`এসো, ${currentItem.nameBn} তিলাওয়াত শিখি!`);
      return;
    }

    if (step === 1) {
      setMascotText(`এসো, আজকে "${currentItem.nameBn}" শিখি!`);
      playVoicePrompt("lets_listen");
      const timer = setTimeout(() => {
        playItemAudio();
      }, 900);
      return () => clearTimeout(timer);
    } else if (step === 2) {
      setMascotText(`হরফটির ওপর আঙুল দিয়ে ছোঁও!`);
      setTouchCount(0);
    } else if (step === 3) {
      setMascotText(`কোনটা "${currentItem.nameBn}"? ছুঁয়ে দেখাও!`);
      generateOptions(currentItem);
      setWrongAttempts(0);
      playVoicePrompt("which_one");
    }
  }, [isOpen, step, currentItem, activeStage, generateOptions, playItemAudio]);

  if (!isOpen) return null;

  // Touch letter handler
  const handleTouchLetter = () => {
    playItemAudio();
    playStarPopSound(touchCount + 1);
    const nextCount = touchCount + 1;
    setTouchCount(nextCount);

    if (nextCount >= 2) {
      setTimeout(() => {
        setStep(3);
      }, 700);
    }
  };

  // Option select handler
  const handleSelectOption = (chosen) => {
    const isCorrect = (chosen.ar && chosen.ar === currentItem.ar) || chosen.nameBn === currentItem.nameBn;

    if (isCorrect) {
      playItemAudio();
      playCorrectChime();
      fireCelebrationConfetti();
      playMaShaAllahCelebration();
      setStep(4);
      setMascotText("মাশাআল্লাহ! খুব ভালো!");
      if (onEarnStar) onEarnStar();
    } else {
      playVoicePrompt("try_again");
      setWrongAttempts((prev) => prev + 1);
      setMascotText("উঁহু, আবার চেষ্টা করি!");
    }
  };

  // Advance to next item
  const handleNextItem = () => {
    playTapSound();
    const next = (currentIdx + 1) % currentItems.length;
    setCurrentIdx(next);
    setStep(1);
    setWrongAttempts(0);
    setTouchCount(0);
    if (onLetterChange) onLetterChange(next);
  };

  const handleSelectStage = (stageId) => {
    playTapSound();
    setActiveStage(stageId);
    setCurrentIdx(0);
    setStep(1);
    setWrongAttempts(0);
    setTouchCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-kids-pop select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-[3rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FDF4] border-4 border-emerald-400 p-4 sm:p-7 shadow-2xl space-y-4 text-center my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playTapSound();
            universalAudioEngine.stop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer z-20 border border-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── 6 STAGES CURRICULUM SELECTOR (নূরানী কায়দা পর্যায়) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {KIDS_CURRICULUM_STAGES.map((stg) => {
            const isSelected = activeStage === stg.id;
            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => handleSelectStage(stg.id)}
                className={`kids-tap shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border-2 ${ isSelected ? "bg-emerald-600 text-white border-emerald-700 shadow-md scale-105" : "bg-white text-slate-700 hover:bg-emerald-50 border-slate-200" }`}
              >
                <span className="font-amiri text-sm">{stg.icon}</span>
                <span className="kids-font">{stg.titleBn.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Title Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl py-1.5 px-4 inline-flex items-center gap-2">
          <span className="text-sm">📖</span>
          <span className="kids-font text-xs font-black text-emerald-950">
            {KIDS_CURRICULUM_STAGES.find((s) => s.id === activeStage)?.titleBn}
          </span>
          <span className="kids-font text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            {currentIdx + 1}/{currentItems.length}
          </span>
        </div>

        {/* ── STAGE ITEMS HORIZONTAL SCROLL CAROUSEL ── */}
        {activeStage !== "stage-surahs" && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none justify-start max-w-full">
            {currentItems.map((item, idx) => {
              const isCurr = idx === currentIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setCurrentIdx(idx);
                    setStep(1);
                    setWrongAttempts(0);
                    setTouchCount(0);
                  }}
                  className={`kids-tap shrink-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-amiri text-xl font-black cursor-pointer transition-all ${ isCurr ? "bg-amber-400 border-amber-600 text-slate-950 shadow-md scale-110" : "bg-white border-slate-200 text-slate-700 hover:bg-emerald-50" }`}
                >
                  {item.ar}
                </button>
              );
            })}
          </div>
        )}

        {/* Mascot */}
        <div className="flex flex-col items-center">
          <NuruMascot size="sm" message={mascotText} showSpeechBubble={true} />
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VIEW A: SURAH RECITATION MODE (আমপারা মাশক - ৩৮টি সূরা) */}
        {activeStage === "stage-surahs" ? (
          <SurahRecitationView
            currentIdx={currentIdx}
            onSelectSurah={(sIdx) => setCurrentIdx(sIdx)}
          />
        ) : (
          /* VIEW B: 5-STEP INTERACTIVE NOORANI QAIDA TEACHING LOOP       */
          /* ══════════════════════════════════════════════════════════════ */
          <>
            {/* Step Progress Pill */}
            <div className="flex items-center justify-center gap-2">
              {["১. শুনি", "২. ছুঁই", "৩. খুঁজি", "৪. তারা ⭐"].map((label, idx) => (
                <span
                  key={idx}
                  className={`kids-font text-[11px] sm:text-xs font-black px-3 py-1 rounded-full transition-all ${ step === idx + 1 ? "bg-emerald-600 text-white shadow-sm scale-105" : step > idx + 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400" }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* STEP 1: শুনি (LISTEN) */}
            {step === 1 && (
              <div className="py-2 space-y-5 animate-kids-pop">
                <button
                  type="button"
                  onClick={playItemAudio}
                  className="kids-tap mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-gradient-to-tr from-[#E6F8F0] via-white to-[#D1FAE5] border-4 border-emerald-500 shadow-[0_12px_0_0_#10B981] flex flex-col items-center justify-center active:translate-y-2 cursor-pointer group"
                >
                  <span className="font-amiri text-6xl sm:text-7xl font-black text-emerald-800 drop-shadow-sm group-hover:scale-110 transition-transform">
                    {currentItem.ar}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-emerald-700">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="kids-font text-xs font-black">{currentItem.nameBn}</span>
                  </div>
                </button>

                {currentItem.tip && (
                  <p className="kids-font text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl py-1 px-3 max-w-sm mx-auto">
                    💡 {currentItem.tip}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setStep(2);
                  }}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white kids-font text-sm font-black shadow-md active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>এগিয়ে যাই</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: ছুঁয়ে দেখি (TOUCH & FEEL) */}
            {step === 2 && (
              <div className="py-2 space-y-4 animate-kids-pop">
                <p className="kids-font text-xs sm:text-sm text-slate-600 font-bold">
                  হরফটিকে ২ বার স্পর্শ করো ({touchCount}/২)
                </p>

                <button
                  type="button"
                  onClick={handleTouchLetter}
                  className="kids-tap mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-[#FFF8E7] hover:bg-[#FEEDD0] border-4 border-amber-400 shadow-[0_12px_0_0_#F59E0B] flex flex-col items-center justify-center active:translate-y-2 cursor-pointer animate-kids-wiggle"
                >
                  <span className="font-amiri text-6xl sm:text-7xl font-black text-amber-600 drop-shadow-sm">
                    {currentItem.ar}
                  </span>
                  <span className="kids-font text-xs font-bold text-amber-900 mt-1">
                    👆 স্পর্শ করো
                  </span>
                </button>
              </div>
            )}

            {/* STEP 3: খুঁজি (FIND IT) */}
            {step === 3 && (
              <div className="py-2 space-y-4 animate-kids-pop">
                <button
                  type="button"
                  onClick={playItemAudio}
                  className="kids-tap px-4 py-2 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-950 kids-font text-xs font-extrabold flex items-center gap-1.5 mx-auto active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>আবার শোনো: "{currentItem.nameBn}"</span>
                </button>

                {/* 3 Big Visual Tiles */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {options.map((opt, idx) => {
                    const isTarget = opt.ar === currentItem.ar;
                    const shouldGlow = isTarget && wrongAttempts >= 2;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`kids-tap h-28 rounded-[2rem] border-4 flex flex-col items-center justify-center cursor-pointer active:translate-y-2 transition-all ${ shouldGlow ? "bg-[#D1FAE5] border-emerald-500 shadow-[0_8px_0_0_#10B981] animate-bounce" : "bg-white hover:bg-slate-50 border-slate-300 shadow-[0_8px_0_0_#94A3B8]" }`}
                      >
                        <span className="font-amiri text-4xl sm:text-5xl font-black text-slate-800">
                          {opt.ar}
                        </span>
                        <span className="kids-font text-[10px] text-slate-500 mt-1">
                          {opt.nameBn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: তারা! (CELEBRATION) */}
            {step === 4 && (
              <div className="py-4 space-y-4 animate-kids-pop">
                <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-500 flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce">
                  ⭐
                </div>

                <div className="space-y-1">
                  <h4 className="kids-font text-2xl font-black text-emerald-950">
                    مَا شَاءَ اللَّهُ! মাশাআল্লাহ!
                  </h4>
                  <p className="kids-font text-sm font-bold text-slate-600">
                    তুমি "{currentItem.nameBn}" সফলভাবে শিখে ১টি তারা পেয়েছো!
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleNextItem}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white kids-font text-sm font-black shadow-md active:scale-95 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>পরবর্তী পাঠ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
