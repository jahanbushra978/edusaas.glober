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
      <p className="text-xs text-slate-600 font-medium font-hind-siliguri leading-relaxed">
        নূর এখন আপনাকে বিশ্বখ্যাত ক্বারীগণের কণ্ঠে বিশুদ্ধ উচ্চারণ ও তাজবীদের
        লাহজা শুনিয়ে দিচ্ছে। যেকোনো শায়খ বেছে নিয়ে শুনুন:
      </p>

      {/* 6 World-Class Shaykhs Selection Grid */}
      <div className="bg-white/90 border border-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>ক্বারী নির্বাচন (৬ জন প্রখ্যাত শায়খ):</span>
          </span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
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
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-[#0d7a5f] to-[#0a634d] text-white border-2 border-[#d4af37] shadow-md shadow-emerald-900/15 scale-[1.02]"
                    : "bg-white border-emerald-100 hover:border-emerald-300 text-slate-800 hover:bg-emerald-50/50 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">{shaykh.flagEmoji}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-amber-300 text-slate-900"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {shaykh.badge}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-bold leading-tight ${
                    isSelected ? "text-white" : "text-slate-800"
                  }`}
                >
                  {shaykh.displayTitleBn}
                </div>
                <div
                  className={`text-[9px] truncate mt-0.5 ${
                    isSelected ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
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
          className="px-6 py-3 bg-gradient-to-r from-[#0d7a5f] to-[#0a634d] hover:opacity-95 text-white rounded-full text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-md shadow-emerald-900/15 transition-transform active:scale-95 cursor-pointer"
        >
          <Volume2
            className={`w-4 h-4 ${audioPlaying ? "animate-spin text-amber-300" : "text-emerald-100"}`}
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
