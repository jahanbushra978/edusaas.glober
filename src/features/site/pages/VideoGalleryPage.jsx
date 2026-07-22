import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { X, Play, ArrowLeft, Video } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VideoGalleryPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";
  
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch_id");

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSession, setActiveSession] = useState("all");
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch dynamic categories
  const { data: dbCategories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["video-categories-public"],
    queryFn: () => appClient.entities.VideoCategory.list("sort_order", 100),
    staleTime: 15 * 60 * 1000,
  });

  // Fetch active videos
  const { data: allVideos = [], isLoading: loadingVideos, error } = useQuery({
    queryKey: ["videos-public"],
    queryFn: () => appClient.entities.Video.list("showing_serial", 500),
    select: d => d.filter(v => v.status === "Active" && v.show_on_website !== "N"),
    staleTime: 10 * 60 * 1000,
  });

  // Resolve category menu dynamically (All + Database categories)
  const categoryMenu = [
    { id: "all", name_en: "All Videos", name_bn: "সকল ভিডিও", name_ar: "كل الفيديوهات" },
    ...dbCategories
  ];

  // Base filter for branch if passed
  const branchFiltered = branchId
    ? allVideos.filter(v => String(v.branch_id) === String(branchId))
    : allVideos;

  // Filter videos client side by selected category
  const categoryFilteredVideos = activeCategory === "all"
    ? branchFiltered
    : branchFiltered.filter(v => String(v.category_id) === String(activeCategory));

  const finalFilteredVideos = activeSession === "all"
    ? categoryFilteredVideos
    : categoryFilteredVideos.filter(v => String(v.class_id) === String(activeSession));

  const uniqueSessions = Array.from(new Set(branchFiltered.map(v => v.class_id).filter(Boolean)));

  // Helper to extract YouTube video ID
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#080f0a] py-12 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className={isAr ? 'text-right' : ''}>
          <Link href="/"
            className={`inline-flex items-center gap-2 text-sm font-bold italic mb-8 transition-all duration-200 text-[#006400] hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common.backHome}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-green-800 text-emerald-700 dark:text-emerald-400">
            {lang === "bn" ? "ভিডিও গ্যালারি" : isAr ? "معرض الفيديو" : "Video Gallery"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold italic text-slate-900 dark:text-slate-100 mb-3">
            {lang === "bn" ? "আমাদের শিক্ষা কার্যক্রমের ভিডিওসমূহ" : isAr ? "فيديوهات أنشطتنا التعليمية" : "Videos of Our Educational Activities"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto italic">
            {lang === "bn" ? "মাদরাসার বিভিন্ন অনুষ্ঠান, প্রতিযোগিতা, শিক্ষা কার্যক্রম এবং ডকুমেন্টারি ভিডিও নিচে ক্যাটাগরি অনুযায়ী দেখতে পারবেন।" :
             isAr ? "شاهد وثائقياتنا، ومسابقاتنا، وأنشطتنا التعليمية مقسمة حسب الفئات أدناه." :
             "Watch our documentaries, competitions, and educational activities categorized below."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Category Navigation Menu */}
        <div className={`flex flex-wrap gap-2.5 justify-center mb-12 ${isAr ? 'flex-row-reverse' : ''}`}>
          {categoryMenu.map(c => {
            const isActive = activeCategory === String(c.id);
            const label = lang === "bn" ? c.name_bn : lang === "ar" ? (c.name_ar || c.name_en) : c.name_en;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(String(c.id))}
                className="px-5 py-2.5 rounded-xl text-xs font-bold italic transition-all duration-300 shadow-sm"
                style={{
                  background: isActive ? "linear-gradient(135deg,#006400,#008050)" : "white",
                  color: isActive ? "#fff" : "#475569",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "#e2e8f0",
                  boxShadow: isActive ? "0 4px 12px rgba(0,100,60,0.25)" : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        
        {/* Session Filter */}
        {uniqueSessions.length > 0 && (
          <div className="flex justify-center mb-12">
            <select
              value={activeSession}
              onChange={(e) => setActiveSession(e.target.value)}
              className="px-4 py-2 border border-emerald-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            >
              <option value="all">All Sessions / Classes</option>
              {uniqueSessions.map(sessionId => (
                <option key={sessionId} value={sessionId}>{sessionId === 'all' ? 'General' : `Class ${sessionId}`}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading / Error States */}
        {loadingVideos ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-dashed border-red-200 dark:border-red-900">
            <p className="text-red-500 dark:text-red-400 italic font-medium">{t.common.error || "Failed to load videos."}</p>
          </div>
        ) : finalFilteredVideos.length === 0 ? (
          <div className="text-center py-24 bg-slate-100 dark:bg-[#0c1812] rounded-3xl border border-dashed border-slate-200 dark:border-green-950">
            <Video className="h-14 w-14 mx-auto text-slate-300 dark:text-green-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 italic font-medium">
              {lang === "bn" ? "এই ক্যাটাগরিতে কোনো ভিডিও পাওয়া যায়নি" : isAr ? "لا توجد فيديوهات في هذه الفئة" : "No videos found in this category"}
            </p>
          </div>
        ) : (
          /* Responsive Videos Grid */
          /* Desktop -> 4, Laptop -> 3, Tablet -> 2, Mobile -> 1 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {finalFilteredVideos.map(video => {
              const title = lang === "bn" ? (video.title_bn || video.title_en) : lang === "ar" ? (video.title_ar || video.title_en) : video.title_en;
              return (
                <div
                  key={video.id}
                  className="group bg-white dark:bg-[#0d1f17] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-slate-100 dark:border-green-950/40 hover:-translate-y-1"
                  onClick={() => setActiveVideo(video)}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        loading="lazy"
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-400/80">
                        <Video className="w-10 h-10 mb-1" />
                        <span className="text-[11px] font-medium text-slate-400">Play Video</span>
                      </div>
                    )}
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h3 className={`text-sm sm:text-base font-extrabold italic text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors ${isAr ? 'text-right' : ''}`}>
                        {title}
                      </h3>
                      {video.description && (
                        <p className={`text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic leading-relaxed ${isAr ? 'text-right' : ''}`}>
                          {video.description}
                        </p>
                      )}
                    </div>
                    {video.upload_date && (
                      <span className={`text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1 ${isAr ? 'text-right' : ''}`}>
                        📅 {video.upload_date}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-all active:scale-90"
            onClick={() => setActiveVideo(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            className="max-w-4xl w-full flex flex-col gap-4"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
              {activeVideo.youtube_url && (activeVideo.youtube_url.includes("cloudinary.com") || activeVideo.youtube_url.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                <video
                  src={activeVideo.youtube_url}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={getYoutubeEmbedUrl(activeVideo.youtube_url)}
                  title={activeVideo.title_en}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              )}
            </div>
            <div className="text-center px-4">
              <p className="text-xl font-bold italic text-white mb-1">
                {lang === "bn" ? (activeVideo.title_bn || activeVideo.title_en) : lang === "ar" ? (activeVideo.title_ar || activeVideo.title_en) : activeVideo.title_en}
              </p>
              {activeVideo.description && (
                <p className="text-sm italic text-white/60 mt-1 max-w-xl mx-auto">{activeVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
