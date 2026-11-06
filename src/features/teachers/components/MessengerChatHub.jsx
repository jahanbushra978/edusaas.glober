"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  Check,
  CheckCheck,
  Users,
  ShieldCheck,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Paperclip,
  X,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Ban,
  Edit2,
  Palette,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { REAL_TEACHERS_10, REAL_STUDENTS_10 } from "../data/marketplaceSeedData";

const STORAGE_KEY = "edusaas_messenger_conversations";
const BLOCKED_KEY = "edusaas_messenger_blocked_users";
const NICKNAMES_KEY = "edusaas_messenger_nicknames";
const THEMES_KEY = "edusaas_messenger_themes";
const FOLLOWED_STUDENTS_KEY = "edusaas_followed_student_ids";
const FOLLOWED_TEACHERS_KEY = "edusaas_followed_teacher_ids";

// Theme presets for Facebook Messenger style
const CHAT_THEMES = {
  emerald: {
    id: "emerald",
    name: "ইসলামিক পান্না (Emerald)",
    bubble: "bg-gradient-to-r from-emerald-700 to-teal-800 text-white",
    sendBtn: "bg-emerald-700 hover:bg-emerald-800",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    id: "blue",
    name: "মেসেঞ্জার ব্লু (Messenger Blue)",
    bubble: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white",
    sendBtn: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    id: "purple",
    name: "রয়্যাল পার্পল (Royal Purple)",
    bubble: "bg-gradient-to-r from-purple-700 to-indigo-800 text-white",
    sendBtn: "bg-purple-700 hover:bg-purple-800",
    accent: "text-purple-600 dark:text-purple-400",
  },
  amber: {
    id: "amber",
    name: "সাহারা গোল্ড (Desert Gold)",
    bubble: "bg-gradient-to-r from-amber-600 to-yellow-700 text-white",
    sendBtn: "bg-amber-600 hover:bg-amber-700",
    accent: "text-amber-600 dark:text-amber-400",
  },
};

// Initial default conversations for realistic messaging
const DEFAULT_THREADS = [
  {
    id: "thread-qari-mahmudul",
    contactId: "qari-mahmudul-hasan",
    contactName: "শায়খ ক্বারী মাহমুদুল হাসান",
    contactTitle: "অনুমোদিত প্রধান শিক্ষক ও ক্বারী",
    contactAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
    role: "teacher",
    isOnline: true,
    unreadCount: 1,
    lastActivity: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    messages: [
      {
        id: "m-1",
        sender: "teacher",
        senderName: "শায়খ ক্বারী মাহমুদুল হাসান",
        text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। রহমানিয়া কুরআন শিক্ষায় আপনাকে স্বাগতম। আপনি কি সূরা আল-ফাতিহা ও নূরানী কায়দার মাশক শুরু করতে আগ্রহী?",
        timestamp: "সকাল ১০:১৫",
        status: "read",
      },
      {
        id: "m-2",
        sender: "user",
        senderName: "আপনি",
        text: "ওয়ালাইকুম আসসালাম উস্তাদ। জী, আমি বিশুদ্ধ মাখরাজ ও তারতীলে কুরআন পাঠ শিখতে চাই। ১-অন-১ ক্লাসের সময় কখন নির্ধারণ করা যায়?",
        timestamp: "সকাল ১০:২০",
        status: "read",
      },
      {
        id: "m-3",
        sender: "teacher",
        senderName: "শায়খ ক্বারী মাহমুদুল হাসান",
        text: "মাশাআল্লাহ! আপনি শনি, সোম ও বুধবার রাত ৮:৩০ টায় সরাসরি লাইভ ক্লাসে যুক্ত হতে পারেন। ক্লাসে নূর এআই হোয়াইটবোর্ড ও লাইভ অডিও স্ক্রিন থাকবে ইনশাআল্লাহ।",
        timestamp: "সকাল ১০:২২",
        status: "unread",
      },
    ],
  },
  {
    id: "group-hifz-batch-01",
    isGroup: true,
    contactId: "group-hifz-batch-01",
    contactName: "আমপারা হিফজ ও তাজবীদ স্টাডি গ্রুপ",
    contactTitle: "৪ জন সদস্য • কুরআন স্টাডি সার্কেল",
    contactAvatar: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
    role: "group",
    members: [
      { id: "qari-mahmudul-hasan", name: "শায়খ ক্বারী মাহমুদুল হাসান", role: "admin", title: "প্রধান উস্তাদ" },
      { id: "stu-fatimah-102", name: "ফাতেমা জোহরা", role: "member", title: "শিক্ষার্থী" },
      { id: "stu-abdullah-101", name: "আব্দুল্লাহ আল-মামুন", role: "member", title: "শিক্ষার্থী" },
      { id: "stu-mariam-104", name: "মারিয়াম সিদ্দীকা", role: "member", title: "শিক্ষার্থী" },
    ],
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    messages: [
      {
        id: "gm-1",
        sender: "teacher",
        senderName: "শায়খ ক্বারী মাহমুদুল হাসান",
        text: "আসসালামু আলাইকুম প্রিয় শিক্ষার্থীরা। আজকের গ্রুপ রিভিশন সেশনে সবাইকে স্বাগতম। সূরা মুলকের ১-১০ আয়াত কার প্রস্তুত আছে?",
        timestamp: "দুপুর ২:০০",
        status: "read",
      },
      {
        id: "gm-2",
        sender: "student",
        senderName: "আব্দুল্লাহ আল-মামুন",
        text: "ওয়ালাইকুম আসসালাম উস্তাদ। আমার সম্পূর্ণ প্রস্তুত আছে আলহামদুলিল্লাহ।",
        timestamp: "দুপুর ২:০৫",
        status: "read",
      },
      {
        id: "gm-3",
        sender: "student",
        senderName: "ফাতেমা জোহরা",
        text: "উস্তাদজী, আমি মাখরাজের স্থানগুলো আর একবার রিভিশন দিয়ে গ্রুপে পড়া পেশ করব ইনশাআল্লাহ।",
        timestamp: "দুপুর ২:০৮",
        status: "read",
      },
    ],
  },
  {
    id: "thread-stu-fatimah",
    contactId: "stu-fatimah-102",
    contactName: "ফাতেমা জোহরা",
    contactTitle: "আমপারা হিফজ ও তাজবীদ শিক্ষার্থী (STU-1002)",
    contactAvatar: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
    role: "student",
    isOnline: true,
    unreadCount: 1,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    messages: [
      {
        id: "m-f1",
        sender: "student",
        senderName: "ফাতেমা জোহরা",
        text: "আসসালামু আলাইকুম উস্তাদ। সূরা আন-নাবার ১-২০ আয়াতের নূন সাকিন ও ইখফার হরফের মাশক প্রস্তুত করেছি।",
        timestamp: "দুপুর ১:২০",
        status: "read",
      },
      {
        id: "m-f2",
        sender: "teacher",
        senderName: "উস্তাদ",
        text: "ওয়ালাইকুম আসসালাম ফাতেমা। মাশাআল্লাহ! আজকের লাইভ ক্লাসে আমপারার এই অংশটি শুনব ইনশাআল্লাহ।",
        timestamp: "দুপুর ১:২৫",
        status: "read",
      },
      {
        id: "m-f3",
        sender: "student",
        senderName: "ফাতেমা জোহরা",
        text: "জাজাকুমুল্লাহু খাইরান উস্তাদ। আমি সময়মতো উপস্থিত থাকব।",
        timestamp: "দুপুর ১:২৮",
        status: "unread",
      },
    ],
  },
  {
    id: "thread-stu-abdullah",
    contactId: "stu-abdullah-101",
    contactName: "আব্দুল্লাহ আল-মামুন",
    contactTitle: "সূরা বাকারা ও তাজবীদ শিক্ষার্থী (STU-1001)",
    contactAvatar: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
    role: "student",
    isOnline: true,
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    messages: [
      {
        id: "m-a1",
        sender: "student",
        senderName: "আব্দুল্লাহ আল-মামুন",
        text: "আসসালামু আলাইকুম। সূরা বাকারার রুকু ৩ মুখস্থ তিলাওয়াত করেছি, লোকমা ছাড়া সম্পন্ন হয়েছে আলহামদুলিল্লাহ।",
        timestamp: "সকাল ১১:০৫",
        status: "read",
      },
      {
        id: "m-a2",
        sender: "teacher",
        senderName: "উস্তাদ",
        text: "মাশাআল্লাহ আব্দুল্লাহ! তারতীলের সাথে পড়ার ধারাবাহিকতা বজায় রাখুন। পরবর্তী রুকুর মাশক শুরু করুন।",
        timestamp: "সকাল ১১:১৫",
        status: "read",
      },
    ],
  },
  {
    id: "thread-ustaza-sumayyah",
    contactId: "ustaza-sumayyah-maryam",
    contactName: "উস্তাযা সুমাইয়া আক্তার",
    contactTitle: "মহিলা বিভাগ প্রধান ও নূরানী মুয়াল্লিমা",
    contactAvatar: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
    role: "teacher",
    isOnline: true,
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    messages: [
      {
        id: "m-s1",
        sender: "teacher",
        senderName: "উস্তাযা সুমাইয়া আক্তার",
        text: "আসসালামু আলাইকুম। মা-বোনদের জন্য পর্দানশীন পরিবেশে আমাদের আমপারা তাজবীদ ও হরফ মাশক ব্যাচ শুরু হচ্ছে।",
        timestamp: "গতকাল বিকাল ৫:০০",
        status: "read",
      },
    ],
  },
  {
    id: "thread-stu-mariam",
    contactId: "stu-mariam-104",
    contactName: "মারিয়াম সিদ্দীকা",
    contactTitle: "নূরানী কায়দা শিক্ষার্থী (STU-1004)",
    contactAvatar: "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
    role: "student",
    isOnline: false,
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    messages: [
      {
        id: "m-m1",
        sender: "student",
        senderName: "মারিয়াম সিদ্দীকা",
        text: "আসসালামু আলাইকুম। তানভীন ও সাকিনের হরফ চেনার নিয়মটি নোট করে নিয়েছি। অনেক ধন্যবাদ!",
        timestamp: "সকাল ৯:৩০",
        status: "read",
      },
    ],
  },
];

export default function MessengerChatHub({
  currentUser,
  currentTeacherUser,
  initialTargetTeacher = null,
  onOpenLiveCall,
  onOpenTeacherProfile,
  onOpenStudentProfile,
  onClose,
  isEmbedded = false,
}) {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  
  // Filter: 'friends' (Default: only friends & following), 'all', 'groups', 'blocked'
  const [activeFilter, setActiveFilter] = useState("friends"); 
  
  // Blocked users
  const [blockedUserIds, setBlockedUserIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(BLOCKED_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Custom nicknames per contact
  const [customNicknames, setCustomNicknames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(NICKNAMES_KEY) || "{}");
    } catch {
      return {};
    }
  });

  // Chat themes per thread
  const [chatThemes, setChatThemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(THEMES_KEY) || "{}");
    } catch {
      return {};
    }
  });

  // Followed student & teacher IDs
  const [followedStudentIds, setFollowedStudentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FOLLOWED_STUDENTS_KEY) || '["stu-fatimah-102", "stu-abdullah-101", "stu-mariam-104"]');
    } catch {
      return ["stu-fatimah-102", "stu-abdullah-101", "stu-mariam-104"];
    }
  });
  const [followedTeacherIds, setFollowedTeacherIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FOLLOWED_TEACHERS_KEY) || '["qari-mahmudul-hasan", "ustaza-sumayyah-maryam"]');
    } catch {
      return ["qari-mahmudul-hasan", "ustaza-sumayyah-maryam"];
    }
  });

  // Modals & Menu States
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Group creation form
  const [groupName, setGroupName] = useState("");
  const [groupCategory, setGroupCategory] = useState("হিফজ ও তাজবীদ সার্কেল");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

  // Live Call Modal State
  const [callState, setCallState] = useState({
    active: false,
    type: "audio", // "audio" | "video"
    status: "connecting", // "connecting" | "connected"
    durationSeconds: 0,
    isMuted: false,
    isVideoOff: false,
  });

  const messagesEndRef = useRef(null);

  // 1. Load threads from localStorage or initial defaults, merging missing defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t) => t.contactId || t.id));
          const missing = DEFAULT_THREADS.filter(
            (dt) => !existingIds.has(dt.contactId) && !existingIds.has(dt.id)
          );
          const merged = [...parsed, ...missing];
          setThreads(merged);
          setActiveThreadId(merged[0].id);
          return;
        }
      }
    } catch {}

    setThreads(DEFAULT_THREADS);
    setActiveThreadId(DEFAULT_THREADS[0].id);
  }, []);

  // 2. Handle initial target teacher/student passed from external button
  useEffect(() => {
    if (!initialTargetTeacher) return;
    const tid = initialTargetTeacher.teacher_id || initialTargetTeacher.id || initialTargetTeacher.student_public_id;

    setThreads((prevThreads) => {
      const existing = prevThreads.find((t) => t.contactId === tid);
      if (existing) {
        setActiveThreadId(existing.id);
        return prevThreads;
      }

      const contactName =
        initialTargetTeacher.name_bn ||
        initialTargetTeacher.nameBn ||
        initialTargetTeacher.display_name ||
        "সম্মানিত ব্যবহারকারী";
      const contactTitle =
        initialTargetTeacher.title_bn ||
        initialTargetTeacher.titleBn ||
        (initialTargetTeacher.student_public_id
          ? `শিক্ষার্থী (${initialTargetTeacher.student_public_id})`
          : "কুরআন শিক্ষার্থী");
      const contactAvatar =
        initialTargetTeacher.avatar_url ||
        initialTargetTeacher.avatar ||
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80";
      const isStudentTarget = Boolean(initialTargetTeacher.student_public_id || initialTargetTeacher.learning_interests);

      const newThread = {
        id: `thread-${tid}-${Date.now()}`,
        contactId: tid,
        contactName,
        contactTitle,
        contactAvatar,
        role: isStudentTarget ? "student" : "teacher",
        isOnline: true,
        unreadCount: 0,
        lastActivity: new Date().toISOString(),
        messages: [
          {
            id: `init-${Date.now()}`,
            sender: isStudentTarget ? "student" : "teacher",
            senderName: contactName,
            text: isStudentTarget
              ? `আসসালামু আলাইকুম! আমি ${contactName}। কুরআন মাজীদ সহীহভাবে শেখা ও তাজবীদ বিষয়ে আপনার সাথে আলোচনা করতে চাই।`
              : `আসসালামু আলাইকুম! আমি ${contactName}। কুরআন মাজীদের তিলাওয়াত ও তাজবীদ বিষয়ে কীভাবে আপনাকে সহায়তা করতে পারি?`,
            timestamp: "এইমাত্র",
            status: "read",
          },
        ],
      };

      const updated = [newThread, ...prevThreads];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      setActiveThreadId(newThread.id);
      return updated;
    });
  }, [initialTargetTeacher]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId]);

  // Call timer effect
  useEffect(() => {
    let timer;
    if (callState.active && callState.status === "connected") {
      timer = setInterval(() => {
        setCallState((prev) => ({ ...prev, durationSeconds: prev.durationSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState.active, callState.status]);



  // ── FILTER THREADS STRICTLY BY USER RULE ──
  // Rule: By default, ONLY friends / followed contacts and joined groups appear in the inbox!
  const currentUserId = currentUser?.id || currentUser?.user_id || currentUser?.student_public_id || currentTeacherUser?.id || currentTeacherUser?.teacher_id;
  const currentUsername = currentUser?.username || currentTeacherUser?.username;
  const currentName = currentTeacherUser?.nameBn || currentTeacherUser?.name_bn || currentUser?.display_name || currentUser?.full_name_bn;

  const filteredThreads = threads.filter((t) => {
    // 0. Never display a conversation with oneself in Messenger
    if (
      (currentUserId && (t.contactId === currentUserId || String(t.contactId).toLowerCase() === String(currentUserId).toLowerCase())) ||
      (currentUsername && t.contactId && String(t.contactId).toLowerCase() === String(currentUsername).toLowerCase()) ||
      (currentName && t.contactName && t.contactName.trim() === currentName.trim() && !t.isGroup)
    ) {
      return false;
    }

    const isBlocked = blockedUserIds.includes(t.contactId);

    // Filter tab handling
    if (activeFilter === "blocked") {
      return isBlocked;
    }
    // For non-blocked views, skip blocked threads unless explicitly viewing blocked tab
    if (isBlocked) return false;

    if (activeFilter === "groups") {
      if (!t.isGroup) return false;
    }

    if (activeFilter === "friends") {
      // Show ONLY if it is a group, OR if the contact is in followedStudentIds / followedTeacherIds, OR if user actively messaged
      const isFollowedStudent = followedStudentIds.includes(t.contactId);
      const isFollowedTeacher = followedTeacherIds.includes(t.contactId);
      const hasActiveConversation = t.messages.some((m) => m.sender === "user" || m.sender === "teacher");
      const isFollowedOrFriend = t.isGroup || isFollowedStudent || isFollowedTeacher;

      if (!isFollowedOrFriend && !hasActiveConversation) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nick = customNicknames[t.contactId] || "";
    return (
      t.contactName.toLowerCase().includes(q) ||
      t.contactTitle.toLowerCase().includes(q) ||
      nick.toLowerCase().includes(q)
    );
  });

  // Active Thread (strictly scoped to filteredThreads so blocked or self threads are never selected)
  const activeThread = filteredThreads.find((t) => t.id === activeThreadId) || filteredThreads[0] || null;
  const isCurrentContactBlocked = activeThread ? blockedUserIds.includes(activeThread.contactId) : false;
  const currentContactNickname = activeThread ? customNicknames[activeThread.contactId] || null : null;
  const currentThemeKey = (activeThread && chatThemes[activeThread.id]) || "emerald";
  const currentTheme = CHAT_THEMES[currentThemeKey] || CHAT_THEMES.emerald;

  // Helper to get display name with nickname support
  const getDisplayName = (thread) => {
    if (!thread) return "";
    if (thread.isGroup) return thread.contactName;
    const nick = customNicknames[thread.contactId];
    return nick ? `${nick} (${thread.contactName})` : thread.contactName;
  };

  // ── BLOCK / UNBLOCK HANDLER ──
  const handleToggleBlock = () => {
    if (!activeThread) return;
    const cId = activeThread.contactId;
    let updated;
    if (blockedUserIds.includes(cId)) {
      updated = blockedUserIds.filter((id) => id !== cId);
      toast.success(`${getDisplayName(activeThread)}-কে সফলভাবে আনব্লক করা হয়েছে`);
    } else {
      updated = [...blockedUserIds, cId];
      toast.info(`${getDisplayName(activeThread)}-কে ব্লক করা হয়েছে`);
    }
    setBlockedUserIds(updated);
    try {
      localStorage.setItem(BLOCKED_KEY, JSON.stringify(updated));
    } catch {}
    setShowOptionsMenu(false);
  };

  // ── SAVE NICKNAME HANDLER ──
  const handleSaveNickname = (e) => {
    e.preventDefault();
    if (!activeThread) return;
    const updated = { ...customNicknames };
    const cleanNick = nicknameInput.trim();
    if (cleanNick) {
      updated[activeThread.contactId] = cleanNick;
      toast.success(`ডাকনাম "${cleanNick}" নির্ধারণ করা হয়েছে`);
    } else {
      delete updated[activeThread.contactId];
      toast.info("ডাকনাম মুছে ফেলা হয়েছে");
    }
    setCustomNicknames(updated);
    try {
      localStorage.setItem(NICKNAMES_KEY, JSON.stringify(updated));
    } catch {}
    setShowNicknameModal(false);
  };

  // ── SET CHAT THEME ──
  const handleSelectTheme = (themeId) => {
    if (!activeThread) return;
    const updated = { ...chatThemes, [activeThread.id]: themeId };
    setChatThemes(updated);
    try {
      localStorage.setItem(THEMES_KEY, JSON.stringify(updated));
    } catch {}
    setShowThemeModal(false);
    toast.success(`চ্যাট থিম "${CHAT_THEMES[themeId].name}" নির্বাচিত হয়েছে`);
  };

  // ── CREATE GROUP CHAT HANDLER ──
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("অনুগ্রহ করে গ্রুপের একটি নাম দিন");
      return;
    }
    if (selectedGroupMembers.length === 0) {
      toast.error("কমপক্ষে ১ জন সদস্য সিলেক্ট করুন");
      return;
    }

    const newGroupId = `group-${Date.now()}`;
    const selectedMembersData = [
      {
        id: currentUser?.id || currentTeacherUser?.id || "me",
        name: currentTeacherUser?.nameBn || currentUser?.full_name_bn || "আপনি",
        role: "admin",
        title: currentTeacherUser ? "গ্রুপ উস্তাদ (Admin)" : "গ্রুপ অ্যাডমিন",
      },
      ...selectedGroupMembers.map((id) => {
        const foundT = REAL_TEACHERS_10.find((t) => t.id === id || t.teacher_id === id);
        if (foundT) {
          return { id, name: foundT.name_bn || foundT.nameBn, role: "member", title: "উস্তাদ" };
        }
        const foundS = REAL_STUDENTS_10.find((s) => s.id === id || s.student_public_id === id);
        return {
          id,
          name: foundS ? foundS.display_name : id,
          role: "member",
          title: "শিক্ষার্থী",
        };
      }),
    ];

    const newGroupThread = {
      id: newGroupId,
      isGroup: true,
      contactId: newGroupId,
      contactName: groupName.trim(),
      contactTitle: `${selectedMembersData.length} জন সদস্য • ${groupCategory}`,
      contactAvatar: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
      role: "group",
      members: selectedMembersData,
      unreadCount: 0,
      lastActivity: new Date().toISOString(),
      messages: [
        {
          id: `gm-init-${Date.now()}`,
          sender: "system",
          senderName: "সিস্টেম",
          text: `"${groupName.trim()}" গ্রুপটি তৈরি করা হয়েছে। সদস্যবৃন্দ: ${selectedMembersData.map((m) => m.name).join(", ")}।`,
          timestamp: "এইমাত্র",
          status: "read",
        },
      ],
    };

    setThreads((prev) => {
      const updated = [newGroupThread, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveThreadId(newGroupThread.id);
    setShowGroupModal(false);
    setGroupName("");
    setSelectedGroupMembers([]);
    toast.success(`মাশাআল্লাহ! নতুন গ্রুপ "${groupName}" তৈরি হয়েছে`);
  };

  // ── START CALL HANDLER ──
  const handleStartCall = (type = "audio") => {
    if (isCurrentContactBlocked) {
      toast.error("ব্লক করা ব্যবহারকারীকে কল করা সম্ভব নয়");
      return;
    }
    setCallState({
      active: true,
      type,
      status: "connecting",
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
    });

    // Simulate connection after 1.8 seconds
    setTimeout(() => {
      setCallState((prev) => ({ ...prev, status: "connected" }));
    }, 1800);
  };

  const handleEndCall = () => {
    setCallState({
      active: false,
      type: "audio",
      status: "connecting",
      durationSeconds: 0,
      isMuted: false,
      isVideoOff: false,
    });
    toast.info("কল সমাপ্ত হয়েছে");
  };

  // Format seconds to mm:ss
  const formatCallDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── SEND MESSAGE ──
  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || messageText).trim();
    if (!text || !activeThread) return;
    if (isCurrentContactBlocked) {
      toast.error("ব্লক করা ব্যবহারকারীকে বার্তা পাঠাতে আনব্লক করুন");
      return;
    }

    const senderRole = currentTeacherUser ? "teacher" : "user";
    const senderName = currentTeacherUser
      ? currentTeacherUser.nameBn || currentTeacherUser.name_bn || "উস্তাদ"
      : currentUser?.full_name_bn || currentUser?.name || "আপনি";

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderRole,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "numeric", hour12: true }),
      status: "delivered",
    };

    setThreads((prevThreads) => {
      const updated = prevThreads.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastActivity: new Date().toISOString(),
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setMessageText("");

    // Simulate realistic Islamic response based on conversation type
    setTimeout(() => {
      let replyResponses = [];
      let replyRole = activeThread.role || "teacher";
      let responderName = activeThread.contactName;

      if (activeThread.isGroup) {
        // Group response from one of the members
        replyRole = "student";
        responderName = "মারিয়াম সিদ্দীকা";
        replyResponses = [
          "মাশাআল্লাহ! গ্রুপে শেয়ার করার জন্য ধন্যবাদ। আমরা সবাই একসাথে মাশক করব।",
          "জাজাকাল্লাহ খাইর! ইনশাআল্লাহ আগামী ক্লাসে এই অংশটি রিভিশন দেব।",
          "আলহামদুলিল্লাহ, নিয়মটি খুব সহজভাবে ব্যাখ্যা করেছেন।",
        ];
      } else if (senderRole === "teacher" && activeThread.role === "student") {
        replyResponses = [
          "জাজাকুমুল্লাহু খাইরান উস্তাদ! আপনার দিকনির্দেশনা অনুযায়ী ইনশাআল্লাহ নিয়মিত অনুশীলন করব।",
          "ওয়ালাইকুম আসসালাম উস্তাদ। আজকের তাজবীদ পড়ার অডিওটি একটু পরই পাঠিয়ে দেব।",
          "আলহামদুলিল্লাহ উস্তাদ, নূন সাকিন ও তানভীনের নিয়মগুলো সম্পূর্ণ মুখস্থ হয়েছে।",
          "ইনশাআল্লাহ উস্তাদ, আজকের ক্লাসে সময়মতো উপস্থিত থাকার জন্য সম্পূর্ণ প্রস্তুত আছি।",
        ];
      } else if (activeThread.role === "teacher") {
        replyResponses = [
          "মাশাআল্লাহ, আপনার বার্তা পেয়েছি। তাজবীদ ও মাখরাজ নিয়মিত অনুশীলনে আল্লাহ বরকত দান করুন।",
          "আলহামদুলিল্লাহ! আপনার আগ্রহ প্রশংসনীয়। আজকের ক্লাসের জন্য প্রস্তুত থাকুন।",
          "ইনশাআল্লাহ, আপনার পড়া শোনার পর মাখরাজ ও মদ্দের স্থানগুলো আরও নিখুঁত করে দেব।",
          "সুন্দর লিখেছেন। আপনি চাইলে এখনই ১-অন-১ লাইভ ক্লাসে অংশ নিতে পারেন।",
        ];
      } else {
        replyResponses = [
          "ওয়ালাইকুম আসসালাম! মাশাআল্লাহ, আপনার সাথে রিভিশন দিতে পারলে খুব ভালো হবে।",
          "আলহামদুলিল্লাহ! আমি এখন আমপারার সূরা নাবা রিভিশন দিচ্ছি। আপনি কোন অংশ পড়ছেন?",
          "জাজাকাল্লাহ খাইর! আসুন একসাথে মাশক করে উস্তাদের কাছে পড়া পেশ করি।",
        ];
      }

      const randomResp = replyResponses[Math.floor(Math.random() * replyResponses.length)];
      const replyMsg = {
        id: `reply-${Date.now()}`,
        sender: replyRole,
        senderName: responderName,
        text: randomResp,
        timestamp: new Date().toLocaleTimeString("bn-BD", { hour: "numeric", minute: "numeric", hour12: true }),
        status: "read",
      };

      setThreads((prevThreads) => {
        const reUpdated = prevThreads.map((t) => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              lastActivity: new Date().toISOString(),
              messages: [...t.messages, replyMsg],
            };
          }
          return t;
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reUpdated));
        } catch {}
        return reUpdated;
      });
    }, 1200);
  };

  // Add conversation from search
  const handleStartChatWithTeacher = (teacher) => {
    const tid = teacher.teacher_id || teacher.id;
    const existing = threads.find((t) => t.contactId === tid);
    if (existing) {
      setActiveThreadId(existing.id);
      setSearchQuery("");
      return;
    }

    const newThread = {
      id: `thread-${tid}-${Date.now()}`,
      contactId: tid,
      contactName: teacher.name_bn || teacher.nameBn,
      contactTitle: teacher.title_bn || teacher.titleBn || "কুরআন শিক্ষক",
      contactAvatar: teacher.avatar_url || teacher.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      role: "teacher",
      isOnline: true,
      unreadCount: 0,
      lastActivity: new Date().toISOString(),
      messages: [
        {
          id: `init-${Date.now()}`,
          sender: "teacher",
          senderName: teacher.name_bn || teacher.nameBn,
          text: `আসসালামু আলাইকুম! আমি ${teacher.name_bn || teacher.nameBn}। কুরআন শিক্ষার যেকোনো প্রশ্ন বা মাশক ক্লাসের সময়সূচি জানতে মেসেজ করুন।`,
          timestamp: "এইমাত্র",
          status: "read",
        },
      ],
    };

    setThreads((prev) => {
      const updated = [newThread, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveThreadId(newThread.id);
    setSearchQuery("");
    toast.success(`${teacher.name_bn || teacher.nameBn}-এর সাথে নতুন চ্যাট শুরু হয়েছে`);
  };

  const handleStartChatWithStudent = (student) => {
    const sid = student.student_public_id || student.id;
    const existing = threads.find((t) => t.contactId === sid || t.contactId === student.id);
    if (existing) {
      setActiveThreadId(existing.id);
      setSearchQuery("");
      return;
    }

    const newThread = {
      id: `thread-${sid}-${Date.now()}`,
      contactId: sid,
      contactName: student.display_name || student.name,
      contactTitle: student.student_public_id ? `কুরআন শিক্ষার্থী (${student.student_public_id})` : "কুরআন শিক্ষার্থী",
      contactAvatar: student.avatar_url || "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80",
      role: "student",
      isOnline: true,
      unreadCount: 0,
      lastActivity: new Date().toISOString(),
      messages: [
        {
          id: `init-${Date.now()}`,
          sender: "student",
          senderName: student.display_name || student.name,
          text: `আসসালামু আলাইকুম! আমি ${student.display_name || student.name}। কুরআন মাজীদ পড়া ও মাশক বিষয়ে বার্তা পাঠাতে পারেন।`,
          timestamp: "এইমাত্র",
          status: "read",
        },
      ],
    };

    setThreads((prev) => {
      const updated = [newThread, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveThreadId(newThread.id);
    setSearchQuery("");
    toast.success(`${student.display_name || student.name}-এর সাথে নতুন চ্যাট শুরু হয়েছে`);
  };



  // Search Results for Teachers
  const searchMatchedTeachers = searchQuery.trim()
    ? REAL_TEACHERS_10.filter((t) => {
        const nameBn = (t.name_bn || t.nameBn || "").toLowerCase();
        const tid = (t.teacher_id || t.id || "").toLowerCase();
        const spec = (t.specialties || []).join(" ").toLowerCase();
        const q = searchQuery.toLowerCase();
        return nameBn.includes(q) || tid.includes(q) || spec.includes(q);
      })
    : [];

  // Search Results for Students
  const searchMatchedStudents = searchQuery.trim()
    ? REAL_STUDENTS_10.filter((s) => {
        const name = (s.display_name || s.name || "").toLowerCase();
        const uname = (s.username || "").toLowerCase();
        const pid = (s.student_public_id || s.id || "").toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || uname.includes(q) || pid.includes(q);
      })
    : [];

  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row font-hind-siliguri w-full relative ${
        isEmbedded ? "h-[620px]" : "h-[750px] max-w-6xl mx-auto my-2"
      }`}
    >
      {/* ── LEFT SIDEBAR: THREAD LIST & SEARCH (Facebook Messenger Inbox Style) ── */}
      <div
        className={`w-full md:w-80 lg:w-96 md:shrink-0 md:min-w-[320px] lg:min-w-[360px] border-r border-stone-200 dark:border-stone-800 flex flex-col bg-stone-50/70 dark:bg-stone-950/70 ${
          activeThreadId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Pinned Sticky Inbox Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                মেসেঞ্জার ও চ্যাট
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-stone-400 font-bold">
                ফ্রেন্ডস ও উস্তাদদের সরাসরি ইনবক্স
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Create Group Button */}
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition cursor-pointer flex items-center gap-1"
              title="নতুন গ্রুপ চ্যাট তৈরি করুন"
            >
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-black hidden sm:inline">গ্রুপ</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Search Bar & Filter Pills */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0 sticky top-[65px] z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ফ্রেন্ডস, উস্তাদ বা গ্রুপ খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-stone-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar">
            {[
              { id: "friends", label: "ফ্রেন্ডস ও ফলোয়িং" },
              { id: "all", label: "সব চ্যাট" },
              { id: "groups", label: "গ্রুপসমূহ" },
              { id: "blocked", label: "ব্লক তালিকা" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-black whitespace-nowrap transition cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-stone-200/70 dark:bg-stone-800 text-slate-600 dark:text-stone-400 hover:bg-stone-300/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Dropdown / Suggestions */}
        {searchQuery.trim() && (searchMatchedTeachers.length > 0 || searchMatchedStudents.length > 0) && (
          <div className="p-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 space-y-2 shrink-0 max-h-48 overflow-y-auto">
            {searchMatchedTeachers.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300 px-2 py-0.5">
                  উস্তাদবৃন্দ ({searchMatchedTeachers.length}):
                </p>
                <div className="space-y-1">
                  {searchMatchedTeachers.slice(0, 3).map((teacher) => (
                    <button
                      key={teacher.id}
                      onClick={() => handleStartChatWithTeacher(teacher)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 flex items-center gap-2.5 text-left border border-blue-100 dark:border-blue-900 transition cursor-pointer"
                    >
                      <img
                        src={teacher.avatar_url || teacher.avatar}
                        alt={teacher.name_bn}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {teacher.name_bn || teacher.nameBn}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {teacher.title_bn || teacher.titleBn}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchMatchedStudents.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase text-teal-800 dark:text-teal-300 px-2 py-0.5">
                  শিক্ষার্থীবৃন্দ ({searchMatchedStudents.length}):
                </p>
                <div className="space-y-1">
                  {searchMatchedStudents.slice(0, 3).map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStartChatWithStudent(student)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-teal-100/80 dark:hover:bg-teal-900/40 flex items-center gap-2.5 text-left border border-teal-100 dark:border-teal-900 transition cursor-pointer"
                    >
                      <img
                        src={student.avatar_url}
                        alt={student.display_name}
                        className="w-7 h-7 rounded-full object-cover border border-teal-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {student.display_name || student.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {student.student_public_id} • {student.current_juz || "হিফজ শিক্ষার্থী"}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
              <p className="text-xs font-bold text-slate-600 dark:text-stone-300">
                {activeFilter === "blocked"
                  ? "কোনো ব্লককৃত ব্যবহারকারী নেই"
                  : activeFilter === "groups"
                  ? "কোনো গ্রুপ চ্যাট পাওয়া যায়নি"
                  : "ফ্রেন্ডস তালিকায় কেউ নেই"}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                {activeFilter === "groups"
                  ? "উপরের '+ গ্রুপ' বাটনে চাপ দিয়ে একটি নতুন কুরআন গ্রুপ খুলুন।"
                  : "যাদের আপনি ফলো করছেন বা যারা আপনার ফ্রেন্ডস, শুধুমাত্র তাদের চ্যাট এখানে থাকবে। সার্চ করে যেকোনো উস্তাদ বা ফ্রেন্ডের সাথে নতুন বার্তা শুরু করতে পারেন।"}
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isActive = thread.id === activeThread?.id;
              const lastMsg = thread.messages[thread.messages.length - 1];
              const nick = customNicknames[thread.contactId];
              const isBlocked = blockedUserIds.includes(thread.contactId);

              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setThreads((prev) =>
                      prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
                    );
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shadow-xs"
                      : "hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
                  }`}
                >
                  {/* Contact Avatar with Online Badge */}
                  <div className="relative shrink-0">
                    <img
                      src={thread.contactAvatar}
                      alt={thread.contactName}
                      className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700 shadow-xs"
                    />
                    {thread.isGroup ? (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-stone-900 absolute -bottom-1 -right-1">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                    ) : thread.isOnline ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900 absolute bottom-0 right-0" />
                    ) : null}
                  </div>

                  {/* Thread Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4
                          className={`text-xs font-black truncate ${
                            isActive ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {nick ? `${nick} (${thread.contactName})` : thread.contactName}
                        </h4>
                        {isBlocked && (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[9px] font-bold shrink-0">
                            ব্লকড
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {lastMsg ? lastMsg.timestamp : ""}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-stone-400 truncate mt-0.5 font-medium">
                      {lastMsg ? lastMsg.text : "বার্তা পাঠানো শুরু করুন..."}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {thread.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT MAIN CHAT WINDOW (Active Conversation Area) ── */}
      {activeThread ? (
        <div
          className={`flex-1 min-w-0 flex flex-col bg-white dark:bg-stone-900 ${
            activeThreadId ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Active Chat Header */}
          <div className="px-3 sm:px-5 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900 shadow-2xs gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Back button on mobile to return to thread list */}
              <button
                type="button"
                onClick={() => setActiveThreadId(null)}
                className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 text-xs font-bold transition cursor-pointer shrink-0"
                title="ইনবক্সে ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">ইনবক্স</span>
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeThread.contactAvatar}
                  alt={activeThread.contactName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                {activeThread.isGroup ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-white">
                    <Users className="w-2 h-2" />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {currentContactNickname
                      ? `${currentContactNickname} (${activeThread.contactName})`
                      : activeThread.contactName}
                  </h3>
                  {!activeThread.isGroup && (
                    <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white shrink-0" />
                  )}
                  {isCurrentContactBlocked && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">
                      ব্লকড
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="truncate">
                    {activeThread.isGroup ? activeThread.contactTitle : `সক্রিয় আছেন • ${activeThread.contactTitle}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions & 3-Dots Menu */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Call Audio */}
              <button
                onClick={() => handleStartCall("audio")}
                disabled={isCurrentContactBlocked}
                className="p-2 rounded-xl text-slate-600 dark:text-stone-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-stone-200 dark:border-stone-800 disabled:opacity-30 transition cursor-pointer"
                title="১-অন-১ লাইভ অডিও কল"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
              </button>

              {/* Call Video */}
              <button
                onClick={() => handleStartCall("video")}
                disabled={isCurrentContactBlocked}
                className="p-2 rounded-xl text-slate-600 dark:text-stone-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-stone-200 dark:border-stone-800 disabled:opacity-30 transition cursor-pointer"
                title="১-অন-১ লাইভ ভিডিও কল"
              >
                <Video className="w-4 h-4 text-blue-600" />
              </button>

              {/* Profile Button (Non-groups) */}
              {!activeThread.isGroup && (
                activeThread.role === "student" ? (
                  onOpenStudentProfile && (
                    <button
                      onClick={() => {
                        const matched = REAL_STUDENTS_10.find(
                          (s) => s.id === activeThread.contactId || s.student_public_id === activeThread.contactId
                        );
                        if (matched) {
                          onOpenStudentProfile(matched);
                        } else {
                          onOpenStudentProfile({
                            id: activeThread.contactId,
                            display_name: activeThread.contactName,
                            avatar_url: activeThread.contactAvatar,
                            student_public_id: activeThread.contactId,
                            role: "student",
                          });
                        }
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-xs font-bold transition cursor-pointer hidden sm:block"
                    >
                      প্রোফাইল
                    </button>
                  )
                ) : (
                  onOpenTeacherProfile && (
                    <button
                      onClick={() => {
                        const matched = REAL_TEACHERS_10.find(
                          (t) => t.id === activeThread.contactId || t.teacher_id === activeThread.contactId
                        );
                        if (matched) onOpenTeacherProfile(matched);
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition cursor-pointer hidden sm:block"
                    >
                      প্রোফাইল
                    </button>
                  )
                )
              )}

              {/* 3-Dots Options Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition cursor-pointer"
                  title="মেসেঞ্জার সেটিংস ও অপশন"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showOptionsMenu && (
                  <div className="absolute right-0 top-11 w-52 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-1.5 z-40 space-y-1 text-xs font-bold animate-fadeIn">
                    {!activeThread.isGroup && (
                      <button
                        onClick={() => {
                          setNicknameInput(customNicknames[activeThread.contactId] || "");
                          setShowNicknameModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>ডাকনাম (Nickname) দিন</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowThemeModal(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-600" />
                      <span>চ্যাট থিম পরিবর্তন</span>
                    </button>

                    {!activeThread.isGroup && (
                      <button
                        onClick={handleToggleBlock}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2 cursor-pointer ${
                          isCurrentContactBlocked
                            ? "hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isCurrentContactBlocked ? "ব্যবহারকারীকে আনব্লক করুন" : "ব্যবহারকারীকে ব্লক করুন"}</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 dark:border-stone-800 my-1" />

                    <button
                      onClick={() => {
                        if (confirm("আপনি কি নিশ্চিতভাবে এই চ্যাট হিস্ট্রি মুছে ফেলতে চান?")) {
                          setThreads((prev) => prev.filter((t) => t.id !== activeThread.id));
                          setShowOptionsMenu(false);
                          toast.info("চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে");
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>চ্যাট ডিলিট করুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blocked Alert Banner if blocked */}
          {isCurrentContactBlocked && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-200 px-5 shrink-0">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>আপনি এই ব্যবহারকারীকে ব্লক করেছেন। তিনি আপনাকে বার্তা পাঠাতে পারবেন না।</span>
              </div>
              <button
                onClick={handleToggleBlock}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black transition cursor-pointer shrink-0"
              >
                আনব্লক করুন
              </button>
            </div>
          )}

          {/* Message Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/40 dark:bg-stone-950/40">
            {/* Conversation Start Banner */}
            <div className="text-center py-4 space-y-2 max-w-sm mx-auto">
              <img
                src={activeThread.contactAvatar}
                alt={activeThread.contactName}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500 shadow-md"
              />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {currentContactNickname
                  ? `${currentContactNickname} (${activeThread.contactName})`
                  : activeThread.contactName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-stone-400">
                {activeThread.contactTitle}
              </p>
              <span className="inline-block text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold">
                🔒 এনক্রিপ্টেড ও সম্পূর্ণ নিরাপদ মেসেঞ্জার কথোপকথন
              </span>
            </div>

            {/* Messages */}
            {activeThread.messages.map((msg, index) => {
              const isOutgoing = msg.sender === "user" || (currentTeacherUser && msg.sender === "teacher");

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-end gap-2 ${isOutgoing ? "justify-end" : "justify-start"}`}
                >
                  {!isOutgoing && (
                    <img
                      src={activeThread.contactAvatar}
                      alt={activeThread.contactName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-stone-200"
                    />
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 shadow-2xs ${
                      isOutgoing
                        ? `${currentTheme.bubble} rounded-br-xs`
                        : "bg-white dark:bg-stone-800 text-slate-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/80 rounded-bl-xs"
                    }`}
                  >
                    {activeThread.isGroup && !isOutgoing && (
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 ${
                        isOutgoing ? "opacity-80" : "text-slate-400"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isOutgoing && (
                        <span>
                          {msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {!isCurrentContactBlocked && (
            <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-stone-900 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">দ্রুত বার্তা:</span>
              {(activeThread.isGroup
                ? [
                    "আসসালামু আলাইকুম সবাইকে",
                    "আজকের গ্রুপ সেশন কখন শুরু হবে?",
                    "আমার সবক পড়া প্রস্তুত আছে",
                    "মাশাআল্লাহ, সবার জন্য শুভকামনা",
                  ]
                : activeThread.role === "student"
                ? [
                    "মাশাআল্লাহ, আপনার পড়া খুব সুন্দর হয়েছে",
                    "তাজবীদ ও মাখরাজ নিয়মিত অনুশীলন করুন",
                    "আজকের ক্লাসের সবক প্রস্তুত রাখুন",
                    "আগামীকাল লাইভ ক্লাসে অংশ নিন",
                  ]
                : [
                    "আসসালামু আলাইকুম উস্তাদ",
                    "১-অন-১ ক্লাসের সময় জানতে চাই",
                    "সূরা আল-ফাতিহা মাশক করতে চাই",
                    "আজকের সবকের অগ্রগতি পাঠালাম",
                  ]
              ).map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-800 dark:text-stone-300 text-[11px] font-bold border border-stone-200 dark:border-stone-700 whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar or Blocked Notice */}
          <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
            {isCurrentContactBlocked ? (
              <div className="p-3 text-center bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                <span>এই ব্যবহারকারী ব্লক থাকায় আপনি কোনো বার্তা পাঠাতে পারবেন না।</span>
                <button
                  onClick={handleToggleBlock}
                  className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
                >
                  আনব্লক করুন
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => toast.info("তিলাওয়াত অডিও রেকর্ড বা ফাইল যুক্ত করার মেনু খোলা হয়েছে।")}
                  className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 transition cursor-pointer shrink-0"
                  title="ফাইল বা অডিও নোট যুক্ত করুন"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="একটি বার্তা লিখুন (ফেসবুক মেসেঞ্জারের মতো সংরক্ষিত থাকবে)..."
                  className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className={`p-3 rounded-2xl ${currentTheme.sendBtn} disabled:opacity-40 text-white font-black shadow-md transition active:scale-95 cursor-pointer shrink-0`}
                  title="বার্তা পাঠান"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 min-w-0 items-center justify-center p-8 text-center text-slate-400">
          <p className="text-sm font-bold">একটি চ্যাট নির্বাচন করুন</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL 1: CREATE GROUP CHAT (নতুন কুরআন গ্রুপ তৈরি)
      ══════════════════════════════════════════════════════════════════════ */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  নতুন গ্রুপ চ্যাট তৈরি করুন
                </h3>
              </div>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-1">
                  গ্রুপের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="যেমন: আমপারা হিফজ ও তাজবীদ সার্কেল"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-slate-900 dark:text-white border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-1">
                  গ্রুপের ক্যাটাগরি / বিষয়
                </label>
                <select
                  value={groupCategory}
                  onChange={(e) => setGroupCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-slate-900 dark:text-white border border-stone-300 dark:border-stone-700 focus:outline-none"
                >
                  <option value="হিফজ ও তাজবীদ সার্কেল">হিফজ ও তাজবীদ সার্কেল</option>
                  <option value="নূরানী কায়দা ও মাশক ব্যাচ">নূরানী কায়দা ও মাশক ব্যাচ</option>
                  <option value="সূরা বাকারা মুখস্থ গ্রুপ">সূরা বাকারা মুখস্থ গ্রুপ</option>
                  <option value="মহিলা কুরআন শিক্ষা ফোরাম">মহিলা কুরআন শিক্ষা ফোরাম</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-2">
                  সদস্য নির্বাচন করুন ({selectedGroupMembers.length} জন নির্বাচিত):
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 px-1">
                    শিক্ষার্থীবৃন্দ ও ফ্রেন্ডস:
                  </p>
                  {REAL_STUDENTS_10.map((s) => {
                    const isChecked = selectedGroupMembers.includes(s.id || s.student_public_id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer border border-stone-100 dark:border-stone-800 text-xs font-bold"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const sid = s.id || s.student_public_id;
                            if (e.target.checked) {
                              setSelectedGroupMembers((prev) => [...prev, sid]);
                            } else {
                              setSelectedGroupMembers((prev) => prev.filter((id) => id !== sid));
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <img
                          src={s.avatar_url}
                          alt={s.display_name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="flex-1 truncate">{s.display_name}</span>
                        <span className="text-[10px] text-slate-400">{s.student_public_id}</span>
                      </label>
                    );
                  })}

                  <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 px-1 pt-2">
                    উস্তাদবৃন্দ:
                  </p>
                  {REAL_TEACHERS_10.slice(0, 4).map((t) => {
                    const tid = t.id || t.teacher_id;
                    const isChecked = selectedGroupMembers.includes(tid);
                    return (
                      <label
                        key={t.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer border border-stone-100 dark:border-stone-800 text-xs font-bold"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupMembers((prev) => [...prev, tid]);
                            } else {
                              setSelectedGroupMembers((prev) => prev.filter((id) => id !== tid));
                            }
                          }}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <img
                          src={t.avatar_url || t.avatar}
                          alt={t.name_bn}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="flex-1 truncate">{t.name_bn || t.nameBn}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">উস্তাদ</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs font-bold text-slate-700 dark:text-stone-300 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md cursor-pointer transition active:scale-95"
                >
                  গ্রুপ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL 2: SET NICKNAME (ডাকনাম নির্ধারণ করুন)
      ══════════════════════════════════════════════════════════════════════ */}
      {showNicknameModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ডাকনাম নির্ধারণ করুন
                </h3>
              </div>
              <button
                onClick={() => setShowNicknameModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNickname} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                আসল নাম: <strong className="text-slate-900 dark:text-white">{activeThread.contactName}</strong>
              </p>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-stone-300 mb-1">
                  আপনার পছন্দের ডাকনাম (Nickname):
                </label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="যেমন: উস্তাদজী, প্রধান ক্বারী, বন্ধু মামুন"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-slate-900 dark:text-white border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNicknameInput("");
                    const updated = { ...customNicknames };
                    delete updated[activeThread.contactId];
                    setCustomNicknames(updated);
                    try {
                      localStorage.setItem(NICKNAMES_KEY, JSON.stringify(updated));
                    } catch {}
                    setShowNicknameModal(false);
                    toast.info("ডাকনাম মুছে ফেলা হয়েছে");
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  ডাকনাম মুছুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md cursor-pointer transition active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL 3: CHAT THEME SELECTOR (চ্যাট থিম)
      ══════════════════════════════════════════════════════════════════════ */}
      {showThemeModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  চ্যাট থিম নির্বাচন করুন
                </h3>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {Object.values(CHAT_THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleSelectTheme(th.id)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-left border cursor-pointer transition ${
                    currentThemeKey === th.id
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                      : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full ${th.bubble.split(" ")[0]} border-2 border-white`} />
                    <span className="text-xs font-black text-slate-900 dark:text-white">{th.name}</span>
                  </div>
                  {currentThemeKey === th.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         MODAL 4: FACEBOOK MESSENGER LIVE CALL MODAL (অডিও/ভিডিও কল)
      ══════════════════════════════════════════════════════════════════════ */}
      {callState.active && activeThread && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6 animate-scaleUp relative overflow-hidden">
            {/* Pulsing ring aura */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="relative w-28 h-28 mx-auto">
                <img
                  src={activeThread.contactAvatar}
                  alt={activeThread.contactName}
                  className="w-full h-full rounded-full object-cover border-4 border-emerald-500 shadow-2xl"
                />
                <span className="w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-slate-900 absolute bottom-1 right-1 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  {getDisplayName(activeThread)}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  {callState.type === "video" ? "ভিডিও কল" : "অডিও কল"} • রহমানিয়া মেসেঞ্জার
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-mono font-bold border border-slate-700">
                  {callState.status === "connecting"
                    ? "রিং হচ্ছে (Connecting...)"
                    : `কথা হচ্ছে (${formatCallDuration(callState.durationSeconds)})`}
                </div>
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800 relative z-10">
              {/* Mute Mic */}
              <button
                onClick={() => setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}
                className={`p-3.5 rounded-full border transition cursor-pointer ${
                  callState.isMuted
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
                title={callState.isMuted ? "মাইক্রোফোন অন করুন" : "মাইক্রোফোন মিউট করুন"}
              >
                {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Toggle Video */}
              {callState.type === "video" && (
                <button
                  onClick={() => setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
                  className={`p-3.5 rounded-full border transition cursor-pointer ${
                    callState.isVideoOff
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                  title={callState.isVideoOff ? "ক্যামেরা চালু করুন" : "ক্যামেরা বন্ধ করুন"}
                >
                  {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 transition active:scale-90 cursor-pointer"
                title="কল শেষ করুন"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
