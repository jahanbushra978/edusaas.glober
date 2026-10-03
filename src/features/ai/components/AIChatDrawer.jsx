"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAIChat } from "../hooks/useAIChat";
import FeeConfirmationCard from "./FeeConfirmationCard";
import ReceiptCard from "./ReceiptCard";
import AISettingsModal from "./AISettingsModal";
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
  const isPublicPage = !isPortalPage;
  const showSettings = isPortalPage && Boolean(currentUser && currentUser.role);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isFloatingVisible, setIsFloatingVisible] = useState(false); // Default false so no intrusive icon covers tables!
  const [copiedId, setCopiedId] = useState(null);
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
      ? "আসসালামু আলাইকুম! আমি **রহমানিয়া ইনস্টিটিউট এআই সহকারী**।\n\n🚧 **আমাদের ওয়েবসাইটের কাজ বর্তমানে চলমান রয়েছে।**\nআপাতত মাদরাসার নূরানী, নাজেরা, হিফযুল কুরআন, কিতাব ও জেনারেল বিভাগ, ভর্তি তথ্য বা যোগাযোগ সংক্রান্ত প্রয়োজনীয় তথ্যের জন্য নিচের অপশন বা হেল্পলাইন ব্যবহার করতে পারেন।"
      : "আসসালামু আলাইকুম! আমি **রহমানিয়া এআই সহকারী (Rahmania AI Assistant)**। ফি তথ্য, হাজিরা, ছাত্র সার্চ বা অ্যাকাডেমিক সামারি সংক্রান্ত যেকোনো সাহায্য করতে আমি প্রস্তুত।",
  });

  // Load floating trigger visibility preference (default: false to keep UI completely clean)
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
    const handleOpenEvent = () => setIsOpen(true);
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
      {/* 🌟 Discreet, Non-Intrusive Floating Tab (Only shown if user explicitly enables it) */}
      {isFloatingVisible && !isOpen && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1 group">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-white/95 px-4 py-2.5 text-xs font-semibold text-teal-800 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-teal-50 hover:shadow-2xl dark:border-teal-500/30 dark:bg-slate-900/95 dark:text-teal-300 dark:hover:bg-slate-800"
          >
            <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Rahmania AI</span>
            <span className="rounded bg-teal-100 px-1 py-0.2 font-mono text-[9px] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              Alt+A
            </span>
          </button>
          <button
            onClick={() => toggleFloatingBadge(false)}
            className="h-6 w-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            title="Hide floating trigger (Press Alt+A anytime to open)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 💬 Ultra-Luxurious AI Assistant Drawer / Modal */}
      {isOpen && (
        <div
          translate="no"
          className="notranslate fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
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
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                      Rahmania AI Assistant
                    </h3>
                    <Badge variant="outline" className="h-4 border-teal-500/30 px-1 text-[9px] font-semibold text-teal-700 dark:text-teal-300">
                      Zero-Trust
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {showSettings
                      ? (config.provider === "openrouter" ? "OpenRouter Multi-Model" : config.provider.toUpperCase())
                      : "ইনস্টিটিউট গাইড ও সহায়তা"}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {showSettings && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    title="AI Provider & Model Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="h-7 w-7 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  title="Clear Chat History"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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

            {/* ── MESSAGES BODY ── */}
            <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 text-sm scrollbar-thin">
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
          </div>
        </div>
      )}

      {/* AISettingsModal (Only accessible inside internal portals) */}
      {showSettings && (
        <AISettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          config={config}
          onSave={saveConfig}
        />
      )}
    </>
  );
}
