"use client";
import React, { useState, useEffect } from "react";
import {
  Compass,
  CheckCircle2,
  X,
  RotateCcw,
  Volume2,
  Copy,
  Calendar,
  Award,
  ChevronRight,
  MapPin,
  Clock,
  Heart,
  Moon,
  Sun,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

async function copyText(text, msg = "দো'আটি কপি করা হয়েছে") {
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

// ── 1. DUA MODAL ──
export function DuaModal({ onClose }) {
  const [category, setCategory] = useState("সকাল-সন্ধ্যা");
  const [search, setSearch] = useState("");

  const DUAS = [
    {
      id: 1,
      category: "সকাল-সন্ধ্যা",
      title: "সাইয়্যিদুল ইস্তিগফার (শ্রেষ্ঠ ক্ষমা প্রার্থনা)",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
      pronunciation: "আল্লাহুম্মা আনতা রব্বী, লা ইলাহা ইল্লা আনতা, খলাক্বতানী ওয়া আনা আবদুকা, ওয়া আনা আলা আহদিকা ওয়া ওয়া'দিকা মাস্তাত্বা'তু, আ'ঊযু বিকা মিন শাররি মা ছনা'তু, আবূউ লাকা বিনি'মাতিকা আলাইয়্যা, ওয়া আবূউ বিযানবী, ফাগফির লী, ফাইন্নাহূ লা ইয়্যগফিরুয যুনূবা ইল্লা আনতা।",
      meaning: "হে আল্লাহ! আপনি আমার পালনকর্তা। আপনি ব্যতীত কোনো সত্য উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি আমার সাধ্যানুযায়ী আপনার প্রতিশ্রুতিতে অটল আছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে আপনার আশ্রয় চাই। আমার প্রতি আপনার নেয়ামত স্বীকার করছি এবং আমার গুনাহও স্বীকার করছি। অতএব আমাকে ক্ষমা করুন, কারণ আপনি ছাড়া গুনাহ ক্ষমা করার কেউ নেই।",
      reference: "সহীহ বুখারী: ৬৩০৬",
      benefit: "যে ব্যক্তি সন্ধ্যায় বিশ্বাসসহ এটি পড়বে এবং ঐ রাতে মারা যাবে, সে জান্নাতবাসী হবে। সকালে পড়লে সারাদিন আল্লাহর নিরাপত্তায় থাকবে।"
    },
    {
      id: 2,
      category: "ঘুম ও জাগরণ",
      title: "ঘুম থেকে জাগ্রত হওয়ার দো'আ",
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
      pronunciation: "আলহামদু লিল্লাহিল্লাযী আহইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশূর।",
      meaning: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদেরকে মৃত্যুর পর পুনরায় জীবিত করলেন এবং তাঁর দিকেই সবার পুনরুত্থান ঘটবে।",
      reference: "সহীহ বুখারী: ৬৩১২",
      benefit: "জীবনের নতুন দিন আল্লাহর শুকরিয়া দিয়ে শুরু করার সুন্নাত।"
    },
    {
      id: 3,
      category: "মসজিদ ও ঘর",
      title: "মসজিদে প্রবেশ করার দো'আ",
      arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
      pronunciation: "আল্লাহুম্মাফ তাহলী আবওয়াবা রহমাতিক।",
      meaning: "হে আল্লাহ! আমার জন্য আপনার রহমতের সকল দরজা খুলে দিন।",
      reference: "সহীহ মুসলিম: ৭১৩",
      benefit: "ডান পা দিয়ে মসজিদে প্রবেশের সময় দুরুদসহ এই দো'আ পাঠে রহমত বর্ষিত হয়।"
    },
    {
      id: 4,
      category: "মসজিদ ও ঘর",
      title: "ঘর থেকে বের হওয়ার দো'আ",
      arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
      pronunciation: "বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহ, লা হাওলা ওয়া লা কুওয়াতা ইল্লা বিল্লাহ।",
      meaning: "আল্লাহর নামে, আল্লাহর উপরই ভরসা করলাম। আল্লাহর সাহায্য ব্যতীত কোনো পাপ থেকে বাঁচার এবং সৎকাজ করার শক্তি নেই।",
      reference: "আবু দাউদ: ৫০৯৫",
      benefit: "শয়তান দূরে সরে যায় এবং ফেরেশতাগণ বলেন: তুমি সঠিক পথপ্রাপ্ত হলে এবং নিরাপদ রইলে।"
    },
    {
      id: 5,
      category: "বিপদ ও ঋণমুক্তি",
      title: "দুশ্চিন্তা ও ঋণ মুক্তির দো'আ",
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
      pronunciation: "আল্লাহুম্মা ইন্নী আ'ঊযু বিকা মিনাল হামমি ওয়াল হাযান, ওয়াল 'আজযি ওয়াল কাসাল, ওয়াল বুখলি ওয়াল জুবন, ওয়া দ্বলা'ইদ দাইনি ওয়া গলাবাতির রিজাল।",
      meaning: "হে আল্লাহ! আমি আপনার আশ্রয় চাই দুশ্চিন্তা ও পেরেশানি থেকে, অক্ষমতা ও অলসতা থেকে, কৃপণতা ও কাপুরুষতা থেকে, ঋণের বোঝা ও মানুষের প্রাধান্য বা চাপ থেকে।",
      reference: "সহীহ বুখারী: ২৮৯৩",
      benefit: "রাসূলুল্লাহ (সা.) প্রতিদিন সকাল-সন্ধ্যা এই দো'আটি পাঠ করতেন।"
    }
  ];

  const categories = ["সকাল-সন্ধ্যা", "ঘুম ও জাগরণ", "মসজিদ ও ঘর", "বিপদ ও ঋণমুক্তি"];

  const filtered = DUAS.filter((d) => {
    const matchCat = d.category === category;
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.meaning.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <span className="text-xl">🤲</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মাসনূন দু'আ ও মুনাজাত</h2>
              <p className="text-xs text-emerald-100">প্রাত্যহিক জীবনের প্রয়োজনীয় সহীহ দু'আসমূহ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                category === c
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Duas List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{item.title}</h3>
                <button
                  onClick={() => copyText(`${item.arabic}\n\n${item.pronunciation}\n\nঅর্থ: ${item.meaning}`)}
                  className="text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 cursor-pointer"
                  title="কপি করুন"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 text-right">
                <p className="text-base sm:text-lg font-serif font-bold text-emerald-950 dark:text-emerald-200 leading-loose" dir="rtl">
                  {item.arabic}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-stone-600 dark:text-stone-400 font-medium">
                  <span className="font-bold text-stone-700 dark:text-stone-300">উচ্চারণ:</span> {item.pronunciation}
                </p>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-semibold">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">অর্থ:</span> {item.meaning}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-emerald-950/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>📚 সনদ: {item.reference}</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold">✨ ফযীলত</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg">
                {item.benefit}
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

// ── 2. TASBEEH MODAL ──
export function TasbeehModal({ onClose }) {
  const ADHKAR = [
    { ar: "سُبْحَانَ اللَّهِ", bn: "সুবহানাল্লাহ (আল্লাহ মহাপবিত্র)", target: 33 },
    { ar: "الْحَمْدُ لِلَّهِ", bn: "আলহামদুলিল্লাহ (সকল প্রশংসা আল্লাহর)", target: 33 },
    { ar: "اللَّهُ أَكْبَرُ", bn: "আল্লাহু আকবার (আল্লাহ সর্বশ্রেষ্ঠ)", target: 34 },
    { ar: "أَسْتَغْفِرُ اللَّهَ", bn: "আস্তাগফিরুল্লাহ (আমি আল্লাহর ক্ষমা চাই)", target: 100 },
    { ar: "لَا إِلٰهَ إِلَّا اللَّهُ", bn: "লা ইলাহা ইল্লাল্লাহ (আল্লাহ ছাড়া সত্য উপাস্য নেই)", target: 100 },
    { ar: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", bn: "দরূদ শরীফ (রাসূলুল্লাহ সা. এর উপর শান্তি বর্ষিত হোক)", target: 100 },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const dhikr = ADHKAR[selectedIdx] || ADHKAR[0];

  const handleIncrement = () => {
    const next = count + 1;
    setCount(next);
    setTotalCount((t) => t + 1);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(25);
    }
    if (next >= dhikr.target) {
      toast.success(`${dhikr.ar} পাঠের লক্ষ্যমাত্রা (${dhikr.target} বার) পূর্ণ হয়েছে! আলহামদুলিল্লাহ!`);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📿</span>
            <h2 className="text-base font-black tracking-wide">ডিজিটাল তাসবীহ গণক</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Adhkar Picker */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 overflow-x-auto scrollbar-none">
          {ADHKAR.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIdx(i);
                setCount(0);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedIdx === i
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {a.ar}
            </button>
          ))}
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-black text-emerald-800 dark:text-emerald-300">{dhikr.ar}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-semibold">{dhikr.bn}</p>
          </div>

          {/* Big Circular Counter Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={handleIncrement}
              className="w-44 h-44 rounded-full bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-xl flex flex-col items-center justify-center active:scale-95 transition-transform duration-100 ring-8 ring-emerald-100 dark:ring-emerald-950/70 cursor-pointer select-none"
            >
              <span className="text-5xl font-black font-mono tracking-tight">{count}</span>
              <span className="text-xs text-emerald-100 font-bold mt-1">লক্ষ্য: {dhikr.target}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-2">
            <span>সর্বমোট গণনাকৃত: <b className="text-emerald-700 dark:text-emerald-300">{totalCount}</b></span>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3. AMAL TRACKER MODAL ──
export function AmalTrackerModal({ onClose }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [record, setRecord] = useState({
    fajr: "none",
    dhuhr: "none",
    asr: "none",
    maghrib: "none",
    isha: "none",
    quranPages: 0,
    adhkar: false,
    sadaqah: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`mosque_amal_${todayStr}`);
      if (saved) setRecord(JSON.parse(saved));
    } catch {}
  }, [todayStr]);

  const update = (patch) => {
    setRecord((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(`mosque_amal_${todayStr}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Calculate score (0-100%)
  let pts = 0;
  ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach((w) => {
    if (record[w] === "jamat") pts += 15;
    else if (record[w] === "alone") pts += 10;
  });
  if (record.quranPages > 0) pts += 10;
  if (record.adhkar) pts += 10;
  if (record.sadaqah) pts += 5;
  const score = Math.min(100, pts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">দৈনিক আমল ট্রাকার</h2>
              <p className="text-xs text-emerald-100">আজকের ৫ ওয়াক্ত সালাত ও আমলের হিসাব</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Score Progress Bar */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1.5">
            <span>আজকের আমল স্কোর:</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{score}% সম্পন্ন</span>
          </div>
          <div className="w-full h-3 rounded-full bg-emerald-200 dark:bg-emerald-900/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-700 dark:text-stone-300">🕌 ৫ ওয়াক্ত সালাতের স্থিতি:</h4>
            {[
              { id: "fajr", name: "ফজর" },
              { id: "dhuhr", name: "যোহর" },
              { id: "asr", name: "আসর" },
              { id: "maghrib", name: "মাগরিব" },
              { id: "isha", name: "এশা" },
            ].map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shadow-2xs"
              >
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{p.name}</span>
                <div className="flex gap-1">
                  {[
                    { key: "jamat", label: "জামাত (১৫)", color: "bg-emerald-600 text-white" },
                    { key: "alone", label: "একাকী (১০)", color: "bg-amber-600 text-white" },
                    { key: "none", label: "বাকি", color: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => update({ [p.id]: opt.key })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        record[p.id] === opt.key ? opt.color : "bg-stone-100 dark:bg-emerald-950/40 text-stone-500 hover:bg-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-emerald-950">
            <h4 className="text-xs font-black text-stone-700 dark:text-stone-300">📖 অন্যান্য গুরুত্বপূর্ণ আমল:</h4>
            <div className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200">কুরআন তিলাওয়াত (পৃষ্ঠা)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update({ quranPages: Math.max(0, record.quranPages - 1) })}
                  className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-emerald-950 font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold">{record.quranPages}</span>
                <button
                  onClick={() => update({ quranPages: record.quranPages + 1 })}
                  className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div
              onClick={() => update({ adhkar: !record.adhkar })}
              className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs cursor-pointer shadow-2xs"
            >
              <span className="font-semibold text-stone-800 dark:text-stone-200">সকাল ও সন্ধ্যার মাসনূন জিকির</span>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold ${record.adhkar ? "bg-emerald-600 text-white" : "border border-stone-300"}`}>
                {record.adhkar && "✓"}
              </span>
            </div>

            <div
              onClick={() => update({ sadaqah: !record.sadaqah })}
              className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs cursor-pointer shadow-2xs"
            >
              <span className="font-semibold text-stone-800 dark:text-stone-200">আজকের সদাকাহ বা দান</span>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold ${record.sadaqah ? "bg-emerald-600 text-white" : "border border-stone-300"}`}>
                {record.sadaqah && "✓"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            সংরক্ষণ ও বন্ধ
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. JAINAMAZ MODAL ──
export function JainamazModal({ onClose }) {
  const [tab, setTab] = useState("rakat");

  const RAKATS = [
    { waqt: "ফজর", sunnat: 2, farz: 2, nafl: 0, witr: 0, total: 4 },
    { waqt: "যোহর", sunnat: 4, farz: 4, nafl: 4, witr: 0, total: 12 },
    { waqt: "আসর", sunnat: 4, farz: 4, nafl: 0, witr: 0, total: 8 },
    { waqt: "মাগরিব", sunnat: 2, farz: 3, nafl: 2, witr: 0, total: 7 },
    { waqt: "এশা", sunnat: 2, farz: 4, nafl: 6, witr: 3, total: 15 },
    { waqt: "জুমু'আ", sunnat: 8, farz: 2, nafl: 4, witr: 0, total: 14 },
  ];

  const STEPS = [
    { step: "১. তাকবীরে তাহরীমা", desc: "কিবলামুখী হয়ে 'আল্লাহু আকবার' বলে নাভির নিচে হাত বাঁধা।" },
    { step: "২. ছানা পাঠ", desc: "সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা... পাঠ করা সুন্নাহ।" },
    { step: "৩. সূরা ফাতিহা ও কিরাত", desc: "সূরা ফাতিহা ও অন্য কোনো সূরা মিলিয়ে তিলাওয়াত করা।" },
    { step: "৪. রুকু", desc: "'সুবহানা রাব্বিয়াল আজীম' কমপক্ষে ৩ বার পাঠ করা।" },
    { step: "৫. কাওমা", desc: "সোজা হয়ে দাঁড়িয়ে 'সামিআল্লাহু লিমান হামিদাহ, রাব্বানা ওয়া লাকাল হামদ' বলা।" },
    { step: "৬. সিজদা", desc: "'সুবহানা রাব্বিয়াল আ'লা' ৩ বার পাঠ করে দুটি সিজদা করা।" },
    { step: "৭. তাশাহহুদ ও দরূদ", desc: "শেষ বৈঠকে বসে আত্তাহিয়্যাতু, দরূদে ইব্রাহিম ও দো'আয়ে মাসূরা পাঠ।" },
    { step: "৮. সালাম", desc: "ডানে ও বাঁয়ে 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ' বলে নামাজ শেষ করা।" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <span className="text-xl">🕌</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">জায়নামাজ ও সালাত নির্দেশিকা</h2>
              <p className="text-xs text-emerald-100">৫ ওয়াক্তের রাকাত তালিকা ও সালাত আদায়ের নিয়ম</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 shrink-0">
          <button
            onClick={() => setTab("rakat")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === "rakat" ? "bg-emerald-600 text-white" : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300"
            }`}
          >
            ৫ ওয়াক্তের রাকাত তালিকা
          </button>
          <button
            onClick={() => setTab("steps")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === "steps" ? "bg-emerald-600 text-white" : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300"
            }`}
          >
            ধাপে ধাপে সালাত পদ্ধতি
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {tab === "rakat" ? (
            <div className="space-y-2">
              {RAKATS.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs shadow-2xs"
                >
                  <span className="font-black text-sm text-stone-900 dark:text-stone-100">{r.waqt}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">ফরজ: <b className="text-emerald-700 dark:text-emerald-400">{r.farz}</b></span>
                    <span className="text-stone-500">সুন্নত: <b>{r.sunnat}</b></span>
                    {r.witr > 0 && <span className="text-stone-500">বিতর: <b>{r.witr}</b></span>}
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      মোট {r.total} রাকাত
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 text-xs shadow-2xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">{s.step}</h4>
                  <p className="text-stone-600 dark:text-stone-400">{s.desc}</p>
                </div>
              ))}
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

// ── 5. QIBLA MODAL ──
export function QiblaModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-black tracking-wide">কিবলা দিকদর্শন কম্পাস</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-stone-700 dark:text-stone-300">
            📍 অবস্থান: <b>বাংলাদেশ (ঢাকা/গাজীপুর)</b><br />
            কিবলার কোণ: <b className="text-emerald-700 dark:text-emerald-400 text-sm">২৬৮° পশ্চিম (WNW)</b>
          </div>

          {/* Compass Graphic */}
          <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-center shadow-inner">
            <div className="absolute top-2 text-[10px] font-bold text-stone-400">N (উত্তর)</div>
            <div className="absolute bottom-2 text-[10px] font-bold text-stone-400">S (দক্ষিণ)</div>
            <div className="absolute left-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-black">W (পশ্চিম)</div>
            <div className="absolute right-2 text-[10px] font-bold text-stone-400">E (পূর্ব)</div>

            {/* Qibla Indicator Arrow */}
            <div className="flex flex-col items-center justify-center -rotate-[92deg]">
              <span className="text-2xl">🕋</span>
              <div className="w-1.5 h-14 bg-emerald-600 rounded-full"></div>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            পবিত্র মক্কা মুকাররমার দূরত্ব: প্রায় ৪,৮২০ কিলোমিটার।
          </p>
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

// ── 6. HAJJ & UMRAH MODAL ──
export function HajjModal({ onClose }) {
  const STEPS = [
    { title: "১. ইহরাম পরিধান ও নিয়ত", day: "৮ জিলহজ্জ", desc: "মিকাত থেকে ইহরাম বাঁধা ও লাব্বাইক পাঠ করা।" },
    { title: "২. মিনায় অবস্থান", day: "৮ জিলহজ্জ", desc: "মিনায় তাবু গেড়ে ৫ ওয়াক্ত সালাত ও ইবাদত।" },
    { title: "৩. আরাফাতের ময়দানে অবস্থান", day: "৯ জিলহজ্জ (মূল হজ্জ)", desc: "জাওয়াল থেকে সূর্যাস্ত পর্যন্ত দাঁড়িয়ে দু'আ ও তাওবা।" },
    { title: "৪. মুযদালিফায় রাত্রিযাপন", day: "৯ জিলহজ্জ দিবাগত রাত", desc: "মাগরিব ও এশা এক সাথে আদায় এবং কংকর সংগ্রহ।" },
    { title: "৫. বড় জামরায় কংকর নিক্ষেপ", day: "১০ জিলহজ্জ", desc: "বড় শয়তানকে ৭টি পাথর নিক্ষেপ করা।" },
    { title: "৬. কুরবানি ও মাথা মুণ্ডন", day: "১০ জিলহজ্জ", desc: "কুরবানি সম্পন্ন করে চুল কেটে ইহরাম আংশিক খোলা।" },
    { title: "৭. তাওয়াফে যিয়ারত ও সাঈ", day: "১০-১২ জিলহজ্জ", desc: "কা'বা শরীফ তাওয়াফ ও সাফা-মারওয়া সাঈ।" },
    { title: "৮. বিদায়ী তাওয়াফ", day: "মক্কা ত্যাগের পূর্বে", desc: "বিদায়ী তাওয়াফের মাধ্যমে হজ্জের আনুষ্ঠানিকতা সমাপ্তি।" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🕋</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">হজ্জ ও উমরা নির্দেশিকা</h2>
              <p className="text-xs text-emerald-100">সহীহ সুন্নাহ মোতাবেক হজ্জের ৮টি মূল ধাপ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {STEPS.map((s, i) => (
            <div key={i} className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">{s.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                  {s.day}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-400">{s.desc}</p>
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

// ── 7. ROZA MODAL ──
export function RozaModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌙</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">রোযা, সাহরি ও ইফতার</h2>
              <p className="text-xs text-emerald-100">রমাদান ও নফল রোযার ক্যালেন্ডার ও দু'আ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
            <h3 className="font-black text-emerald-900 dark:text-emerald-200">🤲 রোযার নিয়ত:</h3>
            <p className="font-serif font-bold text-emerald-950 dark:text-emerald-300 text-sm text-right" dir="rtl">
              نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضًا لَكَ يَا أَللَّهُ فَتَقَبَّلْ مِنِّي
            </p>
            <p className="text-stone-700 dark:text-stone-300">
              <b>অর্থ:</b> হে আল্লাহ! আমি আগামীকালের পবিত্র রমাদান মাসের ফরজ রোযা রাখার নিয়ত করলাম। আপনি আমার পক্ষ হতে তা কবুল করুন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
            <h3 className="font-black text-amber-900 dark:text-amber-200">🥣 ইফতারের দু'আ:</h3>
            <p className="font-serif font-bold text-amber-950 dark:text-amber-300 text-sm text-right" dir="rtl">
              ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
            </p>
            <p className="text-stone-700 dark:text-stone-300">
              <b>অর্থ:</b> পিপাসা দূর হলো, শিরা-উপশিরা সিক্ত হলো এবং আল্লাহর ইচ্ছায় সাওয়াব নিশ্চিত হলো। (আবু দাউদ)
            </p>
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
