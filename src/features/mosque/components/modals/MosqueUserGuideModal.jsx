"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Search,
  Utensils,
  Receipt,
  Landmark,
  GraduationCap,
  Database,
  Globe,
  Users,
} from "lucide-react";

const GUIDE_SECTIONS = [
  {
    id: "overview",
    title: "১. প্ল্যাটফর্ম পরিচিতি ও ৩টি অ্যাক্সেস মোড",
    icon: Globe,
    summary: "পাবলিক সাইট, নিজস্ব কাস্টম ডোমেন এবং কেন্দ্রীয় সার্চের মাধ্যমে যে কোনো মসজিদের পরিচালনা।",
    points: [
      {
        heading: "কাস্টম ডোমেন সংযোগ (Custom Domain):",
        desc: "মসজিদ কমিটি নিজস্ব ডোমেন (যেমন: www.baitulamanmasjid.org) কিনে আমাদের ক্লাউডফ্লেয়ার বা সিএনএএম (CNAME) পয়েন্ট করলে স্বয়ংক্রিয় এসএসএল (SSL) সহ তাদের নিজস্ব ওয়েবসাইটে রূপান্তরিত হবে।",
      },
      {
        heading: "প্ল্যাটফর্ম সাব-পাথ (SaaS URL):",
        desc: "ডোমেন না কিনলেও প্রতিটি মসজিদ platform.com/masjid/:slug ঠিকানায় নিজস্ব ফুল-ফিচার ওয়েবসাইট ও ড্যাশবোর্ড সম্পূর্ণ বিনামূল্যে চালাতে পারবে।",
      },
      {
        heading: "সার্চ ও ডিরেক্টরি দিয়ে লগইন (Discovery Search):",
        desc: "যেকোনো সাধারণ মানুষ বা সদস্য আমাদের কেন্দ্রীয় মসজিদ সার্চবারে মসজিদের নাম লিখে খুঁজে নিতে পারবে এবং মেম্বার আইডি ও পিন দিয়ে সহজেই নিজস্ব অ্যাকাউন্টে লগইন করতে পারবে।",
      },
      {
        heading: "পাবলিক সাইট বনাম লগইন করা ইআরপি:",
        desc: "লগইন না করে যে কেউ নামাজের সময়সূচি, হিজরি তারিখ, আলেমদের বায়ো, নোটিশ, গ্যালারি ও অনলাইন দান দেখতে পাবে। আর লগইন করলে ইমামের বেতন, ভাউচার অনুমোদন ও ব্যয়ের অভ্যন্তরীণ হিসাব দেখতে পাবে।",
      },
    ],
  },
  {
    id: "roster",
    title: "২. ইমামের খানা রোস্টার ও খানা বদল (Swap)",
    icon: Utensils,
    summary: "ইমাম সাহেবের প্রতিদিনের খাবার কার বাড়িতে তার ডিজিটাল সূচি ও অপারগতার আবেদন।",
    points: [
      {
        heading: "দৈনিক স্বয়ংক্রিয় নোটিশ:",
        desc: "সিস্টেম স্বয়ংক্রিয়ভাবে প্রতিদিন ড্যাশবোর্ডে ও নোটিশে জানিয়ে দেয় আজ কোন সদস্যের বাড়িতে ইমাম সাহেবের সকাল, দুপুর ও রাতের খাবার নির্ধারিত রয়েছে।",
      },
      {
        heading: "'আজ খাবার দিতে পারব না' আবেদন:",
        desc: "কোনো সদস্য জরুরি প্রয়োজনে নির্ধারিত দিনে খাবার সরবরাহ করতে অপারগ হলে তিনি পোর্টালে গিয়ে 'খানা বদল আবেদন' বাটনে চাপ দিয়ে কারণ উল্লেখ করে আবেদন করতে পারবেন।",
      },
      {
        heading: "অন্য সদস্যের সাথে খানা বিনিময় (Swap):",
        desc: "আবেদন জমা হলে কমিটি বা সদস্য নিজেই অন্য কোনো মুক্ত সদস্যের সাথে তারিখ অদলবদল (Swap) করে নিতে পারবে। সাথে সাথে ক্যালেন্ডারে নতুন নাম আপডেট হয়ে যাবে।",
      },
      {
        heading: "খানা সম্পন্ন স্ট্যাটাস ট্র্যাকিং:",
        desc: "প্রতিটি বেলার খাবার (সকাল, দুপুর, রাত) পরিবেশিত হওয়ার পর 'সম্পন্ন' হিসেবে মার্ক করা যায়, ফলে কোনো দিন ইমাম সাহেবকে খাবারের সমস্যায় পড়তে হয় না।",
      },
    ],
  },
  {
    id: "members",
    title: "৩. সদস্য চাঁদা ও গোপনীয়তা নিয়ন্ত্রণ (Privacy Toggle)",
    icon: Users,
    summary: "সদস্যদের মাসিক ওয়াদা, চাঁদা আদায় এবং নাম প্রকাশ বা গোপন রাখার মানবিক সুইচ।",
    points: [
      {
        heading: "মাসিক অঙ্গীকার ও চাঁদা (Monthly Pledge):",
        desc: "প্রতিটি সদস্যের জন্য একটি নির্দিষ্ট মাসিক চাঁদার পরিমাণ (যেমন: ৫০০৳, ১০০০৳) ধার্য থাকে। সদস্য নগদ, বিকাশ বা ব্যাংকে টাকা দিলে স্বয়ংক্রিয় রসিদ জেনারেট হয়।",
      },
      {
        heading: "চাঁদাদাতাদের নাম গোপন / প্রকাশ সুইচ (Show Contributors):",
        desc: "মসজিদের সদস্য তালিকায় একটি 'গোপনীয়তা সুইচ' রয়েছে। কমিটি চাইলে এক ক্লিকে তালিকাটি 'উন্মুক্ত' করতে পারে অথবা ব্যক্তিগত মর্যাদা ও গোপনীয়তা রক্ষায় নাম ও মোবাইল নম্বর মাস্কড (যেমন: মুহাম্মদ *** M-101, ০১৭১১-***) করে রাখতে পারে।",
      },
      {
        heading: "সদস্যদের নিজস্ব পোর্টাল (Zero-Trust Member View):",
        desc: "কোনো সাধারণ সদস্য লগইন করলে তিনি কেবল তার নিজের জমা দেওয়া চাঁদা, বকেয়া, রসিদ এবং ইমামের খানা দেওয়ার তারিখ দেখতে পাবেন—অন্য কোনো সদস্যের ব্যক্তিগত তথ্য তিনি দেখতে পারবেন না।",
      },
    ],
  },
  {
    id: "procurement",
    title: "৪. কেনাকাটা ও ৪-স্বাক্ষরের ডিজিটাল ভাউচার",
    icon: Receipt,
    summary: "মসজিদের কেনাকাটায় শতভাগ স্বচ্ছতা, রিকুইজিশন অনুমোদন এবং ৪ জনের প্রিন্টযোগ্য স্বাক্ষর।",
    points: [
      {
        heading: "ধাপ ১: ক্রয়ের রিকুইজিশন (Requisition):",
        desc: "মসজিদের মাইক, ফ্যান, লাইট, পরিষ্কার সামগ্রী বা কোনো মালামাল কেনার প্রয়োজন হলে সদস্য বা কর্মচারী সিস্টেমে ক্রয়ের আবেদন জমা দেবে।",
      },
      {
        heading: "ধাপ ২: কমিটির অনুমোদন (Approval):",
        desc: "সভাপতি ও পরিচালনা কমিটি আবেদনটির যৌক্তিকতা যাচাই করে ডিজিটাল অনুমোদন দেবে। অনুমোদন ছাড়া কোনো মালামাল কেনা যাবে না।",
      },
      {
        heading: "ধাপ ৩: দোকান থেকে মেমো ও রশিদ আপলোড:",
        desc: "মালামাল ক্রয় শেষে বিক্রেতার ক্যাশ মেমো বা চালানের ছবি প্রমাণস্বরূপ ভাউচারে সংযুক্ত করা হবে।",
      },
      {
        heading: "ধাপ ৪: ৪টি আবশ্যিক স্বাক্ষরযুক্ত অফিসিয়াল ভাউচার:",
        desc: "ভাউচারে ৪ জনের স্বাক্ষর ও মোবাইল নম্বর বাধ্যতামূলক: (১) আবেদনকারী, (২) মালামাল গ্রহণকারী, (৩) কোষাধ্যক্ষ ও (৪) সভাপতি। কোষাধ্যক্ষ পেমেন্ট প্রদান (PAID) করলেই কেবল মসজিদ ফান্ড থেকে টাকা কর্তন হবে।",
      },
    ],
  },
  {
    id: "funds",
    title: "৫. ১০টি ফান্ড ব্যবস্থাপনা ও বেতন খতিয়ান",
    icon: Landmark,
    summary: "ডাবল-এন্ট্রি ব্যালেন্স ক্যালকুলেশন এবং ইমাম-মুয়াজ্জিনের মাসিক বেতন বিতরণ।",
    points: [
      {
        heading: "১০টি আলাদা তহবিলের হিসাব:",
        desc: "সাধারণ মসজিদ ফান্ড, উন্নয়ন ও নির্মাণ ফান্ড, ইমাম ও কর্মচারী বেতন ফান্ড, মক্তব ও শিক্ষা ফান্ড, বিদ্যুৎ ও রক্ষণাবেক্ষণ, দান বক্স, যাকাত, সদকা ও ফিতরা, মেহমানদারি ও ইফতার, এবং মানবসেবা ফান্ড।",
      },
      {
        heading: "স্বয়ংক্রিয় ডাবল-এন্ট্রি ফান্ড সংরক্ষণ:",
        desc: "যে ফান্ডে অনুদান আসবে, শুধুমাত্র সেই ফান্ড বৃদ্ধি পাবে। কোনো খরচের আবেদন অনুমোদিত হলে টাকা কাটবে না, কোষাধ্যক্ষ চূড়ান্ত পরিশোধ (PAID) করলেই নির্দিষ্ট ফান্ড থেকে সঠিক পরিমাণ কর্তন হবে।",
      },
      {
        heading: "ইমাম ও কর্মচারীদের বেতন খতিয়ান:",
        desc: "প্রতি মাসে ইমাম, মুয়াজ্জিন ও খাদেমদের বেতন প্রদানের তারিখ, বিতরণকারী কর্মকর্তা, ব্যাংক/ক্যাশ রসিদ নম্বর এবং মোবারকবাদীর পরিমাণ স্থায়ীভাবে লিপিবদ্ধ থাকে।",
      },
    ],
  },
  {
    id: "maktab",
    title: "৬. নূরানী মক্তব ও সমাজকল্যাণ",
    icon: GraduationCap,
    summary: "সকালের শিশু ও বয়স্কদের কোরআন শিক্ষা, হাজিরা এবং যাকাত সহায়তা।",
    points: [
      {
        heading: "মক্তব শিক্ষার্থী ও উপস্থিতি:",
        desc: "মহল্লার শিশুদের ভর্তি, দৈনিক সকালের হাজিরা এবং কায়দা, আমপারা ও নাজেরা পাঠের অগ্রগতি ট্র্যাকিং।",
      },
      {
        heading: "শিক্ষক হাদিয়া ও ফি ব্যবস্থাপনা:",
        desc: "মক্তব শিক্ষকদের মাসিক হাদিয়া ও শিক্ষার্থীদের মাসিক ফি আদায়ের স্বচ্ছ রিপোর্ট।",
      },
      {
        heading: "যাকাত ও সমাজকল্যাণ বিতরণ:",
        desc: "মহল্লার অসহায়, বিধবা, এতিম ও দরিদ্র পরিবারের তালিকা সংরক্ষণ এবং যাকাত ও জরুরি ফান্ড থেকে আর্থিক সহায়তার ডিজিটাল রেকর্ড।",
      },
    ],
  },
  {
    id: "backup",
    title: "৭. অডিট ট্রেইল, ব্যাকআপ ও ডেটা পুনরুদ্ধার",
    icon: Database,
    summary: "মসজিদের শতভাগ ডেটার নিরাপত্তা, ব্যাকআপ এবং এক ক্লিকে রিস্টোর করার সুবিধা।",
    points: [
      {
        heading: "অডিট ট্রেইল ও লগ:",
        desc: "কখন কে অনুদান তুলল, কে ভাউচার অনুমোদন দিল বা কে মেম্বার যুক্ত করল—প্রতিটি কাজের সময় ও ব্যবহারকারীর নামসহ স্থায়ী লগ রাখা হয়।",
      },
      {
        heading: "এক ক্লিকে সম্পূর্ণ ব্যাকআপ ডাউনলোড:",
        desc: "'ডাটাবেস ব্যাকআপ' বাটনে ক্লিক করলেই সম্পূর্ণ মসজিদের সকল সদস্য, ফান্ড, ভাউচার ও খানা রোস্টার নিরাপদ JSON ফাইল হিসেবে কম্পিউটারে ডাউনলোড হয়ে যায়।",
      },
      {
        heading: "তাৎক্ষণিক ডেটা পুনরুদ্ধার (Restore):",
        desc: "কম্পিউটার নষ্ট হলে বা নতুন ডিভাইসে আগের ব্যাকআপ ফাইলটি আপলোড করলেই এক সেকেন্ডে পুরো মসজিদের সকল হিসাব ফিরে আসবে।",
      },
    ],
  },
];

export function MosqueUserGuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = GUIDE_SECTIONS.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.summary.toLowerCase().includes(q) ||
      sec.points.some((p) => p.heading.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
    );
  });

  const currentSection = GUIDE_SECTIONS.find((s) => s.id === activeTab) || GUIDE_SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0c1612] border border-stone-200 dark:border-emerald-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#064E3B] to-[#0D7A5F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                মসজিদ ERP সহজ ব্যবহার নির্দেশিকা ও গাইডবুক
              </h2>
              <p className="text-xs text-emerald-100">
                কোন ফিচারের কী কাজ এবং কীভাবে পরিচালনা করবেন — বিস্তারিত নির্দেশিকা
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-stone-200 dark:border-emerald-900/40 bg-stone-50 dark:bg-[#07130e] shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="যেকোনো বিষয়ের কাজ খুঁজুন (যেমন: খানা, ভাউচার, চাঁদা, বেতন, ডোমেন)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-white dark:bg-[#0c1612] focus:outline-hidden focus:border-[#0D7A5F]"
            />
          </div>
        </div>

        {/* Body Grid: Left Navigation & Right Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Category Nav */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 dark:border-emerald-900/40 p-2 sm:p-3 overflow-y-auto space-y-1 shrink-0 bg-stone-50/70 dark:bg-[#07130e]/70">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition cursor-pointer ${
                    isActive
                      ? "bg-[#0D7A5F] text-white shadow-xs"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-[#0D7A5F]"}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Reading Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#0c1612]">
            <div className="space-y-1 border-b border-stone-200 dark:border-emerald-900/40 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0D7A5F] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                মডিউল গাইড
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <currentSection.icon className="w-5 h-5 text-[#0D7A5F]" />
                <span>{currentSection.title}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {currentSection.summary}
              </p>
            </div>

            {/* Points Cards */}
            <div className="space-y-3">
              {currentSection.points.map((pt, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-[#07130e] border border-stone-200 dark:border-emerald-900/40 space-y-1.5 hover:border-emerald-400 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0D7A5F] dark:text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      {pIdx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {pt.heading}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pl-7">
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Summary Tip Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs">
              <span className="text-base select-none">💡</span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-950 dark:text-amber-200">উপকারী পরামর্শ:</span>
                <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px] leading-relaxed">
                  যেকোনো জটিলতায় উপরের সার্চবারে আপনার প্রয়োজনীয় শব্দ লিখে খুঁজুন অথবা মসজিদের কমিটির নিকট পরামর্শ জমা দিতে হেল্পডেস্ক ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-emerald-900/40 bg-stone-50 dark:bg-[#07130e] flex items-center justify-between shrink-0 text-xs">
          <span className="text-stone-400 text-[11px]">
            Rahmania Mosque ERP · সকল তথ্য স্বয়ংক্রিয়ভাবে সংরক্ষিত
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0D7A5F] hover:bg-[#064E3B] text-white font-bold text-xs transition cursor-pointer"
          >
            পড়েছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
}

export default MosqueUserGuideModal;
