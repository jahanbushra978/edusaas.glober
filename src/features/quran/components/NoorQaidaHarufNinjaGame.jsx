"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Home,
  RotateCcw,
  ChevronRight,
  X,
  Check,
  Lock,
  Settings,
} from "lucide-react";
import { universalAudioEngine, QAIDA_TAKHTI_1_LETTERS } from "@/lib/quran/audio";
import { banglaAudioEngine } from "@/lib/quran/bangla-audio-engine";
import { playMaShaAllahCelebration } from "@/features/ai-learning/lib/arabicSoundPlayer";
import {
  SHOP_BLADES,
  SHOP_NEEDLES,
  getStoredCoins,
  saveCoins,
  getUnlockedBlades,
  getEquippedBlade,
  getUnlockedNeedles,
  getEquippedNeedle,
} from "@/lib/quran/qaidaGameShop";

// ── BENGALI DIGITS CONVERTER ──
const toBengaliDigits = (num) => {
  if (num === null || num === undefined) return "";
  const enDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[enDigits.indexOf(d)]);
};

// ── PERSISTENT GAME DURATION (DEFAULT 60 SECONDS / 1 MINUTE) ──
const getInitialDuration = () => {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_qaida_game_duration");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if ([30, 60, 90, 120].includes(parsed)) return parsed;
      }
    }
  } catch { }
  return 60; // 1 minute default!
};

// ── VIBRANT 3D FRUITS WITH JUICY RADIANT COLORS (FIXES FADED DISPLAY) ──
const NINJA_FRUITS = [
  { icon: "🍏", nameBn: "সবুজ আপেল", color: "#84cc16", darkColor: "#3f6212", juiceColor: "rgba(132, 204, 22, 0.95)" },
  { icon: "🍎", nameBn: "লাল আপেল", color: "#ef4444", darkColor: "#991b1b", juiceColor: "rgba(239, 68, 68, 0.95)" },
  { icon: "🥝", nameBn: "কিউই", color: "#65a30d", darkColor: "#365314", juiceColor: "rgba(101, 163, 13, 0.95)" },
  { icon: "🍌", nameBn: "কলা", color: "#eab308", darkColor: "#854d0e", juiceColor: "rgba(234, 179, 8, 0.95)" },
  { icon: "🍉", nameBn: "তরমুজ", color: "#f43f5e", darkColor: "#9f1239", juiceColor: "rgba(244, 63, 94, 0.95)" },
  { icon: "🍐", nameBn: "নাশপাতি", color: "#a3e635", darkColor: "#4d7c0f", juiceColor: "rgba(163, 230, 53, 0.95)" },
  { icon: "🍓", nameBn: "স্ট্রবেরি", color: "#e11d48", darkColor: "#881337", juiceColor: "rgba(225, 29, 72, 0.95)" },
  { icon: "🍊", nameBn: "কমলা", color: "#f97316", darkColor: "#9a3412", juiceColor: "rgba(249, 115, 22, 0.95)" },
];

export default function NoorQaidaHarufNinjaGame({
  targetItem = { ar: "س", nameBn: "সীন", sound: "س" },
  onClose = () => { },
  onNextLetter = null,
  onSwitchToBubble = null,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Game States
  const [score, setScore] = useState(0);
  const [slicedTargetCount, setSlicedTargetCount] = useState(0);
  const TARGET_GOAL = 10;
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won' | 'gameover' | 'paused'
  const [finishReason, setFinishReason] = useState(null); // 'timeout' | 'bombs' | null
  const [isMuted, setIsMuted] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  // ⏱️ Round Countdown Timer (Default 60 seconds / 1 min, selectable: 30s, 60s, 90s, 120s)
  const [selectedDuration, setSelectedDuration] = useState(getInitialDuration);
  const [timeLeft, setTimeLeft] = useState(getInitialDuration);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 📊 Real-Time Educational Tracking (মোট হরফ, সংগৃহীত, মিস ও সংগ্রহের হার)
  const totalTargetSpawnedRef = useRef(0);
  const collectedTargetRef = useRef(0);
  const [spawnStats, setSpawnStats] = useState({ total: 0, collected: 0 });
  const hasAnnouncedVoiceRef = useRef(false);

  // 🎯 Target Letter Index in Canonical Takhti 1 sequence
  const targetIndex = useMemo(() => {
    if (!QAIDA_TAKHTI_1_LETTERS) return 0;
    const idx = QAIDA_TAKHTI_1_LETTERS.findIndex(
      (l) => l.ar === targetItem?.ar || l.sound === targetItem?.sound || l.id === targetItem?.id
    );
    return idx >= 0 ? idx : 0;
  }, [targetItem]);

  // 📚 Strictly Learned Distractor Letters: Only letters learned prior to targetIndex
  // At Alif (index 0), this is strictly EMPTY! Future letters (Ayn, Taa, etc.) can NEVER spawn!
  const learnedDistractors = useMemo(() => {
    if (!QAIDA_TAKHTI_1_LETTERS || targetIndex <= 0) return [];
    return QAIDA_TAKHTI_1_LETTERS.slice(0, targetIndex);
  }, [targetIndex]);

  // 🛒 Coin & Shop System
  const [coins, setCoins] = useState(150);
  const [equippedBladeId, setEquippedBladeId] = useState("wood_blade");
  const [unlockedBlades, setUnlockedBlades] = useState(["wood_blade"]);
  const [equippedNeedleId, setEquippedNeedleId] = useState("finger");
  const [unlockedNeedles, setUnlockedNeedles] = useState(["finger"]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState("blades");

  // References for Game Loop and Interactive Physics
  const itemsRef = useRef([]);
  const splattersRef = useRef([]);
  const bladeTrailRef = useRef([]);
  const isPointerDownRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const lastSpawnTimeRef = useRef(Date.now());
  const isShakingRef = useRef(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const currentStudioAudioRef = useRef(null);
  const targetStreakRef = useRef(0);
  const fruitStreakRef = useRef(0);

  // Dedicated Studio Game Audio Player (100% Fixed, Zero Robotic Synthesizer Fallback)
  const playStudioGameAudio = useCallback(
    (audioPath) => {
      if (typeof window === "undefined" || isMuted || !audioPath) return;
      try {
        if (currentStudioAudioRef.current) {
          try {
            currentStudioAudioRef.current.pause();
            currentStudioAudioRef.current.currentTime = 0;
          } catch { }
          currentStudioAudioRef.current = null;
        }
        const audio = new Audio(audioPath);
        audio.volume = 1.0;
        currentStudioAudioRef.current = audio;
        audio.play().catch(() => { });
      } catch { }
    },
    [isMuted]
  );

  const stopStudioGameAudio = useCallback(() => {
    if (currentStudioAudioRef.current) {
      try {
        currentStudioAudioRef.current.pause();
        currentStudioAudioRef.current.currentTime = 0;
      } catch { }
      currentStudioAudioRef.current = null;
    }
  }, []);

  // Responsive Orientation State with Session-level Dismissal Persistence
  const [isPortrait, setIsPortrait] = useState(false);
  const [showRotateTip, setShowRotateTip] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("noor_qaida_hide_rotate_tip") !== "true";
      }
    } catch { }
    return true;
  });
  const [showFooterTip, setShowFooterTip] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return sessionStorage.getItem("noor_qaida_hide_footer_tip") !== "true";
      }
    } catch { }
    return true;
  });

  const handleDismissRotateTip = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowRotateTip(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("noor_qaida_hide_rotate_tip", "true");
      }
    } catch { }
  }, []);

  const handleDismissFooterTip = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowFooterTip(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("noor_qaida_hide_footer_tip", "true");
      }
    } catch { }
  }, []);

  // Detect orientation for responsive mobile gameplay
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = typeof window !== "undefined" && window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(portrait);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // Manual Landscape Request
  const handleRequestLandscape = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
      handleDismissRotateTip(e);
    } catch {
      handleDismissRotateTip(e);
    }
  };

  // Load coins, unlocked swords and best score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("noor_qaida_ninja_best");
      if (saved) setBestScore(parseInt(saved, 10));
    } catch { }
    setCoins(getStoredCoins());
    setEquippedBladeId(getEquippedBlade());
    setUnlockedBlades(getUnlockedBlades());
    setEquippedNeedleId(getEquippedNeedle());
    setUnlockedNeedles(getUnlockedNeedles());
  }, []);

  // Shop actions
  const handleBuyBlade = (blade) => {
    if (coins < blade.price) return;
    const nextCoins = coins - blade.price;
    setCoins(nextCoins);
    saveCoins(nextCoins);

    const nextUnlocked = [...unlockedBlades, blade.id];
    setUnlockedBlades(nextUnlocked);
    try {
      localStorage.setItem("noor_qaida_unlocked_blades", JSON.stringify(nextUnlocked));
    } catch { }

    setEquippedBladeId(blade.id);
    try {
      localStorage.setItem("noor_qaida_equipped_blade", blade.id);
    } catch { }
  };

  const handleEquipBlade = (bladeId) => {
    setEquippedBladeId(bladeId);
    try {
      localStorage.setItem("noor_qaida_equipped_blade", bladeId);
    } catch { }
  };

  const handleBuyNeedle = (needle) => {
    if (coins < needle.price) return;
    const nextCoins = coins - needle.price;
    setCoins(nextCoins);
    saveCoins(nextCoins);

    const nextUnlocked = [...unlockedNeedles, needle.id];
    setUnlockedNeedles(nextUnlocked);
    try {
      localStorage.setItem("noor_qaida_unlocked_needles", JSON.stringify(nextUnlocked));
    } catch { }

    setEquippedNeedleId(needle.id);
    try {
      localStorage.setItem("noor_qaida_equipped_needle", needle.id);
    } catch { }
  };

  const handleEquipNeedle = (needleId) => {
    setEquippedNeedleId(needleId);
    try {
      localStorage.setItem("noor_qaida_equipped_needle", needleId);
    } catch { }
  };

  // ── WEB AUDIO SYNTHESIZERS FOR FRUIT NINJA ACTIONS ──
  const playBladeWhoosh = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Bandpass filtered noise for katana whoosh
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.12);
      filter.Q.setValueAtTime(2.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch { }
  }, [isMuted]);

  const playFruitSquishSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Squish pop + chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch { }
  }, [isMuted]);

  const playSwordClashSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      [1200, 1800, 2400].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      });
    } catch { }
  }, [isMuted]);

  const playBombExplosionSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Heavy explosion noise
      const bufferSize = Math.floor(ctx.sampleRate * 0.6);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.6);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch { }
  }, [isMuted]);

  const playVictorySound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch { }
  }, [isMuted]);

  // ── RESIZE CANVAS ON MOUNT & WINDOW RESIZE ──
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── SPAWN A FLYING OBJECT (FRUIT / TARGET ARABIC LETTER / BOMB) ──
  const spawnFlyingObject = useCallback((width, height) => {
    const rand = Math.random();
    let type = "fruit";
    let content = "🍎";
    let color = "#ef4444";
    let darkColor = "#991b1b";
    let juiceColor = "rgba(239, 68, 68, 0.95)";
    let nameBn = "ফল";
    let sound = "apple";

    // Strict cumulative spawning:
    // If learnedDistractors is empty (Alif): ONLY Alif, fruits, and bombs can spawn.
    if (learnedDistractors.length === 0) {
      if (rand < 0.45) {
        type = "target";
        content = targetItem.ar || "ا";
        nameBn = targetItem.nameBn || "আলিফ";
        sound = targetItem.sound || targetItem.ar;
        color = "#f59e0b"; // Golden glow for Arabic letter
        darkColor = "#b45309";
        juiceColor = "rgba(245, 158, 11, 0.95)";
      } else if (rand < 0.82) {
        type = "fruit";
        const fruit = NINJA_FRUITS[Math.floor(Math.random() * NINJA_FRUITS.length)];
        content = fruit.icon;
        nameBn = fruit.nameBn;
        sound = fruit.nameBn;
        color = fruit.color;
        darkColor = fruit.darkColor;
        juiceColor = fruit.juiceColor;
      } else {
        type = "bomb";
        content = "💣";
        nameBn = "বিপদজনক বোমা";
        color = "#1e293b";
        darkColor = "#0f172a";
        juiceColor = "rgba(225, 29, 72, 0.95)";
      }
    } else {
      // At Baa, Taa, etc.: 40% Target, 15% Prior learned letter, 30% Fruit, 15% Bomb
      if (rand < 0.40) {
        type = "target";
        content = targetItem.ar;
        nameBn = targetItem.nameBn;
        sound = targetItem.sound || targetItem.ar;
        color = "#f59e0b";
        darkColor = "#b45309";
        juiceColor = "rgba(245, 158, 11, 0.95)";
      } else if (rand < 0.55) {
        type = "distractor";
        const dist = learnedDistractors[Math.floor(Math.random() * learnedDistractors.length)];
        content = dist.ar;
        nameBn = dist.nameBn;
        sound = dist.ar;
        color = "#38bdf8";
        darkColor = "#0284c7";
        juiceColor = "rgba(56, 189, 248, 0.95)";
      } else if (rand < 0.85) {
        type = "fruit";
        const fruit = NINJA_FRUITS[Math.floor(Math.random() * NINJA_FRUITS.length)];
        content = fruit.icon;
        nameBn = fruit.nameBn;
        sound = fruit.nameBn;
        color = fruit.color;
        darkColor = fruit.darkColor;
        juiceColor = fruit.juiceColor;
      } else {
        type = "bomb";
        content = "💣";
        nameBn = "বিপদজনক বোমা";
        color = "#1e293b";
        darkColor = "#0f172a";
        juiceColor = "rgba(225, 29, 72, 0.95)";
      }
    }

    if (type === "target") {
      totalTargetSpawnedRef.current += 1;
      setSpawnStats((prev) => ({ ...prev, total: prev.total + 1 }));
    }

    const radius = type === "target" ? 44 : 38;
    const x = Math.random() * (width * 0.7) + width * 0.15;
    const y = height + 40;

    const vy = -(Math.random() * 4 + 14.5);
    const vx = ((width / 2 - x) / width) * 4 + (Math.random() * 2 - 1);
    const rotation = Math.random() * Math.PI * 2;
    const vRot = (Math.random() - 0.5) * 0.08;

    itemsRef.current.push({
      id: Math.random(),
      type,
      content,
      nameBn,
      sound,
      color,
      darkColor,
      juiceColor,
      x,
      y,
      vx,
      vy,
      radius,
      rotation,
      vRot,
      isSliced: false,
      slicedAt: 0,
    });
  }, [targetItem, learnedDistractors]);

  // ── ADD JUICE SPLATTER ON WOODEN WALL ──
  const addJuiceSplatter = (x, y, color) => {
    const drops = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 45 + 15;
      drops.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        r: Math.random() * 7 + 3,
      });
    }

    splattersRef.current.push({
      id: Math.random(),
      x,
      y,
      color,
      r: Math.random() * 18 + 22,
      drops,
      alpha: 0.85,
      createdAt: Date.now(),
    });

    // Keep max 15 splatters for performance
    if (splattersRef.current.length > 15) {
      splattersRef.current.shift();
    }
  };

  // ── CHECK LINE INTERSECTION WITH OBJECT CIRCLE ──
  const checkIntersection = (p1, p2, item) => {
    // Vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return false;

    // Projection of item onto segment
    const u = ((item.x - p1.x) * dx + (item.y - p1.y) * dy) / (len * len);
    const clampedU = Math.max(0, Math.min(1, u));

    // Nearest point on segment
    const nearestX = p1.x + clampedU * dx;
    const nearestY = p1.y + clampedU * dy;

    const distSq = (item.x - nearestX) ** 2 + (item.y - nearestY) ** 2;
    return distSq <= item.radius ** 2;
  };

  // ── TOUCH & MOUSE EVENT HANDLERS (BLADE SLASH) ──
  const handlePointerDown = (e) => {
    isPointerDownRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    bladeTrailRef.current = [{ x, y, time: Date.now() }];
    playBladeWhoosh();
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();

    const trail = bladeTrailRef.current;
    if (trail.length > 0) {
      const last = trail[trail.length - 1];
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist > 8) {
        trail.push({ x, y, time: now });
        // Check slice with all active items
        checkSliceCollisions(last, { x, y });
      }
    } else {
      trail.push({ x, y, time: now });
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  // ── CHECK SLICE WITH OBJECTS ──
  const checkSliceCollisions = (p1, p2) => {
    if (gameState !== "playing") return;

    itemsRef.current.forEach((item) => {
      if (item.isSliced) return;

      if (checkIntersection(p1, p2, item)) {
        item.isSliced = true;
        item.slicedAt = Date.now();

        // Slice angle & halves physics
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        item.sliceAngle = angle;

        // Add juice/ink splatter on wood wall
        addJuiceSplatter(item.x, item.y, item.juiceColor);

        if (item.type === "target") {
          // TARGET ARABIC LETTER SLICED!
          playSwordClashSound();
          if (!isMuted) {
            // 1. ALWAYS recite authentic Takhti 1 letter audio (Alif, Baa, etc.)
            universalAudioEngine.playLetter(targetItem.ar);

            // 2. High-incentive praise for Quranic letters: "মাশাআল্লাহ!", "গ্রেট!", "সুপার!", "চমৎকার!", "সাবাশ!", "বাহ!"
            targetStreakRef.current += 1;
            if (targetStreakRef.current >= 2 || Math.random() < 0.6) {
              targetStreakRef.current = 0;
              const praiseClips = [
                "/audio/game/mashaallah.mp3",
                "/audio/game/great.mp3",
                "/audio/game/super.mp3",
                "/audio/game/shabash.mp3",
                "/audio/game/chomothkar.mp3",
                "/audio/game/bah.mp3",
              ];
              const praise = praiseClips[Math.floor(Math.random() * praiseClips.length)];
              setTimeout(() => {
                playStudioGameAudio(praise);
              }, 450);
            }
          }

          // +5 Coins for slicing target letter
          setCoins((c) => {
            const next = c + 5;
            saveCoins(next);
            return next;
          });

          setScore((s) => {
            const nextScore = s + 25;
            if (nextScore > bestScore) {
              setBestScore(nextScore);
              try {
                localStorage.setItem("noor_qaida_ninja_best", nextScore.toString());
              } catch { }
            }
            return nextScore;
          });

          setSlicedTargetCount((curr) => {
            const nextCount = curr + 1;
            collectedTargetRef.current = nextCount;
            setSpawnStats((prev) => ({ ...prev, collected: nextCount }));
            return nextCount;
          });
        } else if (item.type === "fruit") {
          // FRUIT SLICED!
          playFruitSquishSound();
          fruitStreakRef.current += 1;

          // Strict Rule: No voice praise on every fruit so children focus on Quranic letters!
          // Only after slicing 5 fruits, play a single appreciation voice.
          if (!isMuted && fruitStreakRef.current >= 5) {
            fruitStreakRef.current = 0;
            const fruitVoices = [
              "/audio/game/bah.mp3",
              "/audio/game/chomothkar.mp3",
            ];
            const selectedVoice = fruitVoices[Math.floor(Math.random() * fruitVoices.length)];
            playStudioGameAudio(selectedVoice);
          }
          // +2 Coins for slicing fruit
          setCoins((c) => {
            const next = c + 2;
            saveCoins(next);
            return next;
          });
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > bestScore) {
              setBestScore(nextScore);
              try {
                localStorage.setItem("noor_qaida_ninja_best", nextScore.toString());
              } catch { }
            }
            return nextScore;
          });
        } else if (item.type === "bomb") {
          // BOMB SLICED! 💥
          playBombExplosionSound();
          setShakeScreen(true);
          setTimeout(() => setShakeScreen(false), 500);

          setLives((l) => {
            const nextLives = l - 1;
            if (nextLives <= 0) {
              handleRoundFinish("bombs");
            }
            return nextLives;
          });
        }
      }
    });
  };

  // ── MAIN CANVAS GAME LOOP (60 FPS RENDERING) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. DRAW WOODEN PLANKS BACKGROUND (MATCHING SCREENSHOT)
      drawWoodenPlanks(ctx, width, height);

      // 2. DRAW JUICE SPLATTERS ON WOOD WALL
      const now = Date.now();
      splattersRef.current.forEach((splatter) => {
        const age = now - splatter.createdAt;
        // Fade over 12 seconds
        const alpha = Math.max(0.15, 0.85 - age / 12000);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = splatter.color;

        // Main center splatter blob
        ctx.beginPath();
        ctx.arc(splatter.x, splatter.y, splatter.r, 0, Math.PI * 2);
        ctx.fill();

        // Satellite droplet splashes
        splatter.drops.forEach((d) => {
          ctx.beginPath();
          ctx.arc(splatter.x + d.dx, splatter.y + d.dy, d.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      // 3. SPAWN NEW OBJECTS PERIODICALLY (IF PLAYING)
      if (gameState === "playing") {
        if (now - lastSpawnTimeRef.current > 1400) {
          spawnFlyingObject(width, height);
          if (Math.random() < 0.5) {
            // Chance of double spawn
            setTimeout(() => spawnFlyingObject(width, height), 250);
          }
          lastSpawnTimeRef.current = now;
        }
      }

      // 4. UPDATE & DRAW FLYING ITEMS
      const gravity = 0.38;
      itemsRef.current = itemsRef.current.filter((item) => {
        if (!item.isSliced) {
          // Normal parabolic flight
          item.x += item.vx;
          item.y += item.vy;
          item.vy += gravity;
          item.rotation += item.vRot;

          // Draw active item
          drawFlyingItem(ctx, item);

          // Keep while within screen (with safety margin)
          return item.y < height + 80;
        } else {
          // Sliced item: halves flying apart
          item.y += item.vy;
          item.vy += gravity * 1.2;
          drawSlicedHalves(ctx, item);

          return item.y < height + 80 && now - item.slicedAt < 1200;
        }
      });

      // 5. DRAW GLOWING GOLDEN LASER BLADE TRAIL
      bladeTrailRef.current = bladeTrailRef.current.filter((p) => now - p.time < 180);
      drawBladeTrail(ctx, bladeTrailRef.current);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameState, spawnFlyingObject]);

  // ── DRAW WOODEN PLANKS BACKGROUND ──
  const drawWoodenPlanks = (ctx, width, height) => {
    const plankHeight = 75;
    const numPlanks = Math.ceil(height / plankHeight);

    for (let i = 0; i < numPlanks; i++) {
      const y = i * plankHeight;
      // Alternating wood plank shades (dark oak/mahogany)
      ctx.fillStyle = i % 2 === 0 ? "#3d2314" : "#4a2c19";
      ctx.fillRect(0, y, width, plankHeight);

      // Plank separation groove (dark shadow line)
      ctx.fillStyle = "#1e1008";
      ctx.fillRect(0, y + plankHeight - 3, width, 3);

      // Top edge highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(0, y, width, 1.5);

      // Subtle wood grain lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 25);
      ctx.bezierCurveTo(width * 0.3, y + 22, width * 0.7, y + 28, width, y + 25);
      ctx.stroke();
    }
  };

  // ── DRAW FLYING ITEM (TARGET LETTER / FRUIT / BOMB) ──
  const drawFlyingItem = (ctx, item) => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);

    if (item.type === "target" || item.type === "distractor") {
      // Golden / Luminous Glowing Arabic Orb
      ctx.shadowColor = item.color || "#f59e0b";
      ctx.shadowBlur = 24;

      // Outer circle with rich gradient
      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, item.radius);
      gradient.addColorStop(0, "#fef3c7");
      gradient.addColorStop(0.7, item.color || "#f59e0b");
      gradient.addColorStop(1, item.darkColor || "#b45309");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Arabic Calligraphy in center
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 36px 'Amiri', 'Traditional Arabic', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.content, 0, -2);
    } else if (item.type === "bomb") {
      // Danger Cartoon Bomb
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 18;

      // Dark bomb sphere
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bomb fuse & spark
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(-3, -item.radius - 8, 6, 8);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, -item.radius - 10, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💣", 0, 0);
    } else {
      // 🍎 Juicy 3D Fruit Orb with Radiant Glow & Specular Highlight
      // Fixes washed-out / faint fruit against dark wood (user photo 5)!
      ctx.shadowColor = item.juiceColor || item.color;
      ctx.shadowBlur = 24;

      // 3D Spherical Radial Gradient Body
      const fruitGrad = ctx.createRadialGradient(
        -item.radius * 0.3,
        -item.radius * 0.3,
        item.radius * 0.1,
        0,
        0,
        item.radius
      );
      fruitGrad.addColorStop(0, "#ffffff");
      fruitGrad.addColorStop(0.25, item.color);
      fruitGrad.addColorStop(0.75, item.darkColor || item.color);
      fruitGrad.addColorStop(1, "rgba(20, 10, 5, 0.85)");
      ctx.fillStyle = fruitGrad;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular Reflection / Gloss Highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.ellipse(
        -item.radius * 0.32,
        -item.radius * 0.32,
        item.radius * 0.32,
        item.radius * 0.16,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Crisp luminous white border ring for high contrast
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bold, vibrant fruit icon with drop shadow
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 6;
      ctx.font = `${Math.floor(item.radius * 1.05)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.content, 0, 2);
    }

    ctx.restore();
  };

  // ── DRAW SLICED HALVES FLYING APART (REAL CANVAS CLIPPING) ──
  const drawSlicedHalves = (ctx, item) => {
    const age = (Date.now() - item.slicedAt) / 1000;
    const spread = age * 110; // Drift apart distance

    // Normal vector perpendicular to slice line
    const sliceAngle = item.sliceAngle || 0;
    const perpAngle = sliceAngle + Math.PI / 2;
    const dx = Math.cos(perpAngle) * spread;
    const dy = Math.sin(perpAngle) * spread;

    // ── UPPER/FIRST HALF (CLIPPED AT SLICE LINE) ──
    ctx.save();
    ctx.translate(item.x - dx, item.y - dy);
    ctx.rotate(sliceAngle);
    ctx.beginPath();
    // Clip rectangle: everything above the slice line (y <= 0)
    ctx.rect(-item.radius * 3, -item.radius * 3, item.radius * 6, item.radius * 3);
    ctx.clip();
    ctx.rotate(-sliceAngle);
    // Draw the actual item oriented with slight spin
    drawFlyingItem(ctx, { ...item, rotation: item.rotation - age * 3 });
    ctx.restore();

    // ── LOWER/SECOND HALF (CLIPPED AT SLICE LINE) ──
    ctx.save();
    ctx.translate(item.x + dx, item.y + dy);
    ctx.rotate(sliceAngle);
    ctx.beginPath();
    // Clip rectangle: everything below the slice line (y >= 0)
    ctx.rect(-item.radius * 3, 0, item.radius * 6, item.radius * 3);
    ctx.clip();
    ctx.rotate(-sliceAngle);
    // Draw the actual item oriented with slight spin
    drawFlyingItem(ctx, { ...item, rotation: item.rotation + age * 3 });
    ctx.restore();
  };

  // ── DRAW GLOWING LASER BLADE SLASH TRAIL ACCORDING TO EQUIPPED WEAPON ──
  const drawBladeTrail = (ctx, trail) => {
    if (trail.length < 2) return;

    const blade = SHOP_BLADES.find((b) => b.id === equippedBladeId) || SHOP_BLADES[0];

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Outer Blade Trail (Flaming, Rainbow, Golden, Steel, or Divine Light)
    if (blade.id === "rainbow_saber") {
      const grad = ctx.createLinearGradient(trail[0].x, trail[0].y, trail[trail.length - 1].x, trail[trail.length - 1].y);
      grad.addColorStop(0, "#ef4444");
      grad.addColorStop(0.2, "#f97316");
      grad.addColorStop(0.4, "#eab308");
      grad.addColorStop(0.6, "#10b981");
      grad.addColorStop(0.8, "#06b6d4");
      grad.addColorStop(1, "#a855f7");
      ctx.strokeStyle = grad;
    } else {
      ctx.strokeStyle = blade.trailOuter;
    }
    ctx.lineWidth = 14;
    ctx.shadowColor = blade.glowColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();

    // 2. Inner Razor Core
    ctx.strokeStyle = blade.trailInner;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();

    ctx.restore();
  };

  // ── EDUCATIONAL METRICS CALCULATION ──
  const totalTargetSpawned = Math.max(spawnStats.total, slicedTargetCount, 1);
  const collectedCount = slicedTargetCount;
  const _missedCount = Math.max(0, totalTargetSpawned - collectedCount);
  const collectionRate = Math.round((collectedCount / totalTargetSpawned) * 100);
  const _isPassed = gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs";

  // ── ROUND FINISH HANDLER (40% PASS THRESHOLD & STRICT SURVIVAL REQUIREMENT) ──
  const handleRoundFinish = useCallback((reason = "timeout") => {
    setFinishReason(reason);
    const total = Math.max(totalTargetSpawnedRef.current, collectedTargetRef.current, 1);
    const collected = collectedTargetRef.current;
    const rate = Math.round((collected / total) * 100);
    // Strict Invariant: Next level only unlocks if the player survived until the end of round time (reason !== "bombs") AND achieved >= 40%
    const passed = rate >= 40 && reason !== "bombs";

    if (passed) {
      setGameState("won");
      setCoins((c) => {
        const next = c + 50;
        saveCoins(next);
        return next;
      });
      try {
        playVictorySound();
      } catch { }
    } else {
      setGameState("gameover");
    }
  }, [playVictorySound]);

  // ── 100% FIXED STUDIO VOICE AUDIO (ZERO ROBOTIC AI / SYNTHESIZER FALLBACK) ──
  const getGameResultAudioClip = useCallback(() => {
    if (finishReason === "bombs" || lives <= 0) {
      return "/audio/game/bomb_gameover.mp3";
    }
    if (gameState === "won" && collectionRate >= 40 && lives > 0) {
      return "/audio/game/level_passed.mp3";
    }
    return "/audio/game/retry_level.mp3";
  }, [collectionRate, gameState, finishReason, lives]);

  const handleSpeakResultAgain = useCallback(() => {
    if (typeof window === "undefined") return;
    const clip = getGameResultAudioClip();
    playStudioGameAudio(clip);
  }, [getGameResultAudioClip, playStudioGameAudio]);

  useEffect(() => {
    if (gameState !== "won" && gameState !== "gameover") {
      hasAnnouncedVoiceRef.current = false;
      return;
    }
    if (hasAnnouncedVoiceRef.current) return;
    hasAnnouncedVoiceRef.current = true;

    if (gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs") {
      try {
        playMaShaAllahCelebration();
      } catch { }
    }

    const timer = setTimeout(() => {
      if (!isMuted) {
        const clip = getGameResultAudioClip();
        playStudioGameAudio(clip);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      stopStudioGameAudio();
      banglaAudioEngine.stop();
    };
  }, [gameState, collectionRate, lives, finishReason, isMuted, getGameResultAudioClip, playStudioGameAudio, stopStudioGameAudio]);

  // ── RESTART GAME ──
  const restartGame = () => {
    stopStudioGameAudio();
    banglaAudioEngine.stop();
    setScore(0);
    setSlicedTargetCount(0);
    totalTargetSpawnedRef.current = 0;
    collectedTargetRef.current = 0;
    targetStreakRef.current = 0;
    fruitStreakRef.current = 0;
    setSpawnStats({ total: 0, collected: 0 });
    setLives(3);
    setFinishReason(null);
    setTimeLeft(selectedDuration);
    itemsRef.current = [];
    splattersRef.current = [];
    hasAnnouncedVoiceRef.current = false;
    setGameState("playing");
  };

  const handleSelectDuration = (sec) => {
    setSelectedDuration(sec);
    setTimeLeft(sec);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("noor_qaida_game_duration", String(sec));
      }
    } catch { }
    setIsSettingsOpen(false);
    restartGame();
  };

  // ⏱️ Countdown Timer Tick Effect
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      handleRoundFinish("timeout");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundFinish("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, handleRoundFinish]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden select-none flex flex-col justify-between font-hind-siliguri ${shakeScreen ? "animate-shake" : ""
        }`}
    >
      {/* 🔄 Gentle Orientation Guidance (Non-Blocking & Dismissible) */}
      {isPortrait && showRotateTip && (
        <div
          role="alert"
          className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] bg-amber-950/95 text-amber-200 text-xs px-3.5 py-1.5 sm:py-2 rounded-full border-2 border-amber-400 shadow-2xl flex items-center justify-between gap-2.5 backdrop-blur-md animate-fade-in pointer-events-auto max-w-[96%] sm:max-w-md w-max"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 text-sm">📱</span>
            <span className="font-bold font-hind-siliguri truncate text-[11px] sm:text-xs text-white">
              আড়াআড়ি (Landscape) মোডে আরও সুন্দর
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onPointerDown={handleRequestLandscape}
              onClick={handleRequestLandscape}
              className="text-[10px] sm:text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-amber-950 px-2 py-1 rounded-lg active:scale-95 transition cursor-pointer"
            >
              ঘোরান
            </button>
            <button
              type="button"
              onPointerDown={handleDismissRotateTip}
              onTouchEnd={handleDismissRotateTip}
              onClick={handleDismissRotateTip}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/80 hover:bg-rose-600 active:scale-90 text-white flex items-center justify-center font-black shrink-0 cursor-pointer transition shadow-md border border-rose-300"
              title="বন্ধ করুন"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4 stroke-[3] pointer-events-none" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TOP NINJA HUD (CLEAN, MINIMAL & MOBILE-PERFECT)
          (Home, Shop, Target Mission Capsule, Restart, Settings)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 px-2 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 max-w-6xl mx-auto w-full pointer-events-auto">
        {/* Left: Home Button & Point Shop */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-900/90 hover:bg-amber-800 text-amber-200 border-2 border-amber-600 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="কায়দায় ফিরে যান"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 🛒 Shop Button (সুই ও চাকু কেনা) */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 text-white font-black text-xs shadow-md border-2 border-amber-400 active:scale-95 transition hover:scale-105 cursor-pointer"
            title="দোকান: নতুন চাকু ও তলোয়ার কিনুন"
          >
            <span className="text-xs sm:text-sm">🛒</span>
            <span className="hidden md:inline">দোকান</span>
            <span className="bg-black/40 px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono shadow-2xs">
              🪙 {coins}
            </span>
          </button>
        </div>

        {/* Center: Mission Target Level & Score Box */}
        <div className="flex items-center gap-1 sm:gap-3 bg-amber-950/90 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-1.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-500 shadow-lg text-white min-w-0">
          {/* Level & Target Letter Display */}
          <div className="flex items-center gap-1">
            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-900 text-amber-200 font-black text-[10px] sm:text-xs border border-amber-600 whitespace-nowrap">
              লেভেল {toBengaliDigits(targetIndex + 1)}
            </span>
            <div className="px-2 py-0.5 sm:py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-arabic font-black text-base sm:text-xl shadow-xs flex items-center gap-1 animate-pulse">
              <span>{targetItem.ar}</span>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold bg-white/20 px-1 rounded hidden sm:inline">
                {targetItem.nameBn}
              </span>
            </div>
          </div>

          {/* Sliced Progress Count */}
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 font-black text-[10px] sm:text-xs whitespace-nowrap">
            <span>🎯</span>
            <span>{toBengaliDigits(slicedTargetCount)}টি</span>
          </div>

          {/* ⏱️ Countdown Timer Display (Click opens Settings) */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 border border-amber-400 text-amber-200 font-black text-[10px] sm:text-xs shadow-2xs transition cursor-pointer whitespace-nowrap"
            title="গেম সেটিংস ও সময় নির্ধারণ"
          >
            <span className="text-xs">⏱️</span>
            <span className={`font-mono ${timeLeft <= 5 ? "text-rose-400 font-black animate-pulse" : ""}`}>
              {toBengaliDigits(timeLeft)} সে
            </span>
          </button>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-xs sm:text-base transition-transform ${
                  heartIndex <= lives ? "scale-100 animate-bounce" : "opacity-25 grayscale scale-75"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Right: Restart & Settings Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Restart */}
          <button
            onClick={restartGame}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-400 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Master Settings Button (⚙️) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-2 border-amber-400 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="গেম সেটিংস ও সময় নির্ধারণ"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          INTERACTIVE HTML5 CANVAS FOR FRUIT & HARUF NINJA SLICING
      ══════════════════════════════════════════════════════════ */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      />

      {/* ══════════════════════════════════════════════════════════
          BOTTOM SWIPE INSTRUCTION FOOTER (DISMISSIBLE)
      ══════════════════════════════════════════════════════════ */}
      {showFooterTip && (
        <footer className="relative z-30 px-3 py-1.5 sm:py-2 text-center bg-black/50 backdrop-blur-sm text-amber-200 text-[11px] sm:text-xs font-bold flex items-center justify-between gap-2 max-w-2xl mx-auto w-full rounded-2xl border border-amber-500/20 shadow-lg pointer-events-auto my-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0">⚔️</span>
            <span className="truncate">
              লক্ষ্য হরফ <strong>{targetItem.nameBn} ({targetItem.ar})</strong> ও ফল কাটো!
            </span>
            <span className="text-rose-400 font-black shrink-0">বোমা 💣 কাটো না!</span>
          </div>
          <button
            type="button"
            onPointerDown={handleDismissFooterTip}
            onTouchEnd={handleDismissFooterTip}
            onClick={handleDismissFooterTip}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/80 hover:bg-rose-600 active:scale-90 text-white flex items-center justify-center font-black shrink-0 cursor-pointer transition shadow-md border border-rose-300"
            title="বার্তাটি বন্ধ করুন"
            aria-label="বার্তাটি বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5 stroke-[3] pointer-events-none" />
          </button>
        </footer>
      )}

      {/* ══════════════════════════════════════════════════════════
          🛒 POINT SHOP MODAL (BUY & EQUIP SWORDS, NEEDLES, WANDS)
      ══════════════════════════════════════════════════════════ */}
      {isShopOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-amber-400 max-h-[90vh] flex flex-col">
            {/* Shop Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    নূর কায়দা গেমিং শপ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    পয়েন্ট দিয়ে ধারালো তলোয়ার ও সুই আনলক করো!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 font-black text-amber-900 text-xs flex items-center gap-1">
                  <span>🪙</span>
                  <span>{coins}</span>
                </div>
                <button
                  onClick={() => setIsShopOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shop Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-3 shrink-0">
              <button
                onClick={() => setShopTab("blades")}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${shopTab === "blades"
                  ? "bg-white text-orange-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span>⚔️</span>
                <span>হরফ নিনজা তলোয়ার</span>
              </button>
              <button
                onClick={() => setShopTab("needles")}
                className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${shopTab === "needles"
                  ? "bg-white text-emerald-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <span>🪡</span>
                <span>বুদ্বুদ সুই ও কাঠি</span>
              </button>
            </div>

            {/* Swords & Blades List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {shopTab === "blades" && (
                <div className="space-y-2.5">
                  {SHOP_BLADES.map((b) => {
                    const isOwned = unlockedBlades.includes(b.id);
                    const isEquipped = equippedBladeId === b.id;
                    const canAfford = coins >= b.price;

                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${isEquipped
                          ? "bg-amber-50 border-amber-400 shadow-xs"
                          : isOwned
                            ? "bg-white border-slate-200"
                            : "bg-slate-50 border-slate-200 opacity-90"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl w-12 h-12 rounded-2xl bg-orange-100/60 flex items-center justify-center shadow-inner shrink-0">
                            {b.icon}
                          </span>
                          <div>
                            <div className="font-black text-xs sm:text-sm text-slate-900 font-hind-siliguri">
                              {b.nameBn}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {b.descBn}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isEquipped ? (
                            <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>রানিং</span>
                            </span>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleEquipBlade(b.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-amber-500 hover:text-white text-slate-800 font-black text-xs transition cursor-pointer"
                            >
                              ব্যবহার করো
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyBlade(b)}
                              disabled={!canAfford}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition cursor-pointer ${canAfford
                                ? "bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-xs active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                              <span>🪙</span>
                              <span>{b.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Needles & Magic Wands List */}
              {shopTab === "needles" && (
                <div className="space-y-2.5">
                  {SHOP_NEEDLES.map((n) => {
                    const isOwned = unlockedNeedles.includes(n.id);
                    const isEquipped = equippedNeedleId === n.id;
                    const canAfford = coins >= n.price;

                    return (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${isEquipped
                          ? "bg-emerald-50 border-emerald-400 shadow-xs"
                          : isOwned
                            ? "bg-white border-slate-200"
                            : "bg-slate-50 border-slate-200 opacity-90"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl w-12 h-12 rounded-2xl bg-amber-100/60 flex items-center justify-center shadow-inner shrink-0">
                            {n.icon}
                          </span>
                          <div>
                            <div className="font-black text-xs sm:text-sm text-slate-900 font-hind-siliguri">
                              {n.nameBn}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">
                              {n.descBn}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isEquipped ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>রানিং</span>
                            </span>
                          ) : isOwned ? (
                            <button
                              onClick={() => handleEquipNeedle(n.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-500 hover:text-white text-slate-800 font-black text-xs transition cursor-pointer"
                            >
                              ব্যবহার করো
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyNeedle(n)}
                              disabled={!canAfford}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition cursor-pointer ${canAfford
                                ? "bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-xs active:scale-95"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                              <span>🪙</span>
                              <span>{n.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t mt-3 text-center">
              <button
                onClick={() => setIsShopOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md cursor-pointer"
              >
                খেলায় ফিরে যাও
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ COMPREHENSIVE GAME SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-amber-950/95 text-white rounded-3xl p-4 sm:p-6 w-[92%] max-w-sm text-center space-y-3.5 border-3 border-amber-500 shadow-2xl m-auto animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-800/80 pb-2.5">
              <div className="text-base font-black text-amber-200 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-900 text-amber-300">
                  <Settings className="w-4 h-4 stroke-[2.5]" />
                </span>
                <span>নিনজা গেম সেটিংস</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-amber-900/80 hover:bg-amber-800 text-amber-200 flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* 1. Duration Selection */}
            <div className="space-y-1.5 text-left">
              <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                <span>⏱️</span>
                <span>খেলার সময় নির্ধারণ করুন:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { sec: 30, title: "৩০ সেকেন্ড", sub: "দ্রুত রাউন্ড" },
                  { sec: 60, title: "৬০ সেকেন্ড", sub: "১ মিনিট (প্রস্তাবিত)" },
                  { sec: 90, title: "৯০ সেকেন্ড", sub: "দেড় মিনিট" },
                  { sec: 120, title: "১২০ সেকেন্ড", sub: "২ মিনিট (দীর্ঘ)" },
                ].map(({ sec, title, sub }) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      handleSelectDuration(sec);
                      setIsSettingsOpen(false);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-left transition cursor-pointer active:scale-95 ${
                      selectedDuration === sec
                        ? "bg-amber-500 border-amber-300 text-amber-950 shadow-md font-black"
                        : "bg-amber-900/40 border-amber-800/70 hover:bg-amber-900/80 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black font-hind-siliguri">{title}</div>
                      {selectedDuration === sec && <Check className="w-3.5 h-3.5 text-amber-950 stroke-[3]" />}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-medium">{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sound Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`w-full py-2.5 px-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black transition cursor-pointer active:scale-95 ${
                  !isMuted
                    ? "bg-amber-900/70 border-amber-500 text-amber-100"
                    : "bg-rose-950/70 border-rose-400 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {!isMuted ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                  <span>{!isMuted ? "সাউন্ড ও ভয়েস চালু আছে" : "সাউন্ড মিউট / বন্ধ আছে"}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                  {!isMuted ? "মিউট করুন" : "চালু করুন"}
                </span>
              </button>
            </div>

            {/* 3. Switch Mode & Shop */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {onSwitchToBubble && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    stopStudioGameAudio();
                    banglaAudioEngine.stop();
                    onSwitchToBubble();
                  }}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-600 hover:from-sky-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>🎈</span>
                  <span>বুদ্বুদ পপ মোড</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsShopOpen(true);
                }}
                className={`py-2.5 px-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  !onSwitchToBubble ? "col-span-2" : ""
                }`}
              >
                <span>🛒</span>
                <span>চাকুর দোকান</span>
              </button>
            </div>

            {/* 4. Restart Level & Back to Qaida */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  restartGame();
                }}
                className="flex-1 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer border border-amber-700/60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>নতুন করে শুরু</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  stopStudioGameAudio();
                  banglaAudioEngine.stop();
                  onClose();
                }}
                className="flex-1 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900 text-amber-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer border border-amber-700/60"
              >
                <Home className="w-3.5 h-3.5" />
                <span>কায়দায় ফেরা</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          GORGEOUS EDUCATIONAL RESULT & SUMMARY MODAL
          (READS RESULT ALOUD IN BENGALI, STRICT 40% PASS THRESHOLD & SURVIVAL REQUIREMENT FOR NEXT LEVEL)
      ══════════════════════════════════════════════════════════ */}
      {(gameState === "won" || gameState === "gameover") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto overflow-y-auto">
          <div
            className={`relative bg-gradient-to-b from-white via-amber-50/40 to-white rounded-3xl sm:rounded-[32px] p-4 sm:p-6 w-[90%] max-w-[380px] max-h-[94vh] text-center space-y-2.5 sm:space-y-3.5 border-4 sm:border-[5px] shadow-[0_10px_45px_rgba(0,0,0,0.6)] transition-all m-auto my-auto ${
              gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs"
                ? "border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.35)]"
                : "border-amber-400 shadow-[0_0_45px_rgba(245,158,11,0.3)]"
            }`}
          >
            {/* Sparkle Glow & Floating Icon */}
            <div className="space-y-1">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-3xl sm:text-4xl border-3 shadow-lg ${
                  gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs"
                    ? "bg-gradient-to-tr from-amber-200 via-yellow-100 to-amber-300 border-amber-400 text-amber-600 animate-bounce"
                    : "bg-gradient-to-tr from-rose-100 via-orange-100 to-amber-100 border-rose-300 text-rose-500"
                }`}
              >
                {gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs" ? "🏆" : "🎯"}
              </div>

              {gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs" ? (
                <>
                  <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl">
                    {collectionRate >= 80 ? "⭐⭐⭐" : collectionRate >= 60 ? "⭐⭐" : "⭐"}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-hind-siliguri">
                    مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800">
                    লেভেল {toBengaliDigits(targetIndex + 1)} সম্পন্ন! হরফ <strong>{targetItem.nameBn} ({targetItem.ar})</strong> সফলভাবে চিনেছ!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg sm:text-xl font-black text-rose-700 font-hind-siliguri">
                    {finishReason === "bombs" || lives <= 0 ? "💥 বোমা বিস্ফোরণ!" : "আবার চেষ্টা করো! 💪"}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 font-hind-siliguri">
                    লেভেল {toBengaliDigits(targetIndex + 1)}: {targetItem.nameBn} ({targetItem.ar})
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    {finishReason === "bombs" || lives <= 0
                      ? "বোমা এড়িয়ে সময় শেষ হওয়া পর্যন্ত টিকে অন্তত ৪০% সংগ্রহ করতে হবে।"
                      : "পরবর্তী লেভেলে যেতে হলে অন্তত ৪০% সংগ্রহ করতে হবে।"}
                  </p>
                </>
              )}
            </div>

            {/* Spoken Voice Announcement Box with Audio Replay */}
            <div
              className={`p-2.5 rounded-2xl border text-center transition flex items-center justify-between gap-2 ${
                gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs"
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                  : "bg-rose-50/90 border-rose-200 text-rose-950"
              }`}
            >
              <div className="text-xs font-bold font-hind-siliguri text-left truncate">
                {finishReason === "bombs" || lives <= 0
                  ? "💥 বোমা বিস্ফোরণে হেরে গেছ! আবার চেষ্টা করো!"
                  : gameState === "won" && collectionRate >= 40 && lives > 0
                  ? `মাশাআল্লাহ! তুমি ${toBengaliDigits(collectionRate)}% সংগ্রহ করেছো!`
                  : `তুমি ${toBengaliDigits(collectionRate)}% সংগ্রহ করেছো। আবার খেলো!`}
              </div>
              <button
                type="button"
                onClick={handleSpeakResultAgain}
                className="px-2 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-xs text-xs font-black text-slate-700 flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
                title="ফলাফল শুনুন"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">শুনুন</span>
              </button>
            </div>

            {/* 3 Compact Educational Analytic Stats Cards (NO "মিস হয়েছে" card!) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="text-[10px] text-sky-800 font-bold">মোট হরফ</div>
                <div className="text-sm sm:text-base font-black text-sky-950 font-mono">
                  {toBengaliDigits(totalTargetSpawned)}টি
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] text-emerald-800 font-bold">সংগ্রহ করেছ</div>
                <div className="text-sm sm:text-base font-black text-emerald-950 font-mono">
                  {toBengaliDigits(collectedCount)}টি
                </div>
              </div>

              <div
                className={`p-2 sm:p-2.5 rounded-2xl border ${
                  collectionRate >= 40 && lives > 0 && finishReason !== "bombs"
                    ? "bg-teal-50 border-teal-200 text-teal-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="text-[10px] font-bold">সংগ্রহের হার</div>
                <div className="text-sm sm:text-base font-black font-mono">
                  {toBengaliDigits(collectionRate)}%
                </div>
              </div>
            </div>

            {/* Rewards Pill */}
            <div className="text-xs font-black text-amber-900 bg-amber-100/70 py-1.5 px-3 rounded-xl border border-amber-300 flex items-center justify-around">
              <span>স্কোর: {toBengaliDigits(score)} ⭐</span>
              <span>•</span>
              <span>
                {gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs" ? "+৫০ 🪙 কয়েন" : "🪙 ০ কয়েন"}
              </span>
            </div>

            {/* Action Buttons (Large, high-contrast, child-friendly tap targets) */}
            <div className="space-y-2 pt-1">
              {/* Next Level Button (Strict Invariant: Only unlocked if survived timer, lives > 0, reason !== "bombs", and collectionRate >= 40%!) */}
              {gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs" && onNextLetter ? (
                <>
                  <button
                    onClick={() => {
                      stopStudioGameAudio();
                      banglaAudioEngine.stop();
                      onNextLetter();
                      restartGame();
                    }}
                    className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 animate-pulse cursor-pointer border-2 border-emerald-300"
                  >
                    <span>পরবর্তী লেভেল খেলুন</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        stopStudioGameAudio();
                        banglaAudioEngine.stop();
                        restartGame();
                      }}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>আবার খেলুন</span>
                    </button>
                    <button
                      onClick={() => {
                        stopStudioGameAudio();
                        banglaAudioEngine.stop();
                        onClose();
                      }}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer border border-slate-200"
                    >
                      <span>কায়দায় ফেরা</span>
                    </button>
                  </div>

                  {/* Switch to Bubble Pop Game */}
                  {onSwitchToBubble && (
                    <button
                      onClick={() => {
                        stopStudioGameAudio();
                        banglaAudioEngine.stop();
                        onSwitchToBubble();
                      }}
                      className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>🎈 বুদ্বুদ ফুটানো খেলায় যান</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Big Glowing Play Again Button for Kids */}
                  <button
                    onClick={() => {
                      stopStudioGameAudio();
                      banglaAudioEngine.stop();
                      restartGame();
                    }}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base sm:text-lg shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 animate-pulse cursor-pointer border-2 border-amber-300"
                  >
                    <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                    <span>🔄 আবার খেলুন</span>
                  </button>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>পাস করতে অন্তত ৪০% সংগ্রহ ও বোমা এড়াতে হবে</span>
                    </div>
                    <button
                      onClick={() => {
                        stopStudioGameAudio();
                        banglaAudioEngine.stop();
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      কায়দায় ফেরা
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
