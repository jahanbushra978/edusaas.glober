"use client";

import React, { useMemo } from "react";

/**
 * AmbientFloatingOrbs: Soothing Islamic sanctuary light orbs / bubbles rising from the bottom.
 * "নিচ থেকে সুন্দর ছোট ছোট বল উঠবে"
 */
export default function AmbientFloatingOrbs({ count = 14 }) {
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = 6 + ((i * 7) % 14); // 6px to 20px
      const left = ((i * 19 + 7) % 94); // 5% to 95%
      const duration = 9 + ((i * 3) % 8); // 9s to 16s
      const delay = (i * 0.9) % 7; // staggered start
      const isGold = i % 4 === 0;
      const isCyan = i % 2 === 0;

      return {
        id: i,
        size,
        left: `${left}%`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        colorClass: isGold
          ? "bg-gradient-to-t from-amber-400/40 via-amber-300/30 to-amber-200/10 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300/40"
          : isCyan
          ? "bg-gradient-to-t from-[#00d2b8]/40 via-teal-400/30 to-emerald-300/10 shadow-[0_0_12px_rgba(0,210,184,0.5)] border border-[#00d2b8]/40"
          : "bg-gradient-to-t from-emerald-500/30 via-teal-500/20 to-teal-300/10 shadow-[0_0_10px_rgba(16,185,129,0.4)] border border-emerald-400/30",
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes riseUp {
          0% {
            transform: translateY(105vh) translateX(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(50vh) translateX(12px) scale(1);
            opacity: 0.9;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-10vh) translateX(-10px) scale(0.8);
            opacity: 0;
          }
        }
        .orb-particle {
          animation: riseUp linear infinite;
        }
      `,
        }}
      />
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`orb-particle absolute rounded-full ${orb.colorClass}`}
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: orb.left,
            bottom: "-20px",
            animationDuration: orb.duration,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
