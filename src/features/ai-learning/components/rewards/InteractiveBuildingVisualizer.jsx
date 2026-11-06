"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  Award,
} from "lucide-react";
import { getBuildingJourney } from "../../data/buildingRewardData";
import { playTapSound } from "../../lib/arabicSoundPlayer";

/**
 * InteractiveBuildingVisualizer
 * Renders an authentic, visible, multi-layered SVG construction scene
 * for all 7 Noor learning journeys.
 * 
 * Supports:
 * - Super Noor Car (14 components)
 * - Kids Fun Park (3 components)
 * - Noor Cottage (7 components)
 * - Noor Space Rocket (7 components)
 * - Amal Fruit Garden (6 components)
 * - Noor City & Grand Mosque (9 components)
 * - Castle of Knowledge (4 components)
 * 
 * Accurately renders:
 * - Unearned parts as ghosted/dashed blueprint outlines.
 * - Earned parts in full vibrant color, metallic gradients, and glowing effects.
 * - Newly earned parts with celebratory spotlight pulsing.
 * - Accurate progress indicator (e.g., 0/14 before Level 1, 1/14 after Level 1).
 */
export default function InteractiveBuildingVisualizer({
  gameId = "drag-drop-letter",
  earnedRewardIds = [],
  currentLevel = 1,
  newlyEarnedId = null,
  isCelebration = false,
  compact = false,
}) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [selectedComponentInfo, setSelectedComponentInfo] = useState(null);

  const journey = getBuildingJourney(gameId);
  const totalMilestones = journey.totalMilestones || journey.components.length;
  const earnedCount = earnedRewardIds.length;
  const percentComplete = Math.min(
    100,
    Math.round((earnedCount / totalMilestones) * 100)
  );

  const isComplete = earnedCount >= totalMilestones;

  return (
    <div
      className={`w-full rounded-2xl sm:rounded-3xl border transition-all ${
        isCelebration
          ? "bg-slate-900/90 border-amber-400/60 shadow-2xl p-3 sm:p-4"
          : "bg-white/95 dark:bg-[#071710] border-emerald-200/80 dark:border-emerald-900/70 shadow-md p-2.5 sm:p-4"
      }`}
    >
      {/* ── WORKSHOP HEADER BAR ── */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 flex items-center justify-center text-lg shadow-sm shrink-0">
            {journey.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                {journey.titleBn}
              </h3>
              {isComplete && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                  সম্পূর্ণ প্রস্তুত ✓
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              যন্ত্রাংশ সংগৃহীত:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {earnedCount}/{totalMilestones}
              </strong>{" "}
              ({percentComplete}%)
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCelebration && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setIsExpanded(!isExpanded);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title={isExpanded ? "লুকিয়ে রাখুন" : "বড় করে দেখুন"}
            >
              <span>{isExpanded ? "সংক্ষিপ্ত" : "দৃশ্য দেখুন"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* ── EXPANDED INTERACTIVE VISUAL BUILDING SCENE ── */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* SVG Canvas Stage */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] max-h-[220px] rounded-2xl bg-gradient-to-b from-slate-950 via-[#061912] to-slate-950 border border-emerald-900/60 overflow-hidden flex items-center justify-center p-2 shadow-inner">
            {/* Ambient Blueprint Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #059669 1px, transparent 1px), linear-gradient(to bottom, #059669 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Glowing Backdrop Aura */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
                isComplete
                  ? "bg-radial from-amber-500/25 via-emerald-500/15 to-transparent opacity-100"
                  : "bg-radial from-emerald-500/10 via-transparent to-transparent opacity-60"
              }`}
            />

            {/* Render Specific SVG Scene by Journey Theme */}
            {journey.themeId === "super-car" && (
              <SuperCarSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "space-rocket" && (
              <SpaceRocketSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "dream-house" && (
              <NoorCottageSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "fruit-garden" && (
              <AmalGardenSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "noor-village" && (
              <GrandMosqueSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "play-park" && (
              <KidsFunParkSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {journey.themeId === "ilm-castle" && (
              <IlmCastleSvgScene
                earnedRewardIds={earnedRewardIds}
                newlyEarnedId={newlyEarnedId}
              />
            )}

            {/* Live Status Overlay Ribbon */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] sm:text-xs px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
              <span className="flex items-center gap-1 font-bold">
                <Award className="w-3 h-3 text-amber-400" />
                <span>
                  {earnedCount === 0
                    ? "ওয়ার্কশপ প্রস্তুত: লেভেল ১ শেষ করে প্রথম অংশ যুক্ত করো!"
                    : earnedCount < totalMilestones
                    ? `চলমান নির্মাণ: ${earnedCount}/${totalMilestones} অংশ যুক্ত`
                    : "মাশাআল্লাহ! সম্পূর্ণ নির্মাণ সম্পন্ন হয়েছে!"}
                </span>
              </span>
              <span className="text-amber-400 font-extrabold">
                {percentComplete}% সম্পূর্ণ
              </span>
            </div>
          </div>

          {/* ── INTERACTIVE COMPONENT INVENTORY TRAY ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {journey.components.map((comp) => {
              const isEarned = earnedRewardIds.includes(comp.id);
              const isCurrentNew = newlyEarnedId === comp.id;

              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSelectedComponentInfo(comp);
                  }}
                  className={`h-11 min-w-[70px] sm:min-w-[85px] px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center cursor-pointer shrink-0 border ${
                    isCurrentNew
                      ? "bg-amber-100 dark:bg-amber-950/80 border-amber-400 ring-2 ring-amber-300 scale-105 shadow-md"
                      : isEarned
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                      : "bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
                  }`}
                  title={`${comp.nameBn} - ${isEarned ? "সংগৃহীত" : `লেভেল ${comp.level}-এ আনলক`}`}
                >
                  <div className="flex items-center gap-1 text-xs">
                    <span>{comp.icon}</span>
                    {isEarned ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold truncate max-w-[75px] leading-tight">
                    {comp.nameBn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Component Info Card (if clicked) */}
          {selectedComponentInfo && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-xs flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedComponentInfo.icon}</span>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white leading-tight">
                    লেভেল {selectedComponentInfo.level}: {selectedComponentInfo.nameBn}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {selectedComponentInfo.descBn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComponentInfo(null)}
                className="text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
              >
                বন্ধ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SUPER NOOR CAR SVG SCENE (14 Component Layers)
// ─────────────────────────────────────────────────────────────
function SuperCarSvgScene({ earnedRewardIds = [], newlyEarnedId }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg
      viewBox="0 0 540 220"
      className="w-full h-full max-h-[200px] overflow-visible drop-shadow-xl"
    >
      <defs>
        {/* Car Body Gradient */}
        <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Golden Metallic Rim Gradient */}
        <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Chassis Gradient */}
        <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Windshield Gradient */}
        <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
        </linearGradient>

        {/* Headlight Glow Filter */}
        <filter id="lightGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── BASE BLUEPRINT GHOST OUTLINE (Always visible as guide) ── */}
      <g stroke="#059669" strokeDasharray="4 4" fill="none" opacity="0.25" strokeWidth="1.5">
        {/* Outline Chassis */}
        <path d="M 60 170 L 460 170 L 480 150 L 500 130 L 450 110 L 370 70 L 220 70 L 140 100 L 70 120 Z" />
        {/* Outline Wheels */}
        <circle cx="150" cy="170" r="38" />
        <circle cx="390" cy="170" r="38" />
      </g>

      {/* ── 1. CHASSIS (Level 1) ── */}
      {has("chassis") && (
        <g id="layer-chassis" className="animate-fade-in">
          {/* Main frame beam */}
          <rect x="70" y="160" width="400" height="14" rx="4" fill="url(#chassisGrad)" stroke="#1e293b" strokeWidth="2" />
          {/* Axle mounts */}
          <rect x="135" y="150" width="30" height="24" rx="3" fill="#334155" />
          <rect x="375" y="150" width="30" height="24" rx="3" fill="#334155" />
          {/* Suspension springs */}
          <line x1="145" y1="145" x2="145" y2="165" stroke="#94a3b8" strokeWidth="4" strokeDasharray="3 2" />
          <line x1="385" y1="145" x2="385" y2="165" stroke="#94a3b8" strokeWidth="4" strokeDasharray="3 2" />
        </g>
      )}

      {/* ── 2. REAR WHEEL (Level 2) ── */}
      {has("rear-wheels") && (
        <g id="layer-rear-wheels" className="animate-fade-in">
          {/* Outer Tire */}
          <circle cx="150" cy="170" r="38" fill="#0f172a" stroke="#334155" strokeWidth="4" />
          {/* Tire Treads */}
          <circle cx="150" cy="170" r="33" fill="none" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />
          {/* Inner Wheel Disc */}
          <circle cx="150" cy="170" r="23" fill="#475569" stroke="#64748b" strokeWidth="2" />
          {/* Center Hub */}
          <circle cx="150" cy="170" r="8" fill="#0284c7" />
        </g>
      )}

      {/* ── 3. FRONT WHEEL (Level 3) ── */}
      {has("front-wheels") && (
        <g id="layer-front-wheels" className="animate-fade-in">
          {/* Outer Tire */}
          <circle cx="390" cy="170" r="38" fill="#0f172a" stroke="#334155" strokeWidth="4" />
          {/* Tire Treads */}
          <circle cx="390" cy="170" r="33" fill="none" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />
          {/* Inner Wheel Disc */}
          <circle cx="390" cy="170" r="23" fill="#475569" stroke="#64748b" strokeWidth="2" />
          {/* Center Hub */}
          <circle cx="390" cy="170" r="8" fill="#0284c7" />
        </g>
      )}

      {/* ── 4. TURBO ENGINE (Level 4) ── */}
      {has("engine") && (
        <g id="layer-engine" className="animate-fade-in">
          {/* Engine block */}
          <rect x="340" y="115" width="55" height="32" rx="4" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          {/* Cylinder head */}
          <rect x="345" y="110" width="45" height="7" rx="2" fill="#0284c7" />
          {/* Turbo glow exhaust */}
          <path d="M 60 166 L 45 166 L 42 162" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="42" cy="162" r="3" fill="#38bdf8" filter="url(#lightGlow)" />
        </g>
      )}

      {/* ── 5. CAR BODY SHELL (Level 5) ── */}
      {has("body-shell") && (
        <g id="layer-body-shell" className="animate-fade-in">
          {/* Sleek Aerodynamic sports car body */}
          <path
            d="M 60 162 
               C 50 145, 60 125, 100 115 
               L 180 105 
               L 240 70 
               L 360 70 
               L 435 105 
               L 485 125 
               C 505 135, 510 155, 485 164 
               L 440 164 
               C 435 138, 345 138, 340 164 
               L 200 164 
               C 195 138, 105 138, 100 164 
               Z"
            fill="url(#carBodyGrad)"
            stroke="#0f766e"
            strokeWidth="3"
          />
          {/* Fender flares highlight */}
          <path d="M 95 160 C 105 135, 195 135, 205 160" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
          <path d="M 335 160 C 345 135, 435 135, 445 160" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
        </g>
      )}

      {/* ── 6. SCISSOR DOORS (Level 6) ── */}
      {has("doors") && (
        <g id="layer-doors" className="animate-fade-in">
          <path
            d="M 205 110 L 330 110 L 320 156 L 200 156 Z"
            fill="#0369a1"
            fillOpacity="0.4"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
          {/* Chrome door handle */}
          <rect x="295" y="120" width="16" height="4" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.5" />
        </g>
      )}

      {/* ── 7. WINDSHIELD & CABIN GLASS (Level 7) ── */}
      {has("windshield") && (
        <g id="layer-windshield" className="animate-fade-in">
          {/* Front & Side curved glass */}
          <path
            d="M 235 76 L 355 76 L 415 105 L 195 105 Z"
            fill="url(#windshieldGrad)"
            stroke="#7dd3fc"
            strokeWidth="1.5"
          />
          {/* Specular glare shine line */}
          <path d="M 270 80 L 380 102" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </g>
      )}

      {/* ── 8. HEADLIGHTS & LIGHT BEAM (Level 8) ── */}
      {has("headlights") && (
        <g id="layer-headlights" className="animate-fade-in">
          {/* Projector LED Headlight */}
          <polygon points="480,126 505,134 495,142 475,135" fill="#fef08a" stroke="#eab308" strokeWidth="1" filter="url(#lightGlow)" />
          {/* Forward Radiating Light Beam Cone */}
          <polygon points="505,134 540,115 540,175 495,142" fill="#fef08a" fillOpacity="0.25" />
          {/* Tail light (Ruby Red) */}
          <polygon points="62,130 52,136 55,145 66,140" fill="#ef4444" filter="url(#lightGlow)" />
        </g>
      )}

      {/* ── 9. STEERING & DASHBOARD (Level 9) ── */}
      {has("steering") && (
        <g id="layer-steering" className="animate-fade-in">
          {/* Dashboard console visible inside */}
          <rect x="330" y="94" width="30" height="9" rx="2" fill="#1e293b" />
          {/* Glowing HUD instrument dial */}
          <circle cx="340" cy="98" r="3" fill="#10b981" />
          <circle cx="350" cy="98" r="3" fill="#38bdf8" />
          {/* Steering Wheel */}
          <ellipse cx="325" cy="96" rx="4" ry="7" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
        </g>
      )}

      {/* ── 10. RACING SEATS (Level 10) ── */}
      {has("seats") && (
        <g id="layer-seats" className="animate-fade-in">
          {/* Ergonomic Driver Bucket Seat */}
          <path d="M 260 85 C 270 85, 275 95, 275 105 L 250 105 C 250 95, 252 85, 260 85 Z" fill="#b91c1c" stroke="#f87171" strokeWidth="1" />
          <rect x="256" y="80" width="8" height="5" rx="2" fill="#ef4444" />
        </g>
      )}

      {/* ── 11. REAR SPOILER WING (Level 11) ── */}
      {has("spoiler") && (
        <g id="layer-spoiler" className="animate-fade-in">
          {/* Pylons */}
          <line x1="75" y1="120" x2="70" y2="102" stroke="#1e293b" strokeWidth="3" />
          <line x1="95" y1="116" x2="90" y2="102" stroke="#1e293b" strokeWidth="3" />
          {/* Elevated Carbon Wing */}
          <polygon points="55,102 110,98 108,103 55,106" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        </g>
      )}

      {/* ── 12. GOLDEN DETAILS & CALLIGRAPHY SKIRT (Level 12) ── */}
      {(has("decals") || has("decorative")) && (
        <g id="layer-decorative" className="animate-fade-in">
          {/* Racing Golden Stripe along waistline */}
          <path d="M 80 135 L 475 135" stroke="#facc15" strokeWidth="2.5" strokeDasharray="20 4 10 4" />
          {/* Islamic Noor badge decal */}
          <circle cx="215" cy="135" r="7" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
          <text x="215" y="138" fontSize="6" textAnchor="middle" fill="#ffffff" fontWeight="bold">نور</text>
        </g>
      )}

      {/* ── 13. GOLDEN ALLOY RIMS (Level 13) ── */}
      {has("golden-rims") && (
        <g id="layer-golden-rims" className="animate-fade-in">
          {/* Rear Wheel Golden 5-Spoke Rim */}
          <circle cx="150" cy="170" r="23" fill="url(#goldRimGrad)" stroke="#fef08a" strokeWidth="2" />
          <circle cx="150" cy="170" r="6" fill="#047857" stroke="#ffffff" strokeWidth="1" />
          {/* Spokes */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={`r-spoke-${i}`}
              x1="150"
              y1="170"
              x2={150 + 20 * Math.cos((angle * Math.PI) / 180)}
              y2={170 + 20 * Math.sin((angle * Math.PI) / 180)}
              stroke="#78350f"
              strokeWidth="2"
            />
          ))}

          {/* Front Wheel Golden 5-Spoke Rim */}
          <circle cx="390" cy="170" r="23" fill="url(#goldRimGrad)" stroke="#fef08a" strokeWidth="2" />
          <circle cx="390" cy="170" r="6" fill="#047857" stroke="#ffffff" strokeWidth="1" />
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={`f-spoke-${i}`}
              x1="390"
              y1="170"
              x2={390 + 20 * Math.cos((angle * Math.PI) / 180)}
              y2={170 + 20 * Math.sin((angle * Math.PI) / 180)}
              stroke="#78350f"
              strokeWidth="2"
            />
          ))}
        </g>
      )}

      {/* ── 14. NOOR GOLDEN CROWN (Level 14 - Grand Finale) ── */}
      {has("noor-crown") && (
        <g id="layer-noor-crown" className="animate-bounce">
          {/* Radiant Starburst halo */}
          <circle cx="300" cy="46" r="20" fill="#fef08a" fillOpacity="0.3" filter="url(#lightGlow)" />
          {/* Crown Base */}
          <polygon points="286,52 314,52 318,36 307,44 300,30 293,44 282,36" fill="url(#goldRimGrad)" stroke="#ffffff" strokeWidth="1.5" />
          {/* Jewels */}
          <circle cx="288" cy="49" r="1.5" fill="#ef4444" />
          <circle cx="300" cy="49" r="2" fill="#10b981" />
          <circle cx="312" cy="49" r="1.5" fill="#3b82f6" />
          <circle cx="300" cy="27" r="2.5" fill="#fef08a" />
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. NOOR SPACE ROCKET SVG SCENE (7 Components)
// ─────────────────────────────────────────────────────────────
function SpaceRocketSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 360 220" className="w-full h-full max-h-[200px] overflow-visible">
      {/* Stars Background */}
      {[
        [40, 30], [90, 80], [140, 20], [240, 40], [300, 90], [320, 25]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#fef08a" opacity="0.6" />
      ))}

      {/* Ghost Outline */}
      <g stroke="#059669" strokeDasharray="3 3" fill="none" opacity="0.3">
        <path d="M 180 20 C 140 70, 140 150, 140 180 L 220 180 C 220 150, 220 70, 180 20 Z" />
      </g>

      {/* 1. Thruster (Level 1) */}
      {has("thruster") && (
        <g className="animate-fade-in">
          <polygon points="150,180 210,180 220,198 140,198" fill="#475569" stroke="#334155" strokeWidth="2" />
          {/* Rocket Fire Flame */}
          <polygon points="155,198 205,198 180,225" fill="#f97316" />
          <polygon points="165,198 195,198 180,215" fill="#fde047" />
        </g>
      )}

      {/* 2. Fuel Tank (Level 2) */}
      {has("fuel-tank") && (
        <path
          d="M 140 110 L 140 180 L 220 180 L 220 110 Z"
          fill="url(#rocketBodyGrad)"
          stroke="#0f766e"
          strokeWidth="3"
        />
      )}

      {/* 3. Cabin (Level 3) */}
      {has("cabin") && (
        <g className="animate-fade-in">
          <path d="M 140 110 C 140 60, 180 25, 180 25 C 180 25, 220 60, 220 110 Z" fill="#0284c7" stroke="#0f766e" strokeWidth="3" />
          {/* Sky Porthole Window with Nuru waving */}
          <circle cx="180" cy="75" r="18" fill="#38bdf8" stroke="#f1f5f9" strokeWidth="3" />
          <circle cx="180" cy="75" r="10" fill="#047857" />
          <text x="180" y="78" fontSize="8" textAnchor="middle" fill="#ffffff" fontWeight="bold">نور</text>
        </g>
      )}

      {/* 4. Fins (Level 4) */}
      {has("fins") && (
        <g className="animate-fade-in">
          <polygon points="140,140 100,185 140,180" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <polygon points="220,140 260,185 220,180" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        </g>
      )}

      {/* 5. Capsule Solar Wings (Level 5) */}
      {has("capsule") && (
        <g className="animate-fade-in">
          <rect x="75" y="105" width="60" height="20" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="225" y="105" width="60" height="20" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Solar Grid Lines */}
          <line x1="95" y1="105" x2="95" y2="125" stroke="#93c5fd" />
          <line x1="115" y1="105" x2="115" y2="125" stroke="#93c5fd" />
          <line x1="245" y1="105" x2="245" y2="125" stroke="#93c5fd" />
          <line x1="265" y1="105" x2="265" y2="125" stroke="#93c5fd" />
        </g>
      )}

      {/* 6. Satellite Radar (Level 6) */}
      {has("satellite-radar") && (
        <g className="animate-fade-in">
          <path d="M 180 25 L 180 5" stroke="#e2e8f0" strokeWidth="2.5" />
          <circle cx="180" cy="5" r="4" fill="#eab308" />
          <path d="M 168 12 C 175 6, 185 6, 192 12" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        </g>
      )}

      {/* 7. Galaxy Core (Level 7) */}
      {has("galaxy-core") && (
        <g className="animate-pulse">
          <circle cx="180" cy="145" r="12" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
          <text x="180" y="149" fontSize="11" textAnchor="middle" fill="#78350f" fontWeight="bold">⭐</text>
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. NOOR COTTAGE (DREAM HOUSE) SVG SCENE (7 Components)
// ─────────────────────────────────────────────────────────────
function NoorCottageSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 360 220" className="w-full h-full max-h-[200px] overflow-visible">
      {/* Ghost Outline */}
      <g stroke="#059669" strokeDasharray="3 3" fill="none" opacity="0.3">
        <rect x="100" y="110" width="160" height="80" />
        <polygon points="80,110 180,45 280,110" />
      </g>

      {/* 1. Foundation (Level 1) */}
      {has("foundation") && (
        <rect x="85" y="185" width="190" height="15" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
      )}

      {/* 2. Walls (Level 2) */}
      {has("walls") && (
        <rect x="100" y="110" width="160" height="75" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
      )}

      {/* 3. Main Door (Level 3) */}
      {has("main-door") && (
        <g className="animate-fade-in">
          <path d="M 160 185 L 160 140 C 160 130, 200 130, 200 140 L 200 185 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <circle cx="192" cy="160" r="2.5" fill="#facc15" />
        </g>
      )}

      {/* 4. Windows (Level 4) */}
      {has("windows") && (
        <g className="animate-fade-in">
          {/* Left Arched Window */}
          <path d="M 115 155 L 115 135 C 115 125, 140 125, 140 135 L 140 155 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          {/* Right Arched Window */}
          <path d="M 220 155 L 220 135 C 220 125, 245 125, 245 135 L 245 155 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        </g>
      )}

      {/* 5. Roof & Chimney (Level 5) */}
      {has("roof") && (
        <g className="animate-fade-in">
          <rect x="225" y="55" width="18" height="30" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
          <polygon points="75,112 180,45 285,112" fill="#ea580c" stroke="#c2410c" strokeWidth="3" />
        </g>
      )}

      {/* 6. Garden & Fountain (Level 6) */}
      {has("garden") && (
        <g className="animate-fade-in">
          <ellipse cx="60" cy="185" rx="25" ry="12" fill="#15803d" />
          <ellipse cx="300" cy="185" rx="25" ry="12" fill="#15803d" />
          {/* Flowers */}
          <circle cx="50" cy="180" r="3" fill="#f43f5e" />
          <circle cx="70" cy="180" r="3" fill="#facc15" />
          <circle cx="290" cy="180" r="3" fill="#f43f5e" />
          <circle cx="310" cy="180" r="3" fill="#38bdf8" />
        </g>
      )}

      {/* 7. Lanterns (Level 7) */}
      {has("lanterns") && (
        <g className="animate-pulse">
          <circle cx="180" cy="35" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          <text x="180" y="38" fontSize="7" textAnchor="middle" fill="#854d0e" fontWeight="bold">نور</text>
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. AMAL FRUIT GARDEN SVG SCENE (6 Components)
// ─────────────────────────────────────────────────────────────
function AmalGardenSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 380 220" className="w-full h-full max-h-[200px] overflow-visible">
      {/* 1. Soil & Fence (Level 1) */}
      {has("soil") && (
        <g className="animate-fade-in">
          <rect x="20" y="175" width="340" height="25" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          {/* Wooden Fence Posts */}
          {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
            <rect key={x} x={x} y="155" width="8" height="25" fill="#b45309" stroke="#78350f" />
          ))}
          <line x1="30" y1="165" x2="335" y2="165" stroke="#78350f" strokeWidth="2" />
        </g>
      )}

      {/* 2. Ajwa Date Palms (Level 2) */}
      {has("palms") && (
        <g className="animate-fade-in">
          {/* Palm Trunk */}
          <path d="M 80 175 Q 85 110, 100 80" stroke="#92400e" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Palm Fronds */}
          <path d="M 100 80 Q 70 70, 50 85" stroke="#16a34a" strokeWidth="5" fill="none" />
          <path d="M 100 80 Q 90 50, 75 40" stroke="#15803d" strokeWidth="5" fill="none" />
          <path d="M 100 80 Q 120 50, 135 45" stroke="#16a34a" strokeWidth="5" fill="none" />
          <path d="M 100 80 Q 130 75, 145 90" stroke="#15803d" strokeWidth="5" fill="none" />
        </g>
      )}

      {/* 3. Pomegranate Trees (Level 3) */}
      {has("pomegranates") && (
        <g className="animate-fade-in">
          <circle cx="280" cy="115" r="35" fill="#16a34a" />
          <circle cx="280" cy="175" r="5" fill="#92400e" />
          <line x1="280" y1="150" x2="280" y2="175" stroke="#92400e" strokeWidth="6" />
          {/* Red Pomegranates */}
          <circle cx="265" cy="105" r="5" fill="#e11d48" />
          <circle cx="290" cy="110" r="5" fill="#e11d48" />
          <circle cx="275" cy="130" r="5" fill="#e11d48" />
        </g>
      )}

      {/* 4. Stream (Level 4) */}
      {has("stream") && (
        <path
          d="M 130 185 Q 190 175, 230 190"
          stroke="#38bdf8"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="animate-pulse"
        />
      )}

      {/* 5. Birds & Bees (Level 5) */}
      {has("birds") && (
        <g className="animate-bounce">
          <text x="160" y="65" fontSize="16">🕊️</text>
          <text x="220" y="80" fontSize="14">🐝</text>
        </g>
      )}

      {/* 6. Paradise Gate (Level 6) */}
      {has("paradise-gate") && (
        <g className="animate-pulse">
          <path d="M 160 175 L 160 120 C 160 90, 220 90, 220 120 L 220 175 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
          <text x="190" y="130" fontSize="9" textAnchor="middle" fill="#78350f" fontWeight="bold">جَنَّة</text>
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. GRAND MOSQUE & NOOR CITY SVG SCENE (9 Components)
// ─────────────────────────────────────────────────────────────
function GrandMosqueSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 420 220" className="w-full h-full max-h-[200px] overflow-visible">
      {/* 1. Marble Base (Level 1) */}
      {has("mosque-base") && (
        <rect x="40" y="180" width="340" height="15" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      )}

      {/* 2. Arched Walls (Level 2) */}
      {has("walls") && (
        <g className="animate-fade-in">
          <rect x="130" y="115" width="160" height="65" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Islamic Archways */}
          <path d="M 160 180 L 160 150 C 160 135, 180 135, 180 150 L 180 180 Z" fill="#0f766e" />
          <path d="M 200 180 L 200 145 C 200 130, 220 130, 220 145 L 220 180 Z" fill="#047857" />
          <path d="M 240 180 L 240 150 C 240 135, 260 135, 260 150 L 260 180 Z" fill="#0f766e" />
        </g>
      )}

      {/* 3. Golden Main Dome (Level 3) */}
      {has("main-dome") && (
        <path
          d="M 160 115 C 160 65, 260 65, 260 115 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="2.5"
          className="animate-fade-in"
        />
      )}

      {/* 4. Minaret 1 (Left) (Level 4) */}
      {has("minaret-1") && (
        <g className="animate-fade-in">
          <rect x="95" y="60" width="18" height="120" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="90,60 104,30 118,60" fill="#0f766e" />
        </g>
      )}

      {/* 5. Minaret 2 (Right) (Level 5) */}
      {has("minaret-2") && (
        <g className="animate-fade-in">
          <rect x="307" y="60" width="18" height="120" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="302,60 316,30 330,60" fill="#0f766e" />
        </g>
      )}

      {/* 6. Maktab (Level 6) */}
      {has("maktab") && (
        <g className="animate-fade-in">
          <rect x="55" y="140" width="35" height="40" rx="2" fill="#f1f5f9" stroke="#047857" strokeWidth="1" />
          <polygon points="50,140 72,125 95,140" fill="#047857" />
          <text x="72" y="160" fontSize="7" textAnchor="middle" fill="#047857" fontWeight="bold">مَكْتَب</text>
        </g>
      )}

      {/* 7. Wudu Fountain (Level 7) */}
      {has("fountain") && (
        <g className="animate-fade-in">
          <ellipse cx="210" cy="190" rx="22" ry="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <circle cx="210" cy="188" r="4" fill="#ffffff" />
        </g>
      )}

      {/* 8. Bazaar & Lamps (Level 8) */}
      {has("bazaar") && (
        <g className="animate-fade-in">
          <circle cx="120" cy="140" r="4" fill="#fef08a" />
          <circle cx="300" cy="140" r="4" fill="#fef08a" />
        </g>
      )}

      {/* 9. Crescent Moon Spire (Level 9) */}
      {has("crescent") && (
        <g className="animate-pulse">
          <circle cx="210" cy="50" r="7" fill="#facc15" />
          <circle cx="213" cy="48" r="5.5" fill="#061912" />
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. KIDS FUN PARK SVG SCENE (3 Components)
// ─────────────────────────────────────────────────────────────
function KidsFunParkSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 340 200" className="w-full h-full max-h-[190px] overflow-visible">
      {/* 1. Lawn (Level 1) */}
      {has("lawn") && (
        <g className="animate-fade-in">
          <ellipse cx="170" cy="180" rx="150" ry="25" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
          <text x="50" y="175" fontSize="14">🌷</text>
          <text x="280" y="175" fontSize="14">🌼</text>
        </g>
      )}

      {/* 2. Swing (Level 2) */}
      {has("swing") && (
        <g className="animate-fade-in">
          <line x1="70" y1="175" x2="85" y2="105" stroke="#78350f" strokeWidth="4" />
          <line x1="110" y1="175" x2="95" y2="105" stroke="#78350f" strokeWidth="4" />
          <line x1="80" y1="105" x2="105" y2="105" stroke="#b45309" strokeWidth="5" />
          {/* Swing rope & seat */}
          <line x1="88" y1="105" x2="88" y2="150" stroke="#64748b" strokeWidth="1.5" />
          <line x1="98" y1="105" x2="98" y2="150" stroke="#64748b" strokeWidth="1.5" />
          <rect x="85" y="150" width="16" height="4" rx="1" fill="#dc2626" />
        </g>
      )}

      {/* 3. Ferris Wheel (Level 3) */}
      {has("ferris-wheel") && (
        <g className="animate-fade-in">
          {/* Support Legs */}
          <line x1="240" y1="175" x2="240" y2="90" stroke="#334155" strokeWidth="5" />
          {/* Wheel Ring */}
          <circle cx="240" cy="90" r="50" fill="none" stroke="#eab308" strokeWidth="4" />
          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1="240"
              y1="90"
              x2={240 + 50 * Math.cos((deg * Math.PI) / 180)}
              y2={90 + 50 * Math.sin((deg * Math.PI) / 180)}
              stroke="#ca8a04"
              strokeWidth="2"
            />
          ))}
          {/* Gondolas */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <rect
              key={`g-${i}`}
              x={234 + 50 * Math.cos((deg * Math.PI) / 180)}
              y={84 + 50 * Math.sin((deg * Math.PI) / 180)}
              width="12"
              height="12"
              rx="2"
              fill={i % 2 === 0 ? "#ef4444" : "#3b82f6"}
            />
          ))}
          <circle cx="240" cy="90" r="8" fill="#facc15" />
        </g>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. CASTLE OF KNOWLEDGE SVG SCENE (4 Components)
// ─────────────────────────────────────────────────────────────
function IlmCastleSvgScene({ earnedRewardIds = [] }) {
  const has = (id) => earnedRewardIds.includes(id);

  return (
    <svg viewBox="0 0 340 200" className="w-full h-full max-h-[190px] overflow-visible">
      {/* 1. Gate (Level 1) */}
      {has("gate") && (
        <g className="animate-fade-in">
          <path d="M 120 180 L 120 120 C 120 90, 220 90, 220 120 L 220 180 Z" fill="#64748b" stroke="#334155" strokeWidth="3" />
          <path d="M 145 180 L 145 140 C 145 125, 195 125, 195 140 L 195 180 Z" fill="#0f172a" />
        </g>
      )}

      {/* 2. Pillars (Level 2) */}
      {has("pillars") && (
        <g className="animate-fade-in">
          <rect x="80" y="90" width="22" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <rect x="238" y="90" width="22" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        </g>
      )}

      {/* 3. Library & Rehal (Level 3) */}
      {has("library") && (
        <g className="animate-fade-in">
          <rect x="135" y="100" width="70" height="25" fill="#78350f" stroke="#b45309" strokeWidth="2" />
          <text x="170" y="117" fontSize="13" textAnchor="middle" fill="#ffffff">📖</text>
        </g>
      )}

      {/* 4. Crown Dome (Level 4) */}
      {has("crown-dome") && (
        <g className="animate-bounce">
          <polygon points="120,90 170,40 220,90" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="170" cy="35" r="5" fill="#fef08a" />
        </g>
      )}
    </svg>
  );
}
