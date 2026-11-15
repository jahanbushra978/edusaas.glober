"use client";
import React, { useState } from "react";
import { BookOpen, Scroll, FileText, Mic, X, Search, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

async function copyText(text, msg = "উদ্ধৃতি কপি করা হয়েছে") {
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

// ── 1. KITAB MODAL ──
export function KitabModal({ onClose }) {
  const [selectedKitab, setSelectedKitab] = useState("bukhari");
  const [search, setSearch] = useState("");

  const KITABS = [
    {
      id: "bukhari",
      name: "সহীহুল বুখারী",
      author: "ইমাম মুহাম্মদ ইবনে ইসমাইল আল-বুখারী (রহ.)",
      category: "হাদীস গ্রন্থ",
      chaptersCount: 97,
      description: "ইসলামের সবচেয়ে বিশুদ্ধ হাদীস গ্রন্থ। এতে রয়েছে ঈমান, সালাত, ইলম, লেনদেনসহ জীবনের সকল দিকের সহীহ দিকনির্দেশনা।",
      featuredTopic: {
        title: "কাজের ফলাফল নিয়তের উপর নির্ভরশীল (হাদীস ১)",
        arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        bangla: "নিশ্চয়ই সমস্ত কাজের ফলাফল নিয়তের উপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি যা নিয়ত করেছে কেবল তাই পাবে।",
        explanation: "যেকোনো ইবাদত কবুল হওয়ার পূর্বশর্ত হলো একমাত্র আল্লাহর সন্তুষ্টির উদ্দেশ্যে নিয়ত খালেস রাখা। লৌকিকতা থাকলে তা বরবাদ হয়ে যায়।"
      }
    },
    {
      id: "muslim",
      name: "সহীহ মুসলিম",
      author: "ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নিশাপুরী (রহ.)",
      category: "হাদীস গ্রন্থ",
      chaptersCount: 56,
      description: "সিহাহ সিত্তার অন্যতম শ্রেষ্ঠ গ্রন্থ। বিষয়ভিত্তিক সংকলন ও সনদ বিন্যাসের দিক থেকে অতুলনীয়।",
      featuredTopic: {
        title: "দ্বীন হলো কল্যাণকামিতা (হাদীস ৫৫)",
        arabic: "الدِّينُ النَّصِيحَةُ : لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ",
        bangla: "দ্বীন হলো আন্তরিক কল্যাণকামিতা: আল্লাহর জন্য, তাঁর কিতাবের জন্য, তাঁর রাসূলের জন্য এবং মুসলিমদের শাসক ও সাধারণ জনগণের জন্য।",
        explanation: "ইসলাম শুধু আনুষ্ঠানিক ইবাদত নয়, বরং পরস্পরের প্রতি আন্তরিক নিষ্ঠা ও কল্যাণের অনুভূতিই হলো দ্বীনের মূল ভিত্তি।"
      }
    },
    {
      id: "riyad",
      name: "রিয়াযুছ স্বা-লিহীন",
      author: "ইমাম মুহিউদ্দীন ইয়াহইয়া আন-নববী (রহ.)",
      category: "আখলাক ও আত্মশুদ্ধি",
      chaptersCount: 372,
      description: "প্রতিদিনের জীবন গড়ার অমূল্য গ্রন্থ। তাওবা, ধৈর্য, শোকর, সততা ও সুন্দর আচরণের হাদীসমালা।",
      featuredTopic: {
        title: "তাওবার দরজা সর্বদা উন্মুক্ত (অধ্যায় ২)",
        arabic: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ",
        bangla: "নিশ্চয়ই আল্লাহ তাআলা রাতে তাঁর ক্ষমার হাত প্রসারিত করেন যেন দিনের গুনাহগার তাওবা করে, এবং দিনে হাত প্রসারিত করেন যেন রাতের গুনাহগার তাওবা করে।",
        explanation: "বান্দা যত বড় ভুলই করুক, মৃত্যুর পূর্বে খাঁটি মনে তওবা করলে আল্লাহ তাআলা ক্ষমা করে দেন।"
      }
    },
    {
      id: "ibnkathir",
      name: "তাফসীরে ইবনে কাসীর",
      author: "ইমাম হাফিজ ইমাদুদ্দীন ইবনে কাসীর (রহ.)",
      category: "কুরআন তাফসীর",
      chaptersCount: 114,
      description: "কুরআনের আয়াত দিয়ে কুরআন ও সহীহ হাদীসের আলোকে কুরআনের সর্বজনগ্রাহ্য ব্যাখ্যাগ্রন্থ।",
      featuredTopic: {
        title: "সূরা আল-ইখলাস এর অনন্য মাহাত্ম্য",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ · اللَّهُ الصَّمَدُ",
        bangla: "বলুন, তিনিই আল্লাহ, একক-অদ্বিতীয়। আল্লাহ কারও মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।",
        explanation: "এই সূরাটি সমগ্র তাওহীদ ও আল্লাহর জাত-সিফাতের পূর্ণাঙ্গ সারমর্ম ধারণ করে, যা কুরআনের এক-তৃতীয়াংশের সমতুল্য।"
      }
    }
  ];

  const current = KITABS.find((k) => k.id === selectedKitab) || KITABS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">ইসলামিক কিতাব পাঠাগার</h2>
              <p className="text-xs text-emerald-100">সহীহ হাদীস ও তাফসীর গ্রন্থমালা</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kitab Selector Pills */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {KITABS.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedKitab(k.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedKitab === k.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>

        {/* Kitab Detail Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">{current.name}</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">{current.category}</span>
            </div>
            <p className="text-xs font-bold text-stone-600 dark:text-stone-400">লেখক: {current.author}</p>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{current.description}</p>
          </div>

          {/* Featured Hadith/Tafseer Quote */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-amber-200 dark:border-amber-900/50 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400">📖 গুরুত্বপূর্ণ উদ্ধৃতি:</span>
              <button
                onClick={() => copyText(`${current.featuredTopic.arabic}\n\n${current.featuredTopic.bangla}`)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>কপি</span>
              </button>
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{current.featuredTopic.title}</h4>
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-right">
              <p className="text-base sm:text-lg font-serif font-bold text-amber-950 dark:text-amber-200 leading-loose" dir="rtl">
                {current.featuredTopic.arabic}
              </p>
            </div>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
              অর্থ: {current.featuredTopic.bangla}
            </p>
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] text-xs text-stone-600 dark:text-stone-400 leading-relaxed border border-stone-200 dark:border-emerald-950">
              💡 <b>শিক্ষা:</b> {current.featuredTopic.explanation}
            </div>
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

// ── 2. HADITH MODAL ──
export function HadithModal({ onClose }) {
  const [category, setCategory] = useState("সকল");
  const [search, setSearch] = useState("");

  const HADITHS = [
    {
      id: 1,
      category: "ঈমান ও তাওহীদ",
      source: "সহীহ বুখারী",
      hadithNo: "১৩",
      narrator: "আনাস (রা.) হতে বর্ণিত",
      arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      bangla: "তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে যা নিজের জন্য পছন্দ করে।",
      benefit: "পরোপকার, ভ্রাতৃত্ববোধ ও স্বার্থপরতা পরিহার করা ঈমানের পূর্ণতার অপরিহার্য শর্ত।"
    },
    {
      id: 2,
      category: "সালাত",
      source: "সহীহ মুসলিম",
      hadithNo: "২২৩",
      narrator: "আবু মালিক আল-আশআরী (রা.) হতে বর্ণিত",
      arabic: "وَالصَّلاَةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ",
      bangla: "সালাত হলো জ্যোতি, সদাকাহ হলো প্রমাণ, আর ধৈর্য হলো আলোকবর্তিকা।",
      benefit: "নিয়মিত সালাত মানুষের অন্তর, জীবন ও কবরে নূর বা আলো দান করে।"
    },
    {
      id: 3,
      category: "চরিত্র ও আখলাক",
      source: "জামে আত-তিরমিযী",
      hadithNo: "২০০৩",
      narrator: "আবু দারদা (রা.) হতে বর্ণিত",
      arabic: "مَا مِنْ شَيْءٍ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ حُسْنِ الْخُلُقِ",
      bangla: "কিয়ামতের দিন মুমিনের পাল্লায় সুন্দর চরিত্রের চেয়ে বেশি ভারী আর কোনো আমল থাকবে না।",
      benefit: "সুন্দর ব্যবহার ও বিনম্র আচরণ সর্বাধিক নেক আমল হিসেবে পরিগণিত হয়।"
    },
    {
      id: 4,
      category: "দান ও সদাকাহ",
      source: "সহীহ মুসলিম",
      hadithNo: "২৫৮৮",
      narrator: "আবু হুরায়রা (রা.) হতে বর্ণিত",
      arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا",
      bangla: "সদাকাহর দ্বারা কোনো সম্পদ হ্রাস পায় না, আর ক্ষমার দ্বারা আল্লাহ তাআলা বান্দার মর্যাদা কেবল বৃদ্ধিই করেন।",
      benefit: "আল্লাহর রাস্তায় ব্যয় সম্পদকে পবিত্র ও বরকতময় করে, কখনো কমায় না।"
    },
    {
      id: 5,
      category: "পিতা-মাতা",
      source: "সহীহ বুখারী",
      hadithNo: "৫৯৭১",
      narrator: "আবু হুরায়রা (রা.) হতে বর্ণিত",
      arabic: "جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ فَقَالَ: يَا رَسُولَ اللَّهِ، مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: أُمُّكَ، قَالَ: ثُمَّ مَنْ؟ قَالَ: ثُمَّ أَبُوكَ",
      bangla: "এক ব্যক্তি এসে জিজ্ঞাসা করলেন: হে আল্লাহর রাসূল! আমার সর্বোত্তম সেবার সবচেয়ে বড় হকদার কে? তিনি বললেন: তোমার মা। লোকটি বলল: তারপর কে? তিনি বললেন: তোমার মা। লোকটি বলল: তারপর কে? তিনি বললেন: তোমার মা। এরপর বললেন: তোমার বাবা।",
      benefit: "পিতা-মাতার বিশেষ করে মায়ের খেদমত জান্নাত লাভের প্রধান মাধ্যম।"
    }
  ];

  const categories = ["সকল", "ঈমান ও তাওহীদ", "সালাত", "চরিত্র ও আখলাক", "দান ও সদাকাহ", "পিতা-মাতা"];

  const filtered = HADITHS.filter((h) => {
    const matchCat = category === "সকল" || h.category === category;
    const matchSearch =
      !search ||
      h.bangla.toLowerCase().includes(search.toLowerCase()) ||
      h.source.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <Scroll className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">নির্বাচিত সহীহ হাদীস সম্ভার</h2>
              <p className="text-xs text-emerald-100">দৈনন্দিন জীবনের সহীহ হাদীস ও আমল</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="হাদীসের বিষয় বা শব্দ দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  category === c
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Hadith List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>📜</span>
                  <span>{item.source} (হাদীস {item.hadithNo})</span>
                </span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px]">
                  {item.category}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">{item.narrator}</p>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-right">
                <p className="text-base font-serif font-bold text-emerald-950 dark:text-emerald-200 leading-loose" dir="rtl">
                  {item.arabic}
                </p>
              </div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                অর্থ: {item.bangla}
              </p>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#07130e] text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 border border-stone-100 dark:border-emerald-950">
                <span>💡</span>
                <span className="leading-relaxed">{item.benefit}</span>
              </div>
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

// ── 3. ARTICLE MODAL ──
export function ArticleModal({ onClose }) {
  const [selectedArticle, setSelectedArticle] = useState("khushu");

  const ARTICLES = [
    {
      id: "khushu",
      title: "সালাতে একাগ্রতা ও খুশু-খুজু রক্ষার উপায়",
      category: "সালাতের মাসআলা",
      readTime: "৪ মিনিট",
      author: "মাওলানা মাহমুদ হাসান",
      summary: "সালাতে মন বিক্ষিপ্ত হওয়া থেকে রক্ষা পেয়ে গভীর আন্তরিকতা অর্জনের বাস্তবসম্মত দিকনির্দেশনা।",
      content: [
        "১. সালাতে প্রবেশের পূর্বে দুনিয়াবী চিন্তা ঝেড়ে ফেলা: সালাতে দাঁড়ানোর আগে কিছুক্ষণ শান্তভাবে বসে চিন্তা করুন যে আপনি সমস্ত জাহানের প্রতিপালক মহান আল্লাহর সামনে দাঁড়াতে যাচ্ছেন।",
        "২. পাঠকৃত সূরার অর্থ অনুধাবন: সূরা ফাতিহা ও তিলাওয়াতকৃত অন্যান্য সূরার অর্থ মনে মনে স্মরণ করার চেষ্টা করুন। অর্থ বুঝলে মন অন্যত্র ধাবিত হতে পারে না।",
        "৩. দৃষ্টি সেজদার স্থানে নিবদ্ধ রাখা: দাঁড়ানো অবস্থায় সেজদার জায়গায় দৃষ্টি স্থির রাখা এবং রুকু-সেজদায় সুন্নাহসম্মত স্থানে চোখ রাখা একাগ্রতা বৃদ্ধি করে।",
        "৪. ধীরস্থিরভাবে রুকু-সেজদা আদায় (তাদীলুল আরকান): তাড়াহুড়ো করে সালাত আদায় করলে খুশু বিনষ্ট হয়। প্রতি রুকনে শান্ত হওয়া আবশ্যক।"
      ],
      keyRules: [
        "সালাতের প্রতিটি তাসবীহ কমপক্ষে ৩ বার স্পষ্টভাবে পাঠ করা উত্তম।",
        "ওয়াসওয়াসা আসলে বাঁ দিকে তিনবার আলতো থুতু নিক্ষেপের ভাব করে আউজুবিল্লাহ পড়া সুন্নাহ।"
      ]
    },
    {
      id: "wudu",
      title: "ওযুর সঠিক পদ্ধতি ও সাধারণ ভুলত্রুটি",
      category: "পবিত্রতা ও তাহরাত",
      readTime: "৫ মিনিট",
      author: "মুফতী আবদুল্লাহ আল-মারুফ",
      summary: "দৈনন্দিন ওযু করার সময় যেসব ভুলের কারণে ওযু অসম্পূর্ণ থেকে যায় তার সমাধান।",
      content: [
        "১. কনুই ও গোড়ালিতে শুকনো স্থান থেকে যাওয়া: শীতকালে বা তাড়াহুড়ায় ওযু করার সময় কনুই বা গোড়ালির পেছনের অংশ শুকনো থেকে যায়, যা ওযু নষ্ট হওয়ার কারণ।",
        "২. কুলি ও নাকে পানি দেওয়া উত্তমরূপে না করা: মুখের প্রতিটি কোনায় পানি পৌঁছানো এবং নাকের নরম অংশ পর্যন্ত পানি টেনে পরিষ্কার করা ওযুর গুরুত্বপূর্ণ সুন্নাত।",
        "৩. গর্দান মাসাহ করার বাড়াবাড়ি পরিহার: পুরো মাথা একবার ভালোভাবে মাসাহ করাই সহীহ সুন্নাহ।",
        "৪. পানির অপচয় রোধ: ওযু করার সময় কল অতিরিক্ত খুলে পানির অপচয় করা মাকরূহ। অল্প পানিতে সুন্নাহসম্মত ওযু করাই উত্তম।"
      ],
      keyRules: [
        "ওযুর ফরজ ৪টি: মুখমণ্ডল ধোয়া, উভয় হাত কনুইসহ ধোয়া, মাথার চারভাগের একভাগ মাসাহ করা, এবং উভয় পা টাখনুসহ ধোয়া।",
        "ওযু শেষে আশহাদু আল্লা ইলাহা ইল্লাল্লাহু... দো'আ পড়লে জান্নাতের ৮টি দরজাই খুলে দেওয়া হয়।"
      ]
    },
    {
      id: "halal",
      title: "হালাল জীবিকা ও আধুনিক ব্যবসায়িক লেনদেন",
      category: "মুআমালাত ও অর্থনীতি",
      readTime: "৬ মিনিট",
      author: "ড. খোন্দকার মোহাম্মাদ রফিক",
      summary: "অনলাইন ফ্রিল্যান্সিং, ই-কমার্স ও আধুনিক বিনিয়োগে হারাম ও সন্দেহযুক্ত উপাদান বর্জনের বিধান।",
      content: [
        "১. স্বচ্ছ চুক্তি ও পণ্যের সঠিক বিবরণ: পণ্যের কোনো গোপন ত্রুটি লুকিয়ে বিক্রি করা মারাত্মক গুনাহ। ক্রেতাকে সত্য তথ্য দেওয়া আবশ্যক।",
        "২. সুদ ও জুয়ামুক্ত ব্যবসা: যেকোনো ধরণের অতিরিক্ত নির্ধারিত সুদভিত্তিক চুক্তি ইসলামে নিষিদ্ধ।",
        "৩. কর্মচারীর পাওনা সঠিক সময়ে প্রদান: শ্রমিকের ঘাম শুকানোর পূর্বেই তার পারিশ্রমিক পরিশোধ করার স্পষ্ট নির্দেশ হাদীসে এসেছে।"
      ],
      keyRules: [
        "হারাম আয়ে গঠিত শরীর জান্নাতে প্রবেশ করবে না (তিরমিযী)।",
        "সৎ ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দীক ও শহীদগণের সাথে থাকবে।"
      ]
    }
  ];

  const current = ARTICLES.find((a) => a.id === selectedArticle) || ARTICLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">ইসলামিক প্রবন্ধ ও মাসআলা</h2>
              <p className="text-xs text-emerald-100">প্রাত্যহিক দ্বীনি জিজ্ঞাসা ও দিকনির্দেশনা</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Pills */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {ARTICLES.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedArticle(a.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedArticle === a.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {a.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{current.category} · পাঠের সময় {current.readTime}</span>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">{current.title}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold">লেখক: {current.author}</p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
            {current.summary}
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-stone-700 dark:text-stone-300">মূল পয়েন্টসমূহ:</h4>
            {current.content.map((point, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-2xs">
                {point}
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
            <h5 className="text-xs font-black text-amber-900 dark:text-amber-300">📌 জরুরি ফতোয়া ও বিধান:</h5>
            <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1 list-disc list-inside">
              {current.keyRules.map((rule, idx) => (
                <li key={idx} className="leading-relaxed">{rule}</li>
              ))}
            </ul>
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

// ── 4. BAYAN MODAL ──
export function BayanModal({ onClose }) {
  const [selectedBayan, setSelectedBayan] = useState("bayan-1");

  const BAYANS = [
    {
      id: "bayan-1",
      title: "খাঁটি তাওবা ও অন্তরের পরিশুদ্ধি",
      speaker: "শায়খ আহমাদুল্লাহ",
      duration: "৩৫ মিনিট",
      category: "আত্মশুদ্ধি",
      summary: "অতীতের গুনাহ মোচনে অনুতপ্ত হয়ে অশ্রু ফেলে কিভাবে আল্লাহ তাআলার নৈকট্য ও ভালোবাসা অর্জন করা যায় সে সম্পর্কে হৃদয়গ্রাহী বয়ান।",
      highlights: ["তাওবার ৩টি অপরিহার্য শর্ত", "অতীতের ক্ষতিপূরণ ও বান্দার হক আদায়", "হতাশা দূর করে আশার আলো জ্বালানো"]
    },
    {
      id: "bayan-2",
      title: "কবরের প্রথম রাত ও আখিরাতের প্রস্তুতি",
      speaker: "মাওলানা মিজানুর রহমান আজহারী",
      duration: "৪২ মিনিট",
      category: "আখিরাত",
      summary: "মৃত্যুর মুখোমুখি হওয়ার মুহূর্ত, কবরের সওয়াল-জওয়াব এবং চিরস্থায়ী শান্তির ঠিকানা জান্নাত লাভের প্রস্তুতি।",
      highlights: ["মুনকার-নাকীরের তিনটি প্রশ্ন", "কবরের আজাব থেকে রক্ষার আমলসমূহ", "সুরক্ষিত মুমিনের অন্তিম দৃশ্য"]
    },
    {
      id: "bayan-3",
      title: "আদর্শ পরিবার গঠন ও সুসন্তান প্রতিপালন",
      speaker: "শায়খ আবদুল হাই মুহাম্মাদ সাইফুল্লাহ",
      duration: "২৮ মিনিট",
      category: "পারিবারিক জীবন",
      summary: "স্বামী-স্ত্রীর পারস্পারিক অধিকার, সন্তানদের দ্বীনি শিষ্টাচার শিক্ষা এবং সংসারে বরকত ধরে রাখার সুন্নাহসম্মত উপায়।",
      highlights: ["সন্তানের প্রথম পাঠশালা মা-বাবা", "ঘরে কুরআন তিলাওয়াত ও নামাজের পরিবেশ", "রাগ নিয়ন্ত্রণ ও সহনশীলতার গুরুত্ব"]
    },
    {
      id: "bayan-4",
      title: "কুরআনের সাথে সম্পর্ক ও জীবনের বরকত",
      speaker: "মুফতী মনসূরুল হক",
      duration: "৩০ মিনিট",
      category: "ইলম ও কুরআন",
      summary: "কুরআন নিয়মিত তিলাওয়াত, হিফজ ও অর্থ বুঝে আমল করার মাধ্যমে পার্থিব অশান্তি দূরীকরণ ও আত্মিক তৃপ্তি।",
      highlights: ["প্রতি হরফে ১০ নেকি লাভের মাহাত্ম্য", "কুরআন শাফায়াতকারী বন্ধু হিসেবে আসবে", "দৈনিক ৩০ মিনিট কুরআনের জন্য বরাদ্দের বরকত"]
    }
  ];

  const current = BAYANS.find((b) => b.id === selectedBayan) || BAYANS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">ইসলামিক বয়ান ও নসীহত</h2>
              <p className="text-xs text-emerald-100">প্রখ্যাত উলামায়ে কেরামের জীবনঘনিষ্ঠ আলোচনা</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bayan List Pills */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {BAYANS.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBayan(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedBayan === b.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40"
              }`}
            >
              {b.speaker}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950">{current.category}</span>
              <span className="text-xs text-emerald-200 font-bold">⏱️ {current.duration}</span>
            </div>
            <h3 className="text-base font-black tracking-wide">{current.title}</h3>
            <p className="text-xs text-emerald-200 font-semibold">🎙️ বক্তা: {current.speaker}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50 space-y-1.5">
            <h4 className="text-xs font-black text-stone-900 dark:text-stone-100">বয়ানটির মূল সারমর্ম:</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{current.summary}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-700 dark:text-stone-300">আলোচ্য মূল বিষয়সমূহ:</h4>
            {current.highlights.map((h, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#07130e] border border-stone-200 dark:border-emerald-950 text-xs text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${current.speaker} ${current.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ইউটিউবে সম্পূর্ণ বয়ানটি শুনুন</span>
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
