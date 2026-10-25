"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { 
  Building2, ShieldCheck, Users, Trophy, Monitor, 
  CreditCard, Zap, PlusCircle, Clock, Cpu, Globe, Shield, Smartphone,
  BarChart3, Fingerprint, FileText, BellRing, FileSpreadsheet, BookOpen, Bot,
  Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateFaqSchema, generateEducationalOrgSchema } from "@/lib/seo";
import WebsiteOnboardingModal from "@/features/site/components/saas/WebsiteOnboardingModal";
import ContactMessageModal from "@/features/site/components/saas/ContactMessageModal";
import SaaSHeroSection from "@/features/site/components/saas/SaaSHeroSection";
import SaaSFeaturesSection from "@/features/site/components/saas/SaaSFeaturesSection";
import SaaSFaqSection from "@/features/site/components/saas/SaaSFaqSection";
import SaaSFooter from "@/features/site/components/saas/SaaSFooter";

export default function SaaSLandingPage() {
  const [activeTab, setActiveTab] = useState("exam");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isWebsiteFormOpen, setIsWebsiteFormOpen] = useState(false);

  const stats = [
    { number: "১,২০০+", label: "নিবন্ধিত প্রতিষ্ঠান", desc: "স্কুল ও মাদ্রাসা", icon: Building2 },
    { number: "১,৫০,০০০+", label: "সক্রিয় শিক্ষার্থী", desc: "দৈনন্দিন ব্যবহারকারী", icon: Users },
    { number: "৯৯.৯%", label: "সিস্টেম আপটাইম", desc: "ক্লাউড নির্ভর সার্ভার", icon: ShieldCheck },
    { number: "২৪/৭", label: "লাইভ সাপোর্ট", desc: "টেকনিক্যাল হেল্প", icon: Zap },
  ];

  const featureTabs = {
    exam: {
      icon: Trophy,
      label: "অটো রেজাল্ট",
      title: "স্বয়ংক্রিয় গ্রেডিং ও মেরিট লিস্ট ইঞ্জিন",
      desc: "বিষয়ভিত্তিক নম্বর ইনপুট করলেই মুহূর্তের মধ্যে জিপিএ, লেটার গ্রেড, সেকশন মেরিট পজিশন এবং প্রিন্ট-রেডি মার্কশিট ও প্রবেশপত্র তৈরি হয়ে যায়।",
      points: ["QR কোডসহ ডিজিটাল প্রবেশপত্র", "অটো সিটিং অ্যারেঞ্জমেন্ট", "ক্লাস ও সেকশন মেরিট তালিকা", "প্রিন্টযোগ্য মার্কশিট ও ট্যাবুলেশন"],
      color: "from-amber-500 to-orange-600"
    },
    attendance: {
      icon: Fingerprint,
      label: "বায়োমেট্রিক",
      title: "রিয়েলটাইম বায়োমেট্রিক হাজিরা সিস্টেম",
      desc: "ফেস রিকগনিশন বা ফিঙ্গারপ্রিন্ট ডিভাইস থেকে সরাসরি ক্লাউডে ডাটা সিঙ্ক হয় এবং অভিভাবকের মোবাইলে তাৎক্ষণিক বাংলা এসএমএস চলে যায়।",
      points: ["ফিঙ্গারপ্রিন্ট ও ফেস রিকগনিশন সাপোর্ট", "অটো অভিভাবক SMS নোটিফিকেশন", "লাইভ ক্লাস উপস্থিতি ড্যাশবোর্ড", "দৈনিক ও মাসিক হাজিরা রিপোর্ট"],
      color: "from-purple-500 to-indigo-700"
    },
    website: {
      icon: Monitor,
      label: "ওয়েবসাইট",
      title: "নো-কোড ডায়নামিক ওয়েবসাইট বিল্ডার",
      desc: "কোনো টেকনিক্যাল জ্ঞান ছাড়াই আপনার প্রতিষ্ঠানের জন্য Google-এ ইন্ডেক্সযোগ্য আন্তর্জাতিক মানের ওয়েবসাইট মাত্র ৫ মিনিটে চালু করুন।",
      points: ["কাস্টম ডোমেইন সাপোর্ট", "SEO-অপটিমাইজড পেজ", "ডায়নামিক নোটিশ ও গ্যালারি", "মোবাইল-ফার্স্ট রেসপনসিভ ডিজাইন"],
      color: "from-emerald-500 to-teal-700"
    },
    finance: {
      icon: CreditCard,
      label: "ফি ম্যানেজমেন্ট",
      title: "পেপারলেস ফি কালেকশন ও একাউন্টস",
      desc: "টিউশন ফি থেকে মেস খরচ পর্যন্ত সকল হিসাব ডিজিটালভাবে সংরক্ষণ করুন। অটোমেটিক বকেয়া রিমাইন্ডার ও ডিজিটাল রসিদ প্রিন্ট সুবিধা।",
      points: ["অটো বকেয়া SMS রিমাইন্ডার", "পেপারলেস ডিজিটাল রসিদ", "মাসিক আয়-ব্যয় রিপোর্ট", "বোর্ডিং মেস ব্যয় ট্র্যাকার"],
      color: "from-blue-500 to-cyan-700"
    }
  };

  const features = [
    { icon: Trophy, title: "অটো গ্রেডিং ইঞ্জিন", desc: "জিপিএ, লেটার গ্রেড ও মেরিট লিস্ট এক ক্লিকে", gradient: "from-amber-500 to-orange-600" },
    { icon: Fingerprint, title: "বায়োমেট্রিক হাজিরা", desc: "ফেস রিকগনিশন ও ফিঙ্গারপ্রিন্ট রিয়েলটাইম সিঙ্ক", gradient: "from-purple-500 to-indigo-700" },
    { icon: Monitor, title: "নো-কোড ওয়েবসাইট", desc: "SEO-রেডি ৫ মিনিটে ওয়েবসাইট লঞ্চ", gradient: "from-emerald-500 to-teal-700" },
    { icon: CreditCard, title: "ডিজিটাল ফি কালেকশন", desc: "অটো রিমাইন্ডার ও পেপারলেস রসিদ", gradient: "from-blue-500 to-cyan-700" },
    { icon: FileText, title: "QR প্রবেশপত্র", desc: "কিউআর কোডসহ অটো সিটিং অ্যারেঞ্জমেন্ট", gradient: "from-rose-500 to-pink-700" },
    { icon: BellRing, title: "অটো SMS সিস্টেম", desc: "অভিভাবকদের রিয়েলটাইম বাংলা নোটিফিকেশন", gradient: "from-green-500 to-emerald-700" },
  ];

  const whyChooseUs = [
    { icon: Cpu, title: "জিরো কোডিং", desc: "কোনো আইটি জ্ঞান ছাড়াই ১০ মিনিটে চালু করুন", badge: "সহজ" },
    { icon: Clock, title: "৭০% সময় সাশ্রয়", desc: "পেপারলেস অটোমেশন দিয়ে গতিশীল পরিচালনা", badge: "দ্রুত" },
    { icon: Shield, title: "ব্যাংক-গ্রেড নিরাপত্তা", desc: "এনক্রিপ্টেড ক্লাউড ডাটা ও অটো ব্যাকআপ", badge: "নিরাপদ" },
    { icon: BarChart3, title: "লাইভ অ্যানালিটিক্স", desc: "রিয়েলটাইম ড্যাশবোর্ড ও বিস্তারিত রিপোর্ট", badge: "স্মার্ট" },
    { icon: Globe, title: "Google SEO রেডি", desc: "প্রতিটি প্রতিষ্ঠানের আলাদা গুগল প্রোফাইল", badge: "ভিজিবল" },
    { icon: Smartphone, title: "সম্পূর্ণ মোবাইল ফার্স্ট", desc: "যেকোনো ডিভাইস থেকে সহজে পরিচালনা", badge: "ফ্লেক্সিবল" },
  ];

  const reviews = [
    {
      name: "মাওলানা রফিকুল ইসলাম",
      role: "মুহতামিম",
      institution: "রহমানিয়া ইনস্টিটিউট, গাজীপুর",
      rating: 5,
      comment: "রেজাল্ট শিট ও হাজিরা মেইনটেইন আগে অনেক কঠিন ছিল। EduSaaS আসার পর মাত্র ১০ মিনিটে সব শেষ হয়ে যাচ্ছে। অসাধারণ সার্ভিস!"
    },
    {
      name: "মুফতী মাহফুজুর রহমান",
      role: "পরিচালক",
      institution: "আল-নূর ইসলামিক একাডেমি, উত্তরা",
      rating: 5,
      comment: "অভিভাবকরা এখন মোবাইলে সরাসরি সন্তানের উপস্থিতি ও মার্কশিট দেখতে পাচ্ছেন। ভর্তি ও ফি কালেকশন অনেক সহজ হয়ে গেছে।"
    },
    {
      name: "মাওলানা আব্দুল করিম",
      role: "আইটি ইনচার্জ",
      institution: "জামিয়া ইসলামিয়া মডেল মাদ্রাসা",
      rating: 5,
      comment: "QR কোডসহ ডিজিটাল প্রবেশপত্র ও মার্কশিট প্রিন্ট করার সুবিধাটি আমাদের মাদরাসার সুনাম বহুগুণ বাড়িয়ে দিয়েছে।"
    }
  ];

  const faqs = [
    {
      question: "কম্পিউটার বিশেষজ্ঞ না থাকলেও কি এই প্ল্যাটফর্ম ব্যবহার করা যাবে?",
      answer: "হ্যাঁ! EduSaaS সম্পূর্ণ বাংলায় এমনভাবে তৈরি করা হয়েছে যাতে ফেসবুক ব্যবহারের মতো সহজ অভিজ্ঞতায় যে কেউ পুরো মাদরাসা পরিচালনা করতে পারেন।"
    },
    {
      question: "আমাদের মাদরাসার নামে কি নিজস্ব ওয়েবসাইট যুক্ত করা যাবে?",
      answer: "হ্যাঁ! প্রতিটি প্রতিষ্ঠান নিজস্ব ডোমেইন নাম (your-madrasa.edu.bd) মাত্র ২ মিনিটে যুক্ত করতে পারবে। Google-এ আলাদাভাবে ইন্ডেক্স হবে।"
    },
    {
      question: "বায়োমেট্রিক ডিভাইসের তথ্য কি অটোমেটিক সিঙ্ক হবে?",
      answer: "হ্যাঁ, বাজারে পাওয়া যায় এমন যেকোনো বায়োমেট্রিক ডিভাইসের সাথে আমাদের সিস্টেম অটো রিয়েলটাইমে কানেক্ট হয়ে অভিভাবকদের SMS পাঠায়।"
    },
    {
      question: "পরীক্ষার নম্বর দিলে জিপিএ ও মেরিট লিস্ট কি অটো তৈরি হয়?",
      answer: "জি! নম্বর ইনপুট করার সাথে সাথে স্বয়ংক্রিয়ভাবে মোট নম্বর, পার্সেন্টেজ, জিপিএ, লেটার গ্রেড এবং প্রিন্ট-রেডি মার্কশিট তৈরি হয়।"
    },
    {
      question: "ডাটা কতটা নিরাপদ থাকবে?",
      answer: "সকল ডাটা ব্যাংক-গ্রেড এনক্রিপশনে প্রতিদিন অটো ব্যাকআপ রাখা হয়। আপনার পিসি নষ্ট হলেও ডাটা সুরক্ষিত থাকবে।"
    }
  ];

  const { data: dbBranches = [] } = useQuery({
    queryKey: ["public-showcase-branches"],
    queryFn: async () => {
      try {
        const list = await appClient.entities.Branch.list();
        if (Array.isArray(list) && list.length > 0) return list;
      } catch (err) { console.warn(err); }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const showcaseSchools = useMemo(() => {
    if (dbBranches?.length > 0) {
      return dbBranches.map((b, idx) => ({
        id: b.id,
        name: b.name_bn || b.name_en || "শিক্ষা প্রতিষ্ঠান",
        location: b.address || b.city || "বাংলাদেশ",
        badge: idx === 0 ? "ফ্ল্যাগশিপ" : idx % 2 === 1 ? "প্রিমিয়াম" : "স্মার্ট ক্যাম্পাস",
        students: b.student_count ? `${b.student_count}+ ছাত্র` : "সক্রিয়",
        type: b.type || "দ্বীনি ও আধুনিক শিক্ষা",
      }));
    }
    return [
      { name: "রহমানিয়া ইনস্টিটিউট", location: "হাড়িনাল, গাজীপুর সিটি", badge: "ফ্ল্যাগশিপ", students: "৮৫০+ ছাত্র", type: "হিফয, কিতাবখানা ও ইংলিশ ভার্সন" },
      { name: "আল-নূর ইসলামিক একাডেমি", location: "উত্তরা, ঢাকা", badge: "প্রিমিয়াম", students: "১,২০০+ ছাত্র", type: "নূরানী ও কিতাব বিভাগ" },
      { name: "জামিয়া ইসলামিয়া মডেল মাদ্রাসা", location: "সোনারগাঁও, নারায়ণগঞ্জ", badge: "স্মার্ট ক্যাম্পাস", students: "৬৫০+ ছাত্র", type: "হিফযুল কুরআন ও কিন্ডারগার্টেন" },
    ];
  }, [dbBranches]);

  const faqSchema = useMemo(() => generateFaqSchema(faqs), []);
  const eduOrgSchema = useMemo(() => generateEducationalOrgSchema(), []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans antialiased overflow-x-hidden">
      {/* JSON-LD SEO Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eduOrgSchema) }} />

      {/* ── Top Promo Bar ── */}
      <div className="bg-gradient-to-r from-[#052E2B] via-emerald-900 to-[#031d1b] text-white py-2 px-4 text-center text-xs font-semibold border-b border-[#D4AF37]/20">
        <span className="inline-flex items-center gap-2">
          <span className="bg-[#D4AF37] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">🎉 অফার</span>
          <span>বাংলাদেশের ১,২০০+ স্কুল ও মাদরাসা এখন একটি ক্লাউড প্ল্যাটফর্মে। আজই বিনামূল্যে শুরু করুন!</span>
          <button 
            onClick={() => setIsWebsiteFormOpen(true)}
            className="underline font-black text-[#D4AF37] hover:text-white ml-2 hidden sm:inline"
          >
            অনলাইন তথ্য ফরম পূরণ করুন →
          </button>
        </span>
      </div>

      {/* ── Premium Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Building2 className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#D4AF37] rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-[#052E2B] font-serif block leading-none">EduSaaS<span className="text-[#D4AF37]">.global</span></span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-none">Smart Education Platform</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#why" className="hover:text-[#052E2B] transition-colors">সুবিধাসমূহ</a>
            <a href="#features" className="hover:text-[#052E2B] transition-colors">ফিচার</a>
            <a href="#schools" className="hover:text-[#052E2B] transition-colors">প্রতিষ্ঠানসমূহ</a>
            <Link 
              href="/quran-tutor" 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>নূর AI কুরআন শিক্ষক</span>
              <span className="bg-[#D4AF37] text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">NEW</span>
            </Link>
            <a href="#reviews" className="hover:text-[#052E2B] transition-colors">রিভিউ</a>
            <a href="#faq" className="hover:text-[#052E2B] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[#052E2B] transition-colors">যোগাযোগ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link 
              href="/quran-tutor" 
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              <span>নূর AI শিক্ষক</span>
            </Link>
            <button 
              onClick={() => setIsWebsiteFormOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600" />
              <span>তথ্য ফরম পূরণ করুন</span>
            </button>
            <Link href="/login">
              <button className="hidden sm:block px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#052E2B] border border-slate-300 rounded-xl hover:border-[#052E2B] transition-all">
                লগইন
              </button>
            </Link>
            <Link href="/platform-console/organizations/new">
              <button className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#052E2B] to-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 sm:gap-2 border border-emerald-600">
                <PlusCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="hidden xs:inline">ফ্রি শুরু করুন</span>
                <span className="xs:hidden">শুরু করুন</span>
              </button>
            </Link>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-800 hover:bg-emerald-800 hover:text-white transition-all cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl overflow-hidden"
            >
              <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
                <a
                  href="#why"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  সুবিধাসমূহ
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  ফিচারসমূহ
                </a>
                <a
                  href="#schools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  প্রতিষ্ঠানসমূহ
                </a>
                <Link
                  href="/quran-tutor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2 border border-emerald-300"
                >
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>নূর AI কুরআন শিক্ষক</span>
                  <span className="bg-[#D4AF37] text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ml-auto">NEW</span>
                </Link>
                <a
                  href="#reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  রিভিউ
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  সচরাচর জিজ্ঞাসা (FAQ)
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                >
                  যোগাযোগ
                </a>
              </nav>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWebsiteFormOpen(true);
                  }}
                  className="w-full py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                  <span>তথ্য ফরম পূরণ করুন</span>
                </button>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <button className="w-full py-2.5 text-xs font-bold text-slate-700 hover:text-[#052E2B] border border-slate-300 rounded-xl hover:border-[#052E2B] transition-all">
                    লগইন করুন
                  </button>
                </Link>
                <Link
                  href="/platform-console/organizations/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#052E2B] to-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 border border-emerald-600">
                    <PlusCircle className="h-4 w-4 text-[#D4AF37]" />
                    <span>ফ্রি শুরু করুন</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══ HERO SECTION ══ */}
      <SaaSHeroSection
        onOpenWebsiteForm={() => setIsWebsiteFormOpen(true)}
        onOpenMsgModal={() => setIsMsgModalOpen(true)}
      />

      {/* ══ FEATURES & SHOWCASE ══ */}
      <SaaSFeaturesSection
        whyChooseUs={whyChooseUs}
        featureTabs={featureTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        features={features}
        showcaseSchools={showcaseSchools}
        onOpenWebsiteForm={() => setIsWebsiteFormOpen(true)}
      />

      {/* ══ NUR AI QURAN TUTOR SPOTLIGHT BANNER ══ */}
      <section className="py-14 bg-gradient-to-br from-[#052E2B] via-[#073834] to-[#031d1b] text-white relative overflow-hidden border-y-2 border-[#D4AF37]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-black/20 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-emerald-500/30">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>প্রোপাইটরি এআই প্রযুক্তি • ২৪/৭ ব্যক্তিগত কুরআন শিক্ষক</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif text-white tracking-tight">
                নূর AI কুরআন শিক্ষক <span className="text-[#D4AF37]">(Nur AI Quran Tutor)</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                তাজবীদ ও ১৭ মাখরাজ বিশ্লেষণ, লাইভ ভয়েস তিলাওয়াত মূল্যায়ন এবং হিফয ক্লাসরুম ট্র্যাকিং — সবক, সাত সবক ও আমুখতা সরাসরি মাদরাসার রেকর্ডের সাথে সংযুক্ত।
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                <span className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-emerald-200">
                  🎯 ৬-ধাপের পেডাগজিক্যাল লুপ
                </span>
                <span className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-emerald-200">
                  🎙️ লাইভ অডিও মূল্যায়ন
                </span>
                <span className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/15 text-emerald-200">
                  📖 ১৭টি মাখরাজ ভিউয়ার
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 w-full lg:w-auto">
              <Link href="/quran-tutor" className="w-full">
                <button className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4" />
                  <span>নূর AI কুরআন শিক্ষক পেজে যান →</span>
                </button>
              </Link>
              <Link href="/quran-tutor/studio" className="w-full">
                <button className="w-full px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2">
                  <Bot className="h-4 w-4 text-emerald-400" />
                  <span>সরাসরি স্টুডিওতে অনুশীলন করুন</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS, PORTALS, FAQ, FINAL CTA ══ */}
      <SaaSFaqSection
        reviews={reviews}
        faqs={faqs}
        onOpenWebsiteForm={() => setIsWebsiteFormOpen(true)}
        onOpenMsgModal={() => setIsMsgModalOpen(true)}
      />

      {/* ══ FOOTER ══ */}
      <SaaSFooter />

      {/* ══ FLOATING QUICK MESSAGE / WEBSITE FORM BUTTON ══ */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsWebsiteFormOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-amber-500/30 transition-all flex items-center gap-2 border-2 border-slate-900 cursor-pointer max-w-[calc(100vw-2rem)]"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>
        <FileSpreadsheet className="h-4 w-4 fill-slate-950 shrink-0" />
        <span className="hidden sm:inline">আপনার প্রতিষ্ঠানকে অনলাইনে অন্তর্ভুক্ত করতে তথ্য ফরম পূরণ করুন</span>
        <span className="sm:hidden font-black">তথ্য ফরম পূরণ করুন</span>
      </motion.button>

      {/* ══ FULL INSTITUTION WEBSITE ONBOARDING FORM MODAL ("তথ্য ফরম") ══ */}
      <WebsiteOnboardingModal
        isOpen={isWebsiteFormOpen}
        onClose={() => setIsWebsiteFormOpen(false)}
      />

      {/* ══ QUICK MESSAGE MODAL POPUP ══ */}
      <ContactMessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
      />
    </div>
  );
}
