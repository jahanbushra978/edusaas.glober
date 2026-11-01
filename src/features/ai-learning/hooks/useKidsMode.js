"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "noor_kids_mode";
const EVENT_NAME = "noor-kids-mode-changed";

/**
 * useKidsMode:
 * Manages Kids Mode state, persistence in localStorage, and parent gate triggers.
 * Ensures zero disruption to adult / standard mode when off.
 */
export function useKidsMode() {
  const [isKidsMode, setIsKidsMode] = useState(false);
  const [hasChosenMode, setHasChosenMode] = useState(false);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Read initial preference from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setHasChosenMode(true);
        setIsKidsMode(stored === "true");
      } else {
        setHasChosenMode(false);
        setIsKidsMode(false);
      }
    } catch {
      // In SSR or restricted storage environments
      setIsKidsMode(false);
      setHasChosenMode(false);
    }

    const handleStorageOrCustomEvent = () => {
      try {
        const updated = localStorage.getItem(STORAGE_KEY);
        if (updated !== null) {
          setHasChosenMode(true);
          setIsKidsMode(updated === "true");
        }
      } catch {}
    };

    window.addEventListener(EVENT_NAME, handleStorageOrCustomEvent);
    window.addEventListener("storage", handleStorageOrCustomEvent);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageOrCustomEvent);
      window.removeEventListener("storage", handleStorageOrCustomEvent);
    };
  }, []);

  const setMode = useCallback((enabled) => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
      setIsKidsMode(enabled);
      setHasChosenMode(true);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
      setIsKidsMode(enabled);
      setHasChosenMode(true);
    }
  }, []);

  const enableKidsMode = useCallback(() => {
    setMode(true);
  }, [setMode]);

  const disableKidsMode = useCallback(() => {
    setMode(false);
    setIsParentGateOpen(false);
  }, [setMode]);

  const toggleKidsMode = useCallback(() => {
    setMode(!isKidsMode);
  }, [isKidsMode, setMode]);

  const resetModeChoice = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasChosenMode(false);
      setIsKidsMode(false);
      setIsParentGateOpen(false);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {}
  }, []);

  const openParentGate = useCallback(() => {
    setIsParentGateOpen(true);
  }, []);

  const closeParentGate = useCallback(() => {
    setIsParentGateOpen(false);
  }, []);

  const startAudio = useCallback(() => {
    setHasStartedAudio(true);
  }, []);

  return {
    isMounted,
    isKidsMode,
    hasChosenMode,
    isParentGateOpen,
    hasStartedAudio,
    enableKidsMode,
    disableKidsMode,
    toggleKidsMode,
    resetModeChoice,
    openParentGate,
    closeParentGate,
    startAudio,
  };
}
