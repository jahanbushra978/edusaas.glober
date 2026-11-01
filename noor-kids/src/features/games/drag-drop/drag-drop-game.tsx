"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { dragDropRound, PHASE_01_DEMO_LABEL } from "@/data/mock/phase-01";
import { AnimatedGameScore, GameCelebration, GameCelebrationControl } from "@/features/games/game-celebration";
import { GardenCompanion } from "@/features/games/garden-companion";
import { addCorrectAnswerPoints, isCorrectAnswer } from "@/features/games/game-rules";
import { useGameCelebration } from "@/features/games/use-game-celebration";
import type { GameFeedback } from "@/types/game";

type DragPosition = { x: number; y: number };

export function DragDropGame({
  soundEnabled,
  onToggleSound,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [feedback, setFeedback] = useState<GameFeedback>("idle");
  const [score, setScore] = useState(0);
  const targetRef = useRef<HTMLButtonElement>(null);
  const scoreStarRef = useRef<HTMLSpanElement>(null);
  const movedRef = useRef(false);
  const startRef = useRef<DragPosition | null>(null);
  const celebration = useGameCelebration(soundEnabled, onToggleSound);

  function chooseLetter(id: string) {
    if (placedId) return;
    setSelectedId(id);
    setFeedback("idle");
  }

  function submitLetter(id: string) {
    if (placedId) return;

    if (isCorrectAnswer(id, dragDropRound.targetId)) {
      if (!celebration.triggerCelebration(scoreStarRef.current?.getBoundingClientRect())) return;
      setPlacedId(id);
      setSelectedId(null);
      setFeedback("correct");
      setScore((current) => addCorrectAnswerPoints(current, true));
      return;
    }

    setSelectedId(null);
    setFeedback("try-again");
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || placedId) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = { x: event.clientX, y: event.clientY };
    movedRef.current = false;
    setDraggingId(id);
    setDragPosition({ x: event.clientX, y: event.clientY });
    setSelectedId(id);
    setFeedback("idle");
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (draggingId !== id) return;
    const start = startRef.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
      movedRef.current = true;
    }
    setDragPosition({ x: event.clientX, y: event.clientY });
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (draggingId !== id) return;
    const target = targetRef.current?.getBoundingClientRect();
    const overTarget = target
      ? event.clientX >= target.left &&
        event.clientX <= target.right &&
        event.clientY >= target.top &&
        event.clientY <= target.bottom
      : false;

    setDraggingId(null);
    setDragPosition(null);
    startRef.current = null;

    if (movedRef.current && overTarget) {
      submitLetter(id);
    } else {
      chooseLetter(id);
    }
    movedRef.current = false;
  }

  function resetRound() {
    setSelectedId(null);
    setPlacedId(null);
    setDraggingId(null);
    setDragPosition(null);
    setFeedback("idle");
    setScore(0);
    celebration.resetCelebration();
  }

  const statusMessage =
    feedback === "correct"
      ? "দারুণ মিলিয়েছ! তুমি নিজেই খুঁজে পেয়েছ।"
      : feedback === "try-again"
        ? "কোনো সমস্যা নেই, অক্ষরের গঠনটা আরেকবার দেখে চেষ্টা করো।"
        : selectedId
          ? "এবার নির্বাচিত অক্ষরটি বাক্সে রাখো।"
          : "একটি অক্ষর টেনে বাক্সে রাখো, অথবা অক্ষর বেছে বাক্সে চাপ দাও।";

  return (
    <article className="game-card game-card-drag" aria-label="টেনে মেলাই ডেমো গেম">
      <div className="game-card-topline">
        <div className="game-card-title">
          <span className="game-round-icon round-icon-green"><Icon name="target" size={19} /></span>
          <div><span className="section-kicker">ছোট্ট খেলা · ১ নম্বর</span><h2>চিহ্নটি খুঁজে মেলাও</h2></div>
        </div>
        <div className="game-score-tools">
          <span className="score-pill">
            <span className="score-star-target" ref={scoreStarRef}><Icon name="star" size={15} /></span>
            <AnimatedGameScore score={score} /> পয়েন্ট
          </span>
          <GameCelebrationControl enabled={soundEnabled} onToggle={celebration.toggleSound} />
        </div>
      </div>

      <div className="demo-notice"><span>i</span>{PHASE_01_DEMO_LABEL}</div>
      {celebration.audioError && <p className="celebration-audio-error" role="alert">{celebration.audioError}</p>}
      <div className="game-play-layout">
        <div className="game-play-controls">
          <p className="game-prompt">নিচের অক্ষরগুলোর মধ্যে <bdi className="prompt-letter" lang="ar" dir="rtl">{dragDropRound.targetLetter}</bdi> চিহ্নটি বাক্সে রাখো।</p>

          <button
            ref={targetRef}
            className={`drop-zone ${selectedId ? "drop-zone-ready" : ""} ${feedback === "correct" ? "drop-zone-success" : ""}`}
            type="button"
            onClick={() => selectedId && submitLetter(selectedId)}
            aria-label="নির্বাচিত অক্ষরটি এখানে রাখো"
            aria-describedby="drag-status"
            disabled={Boolean(placedId)}
          >
            {placedId ? (
              <span className="drop-letter arabic-letter" lang="ar" dir="rtl">{dragDropRound.targetLetter}</span>
            ) : (
              <>
                <span className="drop-zone-plus" aria-hidden="true">{selectedId ? "↓" : "+"}</span>
                <span>{selectedId ? "এখানে রাখো" : "এখানে অক্ষরটি রাখো"}</span>
              </>
            )}
          </button>

          <div className="letter-options" role="group" aria-label="ডেমো অক্ষর বেছে নাও">
            {dragDropRound.options.map((option) => {
              const isPlaced = placedId === option.id;
              const isDragging = draggingId === option.id;
              return (
                <button
                  className={[
                    "letter-tile",
                    selectedId === option.id ? "letter-tile-selected" : "",
                    isDragging ? "letter-tile-dragging" : "",
                    isPlaced ? "letter-tile-placed" : "",
                  ].filter(Boolean).join(" ")}
                  key={option.id}
                  type="button"
                  aria-label={`ডেমো অক্ষর ${option.letter}, ${option.name}`}
                  aria-pressed={selectedId === option.id}
                  disabled={Boolean(placedId)}
                  onPointerDown={(event) => beginDrag(event, option.id)}
                  onPointerMove={(event) => moveDrag(event, option.id)}
                  onPointerUp={(event) => finishDrag(event, option.id)}
                  onPointerCancel={() => {
                    setDraggingId(null);
                    setDragPosition(null);
                    startRef.current = null;
                    movedRef.current = false;
                  }}
                  onClick={(event) => {
                    if (event.detail === 0) chooseLetter(option.id);
                  }}
                >
                  <span className="tile-index">{option.number}</span>
                  <span className="arabic-letter tile-letter" lang="ar" dir="rtl">{option.letter}</span>
                  <span className="tile-name">{option.name}</span>
                </button>
              );
            })}
          </div>

          <div
            className={`game-feedback ${feedback === "correct" ? "feedback-success" : feedback === "try-again" ? "feedback-gentle" : ""}`}
            id="drag-status"
            role="status"
            aria-live="polite"
          >
            <span className="feedback-icon" aria-hidden="true">
              <Icon name={feedback === "correct" ? "check" : feedback === "try-again" ? "refresh" : "sparkle"} size={17} />
            </span>
            <span>{statusMessage}</span>
          </div>

          {feedback === "correct" && (
            <button className="button button-green game-next-button" type="button" onClick={resetRound}>
              আবার খেলি <Icon name="refresh" size={17} />
            </button>
          )}
        </div>
        <GardenCompanion feedback={feedback} />
      </div>

      {draggingId && dragPosition && (
        <span
          className="drag-ghost arabic-letter"
          aria-hidden="true"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          lang="ar"
          dir="rtl"
        >
          {dragDropRound.options.find((option) => option.id === draggingId)?.letter}
        </span>
      )}
      <GameCelebration celebration={celebration.celebration} />
    </article>
  );
}
