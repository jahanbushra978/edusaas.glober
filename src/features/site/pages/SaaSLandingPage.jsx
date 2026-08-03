"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { 
  Building2, GraduationCap, CheckCircle2, ShieldCheck, 
  ArrowRight, Users, Trophy, Monitor, 
  CreditCard, Zap, PlusCircle,
  Lock, UserCheck, Star, PhoneCall, Mail, MapPin, 
  ChevronDown, ExternalLink, Clock, Cpu, MessageSquare,
  HelpCircle, ChevronUp, Globe, Shield, Smartphone,
  BarChart3, Fingerprint, FileText, BellRing, X, Send, CheckCircle, AlertCircle, BookOpen, School, Award, FileSpreadsheet, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateFaqSchema, generateEducationalOrgSchema } from "@/lib/seo";

export default function SaaSLandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("exam");

  // Contact / Message Modal state
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgFormData, setMsgFormData] = useState({ name: "", phone: "", institution: "", message: "" });
  const [isSubmittingMsg, setIsSubmittingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState({ success: null, message: "" });

  // Institution Website Onboarding Form Modal state
  const [isWebsiteFormOpen, setIsWebsiteFormOpen] = useState(false);
  const [websiteFormData, setWebsiteFormData] = useState({
    division: "",
    district: "",
    upazila: "",
    name: "",
    photoUrl: "",
    address: "",
    establishedYear: "",
    mapLink: "",
    founder: "",
    foundingPrincipal: "",
    foundingSecretary: "",
    foundingTeachers: "",
    foundingStats: "",
    alumniInfo: "",
    socialImpact: "",
    gloriousHistory: "",
    futurePlan: "",
    boardAffiliation: "",
    accountsFundInfo: "",
    currentPrincipal: "",
    currentPrincipalPhone: "",
    currentSecretary: "",
    currentTeachersList: "",
    totalStudents: "",
    dawraStudents: "",
    hostelStudents: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    submitterName: "",
    submitterPhone: "",
    submitterEmail: "",
  });
  const [isSubmittingWebsiteForm, setIsSubmittingWebsiteForm] = useState(false);
  const [websiteFormStatus, setWebsiteFormStatus] = useState({ success: null, message: "" });

  const handleSendQuickMsg = async (e) => {
    e.preventDefault();
    if (!msgFormData.name || (!msgFormData.phone && !msgFormData.message)) {
      setMsgStatus({ success: false, message: "দয়া করে আপনার নাম, মোবাইল নম্বর এবং বার্তাটি লিখুন।" });
      return;
    }
    setIsSubmittingMsg(true);
    setMsgStatus({ success: null, message: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgFormData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMsgStatus({ success: true, message: data.message || "আপনার মেসেজটি সফলভাবে মূল SaaS ড্যাশবোর্ডে জমা হয়েছে!" });
        setMsgFormData({ name: "", phone: "", institution: "", message: "" });
      } else {
        setMsgStatus({ success: false, message: data.message || "বার্তা পাঠাতে ব্যর্থ হয়েছে।" });
      }
    } catch (err) {
      setMsgStatus({ success: false, message: "সার্ভারে কানেক্ট হতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  const handleWebsiteFormSubmit = async (e) => {
    e.preventDefault();
    if (!websiteFormData.name || !websiteFormData.submitterName || !websiteFormData.submitterPhone) {
      setWebsiteFormStatus({ success: false, message: "দয়া করে প্রতিষ্ঠানের নাম এবং আপনার নাম ও মোবাইল নম্বর সঠিকভাবে প্রদান করুন।" });
      return;
    }
    setIsSubmittingWebsiteForm(true);
    setWebsiteFormStatus({ success: null, message: "" });

    try {
      const res = await fetch("/api/onboarding-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(websiteFormData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setWebsiteFormStatus({ success: true, message: data.message });
      } else {
        setWebsiteFormStatus({ success: false, message: data.message || "ফরম জমা হতে ব্যর্থ হয়েছে।" });
      }
    } catch (err) {
      setWebsiteFormStatus({ success: false, message: "সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    } finally {
      setIsSubmittingWebsiteForm(false);
    }
  };

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
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#why" className="hover:text-[#052E2B] transition-colors">সুবিধাসমূহ</a>
            <a href="#features" className="hover:text-[#052E2B] transition-colors">ফিচার</a>
            <a href="#schools" className="hover:text-[#052E2B] transition-colors">প্রতিষ্ঠানসমূহ</a>
            <a href="#reviews" className="hover:text-[#052E2B] transition-colors">রিভিউ</a>
            <a href="#faq" className="hover:text-[#052E2B] transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-[#052E2B] transition-colors">যোগাযোগ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
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
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#052E2B] to-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 border border-emerald-600">
                <PlusCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>ফ্রি শুরু করুন</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO SECTION — PREMIUM FULL-SCREEN
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/edusaas-hero-bg.jpg"
            alt="EduSaaS Global — Smart School & Madrasa ERP Platform"
            fill
            priority
            className="object-cover object-center"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#010b0a]/95 via-[#052E2B]/85 to-[#041a14]/90" />
          <div className="absolute top-1/3 left-1/5 w-[700px] h-[700px] bg-emerald-600/12 rounded-full blur-[130px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/5 w-[550px] h-[550px] bg-[#D4AF37]/10 rounded-full blur-[110px] animate-pulse" style={{animationDelay: "1.5s"}} />
          <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px)`, backgroundSize: "40px 40px"}} />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT: Hero Content */}
            <div className="space-y-6 text-center lg:text-left">

              {/* ── Eyebrow Pill ── */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#06382c]/90 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md"
              >
                <span>• EDUSAAS GLOBAL PLATFORM •</span>
              </motion.div>

              {/* ── Main Headline ── */}
              <div className="space-y-1">
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "105%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[2.5rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black text-white leading-[1.12] tracking-tight font-bengali"
                    style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                  >
                    শিক্ষা প্রতিষ্ঠান
                  </motion.h1>
                </div>

                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "105%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[2.5rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black text-white leading-[1.12] tracking-tight font-bengali"
                    style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                  >
                    পরিচালনায় এখন
                  </motion.h1>
                </div>

                <div className="overflow-hidden pt-1">
                  <motion.div
                    initial={{ y: "105%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ delay: 0.37, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h1
                      className="relative text-[2.5rem] sm:text-[3.3rem] lg:text-[3.9rem] xl:text-[4.4rem] font-black leading-[1.15] tracking-tight inline-block font-bengali"
                      style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
                    >
                      <span
                        style={{
                          backgroundImage: "linear-gradient(100deg, #7A5523 0%, #C9963C 18%, #F0C85A 35%, #FFF0A0 50%, #F0C85A 65%, #C9963C 82%, #7A5523 100%)",
                          backgroundSize: "250% auto",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          color: "transparent",
                          animation: "goldShimmer 5s linear infinite",
                          filter: "drop-shadow(0 2px 24px rgba(212,175,55,0.6))",
                          display: "inline",
                        }}
                      >
                        স্মার্ট ডিজিটাল সমাধান
                      </span>

                      <motion.span
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute -bottom-2 left-0 right-0 h-[3px] origin-left rounded-full block"
                        style={{
                          background: "linear-gradient(90deg, #D4AF37, #FFE87C 55%, transparent)",
                          boxShadow: "0 0 14px 3px rgba(212,175,55,0.5)",
                        }}
                      />
                    </h1>
                  </motion.div>
                </div>

                <style>{`
                  @keyframes goldShimmer {
                    0%   { background-position: 250% center; }
                    100% { background-position: -250% center; }
                  }
                `}</style>
              </div>

              {/* ── Subtitle ── */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                className="text-base sm:text-[1.05rem] text-slate-300/90 leading-[1.85] font-medium max-w-xl mx-auto lg:mx-0"
              >
                হাজারো প্রতিষ্ঠান একটি ক্লাউড নেটওয়ার্কে যুক্ত — ওয়েবসাইট, বায়োমেট্রিক হাজিরা, অটো রেজাল্ট, ফি কালেকশন ও অভিভাবক SMS।
              </motion.p>

              {/* ── CTA Buttons ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3.5 justify-center lg:justify-start"
              >
                <Link href="/platform-console/organizations/new">
                  <button className="group relative px-7 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-2xl shadow-amber-900/40 hover:shadow-amber-500/50 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">🚀 বিনামূল্যে শুরু করুন</span>
                    <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button 
                  onClick={() => setIsWebsiteFormOpen(true)}
                  className="px-6 py-4 rounded-2xl bg-amber-500/15 backdrop-blur-md border border-amber-400/40 text-amber-200 font-bold text-sm hover:bg-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <FileSpreadsheet className="h-4 w-4 text-[#D4AF37]" />
                  <span>📄 তথ্য ফরম পূরণ করুন</span>
                </button>
                <button 
                  onClick={() => setIsMsgModalOpen(true)}
                  className="px-6 py-4 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-200 font-bold text-sm hover:bg-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>💬 মেসেজ পাঠান</span>
                </button>
              </motion.div>

              {/* ── Trust Strip ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] text-slate-400 font-semibold justify-center lg:justify-start pt-1"
              >
                {[
                  { icon: "✅", text: "সেটআপ ফি শূন্য" },
                  { icon: "⚡", text: "৫ মিনিটে চালু" },
                  { icon: "🔒", text: "এনক্রিপ্টেড ডাটা" },
                  { icon: "📱", text: "মোবাইল ফার্স্ট" },
                ].map(t => (
                  <span key={t.text} className="flex items-center gap-1.5">
                    <span>{t.icon}</span> <span className="text-slate-300">{t.text}</span>
                  </span>
                ))}
              </motion.div>
            </div>

            {/* RIGHT: Cloud Network Hub Orbit Visualizer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3, duration: 0.7 }} 
              className="relative hidden lg:flex items-center justify-center min-h-[480px]"
            >
              {/* Top Right Institution Counter Badge */}
              <div className="absolute top-0 right-0 z-20 flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-xl">
                <GraduationCap className="h-4 w-4" />
                <span>🎓 ১,২০০+ প্রতিষ্ঠান</span>
              </div>

              {/* Central Outer Orbit Circle Container */}
              <div className="relative w-[440px] h-[440px] flex items-center justify-center">
                
                {/* Connecting Lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 440 440">
                  <line x1="220" y1="220" x2="220" y2="50" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="370" y2="120" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="400" y2="260" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="350" y2="380" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="90" y2="380" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="40" y2="260" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <line x1="220" y1="220" x2="80" y2="120" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                </svg>

                {/* CENTRAL HUB CIRCLE */}
                <motion.div 
                  animate={{ scale: [1, 1.03, 1] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-br from-[#064235] via-[#052E2B] to-[#021815] border-4 border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-center p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-1 text-emerald-300">
                    <Globe className="h-5 w-5" />
                  </div>
                  <span className="font-black text-white text-sm font-serif leading-none">EduSaaS</span>
                  <span className="text-[10px] text-[#D4AF37] font-bold">.global</span>
                  <span className="mt-2 text-[9px] font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ১,২০০+ যুক্ত
                  </span>
                </motion.div>

                {/* ORBITING BRANCH NODE 1: Top (উত্তরা শাখা) */}
                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 left-[170px] z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 mb-1">
                      🏫
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">উত্তরা শাখা</span>
                    <span className="text-[8px] text-emerald-300 font-bold">১,২০০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 2: Top Right (মিরপুর শাখা) */}
                <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute top-[80px] right-2 z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 mb-1">
                      🏛️
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">মিরপুর শাখা</span>
                    <span className="text-[8px] text-amber-300 font-bold">৮৮০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 3: Right (গাজীপুর শাখা) */}
                <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[210px] -right-6 z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-300 mb-1">
                      🎓
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">গাজীপুর শাখা</span>
                    <span className="text-[8px] text-emerald-300 font-bold">৭৫০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 4: Bottom Right (চট্টগ্রাম শাখা) */}
                <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute bottom-[20px] right-[40px] z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-1">
                      🏢
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">চট্টগ্রাম শাখা</span>
                    <span className="text-[8px] text-blue-300 font-bold">৯২০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 5: Bottom Left (নারায়ণগঞ্জ শাখা) */}
                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.8, repeat: Infinity }} className="absolute bottom-[20px] left-[50px] z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-1">
                      📚
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">নারায়ণগঞ্জ</span>
                    <span className="text-[8px] text-teal-300 font-bold">৬৫০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 6: Left (সিলেট শাখা) */}
                <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 3.4, repeat: Infinity }} className="absolute top-[210px] -left-6 z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-1">
                      🌟
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">সিলেট শাখা</span>
                    <span className="text-[8px] text-amber-300 font-bold">৫৮০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* ORBITING BRANCH NODE 7: Top Left (আল-নূর একাডেমি) */}
                <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4.2, repeat: Infinity }} className="absolute top-[80px] left-2 z-10">
                  <div className="bg-[#082a22]/90 border border-emerald-500/40 rounded-2xl p-2.5 shadow-xl text-center flex flex-col items-center min-w-[90px]">
                    <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-1">
                      ✨
                    </div>
                    <span className="text-[9px] font-black text-white leading-tight">আল-নূর একাডেমি</span>
                    <span className="text-[8px] text-emerald-300 font-bold">১,১০০+ ছাত্র</span>
                  </div>
                </motion.div>

                {/* Bottom Left Connected Badge */}
                <div className="absolute -bottom-6 left-0 z-20 flex items-center gap-1.5 bg-[#03241c] border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>● সকল শাখা সংযুক্ত</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom Stats Bar ── */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-20">
            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60 font-mono">Platform Metrics</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
                    className="bg-white/5 backdrop-blur-md border border-white/8 rounded-2xl px-4 py-5 text-center group cursor-default transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-4.5 w-4.5 text-[#D4AF37]" />
                    </div>
                    <p className="text-[1.65rem] font-black text-white font-mono leading-none tracking-tight">{s.number}</p>
                    <p className="text-[11px] font-bold text-[#D4AF37]/90 mt-1.5 leading-tight">{s.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 font-medium">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US SECTION ══ */}
      <section id="why" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full inline-block">কেন EduSaaS বেছে নেবেন?</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">
            কেন একটি মাদরাসা এই Platform ব্যবহার করবে?
          </h2>
          <p className="text-sm text-slate-500 mt-3 max-w-2xl mx-auto font-medium">
            হাজার মাদরাসার অভিজ্ঞতা থেকে তৈরি, বাংলাদেশের শিক্ষাপ্রতিষ্ঠানের জন্য বিশেষভাবে ডিজাইন করা।
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div key={idx} whileHover={{ y: -5, scale: 1.01 }} className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#052E2B] to-emerald-700 text-[#D4AF37] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.badge}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ INTERACTIVE FEATURES TAB SECTION ══ */}
      <section id="features" className="py-20 bg-gradient-to-b from-[#052E2B] to-[#031d1b] text-white px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-white/8 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-block">অল-ইন-ওয়ান সমাধান</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 font-serif">একটি প্ল্যাটফর্মে সবকিছু</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {Object.entries(featureTabs).map(([key, tab]) => {
              const Icon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === key
                      ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 shadow-lg scale-105"
                      : "bg-white/8 text-white/70 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {Object.entries(featureTabs).map(([key, tab]) => {
              if (key !== activeTab) return null;
              const Icon = tab.icon;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${tab.color} shadow-xl mb-5`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-serif mb-4">{tab.title}</h3>
                    <p className="text-sm text-emerald-100/80 leading-relaxed font-medium mb-6">{tab.desc}</p>
                    <div className="space-y-3">
                      {tab.points.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/6 border border-white/10 rounded-xl px-4 py-3">
                          <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          <span className="text-sm font-semibold text-white/90">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/6 border border-white/10 rounded-3xl p-8 text-center">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${tab.color} flex items-center justify-center mx-auto shadow-2xl mb-4`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-lg font-black text-white mb-2 font-serif">{tab.label} মডিউল</p>
                    <p className="text-xs text-white/50">সম্পূর্ণ ডিজিটাল ও অটোমেটেড</p>
                    <button 
                      onClick={() => setIsWebsiteFormOpen(true)}
                      className={`mt-6 px-7 py-3 rounded-xl bg-gradient-to-r ${tab.color} text-white font-bold text-xs shadow-lg hover:scale-105 transition-all`}
                    >
                      তথ্য ফরম পূরণ করুন →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-white/90 leading-tight">{f.title}</p>
                  <p className="text-[9px] text-white/40 mt-1">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ ONBOARDED SCHOOLS ══ */}
      <section id="schools" className="py-20 px-4 sm:px-8 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full inline-block">সক্রিয় নেটওয়ার্ক</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-3 font-serif">প্ল্যাটফর্মে যুক্ত সেরা প্রতিষ্ঠানসমূহ</h2>
            </div>
            <Link href="/platform-console/organizations">
              <button className="text-xs font-black text-[#052E2B] bg-white border border-slate-200 hover:border-[#052E2B] shadow-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:shadow">
                সকল প্রতিষ্ঠান দেখুন <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseSchools.map((s, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">{s.badge}</span>
                  <span className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border">{s.students}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center text-[#D4AF37] mb-4 font-black text-lg font-serif shadow-md">
                  {s.name[0]}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {s.location}
                </p>
                <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-medium border border-slate-100 mb-4">
                  {s.type}
                </div>
                <Link href="/?view=school" className="text-xs font-bold text-[#052E2B] flex items-center gap-1 hover:underline">
                  <span>লাইভ সাইট দেখুন</span> <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CUSTOMER REVIEWS ══ */}
      <section id="reviews" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full inline-block">রিয়েল রিভিউ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">মুহতামিম ও শিক্ষকদের অভিজ্ঞতা</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {reviews.map((rev, idx) => (
            <motion.div key={idx} whileHover={{ y: -5 }} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#052E2B] via-emerald-600 to-[#D4AF37]" />
              <div className="flex items-center gap-0.5 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6 italic">"{rev.comment}"</p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#052E2B] to-emerald-700 text-white flex items-center justify-center font-black text-sm border-2 border-[#D4AF37]">
                  {rev.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{rev.name}</p>
                  <p className="text-[11px] text-slate-500">{rev.role}, {rev.institution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ PORTALS SECTION ══ */}
      <section id="portals" className="py-16 bg-slate-50 border-y border-slate-200/60 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full inline-block">লাইভ ডেমো</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">সরাসরি পোর্টালে প্রবেশ করুন</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: "শিক্ষার্থী ও অভিভাবক", desc: "রেজাল্ট, হাজিরা, ফি রসিদ ও অগ্রগতি ট্র্যাকার", href: "/StudentLogin", color: "from-emerald-600 to-teal-700", btn: "স্টুডেন্ট পোর্টাল →" },
              { icon: UserCheck, title: "শিক্ষক ও স্টাফ প্যানেল", desc: "হাজিরা, নাম্বার এন্ট্রি ও দৈনিক ট্র্যাকার", href: "/TeacherLogin", color: "from-blue-600 to-indigo-700", btn: "টিচার পোর্টাল →" },
              { icon: Lock, title: "অ্যাডমিন ও পরিচালনা", desc: "ভর্তি, ফি, ওয়েবসাইট ও সম্পূর্ণ ERP", href: "/AdminLogin", color: "from-[#052E2B] to-emerald-900", btn: "অ্যাডমিন প্যানেল →" },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <div className={`w-13 h-13 p-3.5 rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-md inline-flex mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">{p.desc}</p>
                  <Link href={p.href}>
                    <button className={`w-full py-3 rounded-xl bg-gradient-to-r ${p.color} text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md`}>
                      {p.btn}
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#052E2B] bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full inline-block">প্রশ্নোত্তর</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#052E2B] mt-4 font-serif">সচরাচর জিজ্ঞাসিত প্রশ্ন</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`bg-white rounded-2xl border transition-all ${isOpen ? "border-[#052E2B]/30 shadow-md" : "border-slate-200 shadow-sm"} overflow-hidden`}>
                <button onClick={() => setActiveFaq(isOpen ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left">
                  <span className="flex items-center gap-3 font-bold text-sm text-slate-900">
                    <HelpCircle className={`h-4.5 w-4.5 shrink-0 ${isOpen ? "text-[#052E2B]" : "text-[#D4AF37]"}`} />
                    {faq.question}
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-[#052E2B] shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 px-6 py-4 bg-emerald-50/50 text-sm text-slate-600 font-medium leading-relaxed">
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ FINAL CTA BANNER ══ */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#052E2B] via-[#031d1b] to-emerald-950" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`}} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

          <div className="relative z-10 px-8 sm:px-14 py-14 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-white/8 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full inline-block mb-5">আজই শুরু করুন</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-serif leading-tight mb-4">
              আপনার প্রতিষ্ঠানের জন্য আজই<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-amber-300 to-yellow-400">Website ও ERP চালু করুন</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/80 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              কোনো ক্রেডিট কার্ড বা টেকনিক্যাল জ্ঞান ছাড়াই আজই ৩ মিনিটে আপনার প্রতিষ্ঠানের জন্য আধুনিক ক্লাউড প্ল্যাটফর্ম চালু করুন।
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => setIsWebsiteFormOpen(true)}
                className="px-10 py-4.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-2xl shadow-amber-900/40 hover:scale-105 transition-all flex items-center gap-2.5 border border-amber-300"
              >
                <FileSpreadsheet className="h-5 w-5 text-slate-950" />
                <span>অনলাইন তথ্য ফরম পূরণ করুন</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsMsgModalOpen(true)}
                className="px-8 py-4.5 rounded-2xl bg-white/8 border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
                <span>মেসেজ লিখুন</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="contact" className="bg-[#020e0c] text-slate-400 pt-16 pb-8 border-t border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#052E2B] to-emerald-700 flex items-center justify-center border border-[#D4AF37]/30">
                <Building2 className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="font-black text-white text-base font-serif">EduSaaS<span className="text-[#D4AF37]">.global</span></span>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Smart Education Platform</p>
              </div>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">বাংলাদেশের স্কুল ও মাদরাসার জন্য #১ ক্লাউড এডটেক প্ল্যাটফর্ম। প্রতিটি প্রতিষ্ঠানের নিজস্ব ডাইনামিক ওয়েবসাইট, বায়োমেট্রিক হাজিরা ও অটো রেজাল্ট ইঞ্জিন।</p>
            <div className="flex gap-3">
              <a href="https://wa.me/8801576600265" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 flex items-center justify-center transition-colors text-slate-400">
                <PhoneCall className="h-4 w-4" />
              </a>
              <a href="mailto:rahkibulislambd788@gmail.com" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 flex items-center justify-center transition-colors text-slate-400">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2.5 text-xs">
              {[["#why", "কেন EduSaaS?"], ["#features", "ফিচারসমূহ"], ["#schools", "নিবন্ধিত প্রতিষ্ঠান"], ["#reviews", "রিভিউ"], ["#faq", "FAQ"]].map(([href, label]) => (
                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">রিসোর্স</h4>
            <ul className="space-y-2.5 text-xs">
              {[["/platform-console/organizations/new", "ফ্রি রেজিস্ট্রেশন"], ["/StudentLogin", "শিক্ষার্থী পোর্টাল"], ["/TeacherLogin", "শিক্ষক পোর্টাল"], ["/AdminLogin", "অ্যাডমিন প্যানেল"], ["/notices", "নোটিশ ও ব্লগ"]].map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-white mb-4 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">সাপোর্ট ও যোগাযোগ</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5"><PhoneCall className="h-4 w-4 text-[#D4AF37] shrink-0" /><a href="tel:01576600265" className="hover:text-white font-mono">01576600265</a></li>
              <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-[#D4AF37] shrink-0" /><a href="mailto:rahkibulislambd788@gmail.com" className="hover:text-white truncate">rahkibulislambd788@gmail.com</a></li>
              <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-[#D4AF37] shrink-0" /><span>ঢাকা, বাংলাদেশ</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <span>© {new Date().getFullYear()} EduSaaS Global. All rights reserved. Built with ❤️ in Bangladesh.</span>
          <div className="flex gap-5">
            {["প্রাইভেসি পলিসি", "শর্তাবলী", "হেল্প সেন্টার"].map(t => (
              <a key={t} href="#" className="hover:text-slate-300 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ══ FLOATING QUICK MESSAGE / WEBSITE FORM BUTTON ══ */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsWebsiteFormOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 text-slate-950 font-black text-xs px-5 py-3.5 rounded-full shadow-2xl hover:shadow-amber-500/30 transition-all flex items-center gap-2.5 border-2 border-slate-900 cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>
        <FileSpreadsheet className="h-4 w-4 fill-slate-950" />
        <span>আপনার প্রতিষ্ঠানকে অনলাইনে অন্তর্ভুক্ত করতে তথ্য ফরম পূরণ করুন</span>
      </motion.button>

      {/* ══ FULL INSTITUTION WEBSITE ONBOARDING FORM MODAL ("তথ্য ফরম") ══ */}
      <AnimatePresence>
        {isWebsiteFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-800 my-auto border border-slate-200 max-h-[92vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsWebsiteFormOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center border-b pb-5 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>EduSaaS Global — অটো ওয়েবসাইট জেনারেটর</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#052E2B] font-serif uppercase tracking-tight">
                  তথ্য ফরম (মাদরাসা ও স্কুল অনলাইন তৈরি)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
                  নিচের ফরমটি সঠিক তথ্য দিয়ে পূরণ করে জমা দিন। এডমিন প্যানেল থেকে এপ্রুভ হলেই আপনার লাইভ ওয়েবসাইটটি তৈরি হয়ে যাবে।
                </p>
              </div>

              <form onSubmit={handleWebsiteFormSubmit} className="space-y-8 text-xs font-sans">

                {/* SECTION 1: Location & General Info */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>১. সাধারণ ও অবস্থান সংক্রান্ত তথ্য</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বিভাগ <span className="text-red-500">★</span></label>
                      <select
                        required
                        value={websiteFormData.division}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, division: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      >
                        <option value="">Select Division</option>
                        {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">জেলা <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: গাজীপুর"
                        value={websiteFormData.district}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, district: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: সদর"
                        value={websiteFormData.upazila}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, upazila: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="প্রতিষ্ঠানের পুরো নাম"
                        value={websiteFormData.name}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, name: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ঠিকানা <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="গ্রাম/রোড, পোস্ট অফিস"
                        value={websiteFormData.address}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, address: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠা কাল <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ১৯৯৫ ইং"
                        value={websiteFormData.establishedYear}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, establishedYear: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ছবি / লোগো (URL / Link)</label>
                      <input
                        type="text"
                        placeholder="ছবি বা লোগোর গুগল ড্রাইভ / ইমেজ লিঙ্ক"
                        value={websiteFormData.photoUrl}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, photoUrl: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">গুগল ম্যাপস অবস্থান লিঙ্ক (Google Maps Link) 🗺️</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={websiteFormData.mapLink}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, mapLink: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white font-mono text-slate-600 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Founders & Early History */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>২. প্রতিষ্ঠাতা ও দায়িত্বশীলবর্গ</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাতা <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="প্রতিষ্ঠাতার নাম"
                        value={websiteFormData.founder}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, founder: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন মুহতামিম <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="প্রতিষ্ঠাকালিন মুহতামিম"
                        value={websiteFormData.foundingPrincipal}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingPrincipal: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন শিক্ষাসচিব <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="প্রতিষ্ঠাকালিন শিক্ষাসচিব"
                        value={websiteFormData.foundingSecretary}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingSecretary: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন শিক্ষকবৃন্দ <span className="text-red-500">★</span></label>
                      <textarea
                        required
                        rows={2}
                        placeholder="প্রতিষ্ঠাকালিন শিক্ষকবৃন্দের তালিকা..."
                        value={websiteFormData.foundingTeachers}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingTeachers: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠাকালিন জামাত সংখ্যা, বর্তমান সমাপনী জামাত / উদ্বোধনী সন <span className="text-red-500">★</span></label>
                      <textarea
                        required
                        rows={2}
                        placeholder="বিবরণ লিখুন..."
                        value={websiteFormData.foundingStats}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, foundingStats: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Detailed History & Impact */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span>৩. ইতিহাস, অর্জন ও সামাজিক অবদান</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">প্রাক্তন কৃতি শিক্ষার্থীদের নাম ও বর্তমান অবস্থান</label>
                      <textarea
                        rows={2}
                        placeholder="কৃতি শিক্ষার্থীদের বিবরণ..."
                        value={websiteFormData.alumniInfo}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, alumniInfo: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">অত্র অঞ্চলে নিরক্ষরতা দূরীকরণ ও সামাজিক অবদান</label>
                      <textarea
                        rows={2}
                        placeholder="সামাজিক ও সাংস্কৃতিক পরিবর্তনের অবদান..."
                        value={websiteFormData.socialImpact}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, socialImpact: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মাদরাসার স্বর্ণোজ্জ্বল ইতিহাস</label>
                      <textarea
                        rows={2}
                        placeholder="ইতিহাস লিখুন..."
                        value={websiteFormData.gloriousHistory}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, gloriousHistory: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মাদরাসার বর্তমান অবস্থা ও আগামী পরিকল্পনা</label>
                      <textarea
                        rows={2}
                        placeholder="আগামী পরিকল্পনা..."
                        value={websiteFormData.futurePlan}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, futurePlan: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মাদরাসাটি কোন বোর্ডের অধীনে</label>
                      <input
                        type="text"
                        placeholder="যেমন: বেফাকুল মাদারিসিল আরাবিয়া"
                        value={websiteFormData.boardAffiliation}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, boardAffiliation: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মাদরাসার হিসাব ব্যবস্থা / ফান্ড</label>
                      <input
                        type="text"
                        placeholder="হিসাব ব্যবস্থা বা ফান্ডের বিবরণ"
                        value={websiteFormData.accountsFundInfo}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, accountsFundInfo: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Present Committee & Student Metrics */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>৪. বর্তমান পরিচালনা পর্ষদ ও শিক্ষার্থী সংখ্যা</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বর্তমান মুহতামিম / প্রধান শিক্ষক</label>
                      <input
                        type="text"
                        placeholder="নাম লিখুন"
                        value={websiteFormData.currentPrincipal}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentPrincipal: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বর্তমান মুহতামিমের মোবাইল নম্বর</label>
                      <input
                        type="tel"
                        placeholder="+88017XXXXXXXX"
                        value={websiteFormData.currentPrincipalPhone}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentPrincipalPhone: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বর্তমান শিক্ষাসচিব</label>
                      <input
                        type="text"
                        placeholder="নাম লিখুন"
                        value={websiteFormData.currentSecretary}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentSecretary: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান শিক্ষকবৃন্দের তালিকা</label>
                    <textarea
                      rows={2}
                      placeholder="বর্তমান সকল শিক্ষকদের তালিকা..."
                      value={websiteFormData.currentTeachersList}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, currentTeachersList: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="pt-2">
                    <p className="font-bold text-slate-800 mb-2">চলমান ছাত্র সংখ্যা:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">মোট ছাত্র সংখ্যা</label>
                        <input
                          type="number"
                          placeholder="যেমন: ৮৫০"
                          value={websiteFormData.totalStudents}
                          onChange={(e) => setWebsiteFormData({ ...websiteFormData, totalStudents: e.target.value })}
                          className="w-full border rounded-xl p-2.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">দাওরায়ে হাদীস / সমাপনী জামাত</label>
                        <input
                          type="text"
                          placeholder="যেমন: ১২০ জন"
                          value={websiteFormData.dawraStudents}
                          onChange={(e) => setWebsiteFormData({ ...websiteFormData, dawraStudents: e.target.value })}
                          className="w-full border rounded-xl p-2.5 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">ছাত্রাবাসে অবস্থানরত ছাত্র</label>
                        <input
                          type="text"
                          placeholder="যেমন: ৪৫০ জন"
                          value={websiteFormData.hostelStudents}
                          onChange={(e) => setWebsiteFormData({ ...websiteFormData, hostelStudents: e.target.value })}
                          className="w-full border rounded-xl p-2.5 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: SEO Configuration */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b pb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    <span>৫. SEO কাস্টমাইজেশন (Search Engine Optimization) 🔍</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">গুগল মেটা টাইটেল (SEO Title)</label>
                      <input
                        type="text"
                        placeholder="যেমন: জামিয়া ইসলামিয়া | আদর্শ দ্বীনি শিক্ষাপ্রতিষ্ঠান"
                        value={websiteFormData.seoTitle}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoTitle: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">কীওয়ার্ডস (SEO Keywords)</label>
                      <input
                        type="text"
                        placeholder="মাদরাসা, রেজাল্ট শিট, অনলাইন ভর্তি"
                        value={websiteFormData.seoKeywords}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoKeywords: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">গুগল মেটা ডেসক্রিপশন (SEO Description)</label>
                    <textarea
                      rows={2}
                      placeholder="গুগলে সার্চ করলে আপনার প্রতিষ্ঠান সম্পর্কে কী ডেসক্রিপশন দেখাবে..."
                      value={websiteFormData.seoDescription}
                      onChange={(e) => setWebsiteFormData({ ...websiteFormData, seoDescription: e.target.value })}
                      className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* SECTION 6: Submitter Info */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 space-y-4">
                  <h3 className="text-sm font-black text-[#052E2B] border-b border-emerald-200 pb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>৬. তথ্য দানকারীর তথ্য</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">আপনার নাম <span className="text-red-500">★</span></label>
                      <input
                        type="text"
                        required
                        placeholder="আপনার নাম"
                        value={websiteFormData.submitterName}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterName: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মোবাইল <span className="text-red-500">★</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="01576600265"
                        value={websiteFormData.submitterPhone}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterPhone: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ইমেইল</label>
                      <input
                        type="email"
                        placeholder="ইমেইল অ্যাড্রেস"
                        value={websiteFormData.submitterEmail}
                        onChange={(e) => setWebsiteFormData({ ...websiteFormData, submitterEmail: e.target.value })}
                        className="w-full border rounded-xl p-2.5 bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {websiteFormStatus.message && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${websiteFormStatus.success ? "bg-emerald-100 border border-emerald-300 text-emerald-800" : "bg-red-100 border border-red-300 text-red-800"}`}>
                    {websiteFormStatus.success ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
                    <span>{websiteFormStatus.message}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmittingWebsiteForm}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#052E2B] via-emerald-800 to-teal-900 text-white font-black text-sm shadow-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingWebsiteForm ? (
                      <span>জমা নেওয়া হচ্ছে...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 text-[#D4AF37]" />
                        <span>ফরম সাবমিট করুন (এডমিন এপ্রুভালে লাইভ হবে)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWebsiteFormOpen(false)}
                    className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ QUICK MESSAGE MODAL POPUP ══ */}
      <AnimatePresence>
        {isMsgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#072421] border border-emerald-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
            >
              <button
                onClick={() => setIsMsgModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-slate-950 font-black mb-3 shadow-lg">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                  এডমিনকে সরাসরি মেসেজ পাঠান
                </h3>
                <p className="text-xs text-emerald-200/70 mt-1">
                  এখানে মেসেজ পাঠালে তা সরাসরি মূল SaaS এডমিন কনসোলে জমা হবে।
                </p>
              </div>

              <form onSubmit={handleSendQuickMsg} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পুরো নাম লিখুন"
                    value={msgFormData.name}
                    onChange={(e) => setMsgFormData({ ...msgFormData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01576600265"
                    value={msgFormData.phone}
                    onChange={(e) => setMsgFormData({ ...msgFormData, phone: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">মাদ্রাসা / শিক্ষা প্রতিষ্ঠানের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="প্রতিষ্ঠানের নাম"
                    value={msgFormData.institution}
                    onChange={(e) => setMsgFormData({ ...msgFormData, institution: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">বার্তা বা প্রশ্ন *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="আপনার প্রশ্ন বা বার্তা লিখুন..."
                    value={msgFormData.message}
                    onChange={(e) => setMsgFormData({ ...msgFormData, message: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {msgStatus.message && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${msgStatus.success ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400" : "bg-red-500/20 text-red-300 border border-red-400"}`}>
                    {msgStatus.message}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingMsg}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingMsg ? "পাঠানো হচ্ছে..." : "🚀 অটো SaaS সিংক করে পাঠান"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMsgModalOpen(false)}
                    className="px-4 py-3.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-white/50 flex justify-between items-center">
                <span>📞 হটলাইন: <a href="tel:01576600265" className="text-[#D4AF37] font-mono underline">01576600265</a></span>
                <span>✉️ <a href="mailto:rahkibulislambd788@gmail.com" className="text-[#D4AF37] underline">rahkibulislambd788@gmail.com</a></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
