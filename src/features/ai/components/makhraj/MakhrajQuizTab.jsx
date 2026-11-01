"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Volume2, Award, RotateCcw, HelpCircle } from "lucide-react";
import { universalAudioEngine } from "@/lib/quran/audio";

const MAKHRAJ_QUIZ_QUESTIONS = [
  {
    id: 1,
    letter: "ع",
    promptBn: "হরফটি লক্ষ্য করুন এবং বলুন এটি কোন অঙ্গ থেকে উচ্চারিত হয়?",
    audioLetter: "ع",
    options: [
      { id: "a", text: "কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব)", correct: true },
      { id: "b", text: "জিহ্বার গোড়া ও নরম তালু", correct: false },
      { id: "c", text: "দুই ঠোঁটের ভেজা অংশ", correct: false },
      { id: "d", text: "মুখের খালি জায়গা (জওফ)", correct: false },
    ],
    explanationBn: "ع (আইন) কণ্ঠনালীর মধ্যভাগ (ওয়াসাতুল হালক্ব) চেপে আদায় করতে হয়। এর সঙ্গী অপর হরফ হলো ح।",
  },
  {
    id: 2,
    letter: "ق",
    promptBn: "ক্বাফ (ق) হরফের সঠিক মাখরাজ কোনটি?",
    audioLetter: "ق",
    options: [
      { id: "a", text: "জিহ্বার আগা ও ওপরের দাঁতের গোড়া", correct: false },
      { id: "b", text: "জিহ্বার গোড়া ও তার বরাবর ওপরের নরম তালু", correct: true },
      { id: "c", text: "জিহ্বার কিনারা ও মাড়ির দাঁত", correct: false },
      { id: "d", text: "কণ্ঠনালীর উপরিভাগ", correct: false },
    ],
    explanationBn: "ق হরফটি জিহ্বার গোড়া তার বরাবর ওপরের নরম তালুর সাথে লেগে ভারী ও ক্বলক্বলাহ সহ উচ্চারিত হয়।",
  },
  {
    id: 3,
    letter: "ض",
    promptBn: "দোয়াদ (ض) হরফটি কোন স্থান থেকে উচ্চারিত হয়?",
    audioLetter: "ض",
    options: [
      { id: "a", text: "জিহ্বার কিনারা ও ওপরের মাড়ির দাঁত", correct: true },
      { id: "b", text: "জিহ্বার আগা ও নিচের দুই দাঁতের পেট", correct: false },
      { id: "c", text: "দুই ঠোঁট গোল করে", correct: false },
      { id: "d", text: "নাকের বাঁশি (খাইশূম)", correct: false },
    ],
    explanationBn: "ض হরফটি জিহ্বার এক বা উভয় কিনারা ওপরের মাড়ির দাঁতের গোড়ার সাথে লেগে ইস্তিতালাহ সিফাত সহ উচ্চারিত হয়।",
  },
  {
    id: 4,
    letter: "ف",
    promptBn: "ফা (ف) হরফের মাখরাজ কোনটি?",
    audioLetter: "ف",
    options: [
      { id: "a", text: "দুই ঠোঁটের ভেজা অংশ মিলিয়ে", correct: false },
      { id: "b", text: "নিচের ঠোঁটের পেট ও ওপরের সামনের দুই দাঁতের আগা", correct: true },
      { id: "c", text: "কণ্ঠনালীর শেষভাগ", correct: false },
      { id: "d", text: "জিহ্বার মধ্যভাগ ও তালু", correct: false },
    ],
    explanationBn: "ف হরফটি নিচের ঠোঁটের ভিতরের ভেজা অংশ ওপরের সামনের দুই দাঁতের (ছানায়া উলইয়া) আগার সাথে স্পর্শ করে মৃদু বাতাসে উচ্চারিত হয়।",
  },
  {
    id: 5,
    letter: "ط",
    promptBn: "তোয়া (ط), দাল (د) ও তা (ت)-এর মাখরাজ স্থান কোনটি?",
    audioLetter: "ط",
    options: [
      { id: "a", text: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া", correct: true },
      { id: "b", text: "জিহ্বার আগা ও নিচের দুই দাঁতের আগা", correct: false },
      { id: "c", text: "জিহ্বার আগা ও ওপরের দাঁতের আগা", correct: false },
      { id: "d", text: "কণ্ঠনালীর উপরিভাগ", correct: false },
    ],
    explanationBn: "ط, د, ت হরফ তিনটি জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া থেকে উচ্চারিত হয়। তবে ط মোটা আর د ও ت পাতলা।",
  },
  {
    id: 6,
    letter: "ص",
    promptBn: "সোয়াদ (ص), সীন (س) ও যা (ز) কোন মাখরাজ থেকে বের হয়?",
    audioLetter: "ص",
    options: [
      { id: "a", text: "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের পেট", correct: false },
      { id: "b", text: "জিহ্বার আগা ও নিচের সামনের দুই দাঁতের আগা ও ভেতরের অংশ", correct: true },
      { id: "c", text: "জিহ্বার মধ্যভাগ ও তালু", correct: false },
      { id: "d", text: "দুই ঠোঁট চেপে ধরে", correct: false },
    ],
    explanationBn: "ص, س, ز তিনটি সাফীর বা তীব্র বাঁশির মতো ধ্বনিযুক্ত হরফ, যা জিহ্বার আগা ও নিচের দুই দাঁতের আগা ও মধ্যবর্তী ফাঁকা স্থান থেকে আদায় হয়।",
  },
  {
    id: 7,
    letter: "ن",
    promptBn: "ওয়াজিব গুন্নাহ, ইখফা ও ইদগামের গুন্নাহর ধ্বনি কোন স্থান থেকে নির্গত হয়?",
    audioLetter: "ن",
    options: [
      { id: "a", text: "আল-খাইশূম (নাকের বাঁশি)", correct: true },
      { id: "b", text: "আল-জওফ (মুখের খালি স্থান)", correct: false },
      { id: "c", text: "আল-হালক্ব (কণ্ঠনালী)", correct: false },
      { id: "d", text: "আশ-শাফাতাইন (দুই ঠোঁট)", correct: false },
    ],
    explanationBn: "গুন্নাহ হলো এমন এক সুর যা নাকের বাঁশি (আল-খাইশূম) থেকে নির্গত হয়।",
  },
];

export default function MakhrajQuizTab() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const q = MAKHRAJ_QUIZ_QUESTIONS[currentIdx] || MAKHRAJ_QUIZ_QUESTIONS[0];

  const handlePlayLetter = (letter) => {
    if (typeof window === "undefined" || !letter) return;
    setIsPlayingAudio(true);
    universalAudioEngine.playLetter(letter, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < MAKHRAJ_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / MAKHRAJ_QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600 flex items-center justify-center mx-auto text-amber-600">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            মাখরাজ কুইজ সম্পন্ন হয়েছে!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            ১৭টি মাখরাজের উপর আপনার জ্ঞান চমৎকারভাবে মূল্যায়িত হয়েছে।
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 max-w-xs mx-auto">
          <span className="text-4xl font-black text-emerald-700 dark:text-emerald-300">
            {score} / {MAKHRAJ_QUIZ_QUESTIONS.length}
          </span>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
            সঠিক উত্তর: {percentage}%
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>পুনরায় পরীক্ষা দিন</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 animate-fade-in">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/80 text-xs">
        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>প্রশ্ন {currentIdx + 1} / {MAKHRAJ_QUIZ_QUESTIONS.length}</span>
        </span>
        <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700/60">
          স্কোর: {score}
        </span>
      </div>

      {/* Target Letter Display & Audio */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-arabic text-4xl shadow-md">
            {q.letter}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {q.promptBn}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              উচ্চারণ শুনে সঠিক মাখরাজ বাছাই করুন
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handlePlayLetter(q.audioLetter)}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            isPlayingAudio
              ? "bg-amber-500 text-slate-950 shadow-md animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingAudio ? "বাজছে..." : "হরফ শুনুন"}</span>
        </button>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt) => {
          let btnStyle = "bg-white dark:bg-[#071912] border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200";

          if (isAnswered) {
            if (opt.correct) {
              btnStyle = "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-black ring-2 ring-emerald-500/30";
            } else if (selectedOption?.id === opt.id) {
              btnStyle = "bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-100 font-black";
            } else {
              btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`p-3.5 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
            >
              <span>{opt.text}</span>
              {isAnswered && opt.correct && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {isAnswered && selectedOption?.id === opt.id && !opt.correct && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Explanation */}
      {isAnswered && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 animate-fade-in text-xs">
          <span className="font-black text-amber-900 dark:text-amber-200 block">
            {selectedOption?.correct ? "মাশাআল্লাহ! সঠিক উত্তর।" : "ভুল হয়েছে, তবে কোনো সমস্যা নেই!"}
          </span>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            {q.explanationBn}
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              পরবর্তী প্রশ্ন ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

