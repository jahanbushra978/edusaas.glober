"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, PlayCircle, X } from "lucide-react";
import { getTutorialForRoute } from "../../tutorials/pageTutorialRegistry";

export default function PageTutorialBanner({
  activeRouteKey = "analytics",
  onOpenTutorial,
  isGlobalEnabled = true,
  hasVideo = false,
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Key to store session-based dismissal per route
  const sessionKey = `edusaas_tutorial_banner_dismissed_${activeRouteKey}`;

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(sessionKey);
      setIsDismissed(dismissed === "true");
    } catch {
      setIsDismissed(false);
    }
  }, [activeRouteKey, sessionKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(sessionKey, "true");
    } catch {}
  };

  // If globally disabled by Super Admin or dismissed in this session, don't show
  if (!isGlobalEnabled || isDismissed) {
    return null;
  }

  const tutorial = getTutorialForRoute(activeRouteKey);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-emerald-700/40 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Background Islamic Geometric Subtle Accent */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute right-20 top-0 w-32 h-32 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Badge, Title & Purpose */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <BookOpen className="w-3 h-3 text-emerald-400" />
              {tutorial.badge}
            </span>
            <span className="text-[11px] text-emerald-200/80 font-medium">
              সহজ নির্দেশিকা
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white leading-tight">
            {tutorial.pageTitle}
          </h3>

          <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed font-normal">
            {tutorial.shortSummary}
          </p>
        </div>

        {/* Right: Action Button & Dismiss */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTutorial}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-950/30 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            title="কীভাবে এই মডিউল পরিচালনা করবেন তার বিস্তারিত গাইড পড়ুন"
          >
            <PlayCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>কীভাবে ব্যবহার করবেন? {hasVideo ? "(ভিডিও ও গাইড)" : "(গাইড পড়ুন)"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition cursor-pointer"
            title="এই সেশনের জন্য ব্যানারটি লুকান"
            aria-label="লুকান"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
