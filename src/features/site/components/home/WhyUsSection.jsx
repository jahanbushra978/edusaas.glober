import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { motion } from "framer-motion";

export default function WhyUsSection() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  // --- Section: "রহমানিয়া ইনস্টিটিউট: আপনার সন্তানের জন্য আদর্শ প্ল্যাটফর্ম" ---
  const objectivesHeading = isBn
    ? "রহমানিয়া ইনস্টিটিউট: আপনার সন্তানের জন্য আদর্শ প্ল্যাটফর্ম"
    : isAr
      ? "معهد الرحمانية: المنصة المثالية لطفلك"
      : "Rahmania Institute: The Ideal Platform for Your Child";

  const FEATURES = [
    {
      num: "০১", numEn: "01", numAr: "٠١",
      title: isBn ? "সমন্বিত পাঠ্যক্রম" : isAr ? "منهج متكامل" : "Integrated Curriculum",
      desc: isBn ? "দ্বীনি ও আধুনিক শিক্ষার এক অপূর্ব সমন্বয় রয়েছে এখানে, যা শিক্ষার্থীদের বর্তমান যুগের সব চ্যালেঞ্জ মোকাবিলা করে আত্মবিশ্বাসী ও সফল হতে সাহায্য করে।" : isAr ? "مزيج رائع من التعليم الديني والحديث يساعد الطلاب على مواجهة تحديات العصر بثقة ونجاح." : "A wonderful blend of religious and modern education that helps students face today's challenges with confidence.",
    },
    {
      num: "০২", numEn: "02", numAr: "٠٢",
      title: isBn ? "হিফযুল কুরআন প্রোগ্রাম" : isAr ? "برنامج تحفيظ القرآن" : "Hifz Quran Program",
      desc: isBn ? "অভিজ্ঞ শিক্ষকদের সরাসরি তত্ত্বাবধানে তাজবিদ ও তারতিলের সাথে কুরআন হিফযের চমৎকার সুব্যবস্থা রয়েছে এখানে—যা এই প্রতিষ্ঠানের শিক্ষার মূল ভিত্তি।" : isAr ? "نظام ممتاز لتحفيظ القرآن الكريم مع التجويد والترتيل تحت إشراف معلمين ذوي خبرة." : "Excellent system for memorizing the Quran with Tajweed under experienced teachers.",
    },
    {
      num: "০৩", numEn: "03", numAr: "٠٣",
      title: isBn ? "ত্রিভাষিক দক্ষতা" : isAr ? "مهارات ثلاثية اللغات" : "Trilingual Proficiency",
      desc: isBn ? "শিক্ষার্থীদের বাংলা, ইংরেজি ও আরবি—এই তিনটি ভাষায় সমান পারদর্শী করে গড়ে তোলা হয়, যাতে তারা বিশ্বমঞ্চে ইসলামি দাওয়াহ ও জ্ঞানচর্চায় অবদান রাখতে পারে।" : isAr ? "تطوير مهارات الطلاب في البنغالية والإنجليزية والعربية ليسهموا في الدعوة الإسلامية عالمياً." : "Students are made equally proficient in Bengali, English, and Arabic.",
    },
    {
      num: "০৪", numEn: "04", numAr: "٠٤",
      title: isBn ? "আধুনিক প্রযুক্তি" : isAr ? "تكنولوجيا حديثة" : "Modern Technology",
      desc: isBn ? "এখানে স্মার্ট ক্লাসরুম ও ডিজিটাল ম্যানেজমেন্ট সিস্টেমের মাধ্যমে আধুনিক পদ্ধতিতে পাঠদান করা হয়। সেই সাথে অভিভাবকদের কাছে নিয়মিত প্রগতি রিপোর্ট পৌঁছে দেওয়া হয়।" : isAr ? "التدريس بالطرق الحديثة باستخدام الفصول الذكية ونظام الإدارة الرقمية مع تقارير منتظمة لأولياء الأمور." : "Teaching through modern methods using smart classrooms and digital management systems.",
    },
    {
      num: "০৫", numEn: "05", numAr: "٠٥",
      title: isBn ? "আখলাক ও চরিত্র গঠন" : isAr ? "تكوين الأخلاق والشخصية" : "Character Building",
      desc: isBn ? "প্রতিটি শিক্ষার্থীর অন্তরে উন্নত নৈতিকতা ও ইসলামি মূল্যবোধ গেঁথে দিয়ে তাদেরকে এক একজন আদর্শ মুসলিম হিসেবে গড়ে তোলে এই প্রতিষ্ঠান।" : isAr ? "غرس الأخلاق العالية والقيم الإسلامية في قلوب الطلاب لتكوين مسلمين مثاليين." : "Instilling high morality and Islamic values to build ideal Muslims.",
    },
    {
      num: "০৬", numEn: "06", numAr: "٠٦",
      title: isBn ? "হালাকা ও নসিহা প্রোগ্রাম" : isAr ? "برنامج الحلقة والنصيحة" : "Halaka & Nasiha Program",
      desc: isBn ? "নিয়মিত হালাকা ও নসিহাহ প্রোগ্রামের মাধ্যমে শিক্ষার্থীদের আদর্শ ও অনুসরণীয় মানুষ হিসেবে গড়ে তোলার চেষ্টা করা হয়। এর মাধ্যমে শিক্ষক ও শিক্ষার্থীর মাঝে এক গভীর আত্মিক ও নৈতিক সেতুবন্ধন তৈরি হয়।" : isAr ? "برامج منتظمة للحلقة والنصيحة تخلق رابطة روحية وأخلاقية عميقة بين المعلمين والطلاب." : "Regular Halaka and Nasiha programs build deep spiritual bonds between teachers and students.",
    },
    {
      num: "০৭", numEn: "07", numAr: "٠٧",
      title: isBn ? "অভিভাবক সভা" : isAr ? "اجتماع أولياء الأمور" : "Parent Meeting",
      desc: isBn ? "ঘর ও মাদরাসার পরিবেশের মধ্যে সুন্দর সমন্বয় বজায় রাখতে অভিভাবকদের জন্য নিয়মিত দ্বীনি ও সচেতনতামূলক প্রোগ্রামের আয়োজন করা হয় এখানে।" : isAr ? "اجتماعات منتظمة لأولياء الأمور للحفاظ على التناسق بين المنزل والمدرسة." : "Regular religious and awareness programs for parents.",
    },
  ];

  return (
    <>
      {/* ══════ Section: রহমানিয়া ইনস্টিটিউট: আপনার সন্তানের জন্য আদর্শ প্ল্যাটফর্ম ══════ */}
      <section className="py-16 overflow-hidden bg-transparent">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold italic mb-3" style={{ color: "#619769" }}>
              {objectivesHeading}
            </h2>
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-emerald-500/50" />
              <div className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-500/50" />
            </motion.div>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className={`group rounded-2xl p-5 cursor-default transition-all duration-300 bg-white border border-[#16A34A]/15 shadow-[0_4px_16px_rgba(0,60,40,0.06)] hover:translate-y-[-6px] hover:shadow-[0_20px_50px_rgba(0,60,40,0.15)] hover:bg-[#eefbf2] hover:border-[#16A34A]/30 touch-manipulation ${isAr ? 'text-right' : ''}`}
                style={{ willChange: "transform, opacity" }}
              >
                <div className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="text-2xl font-extrabold italic flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ color: "rgba(0,100,60,0.30)", lineHeight: 1 }}>
                    {isBn ? f.num : isAr ? f.numAr : f.numEn}
                  </div>
                  <div>
                    <h3 className="font-bold italic text-sm mb-2 transition-colors duration-300 group-hover:text-emerald-700" style={{ color: "#1a3a2a" }}>
                      {f.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
                <div className={`h-0.5 mt-4 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-0 ${isAr ? 'bg-gradient-to-l' : 'bg-gradient-to-r'}`}
                  style={{ backgroundImage: `linear-gradient(${isAr ? '270deg' : '90deg'},#006400,transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
