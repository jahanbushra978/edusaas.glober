"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function ReviewMistakesModal({
  mistakes = [],
  onClose,
  onResolveMistake,
}) {
  const { t, dir } = useLearningLanguage();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div
        dir={dir}
        className="bg-white dark:bg-[#0c241a] border-2 border-emerald-200 dark:border-emerald-700/80 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden font-sans transition-all"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-[#071912] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-600 flex items-center justify-center text-rose-600 dark:text-rose-300 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{t.reviewMistakes}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.reviewMistakesSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mistake Items List */}
        <div className="p-4 sm:p-5 flex-1 max-h-[400px] overflow-y-auto space-y-3">
          {mistakes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{t.noMistakesRemaining}</p>
              <p className="font-medium">{t.allLessonsMastered}</p>
            </div>
          ) : (
            mistakes.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/60 dark:bg-[#071d14] border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  {item.ar && (
                    <span className="font-arabic text-2xl font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-300 dark:border-rose-800 shadow-xs">
                      {item.ar}
                    </span>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.hint}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onResolveMistake(item.id);
                    toast.success(t.mistakeMarkedResolved);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                >
                  {t.resolvedCheck}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-[#071912] text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
