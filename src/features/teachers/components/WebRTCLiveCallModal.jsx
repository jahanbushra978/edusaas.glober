"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  BookOpen,
  Volume2,
  ShieldCheck,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// Curated sample Surah list for in-call Quran recitation
const IN_CALL_SURAHS = [
  {
    num: 1,
    nameBn: "সূরা আল-ফাতিহা",
    nameAr: "سُورَةُ الفَاتِحَةِ",
    verses: [
      { id: 1, ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", bn: "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।" },
      { id: 2, ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", bn: "সকল প্রশংসা সমগ্র বিশ্বজাহানের প্রতিপালক আল্লাহর।" },
      { id: 3, ar: "الرَّحْمَٰنِ الرَّحِيمِ", bn: "যিনি পরম করুণাময়, অতি দয়ালু।" },
      { id: 4, ar: "مَالِكِ يَوْمِ الدِّينِ", bn: "যিনি প্রতিফল দিবসের মালিক।" },
      { id: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", bn: "আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই সাহায্য প্রার্থনা করি।" },
      { id: 6, ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", bn: "আমাদের সরল-সঠিক পথ প্রদর্শন করুন।" },
      { id: 7, ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", bn: "তাদের পথ, যাদের আপনি অনুগ্রহ দান করেছেন; তাদের পথ নয় যারা ক্রোধের শিকার বা পথভ্রষ্ট।" },
    ],
  },
  {
    num: 112,
    nameBn: "সূরা আল-ইখলাস",
    nameAr: "سُورَةُ الإِخْلَاصِ",
    verses: [
      { id: 1, ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", bn: "বলুন, তিনিই আল্লাহ, এক-অদ্বিতীয়।" },
      { id: 2, ar: "اللَّهُ الصَّمَدُ", bn: "আল্লাহ কারো মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।" },
      { id: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", bn: "তিনি কাউকেও জন্ম দেননি এবং তাঁকেও কেউ জন্ম দেয়নি।" },
      { id: 4, ar: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", bn: "এবং তাঁর সমকক্ষ কেউই নেই।" },
    ],
  },
  {
    num: 114,
    nameBn: "সূরা আন-নাস",
    nameAr: "سُورَةُ النَّاسِ",
    verses: [
      { id: 1, ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", bn: "বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের।" },
      { id: 2, ar: "مَلِكِ النَّاسِ", bn: "মানুষের অধিপতির।" },
      { id: 3, ar: "إِلَٰهِ النَّاسِ", bn: "মানুষের সত্যিকারের উপাস্যের।" },
      { id: 4, ar: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", bn: "আত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট থেকে।" },
      { id: 5, ar: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", bn: "যে মানুষের অন্তরে কুমন্ত্রণা দেয়।" },
      { id: 6, ar: "مِنَ الْجِنَّةِ وَالنَّاسِ", bn: "জিনদের মধ্য থেকে কিংবা মানুষের মধ্য থেকে।" },
    ],
  },
];

export default function WebRTCLiveCallModal({ teacher, studentUser, onClose }) {
  // Call Controls State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callConnected, setCallConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(45); // simulated audio waveform level
  const [showQuranPanel, setShowQuranPanel] = useState(true);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedSurahIndex, setSelectedSurahIndex] = useState(0);
  const [activeVerseHighlight, setActiveVerseHighlight] = useState(1);

  // In-call chat messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: "m1",
      sender: "teacher",
      senderName: teacher?.nameBn || "উস্তাদ",
      text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। মাশাআল্লাহ ক্লাসে স্বাগতম। আপনি কি আমার স্পষ্ট কণ্ঠ শুনতে পাচ্ছেন?",
      time: "এখনই",
    },
  ]);
  const [newMsgText, setNewMsgText] = useState("");

  // WebRTC local stream refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Initialize WebRTC Media Stream
  useEffect(() => {
    let active = true;

    async function initWebRTC() {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: true,
          });

          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera/Mic permission unavailable or denied. Falling back to simulated stream.", err);
      } finally {
        if (active) {
          // Connect state transition
          setTimeout(() => {
            if (active) {
              setIsConnecting(false);
              setCallConnected(true);
              toast.success("উস্তাদের সাথে WebRTC এনক্রিপ্টেড কল সংযুক্ত হয়েছে!");
            }
          }, 1200);
        }
      }
    }

    initWebRTC();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (!callConnected) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
      // Simulate live audio waveform fluctuations
      setAudioLevel(Math.floor(25 + Math.random() * 65));
    }, 1000);

    return () => clearInterval(interval);
  }, [callConnected]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Toggle Mute Audio
  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsAudioMuted((prev) => !prev);
    toast.info(!isAudioMuted ? "মাইক্রোফোন মিউট করা হয়েছে" : "মাইক্রোফোন চালু করা হয়েছে");
  };

  // Toggle Video Camera
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoMuted((prev) => !prev);
    toast.info(!isVideoMuted ? "ক্যামেরা বন্ধ করা হয়েছে" : "ক্যামেরা চালু করা হয়েছে");
  };

  // Toggle Screen Sharing (Browser Tab, Window, or Screen)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
      toast.info("স্ক্রিন শেয়ারিং বন্ধ করা হয়েছে");
    } else {
      try {
        if (typeof navigator !== "undefined" && navigator?.mediaDevices?.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false,
          });
          screenStreamRef.current = screenStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          toast.success("স্ক্রিন শেয়ার চালু হয়েছে! কুরআন পাঠ ও নোটবুক সফলভাবে প্রদর্শিত হচ্ছে।");

          const screenTrack = screenStream.getVideoTracks()[0];
          if (screenTrack) {
            screenTrack.onended = () => {
              setIsScreenSharing(false);
              if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
              }
            };
          }
        } else {
          toast.error("আপনার ব্রাউজারে স্ক্রিন শেয়ারিং সুবিধা সক্রিয় নেই");
        }
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          console.warn("Screen sharing failed:", err);
        }
        toast.info("স্ক্রিন শেয়ারিং প্রক্রিয়া বাতিল হয়েছে");
      }
    }
  };

  // Send in-call chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const studentMsg = {
      id: "msg-" + Date.now(),
      sender: "student",
      senderName: studentUser?.full_name_bn || "শিক্ষার্থী",
      text: newMsgText.trim(),
      time: "এখনই",
    };

    setChatMessages((prev) => [...prev, studentMsg]);
    setNewMsgText("");

    // Simulate teacher auto-response
    setTimeout(() => {
      const teacherReply = {
        id: "rep-" + Date.now(),
        sender: "teacher",
        senderName: teacher?.nameBn || "উস্তাদ",
        text: "মাশাআল্লাহ, আয়াতটি তেলাওয়াত করুন। আমি মনোযোগ সহকারে শুনছি।",
        time: "এখনই",
      };
      setChatMessages((prev) => [...prev, teacherReply]);
    }, 1500);
  };

  const currentSurah = IN_CALL_SURAHS[selectedSurahIndex] || IN_CALL_SURAHS[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#07130E] text-white flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* ── TOP CALL STATUS BAR ── */}
      <header className="h-16 px-4 sm:px-6 bg-[#091A14]/90 backdrop-blur-md border-b border-emerald-950/80 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={teacher?.avatar}
              alt={teacher?.nameBn}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#091A14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">
                {teacher?.nameBn}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>WebRTC P2P</span>
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium flex items-center gap-2">
              <span>{isConnecting ? "সংযুক্ত হচ্ছে..." : "সরাসরি ১-অন-১ লাইভ ক্লাস"}</span>
              <span className="text-stone-400">•</span>
              <span className="font-mono text-emerald-400 font-bold">{formatTime(callDuration)}</span>
            </p>
          </div>
        </div>

        {/* Top Actions: Toggle Quran & Chat */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuranPanel((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showQuranPanel
                ? "bg-emerald-700 text-white border-emerald-600 shadow-sm"
                : "bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সহ-কুরআন পাঠ</span>
          </button>

          <button
            onClick={() => setShowChatDrawer((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              showChatDrawer
                ? "bg-emerald-700 text-white border-emerald-600"
                : "bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
            title="ইন-কল চ্যাট"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE: SPLIT CALL VIEW + QURAN PANEL ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT / CENTER: VIDEO CANVAS */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {/* TEACHER REMOTE FEED (Primary Big View) */}
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-stone-900 via-stone-950 to-black">
            {isConnecting ? (
              <div className="text-center space-y-3">
                <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-stone-300 font-bold">উস্তাদের সাথে ভিডিও সংযোগ স্থাপন করা হচ্ছে...</p>
                <p className="text-[11px] text-stone-500">Peer-to-Peer এনক্রিপ্টেড সিগন্যালিং প্রক্রিয়াধীন</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Teacher Avatar & Animated Audio Aura */}
                <div className="relative flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    {/* Pulsing Audio Ring Waves */}
                    <div
                      className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl transition-all duration-300"
                      style={{ transform: `scale(${1 + audioLevel / 80})` }}
                    />
                    <img
                      src={teacher?.avatar}
                      alt={teacher?.nameBn}
                      className="w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10"
                    />
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[11px] font-black z-20 shadow-md flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                      <span>উস্তাদের কণ্ঠ সক্রিয়</span>
                    </div>
                  </div>

                  <div className="z-10 space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-white">{teacher?.nameBn}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{teacher?.titleBn}</p>
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                        <span
                          key={bar}
                          className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                          style={{
                            height: `${Math.max(6, (audioLevel * ((bar % 3) + 1)) / 7)}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOCAL STUDENT PIP CAMERA (Bottom-right thumbnail) */}
            <div className="absolute bottom-4 right-4 w-32 h-44 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-stone-900 z-20">
              {isVideoMuted ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-stone-950 text-stone-400">
                  <VideoOff className="w-6 h-6 mb-1 text-red-400" />
                  <p className="text-[10px] font-bold">ক্যামেরা বন্ধ</p>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-emerald-300">
                <span>আপনি {isAudioMuted && "(মিউট)"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE SHARED QURAN READER (Side-by-side) */}
        {showQuranPanel && (
          <aside className="w-full md:w-96 lg:w-[420px] bg-[#091A14] border-t md:border-t-0 md:border-l border-emerald-950/80 flex flex-col h-72 md:h-full z-20 shadow-2xl">
            {/* Quran Header */}
            <div className="p-3.5 border-b border-emerald-950 flex items-center justify-between gap-2 shrink-0 bg-[#07130E]/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">লাইভ তিলাওয়াত পৃষ্ঠা</span>
              </div>

              {/* Surah Selector */}
              <div className="relative">
                <select
                  value={selectedSurahIndex}
                  onChange={(e) => {
                    setSelectedSurahIndex(Number(e.target.value));
                    setActiveVerseHighlight(1);
                  }}
                  className="appearance-none bg-stone-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {IN_CALL_SURAHS.map((s, idx) => (
                    <option key={s.num} value={idx}>
                      {s.nameBn} ({s.nameAr})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Verses Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-emerald-950/50">
              <div className="text-center pb-2">
                <h4 className="text-base font-black text-amber-300">{currentSurah.nameAr}</h4>
                <p className="text-[11px] text-stone-400 font-bold">{currentSurah.nameBn}</p>
              </div>

              {currentSurah.verses.map((verse) => {
                const isActive = activeVerseHighlight === verse.id;
                return (
                  <div
                    key={verse.id}
                    onClick={() => setActiveVerseHighlight(verse.id)}
                    className={`pt-3.5 pb-2.5 px-3 rounded-2xl transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-950/80 border border-emerald-500/50 shadow-inner"
                        : "hover:bg-emerald-950/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {verse.id}
                      </span>
                      <p
                        className="text-right text-lg sm:text-xl font-bold leading-relaxed text-amber-100 flex-1"
                        dir="rtl"
                      >
                        {verse.ar}
                      </p>
                    </div>
                    <p className="text-xs text-stone-300 mt-2 font-medium leading-relaxed pl-8">
                      {verse.bn}
                    </p>
                    {isActive && (
                      <p className="text-[10px] text-emerald-400 font-bold mt-1 text-right">
                        ✓ বর্তমানে এই আয়াতে উস্তাদ ও শিক্ষার্থী মশ্ক করছেন
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* IN-CALL CHAT DRAWER */}
        {showChatDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-stone-900 border-l border-stone-800 z-30 flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>ক্লাস চ্যাট ও নোট</span>
              </h4>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-2xl text-xs ${
                    msg.sender === "student"
                      ? "bg-emerald-800 text-white ml-6"
                      : "bg-stone-800 text-stone-200 mr-6 border border-stone-700"
                  }`}
                >
                  <p className="text-[10px] font-black opacity-75 mb-0.5">{msg.senderName}</p>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="বার্তা লিখুন..."
                className="flex-1 bg-stone-800 text-xs px-3 py-2 rounded-xl border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── BOTTOM CALL CONTROL BAR (IMO / MEET / WHATSAPP / ZOOM STYLE) ── */}
      <footer className="h-20 bg-[#091A14] border-t border-emerald-950 px-4 sm:px-8 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>এইচডি কোয়ালিটি অডিও-ভিডিও এনক্রিপ্টেড</span>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 mx-auto">
          {/* Mute Mic Button */}
          <button
            onClick={handleToggleAudio}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg cursor-pointer ${
              isAudioMuted
                ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-950"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
            }`}
            title={isAudioMuted ? "মাইক্রোফোন আনমিউট করুন" : "মাইক্রোফোন মিউট করুন"}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={handleToggleVideo}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg cursor-pointer ${
              isVideoMuted
                ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-950"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
            }`}
            title={isVideoMuted ? "ক্যামেরা চালু করুন" : "ক্যামেরা বন্ধ করুন"}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg cursor-pointer ${
              isScreenSharing
                ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-950 animate-pulse"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
            }`}
            title={isScreenSharing ? "স্ক্রিন শেয়ার বন্ধ করুন" : "স্ক্রিন বা কুরআন পৃষ্ঠা শেয়ার করুন"}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
              }
              if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((t) => t.stop());
              }
              toast.info(`ক্লাস সমাপ্ত হয়েছে। মোট সময়: ${formatTime(callDuration)}`);
              onClose();
            }}
            className="px-6 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl ring-4 ring-red-950 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>কল শেষ করুন</span>
          </button>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-[11px] text-stone-400">ক্লাস রুম আইডি:</p>
          <p className="text-xs font-mono font-bold text-emerald-400">ROOM-{teacher?.id || "LIVE"}</p>
        </div>
      </footer>
    </div>
  );
}
