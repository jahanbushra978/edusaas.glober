"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { listenFindRound, PHASE_01_AUDIO_NOTICE, PHASE_01_DEMO_LABEL } from "@/data/mock/phase-01";
import { AnimatedGameScore, GameCelebration, GameCelebrationControl } from "@/features/games/game-celebration";
import { GardenCompanion } from "@/features/games/garden-companion";
import { addCorrectAnswerPoints, isCorrectAnswer } from "@/features/games/game-rules";
import { playTonePattern } from "@/features/games/listen-find/tone-player";
import { useGameCelebration } from "@/features/games/use-game-celebration";
import type { GameFeedback } from "@/types/game";

export function ListenFindGame({
  soundEnabled,
  onToggleSound,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  const [feedback, setFeedback] = useState<GameFeedback>("idle");
  const [score, setScore] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const scoreStarRef = useRef<HTMLSpanElement>(null);
  const celebration = useGameCelebration(soundEnabled, onToggleSound);

  async function playPattern(id: string, notes: readonly number[]) {
    if (playingId) return;
    setAudioError(null);
    setPlayingId(id);

    try {
      await playTonePattern(notes);
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : "ডেমো সাউন্ড চালানো যায়নি।");
    } finally {
      setPlayingId(null);
    }
  }

  function chooseAnswer(id: string) {
    if (playingId || feedback === "correct") return;
    const correct = isCorrectAnswer(id, listenFindRound.targetId);
    if (correct && !celebration.triggerCelebration(scoreStarRef.current?.getBoundingClientRect())) return;
    setFeedback(correct ? "correct" : "try-again");
    setScore((current) => addCorrectAnswerPoints(current, correct));
  }

  function resetRound() {
    setFeedback("idle");
    setScore(0);
    setAudioError(null);
    celebration.resetCelebration();
  }

  const target = listenFindRound.options.find((option) => option.id === listenFindRound.targetId);
  if (!target) {
    throw new Error("Listen & Find demo target is missing from its mock round.");
  }

  const statusMessage =
    feedback === "correct"
      ? "চমৎকার! তুমি একই সুরের নকশাটি খুঁজে পেয়েছ।"
      : feedback === "try-again"
        ? "এবার অন্য সুরগুলোও শুনে মিলিয়ে দেখো।"
        : "প্রথমে লক্ষ্য সুর শোনো, তারপর প্রতিটি চিহ্নের সুর মিলিয়ে দেখো।";

  return (
    <article className="game-card game-card-listen" aria-label="শুনে খুঁজি ডেমো গেম">
      <div className="game-card-topline">
        <div className="game-card-title">
          <span className="game-round-icon round-icon-purple"><Icon name="headphones" size={19} /></span>
          <div><span className="section-kicker">ছোট্ট খেলা · ২ নম্বর</span><h2>শুনে একই সুর খুঁজে নাও</h2></div>
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
          <p className="game-prompt">লক্ষ্য সুরটি শোনো। নিচের চিহ্নগুলোর সুর শুনে একইটি বেছে নাও।</p>
          <p className="audio-notice"><Icon name="sound" size={15} /> {PHASE_01_AUDIO_NOTICE}</p>

          <div className="sound-target">
            <div className="sound-target-copy">
              <span className="section-kicker">লক্ষ্য সুর</span>
              <strong>সুরের সংকেত</strong>
              <small>সুরের মিল খুঁজে দেখো</small>
            </div>
            <button
              className={`sound-play-button ${playingId === "target" ? "is-playing" : ""}`}
              type="button"
              onClick={() => playPattern("target", target.notes)}
              disabled={Boolean(playingId)}
              aria-label="লক্ষ্য ডেমো সুরটি চালাও"
            >
              <Icon name={playingId === "target" ? "sound" : "play"} size={20} />
            </button>
            <div className="sound-wave" aria-hidden="true">
              {[14, 24, 35, 18, 30, 13, 23, 34, 17, 26, 13, 21].map((height, index) => (
                <span key={index} style={{ height }} />
              ))}
            </div>
          </div>

          <div className="listen-options" role="group" aria-label="ডেমো সুর শুনে একটি চিহ্ন বেছে নাও">
            {listenFindRound.options.map((option) => (
              <div className="listen-option" key={option.id}>
                <button
                  className={`listen-choice ${feedback === "correct" && option.id === target.id ? "listen-choice-correct" : ""}`}
                  type="button"
                  onClick={() => chooseAnswer(option.id)}
                  disabled={Boolean(playingId) || feedback === "correct"}
                  aria-label={`${option.letter} চিহ্ন বেছে নাও`}
                >
                  <span className="tile-index">{option.number}</span>
                  <span className="arabic-letter tile-letter" lang="ar" dir="rtl">{option.letter}</span>
                  <span className="tile-name">{option.name}</span>
                </button>
                <button
                  className="listen-preview"
                  type="button"
                  onClick={() => playPattern(option.id, option.notes)}
                  disabled={Boolean(playingId)}
                  aria-label={`${option.name}-এর ডেমো সুর শোনো`}
                >
                  <Icon name={playingId === option.id ? "sound" : "play"} size={15} />
                  <span>{playingId === option.id ? "চলছে" : "শোনো"}</span>
                </button>
              </div>
            ))}
          </div>

          {audioError && <p className="audio-error" role="alert">{audioError} সাউন্ড চালাতে চাইলে আপনার ডিভাইসের অডিও সুবিধা পরীক্ষা করুন।</p>}
          <div
            className={`game-feedback ${feedback === "correct" ? "feedback-success" : feedback === "try-again" ? "feedback-gentle" : ""}`}
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
      <GameCelebration celebration={celebration.celebration} />
    </article>
  );
}
