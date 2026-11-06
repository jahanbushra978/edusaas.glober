"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Volume2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Lock,
  Award,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  stopArabicAudio,
  playCorrectChime,
  playWrongBuzzer,
  playTapSound,
  playStarPopSound,
  playMaShaAllahCelebration,
} from "../../lib/arabicSoundPlayer";
import { audioManager, universalAudioEngine } from "@/lib/quran/audio";
import { fireCelebrationConfetti } from "../../lib/confetti";
import { BEGINNER_PILOT_LESSONS, STAGE_STEPS } from "../../data/beginnerPilotData";

export { BEGINNER_PILOT_LESSONS, STAGE_STEPS };

// Standard Project Progress Storage Keys (Unified with useLearningProgress)
const COMPLETED_LESSONS_KEY = "noor_completed_lessons";
const LESSON_STARS_KEY = "noor_lesson_stars";

export default function BeginnerLearningJourney({
  isOpen = true,
  onClose,
  initialLessonId = "lesson_alif",
  completedLessons: propCompletedLessons,
  lessonStars: propLessonStars,
  onLessonComplete,
}) {
  // ── UNIFIED PROGRESS ARCHITECTURE ──
  // Reads from parent useLearningProgress props, falls back to standard localStorage keys
  const [localCompletedLessons, setLocalCompletedLessons] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(COMPLETED_LESSONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localLessonStars, setLocalLessonStars] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(LESSON_STARS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Effective completed lessons and stars (Union to ensure instantaneous stage-10 unlock)
  const effectiveCompletedLessons = useMemo(() => {
    const merged = new Set([...(propCompletedLessons || []), ...(localCompletedLessons || [])]);
    return Array.from(merged);
  }, [propCompletedLessons, localCompletedLessons]);

  const effectiveLessonStars = useMemo(() => {
    return { ...(localLessonStars || {}), ...(propLessonStars || {}) };
  }, [propLessonStars, localLessonStars]);

  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
  const [currentStageIdx, setCurrentStageIdx] = useState(0); // 0 to 9
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [correctionHint, setCorrectionHint] = useState("");
  const [starsEarned, setStarsEarned] = useState(3);

  // ── NON-POSITIONAL RANDOMIZED ASSESSMENT OPTIONS ──
  const [shuffledQuizOptions, setShuffledQuizOptions] = useState([]);

  // ── GENUINE MASTERY TRACKER: Both essential objectives MUST be mastered ──
  const [masteredObjectives, setMasteredObjectives] = useState({});

  // Active Lesson Object
  const currentLesson = useMemo(() => {
    return BEGINNER_PILOT_LESSONS.find((l) => l.id === activeLessonId) || BEGINNER_PILOT_LESSONS[0];
  }, [activeLessonId]);

  // Helper to pick randomized variants for all objectives of a lesson
  const generateLessonQuestions = useCallback((lesson) => {
    if (lesson?.assessmentObjectives && lesson.assessmentObjectives.length > 0) {
      return lesson.assessmentObjectives.map((obj) => {
        const variants = obj.variants || [];
        const chosenVariant =
          variants.length > 0
            ? variants[Math.floor(Math.random() * variants.length)]
            : {
                id: `${obj.id}_default`,
                questionBn: obj.objectiveTitleBn,
                expectedLetter: lesson.letter,
                options: [lesson.letter, ...lesson.distractorOptions.slice(0, 2)],
                hintBn: lesson.dotsDescriptionBn,
              };
        return {
          ...chosenVariant,
          objectiveId: obj.id,
          objectiveTitleBn: obj.objectiveTitleBn,
          type: obj.type,
        };
      });
    }
    return lesson?.assessment || [];
  }, []);

  const [activeQuestions, setActiveQuestions] = useState(() => {
    const lesson = BEGINNER_PILOT_LESSONS.find((l) => l.id === initialLessonId) || BEGINNER_PILOT_LESSONS[0];
    return generateLessonQuestions(lesson);
  });

  // Dynamically shuffle options to guarantee answers are not dependent on memorizing fixed positions
  useEffect(() => {
    const activeQ = activeQuestions[currentQuizIdx];
    if (activeQ?.options) {
      const opts = [...activeQ.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      setShuffledQuizOptions(opts);
    }
  }, [activeQuestions, currentQuizIdx]);

  // Stop audio on unmount or stage change
  useEffect(() => {
    return () => {
      stopArabicAudio();
    };
  }, []);

  // ── STRICT PROGRESSION GATE: Alif -> Baa -> Taa -> Thaa ──
  const isLessonUnlocked = useCallback(
    (lessonId) => {
      if (lessonId === "lesson_alif") return true; // First lesson is always unlocked
      if (lessonId === "lesson_baa") return effectiveCompletedLessons.includes("lesson_alif");
      if (lessonId === "lesson_taa") return effectiveCompletedLessons.includes("lesson_baa");
      if (lessonId === "lesson_thaa") return effectiveCompletedLessons.includes("lesson_taa");
      return false;
    },
    [effectiveCompletedLessons]
  );

  // ── AUTHENTIC HUMAN QARI PLAYBACK WITH EXPLICIT UNAVAILABLE STATE ──
  const playHumanAudio = useCallback(() => {
    if (!currentLesson) return;
    setIsPlayingAudio(true);
    setAudioError(false);

    try {
      if (universalAudioEngine && typeof universalAudioEngine.playWord === "function") {
        universalAudioEngine.playWord(currentLesson.audioUrl, {
          onStart: () => {
            setIsPlayingAudio(true);
            setAudioError(false);
          },
          onEnd: () => setIsPlayingAudio(false),
          onError: () => {
            if (universalAudioEngine && typeof universalAudioEngine.playLetter === "function") {
              universalAudioEngine.playLetter(currentLesson.letter, {
                onStart: () => setIsPlayingAudio(true),
                onEnd: () => setIsPlayingAudio(false),
                onError: () => {
                  setIsPlayingAudio(false);
                  setAudioError(true);
                },
              });
            } else {
              setIsPlayingAudio(false);
              setAudioError(true);
            }
          },
        });
      } else if (audioManager && typeof audioManager.playCandidateUrls === "function") {
        audioManager.playCandidateUrls([currentLesson.audioUrl], {
          assetId: `pilot_${currentLesson.id}`,
          onStart: () => {
            setIsPlayingAudio(true);
            setAudioError(false);
          },
          onEnd: () => setIsPlayingAudio(false),
          onError: () => {
            setIsPlayingAudio(false);
            setAudioError(true);
          },
        });
      } else {
        setIsPlayingAudio(false);
        setAudioError(true);
      }
    } catch {
      setIsPlayingAudio(false);
      setAudioError(true);
    }
  }, [currentLesson]);

  // Auto-play audio when entering LISTEN stage
  useEffect(() => {
    if (STAGE_STEPS[currentStageIdx]?.id === "LISTEN") {
      const timer = setTimeout(() => {
        playHumanAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStageIdx, playHumanAudio]);

  // ── RESET STATE ON LESSON SWITCH ──
  const switchLesson = (targetLessonId) => {
    if (!isLessonUnlocked(targetLessonId)) {
      playWrongBuzzer();
      const prevLessonName =
        targetLessonId === "lesson_baa"
          ? "আলিফ (ا)"
          : targetLessonId === "lesson_taa"
          ? "বা (ب)"
          : targetLessonId === "lesson_thaa"
          ? "তা (ت)"
          : "পূর্ববর্তী পাঠ";
      toast.info(`আগে ${prevLessonName} হরফটি সফলভাবে শেষ করো, সোনা! তাহলেই পরবর্তী হরফ আনলক হবে!`);
      return;
    }

    const nextLesson = BEGINNER_PILOT_LESSONS.find((l) => l.id === targetLessonId) || BEGINNER_PILOT_LESSONS[0];
    playTapSound();
    stopArabicAudio();
    setActiveLessonId(targetLessonId);
    setActiveQuestions(generateLessonQuestions(nextLesson));
    setCurrentStageIdx(0);
    setTouchCount(0);
    setMistakeCount(0);
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(false);
    setCorrectionHint("");
    setStarsEarned(3);
    setMasteredObjectives({});
    setAudioError(false);
  };

  // Sync with initialLessonId prop if changed from parent
  useEffect(() => {
    if (initialLessonId && initialLessonId !== activeLessonId && isLessonUnlocked(initialLessonId)) {
      switchLesson(initialLessonId);
    }
  }, [initialLessonId, isLessonUnlocked]);

  // ── NAVIGATION BETWEEN 10 STAGES ──
  const goToStage = (idx) => {
    playTapSound();
    stopArabicAudio();
    setCurrentStageIdx(idx);
    setIsAnswerSubmitted(false);
    setSelectedAnswer(null);
  };

  const nextStage = () => {
    playTapSound();
    stopArabicAudio();
    if (currentStageIdx < STAGE_STEPS.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
    }
  };

  // ── STAGE 4: PRACTICE (TOUCH LETTER) ──
  const handleTouchLetter = () => {
    playHumanAudio();
    const nextCount = touchCount + 1;
    setTouchCount(nextCount);
    playStarPopSound(nextCount);

    if (nextCount >= 2) {
      setTimeout(() => {
        nextStage(); // Advance to PLAY stage
      }, 800);
    }
  };

  // ── STAGE 5: PLAY (SHAPE DISCOVERY) ──
  const handlePlayCardPick = (chosenLetter) => {
    if (chosenLetter === currentLesson.letter) {
      playCorrectChime();
      playHumanAudio();
      toast.success(`মাশাআল্লাহ! তুমি সঠিক হরফ ${currentLesson.nameBn} (${currentLesson.letter}) চিনে ফেলেছো!`);
      setTimeout(() => {
        nextStage(); // Advance to ASSESS stage
      }, 900);
    } else {
      playWrongBuzzer();
      setMistakeCount((prev) => prev + 1);
      toast.error(`উঁহু! এটি '${chosenLetter}'। আমাদের দরকার '${currentLesson.letter}'! আবার চেষ্টা করো!`);
    }
  };

  // ── STAGE 6 & 7: ASSESS & CORRECT (GENUINE MASTERY) ──
  const currentQuiz = activeQuestions[currentQuizIdx] || activeQuestions[0] || currentLesson.assessment[0];

  const handleSelectQuizOption = (option) => {
    if (isAnswerSubmitted && isAnswerCorrect) return;

    playTapSound();
    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    const isMatch = option === currentQuiz.expectedLetter;
    setIsAnswerCorrect(isMatch);

    if (isMatch) {
      playCorrectChime();
      playHumanAudio();

      // Mark this specific educational objective as Mastered!
      const objectiveKey = currentQuiz.objectiveId || currentQuiz.id;
      const updatedMastery = {
        ...masteredObjectives,
        [objectiveKey]: true,
      };
      setMasteredObjectives(updatedMastery);

      // Check if more assessment questions remain in this lesson
      if (currentQuizIdx < activeQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuizIdx((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswerSubmitted(false);
          setCorrectionHint("");
        }, 1200);
      } else {
        // Verify ALL essential objectives are mastered
        const allObjectivesPassed = activeQuestions.every(
          (q) => updatedMastery[q.objectiveId || q.id] === true
        );

        if (allObjectivesPassed) {
          // Calculate Motivational Reward Stars (0 mistakes = 3 stars; 1 mistake = 2 stars; 2+ = 1 star)
          const calculatedStars = mistakeCount === 0 ? 3 : mistakeCount === 1 ? 2 : 1;
          setStarsEarned(calculatedStars);

          setTimeout(() => {
            // Advance to REWARD stage (index 8)
            setCurrentStageIdx(8);
            fireCelebrationConfetti();
            playMaShaAllahCelebration();
          }, 1000);
        }
      }
    } else {
      // Mistake handling: Record error, explain specific pedagogical reason
      playWrongBuzzer();
      const newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);
      setCorrectionHint(currentQuiz.hintBn);

      // Jump to CORRECT stage (index 6) to review hint
      setCurrentStageIdx(6);
    }
  };

  // ── STAGE 8: REPEAT / RETRY FROM MISTAKE ──
  const handleRetryAfterCorrection = () => {
    playTapSound();
    setIsAnswerSubmitted(false);
    setSelectedAnswer(null);
    setCorrectionHint("");
    // Re-shuffle options on retry so child must recognize the glyph, not the button position
    const activeQ = activeQuestions[currentQuizIdx];
    if (activeQ?.options) {
      const opts = [...activeQ.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      setShuffledQuizOptions(opts);
    }
    // Return to ASSESS stage (index 5) to master this objective
    setCurrentStageIdx(5);
  };

  // ── STAGE 9 to 10: SAVE UNIFIED PROGRESS & UNLOCK NEXT ──
  const handleClaimRewardAndProgress = () => {
    playTapSound();

    // 1. Update unified completed lessons list
    let updatedCompleted = [...effectiveCompletedLessons];
    if (!updatedCompleted.includes(currentLesson.id)) {
      updatedCompleted.push(currentLesson.id);
    }
    setLocalCompletedLessons(updatedCompleted);

    // 2. Update unified lesson stars map
    const updatedStars = {
      ...effectiveLessonStars,
      [currentLesson.id]: Math.max(effectiveLessonStars[currentLesson.id] || 0, starsEarned),
    };
    setLocalLessonStars(updatedStars);

    // 3. Persist to central localStorage keys
    try {
      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(updatedCompleted));
      localStorage.setItem(LESSON_STARS_KEY, JSON.stringify(updatedStars));
    } catch {
      // ignore
    }

    // 4. Notify parent hook (useLearningProgress)
    if (onLessonComplete) {
      onLessonComplete(currentLesson.id, starsEarned);
    }

    // Advance to STAGE 10: PROGRESS
    setCurrentStageIdx(9);
  };

  if (!isOpen) return null;

  const currentStage = STAGE_STEPS[currentStageIdx];
  const isLessonComplete = effectiveCompletedLessons.includes(currentLesson.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-gradient-to-b from-[#091f16] via-[#071912] to-[#04100b] border-2 border-emerald-500/40 text-white p-4 sm:p-7 shadow-2xl space-y-4 my-auto overflow-hidden">
        
        {/* Ambient Emerald Aura */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER HUD: Close Button & Lesson Info ── */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-emerald-100 flex items-center gap-2">
                <span>ছোটদের প্রথম কুরআন শিক্ষা</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                  নূরানী কায়দা
                </span>
              </h3>
              <p className="text-[11px] text-emerald-400/80">
                ১০-ধাপের খাঁটি শিখন পদ্ধতি • খাঁটি ক্বারীর বিশুদ্ধ উচ্চারণ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapSound();
              stopArabicAudio();
              if (onClose) onClose();
            }}
            className="p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── LESSON SWITCHER PILLS (ALIF, BAA, TAA, THAA) ── */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-2.5 relative z-10">
          {BEGINNER_PILOT_LESSONS.map((l) => {
            const isCurr = l.id === activeLessonId;
            const isUnlocked = isLessonUnlocked(l.id);
            const isDone = effectiveCompletedLessons.includes(l.id);
            const stars = effectiveLessonStars[l.id] || 0;

            return (
              <button
                key={l.id}
                data-lesson-id={l.id}
                type="button"
                onClick={() => switchLesson(l.id)}
                className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                  isCurr
                    ? "bg-gradient-to-r from-emerald-700 to-teal-700 border-amber-400 shadow-lg scale-105"
                    : isUnlocked
                    ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-200 hover:bg-emerald-900/60"
                    : "bg-slate-900/80 border-slate-800 text-slate-500 opacity-70 cursor-not-allowed"
                }`}
              >
                <span className="font-amiri text-2xl font-black text-amber-300">
                  {l.letter}
                </span>
                <div className="text-left">
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>পাঠ {l.lessonNumber}: {l.nameBn}</span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                    {isDone ? (
                      <>
                        {"⭐".repeat(stars)}
                        <span className="text-emerald-300 ml-1">সম্পন্ন</span>
                      </>
                    ) : isUnlocked ? (
                      <span className="text-emerald-400">শিখতে প্রস্তুত</span>
                    ) : (
                      <span className="text-slate-500">তালাবদ্ধ 🔒</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 10-STEP PEDAGOGICAL PROGRESS BAR ── */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 px-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {currentStage.label} — {currentStage.title}
            </span>
            <span>ধাপ {currentStageIdx + 1} / ১০</span>
          </div>

          <div className="w-full h-2 rounded-full bg-emerald-950/80 border border-emerald-800/50 overflow-hidden flex">
            {STAGE_STEPS.map((st, i) => (
              <div
                key={st.id}
                className={`h-full transition-all duration-300 ${
                  i < currentStageIdx
                    ? "bg-emerald-400"
                    : i === currentStageIdx
                    ? "bg-amber-400"
                    : "bg-transparent"
                }`}
                style={{ width: `${100 / STAGE_STEPS.length}%` }}
              />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STAGE-SPECIFIC INTERACTIVE LEARNING CANVAS                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#06150e] border border-emerald-800/60 rounded-3xl p-4 sm:p-6 text-center space-y-4 relative z-10 min-h-[320px] flex flex-col items-center justify-center">
          
          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 1: INTRODUCE (হরফের পরিচয় ও ৩টি মৌলিক বৈশিষ্ট্য)         */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "INTRODUCE" && (
            <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-emerald-900/90 to-teal-800/80 border-2 border-emerald-400/60 shadow-xl flex items-center justify-center mx-auto">
                <span className="font-amiri text-7xl sm:text-8xl font-black text-amber-300 drop-shadow-md">
                  {currentLesson.letter}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  হরফ: {currentLesson.nameBn} ({currentLesson.nameAr})
                </h4>
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
                  {currentLesson.childExplanationBn}
                </p>
              </div>

              {/* 3 Scholarly Maktab Distinctions (Name vs Madd vs Hamzah) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-[11px]">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60">
                  <span className="font-bold text-amber-300 block mb-0.5">📌 হরফের নাম:</span>
                  <span className="text-emerald-100">{currentLesson.letterNameExplanationBn}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60">
                  <span className="font-bold text-amber-300 block mb-0.5">📖 মাদ্দ ভূমিকা:</span>
                  <span className="text-emerald-100">{currentLesson.maddExplanationBn}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60">
                  <span className="font-bold text-amber-300 block mb-0.5">🔍 হামযাহর সাথে পার্থক্য:</span>
                  <span className="text-emerald-100">{currentLesson.hamzahDistinctionBn}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={nextStage}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>পরের ধাপ: মাখরাজ দেখা</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 2: DEMONSTRATE (মাখরাজ ও উচ্চারণ স্থান)                   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "DEMONSTRATE" && (
            <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>মাখরাজ নং {currentLesson.makhrajNumber} — {currentLesson.makhrajZoneBn}</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300">উচ্চারণের খাঁটি নিয়ম:</span>
                  <span className="font-amiri text-3xl font-black text-amber-300">
                    {currentLesson.letter}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
                  {currentLesson.makhrajDescriptionBn}
                </p>
                <div className="pt-1 text-[11px] text-amber-200/90 bg-black/30 p-2 rounded-xl border border-emerald-800/40 flex items-center gap-2">
                  <span>📍 নুকতার নিয়ম:</span>
                  <span>{currentLesson.dotsDescriptionBn}</span>
                </div>
                {currentLesson.sifatSummaryBn && (
                  <div className="pt-1 text-[11px] text-emerald-200/90 bg-black/40 p-2.5 rounded-xl border border-emerald-800/50 text-left space-y-0.5">
                    <span className="font-bold text-amber-300 block">📌 সিফাত (উচ্চারণ বৈশিষ্ট্য):</span>
                    <span>{currentLesson.sifatSummaryBn}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToStage(0)}
                  className="px-4 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-bold hover:bg-emerald-900 cursor-pointer"
                >
                  আগের ধাপ
                </button>
                <button
                  type="button"
                  onClick={nextStage}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>ক্বারীর মুখে শুনি</span>
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 3: LISTEN (খাঁটি ক্বারীর তিলাওয়াত শোনা)                   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "LISTEN" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <div className="text-xs text-emerald-300 font-bold">
                ক্বারী সাহেবের খাঁটি মানুষের মুখের উচ্চারণ মনোযোগ দিয়ে শোনো:
              </div>

              {/* Big Audio Letter Button */}
              <button
                type="button"
                onClick={playHumanAudio}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-4 flex flex-col items-center justify-center mx-auto transition-all cursor-pointer active:scale-95 ${
                  isPlayingAudio
                    ? "bg-gradient-to-tr from-amber-500 to-amber-700 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105"
                    : "bg-gradient-to-tr from-emerald-900 to-teal-800 border-emerald-400 shadow-xl hover:border-amber-400"
                }`}
              >
                <span className="font-amiri text-6xl sm:text-7xl font-black text-white drop-shadow-md">
                  {currentLesson.letter}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-black text-amber-200">
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                  <span>{isPlayingAudio ? "বাজছে..." : "শুনতে ছোঁও"}</span>
                </div>
              </button>

              {/* Explicit Audio Unavailable Error Alert if asset fails */}
              {audioError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>অডিও ফাইল লোড হতে পারেনি। ইন্টারনেট সংযোগ পরীক্ষা করুন।</span>
                  <button
                    type="button"
                    onClick={playHumanAudio}
                    className="underline text-amber-300 font-bold"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}

              <div className="text-[11px] text-emerald-400/80 bg-emerald-950/60 py-1.5 px-3 rounded-full border border-emerald-800/40 inline-block">
                🔊 খাঁটি নূরানী কায়দা তখতী ১ মূল অডিও (Page1-{currentLesson.audioTrackNumber}.m4a)
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={playHumanAudio}
                  className="px-4 py-2 rounded-xl bg-emerald-900/80 text-emerald-200 text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>আবার শোনো</span>
                </button>
                <button
                  type="button"
                  onClick={nextStage}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>অনুশীলন করি</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 4: PRACTICE (শুনো ও মুখে মুখে মাশক)                       */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "PRACTICE" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <p className="text-xs sm:text-sm text-emerald-200 font-bold">
                ক্বারীর অডিও শুনে হরফটি মুখে দুইবার উচ্চারণের অনুশীলন করো।
              </p>

              <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-xs font-black text-amber-300">
                অডিও চালানোর চেষ্টা: {touchCount}/২
              </div>

              <button
                type="button"
                onClick={handleTouchLetter}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-900 border-4 border-amber-400 shadow-xl flex flex-col items-center justify-center mx-auto cursor-pointer active:scale-95 hover:border-amber-300 transition-all group"
              >
                <span className="font-amiri text-6xl sm:text-7xl font-black text-amber-300 drop-shadow-md group-hover:scale-110 transition-transform">
                  {currentLesson.letter}
                </span>
                <span className="text-xs font-extrabold text-white mt-1">
                  🔊 অডিও চালাও ও মুখে অনুশীলন করো
                </span>
              </button>

              {/* Explicit Audio Unavailable Error Alert if asset fails */}
              {audioError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>অডিও ফাইল লোড হতে পারেনি। ইন্টারনেট সংযোগ পরীক্ষা করুন।</span>
                  <button
                    type="button"
                    onClick={playHumanAudio}
                    className="underline text-amber-300 font-bold cursor-pointer"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-[11px] text-emerald-300 space-y-1 text-left">
                <p className="font-semibold text-amber-300">
                  💡 শিক্ষাগত দ্রষ্টব্য: এটি শুনো ও মুখে পড়ার (Listen-and-Repeat) প্রাথমিক মাশক।
                </p>
                <p className="text-emerald-200/90 leading-relaxed">
                  স্ক্রিনে শুধু স্পর্শ বা অডিও শুনলেই মুখে পড়া শুদ্ধ হবে না—ক্বারীর খাঁটি মাখরাজ ও সুর শুনে নিজের মুখে বারবার উচ্চারণ মিলিয়ে পড়তে হবে। স্ক্রিনে স্পর্শের মাধ্যমে অ্যাপ সঠিক মুখের মাখরাজ যাচাই করতে পারে না।
                </p>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 5: PLAY (খেলার ছলে চেনা)                                   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "PLAY" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <p className="text-xs sm:text-sm text-amber-200 font-black">
                {currentLesson.playDiscoveryPrompt}
              </p>

              {/* 3 Choice Cards */}
              <div className="grid grid-cols-3 gap-3">
                {[currentLesson.letter, ...currentLesson.distractorOptions.slice(0, 2)]
                  .sort(() => 0.5 - Math.random())
                  .map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePlayCardPick(opt)}
                      className="h-28 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border-2 border-emerald-600/70 hover:border-amber-400 shadow-md flex items-center justify-center font-amiri text-5xl font-black text-white active:scale-95 transition cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
              </div>

              <p className="text-[11px] text-emerald-400">
                সঠিক হরফটিতে স্পর্শ করলেই মূল্যায়ন পর্বে যাওয়া যাবে!
              </p>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 6: ASSESS (যাচাই ও মূল্যায়ন)                              */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "ASSESS" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold border-b border-emerald-800/50 pb-2">
                <span>প্রশ্ন {currentQuizIdx + 1} / {activeQuestions.length}</span>
                <button
                  type="button"
                  onClick={playHumanAudio}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>শব্দ শোনো</span>
                </button>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
                  {currentQuiz.objectiveTitleBn}
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {currentQuiz.questionBn}
                </h4>
              </div>

              {/* Quiz 3-card Options (Randomized order to prevent positional memorization) */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {(shuffledQuizOptions.length > 0 ? shuffledQuizOptions : currentQuiz.options).map((opt, idx) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = isAnswerSubmitted && opt === currentQuiz.expectedLetter;
                  const isWrong = isAnswerSubmitted && isSelected && !isAnswerCorrect;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuizOption(opt)}
                      className={`h-28 rounded-2xl border-3 flex flex-col items-center justify-center font-amiri text-5xl font-black transition-all cursor-pointer active:scale-95 ${
                        isCorrect
                          ? "bg-emerald-600 border-emerald-400 text-white shadow-lg scale-105"
                          : isWrong
                          ? "bg-rose-900/80 border-rose-500 text-rose-200 animate-shake"
                          : "bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700/80 text-white hover:border-amber-400 shadow-md"
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-emerald-400/80 pt-1">
                ℹ️ বস্তুনিষ্ঠ হরফ ও ধ্বনি চেনার পরীক্ষা। তিলাওয়াত মাশক নুর ক্লাসরুমে উস্তাদের সাথে যাচাই করা হবে।
              </p>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 7: CORRECT (ভুল সংশোধন)                                  */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "CORRECT" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-rose-200">
                  উঁহু, একটু ভুল হয়েছে!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100 bg-rose-950/40 p-3 rounded-2xl border border-rose-800/50 leading-relaxed font-medium">
                  {correctionHint}
                </p>
              </div>

              <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60 text-xs text-amber-200">
                💡 শিক্ষামূলক পরামর্শ: ক্বারীর তিলাওয়াত ভালো করে শুনে ও হরফের বৈশিষ্ট্য মিলিয়ে উত্তর দাও।
              </div>

              <button
                type="button"
                onClick={handleRetryAfterCorrection}
                className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার চেষ্টা করি (Retry)</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 8: REPEAT (মাশক ও পুনরাবৃত্তি)                             */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "REPEAT" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto">
              <h4 className="text-base font-black text-white">
                মাশক ও বিশুদ্ধ উচ্চারণ পাকা করার পালা
              </h4>
              <p className="text-xs text-emerald-200">
                ক্বারীর সাথে সাথে মুখে উচ্চারণ করো:
              </p>

              <button
                type="button"
                onClick={playHumanAudio}
                className="w-32 h-32 rounded-3xl bg-emerald-900 border-2 border-emerald-400 flex flex-col items-center justify-center mx-auto text-amber-300 font-amiri text-6xl cursor-pointer active:scale-95"
              >
                <span>{currentLesson.letter}</span>
                <span className="text-xs font-sans text-white mt-1">শুনুন</span>
              </button>

              <button
                type="button"
                onClick={nextStage}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-md cursor-pointer"
              >
                <span>পুরস্কারের দিকে যাই</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 9: REWARD (মাশাআল্লাহ তারকার পুরস্কার)                      */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "REWARD" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto py-2">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl animate-bounce">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`transition-all duration-300 ${
                      i < starsEarned ? "text-amber-400 scale-110 drop-shadow-lg" : "text-slate-700 opacity-40"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-black text-amber-300">
                  مَا شَاءَ اللَّهُ! মাশাআল্লাহ!
                </h4>
                <p className="text-sm font-bold text-emerald-100">
                  তুমি সফলভাবে "{currentLesson.nameBn}" ({currentLesson.letter}) হরফটি শিখে {starsEarned}টি তারা পেয়েছো!
                </p>
              </div>

              <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-700/60 text-xs text-emerald-200">
                {mistakeCount === 0
                  ? "⭐⭐⭐ অসাধারণ! কোনো ভুল ছাড়া ১ম প্রচেষ্টাতেই সম্পূর্ণ বিশুদ্ধভাবে শিখেছো!"
                  : mistakeCount === 1
                  ? "⭐⭐ খুব ভালো প্রচেষ্টা! ১টি ভুল হলেও তুমি উভয় উদ্দেশ্য নিখুঁতভাবে পূরণ করেছো!"
                  : "⭐ মাশাআল্লাহ! সংশোধনের মাধ্যমে তুমি উভয় উদ্দেশ্য সফলভাবে অর্জন করেছো!"}
              </div>

              <button
                type="button"
                onClick={handleClaimRewardAndProgress}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>পুরস্কার সংরক্ষণ ও অগ্রগতি</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* STAGE 10: PROGRESS (অগ্রগতি ও আনলক)                            */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {currentStage.id === "PROGRESS" && (
            <div className="space-y-4 animate-fade-in max-w-md mx-auto py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto">
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">
                  পাঠ {currentLesson.lessonNumber} সফলভাবে সম্পন্ন হয়েছে!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-200">
                  {currentLesson.id === "lesson_alif"
                    ? "আলহামদুলিল্লাহ! পরবর্তী হরফ 'বা' (ب) এখন তোমার জন্য সফলভাবে আনলক হয়েছে!"
                    : currentLesson.id === "lesson_baa"
                    ? "আলহামদুলিল্লাহ! পরবর্তী হরফ 'তা' (ت) এখন তোমার জন্য সফলভাবে আনলক হয়েছে!"
                    : currentLesson.id === "lesson_taa"
                    ? "আলহামদুলিল্লাহ! পরবর্তী হরফ 'ছা' (ث) এখন তোমার জন্য সফলভাবে আনলক হয়েছে!"
                    : "আলহামদুলিল্লাহ! তুমি সফলভাবে আলিফ, বা, তা ও ছা চারটি হরফই পরিপূর্ণভাবে আয়ত্ত করেছো!"}
                </p>
              </div>

              {/* Next Lesson Button */}
              {currentLesson.id === "lesson_alif" ? (
                <button
                  type="button"
                  onClick={() => switchLesson("lesson_baa")}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>পরবর্তী পাঠ: বা (ب) শুরু করি</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : currentLesson.id === "lesson_baa" ? (
                <button
                  type="button"
                  onClick={() => switchLesson("lesson_taa")}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>পরবর্তী পাঠ: তা (ت) শুরু করি</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : currentLesson.id === "lesson_taa" ? (
                <button
                  type="button"
                  onClick={() => switchLesson("lesson_thaa")}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>পরবর্তী পাঠ: ছা (ث) শুরু করি</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-xs text-amber-200 font-bold space-y-1">
                    <div>🎉 অভিনন্দন! শিক্ষানবিস পাঠ (আলিফ, বা, তা ও ছা) সফলভাবে সম্পন্ন হয়েছে!</div>
                    <div className="text-[11px] text-emerald-300 font-normal">
                      💡 মনে রাখবে: স্ক্রিনের প্রাথমিক পরিচয় ও কুইজ প্রথম ধাপ; বিশুদ্ধ তিলাওয়াত ও নিখুঁত মাখরাজ অর্জনে উস্তাদের সামনে সরাসরি মুখে পড়া আবশ্যক।
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                  >
                    পোর্টাল ড্যাশবোর্ডে ফিরুন
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── FOOTER: HONEST VERIFICATION & TAJWEED INTEGRITY ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400/80 border-t border-emerald-900/60 pt-3 gap-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>অডিও উৎস: নূরানী কায়দা স্টুডিও রেকর্ড (তখতী ১)</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-emerald-400 font-semibold">ব্রাউজার প্লেব্যাক: Verified</span>
            <span className="text-emerald-600">|</span>
            <span className="text-amber-300/90 font-medium">[H] মানুষের শ্রবণ: Pending</span>
            <span className="text-emerald-600">|</span>
            <span className="text-amber-300/90 font-medium">[Q] ক্বারীর সনদ: Pending</span>
          </div>
        </div>

      </div>
    </div>
  );
}
