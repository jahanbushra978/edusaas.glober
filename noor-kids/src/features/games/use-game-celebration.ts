"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { playSuccessChime } from "@/features/games/celebration-sound";

export type CelebrationEvent = {
  id: number;
  targetX: number;
  targetY: number;
};

function getAudioError(error: unknown): string {
  return error instanceof Error ? error.message : "সাফল্যের শব্দটি চালানো যায়নি।";
}

export function useGameCelebration(soundEnabled: boolean, onToggleSound: () => void) {
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const eventIdRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopSound = useCallback(() => {
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") {
      void context.close();
    }
  }, []);

  const triggerCelebration = useCallback((target: DOMRect | undefined): boolean => {
    if (completedRef.current) return false;
    completedRef.current = true;
    setAudioError(null);
    eventIdRef.current += 1;
    setCelebration({
      id: eventIdRef.current,
      targetX: target ? target.left + target.width / 2 - window.innerWidth / 2 : 0,
      targetY: target ? target.top + target.height / 2 - window.innerHeight / 2 : -window.innerHeight / 3,
    });

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCelebration(null), 5000);

    if (soundEnabled) {
      if (typeof window.AudioContext === "undefined") {
        setAudioError("এই ব্রাউজারে সাফল্যের শব্দ চালানো যায় না। চাইলে সাউন্ড বন্ধ করে খেলা চালিয়ে যেতে পারো।");
      } else {
        const context = new window.AudioContext();
        audioContextRef.current = context;
        void playSuccessChime(context)
          .catch((error: unknown) => {
            if (audioContextRef.current === context) {
              setAudioError(`${getAudioError(error)} চাইলে সাউন্ড বন্ধ করে খেলা চালিয়ে যেতে পারো।`);
            }
          })
          .finally(() => {
            if (audioContextRef.current === context) {
              audioContextRef.current = null;
              if (context.state !== "closed") {
                void context.close();
              }
            }
          });
      }
    }

    return true;
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setAudioError(null);
    if (soundEnabled) stopSound();
    onToggleSound();
  }, [onToggleSound, soundEnabled, stopSound]);

  const resetCelebration = useCallback(() => {
    completedRef.current = false;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stopSound();
    setCelebration(null);
    setAudioError(null);
  }, [stopSound]);

  useEffect(() => () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    stopSound();
  }, [stopSound]);

  return {
    audioError,
    celebration,
    resetCelebration,
    soundEnabled,
    toggleSound,
    triggerCelebration,
  };
}
