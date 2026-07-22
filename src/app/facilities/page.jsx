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
  { id: 4, icon_name: "Clock", title_bn: "নামাজ, জামাত ও ইসলামী শৃঙ্খলা চর্চা", title_en: "Prayer, Congregation & Islamic Discipline", title_ar: "الصلاة والجماعة والانضباط الإسلامي", description_bn: "শিক্ষার্থীদের দৈনন্দিন জীবনে পাঁচ ওয়াক্ত নামাজ আদায়ের প্রতি অভ্যস্ত করা হয় এবং জামাতে নামাজ আদায়ে বিশেষভাবে উৎসাহিত করা হয়। পাশাপাশি ইসলামী শৃঙ্খলা, নিয়মানুবর্তিতা ও আদব-কায়দা মেনে চলার অভ্যাস গড়ে তোলা হয়। এর মাধ্যমে তাদের মধ্যে দায়িত্ববোধ, আত্মশৃঙ্খলা ও আল্লাহভীতি সুদৃঢ়ভাবে প্রতিষ্ঠিত হয়, যা তাদের চরিত্র গঠনে গুরুত্বপূর্ণ ভূমিকা রাখে।", description_en: "Students are accustomed to performing the five daily prayers in their daily lives and are especially encouraged to pray in congregation. Through this, a sense of responsibility, self-discipline and God-consciousness is firmly established.", description_ar: "يتم تعويد الطلاب على أداء الصلوات الخمس في حياتهم اليومية ويتم تشجيعهم بشكل خاص على أداء الصلاة في جماعة. من خلال ذلك، تترسخ لديهم المسؤولية والانضباط الذاتي والتقوى." },
  { id: 5, icon_name: "Heart", title_bn: "ইসলামিক নৈতিক শিক্ষা ও আদর্শ গঠন", title_en: "Islamic Moral Education & Character Building", title_ar: "التربية الأخلاقية الإسلامية وبناء الشخصية", description_bn: "শিক্ষার্থীদের একাডেমিক শিক্ষার পাশাপাশি কুরআন-সুন্নাহ ভিত্তিক নৈতিক ও আদর্শিক শিক্ষা প্রদান করা হয়। দৈনন্দিন পাঠদানে ইসলামী মূল্যবোধ, আখলাক-আদব, সততা ও মানবিক গুণাবলির উপর বিশেষ গুরুত্ব দেওয়া হয়। এর মাধ্যমে শিক্ষার্থীরা একজন সুশৃঙ্খল, নৈতিকতাসম্পন্ন ও আদর্শ মুসলিম হিসেবে গড়ে উঠতে সক্ষম হয়।", description_en: "In addition to academic education, students are provided with moral and ideological education based on the Quran and Sunnah. Through this, students are able to grow up as disciplined, ethical and ideal Muslims.", description_ar: "إلى جانب التعليم الأكاديمي، يتم تزويد الطلاب بالتربية الأخلاقية والفكرية القائمة على القرآن والسنة. من خلال ذلك، يتمكن الطلاب من النمو كمسلمين منضبطين وأخلاقيين ومثاليين." },
  { id: 6, icon_name: "Users", title_bn: "দক্ষ ও অভিজ্ঞ শিক্ষক মণ্ডলী", title_en: "Skilled & Experienced Teachers", title_ar: "معلمون ماهرون وذوو خبرة", description_bn: "আমাদের শিক্ষক মণ্ডলী শিক্ষার্থীদের শিক্ষা, নৈতিকতা ও চরিত্র গঠনে আন্তরিকভাবে কাজ করেন। তাঁদের অভিজ্ঞতা ও দিকনির্দেশনা শিক্ষার্থীদের সর্বাঙ্গীণ বিকাশে গুরুত্বপূর্ণ ভূমিকা পালন করে।", description_en: "Our teaching staff works sincerely to build students' education, morality and character.", description_ar: "يعمل أعضاء هيئة التدريس لدينا بجد لبناء تعليم الطلاب وأخلاقهم وشخصيتهم." },
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
