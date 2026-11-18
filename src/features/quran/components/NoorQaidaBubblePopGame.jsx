"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Home,
  X,
  RotateCcw,
  ChevronRight,
  Check,
  Lock,
  Settings,
} from "lucide-react";
import { universalAudioEngine, QAIDA_TAKHTI_1_LETTERS } from "@/lib/quran/audio";
import { banglaAudioEngine } from "@/lib/quran/bangla-audio-engine";
import { playMaShaAllahCelebration } from "@/features/ai-learning/lib/arabicSoundPlayer";
import {
  SHOP_NEEDLES,
  SHOP_BLADES,
  getStoredCoins,
  saveCoins,
  getUnlockedNeedles,
  getEquippedNeedle,
  getUnlockedBlades,
  getEquippedBlade,
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

// ── 12 DIVERSE SCENIC BACKGROUNDS (EVERY LETTER & WORD GETS A UNIQUE SCENE) ──
export function getSceneForItem(item) {
  const str =
    typeof item === "string"
      ? item
      : item?.id || item?.ar || item?.sound || item?.nameBn || "default";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 37 + str.charCodeAt(i)) & 0xffffffff;
  }
  const SCENE_KEYS = [
    "bridge",   // ১. ঝুলন্ত সেতু ও আধুনিক শহর
    "oasis",    // ২. মরুদ্যানে তারার রাত ও সোনালী চাঁদ
    "rainbow",  // ৩. সবুজ উপত্যকা ও পাহাড়ি রংধনু
    "sunset",   // ৪. সূর্যাস্ত ও বাতিঘর সমুদ্র সৈকত
    "mosque",   // ৫. স্বর্ণালী গম্বুজ ও মসজিদ প্রাঙ্গণ
    "garden",   // ৬. বসন্তের ফুলের বাগান ও প্রজাপতি
    "island",   // ৭. নীল সাগরে নারকেল গাছের দ্বীপ
    "space",    // ৮. মহাজাগতিক নীহারিকা ও বলয়যুক্ত শনি গ্রহ
    "snow",     // ৯. তুষারশুভ্র বরফের পাহাড় ও পাইন বন
    "windmill", // ১০. সোনালী শস্যক্ষেত ও উইন্ডমিল
    "clouds",   // ১১. তুলোর মতো মেঘের ভেলা ও সোনালী সূর্য
    "ocean",    // ১২. শান্ত সাগরে পালতোলা সাম্পান ও ডলফিন
  ];
  return SCENE_KEYS[Math.abs(hash) % SCENE_KEYS.length];
}

// ── FRUITS POOL FOR BONUS BUBBLES ──
const BONUS_FRUITS = [
  { icon: "🍎", nameBn: "আপেল", sound: "apple" },
  { icon: "🥭", nameBn: "আম", sound: "mango" },
  { icon: "🍉", nameBn: "তরমুজ", sound: "watermelon" },
  { icon: "🍓", nameBn: "স্ট্রবেরি", sound: "strawberry" },
  { icon: "🍌", nameBn: "কলা", sound: "banana" },
  { icon: "🍇", nameBn: "আঙুর", sound: "grape" },
  { icon: "🍍", nameBn: "আনারস", sound: "pineapple" },
  { icon: "🍊", nameBn: "কমলা", sound: "orange" },
];

// ── DISTRACTOR LETTERS POOL ──
const DISTRACTOR_LETTERS = [
  { ar: "ب", nameBn: "বা" },
  { ar: "ت", nameBn: "তা" },
  { ar: "ث", nameBn: "ছা" },
  { ar: "ج", nameBn: "জীম" },
  { ar: "ح", nameBn: "হা" },
  { ar: "خ", nameBn: "খা" },
  { ar: "د", nameBn: "দাল" },
  { ar: "ذ", nameBn: "যাল" },
  { ar: "ر", nameBn: "রা" },
  { ar: "ز", nameBn: "যা" },
  { ar: "ش", nameBn: "শীন" },
  { ar: "ص", nameBn: "ছোয়াদ" },
  { ar: "ض", nameBn: "দোয়াদ" },
  { ar: "ط", nameBn: "তোয়া" },
  { ar: "ظ", nameBn: "যোয়া" },
  { ar: "ع", nameBn: "আইন" },
  { ar: "غ", nameBn: "গাইন" },
  { ar: "ف", nameBn: "ফা" },
  { ar: "ق", nameBn: "ক্বাফ" },
  { ar: "ك", nameBn: "কাফ" },
  { ar: "ل", nameBn: "লাম" },
  { ar: "م", nameBn: "মীম" },
  { ar: "ن", nameBn: "নূন" },
  { ar: "و", nameBn: "ওয়াও" },
  { ar: "هـ", nameBn: "হা" },
  { ar: "ي", nameBn: "ইয়া" },
];

// ── BUBBLE COLOR THEMES (TRANSLUCENT 3D IRIDESCENT) ──
const BUBBLE_THEMES = [
  {
    bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.6) 40%, rgba(59,130,246,0.35) 75%, rgba(37,99,235,0.5) 100%)",
    border: "rgba(147,197,253,0.8)",
    shadow: "0 10px 25px rgba(59,130,246,0.35), inset 0 0 15px rgba(255,255,255,0.7)",
  },
  {
    bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(216,180,254,0.6) 40%, rgba(168,85,247,0.35) 75%, rgba(147,51,234,0.5) 100%)",
    border: "rgba(216,180,254,0.8)",
    shadow: "0 10px 25px rgba(168,85,247,0.35), inset 0 0 15px rgba(255,255,255,0.7)",
  },
  {
    bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(253,224,71,0.6) 40%, rgba(245,158,11,0.35) 75%, rgba(217,119,6,0.5) 100%)",
    border: "rgba(253,224,71,0.8)",
    shadow: "0 10px 25px rgba(245,158,11,0.35), inset 0 0 15px rgba(255,255,255,0.7)",
  },
  {
    bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(110,231,183,0.6) 40%, rgba(16,185,129,0.35) 75%, rgba(5,150,105,0.5) 100%)",
    border: "rgba(110,231,183,0.8)",
    shadow: "0 10px 25px rgba(16,185,129,0.35), inset 0 0 15px rgba(255,255,255,0.7)",
  },
  {
    bg: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(253,164,175,0.6) 40%, rgba(244,63,94,0.35) 75%, rgba(225,29,72,0.5) 100%)",
    border: "rgba(253,164,175,0.8)",
    shadow: "0 10px 25px rgba(244,63,94,0.35), inset 0 0 15px rgba(255,255,255,0.7)",
  },
];

export default function NoorQaidaBubblePopGame({
  targetItem = { ar: "س", nameBn: "সীন", sound: "س" },
  onClose = () => { },
  onNextLetter = null,
  onLaunchNinja = null,
}) {
  // Game States
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetCount, setTargetCount] = useState(0);
  const TARGET_GOAL = 10;
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won' | 'gameover'
  const [finishReason, setFinishReason] = useState(null); // 'timeout' | 'bombs'
  const [isMuted, setIsMuted] = useState(false);
  const [activeBubbles, setActiveBubbles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [flashRed, setFlashRed] = useState(false);

  // Progressive Round Counter (Rounds 1, 2, 3 -> then Haruf Ninja unlocks!)
  const [bubbleRound, setBubbleRound] = useState(1);

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

  // Coins & Shop Inventory System (পয়েন্ট জমিয়ে সুই, কাঠি ও চাকু কেনা)
  const [coins, setCoins] = useState(() => getStoredCoins());
  const [unlockedNeedles, setUnlockedNeedles] = useState(() => getUnlockedNeedles());
  const [equippedNeedleId, setEquippedNeedleId] = useState(() => getEquippedNeedle());
  const [unlockedBlades, setUnlockedBlades] = useState(() => getUnlockedBlades());
  const [equippedBladeId, setEquippedBladeId] = useState(() => getEquippedBlade());
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState("needles"); // 'needles' | 'blades'

  // Dynamic Scene strictly bound to this specific target letter/word
  const currentScene = useMemo(() => getSceneForItem(targetItem), [targetItem]);

  // Equipped needle metadata
  const equippedNeedle = useMemo(
    () => SHOP_NEEDLES.find((n) => n.id === equippedNeedleId) || SHOP_NEEDLES[0],
    [equippedNeedleId]
  );

  // References
  const nextBubbleId = useRef(1);
  const containerRef = useRef(null);
  const playfieldRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const isSwipingRef = useRef(false);
  const poppedBubbleIdsRef = useRef(new Set());
  const currentStudioAudioRef = useRef(null);
  const targetStreakRef = useRef(0);
  const fruitStreakRef = useRef(0);
  const laneSeqIndexRef = useRef(0);
  const lastSpawnedLaneRef = useRef(-1);

  // 5 Strategic Screen Lanes (Weighted heavily towards Center):
  // Lane 0: 14% - 22% (Left)
  // Lane 1: 30% - 38% (Mid-Left)
  // Lane 2: 44% - 56% (Center Primary)
  // Lane 3: 62% - 70% (Mid-Right)
  // Lane 4: 76% - 84% (Right)
  const SPAWN_LANES = useMemo(
    () => [
      { min: 14, max: 22 }, // 0: Left
      { min: 30, max: 38 }, // 1: Mid-Left
      { min: 44, max: 56 }, // 2: Center Primary
      { min: 62, max: 70 }, // 3: Mid-Right
      { min: 76, max: 84 }, // 4: Right
    ],
    []
  );
  // Pattern alternating across screen but centering every other bubble
  const CENTER_WEIGHTED_PATTERN = useMemo(() => [2, 1, 2, 3, 2, 0, 2, 4], []);

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

  // Responsive & Orientation State with Session-level Dismissal Persistence
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

  // ── SAVE COINS HELPER ──
  const addCoins = (amount) => {
    setCoins((prev) => {
      const next = prev + amount;
      saveCoins(next);
      return next;
    });
  };

  // ── WEB AUDIO SYNTHESIZERS ──
  const playWebAudioPop = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.09);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch { }
  }, [isMuted]);

  const playFruitPopSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      [659, 880, 1046].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
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

      const bufferSize = Math.floor(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.5);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.5);
      osc.stop(now + 0.5);
    } catch { }
  }, [isMuted]);

  const playVictoryFanfare = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch { }
  }, [isMuted]);

  // ── SPAWN A BUBBLE (STRICT PROGRESSIVE LETTERS & COMFORTABLE SPEED) ──
  const spawnBubble = useCallback(() => {
    if (gameState !== "playing") return;

    const id = nextBubbleId.current++;

    // ── BALANCED SCREEN SPREAD (HEAVILY CENTER-WEIGHTED TO PREVENT SIDE-CLUSTERING) ──
    let lane = CENTER_WEIGHTED_PATTERN[laneSeqIndexRef.current % CENTER_WEIGHTED_PATTERN.length];
    laneSeqIndexRef.current = (laneSeqIndexRef.current + 1) % CENTER_WEIGHTED_PATTERN.length;
    if (lane === lastSpawnedLaneRef.current) {
      lane = lane === 2 ? 1 : 2;
    }
    lastSpawnedLaneRef.current = lane;

    const targetLane = SPAWN_LANES[lane] || SPAWN_LANES[2];
    const xPos = Math.floor(Math.random() * (targetLane.max - targetLane.min + 1)) + targetLane.min;
    const size = Math.floor(Math.random() * 24) + 78;

    // Comfortable upward float speed for children (no frantic racing)
    const currentLevel = bubbleRound === 1 && score < 60 ? 1 : score < 140 ? 2 : 3;
    const duration =
      currentLevel === 1
        ? Math.random() * 2.2 + 7.2
        : currentLevel === 2
          ? Math.random() * 1.8 + 5.5
          : Math.random() * 1.4 + 4.2;

    const theme = BUBBLE_THEMES[Math.floor(Math.random() * BUBBLE_THEMES.length)];
    const rand = Math.random();

    let type = "target";
    let content = targetItem.ar || "ا";
    let nameBn = targetItem.nameBn || "হরফ";
    let sound = targetItem.sound || targetItem.ar;

    // Strict cumulative spawning:
    // If learnedDistractors is empty (Alif): ONLY Alif, fruits, and bombs can spawn.
    // Future unlearned letters (Baa, Taa, Ayn, etc.) have 0% probability!
    if (learnedDistractors.length === 0) {
      if (rand < 0.58) {
        type = "target";
        content = targetItem.ar;
        nameBn = targetItem.nameBn;
        sound = targetItem.sound || targetItem.ar;
      } else if (rand < 0.88) {
        type = "fruit";
        const fruit = BONUS_FRUITS[Math.floor(Math.random() * BONUS_FRUITS.length)];
        content = fruit.icon;
        nameBn = fruit.nameBn;
        sound = fruit.sound;
      } else {
        type = "bomb";
        content = "💣";
        nameBn = "বিপদজনক বোমা";
        sound = "bomb";
      }
    } else {
      // For Baa, Taa, Thaa etc.: Target letter 45%, Distractor (strictly prior learned letter) 20%, Fruit 25%, Bomb 10%
      if (rand < 0.45) {
        type = "target";
        content = targetItem.ar;
        nameBn = targetItem.nameBn;
        sound = targetItem.sound || targetItem.ar;
      } else if (rand < 0.65) {
        type = "distractor";
        const dist = learnedDistractors[Math.floor(Math.random() * learnedDistractors.length)];
        content = dist.ar;
        nameBn = dist.nameBn;
        sound = dist.ar;
      } else if (rand < 0.88) {
        type = "fruit";
        const fruit = BONUS_FRUITS[Math.floor(Math.random() * BONUS_FRUITS.length)];
        content = fruit.icon;
        nameBn = fruit.nameBn;
        sound = fruit.sound;
      } else {
        type = "bomb";
        content = "💣";
        nameBn = "বিপদজনক বোমা";
        sound = "bomb";
      }
    }

    if (type === "target") {
      totalTargetSpawnedRef.current += 1;
      setSpawnStats((prev) => ({ ...prev, total: prev.total + 1 }));
    }

    const newBubble = {
      id,
      xPos,
      size,
      duration,
      theme,
      type,
      content,
      nameBn,
      sound,
      createdAt: Date.now(),
    };

    setActiveBubbles((prev) => [...prev, newBubble]);
  }, [gameState, targetItem, score, bubbleRound, learnedDistractors, CENTER_WEIGHTED_PATTERN, SPAWN_LANES]);

  // ── CLEANUP BUBBLES THAT REACH TOP ──
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveBubbles((prev) =>
        prev.filter((b) => now - b.createdAt < (b.duration + 0.5) * 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── GAME LOOP SPAWNER ──
  useEffect(() => {
    if (gameState !== "playing") return;

    const intervalTime =
      bubbleRound === 1 && score < 60 ? 1500 : score < 140 ? 1100 : 800;

    spawnBubble();
    const timer1 = setTimeout(spawnBubble, Math.floor(intervalTime * 0.4));

    spawnTimerRef.current = setInterval(() => {
      spawnBubble();
    }, intervalTime);

    return () => {
      clearTimeout(timer1);
      clearInterval(spawnTimerRef.current);
    };
  }, [gameState, spawnBubble, score, bubbleRound]);

  // ── POP BUBBLE HANDLER ──
  const handlePopBubble = useCallback((bubble, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (gameState !== "playing") return;
    if (poppedBubbleIdsRef.current.has(bubble.id)) return;
    poppedBubbleIdsRef.current.add(bubble.id);

    setActiveBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    let clickX = window.innerWidth / 2;
    let clickY = window.innerHeight / 2;
    if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
      clickX = e.clientX;
      clickY = e.clientY;
    } else if (e && e.currentTarget && e.currentTarget.getBoundingClientRect) {
      const rect = e.currentTarget.getBoundingClientRect();
      clickX = rect.left + rect.width / 2;
      clickY = rect.top + rect.height / 2;
    }

    // Visual particles colored by the equipped needle/wand!
    createParticles(clickX, clickY, equippedNeedle);

    if (bubble.type === "target") {
      playWebAudioPop();
      if (!isMuted) {
        // 1. ALWAYS recite authentic Takhti 1 letter audio (Alif, Baa, Taa, etc.)
        universalAudioEngine.playLetter(bubble.content || targetItem.ar);

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

      setScore((s) => s + 20);
      addCoins(5); // Earn 5 coins per target letter!
      const newTargetCount = targetCount + 1;
      setTargetCount(newTargetCount);
      collectedTargetRef.current = newTargetCount;
      setSpawnStats((prev) => ({ ...prev, collected: newTargetCount }));

      showFloatingNote(clickX, clickY, `+২০ ⭐ (🪙+৫)`, "text-amber-300");
    } else if (bubble.type === "fruit") {
      // Gentle web audio pop for tactile touch
      playFruitPopSound();
      fruitStreakRef.current += 1;

      // Strict Rule: No voice praise on every fruit so children don't get distracted from letters.
      // Only after popping 5 fruits (fruitStreakRef >= 5), play a single appreciation voice.
      if (!isMuted && fruitStreakRef.current >= 5) {
        fruitStreakRef.current = 0;
        const fruitVoices = [
          "/audio/game/bah.mp3",
          "/audio/game/chomothkar.mp3",
        ];
        const selectedVoice = fruitVoices[Math.floor(Math.random() * fruitVoices.length)];
        playStudioGameAudio(selectedVoice);
      }
      setScore((s) => s + 10);
      addCoins(3); // Earn 3 coins for fruit!
      showFloatingNote(clickX, clickY, `+১০ ${bubble.content} (🪙+৩)`, "text-emerald-300");
    } else if (bubble.type === "distractor") {
      playWebAudioPop();
      if (!isMuted) {
        universalAudioEngine.playLetter(bubble.content || bubble.sound);
      }
      setScore((s) => s + 2);
      showFloatingNote(clickX, clickY, "+২ (অন্য হরফ)", "text-slate-200");
    } else if (bubble.type === "bomb") {
      playBombExplosionSound();
      setIsShaking(true);
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 300);
      setTimeout(() => setIsShaking(false), 600);

      showFloatingNote(clickX, clickY, "💥 বোমা! -১ জীবন", "text-rose-400 font-black");

      setLives((prevLives) => {
        const nextLives = Math.max(0, prevLives - 1);
        if (nextLives <= 0) {
          handleRoundFinish("bombs");
        }
        return nextLives;
      });
    }
  }, [gameState, equippedNeedle, isMuted, playWebAudioPop, playFruitPopSound, playBombExplosionSound, targetCount, lives, playStudioGameAudio, targetItem]);

  // ── SWIPE-TO-SLICE TOUCH & DRAG HANDLER ──
  const handlePointerSwipe = useCallback((e) => {
    if (gameState !== "playing" || !playfieldRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (typeof clientX !== "number" || typeof clientY !== "number") return;

    const bubbleElements = playfieldRef.current.querySelectorAll("[data-bubble-id]");
    bubbleElements.forEach((el) => {
      const bId = Number(el.getAttribute("data-bubble-id"));
      if (!bId || poppedBubbleIdsRef.current.has(bId)) return;
      const rect = el.getBoundingClientRect();
      const margin = 12;
      if (
        clientX >= rect.left - margin &&
        clientX <= rect.right + margin &&
        clientY >= rect.top - margin &&
        clientY <= rect.bottom + margin
      ) {
        const found = activeBubbles.find((b) => b.id === bId);
        if (found) {
          handlePopBubble(found, { clientX, clientY, currentTarget: el, stopPropagation: () => { } });
        }
      }
    });
  }, [gameState, activeBubbles, handlePopBubble]);

  // ── PARTICLE EXPLOSION GENERATOR ──
  const createParticles = (x, y, needle) => {
    const newParticles = [];
    const count = needle.sparkleType === "magic" || needle.sparkleType === "lightning" ? 18 : 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = Math.random() * 95 + 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      let color = "rgba(255,255,255,0.95)";
      if (needle.sparkleType === "magic") {
        color = i % 2 === 0 ? "#f43f5e" : "#c084fc";
      } else if (needle.sparkleType === "lightning") {
        color = i % 2 === 0 ? "#38bdf8" : "#fef08a";
      } else if (needle.sparkleType === "gold") {
        color = "#f59e0b";
      }

      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx,
        vy,
        color,
        size: Math.random() * 8 + 4,
        createdAt: Date.now(),
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.createdAt < 700));
    }, 700);
  };

  // ── FLOATING SCORE NOTE GENERATOR ──
  const showFloatingNote = (x, y, text, colorClass) => {
    const note = {
      id: Math.random(),
      x,
      y,
      text,
      colorClass,
      createdAt: Date.now(),
    };
    setFloatingNotes((prev) => [...prev, note]);
    setTimeout(() => {
      setFloatingNotes((prev) => prev.filter((n) => n.id !== note.id));
    }, 1100);
  };

  // ── EDUCATIONAL METRICS CALCULATION ──
  const totalTargetSpawned = Math.max(spawnStats.total, targetCount, 1);
  const collectedCount = targetCount;
  const _missedCount = Math.max(0, totalTargetSpawned - collectedCount);
  const collectionRate = Math.round((collectedCount / totalTargetSpawned) * 100);
  const _isPassed = gameState === "won" && collectionRate >= 40 && lives > 0 && finishReason !== "bombs";

  // ── ROUND FINISH HANDLER (40% PASS THRESHOLD & SURVIVAL REQUIREMENT) ──
  const handleRoundFinish = useCallback((reason = "timeout") => {
    setFinishReason(reason);
    const total = Math.max(totalTargetSpawnedRef.current, collectedTargetRef.current, 1);
    const collected = collectedTargetRef.current;
    const rate = Math.round((collected / total) * 100);
    // Strict Invariant: Next level only unlocks if the player survived until the end of round time (reason !== "bombs") AND achieved >= 40%
    const passed = rate >= 40 && reason !== "bombs";

    if (passed) {
      setGameState("won");
      addCoins(50);
      try {
        playVictoryFanfare();
      } catch { }
    } else {
      setGameState("gameover");
    }
  }, [playVictoryFanfare, addCoins]);

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

  // ── RESTART OR ADVANCE ROUND ──
  const restartGame = () => {
    stopStudioGameAudio();
    banglaAudioEngine.stop();
    setScore(0);
    setLives(3);
    setTargetCount(0);
    totalTargetSpawnedRef.current = 0;
    collectedTargetRef.current = 0;
    targetStreakRef.current = 0;
    fruitStreakRef.current = 0;
    setSpawnStats({ total: 0, collected: 0 });
    setTimeLeft(selectedDuration);
    setActiveBubbles([]);
    hasAnnouncedVoiceRef.current = false;
    setFinishReason(null);
    setGameState("playing");
  };

  const handleNextRound = () => {
    stopStudioGameAudio();
    banglaAudioEngine.stop();
    setBubbleRound((r) => r + 1);
    setTargetCount(0);
    totalTargetSpawnedRef.current = 0;
    collectedTargetRef.current = 0;
    targetStreakRef.current = 0;
    fruitStreakRef.current = 0;
    setSpawnStats({ total: 0, collected: 0 });
    setTimeLeft(selectedDuration);
    setActiveBubbles([]);
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

  // ── COUNTDOWN TIMER TICK EFFECT ──
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

  // ── SHOP PURCHASE & EQUIP HANDLERS ──
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

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden select-none flex flex-col justify-between font-hind-siliguri ${isShaking ? "animate-shake" : ""
        }`}
      style={{
        background:
          currentScene === "oasis"
            ? "linear-gradient(180deg, #090d16 0%, #1e1b4b 40%, #312e81 70%, #d97706 100%)"
            : currentScene === "rainbow"
              ? "linear-gradient(180deg, #38bdf8 0%, #a7f3d0 45%, #6ee7b7 75%, #059669 100%)"
              : currentScene === "sunset"
                ? "linear-gradient(180deg, #4c1d95 0%, #c2410c 45%, #ea580c 70%, #7c2d12 100%)"
                : currentScene === "mosque"
                  ? "linear-gradient(180deg, #042f2e 0%, #115e59 45%, #0d9488 75%, #d97706 100%)"
                  : currentScene === "garden"
                    ? "linear-gradient(180deg, #60a5fa 0%, #fbcfe8 45%, #f472b6 75%, #15803d 100%)"
                    : currentScene === "island"
                      ? "linear-gradient(180deg, #0284c7 0%, #38bdf8 50%, #fef08a 85%, #0284c7 100%)"
                      : currentScene === "space"
                        ? "linear-gradient(180deg, #030712 0%, #3b0764 45%, #6b21a8 75%, #1e1b4b 100%)"
                        : currentScene === "snow"
                          ? "linear-gradient(180deg, #93c5fd 0%, #e0f2fe 50%, #f8fafc 85%, #0369a1 100%)"
                          : currentScene === "windmill"
                            ? "linear-gradient(180deg, #38bdf8 0%, #fef08a 55%, #f59e0b 80%, #b45309 100%)"
                            : currentScene === "clouds"
                              ? "linear-gradient(180deg, #0ea5e9 0%, #7dd3fc 45%, #fef08a 80%, #ffffff 100%)"
                              : currentScene === "ocean"
                                ? "linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 80%, #082f49 100%)"
                                : "linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #bae6fd 70%, #60a5fa 100%)",
      }}
    >
      {/* ── RED FLASH ON BOMB HIT ── */}
      {flashRed && (
        <div className="absolute inset-0 bg-rose-600/40 pointer-events-none z-40 transition-opacity duration-200" />
      )}

      {/* ══════════════════════════════════════════════════════════
          12 RICH SCENIC CARTOON WORLDS (BOUND SPECIFICALLY TO ITEMS)
      ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {currentScene === "oasis" ? (
          /* ── 2. ISLAMIC OASIS & STARRY NIGHT ── */
          <>
            <div className="absolute top-6 right-16 text-6xl filter drop-shadow-[0_0_25px_rgba(253,224,71,0.9)] animate-pulse">
              🌙
            </div>
            {[12, 35, 55, 75, 88].map((l, i) => (
              <span key={i} className="absolute text-amber-200 text-xs animate-ping" style={{ top: `${10 + i * 4}%`, left: `${l}%` }}>
                ✦
              </span>
            ))}
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,210 Q300,160 600,200 T1200,190 L1200,300 L0,300 Z" fill="#b45309" opacity="0.8" />
                <path d="M0,230 Q350,185 750,225 T1200,215 L1200,300 L0,300 Z" fill="#d97706" />
                <g fill="#0f172a">
                  <rect x="520" y="100" width="16" height="150" />
                  <polygon points="528,60 520,100 536,100" fill="#f59e0b" />
                  <rect x="660" y="100" width="16" height="150" />
                  <polygon points="668,60 660,100 676,100" fill="#f59e0b" />
                  <path d="M560,250 L560,160 Q600,100 640,160 L640,250 Z" />
                </g>
              </svg>
            </div>
          </>
        ) : currentScene === "rainbow" ? (
          /* ── 3. RAINBOW VALLEY & WATERFALL ── */
          <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none opacity-85">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="rbGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="20%" stopColor="#f97316" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="60%" stopColor="#22c55e" />
                    <stop offset="80%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d="M 50,380 A 350,350 0 0,1 750,380" fill="none" stroke="url(#rbGrad)" strokeWidth="30" />
              </svg>
            </div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,180 Q300,100 600,170 T1200,140 L1200,300 L0,300 Z" fill="#15803d" />
                <path d="M0,210 Q400,150 800,210 T1200,190 L1200,300 L0,300 Z" fill="#22c55e" />
                <rect x="580" y="160" width="35" height="140" fill="#bae6fd" opacity="0.9" />
              </svg>
            </div>
          </>
        ) : currentScene === "sunset" ? (
          /* ── 4. SUNSET BEACH & LIGHTHOUSE ── */
          <>
            <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-t from-amber-400 to-rose-500 blur-md opacity-90 animate-pulse" />
            <div className="absolute top-12 left-1/4 text-2xl">🕊️</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,230 Q300,180 700,230 T1200,220 L1200,300 L0,300 Z" fill="#431407" />
                <polygon points="980,80 965,240 1005,240" fill="#f8fafc" />
                <polygon points="980,55 968,80 992,80" fill="#b91c1c" />
                <polygon points="980,70 400,20 420,160" fill="#fef08a" opacity="0.35" />
              </svg>
            </div>
          </>
        ) : currentScene === "mosque" ? (
          /* ── 5. GOLDEN MOSQUE & COURTYARD ── */
          <>
            <div className="absolute top-8 left-1/4 text-5xl">🕌</div>
            <div className="absolute top-10 right-1/4 text-4xl">🏮</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,220 Q400,170 800,220 T1200,210 L1200,300 L0,300 Z" fill="#0f766e" />
                <rect x="500" y="80" width="200" height="180" rx="8" fill="#134e4a" />
                <path d="M500,80 Q600,0 700,80 Z" fill="#f59e0b" />
              </svg>
            </div>
          </>
        ) : currentScene === "garden" ? (
          /* ── 6. SPRING FLOWER GARDEN & BUTTERFLIES ── */
          <>
            <div className="absolute top-12 left-1/3 text-3xl animate-bounce">🦋</div>
            <div className="absolute top-16 right-1/4 text-2xl animate-bounce">🌸</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,200 Q300,150 700,210 T1200,190 L1200,300 L0,300 Z" fill="#16a34a" />
                <circle cx="200" cy="220" r="30" fill="#f472b6" />
                <circle cx="220" cy="210" r="25" fill="#fbcfe8" />
                <circle cx="850" cy="230" r="35" fill="#facc15" />
              </svg>
            </div>
          </>
        ) : currentScene === "island" ? (
          /* ── 7. TROPICAL ISLAND & PALM TREES ── */
          <>
            <div className="absolute top-6 left-12 text-5xl">☀️</div>
            <div className="absolute top-14 left-1/3 text-3xl">🕊️</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,230 Q350,170 700,220 T1200,210 L1200,300 L0,300 Z" fill="#0284c7" opacity="0.6" />
                <ellipse cx="600" cy="245" rx="320" ry="55" fill="#fef08a" />
                <g transform="translate(560, 90) scale(1.1)">
                  <path d="M40,150 Q55,70 30,0" stroke="#78350f" strokeWidth="8" fill="none" />
                  <text x="5" y="10" fontSize="36">🌴</text>
                </g>
                <g transform="translate(680, 105) scale(0.9)">
                  <path d="M40,150 Q25,80 45,0" stroke="#78350f" strokeWidth="7" fill="none" />
                  <text x="25" y="10" fontSize="32">🌴</text>
                </g>
              </svg>
            </div>
          </>
        ) : currentScene === "space" ? (
          /* ── 8. COSMIC SPACE & SATURN PLANET ── */
          <>
            <div className="absolute top-10 right-20 text-6xl animate-pulse">🪐</div>
            <div className="absolute top-16 left-24 text-3xl">🚀</div>
            <div className="absolute top-32 left-1/2 text-2xl text-cyan-200 animate-ping">🌠</div>
          </>
        ) : currentScene === "snow" ? (
          /* ── 9. SNOWY MOUNTAIN & PINE TREES ── */
          <>
            <div className="absolute top-6 left-1/3 text-4xl">🏔️</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <polygon points="150,280 300,60 450,280" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                <polygon points="550,280 750,40 950,280" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
              </svg>
            </div>
          </>
        ) : currentScene === "windmill" ? (
          /* ── 10. GOLDEN WHEATFIELD & WINDMILL ── */
          <>
            <div className="absolute top-8 left-16 text-5xl">☀️</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,200 Q300,150 700,200 T1200,180 L1200,300 L0,300 Z" fill="#eab308" />
                <path d="M0,225 Q400,175 800,225 T1200,205 L1200,300 L0,300 Z" fill="#ca8a04" />
                <polygon points="900,220 920,80 940,220" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
                <polygon points="915,80 930,55 945,80" fill="#b91c1c" />
                <line x1="880" y1="80" x2="980" y2="80" stroke="#334155" strokeWidth="4" />
                <line x1="930" y1="30" x2="930" y2="130" stroke="#334155" strokeWidth="4" />
              </svg>
            </div>
          </>
        ) : currentScene === "clouds" ? (
          /* ── 11. HEAVENLY CLOUD KINGDOM ── */
          <>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-7xl filter drop-shadow-[0_0_35px_rgba(250,204,21,0.9)] animate-pulse">
              ☀️
            </div>
            <div className="absolute top-16 left-1/4 text-4xl">🕊️</div>
            <div className="absolute top-20 right-1/4 text-3xl">🕊️</div>
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,220 Q200,160 400,210 Q600,150 800,200 Q1000,160 1200,210 L1200,300 L0,300 Z" fill="#f8fafc" opacity="0.9" />
                <path d="M0,240 Q250,190 500,230 Q750,180 1000,230 Q1100,200 1200,230 L1200,300 L0,300 Z" fill="#ffffff" />
              </svg>
            </div>
          </>
        ) : currentScene === "ocean" ? (
          /* ── 12. OCEAN SAILING SHIP & DOLPHINS ── */
          <>
            <div className="absolute bottom-[32%] left-1/4 text-4xl">⛵</div>
            <div className="absolute bottom-[30%] right-1/3 text-4xl animate-bounce">🐬</div>
          </>
        ) : (
          /* ── 1. BRIDGE & SKYLINE (DEFAULT) ── */
          <>
            <div className="absolute top-4 left-1/3 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl" />
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,230 Q250,180 500,220 T1000,200 Q1100,190 1200,210 L1200,300 L0,300 Z" fill="#86efac" opacity="0.85" />
                <path d="M0,245 Q200,210 400,240 T850,225 Q1050,210 1200,235 L1200,300 L0,300 Z" fill="#22c55e" />
                <g fill="#93c5fd" opacity="0.9">
                  <rect x="700" y="120" width="35" height="150" rx="3" fill="#60a5fa" />
                  <rect x="745" y="90" width="45" height="180" rx="4" fill="#3b82f6" />
                </g>
                <g stroke="#ffffff" strokeWidth="3" fill="none">
                  <line x1="0" y1="230" x2="680" y2="230" stroke="#e2e8f0" strokeWidth="8" />
                  <line x1="180" y1="270" x2="180" y2="130" stroke="#ffffff" strokeWidth="7" />
                  <path d="M0,170 Q90,225 187,135 Q290,225 397,135 Q520,225 680,230" stroke="#ffffff" strokeWidth="3.5" />
                </g>
              </svg>
            </div>
          </>
        )}

        {/* Sparkling Water & Ground Reflection */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[28%]"
          style={{
            background:
              currentScene === "oasis"
                ? "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)"
                : currentScene === "sunset"
                  ? "linear-gradient(180deg, #7c2d12 0%, #581c87 50%, #3b0764 100%)"
                  : currentScene === "space"
                    ? "linear-gradient(180deg, #1e1b4b 0%, #090514 100%)"
                    : currentScene === "snow"
                      ? "linear-gradient(180deg, #93c5fd 0%, #0369a1 100%)"
                      : currentScene === "windmill"
                        ? "linear-gradient(180deg, #b45309 0%, #78350f 100%)"
                        : currentScene === "clouds"
                          ? "linear-gradient(180deg, #bae6fd 0%, #7dd3fc 50%, #38bdf8 100%)"
                          : currentScene === "island"
                            ? "linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)"
                            : "linear-gradient(180deg, #38bdf8 0%, #0284c7 40%, #0369a1 100%)",
            boxShadow: "inset 0 10px 20px rgba(0,0,0,0.2)",
          }}
        >
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-200 via-transparent to-transparent animate-pulse" />
        </div>
      </div>

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
          TOP GAMEBAR HUD (CLEAN, MINIMAL & MOBILE-PERFECT)
          (Home, Shop, Target Mission Capsule, Restart, Settings)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 px-2 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-1 sm:gap-2 max-w-6xl mx-auto w-full">
        {/* Left: Home Button & Point Shop */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-300 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="কায়দায় ফিরে যান"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 🛒 Shop Button (পয়েন্ট জমিয়ে সুই ও চাকু কেনা) */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 text-amber-950 font-black text-xs shadow-md border-2 border-amber-300 active:scale-95 transition hover:scale-105 cursor-pointer"
            title="দোকান: সুই ও চাকু কিনুন"
          >
            <span className="text-xs sm:text-sm">🛒</span>
            <span className="hidden md:inline">দোকান</span>
            <span className="bg-white/90 px-1 sm:px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono shadow-2xs">
              🪙 {coins}
            </span>
          </button>
        </div>

        {/* Center: Mission Target Level & Status Dashboard */}
        <div className="flex items-center gap-1 sm:gap-3 bg-white/95 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-1.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-emerald-400 shadow-lg min-w-0">
          {/* Level & Letter Display */}
          <div className="flex items-center gap-1">
            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-black text-[10px] sm:text-xs border border-emerald-300 whitespace-nowrap">
              লেভেল {toBengaliDigits(targetIndex + 1)}
            </span>
            <div className="px-2 py-0.5 sm:py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-arabic font-black text-base sm:text-xl shadow-xs flex items-center gap-1 animate-pulse">
              <span>{targetItem.ar}</span>
              <span className="text-[9px] sm:text-[10px] font-sans font-bold bg-white/20 px-1 rounded hidden sm:inline">
                {targetItem.nameBn}
              </span>
            </div>
          </div>

          {/* Progress Count (Collected) */}
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-[10px] sm:text-xs whitespace-nowrap">
            <span>🎯</span>
            <span>{toBengaliDigits(targetCount)}টি</span>
          </div>

          {/* ⏱️ Countdown Timer (Click opens Settings) */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-950 font-black text-[10px] sm:text-xs shadow-2xs transition cursor-pointer whitespace-nowrap"
            title="গেম সেটিংস ও সময় পরিবর্তন"
          >
            <span className="text-xs">⏱️</span>
            <span className={`font-mono ${timeLeft <= 5 ? "text-rose-600 font-black animate-pulse" : ""}`}>
              {toBengaliDigits(timeLeft)} সে
            </span>
          </button>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-xs sm:text-base transition-transform ${
                  heartIndex <= lives ? "scale-100 animate-bounce" : "opacity-30 grayscale scale-75"
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
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-300 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Master Settings Button (⚙️) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-2 border-indigo-300 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="গেম সেটিংস ও সময় নির্ধারণ"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BUBBLE / BALLOON PLAYFIELD (SWIPE-TO-SLICE ENABLED)
      ══════════════════════════════════════════════════════════ */}
      <div
        ref={playfieldRef}
        onPointerDown={(e) => {
          isSwipingRef.current = true;
          handlePointerSwipe(e);
        }}
        onPointerMove={(e) => {
          if (isSwipingRef.current) {
            handlePointerSwipe(e);
          }
        }}
        onPointerUp={() => {
          isSwipingRef.current = false;
        }}
        onPointerCancel={() => {
          isSwipingRef.current = false;
        }}
        className="relative flex-1 w-full overflow-hidden touch-none select-none cursor-crosshair"
        style={{
          cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='6' cy='6' r='3'/%3E%3Ccircle cx='6' cy='18' r='3'/%3E%3Cline x1='20' y1='4' x2='8.12' y2='15.88'/%3E%3Cline x1='14.47' y1='14.48' x2='20' y2='20'/%3E%3Cline x1='8.12' y1='8.12' x2='12' y2='12'/%3E%3C/svg%3E\") 16 16, crosshair",
        }}
      >
        {activeBubbles.map((bubble) => {
          return (
            <div
              key={bubble.id}
              data-bubble-id={bubble.id}
              onPointerDown={(e) => handlePopBubble(bubble, e)}
              onClick={(e) => handlePopBubble(bubble, e)}
              className="absolute cursor-pointer transition-transform active:scale-90 group select-none animate-bubble-rise p-2.5"
              style={{
                left: `${bubble.xPos}%`,
                width: `${bubble.size + 20}px`,
                height: `${bubble.size + 20}px`,
                animationDuration: `${bubble.duration}s`,
                animationTimingFunction: "linear",
              }}
            >
              <div
                className="w-full h-full rounded-full relative flex items-center justify-center border-2 shadow-2xl transition-all group-hover:scale-105 group-hover:brightness-110"
                style={{
                  background: bubble.theme.bg,
                  borderColor: bubble.theme.border,
                  boxShadow: bubble.theme.shadow,
                }}
              >
                <div className="absolute top-2 left-3 w-5 h-3 bg-white/80 rounded-full rotate-[-30deg] blur-2xs pointer-events-none" />
                <div className="absolute bottom-2.5 right-3 w-3 h-2 bg-white/40 rounded-full blur-2xs pointer-events-none" />

                {bubble.type === "target" ? (
                  <div className="text-center">
                    <span className="font-arabic font-bold text-3xl sm:text-4xl text-slate-900 drop-shadow-md">
                      {bubble.content}
                    </span>
                    <span className="block text-[10px] font-black text-emerald-950 font-hind-siliguri">
                      {bubble.nameBn}
                    </span>
                  </div>
                ) : bubble.type === "fruit" ? (
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl filter drop-shadow">
                      {bubble.content}
                    </span>
                    <span className="block text-[9px] font-black text-amber-950 font-hind-siliguri">
                      {bubble.nameBn}
                    </span>
                  </div>
                ) : bubble.type === "bomb" ? (
                  <div className="text-center animate-pulse">
                    <span className="text-3xl sm:text-4xl filter drop-shadow">
                      💣
                    </span>
                    <span className="block text-[8px] font-black text-rose-700 font-hind-siliguri">
                      বোমা!
                    </span>
                  </div>
                ) : (
                  <div className="text-center opacity-85">
                    <span className="font-arabic font-bold text-2xl sm:text-3xl text-slate-700">
                      {bubble.content}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-600 font-hind-siliguri">
                      {bubble.nameBn}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── FLOATING PARTICLES ON POP ── */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none transition-all duration-700"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`,
              transform: `translate(${p.vx}px, ${p.vy}px)`,
              opacity: 0,
            }}
          />
        ))}

        {/* ── FLOATING SCORE TOASTS ── */}
        {floatingNotes.map((note) => (
          <div
            key={note.id}
            className={`absolute pointer-events-none text-base sm:text-xl font-black drop-shadow-lg transition-all duration-1000 animate-float-up ${note.colorClass}`}
            style={{
              left: `${note.x}px`,
              top: `${note.y - 30}px`,
            }}
          >
            {note.text}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM FOOTER (WITH CURRENT EQUIPPED WEAPON INFO - DISMISSIBLE)
      ══════════════════════════════════════════════════════════ */}
      {showFooterTip && (
        <footer className="relative z-30 px-3 py-1.5 sm:py-2 text-center bg-black/40 backdrop-blur-sm text-white text-[11px] sm:text-xs font-bold flex items-center justify-between gap-2 max-w-2xl mx-auto w-full rounded-2xl border border-white/10 shadow-lg pointer-events-auto my-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-amber-300 font-black text-[10px] flex items-center gap-1 shrink-0">
              <span>{equippedNeedle.icon}</span>
              <span>{equippedNeedle.nameBn}</span>
            </span>
            <span className="truncate">
              হরফ <strong>{targetItem.nameBn} ({targetItem.ar})</strong> ও ফল 🍎 ফাটাও!
            </span>
            <span className="text-amber-300 font-black shrink-0">বোমা 💣 এড়াও!</span>
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
          🛒 POINT SHOP MODAL (পয়েন্ট জমিয়ে সুই, কাঠি ও চাকু কেনা)
      ══════════════════════════════════════════════════════════ */}
      {isShopOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-[#FFFDF7] rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-4 border-4 border-amber-400 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h3 className="text-lg sm:text-xl font-black text-amber-950 font-hind-siliguri">
                  নূর কায়দা দোকান ও অস্ত্রাগার
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs border border-amber-300 shadow-xs">
                  🪙 {coins} পয়েন্ট
                </span>
                <button
                  onClick={() => setIsShopOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Shop Tabs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <button
                onClick={() => setShopTab("needles")}
                className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition ${shopTab === "needles"
                  ? "bg-amber-400 text-amber-950 shadow-md scale-102"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <span>🪡</span>
                <span>বুদ্বুদ সুই ও কাঠি</span>
              </button>
              <button
                onClick={() => setShopTab("blades")}
                className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition ${shopTab === "blades"
                  ? "bg-amber-400 text-amber-950 shadow-md scale-102"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <span>⚔️</span>
                <span>হরফ নিনজা চাকু</span>
              </button>
            </div>

            {/* Needles & Wands List */}
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
                            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-500 hover:text-white text-slate-800 font-black text-xs transition"
                          >
                            ব্যবহার করো
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyNeedle(n)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition ${canAfford
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

            {/* Ninja Blades & Swords List */}
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
                          <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>রানিং</span>
                          </span>
                        ) : isOwned ? (
                          <button
                            onClick={() => handleEquipBlade(b.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-orange-500 hover:text-white text-slate-800 font-black text-xs transition"
                          >
                            ব্যবহার করো
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyBlade(b)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition ${canAfford
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
          </div>
        </div>
      )}

      {/* ⚙️ COMPREHENSIVE GAME SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 w-[92%] max-w-sm text-center space-y-3.5 border-3 border-indigo-400 shadow-2xl m-auto animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="text-base font-black text-slate-800 flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
                  <Settings className="w-4 h-4 stroke-[2.5]" />
                </span>
                <span>গেম সেটিংস</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer transition active:scale-95"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* 1. Duration Selection */}
            <div className="space-y-1.5 text-left">
              <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
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
                        ? "bg-amber-100 border-amber-500 text-amber-950 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black font-hind-siliguri">{title}</div>
                      {selectedDuration === sec && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
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
                    ? "bg-sky-50 border-sky-300 text-sky-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  {!isMuted ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-rose-600" />}
                  <span>{!isMuted ? "সাউন্ড ও ভয়েস চালু আছে" : "সাউন্ড মিউট / বন্ধ আছে"}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border">
                  {!isMuted ? "মিউট করুন" : "চালু করুন"}
                </span>
              </button>
            </div>

            {/* 3. Game Mode Switch & Shop */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {onLaunchNinja && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    stopStudioGameAudio();
                    banglaAudioEngine.stop();
                    onLaunchNinja(targetItem);
                  }}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>⚔️</span>
                  <span>নিনজা মোড</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsShopOpen(true);
                }}
                className={`py-2.5 px-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  !onLaunchNinja ? "col-span-2" : ""
                }`}
              >
                <span>🛒</span>
                <span>সুই ও চাকুর দোকান</span>
              </button>
            </div>

            {/* 4. Restart Level & Back to Qaida */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  restartGame();
                }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
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
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
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
          (READS RESULT ALOUD IN BENGALI, 40% PASS THRESHOLD & SURVIVAL FOR NEXT LEVEL)
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
                    লেভেল {toBengaliDigits(targetIndex + 1)} সম্পন্ন! হরফ <strong>{targetItem.nameBn} ({targetItem.ar})</strong> চিনে ফেলেছ!
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
                  gameState === "won" && collectionRate >= 40 && finishReason !== "bombs"
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
                {gameState === "won" && collectionRate >= 40 && finishReason !== "bombs" ? "+৫০ 🪙 কয়েন" : "🪙 ০ কয়েন"}
              </span>
            </div>

            {/* Action Buttons (Large, high-contrast, child-friendly tap targets) */}
            <div className="space-y-2 pt-1">
              {/* Next Level Button (Only unlocked if game won, survived time without bomb death, and collectionRate >= 40%!) */}
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

                  {/* Ninja Level Option (If passed and ninja available) */}
                  {onLaunchNinja && (
                    <button
                      onClick={() => {
                        stopStudioGameAudio();
                        banglaAudioEngine.stop();
                        onLaunchNinja(targetItem);
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span>⚔️</span>
                      <span>এই লেভেল হরফ নিনজায় খেলো!</span>
                      <span>➔</span>
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
