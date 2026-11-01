"use client";

import React from "react";
import { playTapSound } from "../../lib/arabicSoundPlayer";
import { playVoicePrompt } from "../../lib/voicePrompts";

const COLOR_VARIANTS = {
  emerald: {
    bg: "bg-[#E6F8F0] hover:bg-[#D3F3E4]",
    border: "border-emerald-500",
    text: "text-emerald-950",
    shadow: "shadow-[0_10px_0_0_#10B981]",
    activeShadow: "active:shadow-[0_2px_0_0_#10B981]",
    glow: "ring-emerald-400/40",
    badgeBg: "bg-emerald-600 text-white",
  },
  amber: {
    bg: "bg-[#FFF8E7] hover:bg-[#FEEDD0]",
    border: "border-amber-400",
    text: "text-amber-950",
    shadow: "shadow-[0_10px_0_0_#F59E0B]",
    activeShadow: "active:shadow-[0_2px_0_0_#F59E0B]",
    glow: "ring-amber-400/40",
    badgeBg: "bg-amber-500 text-slate-950 font-black",
  },
  sky: {
    bg: "bg-[#EAF7FF] hover:bg-[#D7EFFF]",
    border: "border-sky-400",
    text: "text-sky-950",
    shadow: "shadow-[0_10px_0_0_#38BDF8]",
    activeShadow: "active:shadow-[0_2px_0_0_#38BDF8]",
    glow: "ring-sky-400/40",
    badgeBg: "bg-sky-500 text-white",
  },
  mint: {
    bg: "bg-[#EFFCF6] hover:bg-[#D8F6E9]",
    border: "border-teal-400",
    text: "text-teal-950",
    shadow: "shadow-[0_10px_0_0_#2DD4BF]",
    activeShadow: "active:shadow-[0_2px_0_0_#2DD4BF]",
    glow: "ring-teal-400/40",
    badgeBg: "bg-teal-600 text-white",
  },
  coral: {
    bg: "bg-[#FFF0ED] hover:bg-[#FFE0DA]",
    border: "border-rose-400",
    text: "text-rose-950",
    shadow: "shadow-[0_10px_0_0_#FB7185]",
    activeShadow: "active:shadow-[0_2px_0_0_#FB7185]",
    glow: "ring-rose-400/40",
    badgeBg: "bg-rose-500 text-white",
  },
  lavender: {
    bg: "bg-[#F5F0FF] hover:bg-[#EAE0FF]",
    border: "border-purple-400",
    text: "text-purple-950",
    shadow: "shadow-[0_10px_0_0_#A855F7]",
    activeShadow: "active:shadow-[0_2px_0_0_#A855F7]",
    glow: "ring-purple-400/40",
    badgeBg: "bg-purple-600 text-white",
  },
};

export default function BigChoiceButton({
  icon,
  arabic,
  label,
  subLabel,
  color = "emerald",
  badge,
  voicePromptKey,
  onClick,
  disabled = false,
  className = "",
  size = "lg", // 'md' | 'lg' | 'xl'
}) {
  const variant = COLOR_VARIANTS[color] || COLOR_VARIANTS.emerald;

  const handleClick = (e) => {
    if (disabled) return;
    playTapSound();
    if (voicePromptKey) {
      playVoicePrompt(voicePromptKey);
    }
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    md: "p-4 min-h-[76px] rounded-[1.75rem] border-[3px]",
    lg: "p-5 sm:p-6 min-h-[110px] sm:min-h-[130px] rounded-[2.25rem] border-[4px]",
    xl: "p-6 sm:p-8 min-h-[140px] sm:min-h-[170px] rounded-[2.75rem] border-[4px]",
  }[size] || "p-5 min-h-[110px] rounded-[2.25rem] border-[4px]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative kids-tap group flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-2 disabled:opacity-40 disabled:pointer-events-none ${variant.bg} ${variant.border} ${variant.text} ${variant.shadow} ${variant.activeShadow} ${sizeClasses} ${className}`}
    >
      {/* Optional Badge */}
      {badge && (
        <span
          className={`absolute -top-3 -right-2 px-3 py-1 rounded-full text-xs font-black shadow-md border-2 border-white animate-kids-pop ${variant.badgeBg}`}
        >
          {badge}
        </span>
      )}

      {/* Main Visual: Icon or Giant Arabic Letter */}
      {arabic ? (
        <span className="font-amiri text-5xl sm:text-6xl md:text-7xl font-black text-amber-600 drop-shadow-sm group-hover:scale-105 transition-transform">
          {arabic}
        </span>
      ) : icon ? (
        <div className="text-4xl sm:text-5xl md:text-6xl mb-1 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      ) : null}

      {/* Primary Label */}
      {label && (
        <span className="kids-font text-lg sm:text-xl md:text-2xl font-black tracking-wide mt-1 text-center leading-tight">
          {label}
        </span>
      )}

      {/* Sub Label */}
      {subLabel && (
        <span className="kids-font text-xs sm:text-sm font-semibold opacity-80 text-center mt-0.5">
          {subLabel}
        </span>
      )}
    </button>
  );
}
