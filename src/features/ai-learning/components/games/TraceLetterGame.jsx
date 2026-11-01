"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, CheckCircle2, ChevronRight, Eraser, Award } from "lucide-react";
import { KIDS_TRACING_GROUPS } from "../../data/kidsGameData.js";
import { LETTER_WAYPOINTS } from "../../data/letterWaypoints.js";
import {
  playArabicSound,
  playCorrectChime,
  playStarPopSound,
  playMaShaAllahCelebration,
  playTapSound,
} from "../../lib/arabicSoundPlayer";
import { fireCelebrationConfetti } from "../../lib/confetti";
import NuruMascot from "../kids/NuruMascot";

const BRUSH_COLORS = [
  { id: "emerald", hex: "#10B981", name: "সবুজ" },
  { id: "sky", hex: "#0284C7", name: "নীল" },
  { id: "amber", hex: "#F59E0B", name: "সোনালী" },
  { id: "purple", hex: "#8B5CF6", name: "বেগুনি" },
  { id: "rose", hex: "#E11D48", name: "লাল" },
];

export default function TraceLetterGame({ onBack, onEarnReward }) {
  const [currentGroupId, setCurrentGroupId] = useState(1);
  const [letterIndex, setLetterIndex] = useState(0);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0].hex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hitWaypointIndices, setHitWaypointIndices] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [groupStars, setGroupStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_trace_stars");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const canvasRef = useRef(null);
  const activeGroup = KIDS_TRACING_GROUPS.find((g) => g.id === currentGroupId) || KIDS_TRACING_GROUPS[0];
  const currentLetter = activeGroup.letters[letterIndex] || activeGroup.letters[0];
  const waypoints = LETTER_WAYPOINTS[currentLetter?.ar] || [
    { step: 1, x: 0.5, y: 0.25, label: "১" },
    { step: 2, x: 0.5, y: 0.5, label: "২" },
    { step: 3, x: 0.5, y: 0.75, label: "৩" },
  ];

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHitWaypointIndices([]);
  }, []);

  useEffect(() => {
    clearCanvas();
    if (currentLetter?.ar) {
      const timer = setTimeout(() => playArabicSound(currentLetter.ar), 350);
      return () => clearTimeout(timer);
    }
  }, [letterIndex, currentGroupId, currentLetter, clearCanvas]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (canvas.width / rect.width),
      y: (cy - rect.top) * (canvas.height / rect.height),
    };
  };

  const checkWaypointHit = useCallback(
    (x, y) => {
      const nextIdx = hitWaypointIndices.length;
      if (nextIdx >= waypoints.length) return;
      const target = waypoints[nextIdx];
      const dist = Math.hypot(x - target.x * 400, y - target.y * 400);

      if (dist <= 38) {
        const nextList = [...hitWaypointIndices, nextIdx];
        setHitWaypointIndices(nextList);
        playStarPopSound(1);
        if (nextList.length === waypoints.length) playCorrectChime();
      }
    },
    [hitWaypointIndices, waypoints]
  );

  const startDrawing = (e) => {
    if (e.cancelable && e.touches) e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    checkWaypointHit(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable && e.touches) e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    checkWaypointHit(x, y);
  };

  const isCompleted = hitWaypointIndices.length === waypoints.length;

  const handleNextLetter = () => {
    playTapSound();
    playArabicSound(currentLetter.ar);
    playCorrectChime();
    playStarPopSound(2);

    if (letterIndex < activeGroup.letters.length - 1) {
      setLetterIndex((i) => i + 1);
    } else {
      setIsWon(true);
      fireCelebrationConfetti();
      playMaShaAllahCelebration();
      const updated = { ...groupStars, [currentGroupId]: 3 };
      setGroupStars(updated);
      try {
        localStorage.setItem("noor_kids_trace_stars", JSON.stringify(updated));
      } catch {}
      if (onEarnReward) onEarnReward(30);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupId < KIDS_TRACING_GROUPS.length) {
      setCurrentGroupId((g) => g + 1);
      setLetterIndex(0);
      setIsWon(false);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-[2.75rem] bg-gradient-to-b from-[#FFFDF7] via-white to-[#F0FDF4] border-4 border-sky-400 shadow-xl space-y-4 animate-kids-pop select-none">
      <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>গেম মেনু</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="kids-font text-xs font-bold text-slate-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            হরফ {letterIndex + 1}/{activeGroup.letters.length}
          </span>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="ক্যানভাস সাফ করুন"
          >
            <Eraser className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">পুনরায় আঁকো</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {KIDS_TRACING_GROUPS.map((grp) => {
          const stars = groupStars[grp.id] || 0;
          const isActive = grp.id === currentGroupId;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                playTapSound();
                setCurrentGroupId(grp.id);
                setLetterIndex(0);
                setIsWon(false);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                isActive
                  ? "bg-sky-600 border-sky-700 text-white shadow-md scale-105"
                  : "bg-white border-sky-200 text-sky-950 hover:bg-sky-50"
              }`}
            >
              <span>{grp.title}</span>
              {stars > 0 && <span className="text-amber-300 text-[10px]">{"⭐".repeat(stars)}</span>}
            </button>
          );
        })}
      </div>

      <div className="text-center space-y-0.5">
        <h2 className="text-sm sm:text-base font-black text-sky-950">
          হরফ: {currentLetter?.nameBn} ({currentLetter?.ar})
        </h2>
        <p className="text-xs text-sky-800 font-bold bg-sky-50 py-1 px-3 rounded-full inline-block border border-sky-200">
          ✍️ {currentLetter?.guide || "১ ➔ ২ ➔ ৩ অনুযায়ী হাত ঘুরিয়ে আঁকো"}
        </p>
      </div>

      {!isWon ? (
        <div className="space-y-4">
          <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square rounded-3xl bg-slate-900 border-4 border-sky-300 shadow-inner flex items-center justify-center overflow-hidden touch-none">
            <span className="absolute inset-0 flex items-center justify-center font-uthmani text-9xl sm:text-[12rem] text-white/20 select-none pointer-events-none drop-shadow-md">
              {currentLetter?.ar}
            </span>

            {waypoints.map((wp, idx) => {
              const isHit = hitWaypointIndices.includes(idx);
              const isCurrent = hitWaypointIndices.length === idx;
              return (
                <div
                  key={wp.step}
                  style={{ left: `${wp.x * 100}%`, top: `${wp.y * 100}%`, transform: "translate(-50%, -50%)" }}
                  className={`absolute pointer-events-none z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                    isHit
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-95"
                      : isCurrent
                      ? "bg-amber-400 text-amber-950 animate-bounce ring-4 ring-amber-300 shadow-lg scale-110"
                      : "bg-white/40 text-white/80 border border-white/60"
                  }`}
                >
                  {isHit ? "✓" : wp.label}
                </div>
              );
            })}

            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={() => setIsDrawing(false)}
              className="absolute inset-0 w-full h-full cursor-crosshair z-0"
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1">রং:</span>
              {BRUSH_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setBrushColor(col.hex);
                  }}
                  style={{ backgroundColor: col.hex }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    brushColor === col.hex ? "scale-125 ring-2 ring-offset-2 ring-sky-500" : "hover:scale-110"
                  }`}
                  title={col.name}
                />
              ))}
            </div>

            <span className="text-xs font-black text-slate-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              নির্দেশক: {hitWaypointIndices.length}/{waypoints.length} সম্পন্ন
            </span>
          </div>

          <div className="pt-2 text-center">
            {isCompleted ? (
              <button
                type="button"
                onClick={handleNextLetter}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:from-emerald-600 transition active:scale-95 animate-pulse cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>মাশাআল্লাহ! চমৎকার হয়েছে — পরবর্তী হরফ</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold inline-flex items-center gap-2">
                <span>দিকনির্দেশক ① থেকে শুরু করে ক্রমানুসারে হাত ঘুরিয়ে হরফটি পূর্ণ করো!</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center space-y-4 animate-kids-bounce">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-emerald-900">মাশাআল্লাহ! গ্রুপ সম্পন্ন!</h3>
            <p className="text-xs text-slate-600 font-bold">
              তুমি সফলভাবে এই গ্রুপের সকল হরফের নিখুঁত দিক ও আকৃতি শিখে ফেলেছ!
            </p>
          </div>
          <div className="text-2xl text-amber-400">⭐⭐⭐</div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleNextGroup}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>পরবর্তী গ্রুপ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setLetterIndex(0);
                setIsWon(false);
                clearCanvas();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার অনুশীলন করো</span>
            </button>
          </div>
        </div>
      )}

      <NuruMascot
        mood={isWon ? "celebrating" : isCompleted ? "happy" : "encouraging"}
        dialogue={
          isWon
            ? "মাশাআল্লাহ! তুমি পুরো গ্রুপের হরফ নিখুঁতভাবে লিখেছ!"
            : isCompleted
            ? "চমৎকার! হরফটির দিক একদম সঠিক হয়েছে!"
            : `১ নম্বর নির্দেশক থেকে শুরু করে ক্রমানুসারে হাত নাও!`
        }
      />
    </div>
  );
}
