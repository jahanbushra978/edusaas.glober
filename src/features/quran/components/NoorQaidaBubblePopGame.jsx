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
} from "lucide-react";
import { universalAudioEngine } from "@/lib/quran/audio";
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
  onClose = () => {},
  onNextLetter = null,
  onLaunchNinja = null,
}) {
  // Game States
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetCount, setTargetCount] = useState(0);
  const TARGET_GOAL = 10;
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won' | 'gameover'
  const [isMuted, setIsMuted] = useState(false);
  const [activeBubbles, setActiveBubbles] = useState([]);
  const [particles, setParticles] = useState([]);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [flashRed, setFlashRed] = useState(false);

  // Progressive Round Counter (Rounds 1, 2, 3 -> then Haruf Ninja unlocks!)
  const [bubbleRound, setBubbleRound] = useState(1);

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
  const spawnTimerRef = useRef(null);

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
    } catch {}
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
    } catch {}
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
    } catch {}
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
    } catch {}
  }, [isMuted]);

  // ── SPAWN A BUBBLE (WITH PROGRESSIVE SPEED & INCREASING BOMBS) ──
  const spawnBubble = useCallback(() => {
    if (gameState !== "playing") return;

    const id = nextBubbleId.current++;
    const xPos = Math.random() * 80 + 10;
    const size = Math.floor(Math.random() * 26) + 76;

    // Progressive speed: "aste aste aro druto hobe"
    const currentLevel = bubbleRound === 1 && score < 60 ? 1 : score < 140 ? 2 : 3;
    const duration =
      currentLevel === 1
        ? Math.random() * 2.0 + 6.8
        : currentLevel === 2
        ? Math.random() * 1.8 + 4.8
        : Math.random() * 1.4 + 3.4;

    const theme = BUBBLE_THEMES[Math.floor(Math.random() * BUBBLE_THEMES.length)];

    // Bomb density increases: "bom beshi kore ashbe"
    const bombThreshold = currentLevel === 1 ? 0.88 : currentLevel === 2 ? 0.76 : 0.65;
    const rand = Math.random();
    let type = "target";
    let content = targetItem.ar || "س";
    let nameBn = targetItem.nameBn || "হরফ";
    let sound = targetItem.sound || targetItem.ar;

    if (rand < 0.42) {
      type = "target";
      content = targetItem.ar;
      nameBn = targetItem.nameBn;
      sound = targetItem.sound || targetItem.ar;
    } else if (rand < 0.68) {
      type = "fruit";
      const fruit = BONUS_FRUITS[Math.floor(Math.random() * BONUS_FRUITS.length)];
      content = fruit.icon;
      nameBn = fruit.nameBn;
      sound = fruit.sound;
    } else if (rand < bombThreshold) {
      type = "distractor";
      const filtered = DISTRACTOR_LETTERS.filter((l) => l.ar !== targetItem.ar);
      const dist = filtered[Math.floor(Math.random() * filtered.length)] || DISTRACTOR_LETTERS[0];
      content = dist.ar;
      nameBn = dist.nameBn;
      sound = dist.ar;
    } else {
      type = "bomb";
      content = "💣";
      nameBn = "বিপদজনক বোমা";
      sound = "bomb";
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
  }, [gameState, targetItem, score, bubbleRound]);

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
  const handlePopBubble = (bubble, e) => {
    e.stopPropagation();
    if (gameState !== "playing") return;

    setActiveBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Visual particles colored by the equipped needle/wand!
    createParticles(clickX, clickY, equippedNeedle);

    if (bubble.type === "target") {
      playWebAudioPop();
      if (!isMuted) {
        universalAudioEngine.playArabicSound(bubble.sound || bubble.content, { rate: 1.0 });
      }

      setScore((s) => s + 20);
      addCoins(5); // Earn 5 coins per target letter!
      const newTargetCount = targetCount + 1;
      setTargetCount(newTargetCount);

      showFloatingNote(clickX, clickY, `+২০ ⭐ (🪙+৫)`, "text-amber-300");

      if (newTargetCount >= TARGET_GOAL) {
        setGameState("won");
        addCoins(50); // Earn 50 bonus coins on completing round!
        playVictoryFanfare();
      }
    } else if (bubble.type === "fruit") {
      playFruitPopSound();
      setScore((s) => s + 10);
      addCoins(3); // Earn 3 coins for fruit!
      showFloatingNote(clickX, clickY, `+১০ ${bubble.content} (🪙+৩)`, "text-emerald-300");
    } else if (bubble.type === "distractor") {
      playWebAudioPop();
      if (!isMuted) {
        universalAudioEngine.playArabicSound(bubble.sound || bubble.content, { rate: 1.0 });
      }
      setScore((s) => s + 2);
      showFloatingNote(clickX, clickY, "+২ (অন্য হরফ)", "text-slate-200");
    } else if (bubble.type === "bomb") {
      playBombExplosionSound();
      setIsShaking(true);
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 300);
      setTimeout(() => setIsShaking(false), 600);

      const nextLives = lives - 1;
      setLives(nextLives);
      showFloatingNote(clickX, clickY, "💥 বোমা! -১ জীবন", "text-rose-400 font-black");

      if (nextLives <= 0) {
        setGameState("gameover");
      }
    }
  };

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

  // ── RESTART OR ADVANCE ROUND ──
  const restartGame = () => {
    setScore(0);
    setLives(3);
    setTargetCount(0);
    setActiveBubbles([]);
    setGameState("playing");
  };

  const handleNextRound = () => {
    setBubbleRound((r) => r + 1);
    setTargetCount(0);
    setActiveBubbles([]);
    setGameState("playing");
  };

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
    } catch {}

    setEquippedNeedleId(needle.id);
    try {
      localStorage.setItem("noor_qaida_equipped_needle", needle.id);
    } catch {}
  };

  const handleEquipNeedle = (needleId) => {
    setEquippedNeedleId(needleId);
    try {
      localStorage.setItem("noor_qaida_equipped_needle", needleId);
    } catch {}
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
    } catch {}

    setEquippedBladeId(blade.id);
    try {
      localStorage.setItem("noor_qaida_equipped_blade", blade.id);
    } catch {}
  };

  const handleEquipBlade = (bladeId) => {
    setEquippedBladeId(bladeId);
    try {
      localStorage.setItem("noor_qaida_equipped_blade", bladeId);
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden select-none flex flex-col justify-between font-hind-siliguri ${
        isShaking ? "animate-shake" : ""
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

      {/* ══════════════════════════════════════════════════════════
          TOP GAMEBAR HUD (CLEAN, FOCUSED & PROGRESSIVE)
          (Home, Shop/Coins, Target Badge, Round/Goal, Score, Hearts, Controls)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 p-2 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        {/* Left: Home Button & Point Shop */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="কায়দায় ফিরে যান"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* 🛒 Shop Button (পয়েন্ট জমিয়ে সুই ও চাকু কেনা) */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs shadow-xl border-2 border-amber-300 active:scale-95 transition hover:scale-105 cursor-pointer"
            title="দোকান: সুই ও চাকু কিনুন"
          >
            <span className="text-sm">🛒</span>
            <span className="hidden sm:inline">দোকান</span>
            <span className="bg-white/90 px-1.5 py-0.5 rounded-full text-[10px] font-mono shadow-2xs">
              🪙 {coins}
            </span>
          </button>
        </div>

        {/* Center: Mission Target Letter & Status Dashboard */}
        <div className="flex items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-emerald-400 shadow-2xl">
          {/* Target Letter Display */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black text-slate-700 hidden xs:inline">
              লক্ষ্য:
            </span>
            <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-arabic font-black text-xl sm:text-2xl shadow-md flex items-center gap-1.5 animate-pulse">
              <span>{targetItem.ar}</span>
              <span className="text-[10px] font-sans font-bold bg-white/20 px-1.5 rounded">
                {targetItem.nameBn}
              </span>
            </div>
          </div>

          {/* Progress Goal */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm">
            <span>🎯</span>
            <span>
              {targetCount} / {TARGET_GOAL}
            </span>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-900">
            <span>⭐</span>
            <span>{score}</span>
          </div>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-base sm:text-lg transition-transform ${
                  heartIndex <= lives ? "scale-100 animate-bounce" : "opacity-30 grayscale scale-75"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Right: Sound & Settings Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white border-2 border-sky-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={isMuted ? "সাউন্ড চালু করুন" : "সাউন্ড মিউট করুন"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {onNextLetter && (
            <button
              onClick={onNextLetter}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="পরবর্তী হরফে যান"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>
          )}

          <button
            onClick={restartGame}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BUBBLE / BALLOON PLAYFIELD
      ══════════════════════════════════════════════════════════ */}
      <div className="relative flex-1 w-full overflow-hidden">
        {activeBubbles.map((bubble) => {
          return (
            <div
              key={bubble.id}
              onClick={(e) => handlePopBubble(bubble, e)}
              className="absolute cursor-pointer transition-transform active:scale-90 group select-none animate-bubble-rise"
              style={{
                left: `${bubble.xPos}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
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
          BOTTOM FOOTER (WITH CURRENT EQUIPPED WEAPON INFO)
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 p-2 sm:p-3 text-center bg-black/25 backdrop-blur-xs text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-white/20 text-amber-300 font-black flex items-center gap-1">
          <span>{equippedNeedle.icon}</span>
          <span>{equippedNeedle.nameBn}</span>
        </span>
        <span>
          পানির নিচ থেকে ওঠা বুদ্বুদ লক্ষ্য করো! শুধু <strong>{targetItem.nameBn} ({targetItem.ar})</strong> হরফ এবং মিষ্টি ফল 🍎 ফাটাও!
        </span>
        <span className="text-amber-300 font-black">বোমা 💣 এড়াও!</span>
      </footer>

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
                className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition ${
                  shopTab === "needles"
                    ? "bg-amber-400 text-amber-950 shadow-md scale-102"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>🪡</span>
                <span>বুদ্বুদ সুই ও কাঠি</span>
              </button>
              <button
                onClick={() => setShopTab("blades")}
                className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition ${
                  shopTab === "blades"
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
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${
                        isEquipped
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
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition ${
                              canAfford
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
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${
                        isEquipped
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
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition ${
                              canAfford
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

      {/* ══════════════════════════════════════════════════════════
          VICTORY CELEBRATION MODAL (PROGRESSION: 2-3 ROUNDS -> HARUF NINJA)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "won" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-amber-400 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-amber-950 font-hind-siliguri">
                مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)
              </h2>
              <p className="text-sm font-bold text-emerald-800">
                রাউন্ড {bubbleRound} বিজয়ী! তুমি সফলভাবে {TARGET_GOAL}টি <strong>{targetItem.nameBn} ({targetItem.ar})</strong> হরফ সংগ্রহ করেছ!
              </p>
              <div className="text-xs font-black text-amber-700 bg-amber-50 py-1 rounded-xl border border-amber-200">
                পুরস্কার: +৫০ 🪙 পয়েন্ট যুক্ত হয়েছে!
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {/* After 2-3 rounds, Ninja Level unlocks! */}
              {onLaunchNinja && (
                <button
                  onClick={() => onLaunchNinja(targetItem)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 animate-pulse cursor-pointer"
                >
                  <span>⚔️</span>
                  <span>
                    {bubbleRound >= 2 ? "🎉 মহাবিজয়: হরফ নিনজা লেভেলে যাও!" : "হরফ নিনজা লেভেলে খেলো!"}
                  </span>
                  <span>➔</span>
                </button>
              )}

              {bubbleRound < 3 && (
                <button
                  onClick={handleNextRound}
                  className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>🎈 পরবর্তী রাউন্ড ({bubbleRound + 1}/৩) খেলো</span>
                </button>
              )}

              {onNextLetter && (
                <button
                  onClick={onNextLetter}
                  className="w-full py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>পরবর্তী হরফে যাও</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                কায়দায় ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          GAME OVER MODAL (HIT BOMB 3 TIMES)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-rose-400 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 border-4 border-rose-400 flex items-center justify-center text-4xl shadow-inner animate-pulse">
              💥
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-rose-950 font-hind-siliguri">
                ওহ নো! বোমায় চাপ লেগেছে!
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                জীবন শেষ হয়ে গেছে। বোমায় ভুলেও চাপ দেওয়া যাবে না! চলো আবার চেষ্টা করি।
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={restartGame}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>আবার চেষ্টা করো</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                কায়দায় ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
