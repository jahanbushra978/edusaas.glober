"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  GraduationCap,
  UserCheck,
  UserPlus,
  BookOpen,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ISLAMIC_COVERS, ISLAMIC_AVATARS } from "../data/islamicMediaAssets";
import { REAL_STUDENTS_10 } from "../data/marketplaceSeedData";

export default function StudentDiscoveryDirectory({
  _currentUser,
  currentTeacherUser,
  onSelectStudent,
  onRequestTeachStudent,
}) {
  const [students, setStudents] = useState(REAL_STUDENTS_10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followedIds, setFollowedIds] = useState(new Set());

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
      try {
        const queryParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
        const res = await fetch(`/api/teacher-marketplace/public-students${queryParam}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      } catch (err) {
        console.warn("Could not load public students:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchStudents, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleFollow = (studentId) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
        toast.info("শিক্ষার্থীকে আনফলো করা হয়েছে");
      } else {
        next.add(studentId);
        toast.success("শিক্ষার্থীকে সফলভাবে অনুসরণ করছেন!");
      }
      return next;
    });
  };

  // Instant local filtering + API sync
  const displayStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      return (
        (s.display_name && s.display_name.toLowerCase().includes(q)) ||
        (s.student_public_id && s.student_public_id.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q)) ||
        (Array.isArray(s.learning_interests) && s.learning_interests.some((tag) => tag.toLowerCase().includes(q)))
      );
    });
  }, [students, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/80 border border-blue-500/40 text-blue-200 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-cyan-300" />
            <span>গ্লোবাল পাবলিক শিক্ষার্থী ডিরেক্টরি</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            সহপাঠী ও শিক্ষার্থী খুঁজুন
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
            উন্মুক্ত পাবলিক শিক্ষার্থীদের সাথে যুক্ত হোন, তাদের তাজবীদ আগ্রহ জানুন এবং শিক্ষাদান বা সহপাঠী হিসেবে গ্রুপ ক্লাসে কুরআন চর্চা করুন।
          </p>

          {/* Search Input Box */}
          <div className="pt-2">
            <div className="relative w-full max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষার্থীর নাম, ইউজারনেম বা পাবলিক আইডি (যেমন: STU-1001) দিয়ে খুঁজুন..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-900/90 transition shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discoverable Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 animate-pulse space-y-4"
            >
              <div className="h-28 bg-slate-200 dark:bg-stone-800 rounded-2xl" />
              <div className="h-4 bg-slate-200 dark:bg-stone-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : displayStudents.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-black text-slate-800 dark:text-stone-200">
            কোনো শিক্ষার্থী পাওয়া যায়নি
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            আপনার অনুসন্ধান শব্দের সাথে মিল রেখে কোনো উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। অন্য কোনো নাম বা আইডি দিয়ে চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayStudents.map((student) => {
            const isFollowing = followedIds.has(student.id);

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Panoramic Cover */}
                  <div className="h-24 w-full relative bg-slate-800">
                    <img
                      src={
                        student.cover_url ||
                        ISLAMIC_COVERS.quran_mushaf
                      }
                      alt={student.display_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-cyan-300 font-mono font-bold border border-cyan-400/30">
                      {student.student_public_id || "STU-1001"}
                    </span>
                  </div>

                  {/* Avatar & Info */}
                  <div className="px-5 pt-0 pb-4 relative">
                    <div className="flex items-end justify-between -mt-10 mb-3">
                      <img
                        src={
                          student.avatar_url ||
                          (student.display_name?.includes("ফাতেমা") || student.display_name?.includes("মারিয়াম")
                            ? ISLAMIC_AVATARS.studentGirl
                            : ISLAMIC_AVATARS.studentBoy)
                        }
                        alt={student.display_name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-md"
                      />
                      <button
                        onClick={() => handleToggleFollow(student.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                          isFollowing
                            ? "bg-slate-100 dark:bg-stone-800 text-slate-800 dark:text-stone-200 border border-slate-300 dark:border-stone-700"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span>অনুসরণ করছেন</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>ফলো করুন</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div
                      onClick={() => onSelectStudent && onSelectStudent(student)}
                      className="cursor-pointer group/name"
                    >
                      <h3 className="font-black text-sm text-slate-900 dark:text-white truncate group-hover/name:text-blue-600 transition">
                        {student.display_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-stone-400 truncate">
                        @{student.username}
                      </p>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <p className="text-xs text-slate-600 dark:text-stone-300 line-clamp-2 mt-2 leading-relaxed">
                        {student.bio}
                      </p>
                    )}

                    {/* Learning Interests Chips */}
                    {Array.isArray(student.learning_interests) && student.learning_interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {student.learning_interests.map((interest, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 pt-0 border-t border-stone-100 dark:border-stone-800/80 mt-2 space-y-2">
                  {/* View Profile Button */}
                  <button
                    onClick={() => {
                      if (onSelectStudent) onSelectStudent(student);
                      else toast.info(`${student.display_name}-এর প্রোফাইল খোলা হচ্ছে`);
                    }}
                    className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-slate-800 dark:text-stone-200 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>প্রোফাইল দেখুন</span>
                  </button>

                  {/* Teacher-only Action: "আমি আপনাকে পড়াতে চাই" (Send Teaching Invitation) */}
                  {currentTeacherUser && (
                    <button
                      onClick={() => {
                        if (onRequestTeachStudent) {
                          onRequestTeachStudent(student);
                        } else {
                          toast.info("পাঠদানের আমন্ত্রণ উইন্ডো খোলা হচ্ছে");
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>আমি আপনাকে পড়াতে চাই</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
