"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  BookOpen,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  ShieldCheck,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import WebRTCLiveCallModal from "./WebRTCLiveCallModal";

export default function PrivateLearningGroupModal({
  isOpen,
  onClose,
  group,
  currentUserId,
  userRole = "student", // "student" | "teacher"
  userName = "ব্যবহারকারী",
  onOpenQuranReader,
  onOpenLiveVoiceTutor,
}) {
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "schedule" | "tools" | "live_class"
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [msgType, setMsgType] = useState("text"); // "text" | "lesson_note" | "resource_link"
  const [isLoading, setIsLoading] = useState(false);
  const [showLiveCallModal, setShowLiveCallModal] = useState(false);
  const chatBottomRef = useRef(null);

  // Fetch messages when opened
  useEffect(() => {
    if (!isOpen || !group?.id) return;

    async function fetchMessages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/teacher-marketplace/connections/messages?groupId=${group.id}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.warn("Could not fetch group messages:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [isOpen, group?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !group) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const payload = {
      groupId: group.id,
      senderId: currentUserId || `user-${Date.now()}`,
      senderRole: userRole,
      senderName: userName,
      messageType: msgType,
      content: newMsg.trim(),
    };

    // Optimistic message
    const tempMsg = {
      id: `temp-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMsg("");
    setMsgType("text");

    try {
      const res = await fetch("/api/teacher-marketplace/connections/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error("বার্তা পাঠানো যায়নি।");
      }
    } catch (err) {
      console.warn("Send message error:", err);
    }
  };

  const scheduleInfo = group.schedule_info || {
    subject: "কুরআন ও তাজবীদ শিক্ষা",
    weekly_days: ["শনিবার", "সোমবার", "বুধবার"],
    time_bn: "রাত ৮:০০টা – ৯:০০টা",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-950 to-stone-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight">{group.group_name || "প্রাইভেট লার্নিং গ্রুপ"}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                  সক্রিয় শিক্ষা সংযোগ
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                উস্তাদ ও শিক্ষার্থীর জন্য নিবেদিত সুরক্ষিত প্রাইভেট লার্নিং স্পেস
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLiveCallModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/30 transition active:scale-95 cursor-pointer animate-pulse"
              title="১-অন-১ লাইভ ক্লাসরুম ও স্ক্রিন শেয়ার"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">১-অন-১ লাইভ ক্লাস</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "chat"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-600 dark:text-stone-400 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>বার্তা ও রিসোর্স</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`py-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "schedule"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-600 dark:text-stone-400 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ক্লাস শিডিউল</span>
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`py-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "tools"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-600 dark:text-stone-400 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>শিক্ষা সহায়ক টুলস</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/50 dark:bg-stone-950">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col justify-between space-y-4">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {isLoading ? (
                  <p className="text-xs text-center text-slate-500 py-8">বার্তা লোড হচ্ছে...</p>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600 dark:text-stone-400">
                      কোনো বার্তা বা নোট পাওয়া যায়নি। প্রথম বার্তাটি লিখুন।
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === currentUserId || m.senderId === currentUserId;
                    const isNote = m.message_type === "lesson_note" || m.messageType === "lesson_note";
                    const isLink = m.message_type === "resource_link" || m.messageType === "resource_link";

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                      >
                        <span className="text-[10px] text-slate-400 px-1 font-bold">
                          {m.sender_name || m.senderName || (m.sender_role === "teacher" ? "উস্তাদ" : "শিক্ষার্থী")}
                        </span>
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs ${
                            isNote
                              ? "bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                              : isLink
                              ? "bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                              : isMe
                              ? "bg-emerald-700 text-white rounded-br-xs"
                              : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-slate-800 dark:text-stone-200 rounded-bl-xs"
                          }`}
                        >
                          {isNote && (
                            <div className="flex items-center gap-1 font-black text-[11px] mb-1 text-amber-700 dark:text-amber-400">
                              <FileText className="w-3 h-3" />
                              <span>পাঠ নোট / তাজবীদ হোমওয়ার্ক</span>
                            </div>
                          )}
                          {isLink && (
                            <div className="flex items-center gap-1 font-black text-[11px] mb-1 text-blue-700 dark:text-blue-400">
                              <LinkIcon className="w-3 h-3" />
                              <span>শিক্ষা লিংক ও রেফারেন্স</span>
                            </div>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content || m.message_text}</p>
                          <span className="block text-[9px] mt-1 opacity-70 text-right">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "এখনই"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                {/* Type Selector Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMsgType("text")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      msgType === "text"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
                    }`}
                  >
                    সাধারণ বার্তা
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgType("lesson_note")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      msgType === "lesson_note"
                        ? "bg-amber-600 text-white"
                        : "bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>পাঠ নোট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsgType("resource_link")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      msgType === "resource_link"
                        ? "bg-blue-600 text-white"
                        : "bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>রিসোর্স লিংক</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder={
                      msgType === "lesson_note"
                        ? "আজকের পাঠ নোট বা তাজবীদ অনুশীলের নির্দেশনা লিখুন..."
                        : msgType === "resource_link"
                        ? "কুরআন রিডার লিংক বা রেফারেন্স পেস্ট করুন..."
                        : "বার্তা লিখুন..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-md transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="max-w-xl mx-auto space-y-4 py-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">সাপ্তাহিক পাঠদান শিডিউল</h4>
                    <p className="text-xs text-slate-500">পরস্পরের সম্মতিতে নির্ধারিত ক্লাসের সময়সূচি</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80">
                    <span className="font-bold text-slate-600 dark:text-stone-300">শিক্ষাদানের বিষয়:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">{scheduleInfo.subject}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80">
                    <span className="font-bold text-slate-600 dark:text-stone-300">সাপ্তাহিক দিনসমূহ:</span>
                    <span className="font-black text-slate-800 dark:text-stone-200">
                      {Array.isArray(scheduleInfo.weekly_days) ? scheduleInfo.weekly_days.join(", ") : "শনিবার, সোমবার, বুধবার"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80">
                    <span className="font-bold text-slate-600 dark:text-stone-300">ক্লাসের সময়:</span>
                    <span className="font-black text-slate-800 dark:text-stone-200">{scheduleInfo.time_bn}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowLiveCallModal(true)}
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>এখনই ১-অন-১ লাইভ ক্লাসরুম শুরু করুন</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="max-w-2xl mx-auto space-y-4 py-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                রহমানিয়া ইনস্টিটিউট শিক্ষা সহায়ক প্ল্যাটফর্ম টুলস
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quran Reader */}
                <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm hover:border-emerald-500 transition">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">পূর্ণ কুরআন মাজীদ রিডার</h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ১১৪ সূরা, ৩০ পারা, শব্দে শব্দে মাশক এবং ক্বারীদের অডিও তিলাওয়াত।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenQuranReader) onOpenQuranReader();
                      else window.open("/quran-tutor", "_blank");
                    }}
                    className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>কুরআন খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Nur AI Voice Classroom */}
                <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm hover:border-emerald-500 transition">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">নূর এআই তাজবীদ টিউটর</h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ভয়েস মাশক, উচ্চারণ মূল্যায়ন ও তাৎক্ষণিক তাজবীদ সংশোধন নির্দেশিকা।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenLiveVoiceTutor) onOpenLiveVoiceTutor();
                      else window.open("/quran-tutor/live-class", "_blank");
                    }}
                    className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 text-amber-700 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>ভয়েস টিউটর খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded WebRTC 1-on-1 Live Class with Screen Sharing */}
      {showLiveCallModal && (
        <WebRTCLiveCallModal
          teacher={{
            id: group.teacher_id,
            nameBn: group.group_name ? group.group_name.split(" ও ")[0] : "উস্তাদ",
            avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
          }}
          studentUser={{
            id: group.student_id,
            full_name_bn: userName,
          }}
          onClose={() => setShowLiveCallModal(false)}
        />
      )}
    </div>
  );
}
