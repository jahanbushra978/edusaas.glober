"use client";

import React, { useState, useEffect } from "react";
import { subscribeVoicePromptState } from "../../lib/voicePrompts";

export default function NuruMascot({
  message,
  dialogue,
  mood,
  size = "md", // 'xs' | 'sm' | 'md' | 'lg' or number in px
  showName,
  className = "",
  showSpeechBubble = true,
  onClick,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Subscribe to voice prompt engine to animate mouth when speaking
  useEffect(() => {
    const unsubscribe = subscribeVoicePromptState((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  // Periodic eye blink effect for realistic character feel
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  const effectiveMessage = message || dialogue;

  // Determine dimensions safely based on size prop
  let dimensions = { width: 110, height: 130 };
  if (typeof size === "number") {
    dimensions = { width: size, height: Math.round(size * 1.16) };
  } else if (size === "xs") {
    dimensions = { width: 44, height: 52 };
  } else if (size === "sm") {
    dimensions = { width: 72, height: 86 };
  } else if (size === "lg") {
    dimensions = { width: 150, height: 180 };
  }

  // By default, only show the name badge on medium/large sizes
  const shouldShowName =
    showName !== undefined
      ? showName
      : typeof size === "number"
      ? size >= 70
      : size === "md" || size === "lg";

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
    >
      {/* Speech Bubble */}
      {showSpeechBubble && effectiveMessage && (
        <div className="mb-2 relative animate-kids-pop">
          <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white border-2 border-emerald-400 text-emerald-950 shadow-md kids-font text-xs sm:text-sm font-extrabold max-w-[260px] sm:max-w-xs text-center leading-snug">
            {effectiveMessage}
          </div>
          {/* Arrow */}
          <div className="w-0 h-0 border-x-6 sm:border-x-8 border-x-transparent border-t-6 sm:border-t-8 border-t-emerald-400 mx-auto -mt-[1px]" />
        </div>
      )}

      {/* Mascot Lantern SVG */}
      <div className="relative animate-kids-float">
        {/* Soft Golden/Emerald Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/30 via-emerald-300/30 to-amber-200/20 blur-xl scale-125 -z-10" />

        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
        >
          {/* Lantern Top Loop & Cap */}
          <circle cx="60" cy="12" r="8" stroke="#D97706" strokeWidth="4" fill="none" />
          <path
            d="M44 22C44 18 76 18 76 22L84 32H36L44 22Z"
            fill="url(#cap-gradient)"
            stroke="#B45309"
            strokeWidth="2.5"
          />

          {/* Glowing Glass Body */}
          <path
            d="M32 34C32 34 20 62 20 86C20 110 38 126 60 126C82 126 100 110 100 86C100 62 88 34 88 34H32Z"
            fill="url(#body-gradient)"
            stroke="#10B981"
            strokeWidth="3.5"
          />

          {/* Inner Light Glow */}
          <ellipse cx="60" cy="85" rx="28" ry="26" fill="url(#inner-glow)" />

          {/* Friendly Rosy Cheeks */}
          <circle cx="40" cy="88" r="6" fill="#FDA4AF" opacity="0.8" />
          <circle cx="80" cy="88" r="6" fill="#FDA4AF" opacity="0.8" />

          {/* Big Expressive Cartoon Eyes */}
          {isBlinking ? (
            <>
              {/* Closed Blinking Eyes */}
              <path d="M42 78Q48 83 54 78" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M66 78Q72 83 78 78" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left Eye */}
              <ellipse cx="48" cy="76" rx="6.5" ry="8" fill="#0F172A" />
              <circle cx="46" cy="73" r="2.5" fill="#FFFFFF" />
              <circle cx="50" cy="78" r="1.2" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="72" cy="76" rx="6.5" ry="8" fill="#0F172A" />
              <circle cx="70" cy="73" r="2.5" fill="#FFFFFF" />
              <circle cx="74" cy="78" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Cheerful Animated Mouth */}
          {isSpeaking ? (
            /* Open Speaking Mouth */
            <path
              d="M52 90Q60 102 68 90Z"
              fill="#E11D48"
              stroke="#881337"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          ) : (
            /* Sweet Smiling Mouth */
            <path
              d="M52 90Q60 98 68 90"
              stroke="#1E293B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Little Waving Hand */}
          <g className="animate-kids-wiggle origin-[20px_80px]">
            <path
              d="M22 84C14 80 10 74 12 70C14 66 18 68 22 74"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="#A7F3D0"
            />
          </g>

          {/* Lantern Bottom Base */}
          <path
            d="M40 126L36 134H84L80 126H40Z"
            fill="url(#cap-gradient)"
            stroke="#B45309"
            strokeWidth="2.5"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="cap-gradient" x1="36" y1="20" x2="84" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="body-gradient" x1="60" y1="34" x2="60" y2="126" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ECFDF5" />
              <stop offset="0.6" stopColor="#D1FAE5" />
              <stop offset="1" stopColor="#A7F3D0" />
            </linearGradient>

            <radialGradient id="inner-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 85) rotate(90) scale(26 28)">
              <stop stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="0.7" stopColor="#FDE047" stopOpacity="0.5" />
              <stop offset="1" stopColor="#FBBF24" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {shouldShowName && (
        <span className="kids-font text-[10px] sm:text-xs font-black text-emerald-800 mt-1 tracking-wider uppercase">
          নূরু (Nuru)
        </span>
      )}
    </div>
  );
}
