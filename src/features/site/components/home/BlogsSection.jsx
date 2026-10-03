import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { BookOpen, Calendar, User, Clock, Eye, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function BlogsSection({ blogs: propBlogs, sectionData: propSectionData }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { data: fetchedBlogs = [], isLoading } = useQuery({
    queryKey: ["blogs-public"],
    queryFn: () => appClient.entities.Blog.list("-created_at", 50),
    enabled: propBlogs === undefined,
  });

  const { data: sectionQueryData } = useQuery({
    queryKey: ["page-section-blogs"],
    queryFn: async () => {
      const list = await appClient.entities.PageSection.filter({ section_key: "blogs" });
      return list[0] || null;
    },
    enabled: propSectionData === undefined,
  });

  const sectionData = propSectionData || sectionQueryData;

  const sectionTitle = isAr
    ? (sectionData?.title_ar || "المدونة والمقالات")
    : lang === "en"
    ? (sectionData?.title_en || "Blogs & Articles")
    : (sectionData?.title_bn || "ব্লগ ও প্রবন্ধসমূহ");

  const sectionSubtitle = isAr
    ? (sectionData?.subtitle_ar || "المعرفة الإسلامية والأفكار")
    : lang === "en"
    ? (sectionData?.subtitle_en || "Islamic Wisdom & Guidance")
    : (sectionData?.subtitle_bn || "দ্বীনি জ্ঞান, প্রবন্ধ ও দিকনির্দেশনা");

  const blogs = propBlogs || fetchedBlogs;
  const activeBlogs = blogs.filter((b) => b.is_published);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === "bn" ? "bn-BD" : lang === "ar" ? "ar-EG" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const cleanText = content.replace(/<[^>]*>/g, "");
    const wordCount = cleanText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 180));
  };

  const getLocalizedValue = (obj, field) => {
    if (!obj) return "";
    return obj[`${field}_${lang}`] || obj[field] || "";
  };

  const visibleBlogs = showAll ? activeBlogs : activeBlogs.slice(0, 3);

  // Render Skeleton Loader
  if (isLoading && activeBlogs.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="h-6 w-32 bg-slate-100 rounded-full mx-auto animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-150" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeBlogs.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16 md:py-24 px-4 transition-all duration-300 bg-transparent" 
      dir={isAr ? "rtl" : "ltr"}
      id="blogs-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-[#006241]/10 text-[#006241] border border-[#006241]/20 shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-[#006241]" />
            {sectionTitle}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#006241] mb-3 leading-tight tracking-tight">
            {sectionSubtitle}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleBlogs.map((b, idx) => {
            const title = getLocalizedValue(b, "title");
            const excerpt = getLocalizedValue(b, "excerpt");
            const content = getLocalizedValue(b, "content");
            const cleanText = content?.replace(/<[^>]*>/g, "") || "";
            const shortDesc = excerpt || (cleanText.slice(0, 120) + (cleanText.length > 120 ? "..." : ""));
            const readTime = b.reading_time || calculateReadTime(content);
            const authorName = b.author || (isBn ? "মুফতি / পরিচালক" : isAr ? "المفتي / المدير" : "Mufti / Director");

            return (
              <div
                key={b.id || idx}
                className="bg-white rounded-3xl overflow-hidden border border-[#1E6B52]/15 shadow-[0_4px_16px_rgba(30,107,82,0.04)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(30,107,82,0.12)] group border-t-[3px] hover:border-t-[#1E6B52] border-t-transparent"
              >
                <div>
                  {/* Image & Badge */}
                  <div className="relative h-52 bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {b.featured_image ? (
                      <img src={b.featured_image} loading="lazy" alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900/5 to-emerald-950/10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-emerald-300" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 bg-[#006241] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-[#006241]/20">
                      {isBn ? "প্রবন্ধ" : isAr ? "مقال" : "Article"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3 flex-1">
                    {/* Metadata: Date & Author */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{authorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{formatDate(b.created_at)}</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-lg text-[#052E2B] line-clamp-2 leading-snug transition-colors group-hover:text-[#006241]">
                      {title}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {shortDesc}
                    </p>
                  </div>
                </div>

                {/* Footer Info & Read More Button */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readTime} {isBn ? "মিনিট" : isAr ? "دقائق" : "min"}
                    </span>
                    {b.view_count !== undefined && b.view_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {b.view_count} {isBn ? "পঠিত" : isAr ? "مشاهدة" : "views"}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedBlog(b);
                      // Update view count if needed (local increment)
                      if (b.id) {
                        appClient.entities.Blog.update(b.id, { view_count: (b.view_count || 0) + 1 }).catch(() => {});
                      }
                    }} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#006241] hover:text-[#006241]/80 transition-colors group/btn"
                  >
                    <span>{isBn ? "বিস্তারিত পড়ুন" : isAr ? "اقرأ المزيد" : "Read More"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {activeBlogs.length > 3 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 rounded-xl border border-[#006241] text-[#006241] hover:bg-[#006241] hover:text-white font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md"
            >
              {showAll 
                ? (isBn ? "সংক্ষেপ করুন" : isAr ? "عرض أقل" : "Show Less")
                : (isBn ? "সবগুলো প্রবন্ধ দেখুন" : isAr ? "عرض جميع المقالات" : "View All Articles")}
            </button>
          </div>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedBlog} onOpenChange={(open) => { if (!open) setSelectedBlog(null); }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl bg-white">
          {selectedBlog && (() => {
            const title = getLocalizedValue(selectedBlog, "title");
            const content = getLocalizedValue(selectedBlog, "content");
            const author = selectedBlog.author || (isBn ? "মুফতি / পরিচালক" : isAr ? "المفتي / المدير" : "Mufti / Director");
            const readTime = selectedBlog.reading_time || calculateReadTime(content);
            
            return (
              <div>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                {/* Header Banner */}
                <div className="relative h-64 md:h-80 bg-slate-100 border-b">
                  {selectedBlog.featured_image ? (
                    <img src={selectedBlog.featured_image} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-[#D4AF37]/35" />
                    </div>
                  )}
                  {/* Close button Overlay */}
                  <DialogClose className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-colors border border-white/20">
                    <X className="h-4 w-4" />
                  </DialogClose>
                  {/* Bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className="bg-[#D4AF37] text-emerald-950 text-[10px] font-bold px-3 py-1 rounded-full">
                      {isBn ? "ইসলামিক প্রবন্ধ" : isAr ? "مقال إسلامي" : "Islamic Article"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-tight line-clamp-2">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Meta details bar */}
                <div className="px-6 py-4 bg-slate-50 border-b flex flex-wrap gap-4 md:gap-6 justify-between text-xs text-slate-500 font-medium">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-[#D4AF37]" />
                      {author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#D4AF37]" />
                      {formatDate(selectedBlog.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#D4AF37]" />
                      {readTime} {isBn ? "মিনিট পাঠ" : isAr ? "دقائق قراءة" : "min read"}
                    </span>
                    {selectedBlog.view_count !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-[#D4AF37]" />
                        {selectedBlog.view_count + 1} {isBn ? "পঠিত" : isAr ? "مشاهدة" : "views"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 md:p-8">
                  <article 
                    className="prose prose-slate max-w-none text-[#052E2B] leading-relaxed text-sm md:text-base space-y-4 font-serif"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                  />
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
