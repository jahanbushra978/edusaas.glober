"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Users,
  CreditCard,
  Clock,
  ShieldCheck,
  CheckCircle,
  Phone,
  X,
  Edit3,
  Save,
  Star,
  FileText,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// Base student profile structure for Public Quran Learner
const DEFAULT_STUDENT_PROFILE = {
  id: null,
  nameBn: "উন্মুক্ত শিক্ষার্থী",
  nameEn: "Public Quran Learner",
  titleBn: "উন্মুক্ত কুরআন ও তাজবীদ শিক্ষার্থী",
  category: "সবার জন্য উন্মুক্ত প্ল্যাটফর্ম",
  currentJuz: "তথ্য দেওয়া হয়নি",
  avatar: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  verified: true,
  isOnline: true,
  completedClasses: 0,
  totalHours: 0,
  tajweedScore: 0,
  hifzProgressPct: 0,
  targetCompletionDate: "তথ্য দেওয়া হয়নি",
  accountType: "উন্মুক্ত পাবলিক শিক্ষার্থী",
  bio: "কুরআন বিশুদ্ধভাবে শেখার জন্য উন্মুক্ত প্ল্যাটফর্মে নিয়মিত অধ্যয়ন করছি।",
  enrolledTeachers: [],
  paymentHistory: [],
  dailyLessons: null,
};

export default function StudentProfileModal({
  student,
  canEdit = false,
  onClose,
  onCallTeacher,
}) {
  const [profileData, setProfileData] = useState(() => ({
    ...DEFAULT_STUDENT_PROFILE,
    ...(student || {}),
    nameBn: student?.nameBn || student?.full_name_bn || student?.name || "তথ্য দেওয়া হয়নি",
    nameEn: student?.nameEn || student?.full_name_en || student?.name_en || "Not Provided",
    email: student?.email || "তথ্য দেওয়া হয়নি",
    phone: student?.phone || student?.mobile || "তথ্য দেওয়া হয়নি",
    enrolledTeachers: Array.isArray(student?.enrolledTeachers) ? student.enrolledTeachers : [],
    paymentHistory: Array.isArray(student?.paymentHistory) ? student.paymentHistory : [],
    dailyLessons: student?.dailyLessons || null,
  }));

  const [activeTab, setActiveTab] = useState("learning"); // 'learning' | 'teachers' | 'payments' | 'about'
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    nameBn: profileData.nameBn,
    nameEn: profileData.nameEn,
    titleBn: profileData.titleBn,
    bio: profileData.bio,
    targetCompletionDate: profileData.targetCompletionDate,
  });

  // Strict Prop Synchronization: Update state whenever student prop changes
  useEffect(() => {
    if (student) {
      const merged = {
        ...DEFAULT_STUDENT_PROFILE,
        ...student,
        nameBn: student.nameBn || student.full_name_bn || student.name || "তথ্য দেওয়া হয়নি",
        nameEn: student.nameEn || student.full_name_en || student.name_en || "Not Provided",
        email: student.email || "তথ্য দেওয়া হয়নি",
        phone: student.phone || student.mobile || "তথ্য দেওয়া হয়নি",
        enrolledTeachers: Array.isArray(student.enrolledTeachers) ? student.enrolledTeachers : [],
        paymentHistory: Array.isArray(student.paymentHistory) ? student.paymentHistory : [],
        dailyLessons: student.dailyLessons || null,
      };
      setProfileData(merged);
      setEditForm({
        nameBn: merged.nameBn,
        nameEn: merged.nameEn,
        titleBn: merged.titleBn,
        bio: merged.bio,
        targetCompletionDate: merged.targetCompletionDate,
      });
    }
  }, [student]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProfileData((prev) => ({
      ...prev,
      nameBn: editForm.nameBn,
      nameEn: editForm.nameEn,
      titleBn: editForm.titleBn,
      bio: editForm.bio,
      targetCompletionDate: editForm.targetCompletionDate,
    }));
    setIsEditing(false);
    toast.success("মাশাআল্লাহ! আপনার শিক্ষার্থী প্রোফাইল সফলভাবে আপডেট হয়েছে।");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* ── TOP MODAL CLOSE BAR ── */}
        <div className="p-3 bg-stone-900 text-white flex items-center justify-between px-6 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>ফেসবুক-স্টাইল শিক্ষার্থী প্রোফাইল (Student Marketplace Profile)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── SCROLLABLE PROFILE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Panoramic Cover Photo */}
          <div className="h-44 sm:h-64 w-full relative bg-slate-900 overflow-hidden shrink-0">
            <img
              src={profileData.coverPhoto}
              alt={profileData.nameBn}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>অনলাইনে আছেন • লাইভ ক্লাসে অংশ নিচ্ছেন</span>
              </span>
            </div>
          </div>

          {/* Profile Avatar & Primary Info */}
          <div className="px-5 sm:px-8 pb-6 relative pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-20 mb-4">
              {/* Circular Avatar */}
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.nameBn}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-2xl relative z-10"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900 z-20" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-slate-800 dark:text-stone-200 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer border border-stone-200 dark:border-stone-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEditing ? "বাতিল" : "প্রোফাইল সম্পাদনা"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {profileData.nameBn}
                </h2>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  ({profileData.nameEn})
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ভেরিফাইড শিক্ষার্থী</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {profileData.titleBn}
              </p>

              {/* 4 Stat Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs pt-2">
                <span className="inline-flex items-center gap-1 font-extrabold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profileData.currentJuz}</span>
                </span>

                <span className="inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                  <span>{profileData.completedClasses}টি ক্লাস সম্পন্ন</span>
                </span>

                <span className="inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>তাজবীদ স্কোর: {profileData.tajweedScore}%</span>
                </span>

                <span className="inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-slate-700 dark:text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{profileData.totalHours}+ ঘণ্টা ক্লাসের সময়</span>
                </span>
              </div>
            </div>

            {/* ── EDIT PROFILE INLINE FORM ── */}
            {isEditing && (
              <form onSubmit={handleSaveEdit} className="mt-5 p-5 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-4 text-xs animate-fadeIn">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  <span>আপনার শিক্ষার্থী তথ্য সম্পাদনা করুন</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-stone-300">নাম (বাংলায়):</label>
                    <input
                      type="text"
                      value={editForm.nameBn}
                      onChange={(e) => setEditForm({ ...editForm, nameBn: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-stone-300">নাম (ইংরেজিতে):</label>
                    <input
                      type="text"
                      value={editForm.nameEn}
                      onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">বিভাগ / লক্ষ্য:</label>
                  <input
                    type="text"
                    value={editForm.titleBn}
                    onChange={(e) => setEditForm({ ...editForm, titleBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">পরিচিতি / বায়ো:</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </form>
            )}

            {/* Facebook-Style Navigation Tabs */}
            <div className="border-t border-stone-200 dark:border-stone-800 mt-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: "learning", label: "পড়াশোনা ও হিফজ অগ্রগতি", icon: BookOpen },
                { id: "teachers", label: `আমার উস্তাদগণ (${profileData.enrolledTeachers.length})`, icon: Users },
                { id: "payments", label: `হাদিয়া ও রসিদ (${profileData.paymentHistory.length})`, icon: CreditCard },
                { id: "about", label: "পরিচিতি ও অভিভাবক", icon: FileText },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                        : "text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TAB CONTENT ── */}
            <div className="mt-5 space-y-4">
              {/* TAB 1: LEARNING & HIFZ PROGRESS */}
              {activeTab === "learning" && (
                <div className="space-y-4">
                  {/* Daily Hifz Tracker */}
                  {profileData.dailyLessons ? (
                    <div className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                      <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>দৈনন্দিন ছবক ও হিফজ ডায়েরি</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
                          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">নতুন ছবক (Sabaq):</p>
                          <p className="font-black text-slate-900 dark:text-white">{profileData.dailyLessons.sabaq || "তথ্য দেওয়া হয়নি"}</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
                          <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400">সাত ছবক (Sat Sabaq):</p>
                          <p className="font-black text-slate-900 dark:text-white">{profileData.dailyLessons.satSabaq || "তথ্য দেওয়া হয়নি"}</p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 space-y-1">
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">আমুক্তা দাওর (Amukta):</p>
                          <p className="font-black text-slate-900 dark:text-white">{profileData.dailyLessons.amukta || "তথ্য দেওয়া হয়নি"}</p>
                        </div>
                      </div>

                      {profileData.dailyLessons.teacherNote && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs space-y-1">
                          <p className="font-extrabold text-slate-800 dark:text-stone-200">উস্তাদের পরামর্শ ও সংশোধন:</p>
                          <p className="text-slate-600 dark:text-stone-400 italic font-medium leading-relaxed">
                            "{profileData.dailyLessons.teacherNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                      <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      <h5 className="font-extrabold text-slate-800 dark:text-stone-200 text-xs sm:text-sm">কোনো লাইভ ছবক বা হিফজ ডায়েরি রেকর্ড নেই</h5>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        উস্তাদ কর্তৃক ক্লাসে নতুন ছবক, সাত ছবক ও আমুকতা মূল্যায়নের পর এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
                      </p>
                    </div>
                  )}

                  {/* Overall Hifz Progress Bar */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-stone-300">হিফজুল কুরআন পূর্ণাঙ্গ অগ্রগতি:</span>
                      <span className="font-black text-emerald-600 font-mono text-sm">{profileData.hifzProgressPct || 0}% সম্পন্ন</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${profileData.hifzProgressPct || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>শুরু: ১ম পারা</span>
                      <span>বর্তমান: {profileData.currentJuz || "তথ্য দেওয়া হয়নি"}</span>
                      <span>লক্ষ্য: ৩০ পারা ({profileData.targetCompletionDate || "তথ্য দেওয়া হয়নি"})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MY ENROLLED TEACHERS */}
              {activeTab === "teachers" && (
                <div>
                  {profileData.enrolledTeachers && profileData.enrolledTeachers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profileData.enrolledTeachers.map((t) => (
                        <div
                          key={t.id}
                          className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={t.avatar}
                              alt={t.nameBn}
                              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                            />
                            <div className="space-y-0.5">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                                {t.nameBn}
                              </h4>
                              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                {t.subject}
                              </p>
                              <p className="text-[10px] text-slate-500">{t.weeklyClasses}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                if (onCallTeacher) onCallTeacher(t);
                                else toast.info(`${t.nameBn}-এর সাথে লাইভ ক্লাসের অনুরোধ পাঠানো হয়েছে`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>ক্লাসে যুক্ত হোন</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-3">
                      <Users className="w-8 h-8 text-stone-400 mx-auto" />
                      <h5 className="font-extrabold text-slate-800 dark:text-stone-200 text-xs sm:text-sm">এখনো কোনো উস্তাদের সাথে কোর্স যুক্ত করা হয়নি</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        শিক্ষক ডিরেক্টরি থেকে আপনার পছন্দের হিফজ বা তাজবীদ উস্তাদ নির্বাচন করে সরাসরি ক্লাসে যুক্ত হতে পারেন।
                      </p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        শিক্ষক তালিকা দেখুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENTS & RECEIPTS */}
              {activeTab === "payments" && (
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>পরিশোধিত হাদিয়া ও রসিদ হিস্ট্রি</span>
                  </h4>

                  {profileData.paymentHistory && profileData.paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-stone-800/60 text-slate-600 dark:text-stone-300 text-[10px] uppercase font-black border-b border-stone-200 dark:border-stone-700">
                          <tr>
                            <th className="p-3">রসিদ নং ও তারিখ</th>
                            <th className="p-3">উস্তাদ ও বিবরণ</th>
                            <th className="p-3">পরিমাণ</th>
                            <th className="p-3">গেটওয়ে</th>
                            <th className="p-3">অবস্থা</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                          {profileData.paymentHistory.map((p) => (
                            <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                              <td className="p-3 font-mono">
                                <p className="font-bold text-slate-900 dark:text-white">{p.id}</p>
                                <p className="text-[10px] text-slate-400">{p.date}</p>
                              </td>
                              <td className="p-3">
                                <p className="font-bold text-slate-900 dark:text-white">{p.teacherName}</p>
                                <p className="text-[10px] text-slate-500">{p.purpose}</p>
                              </td>
                              <td className="p-3 font-black text-emerald-700 dark:text-emerald-400">
                                {p.amountGross?.toLocaleString("bn-BD")} ৳
                              </td>
                              <td className="p-3 font-mono text-[11px] font-bold">{p.gateway}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 w-max">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>{p.status}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-2">
                      <CreditCard className="w-8 h-8 text-stone-400 mx-auto" />
                      <h5 className="font-extrabold text-slate-800 dark:text-stone-200 text-xs sm:text-sm">কোনো পরিশোধিত হাদিয়া বা রসিদ পাওয়া যায়নি</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        অনলাইন ক্লাসের হাদিয়া পরিশোধের পর আপনার অফিসিয়াল ডিজিটাল রসিদ ও ট্রানজ্যাকশন আইডি এখানে সংরক্ষিত থাকবে।
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ABOUT & GUARDIAN */}
              {activeTab === "about" && (
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 dark:text-white">পরিচিতি ও জীবনের লক্ষ্য:</h4>
                    <p className="text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                      {profileData.bio || "শিক্ষার্থী এখনো ব্যক্তিগত পরিচিতি বা লক্ষ্য যুক্ত করেননি।"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-1.5">
                      <p className="font-bold text-slate-700 dark:text-stone-300">যোগাযোগের তথ্য:</p>
                      <p className="text-slate-800 dark:text-stone-200 font-semibold">
                        ইমেইল: <span className="font-mono text-emerald-800 dark:text-emerald-300">{profileData.email || "তথ্য দেওয়া হয়নি"}</span>
                      </p>
                      <p className="text-slate-800 dark:text-stone-200 font-semibold">
                        মোবাইল: <span className="font-mono text-emerald-800 dark:text-emerald-300">{profileData.phone || "তথ্য দেওয়া হয়নি"}</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-1.5">
                      <p className="font-bold text-slate-700 dark:text-stone-300">অ্যাকাউন্টের ধরন:</p>
                      <p className="font-black text-emerald-800 dark:text-emerald-400">উন্মুক্ত পাবলিক শিক্ষার্থী (Open Quran Learner)</p>
                      <p className="text-[11px] text-slate-500 font-semibold">স্ট্যাটাস: সক্রিয় • ১-অন-১ ক্লাস ও বুকিং প্রস্তুত</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
