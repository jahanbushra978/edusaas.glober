"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2,
  RotateCcw,
  Star,
  Heart,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import {
  PROTHOM_QURAN_LETTERS,
  BUBBLE_HUNTER_LEVELS,
  PICTURE_MATCH_LEVELS,
  HARAKAT_MODULES,
  SHORT_9_SURAHS,
  DAILY_DUAS_FOR_KIDS,
} from "../lib/prothomQuranData";
import {
  playArabicSound,
  playTapSound,
  playStarPopSound,
  playCorrectChime,
  playLifeLostSound,
  playMaShaAllahCelebration,
} from "@/features/ai-learning/lib/arabicSoundPlayer";

export default function AmarProthomQuranShikkha({ className = "" }) {
  // ── ACTIVE STAGE (1 to 6) ──
  // 1: হরফ ও ছবি | 2: খেলাধুলা (৪ গেম) | 3: হরকত | 4: তানভীন-তাশদীদ | 5: ছোট সূরা | 6: দোয়া ও সনদ
  const [activeStage, setActiveStage] = useState(1);

  // ── STAGE 1: LETTER SELECTION & DETAILS ──
  const [selectedLetterId, setSelectedLetterId] = useState(1);
  const activeLetter = PROTHOM_QURAN_LETTERS.find((l) => l.id === selectedLetterId) || PROTHOM_QURAN_LETTERS[0];

  // ── STAGE 2: 4 MINI GAMES STATE ──
  // 'bubble_hunt' | 'pic_match' | 'tracing' | 'nuqta_spot'
  const [activeGameId, setActiveGameId] = useState("bubble_hunt");

  // Game 1: Bubble Pop Letter Hunter
  const [bubbleLevelIdx, setBubbleLevelIdx] = useState(0);
  const currentBubbleLevel = BUBBLE_HUNTER_LEVELS[bubbleLevelIdx] || BUBBLE_HUNTER_LEVELS[0];
  const [poppedIndices, setPoppedIndices] = useState(new Set());
  const [bubbleGameWon, setBubbleGameWon] = useState(false);

  // Game 2: Picture Matching
  const [matchLevelIdx, setMatchLevelIdx] = useState(0);
  const currentMatchLevel = PICTURE_MATCH_LEVELS[matchLevelIdx] || PICTURE_MATCH_LEVELS[0];
  const [selectedPictureItem, setSelectedPictureItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [matchGameWon, setMatchGameWon] = useState(false);

  // Game 3: Tracing Canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracingLetter, setTracingLetter] = useState("ب");
  const [chalkColor, setChalkColor] = useState("#0d7a5f");

  // ── STAGE 3: HARAKAT STATE ──
  const [activeHarakatTab, setActiveHarakatTab] = useState("zabar");

  // ── STAGE 5: SHORT 9 SURAHS STATE ──
  const [selectedSurahIdx, setSelectedSurahIdx] = useState(0);
  const currentSurah = SHORT_9_SURAHS[selectedSurahIdx] || SHORT_9_SURAHS[0];
  const [isPlayingSurahAyah, setIsPlayingSurahAyah] = useState(null);

  // ── STAGE 6: STAR BOARD & CERTIFICATE ──
  const [childName, setChildName] = useState(() => {
    try {
      return localStorage.getItem("prothom_quran_child_name") || "ছোট্ট শিক্ষার্থী";
    } catch {
      return "ছোট্ট শিক্ষার্থী";
    }
  });

  const [starDays, setStarDays] = useState(() => {
    try {
      const saved = localStorage.getItem("prothom_quran_star_days");
      return saved ? JSON.parse(saved) : [1, 2, 3]; // default 3 stars for excitement
    } catch {
      return [1, 2, 3];
    }
  });

  // Sound handler for letters
  const handlePlayLetter = useCallback((key) => {
    playTapSound();
    playArabicSound(key);
  }, []);

  // Save child name
  const handleNameChange = (val) => {
    setChildName(val);
    try {
      localStorage.setItem("prothom_quran_child_name", val);
    } catch {}
  };

  // Toggle star day
  const handleToggleStarDay = (dayNum) => {
    playTapSound();
    setStarDays((prev) => {
      let next;
      if (prev.includes(dayNum)) {
        next = prev.filter((d) => d !== dayNum);
      } else {
        next = [...prev, dayNum];
        playStarPopSound(dayNum % 3 + 1);
        if (next.length === 30) {
          playMaShaAllahCelebration();
          toast.success("মাশাআল্লাহ! ৩০ দিনের তারা পূর্ণ হয়েছে! বড় পুরস্কার ও সনদ আনলক!");
        }
      }
      try {
        localStorage.setItem("prothom_quran_star_days", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background guide letter
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 160px 'Amiri', 'Traditional Arabic', serif";
    ctx.fillStyle = "rgba(13, 122, 95, 0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tracingLetter, canvas.width / 2, canvas.height / 2 + 10);

    // Draw dotted border guide
    ctx.strokeStyle = "rgba(13, 122, 95, 0.15)";
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.setLineDash([]);
  }, [tracingLetter]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playTapSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 160px 'Amiri', 'Traditional Arabic', serif";
    ctx.fillStyle = "rgba(13, 122, 95, 0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tracingLetter, canvas.width / 2, canvas.height / 2 + 10);
  };

  // Bubble game tap handler
  const handleTapBubble = (char, idx) => {
    if (poppedIndices.has(idx)) return;

    if (char === currentBubbleLevel.targetLetter) {
      playCorrectChime();
      playStarPopSound(poppedIndices.size + 1);
      const nextSet = new Set(poppedIndices);
      nextSet.add(idx);
      setPoppedIndices(nextSet);

      let foundCount = 0;
      currentBubbleLevel.bubblePool.forEach((c, i) => {
        if (c === currentBubbleLevel.targetLetter && nextSet.has(i)) foundCount++;
      });

      if (foundCount >= currentBubbleLevel.correctCount) {
        setBubbleGameWon(true);
        playMaShaAllahCelebration();
        toast.success("মাশাআল্লাহ! তুমি সবকটি সঠিক হরফ খুঁজে পেয়েছ!");
      }
    } else {
      playLifeLostSound();
      toast.info(`এটা '${char}', তুমি '${currentBubbleLevel.targetLetter}' খুঁজো!`);
    }
  };

  // Picture matching tap handler
  const handleSelectPicture = (item) => {
    playTapSound();
    setSelectedPictureItem(item);
  };

  const handleSelectLetterMatch = (letterItem) => {
    if (!selectedPictureItem) {
      toast.info("আগে বামদিকের যেকোনো একটি ছবিতে ট্যাপ করো!");
      return;
    }

    if (selectedPictureItem.letter === letterItem.letter) {
      playCorrectChime();
      playStarPopSound(matchedPairs.size + 1);
      const next = new Set(matchedPairs);
      next.add(letterItem.letter);
      setMatchedPairs(next);
      setSelectedPictureItem(null);

      if (next.size >= currentMatchLevel.items.length) {
        setMatchGameWon(true);
        playMaShaAllahCelebration();
        toast.success("মাশাআল্লাহ! চমৎকার ম্যাচ করেছ!");
      }
    } else {
      playLifeLostSound();
      toast.error(`ভুল হয়েছে! '${selectedPictureItem.nameBn}' শুরু হয় '${selectedPictureItem.letterName}' দিয়ে। আবার চেষ্টা করো!`);
    }
  };

  return (
    <div className={`nur-theme w-full flex flex-col font-hind-siliguri text-slate-800 ${className}`}>
      {/* ── TOP HEADER: "আমার প্রথম কুরআন শিক্ষা" HERO BANNER ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-600 p-4 sm:p-6 mb-6 text-white shadow-xl shadow-emerald-950/10 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-3xl bg-white/95 text-emerald-800 flex items-center justify-center text-3xl shadow-md shrink-0 border-2 border-amber-300 animate-bounce">
              📖
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold text-amber-100 mb-1">
                <span>⭐ ১২ সপ্তাহের আনন্দময় যাত্রা • ছবি ও খেলা</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm font-bengali">
                আমার প্রথম কুরআন শিক্ষা
              </h1>
              <p className="text-xs sm:text-sm text-emerald-50 font-medium">
                আরবি হরফ থেকে ছোট সূরা পর্যন্ত — পড়তে না পারলেও ছবি দেখে ও গেম খেলে শেখা!
              </p>
            </div>
          </div>

          {/* Quick Stats: Hearts & Star Counter */}
          <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shrink-0">
            <div className="flex items-center gap-1 text-amber-200 font-black text-sm">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
              <span>{starDays.length}/৩০ দিন</span>
            </div>
            <div className="h-4 w-px bg-white/40" />
            <div className="flex items-center gap-1 text-rose-100 font-black text-sm">
              <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
              <span>৫ প্রাণ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6-STAGE NAVIGATION PILL TABS (Book's Exact 6 Chapters) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 1, title: "১. ২৯ হরফ ও ছবি", icon: "🔤", color: "border-pink-300 text-pink-700 bg-pink-50" },
          { id: 2, title: "২. মজার ৪ গেম", icon: "🎮", color: "border-purple-300 text-purple-700 bg-purple-50" },
          { id: 3, title: "৩. হরকত (যবর, যের)", icon: "🎵", color: "border-emerald-300 text-emerald-700 bg-emerald-50" },
          { id: 4, title: "৪. তানভীন ও জযম", icon: "⚡", color: "border-blue-300 text-blue-700 bg-blue-50" },
          { id: 5, title: "৫. ছোট ৯ সূরা", icon: "🕌", color: "border-amber-300 text-amber-800 bg-amber-50" },
          { id: 6, title: "৬. দোয়া ও সনদ", icon: "🏅", color: "border-teal-300 text-teal-800 bg-teal-50" },
        ].map((tab) => {
          const isActive = activeStage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                setActiveStage(tab.id);
              }}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-gradient-to-r from-[#0d7a5f] to-[#085a45] text-white border-emerald-600 shadow-md shadow-emerald-950/20 scale-105"
                  : `bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-700`
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STAGE 1: ২৯টি হরফ ও ছবি-শব্দ (Pages 7-24)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 1 && (
        <div className="space-y-6 animate-fade-in">
          {/* Big Featured Active Letter Hero Card */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Grand Arabic Letter with Bounce Audio Trigger */}
              <button
                type="button"
                onClick={() => handlePlayLetter(activeLetter.audioKey)}
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br ${activeLetter.color} text-white flex flex-col items-center justify-center font-amiri text-6xl sm:text-7xl font-bold shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform relative group`}
                title="শুনতে ট্যাপ করো!"
              >
                <span>{activeLetter.letter}</span>
                <span className="absolute bottom-2 text-xs font-sans font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  🔊 শুনো
                </span>
              </button>

              <div className="space-y-1.5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <span>{activeLetter.numberBn}</span>
                  <span>•</span>
                  <span>মাখরাজ: {activeLetter.makhrajZone}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                  <span>{activeLetter.nameBn}</span>
                  <span className="text-3xl">{activeLetter.animalEmoji}</span>
                </h3>
                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="font-amiri text-xl">{activeLetter.arabicWord}</span>
                  <span>= {activeLetter.wordBn}</span>
                </p>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed mt-1">
                  💡 {activeLetter.tipBn}
                </p>
              </div>
            </div>

            {/* Letter 4 Positional Forms (Pages 22-23: একা, শুরুতে, মাঝে, শেষে) */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-emerald-900 mb-2">
                হরফের চার রূপ (একা, শুরুতে, মাঝে, শেষে):
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">একা</span>
                  <span className="font-amiri text-xl font-bold text-emerald-800">{activeLetter.forms.isolated}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">শুরুতে</span>
                  <span className="font-amiri text-xl font-bold text-emerald-800">{activeLetter.forms.initial}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">মাঝে</span>
                  <span className="font-amiri text-xl font-bold text-emerald-800">{activeLetter.forms.medial}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">শেষে</span>
                  <span className="font-amiri text-xl font-bold text-emerald-800">{activeLetter.forms.final}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 29 Letters Grid (Click any to listen & switch) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>২৯টি হরফের ছবির পাঠশালা</span>
                <span className="text-xs font-normal text-slate-500">(যেকোনো হরফে ট্যাপ করে আওয়াজ শোনো)</span>
              </h4>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {PROTHOM_QURAN_LETTERS.map((item) => {
                const isSelected = item.id === selectedLetterId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedLetterId(item.id);
                      handlePlayLetter(item.audioKey);
                    }}
                    className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-1 cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-2 border-amber-300 shadow-md scale-105"
                        : "bg-white hover:bg-emerald-50/50 border-emerald-100 text-slate-800 shadow-xs"
                    }`}
                  >
                    <span className="text-xl">{item.animalEmoji}</span>
                    <span className="font-amiri text-3xl font-bold">{item.letter}</span>
                    <span className="text-xs font-bold leading-none">{item.nameBn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STAGE 2: মজার ৪টি মিনি-গেম (Interactive Games for Kids)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Game Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100">
            {[
              { id: "bubble_hunt", label: "🎯 ১. হরফ খোঁজা", icon: "🫧" },
              { id: "pic_match", label: "🧩 ২. ছবি মেলানো", icon: "🐰" },
              { id: "tracing", label: "✏️ ৩. লিখে শিখি", icon: "🎨" },
              { id: "nuqta_spot", label: "👀 ৪. নুকতা খেলা", icon: "⭐" },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveGameId(g.id);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGameId === g.id
                    ? "bg-white border-2 border-[#0d7a5f] text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>

          {/* 🎯 GAME 1: BUBBLE POP LETTER HUNTER (Pages 12, 16, 19) */}
          {activeGameId === "bubble_hunt" && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                    <span>🎯 গোল দাগ দাও / হরফ খোঁজো</span>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                      লেভেল {bubbleLevelIdx + 1}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 font-bold mt-1">
                    "{currentBubbleLevel.promptBn}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayLetter(currentBubbleLevel.audioKey)}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>আওয়াজ শুনো</span>
                </button>
              </div>

              {/* Floating Letter Bubbles */}
              <div className="py-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto min-h-[220px]">
                {currentBubbleLevel.bubblePool.map((char, idx) => {
                  const isPopped = poppedIndices.has(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTapBubble(char, idx)}
                      disabled={isPopped}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full font-amiri text-3xl font-bold flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                        isPopped
                          ? "bg-emerald-500 text-white scale-110 ring-4 ring-emerald-200 shadow-emerald-500/30"
                          : "bg-gradient-to-br from-amber-100 via-white to-emerald-100 text-slate-800 border-2 border-emerald-200 hover:scale-105 hover:border-emerald-500"
                      }`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>

              {/* Victory Banner */}
              {bubbleGameWon && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-center justify-between gap-3 animate-bounce">
                  <div className="text-left">
                    <p className="text-sm font-black text-emerald-900">🎉 মাশাআল্লাহ! তুমি জিতেছ!</p>
                    <p className="text-xs text-emerald-700">পরের লেভেলে গিয়ে নতুন হরফ খোঁজো!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setPoppedIndices(new Set());
                      setBubbleGameWon(false);
                      setBubbleLevelIdx((prev) => (prev + 1) % BUBBLE_HUNTER_LEVELS.length);
                    }}
                    className="px-5 py-2 rounded-full bg-[#0d7a5f] hover:bg-[#0b6851] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    পরবর্তী লেভেল ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🧩 GAME 2: PICTURE MATCHING (Pages 12, 16, 19) */}
          {activeGameId === "pic_match" && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 text-center">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  🧩 ছবির সাথে হরফ মেলাই
                </h3>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
                  ছবিতে ট্যাপ করো, তারপর ডানদিকের হরফে ট্যাপ করো
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto py-4">
                {/* Left: Pictures Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 block mb-1">১. ছবি নির্বাচন করো:</span>
                  {currentMatchLevel.items.map((item) => {
                    const isMatched = matchedPairs.has(item.letter);
                    const isSelected = selectedPictureItem?.letter === item.letter;
                    return (
                      <button
                        key={item.letter}
                        type="button"
                        onClick={() => handleSelectPicture(item)}
                        disabled={isMatched}
                        className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isMatched
                            ? "bg-emerald-100 border-emerald-300 opacity-60 line-through"
                            : isSelected
                            ? "bg-amber-100 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/40 scale-102"
                            : "bg-white hover:bg-emerald-50 border-slate-200 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-3xl">{item.emoji}</span>
                        <span className="text-sm font-bold">{item.nameBn}</span>
                        <span className="text-xs text-slate-400">➔</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right: Letters Column (Shuffled) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 block mb-1">২. সঠিক হরফ মেলাও:</span>
                  {currentMatchLevel.items.map((item) => {
                    const isMatched = matchedPairs.has(item.letter);
                    return (
                      <button
                        key={item.letter}
                        type="button"
                        onClick={() => handleSelectLetterMatch(item)}
                        disabled={isMatched}
                        className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isMatched
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                            : "bg-white hover:bg-emerald-50 border-slate-200 text-slate-800 shadow-xs hover:border-emerald-400"
                        }`}
                      >
                        <span className="font-amiri text-3xl font-bold text-emerald-800">
                          {item.letter}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {isMatched ? "সঠিক ✓" : item.letterName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {matchGameWon && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex items-center justify-between gap-3 animate-bounce">
                  <div className="text-left">
                    <p className="text-sm font-black text-emerald-900">🎉 মাশাআল্লাহ! চমৎকার ম্যাচ করেছ!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setMatchedPairs(new Set());
                      setSelectedPictureItem(null);
                      setMatchGameWon(false);
                      setMatchLevelIdx((prev) => (prev + 1) % PICTURE_MATCH_LEVELS.length);
                    }}
                    className="px-5 py-2 rounded-full bg-[#0d7a5f] hover:bg-[#0b6851] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    পরবর্তী লেভেল ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ✏️ GAME 3: INTERACTIVE FINGER TRACING (Pages 20-21) */}
          {activeGameId === "tracing" && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>✏️ লিখে লিখে শিখি (Tracing Blackboard)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ধূসর হরফের উপর আঙুল বা মাউস ঘুরিয়ে সুন্দর করে হরফ আঁকো!
                  </p>
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-2">
                  {["#0d7a5f", "#d97706", "#2563eb", "#e11d48"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setChalkColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        chalkColor === c ? "scale-125 ring-2 ring-slate-800" : ""
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>মুছে ফেলো</span>
                  </button>
                </div>
              </div>

              {/* Tracing Canvas */}
              <div className="flex flex-col items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={240}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-[#faf8f2] rounded-3xl border-2 border-dashed border-emerald-300 shadow-inner cursor-crosshair touch-none"
                />

                {/* Letter Selector for Tracing */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-3 scrollbar-none">
                  {["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ر", "س", "ص", "ط", "ع", "ف", "ق", "ك", "ل", "م", "ن", "و", "ي"].map(
                    (ltr) => (
                      <button
                        key={ltr}
                        type="button"
                        onClick={() => {
                          playTapSound();
                          setTracingLetter(ltr);
                        }}
                        className={`w-10 h-10 rounded-xl font-amiri text-2xl font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          tracingLetter === ltr
                            ? "bg-emerald-600 text-white shadow-md scale-110"
                            : "bg-slate-100 hover:bg-emerald-50 text-slate-800"
                        }`}
                      >
                        {ltr}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 👀 GAME 4: NUQTA & SHAPE SPOTTER (Page 24) */}
          {activeGameId === "nuqta_spot" && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 text-center">
              <div className="border-b border-emerald-100 pb-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  👀 একই রকম হরফ চিনি ও নুকতার খেলা
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  হরফের আকৃতি প্রায় এক, শুধু ফোঁটা গুনে হরফ চিনে ফেলো!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-3xl mx-auto py-2">
                {[
                  { letters: "ب  ت  ث  ن", tip: "একই আকৃতি, ফোঁটা আলাদা: ব নিচে ১, ত উপরে ২, ছ উপরে ৩, ন উপরে ১" },
                  { letters: "ج  ح  خ", tip: "একই আকৃতি: জ নিচে ১, হ নেই, খ উপরে ১" },
                  { letters: "د  ذ", tip: "দাল ফোঁটাহীন, যাল উপরে ১টি ফোঁটা" },
                  { letters: "ر  ز", tip: "রা ফোঁটাহীন, যা উপরে ১টি ফোঁটা" },
                  { letters: "س  ش", tip: "সীন ফোঁটাহীন, শীন উপরে ৩টি ফোঁটা" },
                  { letters: "ص  ض", tip: "ছোয়াদ ফোঁটাহীন, দোয়াদ উপরে ১টি ফোঁটা" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between"
                  >
                    <span className="font-amiri text-4xl font-bold text-emerald-900 tracking-widest my-2">
                      {item.letters}
                    </span>
                    <p className="text-xs text-emerald-800 font-semibold bg-white p-2 rounded-xl border border-emerald-100">
                      💡 {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STAGE 3: হরকতের পাঠ (যবর, যের, পেশ — Pages 25-31)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 3 && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-tabs: Zabar, Zer, Pesh, Combined */}
          <div className="flex items-center gap-2 bg-emerald-50/70 p-2 rounded-2xl border border-emerald-100">
            {HARAKAT_MODULES.map((hm) => (
              <button
                key={hm.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setActiveHarakatTab(hm.id);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeHarakatTab === hm.id
                    ? "bg-white border-2 border-[#0d7a5f] text-slate-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{hm.titleBn}</span>
              </button>
            ))}
          </div>

          {/* Active Harakat Card */}
          {(() => {
            const curHarakat = HARAKAT_MODULES.find((h) => h.id === activeHarakatTab) || HARAKAT_MODULES[0];
            return (
              <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 text-center">
                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${curHarakat.badgeColor}`}>
                    চিহ্ন: {curHarakat.symbol}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{curHarakat.titleBn}</h3>
                  <p className="text-xs text-slate-600">{curHarakat.meaningBn}</p>
                </div>

                {/* Harakat Examples Grid */}
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-2">
                    হরফগুলো ট্যাপ করে মিষ্টি সুরে শোনো:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-xl mx-auto">
                    {curHarakat.examples.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePlayLetter(item.audioKey)}
                        className="p-4 rounded-2xl bg-[#faf8f2] hover:bg-emerald-100 border border-emerald-200 text-slate-800 hover:text-emerald-900 shadow-xs transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                      >
                        <span className="font-amiri text-4xl font-bold">{item.letterAr}</span>
                        <span className="text-xs font-bold mt-1 text-slate-600">{item.soundBn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harakat Words with Pictures (Pages 30-31) */}
                {curHarakat.words?.length > 0 && (
                  <div className="pt-4 border-t border-emerald-100">
                    <span className="text-xs font-bold text-slate-500 block mb-3">
                      ছবি দেখে শব্দ পড়ি:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      {curHarakat.words.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex flex-col items-center gap-1"
                        >
                          <span className="text-3xl">{w.emoji}</span>
                          <span className="font-amiri text-2xl font-bold text-emerald-900">{w.wordAr}</span>
                          <span className="text-xs text-slate-600 font-semibold">{w.meaningBn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STAGE 4: তানভীন, জযম, তাশদীদ, মাদ ও লীন (Pages 32-35)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanween Card */}
            <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3 text-center">
              <span className="text-2xl">🔔</span>
              <h3 className="text-base font-extrabold text-slate-900">তানভীন (দুই যবর, দুই যের, দুই পেশ)</h3>
              <p className="text-xs text-slate-600">শেষে একটি "ন" সুর যোগ হয়। যেমন: বান (بً), বিন (بٍ), বুন (بٌ)</p>
              <div className="flex justify-center gap-2 pt-2">
                {[
                  { ar: "بً", bn: "বান" },
                  { ar: "بٍ", bn: "বিন" },
                  { ar: "بٌ", bn: "বুন" },
                ].map((item) => (
                  <button
                    key={item.ar}
                    type="button"
                    onClick={() => handlePlayLetter(item.ar)}
                    className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 font-amiri text-2xl font-bold text-emerald-900 shadow-xs cursor-pointer hover:bg-emerald-100"
                  >
                    {item.ar} <span className="text-xs font-sans font-bold block">{item.bn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jazm / Sukoon Card */}
            <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3 text-center">
              <span className="text-2xl">⏸️</span>
              <h3 className="text-base font-extrabold text-slate-900">জযম (সাকিন - থামার চিহ্ন)</h3>
              <p className="text-xs text-slate-600">আগের হরফের সাথে মিলিয়ে একটু থেমে পড়ি। যেমন: আব (أَبْ), ইব (إِبْ), উব (أُبْ)</p>
              <div className="flex justify-center gap-2 pt-2">
                {[
                  { ar: "أَبْ", bn: "আব" },
                  { ar: "إِبْ", bn: "ইব" },
                  { ar: "أُبْ", bn: "উব" },
                ].map((item) => (
                  <button
                    key={item.ar}
                    type="button"
                    onClick={() => handlePlayLetter(item.ar)}
                    className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 font-amiri text-2xl font-bold text-blue-900 shadow-xs cursor-pointer hover:bg-blue-100"
                  >
                    {item.ar} <span className="text-xs font-sans font-bold block">{item.bn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tashdeed Card */}
            <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3 text-center">
              <span className="text-2xl">💪</span>
              <h3 className="text-base font-extrabold text-slate-900">তাশদীদ (হরফের শক্তি!)</h3>
              <p className="text-xs text-slate-600">হরফটি দুইবার জোর দিয়ে পড়ি: ব্ + বা = ব্বা (بَّ)!</p>
              <div className="flex justify-center gap-2 pt-2">
                {[
                  { ar: "بَّ", bn: "ব্বা" },
                  { ar: "تَّ", bn: "ত্তা" },
                  { ar: "رَبِّ", bn: "রাব্বি" },
                ].map((item) => (
                  <button
                    key={item.ar}
                    type="button"
                    onClick={() => handlePlayLetter(item.ar)}
                    className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 font-amiri text-2xl font-bold text-amber-900 shadow-xs cursor-pointer hover:bg-amber-100"
                  >
                    {item.ar} <span className="text-xs font-sans font-bold block">{item.bn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Madd & Leen Card */}
            <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-3 text-center">
              <span className="text-2xl">↔️</span>
              <h3 className="text-base font-extrabold text-slate-900">মাদ (টেনে পড়া ১ আলিফ)</h3>
              <p className="text-xs text-slate-600">খাড়া যবর, খাড়া যের বা উল্টা পেশ আসলে সুর টেনে ধরি। যেমন: বা- (بَا)</p>
              <div className="flex justify-center gap-2 pt-2">
                {[
                  { ar: "بَا", bn: "বা-" },
                  { ar: "بِي", bn: "বী-" },
                  { ar: "بُو", bn: "বূ-" },
                ].map((item) => (
                  <button
                    key={item.ar}
                    type="button"
                    onClick={() => handlePlayLetter(item.ar)}
                    className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-200 font-amiri text-2xl font-bold text-purple-900 shadow-xs cursor-pointer hover:bg-purple-100"
                  >
                    {item.ar} <span className="text-xs font-sans font-bold block">{item.bn}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STAGE 5: ছোট ৯টি সূরা (Pages 38-47)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 5 && (
        <div className="space-y-6 animate-fade-in">
          {/* Surah Selector Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SHORT_9_SURAHS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playTapSound();
                  setSelectedSurahIdx(idx);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  selectedSurahIdx === idx
                    ? "bg-[#0d7a5f] text-white border-emerald-600 shadow-md font-black scale-102"
                    : "bg-white hover:bg-emerald-50 border-slate-200 text-slate-700 shadow-xs"
                }`}
              >
                <span>{s.nameBn}</span>
              </button>
            ))}
          </div>

          {/* Surah Display Card */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-100 pb-4 text-center sm:text-left">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-bengali">
                  {currentSurah.nameBn} ({currentSurah.nameAr})
                </h3>
                <p className="text-xs text-emerald-800 font-bold">
                  {currentSurah.ayahCountBn} • {currentSurah.meaningBn}
                </p>
              </div>

              {/* 3-Step Kid Guide: শুনে ৩ বার, দেখে ৩ বার, মুখস্থ */}
              <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-300 text-xs font-bold text-amber-900 shadow-xs">
                <span>🔁 পদ্ধতি:</span>
                <span>শুনে ৩ বার 👂</span>
                <span>•</span>
                <span>দেখে ৩ বার 👀</span>
                <span>•</span>
                <span>মুখস্থ ⭐</span>
              </div>
            </div>

            {/* Bismillah Header */}
            {currentSurah.surahNumber !== 9 && (
              <div className="text-center font-amiri text-2xl font-bold text-emerald-800 my-2">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
            )}

            {/* Ayahs List */}
            <div className="space-y-3.5">
              {currentSurah.ayahs.map((ayah) => {
                const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${String(currentSurah.surahNumber).padStart(3, "0")}${String(ayah.num).padStart(3, "0")}.mp3`;
                const isPlaying = isPlayingSurahAyah === ayah.num;
                return (
                  <div
                    key={ayah.num}
                    className="p-4 rounded-2xl bg-[#faf8f2] border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right"
                  >
                    <div className="flex items-center gap-2 order-2 sm:order-1">
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound();
                          if (isPlaying) {
                            setIsPlayingSurahAyah(null);
                          } else {
                            setIsPlayingSurahAyah(ayah.num);
                            const audio = new Audio(audioUrl);
                            audio.play().catch(() => {});
                            audio.onended = () => setIsPlayingSurahAyah(null);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin text-amber-300" : ""}`} />
                        <span>{isPlaying ? "চলছে..." : "শুনো"}</span>
                      </button>
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-sans">
                        {ayah.num}
                      </span>
                    </div>

                    <div className="order-1 sm:order-2 flex-1">
                      <p className="font-amiri text-2xl sm:text-3xl font-bold text-slate-900 leading-relaxed" dir="rtl">
                        {ayah.ar}
                      </p>
                      <p className="text-xs text-slate-600 font-normal mt-1 text-left sm:text-right">
                        {ayah.bn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STAGE 6: প্রতিদিনের দোয়া, ৩০ দিনের তারা বোর্ড ও সনদপত্র (Pages 48-55)
          ══════════════════════════════════════════════════════════════ */}
      {activeStage === 6 && (
        <div className="space-y-6 animate-fade-in">
          {/* Daily Duas for Kids (Page 48) */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🤲 প্রতিদিনের ছোট দোয়া</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                মুখস্থ করে মা-বাবাকে শুনিয়ে দাও!
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {DAILY_DUAS_FOR_KIDS.map((dua) => (
                <div
                  key={dua.id}
                  className="p-4 rounded-2xl bg-[#faf8f2] border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between text-left space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <span className="text-xl">{dua.emoji}</span>
                      <span>{dua.occasionBn}</span>
                    </span>
                  </div>
                  <p className="font-amiri text-xl font-bold text-slate-900 text-right leading-relaxed" dir="rtl">
                    {dua.ar}
                  </p>
                  <p className="text-xs font-bold text-emerald-800">
                    উচ্চারণ: {dua.bn}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    অর্থ: {dua.meaningBn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ⭐ 30-DAY STAR CHART (Page 51) */}
          <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                  <span>⭐ ৩০ দিনের তারা চার্ট (Star Chart)</span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {starDays.length}/৩০ দিন সম্পন্ন
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  প্রতিদিন কুরআন পড়ার পর একটি তারায় ট্যাপ করে রঙ করো! ৩০ দিন পূর্ণ হলেই সোনার মেডেল!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playMaShaAllahCelebration();
                  toast.success("মাশাআল্লাহ! তুমি প্রতিদিন সুন্দর করে কুরআন শিখছো!");
                }}
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm cursor-pointer"
              >
                🎉 মাশাআল্লাহ বাহবা!
              </button>
            </div>

            {/* 30 Day Star Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2.5 max-w-3xl mx-auto py-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNum) => {
                const isEarned = starDays.includes(dayNum);
                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleToggleStarDay(dayNum)}
                    className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-90 ${
                      isEarned
                        ? "bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105"
                        : "bg-slate-50 hover:bg-amber-50 border-dashed border-slate-300 text-slate-400"
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isEarned ? "fill-slate-950 text-slate-950" : "text-slate-300"}`} />
                    <span className="text-[10px] font-bold">দিন {dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🏅 DIGITAL PRINTABLE CERTIFICATE (Page 53) */}
          <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50 border-4 border-[#d4af37] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-6xl opacity-10 pointer-events-none">🕌</div>
            <div className="absolute bottom-2 left-2 text-6xl opacity-10 pointer-events-none">⭐</div>

            <div className="space-y-1">
              <span className="text-amber-500 font-amiri text-lg tracking-widest">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
              <div className="flex justify-center gap-1 text-amber-400 py-1">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
                সনদপত্র (Certificate)
              </h2>
              <p className="text-xs text-amber-800 font-bold">
                আমার প্রথম কুরআন শিক্ষা কোর্স সমাপন
              </p>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-xs text-slate-600">এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,</p>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="এখানে শিক্ষার্থীর নাম লেখো"
                  className="px-4 py-2 rounded-full border-2 border-amber-400 bg-white font-bold text-center text-base sm:text-lg text-emerald-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-full max-w-xs"
                />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                সফলভাবে <strong>"আমার প্রথম কুরআন শিক্ষা"</strong> কোর্সের আরবি হরফ, হরকত, তানভীন,
                তাজবীদের প্রাথমিক নিয়ম ও ছোট সূরা পাঠ সমাপ্ত করেছে।
              </p>
              <p className="text-xs font-bold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200 inline-block">
                আল্লাহ তোমার ইলম বাড়িয়ে দিন, কুরআনকে তোমার চিরসাথী করুন। আমীন!
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-amber-200 max-w-lg mx-auto text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">তারিখ:</span>
                <span>{new Date().toLocaleDateString("bn-BD")}</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-sm">
                🏅
              </div>
              <div>
                <span className="font-bold text-slate-800 block">শিক্ষক / প্রতিষ্ঠান:</span>
                <span>রহমানিয়া ইনস্টিটিউট নূর এআই</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playMaShaAllahCelebration();
                if (typeof window !== "undefined") window.print();
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ সনদপত্র প্রিন্ট / সংরক্ষণ করো</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
