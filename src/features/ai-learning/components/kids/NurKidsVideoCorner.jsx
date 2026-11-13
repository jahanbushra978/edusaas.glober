"use client";

import React, { useState } from "react";
import {
  Play,
  Video,
  CheckCircle2,
  Star,
  ExternalLink,
  BookOpen,
  Award,
  Clock,
  Heart,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { playCorrectChime, playStarPopSound, playTapSound } from "@/features/ai-learning/lib/arabicSoundPlayer";

// 📺 Curated Safe Islamic & Arabic Kids Videos (Zero Inappropriate Ads / Safe YouTube Embed)
export const NUR_KIDS_VIDEOS = [
  {
    id: "v-huruf-rhyme",
    youtubeId: "D_m-6o-vHqk", // Authentic Arabic alphabet song
    title: "আরবী বর্ণমালা আলিফ-বা-তা সুর ও অ্যানিমেশন",
    category: "alphabet",
    categoryBn: "বর্ণমালা ও ছড়া",
    duration: "৩:৪৫ মিনিট",
    age: "৩-৮ বছর",
    description: "শিশুদের আনন্দের সাথে আরবী ২৯টি হরফ চেনার সুললিত ছড়া ও বর্ণিল অ্যানিমেশন।",
    moralLesson: "প্রতিটি হরফ শুদ্ধ উচ্চারণে পড়া সওয়াবের কাজ।",
    starsReward: 2,
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-noorani-1",
    youtubeId: "U3Bv_jXjY6U", // Noorani Qaida Lesson 1
    title: "নূরানী কায়দা ১ম তখতি — ২৯টি হরফের সঠিক মাখরাজ",
    category: "qaida",
    categoryBn: "নূরানী কায়দা",
    duration: "৮:২০ মিনিট",
    age: "৪-১০ বছর",
    description: "অভিজ্ঞ উস্তাদের সাথে মুখে মুখে ২৯টি একক হরফের খাঁটি মাখরাজ ও বিশুদ্ধ উচ্চারণ অনুশীলন।",
    moralLesson: "কুরআন তিলাওয়াত সুন্দর করতে মাখরাজ শেখা আবশ্যক।",
    starsReward: 3,
    thumbnail: "https://images.unsplash.com/photo-1584281722573-b27b9c9f28bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-bismillah-song",
    youtubeId: "JmD8zQG8d-4", // Bismillah Kids Song
    title: "বিসমিল্লাহ ছড়া — যেকোনো ভালো কাজের শুরুতে বিসমিল্লাহ",
    category: "alphabet",
    categoryBn: "বর্ণমালা ও ছড়া",
    duration: "২:৫০ মিনিট",
    age: "৩-৭ বছর",
    description: "খাওয়া, পড়া ও প্রতিটি শুভ কাজের শুরুতে বিসমিল্লাহ বলার অভ্যাস গড়ে তোলার ছড়া।",
    moralLesson: "বিসমিল্লাহ বলে শুরু করলে আল্লাহ কাজে বরকত দেন।",
    starsReward: 2,
    thumbnail: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-daily-duas",
    youtubeId: "2nB1y2zZ9_c", // Kids Duas
    title: "ছোটদের ৫টি মাসনূন দোয়া (খাওয়া, ঘুম ও পড়াশোনা)",
    category: "dua",
    categoryBn: "মাসনূন দোয়া",
    duration: "৫:১০ মিনিট",
    age: "৪-৯ বছর",
    description: "সহজ অ্যানিমেশনের মাধ্যমে খাওয়ার আগের ও পরের দোয়া, ঘুমানোর দোয়া ও ইলম বৃদ্ধির দোয়া।",
    moralLesson: "দৈনন্দিন দোয়াগুলো আমাদের শয়তান ও অনিষ্ট থেকে রক্ষা করে।",
    starsReward: 3,
    thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-yunus-whale",
    youtubeId: "Xg0nK2W9_9U", // Prophet Yunus story
    title: "হযরত ইউনুস (আঃ) ও তিমি মাছের পেটের দোয়া",
    category: "stories",
    categoryBn: "নবীদের গল্প",
    duration: "৭:১৫ মিনিট",
    age: "৫-১২ বছর",
    description: "বিশাল তিমি মাছের পেটে হযরত ইউনুস (আঃ)-এর কাতর প্রার্থনা ও আল্লাহর অসীম রহমতের সত্য ঘটনা।",
    moralLesson: "বিপদে একমাত্র আল্লাহর কাছেই সাহায্য চাইতে হয় (লা ইলাহা ইল্লা আনতা সুবহানাকা...)।",
    starsReward: 3,
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-wudu-salah",
    youtubeId: "7c1qP4yL6-k", // Wudu animation
    title: "ছোটদের ওযু ও দুই রাকাত নামাজের সহজ নিয়ম",
    category: "salah",
    categoryBn: "নামাজ ও ওযু",
    duration: "৬:৩০ মিনিট",
    age: "৫-১০ বছর",
    description: "ধাপে ধাপে ওযুর ৪ ফরজ এবং কীভাবে ছোটরা সুন্দর করে নামাজ পড়বে তার শিশুতোষ অ্যানিমেশন।",
    moralLesson: "পবিত্রতা ঈমানের অঙ্গ এবং নামাজ বেহেশতের চাবি।",
    starsReward: 3,
    thumbnail: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-fatiha-recitation",
    youtubeId: "9oD9_b9L1uE", // Surah Fatiha for kids
    title: "সূরা আল-ফাতিহা — শিশুদের সুললিত কণ্ঠে তিলাওয়াত ও মাশক",
    category: "qaida",
    categoryBn: "নূরানী কায়দা",
    duration: "৪:১০ মিনিট",
    age: "৪-১০ বছর",
    description: "সূরা আল-ফাতিহার প্রতিটি আয়াত ভেঙে ভেঙে শিশুদের সাথে মাশক করে বিশুদ্ধ উচ্চারণ শেখা।",
    moralLesson: "সূরা ফাতিহা হলো কুরআনের মা ও সর্বোত্তম দোয়া।",
    starsReward: 2,
    thumbnail: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "v-ibrahim-kaba",
    youtubeId: "M_1xP8kL7-Q", // Prophet Ibrahim story
    title: "হযরত ইব্রাহিম (আঃ) ও কাবা শরীফ নির্মাণের গল্প",
    category: "stories",
    categoryBn: "নবীদের গল্প",
    duration: "৮:৪৫ মিনিট",
    age: "৫-১২ বছর",
    description: "হযরত ইব্রাহিম (আঃ) ও ইসমাইল (আঃ) কীভাবে আল্লাহর পবিত্র ঘর কাবা নির্মাণ করেছিলেন।",
    moralLesson: "পিতা-মাতার অনুগত হওয়া এবং আল্লাহর আদেশে দৃঢ় থাকা।",
    starsReward: 3,
    thumbnail: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80",
  },
];

const VIDEO_CATEGORIES = [
  { id: "all", name: "সব ভিডিও", icon: "🌈" },
  { id: "alphabet", name: "বর্ণমালা ও ছড়া", icon: "🔤" },
  { id: "qaida", name: "নূরানী কায়দা", icon: "📖" },
  { id: "dua", name: "মাসনূন দোয়া", icon: "🤲" },
  { id: "stories", name: "নবীদের গল্প", icon: "🏰" },
  { id: "salah", name: "নামাজ ও ওযু", icon: "🕌" },
];

export default function NurKidsVideoCorner({ onEarnStars }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(NUR_KIDS_VIDEOS[0]);
  const [watchedVideos, setWatchedVideos] = useState(() => {
    try {
      const stored = localStorage.getItem("nur_kids_watched_videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const filteredVideos = activeCategory === "all"
    ? NUR_KIDS_VIDEOS
    : NUR_KIDS_VIDEOS.filter((v) => v.category === activeCategory);

  const handleSelectVideo = (video) => {
    playTapSound();
    setSelectedVideo(video);
    // Smooth scroll up to video player
    const playerEl = document.getElementById("nur-kids-main-player");
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompleteWatching = (video) => {
    if (!watchedVideos.includes(video.id)) {
      const updated = [...watchedVideos, video.id];
      setWatchedVideos(updated);
      try {
        localStorage.setItem("nur_kids_watched_videos", JSON.stringify(updated));
      } catch {}
      playCorrectChime();
      playStarPopSound(video.starsReward || 2);
      if (onEarnStars) {
        onEarnStars(video.starsReward || 2);
      }
      toast.success(`মাশাআল্লাহ! ভিডিওটি দেখে তুমি +${video.starsReward}টি তারা অর্জন করেছ! ⭐`);
    } else {
      toast.info("তুমি ইতিমধ্যে এই ভিডিওটির তারা পুরস্কার পেয়েছো!");
    }
  };

  const isCurrentWatched = watchedVideos.includes(selectedVideo?.id);

  return (
    <div className="space-y-6">
      {/* ── ACTIVE VIDEO CINEMA STAGE ── */}
      <div
        id="nur-kids-main-player"
        className="rounded-3xl overflow-hidden bg-slate-950 border-4 border-amber-400/80 shadow-2xl relative"
      >
        {/* Responsive YouTube Player Embed */}
        <div className="relative w-full aspect-video bg-black">
          {selectedVideo ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={selectedVideo.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              ভিডিও নির্বাচন করুন
            </div>
          )}
        </div>

        {/* Video Info & Educational Details Bar */}
        {selectedVideo && (
          <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-t-2 border-emerald-800/60">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                  {selectedVideo.categoryBn}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 text-xs font-bold">
                  বয়স: {selectedVideo.age}
                </span>
                <span className="text-xs text-emerald-300/80 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedVideo.duration}</span>
                </span>
              </div>

              <h2 className="text-base sm:text-xl font-black text-white leading-tight">
                {selectedVideo.title}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
                {selectedVideo.description}
              </p>

              {selectedVideo.moralLesson && (
                <div className="p-3 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 text-xs text-amber-200 font-bold flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span><strong>শিক্ষণীয় শিক্ষা:</strong> {selectedVideo.moralLesson}</span>
                </div>
              )}
            </div>

            {/* Video Reward Trigger */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCompleteWatching(selectedVideo)}
                className={`w-full px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
                  isCurrentWatched
                    ? "bg-emerald-700/80 text-emerald-100 border border-emerald-500/60"
                    : "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-amber-500/30 animate-pulse font-black"
                }`}
              >
                {isCurrentWatched ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>দেখা সম্পন্ন হয়েছে (পুরস্কার প্রাপ্ত ✅)</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>সম্পূর্ণ দেখেছি! (+{selectedVideo.starsReward} তারা নিন ⭐)</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-emerald-300/60 text-center">
                ১০০% নিরাপদ ও শিশুতোষ শিক্ষণীয় প্লেয়ার
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── CATEGORY PILLS SELECTOR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {VIDEO_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playTapSound();
                setActiveCategory(cat.id);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-2 border-emerald-500"
                  : "bg-white dark:bg-stone-900 text-slate-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-400"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── VIDEO EPISODES GRID (Vina Kids YouTube Style) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            <span>নূর কিডস ভিডিও পর্বমালা ({filteredVideos.length})</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {watchedVideos.length}টি দেখা সম্পন্ন
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredVideos.map((vid) => {
            const isPlaying = selectedVideo?.id === vid.id;
            const isWatched = watchedVideos.includes(vid.id);

            return (
              <div
                key={vid.id}
                onClick={() => handleSelectVideo(vid)}
                className={`rounded-3xl overflow-hidden border-3 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isPlaying
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-amber-400 shadow-xl ring-4 ring-amber-400/30 scale-102"
                    : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-500 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Thumbnail Preview with Play Icon Overlay */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Play Overlay Badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      isPlaying
                        ? "bg-amber-400 text-slate-950 ring-4 ring-amber-300 animate-pulse"
                        : "bg-emerald-600/90 text-white"
                    }`}>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Tag */}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                    {vid.duration}
                  </span>

                  {/* Watched Checkmark Badge */}
                  {isWatched && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>সম্পন্ন</span>
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                        {vid.categoryBn}
                      </span>
                      <span className="text-amber-500 font-black flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>+{vid.starsReward} তারা</span>
                      </span>
                    </div>

                    <h4 className={`text-xs sm:text-sm font-black line-clamp-2 leading-snug transition ${
                      isPlaying ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white group-hover:text-emerald-600"
                    }`}>
                      {vid.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>{isPlaying ? "এখন চলছে 🔊" : "ভিডিও দেখুন ▶"}</span>
                    <span className="text-[10px] text-slate-400 font-medium">বয়স {vid.age}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
