"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Bot,
  ChevronDown,
  Headphones,
  Save,
  Check,
  Zap,
  Compass,
  Search,
  Eye,
  EyeOff,
  Flame,
  BookOpen,
  Sliders,
  Radio,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SHAYKH_REGISTRY,
  DEFAULT_SHAYKH_ID,
  getActiveShaykhId,
  setActiveShaykhId,
  getQariAudioUrl,
} from "@/lib/ai/qari-registry";
import { VoiceAgentEngine } from "@/lib/ai/voice-agent-engine";
import { ALL_SURAHS, JUZ_MAPPING } from "@/lib/quran/quran-meta";
import { getSurahData } from "@/lib/quran/quran-service";
import { nurStorage } from "@/lib/ai/nur-storage";
import { getSavedAIConfig } from "../lib/aiConfigHelper";
import {
  HAFIZI_PARAS,
  getParaTotalPages,
  getHafiziGlobalPage,
  getHafiziLocation,
  getHafiziPageTarget,
  getHafiziLocationForAyah,
  parseHafiziSearchQuery,
} from "@/lib/quran/hafizi-pages";

// Curated popular Surahs for quick access tabs
const POPULAR_SURAHS = [1, 2, 36, 55, 56, 67, 18, 112, 113, 114];

export default function LiveVoiceQuranClass({
  onMakhrajHighlight,
  className = "",
  isFullPage = false,
}) {
  // ── 1. QURAN NAVIGATION & SURAH SELECTION ──
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [activeSurahData, setActiveSurahData] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const pendingTargetAyahRef = useRef(null);
  const autoStartRecitationRef = useRef(false);

  // 114 Surahs & 30 Juz Modal State
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navTab, setNavTab] = useState("all"); // 'all' | 'hafizi' | 'juz' | 'popular' | 'makki' | 'madani'
  const [selectedJuzNumber, setSelectedJuzNumber] = useState(30);

  // Hafizi Quran (15-Line Standard 610 Pages) Selection State
  const [hafiziPara, setHafiziPara] = useState(1);
  const [hafiziPage, setHafiziPage] = useState(1);
  const [hafiziGlobalPageInput, setHafiziGlobalPageInput] = useState("");

  // Microphone Test & Troubleshooting State
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState("unknown"); // 'unknown' | 'granted' | 'denied' | 'not_found'

  // Resume position banner state
  const [savedResumePosition, setSavedResumePosition] = useState(null);

  // ── 2. THREE CORE LEARNING MODES ──
  // 'learn' (পড়া ও মাশক) | 'memorize' (মুখস্থ ও হিফজ) | 'revise' (মুরাযাআ / দাওর)
  const [learningMode, setLearningMode] = useState("learn");
  const [memorizeHidden, setMemorizeHidden] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [repeatLoopCount, setRepeatLoopCount] = useState(1); // 1x | 3x | 5x | 7x
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState(1);
  const [_sessionLokmaCount, setSessionLokmaCount] = useState(0);

  // ── 3. SHAYKH & AUDIO CONTROLS ──
  const [selectedShaykhId, setSelectedShaykhId] = useState(DEFAULT_SHAYKH_ID);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.75 | 1.0 | 1.25
  const [autoLoopEnabled, setAutoLoopEnabled] = useState(true);
  const [activeCompanionTab, setActiveCompanionTab] = useState("feedback"); // 'feedback' | 'makhraj' | 'words' | 'hifz'

  // ── 4. VOICE STATE MACHINE ──
  // 'idle' | 'teacher_prompting' | 'qari_reciting' | 'waiting_for_learner' | 'student_listening' | 'self_reciting' | 'evaluating' | 'feedback_speaking' | 'completed'
  const [classState, setClassState] = useState("idle");
  const [countdown, setCountdown] = useState(0);

  // Recitation & Evaluation States
  const [studentTranscript, setStudentTranscript] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [isSavedToHifz, setIsSavedToHifz] = useState(false);
  const [audioBars, setAudioBars] = useState([20, 35, 60, 45, 75, 50, 30, 20]);
  const [selectedWordForTajweed, setSelectedWordForTajweed] = useState(null);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  // selfReciteMode: student recites alone without Qari demo first
  const [selfReciteMode, setSelfReciteMode] = useState(false);
  // Teacher Voice Persona: 'male_scholarly' (Ustadh Tariq) | 'male_energetic' (Ustadh Salman) | 'female_calm' (Ustadha Fatima)
  const [teacherVoice, setTeacherVoice] = useState(() => {
    try {
      return localStorage.getItem("nur_teacher_voice") || "male_scholarly";
    } catch {
      return "male_scholarly";
    }
  });

  const handleChangeTeacherVoice = (val) => {
    setTeacherVoice(val);
    try {
      localStorage.setItem("nur_teacher_voice", val);
    } catch {}
    if (voiceEngineRef.current) {
      voiceEngineRef.current.gender = val.startsWith("female") ? "female" : "male";
      voiceEngineRef.current.personaId = val;
    }
    toast.success(
      val.startsWith("female")
        ? "উস্তাদা ফাতিমা (নারী কণ্ঠ) সক্রিয় করা হয়েছে"
        : val === "male_energetic"
        ? "উস্তাদ সালমান (প্রাণবন্ত পুরুষ কণ্ঠ) সক্রিয় করা হয়েছে"
        : "উস্তাদ তারিক (গম্ভীর পুরুষ কণ্ঠ) সক্রিয় করা হয়েছে"
    );
  };

  // References
  const voiceEngineRef = useRef(null);
  const audioDemoRef = useRef(null);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const peekTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const studentTranscriptRef = useRef("");
  const voiceActivityDetectedRef = useRef(false);
  const soundEnergyFramesRef = useRef(0);
  const recordingStartTimeRef = useRef(0);

  // ── 5. LOAD RESUME POSITION & PREFERENCES ──
  useEffect(() => {
    try {
      const savedShaykh = getActiveShaykhId();
      if (savedShaykh) setSelectedShaykhId(savedShaykh);

      const savedPos = localStorage.getItem("nur_last_recited_pos");
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (parsed?.surahNumber) {
          setSavedResumePosition(parsed);
        }
      }
    } catch {}

    const handleShaykhChanged = (e) => {
      if (e?.detail?.shaykhId) setSelectedShaykhId(e.detail.shaykhId);
    };
    window.addEventListener("rahmania:shaykh_changed", handleShaykhChanged);
    return () => window.removeEventListener("rahmania:shaykh_changed", handleShaykhChanged);
  }, []);

  // ── 6. FETCH SURAH DATA ON SELECTION ──
  useEffect(() => {
    let isCancelled = false;
    async function loadSurah() {
      setIsLoadingSurah(true);
      try {
        const data = await getSurahData(selectedSurahNumber);
        if (!isCancelled && data) {
          setActiveSurahData(data);
          let targetIdx = 0;
          const targetAyahNum = pendingTargetAyahRef.current;
          if (targetAyahNum !== null && data.ayahs?.length) {
            const foundIdx = data.ayahs.findIndex(
              (a) => a.numberInSurah === targetAyahNum
            );
            if (foundIdx !== -1) targetIdx = foundIdx;
            pendingTargetAyahRef.current = null;
          }
          setCurrentAyahIndex(targetIdx);
          setClassState("idle");
          setEvaluationResult(null);
          setStudentTranscript("");
        }
      } catch (err) {
        console.error("Failed to load surah data:", err);
      } finally {
        if (!isCancelled) setIsLoadingSurah(false);
      }
    }
    loadSurah();
    return () => {
      isCancelled = true;
    };
  }, [selectedSurahNumber]);

  // Current active Ayah
  const currentAyah = useMemo(() => {
    if (!activeSurahData?.ayahs?.length) return null;
    return activeSurahData.ayahs[currentAyahIndex] || activeSurahData.ayahs[0];
  }, [activeSurahData, currentAyahIndex]);

  // Current active Hafizi Page Location (Para, Page, Global Page)
  const currentHafiziLocation = useMemo(() => {
    return getHafiziLocationForAyah(
      selectedSurahNumber,
      currentAyah?.numberInSurah || currentAyahIndex + 1
    );
  }, [selectedSurahNumber, currentAyah, currentAyahIndex]);

  const activeShaykh = useMemo(() => {
    return SHAYKH_REGISTRY.find((q) => q.id === selectedShaykhId) || SHAYKH_REGISTRY[0];
  }, [selectedShaykhId]);

  // ── 7. INITIALIZE VOICE AGENT ENGINE ──
  useEffect(() => {
    const isFemale = teacherVoice.startsWith("female");
    voiceEngineRef.current = new VoiceAgentEngine({
      gender: isFemale ? "female" : "male",
      personaId: teacherVoice,
      emotion: "encouraging",
      language: "bn-BD",
      baseSpeed: 0.92,
      basePitch: 1.0,
      bargeInEnabled: true,
      onStateChange: (state) => {
        if (state === "speaking") {
          startVisualizer();
        } else if (state === "idle") {
          stopVisualizer();
        }
      },
    });

    return () => {
      stopAllAudio();
      stopVisualizer();
    };
  }, [teacherVoice]);

  // ── 8. AUDIO FEEDBACK CHIMES ──
  const playChime = useCallback((type) => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "start") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  }, []);

  // Visualizer Setup with active microphone
  const startVisualizer = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("আপনার ব্রাউজারে অডিও রেকর্ডিং সাপোর্ট নেই। গুগল ক্রোম ব্রাউজার ব্যবহার করুন।");
        return;
      }
      if (micStreamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermissionState("granted");

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const bars = [];
        let maxVal = 0;
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          sum += val;
          if (val > maxVal) maxVal = val;
        }
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i * 2] || 0;
          bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
        }
        setAudioBars(bars);

        const avgVal = sum / Math.max(1, dataArray.length);

        // Highly sensitive human voice energy detection:
        if (maxVal > 12 || avgVal > 5) {
          soundEnergyFramesRef.current = (soundEnergyFramesRef.current || 0) + 1;
          voiceActivityDetectedRef.current = true;
          setIsVoiceDetected(true);
        }

        animFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.warn("Visualizer mic access error:", err);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setMicPermissionState("denied");
        setIsMicModalOpen(true);
        toast.error("মাইক্রোফোনের অনুমতি বন্ধ আছে! ব্রাউজারের সাইট সেটিংসে গিয়ে Mic Allow করুন।");
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        setMicPermissionState("not_found");
        setIsMicModalOpen(true);
        toast.error("কোনো মাইক্রোফোন পাওয়া যায়নি! হেডফোন বা মাইক প্লাগ-ইন করুন।");
      }
    }
  };

  // Dedicated Microphone Self-Test
  const handleTestMicrophone = async () => {
    setIsMicTesting(true);
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        toast.error("আপনার ব্রাউজারে অডিও রেকর্ডিং সাপোর্ট নেই। গুগল ক্রোম ব্রাউজার ব্যবহার করুন।");
        setMicPermissionState("not_supported");
        setIsMicModalOpen(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState("granted");
      playChime("success");
      toast.success("মাশাআল্লাহ! আপনার মাইক্রোফোন সফলভাবে যুক্ত ও সক্রিয় হয়েছে।");

      // Animate waveform for 2.5 seconds
      micStreamRef.current = stream;
      startVisualizer();
      setTimeout(() => {
        stopVisualizer();
      }, 2500);
    } catch (err) {
      console.warn("Microphone test error:", err);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setMicPermissionState("denied");
        setIsMicModalOpen(true);
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        setMicPermissionState("not_found");
        setIsMicModalOpen(true);
      } else {
        setMicPermissionState("error");
        setIsMicModalOpen(true);
      }
    } finally {
      setIsMicTesting(false);
    }
  };

  const stopVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsVoiceDetected(false);
    setAudioBars([20, 20, 20, 20, 20, 20, 20, 20]);
  };

  const stopAllAudio = () => {
    if (audioDemoRef.current) {
      audioDemoRef.current.pause();
      audioDemoRef.current = null;
    }
    if (voiceEngineRef.current) {
      voiceEngineRef.current.interrupt();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  // ── 9. CORE TEACHING & PRACTICE WORKFLOW ──

  // Step 1: Start Ayah Flow (Explain -> Qari Recitation)
  const startAyahTeachingFlow = useCallback(
    (ayahIdx = currentAyahIndex, resetAttempts = false) => {
      stopAllAudio();
      if (!activeSurahData?.ayahs?.length) return;

      const targetAyah = activeSurahData.ayahs[ayahIdx];
      if (!targetAyah) return;

      setCurrentAyahIndex(ayahIdx);
      setClassState("qari_reciting");
      setEvaluationResult(null);
      setStudentTranscript("");
      setIsSavedToHifz(false);
      setSelfReciteMode(false);

      if (resetAttempts) {
        setAttemptCount(1);
        setCurrentRepeatIndex(1);
      }

      // Save current reading position
      saveProgressPosition(selectedSurahNumber, targetAyah.numberInSurah || ayahIdx + 1);

      // Resolve Qari Audio URL
      const ayahNo = targetAyah.numberInSurah || ayahIdx + 1;
      const audioUrl = getQariAudioUrl(selectedShaykhId, selectedSurahNumber, ayahNo);

      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audioDemoRef.current = audio;

      audio.onended = () => {
        // Step 2: Teacher prompts student by voice
        setClassState("teacher_prompting");

        let promptScript = "";
        if (learningMode === "memorize") {
          promptScript = `মাশাআল্লাহ। এবার মন থেকে মুখস্থ তিলাওয়াত করুন, আমি শুনছি।`;
        } else if (learningMode === "revise") {
          promptScript = `বিসমিল্লাহ বলে আয়াতটি সুন্দরভাবে তিলাওয়াত করুন, আমি শুনছি।`;
        } else {
          promptScript = `মাশাআল্লাহ। এবার আপনি ক্বারীর মতো করে শান্তভাবে মুখে পড়ুন, আমি শুনছি।`;
        }

        if (voiceEngineRef.current) {
          voiceEngineRef.current.speak(promptScript, {
            onEnd: () => {
              // Transition delay to prevent echo: Gated Hand-off
              initiateStudentWaitingAndListening(ayahIdx);
            },
            onError: () => {
              initiateStudentWaitingAndListening(ayahIdx);
            },
          });
        } else {
          initiateStudentWaitingAndListening(ayahIdx);
        }
      };

      audio.onerror = () => {
        initiateStudentWaitingAndListening(ayahIdx);
      };

      audio.play().catch(() => {
        initiateStudentWaitingAndListening(ayahIdx);
      });
    },
    [currentAyahIndex, activeSurahData, selectedSurahNumber, selectedShaykhId, playbackSpeed, learningMode]
  );

  // Step 2b: Gated transition buffer (Waiting for Learner -> Listening)
  const initiateStudentWaitingAndListening = (ayahIdx) => {
    setClassState("waiting_for_learner");
    // 700ms buffer so teacher's speech trailing echo disappears completely
    transitionTimeoutRef.current = setTimeout(() => {
      startStudentRecitation(ayahIdx);
    }, 700);
  };

  // Step 3: Open microphone for student recitation
  const startStudentRecitation = useCallback(
    (ayahIdx = currentAyahIndex) => {
      playChime("start");
      setClassState("student_listening");
      setStudentTranscript("");
      studentTranscriptRef.current = "";
      soundEnergyFramesRef.current = 0;
      voiceActivityDetectedRef.current = false;
      setIsVoiceDetected(false);
      recordingStartTimeRef.current = Date.now();
      startVisualizer();

      if (typeof window !== "undefined") {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.lang = "ar-SA";
            rec.continuous = true;
            rec.interimResults = true;

            rec.onresult = (e) => {
              let fullText = "";
              for (let i = 0; i < e.results.length; i++) {
                fullText += e.results[i][0].transcript + " ";
              }
              const clean = fullText.trim();
              setStudentTranscript(clean);
              studentTranscriptRef.current = clean;
              voiceActivityDetectedRef.current = true;
              setIsVoiceDetected(true);
            };

            rec.onerror = (err) => {
              console.warn("SpeechRec notice:", err?.error);
              if (err?.error === "not-allowed" || err?.error === "audio-capture") {
                setMicPermissionState("denied");
                setIsMicModalOpen(true);
                toast.error("মাইক্রোফোনের অনুমতি বন্ধ আছে! ব্রাউজারে অনুমতি দিতে নির্দেশিকা দেখুন।");
                setClassState("idle");
              }
            };

            rec.start();
            recognitionRef.current = rec;
          } catch (e) {
            console.warn("SpeechRec start error:", e);
          }
        }
      }

      // 12-second comfortable countdown timer
      setCountdown(12);
      if (timerRef.current) clearInterval(timerRef.current);

      let secLeft = 12;
      timerRef.current = setInterval(() => {
        secLeft -= 1;
        setCountdown(secLeft);
        if (secLeft <= 0) {
          clearInterval(timerRef.current);
          finishStudentRecitationAndEvaluate(ayahIdx);
        }
      }, 1000);
    },
    [currentAyahIndex, playChime]
  );

  // Step 4: Finish recording and send to AI Evaluation
  const finishStudentRecitationAndEvaluate = async (ayahIdx = currentAyahIndex) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Allow 300ms buffer for pending SpeechRecognition interim/final event to land
    await new Promise((resolve) => setTimeout(resolve, 300));
    recognitionRef.current = null;

    if (!activeSurahData?.ayahs?.length) return;
    const targetAyah = activeSurahData.ayahs[ayahIdx];
    const cleanTranscript = (studentTranscriptRef.current || studentTranscript || "").trim();
    const elapsedSec = (Date.now() - (recordingStartTimeRef.current || Date.now())) / 1000;
    const durationSeconds = Math.max(1, Math.round(elapsedSec * 10) / 10);
    const hasAudioActivity =
      voiceActivityDetectedRef.current ||
      isVoiceDetected ||
      (soundEnergyFramesRef.current || 0) >= 2 ||
      elapsedSec >= 1.0;

    stopVisualizer();

    // Pure silence only: user was literally muted or made zero sound for less than 0.8s
    if (!cleanTranscript && !hasAudioActivity && elapsedSec < 0.8) {
      setClassState("feedback_speaking");
      const spokenScript = "মাইক্রোফোনে কোনো শব্দ পৌঁছায়নি। অনুগ্রহ করে মাইক্রোফোনটি আনমিউট আছে কি না দেখে আবার মুখে বলুন।";
      setEvaluationResult({
        score: 0,
        passed: false,
        unclear: true,
        feedbackBn: spokenScript,
        wordMatches: [],
      });

      if (voiceEngineRef.current) {
        voiceEngineRef.current.speak(spokenScript, {
          onEnd: () => setClassState("idle"),
          onError: () => setClassState("idle"),
        });
      } else {
        setClassState("idle");
      }
      return;
    }

    setClassState("evaluating");
    const aiConfig = getSavedAIConfig();

    try {
      const response = await fetch("/api/ai/nur-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseAr: targetAyah.text,
          verseBn: targetAyah.bengali || "",
          ruleType: "Tajweed & Tilawat",
          ruleTitle: `সূরা ${activeSurahData.bengaliName} - আয়াত ${targetAyah.numberInSurah}`,
          transcribedText: cleanTranscript,
          recordingDuration: durationSeconds,
          hasAudioActivity: hasAudioActivity,
          attemptCount: attemptCount,
          targetScore: 88,
          selfReciteMode: Boolean(selfReciteMode),
          provider: aiConfig.provider,
          model: aiConfig.model,
          apiKey: aiConfig.apiKey,
        }),
      });

      const resJson = await response.json();
      if (resJson.ok && resJson.data) {
        handleEvaluationFeedback(resJson.data, ayahIdx);
      } else {
        throw new Error("Evaluation fallback");
      }
    } catch (fallbackErr) {
      console.warn("AI evaluation fallback triggered:", fallbackErr);
      // Strictly honest deterministic comparison
      const targetWords = (targetAyah.text || "").trim().split(/\s+/).filter(Boolean);
      const cleanNorm = (str) =>
        (str || "")
          .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
          .replace(/[إأآاٱ]/g, "ا")
          .replace(/[يى]/g, "ي")
          .replace(/ة/g, "ه")
          .replace(/[\s\p{P}]/gu, "")
          .trim();
      const normTargets = targetWords.map(cleanNorm);
      const spokenWords = cleanTranscript.split(/\s+/).filter(Boolean);
      const normSpoken = spokenWords.map(cleanNorm);

      let matchedCount = 0;
      const missedWords = [];
      const wordMatches = targetWords.map((word, idx) => {
        const tn = normTargets[idx];
        if (tn && normSpoken.includes(tn)) {
          matchedCount += 1;
          return { word, status: "correct" };
        }
        const hasNear = tn && normSpoken.some((sw) => sw && sw.length >= 3 && tn.length >= 3 && (sw.includes(tn) || tn.includes(sw)));
        if (hasNear) {
          matchedCount += 0.5;
          return { word, status: "near" };
        }
        missedWords.push(word);
        return { word, status: "mistake" };
      });

      const ratio = targetWords.length > 0 ? matchedCount / targetWords.length : 0;
      const score = Math.min(100, Math.round(ratio * 100));
      const passed = score >= 85;

      const missedSample = missedWords.slice(0, 2).join(", ");
      const feedbackBn = passed
        ? `মাশাআল্লাহ! অত্যন্ত চমৎকার ও বিশুদ্ধ তিলাওয়াত হয়েছে। হরফের মাখরাজ এবং তারতীল সুন্দর ছিল।`
        : score < 40
        ? `কিছু শব্দের উচ্চারণে ত্রুটি ছিল। ${missedSample ? `বিশেষ করে "${missedSample}" শব্দগুলোতে একটু নজর দিন।` : ""} আসুন, মনোযোগ দিয়ে আরেকবার শান্তভাবে মাশক করি।`
        : `চেষ্টা সুন্দর হয়েছে। তবে কয়েকটি হরফের মাখরাজ আরও স্পষ্ট করতে হবে। আসুন, আরেকবার ধীরেসুস্থে পড়ি।`;

      handleEvaluationFeedback(
        {
          score,
          passed,
          feedbackBn,
          correctTipBn: passed
            ? "তিলাওয়াতের ধারাবাহিকতা বজায় রাখুন।"
            : "প্রতিটি হরফের মাখরাজ এবং মাদ্দের পরিমাণ ঠিক রাখুন।",
          wordMatches,
          lokmaCount: missedWords.length,
        },
        ayahIdx
      );
    }
  };

  // Step 5: Nur speaks evaluation aloud & advances or repeats
  const handleEvaluationFeedback = (evalData, ayahIdx) => {
    setEvaluationResult(evalData);
    setClassState("feedback_speaking");

    if (!activeSurahData?.ayahs?.length) return;
    const isLastAyah = ayahIdx >= activeSurahData.ayahs.length - 1;
    let spokenScript = "";

    // Track Lokma memory slips in memorize mode
    if (learningMode === "memorize" && !evalData.passed) {
      setSessionLokmaCount((prev) => prev + 1);
    }

    if (evalData.passed) {
      playChime("success");

      // Check repetition loop in memorize mode
      if (learningMode === "memorize" && repeatLoopCount > 1 && currentRepeatIndex < repeatLoopCount) {
        const nextRepeat = currentRepeatIndex + 1;
        setCurrentRepeatIndex(nextRepeat);
        const repeatWords = ["", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম"];
        spokenScript = `মাশাআল্লাহ! বিশুদ্ধ তিলাওয়াত। এবার ${repeatWords[nextRepeat] || nextRepeat} বার মুখস্থ পড়ুন।`;
        if (voiceEngineRef.current) {
          voiceEngineRef.current.speak(spokenScript, {
            onEnd: () => {
              setTimeout(() => {
                startAyahTeachingFlow(ayahIdx, false);
              }, 1000);
            },
          });
        }
        return;
      }

      spokenScript = `মাশাআল্লাহ, মারহাবা! আপনার তিলাওয়াত অত্যন্ত চমৎকার ও বিশুদ্ধ হয়েছে। `;
      if (!isLastAyah) {
        spokenScript += "আসুন, এবার পরবর্তী আয়াতে এগিয়ে যাই।";
      } else {
        spokenScript += `মুবারকবাদ! আপনি সম্পূর্ণ ${activeSurahData.bengaliName} সফলভাবে সম্পন্ন করেছেন!`;
      }
      setAttemptCount(1);
      setCurrentRepeatIndex(1);
    } else {
      // Prioritize specific AI feedback describing exact mistakes
      if (evalData.feedbackBn && evalData.feedbackBn.length > 8) {
        spokenScript = evalData.feedbackBn;
      } else if (attemptCount === 1) {
        spokenScript = `চেষ্টা বেশ ভালো হয়েছে। তবে কিছু হরফের উচ্চারণে একটু মনোযোগ দেওয়া প্রয়োজন। ${evalData.correctTipBn || "হরফের সঠিক উচ্চারণ বজায় রাখুন।"} আসুন, আরেকবার শান্তভাবে মাশক করি।`;
      } else if (attemptCount === 2) {
        spokenScript = "আলহামদুলিল্লাহ, আগের চেয়ে অনেক উন্নতি হচ্ছে! হরফগুলো তাড়াহুড়ো না করে শান্তভাবে পড়ুন। চলুন, আরেকবার চেষ্টা করি।";
      } else {
        spokenScript = "মাশাআল্লাহ, আপনি অনেক ধৈর্য নিয়ে সুন্দর চেষ্টা করেছেন। আসুন, এবার পরবর্তী আয়াতে যাই, এটি আমরা পরে আবার ঝালাই করে নেব।";
      }
      setAttemptCount((prev) => (prev >= 3 ? 1 : prev + 1));
      if (attemptCount >= 3) {
        setCurrentRepeatIndex(1);
      }
    }

    if (voiceEngineRef.current) {
      voiceEngineRef.current.speak(spokenScript, {
        onEnd: () => {
          if (evalData.passed || attemptCount >= 3) {
            if (autoLoopEnabled && !isLastAyah && !selfReciteMode) {
              setTimeout(() => {
                const nextIdx = ayahIdx + 1;
                setCurrentAyahIndex(nextIdx);
                startAyahTeachingFlow(nextIdx, true);
              }, 1200);
            } else {
              setClassState(isLastAyah ? "completed" : "idle");
            }
          } else {
            // Retry current Ayah
            if (autoLoopEnabled && !selfReciteMode) {
              setTimeout(() => {
                startAyahTeachingFlow(ayahIdx, false);
              }, 1400);
            } else {
              setClassState("idle");
            }
          }
        },
      });
    } else {
      setClassState(isLastAyah ? "completed" : "idle");
    }
  };

  // ── 10b. SELF-RECITE MODE: Student recites alone without Qari demo first ──
  // Student clicks dedicated button → mic opens immediately → AI evaluates strictly
  const startSelfReciteMode = useCallback(
    (ayahIdx = currentAyahIndex) => {
      stopAllAudio();
      if (!activeSurahData?.ayahs?.length) return;
      setSelfReciteMode(true);
      setEvaluationResult(null);
      setIsSavedToHifz(false);
      setAttemptCount(1);
      setCurrentRepeatIndex(1);
      setClassState("self_reciting");
      setStudentTranscript("");
      studentTranscriptRef.current = "";
      soundEnergyFramesRef.current = 0;
      voiceActivityDetectedRef.current = false;
      setIsVoiceDetected(false);
      recordingStartTimeRef.current = Date.now();
      startVisualizer();

      // Save position
      const targetAyah = activeSurahData.ayahs[ayahIdx];
      if (targetAyah) {
        saveProgressPosition(selectedSurahNumber, targetAyah.numberInSurah || ayahIdx + 1);
      }

      // Open microphone & Arabic STT
      if (typeof window !== "undefined") {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.lang = "ar-SA";
            rec.continuous = true;
            rec.interimResults = true;
            rec.onresult = (e) => {
              let fullText = "";
              for (let i = 0; i < e.results.length; i++) {
                fullText += e.results[i][0].transcript + " ";
              }
              const clean = fullText.trim();
              setStudentTranscript(clean);
              studentTranscriptRef.current = clean;
              voiceActivityDetectedRef.current = true;
              setIsVoiceDetected(true);
            };
            rec.onerror = (err) => {
              console.warn("SpeechRec error (self-recite):", err?.error);
              if (err?.error === "not-allowed" || err?.error === "audio-capture") {
                setMicPermissionState("denied");
                setIsMicModalOpen(true);
                toast.error("মাইক্রোফোনের অনুমতি বন্ধ আছে! ব্রাউজারে অনুমতি দিতে নির্দেশিকা দেখুন।");
                setClassState("idle");
              }
            };
            rec.start();
            recognitionRef.current = rec;
          } catch (e) {
            console.warn("SpeechRec start error (self-recite):", e);
          }
        }
      }

      // 20-second timer for self-recite (longer — full ayah)
      setCountdown(20);
      if (timerRef.current) clearInterval(timerRef.current);
      let secLeft = 20;
      timerRef.current = setInterval(() => {
        secLeft -= 1;
        setCountdown(secLeft);
        if (secLeft <= 0) {
          clearInterval(timerRef.current);
          finishStudentRecitationAndEvaluate(ayahIdx);
        }
      }, 1000);
    },
    [currentAyahIndex, activeSurahData, selectedSurahNumber]
  );

  // ── 10. HELPER CONTROLS & NAVIGATION ──

  const handleNextAyah = () => {
    if (!activeSurahData?.ayahs?.length) return;
    if (currentAyahIndex < activeSurahData.ayahs.length - 1) {
      const nextIdx = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIdx);
      startAyahTeachingFlow(nextIdx, true);
    } else {
      setClassState("completed");
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      const prevIdx = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIdx);
      startAyahTeachingFlow(prevIdx, true);
    }
  };

  const handleSelectSurahByNumber = (surahNum, targetAyahIdx = 0) => {
    stopAllAudio();
    setSelectedSurahNumber(surahNum);
    setCurrentAyahIndex(targetAyahIdx);
    setIsNavModalOpen(false);
  };

  const handleChangeShaykh = (shaykhId) => {
    setSelectedShaykhId(shaykhId);
    setActiveShaykhId(shaykhId);
    toast.success(`ক্বারী পরিবর্তিত হয়েছে: ${SHAYKH_REGISTRY.find((s) => s.id === shaykhId)?.shortNameBn}`);
  };

  const handleSaveToHifz = () => {
    setIsSavedToHifz(true);
    try {
      nurStorage.queueOfflineRecitation({
        surahNumber: selectedSurahNumber,
        surahName: activeSurahData?.bengaliName,
        ayahNumber: currentAyah?.numberInSurah,
        score: evaluationResult?.score || 90,
        mode: learningMode,
        timestamp: new Date().toISOString(),
      });
    } catch {}
    toast.success(`মাশাআল্লাহ! ${activeSurahData?.bengaliName} (আয়াত ${currentAyah?.numberInSurah})-এর পাঠ ডায়েরিতে সংরক্ষিত হয়েছে।`);
  };

  const handleJumpToHafiziPage = (paraNum, pageNum) => {
    const target = getHafiziPageTarget(paraNum, pageNum);
    if (!target) return;
    stopAllAudio();
    setIsNavModalOpen(false);

    const targetSurahMeta = ALL_SURAHS.find((s) => s.id === target.surah);
    toast.success(
      `📖 হাফেজী কুরআন: পারা ${target.para}, পৃষ্ঠা ${target.paraPage} (মোট পৃষ্ঠা ${target.globalPage}) — সূরা ${targetSurahMeta?.nameBn || target.surah}: আয়াত ${target.ayah}`
    );

    if (selectedSurahNumber === target.surah && activeSurahData?.ayahs?.length) {
      const foundIdx = activeSurahData.ayahs.findIndex((a) => a.numberInSurah === target.ayah);
      const idx = foundIdx !== -1 ? foundIdx : 0;
      setCurrentAyahIndex(idx);
      startAyahTeachingFlow(idx, true);
    } else {
      pendingTargetAyahRef.current = target.ayah;
      autoStartRecitationRef.current = true;
      setSelectedSurahNumber(target.surah);
    }
  };

  // Auto-start recitation if page jump changed the active Surah
  useEffect(() => {
    if (autoStartRecitationRef.current && activeSurahData && !isLoadingSurah) {
      autoStartRecitationRef.current = false;
      startAyahTeachingFlow(currentAyahIndex, true);
    }
  }, [activeSurahData, isLoadingSurah, currentAyahIndex, startAyahTeachingFlow]);

  const saveProgressPosition = (surahNum, ayahNum) => {
    try {
      const pos = {
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahNameBn: activeSurahData?.bengaliName || "",
        surahNameAr: activeSurahData?.nameAr || activeSurahData?.name || "",
        mode: learningMode,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("nur_last_recited_pos", JSON.stringify(pos));
      setSavedResumePosition(pos);
    } catch {}
  };

  // Peek word for 2.5s in memorize mode
  const handleTriggerPeek = () => {
    setIsPeeking(true);
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeeking(false);
    }, 2500);
  };

  // Hands-free Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (classState === "student_listening" || classState === "self_reciting") {
          finishStudentRecitationAndEvaluate(currentAyahIndex);
        } else if (classState === "idle" || classState === "completed") {
          startAyahTeachingFlow(currentAyahIndex, true);
        }
      } else if (e.code === "Enter") {
        if (classState === "student_listening" || classState === "self_reciting") {
          e.preventDefault();
          finishStudentRecitationAndEvaluate(currentAyahIndex);
        }
      } else if (e.key === "s" || e.key === "S") {
        if (classState === "idle" || classState === "completed") {
          e.preventDefault();
          startSelfReciteMode(currentAyahIndex);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextAyah();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevAyah();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        startAyahTeachingFlow(currentAyahIndex, false);
      } else if (e.key === "m" || e.key === "M") {
        if (learningMode === "memorize") {
          e.preventDefault();
          setMemorizeHidden((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [classState, currentAyahIndex, learningMode, startAyahTeachingFlow, startSelfReciteMode]);

  // Hafizi Search Query Parser Match
  const hafiziSearchMatch = useMemo(() => {
    return parseHafiziSearchQuery(searchQuery);
  }, [searchQuery]);

  // Filtered Surahs for Navigation Modal
  const filteredSurahs = useMemo(() => {
    let list = ALL_SURAHS;

    if (navTab === "popular") {
      list = list.filter((s) => POPULAR_SURAHS.includes(s.id));
    } else if (navTab === "makki") {
      list = list.filter((s) => s.type === "Meccan");
    } else if (navTab === "madani") {
      list = list.filter((s) => s.type === "Medinan");
    } else if (navTab === "juz") {
      list = list.filter((s) => s.juz === selectedJuzNumber);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          String(s.id).includes(q) ||
          s.nameBn.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.nameAr.includes(q)
      );
    }

    return list;
  }, [navTab, searchQuery, selectedJuzNumber]);

  // Loading Screen if initial Surah is loading
  if (isLoadingSurah && !activeSurahData) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#07130e] text-emerald-300 font-hind-siliguri rounded-3xl border border-emerald-900/50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-semibold">পবিত্র কুরআনুল কারীমের তিলাওয়াত ও মাশক প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col font-hind-siliguri ${isFullPage ? "min-h-[calc(100vh-5rem)]" : ""} ${className}`}>
      {/* ── TOP CONTROL & SELECTION BAR ── */}
      <div className="bg-[#071912]/95 border border-emerald-900/60 rounded-2xl p-3 sm:p-4 mb-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: 114 Surahs Selector Button & Current Info */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNavModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border border-emerald-500/60 hover:border-emerald-400 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            title="১১৪টি সূরা ও ৩০ পারা নির্বাচন করুন"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              {activeSurahData?.bengaliName} ({activeSurahData?.nameAr || activeSurahData?.name})
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
          </button>

          {/* Ayah Counter Pill */}
          <div className="flex items-center bg-[#040e0a] border border-emerald-900/70 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-semibold gap-1.5 shadow-inner">
            <span className="text-emerald-400 font-bold">আয়াত:</span>
            <span>
              {(currentAyahIndex + 1)} / {activeSurahData?.numberOfAyahs || 7}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">({activeSurahData?.typeBn})</span>
          </div>

          {/* Activity Mode Switcher Pills (Learn / Memorize / Revise) */}
          <div className="flex items-center bg-[#040e0a] p-1 rounded-xl border border-emerald-900/70">
            <button
              type="button"
              onClick={() => {
                setLearningMode("learn");
                setMemorizeHidden(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                learningMode === "learn"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📖 পড়া ও মাশক
            </button>
            <button
              type="button"
              onClick={() => {
                setLearningMode("memorize");
                setMemorizeHidden(true);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                learningMode === "memorize"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🧠 হিফজ / মুখস্থ
            </button>
            <button
              type="button"
              onClick={() => {
                setLearningMode("revise");
                setMemorizeHidden(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                learningMode === "revise"
                  ? "bg-teal-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ মুরাযাআ / দাওর
            </button>
          </div>
        </div>

        {/* Right: Shaykh Selector, Playback Speed, Repetitions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Qari Speed */}
          <div className="flex items-center bg-[#040e0a] border border-emerald-900/60 rounded-xl p-0.5">
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  setPlaybackSpeed(spd);
                  if (audioDemoRef.current) audioDemoRef.current.playbackRate = spd;
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={`তিলাওয়াত গতি ${spd}x`}
              >
                {spd === 1.0 ? "১.০x" : spd === 0.75 ? "০.৭৫x" : "১.২৫x"}
              </button>
            ))}
          </div>

          {/* Shaykh Selector */}
          <div className="flex items-center gap-1.5 bg-[#040e0a] border border-emerald-900/60 rounded-xl px-2.5 py-1">
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedShaykhId}
              onChange={(e) => handleChangeShaykh(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
              title="তিলাওয়াতকারী শায়খ পরিবর্তন করুন"
            >
              {SHAYKH_REGISTRY.map((q) => (
                <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                  {q.shortNameBn}
                </option>
              ))}
            </select>
          </div>

          {/* Ustad AI Voice Persona Selector */}
          <div className="flex items-center gap-1.5 bg-[#040e0a] border border-amber-900/60 rounded-xl px-2 py-1">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={teacherVoice}
              onChange={(e) => handleChangeTeacherVoice(e.target.value)}
              className="bg-transparent text-xs text-amber-200 focus:outline-none cursor-pointer pr-1"
              title="শিক্ষক নূর-এর কণ্ঠ নির্বাচন করুন"
            >
              <option value="male_scholarly" className="bg-slate-900 text-amber-200">
                👨 উস্তাদ তারিক (পুরুষ কণ্ঠ)
              </option>
              <option value="male_energetic" className="bg-slate-900 text-amber-200">
                👨 উস্তাদ সালমান (প্রাণবন্ত পুরুষ)
              </option>
              <option value="female_calm" className="bg-slate-900 text-teal-200">
                👩 উস্তাদা ফাতিমা (নারী কণ্ঠ)
              </option>
            </select>
          </div>

          {/* Memorize Loop Selector (1x, 3x, 5x, 7x) */}
          {learningMode === "memorize" && (
            <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-600/50 rounded-xl px-2.5 py-1 text-xs text-amber-200">
              <span className="text-[11px] font-bold">লুপ:</span>
              <select
                value={repeatLoopCount}
                onChange={(e) => setRepeatLoopCount(Number(e.target.value))}
                className="bg-transparent font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900 text-white">১ বার</option>
                <option value={3} className="bg-slate-900 text-white">৩ বার</option>
                <option value={5} className="bg-slate-900 text-white">৫ বার</option>
                <option value={7} className="bg-slate-900 text-white">৭ বার</option>
              </select>
            </div>
          )}

          {/* Auto Loop Toggle */}
          <button
            type="button"
            onClick={() => setAutoLoopEnabled(!autoLoopEnabled)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              autoLoopEnabled
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
            title="তিলাওয়াত শেষে স্বয়ংক্রিয়ভাবে পরবর্তী আয়াতে যাওয়া"
          >
            <Radio className="w-3 h-3" />
            <span>অটো-লুপ</span>
          </button>

          {/* Microphone Test & Permission Button */}
          <button
            type="button"
            onClick={handleTestMicrophone}
            disabled={isMicTesting}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              micPermissionState === "granted"
                ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-sm"
                : micPermissionState === "denied"
                ? "bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse shadow-md"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-600"
            }`}
            title="মাইক্রোফোন সংযোগ ও অনুমতি পরীক্ষা করুন বা সমস্যা সমাধান করুন"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>
              {isMicTesting
                ? "যাচাই হচ্ছে..."
                : micPermissionState === "granted"
                ? "মাইক সচল ✓"
                : micPermissionState === "denied"
                ? "মাইক বন্ধ ⚠️"
                : "মাইক টেস্ট"}
            </span>
          </button>
        </div>
      </div>

      {/* ── RESUME POSITION BANNER (IF AVAILABLE) ── */}
      {savedResumePosition && savedResumePosition.surahNumber !== selectedSurahNumber && (
        <div className="bg-gradient-to-r from-amber-950/70 via-emerald-950/70 to-slate-950 border border-amber-600/40 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>
              সর্বশেষ পঠিত স্থান: <strong>সূরা {savedResumePosition.surahNameBn} (আয়াত {savedResumePosition.ayahNumber})</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSurahNumber(savedResumePosition.surahNumber);
              setCurrentAyahIndex(Math.max(0, savedResumePosition.ayahNumber - 1));
            }}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow cursor-pointer"
          >
            চালিয়ে যান ➔
          </button>
        </div>
      )}

      {/* ── MAIN WORKSPACE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        {/* LEFT COLUMN: THE ISLAMIC RECITATION SANCTUARY (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* THE SACRED MUSHAF STAGE */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#081812] via-[#05110c] to-[#030906] border-2 border-emerald-800/60 p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[460px] overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent pointer-events-none" />

            {/* Top Stage Header: Current Surah & Navigation Arrows */}
            <div className="w-full flex items-center justify-between z-10 border-b border-emerald-900/40 pb-3">
              <button
                type="button"
                onClick={handlePrevAyah}
                disabled={currentAyahIndex <= 0}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী</span>
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-widest text-emerald-400/80 font-bold">
                    {learningMode === "memorize"
                      ? "স্মৃতি পরীক্ষা • হিফজ মাশক"
                      : learningMode === "revise"
                      ? "মুরাযাআ • দ্রুত ঝালাই"
                      : "তাজবীদ ও তারতীল মাশক"}
                  </span>
                  {currentHafiziLocation && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-300 shadow-sm">
                      📖 ১৫ লাইনের হাফেজী: পারা {currentHafiziLocation.para} • পৃষ্ঠা {currentHafiziLocation.paraPage} (মোট {currentHafiziLocation.globalPage})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {activeSurahData?.bengaliName} ({activeSurahData?.nameAr || ""}) • আয়াত {(currentAyah?.numberInSurah || currentAyahIndex + 1)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextAyah}
                disabled={currentAyahIndex >= (activeSurahData?.ayahs?.length || 1) - 1}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>পরবর্তী</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bismillah Header (Except Surah At-Tawbah) */}
            {selectedSurahNumber !== 9 && currentAyahIndex === 0 && (
              <div className="my-2 text-center text-emerald-400/70 font-amiri text-lg tracking-wider">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
            )}

            {/* THE MAJESTIC QURANIC VERSE */}
            <div className="my-auto text-center w-full max-w-4xl px-2 z-10 flex flex-col items-center">
              {/* Memorize Mode: Word Blur / Hidden Toggle */}
              {learningMode === "memorize" && (
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMemorizeHidden(!memorizeHidden)}
                    className="px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    {memorizeHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{memorizeHidden ? "আয়াত দেখুন" : "আয়াত লুকান (স্মৃতি পরীক্ষা)"}</span>
                  </button>
                  {memorizeHidden && (
                    <button
                      type="button"
                      onClick={handleTriggerPeek}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                      title="২.৫ সেকেন্ডের জন্য একঝলক দেখুন"
                    >
                      একঝলক দেখুন ({isPeeking ? "প্রকাশিত" : "Peek"})
                    </button>
                  )}
                </div>
              )}

              {/* Arabic Verse Calligraphy — with word-level click inspection and mistake highlighting */}
              <div
                dir="rtl"
                className={`font-amiri text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.8] sm:leading-[2.0] tracking-wide transition-all duration-300 drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)] select-none flex flex-wrap justify-center items-center gap-x-2.5 gap-y-2 relative ${
                  learningMode === "memorize" && memorizeHidden && !isPeeking
                    ? "filter blur-md opacity-30 scale-95"
                    : "filter-none opacity-100 scale-100"
                }`}
              >
                {/* Glowing Sacred Ambient Aura behind active Ayah */}
                <div
                  className={`absolute -inset-8 rounded-full bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 blur-2xl pointer-events-none transition-all duration-700 ${
                    classState === "student_listening" ? "opacity-100 scale-105" : "opacity-30 scale-100"
                  }`}
                />

                {evaluationResult?.wordMatches?.length > 0
                  ? evaluationResult.wordMatches.map((item, idx) => (
                      <span
                        key={idx}
                        onClick={() => setSelectedWordForTajweed({ word: item.word, status: item.status })}
                        title={item.status === "correct" ? "সঠিক ✓" : item.status === "near" ? "কাছাকাছি ≈" : "ভুল ✕"}
                        className={`px-2 py-0.5 rounded-lg transition-all mx-0.5 cursor-pointer ${
                          item.status === "correct"
                            ? "text-emerald-200 bg-emerald-950/30 hover:bg-emerald-900/50"
                            : item.status === "near"
                            ? "text-amber-300 bg-amber-950/50 border-b-2 border-amber-400 hover:bg-amber-900/60"
                            : "text-rose-300 bg-rose-950/80 border-2 border-rose-500/80 font-black shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                        }`}
                      >
                        {item.word}
                      </span>
                    ))
                  : (currentAyah?.text || "").split(/\s+/).filter(Boolean).map((word, wIdx) => (
                      <span
                        key={wIdx}
                        onClick={() => setSelectedWordForTajweed({ word, index: wIdx })}
                        title="তাজবীদ ও উচ্চারণ নির্দেশিকার জন্য ক্লিক করুন"
                        className={`px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-200 hover:text-amber-300 hover:bg-emerald-900/40 hover:scale-105 ${
                          selectedWordForTajweed?.word === word
                            ? "text-amber-300 bg-emerald-950/80 ring-2 ring-amber-400/80 shadow-md"
                            : "text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100"
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 mr-2 rounded-full border border-amber-500/70 bg-amber-950/80 text-amber-300 font-bold text-base sm:text-lg align-middle shadow-md font-sans">
                  {currentAyah?.numberInSurah || currentAyahIndex + 1}
                </span>
              </div>

              {/* Interactive Word Makhraj & Tajweed Popover Card */}
              {selectedWordForTajweed && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#03140d]/95 border border-emerald-500/50 shadow-2xl flex items-center justify-between gap-4 max-w-md w-full animate-fade-in z-20">
                  <div className="flex items-center gap-3">
                    <span className="font-amiri text-2xl font-bold text-amber-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-700/50">
                      {selectedWordForTajweed.word}
                    </span>
                    <div className="text-left">
                      <p className="text-xs text-emerald-300 font-semibold">নির্বাচিত শব্দ • মাখরাজ ও তাজবীদ</p>
                      <p className="text-[11px] text-slate-300">হরফগুলো শান্তভাবে মাখরাজ অনুযায়ী স্পষ্ট উচ্চারণ করুন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCompanionTab("makhraj");
                        if (onMakhrajHighlight) onMakhrajHighlight("halq");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all cursor-pointer"
                    >
                      মাখরাজ গাইড
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWordForTajweed(null)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bengali Meaning */}
              <p
                className={`text-slate-300 text-sm sm:text-base mt-4 font-normal leading-relaxed max-w-2xl mx-auto transition-opacity duration-300 ${
                  learningMode === "memorize" && memorizeHidden && !isPeeking ? "opacity-20" : "opacity-100"
                }`}
              >
                {currentAyah?.bengali || ""}
              </p>
            </div>

            {/* LIVE AUDIO VISUALIZER SPECTRUM AURA */}
            <div className="w-full flex flex-col items-center justify-center my-3 z-10">
              <div className="flex items-center gap-1.5 h-9 mb-1">
                {audioBars.map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      classState === "student_listening"
                        ? "bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        : classState === "qari_reciting"
                        ? "bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                        : "bg-slate-700/60"
                    }`}
                  />
                ))}
              </div>

              {/* Dynamic State Badge */}
              <div className="text-xs font-bold text-center">
                {classState === "qari_reciting" && (
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>{activeShaykh.shortNameBn} তিলাওয়াত করছেন... মনোযোগ দিয়ে শুনুন</span>
                  </span>
                )}
                {classState === "teacher_prompting" && (
                  <span className="text-teal-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>উস্তাদ নূর নির্দেশনা দিচ্ছেন...</span>
                  </span>
                )}
                {classState === "waiting_for_learner" && (
                  <span className="text-yellow-400 font-extrabold flex items-center gap-1.5 animate-bounce">
                    <Zap className="w-3.5 h-3.5" />
                    <span>প্রস্তুত হোন (মাইক্রোফোন চালু হচ্ছে)...</span>
                  </span>
                )}
                {(classState === "student_listening" || classState === "self_reciting") && (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`${classState === "self_reciting" ? "text-amber-300" : "text-emerald-300"} font-extrabold flex items-center gap-1.5 animate-pulse`}>
                      <Mic className={`w-4 h-4 ${classState === "self_reciting" ? "text-amber-400" : "text-emerald-400"}`} />
                      <span>
                        {classState === "self_reciting"
                          ? `নিজে তিলাওয়াত করুন • সরাসরি AI যাচাই হবে (সময়: ${countdown}s)`
                          : `মাইক সক্রিয় • মুখে তিলাওয়াত করুন (সময়: ${countdown}s)`}
                      </span>
                    </span>
                    {isVoiceDetected ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${classState === "self_reciting" ? "bg-amber-950 border-amber-500 text-amber-300" : "bg-emerald-950 border-emerald-500 text-emerald-300"} border text-xs font-extrabold shadow-sm animate-pulse`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${classState === "self_reciting" ? "bg-amber-400" : "bg-emerald-400"} animate-ping`} />
                        <span>আপনার কণ্ঠ শোনা যাচ্ছে (ভয়েস রেকর্ড হচ্ছে 🟢)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        (মাইক্রোফোনের কাছে এসে স্বাভাবিক আওয়াজে সম্পূর্ণ আয়াতটি পড়ুন)
                      </span>
                    )}
                  </div>
                )}
                {classState === "evaluating" && (
                  <span className="text-indigo-300 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>তাজবীদ ও মাখরাজ বিশ্লেষণ করা হচ্ছে...</span>
                  </span>
                )}
                {classState === "feedback_speaking" && (
                  <span className="text-teal-200 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>উস্তাদ নূর মূল্যায়ন প্রকাশ করছেন...</span>
                  </span>
                )}
                {classState === "idle" && (
                  <span className="text-slate-400">
                    নিচের বাটনে চাপ দিয়ে সরাসরি নিজে পড়ুন অথবা ক্বারীর সাথে মাশক করুন
                  </span>
                )}
                {classState === "completed" && (
                  <span className="text-emerald-400 font-bold">
                    আলহামদুলিল্লাহ! সম্পূর্ণ মাশক সম্পন্ন হয়েছে।
                  </span>
                )}
              </div>
            </div>

            {/* PRIMARY ACTION BUTTONS */}
            <div className="w-full flex items-center justify-center gap-3 pt-3 border-t border-emerald-900/40 z-10 flex-wrap">
              {/* Primary Mic Recite / Action Button */}
              {(classState === "student_listening" || classState === "self_reciting") ? (
                <button
                  type="button"
                  onClick={() => finishStudentRecitationAndEvaluate(currentAyahIndex)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-xl flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer animate-pulse ring-4 ring-rose-500/30"
                >
                  <MicOff className="w-5 h-5" />
                  <span>পড়া শেষ হয়েছে • AI যাচাই করুন (Enter)</span>
                </button>
              ) : (
                <>
                  {/* Button 1: Dedicated Self-Recite & AI Test Button (The user's blue circled spot) */}
                  <button
                    type="button"
                    onClick={() => startSelfReciteMode(currentAyahIndex)}
                    className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs sm:text-sm font-extrabold shadow-xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/50 hover:shadow-amber-500/20"
                    title="ক্বারীর অডিও ছাড়া সরাসরি নিজে মুখে পড়ে AI-কে দিয়ে যাচাই করান"
                  >
                    <Mic className="w-4.5 h-4.5 fill-current text-slate-950" />
                    <span>নিজে পড়ুন ও যাচাই করুন</span>
                  </button>

                  {/* Button 2: Full Teaching & Practice Flow with Qari */}
                  <button
                    type="button"
                    onClick={() => startAyahTeachingFlow(currentAyahIndex, true)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-extrabold shadow-xl flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-500/30"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {learningMode === "memorize"
                        ? "হিফজ মাশক শুরু করুন (Space)"
                        : "তিলাওয়াত ও মাশক শুরু করুন (Space)"}
                    </span>
                  </button>
                </>
              )}

              {/* Replay Qari Reference */}
              <button
                type="button"
                onClick={() => startAyahTeachingFlow(currentAyahIndex, false)}
                className="px-4 py-3.5 rounded-2xl bg-[#040e0a] border border-emerald-800/80 hover:bg-emerald-950 text-emerald-300 text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                title="শায়খের তিলাওয়াত পুনরায় শুনুন (R)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">শুনুন (R)</span>
              </button>

              {/* Stop / Cancel Safety Button */}
              {(classState !== "idle" && classState !== "completed") && (
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    stopVisualizer();
                    setClassState("idle");
                    setSelfReciteMode(false);
                    toast.info("তিলাওয়াত স্থগিত করা হয়েছে");
                  }}
                  className="px-3 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  title="থামুন ও রিসেট করুন"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">থামুন</span>
                </button>
              )}
            </div>
          </div>

          {/* STUDENT LIVE TRANSCRIPTION BILLBOARD */}
          {studentTranscript && (
            <div className="bg-[#05110c] border border-emerald-900/60 rounded-2xl p-4 shadow-lg flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                <span>আপনার মুখের তিলাওয়াত (লাইভ ট্রান্সক্রিপশন):</span>
              </span>
              <p
                dir="rtl"
                className="text-right font-amiri text-2xl text-amber-100 font-semibold leading-relaxed"
              >
                {studentTranscript}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COMPANION DASHBOARD & FEEDBACK (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* TAB HEADERS */}
          <div className="flex items-center bg-[#071912] border border-emerald-900/60 rounded-2xl p-1 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveCompanionTab("feedback")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeCompanionTab === "feedback"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>মূল্যায়ন</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCompanionTab("words")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeCompanionTab === "words"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>শব্দ বিশ্লেষণ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCompanionTab("makhraj")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeCompanionTab === "makhraj"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>মাখরাজ</span>
            </button>
          </div>

          {/* TAB 1: EVALUATION & TAJWEED FEEDBACK */}
          {activeCompanionTab === "feedback" && (
            <div className="bg-[#071912]/90 border border-emerald-900/60 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>উস্তাদ নূর-এর মূল্যায়ন</span>
                </h3>
                {attemptCount > 1 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300">
                    চেষ্টা নং: {attemptCount}
                  </span>
                )}
              </div>

              {evaluationResult ? (
                <div className="space-y-4">
                  {/* Score Ring / Badge */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#040e0a] border border-emerald-900/80">
                    <div>
                      <span className="text-xs text-slate-400">তাজবীদ বিশুদ্ধতা স্কোর</span>
                      <p className="text-2xl font-black text-amber-300">
                        {evaluationResult.score ?? 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold inline-block shadow ${
                          evaluationResult.passed
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {evaluationResult.passed ? "উত্তীর্ণ (Passed)" : "পুনঃপ্রচেষ্টা প্রয়োজন"}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        লুকমা / ভুল: {evaluationResult.lokmaCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Verbal Feedback Quote */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-100 leading-relaxed">
                    <p className="font-semibold text-emerald-300 mb-1">শিক্ষকের মন্তব্য:</p>
                    <p>{evaluationResult.feedbackBn}</p>
                    {evaluationResult.correctTipBn && (
                      <p className="mt-2 text-amber-200 bg-amber-950/60 p-2 rounded-xl border border-amber-700/50">
                        💡 <strong>সংশোধনী টিপ:</strong> {evaluationResult.correctTipBn}
                      </p>
                    )}
                  </div>

                  {/* Save to Hifz Record Button */}
                  <button
                    type="button"
                    onClick={handleSaveToHifz}
                    disabled={isSavedToHifz}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow ${
                      isSavedToHifz
                        ? "bg-slate-800 text-emerald-400 border border-emerald-700"
                        : "bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white"
                    }`}
                  >
                    {isSavedToHifz ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>হিফজ ডায়েরিতে সংরক্ষিত</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>হিফজ ডায়েরিতে সংরক্ষণ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <Award className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>তিলাওয়াত সম্পন্ন হলে এখানে আপনার তাজবীদ স্কোর, ভুল চিহ্নিতকরণ ও শিক্ষকের দিকনির্দেশনা প্রদর্শিত হবে।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORD-BY-WORD TAJWEED BREAKDOWN */}
          {activeCompanionTab === "words" && (
            <div className="bg-[#071912]/90 border border-emerald-900/60 rounded-3xl p-5 shadow-xl flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-emerald-900/40 pb-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>শব্দে শব্দে বিশ্লেষণ (Word Breakdown)</span>
              </h3>

              {evaluationResult?.wordMatches?.length ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">প্রতিটি শব্দের উচ্চারণ ফলাফল:</p>
                  <div className="flex flex-wrap gap-2" dir="rtl">
                    {evaluationResult.wordMatches.map((item, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 rounded-xl font-amiri text-lg font-bold shadow-sm flex items-center gap-1.5 border ${
                          item.status === "correct"
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                            : item.status === "near"
                            ? "bg-amber-950/80 border-amber-500 text-amber-200"
                            : "bg-rose-950/80 border-rose-500 text-rose-200"
                        }`}
                      >
                        <span>{item.word}</span>
                        <span className="text-[10px] font-sans font-normal opacity-80">
                          {item.status === "correct" ? "✓" : item.status === "near" ? "≈" : "✕"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : currentAyah?.words?.length ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {currentAyah.words.map((w, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedWordForTajweed(w);
                        if (w.tajweed && onMakhrajHighlight) {
                          onMakhrajHighlight("lisan");
                        }
                      }}
                      className="p-2.5 rounded-xl bg-[#040e0a] border border-emerald-900/60 hover:border-emerald-500 flex items-center justify-between text-xs cursor-pointer transition-all"
                    >
                      <span className="font-amiri text-lg font-bold text-amber-200">{w.ar}</span>
                      <div className="text-right">
                        <p className="text-slate-200 font-semibold">{w.bn}</p>
                        <span className="text-[10px] text-emerald-400 font-medium">{w.tajweed || "মাশক"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  তিলাওয়াত সম্পন্ন করার পর শব্দের বিস্তারিত নির্ভুলতা এখানে দেখা যাবে।
                </p>
              )}
            </div>
          )}

          {/* TAB 3: MAKHRAJ GUIDE SHORTCUT */}
          {activeCompanionTab === "makhraj" && (
            <div className="bg-[#071912]/90 border border-emerald-900/60 rounded-3xl p-5 shadow-xl flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-emerald-900/40 pb-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>১৭টি মাখরাজের তাৎক্ষণিক নির্দেশিকা</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                আরবি হরফসমূহ বিশুদ্ধভাবে আদায়ের জন্য ৫টি প্রধান অঙ্গের ১৭টি মাখরাজ লক্ষ্য করুন:
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: "halq", name: "১. হলক্ব (কণ্ঠনালী)", letters: "ء هـ ع ح غ خ" },
                  { id: "lisan", name: "২. লিসান (জিহ্বা)", letters: "ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث" },
                  { id: "shafatan", name: "৩. শাফাতাইন (উভয় ওষ্ঠ)", letters: "ف م ب و" },
                  { id: "khayshum", name: "৪. খাইশুম (নাসিকামূল - গুন্নাহ)", letters: "نّ مّ (ওয়াজিব গুন্নাহ)" },
                  { id: "jawf", name: "৫. জাওফ (মুখের খালি জায়গা - মাদ্দ)", letters: "ا و ي (মাদ্দের হরফ)" },
                ].map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => {
                      if (onMakhrajHighlight) onMakhrajHighlight(z.id);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-[#040e0a] border border-emerald-900/60 hover:border-emerald-500 hover:bg-emerald-950/60 transition-all flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <span className="font-semibold text-emerald-300">{z.name}</span>
                    <span className="font-amiri text-amber-200 text-sm font-bold">{z.letters}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK SURAH AYAH JUMP LIST */}
          <div className="bg-[#071912]/90 border border-emerald-900/60 rounded-3xl p-4 shadow-xl flex flex-col space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>সূরার আয়াত তালিকা (এক ক্লিকে জাম্প করুন):</span>
            </span>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
              {Array.from({ length: activeSurahData?.numberOfAyahs || 7 }, (_, i) => {
                const isCurrent = currentAyahIndex === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentAyahIndex(i);
                      startAyahTeachingFlow(i, true);
                    }}
                    title={`আয়াত ${i + 1} এ যান`}
                    className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center relative shadow-sm ${
                      isCurrent
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black ring-2 ring-emerald-300 shadow-emerald-900/50 shadow-md scale-105"
                        : "bg-[#040e0a] border border-emerald-900/60 text-slate-300 hover:bg-emerald-950/80 hover:border-emerald-600 hover:text-emerald-200"
                    }`}
                  >
                    <span>{i + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 11. GRAND 114 SURAHS & 30 JUZ MODAL SELECTOR ── */}
      {isNavModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#071912] border-2 border-emerald-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-hind-siliguri">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-900/80 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#071912] to-slate-950">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  পবিত্র কুরআনুল কারীম — ১১৪টি সূরা ও ৩০ পারা
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNavModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Controls: Search & Tabs */}
            <div className="p-4 border-b border-emerald-900/60 bg-[#05110c] flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && hafiziSearchMatch) {
                      handleJumpToHafiziPage(hafiziSearchMatch.para, hafiziSearchMatch.paraPage);
                    }
                  }}
                  placeholder="সূরার নাম, নম্বর বা পারা অনুসন্ধান করুন (যেমন: পারা ৫ পৃষ্ঠা ১২, 36, ইয়াসিন)..."
                  className="w-full bg-[#040e0a] border border-emerald-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "সকল সূরা" },
                  { id: "hafizi", label: "📖 হাফেজী পারা ও পৃষ্ঠা" },
                  { id: "popular", label: "জনপ্রিয়" },
                  { id: "juz", label: "পারা অনুযায়ী" },
                  { id: "makki", label: "মাক্কী" },
                  { id: "madani", label: "মাদানী" },
                ].map((t) => {
                  const isHafizi = t.id === "hafizi";
                  const isActive = navTab === t.id;
                  let tabClasses = "bg-slate-900 text-slate-400 hover:text-slate-200";
                  if (isHafizi) {
                    tabClasses = isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-300 scale-105"
                      : "bg-amber-950/60 text-amber-300 border-2 border-amber-500/70 hover:bg-amber-900/80 font-bold shadow-sm";
                  } else if (isActive) {
                    tabClasses = "bg-emerald-600 text-white shadow";
                  }

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNavTab(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${tabClasses}`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Hafizi Jump Toolbar (Always Visible for Instant Para & Page Navigation) */}
            <div className="px-4 py-2 bg-[#030e09] border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
                  <BookOpen className="w-3 h-3" />
                </div>
                <span className="text-xs font-black text-amber-300">
                  হাফেজী কুরআন (১৫ লাইন) পারা ও পৃষ্ঠা:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Para Selector */}
                <div className="flex items-center gap-1 bg-[#05160f] border border-emerald-700/80 rounded-lg px-2 py-1 text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold text-[11px]">পারা:</span>
                  <select
                    value={hafiziPara}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setHafiziPara(p);
                      const maxP = getParaTotalPages(p);
                      if (hafiziPage > maxP) setHafiziPage(1);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    {HAFIZI_PARAS.map((p) => (
                      <option key={p.juz} value={p.juz} className="bg-slate-900 text-white">
                        {p.juz} ({p.nameBn} • {p.totalPages} পৃ:)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Page Selector */}
                <div className="flex items-center gap-1 bg-[#05160f] border border-emerald-700/80 rounded-lg px-2 py-1 text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold text-[11px]">পৃষ্ঠা:</span>
                  <select
                    value={hafiziPage}
                    onChange={(e) => setHafiziPage(Number(e.target.value))}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    {Array.from({ length: getParaTotalPages(hafiziPara) }, (_, i) => i + 1).map((pg) => (
                      <option key={pg} value={pg} className="bg-slate-900 text-white">
                        পৃষ্ঠা {pg} (কুরআনের মোট {getHafiziGlobalPage(hafiziPara, pg)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Jump Button */}
                <button
                  type="button"
                  onClick={() => handleJumpToHafiziPage(hafiziPara, hafiziPage)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {navTab !== "hafizi" && (
                  <button
                    type="button"
                    onClick={() => setNavTab("hafizi")}
                    className="text-[11px] text-amber-400 hover:text-amber-200 underline font-semibold transition cursor-pointer ml-1"
                  >
                    সব পৃষ্ঠা ব্রাউজ করুন ➔
                  </button>
                )}
              </div>
            </div>

            {/* Smart Search Match Banner for Hafizi Queries (e.g. "পারা ৫ পৃষ্ঠা ১২", "পৃষ্ঠা ৯৩", "5 12") */}
            {hafiziSearchMatch && (
              <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-emerald-950/90 to-[#071912] border-2 border-amber-500 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-amber-200">
                      হাফেজী পৃষ্ঠা পাওয়া গেছে: পারা {hafiziSearchMatch.para}, পৃষ্ঠা {hafiziSearchMatch.paraPage} (মোট পৃষ্ঠা: {hafiziSearchMatch.globalPage})
                    </p>
                    <p className="text-[11px] text-emerald-300 font-medium">
                      শুরুর স্থান: সূরা {ALL_SURAHS.find((s) => s.id === hafiziSearchMatch.surah)?.nameBn || hafiziSearchMatch.surah} • আয়াত {hafiziSearchMatch.ayah}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleJumpToHafiziPage(hafiziSearchMatch.para, hafiziSearchMatch.paraPage)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>সরাসরি যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── HAFIZI QURAN (PARA & PAGE) BROWSER TAB ── */}
            {navTab === "hafizi" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#05140e]">
                {/* Rules & Direct Global Page Jump Form */}
                <div className="p-4 bg-emerald-950/50 border-b border-emerald-900/60 flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-amber-300">
                        হাফেজী কুরআন মাজীদ (১৫ লাইন হিসেব • সর্বমোট ৬১০ পৃষ্ঠা)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                        স্ট্যান্ডার্ড
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      ১ম পারা: ২১ পৃষ্ঠা • ২য়-২৮তম পারা: ২০ পৃষ্ঠা • ২৯তম পারা: ২৪ পৃষ্ঠা • ৩০তম পারা: ২৫ পৃষ্ঠা
                    </p>
                  </div>

                  {/* Direct Global Page Number Jump Controls (No duplicate dropdowns) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#040e0a] border border-emerald-800 rounded-xl px-2.5 py-1 text-xs text-slate-200">
                      <span className="text-slate-400 font-medium text-[11px]">কুরআনের মোট পৃষ্ঠা:</span>
                      <input
                        type="number"
                        min="1"
                        max="610"
                        placeholder="১-৬১০"
                        value={hafiziGlobalPageInput}
                        onChange={(e) => setHafiziGlobalPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && hafiziGlobalPageInput) {
                            const loc = getHafiziLocation(hafiziGlobalPageInput);
                            handleJumpToHafiziPage(loc.para, loc.paraPage);
                          }
                        }}
                        className="w-16 bg-transparent text-amber-300 font-bold text-xs placeholder-slate-500 focus:outline-none text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (hafiziGlobalPageInput) {
                          const loc = getHafiziLocation(hafiziGlobalPageInput);
                          handleJumpToHafiziPage(loc.para, loc.paraPage);
                        } else {
                          handleJumpToHafiziPage(hafiziPara, hafiziPage);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-300 shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span>যান</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 30 Paras Horizontal Badges */}
                <div className="p-3 bg-[#030d08] border-b border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                  {HAFIZI_PARAS.map((p) => {
                    const isSelected = hafiziPara === p.juz;
                    return (
                      <button
                        key={p.juz}
                        type="button"
                        onClick={() => {
                          setHafiziPara(p.juz);
                          const maxP = p.totalPages;
                          if (hafiziPage > maxP) setHafiziPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 shadow-md font-black scale-105"
                            : "bg-[#051710] text-slate-300 border border-emerald-900/80 hover:bg-emerald-950/80 hover:text-emerald-300"
                        }`}
                      >
                        <span>পারা {p.juz}</span>
                        <span className="opacity-70 text-[10px]">({p.totalPages} পৃ:)</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Para Info Banner */}
                {(() => {
                  const info = HAFIZI_PARAS.find((p) => p.juz === hafiziPara) || HAFIZI_PARAS[0];
                  return (
                    <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/70 via-[#071912] to-slate-950 border-b border-emerald-900/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {info.nameBn}
                        </span>
                        <span className="font-amiri text-amber-300 text-base font-bold">
                          {info.nameAr}
                        </span>
                        <span className="text-slate-400">
                          • মোট {info.totalPages}টি পৃষ্ঠা (কুরআনের মোট পৃষ্ঠা: {info.startPage} থেকে {info.endPage})
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-400 font-semibold hidden sm:inline">
                        পৃষ্ঠা কার্ডে ক্লিক করে সরাসরি তিলাওয়াত শুরু করুন ➔
                      </span>
                    </div>
                  );
                })()}

                {/* Grid of Pages for this Selected Para */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[460px]">
                  {(() => {
                    const info = HAFIZI_PARAS.find((p) => p.juz === hafiziPara) || HAFIZI_PARAS[0];
                    return Array.from({ length: info.totalPages }, (_, i) => {
                      const pageNo = i + 1;
                      const globalPg = info.startPage + i;
                      const target = getHafiziPageTarget(info.juz, pageNo);
                      const targetSurahMeta = ALL_SURAHS.find((s) => s.id === target.surah);
                      return (
                        <button
                          key={pageNo}
                          type="button"
                          onClick={() => handleJumpToHafiziPage(info.juz, pageNo)}
                          className="p-3 rounded-2xl bg-[#040e0a] border border-emerald-800/60 hover:border-amber-400 hover:bg-emerald-950/80 transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm active:scale-95 hover:shadow-emerald-900/50"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-amber-300 group-hover:text-amber-200">
                              পৃষ্ঠা {pageNo}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                              মোট: {globalPg}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-[11px] font-bold text-white group-hover:text-amber-100 truncate">
                              {targetSurahMeta?.nameBn || `সূরা ${target.surah}`}
                            </p>
                            <p className="text-[10px] text-emerald-400 font-medium">
                              আয়াত {target.ayah} থেকে
                            </p>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* If Juz Tab selected: Show Juz 1-30 Selector */}
            {navTab === "juz" && (
              <div className="p-3 bg-emerald-950/40 border-b border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                {JUZ_MAPPING.map((j) => (
                  <button
                    key={j.juz}
                    type="button"
                    onClick={() => setSelectedJuzNumber(j.juz)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedJuzNumber === j.juz
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "bg-[#040e0a] text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    পারা {j.juz}
                  </button>
                ))}
              </div>
            )}

            {/* Surahs Grid (For All / Popular / Juz / Makki / Madani Tabs) */}
            {navTab !== "hafizi" && (
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[500px]">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSurahByNumber(s.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedSurahNumber === s.id
                        ? "bg-emerald-950 border-emerald-400 ring-2 ring-emerald-500/50 shadow-lg"
                        : "bg-[#040e0a] border-emerald-900/60 hover:border-emerald-600 hover:bg-[#061811]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        {s.id}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{s.nameBn}</p>
                        <span className="text-[11px] text-slate-400">
                          {s.versesCount} আয়াত • {s.typeBn}
                        </span>
                      </div>
                    </div>
                    <span className="font-amiri text-lg text-amber-200 font-bold">{s.nameAr}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-[#040e0a] border-t border-emerald-900/80 text-center text-xs text-slate-400">
              যেকোনো সূরায় ক্লিক করলেই তা সরাসরি তিলাওয়াত ও মাশক বোর্ডে লোড হয়ে যাবে।
            </div>
          </div>
        </div>
      )}

      {/* ── 12. MICROPHONE TROUBLESHOOTING & PERMISSION MODAL ── */}
      {isMicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-hind-siliguri">
          <div className="bg-[#071912] border-2 border-emerald-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    মাইক্রোফোন সংযোগ ও অনুমতি সহায়িকা
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    কম্পিউটারে সহজে মাইক চালু করার নির্দেশিকা
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMicModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Alert Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              micPermissionState === "denied"
                ? "bg-rose-950/70 border-rose-600/70 text-rose-200"
                : micPermissionState === "not_found"
                ? "bg-amber-950/70 border-amber-600/70 text-amber-200"
                : "bg-emerald-950/70 border-emerald-600/70 text-emerald-200"
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-current" />
              <div>
                <p className="font-bold">
                  {micPermissionState === "denied"
                    ? "ব্রাউজারে মাইক্রোফোনের অনুমতি (Permission) বন্ধ বা ব্লক করা আছে!"
                    : micPermissionState === "not_found"
                    ? "আপনার কম্পিউটারে কোনো মাইক্রোফোন খুঁজে পাওয়া যায়নি!"
                    : "মাইক্রোফোন ব্যবহারের জন্য ব্রাউজারের অনুমতি প্রয়োজন।"}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  নিচের ৩টি সহজ ধাপ অনুসরণ করে মাইকটি সক্রিয় করে নিন:
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#040e0a] border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-bold shrink-0 text-xs">
                  ১
                </span>
                <div>
                  <p className="font-extrabold text-white">ব্রাউজারের অ্যাড্রেস বারের তালা (🔒) আইকনে ক্লিক করুন</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    উপরে যেখানে <code>localhost:3000</code> লেখা আছে, তার ঠিক বাম পাশে থাকা তালা <strong>(🔒)</strong> অথবা সাইট সেটিংস স্লাইডার আইকনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#040e0a] border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-bold shrink-0 text-xs">
                  ২
                </span>
                <div>
                  <p className="font-extrabold text-white">Microphone অপশনটি &quot;Allow&quot; (অনুমতি দিন) করুন</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ড্রপডাউন থেকে <strong>Allow (অনুমতি)</strong> সিলেক্ট করুন বা টগলটি অন করুন।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#040e0a] border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-bold shrink-0 text-xs">
                  ৩
                </span>
                <div>
                  <p className="font-extrabold text-white">উইন্ডোজ সেটিংস ও হেডফোন চেক করুন</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    কম্পিউটারে হেডফোন বা মাইকের তার সঠিকভাবে লাগানো আছে কিনা এবং উইন্ডোজের <strong>Settings &gt; Privacy &gt; Microphone</strong> এ মাইক পারমিশন অন আছে কিনা তা দেখুন।
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-emerald-900/40">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                পেজ রিলোড করুন (F5)
              </button>

              <button
                type="button"
                onClick={handleTestMicrophone}
                disabled={isMicTesting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isMicTesting ? "যাচাই হচ্ছে..." : "আবার মাইক পরীক্ষা করুন"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
