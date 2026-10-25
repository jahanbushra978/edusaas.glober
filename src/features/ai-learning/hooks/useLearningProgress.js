"use client";

import { useState, useCallback, useEffect } from "react";

// Life regeneration interval: 5 hours in milliseconds
const REGEN_INTERVAL_MS = 5 * 60 * 60 * 1000;
const MAX_LIVES = 5;

export function useLearningProgress() {
  const [completedLessons, setCompletedLessons] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_completed_lessons");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // 3-Star Rating Map: { [lessonId]: 1 | 2 | 3 }
  const [lessonStars, setLessonStars] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_lesson_stars");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [xp, setXp] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return parseInt(localStorage.getItem("noor_learning_xp") || "140", 10);
      } catch {
        return 140;
      }
    }
    return 140;
  });

  const [streak, setStreak] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return parseInt(localStorage.getItem("noor_learning_streak") || "4", 10);
      } catch {
        return 4;
      }
    }
    return 4;
  });

  const [lives, setLives] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLives = parseInt(localStorage.getItem("noor_learning_lives") || "5", 10);
        const lastRegen = parseInt(localStorage.getItem("noor_last_life_regen") || "0", 10);
        
        // Check passive 5-hour regeneration
        if (savedLives < MAX_LIVES && lastRegen > 0) {
          const elapsed = Date.now() - lastRegen;
          const regenerated = Math.floor(elapsed / REGEN_INTERVAL_MS);
          if (regenerated > 0) {
            const updated = Math.min(MAX_LIVES, savedLives + regenerated);
            localStorage.setItem("noor_learning_lives", String(updated));
            const remainder = elapsed % REGEN_INTERVAL_MS;
            localStorage.setItem("noor_last_life_regen", String(Date.now() - remainder));
            return updated;
          }
        }
        return savedLives;
      } catch {
        return MAX_LIVES;
      }
    }
    return MAX_LIVES;
  });

  const [mistakeQueue, setMistakeQueue] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_mistake_queue");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Passive 5-hour life check on regular interval
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkRegeneration = () => {
      setLives((prevLives) => {
        if (prevLives >= MAX_LIVES) return prevLives;
        try {
          const lastRegen = parseInt(localStorage.getItem("noor_last_life_regen") || "0", 10);
          if (lastRegen > 0) {
            const elapsed = Date.now() - lastRegen;
            const regenerated = Math.floor(elapsed / REGEN_INTERVAL_MS);
            if (regenerated > 0) {
              const updated = Math.min(MAX_LIVES, prevLives + regenerated);
              localStorage.setItem("noor_learning_lives", String(updated));
              const remainder = elapsed % REGEN_INTERVAL_MS;
              localStorage.setItem("noor_last_life_regen", String(Date.now() - remainder));
              return updated;
            }
          }
        } catch {}
        return prevLives;
      });
    };

    const interval = setInterval(checkRegeneration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Gain a life (e.g. on 3-star achievement)
  const gainLife = useCallback(() => {
    setLives((prev) => {
      const next = Math.min(MAX_LIVES, prev + 1);
      try {
        localStorage.setItem("noor_learning_lives", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Lose a life on mistake
  const loseLife = useCallback(() => {
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      try {
        localStorage.setItem("noor_learning_lives", String(next));
        if (prev === MAX_LIVES) {
          // First time losing life, start regeneration timer
          localStorage.setItem("noor_last_life_regen", String(Date.now()));
        }
      } catch {}
      return next;
    });
  }, []);

  const refillLives = useCallback(() => {
    setLives(MAX_LIVES);
    try {
      localStorage.setItem("noor_learning_lives", String(MAX_LIVES));
      localStorage.removeItem("noor_last_life_regen");
    } catch {}
  }, []);

  // Complete a lesson, award XP, record stars (1-3), and unlock next
  const completeLesson = useCallback((lessonId, score = 90, stars = 3) => {
    // 1. Mark lesson as completed
    setCompletedLessons((prev) => {
      const next = prev.includes(lessonId) ? prev : [...prev, lessonId];
      try {
        localStorage.setItem("noor_completed_lessons", JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Save 3-Star Rating reflecting actual performance
    setLessonStars((prev) => {
      const next = { ...prev, [lessonId]: stars };
      try {
        localStorage.setItem("noor_lesson_stars", JSON.stringify(next));
      } catch {}
      return next;
    });

    // 3. If achieved 3 Stars, reward +1 Heart (Life)
    if (stars === 3) {
      gainLife();
    }

    // 4. Award XP
    const earnedXp = Math.max(10, Math.round(score / 5));
    setXp((prev) => {
      const nextXp = prev + earnedXp;
      try {
        localStorage.setItem("noor_learning_xp", String(nextXp));
      } catch {}
      return nextXp;
    });
  }, [gainLife]);

  const recordMistake = useCallback((mistakeItem) => {
    setMistakeQueue((prev) => {
      const next = [mistakeItem, ...prev.filter((m) => m.id !== mistakeItem.id)].slice(0, 20);
      try {
        localStorage.setItem("noor_mistake_queue", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const resolveMistake = useCallback((mistakeId) => {
    setMistakeQueue((prev) => {
      const next = prev.filter((m) => m.id !== mistakeId);
      try {
        localStorage.setItem("noor_mistake_queue", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Strict lesson progression: Lesson N unlocked if index === 0 OR previous completed
  const isLessonUnlocked = useCallback(
    (lessonId, index, allLessons = []) => {
      if (index === 0) return true; // First lesson is always unlocked
      if (completedLessons.includes(lessonId)) return true; // Completed lessons can be replayed
      if (allLessons && allLessons.length > index && index > 0) {
        const prevId = allLessons[index - 1].id;
        return completedLessons.includes(prevId);
      }
      return completedLessons.includes(lessonId);
    },
    [completedLessons]
  );

  return {
    completedLessons,
    lessonStars,
    xp,
    streak,
    lives,
    setStreak,
    setLives,
    gainLife,
    loseLife,
    refillLives,
    mistakeQueue,
    completeLesson,
    recordMistake,
    resolveMistake,
    isLessonUnlocked,
  };
}
