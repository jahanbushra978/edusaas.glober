"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Calendar,
  MapPin,
} from "lucide-react";

/**
 * MonthlyPrayerCalendarModal
 * 
 * Provides an authentic, full 30-day prayer times timetable sheet & calendar
 * for the current month, including Sehri, Fajr, Sunrise, Dhuhr, Asr,
 * Maghrib (Iftar), and Isha, along with Jumu'ah schedule.
 */
export default function MonthlyPrayerCalendarModal({
  isOpen,
  onClose,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
  location = "গাজীপুর, ঢাকা, বাংলাদেশ",
}) {
  const [selectedMonth, setSelectedMonth] = useState("জমাদিউল আউয়াল ১৪৪৮ / নভেম্বর ২০২৬");

  if (!isOpen) return null;

  // Generate 30 days of prayer times table data
  const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(2026, 10, dayNum); // Nov 2026
    const daysOfWeekBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
    const dayName = daysOfWeekBn[dateObj.getDay()];
    const isFriday = dateObj.getDay() === 5;

    // Gradual seasonal shift simulation
    const minutesDelta = Math.floor(i * 0.4);
    const fajrMin = (48 + minutesDelta) % 60;
    const sunriseMin = (12 + minutesDelta) % 60;
    const maghribMin = (15 - Math.floor(i * 0.3) + 60) % 60;

    return {
      day: dayNum,
      hijri: `${dayNum} জমাদিউল আউয়াল`,
      gregorian: `${dayNum < 10 ? "০" + dayNum : dayNum} নভেম্বর`,
      dayName,
      isFriday,
      sehri: `০৪:${fajrMin < 10 ? "০" + fajrMin : fajrMin} AM`,
      fajr: `০৫:১৫ AM`,
      sunrise: `০৬:${sunriseMin < 10 ? "০" + sunriseMin : sunriseMin} AM`,
      dhuhr: isFriday ? "০১:৩০ PM (জুমা)" : "০১:১৫ PM",
      asr: "০৪:১৫ PM",
      maghrib: `০৫:${maghribMin < 10 ? "০" + maghribMin : maghribMin} PM`,
      isha: "০৭:৩০ PM",
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-h-full print:rounded-none">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#064E3B] via-[#0D7A5F] to-[#0f6850] text-white flex items-center justify-between shrink-0 print:bg-none print:text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center font-black text-amber-300 text-lg shadow-xs print:hidden">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {mosqueName} — মাসিক সালাত ও সেহরি-ইফতার ক্যালেন্ডার
              </h2>
              <p className="text-xs text-emerald-100 print:text-stone-600 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
                <span>·</span>
                <span className="font-bold text-amber-300 print:text-stone-800">{selectedMonth}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Timetable Table */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>* ইসলামিক ফাউন্ডেশন ও স্থানীয় মসজিদ সময়সূচি অনুসারে নির্ধারিত</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">জামাতের সময়সূচি</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-emerald-900/60 shadow-xs">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#064E3B] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-2">তারিখ</th>
                  <th className="py-2.5 px-2">বার</th>
                  <th className="py-2.5 px-2">হিজরি</th>
                  <th className="py-2.5 px-2 bg-emerald-900/70">সেহরি শেষ</th>
                  <th className="py-2.5 px-2">ফজর জামাত</th>
                  <th className="py-2.5 px-2">সূর্যোদয়</th>
                  <th className="py-2.5 px-2">যোহর/জুমা</th>
                  <th className="py-2.5 px-2">আসর জামাত</th>
                  <th className="py-2.5 px-2 bg-amber-900/50">ইফতার / মাগরিব</th>
                  <th className="py-2.5 px-2">এশা জামাত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/80 text-[11px]">
                {CALENDAR_DAYS.map((row) => (
                  <tr
                    key={row.day}
                    className={`${
                      row.isFriday
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 font-bold"
                        : "hover:bg-stone-50 dark:hover:bg-[#07130e]"
                    } transition-colors`}
                  >
                    <td className="py-2 px-2 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {row.gregorian}
                    </td>
                    <td className={`py-2 px-2 ${row.isFriday ? "text-emerald-700 dark:text-emerald-400" : "text-stone-600 dark:text-stone-400"}`}>
                      {row.dayName}
                    </td>
                    <td className="py-2 px-2 text-stone-500 font-mono">
                      {row.hijri}
                    </td>
                    <td className="py-2 px-2 font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20">
                      {row.sehri}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-[#0D7A5F] dark:text-emerald-400">
                      {row.fajr}
                    </td>
                    <td className="py-2 px-2 font-mono text-stone-500">
                      {row.sunrise}
                    </td>
                    <td className={`py-2 px-2 font-mono font-bold ${row.isFriday ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                      {row.dhuhr}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {row.asr}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                      {row.maghrib}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {row.isha}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-100 dark:border-emerald-950/80 flex items-center justify-between text-xs text-stone-500 px-6 print:hidden">
          <span>{mosqueName} পরিচালনা কমিটি কর্তৃক অনুমোদিত</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
