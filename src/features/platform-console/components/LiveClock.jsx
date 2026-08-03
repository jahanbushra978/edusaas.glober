'use client'

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export default function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex items-center gap-2 text-teal-400 font-mono text-base font-bold">
        <Clock size={18} className="text-teal-400 animate-pulse" />
        <span>{time || "00:00:00 AM"}</span>
      </div>
      <div className="h-4 w-px bg-slate-700 hidden sm:block" />
      <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
        <Calendar size={15} className="text-amber-400" />
        <span>{date || "Loading date..."}</span>
      </div>
    </div>
  );
}
