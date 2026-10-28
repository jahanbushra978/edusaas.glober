"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, Mic, Award, Compass, Volume2, Headphones, 
  BarChart3, Trophy, Users, Building2, WifiOff, ShieldCheck, 
  Check, X, ChevronDown, ChevronUp, Play, Square, 
  Star, ArrowRight, Bot, Search, Menu, Baby, Gamepad2, RotateCcw, PenTool
} from "lucide-react";
import { toast } from "sonner";
import QuranSemanticSearchModal from "@/features/ai/components/QuranSemanticSearchModal";

// Audio asset for Bismillah demo
const DEMO_BISMILLAH_AUDIO = "https://everyayah.com/data/Alafasy_128kbps/001001.mp3";

export default function AIQuranTutorPage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Hero audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioConfidence, setAudioConfidence] = useState(92);
  const audioRef = useRef(null);

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Audio Playback simulation
  const togglePlayBismillah = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(DEMO_BISMILLAH_AUDIO);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        toast.info("অডিও প্রিভিউ চলছে...");
      };
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
        // Animate confidence slightly
        const interval = setInterval(() => {
          setAudioConfidence(prev => (prev === 92 ? 94 : prev === 94 ? 91 : 92));
        }, 1200);
        setTimeout(() => clearInterval(interval), 5000);
      }).catch(() => {
        setIsPlayingAudio(true);
        setTimeout(() => setIsPlayingAudio(false), 4500);
      });
    }
  };

  const openNurTeacher = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/quran-tutor/teacher";
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("অনুগ্রহ করে সকল তথ্য পূরণ করুন।");
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      toast.success("মাশাআল্লাহ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।");
      setContactForm({ name: "", email: "", message: "" });
    }, 800);
  };

  // 8 Muslim App Highlight Features (Direct launch into Studio)
  const studioQuickFeatures = [
    {
      id: "quran-reader",
      title: "সম্পূর্ণ কুরআন",
      subtitle: "১১৪ সূরা ও ৩০ জুজ মুসহাফ",
      icon: BookOpen,
      iconBg: "bg-emerald-100 text-emerald-800",
      badge: "পূর্ণাঙ্গ",
      link: "/quran-tutor/studio?feature=quran-reader"
    },
    {
      id: "nur-teacher",
      title: "নূর এআই শিক্ষক",
      subtitle: "৬-স্তরের মাশক ও উচ্চারণ শিক্ষা",
      icon: Users,
      iconBg: "bg-teal-100 text-teal-800",
      badge: "জনপ্রিয়",
      link: "/quran-tutor/studio?feature=nur-teacher"
    },
    {
      id: "live-class",
      title: "লাইভ ক্লাস",
      subtitle: "মুখে মুখে সরাসরি তিলাওয়াত সংশোধন",
      icon: Mic,
      iconBg: "bg-emerald-100 text-emerald-900",
      badge: "ভয়েস লাইভ",
      link: "/quran-tutor/studio?feature=live-class"
    },
    {
      id: "makhraj-3d",
      title: "১৭ মাখরাজ মানচিত্র",
      subtitle: "মুখ ও কণ্ঠনালীর অঙ্গভিত্তিক রূপ",
      icon: Award,
      iconBg: "bg-amber-100 text-amber-900",
      badge: "অ্যানাটমিক্যাল",
      link: "/quran-tutor/studio?feature=makhraj-3d"
    },
    {
      id: "kids-book",
      title: "আমার প্রথম কুরআন",
      subtitle: "শিশুতোষ রঙিন হরফ ও সাউন্ডবুক",
      icon: Baby,
      iconBg: "bg-rose-100 text-rose-800",
      badge: "ছোটদের",
      link: "/quran-tutor/studio?feature=kids-book"
    },
    {
      id: "hifz-assistant",
      title: "হিফজ সহকারী",
      subtitle: "মুখস্থ লুপ ও স্মৃতি পরীক্ষা",
      icon: Compass,
      iconBg: "bg-amber-100 text-amber-800",
      badge: "হিফজ সঙ্গী",
      link: "/quran-tutor/studio?feature=hifz-assistant"
    },
    {
      id: "dawr-companion",
      title: "মুরাযাআ ও দাওর",
      subtitle: "দাওর শোনা, ভুল ধরা ও লোকমা",
      icon: RotateCcw,
      iconBg: "bg-orange-100 text-orange-900",
      badge: "দাওর",
      link: "/quran-tutor/studio?feature=dawr-companion"
    },
    {
      id: "games-hub",
      title: "কুরআন গেমস জোন",
      subtitle: "হরকত বেলুন পপ ও মাখরাজ খেলা",
      icon: Gamepad2,
      iconBg: "bg-purple-100 text-purple-900",
      badge: "গেমস",
      link: "/quran-tutor/studio?feature=games-hub"
    }
  ];

  // 12 Feature Cards (Linking to Studio features)
  const featuresList = [
    {
      icon: BookOpen,
      title: "সম্পূর্ণ কুরআন রিডার",
      desc: "১১৪ সূরা, ৩০ জুজ, অনুবাদ, তাফসির, শব্দে-শব্দে অর্থ, বুকমার্ক ও নোট।",
      badge: "পূর্ণাঙ্গ",
      link: "/quran-tutor/studio?feature=quran-reader"
    },
    {
      icon: Mic,
      title: "এআই শোনার মোড ও লাইভ ক্লাস",
      desc: "ওয়েভফর্ম, নয়েজ রিডাকশন ও লাইভ আত্মবিশ্বাস স্কোরসহ রিয়েল-টাইম মাইক্রোফোন বিশ্লেষণ।",
      badge: "ভয়েস লাইভ",
      link: "/quran-tutor/studio?feature=live-class"
    },
    {
      icon: Award,
      title: "তাজবীদ ও ১৭ মাখরাজ বিশ্লেষণ",
      desc: "মাখরাজ, সিফাত, মাদ, গুন্নাহ, ইখফা, ইদগাম, কলকলা, ওয়াকফ — প্রতিটি নিয়ম বিশ্লেষিত।",
      badge: "অ্যানাটমিক্যাল",
      link: "/quran-tutor/studio?feature=makhraj-3d"
    },
    {
      icon: Compass,
      title: "হিফজ সহকারী ও স্মৃতি পরীক্ষা",
      desc: "স্পেসড রিপিটিশন, ভুলে যাওয়া আয়াত শনাক্তকরণ, উত্তর নয় বরং ইঙ্গিত, এবং দৈনিক মুখস্থ পরিকল্পনা।",
      badge: "হিফজ সঙ্গী",
      link: "/quran-tutor/studio?feature=hifz-assistant"
    },
    {
      icon: Volume2,
      title: "ভয়েস কথোপকথন ও উস্তাদ চ্যাট",
      desc: "এআই শিক্ষককে সশব্দে প্রশ্ন করুন এবং উত্তর শুনুন — যেন ঘরেই একজন আসল শিক্ষক।",
      badge: "ভয়েস চ্যাট",
      link: "/quran-tutor/studio?feature=voice-tutor"
    },
    {
      icon: Headphones,
      title: "একাধিক কারির খাঁটি অডিও",
      desc: "বিখ্যাত কারিরা, আয়াত/পৃষ্ঠা/সূরা রিপিট, প্লেব্যাক স্পিড, লুপ ও অফলাইন ক্যাশ।",
      badge: "ক্বারী অডিও",
      link: "/quran-tutor/studio?feature=quran-reader"
    },
    {
      icon: BarChart3,
      title: "অগ্রগতি ও তিলাওয়াত মূল্যায়ন",
      desc: "সময়ের সাথে নির্ভুলতা, মাখরাজ, তাজবীদ, মুখস্থ ও প্রবাহিতার সততা-ভিত্তিক স্কোর।",
      badge: "স্কোরিং",
      link: "/quran-tutor/studio?feature=recitation-eval"
    },
    {
      icon: Trophy,
      title: "কুরআন গেমস ও ডুওলিঙ্গো কোর্স",
      desc: "হরকত বেলুন পপ, মাখরাজ খেলা, কয়েন, XP, লেভেল, ব্যাজ ও ৩-স্টার পাঠ।",
      badge: "গেমিফিকেশন",
      link: "/quran-tutor/studio?feature=games-hub"
    },
    {
      icon: Users,
      title: "নূর এআই শিক্ষক (৬-স্তরের মাশক)",
      desc: "Explain → Demonstrate → Practice → Evaluate → Correct → Repeat চক্রের পূর্ণাঙ্গ পাঠ।",
      badge: "জনপ্রিয় শিক্ষক",
      link: "/quran-tutor/studio?feature=nur-teacher"
    },
    {
      icon: Baby,
      title: "আমার প্রথম কুরআন শিক্ষা",
      desc: "ছোটদের জন্য রঙিন হরফ, ছবির মাধ্যমে শিক্ষা, সাউন্ড ও শিশুতোষ ইন্টারফেস।",
      badge: "ছোটদের",
      link: "/quran-tutor/studio?feature=kids-book"
    },
    {
      icon: RotateCcw,
      title: "মুরাযাআ ও দাওর সঙ্গী",
      desc: "দ্রুত রিভিশন, দাওর অডিও পর্যবেক্ষণ, লোকমা সতর্কতা ও মুখস্থ যাচাইকরণ।",
      badge: "দাওর সঙ্গী",
      link: "/quran-tutor/studio?feature=dawr-companion"
    },
    {
      icon: PenTool,
      title: "আরবী স্লেট ও ব্ল্যাকবোর্ড",
      desc: "স্ক্রিনে আঙুল বা মাউস দিয়ে আরবী হরফ লেখা, ট্রেসিং ও উচ্চারণ অনুশীলন।",
      badge: "ট্রেসিং",
      link: "/quran-tutor/studio?feature=blackboard"
    }
  ];

  // Comparison Matrix Data
  const comparisonRows = [
    { capability: "২৪/৭ উপলব্ধ", tutor: true, traditional: false },
    { capability: "রিয়েল-টাইম উচ্চারণ সংশোধন", tutor: true, traditional: false },
    { capability: "ভিজ্যুয়াল তাজবীদ অ্যানিমেশন", tutor: true, traditional: false },
    { capability: "স্পেসড-রিপিটিশন হিফজ প্ল্যান", tutor: true, traditional: false },
    { capability: "অগ্রগতি অ্যানালিটিক্স ও পূর্বাভাস", tutor: true, traditional: "সীমিত" },
    { capability: "এআই শিক্ষকের সাথে ভয়েস কথোপকথন", tutor: true, traditional: false },
    { capability: "প্রতিষ্ঠান ERP ও মাল্টি-টেন্যান্ট", tutor: true, traditional: false },
    { capability: "অফলাইন শেখা", tutor: true, traditional: false },
    { capability: "ব্যক্তিগত এআই মেমরি", tutor: true, traditional: false },
  ];

  // Learning Steps
  const learningSteps = [
    {
      step: "ধাপ ১",
      title: "শোনা",
      desc: "এআই আপনার তেলাওয়াত শব্দে শব্দে শোনে এবং উচ্চারণ ট্র্যাক করে।"
    },
    {
      step: "ধাপ ২",
      title: "ব্যাখ্যা",
      desc: "প্রতিটি ভুলের ব্যাখ্যা দেয় — নিয়ম কী, কেন হলো, কীভাবে ঠিক করবেন।"
    },
    {
      step: "ধাপ ৩",
      title: "অনুশীলন",
      desc: "প্রদর্শন করুন, পুনরাবৃত্তি করুন এবং সঠিকভাবে তেলাওয়াত না হওয়া পর্যন্ত যাচাই করুন।"
    },
    {
      step: "ধাপ ৪",
      title: "দক্ষতা",
      desc: "অগ্রগতি ট্র্যাক করা হয়, ব্যক্তিগতকৃত হয় এবং সফল পাঠ উদযাপিত হয়।"
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "তাজবীদ শেখানোর জন্য এআই কি যথেষ্ট নির্ভুল?",
      a: "হ্যাঁ, আমাদের নূর AI ইঞ্জিন আন্তর্জাতিক ক্বারীদের স্ট্যান্ডার্ড ও ১৭টি মাখরাজের নিয়মাবলীর নিখুঁত মডেল অনুসরণ করে। প্রতিটি হরফের সিফাত, মাদ্দ, গুন্নাহ ও ওয়াকফের বিধান রিয়েল-টাইমে বিশ্লেষণ করা হয়।"
    },
    {
      q: "অ্যাপটি কি অফলাইনে কাজ করে?",
      a: "হ্যাঁ, ক্যাশ করা সূরা ও পূর্ববর্তী পাঠ অফলাইনে অনুশীলন করা যায়। ইন্টারনেট সংযোগ পাওয়া মাত্রই আপনার হিফজ অগ্রগতি ক্লাউডে সংরক্ষিত হয়ে যায়।"
    },
    {
      q: "এটি কি শিশু ও নতুনদের জন্য উপযুক্ত?",
      a: "অবশ্যই! নূরানী কায়দা থেকে শুরু করে নাজেরা ও পূর্ণাঙ্গ হিফজ স্তর পর্যন্ত প্রতিটি বয়স ও স্তরের জন্য পৃথক শিক্ষাক্রম রয়েছে। এটি অত্যন্ত ধৈর্যশীল ও বন্ধুত্বপূর্ণ।"
    },
    {
      q: "প্রতিষ্ঠান ও একাডেমির জন্য সাপোর্ট আছে?",
      a: "হ্যাঁ, মাদ্রাসা ও কুরআনিক একাডেমির জন্য সম্পূর্ণ মাল্টি-টেন্যান্ট ERP রয়েছে, যাতে শত শত শিক্ষার্থীকে এক ড্যাশবোর্ডে শিক্ষক ও অভিভাবকসহ পরিচালনা করা যায়।"
    },
    {
      q: "কোন কোন ভাষা সাপোর্ট করে?",
      a: "বর্তমানে বাংলা, আরবি ও ইংরেজি ভাষায় সম্পূর্ণ ইন্টারফেস ও উচ্চারণ গাইড সাপোর্ট করে।"
    },
    {
      q: "আমার অডিও কি প্রাইভেট?",
      a: "সম্পূর্ণ নিরাপদ ও প্রাইভেট। আপনার অডিও কোনো অননুমোদিত তৃতীয় পক্ষের সাথে শেয়ার করা হয় না এবং কঠোর এন্টারপ্রাইজ এনক্রিপশন নীতি মেনে চলা হয়।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* ── STICKY TOP NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-emerald-950 flex items-center gap-1.5 group-hover:text-emerald-700 transition-colors">
                AI Quran Tutor
              </span>
              <span className="hidden sm:inline-block text-[10px] text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                নূর কুরআন শিক্ষক
              </span>
            </div>
          </Link>

          {/* Core Feature Badges (Desktop / Large Screens) */}
          <nav className="hidden xl:flex items-center gap-3 text-xs font-bold text-slate-600">
            <Link 
              href="/quran-tutor/kids" 
              className="text-emerald-950 font-extrabold hover:bg-emerald-200/90 transition-colors flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"
            >
              <span className="text-sm">👶</span>
              <span>আমার প্রথম কুরআন</span>
            </Link>
            <Link 
              href="/quran-tutor/live-class" 
              className="text-emerald-900 font-extrabold hover:bg-emerald-200/80 transition-colors flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm shrink-0 whitespace-nowrap"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>🎙️ লাইভ ক্লাস</span>
            </Link>
            <Link 
              href="/quran-tutor/learning" 
              className="text-amber-950 font-extrabold hover:bg-amber-200/80 transition-colors flex items-center gap-1.5 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm shrink-0 whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>🎮 গেম খেলে শিক্ষা</span>
            </Link>
            <Link 
              href="/quran-tutor/studio?tab=reader" 
              className="text-emerald-800 font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 shrink-0 whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>কুরআন রিডার</span>
            </Link>
            <a href="#features" className="hover:text-emerald-700 transition-colors px-1">ফিচার</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors px-1">পদ্ধতি</a>
            <a href="#pricing" className="hover:text-emerald-700 transition-colors px-1">প্রাইসিং</a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors px-1">FAQ</a>
            <a href="#contact" className="hover:text-emerald-700 transition-colors px-1">যোগাযোগ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link 
              href="/quran-tutor/live-class" 
              className="xl:hidden text-emerald-900 font-extrabold flex items-center gap-1 bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs whitespace-nowrap"
            >
              <Mic className="w-3 h-3 text-emerald-700 animate-pulse" />
              <span>লাইভ ক্লাস</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors whitespace-nowrap"
            >
              <span>← মূল সাইট</span>
            </Link>
            <Link 
              href="/StudentLogin" 
              className="hidden sm:inline-block text-xs font-semibold text-slate-700 hover:text-emerald-700 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              লগইন
            </Link>
            <Link
              href="/quran-tutor/studio"
              className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl hover:from-emerald-700 hover:to-teal-800 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-200" />
              <span>স্টুডিও</span>
            </Link>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileNavOpen && (
          <div className="xl:hidden border-t border-emerald-100 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href="/quran-tutor/kids" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950 col-span-2"
              >
                <span className="text-base">👶</span>
                <span>আমার প্রথম কুরআন শিক্ষা (ছোটদের ছবি ও গেম)</span>
              </Link>
              <Link 
                href="/quran-tutor/live-class" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900"
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>🎙️ লাইভ ক্লাস</span>
              </Link>
              <Link 
                href="/quran-tutor/learning" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>🎮 গেম খেলে কুরআন শিক্ষা</span>
              </Link>
              <Link 
                href="/quran-tutor/studio?tab=reader" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>সম্পূর্ণ কুরআন</span>
              </Link>
              <Link 
                href="/StudentLogin" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>শিক্ষার্থী লগইন</span>
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
              <a href="#features" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">ফিচার</a>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">পদ্ধতি</a>
              <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">প্রাইসিং</a>
              <a href="#testimonials" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">রিভিউ</a>
              <a href="#faq" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">প্রশ্নোত্তর</a>
              <a href="#contact" onClick={() => setMobileNavOpen(false)} className="hover:text-emerald-700">যোগাযোগ</a>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F0FAF4] via-[#F8FCF9] to-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-br from-emerald-200/40 to-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>এআই-চালিত • ২৪/৭ ব্যক্তিগত কুরআন শিক্ষক</span>
              </div>

              <h1 
                className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 leading-[1.3] font-bengali tracking-tight"
                style={{ fontFamily: "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif" }}
              >
                আপনার ব্যক্তিগত{" "}
                <span className="text-emerald-700 font-black">
                  এআই কুরআন শিক্ষক
                </span>
                <span className="block mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-700 leading-snug">
                  সবসময় ধৈর্যশীল, সবসময় পথপ্রদর্শক।
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                এমন এক এআই-এর সাথে তেলাওয়াত শিখুন, তাজবীদে দক্ষ হন এবং কুরআন মুখস্থ করুন যে শোনে, সংশোধন করে, ব্যাখ্যা দেয় এবং আপনার সাথে মানিয়ে নেয় — যেন একজন যোগ্য শিক্ষক পাশেই বসে আছেন।
              </p>

              {/* Action Buttons: 2-Tier Structured Layout */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/quran-tutor/kids"
                    className="px-6 py-3.5 text-sm sm:text-base font-black text-emerald-950 bg-gradient-to-r from-emerald-200 via-teal-200 to-amber-200 hover:from-emerald-300 hover:to-amber-300 border-2 border-emerald-500 rounded-full shadow-md shadow-emerald-900/15 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="text-xl">👶</span>
                    <span>আমার প্রথম কুরআন শিক্ষা</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform text-emerald-800" />
                  </Link>

                  <Link
                    href="/quran-tutor/live-class"
                    className="px-6 py-3.5 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-[#0d7a5f] to-[#0a634d] hover:opacity-95 rounded-full shadow-md shadow-emerald-900/15 active:scale-95 transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Mic className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>🎙️ লাইভ ক্লাস</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/quran-tutor/learning"
                    className="px-6 py-3.5 text-sm sm:text-base font-extrabold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-full shadow-md shadow-amber-900/15 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <Award className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>🎮 গেম খেলে শিক্ষা</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                  <Link
                    href="/quran-tutor/studio?tab=reader"
                    className="px-5 py-2 text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>সম্পূর্ণ কুরআন পড়ুন</span>
                  </Link>

                  <button
                    onClick={togglePlayBismillah}
                    className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
                        <span>অডিও থামান</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
                        <span>লাইভ ডেমো শুনুন</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-full transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সূরা সার্চ</span>
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="pt-8 border-t border-emerald-200/60 grid grid-cols-3 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">১১৪</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">সূরা</div>
                </div>
                <div className="border-x border-emerald-200">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">৩০</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">জুজ</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-800">৫</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">রোল ড্যাশবোর্ড</div>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive AI Listening Demo (Exact match with user showcase) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/10 border border-emerald-100 relative overflow-hidden transition-all duration-300 hover:shadow-emerald-900/15">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-slate-600">এআই শোনা</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    রিয়েল-টাইম
                  </span>
                </div>

                <div className="py-6 text-center space-y-4">
                  {/* Calligraphy Box */}
                  <div className="p-5 rounded-2xl bg-[#092218] text-white shadow-inner relative overflow-hidden">
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-300 tracking-wide leading-relaxed">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                    <div className="text-xs text-emerald-100/80 mt-2 font-medium">
                      শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু
                    </div>
                  </div>

                  {/* Animated Waveform */}
                  <div className="flex items-center justify-center gap-1.5 h-12 px-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <button 
                      onClick={togglePlayBismillah} 
                      className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow hover:bg-emerald-700 transition mr-2 shrink-0"
                      title={isPlayingAudio ? "Stop" : "Play Bismillah"}
                    >
                      {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>
                    {[40, 65, 85, 45, 95, 70, 50, 90, 60, 75, 45, 80, 55].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full bg-emerald-500 transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : 'opacity-60'}`}
                        style={{ height: isPlayingAudio ? `${Math.max(12, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : `${h * 0.4}%` }}
                      />
                    ))}
                  </div>

                  {/* Listening Confidence Status */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${isPlayingAudio ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                      {isPlayingAudio ? "শুনছি… বিশ্লেষণ চলছে" : "স্ট্যান্ডবাই মোড"}
                    </span>
                    <span className="font-bold text-emerald-700">
                      আত্মবিশ্বাস {audioConfidence}%
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={openNurTeacher}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition shadow shadow-emerald-700/20 flex items-center justify-center gap-2"
                  >
                    <span>মাইক দিয়ে নিজের তিলাওয়াত যাচাই করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 📱 MUSLIM APP HIGHLIGHTED FEATURE GRID (One-Click Launch into Studio) ── */}
      <section className="py-12 bg-[#F6FAF7] border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black mb-2 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>মুসলিম অ্যাপ অনুপ্রাণিত ফিচার হাব</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                নূর এআই প্রধান ফিচার কার্ডসমূহ
              </h2>
              <p className="text-sm text-slate-600 font-medium mt-1">
                যেকোনো কার্ডে ক্লিক করলে সরাসরি দ্বিতীয় পেইজের স্টুডিওতে ফিচারটি সামনে ভেসে উঠবে
              </p>
            </div>

            <Link
              href="/quran-tutor/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D5C43] hover:bg-[#094532] text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer group shrink-0"
            >
              <Bot className="w-4 h-4 text-emerald-200" />
              <span>সম্পূর্ণ স্টুডিও কার্ড ডিরেক্টরি</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 8 Muslim App Quick Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {studioQuickFeatures.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group relative p-4 rounded-3xl bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-36 select-none cursor-pointer active:scale-98"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-0.5 pt-2">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight line-clamp-1 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-600 shrink-0" />
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CORE VALUE FEATURES: কুরআন শিখুন যার যা দরকার, সবই ── */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              কুরআন শিখুন যার যা দরকার, সবই
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              শিক্ষার্থী, শিক্ষক, অভিভাবক ও প্রতিষ্ঠানের জন্য তৈরি একটি সম্পূর্ণ প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <Link 
                  key={idx}
                  href={feat.link}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 group flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                    <span>স্টুডিওতে অনুশীলন করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON MATRIX: কেন AI Quran Tutor বেছে নেবেন ── */}
      <section className="py-20 bg-[#F4F9F6] border-y border-emerald-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              কেন AI Quran Tutor বেছে নেবেন
            </h2>
            <p className="text-base text-slate-600">
              ঐতিহ্যবাহী পদ্ধতি যা দিতে পারে না, এমন এক প্রিমিয়াম শেখার অভিজ্ঞতা।
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-4 px-6 text-base">সক্ষমতা</th>
                    <th className="py-4 px-6 text-base text-emerald-800 bg-emerald-50/70 border-x border-emerald-100 text-center">
                      AI Quran Tutor
                    </th>
                    <th className="py-4 px-6 text-base text-slate-600 text-center">
                      ঐতিহ্যবাহী
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {row.capability}
                      </td>
                      <td className="py-3.5 px-6 text-center bg-emerald-50/30 border-x border-emerald-100 font-semibold text-emerald-700">
                        <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-500 font-medium">
                        {typeof row.traditional === "string" ? (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{row.traditional}</span>
                        ) : row.traditional ? (
                          <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-rose-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEARNING JOURNEY: শেখার যাত্রা ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              শেখার যাত্রা
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              ব্যাখ্যা → প্রদর্শন → অনুশীলন → যাচাই — প্রতিটি পাঠের মূল চক্র।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningSteps.map((step, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-gradient-to-b from-[#F7FCF9] to-white border border-emerald-100 relative group hover:shadow-lg transition-all"
              >
                <div className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESS & ANALYTICS: প্রতি সপ্তাহে উন্নতি দেখুন ── */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F2F8F4] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>অগ্রগতি অ্যানালিটিক্স</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                প্রতি সপ্তাহে উন্নতি দেখুন
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                নির্ভুলতা, তাজবীদ, মুখস্থ ও প্রবাহিতা ট্র্যাক করুন। এআই আপনার সমাপ্তির তারিখ অনুমান করে এবং যেসব ক্ষেত্রে মনোযোগ দরকার তা আগেই চিহ্নিত করে।
              </p>
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>দৈনিক, সাপ্তাহিক, মাসিক ও বার্ষিক ভিউ</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>দুর্বল ও শক্তিশালী ক্ষেত্র শনাক্তকরণ</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>এআই অগ্রগতি পূর্বাভাস ও ঝুঁকি সতর্কতা</span>
                </li>
              </ul>
            </div>

            {/* Right Analytics Mockup (Exact layout from user screenshot) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Card 1: Chart */}
              <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-slate-800 text-sm">তাজবীদ নির্ভুলতা</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    +30% উন্নতি
                  </span>
                </div>
                {/* Visual Chart Bars */}
                <div className="h-28 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
                  {[
                    { w: "W1", v: "65%" },
                    { w: "W2", v: "72%" },
                    { w: "W3", v: "78%" },
                    { w: "W4", v: "84%" },
                    { w: "W5", v: "90%" },
                    { w: "W6", v: "95%" }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-md transition-all duration-500" 
                        style={{ height: bar.v }} 
                      />
                      <span className="text-[11px] font-semibold text-slate-500">{bar.w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Class Roster Progress */}
              <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">ক্লাস: শিক্ষানবিশ — তাজবীদ</span>
                  <span className="text-xs text-slate-500 font-medium">২৮ শিক্ষার্থী</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">A</span>
                      <span>Aisha K.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">92%</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">আয়ত্ত করেছে</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">Y</span>
                      <span>Yusuf A.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-700">78%</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">রিভিউ দরকার</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">M</span>
                      <span>Maryam S.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-teal-700">85%</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">উন্নতি হচ্ছে</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── TEACHER & PARENTS: আত্মবিশ্বাসের সাথে শিক্ষার্থী পরিচালনা করুন ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>শিক্ষক ও অভিভাবকদের জন্য</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                আত্মবিশ্বাসের সাথে শিক্ষার্থী পরিচালনা করুন
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                শেখানো, পর্যবেক্ষণ ও পথনির্দেশনার সম্পূর্ণ ড্যাশবোর্ড — এআই আপনার সহকারী, বিকল্প নয়।
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  ✓ ক্লাস তৈরি করুন ও পাঠ নির্ধারণ করুন
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  ✓ রিয়েল-টাইমে শিক্ষার্থীর অগ্রগতি দেখুন
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  ✓ রেকর্ডিং রিভিউ করুন ও এআই সিদ্ধান্ত পাল্টান
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  ✓ পরীক্ষা নিন, সার্টিফিকেট ও রিপোর্ট দিন
                </div>
              </div>

              <div>
                <Link
                  href="/TeacherLogin"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md shadow-teal-700/20 transition active:scale-95"
                >
                  <span>শেখানো শুরু করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Icon Illustration Box */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-teal-800 to-emerald-950 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">স্মার্ট টিচার্স কো-পাইলট</h3>
              <p className="text-sm text-teal-100/80 leading-relaxed">
                প্রতিটি শিক্ষার্থীর দুর্বল মাখরাজ, ভুলে যাওয়া আয়াত ও ভুল টানগুলো এআই স্বয়ংক্রিয়ভাবে ক্লাসের পূর্বেই শিক্ষকদের নোট আকারে উপস্থাপন করে।
              </p>
              <div className="pt-2">
                <button
                  onClick={openNurTeacher}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition"
                >
                  লাইভ সহকারী ডেমো টেস্ট করুন
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INSTITUTIONAL ERP: সম্পূর্ণ কুরআন একাডেমি ব্যবস্থাপনা সিস্টেম ── */}
      <section className="py-20 bg-[#F6FAF8] border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>প্রতিষ্ঠানের জন্য</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              সম্পূর্ণ কুরআন একাডেমি ব্যবস্থাপনা সিস্টেম
            </h2>
            <p className="text-base text-slate-600">
              শেখানো থেকে পরিচালনা — আপনার সমগ্র মাদরাসা বা একাডেমির জন্য একটি প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900">শিক্ষার্থী ও শিক্ষক ব্যবস্থাপনা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">আপনার একাডেমির সবাইকে আমন্ত্রণ, ভর্তি ও পরিচালনা করুন।</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900">ক্লাস, কোর্স ও পরীক্ষা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">পাঠ্যক্রম তৈরি করুন, ক্লাস শিডিউল ও পরীক্ষা নিন।</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900">পেমেন্ট ও সাবস্ক্রিপশন</h3>
              <p className="text-xs text-slate-600 leading-relaxed">শিক্ষার্থীদের ইনভয়েস দিন, প্ল্যান পরিচালনা ও আয় ট্র্যাক করুন।</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-slate-900">ব্রাঞ্চ ও রোল</h3>
              <p className="text-xs text-slate-600 leading-relaxed">সূক্ষ্ম রোল পারমিশনসহ একাধিক ক্যাম্পাস পরিচালনা করুন।</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/platform-console/organizations/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-lg transition active:scale-95"
            >
              <span>ডেমো বুক করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING: সহজ, স্বচ্ছ প্রাইসিং ── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              সহজ, স্বচ্ছ প্রাইসিং
            </h2>
            <p className="text-base text-slate-600">
              ফ্রিতে শুরু করুন। প্রস্তুত হলে আপগ্রেড করুন। যেকোনো সময় বাতিল করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Plan 1: Student */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">শিক্ষার্থী</h3>
                  <p className="text-xs text-slate-500 mt-1">ব্যক্তিগত শিক্ষার্থীদের জন্য</p>
                </div>
                <div className="text-4xl font-black text-slate-900">ফ্রি</div>
                <ul className="space-y-3 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">✓ সম্পূর্ণ কুরআন রিডার</li>
                  <li className="flex items-center gap-2">✓ এআই শোনা (দৈনিক সীমিত)</li>
                  <li className="flex items-center gap-2">✓ অগ্রগতি ট্র্যাকিং</li>
                  <li className="flex items-center gap-2">✓ ১ জন কারি</li>
                </ul>
              </div>
              <button
                onClick={openNurTeacher}
                className="w-full py-3 rounded-xl border-2 border-emerald-700 text-emerald-800 font-bold hover:bg-emerald-50 transition"
              >
                ফ্রিতে শেখা শুরু করুন
              </button>
            </div>

            {/* Plan 2: Family (Most Popular) */}
            <div className="p-8 rounded-3xl bg-white border-2 border-emerald-600 shadow-xl shadow-emerald-950/10 relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
                সবচেয়ে জনপ্রিয়
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">ফ্যামিলি</h3>
                  <p className="text-xs text-slate-500 mt-1">পরিবার ও আন্তরিক শিক্ষার্থীদের জন্য</p>
                </div>
                <div className="text-4xl font-black text-emerald-800">$9<span className="text-base text-slate-500 font-normal">/মাস</span></div>
                <ul className="space-y-3 text-sm text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2 font-semibold">✓ Student প্ল্যানের সব কিছু</li>
                  <li className="flex items-center gap-2 font-semibold text-emerald-700">✓ অসীম এআই বিশ্লেষণ</li>
                  <li className="flex items-center gap-2">✓ সব বিখ্যাত কারি</li>
                  <li className="flex items-center gap-2">✓ হিফজ সহকারী</li>
                  <li className="flex items-center gap-2">✓ ৫ জন পর্যন্ত সদস্য</li>
                  <li className="flex items-center gap-2">✓ অভিভাবক ড্যাশবোর্ড</li>
                </ul>
              </div>
              <button
                onClick={openNurTeacher}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 transition"
              >
                ফ্যামিলি বেছে নিন
              </button>
            </div>

            {/* Plan 3: Institution */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">প্রতিষ্ঠান</h3>
                  <p className="text-xs text-slate-500 mt-1">একাডেমি ও মাদরাসার জন্য</p>
                </div>
                <div className="text-4xl font-black text-slate-900">কাস্টম</div>
                <ul className="space-y-3 text-sm text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">✓ Family প্ল্যানের সব কিছু</li>
                  <li className="flex items-center gap-2">✓ সম্পূর্ণ ERP</li>
                  <li className="flex items-center gap-2">✓ মাল্টি-টেন্যান্ট ও ব্রাঞ্চ</li>
                  <li className="flex items-center gap-2">✓ অসীম শিক্ষক</li>
                  <li className="flex items-center gap-2">✓ পেমেন্ট ও বিলিং</li>
                  <li className="flex items-center gap-2">✓ অগ্রাধিকার সহায়তা</li>
                </ul>
              </div>
              <a
                href="#contact"
                className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 text-center font-bold hover:bg-slate-50 transition"
              >
                সেলস-এ যোগাযোগ করুন
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS: শিক্ষার্থী ও শিক্ষকদের ভালোবাসা পেয়েছে ── */}
      <section id="testimonials" className="py-20 bg-[#F7FAF8] border-t border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              শিক্ষার্থী ও শিক্ষকদের ভালোবাসা পেয়েছে
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;মাত্র দুই মাসেই আমার মেয়ের তেলাওয়াতে অসাধারণ উন্নতি হয়েছে। এআই এমন ভুল ধরে যা আমি নিজে কখনোই ধরতে পারতাম না।&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">F</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Fatima R.</div>
                  <div className="text-xs text-slate-500">অভিভাবক</div>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;অবশেষে ৪০ জন শিক্ষার্থীকে সত্যিকারের অন্তর্দৃষ্টিসহ পরিচালনা করতে পারছি। আমি জিজ্ঞেস করার আগেই এআই বলে দেয় কার সাহায্য দরকার। একজন প্রকৃত সহকারী, বিকল্প নয়।&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">I</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Imam Abdul H.</div>
                  <div className="text-xs text-slate-500">শিক্ষক</div>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;সব সময় যেন একজন ধৈর্যশীল শিক্ষক পাশে আছেন। তাজবীদের ব্যাখ্যা আমার পড়া যেকোনো বইয়ের চেয়েও পরিষ্কার।&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">Y</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Yusuf M.</div>
                  <div className="text-xs text-slate-500">শিক্ষার্থী</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ: সাধারণ প্রশ্ন ও উত্তর ── */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              সাধারণ প্রশ্ন ও উত্তর
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-700 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM: যোগাযোগ করুন ── */}
      <section id="contact" className="py-20 bg-[#F4F9F6] border-t border-emerald-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              যোগাযোগ করুন
            </h2>
            <p className="text-sm text-slate-600">
              প্রশ্ন, ডেমো বা পার্টনারশিপ — আপনার কথা শুনতে আমরা আগ্রহী।
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">নাম</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="আপনার নাম লিখুন"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বার্তা</label>
              <textarea
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="আপনার জিজ্ঞাসা বা বার্তা এখানে লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingContact}
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {isSubmittingContact ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              অথবা যেকোনো সময় যোগাযোগ করুন — আমরা সাহায্যের জন্য আছি।
            </p>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#092218] text-emerald-100 py-14 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-lg">AI Quran Tutor</span>
            </div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              বিশ্বের সবচেয়ে উন্নত এআই-চালিত কুরআন শেখার প্ল্যাটফর্ম।
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">প্ল্যাটফর্ম</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><a href="#features" className="hover:text-white">ফিচার</a></li>
              <li><a href="#pricing" className="hover:text-white">প্রাইসিং</a></li>
              <li><a href="#faq" className="hover:text-white">সাধারণ প্রশ্ন</a></li>
              <li><a href="#contact" className="hover:text-white">যোগাযোগ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">যাদের জন্য</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link href="/StudentLogin" className="hover:text-white">শিক্ষার্থী</Link></li>
              <li><Link href="/TeacherLogin" className="hover:text-white">শিক্ষক</Link></li>
              <li><Link href="/StudentLogin" className="hover:text-white">অভিভাবক</Link></li>
              <li><Link href="/platform-console" className="hover:text-white">প্রতিষ্ঠান</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">কোম্পানি</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link href="/about" className="hover:text-white">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/notices" className="hover:text-white">ব্লগ ও নোটিশ</Link></li>
              <li><Link href="/faq" className="hover:text-white">হেল্প সেন্টার</Link></li>
              <li><Link href="/about" className="hover:text-white">প্রাইভেসি</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 mt-10 border-t border-emerald-900/60 text-center text-xs text-emerald-400/60">
          © 2026 AI Quran Tutor. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>

      {/* Semantic Quran Search Modal */}
      <QuranSemanticSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

    </div>
  );
}
