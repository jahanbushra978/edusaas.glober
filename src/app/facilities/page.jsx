"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

const FALLBACK_FACILITIES = [
  { id: 1, icon_name: "Home", title_bn: "আবাসিক হোস্টেল", title_en: "Residential Hostel", title_ar: "السكن الداخلي", description_bn: "দূরবর্তী এলাকার শিক্ষার্থীদের জন্য নিরাপদ, পরিচ্ছন্ন ও সুশৃঙ্খল আবাসিক ব্যবস্থা রয়েছে। অভিজ্ঞ তত্ত্বাবধায়কদের সার্বক্ষণিক নজরদারির পাশাপাশি শিক্ষার্থীদের জন্য পুষ্টিকর খাবার, আরামদায়ক থাকার পরিবেশ এবং নিয়মিত পড়াশোনার উপযুক্ত সুযোগ নিশ্চিত করা হয়।", description_en: "Safe, clean and well-disciplined residential accommodation is available for students from distant areas.", description_ar: "يتوفر سكن آمن ونظيف ومنضبط للطلاب القادمين من المناطق البعيدة." },
  { id: 2, icon_name: "Zap", title_bn: "সার্বক্ষণিক জেনারেটর সুবিধা", title_en: "24/7 Generator Facility", title_ar: "مولد كهربائي على مدار الساعة", description_bn: "বিদ্যুৎ বিভ্রাটের সময়ও শিক্ষার্থীদের পড়াশোনা ও দৈনন্দিন কার্যক্রম নির্বিঘ্ন রাখতে জেনারেটর সুবিধা রয়েছে। ফলে ক্লাস, অধ্যয়ন ও অন্যান্য কার্যক্রমে কোনো ধরনের বিঘ্ন ঘটে না।", description_en: "Generator facility is available to keep students' studies uninterrupted during power outages.", description_ar: "تتوفر خدمة المولد الكهربائي للحفاظ على دراسة الطلاب دون انقطاع أثناء انقطاع التيار." },
  { id: 3, icon_name: "School", title_bn: "আধুনিক ও সুসজ্জিত শ্রেণিকক্ষ", title_en: "Modern & Well-Equipped Classrooms", title_ar: "فصول دراسية حديثة ومجهزة", description_bn: "শিক্ষার্থীদের মনোযোগী ও কার্যকর শিক্ষার জন্য প্রশস্ত, পরিচ্ছন্ন ও আরামদায়ক শ্রেণিকক্ষের ব্যবস্থা রয়েছে। শিক্ষাবান্ধব পরিবেশ শিক্ষার্থীদের জ্ঞানার্জনে আরও উৎসাহিত করে।", description_en: "Spacious, clean and comfortable classrooms are arranged for focused and effective learning.", description_ar: "تم ترتيب فصول دراسية واسعة ونظيفة ومريحة للتعلم المركز والفعال." },
  { id: 4, icon_name: "Droplet", title_bn: "বিশুদ্ধ পানির ব্যবস্থা", title_en: "Pure Water Facility", title_ar: "توفير المياه النظيفة", description_bn: "শিক্ষার্থীদের সুস্বাস্থ্য নিশ্চিত করতে সার্বক্ষণিক নিরাপদ ও বিশুদ্ধ পানির ব্যবস্থা রয়েছে।", description_en: "Round-the-clock safe and pure drinking water facility is available to ensure the good health of students.", description_ar: "تتوفر مياه الشرب النظيفة والآمنة على مدار الساعة لضمان صحة الطلاب الجيدة." },
  { id: 5, icon_name: "Trophy", title_bn: "খেলাধুলা ও বিনোদনের ব্যবস্থা", title_en: "Sports & Entertainment Facilities", title_ar: "مرافق الرياضة والترفيه", description_bn: "শিক্ষার্থীদের শারীরিক সুস্থতা ও মানসিক বিকাশে পর্যাপ্ত খেলাধুলা এবং বিনোদনের সুযোগ নিশ্চিত করা হয়েছে। শিক্ষার্থীদের শারীরিক সক্ষমতা, নেতৃত্বের গুণাবলি ও দলগত চেতনা বিকাশে নিয়মিত সাপ্তাহিক ও মাসিক ক্রীড়া প্রতিযোগিতা ও বিভিন্ন খেলাধুলার আয়োজন করা হয়।", description_en: "Adequate opportunities for sports and recreation are ensured for physical fitness and mental development of students. Regular weekly and monthly sports competitions are organized to develop physical capabilities, leadership qualities, and team spirit.", description_ar: "تم ضمان فرص كافية للرياضة والترفيه للياقة البدنية والتنمية العقلية للطلاب. يتم تنظيم مسابقات رياضية أسبوعية وشهرية بانتظام لتطوير القدرات البدنية وروح القيادة والعمل الجماعي." },
  { id: 6, icon_name: "Building", title_bn: "এক্সিকিউティブ আবাসিক সেকশন", title_en: "Executive Residential Section", title_ar: "قسم السكن التنفيذي", description_bn: "সামর্থ্যবান অভিভাবকদের চাহিদার কথা বিবেচনা করে শিক্ষার্থীদের জন্য উন্নতমানের এক্সিকিউティブ আবাসিক সেকশনের ব্যবস্থা রয়েছে। এখানে আরামদায়ক খাট, শীতাতপ নিয়ন্ত্রিত (এসি) কক্ষ এবং আধুনিক ওয়াশিং মেশিনের মাধ্যমে কাপড় ধোয়ার সুবিধাসহ একটি পরিচ্ছন্ন, নিরাপদ ও আরামদায়ক আবাসিক পরিবেশ নিশ্চিত করা হয়।", description_en: "Considering the demands of affluent guardians, high-quality executive residential arrangements are available. A clean, safe, and comfortable living environment is ensured with comfortable beds, air-conditioned (AC) rooms, and modern washing machine laundry facilities.", description_ar: "بالنظر إلى متطلبات أولياء الأمور الميسورين، تتوفر ترتيبات سكنية تنفيذية راقية. يتم ضمان بيئة معيشية نظيفة وآمنة ومريحة مع أسرة مريحة، وغرف مجهزة بالتكييف (AC)، وتسهيلات غسيل الملابس الغسالات الحديثة." },
  { id: 7, icon_name: "Utensils", title_bn: "স্বাস্থ্যসম্মত খাবারের ব্যবস্থা", title_en: "Healthy Food Arrangements", title_ar: "ترتيبات الطعام الصحي", description_bn: "শিক্ষার্থীদের সুস্বাস্থ্য নিশ্চিত করতে পরিচ্ছন্ন ও পুষ্টিকর খাবার পরিবেশন করা হয়। খাবারের মান ও স্বাস্থ্যবিধির প্রতি সর্বদা বিশেষ গুরুত্ব দেওয়া হয়।", description_en: "Clean and nutritious food is served to ensure the good health of students.", description_ar: "يتم تقديم طعام نظيف ومغذي لضمان صحة الطلاب الجيدة." },
  { id: 8, icon_name: "Shield", title_bn: "নিরাপদ ও সুরক্ষিত পরিবেশ", title_en: "Safe & Secure Environment", title_ar: "بيئة آمنة ومأمونة", description_bn: "শিক্ষার্থীদের নিরাপত্তা ও মানসিক স্বাচ্ছন্দ্য নিশ্চিত করতে সার্বক্ষণিক তত্ত্বাবধান ও সুশৃঙ্খল পরিবেশ বজায় রাখা হয়, যাতে তারা নিশ্চিন্তে শিক্ষা অর্জন করতে পারে।", description_en: "Round-the-clock supervision and a disciplined environment are maintained to ensure student safety.", description_ar: "يتم الحفاظ على الإشراف على مدار الساعة وبيئة منضبطة لضمان سلامة الطلاب." },
  { id: 9, icon_name: "TreePine", title_bn: "মনোরম ও শিক্ষাবান্ধব ক্যাম্পাস", title_en: "Pleasant & Education-Friendly Campus", title_ar: "حرم جامعي ممتع وصديق للتعليم", description_bn: "প্রাকৃতিক ও খোলামেলা পরিবেশে অবস্থিত ক্যাম্পাস শিক্ষার্থীদের জন্য একটি শান্ত, সুন্দর ও অনুপ্রেরণামূলক শিক্ষার পরিবেশ সৃষ্টি করে, যা তাদের মানসিক ও বুদ্ধিবৃত্তিক বিকাশে সহায়তা করে।", description_en: "Located in a natural and open environment, the campus creates a peaceful and inspiring educational environment.", description_ar: "يقع الحرم الجامعي في بيئة طبيعية ومفتوحة، ويخلق بيئة تعليمية هادئة وملهمة للطلاب." },
];

export default function FacilitiesPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const { data: apiFacilities = [] } = useQuery({
    queryKey: ["facilities-public-page"],
    queryFn: () => appClient.entities.Facility.list("sort_order", 100),
    select: d => d.filter(f => f.is_active !== false),
  });

  const facilities = apiFacilities.length > 0 ? apiFacilities : FALLBACK_FACILITIES;

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-widest"
              style={{ background: "rgba(0,100,60,0.08)", border: "1px solid rgba(0,100,60,0.2)", color: "#006400" }}>
              {isBn ? "সুযোগ-সুবিধা" : isAr ? "المرافق" : "Facilities"}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold italic text-slate-900 mb-6 tracking-tight">
              {t.facilities?.title || (isBn ? "আমাদের সুযোগ-সুবিধাসমূহ" : isAr ? "مرافقنا" : "Our Facilities")}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto italic leading-relaxed">
              {t.facilities?.subtitle || (isBn ? "শিক্ষার্থীদের জন্য আমরা সর্বোচ্চ মানের সুযোগ-সুবিধা নিশ্চিত করি।" : isAr ? "نحن نضمن مرافق عالية الجودة للطلاب." : "We ensure top-quality facilities for our students.")}
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {facilities.map((f, i) => {
              const IconComponent = f.icon_name && Icons[f.icon_name] ? Icons[f.icon_name] : Icons.CheckCircle;
              const title = isBn ? (f.title_bn || f.title_en) : isAr ? (f.title_ar || f.title_en) : f.title_en;
              const desc = isBn ? (f.description_bn || f.description_en) : isAr ? (f.description_ar || f.description_en) : f.description_en;
              
              return (
                <motion.div 
                  key={f.id} 
                  variants={fadeUp}
                  className={`bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 group flex flex-col ${isAr ? 'text-right' : ''}`}
                >
                  {f.image_url && (
                    <div className="w-full h-48 relative overflow-hidden bg-slate-100">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                      <img 
                        src={f.image_url} 
                        alt={title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className={`absolute bottom-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ${isAr ? 'right-4' : 'left-4'}`}>
                        <IconComponent className="h-6 w-6 text-[#006400]" />
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {!f.image_url && (
                      <div className={`w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50 ${isAr ? 'ml-auto' : ''}`}>
                        <IconComponent className="h-7 w-7 text-[#006400]" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold italic text-slate-800 mb-3">{title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6 flex-1">{desc}</p>
                    
                    <div className="mt-auto">
                      <div className="h-px w-full bg-slate-100 mb-4" />
                      <div className={`flex items-center gap-2 text-sm font-semibold italic text-[#006400] ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span>{isBn ? "আরও জানুন" : isAr ? "أعرف أكثر" : "Learn More"}</span>
                        <Icons.ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
