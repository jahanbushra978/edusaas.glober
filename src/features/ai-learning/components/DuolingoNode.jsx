"use client";

import React, { useState } from "react";
import { Check, Lock, Play, Award, Star } from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function DuolingoNode({
  lesson,
  index,
  isCompleted,
  isUnlocked,
  isActive,
  stars = 0,
  onSelectLesson,
}) {
  const { lang, t } = useLearningLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Responsive zigzag offset: gently compressed on phones so nodes never collide with screen edges
  const zigzagMultiplier = isMobile ? 0.45 : 1;
  const zigzagOffsets = [0, 40, 75, 40, 0, -40, -75, -40];
  const offset = Math.round(zigzagOffsets[index % zigzagOffsets.length] * zigzagMultiplier);

  const title = lesson.title[lang] || lesson.title.bn || lesson.title.en;

  return (
    <div
      className="relative flex flex-col items-center my-3 transition-transform duration-300"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* ── 3-STAR RATING DISPLAY ABOVE NODE ── */}
      {isCompleted && (
        <div className="flex items-center gap-1 mb-1 animate-fade-in bg-[#03140d]/90 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-md">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-3.5 h-3.5 transition-all ${
                starIdx <= stars
                  ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  : "text-slate-700 fill-slate-800"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── INTERACTIVE POPOVER CARD ON HOVER / ACTIVE ── */}
      {showTooltip && isUnlocked && (
        <div className="absolute -top-28 z-30 w-52 sm:w-60 max-w-[calc(100vw-2.5rem)] p-3 sm:p-3.5 rounded-2xl bg-[#03140d]/95 border border-emerald-500/60 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col items-center text-center">
          <p className="text-xs font-bold text-white mb-1">{title}</p>
          <div className="flex items-center justify-between w-full text-[11px] px-2 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/40 mb-2">
            <span className="text-amber-300 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>+15 XP</span>
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-3 h-3 ${
                    starIdx <= stars
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-600 fill-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectLesson(lesson)}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isCompleted ? t.replayPractice : t.startLesson}
          </button>
        </div>
      )}

      {/* ── THE CIRCULAR DUOLINGO 3D BUTTON ── */}
      <button
        type="button"
        disabled={!isUnlocked}
        onClick={() => onSelectLesson(lesson)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative transition-all duration-200 cursor-pointer select-none ${
          isCompleted
            ? "bg-gradient-to-b from-emerald-500 to-emerald-700 border-4 border-emerald-300 shadow-[0_8px_0_#064e3b] hover:shadow-[0_4px_0_#064e3b] hover:translate-y-1"
            : isActive
            ? "bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-amber-200 shadow-[0_8px_0_#92400e] hover:shadow-[0_4px_0_#92400e] hover:translate-y-1 animate-pulse"
            : isUnlocked
            ? "bg-gradient-to-b from-teal-600 to-teal-800 border-4 border-teal-400 shadow-[0_8px_0_#134e4a] hover:shadow-[0_4px_0_#134e4a] hover:translate-y-1"
            : "bg-slate-800 border-4 border-slate-700 shadow-[0_6px_0_#1e293b] opacity-60 cursor-not-allowed"
        }`}
      >
        {/* Node Crown or Stars */}
        {isCompleted ? (
          <div className="flex flex-col items-center">
            <Check className="w-8 h-8 text-white stroke-[3]" />
            <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-200 text-[9px] font-black flex items-center gap-1">
              <span>{t.completed}</span>
              {stars > 0 && <span>({stars}★)</span>}
            </div>
          </div>
        ) : isUnlocked ? (
          <div className="flex flex-col items-center">
            <Play className="w-7 h-7 text-slate-950 fill-current translate-x-0.5" />
            {isActive && (
              <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow uppercase tracking-wide">
                START
              </span>
            )}
          </div>
        ) : (
          <Lock className="w-6 h-6 text-slate-400" />
        )}
      </button>

      {/* Lesson Short Title Label */}
      <span
        className={`mt-2 text-xs font-bold text-center max-w-[120px] truncate ${
          isActive ? "text-amber-300" : isCompleted ? "text-emerald-300" : "text-slate-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
}
