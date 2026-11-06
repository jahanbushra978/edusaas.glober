"use client";

import { useState, useEffect, useCallback } from "react";
import { getBuildingJourney } from "../data/buildingRewardData.js";

const PROGRESS_STORAGE_PREFIX = "noor_kids_game_progress_v2_";
const ACTIVE_GAME_KEY = "noor_kids_active_game_v2";

/**
 * Custom Hook: useQuranGameProgress
 * Manages persistent level progress, stars, score, and data-driven building rewards
 * for all children's Quran learning games.
 * 
 * Ensures:
 * - Progress survives browser refresh, close/reopen, and back-navigation.
 * - Building rewards unlock progressively in correct order.
 * - Replaying completed levels never duplicates rewards.
 * - Reusable across all game types.
 */
export function useQuranGameProgress(gameId) {
  const storageKey = PROGRESS_STORAGE_PREFIX + gameId;
  const journey = getBuildingJourney(gameId);

  // Load initial state safely from localStorage
  const loadStoredProgress = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        currentLevelId: 1,
        completedLevels: [],
        earnedRewardIds: [],
        stars: {},
        highScore: 0,
      };
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          currentLevelId: parsed.currentLevelId || 1,
          completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
          earnedRewardIds: Array.isArray(parsed.earnedRewardIds) ? parsed.earnedRewardIds : [],
          stars: parsed.stars && typeof parsed.stars === "object" ? parsed.stars : {},
          highScore: typeof parsed.highScore === "number" ? parsed.highScore : 0,
        };
      }
    } catch (e) {
      console.warn(`[useQuranGameProgress] Error loading progress for ${gameId}:`, e);
    }

    return {
      currentLevelId: 1,
      completedLevels: [],
      earnedRewardIds: [],
      stars: {},
      highScore: 0,
    };
  }, [gameId, storageKey]);

  const [progress, setProgress] = useState(loadStoredProgress);

  // Sync state if gameId changes
  useEffect(() => {
    setProgress(loadStoredProgress());
  }, [gameId, loadStoredProgress]);

  // Persist progress to localStorage
  const saveProgress = useCallback((newProgress) => {
    setProgress(newProgress);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
      } catch (e) {
        console.warn(`[useQuranGameProgress] Error saving progress for ${gameId}:`, e);
      }
    }
  }, [gameId, storageKey]);

  /**
   * Complete a level, record stars, award progressive building component
   * @param {number|string} levelId
   * @param {number} stars (1 to 3)
   * @param {number} earnedScore
   * @param {number} totalLevelsCount
   * @returns {{ newlyEarnedComponent: Object|null, isJourneyComplete: boolean, journeyProgressPercent: number }}
   */
  const completeLevel = useCallback((levelId, stars = 3, earnedScore = 10, totalLevelsCount = journey.totalMilestones) => {
    const numLevelId = Number(levelId);
    const wasAlreadyCompleted = progress.completedLevels.includes(numLevelId);

    // Identify corresponding reward component for this level
    const componentForLevel = journey.components.find((c) => c.level === numLevelId);
    let newlyEarnedComponent = null;

    const updatedEarnedIds = [...progress.earnedRewardIds];
    if (componentForLevel && !updatedEarnedIds.includes(componentForLevel.id)) {
      updatedEarnedIds.push(componentForLevel.id);
      newlyEarnedComponent = componentForLevel;
    }

    const updatedCompletedLevels = wasAlreadyCompleted
      ? progress.completedLevels
      : [...progress.completedLevels, numLevelId];

    // Keep highest stars earned for this level
    const existingStars = progress.stars[numLevelId] || 0;
    const updatedStars = {
      ...progress.stars,
      [numLevelId]: Math.max(existingStars, stars),
    };

    const updatedHighScore = Math.max(progress.highScore, earnedScore);

    const newProgress = {
      currentLevelId: progress.currentLevelId,
      completedLevels: updatedCompletedLevels,
      earnedRewardIds: updatedEarnedIds,
      stars: updatedStars,
      highScore: updatedHighScore,
    };

    saveProgress(newProgress);

    const isJourneyComplete = updatedEarnedIds.length >= journey.totalMilestones;
    const journeyProgressPercent = Math.min(
      100,
      Math.round((updatedEarnedIds.length / journey.totalMilestones) * 100)
    );

    return {
      newlyEarnedComponent,
      isJourneyComplete,
      journeyProgressPercent,
      totalEarnedCount: updatedEarnedIds.length,
    };
  }, [journey, progress, saveProgress]);

  /**
   * Set current active level without modifying completed status
   */
  const setCurrentLevel = useCallback((levelId) => {
    const num = Number(levelId);
    saveProgress({
      ...progress,
      currentLevelId: num,
    });
  }, [progress, saveProgress]);

  /**
   * Explicit reset for this game (requires confirmation)
   */
  const resetGame = useCallback(() => {
    const empty = {
      currentLevelId: 1,
      completedLevels: [],
      earnedRewardIds: [],
      stars: {},
      highScore: 0,
    };
    saveProgress(empty);
  }, [saveProgress]);

  // Derived building journey status
  const earnedComponents = journey.components.filter((c) =>
    progress.earnedRewardIds.includes(c.id)
  );

  const percentComplete = Math.min(
    100,
    Math.round((progress.earnedRewardIds.length / journey.totalMilestones) * 100)
  );

  const isLevelUnlocked = useCallback((levelId, index = 0) => {
    const num = Number(levelId);
    if (num === 1 || index === 0) return true;
    if (progress.completedLevels.includes(num)) return true;
    return progress.completedLevels.includes(num - 1);
  }, [progress.completedLevels]);

  return {
    journey,
    currentLevelId: progress.currentLevelId,
    completedLevels: progress.completedLevels,
    earnedRewardIds: progress.earnedRewardIds,
    earnedComponents,
    stars: progress.stars,
    highScore: progress.highScore,
    percentComplete,
    isLevelUnlocked,
    completeLevel,
    setCurrentLevel,
    resetGame,
  };
}

/**
 * Storage helpers for global active game persistence
 */
export function getStoredActiveGame() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_GAME_KEY);
  } catch {
    return null;
  }
}

export function setStoredActiveGame(gameId) {
  if (typeof window === "undefined") return;
  try {
    if (gameId) {
      localStorage.setItem(ACTIVE_GAME_KEY, gameId);
    } else {
      localStorage.removeItem(ACTIVE_GAME_KEY);
    }
  } catch {}
}

