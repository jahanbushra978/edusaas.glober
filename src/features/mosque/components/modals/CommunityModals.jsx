"use client";
import React, { useState } from "react";
import {
  Award,
  Video,
  ShieldCheck,
  Building,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Plus,
  Copy,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "sonner";

async function copyText(text, msg = "কপি করা হয়েছে") {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
      return;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    toast.success(msg);
  } catch {
    toast.error("কপি করা সম্ভব হয়নি");
  }
}

// ── 1. NAMES OF ALLAH (ASMAUL HUSNA) MODAL ──
export function NamesOfAllahModal({ onClose }) {
  const [search, setSearch] = useState("");

  const NAMES = [
    { id: 1, arabic: "الرَّحْمَنُ", bangla: "আর-রহমান", meaning: "পরম দয়ালু", significance: "যিনি সমগ্র সৃষ্টির ওপর সীমাহীন অনুগ্রহ বর্ষণকারী।" },
    { id: 2, arabic: "الرَّحِيمُ", bangla: "আর-রহীম", meaning: "অতিশয় মেহেরবান", significance: "মুমিনদের জন্য আখিরাতে বিশেষ রহমতকারী।" },
    { id: 3, arabic: "الْمَلِكُ", bangla: "আল-মালিক", meaning: "সার্বভৌম ক্ষমতার অধিকারী", significance: "সমগ্র আসমান ও জমিনের একমাত্র অধিপতি ও প্রকৃত বাদশাহ।" },
    { id: 4, arabic: "الْقُدُّوسُ", bangla: "আল-কুদ্দুস", meaning: "মহাপবিত্র ও নিষ্কলুষ", significance: "সমস্ত দোষ-ত্রুটি ও দুর্বলতা থেকে মুক্ত।" },
    { id: 5, arabic: "السَّلاَمُ", bangla: "আস-সালাম", meaning: "শান্তিদাতা ও নিরাপত্তাদায়ক", significance: "যাঁর পক্ষ হতে সকল শান্তি অবতীর্ণ হয়।" },
    { id: 6, arabic: "الْمُؤْمِنُ", bangla: "আল-মু'মিন", meaning: "ঈমান ও নিরাপত্তা দানকারী", significance: "যিনি বান্দাকে ভয়-ভীতি হতে নিরাপত্তা দান করেন।" },
    { id: 7, arabic: "الْمُهَيْمِنُ", bangla: "আল-মুহাইমিন", meaning: "রক্ষক ও প্রত্যক্ষদর্শী", significance: "যিনি সকল কিছুর সার্বিক তত্ত্বাবধায়ক ও সংরক্ষক।" },
    { id: 8, arabic: "الْعَزِيزُ", bangla: "আল-আযীয", meaning: "পরাক্রমশালী ও অপরাজেয়", significance: "যাঁর ক্ষমতার সামনে সমস্ত শক্তি পদানত।" },
    { id: 9, arabic: "الْجَبَّارُ", bangla: "আল-জাব্বার", meaning: "মহাপ্রতাপশালী ও সংস্কারক", significance: "যাঁর ইচ্ছার বিরুদ্ধে কারও কোনো প্রতিরোধ চলে না।" },
    { id: 10, arabic: "الْمُتَكَبِّرُ", bangla: "আল-মুতাকাব্বির", meaning: "সর্বশ্রেষ্ঠ গৌরবান্বিত", significance: "সমস্ত অহংকার ও মহত্ত্ব একমাত্র যাঁরই শোভা পায়।" },
    { id: 11, arabic: "الْخَالِقُ", bangla: "আল-খালিক", meaning: "একক সৃষ্টিকর্তা", significance: "যিনি শূন্য হতে সমগ্র সৃষ্টি অস্তিত্বে এনেছেন।" },
    { id: 12, arabic: "الْبَارِئُ", bangla: "আল-বারি", meaning: "নিখুঁত কারিগর", significance: "যিনি সৃষ্টির প্রতিটি অংশে সুষম আকার ও ভারসাম্য দান করেছেন।" },
    { id: 13, arabic: "الْمُصَوِّرُ", bangla: "আল-মুসাওয়ির", meaning: "রূপদানকারী ও রূপকার", significance: "যিনি প্রতিটি বস্তুকে অনন্য রূপ ও গঠন দান করেছেন।" },
    { id: 14, arabic: "الْغَفَّارُ", bangla: "আল-গাফফার", meaning: "মহাক্ষমাশীল", significance: "যিনি বারবার গুনাহ সত্ত্বেও বান্দাকে ক্ষমা করে দেন।" },
    { id: 15, arabic: "الْقَهَّارُ", bangla: "আল-কাহ্হার", meaning: "সর্বজয়ী ও কঠোর নিয়ন্ত্রক", significance: "যাঁর অধীনতা স্বীকারে সমগ্র বিশ্ব বাধ্য।" },
    { id: 16, arabic: "الْوَهَّابُ", bangla: "আল-ওয়াহ্হাব", meaning: "বিনা প্রতিদানে দানকারী", significance: "যিনি বিনিময় ছাড়া অফুরন্ত নেয়ামত বিলিয়ে দেন।" },
    { id: 17, arabic: "الرَّزَّاقُ", bangla: "আর-রাযযাক", meaning: "রিজিকদাতা ও জীবিকা প্রদানকারী", significance: "যিনি প্রতিটি ক্ষুদ্রাতিক্ষুদ্র প্রাণীর খাদ্যের ব্যবস্থা করেন।" },
    { id: 18, arabic: "الْفَتَّاحُ", bangla: "আল-ফাত্তাহ", meaning: "বিজয়দাতা ও উন্মোচনকারী", significance: "যিনি রহমত ও বন্ধ ভাগ্যের দুয়ার খুলে দেন।" },
    { id: 19, arabic: "الْعَلِيمُ", bangla: "আল-আলীম", meaning: "সর্বজ্ঞানী ও সর্বজ্ঞ", significance: "অদৃশ্য ও দৃশ্যমান সমস্ত কিছুর পূর্ণ জ্ঞান যাঁর নিকট স্পষ্ট।" },
    { id: 20, arabic: "الْقَابِضُ", bangla: "আল-কাবিদ", meaning: "সংকোচনকারী", significance: "যিনি পরীক্ষার জন্য রিজিক ও রুহ সংকুচিত করেন।" }
  ];

  const filtered = NAMES.filter(
    (n) =>
      n.bangla.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase()) ||
      n.arabic.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">আসমাউল হুসনা — আল্লাহর ৯৯টি পবিত্র নাম</h2>
              <p className="text-xs text-emerald-100">রাসূলুল্লাহ (সা.) বলেছেন: যে ব্যক্তি এগুলো আয়ত্ত করবে সে জান্নাতে প্রবেশ করবে</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="পবিত্র নাম বা বাংলা অর্থ দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Names Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex flex-col justify-between shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center">
                  {item.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-serif font-bold text-emerald-900 dark:text-emerald-300" dir="rtl">
                    {item.arabic}
                  </span>
                  <button
                    onClick={() => copyText(`${item.arabic} - ${item.bangla} (${item.meaning})`)}
                    className="text-stone-400 hover:text-emerald-600 p-0.5 cursor-pointer"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="font-bold text-xs text-stone-900 dark:text-stone-100">{item.bangla}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{item.meaning}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight pt-1 border-t border-stone-100 dark:border-emerald-950">
                {item.significance}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2. LIVE STREAM MODAL (WITH REAL HARAMAIN 24/7 STREAM EMBED) ──
export function LiveStreamModal({ onClose }) {
  const [stream, setStream] = useState("makkah");

  // Official Saudi Arabia Haramain 24/7 live streams on YouTube
  const streamUrls = {
    makkah: {
      embed: "https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&playsinline=1",
      direct: "https://www.youtube.com/results?search_query=makkah+live+now",
      title: "পবিত্র মসজিদুল হারাম (মক্কা মুকাররমা)",
      desc: "কা'বা শরীফ তাওয়াফ, আজান ও ৫ ওয়াক্ত সালাত সরাসরি সম্প্রচার",
    },
    madinah: {
      embed: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCciFw3sE1O6y5ZfF6BqW7bQ&autoplay=1&mute=1&playsinline=1",
      direct: "https://www.youtube.com/results?search_query=madinah+live+now",
      title: "পবিত্র মসজিদে নববী (মদিনা মুনাওয়ারা)",
      desc: "রওজা শরীফ যিয়ারত, রিয়াদুল জান্নাহ ও সালাত সরাসরি সম্প্রচার",
    },
  };

  const current = streamUrls[stream];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মক্কা ও মদিনা লাইভ সম্প্রচার</h2>
              <p className="text-xs text-emerald-100">পবিত্র হারামাইন শরিফাইনের ২৪/৭ সরাসরি সম্প্রচার</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <button
            onClick={() => setStream("makkah")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              stream === "makkah" ? "bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <span>🕋</span>
            <span>মসজিদুল হারাম (মক্কা)</span>
          </button>
          <button
            onClick={() => setStream("madinah")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              stream === "madinah" ? "bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
            }`}
          >
            <span>🕌</span>
            <span>মসজিদে নববী (মদিনা)</span>
          </button>
        </div>

        {/* Real Live Stream Player */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-center">
          <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-emerald-900 relative">
            <iframe
              src={current.embed}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-left text-xs">
            <div>
              <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>{current.title}</span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{current.desc}</p>
            </div>
            <a
              href={current.direct}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-xs"
            >
              <span>ইউটিউবে খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. ADMIN PANEL MODAL ──
export function AdminPanelModal({ onClose, onOpenMasterDues, onOpenFunds }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "committee" | "notice"
  const [notices, setNotices] = useState([
    { id: "1", title: "আগামী জুমার বয়ানের বিষয়: হালাল রিজিক ও পরিবারের হক", date: "১৩ নভেম্বর ২০২৬", author: "মসজিদ কমিটি" },
    { id: "2", title: "নূরানী মক্তবের বার্ষিক পরীক্ষার সময়সূচি ঘোষণা", date: "১০ নভেম্বর ২০২৬", author: "প্রধান শিক্ষক" },
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");

  const COMMITTEE = [
    { name: "হাজী মুহাম্মদ আব্দুল্লাহ", role: "মুতাওয়াল্লী / সভাপতি", phone: "০১৭১১-২২৩৩৪৪" },
    { name: "হাজী রফিকুল ইসলাম", role: "সহ-সভাপতি", phone: "০১৮১৯-১১২২৩৩" },
    { name: "জনাব শাহিনুর রহমান", role: "সাধারণ সম্পাদক ও কোষাধ্যক্ষ", phone: "০১৭২১-৯৯৮৮৭৭" },
    { name: "মাওলানা মাহমুদ হাসান", role: "খতীব ও পেশ ইমাম", phone: "০১৯১১-৪৪৫৫৬৬" },
  ];

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    const n = {
      id: String(Date.now()),
      title: newNoticeTitle.trim(),
      date: "আজকের তারিখ",
      author: "অ্যাডমিন",
    };
    setNotices([n, ...notices]);
    setNewNoticeTitle("");
    toast.success("নতুন নোটিশ মসজিদে সফলভাবে প্রকাশ করা হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মসজিদ অ্যাডমিন ও কমিটি প্যানেল</h2>
              <p className="text-xs text-emerald-100">হিসাবরক্ষণ, কমিটি তালিকা ও মসজিদ নোটিশ বোর্ড</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0">
          {[
            { key: "overview", label: "📊 সংক্ষিপ্ত ড্যাশবোর্ড" },
            { key: "committee", label: "👥 পরিচালনা কমিটি" },
            { key: "notice", label: "📢 নোটিশ বোর্ড" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === t.key
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === "overview" && (
            <>
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">মোট নিবন্ধিত মুসাল্লি</span>
                  <div className="text-xl font-black font-mono text-emerald-800 dark:text-emerald-300">১২০ জন</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">চলতি মাসের আদায়</span>
                  <div className="text-xl font-black font-mono text-amber-800 dark:text-amber-300">৳৯৪,০০০</div>
                </div>
              </div>

              {/* Action List */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 dark:text-stone-200">দ্রুত এক্সেস মেনু:</h4>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenMasterDues) onOpenMasterDues();
                  }}
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-left hover:border-emerald-500 transition cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📊</span>
                    <div>
                      <b className="text-stone-900 dark:text-stone-100">মাসিক চাঁদা ও বকেয়া হিসাব শিট</b>
                      <p className="text-[11px] text-stone-500">কার কত জমা ও বাকি বিস্তারিত দেখুন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenFunds) onOpenFunds();
                  }}
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-left hover:border-emerald-500 transition cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">💰</span>
                    <div>
                      <b className="text-stone-900 dark:text-stone-100">মসজিদ তহবিল ও খরচ ভাউচার</b>
                      <p className="text-[11px] text-stone-500">৪টি স্বতন্ত্র ফান্ডের স্থিতি ও খরচ অনুমোদন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </>
          )}

          {activeTab === "committee" && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-stone-800 dark:text-stone-200">মসজিদ পরিচালনা কমিটির নেতৃবৃন্দ:</h4>
              {COMMITTEE.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{c.name}</h5>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">{c.role}</p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{c.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notice" && (
            <div className="space-y-3">
              <form onSubmit={handleAddNotice} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">নতুন নোটিশ প্রকাশ করুন:</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="নোটিশের শিরোনাম লিখুন..."
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    className="flex-1 text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>প্রকাশ</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {notices.map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1 shadow-2xs">
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">{n.title}</h5>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400">
                      <span>প্রকাশক: {n.author}</span>
                      <span>{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. FUNDS & EXPENSES MODAL (WITH LOCALSTORAGE PERSISTENCE) ──
const DEFAULT_FUNDS_LIST = [
  { id: "general", name: "সাধারণ পরিচালন ফান্ড", balance: 284500, target: 400000, desc: "বিদ্যুৎ বিল, গ্যাস, পরিষ্কার-পরিচ্ছন্নতা ও দৈনিক খরচ" },
  { id: "construction", name: "নির্মাণ ও সংস্কার ফান্ড", balance: 650000, target: 1200000, desc: "মসজিদ সম্প্রসারণ ও দ্বিতীয় তলার ছাদ ঢালাই" },
  { id: "salary", name: "ইমাম-মুয়াজ্জিন হাদিয়া ফান্ড", balance: 145000, target: 200000, desc: "খতীব, ইমাম ও মুয়াজ্জিন সাহেবের মাসিক হাদিয়া ও ভাতা" },
  { id: "zakat", name: "যাকাত ও সমাজকল্যাণ ফান্ড", balance: 88000, target: 150000, desc: "এলাকার দুস্থ, অসহায় ও চিকিৎসা সহায়তায় ব্যয়" },
];

const DEFAULT_EXPENSES_LIST = [
  { id: "e1", title: "অক্টোবর মাসের বিদ্যুৎ বিল", fund: "সাধারণ পরিচালন ফান্ড", amount: 14200, date: "০২ নভেম্বর ২০২৬", status: "অনুমোদিত" },
  { id: "e2", title: "সাউন্ড সিস্টেম সংস্কার ও মাইক কেবল", fund: "নির্মাণ ও সংস্কার ফান্ড", amount: 4800, date: "২৮ অক্টোবর ২০২৬", status: "অনুমোদিত" },
  { id: "e3", title: "ইমাম সাহেবের মাসিক হাদিয়া", fund: "ইমাম-মুয়াজ্জিন হাদিয়া ফান্ড", amount: 25000, date: "০১ নভেম্বর ২০২৬", status: "অনুমোদিত" },
];

export function FundsModal({ onClose }) {
  const [funds, setFunds] = useState(() => {
    try {
      const saved = localStorage.getItem("mosque_funds_data");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_FUNDS_LIST;
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("mosque_expenses_data");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EXPENSES_LIST;
  });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expFund, setExpFund] = useState("সাধারণ পরিচালন ফান্ড");

  const totalTreasury = funds.reduce((acc, f) => acc + (f.balance || 0), 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmt) return;
    const num = Number(expAmt);
    const newExp = {
      id: String(Date.now()),
      title: expTitle.trim(),
      fund: expFund,
      amount: num,
      date: "আজকের তারিখ",
      status: "অনুমোদিত",
    };
    const nextExpenses = [newExp, ...expenses];
    const nextFunds = funds.map((f) =>
      f.name === expFund ? { ...f, balance: Math.max(0, f.balance - num) } : f
    );

    setExpenses(nextExpenses);
    setFunds(nextFunds);

    try {
      localStorage.setItem("mosque_expenses_data", JSON.stringify(nextExpenses));
      localStorage.setItem("mosque_funds_data", JSON.stringify(nextFunds));
    } catch {}

    setExpTitle("");
    setExpAmt("");
    setShowAddExpense(false);
    toast.success("খরচ সফলভাবে এন্ট্রি ও ব্যালেন্স থেকে কর্তন করা হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মসজিদ তহবিল ও ৪টি স্বতন্ত্র ফান্ড</h2>
              <p className="text-xs text-emerald-100">আইসোলেটেড ব্যালেন্স ও খরচের হিসাব</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Treasury Banner */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">মসজিদের সর্বমোট কোষাগার ব্যালেন্স:</span>
            <div className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">
              ৳{totalTreasury.toLocaleString("bn-BD")}
            </div>
          </div>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন খরচ এন্ট্রি</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-emerald-300 dark:border-emerald-700 space-y-2 shadow-sm">
              <h4 className="font-bold text-stone-900 dark:text-stone-100">নতুন মসজিদ খরচ ভাউচার এন্ট্রি:</h4>
              <input
                type="text"
                placeholder="খরচের বিবরণ (যেমন: লাইট ও ফ্যান মেরামত)..."
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="পরিমাণ (৳)"
                  value={expAmt}
                  onChange={(e) => setExpAmt(e.target.value)}
                  className="w-32 text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
                />
                <select
                  value={expFund}
                  onChange={(e) => setExpFund(e.target.value)}
                  className="flex-1 text-xs font-bold px-2 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">
                  সংরক্ষণ
                </button>
              </div>
            </form>
          )}

          {/* 4 Funds Cards */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-stone-800 dark:text-stone-200">৪টি স্বতন্ত্র তহবিল:</h4>
            {funds.map((f) => {
              const pct = Math.min(100, Math.round(((f.balance || 0) / (f.target || 1)) * 100));
              return (
                <div key={f.id} className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{f.name}</span>
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                      ৳{(f.balance || 0).toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{f.desc}</p>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-emerald-950 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Expenses List */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950">
            <h4 className="font-bold text-stone-800 dark:text-stone-200">সাম্প্রতিক খরচের তালিকা:</h4>
            {expenses.map((e) => (
              <div key={e.id} className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{e.title}</span>
                  <p className="text-[11px] text-stone-500">{e.fund} · {e.date}</p>
                </div>
                <span className="font-mono font-black text-red-600 dark:text-red-400">
                  -৳{Number(e.amount || 0).toLocaleString("bn-BD")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
