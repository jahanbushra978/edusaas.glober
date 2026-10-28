"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAIChat } from "../hooks/useAIChat";
import FeeConfirmationCard from "./FeeConfirmationCard";
import ReceiptCard from "./ReceiptCard";
import AISettingsModal from "./AISettingsModal";
import NurTeachingEngine from "./NurTeachingEngine";
import MakhrajVisualizer from "./MakhrajVisualizer";
import InteractiveVoiceTutor from "./InteractiveVoiceTutor";
import AdvancedHifzAssistant from "./AdvancedHifzAssistant";
import AIPracticeGenerator from "./AIPracticeGenerator";
import AIOralExamChamber from "./AIOralExamChamber";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Loader2,
  Send,
  X,
  Settings,
  Trash2,
  Minimize2,
  Maximize2,
  User,
  Copy,
  Check,
  ShieldCheck,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Award,
  Zap,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const STORAGE_FLOATING_KEY = "rahmania_ai_floating_visible_v1";

export default function AIChatDrawer({ currentUser }) {
  const pathname = usePathname();
  const isPortalPage = Boolean(
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/teacher") ||
    pathname?.startsWith("/student")
  );
  const isStudioPage = Boolean(
    pathname?.startsWith("/quran-tutor") ||
    pathname?.startsWith("/quran-teacher") ||
    pathname?.startsWith("/ai-quran-learning")
  );
  const isPublicPage = !isPortalPage;
  // Always permit access to AI settings & BYOK key configuration for visitors and users
  const showSettings = true;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiTab, setAiTab] = useState("nur-lesson"); // Default to Nur Quran Lesson
  const [input, setInput] = useState("");
  const [isFloatingVisible, setIsFloatingVisible] = useState(true); // Default visible for instant access
  const [highlightZone, setHighlightZone] = useState("halq");
  const [highlightLetter, setHighlightLetter] = useState("ع");
  const [copiedId, setCopiedId] = useState(null);
  const [isDictating, setIsDictating] = useState(false);
  const dictationRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    messages,
    isLoading,
    sendMessage,
    pendingConfirmation,
    confirmOperation,
    cancelConfirmation,
    clearChat,
    config,
    saveConfig,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useAIChat({
    defaultWelcomeText: isPublicPage
      ? "আসসালামু আলাইকুম! আমি **রহমানিয়া নূর এআই কুরআন শিক্ষক ও সহকারী**।\n\nমাদরাসার নূরানী, নাজেরা ও হিফযুল কুরআন তিলাওয়াত, মাখরাজ অনুশীলন, কিংবা ভর্তি ও যোগাযোগ তথ্যের জন্য নিচের অপশনগুলো ব্যবহার করতে পারেন।"
      : "আসসালামু আলাইকুম! আমি **রহমানিয়া নূর এআই (Nur AI Teacher)**। কুরআন শিক্ষা, হিফজ ট্র্যাকিং, ফি তথ্য, কিংবা অ্যাকাডেমিক সহায়তায় প্রস্তুত।",
  });

  // Load floating trigger visibility preference (default: true)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLOATING_KEY);
      if (saved !== null) {
        setIsFloatingVisible(saved === "true");
      }
    } catch {}
  }, []);

  // Listen for global open event and keyboard shortcut (Alt+A or Ctrl+J)
  useEffect(() => {
    const handleOpenEvent = (e) => {
      if (e?.detail?.tab) {
        setAiTab(e.detail.tab);
      }
      setIsOpen(true);
    };
    const handleToggleEvent = () => setIsOpen((prev) => !prev);

    const handleKeyDown = (e) => {
      // Alt+A or Ctrl+J / Cmd+J to toggle AI
      if ((e.altKey && (e.key === "a" || e.key === "A")) || ((e.ctrlKey || e.metaKey) && (e.key === "j" || e.key === "J"))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Esc to close when open
      if (e.key === "Escape" && isOpen && !isSettingsOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("open-ai-chat", handleOpenEvent);
    window.addEventListener("toggle-ai-chat", handleToggleEvent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-ai-chat", handleOpenEvent);
      window.removeEventListener("toggle-ai-chat", handleToggleEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSettingsOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, pendingConfirmation, isLoading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("বার্তা কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error("আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থন করে না।");
      return;
    }

    if (isDictating) {
      if (dictationRef.current) dictationRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        const recognition = new SpeechRec();
        recognition.lang = "bn-BD";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => setIsDictating(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => (prev ? prev + " " + transcript : transcript));
          }
          setIsDictating(false);
        };
        recognition.onerror = () => setIsDictating(false);
        recognition.onend = () => setIsDictating(false);
        dictationRef.current = recognition;
        recognition.start();
      } catch {
        setIsDictating(false);
      }
    }
  };

  const toggleFloatingBadge = (show) => {
    setIsFloatingVisible(show);
    try {
      localStorage.setItem(STORAGE_FLOATING_KEY, String(show));
    } catch {}
    if (!show) {
      toast.info("AI ফ্লোটিং আইকন লুকানো হয়েছে। কীবোর্ডে Alt+A চেপে যেকোনো সময় খুলতে পারবেন।");
    } else {
      toast.success("AI ফ্লোটিং আইকন সক্রিয় করা হয়েছে।");
    }
  };

  // Role-specific quick prompts (Public page = always guest, Portal pages = role-based)
  const role = isPublicPage ? "guest" : (currentUser?.role || "guest");
  const quickPrompts = [
    { label: "📖 ইখফা ও গুন্নাহর নিয়ম", query: "কুরআন তিলাওয়াতে ইখফা ও ওয়াজিব গুন্নাহর নিয়ম সহজ বাংলায় বুঝিয়ে দিন।" },
    { label: "🔊 ১৭টি মাখরাজের গাইড", query: "আরবি হরফের ১৭টি মাখরাজ ও ৫টি প্রধান অঙ্গের বিবরণ বুঝিয়ে বলুন।" },
    { label: "⏱️ কলকলাহ ও মাদ্দের কায়েদা", query: "কলকলাহর ৫টি হরফ এবং মাদ্দে আসলীতে কত আলিফ টানতে হয়?" },
    ...(role === "guest"
      ? [
          { label: "🎓 ভর্তি তথ্য ও নিয়মাবলী", query: "রহমানিয়া ইনস্টিটিউটে নতুন ছাত্র ভর্তির নিয়ম ও আবেদনের উপায় কী?" },
          { label: "📖 বিভাগ ও কোর্সসমূহ", query: "মাদরাসার নূরানী, নাজেরা, হিফয ও অন্যান্য বিভাগ সম্পর্কে বিস্তারিত বলুন" },
          { label: "📍 ঠিকানা ও অফিস হটলাইন", query: "মাদরাসার ঠিকানা, ফোন নম্বর ও যোগাযোগ তথ্য দিন" },
          { label: "🏠 আবাসিক ও খাবার সুবিধা", query: "মাদরাসার হোস্টেল, আবাসিক ও খাবারের সুযোগ-সুবিধা কেমন?" },
        ]
      : []),
    ...(role === "student"
      ? [
          { label: "💰 আমার বকেয়া ফি", query: "আমার বর্তমান মাসের বকেয়া ফি কত এবং পেমেন্ট স্ট্যাটাস কি?" },
          { label: "📊 পরীক্ষার রেজাল্ট", query: "আমার সাম্প্রতিক পরীক্ষার রেজাল্ট ও গ্রেড দেখাও" },
          { label: "📅 আমার হাজিরা", query: "আমার সাম্প্রতিক ক্লাসের হাজিরা ও উপস্থিতির হার দেখাও" },
        ]
      : []),
    ...(role === "teacher"
      ? [
          { label: "📝 আজকের হাজিরা সামারি", query: "আজকের ক্লাসের ছাত্র-ছাত্রীদের উপস্থিতির সামারি রিপোর্ট দাও" },
          { label: "📖 হিফজ ক্লাস ওভারভিউ", query: "হিফজ বিভাগের অ্যাকাডেমিক ও হাজিরার ওভারভিউ সামারি তৈরি করো" },
          { label: "📢 পরীক্ষার নোটিশ ড্রাফট", query: "আসন্ন সাময়িক পরীক্ষার সময়সূচি সংক্রান্ত একটি নোটিশের ড্রাফট লিখে দাও" },
        ]
      : []),
    ...(role === "admin" || role === "branch_admin" || role === "super_admin"
      ? [
          { label: "💳 ফি কালেকশন শুরু", query: "ছাত্রের রোল দিয়ে বকেয়া ফি যাচাই করে কালেকশন শুরু করতে চাই" },
          { label: "🏛️ ব্রাঞ্চ পারফরম্যান্স সামারি", query: "আমাদের শাখার সামগ্রিক অ্যাকাডেমিক ও হাজিরা সামারি রিপোর্ট দেখাও" },
          { label: "🔍 সক্রিয় ছাত্র সার্চ", query: "হিফজ বিভাগের সক্রিয় ছাত্রদের তালিকা সার্চ করো" },
        ]
      : []),
  ];

  return (
    <>
      {/* 🌟 Prominent & Elegant Floating Nur AI Button - Directly Opens Full Page */}
      {isFloatingVisible && !isOpen && !isStudioPage && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1 group">
          <Link
            href="/quran-tutor/teacher"
            className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-emerald-950/90 hover:border-emerald-400 group-hover:ring-2 group-hover:ring-emerald-500/30"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="h-3 w-3" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-serif leading-tight text-emerald-300">
                নূর AI কুরআন শিক্ষক
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                তাজবীদ ও মাখরাজ পাঠশালা
              </div>
            </div>
            <span className="rounded-full bg-emerald-950 border border-emerald-700 px-2 py-0.5 text-[9px] text-emerald-300 ml-1 font-bold">
              সরাসরি পেজে যান ➔
            </span>
          </Link>
          <button
            onClick={() => toggleFloatingBadge(false)}
            className="h-6 w-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            title="লুকিয়ে রাখুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 💬 Ultra-Luxurious AI Assistant Drawer / Modal */}
      {isOpen && (
        <div
          translate="no"
          className="notranslate fixed inset-0 z-40 flex items-end sm:items-center justify-end sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className={`flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 border border-slate-200/90 dark:border-slate-800 ${
              isExpanded
                ? "h-[94vh] w-[95vw] max-w-5xl rounded-2xl"
                : "h-[86vh] sm:h-[640px] w-full sm:w-[430px] max-w-full sm:rounded-2xl rounded-t-3xl"
            }`}
          >
            {/* Mobile Grab Bar Indicator for Phone Screens */}
            <div className="sm:hidden flex justify-center pt-2 pb-1 bg-slate-50 dark:bg-slate-900">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                  <BookOpen className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900 animate-pulse"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate font-serif">
                      নূর — এআই কুরআন শিক্ষক ও সহকারী
                    </h3>
                    <Badge variant="outline" className="h-4 border-emerald-500/40 bg-emerald-950/20 px-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Nur AI v1.0
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {config.apiKey ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        🔑 BYOK সক্রিয় ({config.provider.toUpperCase()})
                      </span>
                    ) : (
                      <span>তাজবীদ • মাখরাজ • হিফজ • অ্যাকাডেমিক সহায়তা</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-sm cursor-pointer ${
                    config.apiKey
                      ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                      : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-600 animate-pulse"
                  }`}
                  title="Configure AI Provider & API Key (BYOK)"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">
                    {config.apiKey ? "BYOK সেটিং" : "API Key দিন"}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  title="Clear Chat History"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Link
                  href="/quran-tutor/teacher"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                  title="পূর্ণাঙ্গ পেজে শিক্ষক খুলুন"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>পূর্ণাঙ্গ পেজ</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:inline-flex h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  title={isExpanded ? "Restore Size" : "Maximize Size"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                  title="Close Assistant (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── MODE SWITCHER TABS (Nur Quran Tutor & Makhraj Inside Nur) ── */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-1.5 gap-1 text-xs overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setAiTab("nur-lesson")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "nur-lesson"
                    ? "bg-emerald-600 text-white shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">শিক্ষক লুপ</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("nur-voice")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "nur-voice"
                    ? "bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-sm font-bold ring-1 ring-emerald-400"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Mic className="h-3.5 w-3.5 text-emerald-300" />
                <span className="whitespace-nowrap">মুখে কুরআন শিক্ষা</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("makhraj")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "makhraj"
                    ? "bg-emerald-700 text-white shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">মাখরাজ</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("hifz")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "hifz"
                    ? "bg-amber-600 text-white shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">হিফজ সহযোগী</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("drill")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "drill"
                    ? "bg-cyan-700 text-white shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">দুর্বলতা ড্রিল</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("exam")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "exam"
                    ? "bg-indigo-700 text-white shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">মৌখিক পরীক্ষা</span>
              </button>
              <button
                type="button"
                onClick={() => setAiTab("chat")}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  aiTab === "chat"
                    ? "bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm font-semibold border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">সহকারী চ্যাট</span>
              </button>
            </div>

            {/* ── NUR INTERACTIVE TEACHING ENGINE VIEW ── */}
            {aiTab === "nur-lesson" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                {/* Nur Identity Banner */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-950/80 to-teal-950/60 border border-emerald-700/40 rounded-xl px-3 py-2 mb-3 shadow-inner">
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
                    <Bot className="w-4.5 h-4.5 text-white" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-emerald-300 font-serif">নূর — কুরআন AI শিক্ষক</div>
                    <div className="text-[10px] text-slate-400 truncate">ব্যাখ্যা → ডেমো → অনুশীলন → মূল্যায়ন → সংশোধন → পুনরাবৃত্তি</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      config.apiKey
                        ? "bg-emerald-900/60 border-emerald-600/70 text-emerald-300 hover:bg-emerald-800"
                        : "bg-amber-900/80 border-amber-500/80 text-amber-200 hover:bg-amber-800 animate-pulse"
                    }`}
                    title="AI API Key ও মডেল সেটিংস"
                  >
                    {config.apiKey ? "🔑 BYOK" : "⚙️ Key দিন"}
                  </button>
                </div>
                <NurTeachingEngine
                  studentContext={currentUser}
                  onMakhrajHighlight={(zone, letter) => {
                    if (zone) setHighlightZone(zone);
                    if (letter) setHighlightLetter(letter);
                    setAiTab("makhraj");
                  }}
                />
              </div>
            )}

            {/* ── NUR INTERACTIVE VOICE TUTOR VIEW ── */}
            {aiTab === "nur-voice" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <InteractiveVoiceTutor
                  onMakhrajHighlight={(zone) => {
                    if (zone) setHighlightZone(zone);
                    setAiTab("makhraj");
                  }}
                />
              </div>
            )}

            {/* ── MAKHRAJ VISUALIZER VIEW ── */}
            {aiTab === "makhraj" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <MakhrajVisualizer
                  initialZoneId={highlightZone}
                  initialLetter={highlightLetter}
                  onSelectLetter={(letter, zone) => {
                    if (letter) setHighlightLetter(letter);
                    if (zone?.id) setHighlightZone(zone.id);
                  }}
                />
              </div>
            )}

            {/* ── HIFZ ASSISTANT VIEW ── */}
            {aiTab === "hifz" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <AdvancedHifzAssistant studentContext={currentUser} />
              </div>
            )}

            {/* ── TAJWEED WEAKNESS DRILL GENERATOR VIEW ── */}
            {aiTab === "drill" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <AIPracticeGenerator studentId={currentUser?.id || "student_studio"} />
              </div>
            )}

            {/* ── ORAL EXAM CHAMBER VIEW ── */}
            {aiTab === "exam" && (
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <AIOralExamChamber studentContext={currentUser} />
              </div>
            )}

            {/* ── NUR COMPACT FOOTER (when in Nur modes) ── */}
            {aiTab !== "chat" && (
              <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>নূর তাজবীদ ও মাখরাজ ইঞ্জিন সক্রিয়</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAiTab("chat")}
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold text-xs transition-colors"
                >
                  সহকারী চ্যাটে ফিরুন ➔
                </button>
              </div>
            )}

            {/* ── MESSAGES BODY (when in Chat mode) ── */}
            {aiTab === "chat" && (
              <>
            <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 text-sm scrollbar-thin">
              {/* BYOK Callout Banner when no API key configured */}
              {!config.apiKey ? (
                <div className="rounded-xl border border-amber-300 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base">🔑</span>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          নিজস্ব AI API Key (BYOK) যুক্ত করুন
                        </h4>
                        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                          বিনামূল্যে Google Gemini বা OpenRouter-এর API Key ব্যবহার করে দ্রুত ও আনলিমিটেড এআই রেসপন্স পান।
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsSettingsOpen(true)}
                      className="shrink-0 h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-2.5 shadow-sm cursor-pointer"
                    >
                      Key দিন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-300/60 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 shadow-sm flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>আপনার <strong>{config.provider.toUpperCase()}</strong> API Key সক্রিয় রয়েছে।</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-[10px] text-emerald-700 dark:text-emerald-400 underline font-semibold hover:text-emerald-900 cursor-pointer"
                  >
                    পরিবর্তন
                  </button>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 shadow-sm dark:bg-teal-950 dark:text-teal-300">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm transition-all break-words [overflow-wrap:anywhere] ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none"
                        : "bg-slate-50 text-slate-800 dark:bg-slate-800/90 dark:text-slate-100 rounded-bl-none border border-slate-200/70 dark:border-slate-700/60"
                    }`}
                  >
                    <div className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert break-words [overflow-wrap:anywhere]">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 dark:text-teal-400 font-medium underline underline-offset-2 break-all hover:text-teal-700 dark:hover:text-teal-300 inline max-w-full"
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p {...props} className="mb-2 last:mb-0 break-words leading-relaxed" />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="my-1.5 list-disc pl-4 space-y-1 break-words" />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol {...props} className="my-1.5 list-decimal pl-4 space-y-1 break-words" />
                          ),
                          li: ({ node, ...props }) => (
                            <li {...props} className="break-words" />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code {...props} className="rounded bg-slate-200/80 dark:bg-slate-700 px-1 py-0.5 font-mono text-[11px] break-all" />
                            ) : (
                              <div className="overflow-x-auto my-2 max-w-full rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-100">
                                <code {...props} className="font-mono text-[11px] whitespace-pre break-normal" />
                              </div>
                            ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-2 max-w-full rounded border border-slate-200 dark:border-slate-700">
                              <table {...props} className="min-w-full text-xs text-left" />
                            </div>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Copy button on AI messages */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-teal-600 shadow-sm flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    )}

                    {/* Render Embedded Receipt if present */}
                    {msg.receipt && <ReceiptCard receipt={msg.receipt} />}
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-200">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Pending Interactive Confirmation Card */}
              {pendingConfirmation && (
                <FeeConfirmationCard
                  confirmation={pendingConfirmation}
                  onConfirm={confirmOperation}
                  onCancel={cancelConfirmation}
                  isLoading={isLoading}
                />
              )}

              {/* Typing / Processing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 p-2.5 text-xs text-teal-800 dark:text-teal-300 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">এআই অপারেশন বিশ্লেষণ ও উত্তর প্রস্তুত করছে...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── QUICK SUGGESTION PILLS ── */}
            {messages.length <= 3 && !isLoading && (
              <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 px-3 py-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(p.query)}
                      className="shrink-0 whitespace-nowrap rounded-full border border-teal-500/25 bg-white dark:bg-slate-800 px-3 py-1 text-[11px] font-medium text-teal-800 dark:text-teal-300 shadow-sm transition-all hover:bg-teal-50 hover:border-teal-500/50 dark:hover:bg-teal-950/60 active:scale-95"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT INPUT BAR ── */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
            >
              <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus-within:border-teal-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  rows={1}
                  placeholder="এখানে বাংলায় প্রশ্ন বা কমান্ড লিখুন... (Enter to send)"
                  className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <div className="flex items-center gap-1.5 pr-2">
                  <Button
                    type="button"
                    size="icon"
                    onClick={toggleDictation}
                    title={isDictating ? "রেকর্ডিং থামান" : "মুখে বলুন (Voice Input)"}
                    className={`h-8 w-8 rounded-lg shadow-sm transition-all ${
                      isDictating
                        ? "bg-red-600 text-white ring-2 ring-red-400 animate-pulse"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isDictating ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-8 rounded-lg bg-teal-600 text-white shadow-md hover:bg-teal-700 disabled:opacity-40 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Footer Utilities */}
              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span>Permission-locked Server Execution</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFloatingBadge(!isFloatingVisible)}
                  className="hover:text-teal-600 transition-colors"
                >
                  {isFloatingVisible ? "ফ্লোটিং আইকন লুকান" : "ফ্লোটিং আইকন দেখান"}
                </button>
              </div>
            </form>
            </>
            )}
          </div>
        </div>
      )}

      {/* AISettingsModal (Globally accessible for BYOK configuration) */}
      <AISettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        config={config}
        onSave={saveConfig}
      />
    </>
  );
}
