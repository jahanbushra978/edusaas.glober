import React from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Quote, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function TestimonialsSection({ testimonials: propTestimonials }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const { data: fetchedTestimonials = [] } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: () => appClient.entities.Testimonial.list("-created_at", 50),
    enabled: propTestimonials === undefined,
  });

  const testimonials = propTestimonials || fetchedTestimonials;

  const activeTestimonials = testimonials
    .filter((t) => t.is_active !== false)
    .slice(0, 6);

  if (activeTestimonials.length === 0) return null;

  return (
    <section 
      className="py-16 md:py-24 px-4 overflow-x-hidden transition-all duration-300 bg-transparent" 
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-cyan-50 text-[#0891B2] border border-cyan-100">
            <Quote className={`h-3.5 w-3.5 ${isAr ? "scale-x-[-1]" : ""}`} />
            {isBn ? "অভিভাবক ও শিক্ষার্থীদের মতামত" : isAr ? "آراء وأقوال أولياء الأمور والطلاب" : "Testimonials"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#0891B2] mb-3 leading-tight">
            {isBn ? "রাহমানিয়া সম্পর্কে তারা কী বলেন" : isAr ? "ماذا يقولون عن معهد الرحمانية" : "What They Say About Rahmania"}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activeTestimonials.map((t, idx) => {
            const studentName = t[`student_name_${lang}`] || t[`name_${lang}`] || t.student_name || t.name || "";
            const message = t[`message_${lang}`] || t[`content_${lang}`] || t.message || t.content || "";
            
            return (
              <div
                key={t.id || idx}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group relative overflow-hidden"
                style={{ willChange: "transform" }}
              >
                <div className={`absolute top-0 ${isAr ? "left-0 -translate-x-6" : "right-0 translate-x-6"} w-16 h-16 bg-[#0891B2]/5 -translate-y-6 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:bg-[#0891B2]/10`} />
                <div>
                  {/* Rating */}
                  <div className={`flex gap-1 mb-4 transition-transform duration-300 group-hover:scale-105 origin-left ${isAr ? "justify-start origin-right" : ""}`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  {/* Message */}
                  <p className={`text-xs md:text-sm text-slate-600 leading-relaxed italic mb-6 ${isAr ? "text-right" : "text-left"}`}>
                    "{message}"
                  </p>
                </div>
                
                {/* User info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  {t.photo_url ? (
                    <img src={t.photo_url} loading="lazy" alt={studentName} className="w-10 h-10 rounded-full object-cover border-2 border-[#0891B2]/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center font-bold text-[#0891B2] text-sm border border-cyan-100">
                      {studentName?.[0] || "S"}
                    </div>
                  )}
                  <div className={isAr ? "text-right" : "text-left"}>
                    <h4 className="font-bold text-xs md:text-sm text-slate-800">{studentName}</h4>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
                      {isBn ? "শিক্ষার্থী / অভিভাবক" : isAr ? "طالب / ولي أمر" : "Student / Parent"}
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

