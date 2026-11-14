"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Calendar,
  Heart,
  Scroll,
  FileText,
  Compass,
  CheckCircle2,
  Coins,
  Receipt,
  HelpCircle,
  Briefcase,
  Headphones,
  Award,
  Video,
  Moon,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Building,
} from "lucide-react";
import { toast } from "sonner";

export function SuperAppModal({
  onClose,
  onOpenModal,
  onOpenQuranReader,
  onOpenTutor,
  mosqueName = "বাইতুন নূর জামে মসজিদ ও কমপ্লেক্স",
}) {
  const [activeTab, setActiveTab] = useState("ilm"); // "ilm" | "amal" | "seba" | "bibidh"

  const ILM_ITEMS = [
    { id: "quran", icon: "📖", label: "কুরআন", desc: "পূর্ণ কুরআন শরীফ তিলাওয়াত ও অনুবাদ", action: () => (onOpenQuranReader ? onOpenQuranReader() : onOpenModal("kitab")) },
    { id: "kitab", icon: "📚", label: "কিতাব", desc: "তাফসীর ও ইসলামিক কিতাব ভাণ্ডার", action: () => onOpenModal("kitab") },
    { id: "hadith", icon: "📜", label: "হাদীস", desc: "সহীহ বুখারী ও মুসলিম নির্বাচিত হাদীস", action: () => onOpenModal("hadith") },
    { id: "article", icon: "✍️", label: "প্রবন্ধ", desc: "দৈনন্দিন জীবন ও দ্বীনি দিকনির্দেশনা", action: () => onOpenModal("article") },
    { id: "bayan", icon: "🎙️", label: "বয়ান", desc: "জুমার খুতবা ও প্রখ্যাত উলামাদের বয়ান", action: () => onOpenModal("bayan") },
    { id: "maktab", icon: "🏫", label: "মক্তব", desc: "মসজিদ ভিত্তিক নূরানী শিশু মক্তব", action: () => onOpenModal("maktab") },
    { id: "jainamaz", icon: "🕌", label: "জায়নামাজ", desc: "নামাজের নিয়ম ও বিশুদ্ধ মাসআলা", action: () => onOpenModal("jainamaz") },
    { id: "qibla", icon: "🧭", label: "কিবলা", desc: "ডিজিটাল কিবলা কম্পাস ও দিকদর্শন", action: () => onOpenModal("qibla") },
  ];

  const AMAL_ITEMS = [
    { id: "prayer", icon: "⏱️", label: "নামাজের সময়", desc: "ওয়াক্ত ও জামা'আতের নির্ভুল সময়সূচি", action: () => onOpenModal("prayer-edit") },
    { id: "tilawat", icon: "🎧", label: "তিলাওয়াত", desc: "বিশ্বখ্যাত ক্বারীদের অডিও তিলাওয়াত", action: () => (onOpenQuranReader ? onOpenQuranReader() : onOpenModal("kitab")) },
    { id: "dua", icon: "🤲", label: "দু'আ", desc: "হিসনুল মুসলিম ও মাসনূন দু'আ ভাণ্ডার", action: () => onOpenModal("dua") },
    { id: "tasbeeh", icon: "📿", label: "তাসবীহ", desc: "ডিজিটাল তাসবীহ ও যিকির কাউন্টার", action: () => onOpenModal("tasbeeh") },
    { id: "tracker", icon: "📝", label: "আমল ট্রাকার", desc: "দৈনন্দিন ৫ ওয়াক্ত সালাত ও আমল ট্র্যাকিং", action: () => onOpenModal("tracker") },
    { id: "roster", icon: "🍲", label: "খাবার রোস্টার", desc: "ইমাম ও মুয়াজ্জিন সাহেবের মেহমানদারি রোস্টার", action: () => onOpenModal("meal-roster") },
    { id: "hajj", icon: "🕋", label: "হজ্জ ও উমরা", desc: "ধাপে ধাপে হজ্জ ও উমরার গাইড", action: () => onOpenModal("hajj") },
    { id: "roza", icon: "🌙", label: "রোযা ও সাহরি", desc: "সাহরি ও ইফতারের ক্যালেন্ডার ও দু'আ", action: () => onOpenModal("roza") },
  ];

  const SEBA_ITEMS = [
    { id: "zakat", icon: "💰", label: "যাকাত ফিতরা", desc: "সম্পদের নির্ভুল যাকাত ক্যালকুলেটর", action: () => onOpenModal("zakat") },
    { id: "donation", icon: "🎁", label: "ইনফাক ও চাঁদা", desc: "মসজিদ ফান্ডে দান ও মাসিক ইনফাক", action: () => onOpenModal("master-dues") },
    { id: "voucher", icon: "🧾", label: "ডিজিটাল ভাউচার", desc: "খরচের রসিদ ও বিল অনুমোদন", action: () => onOpenModal("expense-approval") },
    { id: "qa", icon: "📞", label: "দ্বীনি জিজ্ঞাসা", desc: "মুফতি ও নূর এআই ফতোয়া সহকারী", action: () => (onOpenTutor ? onOpenTutor() : onOpenModal("support")) },
    { id: "quiz", icon: "💡", label: "তালীমে কুইজ", desc: "ইসলামিক সাধারণ জ্ঞান প্রতিযোগিতা", action: () => onOpenModal("quiz") },
    { id: "nikah", icon: "💍", label: "বিবাহ", desc: "সুন্নাহ ভিত্তিক বিবাহ পরামর্শ ও গাইড", action: () => onOpenModal("nikah") },
    { id: "job", icon: "📰", label: "চাকরি", desc: "হালাল কর্মসংস্থান ও পেশাগত সুযোগ", action: () => onOpenModal("job") },
    { id: "support", icon: "💬", label: "সাপোর্ট", desc: "মসজিদ কমিটি ও হেল্পডেস্ক যোগাযোগ", action: () => onOpenModal("support") },
  ];

  const BIBIDH_ITEMS = [
    { id: "mosque", icon: "🕌", label: "আমার মসজিদ", desc: "মসজিদের তথ্যাবলী ও কমিটি প্যানেল", action: () => onOpenModal("admin") },
    { id: "master", icon: "📊", label: "মাসিক হিসাব", desc: "সকল সদস্যের সম্মিলিত চাঁদার হিসাব শিট", action: () => onOpenModal("master-dues") },
    { id: "admin", icon: "⚙️", label: "অ্যাডমিন ৩৬০", desc: "এক সাথে সদস্য, চাঁদা ও বিল নিয়ন্ত্রণ", action: () => onOpenModal("admin-360") },
    { id: "funds", icon: "💰", label: "মসজিদ তহবিল", desc: "৪টি স্বতন্ত্র ফান্ডের স্থিতি ও বিবরণী", action: () => onOpenModal("funds") },
    { id: "names", icon: "🎖️", label: "আসমাউল হুসনা", desc: "আল্লাহ তাআলার ৯৯টি গুণবাচক নাম ও ফজিলত", action: () => onOpenModal("names") },
    { id: "live", icon: "🕋", label: "লাইভ হারামাইন", desc: "মক্কা ও মদিনা শরীফের সরাসরি সম্প্রচার", action: () => onOpenModal("live") },
    { id: "roza2", icon: "🌙", label: "রোযা ক্যালেন্ডার", desc: "রমজান ও নফল রোযার সময়সূচি", action: () => onOpenModal("roza") },
    { id: "helpdesk", icon: "🔧", label: "হেল্পডেস্ক", desc: "কারিগরি সহায়তা ও ব্যবহার নির্দেশিকা", action: () => onOpenModal("support") },
  ];

  const currentItems =
    activeTab === "ilm" ? ILM_ITEMS :
    activeTab === "amal" ? AMAL_ITEMS :
    activeTab === "seba" ? SEBA_ITEMS : BIBIDH_ITEMS;

  const sectionTitle =
    activeTab === "ilm" ? "ইলম (ইসলামিক জ্ঞান ও শিক্ষা)" :
    activeTab === "amal" ? "আমল (দৈনন্দিন ইবাদত ও সালাত)" :
    activeTab === "seba" ? "সেবা (যাকাত, ইনফাক ও সমাজকল্যাণ)" : "বিবিধ (মসজিদ ব্যবস্থাপনা ও তথ্য)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              📱
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                ইসলামিক সুপার অ্যাপ (৩২টি সেবা)
              </h2>
              <p className="text-xs text-emerald-100">
                {mosqueName} · ইলম, আমল, সেবা ও বিবিধ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs Selector */}
        <div className="p-2.5 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex gap-1.5 shrink-0">
          {[
            { key: "ilm", icon: "📖", label: "ইলম" },
            { key: "amal", icon: "📝", label: "আমল" },
            { key: "seba", icon: "🛍️", label: "সেবা" },
            { key: "bibidh", icon: "⊞", label: "বিবিধ" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-emerald-950/40 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-emerald-800/40 hover:border-emerald-500"
                }`}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Title Banner */}
        <div className="px-4 py-2 bg-stone-100 dark:bg-[#0f1d17] border-b border-stone-200 dark:border-emerald-950/60 flex items-center justify-between text-xs">
          <span className="font-bold text-stone-800 dark:text-stone-200">
            {sectionTitle}
          </span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
            ৮টি সক্রিয় সেবা
          </span>
        </div>

        {/* 8 Action Items Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  item.action();
                }}
                className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex flex-col items-center justify-center text-center shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-sm active:scale-95 transition cursor-pointer min-h-[96px] group"
              >
                <span className="text-3xl mb-1.5 leading-none group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-xs font-black text-stone-900 dark:text-stone-100 leading-tight">
                  {item.label}
                </span>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 mt-1 line-clamp-1">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            প্রতিটি কার্ডে ক্লিক করলে পূর্ণাঙ্গ ফিচারটি ওপেন হবে
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
