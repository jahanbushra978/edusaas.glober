"use client";

import React from "react";
import { X } from "lucide-react";
import { KIDS_BADGES } from "../../data/kidsGameData";
import { playStarPopSound, playTapSound } from "../../lib/arabicSoundPlayer";
import NuruMascot from "./NuruMascot";

export default function StarJar({ isOpen, onClose, stars = 12 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-kids-pop select-none">
      <div className="relative w-full max-w-md rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#FEF3C7] border-4 border-amber-400 p-6 shadow-2xl space-y-5 text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 transition active:scale-95 cursor-pointer z-10 border border-amber-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center">
          <NuruMascot
            size="sm"
            message={`মাশাআল্লাহ! তুমি ${stars}টি তারা পেয়েছো!`}
            showSpeechBubble={true}
          />
          <h3 className="kids-font text-2xl sm:text-3xl font-black text-amber-950 mt-2 flex items-center gap-2">
            <span>আমার তারার বয়াম</span>
            <span className="text-3xl animate-kids-twinkle">⭐</span>
          </h3>
        </div>

        {/* 🌟 Big Glass Star Jar with Floating Animated Stars */}
        <div className="relative mx-auto w-48 h-56 rounded-[2.5rem] bg-gradient-to-b from-white/90 via-sky-50/60 to-amber-100/90 border-4 border-amber-400 shadow-[inset_0_10px_20px_rgba(251,191,36,0.25),0_12px_24px_rgba(217,119,6,0.2)] flex flex-col items-center justify-end p-4 overflow-hidden">
          {/* Jar Lid */}
          <div className="absolute top-0 inset-x-8 h-4 rounded-b-xl bg-amber-500 border-2 border-amber-600 shadow-md" />

          {/* Floating Stars Inside Jar */}
          <div className="absolute inset-x-4 top-8 bottom-4 flex flex-wrap items-center justify-center gap-2 p-2">
            {Array.from({ length: Math.min(stars, 24) }).map((_, idx) => (
              <span
                key={idx}
                onClick={() => playStarPopSound((idx % 3) + 1)}
                className="text-2xl sm:text-3xl animate-kids-float cursor-pointer hover:scale-125 transition-transform"
                style={{
                  animationDelay: `${(idx * 0.15).toFixed(2)}s`,
                  filter: "drop-shadow(0 4px 6px rgba(245, 158, 11, 0.4))",
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Total Count Badge */}
          <div className="z-10 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black kids-font text-base sm:text-lg shadow-md border-2 border-white flex items-center gap-1.5 animate-kids-pop">
            <span>মোট তারা:</span>
            <span className="text-xl">{stars}</span>
          </div>
        </div>

        {/* 🏆 Unlocked Stickers & Badges */}
        <div className="space-y-2 pt-1 text-left">
          <span className="kids-font text-xs sm:text-sm font-black text-amber-950 block text-center">
            তোমার অর্জিত স্টিকারসমূহ:
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {KIDS_BADGES.map((b) => {
              const isUnlocked = stars >= b.minStars;
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all ${
                    isUnlocked
                      ? "bg-amber-100/80 border-amber-400 text-amber-950 shadow-xs"
                      : "bg-slate-100/80 border-slate-200 text-slate-400 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{isUnlocked ? b.icon : "🔒"}</span>
                  <div>
                    <span className="kids-font text-xs font-black block leading-tight">
                      {b.title}
                    </span>
                    <span className="text-[10px] opacity-80 block">
                      {isUnlocked ? b.desc : `${b.minStars}টি তারা দরকার`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Done / Continue Button */}
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white kids-font text-base font-black shadow-md active:scale-95 transition cursor-pointer"
        >
          আবার খেলো ➔
        </button>
      </div>
    </div>
  );
}
