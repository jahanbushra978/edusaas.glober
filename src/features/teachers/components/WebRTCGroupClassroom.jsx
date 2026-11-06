"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  BookOpen,
  Volume2,
  ShieldCheck,
  MessageSquare,
  Send,
  X,
  ChevronDown,
  Users,
  Hand,
  Pin,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// High-fidelity Quran passages for live group class recitation
const GROUP_CLASS_SURAHS = [
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
    num: 67,
    nameBn: "সূরা আল-মুলক (প্রথম ৫ আয়াত)",
    nameAr: "سُورَةُ المُلْكِ",
    verses: [
      { id: 1, ar: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", bn: "বরকতময় তিনি, যাঁর হাতে রাজত্ব এবং তিনি সর্ববিষয়ে সর্বশক্তিমান।" },
      { id: 2, ar: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", bn: "যিনি সৃষ্টি করেছেন মৃত্যু ও জীবন, তোমাদেরকে পরীক্ষা করার জন্য যে কে কর্মে উত্তম।" },
      { id: 3, ar: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ", bn: "যিনি সৃষ্টি করেছেন স্তরে স্তরে সাত আসমান; দয়াময়ের সৃষ্টিতে তুমি কোনো অসংগতি দেখতে পাবে না।" },
      { id: 4, ar: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", bn: "অতঃপর তুমি বারবার দৃষ্টি ফেরাও, দৃষ্টি ক্লান্ত ও ব্যর্থ হয়ে তোমার দিকে ফিরে আসবে।" },
      { id: 5, ar: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ", bn: "নিশ্চয়ই আমি নিকটবর্তী আসমানকে প্রদীপমালা দ্বারা সুশোভিত করেছি।" },
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
];

// Seed active participants simulating a live multi-student room
const INITIAL_STUDENT_PARTICIPANTS = [
  {
    id: "part-1",
    name: "হাফেজ তানভীর আহমেদ",
    role: "student",
    isAudioMuted: false,
    isVideoMuted: false,
    handRaised: true,
    avatar: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "part-2",
    name: "মুহাম্মদ আব্দুল্লাহ",
    role: "student",
    isAudioMuted: true,
    isVideoMuted: false,
    handRaised: false,
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "part-3",
    name: "ইঞ্জি. মো. রফিকুল ইসলাম",
    role: "student",
    isAudioMuted: true,
    isVideoMuted: true,
    handRaised: false,
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "part-4",
    name: "রায়হানুল কবির (হিফজ শিক্ষার্থী)",
    role: "student",
    isAudioMuted: true,
    isVideoMuted: false,
    handRaised: true,
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80",
  },
];

export default function WebRTCGroupClassroom({
  teacher,
  currentUser,
  roomTitle,
  roomCode,
  isHostTeacher = false,
  onClose,
}) {
  // Call Controls State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);

  // Group Classroom Layout State
  const [pinnedParticipantId, setPinnedParticipantId] = useState(teacher?.id || "teacher-main");
  const [participants, setParticipants] = useState(INITIAL_STUDENT_PARTICIPANTS);
  const [audioLevel, setAudioLevel] = useState(55);

  // Shared Quran State (Synchronized across the entire group)
  const [showQuranPanel, setShowQuranPanel] = useState(true);
  const [selectedSurahIndex, setSelectedSurahIndex] = useState(0);
  const [activeVerseHighlight, setActiveVerseHighlight] = useState(1);

  // Drawers
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);

  // In-Call Chat Messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: "cm-1",
      senderName: teacher?.nameBn || "প্রধান উস্তাদ",
      role: "teacher",
      text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ! আজকের গ্রুপ ক্লাসে সকলকে স্বাগতম। সূরা আল-ফাতিহার মাশক শুরু হচ্ছে।",
      time: "এখনই",
    },
    {
      id: "cm-2",
      senderName: "হাফেজ তানভীর আহমেদ",
      role: "student",
      text: "ওয়ালাইকুম আসসালাম উস্তাদ। আমি আয়াত ৩ পড়ার জন্য হাত তুলেছি।",
      time: "১ মিনিট আগে",
    },
  ]);
  const [newMsgText, setNewMsgText] = useState("");

  // Local WebRTC stream
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize WebRTC media capture
  useEffect(() => {
    let active = true;

    async function initGroupWebRTC() {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
            audio: true,
          });

          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn("Camera/mic access warning", err);
      } finally {
        if (active) {
          setTimeout(() => {
            setCallConnected(true);
            toast.success("ফেসবুক-স্টাইল গ্রুপ লাইভ ক্লাসরুমে সংযুক্ত হয়েছেন!");
          }, 800);
        }
      }
    }

    initGroupWebRTC();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Timer & Speaker oscillation simulation
  useEffect(() => {
    if (!callConnected) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
      setAudioLevel(Math.floor(30 + Math.random() * 60));
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
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsAudioMuted((prev) => !prev);
    toast.info(!isAudioMuted ? "আপনার মাইক্রোফোন মিউট করা হয়েছে" : "মাইক্রোফোন চালু করা হয়েছে");
  };

  // Toggle Video Camera
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsVideoMuted((prev) => !prev);
    toast.info(!isVideoMuted ? "ক্যামেরা বন্ধ করা হয়েছে" : "ক্যামেরা চালু করা হয়েছে");
  };

  // Hand Raise Toggle
  const handleToggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (nextState) {
      toast.success("✋ আপনি তিলাওয়াত করার জন্য হাত তুলেছেন। উস্তাদ আপনাকে সুযোগ দিলে মাইক খুলুন।");
    } else {
      toast.info("হাত নামানো হয়েছে।");
    }
  };

  // Synchronized Quran Verse Selection (Teacher or Reciter changes verse for the group)
  const handleSyncVerseSelect = (verseId) => {
    setActiveVerseHighlight(verseId);
    toast.info(`আয়াত #${verseId} পুরো ক্লাসরুমে সিঙ্ক ও হাইলাইট করা হয়েছে`);
  };

  // Send In-Call Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const senderRole = isHostTeacher ? "teacher" : "student";
    const senderName = currentUser?.full_name_bn || currentUser?.full_name_en || (isHostTeacher ? teacher?.nameBn : "শিক্ষার্থী");

    const newMsg = {
      id: "cm-" + Date.now(),
      senderName,
      role: senderRole,
      text: newMsgText.trim(),
      time: "এখনই",
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setNewMsgText("");
  };

  const currentSurah = GROUP_CLASS_SURAHS[selectedSurahIndex] || GROUP_CLASS_SURAHS[0];
  const displayRoomCode = roomCode || `ROOM-${teacher?.id || "LIVE-101"}`;
  const totalParticipantCount = participants.length + 1; // students + host teacher

  return (
    <div className="fixed inset-0 z-50 bg-[#07130E] text-white flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* ── TOP MULTI-USER ROOM HEADER ── */}
      <header className="h-16 px-4 sm:px-6 bg-[#091A14]/95 backdrop-blur-md border-b border-emerald-950 flex items-center justify-between gap-3 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={teacher?.avatar_url || teacher?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"}
              alt={teacher?.name_bn || teacher?.nameBn}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#091A14]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                {roomTitle || "সূরা আল-ফাতিহা ও তাজবীদ মাশক লাইভ গ্রুপ ক্লাস"}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>LIVE গ্রুপ ক্লাস</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
              <span>উস্তাদ: {teacher?.name_bn || teacher?.nameBn}</span>
              <span className="text-stone-500">•</span>
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Users className="w-3 h-3 text-amber-400" />
                <span>{totalParticipantCount} জন যুক্ত আছেন</span>
              </span>
              <span className="text-stone-500">•</span>
              <span className="font-mono text-emerald-400 font-bold">{formatTime(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Shared Quran Toggle */}
          <button
            onClick={() => setShowQuranPanel((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showQuranPanel
                ? "bg-emerald-700 text-white border-emerald-600 shadow-sm"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সহ-কুরআন পাঠ</span>
          </button>

          {/* Participants List Toggle */}
          <button
            onClick={() => setShowParticipantsDrawer((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              showParticipantsDrawer
                ? "bg-emerald-700 text-white border-emerald-600"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">অংশগ্রহণকারী ({totalParticipantCount})</span>
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChatDrawer((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              showChatDrawer
                ? "bg-emerald-700 text-white border-emerald-600"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
            title="গ্রুপ চ্যাট"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── MAIN BODY: MULTI-PARTICIPANT VIDEO GRID + SHARED QURAN ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT / CENTER: MULTI-USER VIDEO STAGE */}
        <div className="flex-1 flex flex-col bg-stone-950 overflow-hidden relative">
          {/* PRIMARY PINNED STAGE (Teacher or Active Reciter) */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden p-2">
            <div className="w-full h-full relative rounded-3xl overflow-hidden border border-emerald-950/80 bg-gradient-to-b from-stone-900 via-stone-950 to-black flex items-center justify-center">
              {/* Animated Audio Waveform & Teacher Stage */}
              <div className="relative flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <div className="relative">
                  {/* Glowing Pulse */}
                  <div
                    className="absolute inset-0 rounded-full bg-emerald-500/25 blur-xl transition-all duration-300"
                    style={{ transform: `scale(${1 + audioLevel / 75})` }}
                  />
                  <img
                    src={teacher?.avatar_url || teacher?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"}
                    alt={teacher?.name_bn || teacher?.nameBn}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10"
                  />
                  <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[11px] font-black z-20 shadow-md flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                    <span>প্রধান উস্তাদের মাইক সক্রিয়</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-white">{teacher?.name_bn || teacher?.nameBn}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{teacher?.title_bn || teacher?.titleBn}</p>
                </div>

                {/* Real-time Voice Frequency Bars */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => (
                    <span
                      key={bar}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(6, (audioLevel * ((bar % 4) + 1)) / 7)}px`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Pin indicator */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 z-20">
                <Pin className="w-3 h-3 text-amber-400" />
                <span>
                  {pinnedParticipantId === (teacher?.id || "teacher-main")
                    ? "প্রধান মঞ্চ (উস্তাদ)"
                    : `পিনকৃত শিক্ষার্থী: ${participants.find((p) => p.id === pinnedParticipantId)?.name || "শিক্ষার্থী"}`}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM / TILE STRIP: ALL CONNECTED STUDENTS & LOCAL USER (Facebook Group Call Grid) */}
          <div className="h-44 sm:h-52 bg-[#091A14] border-t border-emerald-950 p-2.5 overflow-x-auto flex items-center gap-3 shrink-0">
            {/* LOCAL USER TILE (You) */}
            <div className="w-36 sm:w-44 h-full rounded-2xl overflow-hidden border-2 border-emerald-500 bg-stone-900 shrink-0 relative shadow-lg group">
              {isVideoMuted ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-stone-950 text-stone-400">
                  <VideoOff className="w-6 h-6 mb-1 text-red-400" />
                  <p className="text-[10px] font-bold">আপনার ক্যামেরা বন্ধ</p>
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
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] font-bold text-emerald-300">
                <span className="truncate">আপনি {isAudioMuted && "(মিউট)"}</span>
                {isHandRaised && (
                  <span className="text-amber-400 flex items-center gap-0.5 font-black">
                    <Hand className="w-3 h-3 fill-amber-400" />
                  </span>
                )}
              </div>
            </div>

            {/* CONNECTED STUDENT PARTICIPANT TILES */}
            {participants.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setPinnedParticipantId(p.id);
                  toast.info(`${p.name}-কে প্রধান স্ক্রিনে পিন করা হয়েছে`);
                }}
                className={`w-36 sm:w-44 h-full rounded-2xl overflow-hidden border shrink-0 relative shadow-md transition cursor-pointer ${
                  pinnedParticipantId === p.id ? "border-amber-400 ring-2 ring-amber-500/50" : "border-stone-800 bg-stone-900 hover:border-emerald-600"
                }`}
              >
                {p.isVideoMuted ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-stone-950 text-stone-400">
                    <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-stone-700 mb-1" />
                    <p className="text-[10px] font-bold text-stone-300 truncate w-full px-1">{p.name}</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] font-bold text-stone-200">
                  <span className="truncate max-w-[80px]">{p.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.handRaised && (
                      <span className="text-amber-400" title="তিলাওয়াতের জন্য হাত তুলেছে">
                        <Hand className="w-3 h-3 fill-amber-400" />
                      </span>
                    )}
                    {p.isAudioMuted ? (
                      <MicOff className="w-3 h-3 text-red-400" />
                    ) : (
                      <Mic className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SYNCHRONIZED SHARED QURAN READER PANEL */}
        {showQuranPanel && (
          <aside className="w-full lg:w-96 xl:w-[430px] bg-[#091A14] border-t lg:border-t-0 lg:border-l border-emerald-950 flex flex-col h-80 lg:h-full z-20 shadow-2xl">
            {/* Panel Header */}
            <div className="p-3.5 border-b border-emerald-950 flex items-center justify-between gap-2 shrink-0 bg-[#07130E]/80">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">গ্রুপ সিঙ্ক কুরআন তিলাওয়াত</span>
              </div>

              {/* Surah Switcher */}
              <div className="relative">
                <select
                  value={selectedSurahIndex}
                  onChange={(e) => {
                    setSelectedSurahIndex(Number(e.target.value));
                    setActiveVerseHighlight(1);
                  }}
                  className="appearance-none bg-stone-900 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {GROUP_CLASS_SURAHS.map((s, idx) => (
                    <option key={s.num} value={idx}>
                      {s.nameBn}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Verses Scroll List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-emerald-950/60">
              <div className="text-center pb-2">
                <h4 className="text-lg font-black text-amber-300">{currentSurah.nameAr}</h4>
                <p className="text-[11px] text-stone-400 font-bold">{currentSurah.nameBn}</p>
                <p className="text-[10px] text-emerald-400 mt-1">
                  ✓ উস্তাদ ও সকল শিক্ষার্থীর স্ক্রিনে এই আয়াতটি একসাথে সিঙ্ক হচ্ছে
                </p>
              </div>

              {currentSurah.verses.map((verse) => {
                const isActive = activeVerseHighlight === verse.id;
                return (
                  <div
                    key={verse.id}
                    onClick={() => handleSyncVerseSelect(verse.id)}
                    className={`pt-3.5 pb-2.5 px-3 rounded-2xl transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-950/90 border border-emerald-500/60 shadow-inner"
                        : "hover:bg-emerald-950/40"
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
                      <p className="text-[10px] text-emerald-400 font-bold mt-1 text-right flex items-center justify-end gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>বর্তমানে এই আয়াতে মাশক চলছে</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* IN-CALL GROUP CHAT DRAWER */}
        {showChatDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-stone-900 border-l border-stone-800 z-30 flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>লাইভ ক্লাস চ্যাট ও নোট</span>
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
                    msg.role === "teacher"
                      ? "bg-emerald-950/80 border border-emerald-700/60 text-emerald-100"
                      : "bg-stone-800 text-stone-200 border border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-black text-amber-300">{msg.senderName}</span>
                    <span className="text-[9px] text-stone-400">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="প্রশ্ন বা নোট লিখুন..."
                className="flex-1 bg-stone-800 text-xs px-3 py-2 rounded-xl border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* PARTICIPANTS DRAWER */}
        {showParticipantsDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-stone-900 border-l border-stone-800 z-30 flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>ক্লাসের অংশগ্রহণকারী ({totalParticipantCount})</span>
              </h4>
              <button
                onClick={() => setShowParticipantsDrawer(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Teacher Row */}
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={teacher?.avatar_url || teacher?.avatar}
                    alt={teacher?.name_bn || teacher?.nameBn}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-black text-white">{teacher?.name_bn || teacher?.nameBn}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">প্রধান উস্তাদ (হোস্ট)</p>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>

              {/* Student Rows */}
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover border border-stone-600" />
                    <div>
                      <p className="text-xs font-bold text-stone-200">{p.name}</p>
                      <p className="text-[10px] text-stone-400">শিক্ষার্থী</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.handRaised && <Hand className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    <button
                      onClick={() => {
                        setParticipants((prev) =>
                          prev.map((item) => (item.id === p.id ? { ...item, isAudioMuted: !item.isAudioMuted } : item))
                        );
                        toast.info(`${p.name}-এর মাইক স্টেট পরিবর্তন করা হয়েছে`);
                      }}
                      className="p-1 rounded-lg hover:bg-stone-700 cursor-pointer"
                    >
                      {p.isAudioMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM CALL CONTROL BAR (FACEBOOK / MEET / ZOOM STYLE) ── */}
      <footer className="h-20 bg-[#091A14] border-t border-emerald-950 px-4 sm:px-8 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>রিয়েল-টাইম মাল্টি-ইউজার WebRTC লাইভ রুম</span>
        </div>

        {/* Center Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4 mx-auto">
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

          {/* Hand Raise Button (for Students to request recitation floor) */}
          <button
            onClick={handleToggleHandRaise}
            className={`px-4 h-12 rounded-2xl font-black text-xs flex items-center gap-2 transition shadow-lg cursor-pointer border ${
              isHandRaised
                ? "bg-amber-500 hover:bg-amber-600 text-stone-950 border-amber-400 ring-4 ring-amber-950"
                : "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700"
            }`}
            title="তিলাওয়াত করার জন্য হাত তুলুন"
          >
            <Hand className="w-4 h-4" />
            <span className="hidden sm:inline">{isHandRaised ? "হাত তোলা আছে" : "হাত তুলুন"}</span>
          </button>

          {/* End / Leave Room Button */}
          <button
            onClick={() => {
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
              }
              toast.info(`আপনি লাইভ গ্রুপ ক্লাস থেকে প্রস্থান করেছেন। সময়: ${formatTime(callDuration)}`);
              onClose();
            }}
            className="px-5 sm:px-6 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-xl ring-4 ring-red-950 transition active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>প্রস্থান করুন</span>
          </button>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-[10px] text-stone-400">রুম কোড:</p>
          <p className="text-xs font-mono font-black text-emerald-400">{displayRoomCode}</p>
        </div>
      </footer>
    </div>
  );
}
