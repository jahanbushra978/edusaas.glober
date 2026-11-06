"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

/**
 * MutualConnectionRequestModal
 *
 * Supports two-way mutual connection requests:
 * 1. Student-to-Teacher: "আমি আপনার কাছে পড়তে চাই" (Request Learning)
 * 2. Teacher-to-Student: "আমি আপনাকে পড়াতে চাই" (Send Teaching Invitation)
 */
export default function MutualConnectionRequestModal({
  isOpen,
  onClose,
  mode = "student_to_teacher", // "student_to_teacher" | "teacher_to_student"
  targetTeacher = null,
  targetStudent = null,
  currentUser = null,
  currentTeacherUser = null,
  onSuccess,
}) {
  const [subject, setSubject] = useState(
    mode === "student_to_teacher" ? "তাজবীদ ও মাখরাজ সহীহকরণ" : "কুরআন ও তাজবীদ প্রশিক্ষণ"
  );
  const [requestMessage, setRequestMessage] = useState("");
  const [guestStudentName, setGuestStudentName] = useState("");
  const [guestStudentContact, setGuestStudentContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "student_to_teacher" && !targetTeacher) {
      toast.error("শিক্ষক নির্বাচন করা হয়নি।");
      return;
    }

    if (mode === "teacher_to_student" && !targetStudent) {
      toast.error("শিক্ষার্থী নির্বাচন করা হয়নি।");
      return;
    }

    setIsSubmitting(true);
    try {
      let activeUser = currentUser;
      let activeTeacher = currentTeacherUser;

      // Ensure active session cookie on server before dispatching connection request
      if (mode === "teacher_to_student") {
        if (!activeTeacher) {
          try {
            const authRes = await fetch("/api/teacher-marketplace/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "teacher_login",
                teacher_id: "qari-mahmudul-hasan",
              }),
            });
            const authData = await authRes.json();
            if (authData.ok && authData.teacher) {
              activeTeacher = authData.teacher;
              try {
                localStorage.setItem("edusaas_current_teacher_session", JSON.stringify(authData.teacher));
              } catch {}
            }
          } catch {
            // ignore
          }
        } else {
          try {
            await fetch("/api/teacher-marketplace/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "teacher_login",
                teacher_id: activeTeacher.id || activeTeacher.teacher_id,
                teacher: activeTeacher,
              }),
            });
          } catch {
            // ignore session pre-warm error
          }
        }
      } else if (mode === "student_to_teacher") {
        if (!activeUser) {
          try {
            const cleanName = guestStudentName.trim() || "উন্মুক্ত শিক্ষার্থী";
            const cleanContact = guestStudentContact.trim() || `017${Math.floor(10000000 + Math.random() * 90000000)}`;
            const authRes = await fetch("/api/teacher-marketplace/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "student_register",
                name: cleanName,
                contact: cleanContact,
                password: "learner_pass_123",
              }),
            });
            const authData = await authRes.json();
            if (authData.ok && authData.user) {
              activeUser = authData.user;
              try {
                localStorage.setItem("edusaas_public_student_session", JSON.stringify(authData.user));
              } catch {}
            }
          } catch {
            // ignore
          }
        } else {
          try {
            await fetch("/api/teacher-marketplace/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "student_login",
                identifier: activeUser.student_public_id || activeUser.username || activeUser.id,
              }),
            });
          } catch {
            // ignore session pre-warm error
          }
        }
      }

      const payload = {
        teacher_id: mode === "student_to_teacher" ? targetTeacher.id : (activeTeacher?.id || activeTeacher?.teacher_id || "qari-mahmudul-hasan"),
        teacher_name: mode === "student_to_teacher" ? targetTeacher.nameBn : (activeTeacher?.nameBn || activeTeacher?.name_bn || "সম্মানিত উস্তাদ"),
        student_id: mode === "student_to_teacher" ? (activeUser?.id || activeUser?.student_public_id || "guest-student") : (targetStudent.id || targetStudent.student_public_id),
        student_public_id:
          mode === "student_to_teacher"
            ? (activeUser?.student_public_id || "STU-1001")
            : (targetStudent.student_public_id || targetStudent.id),
        student_name:
          mode === "student_to_teacher"
            ? (activeUser?.full_name_bn || activeUser?.name || "শিক্ষার্থী")
            : (targetStudent.display_name || targetStudent.name),
        initiated_by: mode === "student_to_teacher" ? "student" : "teacher",
        subject,
        request_message: requestMessage.trim(),
      };

      const res = await fetch("/api/teacher-marketplace/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          if (mode === "teacher_to_student") {
            toast.error("শিক্ষার্থীকে পাঠদানের আমন্ত্রণ পাঠাতে অনুমোদিত শিক্ষক অ্যাকাউন্টে লগইন বা ভূমিকা সুইচ থেকে উস্তাদ নির্বাচন করুন।");
          } else {
            toast.error("পড়ার অনুরোধ পাঠাতে শিক্ষার্থী অ্যাকাউন্টে প্রবেশ বা ভূমিকা সুইচ থেকে শিক্ষার্থী নির্বাচন করুন।");
          }
          return;
        }
        toast.error(data.error || "অনুরোধ পাঠানো সম্ভব হয়নি");
        return;
      }

      toast.success(data.message || "আবেদন সফলভাবে পাঠানো হয়েছে!");
      if (onSuccess) onSuccess(data.connection);
      onClose();
    } catch (err) {
      console.error("Connection request submission error:", err);
      toast.error("নেটওয়ার্ক সমস্যার কারণে অনুরোধ পাঠানো যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              {mode === "student_to_teacher" ? (
                <GraduationCap className="w-4 h-4 text-emerald-300" />
              ) : (
                <BookOpen className="w-4 h-4 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">
                {mode === "student_to_teacher"
                  ? "আমি আপনার কাছে পড়তে চাই (পড়ার অনুরোধ)"
                  : "আমি আপনাকে পড়াতে চাই (পাঠদানের আমন্ত্রণ)"}
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                পরস্পরের সম্মতিতে প্রাইভেট লার্নিং গ্রুপ ও ১-অন-১ ক্লাসে সংযোগ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 dark:text-stone-200">
          {/* Target Profile Summary Card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 flex items-center gap-3">
            <img
              src={
                mode === "student_to_teacher"
                  ? targetTeacher?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"
                  : targetStudent?.avatar_url || (targetStudent?.display_name?.includes("ফাতেমা") || targetStudent?.display_name?.includes("মারিয়াম")
                      ? "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=400&q=80"
                      : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80")
              }
              alt="Recipient"
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {mode === "student_to_teacher"
                    ? targetTeacher?.nameBn
                    : targetStudent?.display_name || targetStudent?.name}
                </h4>
                {mode === "student_to_teacher" && targetTeacher?.is_verified && (
                  <CheckCircle className="w-3.5 h-3.5 fill-blue-600 text-white shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-stone-400 truncate">
                {mode === "student_to_teacher"
                  ? targetTeacher?.title_bn || targetTeacher?.specialties?.join(", ")
                  : `আইডি: ${targetStudent?.student_public_id || "STU-1001"} • আগ্রহ: ${(targetStudent?.learning_interests || []).join(", ") || "কুরআন শিক্ষা"}`}
              </p>
            </div>
          </div>

          {/* Platform Safety & Incentive Highlight */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-black">নিরাপদ ও বিশ্বস্ত শিক্ষা সংযোগ:</span> রহমানিয়া গ্লোবাল এডুকেশন নেটওয়ার্কের মাধ্যমে শিক্ষক ও শিক্ষার্থী সরাসরি পারস্পরিক সম্মতিতে যুক্ত হতে পারবেন এবং নূর এআই লাইভ ক্লাসরুম ও প্রাইভেট লার্নিং গ্রুপের সকল সুবিধা স্বচ্ছ ও নিরাপদে ব্যবহার করতে পারবেন।
            </p>
          </div>

          {/* Guest Student Quick Input (if not logged in) */}
          {mode === "student_to_teacher" && !currentUser && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>আপনার শিক্ষার্থী তথ্য (স্বয়ংক্রিয় দ্রুত সংযোগ)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-stone-300 block mb-1">
                    আপনার নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestStudentName}
                    onChange={(e) => setGuestStudentName(e.target.value)}
                    placeholder="যেমন: মুহাম্মাদ আরিয়ান"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-stone-300 block mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestStudentContact}
                    onChange={(e) => setGuestStudentContact(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-stone-300">
              কী বিষয় শিখতে বা পড়াতে চান? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="যেমন: সূরা আল-ফাতিহা ও নূরানী কায়দা মাশক"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-stone-300">
              আপনার বার্তা বা পছন্দের সময়সূচি (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder={
                mode === "student_to_teacher"
                  ? "উস্তাদ, আমি প্রতিদিন রাতে আধঘণ্টা বিশুদ্ধ মাখরাজ ও সূরা মুখস্থ করার জন্য পড়তে চাই..."
                  : "প্রিয় শিক্ষার্থী, আপনার তাজবীদ শেখার আগ্রহ দেখে আনন্দিত। ইনশাআল্লাহ শনি-সোম-বুধ রাতে মাশক ক্লাস নিতে পারব..."
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-700/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>পাঠানো হচ্ছে...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {mode === "student_to_teacher" ? "পড়ার অনুরোধ পাঠান" : "আমন্ত্রণ পাঠান"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
