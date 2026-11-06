"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Film,
  X,
  Volume2,
  VolumeX,
  Eye,
  Plus,
  Video,
  Upload,
  CheckCircle,
  Camera,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { REAL_REELS_6 } from "../../data/marketplaceSeedData";

const SAMPLE_REEL_TEMPLATES = [
  {
    title: "সূরা আল-মুলক - বিশুদ্ধ মাশক ও তারতীল তিলাওয়াত",
    category: "সূরা মাশক",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-reading-the-holy-quran-43403-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "মাখরাজ ও তাজবীদ নিয়ম - হরফে মুস্তালিয়া স্পষ্ট উচ্চারণ",
    category: "তাজবীদ ও মাখরাজ",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-quran-and-rosary-on-a-stand-43404-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "সূরা আর-রহমান - দিল জুড়ানো মিষ্টি সুরের তারতীল",
    category: "মধুর তিলাওয়াত",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-reading-the-holy-quran-43403-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ReelsDiscoverySection({
  currentUser = null,
  currentTeacherUser = null,
  teacherFilter = null,
  onReelCreated = null,
}) {
  const [reels, setReels] = useState(REAL_REELS_6);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Reel Creator Modal State
  const [showCreateReelModal, setShowCreateReelModal] = useState(false);
  const [reelTitle, setReelTitle] = useState("");
  const [reelCategory, setReelCategory] = useState("সূরা মাশক");
  const [reelVideoFile, setReelVideoFile] = useState(null);
  const [reelVideoPreviewUrl, setReelVideoPreviewUrl] = useState("");
  const [reelThumbnailUrl, setReelThumbnailUrl] = useState("");
  const [isPublishingReel, setIsPublishingReel] = useState(false);

  const videoInputRef = useRef(null);

  // Load custom reels from localStorage and backend
  useEffect(() => {
    let isMounted = true;
    async function fetchReels() {
      // 1. First get user-created reels from localStorage
      let localReels = [];
      try {
        const stored = localStorage.getItem("edusaas_user_reels");
        if (stored) {
          localReels = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Could not read local reels:", e);
      }

      try {
        const res = await fetch("/api/teacher-marketplace/social/posts?tab=videos&limit=12");
        const data = await res.json();
        if (isMounted && data.ok && Array.isArray(data.posts) && data.posts.length > 0) {
          const videoPosts = data.posts
            .filter((p) => p.video_url || (p.media_url && p.post_type === "video") || p.post_type === "clip")
            .map((p) => ({
              id: p.id,
              authorName: p.author_name || "কুরআন শিক্ষক",
              authorAvatar:
                p.author_avatar ||
                "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80",
              authorRole: p.author_role || "teacher",
              videoThumbnail:
                p.video_thumbnail_url ||
                p.media_url ||
                "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80",
              videoUrl: p.video_url || p.media_url,
              title: p.content ? p.content.slice(0, 80) : "তাজবীদ ও তিলাওয়াত ক্লিপ",
              viewsCount: p.views_count || 120,
              likesCount: p.likes_count || 24,
              commentsCount: p.comments_count || 5,
            }));

          // Merge local reels at the top
          const combined = [...localReels, ...videoPosts.filter((vp) => !localReels.some((lr) => lr.id === vp.id))];
          if (combined.length > 0) {
            setReels(combined);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote reels:", err);
      }

      if (localReels.length > 0) {
        setReels([...localReels, ...REAL_REELS_6]);
      } else {
        setReels(REAL_REELS_6);
      }

      if (isMounted) setIsLoading(false);
    }
    fetchReels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter reels by teacher if requested
  const displayedReels = teacherFilter
    ? reels.filter((r) => r.authorName === teacherFilter || r.teacher_id === teacherFilter)
    : reels;

  // Handle Video File Selection
  const handleSelectVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("অনুগ্রহ করে একটি সঠিক ভিডিও ফাইল নির্বাচন করুন (MP4, WebM)");
      return;
    }

    setReelVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setReelVideoPreviewUrl(objectUrl);
    setReelThumbnailUrl("https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80");
    if (!reelTitle) {
      setReelTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  // Choose a sample video template
  const handleSelectSampleTemplate = (tpl) => {
    setReelVideoFile(null);
    setReelVideoPreviewUrl(tpl.videoUrl);
    setReelThumbnailUrl(tpl.thumbnail);
    setReelTitle(tpl.title);
    setReelCategory(tpl.category);
  };

  // Publish New Reel
  const handlePublishReel = async (e) => {
    e.preventDefault();

    if (!reelVideoPreviewUrl) {
      toast.error("অনুগ্রহ করে একটি ভিডিও নির্বাচন বা আপলোড করুন!");
      return;
    }

    const titleToUse = reelTitle.trim() || "তাজবীদ ও বিশুদ্ধ তিলাওয়াত ক্লিপ";

    setIsPublishingReel(true);
    try {
      // Determine author
      const activeTeacher = currentTeacherUser;
      const activeStudent = currentUser;

      const authorName =
        activeTeacher?.nameBn ||
        activeTeacher?.name_bn ||
        activeStudent?.display_name ||
        activeStudent?.name ||
        "শায়খ ক্বারী মাহমুদুল হাসান";

      const authorAvatar =
        activeTeacher?.avatar ||
        activeTeacher?.avatar_url ||
        activeStudent?.avatar ||
        activeStudent?.avatar_url ||
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80";

      const authorRole = activeTeacher ? "teacher" : "student";

      const newReel = {
        id: `reel_${Date.now()}`,
        authorName,
        authorAvatar,
        authorRole,
        teacher_id: activeTeacher?.id || activeTeacher?.teacher_id,
        videoThumbnail: reelThumbnailUrl || "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
        videoUrl: reelVideoPreviewUrl,
        title: titleToUse,
        category: reelCategory,
        viewsCount: 1,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };

      // 1. Prepend to state
      setReels((prev) => [newReel, ...prev]);

      // 2. Persist to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("edusaas_user_reels") || "[]");
        localStorage.setItem("edusaas_user_reels", JSON.stringify([newReel, ...stored]));
      } catch (e) {
        console.warn("Storage warning:", e);
      }

      // 3. POST to backend social posts (video post)
      try {
        fetch("/api/teacher-marketplace/social/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: titleToUse,
            post_type: "video",
            video_url: reelVideoPreviewUrl,
            video_thumbnail_url: newReel.videoThumbnail,
            author_name: authorName,
            author_avatar: authorAvatar,
            category: reelCategory,
          }),
        }).catch(() => {});
      } catch {}

      toast.success("মাশাআল্লাহ! আপনার নতুন রিল সফলভাবে প্রকাশিত হয়েছে!");
      if (onReelCreated) onReelCreated(newReel);

      // Close modal and reset
      setShowCreateReelModal(false);
      setReelTitle("");
      setReelVideoFile(null);
      setReelVideoPreviewUrl("");
      setReelThumbnailUrl("");

      // Automatically open the new reel for playback
      setSelectedReel(newReel);
    } catch (err) {
      console.error("Reel publish error:", err);
      toast.error("রিল প্রকাশে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsPublishingReel(false);
    }
  };

  return (
    <div className="w-full space-y-3 font-['Hind_Siliguri',sans-serif]">
      {/* ── Section Header with Title & Facebook-style Create Reel Button ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            রিলস ও শর্ট ভিডিও (Facebook Style Reels)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateReelModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
            title="নতুন ভিডিও রিল তৈরি ও আপলোড করুন"
          >
            <Video className="w-3.5 h-3.5 text-amber-300" />
            <span>রিল আপলোড করুন</span>
          </button>
          <span className="hidden sm:inline text-[11px] font-bold text-slate-500">
            তাজবীদ ও তিলাওয়াত ক্লিপস
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-36 sm:w-44 h-56 sm:h-64 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        /* Horizontal Reels Carousel with Facebook-Style "Create Reel" First Card */
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-1">
          {/* ════ CARD 1: FACEBOOK-STYLE "CREATE REEL" TRIGGER CARD ════ */}
          <div
            onClick={() => setShowCreateReelModal(true)}
            className="relative w-36 sm:w-44 h-56 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-emerald-950 via-stone-900 to-stone-950 border-2 border-dashed border-emerald-500/60 shadow-md shrink-0 flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-400 hover:shadow-xl transition active:scale-95 text-center p-3 select-none"
            title="নতুন রিল বা ভিডিও আপলোড করতে এখানে ক্লিক করুন"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-400 text-white flex items-center justify-center shadow-lg mb-2.5 transition transform group-hover:scale-110">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition">
              রিল তৈরি করুন
            </span>
            <span className="text-[10px] text-emerald-200/80 mt-1.5 leading-snug font-medium">
              ভিডিও বা তিলাওয়াত ক্লিপ আপলোড করুন
            </span>
            <div className="mt-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
              <Camera className="w-2.5 h-2.5" />
              <span>ভিডিও যোগ করুন</span>
            </div>
          </div>

          {/* Published Reels Stream */}
          {displayedReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setSelectedReel(reel)}
              className="relative w-36 sm:w-44 h-56 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer shadow-xs group hover:shadow-xl transition active:scale-95 border border-stone-200 dark:border-stone-800"
            >
              <img
                src={reel.videoThumbnail}
                alt={reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/50 group-hover:bg-emerald-600/90 text-white flex items-center justify-center backdrop-blur-xs transition">
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Views counter */}
              {reel.viewsCount > 0 && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                  <Eye className="w-3 h-3" />
                  <span>{reel.viewsCount}</span>
                </div>
              )}

              {/* Category pill if available */}
              {reel.category && (
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 text-[9px] font-bold border border-emerald-700/60 backdrop-blur-xs">
                  {reel.category}
                </div>
              )}

              {/* Bottom Info */}
              <div className="absolute bottom-3 inset-x-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <img
                    src={reel.authorAvatar}
                    alt={reel.authorName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                  />
                  <span className="text-[11px] font-bold text-white truncate">{reel.authorName}</span>
                </div>
                <p className="text-[10px] text-white/90 line-clamp-2 leading-snug font-medium">
                  {reel.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FACEBOOK-STYLE REEL CREATOR & VIDEO UPLOAD MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showCreateReelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-['Hind_Siliguri',sans-serif]">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">নতুন রিল আপলোড ও প্রকাশ</h3>
                  <p className="text-[11px] text-emerald-200/90 font-medium">
                    ফেসবুক রিলস স্টাইলে কুরআন তিলাওয়াত বা তাজবীদ ভিডিও শেয়ার করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateReelModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handlePublishReel} className="p-5 space-y-4 overflow-y-auto text-slate-800 dark:text-stone-200">
              {/* Creator Info Pill */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80">
                <img
                  src={
                    currentTeacherUser?.avatar ||
                    currentUser?.avatar ||
                    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"
                  }
                  alt="Author"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    {currentTeacherUser?.nameBn || currentUser?.display_name || "শায়খ ক্বারী মাহমুদুল হাসান"}
                  </h4>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {currentTeacherUser ? "অনুমোদিত উস্তাদ প্রোফাইল" : "উন্মুক্ত শিক্ষার্থী প্রোফাইল"}
                  </p>
                </div>
              </div>

              {/* Video Upload Area / Live Preview */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-stone-300 flex items-center justify-between">
                  <span>ভিডিও ফাইল নির্বাচন করুন *</span>
                  <span className="text-[10px] text-stone-500 font-normal">MP4, WebM (সর্বোচ্চ ৬০ সেকেন্ড)</span>
                </label>

                {reelVideoPreviewUrl ? (
                  /* Live Video Player Preview */
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:h-52 w-full flex items-center justify-center border-2 border-emerald-500 shadow-md">
                    <video
                      src={reelVideoPreviewUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReelVideoFile(null);
                        setReelVideoPreviewUrl("");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer shadow-md"
                      title="ভিডিও পরিবর্তন করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Drag & Drop / File Input Box */
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/40 text-center cursor-pointer transition space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-stone-200">
                        ভিডিও ফাইল আপলোড করতে ক্লিক করুন
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        আপনার ডিভাইস বা মোবাইল থেকে কুরআন তিলাওয়াত ভিডিও বেছে নিন
                      </p>
                    </div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleSelectVideoFile}
                    />
                  </div>
                )}
              </div>

              {/* Quick Select Sample Islamic Video Clips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অথবা দ্রুত পরীক্ষা করতে নমুনা ইসলামিক ক্লিপ বেছে নিন:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_REEL_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleTemplate(tpl)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                        reelVideoPreviewUrl === tpl.videoUrl
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.title}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-black truncate block">{tpl.category}</span>
                        <span className="text-[9px] text-stone-500 truncate block">{tpl.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Caption Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-stone-300">
                  রিলের শিরোনাম বা ক্যাপশন *
                </label>
                <input
                  type="text"
                  required
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  placeholder="যেমন: সূরা আল-মুলক - বিশুদ্ধ মাশক ও তারতীল তিলাওয়াত..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Islamic Category Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-stone-300">
                  বিষয় / ক্যাটাগরি
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "সূরা মাশক",
                    "তাজবীদ ও মাখরাজ",
                    "নূরানী কায়েদা",
                    "হিফজুল কুরআন",
                    "মধুর তিলাওয়াত",
                    "প্রশ্নোত্তর ও নসীহত",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReelCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        reelCategory === cat
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateReelModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isPublishingReel || !reelVideoPreviewUrl}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition cursor-pointer"
                >
                  {isPublishingReel ? (
                    <span>আপলোড হচ্ছে...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-amber-300" />
                      <span>রিল প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VERTICAL FULL-SCREEN REELS PLAYER MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 animate-fadeIn">
          <div className="relative max-w-sm w-full h-[84vh] bg-stone-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent p-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <img
                  src={selectedReel.authorAvatar}
                  alt={selectedReel.authorName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-black block">{selectedReel.authorName}</span>
                  <span className="text-[10px] text-emerald-300">
                    {selectedReel.authorRole === "teacher" ? "যাচাইকৃত উস্তাদ" : "শিক্ষার্থী"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedReel(null)}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {selectedReel.videoUrl ? (
                <video
                  src={selectedReel.videoUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  controls
                />
              ) : (
                <img
                  src={selectedReel.videoThumbnail}
                  alt={selectedReel.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Video Caption & Metadata */}
            <div className="absolute bottom-4 inset-x-3 z-30 bg-gradient-to-t from-black/90 to-transparent p-3 rounded-2xl space-y-1 text-white">
              <div className="flex items-center gap-2">
                {selectedReel.category && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] font-black">
                    {selectedReel.category}
                  </span>
                )}
                <span className="text-[10px] text-white/70">
                  {selectedReel.viewsCount ? `${selectedReel.viewsCount} বার দেখা হয়েছে` : "সবেমাত্র প্রকাশিত"}
                </span>
              </div>
              <p className="text-xs font-bold leading-relaxed">{selectedReel.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
