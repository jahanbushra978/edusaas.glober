"use client";

import React, { useState } from "react";
import { Volume2, AlertTriangle, Award, BookOpen } from "lucide-react";
import { COMPARATIVE_PAIRS } from "./makhrajComparativeData";
import { universalAudioEngine } from "@/lib/quran/audio";

export default function MakhrajComparativeTab({ activeShaykhId = "husary_muallim" }) {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [playingKey, setPlayingKey] = useState(null);

  const currentPair = COMPARATIVE_PAIRS[selectedPairIndex] || COMPARATIVE_PAIRS[0];

  const handlePlayLetter = (letter) => {
    if (typeof window === "undefined" || !letter) return;
    const playId = `letter-${letter}`;
    setPlayingKey(playId);

    universalAudioEngine.playLetter(letter, {
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
  };

  const handlePlayAyah = (letterItem) => {
    if (typeof window === "undefined" || !letterItem?.audioAyah) return;
    const playId = `ayah-${letterItem.letter}`;
    setPlayingKey(playId);

    universalAudioEngine.playAyah(
      letterItem.audioAyah.surah,
      letterItem.audioAyah.ayah,
      {
        reciterId: activeShaykhId,
        onEnd: () => setPlayingKey(null),
        onError: () => setPlayingKey(null),
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              সদৃশ উচ্চারণের হরফসমূহের মাখরাজ ও সিফাত পার্থক্য
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              কুরআন তিলাওয়াতে সাধারণ শিক্ষার্থীদের সবচেয়ে বেশি লাহান বা ভুল হয় কাছাকাছি উচ্চারণের হরফগুলোতে (যেমন: ح বনাম هـ, ق বনাম ك, ط বনাম ت, ص বনাম س, ض বনাম د/ظ, ع বনাম ء)। নিচের প্রতিটি জোড়া পাশাপাশি শুনে সঠিক ক্বারীর উচ্চারণে পার্থক্য উপলব্ধি করুন।
            </p>
          </div>
        </div>

        {/* Pair Pills Selector */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/60">
          {COMPARATIVE_PAIRS.map((pair, idx) => {
            const isActive = selectedPairIndex === idx;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => setSelectedPairIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-xs scale-102 font-black"
                    : "bg-white/80 dark:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                }`}
              >
                <span className="font-arabic text-base">{pair.pairLetters.join(" ⇄ ")}</span>
                <span className="hidden sm:inline">({pair.title.split(" ")[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Comparative Presentation */}
      <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-800/80 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full">
              {currentPair.difficulty}
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {currentPair.title}
            </h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            উভয় হরফে ট্যাপ করে অডিও তুলনা করুন
          </span>
        </div>

        {/* Side-by-Side Letter Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-${currentPair.letters.length} gap-4 mt-5`}>
          {currentPair.letters.map((item) => {
            const isPlayingLetter = playingKey === `letter-${item.letter}`;
            const isPlayingAyah = playingKey === `ayah-${item.letter}`;

            return (
              <div
                key={item.letter}
                className="rounded-2xl border-2 border-emerald-100 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 flex flex-col justify-between hover:border-emerald-300 transition-all space-y-4"
              >
                {/* Header: Letter glyph & Name */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {item.nameBn}
                    </h5>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                      {item.organBn}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-arabic text-4xl shadow-md">
                    {item.letter}
                  </div>
                </div>

                {/* Articulation details */}
                <div className="space-y-2 bg-white/80 dark:bg-[#071912]/80 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                      মাখরাজ ও স্বর বৈশিষ্ট্য:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.articulationBn}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      প্রধান সিফাত:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {item.sifatBn}
                    </p>
                  </div>
                </div>

                {/* Common Mistake Warning */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      সচরাচর যে ভুলটি হয়:
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                      {item.commonMistake}
                    </p>
                  </div>
                </div>

                {/* Quranic Example & Audio Controls */}
                <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs bg-emerald-100/50 dark:bg-emerald-900/40 px-3 py-2 rounded-xl">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">কুরআনী উদাহরণ:</span>
                    <span className="font-arabic text-base font-bold text-emerald-900 dark:text-emerald-200">
                      {item.sampleWord}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayLetter(item.letter)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isPlayingLetter
                          ? "bg-amber-500 text-slate-950 shadow-md font-black animate-pulse"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingLetter ? "বাজছে..." : "হরফ উচ্চারণ"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayAyah(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isPlayingAyah
                          ? "bg-amber-500 text-slate-950 shadow-md font-black animate-pulse"
                          : "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isPlayingAyah ? "বাজছে..." : "ক্বারীর আয়াত"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
