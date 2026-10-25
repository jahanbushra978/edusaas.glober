"use client";

import React, { useState } from "react";
import { X, Volume2, Award, Heart, Flame } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";
import { playTapSound } from "../lib/arabicSoundPlayer";

/**
 * 🧕 Nuru Companion (নূরু) — Interactive AI Mascot & Guide
 * Reacts to streaks, hearts, and learning progress with joyful Islamic encouragement.
 */
export default function NuruCompanion({
  lives = 5,
  streak = 1,
  xp: _xp = 0,
  onOpenQuests,
}) {
  const { lang, dir } = useLearningLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);

  const greetings = {
    bn: [
      "আসসালামু আলাইকুম! আজকের কোরআন পাঠে আপনাকে স্বাগতম!",
      "মাশাআল্লাহ! প্রতিদিনের ধারাবাহিকতা ধরে রাখলে আল্লাহ সহজ করে দেবেন।",
      "৩ স্টার অর্জন করলে কিন্তু উপহার হিসেবে +১টি লাইভ (❤️) ফেরত পাবেন!",
      "কোরআন শেখার প্রতিটি হরফে ১০টি করে নেকি রয়েছে!",
    ],
    en: [
      "Assalamu Alaikum! Welcome to today's Quran learning journey!",
      "MashaAllah! Consistency is the secret to mastering Quran reading.",
      "Remember: Achieving a 3-Star score refills +1 Heart (❤️) as a bonus!",
      "Reciting every single letter of the Holy Quran brings 10 rewards!",
    ],
    ar: [
      "السلام عليكم ورحمة الله! أهلاً بك في رحلتك القرآنية اليوم!",
      "ما شاء الله! الاستمرار اليومي هو سر إتقان كتاب الله تعالى.",
      "تذكر: تحقيق ٣ نجوم يمنحك +١ محاولة (❤️) كهدية مجانية!",
      "من قرأ حرفاً من كتاب الله فله به حسنة، والحسنة بعشر أمثالها!",
    ],
  };

  const list = greetings[lang] || greetings.bn;
  const currentMsg = list[bubbleIndex % list.length];

  const handleNextMessage = () => {
    playTapSound();
    setBubbleIndex((prev) => (prev + 1) % list.length);
  };

  return (
    <div
      dir={dir}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 select-none ${
        isMinimized ? "translate-y-2 opacity-90" : ""
      }`}
    >
      {/* ── EXPANDED SPEECH BUBBLE ── */}
      {!isMinimized && (
        <div className="relative mb-2 w-[calc(100vw-2.5rem)] max-w-[280px] sm:max-w-xs p-3 sm:p-3.5 rounded-2xl bg-[#03140d]/95 border-2 border-emerald-500/70 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col space-y-2">
          {/* Top header with close / minimize */}
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === "en" ? "Nuru (Your Guide)" : lang === "ar" ? "نورو (مرشدك)" : "নূরু (আপনার গাইড)"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950 transition-colors"
              title="মিনিমাইজ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speech text */}
          <p
            onClick={handleNextMessage}
            className="text-xs text-slate-100 font-medium leading-relaxed cursor-pointer hover:text-emerald-200 transition-colors"
          >
            "{currentMsg}"
          </p>

          {/* Bottom quick stats & tip switch */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-emerald-950">
            <button
              type="button"
              onClick={handleNextMessage}
              className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              <span>{lang === "en" ? "Next tip ➔" : lang === "ar" ? "نصيحة أخرى ➔" : "পরবর্তী পরামর্শ ➔"}</span>
            </button>
            {onOpenQuests && (
              <button
                type="button"
                onClick={onOpenQuests}
                className="px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold hover:bg-emerald-900 cursor-pointer flex items-center gap-1"
              >
                <Award className="w-3 h-3 text-amber-400" />
                <span>{lang === "en" ? "Quests" : lang === "ar" ? "المهام" : "মিশন"}</span>
              </button>
            )}
          </div>

          {/* Speech bubble pointer downwards */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[#03140d] border-r-2 border-b-2 border-emerald-500/70 rotate-45 transform" />
        </div>
      )}

      {/* ── THE MASCOT CHARACTER BUTTON ── */}
      <button
        type="button"
        onClick={() => {
          if (isMinimized) {
            setIsMinimized(false);
          } else {
            handleNextMessage();
          }
        }}
        className="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95"
      >
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md group-hover:bg-amber-400/30 transition-all animate-pulse" />

        {/* Mascot Avatar Container */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#064e3b] via-[#047857] to-[#10b981] border-3 border-amber-300 shadow-[0_6px_0_#064e3b] group-hover:shadow-[0_3px_0_#064e3b] group-hover:translate-y-0.5 flex items-center justify-center overflow-hidden">
          {/* Islamic scholar cap & joyful smiling character SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-12 h-12 sm:w-14 sm:h-14 transform group-hover:scale-105 transition-transform"
          >
            {/* Soft Green Jubbah body */}
            <path
              d="M25 88 Q50 72 75 88 L78 100 L22 100 Z"
              fill="#064e3b"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            {/* White Collar / Shawl */}
            <path
              d="M38 78 Q50 90 62 78 Q50 82 38 78 Z"
              fill="#ffffff"
            />

            {/* Face */}
            <circle cx="50" cy="52" r="26" fill="#fde68a" />

            {/* Cheeks blush */}
            <circle cx="34" cy="57" r="4" fill="#f87171" opacity="0.6" />
            <circle cx="66" cy="57" r="4" fill="#f87171" opacity="0.6" />

            {/* Friendly sparkling eyes */}
            <ellipse cx="40" cy="48" rx="4" ry="5.5" fill="#0f172a" />
            <circle cx="41.5" cy="46" r="1.5" fill="#ffffff" />
            <ellipse cx="60" cy="48" rx="4" ry="5.5" fill="#0f172a" />
            <circle cx="61.5" cy="46" r="1.5" fill="#ffffff" />

            {/* Joyful smile */}
            <path
              d="M42 59 Q50 67 58 59"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* White Imamah / Scholar Kufi Cap */}
            <ellipse cx="50" cy="30" rx="27" ry="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <path
              d="M24 30 Q50 14 76 30 Q50 24 24 30 Z"
              fill="#f1f5f9"
            />
            {/* Golden Crescent moon pin on turban */}
            <path
              d="M50 18 Q53 18 54 21 Q51 22 49 20 Q50 18 50 18 Z"
              fill="#fbbf24"
            />
          </svg>
        </div>

        {/* Floating Mini Badge (Lives or Streak) */}
        <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-rose-600 border border-white text-white text-[9px] font-black flex items-center gap-0.5 shadow">
          <Heart className="w-2.5 h-2.5 fill-current" />
          <span>{lives}</span>
        </div>

        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 border border-white text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow">
          <Flame className="w-2.5 h-2.5 fill-current" />
          <span>{streak}</span>
        </div>
      </button>
    </div>
  );
}
