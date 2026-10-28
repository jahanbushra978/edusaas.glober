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
        <div className="relative mb-2 w-[calc(100vw-2.5rem)] max-w-[280px] sm:max-w-xs p-3 sm:p-3.5 rounded-3xl bg-white/95 dark:bg-[#0c241a]/95 border-2 border-emerald-300 dark:border-emerald-600/70 shadow-xl backdrop-blur-md animate-fade-in flex flex-col space-y-2">
          {/* Top header with close / minimize */}
          <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{lang === "en" ? "Nuru (Your Guide)" : lang === "ar" ? "نورو (مرشدك)" : "নূরু (আপনার গাইড)"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950 transition-colors"
              title="মিনিমাইজ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speech text */}
          <p
            onClick={handleNextMessage}
            className="text-xs text-slate-700 dark:text-slate-100 font-semibold leading-relaxed cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-200 transition-colors"
          >
            "{currentMsg}"
          </p>

          {/* Bottom quick stats & tip switch */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-emerald-100 dark:border-emerald-950">
            <button
              type="button"
              onClick={handleNextMessage}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              <span>{lang === "en" ? "Next tip ➔" : lang === "ar" ? "نصيحة أخرى ➔" : "পরবর্তী পরামর্শ ➔"}</span>
            </button>
            {onOpenQuests && (
              <button
                type="button"
                onClick={onOpenQuests}
                className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
              >
                <span>মিশন</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE FLOATING MASCOT BUTTON ── */}
      <button
        type="button"
        onClick={() => {
          playTapSound();
          if (isMinimized) {
            setIsMinimized(false);
          } else {
            handleNextMessage();
          }
        }}
        className="relative group p-1 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border-2 border-white dark:border-emerald-400/80"
        title="নূরুর সাথে কথা বলুন"
      >
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#05140d] flex items-center justify-center overflow-hidden relative">
          <span className="text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform">
            🧕
          </span>
          {/* Pulsing online badge */}
          <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#05140d]" />
        </div>
      </button>
    </div>
  );
}
