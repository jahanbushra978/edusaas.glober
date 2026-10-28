"use client";

import React from "react";
import {
  Bot,
  BookOpen,
  Eye,
  Award,
  Bookmark,
  RotateCcw,
  BarChart3,
  Gamepad2,
} from "lucide-react";
import { useLearningLanguage } from "../hooks/useLearningLanguage";

export default function PathCategorySelector({ activePath, onSelectPath }) {
  const { t, dir } = useLearningLanguage();

  const paths = [
    { id: "qaida", label: t.paths.qaida, icon: BookOpen, badge: t.badges?.qaida || "12" },
    { id: "teacher", label: t.paths.teacher, icon: Bot, badge: t.badges?.teacher || "Live" },
    { id: "nazera", label: t.paths.nazera, icon: Eye, badge: t.badges?.nazera || "114" },
    { id: "tajweed", label: t.paths.tajweed, icon: Award, badge: t.badges?.tajweed || "17" },
    { id: "hifz", label: t.paths.hifz, icon: Bookmark, badge: t.badges?.hifz || "Hifz" },
    { id: "murajaah", label: t.paths.murajaah, icon: RotateCcw, badge: t.badges?.murajaah || "Dour" },
    { id: "games", label: t.paths.games || "খেলে শিখি (গেমস)", icon: Gamepad2, badge: t.badges?.games || "গেম" },
    { id: "progress", label: t.paths.progress, icon: BarChart3, badge: t.badges?.progress || "Report" },
  ];

  return (
    <div
      dir={dir}
      className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none py-1"
    >
      {paths.map((p) => {
        const Icon = p.icon;
        const isActive = activePath === p.id;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPath(p.id)}
            className={`px-3.5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border active:scale-95 ${
              isActive
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md shadow-emerald-950/20 scale-102 ring-2 ring-emerald-400/30 font-extrabold"
                : "bg-white/90 dark:bg-[#0c241a]/90 text-slate-700 dark:text-slate-200 border-emerald-100 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 hover:text-emerald-900 dark:hover:text-emerald-200 shadow-xs"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
            <span>{p.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                isActive 
                  ? "bg-white/20 text-white" 
                  : "bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/60"
              }`}
            >
              {p.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
