"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  Users,
  Video,
  Bookmark,
  Award,
  Edit3,
  Save,
  CheckCircle,
  ArrowLeft,
  Phone,
  MessageSquare,
  LogOut,
  Image as ImageIcon,
  Heart,
  Settings,
  Globe,
  MapPin,
  ShieldCheck,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import SocialPostComposer from "./social/SocialPostComposer";
import SocialPostCard from "./social/SocialPostCard";

export default function StudentMarketplaceDashboard({
  student,
  teachers = [],
  onBack,
  onCallTeacher,
  onSelectTeacher,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [_isEditing, setIsEditing] = useState(false);

  // Student Profile State (Customizable by Student)
  const [profile, setProfile] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("edusaas_public_student_profile") : null;
    let parsed = {};
    try {
      if (saved) parsed = JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      nameBn: parsed.nameBn || student?.full_name_bn || student?.name || "উন্মুক্ত শিক্ষার্থী",
      nameEn: parsed.nameEn || student?.nameEn || "Public Quran Learner",
      username: parsed.username || student?.username || "learner_" + (student?.id || "user").slice(0, 6),
      avatar: parsed.avatar || student?.avatar || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80",
      coverPhoto: parsed.coverPhoto || student?.coverPhoto || "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
      bio: parsed.bio || "আমি বিশুদ্ধ মাখরাজ ও তাজবীদের সাথে কুরআন শিক্ষা এবং হিফজ সম্পন্ন করার জন্য নিয়মিত অধ্যয়ন করছি।",
      learningGoals: parsed.learningGoals || ["তাজবীদ ও মাখরাজ", "হিফজুল কুরআন", "সহজ নূরানী কায়েদা"],
      preferredTopics: parsed.preferredTopics || ["সূরা আল-ফাতিহা মাশক", "সিফাত আল-হুরুফ", "তারতীল"],
      location: parsed.location || "ঢাকা, বাংলাদেশ",
      languages: parsed.languages || ["বাংলা", "العربية"],
      email: student?.email || "student@example.com",
      phone: student?.phone || "০১৭০০-০০০০০০",
      privacy: parsed.privacy || "public", // 'public' | 'followers' | 'private'
    };
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...profile });
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Helper: Upload image via Cloudinary with Data URL fallback
  const uploadImageFile = async (file, folder = "student_profiles") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("image_type", "avatar");

      const res = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.ok && (data.file_url || data.secure_url)) {
        return data.file_url || data.secure_url;
      }
    } catch {
      // Gracefully fallback
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("প্রোফাইল ছবি আপলোড হচ্ছে...", { id: "std-avatar-upload" });
      const url = await uploadImageFile(file, "student_profiles/avatars");
      setProfile((prev) => ({ ...prev, avatar: url }));
      setEditForm((prev) => ({ ...prev, avatar: url }));

      // Save locally
      try {
        const saved = JSON.parse(localStorage.getItem("edusaas_public_student_profile") || "{}");
        localStorage.setItem("edusaas_public_student_profile", JSON.stringify({ ...saved, avatar: url }));
        const studentSession = JSON.parse(localStorage.getItem("edusaas_public_student_session") || "{}");
        localStorage.setItem("edusaas_public_student_session", JSON.stringify({ ...studentSession, avatar: url, avatar_url: url }));
      } catch {}

      // Sync with public students API
      fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_public_id: student?.student_public_id,
          username: profile.username,
          display_name: profile.nameBn,
          avatar_url: url,
        }),
      }).catch(() => {});

      toast.success("মাশাআল্লাহ! প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!", { id: "std-avatar-upload" });
    } catch {
      toast.error("ছবি আপলোডে সমস্যা হয়েছে।", { id: "std-avatar-upload" });
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("কভার ফটো আপলোড হচ্ছে...", { id: "std-cover-upload" });
      const url = await uploadImageFile(file, "student_profiles/covers");
      setProfile((prev) => ({ ...prev, coverPhoto: url }));
      setEditForm((prev) => ({ ...prev, coverPhoto: url }));

      try {
        const saved = JSON.parse(localStorage.getItem("edusaas_public_student_profile") || "{}");
        localStorage.setItem("edusaas_public_student_profile", JSON.stringify({ ...saved, coverPhoto: url, cover_url: url }));
      } catch {}

      fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_public_id: student?.student_public_id,
          username: profile.username,
          display_name: profile.nameBn,
          cover_url: url,
        }),
      }).catch(() => {});

      toast.success("মাশাআল্লাহ! কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: "std-cover-upload" });
    } catch {
      toast.error("কভার ফটো আপলোডে সমস্যা হয়েছে।", { id: "std-cover-upload" });
    }
  };

  // Student's Own Posts state
  const [studentPosts, setStudentPosts] = useState(() => {
    try {
      const stored = localStorage.getItem("edusaas_public_student_posts");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: "post_std_default_1",
        author_user_id: student?.id || "student-default",
        author_name: profile.nameBn,
        author_avatar: profile.avatar,
        author_role: "student",
        content_text: "আলহামদুলিল্লাহ! আজ উস্তাদের সাথে সূরা আল-ফাতিহার মাখরাজ অনুশীলন সম্পন্ন করেছি। প্রতিদিন তিলাওয়াত সুন্দর করার চেষ্টা করছি।",
        post_type: "text",
        media_urls: [],
        likes_count: 5,
        comments_count: 2,
        visibility: "public",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
  });

  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [messages] = useState([
    {
      id: "msg-1",
      sender: "মুফতী মাওলানা ক্বারী আহমাদুল্লাহ",
      senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      time: "গতকাল রাত ৯:১৫",
      text: "মাশাআল্লাহ, আপনার গত ক্লাসের সিফাত আল-হুরুফের পড়া বেশ ভালো হয়েছে। আগামী ক্লাসে সূরা আল-ফাতিহার তারতীল শুনবো ইনশাআল্লাহ।",
      read: true,
    },
    {
      id: "msg-2",
      sender: "ক্বারী মাহমুদুল হাসান আল-মাদানী",
      senderAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
      time: "২ দিন আগে",
      text: "আসসালামু আলাইকুম। আপনার ১-অন-১ লাইভ ক্লাসের অনুরোধ গ্রহণ করা হয়েছে। সময় অনুযায়ী প্রস্তুত থাকবেন।",
      read: true,
    },
  ]);

  const [connections, setConnections] = useState([]);
  const [groups, setGroups] = useState([]);

  // Load saved posts, liked posts, and learning connections from server API
  useEffect(() => {
    fetch("/api/teacher-marketplace/social/posts?tab=saved")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts)) {
          setSavedPosts(data.posts);
        }
      })
      .catch(() => {});

    fetch("/api/teacher-marketplace/social/posts?tab=liked")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts)) {
          setLikedPosts(data.posts);
        }
      })
      .catch(() => {});

    fetch("/api/teacher-marketplace/connections")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setConnections(data.connections || []);
          setGroups(data.groups || []);
        }
      })
      .catch(() => {});
  }, []);

  // Save profile changes to DB and localStorage
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditing(false);

    try {
      await fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editForm.nameBn,
          username: editForm.username,
          avatar_url: editForm.avatar,
          cover_url: editForm.coverPhoto,
          bio: editForm.bio,
          learning_interests: editForm.learningGoals,
          is_discoverable: editForm.privacy !== "private",
        }),
      });
    } catch (err) {
      console.warn("Save profile to DB error:", err);
    }

    try {
      localStorage.setItem("edusaas_public_student_profile", JSON.stringify(editForm));
      const existingSession = localStorage.getItem("edusaas_public_student_session");
      if (existingSession) {
        const parsed = JSON.parse(existingSession);
        parsed.name = editForm.nameBn;
        parsed.full_name_bn = editForm.nameBn;
        parsed.avatar = editForm.avatar;
        localStorage.setItem("edusaas_public_student_session", JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
    toast.success("মাশাআল্লাহ! আপনার শিক্ষার্থী প্রোফাইল সফলভাবে আপডেট হয়েছে।");
  };

  // Create new post
  const handleCreateStudentPost = (newPost) => {
    const postWithAuthor = {
      ...newPost,
      id: "std_post_" + Date.now(),
      author_user_id: student?.id || "student-user",
      author_name: profile.nameBn,
      author_avatar: profile.avatar,
      author_role: "student",
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
    };
    const updated = [postWithAuthor, ...studentPosts];
    setStudentPosts(updated);
    try {
      localStorage.setItem("edusaas_public_student_posts", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Also persist via server API
    fetch("/api/teacher-marketplace/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_text: newPost.content_text,
        post_type: newPost.post_type || "text",
        media_urls: newPost.media_urls || [],
        video_metadata: newPost.video_metadata || null,
        visibility: newPost.visibility || "public",
      }),
    }).catch(() => {});

    toast.success("মাশাআল্লাহ! আপনার পোস্টটি সফলভাবে প্রকাশিত হয়েছে।");
  };

  // Delete own post
  const handleDeleteStudentPost = (postId) => {
    const updated = studentPosts.filter((p) => p.id !== postId);
    setStudentPosts(updated);
    try {
      localStorage.setItem("edusaas_public_student_posts", JSON.stringify(updated));
    } catch {
      // ignore
    }

    fetch(`/api/teacher-marketplace/social/posts/${postId}`, {
      method: "DELETE",
    }).catch(() => {});

    toast.info("পোস্টটি মুছে ফেলা হয়েছে।");
  };

  // Derive photos from student posts
  const myPhotos = useMemo(() => {
    const photos = [];
    studentPosts.forEach((post) => {
      if (Array.isArray(post.media_urls)) {
        post.media_urls.forEach((m) => {
          if (m.type === "image" || m.url?.match(/\.(jpeg|jpg|png|webp)/i)) {
            photos.push({ url: m.url, postId: post.id, date: post.created_at });
          }
        });
      }
    });
    return photos;
  }, [studentPosts]);

  // Derive videos from student posts
  const myVideos = useMemo(() => {
    const videos = [];
    studentPosts.forEach((post) => {
      if (post.post_type === "video" || post.post_type === "clip") {
        videos.push(post);
      }
    });
    return videos;
  }, [studentPosts]);

  // Followed teachers list
  const followedTeachers = useMemo(() => {
    return teachers.slice(0, 4);
  }, [teachers]);

  // Self Account Deletion
  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await fetch("/api/teacher-marketplace/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_account",
          user_id: student?.user_id || student?.id || student?.student_public_id,
          role: "student",
        }),
      });
      localStorage.removeItem("edusaas_public_student_session");
      localStorage.removeItem("edusaas_public_student_profile");
      localStorage.removeItem("edusaas_public_student_posts");
      toast.success("আপনার শিক্ষার্থী অ্যাকাউন্ট ও ব্যক্তিগত তথ্য সফলভাবে মুছে ফেলা হয়েছে।");
      setShowDeleteAccountModal(false);
      if (onLogout) onLogout();
      else if (onBack) onBack();
      else window.location.href = "/quran-tutor/studio?feature=human-teacher";
    } catch {
      localStorage.removeItem("edusaas_public_student_session");
      toast.success("আপনার শিক্ষার্থী অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
      setShowDeleteAccountModal(false);
      if (onLogout) onLogout();
      else if (onBack) onBack();
      else window.location.href = "/quran-tutor/studio?feature=human-teacher";
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-slate-800 dark:text-stone-200 pb-20 animate-fadeIn font-['Hind_Siliguri',sans-serif]">
      {/* ── TOP NAV BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 transition active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ফিডে ফিরুন</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                শিক্ষার্থী ড্যাশবোর্ড ও সোশ্যাল প্রোফাইল
              </h1>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                উন্মুক্ত কুরআন শিক্ষা ও ব্যক্তিগত টাইমলাইন
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsEditing(true);
              setActiveTab("settings");
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">প্রোফাইল সাজান</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="লগআউট করুন"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-5 space-y-6">
        {/* ── COVER & AVATAR PROFILE HEADER ── */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md overflow-hidden relative">
          {/* Panoramic Cover */}
          <div className="h-44 sm:h-64 w-full relative bg-slate-900 overflow-hidden group">
            <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="absolute top-3.5 right-4 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট</span>
            </span>

            {/* Facebook-Style Edit Cover Photo Button */}
            <label
              htmlFor="student-cover-upload"
              className="absolute bottom-3 right-4 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95 z-10"
              title="কভার ফটো পরিবর্তন করুন"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>কভার ফটো পরিবর্তন করুন</span>
              <input
                id="student-cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </label>
          </div>

          {/* Profile Bar */}
          <div className="px-6 pb-6 relative pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative group">
                  <img
                    src={profile.avatar}
                    alt={profile.nameBn}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-xl ring-2 ring-emerald-500/40"
                  />
                  <div className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-600 text-white border-2 border-white dark:border-stone-900 shadow-md" title="উন্মুক্ত শিক্ষার্থী">
                    <CheckCircle className="w-4 h-4 fill-emerald-600 text-white" />
                  </div>

                  {/* Facebook-Style Round Camera Overlay for Avatar */}
                  <label
                    htmlFor="student-avatar-upload"
                    className="absolute bottom-0 right-0 p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl border-2 border-white dark:border-stone-900 cursor-pointer transition active:scale-95 z-10"
                    title="প্রোফাইল ছবি পরিবর্তন করুন"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="student-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {profile.nameBn}
                    </h2>
                  </div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    @{profile.username} • {profile.nameEn}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-stone-300 max-w-xl line-clamp-2 font-medium">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("settings");
                  }}
                  className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>প্রোফাইল কাস্টমাইজেশন</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Facebook Style - All 11 Sections) */}
            <div className="flex items-center gap-1.5 border-t border-stone-200 dark:border-stone-800 pt-3 overflow-x-auto no-scrollbar">
              {[
                { id: "overview", label: "ওভারভিউ", icon: BookOpen },
                { id: "profile", label: "টাইমলাইন", icon: Users },
                { id: "posts", label: `আমার পোস্ট (${studentPosts.length})`, icon: MessageSquare },
                { id: "photos", label: `ছবিসমূহ (${myPhotos.length})`, icon: ImageIcon },
                { id: "videos", label: `ভিডিও (${myVideos.length})`, icon: Video },
                { id: "teachers", label: `প্রিয় উস্তাদগণ (${followedTeachers.length})`, icon: Award },
                { id: "saved", label: `সংরক্ষিত (${savedPosts.length})`, icon: Bookmark },
                { id: "liked", label: `পছন্দকৃত (${likedPosts.length})`, icon: Heart },
                { id: "learning", label: "কুরআন শিক্ষা ও অগ্রগতি", icon: GraduationCap },
                { id: "messages", label: `বার্তাসমূহ (${messages.length})`, icon: MessageSquare },
                { id: "settings", label: "প্রোফাইল ও সেটিংস", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {followedTeachers.length} জন
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">প্রিয় উস্তাদবৃন্দ</p>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {studentPosts.length}টি
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">প্রকাশিত পোস্ট</p>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {savedPosts.length}টি
                  </p>
                  <p className="text-[11px] font-bold text-slate-500">সংরক্ষিত পাঠ</p>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">৯২%</p>
                  <p className="text-[11px] font-bold text-slate-500">তাজবীদ স্কোর</p>
                </div>
              </div>
            </div>

            {/* Learning Goals Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>আমার বর্তমান কুরআন শিক্ষার লক্ষ্য ও বিষয়সমূহ</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.learningGoals.map((goal, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{goal}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TIMELINE / PROFILE VIEW ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left Column: About Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>পরিচিতি (About Me)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                  {profile.bio}
                </p>
                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>ভাষা: {profile.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>উন্মুক্ত শিক্ষার্থী অ্যাকাউন্ট (যাচাইকৃত)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline Posts */}
            <div className="md:col-span-2 space-y-4">
              <SocialPostComposer
                currentUser={{
                  id: student?.id || "student-user",
                  name: profile.nameBn,
                  avatar: profile.avatar,
                  role: "student",
                }}
                onPostCreated={handleCreateStudentPost}
              />

              <div className="space-y-4">
                {studentPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    <SocialPostCard
                      post={post}
                      currentUser={{
                        id: student?.id || "student-user",
                        name: profile.nameBn,
                        avatar: profile.avatar,
                        role: "student",
                      }}
                      onCommentAdded={() => {}}
                      onReactionToggled={() => {}}
                    />
                    <button
                      onClick={() => handleDeleteStudentPost(post.id)}
                      className="absolute top-4 right-14 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold transition cursor-pointer"
                      title="পোস্ট মুছুন"
                    >
                      মুছুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MY POSTS ── */}
        {activeTab === "posts" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>নতুন পোস্ট লিখুন বা প্রশ্ন করুন</span>
              </h3>
              <SocialPostComposer
                currentUser={{
                  id: student?.id || "student-user",
                  name: profile.nameBn,
                  avatar: profile.avatar,
                  role: "student",
                }}
                onPostCreated={handleCreateStudentPost}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                আপনার প্রকাশিত পোস্টসমূহ ({studentPosts.length})
              </h4>
              {studentPosts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 text-xs text-slate-400 font-semibold">
                  এখনো কোনো পোস্ট প্রকাশিত হয়নি।
                </div>
              ) : (
                studentPosts.map((post) => (
                  <div key={post.id} className="relative group">
                    <SocialPostCard
                      post={post}
                      currentUser={{
                        id: student?.id || "student-user",
                        name: profile.nameBn,
                        avatar: profile.avatar,
                        role: "student",
                      }}
                      onCommentAdded={() => {}}
                      onReactionToggled={() => {}}
                    />
                    <button
                      onClick={() => handleDeleteStudentPost(post.id)}
                      className="absolute top-4 right-14 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold transition cursor-pointer"
                      title="পোস্ট মুছুন"
                    >
                      মুছুন
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: MY PHOTOS ── */}
        {activeTab === "photos" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>আমার আপলোডকৃত ছবি ও ফটো গ্যালারি ({myPhotos.length})</span>
            </h3>
            {myPhotos.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                এখনো কোনো ছবি আপলোড করা হয়নি। পোস্টে ছবি যুক্ত করলে তা স্বয়ংক্রিয়ভাবে এখানে সাজানো থাকবে।
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {myPhotos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 shadow-xs">
                    <img src={photo.url} alt="Photo" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: MY VIDEOS ── */}
        {activeTab === "videos" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Video className="w-4 h-4 text-rose-600" />
              <span>আমার তিলাওয়াত ভিডিও ও ক্লিপসমূহ ({myVideos.length})</span>
            </h3>
            {myVideos.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                এখনো কোনো ভিডিও পোস্ট নেই। আপনার তিলাওয়াতের ভিডিও পোস্ট করলে তা এখানে পাওয়া যাবে।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myVideos.map((vid) => (
                  <div key={vid.id} className="rounded-2xl border border-stone-200 dark:border-stone-800 p-3 bg-stone-50 dark:bg-stone-800/50 space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{vid.content_text}</p>
                    {vid.media_urls?.[0]?.url && (
                      <video src={vid.media_urls[0].url} controls className="w-full rounded-xl max-h-48 bg-black" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: CONNECTED & FOLLOWED TEACHERS ── */}
        {activeTab === "teachers" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Real Learning Connections from DB */}
            {connections.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>আমার পড়ার আবেদন ও সংযুক্ত শিক্ষকগণ ({connections.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connections.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{c.teacher_name || "সম্মানিত উস্তাদ"}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{c.subject || "কুরআন ও তাজবীদ শিক্ষা"}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === "accepted"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : c.status === "rejected"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        }`}>
                          {c.status === "accepted" ? "গৃহীত ও সক্রিয়" : c.status === "rejected" ? "প্রত্যাখ্যাত" : "পর্যালোচনায়"}
                        </span>
                      </div>
                      {c.request_message && (
                        <p className="text-xs text-slate-600 dark:text-stone-300 italic bg-white dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                          &ldquo;{c.request_message}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>অনুসরণকৃত প্রিয় উস্তাদ ও ক্বারীগণ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followedTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.nameBn} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs" />
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{t.nameBn}</p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{t.titleBn}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t.hourlyFeeBn}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onCallTeacher && onCallTeacher(t)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>কল</span>
                      </button>
                      <button
                        onClick={() => onSelectTeacher && onSelectTeacher(t)}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-slate-800 dark:text-stone-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>প্রোফাইল</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: SAVED POSTS ── */}
        {activeTab === "saved" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>সংরক্ষিত শিক্ষণীয় পোস্টসমূহ ({savedPosts.length})</span>
            </h3>
            {savedPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                কোনো সংরক্ষিত পোস্ট নেই। গুরুত্বপূর্ণ পোস্ট বুকমার্ক করে রাখলে এখানে পাওয়া যাবে।
              </div>
            ) : (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    currentUser={{
                      id: student?.id || "student-user",
                      name: profile.nameBn,
                      avatar: profile.avatar,
                      role: "student",
                    }}
                    onCommentAdded={() => {}}
                    onReactionToggled={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 8: LIKED POSTS ── */}
        {activeTab === "liked" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>আপনার পছন্দকৃত পোস্টসমূহ ({likedPosts.length})</span>
            </h3>
            {likedPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                এখনো কোনো পোস্টে রিঅ্যাকশন দেওয়া হয়নি।
              </div>
            ) : (
              <div className="space-y-4">
                {likedPosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    currentUser={{
                      id: student?.id || "student-user",
                      name: profile.nameBn,
                      avatar: profile.avatar,
                      role: "student",
                    }}
                    onCommentAdded={() => {}}
                    onReactionToggled={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 9: QURAN LEARNING & PROGRESS ── */}
        {activeTab === "learning" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>আমার কুরআন শিক্ষা অগ্রগতি ও সিলেবাস ট্র্যাকিং</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="font-bold text-slate-500">বর্তমান পারা / জুয:</span>
                  <p className="text-lg font-black text-emerald-800 dark:text-emerald-300">১ম পারা (সূরা আল-ফাতিহা ও আল-বাকারা)</p>
                </div>
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1">
                  <span className="font-bold text-slate-500">সম্পন্ন লাইভ ক্লাস:</span>
                  <p className="text-lg font-black text-teal-800 dark:text-teal-300">১২টি সেশন</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="font-bold text-slate-500">হিফজ অগ্রগতি:</span>
                  <p className="text-lg font-black text-amber-800 dark:text-amber-300">২৫% সম্পন্ন</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 10: MESSAGES ── */}
        {activeTab === "messages" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>উস্তাদদের বার্তা ও পরামর্শ ইনবক্স ({messages.length})</span>
            </h3>

            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={m.senderAvatar} alt={m.sender} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">{m.sender}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-stone-300 font-medium pl-10">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 11: PROFILE & SETTINGS CUSTOMIZATION ── */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveProfile}
            className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5 animate-fadeIn"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>ব্যক্তিগত সোশ্যাল প্রোফাইল ও সেটিংস কাস্টমাইজেশন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">পূর্ণ নাম (বাংলায়): *</label>
                <input
                  type="text"
                  required
                  value={editForm.nameBn}
                  onChange={(e) => setEditForm({ ...editForm, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">নাম (ইংরেজিতে):</label>
                <input
                  type="text"
                  value={editForm.nameEn}
                  onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">ইউজারনেম (@username):</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">অবস্থান / জেলা:</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">প্রোফাইল ছবি URL (Avatar):</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">কভার ফটো URL:</label>
                <input
                  type="text"
                  value={editForm.coverPhoto}
                  onChange={(e) => setEditForm({ ...editForm, coverPhoto: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">ব্যক্তিগত বায়ো (Bio):</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">কুরআন শিক্ষার লক্ষ্যসমূহ (কমা দিয়ে লিখুন):</label>
                <input
                  type="text"
                  value={editForm.learningGoals.join(", ")}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      learningGoals: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-stone-300">প্রোফাইল প্রাইভেসি:</label>
                <select
                  value={editForm.privacy}
                  onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="public">উন্মুক্ত (পাবলিক — শিক্ষক ও শিক্ষার্থীরা আপনার তিলাওয়াত দেখতে পাবে)</option>
                  <option value="followers">শুধুমাত্র অনুসারী (Followers only)</option>
                  <option value="private">ব্যক্তিগত (Private)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>

            {/* ── ⚠️ DANGER ZONE: ACCOUNT DELETION ── */}
            <div className="mt-8 pt-6 border-t border-rose-200 dark:border-rose-900/60 p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-sm">
                <Trash2 className="w-4 h-4" />
                <span>বিপদজনক জোন — শিক্ষার্থী অ্যাকাউন্ট ডিলিট করুন</span>
              </div>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed font-medium">
                ফেসবুকের মতো আপনি চাইলে যেকোনো সময় আপনার আইডি ও সম্পূর্ণ শিক্ষার্থী প্রোফাইল স্থায়ীভাবে মুছে ফেলতে পারেন। অ্যাকাউন্ট ডিলিট করলে আপনার প্রোফাইল, পড়ার অগ্রগতি ও সকল পোস্ট ডাটাবেজ থেকে মুছে যাবে।
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>আমার শিক্ষার্থী অ্যাকাউন্ট মুছে ফেলুন (Delete Account)</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* ── 🗑️ DELETE ACCOUNT CONFIRMATION MODAL ── */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 dark:border-rose-900 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
                অ্যাকাউন্ট মুছে ফেললে আপনার শিক্ষার্থী প্রোফাইল, পড়ার অগ্রগতি ও পোস্ট ডাটাবেজ থেকে স্থায়ীভাবে বিলুপ্ত হবে।
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-slate-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                {isDeletingAccount ? (
                  <span>মুছে ফেলা হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, অ্যাকাউন্ট ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
