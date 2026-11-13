"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  RotateCw,
  Home,
  X,
  Award,
  Zap,
  Play,
  RotateCcw,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { universalAudioEngine } from "@/lib/quran/audio";

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

// ── UNIQUE SCENIC THEME AUTOMATICALLY BOUND TO EACH ARABIC LETTER ──
// (No manual switcher — scenes evolve progressively as the learner advances)
function getSceneForLetter(ar) {
  // ১. আলিফ, বা, তা: ঝুলন্ত সেতু ও নীল নদী
  if (["ا", "أ", "ب", "ت"].includes(ar)) return "bridge";
  // ২. ছা, জীম, হা: সবুজ উপত্যকা ও রংধনু
  if (["ث", "ج", "ح"].includes(ar)) return "rainbow";
  // ৩. খা, দাল, যাল, রা: মরুদ্যানে তারার রাত ও সোনালী চাঁদ
  if (["خ", "د", "ذ", "ر"].includes(ar)) return "oasis";
  // ৪. যা, সীন, শীন, ছোয়াদ: সূর্যাস্ত ও বাতিঘর সমুদ্র সৈকত
  if (["ز", "س", "ش", "ص"].includes(ar)) return "sunset";
  // ৫. দোয়াদ, তোয়া, যোয়া, আইন: ঝুলন্ত সেতু ও নীল নদী
  if (["ض", "ط", "ظ", "ع"].includes(ar)) return "bridge";
  // ৬. গাইন, ফা, ক্বাফ: সবুজ উপত্যকা ও রংধনু
  if (["غ", "ف", "ق"].includes(ar)) return "rainbow";
  // ৭. কাফ, লাম, মীম, নূন: মরুদ্যানে তারার রাত
  if (["ك", "ل", "م", "ن"].includes(ar)) return "oasis";
  // ৮. ওয়াও, হা, ইয়া: সূর্যাস্ত ও বাতিঘর সৈকত
  return "sunset";
}

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

  // Progressive scene strictly locked to the target letter (No manual override)
  const currentScene = getSceneForLetter(targetItem?.ar);

  // References
  const nextBubbleId = useRef(1);
  const containerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const gameLoopRef = useRef(null);

  // ── WEB AUDIO SYNTHESIZERS (ZERO NETWORK LATENCY) ──
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

      // Noise generator for explosion crackle
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

      // Low bass boom
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
    const xPos = Math.random() * 80 + 10; // 10% to 90% horizontal position
    const size = Math.floor(Math.random() * 26) + 76; // 76px to 102px

    // Progressive speed: "aste aste aro druto hobe"
    const currentLevel = score < 60 ? 1 : score < 140 ? 2 : 3;
    const duration =
      currentLevel === 1
        ? Math.random() * 2.0 + 6.8  // Level 1: 6.8s - 8.8s
        : currentLevel === 2
        ? Math.random() * 1.8 + 4.8  // Level 2: 4.8s - 6.6s (faster)
        : Math.random() * 1.4 + 3.4; // Level 3: 3.4s - 4.8s (super fast)

    const theme = BUBBLE_THEMES[Math.floor(Math.random() * BUBBLE_THEMES.length)];

    // Bomb chance increases dynamically: "bom beshi kore ashbe"
    // Level 1: 12% bombs | Level 2: 22% bombs | Level 3: 32% bombs
    const bombThreshold = currentLevel === 1 ? 0.88 : currentLevel === 2 ? 0.78 : 0.68;
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
  }, [gameState, targetItem, score]);

  // ── CLEANUP BUBBLES THAT REACH TOP (AFTER DURATION) ──
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveBubbles((prev) =>
        prev.filter((b) => now - b.createdAt < (b.duration + 0.5) * 1000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── GAME LOOP SPAWNER (SPAWNS FASTER AS SCORE RISES) ──
  useEffect(() => {
    if (gameState !== "playing") return;

    // Interval speeds up from 1500ms down to 800ms
    const intervalTime = score < 60 ? 1500 : score < 140 ? 1100 : 800;

    spawnBubble();
    const timer1 = setTimeout(spawnBubble, Math.floor(intervalTime * 0.4));
    const timer2 = setTimeout(spawnBubble, Math.floor(intervalTime * 0.8));

    spawnTimerRef.current = setInterval(() => {
      spawnBubble();
    }, intervalTime);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(spawnTimerRef.current);
    };
  }, [gameState, spawnBubble, score]);

  // ── POP BUBBLE HANDLER ──
  const handlePopBubble = (bubble, e) => {
    e.stopPropagation();
    if (gameState !== "playing") return;

    // Remove from active list
    setActiveBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    // Calculate click coordinates for particle splash
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Trigger visual particle explosion
    createParticles(clickX, clickY, bubble.theme);

    if (bubble.type === "target") {
      // 1. TARGET ARABIC LETTER POP!
      playWebAudioPop();
      if (!isMuted) {
        universalAudioEngine.playArabicSound(bubble.sound || bubble.content, { rate: 1.0 });
      }

      setScore((s) => s + 20);
      const newTargetCount = targetCount + 1;
      setTargetCount(newTargetCount);

      showFloatingNote(clickX, clickY, "+২০ ⭐", "text-amber-300");

      if (newTargetCount >= TARGET_GOAL) {
        setGameState("won");
        playVictoryFanfare();
      }
    } else if (bubble.type === "fruit") {
      // 2. BONUS FRUIT POP!
      playFruitPopSound();
      setScore((s) => s + 10);
      showFloatingNote(clickX, clickY, `+১০ ${bubble.content}`, "text-emerald-300");
    } else if (bubble.type === "distractor") {
      // 3. OTHER LETTER POP
      playWebAudioPop();
      if (!isMuted) {
        universalAudioEngine.playArabicSound(bubble.sound || bubble.content, { rate: 1.0 });
      }
      setScore((s) => s + 2);
      showFloatingNote(clickX, clickY, "+২ (অন্য হরফ)", "text-slate-200");
    } else if (bubble.type === "bomb") {
      // 4. DANGER BOMB EXPLOSION! 💣
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
  const createParticles = (x, y, theme) => {
    const newParticles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = Math.random() * 90 + 50;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx,
        vy,
        color: i % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(253,224,71,0.9)",
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

  // ── RESTART GAME ──
  const restartGame = () => {
    setScore(0);
    setLives(3);
    setTargetCount(0);
    setActiveBubbles([]);
    setGameState("playing");
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
            : "linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #bae6fd 70%, #60a5fa 100%)",
      }}
    >
      {/* ── RED FLASH ON BOMB HIT ── */}
      {flashRed && (
        <div className="absolute inset-0 bg-rose-600/40 pointer-events-none z-40 transition-opacity duration-200" />
      )}

      {/* ══════════════════════════════════════════════════════════
          DYNAMIC SCENIC BACKGROUNDS (MATCHING USER REQUEST)
          (1. Bridge & River | 2. Desert Oasis & Moon | 3. Rainbow Valley | 4. Sunset Lighthouse)
      ══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {currentScene === "oasis" ? (
          /* ── SCENE 2: ISLAMIC OASIS & STARRY NIGHT SKY ── */
          <>
            {/* Glowing Golden Crescent Moon */}
            <div className="absolute top-6 right-16 text-6xl sm:text-7xl filter drop-shadow-[0_0_25px_rgba(253,224,71,0.9)] animate-pulse">
              🌙
            </div>
            {/* Twinkling Stars */}
            {[
              { top: "10%", left: "12%" },
              { top: "15%", left: "28%" },
              { top: "8%", left: "45%" },
              { top: "20%", left: "60%" },
              { top: "12%", left: "75%" },
              { top: "25%", left: "88%" },
            ].map((star, idx) => (
              <span
                key={idx}
                className="absolute text-amber-200 text-sm animate-ping"
                style={{ top: star.top, left: star.left, animationDuration: `${2 + idx * 0.5}s` }}
              >
                ✦
              </span>
            ))}
            {/* Mosque Domes, Minarets & Palm Trees Silhouette */}
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                {/* Golden Desert Dunes */}
                <path d="M0,210 Q300,160 600,200 T1200,190 L1200,300 L0,300 Z" fill="#b45309" opacity="0.8" />
                <path d="M0,230 Q350,185 750,225 T1200,215 L1200,300 L0,300 Z" fill="#d97706" />
                {/* Mosque Dome & Minarets */}
                <g fill="#0f172a" opacity="0.95">
                  <rect x="520" y="100" width="16" height="150" />
                  <polygon points="528,60 520,100 536,100" fill="#f59e0b" />
                  <rect x="660" y="100" width="16" height="150" />
                  <polygon points="668,60 660,100 676,100" fill="#f59e0b" />
                  <path d="M560,250 L560,160 Q600,100 640,160 L640,250 Z" />
                  <circle cx="600" cy="100" r="4" fill="#f59e0b" />
                </g>
                {/* Date Palms 🌴 */}
                <g fill="#022c22">
                  <path d="M150,250 Q160,180 170,140" stroke="#78350f" strokeWidth="8" />
                  <circle cx="170" cy="135" r="28" fill="#14532d" />
                  <path d="M1020,250 Q1010,180 1000,140" stroke="#78350f" strokeWidth="8" />
                  <circle cx="1000" cy="135" r="28" fill="#14532d" />
                </g>
              </svg>
            </div>
            {/* Sparkling Oasis Water */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[28%]"
              style={{
                background: "linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)",
                boxShadow: "inset 0 10px 20px rgba(0,0,0,0.5)",
              }}
            >
              <div className="absolute top-2 left-1/3 w-48 h-1 bg-amber-300/40 rounded-full blur-xs" />
            </div>
          </>
        ) : currentScene === "rainbow" ? (
          /* ── SCENE 3: RAINBOW VALLEY & WATERFALL ── */
          <>
            {/* Glowing Giant Arc Rainbow across Sky */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[300px] pointer-events-none opacity-80">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="20%" stopColor="#f97316" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="60%" stopColor="#22c55e" />
                    <stop offset="80%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50,380 A 350,350 0 0,1 750,380"
                  fill="none"
                  stroke="url(#rainbowGrad)"
                  strokeWidth="32"
                  opacity="0.75"
                />
              </svg>
            </div>
            {/* Emerald Mountains & Cascading Waterfall */}
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,180 Q300,100 600,170 T1200,140 L1200,300 L0,300 Z" fill="#15803d" />
                <path d="M0,210 Q400,150 800,210 T1200,190 L1200,300 L0,300 Z" fill="#22c55e" />
                {/* Waterfall */}
                <rect x="580" y="160" width="35" height="140" fill="#bae6fd" opacity="0.9" />
                <rect x="588" y="160" width="18" height="140" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
            {/* Lagoon Waters with Flowers */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[28%]"
              style={{
                background: "linear-gradient(180deg, #059669 0%, #047857 50%, #064e3b 100%)",
              }}
            >
              <div className="absolute top-2 left-1/4 w-36 h-1 bg-emerald-200/60 rounded-full blur-xs" />
            </div>
          </>
        ) : currentScene === "sunset" ? (
          /* ── SCENE 4: SUNSET SEASHORE & LIGHTHOUSE ── */
          <>
            {/* Blazing Golden Sun Setting */}
            <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-t from-amber-400 to-rose-400 blur-md opacity-90 animate-pulse" />
            {/* Soaring Seagulls */}
            <div className="absolute top-12 left-1/4 text-2xl animate-float-slow">🕊️</div>
            <div className="absolute top-20 right-1/3 text-xl animate-float-medium">🕊️</div>
            {/* Lighthouse Tower & Rocky Cliffs */}
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,230 Q300,180 700,230 T1200,220 L1200,300 L0,300 Z" fill="#431407" />
                {/* Lighthouse */}
                <g fill="#ffffff">
                  <polygon points="980,80 965,240 1005,240" fill="#f8fafc" />
                  <rect x="965" y="130" width="38" height="16" fill="#dc2626" />
                  <rect x="968" y="180" width="34" height="16" fill="#dc2626" />
                  <polygon points="980,55 968,80 992,80" fill="#b91c1c" />
                  {/* Rotating Light Beam */}
                  <polygon points="980,70 400,20 420,160" fill="#fef08a" opacity="0.35" />
                </g>
              </svg>
            </div>
            {/* Purple & Crimson Ocean Waves */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[28%]"
              style={{
                background: "linear-gradient(180deg, #7c2d12 0%, #581c87 50%, #3b0764 100%)",
              }}
            >
              <div className="absolute top-2 left-1/3 w-64 h-1.5 bg-amber-400/70 rounded-full blur-xs" />
            </div>
          </>
        ) : (
          /* ── SCENE 1: BRIDGE & SKYLINE (DEFAULT) ── */
          <>
            {/* Soft Sun Ray Glow in Sky */}
            <div className="absolute top-4 left-1/3 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl" />
            <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-white/30 blur-2xl" />

            {/* Floating Clouds Layer */}
            <div className="absolute top-6 left-10 opacity-70 animate-float-slow">
              <svg className="w-48 h-16 fill-white" viewBox="0 0 100 40">
                <path d="M 20 30 Q 10 30 10 20 Q 10 10 25 12 Q 35 4 50 10 Q 65 2 75 12 Q 90 10 90 22 Q 90 30 80 30 Z" />
              </svg>
            </div>
            <div className="absolute top-16 right-16 opacity-60 animate-float-medium">
              <svg className="w-56 h-20 fill-white" viewBox="0 0 100 40">
                <path d="M 20 30 Q 10 30 10 20 Q 10 10 25 12 Q 35 4 50 10 Q 65 2 75 12 Q 90 10 90 22 Q 90 30 80 30 Z" />
              </svg>
            </div>

            {/* City Skyline & Suspension Bridge (SVG) */}
            <div className="absolute bottom-[28%] left-0 right-0 h-44 sm:h-56">
              <svg className="w-full h-full preserve-3d" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,230 Q250,180 500,220 T1000,200 Q1100,190 1200,210 L1200,300 L0,300 Z" fill="#86efac" opacity="0.85" />
                <path d="M0,245 Q200,210 400,240 T850,225 Q1050,210 1200,235 L1200,300 L0,300 Z" fill="#22c55e" />
                <g fill="#93c5fd" opacity="0.9">
                  <rect x="700" y="120" width="35" height="150" rx="3" fill="#60a5fa" />
                  <rect x="745" y="90" width="45" height="180" rx="4" fill="#3b82f6" />
                  <rect x="800" y="130" width="30" height="140" rx="3" fill="#93c5fd" />
                  <rect x="840" y="105" width="40" height="165" rx="3" fill="#60a5fa" />
                  <rect x="890" y="140" width="50" height="130" rx="3" fill="#3b82f6" />
                  <rect x="950" y="115" width="35" height="155" rx="3" fill="#60a5fa" />
                  <rect x="995" y="150" width="45" height="120" rx="3" fill="#93c5fd" />
                  <path d="M720,240 L720,80 L725,60 L730,80 L730,240 Z" fill="#e0f2fe" />
                  <circle cx="725" cy="80" r="16" fill="#0284c7" />
                  <circle cx="725" cy="80" r="10" fill="#bae6fd" />
                  <line x1="725" y1="60" x2="725" y2="40" stroke="#0284c7" strokeWidth="3" />
                </g>
                <g stroke="#ffffff" strokeWidth="3" fill="none">
                  <line x1="0" y1="230" x2="680" y2="230" stroke="#e2e8f0" strokeWidth="8" />
                  <line x1="180" y1="270" x2="180" y2="130" stroke="#ffffff" strokeWidth="7" />
                  <line x1="195" y1="270" x2="195" y2="130" stroke="#ffffff" strokeWidth="7" />
                  <line x1="175" y1="160" x2="200" y2="160" stroke="#cbd5e1" strokeWidth="4" />
                  <line x1="175" y1="190" x2="200" y2="190" stroke="#cbd5e1" strokeWidth="4" />
                  <line x1="390" y1="270" x2="390" y2="130" stroke="#ffffff" strokeWidth="7" />
                  <line x1="405" y1="270" x2="405" y2="130" stroke="#ffffff" strokeWidth="7" />
                  <line x1="385" y1="160" x2="410" y2="160" stroke="#cbd5e1" strokeWidth="4" />
                  <line x1="385" y1="190" x2="410" y2="190" stroke="#cbd5e1" strokeWidth="4" />
                  <path d="M0,170 Q90,225 187,135 Q290,225 397,135 Q520,225 680,230" stroke="#ffffff" strokeWidth="3.5" />
                  {[40, 80, 120, 155, 230, 270, 310, 350, 440, 480, 520, 560, 600, 640].map((cx) => (
                    <line key={cx} x1={cx} y1="230" x2={cx} y2="200" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                </g>
              </svg>
            </div>
            {/* Sparkling Water & River Reflection */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[28%]"
              style={{
                background: "linear-gradient(180deg, #38bdf8 0%, #0284c7 40%, #0369a1 100%)",
                boxShadow: "inset 0 10px 20px rgba(0,0,0,0.15)",
              }}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-200 via-transparent to-transparent animate-pulse" />
              <div className="absolute top-2 left-1/4 w-32 h-1 bg-white/60 rounded-full blur-xs" />
              <div className="absolute top-6 left-1/2 w-48 h-1 bg-white/50 rounded-full blur-xs" />
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TOP GAMEBAR HUD (MATCHING USER SCREENSHOT)
          (Home, Scene Switch, Ninja Switch, Target Pill, Score, Hearts, Target Counter, Sound, Mute, Next)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 p-2 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        {/* Left: Home Button (Back to Qaida) */}
        <button
          onClick={onClose}
          className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white border-2 border-teal-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="কায়দায় ফিরে যান"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center: Mission Target Letter & Status Dashboard */}
        <div className="flex items-center gap-2 sm:gap-4 bg-white/90 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-emerald-400 shadow-2xl">
          {/* Target Letter Display */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black text-slate-700 hidden xs:inline">
              লক্ষ্য হরফ:
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
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white border-2 border-sky-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={isMuted ? "সাউন্ড চালু করুন" : "সাউন্ড মিউট করুন"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {onNextLetter && (
            <button
              onClick={onNextLetter}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="পরবর্তী হরফে যান"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>
          )}

          <button
            onClick={restartGame}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BUBBLE / BALLOON PLAYFIELD (RISING UPWARDS ACROSS LANDSCAPE)
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
              {/* 3D Iridescent Soap Bubble Sphere */}
              <div
                className="w-full h-full rounded-full relative flex items-center justify-center border-2 shadow-2xl transition-all group-hover:scale-105 group-hover:brightness-110"
                style={{
                  background: bubble.theme.bg,
                  borderColor: bubble.theme.border,
                  boxShadow: bubble.theme.shadow,
                }}
              >
                {/* 3D Curved Specular Glass Highlight at Top-Left */}
                <div className="absolute top-2 left-3 w-5 h-3 bg-white/80 rounded-full rotate-[-30deg] blur-2xs pointer-events-none" />
                <div className="absolute bottom-2.5 right-3 w-3 h-2 bg-white/40 rounded-full blur-2xs pointer-events-none" />

                {/* Inner Content inside Bubble */}
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
          BOTTOM INSTRUCTION FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 p-2 sm:p-3 text-center bg-black/20 backdrop-blur-xs text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
        <span>👆</span>
        <span>
          পানির নিচ থেকে ওঠা বুদ্বুদ লক্ষ্য করো! শুধু <strong>{targetItem.nameBn} ({targetItem.ar})</strong> হরফ এবং মিষ্টি ফল 🍎 ফাটাও!
        </span>
        <span className="text-amber-300 font-black">বোমা 💣 এড়াও!</span>
      </footer>

      {/* ══════════════════════════════════════════════════════════
          VICTORY CELEBRATION MODAL (WHEN 10 TARGET LETTERS COLLECTED)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "won" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-amber-400 shadow-2xl transform scale-100">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-amber-950 font-hind-siliguri">
                مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)
              </h2>
              <p className="text-sm font-bold text-emerald-800">
                তুমি সফলভাবে {TARGET_GOAL}টি <strong>{targetItem.nameBn} ({targetItem.ar})</strong> হরফ সংগ্রহ করেছ!
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-500 font-bold">মোট স্কোর</span>
                <div className="text-2xl font-black text-amber-900">{score}</div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <span className="text-xs text-slate-500 font-bold">অর্জন</span>
                <div className="text-xl">⭐⭐⭐</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {onLaunchNinja && (
                <button
                  onClick={() => onLaunchNinja(targetItem)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 animate-pulse cursor-pointer"
                >
                  <span>⚔️</span>
                  <span>পরবর্তী লেভেল: হরফ নিনজা খেলো!</span>
                  <span>➔</span>
                </button>
              )}

              {onNextLetter && (
                <button
                  onClick={onNextLetter}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>পরবর্তী হরফে যাও</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={restartGame}
                className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার খেলো</span>
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

      {/* ══════════════════════════════════════════════════════════
          GAME OVER MODAL (HIT BOMB 3 TIMES)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
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

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-500 font-bold">অর্জিত স্কোর</span>
                <div className="text-xl font-black text-slate-800">{score}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-xs text-slate-500 font-bold">সংগৃহীত হরফ</span>
                <div className="text-xl font-black text-emerald-700">{targetCount}টি</div>
              </div>
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
