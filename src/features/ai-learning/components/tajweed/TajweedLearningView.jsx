"use client";

import React, { useState } from "react";
import {
  Award,
  Volume2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { TAJWEED_CURRICULUM } from "../../data/tajweedLearningCurriculum";
import { universalAudioEngine } from "@/lib/quran/audio";

const TAJWEED_PRACTICE_QUESTIONS = [
  {
    id: 1,
    questionBn: "نْ বা তানভীনের পর 'يَنْمُو' (ي ن م و) হরফ আসলে কোন নিয়ম প্রযোজ্য হয়?",
    options: [
      { id: "a", text: "ইদগাম বা-গুন্নাহ (১ আলিফ গুন্নাহ সহ মেলানো)", correct: true },
      { id: "b", text: "ইযহার (স্পষ্ট করে পড়া)", correct: false },
      { id: "c", text: "ইক্বলাব (মীমে রূপান্তর)", correct: false },
      { id: "d", text: "ইখফা (লুকিয়ে পড়া)", correct: false },
    ],
    explanationBn: "ي ن م و হরফ আসলে নূন সাকিন বা তানভীনকে ১ আলিফ গুন্নাহ সহ মিলিয়ে পড়তে হয়। একে الإدغام بغنة বলে।",
  },
  {
    id: 2,
    questionBn: "মীম সাকিন (مْ)-এর পর 'ب' (বা) আসলে কোন নিয়ম হয়?",
    options: [
      { id: "a", text: "ইখফায়ে শাফাবী (الإخفاء الشفوي)", correct: true },
      { id: "b", text: "ইযহারে শাফাবী (الإظهار الشفوي)", correct: false },
      { id: "c", text: "ইদগামে শাফাবী (الإدغام الشفوي)", correct: false },
      { id: "d", text: "ওয়াজিব গুন্নাহ", correct: false },
    ],
    explanationBn: "মীম সাকিনের পর বা আসলে দুই ঠোঁট আলতোভাবে চেপে ১ আলিফ গুন্নাহর সাথে পড়তে হয়।",
  },
  {
    id: 3,
    questionBn: "কুরআনে 'الضَّآلِّينَ' শব্দে কোন মাদ্দ বিদ্যমান?",
    options: [
      { id: "a", text: "মাদ্দ লাযিম (المد اللازم — ৬ হরকত / ৩ আলিফ)", correct: true },
      { id: "b", text: "মাদ্দ আসলী (১ আলিফ)", correct: false },
      { id: "c", text: "মাদ্দ লীন (১ আলিফ)", correct: false },
      { id: "d", text: "মাদ্দ মুনফাসিল", correct: false },
    ],
    explanationBn: "মাদ্দের হরফের পর আসল তাশদীদ থাকায় এটি মাদ্দ লাযিম কালমী মুসাক্কাল, যা বাধ্যতামূলক ৬ হরকত (৩ আলিফ) টানতে হয়।",
  },
  {
    id: 4,
    questionBn: "কুরআনের বিরাম চিহ্ন (مـ)-এর হুকুম কী?",
    options: [
      { id: "a", text: "ওয়াকফে লাযিম — এখানে থামা বাধ্যতামূলক", correct: true },
      { id: "b", text: "ওয়াকফে মামনূ — থামা নিষিদ্ধ", correct: false },
      { id: "c", text: "মিলিয়ে পড়া উত্তম", correct: false },
      { id: "d", text: "থামা ও না থামা উভয়ই সমান", correct: false },
    ],
    explanationBn: "(مـ) হলো ওয়াকফে লাযিম। এখানে না থামলে আয়াতের অর্থ বিকৃত হওয়ার আশঙ্কা থাকে, তাই থামা ওয়াজিব।",
  },
];

export default function TajweedLearningView() {
  const [selectedCatId, setSelectedCatId] = useState(TAJWEED_CURRICULUM[0].id);
  const [activeRuleIdx, setActiveRuleIdx] = useState(0);
  const [playingKey, setPlayingKey] = useState(null);
  const [isQuizMode, setIsQuizMode] = useState(false);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeCategory =
    TAJWEED_CURRICULUM.find((c) => c.id === selectedCatId) || TAJWEED_CURRICULUM[0];
  const activeRule = activeCategory.rules[activeRuleIdx] || activeCategory.rules[0];
  const currentQuiz = TAJWEED_PRACTICE_QUESTIONS[quizIdx] || TAJWEED_PRACTICE_QUESTIONS[0];

  const handlePlayAudio = (surah, ayah, playKey) => {
    if (typeof window === "undefined" || !surah || !ayah) return;
    setPlayingKey(playKey);
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
    if (quizIdx < TAJWEED_PRACTICE_QUESTIONS.length - 1) {
      setQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#071912] text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
            <Award className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide">
                তাজবিদ (التَّجْوِيدُ الْمُصَوَّر)
              </h2>
              <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                ৮টি প্রধান শাস্ত্র
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              কুরআনুল কারীমকে তার হক্ক আদায় করে শুদ্ধ ও সুন্দরভাবে তেলাওয়াত করার পূর্ণাঙ্গ শিক্ষাক্রম।
            </p>
          </div>
        </div>

        {/* Quiz Toggle Button */}
        <button
          type="button"
          onClick={() => setIsQuizMode(!isQuizMode)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            isQuizMode
              ? "bg-amber-500 text-slate-950 font-black"
              : "bg-white/10 hover:bg-white/20 text-emerald-100 border border-emerald-400/30"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{isQuizMode ? "তাজবিদ পাঠে ফিরুন" : "তাজবিদ পরীক্ষা দিন"}</span>
        </button>
      </div>

      {isQuizMode ? (
        /* ── TAJWEED QUIZ VIEW ── */
        <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          {quizFinished ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                তাজবিদ পরীক্ষা সম্পন্ন হয়েছে!
              </h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                আপনার স্কোর: {quizScore} / {TAJWEED_PRACTICE_QUESTIONS.length}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuizIdx(0);
                  setSelectedOpt(null);
                  setIsAnswered(false);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় পরীক্ষা দিন</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800 text-xs font-bold">
                <span className="text-emerald-700">প্রশ্ন {quizIdx + 1} / {TAJWEED_PRACTICE_QUESTIONS.length}</span>
                <span className="text-amber-600">স্কোর: {quizScore}</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white py-2">
                {currentQuiz.questionBn}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuiz.options.map((opt) => {
                  let style = "bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 text-slate-800 dark:text-slate-200";
                  if (isAnswered) {
                    if (opt.correct) style = "bg-emerald-100 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-500/30";
                    else if (selectedOpt?.id === opt.id) style = "bg-rose-100 border-rose-500 text-rose-950 font-black";
                    else style = "opacity-50 border-slate-200";
                  }
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectQuizOpt(opt)}
                      className={`p-3.5 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${style}`}
                    >
                      <span>{opt.text}</span>
                      {isAnswered && opt.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isAnswered && selectedOpt?.id === opt.id && !opt.correct && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs space-y-2">
                  <p className="text-amber-900 dark:text-amber-200 font-medium">{currentQuiz.explanationBn}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black cursor-pointer"
                    >
                      পরবর্তী প্রশ্ন ➔
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ── TAJWEED CURRICULUM BROWSER ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: 8 Subject Modules */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-black uppercase text-slate-400 block px-2 mb-1">
              তাজবিদ শাস্ত্রসমূহ
            </span>
            {TAJWEED_CURRICULUM.map((cat) => {
              const isSelected = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setActiveRuleIdx(0);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md font-black scale-101"
                      : "bg-white dark:bg-[#0c241a] text-slate-800 dark:text-slate-200 border-emerald-100 dark:border-emerald-800/80 hover:bg-emerald-50"
                  }`}
                >
                  <div className="pr-2">
                    <h4 className="text-xs font-bold leading-tight">{cat.titleBn}</h4>
                    <span className={`text-[10px] font-arabic block mt-0.5 ${isSelected ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-300"}`}>
                      {cat.titleAr}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Rules of Active Subject */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                {activeCategory.titleAr}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {activeCategory.titleBn}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {activeCategory.summaryBn}
              </p>
            </div>

            {/* Sub-rules Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
              {activeCategory.rules.map((r, idx) => {
                const isActive = idx === activeRuleIdx;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRuleIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-xs font-black"
                        : "bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-emerald-200/60 hover:bg-emerald-100"
                    }`}
                  >
                    <span>{r.nameBn.split("(")[0].trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Rule Showcase Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {activeRule.nameBn}
                  </h4>
                  <span className="font-arabic text-base font-bold text-emerald-800 dark:text-emerald-300">
                    {activeRule.nameAr}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">হরফ সংখ্যা:</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {activeRule.lettersCount}টি হরফ
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-[#071912]/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">কুরআনী নিয়ম: </span>
                {activeRule.definitionBn}
              </p>

              <div className="flex items-center justify-between text-xs bg-white dark:bg-[#071912] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-slate-500 font-bold">সংশ্লিষ্ট হরফসমূহ:</span>
                <span className="font-arabic text-base font-bold text-emerald-700 dark:text-emerald-300">
                  {activeRule.lettersAr}
                </span>
              </div>

              {/* Quranic Ayah Box with Glowing Highlight */}
              <div className="bg-slate-950 text-white rounded-2xl p-4 text-center space-y-2 border border-emerald-900/60 shadow-inner">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  কুরআনী উদাহরণ ও ক্বারী তিলাওয়াত
                </span>
                <div className="font-arabic text-xl sm:text-2xl text-amber-200/90 leading-loose py-1">
                  {activeRule.verseAr}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePlayAudio(
                        activeRule.surahNo,
                        activeRule.ayahNo,
                        `rule-${activeRule.id}`
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>
                      {playingKey === `rule-${activeRule.id}` ? "বাজছে..." : "ক্বারীর তিলাওয়াত শুনুন"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
