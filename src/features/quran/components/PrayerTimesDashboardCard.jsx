"use client";

import React, { useMemo } from "react";
import { Clock, Sun, Moon, Sunrise, Sunset, Bell } from "lucide-react";
import {
  calculateRealtimePrayerState,
  formatBangladeshClock,
} from "@/lib/quran/bangladesh-time";

export default function PrayerTimesDashboardCard({
  currentTime,
  sunTimes,
  isDay = false,
}) {
  const now = currentTime || new Date();

  // Calculate real-time prayer state
  const prayerState = useMemo(() => {
    return calculateRealtimePrayerState(now);
  }, [now]);

  // Timetable definition for the 5 daily prayers
  const PRAYER_CARDS = [
    {
      id: "fajr",
      name: "ফজর",
      arabic: "الفجر",
      time: "০৫:০২ AM",
      icon: Moon,
    },
    {
      id: "dhuhr",
      name: now.getDay() === 5 ? "পবিত্র জুমু'আ" : "যোহর",
      arabic: now.getDay() === 5 ? "الجمعة" : "الظهر",
      time: now.getDay() === 5 ? "০১:১৫ PM" : "১১:৪৬ AM",
      icon: Sun,
    },
    {
      id: "asr",
      name: "আসর",
      arabic: "العصر",
      time: "০৩:৪৪ PM",
      icon: Sun,
    },
    {
      id: "maghrib",
      name: "মাগরিব",
      arabic: "المغرب",
      time: "০৫:০৯ PM",
      icon: Sunset,
    },
    {
      id: "isha",
      name: "এশা",
      arabic: "العشاء",
      time: "০৬:২৪ PM",
      icon: Moon,
    },
  ];

  const activeId = prayerState?.activePrayer?.id || "dhuhr";

  return (
    <div
      className={`rounded-3xl border-2 transition-all duration-300 p-4 sm:p-5 shadow-xl space-y-3.5 relative overflow-hidden ${
        isDay
          ? "bg-[#FAF7F2] border-amber-600/40 text-stone-900 shadow-amber-950/10"
          : "bg-gradient-to-br from-[#0c2d27]/95 via-[#09221c]/95 to-[#061814]/95 border-teal-500/30 text-slate-100 shadow-teal-950/40"
      }`}
    >
      {/* Subtle Islamic arch corner accent */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/5 rounded-bl-full pointer-events-none" />

      {/* Header: Title & Next Prayer Countdown */}
      <div className="flex items-center justify-between gap-2 border-b pb-3 border-teal-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 text-teal-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-500 dark:text-amber-400">
              নামাজের সময়সূচি (ঢাকা ও পার্শ্ববর্তী)
            </h3>
            <p className="text-[11px] opacity-75 font-bold">
              {prayerState?.nextJamaatDisplay || "৫ ওয়াক্ত সালাত"}
            </p>
          </div>
        </div>

        {/* Dynamic Countdown Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-600 dark:text-amber-300 text-xs font-black shrink-0 animate-pulse">
          <Bell className="w-3.5 h-3.5" />
          <span>{prayerState?.countdownDisplay || "চলমান"}</span>
        </div>
      </div>

      {/* 5 Daily Prayers Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {PRAYER_CARDS.map((p) => {
          const isActive = activeId === p.id;
          const IconComp = p.icon;

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-2 sm:p-2.5 text-center flex flex-col items-center justify-between transition-all duration-200 border ${
                isActive
                  ? "bg-gradient-to-b from-teal-500/30 to-emerald-600/30 border-teal-400 ring-2 ring-teal-400/50 shadow-md scale-102"
                  : isDay
                  ? "bg-stone-100 border-amber-200/80 hover:bg-amber-50"
                  : "bg-black/25 border-teal-900/40 hover:bg-black/40"
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <IconComp
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-teal-300 animate-bounce"
                      : isDay
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                />
              </div>

              <span
                className={`text-[11px] sm:text-xs font-black truncate max-w-full ${
                  isActive
                    ? "text-teal-300 dark:text-teal-200 font-extrabold"
                    : isDay
                    ? "text-stone-800"
                    : "text-slate-200"
                }`}
              >
                {p.name}
              </span>

              <span
                className={`text-[9px] font-hafizi-quran opacity-80 ${
                  isActive ? "text-amber-300" : "text-slate-400"
                }`}
              >
                {p.arabic}
              </span>

              <span
                className={`text-[10px] sm:text-xs font-black mt-1 px-1 py-0.5 rounded ${
                  isActive
                    ? "bg-teal-400 text-slate-950 font-black shadow-xs"
                    : "text-amber-600 dark:text-amber-400 font-bold"
                }`}
              >
                {p.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sun Times & Sehri/Iftar Extra Info Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-teal-500/20 text-xs">
        <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-black/20 border border-teal-500/15">
          <Sunrise className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] opacity-75 block">সূর্যোদয়</span>
            <span className="font-bold text-slate-200">
              {sunTimes ? formatBangladeshClock(sunTimes.sunrise) : "০৬:১৯ AM"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-black/20 border border-teal-500/15">
          <Sunset className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] opacity-75 block">সূর্যাস্ত / ইফতার</span>
            <span className="font-bold text-slate-200">
              {sunTimes ? formatBangladeshClock(sunTimes.sunset) : "০৫:০৯ PM"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-black/20 border border-teal-500/15">
          <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] opacity-75 block">সাহরী শেষ</span>
            <span className="font-bold text-slate-200">০৫:০২ AM</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-black/20 border border-teal-500/15">
          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] opacity-75 block">ইশরাক সালাত</span>
            <span className="font-bold text-slate-200">০৬:৩৬ AM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
