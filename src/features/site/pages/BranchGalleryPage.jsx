import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { X, Play, ArrowLeft, Image as ImageIcon, Video, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BranchGalleryPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch_id");
  const classId = searchParams.get("class_id");

  const [activeMediaTab, setActiveMediaTab] = useState("photos"); // 'photos' or 'videos'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch branch details
  const { data: branch, isLoading: loadingBranch } = useQuery({
    queryKey: ["branch-details-gallery", branchId],
    queryFn: () => appClient.entities.Branch.get(Number(branchId)),
    enabled: !!branchId,
  });

  // Find class details from the branch's academic structure
  const classObj = branch?.academic_structure?.find(c => String(c.id) === String(classId));
  const className = classObj
    ? (lang === "bn" ? classObj.class_name?.bn : lang === "ar" ? (classObj.class_name?.ar || classObj.class_name?.en) : classObj.class_name?.en)
    : "";
  const sectionName = classObj
    ? (lang === "bn" ? classObj.section?.bn : lang === "ar" ? (classObj.section?.ar || classObj.section?.en) : classObj.section?.en)
    : "";

  // Fetch branch photos
  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["branch-class-photos", branchId],
    queryFn: () => appClient.entities.Gallery.filter({ branch_id: Number(branchId) }),
    enabled: !!branchId,
    select: d => d.filter(p => {
      if (p.is_published === false) return false;
      // If a specific class is selected, filter by that category
      if (classId && classId !== "all" && classObj) {
        const catName = String(p.category || "").toLowerCase();
        const classNameEn = String(classObj.class_name?.en || "").toLowerCase();
        const classNameBn = String(classObj.class_name?.bn || "").toLowerCase();
        return catName === classNameEn || catName === classNameBn;
      }
      return true;
    })
  });

  // Fetch branch class videos
  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["branch-class-videos", branchId, classId],
    queryFn: () => appClient.entities.Video.filter({ branch_id: Number(branchId), class_id: classId }),
    enabled: !!branchId && !!classId,
    select: d => d.filter(v => v.status === "Active" && v.show_on_website !== "N")
  });

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

  const getBranchName = () => {
    if (!branch) return "";
    if (lang === "bn") return branch.name_bn || branch.branch_name || branch.name_en || "";
    if (lang === "ar") return branch.name_ar || branch.name_en || "";
    return branch.name_en || branch.branch_name || "";
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#080f0a] py-12 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className={isAr ? 'text-right' : ''}>
          <Link href={branch ? `/branch/${branch.slug || branch.id}` : "/"}
            className={`inline-flex items-center gap-2 text-sm font-bold italic mb-8 transition-all duration-200 text-[#006400] hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 ${isAr ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {lang === "bn" ? "শাখা পেজে ফিরে যান" : isAr ? "العودة لصفحة الفرع" : "Back to Branch"}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-green-800 text-emerald-700 dark:text-emerald-400">
            <Building2 className="h-3.5 w-3.5" />
            {getBranchName()}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold italic text-slate-900 dark:text-slate-100 mb-2">
            {className ? `${className} (${sectionName})` : ""} {lang === "bn" ? "গ্যালারি ও ভিডিও" : isAr ? "المعرض والفيديو" : "Gallery & Videos"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {lang === "bn" ? "এই ক্লাসের শিক্ষা কার্যক্রমের ছবি এবং ভিডিওসমূহ নিচে দেখতে পারবেন।" :
             isAr ? "شاهد الصور والفيديوهات الخاصة بالأنشطة التعليمية لهذا الفصل." :
             "View the photos and videos of educational activities for this class below."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Media Switcher Tab */}
        <div className="flex justify-center gap-2 mb-10 border-b border-primary/5 pb-2">
          <button
            onClick={() => setActiveMediaTab("photos")}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border"
            style={{
              background: activeMediaTab === "photos" ? "linear-gradient(135deg,#006400,#008050)" : "white",
              color: activeMediaTab === "photos" ? "#fff" : "#006400",
              borderColor: activeMediaTab === "photos" ? "transparent" : "rgba(0,100,60,0.2)",
              boxShadow: activeMediaTab === "photos" ? "0 4px 12px rgba(0,100,60,0.25)" : "none",
            }}
          >
            <ImageIcon className="h-4 w-4" /> {lang === "bn" ? "ছবি সমূহ" : isAr ? "الصور" : "Photos"} ({photos.length})
          </button>
          <button
            onClick={() => setActiveMediaTab("videos")}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border"
            style={{
              background: activeMediaTab === "videos" ? "linear-gradient(135deg,#006400,#008050)" : "white",
              color: activeMediaTab === "videos" ? "#fff" : "#006400",
              borderColor: activeMediaTab === "videos" ? "transparent" : "rgba(0,100,60,0.2)",
              boxShadow: activeMediaTab === "videos" ? "0 4px 12px rgba(0,100,60,0.25)" : "none",
            }}
          >
            <Video className="h-4 w-4" /> {lang === "bn" ? "ভিডিও সমূহ" : isAr ? "الفيديوهات" : "Videos"} ({videos.length})
          </button>
        </div>

        {/* Loading States */}
        {loadingBranch || (activeMediaTab === "photos" && loadingPhotos) || (activeMediaTab === "videos" && loadingVideos) ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}

        {/* Photos grid */}
        {!loadingBranch && activeMediaTab === "photos" && !loadingPhotos && (
          photos.length === 0 ? (
            <div className="text-center py-24 bg-slate-100 dark:bg-[#0c1812] rounded-3xl border border-dashed border-slate-200 dark:border-green-950">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-green-800 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 italic font-medium">
                {lang === "bn" ? "কোনো ছবি পাওয়া যায়নি" : isAr ? "لا توجد صور" : "No photos found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map(item => (
                <div
                  key={item.id}
                  onClick={() => setLightboxImage(item.image_url)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md bg-white dark:bg-[#0d1f17] border dark:border-green-950 aspect-square hover:shadow-2xl transition-all duration-300"
                >
                  <img src={item.image_url} loading="lazy" alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                    {lang === 'bn' ? 'বড় করে দেখুন' : isAr ? 'عرض أكبر' : 'Zoom In'}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Videos grid */}
        {!loadingBranch && activeMediaTab === "videos" && !loadingVideos && (
          videos.length === 0 ? (
            <div className="text-center py-24 bg-slate-100 dark:bg-[#0c1812] rounded-3xl border border-dashed border-slate-200 dark:border-green-950">
              <Video className="h-12 w-12 mx-auto text-slate-300 dark:text-green-800 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 italic font-medium">
                {lang === "bn" ? "কোনো ভিডিও পাওয়া যায়নি" : isAr ? "لا توجد فيديوهات" : "No videos found"}
              </p>
            </div>
          ) : (
            /* Responsive Grid: 4 per row on Desktop, 3 on Laptop, 2 on Tablet, 1 on Mobile */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => {
                const title = lang === "bn" ? (video.title_bn || video.title_en) : lang === "ar" ? (video.title_ar || video.title_en) : video.title_en;
                return (
                  <div
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className="group bg-white dark:bg-[#0d1f17] rounded-2xl overflow-hidden cursor-pointer shadow-md border border-slate-100 dark:border-green-950/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img src={video.thumbnail_url} loading="lazy" alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className={`text-sm font-extrabold italic text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors ${isAr ? 'text-right' : ''}`}>
                        {title}
                      </h3>
                      {video.upload_date && (
                        <span className={`text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-2 ${isAr ? 'text-right' : ''}`}>
                          📅 {video.upload_date}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* Lightbox Image */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-pointer"
        >
          <button aria-label="Close image" className="absolute top-6 right-6 text-white hover:text-slate-200">
            <X className="w-8 h-8" />
          </button>
          <img src={lightboxImage} loading="lazy" alt="Zoomed" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}

      {/* Video Lightbox Player */}
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

          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full flex flex-col gap-4">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
