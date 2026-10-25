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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div
        dir={dir}
        className="bg-[#071912] border-2 border-emerald-700/80 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/60 bg-[#05140d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-300">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.reviewMistakes}</h3>
              <p className="text-[11px] text-slate-400">
                {t.reviewMistakesSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mistake Items List */}
        <div className="p-5 flex-1 max-h-[400px] overflow-y-auto space-y-3">
          {mistakes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="font-bold text-white">{t.noMistakesRemaining}</p>
              <p>{t.allLessonsMastered}</p>
            </div>
          ) : (
            mistakes.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#040e0a] border border-rose-900/60 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  {item.ar && (
                    <span className="font-amiri text-2xl font-bold text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-800">
                      {item.ar}
                    </span>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="text-[11px] text-slate-300">{item.hint}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onResolveMistake(item.id);
                    toast.success(t.mistakeMarkedResolved);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow cursor-pointer shrink-0"
                >
                  {t.resolvedCheck}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#05140d] text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
