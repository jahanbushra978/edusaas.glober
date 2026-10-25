"use client";

import React, { useState } from "react";
import { Flame, Trophy, Heart, Globe, AlertCircle } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function LearningStatsBar({
  xp = 140,
  streak = 4,
  lives = 5,
  mistakesCount = 0,
  onOpenMistakes,
}) {
  const { lang, setLanguage, t, dir } = useLearningLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="w-full flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-[#091a14]/90 backdrop-blur-md border border-emerald-900/60 shadow-xl relative z-30"
    >
      {/* ── LEFT: STREAK & XP BADGES ── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Flame */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-950/70 border border-amber-600/60 text-amber-300 shadow-sm">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-black">{streak}</span>
          <span className="text-[10px] text-amber-200 hidden sm:inline">{t.days}</span>
        </div>

        {/* XP Points */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 shadow-sm">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black">{xp}</span>
          <span className="text-[10px] text-emerald-200 hidden sm:inline">XP</span>
        </div>

        {/* Focus / Lives */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-950/70 border border-rose-600/60 text-rose-300 shadow-sm">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          <span className="text-xs font-black">{lives}</span>
        </div>
      </div>

      {/* ── RIGHT: MISTAKES REVIEW & 3-LANGUAGE SELECTOR ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Review Mistakes Button */}
        {mistakesCount > 0 && (
          <button
            type="button"
            onClick={onOpenMistakes}
            className="px-3 py-1.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{t.reviewMistakes}</span>
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {mistakesCount}
            </span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase tracking-wider">{lang}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#05140d] border border-emerald-600 shadow-2xl p-1 z-50 flex flex-col space-y-1">
              {[
                { code: "bn", label: "বাংলা (BN)" },
                { code: "en", label: "English (EN)" },
                { code: "ar", label: "العربية (AR)" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    lang === l.code
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-300 hover:bg-emerald-950"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
