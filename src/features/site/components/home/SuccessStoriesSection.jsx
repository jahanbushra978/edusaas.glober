import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Trophy, Award, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function SuccessStoriesSection({ stories: propStories, sectionData: propSectionData }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const [selectedStory, setSelectedStory] = useState(null);

  const { data: fetchedStories = [] } = useQuery({
    queryKey: ["success-stories-public"],
    queryFn: () => appClient.entities.SuccessStory.list("-created_at", 50),
    enabled: propStories === undefined,
  });

  const { data: sectionQueryData } = useQuery({
    queryKey: ["page-section-success_stories"],
    queryFn: async () => {
      const list = await appClient.entities.PageSection.filter({ section_key: "success_stories" });
      return list[0] || null;
    },
    enabled: propSectionData === undefined,
  });

  const sectionData = propSectionData || sectionQueryData;

  const sectionTitle = isAr
    ? (sectionData?.title_ar || "قصص النجاح")
    : lang === "en"
    ? (sectionData?.title_en || "Success Stories")
    : (sectionData?.title_bn || "সাফল্যের গল্পসমূহ");

  const sectionSubtitle = isAr
    ? (sectionData?.subtitle_ar || "إنجازات طلابنا المتميزة")
    : lang === "en"
    ? (sectionData?.subtitle_en || "Our Students' Proud Achievements")
    : (sectionData?.subtitle_bn || "আমাদের শিক্ষার্থীদের গর্বিত অর্জন");

  const stories = propStories || fetchedStories;

  const activeStories = stories
    .filter((s) => s.is_active === true || s.is_active === "true" || s.is_active === 1)
    .slice(0, 6);

  const mockStories = [
    {
      id: "mock-1",
      title_en: "Hafez Al-Amin - Memorized in 1 Year",
      title_bn: "হাফেজ আল-আমিন - ১ বছরে হিফয সম্পন্ন",
      title_ar: "حافظ الأمين - أتم الحفظ في سنة واحدة",
      description_en: "Al-Amin successfully completed his Hifz within one year under our special program with excellent Tajweed.",
      description_bn: "আল-আমিন আমাদের বিশেষ প্রোগ্রামের অধীনে চমৎকার তাজউইদের সাথে এক বছরের মধ্যে তার হিফয সফলভাবে সম্পন্ন করেছে।",
      description_ar: "نجح الأمين في إتمام حفظ القرآن الكريم خلال عام واحد ضمن برنامجنا الخاص بتجويد ممتاز.",
      image_url: ""
    },
    {
      id: "mock-2",
      title_en: "Md. Sabbir - Board Exam Success",
      title_bn: "মো. সাব্বির - বোর্ড পরীক্ষায় সেরা সাফল্য",
      title_ar: "محمد صبير - التميز الأكاديمي",
      description_en: "Sabbir scored GPA 5.00 in general board exams while maintaining regular Madrasah lessons.",
      description_bn: "সাব্বির মাদরাসার নিয়মিত পাঠ বজায় রাখার পাশাপাশি সাধারণ বোর্ড পরীক্ষায় জিপিএ ৫.০০ অর্জন করেছে।",
      description_ar: "حصل صبير على معدل 5.00 في الامتحانات العامة مع الحفاظ على دروس المعهد المنتظمة.",
      image_url: ""
    },
    {
      id: "mock-3",
      title_en: "Hafez Raihan - National Competition Winner",
      title_bn: "হাফেজ রায়হান - জাতীয় হিফয প্রতিযোগিতায় বিজয়ী",
      title_ar: "حافظ ريحان - الفائز بمسابقة الحفظ الوطنية",
      description_en: "Raihan achieved 3rd place in the National Hifz Competition representing Rahmania Institute.",
      description_bn: "রায়হান রহমানিয়া ইনস্টিটিউটের প্রতিনিধিত্ব করে জাতীয় হিফয প্রতিযোগিতায় ৩য় স্থান অর্জন করেছে।",
      description_ar: "حصل ريحان على المركز الثالث في مسابقة الحفظ الوطنية ممثلاً لمعهد الرحمانية.",
      image_url: ""
    }
  ];

  const storiesToRender = activeStories.length > 0 ? activeStories : (stories.length === 0 ? mockStories : []);

  if (storiesToRender.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16 md:py-24 px-4 overflow-x-hidden transition-all duration-300 bg-transparent" 
      dir={isAr ? "rtl" : "ltr"}
      id="success-stories-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-green-50 text-[#006241] border border-green-100 shadow-sm">
            <Trophy className="h-3.5 w-3.5" />
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

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {storiesToRender.map((story, idx) => {
            // Pick the language-specific field first.
            // If that language wasn't filled by admin, show nothing rather than
            // accidentally showing Bengali text to English/Arabic visitors.
            const title = story[`title_${lang}`] || (lang === "bn" ? story.title : "") || story.title_bn || story.title || "";
            const description = story[`description_${lang}`] || (lang === "bn" ? story.description : "") || story.description_bn || story.description || "";
            
            return (
              <div
                key={story.id || idx}
                className="bg-white rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_4px_16px_rgba(0,98,65,0.04)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,98,65,0.12)] hover:border-[#D4AF37]/80 group border-t-[3px] hover:border-t-[#006241]"
              >
                <div>
                  {/* Image & Rank Badge */}
                  <div 
                    className="relative h-52 bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100 cursor-pointer"
                    onClick={() => setSelectedStory(story)}
                  >
                    {story.image_url ? (
                      <img src={story.image_url} loading="lazy" alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-900/5 to-emerald-950/10 flex items-center justify-center">
                        <Award className="h-16 w-16 text-[#D97706]/40" />
                      </div>
                    )}
                    <div className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-[#006241] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm`}>
                      <Trophy className="h-3 w-3 text-[#D4AF37]" />
                      <span>#{idx + 1}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h4 
                      onClick={() => setSelectedStory(story)}
                      className={`font-bold text-base md:text-lg text-slate-800 leading-snug cursor-pointer hover:text-[#006241] transition-colors line-clamp-2 ${isAr ? "text-right" : "text-left"}`}
                    >
                      {title}
                    </h4>
                    <p className={`text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-3 ${isAr ? "text-right" : "text-left"}`}>
                      {description}
                    </p>
                  </div>
                </div>

                {/* Footer Bar with "বিস্তারিত দেখুন" Button */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {isBn ? "সাফল্যের বিবরণ" : isAr ? "تفاصيل الإنجاز" : "Achievement Story"}
                  </span>
                  <button 
                    onClick={() => setSelectedStory(story)} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#006241] hover:text-[#006241]/80 transition-colors group/btn"
                  >
                    <span>{isBn ? "বিস্তারিত দেখুন" : isAr ? "عرض التفاصيل" : "Read Details"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Detail Dialog / Popup */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => { if (!open) setSelectedStory(null); }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl bg-white">
          {selectedStory && (() => {
            // Same language-aware logic for the popup/dialog
            const title = selectedStory[`title_${lang}`] || (lang === "bn" ? selectedStory.title : "") || selectedStory.title_bn || selectedStory.title || "";
            const description = selectedStory[`description_${lang}`] || (lang === "bn" ? selectedStory.description : "") || selectedStory.description_bn || selectedStory.description || "";
            
            return (
              <div>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                
                {/* Image Banner */}
                <div className="relative h-64 md:h-80 bg-slate-100 border-b">
                  {selectedStory.image_url ? (
                    <img src={selectedStory.image_url} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center">
                      <Trophy className="h-24 w-24 text-[#D4AF37]/35" />
                    </div>
                  )}
                  {/* Close button Overlay */}
                  <DialogClose className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-colors border border-white/20">
                    <X className="h-4 w-4" />
                  </DialogClose>
                  {/* Bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className="bg-[#D4AF37] text-emerald-950 text-[10px] font-bold px-3 py-1 rounded-full">
                      {isBn ? "শিক্ষার্থীদের অর্জন" : isAr ? "إنجاز الطالب" : "Student Achievement"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-tight">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#006241] bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 w-fit">
                    <Trophy className="h-4 w-4 text-[#D4AF37]" />
                    <span>{isBn ? "সাফল্যের গল্প" : isAr ? "قصة النجاح" : "Success Story"}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line font-normal">
                    {description}
                  </p>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
