"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  BookOpen,
  Volume2,
  X,
  ArrowRight,
  CheckCircle2,
  Tag,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const QUICK_THEMATIC_PROMPTS = [
  { label: "সালাত ও নামায", query: "সালাত" },
  { label: "ধৈর্য ও সবর", query: "সবর" },
  { label: "রমজান ও রোজা", query: "রমজান" },
  { label: "পিতা-মাতার সেবা", query: "পিতা মাতা" },
  { label: "জান্নাত ও নিয়ামত", query: "জান্নাত" },
  { label: "তওবা ও ক্ষমা", query: "তওবা" },
  { label: "সাজদাহর আয়াতসমূহ", query: "সাজদাহ" },
  { label: "মূসা (আঃ) ও অলৌকিক ঘটনা", query: "মূসা" },
];

export default function QuranSemanticSearchModal({ isOpen, onClose, onSelectAyah, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchedTheme, setSearchedTheme] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  const handleSearch = useCallback(async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q || !q.trim()) {
      toast.error("অনুগ্রহ করে অনুসন্ধানের জন্য বিষয় বা শব্দ লিখুন।");
      return;
    }

    setLoading(true);
    setResults([]);
    setSearchedTheme(null);

    try {
      const res = await fetch("/api/ai/nur/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() })
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.results)) {
        setResults(data.results);
        setSearchedTheme(data.theme || null);
        if (data.results.length === 0) {
          toast.info("কোনো প্রাসঙ্গিক আয়াত পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।");
        }
      } else {
        toast.error(data.message || "অনুসন্ধান ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("QuranSemanticSearch error:", err);
      toast.error("সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery, handleSearch]);

  if (!isOpen) return null;

  const playVerseAudio = (text, index) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("অডিও প্লেয়ার আপনার ব্রাউজারে উপলব্ধ নয়।");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;
    utterance.onstart = () => setPlayingIndex(index);
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#091a14] border border-emerald-800/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/80 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>ন্যাচারাল ল্যাঙ্গুয়েজ কুরআন সার্চ</span>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/60 font-mono">
                  AI থিমেটিক ইনডেক্সিং
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                বাংলা বা ইংরেজিতে কোনো বিষয় লিখুন (যেমন: &ldquo;মূসা আঃ এর লাঠি&rdquo;, &ldquo;সেজদাহর আয়াত&rdquo;)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/40 bg-black/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="বিষয় লিখুন: যেমন- মূসা (আঃ), সেজদাহ, পিতা-মাতা, জান্নাত, সবর..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-emerald-900/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/30 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>অনুসন্ধান...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>খুঁজুন</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Thematic Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 text-xs scrollbar-none">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>জনপ্রিয় বিষয়:</span>
            </span>
            {QUICK_THEMATIC_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => {
                  setQuery(prompt.query);
                  handleSearch(prompt.query);
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 text-[11px] transition-colors"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {searchedTheme && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between">
              <span>প্রাসঙ্গিক থিম: <strong>{searchedTheme.toUpperCase()}</strong></span>
              <span>মোট ম্যাচ: {results.length} টি আয়াত</span>
            </div>
          )}

          {results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-10 h-10 text-emerald-700/60 mx-auto mb-2.5" />
              <p className="text-sm font-medium text-slate-300">কোনো অনুসন্ধান এখনও করা হয়নি</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                উপরে আপনার কাঙ্ক্ষিত বিষয় লিখুন অথবা জনপ্রিয় বিষয়ের ট্যাগগুলোতে ক্লিক করে প্রাসঙ্গিক আয়াতসমূহ পর্যবেক্ষণ করুন।
              </p>
            </div>
          )}

          {results.map((verse, idx) => (
            <div
              key={`${verse.surah}-${verse.ayah}-${idx}`}
              className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/60 hover:border-emerald-700/60 transition-all space-y-3 shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    সূরা নং {verse.surah}, আয়াত নং {verse.ayah}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playVerseAudio(verse.arabic, idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                      playingIndex === idx
                        ? "bg-amber-600 border-amber-500 text-white"
                        : "bg-emerald-950 border-emerald-800/80 hover:bg-emerald-900 text-emerald-200"
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{playingIndex === idx ? "বাজছে..." : "শুনুন"}</span>
                  </button>
                  {onSelectAyah && (
                    <button
                      onClick={() => {
                        onSelectAyah(verse);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors flex items-center gap-1"
                    >
                      <span>অনুশীলন করুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right py-1">
                <p
                  className="text-lg sm:text-xl font-serif text-amber-100 leading-loose"
                  dir="rtl"
                >
                  {verse.arabic}
                </p>
              </div>

              {/* Bangla Translation */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-slate-900 pt-2">
                {verse.bangla}
              </p>

              {/* Context Explanation */}
              {verse.contextExplanation && (
                <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/40">
                  <strong>তাফসীরিক প্রেক্ষিত:</strong> {verse.contextExplanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-black/40 border-t border-emerald-900/80 flex items-center justify-between text-xs text-slate-400 px-5">
          <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>প্রামাণ্য কুরআনিক থিমেটিক ডাটাবেজ দ্বারা যাচাইকৃত</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
