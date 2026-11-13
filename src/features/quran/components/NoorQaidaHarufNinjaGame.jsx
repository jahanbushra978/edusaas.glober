"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Home,
  RotateCcw,
  ChevronRight,
  Pause,
  Play,
  Heart,
  X,
  Sparkles,
} from "lucide-react";
import { universalAudioEngine } from "@/lib/quran/audio";

// ── FRUITS WITH EXACT COLOR CODES FOR JUICE SPLATTERS ──
const NINJA_FRUITS = [
  { icon: "🍏", nameBn: "সবুজ আপেল", color: "#84cc16", juiceColor: "rgba(132, 204, 22, 0.85)" },
  { icon: "🍎", nameBn: "লাল আপেল", color: "#ef4444", juiceColor: "rgba(239, 68, 68, 0.85)" },
  { icon: "🥝", nameBn: "কিউই", color: "#65a30d", juiceColor: "rgba(101, 163, 13, 0.85)" },
  { icon: "🍌", nameBn: "কলা", color: "#eab308", juiceColor: "rgba(234, 179, 8, 0.85)" },
  { icon: "🍉", nameBn: "তরমুজ", color: "#f43f5e", juiceColor: "rgba(244, 63, 94, 0.85)" },
  { icon: "🍐", nameBn: "নাশপাতি", color: "#a3e635", juiceColor: "rgba(163, 230, 53, 0.85)" },
  { icon: "🍓", nameBn: "স্ট্রবেরি", color: "#e11d48", juiceColor: "rgba(225, 29, 72, 0.85)" },
  { icon: "🍊", nameBn: "কমলা", color: "#f97316", juiceColor: "rgba(249, 115, 22, 0.85)" },
];

export default function NoorQaidaHarufNinjaGame({
  targetItem = { ar: "س", nameBn: "সীন", sound: "س" },
  onClose = () => {},
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
  const [isMuted, setIsMuted] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  // References for Game Loop and Interactive Physics
  const itemsRef = useRef([]);
  const splattersRef = useRef([]);
  const bladeTrailRef = useRef([]);
  const isPointerDownRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const lastSpawnTimeRef = useRef(Date.now());
  const isShakingRef = useRef(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  // Load best score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("noor_qaida_ninja_best");
      if (saved) setBestScore(parseInt(saved, 10));
    } catch {}
  }, []);

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
    } catch {}
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
    } catch {}
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
    } catch {}
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
    } catch {}
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
    let juiceColor = "rgba(239, 68, 68, 0.85)";

    // 40% Target letter, 35% Fruit, 25% Bomb
    if (rand < 0.4) {
      type = "target";
      content = targetItem.ar || "س";
      color = "#f59e0b"; // Golden glow for Arabic letter
      juiceColor = "rgba(245, 158, 11, 0.85)";
    } else if (rand < 0.75) {
      type = "fruit";
      const fruit = NINJA_FRUITS[Math.floor(Math.random() * NINJA_FRUITS.length)];
      content = fruit.icon;
      color = fruit.color;
      juiceColor = fruit.juiceColor;
    } else {
      type = "bomb";
      content = "💣";
      color = "#1e293b";
      juiceColor = "rgba(225, 29, 72, 0.9)";
    }

    const radius = type === "target" ? 44 : 38;
    // Launch from bottom quarter
    const x = Math.random() * (width * 0.7) + width * 0.15;
    const y = height + 40;

    // Upward launch velocity with parabolic gravity
    const vy = -(Math.random() * 4 + 14.5); // Peak height around middle screen
    // Horizontal drift towards center
    const vx = ((width / 2 - x) / width) * 4 + (Math.random() * 2 - 1);
    const rotation = Math.random() * Math.PI * 2;
    const vRot = (Math.random() - 0.5) * 0.08;

    itemsRef.current.push({
      id: Math.random(),
      type,
      content,
      color,
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
  }, [targetItem]);

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
            universalAudioEngine.playArabicSound(targetItem.sound || targetItem.ar, { rate: 1.0 });
          }

          setScore((s) => {
            const nextScore = s + 25;
            if (nextScore > bestScore) {
              setBestScore(nextScore);
              try {
                localStorage.setItem("noor_qaida_ninja_best", nextScore.toString());
              } catch {}
            }
            return nextScore;
          });

          setSlicedTargetCount((curr) => {
            const nextCount = curr + 1;
            if (nextCount >= TARGET_GOAL) {
              setGameState("won");
              playVictorySound();
            }
            return nextCount;
          });
        } else if (item.type === "fruit") {
          // FRUIT SLICED!
          playFruitSquishSound();
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > bestScore) {
              setBestScore(nextScore);
              try {
                localStorage.setItem("noor_qaida_ninja_best", nextScore.toString());
              } catch {}
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
              setGameState("gameover");
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

    if (item.type === "target") {
      // Golden Glowing Arabic Orb
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 20;

      // Outer circle
      const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, item.radius);
      gradient.addColorStop(0, "#fef3c7");
      gradient.addColorStop(0.7, "#f59e0b");
      gradient.addColorStop(1, "#b45309");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Arabic Calligraphy in center
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 34px 'Amiri', 'Traditional Arabic', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.content, 0, -2);
    } else if (item.type === "bomb") {
      // Danger Cartoon Bomb
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 15;

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
      // Juicy Fruit
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 12;

      ctx.font = "42px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.content, 0, 0);
    }

    ctx.restore();
  };

  // ── DRAW SLICED HALVES FLYING APART ──
  const drawSlicedHalves = (ctx, item) => {
    const age = (Date.now() - item.slicedAt) / 1000;
    const spread = age * 90; // Drift apart distance

    // Left Half
    ctx.save();
    ctx.translate(item.x - spread, item.y);
    ctx.rotate(item.rotation - age * 3);
    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (item.type === "target") {
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(item.content, 0, 0);
    } else {
      ctx.fillText(item.content, 0, 0);
    }
    ctx.restore();

    // Right Half
    ctx.save();
    ctx.translate(item.x + spread, item.y);
    ctx.rotate(item.rotation + age * 3);
    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (item.type === "target") {
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(item.content, 0, 0);
    } else {
      ctx.fillText(item.content, 0, 0);
    }
    ctx.restore();
  };

  // ── DRAW GLOWING LASER BLADE SLASH TRAIL ──
  const drawBladeTrail = (ctx, trail) => {
    if (trail.length < 2) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Outer Golden Sword Glow
    ctx.strokeStyle = "rgba(250, 204, 21, 0.75)";
    ctx.lineWidth = 14;
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();

    // Inner White Sharp Laser Core
    ctx.strokeStyle = "#ffffff";
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

  // ── RESTART GAME ──
  const restartGame = () => {
    setScore(0);
    setSlicedTargetCount(0);
    setLives(3);
    itemsRef.current = [];
    splattersRef.current = [];
    setGameState("playing");
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden select-none flex flex-col justify-between font-hind-siliguri ${
        shakeScreen ? "animate-shake" : ""
      }`}
    >
      {/* ══════════════════════════════════════════════════════════
          TOP NINJA HUD (MATCHING USER SCREENSHOT)
          (Home, Target Badge, Sliced Score, Best Score, Lives, Pause)
      ══════════════════════════════════════════════════════════ */}
      <header className="relative z-30 p-2 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full pointer-events-auto">
        {/* Left: Home Button (Back to Qaida) */}
        <button
          onClick={onClose}
          className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-900/90 hover:bg-amber-800 text-amber-200 border-2 border-amber-600 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="কায়দায় ফিরে যান"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center: Mission Target Letter & Score Box */}
        <div className="flex items-center gap-2 sm:gap-4 bg-amber-950/85 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-500 shadow-2xl text-white">
          {/* Target Letter Display */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black text-amber-200 hidden xs:inline">
              কাটার লক্ষ্য:
            </span>
            <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-arabic font-black text-xl sm:text-2xl shadow-md flex items-center gap-1.5 animate-pulse">
              <span>{targetItem.ar}</span>
              <span className="text-[10px] font-sans font-bold bg-white/20 px-1.5 rounded">
                {targetItem.nameBn}
              </span>
            </div>
          </div>

          {/* Sliced Progress Goal */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/80 border border-emerald-400 text-emerald-200 font-black text-xs sm:text-sm">
            <span>🎯</span>
            <span>
              {slicedTargetCount} / {TARGET_GOAL}
            </span>
          </div>

          {/* Sliced Score with Pear icon matching screenshot */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-amber-300">
            <span>🍐</span>
            <span>{score}</span>
            <span className="text-[10px] text-amber-400/80 hidden sm:inline ml-1 font-mono">
              (সেরা: {bestScore})
            </span>
          </div>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`text-base sm:text-lg transition-transform ${
                  heartIndex <= lives ? "scale-100 animate-bounce" : "opacity-25 grayscale scale-75"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Right: Sound & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-900/90 hover:bg-amber-800 text-amber-200 border-2 border-amber-600 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={isMuted ? "সাউন্ড চালু করুন" : "সাউন্ড মিউট করুন"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {onNextLetter && (
            <button
              onClick={onNextLetter}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-300 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="পরবর্তী হরফে যান"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>
          )}

          <button
            onClick={restartGame}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-400 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="নতুন করে শুরু করুন"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
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
          BOTTOM SWIPE INSTRUCTION FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 p-2.5 sm:p-3 text-center bg-black/40 backdrop-blur-xs text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 pointer-events-none">
        <span>⚔️</span>
        <span>
          আঙুল বা মাউস টেনে তরবারির মতো সোয়াইপ করো! লক্ষ্য হরফ <strong>{targetItem.nameBn} ({targetItem.ar})</strong> ও মিষ্টি ফল কাটো!
        </span>
        <span className="text-rose-400 font-black">বোমা 💣 কাটো না!</span>
      </footer>

      {/* ══════════════════════════════════════════════════════════
          VICTORY CELEBRATION MODAL (10 TARGET LETTERS SLICED)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "won" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-[#FFFDF7] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-amber-500 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              ⚔️🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-amber-950 font-hind-siliguri">
                مَا شَاءَ اللَّهُ (মাশাআল্লাহ!)
              </h2>
              <p className="text-sm font-bold text-emerald-800">
                তুমি নিনজার মতো সফলভাবে {TARGET_GOAL}টি <strong>{targetItem.nameBn} ({targetItem.ar})</strong> হরফ কেটেছো!
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
              {onNextLetter && (
                <button
                  onClick={onNextLetter}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>পরবর্তী হরফে যাও</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {onSwitchToBubble && (
                <button
                  onClick={onSwitchToBubble}
                  className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>🎈 বুদ্বুদ মোডে ফিরে খেলুন</span>
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
          GAME OVER MODAL (SLICED 3 BOMBS)
      ══════════════════════════════════════════════════════════ */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-4 border-rose-500 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 border-4 border-rose-400 flex items-center justify-center text-4xl shadow-inner animate-pulse">
              💥
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-rose-950 font-hind-siliguri">
                ওহ নো! বোমায় তলোয়ার লেগেছে!
              </h2>
              <p className="text-xs text-slate-600 font-bold">
                জীবন শেষ হয়ে গেছে। হরফ ও ফলের মাঝে লুকিয়ে থাকা বোমায় ভুলেও সোয়াইপ করো না!
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-slate-500 font-bold">অর্জিত স্কোর</span>
                <div className="text-xl font-black text-slate-800">{score}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-xs text-slate-500 font-bold">কাটা হরফ</span>
                <div className="text-xl font-black text-emerald-700">{slicedTargetCount}টি</div>
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
