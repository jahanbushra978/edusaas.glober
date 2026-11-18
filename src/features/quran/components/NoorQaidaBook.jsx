"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Award,
  Layers,
  Printer,
  X,
  Star,
  ArrowRight,
  Gamepad2,
  LayoutGrid,
  RotateCw,
} from "lucide-react";
import {
  NOOR_QAIDA_PARVAS,
  NOOR_QAIDA_CLASSES,
  getClassByNumber,
  getParvaById,
} from "../data/noorQaidaCurriculumData";
import {
  PARVA_THEMES,
  SPECIAL_PAGES,
} from "../data/noorQaidaPagesData";
import { nurQaidaAudioEngine, QAIDA_TAKHTI_1_LETTERS } from "@/lib/quran/audio";
import { formatBangladeshDate } from "@/lib/quran/bangladesh-time";
import NoorQaidaBubblePopGame from "./NoorQaidaBubblePopGame";
import NoorQaidaHarufNinjaGame from "./NoorQaidaHarufNinjaGame";

// Full sequence of pages including special intro pages
const PAGE_SEQUENCE = [
  "cover",       // পৃষ্ঠা ১: প্রচ্ছদ
  "rules",       // পৃষ্ঠা ৩: ব্যবহারের নিয়ম
  "color-code",  // পৃষ্ঠা ৫: চিহ্ন ও রঙ-সংকেত
  ...Array.from({ length: 78 }, (_, i) => i + 1), // ক্লাস ১ থেকে ৭৮ (পৃষ্ঠা ৮ থেকে ১০১)
];

// 🎈 ঝিলিক বাতির মতো ছোট ছোট রঙিন বল ও বেলুন অ্যানিমেশন (কোনো তারার আইকন ছাড়া শতভাগ শিশু-বান্ধব)
function JhilikBalloonBurst() {
  const balls = [
    { angle: 0, distance: 54, bg: "bg-emerald-400", shadow: "shadow-[0_0_12px_#34d399]", size: "w-3 h-3" },
    { angle: 36, distance: 48, bg: "bg-amber-400", shadow: "shadow-[0_0_12px_#fbbf24]", size: "w-2.5 h-2.5" },
    { angle: 72, distance: 56, bg: "bg-cyan-400", shadow: "shadow-[0_0_12px_#22d3ee]", size: "w-3 h-3" },
    { angle: 108, distance: 46, bg: "bg-rose-400", shadow: "shadow-[0_0_12px_#fb7185]", size: "w-2.5 h-2.5" },
    { angle: 144, distance: 54, bg: "bg-purple-400", shadow: "shadow-[0_0_12px_#c084fc]", size: "w-3 h-3" },
    { angle: 180, distance: 50, bg: "bg-orange-400", shadow: "shadow-[0_0_12px_#fb923c]", size: "w-2.5 h-2.5" },
    { angle: 216, distance: 58, bg: "bg-lime-400", shadow: "shadow-[0_0_12px_#a3e635]", size: "w-3 h-3" },
    { angle: 252, distance: 45, bg: "bg-sky-400", shadow: "shadow-[0_0_12px_#38bdf8]", size: "w-2.5 h-2.5" },
    { angle: 288, distance: 54, bg: "bg-fuchsia-400", shadow: "shadow-[0_0_12px_#e879f9]", size: "w-3 h-3" },
    { angle: 324, distance: 48, bg: "bg-yellow-300", shadow: "shadow-[0_0_12px_#fde047]", size: "w-2.5 h-2.5" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-30">
      {/* 🎈 প্রধান উৎসবের বেলুন যা নিচ থেকে ওপরে ভেসে উঠবে */}
      <div className="absolute left-1/2 top-1/2 animate-balloon-rise pointer-events-none select-none z-20 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl filter drop-shadow-md">🎈</span>
      </div>

      {/* 🎈 সহকারী ছোট রঙিন বেলুন ডানে মৃদুভাবে ভেসে উঠবে */}
      <div
        className="absolute left-[62%] top-1/2 animate-balloon-rise pointer-events-none select-none z-20"
        style={{ animationDelay: "70ms" }}
      >
        <span className="text-xl sm:text-2xl filter drop-shadow-sm">🎈</span>
      </div>

      {/* 💡 ঝিলিক বাতির মতো ১০টি রঙিন আলো-বল যা ভেতর থেকে চারদিকে সুন্দরভাবে ছিটবে */}
      {balls.map((b, idx) => {
        const rad = (b.angle * Math.PI) / 180;
        const tx = Math.round(Math.cos(rad) * b.distance);
        const ty = Math.round(Math.sin(rad) * b.distance);
        return (
          <span
            key={idx}
            className={`absolute left-1/2 top-1/2 rounded-full ${b.size} ${b.bg} ${b.shadow} animate-jhilik-ball`}
            style={{
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
              animationDelay: `${idx * 20}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function NoorQaidaBook({ initialClass = "cover", onNavigateBack }) {
  // Navigation State
  const [currentPage, setCurrentPage] = useState(initialClass); // 'cover' | 'rules' | 'color-code' | 1..78
  const [previousPage, setPreviousPage] = useState(initialClass);
  const [activeTab, setActiveTab] = useState("class"); // 'class' | 'game' | 'chart' | 'certificate'
  const [activeGameId, setActiveGameId] = useState(1);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState("");

  // Reading Modes: '3d' (True 3D Flipbook) | 'scroll' (Continuous Scroll) | 'single' (Normal Card)
  const [viewMode, setViewMode] = useState("3d");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("next"); // 'next' | 'prev'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile Game Auto-Rotate & Orientation State
  const [isGameLandscape, setIsGameLandscape] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // 🎈 Scenic Landscape Bubble / Balloon Pop Game State
  const [isBubbleGameOpen, setIsBubbleGameOpen] = useState(false);
  // ⚔️ Fruit Ninja Style Haruf Slicer Game State (Level 2)
  const [isNinjaGameOpen, setIsNinjaGameOpen] = useState(false);
  const [bubbleGameTarget, setBubbleGameTarget] = useState({ ar: "س", nameBn: "সীন", sound: "س" });
  const [poppingCardId, setPoppingCardId] = useState(null);

  // Playback & Sound State
  const [activeItemId, setActiveItemId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState(1);
  const playAllAbortRef = useRef(false);

  // Ball bounce animation for Qalqalah (Class 39)
  const [ballBouncing, setBallBouncing] = useState(false);

  // Student Gamification & Star Collection
  const [completedClasses, setCompletedClasses] = useState([]);
  const [earnedStars, setEarnedStars] = useState({});
  const [celebrationToast, setCelebrationToast] = useState(null);
  const [studentName, setStudentName] = useState("মুহাম্মদ আবদুল্লাহ");

  // Touch Swipe Handling for Mobile
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Scroll View container ref
  const scrollContainerRef = useRef(null);
  const bookFrameRef = useRef(null);

  // Smoothly anchor to the reading card without jumping to the top of the entire website
  const scrollToBookComfortably = () => {
    if (typeof window === "undefined" || !bookFrameRef.current) return;
    try {
      const rect = bookFrameRef.current.getBoundingClientRect();
      // If user was scrolled down at the bottom of the card or past it, gently align reading area
      // without jumping all the way to top of browser/website (0, 0)
      if (rect.top < 60 || rect.top > 350) {
        bookFrameRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch { }
  };

  // Detect mobile & screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileDevice(isMobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // When game is activated on mobile, automatically prompt or activate landscape orientation!
  useEffect(() => {
    const isGameActive = isBubbleGameOpen || isNinjaGameOpen || (activeTab === "game" && isMobileDevice);
    if (isGameActive && isMobileDevice) {
      setIsGameLandscape(true);
      // Try to lock orientation to landscape if browser supports it
      try {
        if (window.screen?.orientation?.lock) {
          window.screen.orientation.lock("landscape").catch(() => {
            // Gracefully handled if browser rejects or requires fullscreen first
          });
        }
      } catch { }
    } else {
      setIsGameLandscape(false);
      try {
        if (window.screen?.orientation?.unlock) {
          window.screen.orientation.unlock();
        }
      } catch { }
      // Exit fullscreen if game had entered fullscreen
      try {
        if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => { });
        }
      } catch { }
    }
  }, [activeTab, isMobileDevice, isBubbleGameOpen, isNinjaGameOpen]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem("noor_qaida_completed_classes");
      if (savedCompleted) setCompletedClasses(JSON.parse(savedCompleted));
      const savedStars = localStorage.getItem("noor_qaida_earned_stars");
      if (savedStars) setEarnedStars(JSON.parse(savedStars));
      const savedName = localStorage.getItem("noor_qaida_student_name");
      if (savedName) setStudentName(savedName);
      const savedMode = localStorage.getItem("noor_qaida_view_mode");
      if (savedMode) setViewMode(savedMode);
    } catch { }
  }, []);

  // Save student name
  const handleSaveStudentName = (name) => {
    setStudentName(name);
    try {
      localStorage.setItem("noor_qaida_student_name", name);
    } catch { }
  };

  // Toggle View Mode
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("noor_qaida_view_mode", mode);
    } catch { }
  };

  // ── 1. REALISTIC CRISP PAPER RUSTLE & PAGE FLAP SOUND ──
  const playCrispPaperSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      // Layer 1: Bandpass filtered white noise for paper surface friction
      const bufferSize = Math.floor(ctx.sampleRate * 0.24); // 240ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const envelope = Math.sin((t / 0.24) * Math.PI) * Math.exp(-t * 10);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.45;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bpf = ctx.createBiquadFilter();
      bpf.type = "bandpass";
      bpf.frequency.setValueAtTime(2600, now);
      bpf.frequency.exponentialRampToValueAtTime(1100, now + 0.24);
      bpf.Q.setValueAtTime(1.9, now);

      // Layer 2: Gentle air displacement whoosh
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
      oscGain.gain.setValueAtTime(0.09, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(bpf);
      bpf.connect(ctx.destination);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch { }
  };

  // ── 2. CUTE BUBBLE POP SOUND FOR CLICKING TILES ──
  const playCuteBubbleSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch { }
  };

  // Stop sound when page changes
  useEffect(() => {
    playAllAbortRef.current = true;
    setIsPlayingAll(false);
    setActiveItemId(null);
    nurQaidaAudioEngine.stop();
  }, [currentPage, activeTab]);

  // Audio Play Function for Any Item (With Pop Burst Visual & Sound via NurQaidaAudioEngine)
  const playItemSound = async (item, speed = audioSpeed) => {
    if (item?.audioStatus === "unverified") {
      setCelebrationToast("এই উচ্চারণের নির্ভরযোগ্য ক্বারী রেকর্ডিং যাচাই হয়নি; তাই অডিও বাজানো হয়নি।");
      setTimeout(() => setCelebrationToast(null), 3500);
      return false;
    }

    playCuteBubbleSound();
    const itemId = typeof item === "string" ? item : (item.id || item.ar);
    setActiveItemId(itemId);
    setPoppingCardId(itemId);
    setTimeout(() => {
      setPoppingCardId((curr) => (curr === itemId ? null : curr));
    }, 650);

    try {
      let played = false;
      if (item && item.ayahRef) {
        played = await nurQaidaAudioEngine.play(
          { surah: item.ayahRef.surah, ayah: item.ayahRef.ayah },
          { rate: speed }
        );
      } else if (item && item.audioUrl) {
        played = await nurQaidaAudioEngine.play(item.audioUrl, { rate: speed });
      } else {
        played = await nurQaidaAudioEngine.play(item, { rate: speed });
      }
      if (!played) {
        setCelebrationToast("এই উচ্চারণের যাচাইকৃত অডিও পাওয়া যায়নি; তাই অন্য অডিও চালানো হয়নি।");
        setTimeout(() => setCelebrationToast(null), 3500);
      }
      return played;
    } catch (err) {
      console.warn("Audio play error:", err);
      setCelebrationToast("অডিও লোড করা যায়নি। আবার চেষ্টা করুন।");
      setTimeout(() => setCelebrationToast(null), 3500);
      return false;
    } finally {
      setActiveItemId((curr) => (curr === itemId ? null : curr));
    }
  };

  // Launch Scenic Landscape Bubble Pop Game for Any Specific Letter
  const handleLaunchBubbleGame = (item) => {
    const soundKey = typeof item === "string" ? item : (item.sound || item.ar);
    const ar = typeof item === "string" ? item : (item.ar || item.sound || "س");
    const nameBn = typeof item === "string" ? item : (item.nameBn || "হরফ");
    setBubbleGameTarget({
      ar,
      nameBn,
      sound: soundKey,
    });
    setIsNinjaGameOpen(false);
    setIsBubbleGameOpen(true);
  };

  // Launch Fruit Ninja Style Haruf Slicer Game (Level 2)
  const handleLaunchNinjaGame = (item) => {
    if (item) {
      const soundKey = typeof item === "string" ? item : (item.sound || item.ar);
      const ar = typeof item === "string" ? item : (item.ar || item.sound || "س");
      const nameBn = typeof item === "string" ? item : (item.nameBn || "হরফ");
      setBubbleGameTarget({
        ar,
        nameBn,
        sound: soundKey,
      });
    }
    setIsBubbleGameOpen(false);
    setIsNinjaGameOpen(true);
  };

  // Switch to Next Letter inside Bubble Game & Ninja Game
  const handleNextLetterForGame = () => {
    // 1. First check if current letter is part of canonical Takhti 1 sequence (all 29 letters)
    if (QAIDA_TAKHTI_1_LETTERS && QAIDA_TAKHTI_1_LETTERS.length > 0) {
      const t1Index = QAIDA_TAKHTI_1_LETTERS.findIndex(
        (it) => it.ar === bubbleGameTarget.ar || it.id === bubbleGameTarget.id || it.sound === bubbleGameTarget.sound
      );
      if (t1Index !== -1) {
        const nextIndex = (t1Index + 1) % QAIDA_TAKHTI_1_LETTERS.length;
        const nextItem = QAIDA_TAKHTI_1_LETTERS[nextIndex];
        if (nextItem) {
          handleLaunchBubbleGame(nextItem);
          return;
        }
      }
    }

    // 2. Fallback to current page class items if on higher lessons
    if (typeof currentPage === "number") {
      const cls = getClassByNumber(currentPage);
      if (cls && cls.items && cls.items.length > 0) {
        const currentIndex = cls.items.findIndex(
          (it) => it.ar === bubbleGameTarget.ar || it.id === bubbleGameTarget.id
        );
        const nextIndex = (currentIndex + 1) % cls.items.length;
        const nextItem = cls.items[nextIndex];
        if (nextItem) {
          handleLaunchBubbleGame(nextItem);
          return;
        }
      }
    }

    // 3. Fallback to first Takhti 1 letter
    if (QAIDA_TAKHTI_1_LETTERS?.[0]) {
      handleLaunchBubbleGame(QAIDA_TAKHTI_1_LETTERS[0]);
    }
  };

  // "আজ আমি পারলাম ⭐" Star Claim Action
  const handleClaimStar = (classNum) => {
    const isAlreadyClaimed = earnedStars[classNum];
    const newEarned = { ...earnedStars, [classNum]: !isAlreadyClaimed };
    setEarnedStars(newEarned);

    let updatedCompleted;
    if (!isAlreadyClaimed) {
      updatedCompleted = Array.from(new Set([...completedClasses, classNum]));
      setCelebrationToast(`মাশাআল্লাহ! ক্লাস ${classNum}-এর তারা অর্জিত হয়েছে! ⭐`);
      setTimeout(() => setCelebrationToast(null), 3500);
    } else {
      updatedCompleted = completedClasses.filter((c) => c !== classNum);
    }
    setCompletedClasses(updatedCompleted);

    try {
      localStorage.setItem("noor_qaida_earned_stars", JSON.stringify(newEarned));
      localStorage.setItem("noor_qaida_completed_classes", JSON.stringify(updatedCompleted));
    } catch { }
  };

  // ── 3. TRUE 3D PAGE TURN NAVIGATION (GENUINE 3D LEAF ROTATION) ──
  const navigateToPage = (targetPage, direction = "next") => {
    if (currentPage === targetPage) return;

    if (viewMode === "3d") {
      playCrispPaperSound();
      setPreviousPage(currentPage);
      setFlipDirection(direction);
      setIsFlipping(true);

      // Duration is 700ms so the user can visually admire the page curling and turning over!
      setTimeout(() => {
        setCurrentPage(targetPage);
        setActiveTab("class");
        scrollToBookComfortably();
        setTimeout(() => {
          setIsFlipping(false);
        }, 350);
      }, 350);
    } else if (viewMode === "scroll") {
      setCurrentPage(targetPage);
      setActiveTab("class");
      setTimeout(() => {
        const el = document.getElementById(`qaida-page-${targetPage}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    } else {
      setCurrentPage(targetPage);
      setActiveTab("class");
      scrollToBookComfortably();
    }
  };

  const handleNextPage = () => {
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    if (currentIndex < PAGE_SEQUENCE.length - 1) {
      navigateToPage(PAGE_SEQUENCE[currentIndex + 1], "next");
    }
  };

  const handlePrevPage = () => {
    const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
    if (currentIndex > 0) {
      navigateToPage(PAGE_SEQUENCE[currentIndex - 1], "prev");
    }
  };

  // Touch Swipe Handlers for Mobile Phones
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Sequential Play All ("একটানা মাশক")
  const handlePlayAll = async () => {
    if (isPlayingAll) {
      playAllAbortRef.current = true;
      setIsPlayingAll(false);
      nurQaidaAudioEngine.stop();
      setActiveItemId(null);
      return;
    }

    if (typeof currentPage !== "number") return;
    const cls = getClassByNumber(currentPage);
    if (!cls || !cls.items || cls.items.length === 0) return;

    setIsPlayingAll(true);
    playAllAbortRef.current = false;

    const items = cls.items;
    const repetitions = repeatMode;

    for (let rep = 0; rep < repetitions; rep++) {
      if (playAllAbortRef.current) break;

      for (let i = 0; i < items.length; i++) {
        if (playAllAbortRef.current) break;
        const item = items[i];
        setActiveItemId(item.id || item.ar);

        if (item.audioStatus === "unverified") {
          setCelebrationToast("এই উচ্চারণের নির্ভরযোগ্য ক্বারী রেকর্ডিং যাচাই হয়নি; তাই অডিও বাজানো হয়নি।");
          setTimeout(() => setCelebrationToast(null), 3500);
          playAllAbortRef.current = true;
          break;
        }

        try {
          if (item.ayahRef) {
            await nurQaidaAudioEngine.play(
              { surah: item.ayahRef.surah, ayah: item.ayahRef.ayah },
              { rate: audioSpeed }
            );
          } else if (item.audioUrl) {
            await nurQaidaAudioEngine.play(item.audioUrl, { rate: audioSpeed });
          } else {
            await nurQaidaAudioEngine.play(item, {
              rate: audioSpeed,
            });
          }
        } catch { }

        await new Promise((r) => setTimeout(r, 450));
      }
    }

    setIsPlayingAll(false);
    setActiveItemId(null);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
        setIsFullscreen(false);
      }
    }
  };

  // Current Class & Parva Objects (only when on numeric class page)
  const isClassPage = typeof currentPage === "number";
  const currentClass = useMemo(
    () => (isClassPage ? getClassByNumber(currentPage) : null),
    [currentPage, isClassPage]
  );
  const currentParva = useMemo(
    () => (currentClass ? getParvaById(currentClass.parvaNumber) : null),
    [currentClass]
  );
  const parvaTheme = useMemo(
    () => (currentClass ? PARVA_THEMES[currentClass.parvaNumber] || PARVA_THEMES[1] : PARVA_THEMES[1]),
    [currentClass]
  );

  const isClassStarEarned = isClassPage ? !!earnedStars[currentPage] : false;
  const completionPercent = Math.round(
    (completedClasses.length / NOOR_QAIDA_CLASSES.length) * 100
  );

  // Label for current page
  const getPageHeaderLabel = () => {
    if (currentPage === "cover") return "প্রচ্ছদ (পৃষ্ঠা ১)";
    if (currentPage === "rules") return "পড়ার নিয়ম (পৃষ্ঠা ৩)";
    if (currentPage === "color-code") return "রঙ-সংকেত (পৃষ্ঠা ৫)";
    return `ক্লাস ${currentClass?.classNumberBn} • পৃষ্ঠা ${currentPage + 7}`;
  };

  // ── 4. MODULAR PAGE CONTENT RENDERER (RENDERS ANY PAGE CONTENT CLEANLY) ──
  const renderPageBody = (pageId) => {
    if (pageId === "cover") {
      return (
        <div className="p-5 sm:p-10 bg-gradient-to-b from-emerald-100/70 via-amber-50/50 to-emerald-200/50 text-center space-y-6">
          <div className="relative py-2 flex flex-col items-center">
            <div className="text-6xl sm:text-7xl animate-bounce select-none">🕌</div>
            <div className="flex items-center justify-center gap-3 text-amber-400 text-2xl mt-2 select-none">
              <span>☀️</span>
              <span>🌙</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md inline-block font-hind-siliguri">
              মক্তব শিক্ষা পাঠ্যপাঠিকা
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-emerald-950 font-hind-siliguri tracking-tight">
              নূর কায়দা
            </h2>
            <p className="text-base sm:text-lg font-black text-amber-900 font-hind-siliguri">
              হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 shadow-xl space-y-4">
            <div className="flex items-center justify-center gap-6 sm:gap-8 text-4xl sm:text-5xl select-none">
              <div className="flex flex-col items-center hover:scale-110 transition">
                <span>🧒</span>
                <span className="text-xs font-black text-emerald-900 mt-1">আহমদ</span>
              </div>
              <div className="text-2xl sm:text-3xl text-emerald-600 font-arabic font-bold bg-emerald-50 px-4 py-2 rounded-2xl border-2 border-emerald-300">
                ا ب ت ث
              </div>
              <div className="flex flex-col items-center hover:scale-110 transition">
                <span>🧕</span>
                <span className="text-xs font-black text-emerald-900 mt-1">ফাতিমা</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-300">
                <span className="text-lg">🔤</span>
                <span>২৯টি হরফের মাশক</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-blue-50 text-blue-950 border border-blue-300">
                <span className="text-lg">🔵</span>
                <span>রঙ-সংকেত হরকত</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 text-amber-950 border border-amber-300">
                <span className="text-lg">🗣️</span>
                <span>সচিত্র ১৭ মাখরাজ</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-purple-50 text-purple-950 border border-purple-300">
                <span className="text-lg">🎮</span>
                <span>৪টি আনন্দময় খেলা</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-hind-siliguri font-bold">
              📖 ছবি • রঙ • চার্ট • অনুশীলনী — শিক্ষক ও ছাত্র দুজনের জন্য
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigateToPage("rules", "next")}
              className="inline-flex items-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-300"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              <span>বই পড়া শুরু করো ➔</span>
            </button>
          </div>
        </div>
      );
    }

    if (pageId === "rules") {
      return (
        <div className="p-4 sm:p-8 space-y-5 bg-slate-50/60">
          <div className="text-center space-y-1">
            <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
              পৃষ্ঠা ৩ • উস্তাদ ও অভিভাবকের নির্দেশিকা
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hind-siliguri">
              কীভাবে ব্যবহার করবেন — শিক্ষক ও অভিভাবকের জন্য
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              সহজ, মিষ্টি ও কার্যকর মক্তব পাঠ্যপদ্ধতি
            </p>
          </div>

          <div className="space-y-3">
            {SPECIAL_PAGES[3].items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-emerald-300 transition"
              >
                <span className="text-2xl sm:text-3xl shrink-0 select-none">{item.icon}</span>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 font-hind-siliguri">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-hind-siliguri font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigateToPage("color-code", "next")}
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95"
            >
              <span>পরবর্তী: চিহ্ন ও রঙ-সংকেত ➔</span>
            </button>
          </div>
        </div>
      );
    }

    if (pageId === "color-code") {
      return (
        <div className="p-4 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <span className="px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 font-black text-xs border border-blue-300">
              পৃষ্ঠা ৫ • সর্বজনীন রঙ-সংকেত
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-hind-siliguri">
              চিহ্ন ও রঙ-সংকেত
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              সারা বইয়ে একই রঙ, একই চিহ্ন — যেকোনো কার্ডে ক্লিক করলেই খাঁটি উচ্চারণ শুনবে
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4" dir="rtl">
            {SPECIAL_PAGES[5].cards.map((card, idx) => {
              const isItemActive = activeItemId === card.nameBn;
              return (
                <div
                  key={idx}
                  onClick={() => playItemSound({ ar: card.ar, id: card.nameBn, sound: card.ar, audioStatus: card.audioStatus })}
                  className={`p-3 sm:p-4 rounded-3xl border-3 text-center cursor-pointer transition-all ${card.bg} ${card.border} ${isItemActive
                    ? "scale-105 ring-4 ring-emerald-400 shadow-xl"
                    : "hover:scale-102 hover:shadow-md"
                    }`}
                >
                  <div className="font-arabic text-3xl sm:text-5xl font-bold text-slate-900 mb-1 sm:mb-2">
                    {card.ar}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-800 font-hind-siliguri" dir="ltr">
                    {card.nameBn}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-600 font-hind-siliguri mt-0.5" dir="ltr">
                    {card.ruleBn}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-300 text-slate-700 mt-1.5 inline-block" dir="ltr">
                    {card.soundBn}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center text-xs text-amber-900 font-bold">
            {SPECIAL_PAGES[5].footerTip}
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => navigateToPage(1, "next")}
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95"
            >
              <span>পরবর্তী: ক্লাস ১ (হরফ পরিচয়) ➔</span>
            </button>
          </div>
        </div>
      );
    }

    // Regular Class Page (1 to 78)
    const cls = getClassByNumber(typeof pageId === "number" ? pageId : 1);
    if (!cls) return null;
    const theme = PARVA_THEMES[cls.parvaNumber] || PARVA_THEMES[1];
    const isStar = !!earnedStars[cls.classNumber];

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${theme.headerBg} text-white flex items-center justify-between shadow-inner`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white text-emerald-950 flex flex-col items-center justify-center shadow-lg border-2 sm:border-3 border-amber-300 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                ক্লাস
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-900 font-hind-siliguri -mt-1">
                {cls.classNumberBn}
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight font-hind-siliguri">
                {cls.titleBn}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <span className="text-xs sm:text-sm text-emerald-100 font-bold">
                  {cls.parvaTitleBn}
                </span>
                {cls.titleAr && (
                  <span className="hidden sm:inline text-xs text-amber-200 font-arabic font-medium" dir="rtl">
                    • {cls.titleAr}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-300 text-2xl sm:text-4xl select-none shrink-0">
            <span>🌙</span>
            <span>⭐</span>
          </div>
        </div>

        {/* Target Objective */}
        <div className="p-3 sm:p-4 bg-amber-50/90 border-b-2 border-dashed border-amber-400 m-3 sm:m-4 rounded-2xl sm:rounded-3xl flex items-start gap-2.5">
          <span className="text-xl sm:text-2xl shrink-0 select-none">🎯</span>
          <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-hind-siliguri">
            <strong className="font-black text-amber-900 mr-1.5">আমি পারব:</strong>
            {cls.objectiveBn}
          </div>
        </div>

        {/* Audio helper row */}
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
            <span className="font-black text-emerald-950 text-[11px] sm:text-xs font-hind-siliguri">
              যেকোনো হরফ বা শব্দে ক্লিক করলেই ক্বারীর খাঁটি তিলাওয়াত বাজবে
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLaunchBubbleGame(cls.items?.[0] || "ب")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-[11px] sm:text-xs bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 text-amber-950 shadow-xs border border-amber-300 transition-all cursor-pointer active:scale-95"
              title="এই পাঠের হরফ দিয়ে মজার বুদ্বুদ ও বেলুনের খেলা খেলুন"
            >
              <span>🎈</span>
              <span>হরফ গেম</span>
            </button>
            <button
              onClick={() => setAudioSpeed((s) => (s === 1.0 ? 0.75 : 1.0))}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-[10px] sm:text-[11px]"
            >
              {audioSpeed === 0.75 ? "🐢 ০.৭৫x" : "🐇 ১.০x"}
            </button>
            <button
              onClick={handlePlayAll}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-xs ${isPlayingAll ? "bg-rose-600 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
            >
              {isPlayingAll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlayingAll ? "থামুন" : "একটানা"}</span>
            </button>
          </div>
        </div>

        {/* ── CARD USAGE INSTRUCTION BANNER (কার্ড ব্যবহারের সহজ নির্দেশিকা) ── */}
        <div className="mx-3 sm:mx-6 mb-2 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                💡
              </span>
              <h4 className="text-xs sm:text-sm font-black text-emerald-950 font-hind-siliguri">
                কার্ড ব্যবহারের সহজ নিয়ম:
              </h4>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-white/90 border border-emerald-300 px-2 py-0.5 rounded-full font-hind-siliguri shadow-2xs">
              শিশু-বান্ধব ডিজিটাল পাঠ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs font-hind-siliguri">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/85 border border-emerald-200 text-slate-800">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0 text-[10px]">
                ১
              </span>
              <span><strong>যেকোনো কার্ডে ট্যাপ করো:</strong> আঙুল ছোঁয়ালেই ক্বারীর খাঁটি মাখরাজে তেলাওয়াত বাজবে।</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/85 border border-teal-200 text-slate-800">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black shrink-0 text-[10px]">
                ২
              </span>
              <span><strong>মন দিয়ে শোনো ও মুখে বলো:</strong> ক্বারীর আওয়াজ শুনে মুখে ৩ বার বলো।</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/85 border border-amber-200 text-slate-800">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black shrink-0 text-[10px]">
                ৩
              </span>
              <span><strong>নিচের টিপস মিলিয়ে নাও:</strong> কার্ডের নিচে উচ্চারণ নিয়ম ও অঙ্গের বিবরণ দেখে নাও।</span>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-3 sm:p-6 space-y-4">
          {cls.classNumber === 1 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm">
                <span>আরবি বর্ণমালা — ২৯টি হরফ</span>
                <span className="text-amber-200 font-black">👉 ডান থেকে বামে পড়ি 👈</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-3.5" dir="rtl">
                {cls.items.map((item, idx) => {
                  const isItemActive = activeItemId === (item.id || item.ar);
                  const isPopping = poppingCardId === (item.id || item.ar);
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => playItemSound(item)}
                      className={`group relative p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all duration-150 cursor-pointer flex flex-col items-center justify-between text-center select-none min-h-[140px] sm:min-h-[165px] ${isPopping
                        ? "animate-card-pop border-amber-500 ring-4 ring-amber-300 shadow-2xl scale-105 bg-amber-50/60"
                        : isItemActive
                          ? "bg-emerald-100 border-emerald-600 ring-4 ring-emerald-400 shadow-xl scale-105"
                          : "bg-[#FBFDFB] border-emerald-200 hover:border-emerald-500 hover:bg-white hover:shadow-md hover:-translate-y-1 active:translate-y-0.5"
                        }`}
                    >
                      {/* 🎈 ঝিলিক বাতির রঙিন বল ও বেলুন অ্যানিমেশন (কোনো তারার আইকন ছাড়া) */}
                      {isPopping && <JhilikBalloonBurst />}

                      <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                          <span>👆</span>
                          <span className="hidden xs:inline">শোনো</span>
                          <Volume2 className="w-3 h-3 text-emerald-600 inline" />
                        </span>
                      </div>
                      <div className={`font-arabic text-3xl sm:text-5xl font-bold transition-all my-1 ${isItemActive ? "text-emerald-800 scale-110" : "text-slate-900 group-hover:text-emerald-700"
                        }`}>
                        {item.ar}
                      </div>
                      <div className="w-full flex flex-col items-center gap-0.5 mt-0.5" dir="ltr">
                        <div className="text-xs sm:text-sm font-black text-slate-800 font-hind-siliguri">
                          {item.nameBn}
                        </div>
                        {/* 🎮 নতুন "লেভেল খেলুন" বাটন — সরাসরি সংশ্লিষ্ট লেভেলের খেলায় প্রবেশ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchBubbleGame(item);
                          }}
                          className="w-full mt-1.5 py-1 px-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer border border-amber-300"
                          title={`${item.nameBn || item.ar} লেভেল খেলুন`}
                        >
                          <span>🎮</span>
                          <span>লেভেল খেলুন</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : cls.classNumber === 39 ? (
            /* Qalqalah bouncing soccer ball */
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-teal-50 border-3 border-teal-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-teal-200 text-teal-950 font-black text-xs">
                    ক্বলক্বলার ৫টি হরফ (قطبجد - কুতবু জাদ)
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-teal-950 font-hind-siliguri">
                    প্রতিধ্বনি বা বল ড্রপ খাওয়ার মতো আওয়াজ
                  </h3>
                </div>
                <div
                  onClick={() => {
                    setBallBouncing(true);
                    playItemSound({ ar: "أَبْ", sound: "أَبْ" });
                    setTimeout(() => setBallBouncing(false), 1200);
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-3 border-teal-400 shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition shrink-0 hover:scale-105 active:scale-95"
                >
                  <span className={`text-4xl select-none ${ballBouncing ? "animate-bounce" : ""}`}>⚽</span>
                  <span className="text-[10px] font-black text-teal-900 mt-1 font-hind-siliguri">ট্যাপ করে লাফাও</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3" dir="rtl">
                {cls.items.map((it, idx) => {
                  const isItemActive = activeItemId === (it.id || it.ar);
                  const isPopping = poppingCardId === (it.id || it.ar);
                  return (
                    <div
                      key={it.id || idx}
                      onClick={() => playItemSound(it)}
                      className={`group relative p-3 sm:p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-between min-h-[120px] select-none ${isPopping
                        ? "animate-card-pop border-amber-500 ring-4 ring-amber-300 shadow-2xl scale-105 bg-amber-50/60"
                        : isItemActive
                          ? "border-teal-500 ring-4 ring-teal-300 bg-teal-50/50 scale-105"
                          : "border-teal-200 bg-white hover:border-teal-500 hover:shadow-md hover:-translate-y-1 active:translate-y-0.5"
                        }`}
                    >
                      {/* 🎈 ঝিলিক বাতির রঙিন বল ও বেলুন অ্যানিমেশন */}
                      {isPopping && <JhilikBalloonBurst />}

                      <div className="w-full flex items-center justify-between text-[10px] text-teal-600">
                        <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-bold bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
                          👆 ক্বলক্বলা ⚽
                        </span>
                      </div>
                      <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 group-hover:text-teal-700 my-1">
                        {it.ar}
                      </div>
                      <div className="w-full text-center" dir="ltr">
                        <div className="text-xs font-black text-teal-950 font-hind-siliguri">
                          {it.nameBn}
                        </div>
                        <div className="text-[10px] text-teal-800 font-bold font-hind-siliguri mt-0.5">
                          প্রতিধ্বনি দিয়ে পড়ো
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Standard Grid */
            <div className={`grid gap-2.5 sm:gap-4 ${cls.items.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              }`} dir="rtl">
              {cls.items.map((item, idx) => {
                const isItemActive = activeItemId === item.id;
                const isPopping = poppingCardId === (item.id || item.ar);
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => playItemSound(item)}
                    className={`group relative p-3 sm:p-4 rounded-3xl border-2 sm:border-3 transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-h-[160px] sm:min-h-[185px] text-center bg-white ${isPopping
                      ? "animate-card-pop border-amber-500 ring-4 ring-amber-300 shadow-2xl scale-105 bg-amber-50/60"
                      : isItemActive
                        ? "border-emerald-600 ring-4 ring-emerald-300 shadow-xl scale-105 bg-emerald-50/50"
                        : "border-slate-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-1 active:translate-y-0.5"
                      }`}
                  >
                    {/* 🎈 ঝিলিক বাতির রঙিন বল ও বেলুন অ্যানিমেশন (কোনো তারার আইকন ছাড়া) */}
                    {isPopping && <JhilikBalloonBurst />}

                    {/* Top row: badge + action button */}
                    <div className="w-full flex items-center justify-between text-xs text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] sm:text-[10px] font-black font-hind-siliguri flex items-center gap-1 shadow-2xs">
                        <span>👆</span>
                        <span>ট্যাপ করে শোনো</span>
                        <Volume2 className="w-3 h-3 text-emerald-600 inline" />
                      </span>
                    </div>

                    {/* Big Arabic Calligraphy */}
                    <div className={`my-auto py-2 font-arabic font-bold text-slate-900 transition-all ${item.ar.length > 20
                      ? "text-lg sm:text-2xl leading-relaxed"
                      : item.ar.length > 8
                        ? "text-xl sm:text-3xl"
                        : "text-3xl sm:text-5xl"
                      } ${isItemActive ? "text-emerald-800 scale-105" : ""}`}>
                      {item.ar}
                    </div>

                    {/* Bottom row: Name, Tip & Game Button */}
                    <div className="w-full mt-1 space-y-1" dir="ltr">
                      <div className="text-xs sm:text-sm font-black text-slate-800 font-hind-siliguri">
                        {item.nameBn}
                      </div>
                      {item.tip ? (
                        <div className="text-[10px] sm:text-[11px] font-bold text-emerald-950 bg-emerald-50/90 px-2 py-1 rounded-xl border border-emerald-200 font-hind-siliguri line-clamp-2 leading-tight">
                          💡 <span className="text-emerald-900 font-black">কীভাবে পড়বে:</span> {item.tip}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 font-bold font-hind-siliguri">
                          👆 ট্যাপ করে ক্বারীর আওয়াজে পড়ো
                        </div>
                      )}
                      {/* 🎮 নতুন "লেভেল খেলুন" বাটন — সরাসরি সংশ্লিষ্ট লেভেলের খেলায় প্রবেশ */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchBubbleGame(item);
                        }}
                        className="w-full mt-1.5 py-1 px-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer border border-amber-300"
                        title={`${item.nameBn || item.ar} লেভেল খেলুন`}
                      >
                        <span>🎮</span>
                        <span>লেভেল খেলুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Exercise Box & Game Invitation Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-950 font-black text-xs sm:text-sm font-hind-siliguri">
              <span>✏️</span>
              <span>অনুশীলনী</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-hind-siliguri font-medium">
              ডান থেকে বামে আঙুল রেখে দেখে দেখে পড়ো এবং প্রতিটি হরফে ক্লিক করে ক্বারীর খাঁটি আওয়াজের সাথে মিলিয়ে নাও।
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-emerald-200/80">
              <span className="text-xs text-emerald-950 font-bold font-hind-siliguri flex items-center gap-1.5">
                <span>🎈</span>
                <span>এই পাঠের হরফগুলো রঙিন বুদ্বুদ ও বেলুনে ফাটিয়ে খেলার ছলে শিখতে চাও?</span>
              </span>
              <button
                type="button"
                onClick={() => handleLaunchBubbleGame(cls.items?.[0] || "ب")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0 border border-amber-300"
              >
                <span>🎮</span>
                <span>মজার খেলা শুরু করো</span>
                <span>🎈</span>
              </button>
            </div>
          </div>

          {/* Star Claim & Teacher Box */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div
              onClick={() => handleClaimStar(cls.classNumber)}
              className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 ${isStar
                ? "bg-amber-100 border-amber-400 text-amber-950 shadow-md scale-102"
                : "bg-amber-50/50 border-amber-300 text-amber-900 hover:bg-amber-100"
                }`}
            >
              <Star className={`w-8 h-8 ${isStar ? "text-amber-500 fill-amber-400 scale-110" : "text-amber-400 fill-transparent"}`} />
              <div className="text-xs font-black font-hind-siliguri">আজ আমি পারলাম</div>
              <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-amber-900">
                {isStar ? "অর্জিত! ⭐" : "তারা নাও ⭐"}
              </div>
            </div>

            <div className="sm:col-span-3 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 border-2 border-slate-200 text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs font-hind-siliguri">
                <span>👩‍🏫</span>
                <span>উস্তাদের পরামর্শ</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-hind-siliguri">
                {cls.teacherNoteBn || "হরফের নাম ও মাখরাজ আলাদা করে শোনান। বিশুদ্ধ উচ্চারণে ছাত্রকে অভ্যস্ত করান।"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar (বাকি পৃষ্ঠা সূচিপত্র ও সরাসরি পরবর্তী পর্ব এক্সেস) */}
        {(() => {
          const currentParva = NOOR_QAIDA_PARVAS.find((p) => p.parvaNumber === cls.parvaNumber);
          const nextParva = NOOR_QAIDA_PARVAS.find((p) => p.parvaNumber === cls.parvaNumber + 1);
          const isParvaEnd = currentParva && cls.classNumber === currentParva.endClass;

          return (
            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold text-slate-700">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <button
                  onClick={handlePrevPage}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-50 shadow-2xs transition active:scale-95 cursor-pointer"
                  title="পূর্ববর্তী পাতা"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী পাতা</span>
                </button>

                {/* 📑 সূচিপত্র ও বাকি পৃষ্ঠাগুলো দেখার বাটন */}
                <button
                  onClick={() => setIsTocOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-black shadow-2xs transition active:scale-95 cursor-pointer"
                  title="সকল পৃষ্ঠা ও পর্বের সূচিপত্র খুলুন"
                >
                  <span>📑</span>
                  <span className="font-mono text-emerald-900">
                    পৃষ্ঠা {cls.classNumber + 7} (ক্লাস {cls.classNumberBn})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-white/90 px-2 py-0.5 rounded-full border border-emerald-200">
                    বাকি পৃষ্ঠা ও সূচিপত্র ▾
                  </span>
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={cls.classNumber >= 78}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition shadow-md active:scale-95 cursor-pointer ${
                    cls.classNumber >= 78
                      ? "opacity-40 cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  title="পরবর্তী পাতা"
                >
                  <span>পরবর্তী পাতা</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* ⏩ সরাসরি পরবর্তী পর্ব শুরু করার বোতাম (যেমন: পর্ব ২ মাখরাজ) */}
              {nextParva && (
                <button
                  onClick={() => navigateToPage(nextParva.startClass, "next")}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer border-2 border-amber-300 w-full sm:w-auto ${
                    isParvaEnd
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 animate-pulse"
                      : "bg-amber-600 hover:bg-amber-700 text-amber-50"
                  }`}
                  title={`পরবর্তী পর্বে যান: ${nextParva.titleBn}`}
                >
                  <span>⏩</span>
                  <span>পরবর্তী পর্ব: {nextParva.titleBn.split(':')[0]}</span>
                  <span className="opacity-90 font-medium hidden md:inline">
                    ({nextParva.titleBn.split(':')[1]?.trim()})
                  </span>
                  <span>➔</span>
                </button>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8EE] text-slate-800 font-sans select-none pb-28 sm:pb-20 relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP CUTE PLATFORM NAVIGATION HUD ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm px-2.5 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-1 sm:gap-2">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="p-1.5 sm:p-2 rounded-2xl text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
                title="ফিরে যান"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl animate-pulse">📗</span>
                <h1 className="text-sm sm:text-lg font-black text-emerald-950 font-hind-siliguri tracking-tight">
                  নূর কায়দা
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-800 font-bold hidden sm:block">
                {getPageHeaderLabel()}
              </p>
            </div>
          </div>

          {/* Center / Right: Tabs & 3 Modes */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Switchers */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-inner">
              <button
                onClick={() => setActiveTab("class")}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all ${activeTab === "class"
                  ? "bg-white text-emerald-900 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                📖 <span className="hidden sm:inline">বই</span>
              </button>
              <button
                onClick={() => setActiveTab("game")}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${activeTab === "game"
                  ? "bg-amber-400 text-slate-950 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
                title="মজার খেলা"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">খেলা</span>
              </button>
              <button
                onClick={() => setActiveTab("chart")}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${activeTab === "chart"
                  ? "bg-emerald-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
                title="অগ্রগতি চার্ট"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">চার্ট</span>
              </button>
              <button
                onClick={() => setActiveTab("certificate")}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${activeTab === "certificate"
                  ? "bg-purple-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
                title="সনদপত্র"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সনদ</span>
              </button>
            </div>

            {/* ── 3 MODES TOGGLE: 3D FLIPBOOK, CONTINUOUS SCROLL, SINGLE CARD ── */}
            <div className="flex items-center bg-amber-100/90 p-0.5 rounded-2xl border border-amber-300 text-xs font-bold">
              <button
                onClick={() => handleSetViewMode("3d")}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${viewMode === "3d"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md font-black"
                  : "text-amber-950 hover:bg-amber-200/50"
                  }`}
                title="৩ডি ফ্লিপ বই (বাস্তব পাতা উল্টানোর মতো)"
              >
                <span>📖</span>
                <span className="hidden md:inline font-hind-siliguri">৩ডি বই</span>
              </button>

              <button
                onClick={() => handleSetViewMode("scroll")}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${viewMode === "scroll"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md font-black"
                  : "text-amber-950 hover:bg-amber-200/50"
                  }`}
                title="একটানা স্ক্রোল মোড"
              >
                <span>📜</span>
                <span className="hidden md:inline font-hind-siliguri">স্ক্রোল</span>
              </button>

              <button
                onClick={() => handleSetViewMode("single")}
                className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 ${viewMode === "single"
                  ? "bg-white text-slate-900 shadow-sm font-black"
                  : "text-amber-950 hover:bg-amber-200/50"
                  }`}
                title="সাধারণ একক পৃষ্ঠা"
              >
                <span>📄</span>
                <span className="hidden md:inline font-hind-siliguri">কার্ড</span>
              </button>
            </div>

            {/* Table of Contents (TOC) */}
            <button
              onClick={() => setIsTocOpen(true)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-900 transition"
              title="সূচিপত্র খুলুন"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden lg:inline">সূচিপত্র</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CUTE PLAYFUL MASCOT BANNER FOR KIDS ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-2.5 sm:pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full border-2 border-amber-300 shadow-xs text-xs font-bold text-amber-950">
          <span className="text-base animate-bounce">🧒</span>
          <span className="font-hind-siliguri text-[11px] sm:text-xs">
            নূর বন্ধু: <strong>"আজকের পড়াটা খুব মজার হবে!"</strong>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
          <span>{viewMode === "3d" ? "📖 ৩ডি পাতা উল্টানো মোড" : viewMode === "scroll" ? "📜 একটানা স্ক্রোল মোড" : "📄 সাধারণ কার্ড মোড"}</span>
        </div>
      </div>

      {/* ── CELEBRATION TOAST ── */}
      {celebrationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white px-6 py-3.5 rounded-3xl shadow-2xl border-2 border-amber-300 flex items-center gap-3 animate-bounce">
          <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-spin-slow" />
          <span className="text-sm font-black font-hind-siliguri">
            {celebrationToast}
          </span>
        </div>
      )}

      {/* ── MAIN BOOK CONTAINER ── */}
      <main ref={bookFrameRef} className="max-w-4xl mx-auto px-2 sm:px-6 pt-2.5 sm:pt-4 relative scroll-mt-24">
        {/* Floating Desktop Turn Arrows */}
        {activeTab === "class" && viewMode === "3d" && (
          <>
            <button
              onClick={handlePrevPage}
              className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center w-12 h-20 rounded-2xl bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-700 border-2 border-amber-300 shadow-xl transition-all hover:scale-110 active:scale-95 group"
              title="পূর্ববর্তী পাতা উল্টাও"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[9px] font-bold mt-1">আগের</span>
            </button>

            <button
              onClick={handleNextPage}
              className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center w-12 h-20 rounded-2xl bg-white/95 hover:bg-emerald-600 hover:text-white text-slate-700 border-2 border-amber-300 shadow-xl transition-all hover:scale-110 active:scale-95 group"
              title="পরবর্তী পাতা উল্টাও"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-[9px] font-bold mt-1">পরের</span>
            </button>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW MODE A: TRUE 3D PAGE FLIP ENGINE (GENUINE LEAF CURL)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && viewMode === "3d" && (
          <div className="relative perspective-[2500px]">
            {/* The Book Base Frame */}
            <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-amber-400 shadow-2xl overflow-hidden min-h-[500px]">
              {/* Realistic Left Spine Shadow */}
              <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 pointer-events-none z-30 bg-gradient-to-r from-black/25 via-black/10 to-transparent"></div>

              {/* Base Layer: Renders the active current page */}
              <div className="relative z-10">
                {renderPageBody(currentPage)}
              </div>

              {/* ── THE VISIBLE TURNING 3D LEAF OVERLAY ── */}
              {isFlipping && (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: flipDirection === "next" ? "left center" : "right center",
                    animation:
                      flipDirection === "next"
                        ? "trueFlipNext 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards"
                        : "trueFlipPrev 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
                  }}
                >
                  {/* Front of the turning leaf (Shows page being turned away) */}
                  <div
                    className="absolute inset-0 bg-[#FFFDF7] rounded-2xl sm:rounded-[2.5rem] border-2 border-amber-300 overflow-hidden shadow-2xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {renderPageBody(previousPage)}
                    {/* Dynamic curl lighting highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-black/30 pointer-events-none"></div>
                  </div>

                  {/* Back of the turning leaf (Realistic Ivory Paper Back with Islamic Watermark & Shadow) */}
                  <div
                    className="absolute inset-0 bg-[#FBF7ED] rounded-2xl sm:rounded-[2.5rem] border-2 border-amber-400 p-8 flex flex-col items-center justify-center text-center shadow-2xl"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="text-amber-600/40 text-6xl mb-2">🕌</div>
                    <div className="text-amber-800/60 font-black text-sm font-hind-siliguri">
                      মক্তব শিক্ষা পাঠ্যপাঠিকা
                    </div>
                    <div className="text-amber-600/40 text-3xl mt-2 select-none">
                      🌙 ⭐ 🌙
                    </div>
                    {/* Shadow on back face as it lands */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/25 pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Golden Dog-Ear Corner Button */}
              <button
                onClick={handleNextPage}
                className="absolute top-3 right-3 z-30 hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-500"
                title="পরবর্তী পাতা উল্টাও"
              >
                <span>পাতা উল্টাও</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW MODE B: CONTINUOUS SCROLL MODE (একটানা স্ক্রোল)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && viewMode === "scroll" && (
          <div className="space-y-6 sm:space-y-8" ref={scrollContainerRef}>
            <div className="p-3 rounded-2xl bg-blue-50 border-2 border-blue-300 flex items-center justify-between text-xs font-bold text-blue-950">
              <span className="flex items-center gap-1.5 font-hind-siliguri">
                <span>📜</span>
                <span>একটানা স্ক্রোল মোড: নিচে স্ক্রোল করে সব পাতা পড়ুন। যেকোনো হরফে ক্লিক করলেই খাঁটি আওয়াজ শুনবেন।</span>
              </span>
              <button
                onClick={() => handleSetViewMode("3d")}
                className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shrink-0"
              >
                ৩ডি বই ➔
              </button>
            </div>

            {/* Render 10 classes around current page for smooth scroll */}
            {NOOR_QAIDA_CLASSES.slice(
              Math.max(0, (typeof currentPage === "number" ? currentPage : 1) - 4),
              Math.min(78, (typeof currentPage === "number" ? currentPage : 1) + 8)
            ).map((cls) => (
              <div
                key={cls.id}
                id={`qaida-page-${cls.classNumber}`}
                className="bg-white rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-slate-200 shadow-xl overflow-hidden scroll-mt-20"
              >
                {renderPageBody(cls.classNumber)}
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW MODE C: NORMAL SINGLE CARD VIEW
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "class" && viewMode === "single" && (
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-slate-300 shadow-xl overflow-hidden">
            {renderPageBody(currentPage)}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 2: মজার খেলা (GAMES 1, 2, 3, 4 FROM PDF)
            WITH MOBILE AUTO-ROTATE LANDSCAPE WIDESCREEN CONSOLE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "game" && (
          <div
            className={`transition-all ${isGameLandscape && isMobileDevice
              ? "fixed inset-0 z-50 bg-[#FFFDF7] p-3 overflow-y-auto"
              : "bg-white rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-amber-400 shadow-xl p-4 sm:p-7 space-y-6"
              }`}
          >
            {/* Top Game Console Header (With Orientation & Close Controls) */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((gNum) => (
                  <button
                    key={gNum}
                    onClick={() => {
                      setActiveGameId(gNum);
                      if (gNum === 5) {
                        setIsBubbleGameOpen(true);
                      }
                    }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition ${activeGameId === gNum
                      ? "bg-amber-400 text-slate-950 shadow-md scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    {gNum === 5 ? "🎈 খেলা ৫ (বুদ্বুদ)" : `🎮 খেলা ${gNum}`}
                  </button>
                ))}
              </div>

              {/* Mobile Orientation Toggle & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isMobileDevice && (
                  <button
                    onClick={() => setIsGameLandscape((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300"
                    title="স্ক্রিন ঘুরিয়ে খেলুন (Landscape Mode)"
                  >
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>{isGameLandscape ? "পোর্ট্রেট" : "ল্যান্ডস্কেপ"}</span>
                  </button>
                )}
                {isGameLandscape && isMobileDevice && (
                  <button
                    onClick={() => setActiveTab("class")}
                    className="p-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs"
                    title="খেলা বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Game 1: হরফ চিনি, রেখা টানি (Page 18) */}
            {activeGameId === 1 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black text-amber-950 font-hind-siliguri">
                    মজার খেলা ১: হরফ চিনি, নাম মেলাই
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    হরফে ক্লিক করে খাঁটি উচ্চারণ শোনো এবং ধাঁধাঁর উত্তর দাও!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {SPECIAL_PAGES[18].pairs.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: p.ar, sound: p.sound })}
                      className="p-3 sm:p-4 rounded-3xl bg-amber-50/70 border-2 border-amber-300 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition space-y-1 hover:-translate-y-1 active:scale-95"
                    >
                      <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900">
                        {p.ar}
                      </div>
                      <div className="text-xs font-black text-amber-950 font-hind-siliguri">
                        {p.bn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Riddles: আমি কে? */}
                <div className="p-3.5 sm:p-4 rounded-3xl bg-emerald-50 border-3 border-emerald-300 space-y-3">
                  <div className="text-xs sm:text-sm font-black text-emerald-950 font-hind-siliguri">
                    ❓ আমি কে? (ধাঁধাঁ যাচাই)
                  </div>
                  <div className="space-y-2">
                    {SPECIAL_PAGES[18].riddles.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 sm:p-3 rounded-2xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold"
                      >
                        <span className="text-slate-800">{r.q}</span>
                        <div className="flex items-center gap-1.5" dir="rtl">
                          {r.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                playItemSound({ ar: opt, sound: opt });
                                if (opt === r.correct) {
                                  setCelebrationToast("মাশাআল্লাহ! সঠিক উত্তর! ⭐");
                                  setTimeout(() => setCelebrationToast(null), 2500);
                                }
                              }}
                              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white font-arabic text-xl font-bold transition flex items-center justify-center border border-slate-300 active:scale-95"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game 2: হরকত চিনে রঙ করি (Page 39) */}
            {activeGameId === 2 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black text-blue-950 font-hind-siliguri">
                    মজার খেলা ২: হরকত চিনে রঙ করি
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    🔵 জবর (নীল), 🟠 যের (কমলা), 🟣 পেশ (বেগুনী) — ক্লিক করলেই উচ্চারণ শুনবে
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3" dir="rtl">
                  {SPECIAL_PAGES[39].items.map((it, idx) => {
                    const isJabar = it.expected === "jabar";
                    const isZer = it.expected === "zer";
                    return (
                      <div
                        key={idx}
                        onClick={() => playItemSound({ ar: it.ar, sound: it.ar })}
                        className={`p-3 sm:p-4 rounded-3xl border-3 text-center cursor-pointer transition space-y-1 hover:-translate-y-1 active:scale-95 ${isJabar
                          ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                          : isZer
                            ? "bg-orange-50 border-orange-400 hover:bg-orange-100"
                            : "bg-purple-50 border-purple-400 hover:bg-purple-100"
                          }`}
                      >
                        <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900">
                          {it.ar}
                        </div>
                        <div className="text-xs font-bold text-slate-700 font-hind-siliguri" dir="ltr">
                          {it.nameBn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game 3: নিয়ম-বিঙ্গো (Page 56) */}
            {activeGameId === 3 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black text-teal-950 font-hind-siliguri">
                    মজার খেলা ৩: নিয়ম-বিঙ্গো 🎉
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    যেকোনো ঘরে ক্লিক করে ক্বারীর কণ্ঠ শোনো এবং তাজবীদ নিয়ম মিলিয়ে বিঙ্গো জেতো!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3" dir="rtl">
                  {SPECIAL_PAGES[56].bingoWords.map((w, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: w.ar, sound: w.sound })}
                      className="p-3 sm:p-4 rounded-3xl bg-white border-2 border-teal-300 hover:border-teal-500 hover:bg-teal-50/60 shadow-xs cursor-pointer text-center space-y-1 transition hover:-translate-y-1 active:scale-95"
                    >
                      <div className="font-arabic text-2xl sm:text-3xl font-bold text-slate-900">
                        {w.ar}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200 font-hind-siliguri" dir="ltr">
                        {w.rule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game 4: সূরাগুলো চিনি (Page 88) */}
            {activeGameId === 4 && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black text-red-950 font-hind-siliguri">
                    মজার খেলা ৪: শেষ ১০টি ছোট সূরা চিনি
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    প্রথম আয়াতে ক্লিক করে মিষ্টি তিলাওয়াত শোনো
                  </p>
                </div>

                <div className="space-y-2">
                  {SPECIAL_PAGES[88].surahs.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => playItemSound({ ar: s.firstAyah, ayahRef: s.ref })}
                      className="p-3 rounded-2xl bg-red-50/50 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 font-hind-siliguri">
                            {s.nameBn}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            মোট আয়াত: {s.count}টি
                          </div>
                        </div>
                      </div>

                      <div className="font-arabic text-base sm:text-lg font-bold text-slate-800 text-right" dir="rtl">
                        {s.firstAyah}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game 5: বুদ্বুদ ও হরফ নিনজা স্লাইসার খেলা */}
            {activeGameId === 5 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-100 via-amber-50 to-teal-100 border-3 border-amber-400 text-center space-y-4 shadow-xl">
                <div className="text-5xl animate-bounce">🎈 🫧 ⚔️ 🍎 💣</div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-3xl font-black text-amber-950 font-hind-siliguri">
                    মজার খেলা ৫: বুদ্বুদ পপ ও হরফ নিনজা স্লাইসার!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto font-medium">
                    দুটি দারুণ মোডে খেলা যায়—লেভেল ১-এ নদী, মরুদ্যানে ভেসে ওঠা বুদ্বুদ ফোটাও, আর লেভেল ২-এ কাঠের দেয়ালের সামনে নিনজার মতো তলোয়ার দিয়ে ফল ও আরবি হরফ কাটো!
                  </p>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsBubbleGameOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-600 hover:from-sky-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer hover:scale-105"
                  >
                    <span>🎈</span>
                    <span>লেভেল ১: বুদ্বুদ ও বেলুন মোড</span>
                    <span>➔</span>
                  </button>

                  <button
                    onClick={() => handleLaunchNinjaGame()}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer hover:scale-105"
                  >
                    <span>⚔️</span>
                    <span>লেভেল ২: হরফ নিনজা স্লাইসার মোড</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 3: অগ্রগতি চার্ট (PAGE 102 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "chart" && (
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-emerald-400 shadow-xl p-4 sm:p-7 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black">
                <span>🏁</span>
                <span>অগ্রগতি চার্ট: ৭৮টি ক্লাসের যাত্রা</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-hind-siliguri">
                তোমার ১১টি পর্বের শিখন মাইলফলক
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                সম্পন্ন হয়েছে: {completedClasses.length}/৭৮টি ক্লাস ({completionPercent}%)
              </p>
            </div>

            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {NOOR_QAIDA_PARVAS.map((parva) => {
                const parvaClasses = NOOR_QAIDA_CLASSES.filter(
                  (c) => c.parvaNumber === parva.parvaNumber
                );

                return (
                  <div key={parva.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{parva.emoji}</span>
                        <span>{parva.titleBn}</span>
                      </span>
                      <span className="text-slate-500">{parva.classesRangeBn}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {parvaClasses.map((cls) => {
                        const isDone = completedClasses.includes(cls.classNumber);
                        const isStar = earnedStars[cls.classNumber];

                        return (
                          <button
                            key={cls.id}
                            onClick={() => navigateToPage(cls.classNumber, "next")}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black text-xs transition-all flex items-center justify-center border-2 ${isDone || isStar
                              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105"
                              : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400"
                              }`}
                            title={`ক্লাস ${cls.classNumber}: ${cls.titleBn}`}
                          >
                            {isStar ? "⭐" : cls.classNumberBn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VIEW 4: সনদপত্র (PAGE 103 FROM PDF)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "certificate" && (
          <div className="bg-[#FFFDF7] rounded-2xl sm:rounded-[2.5rem] border-6 sm:border-8 border-double border-amber-500 shadow-2xl p-5 sm:p-10 space-y-6 text-center relative overflow-hidden">
            <div className="text-amber-600 text-2xl select-none">
              🌙 ⭐ 🕌 ⭐ 🌙
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-900 font-hind-siliguri tracking-wide">
                নূর কায়দা সনদপত্র
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium font-hind-siliguri">
                মক্তব শিক্ষা পাঠ্যপাঠিকা (হরফ পরিচয় থেকে নাজেরা কুরআন পর্যন্ত)
              </p>
            </div>

            <div className="py-2 space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 font-bold font-hind-siliguri">
                এই মর্মে সনদ প্রদান করা হলো যে,
              </p>
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleSaveStudentName(e.target.value)}
                className="text-lg sm:text-2xl font-black text-emerald-900 border-b-2 border-dashed border-amber-600 bg-transparent text-center focus:outline-none max-w-md w-full mx-auto"
                placeholder="শিক্ষার্থীর নাম লিখুন..."
              />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto pt-2 font-hind-siliguri">
                তিনি সফলভাবে <strong>মক্তব শিক্ষা পাঠ্যপাঠিকার ৭৮টি ক্লাস</strong> ও সকল মাখরাজ-তাজবীদ পাঠ সমাপ্ত করেছেন এবং নাজেরা কুরআন পাঠের যোগ্যতা অর্জন করেছেন।
              </p>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-2 text-[10px] sm:text-xs font-bold text-slate-600 border-t border-amber-200">
              <div className="space-y-1">
                <div className="h-6 border-b border-slate-400 mx-2"></div>
                <span>শিক্ষকের স্বাক্ষর</span>
              </div>
              <div className="space-y-1">
                <div className="h-6 border-b border-slate-400 mx-2 flex items-center justify-center font-mono text-[10px] text-slate-800">
                  {formatBangladeshDate(new Date())}
                </div>
                <span>তারিখ</span>
              </div>
              <div className="space-y-1">
                <div className="h-6 border-b border-slate-400 mx-2"></div>
                <span>প্রধান শিক্ষক</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-amber-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>সনদপত্র প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── MOBILE PHONE STICKY BOTTOM TOOLBAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-emerald-300 px-3 py-2.5 sm:hidden flex items-center justify-between shadow-2xl">
        <button
          onClick={handlePrevPage}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 font-black text-xs active:scale-95 shadow-sm"
          title="পূর্ববর্তী পৃষ্ঠায় যান"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>পূর্ববর্তী</span>
        </button>

        <button
          onClick={() => setIsTocOpen(true)}
          className="flex flex-col items-center px-3 py-1 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold active:scale-95 shadow-xs"
        >
          <span className="text-xs font-black font-hind-siliguri text-emerald-900">
            {getPageHeaderLabel()}
          </span>
          <span className="text-[9px] text-emerald-700 font-bold">বাকি পৃষ্ঠা ও সূচিপত্র ▾</span>
        </button>

        <button
          onClick={handleNextPage}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs active:scale-95 shadow-md"
          title="পরবর্তী পৃষ্ঠায় যান"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* ── QUICK JUMP SLIDER MODAL FOR MOBILE & DESKTOP ── */}
      {isQuickJumpOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border-2 border-emerald-400">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 font-hind-siliguri">
                দ্রুত পৃষ্ঠা বদলান
              </h3>
              <button
                onClick={() => setIsQuickJumpOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  navigateToPage("cover", "prev");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-900 border-2 border-emerald-300 text-center"
              >
                📕 প্রচ্ছদ
              </button>
              <button
                onClick={() => {
                  navigateToPage("rules", "next");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-amber-50 text-amber-900 border-2 border-amber-300 text-center"
              >
                📋 নিয়মাবলী
              </button>
              <button
                onClick={() => {
                  navigateToPage("color-code", "next");
                  setIsQuickJumpOpen(false);
                }}
                className="p-2.5 rounded-2xl bg-blue-50 text-blue-900 border-2 border-blue-300 text-center"
              >
                🎨 রঙ-সংকেত
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 font-hind-siliguri">
                <span>ক্লাস ১</span>
                <span className="text-emerald-700 font-black">
                  {typeof currentPage === "number" ? `ক্লাস ${currentPage}` : "ক্লাস নির্বাচন করুন"}
                </span>
                <span>ক্লাস ৭৮</span>
              </div>
              <input
                type="range"
                min="1"
                max="78"
                value={typeof currentPage === "number" ? currentPage : 1}
                onChange={(e) => {
                  navigateToPage(parseInt(e.target.value), "next");
                }}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsQuickJumpOpen(false);
                  setIsTocOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                সম্পূর্ণ সূচিপত্র দেখুন ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE OF CONTENTS (TOC) MODAL ── */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-emerald-400 overflow-hidden">
            <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black font-hind-siliguri">
                  নূর কায়দা — সূচিপত্র ও পাঠ নির্বাচন
                </h3>
                <p className="text-xs text-emerald-200 font-hind-siliguri">
                  ১১টি পর্ব • ৭৮টি ক্লাস • সম্পন্ন: {completedClasses.length}/৭৮
                </p>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/60 border-b border-emerald-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => {
                  navigateToPage("cover", "prev");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                📕 প্রচ্ছদ (পৃষ্ঠা ১)
              </button>
              <button
                onClick={() => {
                  navigateToPage("rules", "next");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                📋 পড়ার নিয়ম (পৃষ্ঠা ৩)
              </button>
              <button
                onClick={() => {
                  navigateToPage("color-code", "next");
                  setIsTocOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 shadow-2xs whitespace-nowrap"
              >
                🎨 রঙ-সংকেত (পৃষ্ঠা ৫)
              </button>
            </div>

            {/* 📚 ১১টি পর্বের দ্রুত জাম্প বার */}
            <div className="p-2.5 bg-amber-50/90 border-b border-amber-200 overflow-x-auto flex items-center gap-1.5 text-xs font-bold scrollbar-thin">
              <span className="text-[11px] font-black text-amber-950 shrink-0 flex items-center gap-1">
                <span>📚</span>
                <span>সকল পর্ব:</span>
              </span>
              {NOOR_QAIDA_PARVAS.map((p) => {
                const isActive = typeof currentPage === "number" && getClassByNumber(currentPage)?.parvaNumber === p.parvaNumber;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigateToPage(p.startClass, "next");
                      setIsTocOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition active:scale-95 cursor-pointer border ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : "bg-white hover:bg-amber-100 text-slate-800 border-amber-300"
                    }`}
                    title={`${p.titleBn} (${p.classesRangeBn})`}
                  >
                    <span>{p.emoji}</span> {p.titleBn.split(':')[0]}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ক্লাস নম্বর বা বিষয় লিখে খুঁজুন..."
                  value={tocSearch}
                  onChange={(e) => setTocSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-100">
              {NOOR_QAIDA_CLASSES.filter(
                (c) =>
                  !tocSearch ||
                  c.titleBn.toLowerCase().includes(tocSearch.toLowerCase()) ||
                  c.classNumber.toString().includes(tocSearch)
              ).map((cls) => {
                const isCur = cls.classNumber === currentPage;
                const isDone = completedClasses.includes(cls.classNumber);

                return (
                  <div
                    key={cls.id}
                    onClick={() => {
                      navigateToPage(cls.classNumber, "next");
                      setIsTocOpen(false);
                    }}
                    className={`pt-1.5 first:pt-0 flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${isCur
                      ? "bg-emerald-50 border-2 border-emerald-400 font-black text-emerald-950"
                      : "hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {cls.classNumberBn}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold font-hind-siliguri">
                          {cls.titleBn}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cls.parvaTitleBn} • পৃষ্ঠা {cls.classNumber + 7}
                        </div>
                      </div>
                    </div>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── EMBEDDED CSS FOR THE TRUE 3D LEAF FLIP PHYSICS ── */}
      <style>{`
        @keyframes trueFlipNext {
          0% {
            transform: rotateY(0deg);
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
          }
          50% {
            transform: rotateY(-90deg) scale(0.96);
            filter: drop-shadow(-25px 15px 35px rgba(0, 0, 0, 0.45));
          }
          100% {
            transform: rotateY(-180deg) scale(1);
            filter: drop-shadow(-5px 5px 10px rgba(0, 0, 0, 0.15));
          }
        }

        @keyframes trueFlipPrev {
          0% {
            transform: rotateY(-180deg);
            filter: drop-shadow(-5px 5px 10px rgba(0, 0, 0, 0.15));
          }
          50% {
            transform: rotateY(-90deg) scale(0.96);
            filter: drop-shadow(25px 15px 35px rgba(0, 0, 0, 0.45));
          }
          100% {
            transform: rotateY(0deg) scale(1);
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
          }
        }
      `}</style>

      {/* ── SCENIC LANDSCAPE BUBBLE & BALLOON POP GAME MODAL (LEVEL 1) ── */}
      {isBubbleGameOpen && (
        <NoorQaidaBubblePopGame
          targetItem={bubbleGameTarget}
          onClose={() => setIsBubbleGameOpen(false)}
          onNextLetter={handleNextLetterForGame}
          onLaunchNinja={handleLaunchNinjaGame}
        />
      )}

      {/* ── FRUIT NINJA STYLE HARUF SLICER GAME MODAL (LEVEL 2) ── */}
      {isNinjaGameOpen && (
        <NoorQaidaHarufNinjaGame
          targetItem={bubbleGameTarget}
          onClose={() => setIsNinjaGameOpen(false)}
          onNextLetter={handleNextLetterForGame}
          onSwitchToBubble={() => {
            setIsNinjaGameOpen(false);
            setIsBubbleGameOpen(true);
          }}
        />
      )}
    </div>
  );
}
