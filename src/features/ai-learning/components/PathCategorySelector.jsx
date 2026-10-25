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
    { id: "progress", label: t.paths.progress, icon: BarChart3, badge: t.badges?.progress || "Report" },
  ];

  return (
    <div
      dir={dir}
      className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none"
    >
      {paths.map((p) => {
        const Icon = p.icon;
        const isActive = activePath === p.id;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPath(p.id)}
            className={`px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              isActive
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-300 scale-105"
                : "bg-[#091a14]/80 text-slate-300 border-emerald-900/50 hover:bg-emerald-950/80 hover:text-emerald-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{p.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isActive ? "bg-black/30 text-amber-300" : "bg-slate-800 text-slate-400"
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
