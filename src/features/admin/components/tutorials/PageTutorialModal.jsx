"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Video,
  Lightbulb,
  CheckCircle2,
  Bot,
  Copy,
  Check,
  X,
  Search,
  ChevronRight,
} from "lucide-react";
import { PAGE_TUTORIAL_REGISTRY, getTutorialForRoute } from "../../tutorials/pageTutorialRegistry";

// Helper to convert standard YouTube URL to privacy-enhanced embed URL
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0&modestbranding=1`;
    }
  } catch {}
  return null;
}

export default function PageTutorialModal({
  isOpen,
  onClose,
  activeRouteKey = "analytics",
  customVideos = {},
}) {
  const [selectedRouteKey, setSelectedRouteKey] = useState(activeRouteKey);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedPromptIndex, setCopiedPromptIndex] = useState(null);

  // Sync with active route when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRouteKey(activeRouteKey);
      setSearchQuery("");
      setCopiedPromptIndex(null);
    }
  }, [isOpen, activeRouteKey]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const tutorial = useMemo(() => {
    return getTutorialForRoute(selectedRouteKey);
  }, [selectedRouteKey]);

  // Resolve video URL: custom video from DB takes precedence, then defaultVideoUrl
  const activeVideoUrl = useMemo(() => {
    return (
      customVideos[selectedRouteKey] ||
      tutorial.defaultVideoUrl ||
      ""
    ).trim();
  }, [customVideos, selectedRouteKey, tutorial]);

  const youtubeEmbedUrl = useMemo(() => {
    return getYouTubeEmbedUrl(activeVideoUrl);
  }, [activeVideoUrl]);

  // Filter list of all tutorials for the search dropdown
  const filteredTutorials = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.values(PAGE_TUTORIAL_REGISTRY).filter(
      (t) =>
        t.pageTitle.toLowerCase().includes(q) ||
        t.shortSummary.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCopyPrompt = (text, index) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => {
      setCopiedPromptIndex(null);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
      >
        {/* ── Modal Header ── */}
        <div className="px-5 sm:px-7 py-4 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-stone-900 dark:to-stone-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {tutorial.badge}
                </span>
                {activeVideoUrl && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <Video className="w-3 h-3" /> ভিডিও টিউটোরিয়াল
                  </span>
                )}
              </div>
              <h2
                id="tutorial-modal-title"
                className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5"
              >
                {tutorial.pageTitle} — ব্যবহার বিধি
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition cursor-pointer"
            aria-label="বন্ধ করুন"
            title="সহায়িকা বন্ধ করুন (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search Bar to browse other tutorials ── */}
        <div className="px-5 sm:px-7 py-2.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/40 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অন্যান্য পেজের নির্দেশিকা খুঁজুন (যেমন: ফি, হাজিরা, রেজাল্ট, শিক্ষক)..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-slate-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Search Dropdown Results */}
          {filteredTutorials.length > 0 && (
            <div className="absolute left-5 right-5 top-full mt-1 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 max-h-56 overflow-y-auto z-20 p-2 space-y-1">
              {filteredTutorials.map((item) => (
                <button
                  key={item.routeKey}
                  onClick={() => {
                    setSelectedRouteKey(item.routeKey);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-stone-700/60 transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                      {item.pageTitle}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate max-w-md">
                      {item.shortSummary}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* ── Dynamic Video Player (Rendered ONLY if Video URL is Present) ── */}
          {activeVideoUrl && (
            <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md bg-black">
              {youtubeEmbedUrl ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${tutorial.pageTitle} ভিডিও টিউটোরিয়াল`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <video
                  src={activeVideoUrl}
                  controls
                  playsInline
                  className="w-full max-h-80 object-cover bg-black"
                >
                  আপনার ব্রাউজারে ভিডিও প্লেয়ার সাপোর্ট করছে না।
                </video>
              )}
            </div>
          )}

          {/* ── Pillar 1: মূল কাজ কী (Core Purpose) ── */}
          <section className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>১. মূল কাজ কী (Core Purpose)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-stone-300 leading-relaxed font-medium">
              {tutorial.purpose}
            </p>
          </section>

          {/* ── Pillar 2: ধাপে ধাপে ব্যবহার নির্দেশিকা (Step-by-Step Practical Steps) ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>২. ধাপে ধাপে ব্যবহার নির্দেশিকা (Step-by-Step Guide)</span>
            </div>
            <ol className="space-y-2.5">
              {tutorial.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-stone-300 bg-stone-50/80 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-100 dark:border-stone-800"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Pillar 3: প্রাতিষ্ঠানিক টিপস (Actionable Practical Tips) ── */}
          {tutorial.tips && tutorial.tips.length > 0 && (
            <section className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-sm">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>৩. প্রাতিষ্ঠানিক টিপস (Practical Tips)</span>
              </div>
              <ul className="space-y-2">
                {tutorial.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-medium leading-relaxed"
                  >
                    <span className="text-amber-600 font-black shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Pillar 4: এআই সহকারীর সাহায্য (AI Assistant Prompt Guidance) ── */}
          {tutorial.aiAssistantHelp && tutorial.aiAssistantHelp.length > 0 && (
            <section className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-black text-sm">
                  <Bot className="w-4 h-4 text-sky-600" />
                  <span>৪. এআই সহকারীর সাহায্য (AI Prompt Examples)</span>
                </div>
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900 px-2 py-0.5 rounded-full">
                  কপি করে এআই-কে বলুন
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-sky-950/80 dark:text-sky-200">
                এই পেজের কাজ দ্রুত স্বয়ংক্রিয় করতে বিল্ট-ইন এআই সহায়ককে নিচের বাক্যগুলো সরাসরি বলতে পারেন:
              </p>
              <div className="space-y-2">
                {tutorial.aiAssistantHelp.map((promptText, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-sky-200/80 dark:border-sky-800 shadow-xs"
                  >
                    <span className="text-xs text-slate-800 dark:text-stone-200 font-medium select-all">
                      &quot;{promptText}&quot;
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(promptText, idx)}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/70 dark:hover:bg-sky-800 text-sky-800 dark:text-sky-200 text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                      title="প্রম্পটটি কপি করুন"
                    >
                      {copiedPromptIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-black">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 sm:px-7 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500 font-medium">
            💡 যে কোনো সময় উপরের মেনুবারের <strong className="text-slate-800 dark:text-stone-200">&quot;কীভাবে ব্যবহার করবেন?&quot;</strong> বাটনে চাপ দিয়ে এই গাইড দেখতে পারেন।
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            পড়েছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
}
