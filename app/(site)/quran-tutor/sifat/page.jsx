import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SifatLearningModule } from "@/features/ai-learning";

export const metadata = {
  title: "সিফাতুল হুরুফ — হরফের ১৮টি বৈশিষ্ট্য ও বিশুদ্ধ উচ্চারণ | Rahmania Institute",
  description: "সিফাতুল হুরুফের পূর্ণাঙ্গ গাইড: ৫ জোড়া বিপরীত সিফাত (হামস, জাহর, শিদ্দাহ, ইস্তি'লা ইত্যাদি) এবং ৮টি বিপরীতহীন সিফাত (ক্বলক্বলাহ, সাফীর, লীন ইত্যাদি)।",
  keywords: ["সিফাতুল হুরুফ", "Sifat al Huruf", "তাজবীদ", "কুরআন শিক্ষা", "Rahmania Institute"],
  robots: { index: true, follow: true },
};

export default function SifatPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#071912] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-emerald-100 dark:border-emerald-900/60 bg-white/95 dark:bg-[#0a2318]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/quran-tutor/learning"
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>কুরআন লার্নিং</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">
              সিফাতুল হুরুফ মডিউল
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <SifatLearningModule />
      </main>
    </div>
  );
}

