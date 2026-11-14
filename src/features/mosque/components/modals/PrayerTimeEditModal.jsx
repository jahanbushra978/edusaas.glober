"use client";
import React, { useState } from "react";
import { Clock, CheckCircle2, RotateCcw, X, AlertTriangle, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

export default function PrayerTimeEditModal({
  schedule = [],
  onClose,
  onSave,
  onReset,
}) {
  const [times, setTimes] = useState(
    schedule && schedule.length === 5
      ? schedule
      : [
          { id: "fajr", name: "ফজর", start: "০৪:৪৫ AM", jamaat: "০৫:১৫ AM" },
          { id: "dhuhr", name: "যোহর", start: "১১:৫৮ AM", jamaat: "০১:১৫ PM" },
          { id: "asr", name: "আসর", start: "০৪:০৫ PM", jamaat: "০৪:৪৫ PM" },
          { id: "maghrib", name: "মাগরিব", start: "০৫:৩৮ PM", jamaat: "০৫:৪৫ PM" },
          { id: "isha", name: "এশা", start: "০৬:৫০ PM", jamaat: "০৮:০০ PM" },
        ]
  );

  const [activeTab, setActiveTab] = useState("jamaat"); // "jamaat" | "prohibited" | "nafl"

  const handleChange = (id, field, value) => {
    setTimes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    if (onSave) onSave(times);
    toast.success("নামাজের সময়সূচি সফলভাবে সংরক্ষিত হয়েছে");
    onClose();
  };

  const handleReset = () => {
    if (onReset) onReset();
    toast.info("ডিফল্ট নামাজের সময়সূচি পুনঃস্থাপন করা হয়েছে");
    onClose();
  };

  // Prohibited / Makrooh prayer times according to Hanafi Fiqh
  const PROHIBITED_TIMES = [
    {
      title: "সূর্যোদয়ের সময়",
      arabic: "عند طلوع الشمس",
      duration: "সূর্যোদয় থেকে প্রায় ১৫-২০ মিনিট পর পর্যন্ত",
      reason: "সূর্য পূজকদের সাথে সামঞ্জস্য এড়াতে এই সময়ে ফরজ, ওয়াজিব ও নফল সর্বপ্রকার নামাজ সম্পূর্ণ নিষিদ্ধ।",
    },
    {
      title: "ঠিক দ্বিপ্রহরের সময় (নিসফুন নাহার)",
      arabic: "عند استواء الشمس",
      duration: "সূর্য ঠিক মাথার উপর থেকে পশ্চিমে ঢলে পড়ার পূর্ব মুহূর্ত পর্যন্ত (প্রায় ১০ মিনিট)",
      reason: "জাহান্নামের আগুনকে এই সময়ে তীব্র প্রজ্বলিত করা হয়। জুমার দিন ছাড়া অন্য দিন নফল পড়া মাকরূহে তাহরীমী।",
    },
    {
      title: "সূর্যাস্তের সময়",
      arabic: "عند غروب الشمس",
      duration: "সূর্য হলুদ বর্ণ ধারণ করার পর থেকে সম্পূর্ণ ডুবে যাওয়া পর্যন্ত (প্রায় ১৫-২০ মিনিট)",
      reason: "ঐ দিনের আসর কাযা না হয়ে থাকলে শুধু আসরের ফরজ ছাড়া অন্য কোনো নামাজ পড়া নিষিদ্ধ।",
    },
  ];

  // Nafl prayer timings
  const NAFL_TIMES = [
    { name: "তাহাজ্জুদ (قيام الليل)", waqt: "রাতের শেষ তৃতীয়াংশ থেকে সুবহে সাদিকের পূর্ব পর্যন্ত", virt: "আল্লাহর নৈকট্য অর্জনের শ্রেষ্ঠতম নফল সালাত।" },
    { name: "ইশরাক (صلاة الإشراق)", waqt: "সূর্যোদয়ের ১৫-২০ মিনিট পর থেকে দ্বিপ্রহরের পূর্ব পর্যন্ত", virt: "একটি পূর্ণ হজ্জ ও উমরার সাওয়াব অর্জিত হয়।" },
    { name: "চাশত / দুহা (صلاة الضحى)", waqt: "দিনের এক-চতুর্থাংশ অতিবাহিত হলে (সকাল ৯টা - ১১টা)", virt: "শরীরের ৩৬০টি জোড়ের সদকা আদায় হয়।" },
    { name: "আওয়াবীন (صلاة الأوابين)", waqt: "মাগরিবের পর থেকে এশার ওয়াক্ত শুরু হওয়া পর্যন্ত", virt: "আল্লাহমুখী বান্দাদের বিশেষ ক্ষমা ও মর্যাদা বৃদ্ধি।" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">নামাজের সময় ও জামাত নির্ধারণ</h2>
              <p className="text-xs text-emerald-100">মসজিদের জামাতের সঠিক সময়সূচি ও নিষিদ্ধ সময়</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("jamaat")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "jamaat"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>৫ ওয়াক্ত জামাত</span>
          </button>
          <button
            onClick={() => setActiveTab("prohibited")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "prohibited"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>নিষিদ্ধ সময়</span>
          </button>
          <button
            onClick={() => setActiveTab("nafl")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "nafl"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white dark:bg-emerald-950/40 text-stone-600 dark:text-stone-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>নফল সালাত</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "jamaat" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                💡 <b>পরামর্শ:</b> আপনার মসজিদের স্থানীয় জামাত সময় অনুযায়ী পরিবর্তন করুন। পরিবর্তন সাথে সাথে ড্যাশবোর্ডে আপডেট হবে।
              </div>

              <div className="space-y-2.5">
                {times.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm">
                        {p.name.charAt(0)}
                      </div>
                      <span className="font-black text-sm text-stone-900 dark:text-stone-100">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:w-28">
                        <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">ওয়াক্ত শুরু</label>
                        <input
                          type="text"
                          value={p.start}
                          onChange={(e) => handleChange(p.id, "start", e.target.value)}
                          className="w-full text-xs font-bold px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-emerald-700/60 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex-1 sm:w-28">
                        <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1 font-bold text-emerald-700 dark:text-emerald-400">
                          জামাত সময়
                        </label>
                        <input
                          type="text"
                          value={p.jamaat}
                          onChange={(e) => handleChange(p.id, "jamaat", e.target.value)}
                          className="w-full text-xs font-black px-2.5 py-1.5 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "prohibited" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                ⚠️ <b>হানাফী ফিকহ অনুযায়ী সালাতের ৩টি নিষিদ্ধ সময়:</b> এই ৩টি সময়ে যেকোনো নামাজ আদায় করা সম্পূর্ণ নিষিদ্ধ বা মাকরূহে তাহরীমী।
              </div>

              {PROHIBITED_TIMES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-amber-200 dark:border-amber-900/50 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>{item.title}</span>
                    </h3>
                    <span className="text-xs font-serif font-bold text-amber-700 dark:text-amber-400">{item.arabic}</span>
                  </div>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    ⏱️ সময়কাল: <span className="text-amber-700 dark:text-amber-400">{item.duration}</span>
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "nafl" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200">
                🌙 <b>দৈনন্দিন গুরুত্বপূর্ণ নফল সালাতের সময়সূচি ও ফযীলত:</b>
              </div>

              {NAFL_TIMES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{item.name}</h3>
                  </div>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    🕒 সময়: <span className="text-teal-700 dark:text-teal-400">{item.waqt}</span>
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    ✨ ফযীলত: {item.virt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-emerald-950/70 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট সময়</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-emerald-950/70 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
