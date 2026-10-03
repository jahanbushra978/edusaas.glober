'use client'

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  Clock, Users, UserCheck, UserX, Wifi, Volume2, VolumeX, 
  Maximize, Minimize, ShieldCheck, Activity, CheckCircle2, X 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Convert English numbers to Bengali numerals
const toBnNumber = (num) => {
  if (num === null || num === undefined) return "০";
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
};

// Bengali Day and Month Names
const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

// Curated Quranic Ayat & Sahih Hadith on Time, Attendance, Diligence, and Knowledge
const ISLAMIC_QUOTES = [
  {
    type: "হাদিস শরীফ",
    topic: "সময়ানুবর্তিতা ও ভোরের বরকত",
    arabic: "اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا",
    bengali: "“হে আল্লাহ! আপনি আমার উম্মতকে তার ভোরের কাজে বরকত দান করুন।”",
    reference: "— আল-হাদিস (আবু দাউদ: ২৬০৬, তিরমিজি: ১২১২)",
  },
  {
    type: "কুরআনের বাণী",
    topic: "সময়ের শপথ ও গুরুত্ব",
    arabic: "وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا",
    bengali: "“সময়ের শপথ! নিশ্চয়ই মানুষ ক্ষতির মধ্যে নিমজ্জিত—তারা ব্যতীত যারা ঈমান আনে ও সৎকাজ করে।”",
    reference: "— আল-কুরআন (সূরা আল-আসর: ১-৩)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "জ্ঞানার্জন প্রত্যেকের ওপর ফরজ",
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَىٰ كُلِّ مُسْلِمٍ",
    bengali: "“জ্ঞান অর্জন করা প্রত্যেক মুসলিমের ওপর ফরজ বা আবশ্যকীয় কর্তব্য।”",
    reference: "— আল-হাদিস (ইবনে মাজাহ: ২২৪, সহিহ)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "নিয়মিত হাজিরা ও ধারাবাহিকতা",
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    bengali: "“আল্লাহর নিকট সর্বাধিক প্রিয় আমল বা কাজ হলো যা নিয়মিত করা হয়—যদিও তা পরিমাণে অল্প হয়।”",
    reference: "— আল-হাদিস (সহিহ বুখারি: ৬৪৬৪, সহিহ মুসলিম: ৭৮২)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "জ্ঞানার্জন ও উপস্থিতির সওয়াব",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    bengali: "“যে ব্যক্তি জ্ঞান অর্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জান্নাতের পথ সুগম করে দেন।”",
    reference: "— আল-হাদিস (সহিহ মুসলিম: ২৬৯৯)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "সময়ের মূল্যায়ন ও অবসর",
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    bengali: "“এমন দুটি মহা নিয়ামত রয়েছে যাতে অধিকাংশ মানুষ ক্ষতিগ্রস্ত: সুস্থতা এবং অবসর সময়।”",
    reference: "— আল-হাদিস (সহিহ বুখারি: ৬৪১২)",
  },
  {
    type: "কুরআনের বাণী",
    topic: "ওয়াদা ও দায়িত্বশীলতা",
    arabic: "وَأَوْفُوا بِالْعَهْدِ ۖ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا",
    bengali: "“তোমরা যাবতীয় অঙ্গীকার ও দায়িত্ব পূর্ণ করো; নিশ্চয়ই অঙ্গীকার সম্পর্কে জবাবদিহি করতে হবে।”",
    reference: "— আল-কুরআন (সূরা বনী ইসরাঈল: ৩৪)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "কাজে নিষ্ঠা ও পূর্ণ একাগ্রতা",
    arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
    bengali: "“নিশ্চয়ই আল্লাহ তাআলা ভালোবাসেন যে, তোমাদের কেউ যখন কাজ করবে তখন সে যেন তা নিষ্ঠার সাথে করে।”",
    reference: "— আল-হাদিস (শুআবুল ঈমান: ৪৬১০)",
  },
  {
    type: "কুরআনের বাণী",
    topic: "জ্ঞান বৃদ্ধির দুআ",
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    bengali: "“হে আমার প্রতিপালক! আপনি আমার জ্ঞান ও প্রজ্ঞাকে বাড়িয়ে দিন।”",
    reference: "— আল-কুরআন (সূরা ত্বহা: ১১৪)",
  },
  {
    type: "হাদিস শরীফ",
    topic: "অলসতা বর্জন ও কর্মতৎপরতা",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
    bengali: "“হে আল্লাহ! আমি আপনার নিকট অক্ষমতা ও অলসতা থেকে আশ্রয় প্রার্থনা করছি।”",
    reference: "— আল-হাদিস (সহিহ বুখারি: ২৮২৩)",
  },
  {
    type: "কুরআনের বাণী",
    topic: "জ্ঞানীদের অনন্য মর্যাদা",
    arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    bengali: "“তোমাদের মধ্যে যারা ঈমান এনেছে এবং যাদের জ্ঞান দান করা হয়েছে, আল্লাহ তাদের বহুগুণ মর্যাদায় উন্নীত করবেন।”",
    reference: "— আল-কুরআন (সূরা আল-মুজাদালাহ: ১১)",
  },
];

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context not allowed or not supported
  }
}

export default function LiveAttendancePage() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // 4.5s Islamic Hadith & Quran Ayat Rotator
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Live Punch Spotlight State (Shows popped-up profile on fingerprint scan)
  const [activePunch, setActivePunch] = useState(null);
  const punchTimerRef = useRef(null);

  // Trigger celebration spotlight when student/teacher punches
  const triggerPunchSpotlight = useCallback((punch) => {
    if (!punch) return;
    setActivePunch(punch);
    if (soundEnabled) {
      playChime();
    }
    if (punchTimerRef.current) {
      clearTimeout(punchTimerRef.current);
    }
    punchTimerRef.current = setTimeout(() => {
      setActivePunch(null);
    }, 7500); // Display spotlight for 7.5 seconds
  }, [soundEnabled]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (punchTimerRef.current) clearTimeout(punchTimerRef.current);
    };
  }, []);

  // Auto rotate Hadith/Ayat every 4.5 seconds (pauses when tab is hidden to save CPU)
  useEffect(() => {
    const timer = setInterval(() => {
      // Only rotate when tab is visible
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
        setQuoteVisible(true);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [stats, setStats] = useState({
    total_students: 0,
    student_present: 0,
    student_absent: 0,
    attendance_rate: 0,
    devices_online: 1,
    active_device_name: "মেইন গেইট • ডিভাইস ০১",
  });
  const [liveFeed, setLiveFeed] = useState([]);
  const lastPunchIdRef = useRef(null);

  // Realtime Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, "0");

      setTimeStr(`${toBnNumber(formattedHours)}:${toBnNumber(minutes)}:${toBnNumber(seconds)} ${ampm}`);
      
      const dayName = BN_DAYS[now.getDay()];
      const dayNum = toBnNumber(now.getDate());
      const monthName = BN_MONTHS[now.getMonth()];
      const year = toBnNumber(now.getFullYear());
      setDateStr(`${dayName}, ${dayNum} ${monthName}, ${year}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch branches
  useEffect(() => {
    fetch("/api/attendance/manage?action=branches")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.data?.length > 0) {
          setBranches(res.data);
          setSelectedBranch(res.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live stats & feed
  const fetchData = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const [statsRes, liveRes] = await Promise.all([
        fetch(`/api/attendance/manage?action=stats&branch_id=${selectedBranch.id}`).then((r) => r.json()),
        fetch(`/api/attendance/manage?action=live&branch_id=${selectedBranch.id}&limit=20`).then((r) => r.json()),
      ]);

      if (statsRes.ok) {
        const s = statsRes.data || {};
        const total = s.total_students || 0;
        const present = s.student_present || s.present_count || 0;
        const absent = total > present ? total - present : 0;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        setStats((prev) => ({
          ...prev,
          total_students: total,
          student_present: present,
          student_absent: absent,
          attendance_rate: rate,
        }));
        setIsConnected(true);
      }

      if (liveRes.ok && Array.isArray(liveRes.data)) {
        const newFeed = liveRes.data;
        if (newFeed.length > 0) {
          const newest = newFeed[0];
          // When a new punch is recorded, trigger center celebration spotlight
          if (lastPunchIdRef.current && newest.id !== lastPunchIdRef.current) {
            triggerPunchSpotlight(newest);
          }
          lastPunchIdRef.current = newest.id;
        }
        setLiveFeed(newFeed);
      }
    } catch (err) {
      setIsConnected(false);
    }
  }, [selectedBranch, triggerPunchSpotlight]);

  // Quota-friendly Polling: Only runs when page is open and tab is actively visible
  useEffect(() => {
    if (!selectedBranch) return;
    fetchData();

    // Gentle fallback check (25s) when tab is active — avoids hammering Supabase free limits
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchData();
      }
    }, 25000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData, selectedBranch]);

  // Realtime Supabase change listener (Instantly updates when biometric punch occurs)
  useEffect(() => {
    if (!supabase || !selectedBranch) return;
    const channel = supabase
      .channel(`live-wall-${selectedBranch.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance_records" }, () => {
        fetchData();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance_logs" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, selectedBranch]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentQuote = ISLAMIC_QUOTES[quoteIndex] || ISLAMIC_QUOTES[0];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#031A12] text-slate-100 select-none overflow-x-hidden font-bengali">
      {/* Background Decorative Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(34, 197, 94, 0.15), transparent 70%), linear-gradient(135deg, rgba(5, 46, 22, 0.6) 0%, rgba(3, 26, 18, 0.9) 100%)`
        }}
      />

      {/* ── TOP HEADER ── */}
      <header className="relative z-10 w-full px-6 py-4 border-b border-emerald-900/40 bg-[#042017]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Left: Institute Brand */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center border border-emerald-500/30">
            <Image 
              src="/rahmania-logo-v2.png" 
              alt="Rahmania Institute Logo" 
              width={44} 
              height={44} 
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-bengali">
                রহমানিয়া ইনস্টিটিউট
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30">
                {selectedBranch?.name_bn || selectedBranch?.name_en || "Main Campus"}
              </span>
            </div>
            <p className="text-[11px] font-semibold tracking-wider text-emerald-400/80 uppercase">
              Rahmania Institute — DIGITAL ATTENDANCE WALL
            </p>
          </div>
        </div>

        {/* Right: Clock & Quick Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Clock Card */}
          <div className="flex flex-col items-end px-4 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 shadow-inner">
            <div className="text-xl sm:text-2xl font-black text-emerald-300 tracking-wider font-mono">
              {timeStr || "০০:০০:০০ PM"}
            </div>
            <div className="text-[11px] font-medium text-emerald-400/70 font-bengali">
              {dateStr || "অপেক্ষমান..."}
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled 
                ? "bg-emerald-900/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-800/60" 
                : "bg-red-950/50 border-red-800/40 text-red-400 hover:bg-red-900/50"
            }`}
            title={soundEnabled ? "সাউন্ড চালু" : "সাউন্ড বন্ধ"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-800/60 transition-all"
            title="ফুলস্ক্রিন করুন"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Live Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-700/40 text-xs font-bold text-emerald-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
            {isConnected ? "সংযোগ সক্রিয়" : "সংযোগ পুনরুদ্ধার হচ্ছে..."}
          </div>

          {/* Active Gate Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-xs font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{stats.active_device_name}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN 3-COLUMN DISPLAY ── */}
      <main className="relative z-10 flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1920px] mx-auto w-full">
        
        {/* ── LEFT COLUMN: RECENT PUNCHES FEED (col-span-3) ── */}
        <section className="lg:col-span-3 flex flex-col rounded-3xl bg-[#042017]/70 border border-emerald-900/50 backdrop-blur-md p-4 sm:p-5 shadow-2xl overflow-hidden min-h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white font-bengali tracking-wide">সাম্প্রতিক হাজিরা</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 border border-emerald-600/40 text-emerald-300">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {liveFeed.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-emerald-500/60 gap-3">
                <Clock className="w-10 h-10 stroke-1 opacity-50" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300/80 font-bengali">আজকের কোনো নতুন হাজিরা নেই</p>
                  <p className="text-xs text-emerald-500/60 font-bengali mt-1">ফিঙ্গারপ্রিন্ট দিলে এখানে প্রদর্শিত হবে</p>
                </div>
              </div>
            ) : (
              liveFeed.map((item, idx) => {
                const info = item.user_info || {};
                const name = info.full_name || `ইউজার #${item.device_user_id || item.user_id}`;
                const photo = info.photo_url;
                const punchTime = item.punch_time ? new Date(item.punch_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "এখনই";
                const isStudent = item.user_type === "student" || info.user_type === "student";

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => triggerPunchSpotlight(item)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-400/60 hover:bg-emerald-900/40 transition-all cursor-pointer hover:scale-[1.01] animate-fade-in group"
                    title="ক্লিক করে সেন্টারে বড় আকারে দেখুন"
                  >
                    {/* Avatar */}
                    {photo ? (
                      <img 
                        src={photo} 
                        alt={name} 
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/50 group-hover:border-emerald-400 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-900/60 border border-emerald-600/30 flex items-center justify-center flex-shrink-0 text-emerald-300 font-bold">
                        {name.charAt(0)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate font-bengali group-hover:text-emerald-200">{name}</p>
                      <p className="text-[11px] text-emerald-400/80 font-bengali">
                        {isStudent ? "শিক্ষার্থী" : "শিক্ষক"} {info.group_label ? `• ${info.group_label}` : ""}
                      </p>
                    </div>

                    {/* Time & Badge */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-mono font-bold text-emerald-300">{punchTime}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 font-bengali">
                        <CheckCircle2 className="w-2.5 h-2.5" /> সফল
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── CENTER COLUMN: HERO DISPLAY & ISLAMIC BANNER (col-span-6) ── */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-[#042017]/70 border border-emerald-900/50 backdrop-blur-md p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Central Logo & Title */}
          <div className="flex flex-col items-center text-center mt-1">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-2.5 shadow-2xl flex items-center justify-center border-2 border-emerald-400/40 mb-3 sm:mb-4">
              <Image 
                src="/rahmania-logo-v2.png" 
                alt="Rahmania Institute" 
                width={80} 
                height={80} 
                className="object-contain"
                priority
              />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white font-bengali tracking-tight drop-shadow-md">
              লাইভ হাজিরা মনিটর
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-400/90 font-bengali mt-1">
              নির্ধারিত ফিঙ্গারপ্রিন্ট ডিভাইসে আঙুল স্পর্শ করুন
            </p>
          </div>

          {/* ── CONDITIONAL DISPLAY: REALTIME PUNCH SPOTLIGHT vs ISLAMIC ROTATOR ── */}
          {activePunch ? (
            /* ── REALTIME PUNCH SPOTLIGHT CELEBRATION CARD ── */
            <div className="my-3 sm:my-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-900/95 via-[#032d1f] to-[#01140e] border-2 border-emerald-400/70 shadow-[0_0_50px_rgba(16,185,129,0.35)] relative overflow-hidden flex flex-col justify-between min-h-[270px] sm:min-h-[290px] animate-punch-spotlight">
              {/* Decorative Top Glow Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 animate-pulse" />

              {/* Header: Success Badge + Time + Dismiss Button */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-700/50">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-bold font-bengali tracking-wide shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>হাজিরা সফলভাবে গ্রহণ করা হয়েছে</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {activePunch.punch_time ? new Date(activePunch.punch_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "এখনই"}
                  </span>
                  <button 
                    onClick={() => setActivePunch(null)}
                    className="p-1 rounded-full text-emerald-400/80 hover:text-white hover:bg-emerald-800/50 transition-all"
                    title="বাণী পর্দায় ফিরুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Profile Spotlight Center Body */}
              <div className="flex flex-col items-center justify-center text-center py-2.5 my-auto">
                {/* Photo / Avatar with Glowing Ring */}
                <div className="relative mb-2.5">
                  {activePunch.user_info?.photo_url ? (
                    <img 
                      src={activePunch.user_info.photo_url} 
                      alt={activePunch.user_info?.full_name || "User"} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-emerald-400 shadow-2xl animate-photo-glow"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-600 border-3 border-emerald-300 shadow-2xl flex items-center justify-center text-white text-3xl font-black font-bengali animate-photo-glow">
                      {(activePunch.user_info?.full_name || "ইউ").charAt(0)}
                    </div>
                  )}

                  {/* Verification Tick Badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                {/* Full Name */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-bengali tracking-tight drop-shadow-md">
                  {activePunch.user_info?.full_name || `ইউজার #${activePunch.device_user_id || activePunch.user_id}`}
                </h3>

                {/* Role / Class / Group / Roll Details Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 font-bengali">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                    {activePunch.user_type === "student" || activePunch.user_info?.user_type === "student" ? "শিক্ষার্থী" : "সম্মানিত শিক্ষক"}
                  </span>
                  {activePunch.user_info?.group_label && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/80 border border-slate-700 text-slate-200">
                      {activePunch.user_info.group_label}
                    </span>
                  )}
                  {activePunch.user_info?.identifier && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300">
                      আইডি/রোল: {toBnNumber(activePunch.user_info.identifier)}
                    </span>
                  )}
                </div>

                {/* Islamic Welcome Blessing */}
                <p className="text-xs sm:text-sm font-medium text-emerald-200/90 font-bengali mt-2">
                  “স্বাগতম! মহান আল্লাহ আপনার শিক্ষা ও সময়ে বরকত দান করুন।”
                </p>
              </div>

              {/* Bottom Spotlight Countdown Bar */}
              <div className="w-full h-1 bg-emerald-950/90 rounded-full overflow-hidden mt-1 border border-emerald-800/40">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 rounded-full animate-punch-timer" />
              </div>
            </div>
          ) : (
            /* ── DEFAULT ROTATING ISLAMIC HADITH & QURAN AYAT CARD ── */
            <div className="my-4 sm:my-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-950/95 via-[#032418]/95 to-[#01140e] border border-emerald-600/40 shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative text-center overflow-hidden flex flex-col justify-between min-h-[250px] sm:min-h-[270px] transition-all duration-500">
              {/* Top Category Badge & Progress Dots */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-800/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bengali shadow-sm">
                    {currentQuote.type}
                  </span>
                  <span className="text-xs font-bold text-emerald-300/90 font-bengali">
                    • {currentQuote.topic}
                  </span>
                </div>

                {/* Progress Dots / Slide Indicators */}
                <div className="flex items-center gap-1">
                  {ISLAMIC_QUOTES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuoteVisible(false);
                        setTimeout(() => {
                          setQuoteIndex(i);
                          setQuoteVisible(true);
                        }, 200);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === quoteIndex 
                          ? "w-5 bg-amber-400" 
                          : "w-1.5 bg-emerald-800/60 hover:bg-emerald-600/60"
                      }`}
                      title={`বাণী নং ${toBnNumber(i + 1)}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quote Content with Smooth Fade & Scale Animation */}
              <div className="flex-1 flex flex-col items-center justify-center py-3 my-auto">
                <div 
                  className={`w-full transition-all duration-300 transform ${
                    quoteVisible 
                      ? "opacity-100 scale-100 translate-y-0" 
                      : "opacity-0 scale-95 translate-y-2"
                  }`}
                >
                  {/* Arabic Text */}
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-200 font-arabic leading-relaxed tracking-wide mb-2 select-text"
                    dir="rtl"
                  >
                    {currentQuote.arabic}
                  </p>

                  {/* Bengali Translation */}
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white font-bengali leading-snug max-w-2xl mx-auto drop-shadow-sm">
                    {currentQuote.bengali}
                  </p>

                  {/* Reference */}
                  <p className="text-xs sm:text-sm font-semibold text-amber-400/90 font-bengali mt-2 tracking-wide">
                    {currentQuote.reference}
                  </p>
                </div>
              </div>

              {/* 4.5-Second Progress Bar Line */}
              <div className="w-full h-1 bg-emerald-950/90 rounded-full overflow-hidden mt-1 border border-emerald-900/50">
                <div 
                  key={quoteIndex} 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full animate-quote-timer" 
                />
              </div>
            </div>
          )}

          {/* Bottom Device & Rate Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-xs sm:text-sm font-bold font-bengali">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>বায়োমেট্রিক গেট ০১ অনলাইন</span>
            </div>
            <div className="text-emerald-400">
              আজকের উপস্থিতি হার: <span className="text-emerald-200 text-base">{toBnNumber(stats.attendance_rate)}%</span>
            </div>
          </div>
        </section>

        {/* ── RIGHT COLUMN: ATTENDANCE STATS OVERVIEW (col-span-3) ── */}
        <section className="lg:col-span-3 flex flex-col justify-between rounded-3xl bg-[#042017]/70 border border-emerald-900/50 backdrop-blur-md p-4 sm:p-5 shadow-2xl min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 mb-4">
              <h2 className="text-base font-bold text-white font-bengali tracking-wide">আজকের উপস্থিতি চিত্র</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950 border border-emerald-600/40 text-emerald-300">
                রিয়েলটাইম
              </span>
            </div>

            {/* Stat Cards */}
            <div className="space-y-3">
              {/* Total Students */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-600/40 flex items-center justify-center text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 font-bengali">মোট শিক্ষার্থী</p>
                    <p className="text-xl font-black text-white font-bengali">{toBnNumber(stats.total_students)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400/80">১০০%</span>
              </div>

              {/* Present Today */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 font-bengali">আজকের হাজিরা</p>
                    <p className="text-xl font-black text-emerald-300 font-bengali">{toBnNumber(stats.student_present)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {toBnNumber(stats.attendance_rate)}%
                </span>
              </div>

              {/* Absent */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-400">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 font-bengali">অনুপস্থিত</p>
                    <p className="text-xl font-black text-rose-400 font-bengali">{toBnNumber(stats.student_absent)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400/80">
                  {toBnNumber(stats.total_students > 0 ? 100 - stats.attendance_rate : 0)}%
                </span>
              </div>
            </div>

            {/* Attendance Rate Big Progress Box */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-[#021810] border border-emerald-700/50 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 font-bengali">
                উপস্থিতির হার (ATTENDANCE RATE)
              </p>
              <div className="text-4xl sm:text-5xl font-black text-emerald-300 my-2 font-mono drop-shadow">
                {toBnNumber(stats.attendance_rate)}%
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/60 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, stats.attendance_rate))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-400 font-bengali">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>গেটের ডিভাইস সিঙ্ক</span>
            </div>
            <span className="font-bold text-emerald-300">১০০% সক্রিয়</span>
          </div>
        </section>
      </main>

      {/* ── BOTTOM ANNOUNCEMENT TICKER ── */}
      <footer className="relative z-10 w-full bg-[#02120C] border-t border-emerald-900/60 px-4 py-2.5 flex items-center gap-3">
        {/* Notice Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-xs font-black text-emerald-300 flex-shrink-0 font-bengali shadow-md">
          <Activity className="w-3.5 h-3.5" />
          <span>ঘোষণা</span>
        </div>

        {/* Marquee Text */}
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee text-xs sm:text-sm font-medium text-emerald-200/90 font-bengali">
            স্বাগতম রহমানিয়া ইনস্টিটিউট — দ্বীনি ও আধুনিক শিক্ষার সমন্বিত প্রতিষ্ঠান • সকল শিক্ষার্থী ও সম্মানিত শিক্ষকবৃন্দকে সময়মতো উপস্থিত হয়ে ডিজিটাল বায়োমেট্রিক হাজিরা নিশ্চিত করার জন্য অনুরোধ করা হচ্ছে • সময়ানুবর্তিতা ও নিয়মিত উপস্থিতি সুশৃঙ্খল শিক্ষা জীবনের চাবিকাঠি •
          </div>
        </div>
      </footer>
    </div>
  );
}
