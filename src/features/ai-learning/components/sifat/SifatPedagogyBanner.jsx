"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Award, Info } from "lucide-react";
import { SIFAT_COUNT_PEDAGOGY } from "../../data/sifatCurriculum";

export default function SifatPedagogyBanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-amber-950/20 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl p-3.5 sm:p-4 text-xs transition-all shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm">
                সিফাত গণনার শাস্ত্রীয় পদ্ধতি (১৭ বনাম ১৮ সিফাত)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-black">
                প্রামাণ্য উস্তাদ মানদণ্ড
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              {SIFAT_COUNT_PEDAGOGY.overviewBn}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 cursor-pointer shrink-0 transition"
          title={isOpen ? "সংক্ষেপ করুন" : "বিস্তারিত জানুন"}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3 border-t border-emerald-200 dark:border-emerald-800/80 space-y-3 animate-fade-in text-slate-700 dark:text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SIFAT_COUNT_PEDAGOGY.comparison.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    {item.scholar}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-black text-[10px]">
                    {item.count}টি সিফাত
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {item.formulaBn}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.explanationBn}
                </p>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>রাহমানিয়া ইনস্টিটিউট কারিকুলাম: </strong>
              {SIFAT_COUNT_PEDAGOGY.rahmaniaPlatformCurriculumBn}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
