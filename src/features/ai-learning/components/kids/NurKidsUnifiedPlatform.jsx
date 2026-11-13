"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  BookOpen,
  Video,
  Award,
  Star,
  Heart,
  Volume2,
  VolumeX,
  ArrowLeft,
  RotateCcw,
  Home,
  CheckCircle2,
  Play,
  Settings,
  Trophy,
  Flame,
  Printer,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  playTapSound,
  playStarPopSound,
  playCorrectChime,
  playLifeLostSound,
  playMaShaAllahCelebration
} from "@/features/ai-learning/lib/arabicSoundPlayer";

import QuranGamesHub from "@/features/ai-learning/components/QuranGamesHub";
import AmarProthomQuranShikkha from "@/features/ai/components/AmarProthomQuranShikkha";
import NurKidsVideoCorner from "@/features/ai-learning/components/kids/NurKidsVideoCorner";
import NuruMascot from "@/features/ai-learning/components/kids/NuruMascot";
import ParentGate from "@/features/ai-learning/components/kids/ParentGate";

export default function NurKidsUnifiedPlatform({ initialTab = "home" }) {
  // Active Main Zone: 'home' | 'games' | 'book' | 'videos' | 'rewards'
  const [activeZone, setActiveZone] = useState(initialTab);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);

  // Gamification: Stars & Lives (Duolingo / Vina Kids style)
  const [stars, setStars] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_stars");
      return saved ? parseInt(saved, 10) : 18;
    } catch {
      return 18;
    }
  });

  const [lives, setLives] = useState(() => {
    try {
      const saved = localStorage.getItem("noor_kids_lives");
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });

  const [childName, setChildName] = useState(() => {
    try {
      return localStorage.getItem("prothom_quran_child_name") || "ছোট্ট সোনামণি";
    } catch {
      return "ছোট্ট সোনামণি";
    }
  });

  const [mascotMessage, setMascotMessage] = useState(
    "আসসালামু আলাইকুম! নূর কিডস মহাবিশ্বে তোমাকে স্বাগতম! চলো খেলি ও শিখি!"
  );

  const handleEarnStars = (count = 1) => {
    setStars((prev) => {
      const next = prev + count;
      try {
        localStorage.setItem("noor_kids_stars", String(next));
      } catch {}
      return next;
    });
  };

  const handleSwitchZone = (zoneId, welcomeMsg) => {
    playTapSound();
    setActiveZone(zoneId);
    if (welcomeMsg) {
      setMascotMessage(welcomeMsg);
    }
    // Smooth scroll up to top of main container
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const NAV_ZONES = [
    { id: "home", label: "হোম", icon: Home, emoji: "🏠", color: "from-emerald-500 to-teal-600", text: "স্বাগতম" },
    { id: "games", label: "গেমস জোন", icon: Gamepad2, emoji: "🎮", color: "from-amber-500 to-orange-600", text: "৭টি গেম" },
    { id: "book", label: "রঙিন কায়দা", icon: BookOpen, emoji: "📖", color: "from-teal-600 to-emerald-700", text: "হরফ ও ছবি" },
    { id: "videos", label: "ইউটিউব কর্নার", icon: Video, emoji: "📺", color: "from-sky-500 to-cyan-600", text: "ভিডিও পাঠ" },
    { id: "rewards", label: "পুরস্কার ও সনদ", icon: Award, emoji: "🏆", color: "from-purple-500 to-indigo-600", text: "সনদপত্র" },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#F3FAF6] to-[#EDF6FD] text-slate-800 flex flex-col font-sans select-none pb-20">
      {/* ── TOP KIDS HUD BAR (Fun, Colorful, Child-Friendly) ── */}
      <header className="h-20 bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 px-3 sm:px-6 sticky top-0 z-40 shadow-xs flex items-center justify-between gap-2 max-w-6xl w-full mx-auto">
        {/* Left: Star Counter & Lives */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Tutor Home */}
          <Link
            href="/quran-tutor"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 flex items-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            title="এআই টিউটর হোমে ফিরুন"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span className="hidden md:inline">টিউটরে ফিরুন</span>
          </Link>

          {/* Star Counter */}
          <div
            onClick={() => {
              playStarPopSound(2);
              toast.success(`মাশাআল্লাহ! তোমার কাছে মোট ${stars}টি তারা আছে! ⭐`);
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
            title="তোমার জমানো তারা"
          >
            <span className="text-xl animate-bounce">⭐</span>
            <span className="text-base sm:text-lg font-black text-slate-950">
              {stars}
            </span>
          </div>

          {/* Lives / Hearts */}
          <div
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-600 shadow-xs flex items-center gap-1.5"
            title="তোমার বর্তমান প্রাণ"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 text-rose-500 animate-pulse" />
            <span className="text-sm sm:text-base font-black text-rose-900">
              {lives}/৫
            </span>
          </div>
        </div>

        {/* Center: Brand Title Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md border-2 border-emerald-400">
            <span className="text-lg">👶</span>
            <span className="font-black text-xs sm:text-sm tracking-wide">
              নূর কিডস মহাবিশ্ব
            </span>
          </div>
        </div>

        {/* Right: Parent Gate & Studio Shortcut */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/quran-tutor/studio"
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold items-center gap-1.5 transition active:scale-95"
          >
            <span>স্টুডিও</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsParentGateOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer"
            title="অভিভাবক নিয়ন্ত্রণ (Parent Gate)"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">অভিভাবক</span>
          </button>
        </div>
      </header>

      {/* ── ZONE SWITCHER TABS (Vina Kids Style Large Floating Dock) ── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 w-full">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-1.5 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-md">
          {NAV_ZONES.map((zone) => {
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleSwitchZone(zone.id)}
                className={`py-2 sm:py-3 px-1 sm:px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? `bg-gradient-to-r ${zone.color} text-white shadow-lg shadow-emerald-900/20 scale-102 font-extrabold`
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <span className="text-lg sm:text-xl">{zone.emoji}</span>
                <span className="truncate">{zone.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-5">
        {/* ── 🌟 ZONE 1: HOME (Welcome, Mascot, & 4 Giant Gateways) ── */}
        {activeZone === "home" && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Mascot Greeting */}
            <div className="flex flex-col items-center justify-center pt-2">
              <NuruMascot
                size="md"
                message={mascotMessage}
                showSpeechBubble={true}
                onClick={() => {
                  playTapSound();
                  setMascotMessage("মাশাআল্লাহ! তুমি প্রতিদিন কুরআন পড়ে অনেক বড় আলেম হবে!");
                }}
              />
            </div>

            {/* Daily Quest Banner for Kids */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-3 border-amber-500 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/90 text-amber-900 flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                  🎁
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    আজকের নূর মিশন: ১টি গেম খেলো + ১টি শিক্ষণীয় ভিডিও দেখো!
                  </h3>
                  <p className="text-xs font-bold text-amber-950/80 mt-0.5">
                    মিশন পূরণ করলেই +৫টি বোনাস তারা (Stars) ও আনন্দ উপহার আনলক হবে!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchZone("games", "চলো, বেলুন ফাটিয়ে হরকত শিখি!")}
                className="px-5 py-2.5 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
              >
                <span>মিশন শুরু করুন</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* 🎈 FEATURED GAME BANNER: BALLOON POP FESTIVAL */}
            <div
              onClick={() => {
                playTapSound();
                setActiveZone("games");
                if (typeof window !== "undefined") {
                  try {
                    const url = new URL(window.location.href);
                    url.searchParams.set("game", "balloon-pop");
                    window.history.pushState({ quranGame: "balloon-pop" }, "", url.toString());
                  } catch {}
                }
              }}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border-3 border-sky-300 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-300">
                  🎈
                </span>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      হরকত বেলুন উৎসব (Balloon Pop)
                    </h3>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      Vina-Kids স্টাইল 🌟
                    </span>
                  </div>
                  <p className="text-xs text-sky-100 font-medium mt-0.5">
                    আকাশে রঙিন বেলুন ফাটানোর খেলা — যবর, যের, পেশ ও তানভীন প্র্যাকটিস করো!
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 group-hover:bg-amber-300 transition">
                <span>এখনই খেলো</span>
                <span>➔</span>
              </div>
            </div>

            {/* 4 GIANT VINA-KIDS STYLE GATEWAY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1: গেমস জোন */}
              <div
                onClick={() => handleSwitchZone("games", "মাশাআল্লাহ! চলো গেম খেলে কুরআন শিখি!")}
                className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition duration-300">
                      🎮
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                      ৭টি মজার গেম
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-800 transition">
                    কুরআন গেমস জোন
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    বেলুন পপ, হরফ ট্রেসিং, ড্র্যাগ-ড্রপ, নুকতা গোনা ও সাউন্ড ডিটেকটিভ খেলে পয়েন্ট অর্জন করো!
                  </p>
                </div>
                <div className="pt-3 border-t-2 border-amber-200 flex items-center justify-between text-xs sm:text-sm font-black text-amber-900 group-hover:translate-x-1 transition">
                  <span>গেমস জোন খুলুন</span>
                  <ChevronRight className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              {/* Card 2: রঙিন কায়দা ও বই */}
              <div
                onClick={() => handleSwitchZone("book", "চলো, রঙিন ছবিতে ২৯টি হরফ চিনে নিই!")}
                className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 border-4 border-emerald-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition duration-300">
                      📖
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs">
                      ২৯ হরফ ও ছবি
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-800 transition">
                    আমার প্রথম কুরআন শিক্ষা
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    পশু-পাখির ছবি, ক্বারীর মিষ্টি তখতি অডিও, যবর-যের-পেশ ও ছোট ৯টি সূরার সচিত্র ডিজিটাল পাঠশালা।
                  </p>
                </div>
                <div className="pt-3 border-t-2 border-emerald-200 flex items-center justify-between text-xs sm:text-sm font-black text-emerald-900 group-hover:translate-x-1 transition">
                  <span>বইটি পড়ুন</span>
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              {/* Card 3: ভিডিও ও ইউটিউব কর্নার (Vina Kids YouTube Model) */}
              <div
                onClick={() => handleSwitchZone("videos", "নিরাপদ ইসলামিক ভিডিও দেখো ও তারা জেতো!")}
                className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-100 border-4 border-sky-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition duration-300">
                      📺
                    </span>
                    <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-black text-xs shadow-xs">
                      ইউটিউব কর্নার
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-sky-800 transition">
                    নূর কিডস ভিডিও স্টুডিও
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    আরবী বর্ণমালা অ্যানিমেশন, নূরানী কায়দা ভিডিও লেসন, নবীদের শিক্ষণীয় গল্প ও মাসনূন দোয়া।
                  </p>
                </div>
                <div className="pt-3 border-t-2 border-sky-200 flex items-center justify-between text-xs sm:text-sm font-black text-sky-900 group-hover:translate-x-1 transition">
                  <span>ভিডিও প্লেয়ার খুলুন</span>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
              </div>

              {/* Card 4: পুরস্কার ও রঙিন সনদ */}
              <div
                onClick={() => handleSwitchZone("rewards", "মাশাআল্লাহ! তোমার জমানো তারা ও সনদপত্র দেখো!")}
                className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-100 border-4 border-purple-400 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition duration-300">
                      🏆
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs shadow-xs">
                      ডিজিটাল সনদ
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-800 transition">
                    পুরস্কার ও রঙিন সনদপত্র
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    ৩০ দিনের তারা চার্ট, বিজয়ী ফ্যানফেয়ার এবং শিশুর নামসহ ডাউনলোড ও প্রিন্ট করার উপযোগী সনদ।
                  </p>
                </div>
                <div className="pt-3 border-t-2 border-purple-200 flex items-center justify-between text-xs sm:text-sm font-black text-purple-900 group-hover:translate-x-1 transition">
                  <span>সনদ ও পুরস্কার দেখুন</span>
                  <ChevronRight className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 🎮 ZONE 2: GAMES ZONE (7 Quran Games) ── */}
        {activeZone === "games" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSwitchZone("home")}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                <span>কিডস হোমে ফিরুন</span>
              </button>
            </div>

            <QuranGamesHub onBack={() => handleSwitchZone("home")} />
          </div>
        )}

        {/* ── 📖 ZONE 3: ILLUSTRATED BOOK & QAIDA ── */}
        {activeZone === "book" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSwitchZone("home")}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                <span>কিডস হোমে ফিরুন</span>
              </button>
            </div>

            <AmarProthomQuranShikkha />
          </div>
        )}

        {/* ── 📺 ZONE 4: YOUTUBE & VIDEO CORNER ── */}
        {activeZone === "videos" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSwitchZone("home")}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                <span>কিডস হোমে ফিরুন</span>
              </button>
            </div>

            <NurKidsVideoCorner onEarnStars={handleEarnStars} />
          </div>
        )}

        {/* ── 🏆 ZONE 5: REWARDS & CERTIFICATE ── */}
        {activeZone === "rewards" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSwitchZone("home")}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                <span>কিডস হোমে ফিরুন</span>
              </button>
            </div>

            {/* Printable Certificate Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-xl space-y-6 max-w-3xl mx-auto">
              <div className="text-center space-y-2">
                <span className="text-5xl">🏆</span>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif">
                  মাশাআল্লাহ! কুরআন শিক্ষা সম্মাননা সনদ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  রাহমানিয়া ইনস্টিটিউট ও নূর এআই শিশুতোষ কুরআন একাডেমি
                </p>
              </div>

              {/* Certificate Inner Border */}
              <div className="p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-500/80 bg-gradient-to-b from-[#FFFDF7] to-[#F5FCF8] text-center space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  CERTIFICATE OF ACHIEVEMENT
                </p>

                <p className="text-xs sm:text-sm text-slate-700">
                  অত্যন্ত আনন্দের সাথে প্রত্যয়ন করা যাচ্ছে যে,
                </p>

                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => {
                      setChildName(e.target.value);
                      try {
                        localStorage.setItem("prothom_quran_child_name", e.target.value);
                      } catch {}
                    }}
                    className="text-center text-xl sm:text-2xl font-black text-emerald-900 border-b-2 border-amber-500 pb-1 w-full bg-transparent focus:outline-hidden"
                    placeholder="শিশুর নাম লিখুন"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    (নাম পরিবর্তনের জন্য ক্লিক করুন)
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-md mx-auto">
                  সাফল্যের সাথে নূর কিডস মহাবিশ্বে <strong>২৯টি আরবী হরফ, সহীহ মাখরাজ, হরকত ও ছোট সূরা তিলাওয়াত</strong> সম্পন্ন করেছে এবং কৃতিত্বের স্বাক্ষর রেখেছে।
                </p>

                <div className="flex items-center justify-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-2xl animate-bounce">⭐</span>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-600 border-t border-amber-200">
                  <span className="font-bold">তারিখ: {new Date().toLocaleDateString("bn-BD")}</span>
                  <span className="font-bold font-serif text-emerald-900">নূর এআই প্রধান উস্তাদ</span>
                </div>
              </div>

              {/* Print Button */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playMaShaAllahCelebration();
                    if (typeof window !== "undefined") {
                      window.print();
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-700/30 transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>সনদপত্র প্রিন্ট বা সেভ করুন (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── PARENT GATE MODAL ── */}
      {isParentGateOpen && (
        <ParentGate
          onSuccess={() => {
            setIsParentGateOpen(false);
            toast.success("অভিভাবক যাচাই সম্পন্ন হয়েছে");
          }}
          onClose={() => setIsParentGateOpen(false)}
        />
      )}
    </div>
  );
}
