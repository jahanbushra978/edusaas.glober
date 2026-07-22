import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function FaqsSection({ faqs: propFaqs }) {
  const { lang } = useLanguage();
  const isBn = lang === "bn";
  const isAr = lang === "ar";
  const [openIndex, setOpenIndex] = useState(null);

  const { data: fetchedFaqs = [] } = useQuery({
    queryKey: ["faqs-public"],
    queryFn: () => appClient.entities.Faq.list("sort_order", 50),
    enabled: propFaqs === undefined,
  });

  const faqs = propFaqs || fetchedFaqs;

  const activeFaqs = faqs.filter((f) => f.is_active !== false);

  if (activeFaqs.length === 0) return null;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="py-16 md:py-24 px-4 overflow-x-hidden transition-all duration-300 bg-transparent"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-widest bg-sky-50 text-[#0EA5E9] border border-sky-100">
            <HelpCircle className="h-3.5 w-3.5" />
            {isBn ? "সাধারণ জিজ্ঞাসা (FAQ)" : isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#0EA5E9] mb-3 leading-tight">
            {isBn ? "সচরাচর জিজ্ঞাসা ও উত্তর" : isAr ? "الأسئلة الشائعة والأجوبة" : "Common Questions & Answers"}
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {isBn 
              ? "ভর্তি, ক্লাস এবং অন্যান্য মাদ্রাসার নিয়মাবলী সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্নের উত্তর খুঁজুন।" 
              : isAr 
              ? "ابحث عن إجابات للأسئلة الشائعة حول شروط القبول والفصول الدراسية والإجراءات الأخرى في المعهد." 
              : "Get answers to frequently asked questions about admissions, classes, and other madrasah procedures"}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {activeFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const question = faq[`question_${lang}`] || faq.question || "";
            const answer = faq[`answer_${lang}`] || faq.answer || "";
            
            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="group w-full px-6 py-5 flex items-center justify-between text-start font-bold text-sm md:text-base text-slate-800 hover:bg-slate-50/50 transition-colors"
                >
                  <span className={`italic transition-transform duration-300 ${isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>{question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-[#0EA5E9] transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#0EA5E9]" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-50 text-start">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

