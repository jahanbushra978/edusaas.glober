"use client";

import React, { useState } from "react";
import { Award, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { SIFAT_QUIZ_QUESTIONS } from "../../data/sifatCurriculum";

export default function SifatQuizCard() {
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const currentQuiz = SIFAT_QUIZ_QUESTIONS[quizIdx] || SIFAT_QUIZ_QUESTIONS[0];

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
    <div className="bg-white dark:bg-[#0c241a] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {quizDone ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            সিফাতুল হুরুফ পরীক্ষা সম্পন্ন!
          </h4>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            স্কোর: {quizScore} / {SIFAT_QUIZ_QUESTIONS.length}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuizIdx(0);
              setSelectedOpt(null);
              setIsAnswered(false);
              setQuizScore(0);
              setQuizDone(false);
            }}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800 text-xs font-bold">
            <span className="text-emerald-700">প্রশ্ন {quizIdx + 1} / {SIFAT_QUIZ_QUESTIONS.length}</span>
            <span className="text-amber-600">স্কোর: {quizScore}</span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white py-2">
            {currentQuiz.questionBn}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuiz.options.map((opt) => {
              let style = "bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 text-slate-800 dark:text-slate-200";
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
  );
}

