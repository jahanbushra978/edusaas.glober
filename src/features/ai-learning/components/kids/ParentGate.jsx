"use client";

import React, { useState, useRef } from "react";
import { Settings, X, ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";
import { playTapSound } from "../../lib/arabicSoundPlayer";

export default function ParentGate({
  isOpen,
  onClose,
  onSwitchToAdult,
  onResetChoice,
}) {
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100%
  const [isUnlocked, setIsUnlocked] = useState(false);
  const pressTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  if (!isOpen) return null;

  const startHold = () => {
    setPressProgress(0);
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds long-press

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setPressProgress(progress);
    }, 30);

    pressTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current);
      setPressProgress(100);
      setIsUnlocked(true);
      playTapSound();
    }, duration);
  };

  const cancelHold = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (!isUnlocked) {
      setPressProgress(0);
    }
  };

  const handleClose = () => {
    cancelHold();
    setIsUnlocked(false);
    setPressProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-kids-pop select-none">
      <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white border-4 border-emerald-400 p-6 shadow-2xl space-y-5 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-800 shadow-xs mb-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="kids-font text-xl sm:text-2xl font-black text-slate-900">
            অভিভাবক নিয়ন্ত্রণ (Parent Gate)
          </h3>
          <p className="kids-font text-xs sm:text-sm text-slate-600 mt-1 max-w-xs">
            ছোটরা যেন ভুল করে সেটিং না খোলে, সেজন্য বড়দের অনুমতি প্রয়োজন।
          </p>
        </div>

        {/* STEP 1: LONG PRESS UNLOCK */}
        {!isUnlocked ? (
          <div className="py-4 flex flex-col items-center space-y-4">
            <p className="kids-font text-sm font-bold text-emerald-900">
              নিচের গোল বোতামটি ২ সেকেন্ড চেপে ধরে রাখুন:
            </p>

            <button
              type="button"
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer border-4 border-emerald-300"
            >
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#A7F3D0"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * pressProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>

              <Settings className="w-7 h-7 animate-spin-slow mb-0.5" />
              <span className="text-[11px] font-black">{pressProgress}%</span>
            </button>
          </div>
        ) : (
          /* STEP 2: PARENT CONTROLS */
          <div className="py-2 space-y-3">
            {/* Switch to Adult Mode */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onSwitchToAdult();
                handleClose();
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>বড়দের মোডে ফিরে যান</span>
            </button>

            {/* Reset Choice */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onResetChoice();
                handleClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>মোড বাছাই রিসেট করুন</span>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              ছোটদের খেলা চালিয়ে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
