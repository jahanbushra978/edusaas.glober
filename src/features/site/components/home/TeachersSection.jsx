import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { User, ChevronLeft, ChevronRight, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TeachersSection({ teachers: propTeachers, sectionData: propSectionData }) {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-public"],
    queryFn: () => appClient.entities.Teacher.filter(
      { status: "active" }, 
      "created_date", 
      20,
      "id,teacher_id,user_email,full_name_en,full_name_bn,phone,photo_url,designation,bio,facebook,linkedin,is_active,full_name_ar,designation_bn,designation_ar,bio_bn,bio_ar,name,image_url,employee_code,branch,department,website_showing_serial,featured_teacher,cv_url,alt_phone,qualification,experience_years,special_skills,show_on_website,branch_id"
    ),
    enabled: propTeachers === undefined,
  });

  const { data: querySectionData } = useQuery({
    queryKey: ["page-section-teachers"],
    queryFn: () => appClient.entities.PageSection.filter({ section_key: "teachers_intro" }),
    select: d => d[0],
    enabled: propSectionData === undefined,
  });

  const activeTeachers = propTeachers || teachers;
  const sectionData = propSectionData || querySectionData;

  // Filter: show only featured teachers (featured_teacher = true)
  // Limit to maximum of 10 teachers
  const featuredAndSorted = activeTeachers
    .filter(teach => teach.featured_teacher === true && teach.is_active !== false)
    .sort((a, b) => {
      const sa = a.website_showing_serial !== null && a.website_showing_serial !== undefined ? Number(a.website_showing_serial) : 999999;
      const sb = b.website_showing_serial !== null && b.website_showing_serial !== undefined ? Number(b.website_showing_serial) : 999999;
      return sa - sb;
    })
    .slice(0, 10);

  // Handle responsive visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, featuredAndSorted.length - visibleCount);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const [isPaused, setIsPaused] = useState(false);

  // Autoplay effect
  useEffect(() => {
    if (featuredAndSorted.length <= visibleCount || isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(interval);
  }, [featuredAndSorted.length, visibleCount, handleNext, isPaused]);

  if (sectionData?.is_visible === false) return null;
  if (featuredAndSorted.length === 0) return null;

  const titleEn = sectionData?.title_en || "Meet Our Teachers";
  const titleBn = sectionData?.title_bn || "আমাদের শিক্ষকমণ্ডলী";
  const titleAr = sectionData?.title_ar || "تعرف على معلمينا";
  
  const subtitleEn = sectionData?.subtitle_en || "Qualified, dedicated and passionate educators guiding every student";
  const subtitleBn = sectionData?.subtitle_bn || "যোগ্য, নিবেদিতপ্রাণ শিক্ষকরা প্রতিটি শিক্ষার্থীকে সঠিক পথে পরিচালিত করছেন";
  const subtitleAr = sectionData?.subtitle_ar || "معلمون مؤهلون ومخلصون يوجهون كل طالب نحو النجاح";

  const currentTitle = isBn ? titleBn : isAr ? titleAr : titleEn;
  const currentSubtitle = isBn ? subtitleBn : isAr ? subtitleAr : subtitleEn;

  return (
    <section id="teachers" className="py-16 overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-4 relative">
        
        {/* Header */}
        <div className="text-center mb-12">
          {!isBn && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
              {isAr ? "أعضاء هيئة التدريس" : "Our Faculty"}
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold italic text-[#052E16] mb-2">
            {currentTitle}
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto italic">{currentSubtitle}</p>
        </div>

        {/* Carousel Slider Wrapper */}
        <div 
          className="relative px-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-0"
              style={{
                transform: `translateX(${isAr ? "" : "-"}${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {featuredAndSorted.map((teach) => {
                const showOnWebsite = teach.show_on_website || {};
                const showPhoto = showOnWebsite.photo !== "N";
                const showName = showOnWebsite.name !== "N";
                const showDesignation = showOnWebsite.designation !== "N";
                const showBranch = showOnWebsite.branch !== "N";
                const showDept = showOnWebsite.department !== "N";
                const showSubjects = showOnWebsite.subjects !== "N";
 
                const name = isBn ? (teach.full_name_bn || teach.full_name_en) 
                           : isAr ? (teach.full_name_ar || teach.full_name_en) 
                           : (teach.full_name_en || teach.full_name_bn);
 
                const designation = isBn ? (teach.designation_bn || teach.designation) 
                                 : isAr ? (teach.designation_ar || teach.designation) 
                                 : (teach.designation || teach.designation_bn);
 
                return (
                  <div
                    key={teach.id}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/4 px-2.5 group"
                  >
                    <div className="h-full bg-white rounded-3xl p-6 text-center border border-[#D4AF37]/30 shadow-[0_4px_16px_rgba(12,46,31,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(12,46,31,0.12)] hover:border-[#D4AF37]/80 transition-all duration-300 cursor-default flex flex-col justify-between overflow-hidden"
                      style={{ willChange: "transform" }}
                    >
                      <div>
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center relative border-4 border-amber-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
                          {teach.photo_url && showPhoto ? (
                            <Image src={teach.photo_url} alt={name} fill sizes="96px" className="object-cover" />
                          ) : (
                            <User className="h-10 w-10 text-emerald-700" />
                          )}
                        </div>
                        
                        {showName && (
                          <h4 className="font-extrabold text-[#052E16] text-sm md:text-base leading-tight break-words">
                            {name}
                          </h4>
                        )}
 
                        {showDesignation && designation && (
                          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1.5">
                            {designation}
                          </p>
                        )}
 
                        {showDept && teach.department && (
                          <p className="text-[10px] text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-full inline-block mt-2">
                            {teach.department}
                          </p>
                        )}
 
                        {showSubjects && teach.subjects && (
                          <p className="text-xs text-slate-500 mt-2.5 italic flex items-center justify-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-amber-500/70" /> {teach.subjects.split(",")[0]}
                          </p>
                        )}
                      </div>
 
                      {showBranch && teach.branch && (
                        <div className="mt-3.5 pt-3 border-t border-slate-50 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="h-3 w-3 text-emerald-600/60" />
                          <span>{teach.branch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Slider Controls */}
          {featuredAndSorted.length > visibleCount && (
            <>
              <button
                onClick={isAr ? handleNext : handlePrev}
                aria-label="Previous teacher"
                className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center text-[#0c2e1f] hover:bg-[#0c2e1f] hover:text-white transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={isAr ? handlePrev : handleNext}
                aria-label="Next teacher"
                className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center text-[#0c2e1f] hover:bg-[#0c2e1f] hover:text-white transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
 
        {/* Slider Dots */}
        {featuredAndSorted.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-[#0c2e1f]" : "w-2.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
 
        {/* View All Button */}
        {activeTeachers.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/teachers">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold italic text-sm bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-[0_4px_12px_rgba(4,120,87,0.15)] hover:shadow-[0_12px_24px_rgba(4,120,87,0.3)] hover:-translate-y-0.5 hover:scale-105 transition-all duration-200"
              >
                {isBn ? "সকল শিক্ষক দেখুন" : isAr ? "عرض جميع المعلمين" : "See All Teachers"} 
              </button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}

