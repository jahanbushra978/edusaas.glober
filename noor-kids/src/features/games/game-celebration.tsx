"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/icon";
import type { CelebrationEvent } from "@/features/games/use-game-celebration";

const balloonPieces = Array.from({ length: 10 }, (_, index) => index);
const confettiPieces = Array.from({ length: 24 }, (_, index) => index);

export function GameCelebrationControl({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`game-sound-toggle ${enabled ? "is-sound-on" : ""}`}
      type="button"
      aria-pressed={enabled}
      aria-label={`সাফল্যের শব্দ ${enabled ? "বন্ধ" : "চালু"} করো`}
      onClick={onToggle}
    >
      <Icon name={enabled ? "sound" : "mute"} size={16} />
      <span>{enabled ? "শব্দ চালু" : "শব্দ বন্ধ"}</span>
    </button>
  );
}

export function AnimatedGameScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(score);
  const previousScoreRef = useRef(score);

  useEffect(() => {
    const startValue = previousScoreRef.current;
    previousScoreRef.current = score;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setDisplayScore(score));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    const startTime = performance.now();
    const duration = 650;

    function updateScore(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayScore(Math.round(startValue + (score - startValue) * eased));
      if (progress < 1) {
        frame = window.requestAnimationFrame(updateScore);
      }
    }

    frame = window.requestAnimationFrame(updateScore);
    return () => window.cancelAnimationFrame(frame);
  }, [score]);

  return <>{displayScore.toLocaleString("bn-BD")}</>;
}

function CelebrationOverlay({
  celebration,
}: {
  celebration: CelebrationEvent;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusTarget = overlay.querySelector<HTMLElement>(".celebration-message");
    focusTarget?.focus({ preventScroll: true });

    return () => {
      focusTarget?.blur();
    };
  }, []);

  const overlayStyle = {
    "--star-target-x": `${celebration.targetX}px`,
    "--star-target-y": `${celebration.targetY}px`,
  } as CSSProperties;

  return (
    <div
      ref={overlayRef}
      className="game-celebration-overlay"
      style={overlayStyle}
      data-celebration-id={celebration.id}
    >
      <div className="celebration-confetti" aria-hidden="true">
        {confettiPieces.map((piece) => <span key={piece} />)}
      </div>
      <div className="celebration-balloons" aria-hidden="true">
        {balloonPieces.map((piece) => <span key={piece} />)}
      </div>
      <span className="celebration-travel-star" aria-hidden="true">
        <Icon name="star" size={76} />
        <span><Icon name="sparkle" size={22} /><Icon name="sparkle" size={16} /></span>
      </span>
      <div className="celebration-message" tabIndex={-1} role="status" aria-live="polite" aria-atomic="true">
        <span className="celebration-eyebrow">তারকা অর্জন</span>
        <h2>মাশাআল্লাহ! <span aria-hidden="true">🌟</span></h2>
        <p>চমৎকার! তুমি পেরেছো!</p>
        <strong className="celebration-points">+১০ পয়েন্ট</strong>
      </div>
    </div>
  );
}

export function GameCelebration({
  celebration,
}: {
  celebration: CelebrationEvent | null;
}) {
  if (!celebration || typeof document === "undefined") return null;
  return createPortal(<CelebrationOverlay key={celebration.id} celebration={celebration} />, document.body);
}
