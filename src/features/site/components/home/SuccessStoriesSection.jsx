import React from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Trophy, Award } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function SuccessStoriesSection({ stories: propStories }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: fetchedStories = [] } = useQuery({
    queryKey: ["success-stories-public"],
    queryFn: () => appClient.entities.SuccessStory.list("-created_at", 50),
    enabled: propStories === undefined,
  });

  const stories = propStories || fetchedStories;

  const activeStories = stories
    .filter((s) => s.is_active !== false)
    .slice(0, 3);

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

  const storiesToRender = activeStories.length > 0 ? activeStories : mockStories;

  return (
    <section 
      className="py-16 md:py-24 px-4 overflow-x-hidden transition-all duration-300 bg-transparent" 
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-green-50 text-[#006241] border border-green-100">
            <Trophy className="h-3.5 w-3.5" />
            {isBn ? "সাফল্যের গল্পসমূহ" : isAr ? "قصص النجاح" : "Success Stories"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#006241] mb-3 leading-tight">
            {isBn ? "আমাদের শিক্ষার্থীদের গর্বিত অর্জন" : isAr ? "إنجازات طلابنا المتميزة" : "Our Students' Proud Achievements"}
          </h2>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {storiesToRender.map((story, idx) => {
            const title = story[`title_${lang}`] || story[`achievement_${lang}`] || story.title || "";
            const description = story[`description_${lang}`] || story[`story_${lang}`] || story.description || "";
            
            return (
              <div
                key={story.id || idx}
                className="bg-white rounded-3xl border border-[#D4AF37]/40 shadow-[0_4px_16px_rgba(0,98,65,0.04)] flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,98,65,0.12)] hover:border-[#D4AF37]/80 group"
                style={{ willChange: "transform" }}
              >
                <div>
                  <div className="relative h-52 bg-slate-50 overflow-hidden flex items-center justify-center border-b">
                    {story.image_url ? (
                      <img src={story.image_url} loading="lazy" alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Award className="h-16 w-16 text-[#D97706]/30" />
                    )}
                    <div className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-[#006241] text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm`}>
                      <Trophy className="h-3 w-3" />
                      <span>#{idx + 1}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className={`font-bold text-base text-slate-800 leading-snug italic ${isAr ? "text-right" : "text-left"}`}>
                      {title}
                    </h4>
                    <p className={`text-xs md:text-sm text-slate-600 leading-relaxed ${isAr ? "text-right" : "text-left"}`}>
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

