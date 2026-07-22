'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const PAGE_CONTENT = {
  bn: {
    title: "ভর্তি সংক্রান্ত তথ্য (Admission Information)",
    backBtn: "হোমে ফিরুন",
    intro: "রহমানিয়া ইনস্টিটিউটে আমরা শিক্ষার্থীদের জন্য একটি সুন্দর ও সুশৃঙ্খল ভর্তি প্রক্রিয়া নিশ্চিত করি। নতুন শিক্ষাবর্ষের ভর্তি কার্যক্রম শুরু হলে নির্দিষ্ট সময়ের মধ্যে আবেদন সম্পন্ন করতে হয়।",
    section1Title: "ভর্তির যোগ্যতা ও নিয়মাবলি",
    rules: [
      {
        title: "১. সাধারণ শর্তাবলি:",
        desc: "শিক্ষার্থীর মানসিক ও শারীরিক সুস্থতা থাকতে হবে। বয়স অনুযায়ী নির্দিষ্ট বিভাগে ভর্তির সুযোগ দেওয়া হবে (যেমন: কিন্ডারগার্টেন ও নূরানী বিভাগের জন্য নির্দিষ্ট বয়সসীমা)।"
      },
      {
        title: "২. ভর্তি পরীক্ষা ও সাক্ষাৎকার:",
        desc: "পূর্ববর্তী শিক্ষাগত যোগ্যতার ভিত্তিতে লিখিত বা মৌখিক পরীক্ষা (সাক্ষাৎকার) নেওয়া হতে পারে। হিফয ও কিতাবখানা বিভাগে ভর্তির জন্য প্রাথমিক যাচাই বাছাই করা হয়।"
      },
      {
        title: "৩. প্রয়োজনীয় কাগজপত্র:",
        desc: "ভর্তির সময় শিক্ষার্থীর জন্মনিবন্ধন বা পাসপোর্টের ফটোকপি জমা দিতে হবে। পিতা-মাতা/অভিভাবকের জাতীয় পরিচয়পত্রের (NID) ফটোকপি। শিক্ষার্থীর ২ কপি পাসপোর্ট সাইজের রঙিন ছবি। পূর্ববর্তী প্রতিষ্ঠানের ছাড়পত্র (প্রযোজ্য ক্ষেত্রে)।"
      },
      {
        title: "৪. আবাসিক সুবিধা:",
        desc: "আবাসিক (Hostel) শিক্ষার্থীদের জন্য মাদরাসার নিয়মকানুন কঠোরভাবে মেনে চলা বাধ্যতামূলক।"
      }
    ],
    section2Title: "ভর্তি প্রক্রিয়া কীভাবে সম্পন্ন করবেন?",
    process: [
      {
        title: "১. অনলাইনে আবেদন:",
        desc: "আপনি চাইলে ঘরে বসেই আমাদের ওয়েবসাইটের মাধ্যমে ভর্তির প্রাথমিক আবেদন সম্পন্ন করতে পারেন।"
      },
      {
        title: "২. সরাসরি অফিসে যোগাযোগ:",
        desc: "মাদরাসা ক্যাম্পাসে এসে ভর্তি ফর্ম সংগ্রহ করে জমা দেওয়া যাবে।"
      }
    ],
    closing: "যেকোনো তথ্যের জন্য আমাদের হেল্পলাইনে যোগাযোগ করতে পারেন।",
    ctaBtn: "ভর্তির জন্য আবেদন করুন"
  },
  en: {
    title: "Admission Information",
    backBtn: "Back to Home",
    intro: "At Rahmania Institute, we ensure a beautiful and disciplined admission process for students. Applications must be completed within the specified time when the admission process for the new academic year begins.",
    section1Title: "Admission Eligibility & Rules",
    rules: [
      {
        title: "1. General Conditions:",
        desc: "The student must be mentally and physically fit. Admission to specific departments will be offered based on age (e.g., specific age limits for Kindergarten and Noorani departments)."
      },
      {
        title: "2. Admission Test & Interview:",
        desc: "A written or oral exam (interview) may be taken based on previous educational qualifications. Preliminary screening is done for admission to Hifz and Kitab Khana departments."
      },
      {
        title: "3. Required Documents:",
        desc: "A photocopy of the student's birth certificate or passport must be submitted during admission. Photocopy of parents/guardian's National ID card (NID). 2 passport size color photographs of the student. Clearance certificate from previous institution (if applicable)."
      },
      {
        title: "4. Residential Facilities:",
        desc: "Strict adherence to the madrasa rules and regulations is mandatory for residential (Hostel) students."
      }
    ],
    section2Title: "How to complete the admission process?",
    process: [
      {
        title: "1. Online Application:",
        desc: "If you wish, you can complete the initial admission application through our website from home."
      },
      {
        title: "2. Direct Office Contact:",
        desc: "You can collect and submit the admission form by coming to the madrasa campus."
      }
    ],
    closing: "You can contact our helpline for any information.",
    ctaBtn: "Apply for Admission"
  },
  ar: {
    title: "معلومات القبول",
    backBtn: "العودة للرئيسية",
    intro: "في معهد الرحمانية، نضمن عملية قبول جميلة ومنضبطة للطلاب. يجب إكمال الطلبات في غضون الوقت المحدد عند بدء عملية القبول للعام الدراسي الجديد.",
    section1Title: "شروط وقواعد القبول",
    rules: [
      {
        title: "1. الشروط العامة:",
        desc: "يجب أن يكون الطالب لائقًا عقليًا وجسديًا. سيتم تقديم القبول في أقسام محددة بناءً على العمر (مثل القيود العمرية المحددة لأقسام الروضة والنوراني)."
      },
      {
        title: "2. اختبار ومقابلة القبول:",
        desc: "قد يتم إجراء اختبار كتابي أو شفهي (مقابلة) بناءً على المؤهلات التعليمية السابقة. يتم إجراء الفرز الأولي للقبول في قسمي الحفظ وكتاب خانة."
      },
      {
        title: "3. المستندات المطلوبة:",
        desc: "يجب تقديم نسخة من شهادة ميلاد الطالب أو جواز سفره أثناء القبول. نسخة من بطاقة الهوية الوطنية (NID) للوالدين/الوصي. صورتان ملونتان بحجم جواز السفر للطالب. شهادة تبرئة من المؤسسة السابقة (إن وجدت)."
      },
      {
        title: "4. المرافق السكنية:",
        desc: "الالتزام الصارم بقواعد وأنظمة المدرسة إلزامي للطلاب المقيمين (السكن الداخلي)."
      }
    ],
    section2Title: "كيف تكمل عملية القبول؟",
    process: [
      {
        title: "1. التقديم عبر الإنترنت:",
        desc: "إذا كنت ترغب في ذلك، يمكنك إكمال طلب القبول الأولي عبر موقعنا الإلكتروني من المنزل."
      },
      {
        title: "2. الاتصال المباشر بالمكتب:",
        desc: "يمكنك استلام وتقديم نموذج القبول من خلال القدوم إلى حرم المدرسة."
      }
    ],
    closing: "يمكنك الاتصال بخط المساعدة الخاص بنا للحصول على أي معلومات.",
    ctaBtn: "تقدم بطلب القبول"
  }
};

export default function AdmissionPage() {
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
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-700 leading-relaxed mb-12"
          >
            {content.intro}
          </motion.p>

          {/* Rules List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 bg-emerald-50/50 rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">{content.section1Title}</h2>
            <div className="space-y-6">
              {content.rules.map((rule, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800 mb-1">{rule.title}</h3>
                    <p className="text-lg text-slate-700">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Process List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">{content.section2Title}</h2>
            <div className="space-y-6 pl-4 sm:pl-6 border-l-2 border-emerald-100">
              {content.process.map((item, idx) => (
                <div key={idx}>
                  <p className="text-lg text-slate-700">
                    <span className="font-bold text-emerald-800 mr-2">{item.title}</span>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Closing & CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center bg-gradient-to-br from-[#0e2e1f] to-[#006400] rounded-2xl p-8 sm:p-10"
          >
            <p className="text-lg sm:text-xl font-medium italic text-emerald-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              {content.closing}
            </p>
            
            <Link 
              href="/admission-choice"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#006400] text-lg font-bold italic rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ring-2 ring-transparent hover:ring-[#D4AF37]/50"
            >
              {content.ctaBtn}
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
