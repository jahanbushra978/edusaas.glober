"use client";

import React from "react";
import { BookOpen, Volume2, Play, CheckCircle2 } from "lucide-react";
import { universalAudioEngine } from "@/lib/quran/audio";
import { playTapSound } from "../../lib/arabicSoundPlayer";

/**
 * TeachBeforePlayModal
 * Implements the vital pedagogical invariant:
 * Learn -> Listen -> Practice -> Play -> Complete -> Earn Reward -> Progress.
 * 
 * Children are introduced to the letters, pronunciations, and rules
 * with authentic Qari recitations before starting each challenge level.
 */
export default function TeachBeforePlayModal({
  isOpen,
  title,
  instructionsBn = "খেলা শুরুর আগে হরফগুলোর বিশুদ্ধ উচ্চারণ মনোযোগ দিয়ে শুনে নাও!",
  learningItems = [],
  onStartGame,
}) {
  if (!isOpen) return null;

  const handlePlayAudio = (item) => {
    playTapSound();
    if (item.audio) {
      universalAudioEngine.playWord(item.audio, {
        onError: () => {
          if (item.ar) universalAudioEngine.playArabicSound(item.ar);
        },
      });
    } else if (item.ar) {
      universalAudioEngine.playArabicSound(item.ar);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#081f15] border-2 border-emerald-300 dark:border-emerald-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5" />
            <span>আগে শিখি, তারপর খেলি</span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            {title || "আজকের পাঠ"}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {instructionsBn}
          </p>
        </div>

        {/* Learning Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 py-1">
          {learningItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePlayAudio(item)}
              className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/50 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-amber-950/30 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group active:scale-95"
            >
              <span className="text-3xl sm:text-4xl font-bold font-arabic text-emerald-950 dark:text-white group-hover:scale-110 transition-transform">
                {item.ar}
              </span>

              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                {item.nameBn || item.name || item.ar}
              </span>

              {item.tip && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.tip}
                </span>
              )}

              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>শোনো 🎧</span>
              </div>
            </button>
          ))}
        </div>

        {/* Motivational Callout */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-950 dark:text-emerald-200 font-medium">
            প্রতিটি কার্ডে ট্যাপ করে খাঁটি ক্বারীর মিষ্টি উচ্চারণ শুনো। প্রস্তুত হলে নিচের বাটনে চাপ দাও!
          </p>
        </div>

        {/* Start Game Button */}
        <div className="pt-1">
          <button
            type="button"
            data-testid="start-game-btn"
            onClick={() => {
              playTapSound();
              onStartGame();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>এবার খেলা শুরু করি ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

