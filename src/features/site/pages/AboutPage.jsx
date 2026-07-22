'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowLeft } from 'lucide-react';

const PAGE_CONTENT = {
  bn: {
    title: "আমাদের পরিচিতি",
    backBtn: "হোমে ফিরুন",
    introPara1: "রহমানিয়া ইনস্টিটিউট কেবল একটি গতানুগতিক শিক্ষাপ্রতিষ্ঠান নয়; এটি একটি আলোকিত প্রজন্ম ও আদর্শ মানুষ গড়ার নির্ভরযোগ্য প্রতিষ্ঠান। আধুনিক বিশ্বের দ্রুত পরিবর্তনশীল চ্যালেঞ্জ মোকাবেলায় যুগোপযোগী আধুনিক শিক্ষার সাথে ইসলামী মূল্যবোধের এক অনন্য সমন্বয় ঘটিয়েছি আমরা।",
    introPara2: "আমাদের পথচলা শুরু হয়েছিল একদল নিবেদিতপ্রাণ শিক্ষানুরাগীর হাত ধরে, যাদের স্বপ্ন ছিল এমন একটি বিদ্যাপীঠ প্রতিষ্ঠা করা—যেখানে শিক্ষার্থীরা জাগতিক জ্ঞানে দক্ষ হওয়ার পাশাপাশি দ্বীনি শিক্ষায়ও সমানভাবে আলোকিত হবে।",
    philosophyTitle: "আমাদের মূল দর্শন ও মূল্যবোধ",
    philosophySubtitle: "\"ইলম, আখলাক এবং তাকওয়া\"—এই তিনটি স্তম্ভের ওপর ভিত্তি করে আমাদের শিক্ষাব্যবস্থা পরিচালিত হয়।",
    values: [
      {
        title: "ইলম (জ্ঞান):",
        desc: "আমরা বিশ্বাস করি, \"জ্ঞান সেই আলো যা সৎ মানুষের পথ দেখায়।\""
      },
      {
        title: "আখলাক (চরিত্র):",
        desc: "সততা, দায়িত্বশীলতা এবং পরোপকারিতা আমাদের প্রতিটি শিক্ষার্থীর চরিত্রের অবিচ্ছেদ্য অংশ হিসেবে গড়ে তোলা হয়।"
      },
      {
        title: "তাকওয়া (আল্লাহভীতি):",
        desc: "নৈতিক স্খলন থেকে দূরে রেখে শিক্ষার্থীদের আত্মশুদ্ধির পথে পরিচালিত করা হয়।"
      }
    ],
    whyChooseTitle: "কেন রহমানিয়া ইনস্টিটিউট বেছে নেবেন?",
    reasons: [
      "আধুনিক ও দ্বীনি শিক্ষার চমৎকার ও যুগোপযোগী সমন্বয়।",
      "উম্মাহর ভবিষ্যৎ আলেম ও সৎ নেতৃত্ব গড়ে তোলার সুনির্দিষ্ট রূপরেখা।",
      "শিক্ষার্থীদের নৈতিকতা এবং উন্নত চরিত্র গঠনে বিশেষ নজরদারি।",
      "অভিজ্ঞ, দক্ষ এবং নিবেদিতপ্রাণ শিক্ষকমণ্ডলী।"
    ],
    closingQuote: "\"উম্মাহর ভবিষ্যৎ আলেম ও নেতৃবৃন্দ গড়ে তোলা — ঈমানের শিকড়ে, জ্ঞানের আলোয়।\"",
    closingDesc: "এই স্লোগানকে বুকে ধারণ করে রহমানিয়া ইনস্টিটিউট আপনার সন্তানের একটি সুন্দর ও আলোকিত ভবিষ্যৎ গড়তে অঙ্গীকারবদ্ধ।"
  },
  en: {
    title: "About Us",
    backBtn: "Back to Home",
    introPara1: "Rahmania Institute is not just a traditional educational institution; it is a reliable institution for building an enlightened generation and ideal human beings. We have created a unique combination of contemporary modern education and Islamic values to meet the fast-changing challenges of the modern world.",
    introPara2: "Our journey began with a group of dedicated education enthusiasts whose dream was to establish a school where students would be skilled in worldly knowledge and equally enlightened in religious education.",
    philosophyTitle: "Our Core Philosophy & Values",
    philosophySubtitle: "\"Ilm, Akhlaq and Taqwa\"—our education system is operated on the basis of these three pillars.",
    values: [
      {
        title: "Ilm (Knowledge):",
        desc: "We believe, \"Knowledge is that light which guides good people.\""
      },
      {
        title: "Akhlaq (Character):",
        desc: "Honesty, responsibility, and benevolence are built as an integral part of each student's character."
      },
      {
        title: "Taqwa (Fear of Allah):",
        desc: "Students are guided on the path of self-purification, keeping them away from moral degradation."
      }
    ],
    whyChooseTitle: "Why Choose Rahmania Institute?",
    reasons: [
      "Excellent and timely combination of modern and religious education.",
      "Specific roadmap for building future scholars and honest leadership for the Ummah.",
      "Special supervision in building morality and good character in students.",
      "Experienced, skilled, and dedicated teachers."
    ],
    closingQuote: "\"Building future scholars and leaders of the Ummah — in the roots of faith, in the light of knowledge.\"",
    closingDesc: "Holding this slogan in heart, Rahmania Institute is committed to building a beautiful and enlightened future for your child."
  },
  ar: {
    title: "من نحن",
    backBtn: "العودة للرئيسية",
    introPara1: "معهد الرحمانية ليس مجرد مؤسسة تعليمية تقليدية؛ بل هو مؤسسة موثوقة لبناء جيل مستنير وبشر مثاليين. لقد حققنا توليفة فريدة من التعليم الحديث المعاصر والقيم الإسلامية لمواجهة التحديات المتغيرة بسرعة في العالم الحديث.",
    introPara2: "بدأت رحلتنا مع مجموعة من محبي التعليم المخلصين الذين كان حلمهم إنشاء مدرسة يكون فيها الطلاب ماهرين في المعرفة الدنيوية ومتنورين بالتساوي في التعليم الديني.",
    philosophyTitle: "فلسفتنا وقيمنا الأساسية",
    philosophySubtitle: "\"العلم والأخلاق والتقوى\" - نظامنا التعليمي يقوم على هذه الركائز الثلاث.",
    values: [
      {
        title: "العلم (المعرفة):",
        desc: "نحن نؤمن بأن \"العلم هو النور الذي يرشد الأخيار\"."
      },
      {
        title: "الأخلاق (الخلق):",
        desc: "يتم بناء الصدق والمسؤولية وحب الخير كجزء لا يتجزأ من شخصية كل طالب من طلابنا."
      },
      {
        title: "التقوى (خشية الله):",
        desc: "يتم توجيه الطلاب على طريق تزكية النفس وإبعادهم عن الانحطاط الأخلاقي."
      }
    ],
    whyChooseTitle: "لماذا تختار معهد الرحمانية؟",
    reasons: [
      "دمج ممتاز ومناسب للوقت بين التعليم الحديث والديني.",
      "خريطة طريق محددة لبناء علماء المستقبل وقيادة صادقة للأمة.",
      "إشراف خاص في بناء الأخلاق والسمات النبيلة لدى الطلاب.",
      "أعضاء هيئة تدريس ذوو خبرة ومهارة وتفانٍ."
    ],
    closingQuote: "\"بناء علماء وقادة الأمة المستقبليين - في جذور الإيمان، في نور العلم.\"",
    closingDesc: "متمسكًا بهذا الشعار، يلتزم معهد الرحمانية ببناء مستقبل جميل ومشرق لطفلك."
  }
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const currentLang = PAGE_CONTENT[lang] ? lang : 'bn';
  const content = PAGE_CONTENT[currentLang];
  const isAr = currentLang === 'ar';

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${isAr ? 'direction-rtl text-right' : ''}`}>
      {/* Back Link */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-sm font-bold italic text-emerald-700 hover:text-emerald-800 transition-all ${isAr ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {content.backBtn}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12"
        >
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold italic text-emerald-950 mb-4">
              {content.title}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-emerald-100" />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-emerald-100" />
            </div>
          </div>

          {/* Intro */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <p className="text-lg text-slate-700 leading-relaxed">
              {content.introPara1}
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              {content.introPara2}
            </p>
          </motion.div>

          {/* Philosophy & Values */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">{content.philosophyTitle}</h2>
            <p className="text-lg font-medium text-slate-800 mb-6">{content.philosophySubtitle}</p>
            <div className="space-y-4 pl-4 sm:pl-6 border-l-2 border-emerald-100">
              {content.values.map((val, idx) => (
                <div key={idx}>
                  <p className="text-lg text-slate-700">
                    <span className="font-bold text-emerald-800 mr-2">{val.title}</span>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why Choose Us */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 bg-emerald-50/50 rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">{content.whyChooseTitle}</h2>
            <ul className="space-y-4">
              {content.reasons.map((reason, idx) => (
                <li key={idx} className={`flex items-start gap-3 text-lg text-slate-700 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-emerald-600 mt-1 text-xl">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Closing */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center bg-gradient-to-br from-[#0e2e1f] to-[#006400] rounded-2xl p-8 sm:p-10"
          >
            <p className="text-xl sm:text-2xl font-bold italic text-white mb-6 leading-relaxed">
              {content.closingQuote}
            </p>
            <p className="text-lg text-emerald-100/90 leading-relaxed">
              {content.closingDesc}
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
