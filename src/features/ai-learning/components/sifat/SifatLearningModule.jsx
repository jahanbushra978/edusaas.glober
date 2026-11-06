"use client";

import React, { useState } from "react";
import {
  Award,
  Volume2,
  BookOpen,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  OPPOSITE_SIFAT_PAIRS,
  NON_OPPOSITE_SIFAT,
  LETTER_SIFAT_MAP,
} from "../../data/sifatCurriculum";
import SifatQuizCard from "./SifatQuizCard";
import SifatPedagogyBanner from "./SifatPedagogyBanner";
import { universalAudioEngine } from "@/lib/quran/audio";

export default function SifatLearningModule() {
  const [activeTab, setActiveTab] = useState("opposite"); // "opposite" | "nonopposite" | "inspector" | "quiz"
  const [selectedLetter, setSelectedLetter] = useState("ق");
  const [playingKey, setPlayingKey] = useState(null);

  const activeLetterData = LETTER_SIFAT_MAP[selectedLetter] || LETTER_SIFAT_MAP["ق"];

  const handlePlayLetter = (letter) => {
    if (typeof window === "undefined" || !letter) return;
    setPlayingKey(`letter-${letter}`);
    universalAudioEngine.playLetter(letter, {
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
  };

  const handlePlayAyah = (surah, ayah, key) => {
    if (typeof window === "undefined" || !surah || !ayah) return;
    setPlayingKey(key);
    universalAudioEngine.playAyah(surah, ayah, {
      onEnd: () => setPlayingKey(null),
      onError: () => setPlayingKey(null),
    });
  };

  const handleSelectQuizOpt = (opt) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);
    if (opt.correct) setQuizScore((prev) => prev + 1);
  };

  const handleNextQuiz = () => {
    if (quizIdx < SIFAT_QUIZ_QUESTIONS.length - 1) {
      setQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizDone(true);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#071912] text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide">
                সিফাতুল হুরুফ (صِفَاتُ الْحُرُوف)
              </h2>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                ১৮টি সিফাত
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              হরফের মাখরাজ হলো তার জন্মস্থান, আর সিফাত হলো তার পোশাক ও বৈশিষ্ট্য।
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/20">
          {[
            { id: "opposite", label: "বিপরীতযুক্ত (১০টি)", icon: Layers },
            { id: "nonopposite", label: "বিপরীতহীন (৮টি)", icon: Award },
            { id: "inspector", label: "হরফ পরীক্ষক (২৯টি)", icon: BookOpen },
            { id: "quiz", label: "সিফাত কুইজ", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md font-black"
                    : "text-emerald-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SCHOLARLY PEDAGOGY ACCORDION ── */}
      <SifatPedagogyBanner />

      {/* ── TAB 1: 5 OPPOSITE PAIRS (10 SIFAT) ── */}
      {activeTab === "opposite" && (
        <div className="space-y-4">
          {OPPOSITE_SIFAT_PAIRS.map((pair) => (
            <div
              key={pair.id}
              className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 shadow-sm space-y-4"
            >
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white pb-2 border-b border-emerald-100 dark:border-emerald-800/80">
                {pair.titleBn}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sifat A */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {pair.sifatA.nameAr}
                    </span>
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      {pair.sifatA.nameBn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {pair.sifatA.meaningBn}
                  </p>
                  <div className="bg-white dark:bg-[#071912] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs">
                    <span className="text-slate-500 font-bold block mb-1">হরফসমূহ:</span>
                    <span className="font-arabic text-base font-bold text-emerald-700 dark:text-emerald-300">
                      {pair.sifatA.lettersAr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-arabic text-sm font-bold text-slate-800 dark:text-slate-200">
                      {pair.sifatA.exampleWord}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayAyah(
                          pair.sifatA.exampleAudio.surah,
                          pair.sifatA.exampleAudio.ayah,
                          `pair-${pair.id}-a`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{playingKey === `pair-${pair.id}-a` ? "বাজছে..." : "শুনুন"}</span>
                    </button>
                  </div>
                </div>

                {/* Sifat B (or Middle for Tawassut) */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg font-bold text-amber-800 dark:text-amber-300">
                      {pair.sifatB.nameAr}
                    </span>
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                      {pair.sifatB.nameBn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {pair.sifatB.meaningBn}
                  </p>
                  <div className="bg-white dark:bg-[#071912] p-2.5 rounded-xl border border-amber-100 dark:border-amber-900 text-xs">
                    <span className="text-slate-500 font-bold block mb-1">হরফসমূহ:</span>
                    <span className="font-arabic text-base font-bold text-amber-700 dark:text-amber-300">
                      {pair.sifatB.lettersAr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-arabic text-sm font-bold text-slate-800 dark:text-slate-200">
                      {pair.sifatB.exampleWord}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayAyah(
                          pair.sifatB.exampleAudio.surah,
                          pair.sifatB.exampleAudio.ayah,
                          `pair-${pair.id}-b`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{playingKey === `pair-${pair.id}-b` ? "বাজছে..." : "শুনুন"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: 8 NON-OPPOSITE SIFAT ── */}
      {activeTab === "nonopposite" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NON_OPPOSITE_SIFAT.map((sifat) => (
            <div
              key={sifat.id}
              className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {sifat.nameBn}
                  </h4>
                  <span className="font-arabic text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {sifat.nameAr}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mt-1">
                  {sifat.meaningBn}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {sifat.descriptionBn}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-xs font-arabic font-bold text-emerald-900 dark:text-emerald-200">
                  {sifat.lettersAr}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handlePlayAyah(
                      sifat.exampleAudio.surah,
                      sifat.exampleAudio.ayah,
                      `non-opp-${sifat.id}`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{playingKey === `non-opp-${sifat.id}` ? "বাজছে..." : "কুরআনী তিলাওয়াত"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: 29 LETTERS SIFAT INSPECTOR ── */}
      {activeTab === "inspector" && (
        <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              ২৯টি আরবি হরফের সক্রিয় সিফাত পরীক্ষক
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              যেকোনো হরফে ট্যাপ করে দেখুন তাতে ঠিক কোন কোন সিফাত বিদ্যমান:
            </p>
          </div>

          {/* 29 Letters Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {Object.keys(LETTER_SIFAT_MAP).map((char) => {
              const isSelected = char === selectedLetter;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => setSelectedLetter(char)}
                  className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md font-black scale-105"
                      : "bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-200 border-emerald-200/60 hover:bg-emerald-100"
                  }`}
                >
                  <span className="font-arabic text-2xl block">{char}</span>
                  <span className="text-[10px] block opacity-80">
                    {LETTER_SIFAT_MAP[char].nameBn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Letter Inspector Detail Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-arabic text-4xl shadow-md">
                  {activeLetterData.letter}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {activeLetterData.nameBn} হরফের সিফাতসমূহ
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mt-0.5">
                    মোট সিফাত সংখ্যা: {activeLetterData.sifatCount}টি
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePlayLetter(activeLetterData.letter)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{playingKey === `letter-${activeLetterData.letter}` ? "বাজছে..." : "উচ্চারণ শুনুন"}</span>
              </button>
            </div>

            {/* Sifat Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
              {activeLetterData.sifatList.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-[#071912] text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-[#071912]/70 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="font-bold text-emerald-800 dark:text-emerald-400">মুখ্য সিফাত: </span>
              {activeLetterData.dominantSifatBn}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 4: SIFAT QUIZ & ASSESSMENT ── */}
      {activeTab === "quiz" && <SifatQuizCard />}
    </div>
  );
}
