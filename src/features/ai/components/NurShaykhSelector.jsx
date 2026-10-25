"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { SHAYKH_REGISTRY } from "@/lib/ai/qari-registry";

/**
 * NurShaykhSelector — World-Class Qari Selection Grid
 * Extracted from NurTeachingEngine for modularity compliance (Invariant 2.7).
 * Displays 6 world-renowned Qari options for demonstration audio selection.
 */
export default function NurShaykhSelector({
  selectedShaykhId,
  onSelectShaykh,
  audioPlaying,
  onPlayDemonstration,
}) {
  const activeShaykh =
    SHAYKH_REGISTRY.find((q) => q.id === selectedShaykhId) || SHAYKH_REGISTRY[0];

  return (
    <div className="space-y-3.5">
      {/* Shaykh Description */}
      <p className="text-xs text-slate-300">
        নূর এখন আপনাকে বিশ্বখ্যাত ক্বারীগণের কণ্ঠে বিশুদ্ধ উচ্চারণ ও তাজবীদের
        লাহজা শুনিয়ে দিচ্ছে। যেকোনো শায়খ বেছে নিয়ে শুনুন:
      </p>

      {/* 6 World-Class Shaykhs Selection Grid */}
      <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-3">
        <div className="text-[11px] font-bold text-emerald-300 mb-2 flex items-center justify-between">
          <span>ক্বারী নির্বাচন (৬ জন প্রখ্যাত শায়খ):</span>
          <span className="text-[10px] text-slate-300 font-normal">
            {activeShaykh.nameBn}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SHAYKH_REGISTRY.map((shaykh) => {
            const isSelected = selectedShaykhId === shaykh.id;
            return (
              <button
                key={shaykh.id}
                type="button"
                onClick={() => onSelectShaykh(shaykh.id)}
                className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${shaykh.activeColor} shadow-md shadow-emerald-950/60`
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{shaykh.flagEmoji}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected
                        ? "bg-white text-slate-900"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {shaykh.badge}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">
                  {shaykh.displayTitleBn}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                  {shaykh.roleBn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play Demo Button */}
      <div className="flex items-center justify-center py-2">
        <button
          type="button"
          onClick={onPlayDemonstration}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
        >
          <Volume2
            className={`w-4 h-4 ${audioPlaying ? "animate-spin text-yellow-300" : ""}`}
          />
          <span>
            {audioPlaying
              ? `${activeShaykh.shortNameBn}-এর কণ্ঠে বাজছে...`
              : `${activeShaykh.shortNameBn}-এর কণ্ঠে ডেমো শুনুন`}
          </span>
        </button>
      </div>
    </div>
  );
}
