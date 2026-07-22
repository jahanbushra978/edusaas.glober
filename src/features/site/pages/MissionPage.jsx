'use client'
import React from 'react';
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { ArrowLeft, Target, ArrowRight, ShieldCheck, HeartHandshake, Lightbulb, Users, Leaf } from "lucide-react";

export default function MissionPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  const objectives = [
    {
      id: 1,
      title: isBn ? "আধুনিক ও দ্বীনি শিক্ষার অনন্য সমন্বয়" : isAr ? "مزيج فريد من التعليم الحديث والديني" : "Unique Blend of Modern & Religious Education",
      desc: isBn ? "আমাদের প্রধান লক্ষ্য হলো সনাতন দ্বীনি শিক্ষার সাথে আধুনিক সাধারণ শিক্ষার (বিজ্ঞান, প্রযুক্তি ও মানবিক শাখা) একটি চমৎকার সমন্বয় ঘটানো। আমরা বিশ্বাস করি, একজন শিক্ষার্থীকে কেবল একমুখী শিক্ষায় শিক্ষিত না করে, উভয় শিক্ষার আলোয় আলোকিত করা জরুরি।" : isAr ? "هدفنا الرئيسي هو تحقيق مزيج ممتاز بين التعليم الديني التقليدي والتعليم العام الحديث. نؤمن أنه من الضروري تعليم الطالب بنور كلا النوعين من المعرفة." : "Our main goal is to create an excellent blend of traditional religious education with modern general education. We believe in enlightening students with the light of both types of knowledge.",
      icon: Lightbulb
    },
    {
      id: 2,
      title: isBn ? "আদর্শ ও নৈতিকতাসম্পন্ন মানুষ গঠন" : isAr ? "بناء الإنسان المثالي والأخلاقي" : "Building Ideal & Ethical Individuals",
      desc: isBn ? "কেবল পুঁথিগত বিদ্যা অর্জনই যথেষ্ট নয়; বরং একজন শিক্ষার্থীর চরিত্র ও আখলাককে সুন্দর করে গড়ে তোলা আমাদের অন্যতম প্রধান উদ্দেশ্য। সততা, দেশপ্রেম, পরোপকারিতা এবং ধর্মীয় মূল্যবোধের চর্চার মাধ্যমে আমরা প্রতিটি শিক্ষার্থীকে সমাজের আদর্শ নাগরিক হিসেবে গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।" : isAr ? "ليس فقط اكتساب المعرفة النظرية كافياً؛ بل بناء شخصية الطالب وأخلاقه بشكل جميل هو أحد أهدافنا الرئيسية. نحن ملتزمون بتربية كل طالب ليكون مواطناً مثالياً في المجتمع." : "Acquiring bookish knowledge alone is not enough; rather, beautifully building a student's character and morals is one of our main objectives. We are committed to nurturing every student as an ideal citizen of society.",
      icon: ShieldCheck
    },
    {
      id: 3,
      title: isBn ? "উম্মাহর যোগ্য নেতৃত্ব তৈরি" : isAr ? "إعداد قيادة كفوءة للأمة" : "Developing Capable Leadership for the Ummah",
      desc: isBn ? "ভবিষ্যতে মুসলিম উম্মাহ ও দেশের হাল ধরার জন্য সৎ, দক্ষ এবং দূরদর্শী নেতৃত্ব তৈরি করা আমাদের লক্ষ্য। আমাদের শিক্ষার্থীরা যেন যেকোনো চ্যালেঞ্জ মোকাবেলা করে সমাজে ইতিবাচক অবদান রাখতে পারে, আমরা তাদের সেভাবেই প্রস্তুত করি।" : isAr ? "هدفنا إعداد قيادة صادقة وماهرة وبعيدة النظر لقيادة الأمة الإسلامية والبلاد في المستقبل. نعد طلابنا لمواجهة أي تحدٍ والمساهمة إيجابياً في المجتمع." : "Our goal is to create honest, skilled and visionary leadership to steer the Muslim Ummah and the country in the future. We prepare our students to face any challenge and contribute positively to society.",
      icon: Users
    },
    {
      id: 4,
      title: isBn ? "প্রযুক্তি ও আধুনিক বিশ্বে পারদর্শিতা" : isAr ? "الإتقان في التكنولوجيا والعالم الحديث" : "Proficiency in Technology & the Modern World",
      desc: isBn ? "বর্তমান তথ্যপ্রযুক্তির যুগে আমাদের শিক্ষার্থীরা যেন পিছিয়ে না পড়ে, সেজন্য তাদের আধুনিক বিজ্ঞান ও প্রযুক্তি শিক্ষায় দক্ষ করে তোলা আমাদের অন্যতম উদ্দেশ্য। যাতে তারা নৈতিকতা বজায় রেখে আধুনিক জ্ঞানকে মানবতার কল্যাণে ব্যবহার করতে পারে।" : isAr ? "في عصر تكنولوجيا المعلومات الحالي، نهدف إلى جعل طلابنا ماهرين في العلوم والتكنولوجيا الحديثة حتى لا يتخلفوا عن الركب، حتى يتمكنوا من استخدام المعرفة الحديثة لخدمة الإنسانية مع الحفاظ على الأخلاق." : "In the current information technology age, we aim to make our students skilled in modern science and technology so they do not fall behind, and can use modern knowledge for the benefit of humanity while maintaining ethics.",
      icon: Target
    },
    {
      id: 5,
      title: isBn ? "আত্মশুদ্ধি ও তাকওয়া অর্জন" : isAr ? "تحقيق التزكية الروحية والتقوى" : "Attaining Self-Purification & Taqwa",
      desc: isBn ? "শিক্ষার্থীদের মনস্তাত্ত্বিক ও আধ্যাত্মিক বিকাশ ঘটানো আমাদের শিক্ষার অন্যতম মূল লক্ষ্য। প্রতিটি শিক্ষার্থীর হৃদয়ে আল্লাহভীতি বা তাকওয়া সৃষ্টি করা, যাতে তারা ব্যক্তিগত ও কর্মজীবনে সর্বদা সঠিক ও ন্যায়ের পথে চলতে পারে।" : isAr ? "التطور النفسي والروحي للطلاب هو أحد الأهداف الأساسية لتعليمنا. غرس تقوى الله في قلب كل طالب حتى يسلكوا طريق الحق في حياتهم الشخصية والمهنية." : "The psychological and spiritual development of students is one of the core goals of our education. Instilling God-consciousness in every student's heart so they always walk the path of truth in their personal and professional lives.",
      icon: Leaf
    },
    {
      id: 6,
      title: isBn ? "সমাজ সংস্কার ও মানবকল্যাণ" : isAr ? "إصلاح المجتمع ورفاهية الإنسان" : "Social Reform & Human Welfare",
      desc: isBn ? "আমাদের উদ্দেশ্য এমন একদল তরুণ তৈরি করা, যারা শুধু নিজেদের ক্যারিয়ার নিয়েই ভাববে না; বরং সমাজ থেকে অন্যায়, অশিক্ষা ও অনৈতিকতা দূর করতে অগ্রণী ভূমিকা পালন করবে এবং মানবকল্যাণে নিজেদের নিয়োজিত রাখবে।" : isAr ? "هدفنا هو خلق مجموعة من الشباب الذين لا يفكرون فقط في حياتهم المهنية؛ بل يلعبون دوراً رائداً في القضاء على الظلم والأمية والفساد الأخلاقي من المجتمع ويكرسون أنفسهم لرفاهية الإنسان." : "Our objective is to create a group of young people who will not only think about their own careers but will play a leading role in eliminating injustice, illiteracy and immorality from society, and dedicate themselves to human welfare.",
      icon: HeartHandshake
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 py-16 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`mb-12 ${isAr ? 'text-right' : ''}`}>
          <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold italic text-emerald-700 hover:text-emerald-800 transition-all ${isAr ? 'flex-row-reverse' : ''}`}>
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common?.backHome || "Back to Home"}
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
            {isBn ? "আমাদের লক্ষ্য" : isAr ? "مهمتنا" : "Our Mission"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold italic text-slate-900 mb-4">
            {isBn ? "আমাদের লক্ষ্য ও উদ্দেশ্য" : isAr ? "مهمتنا ورؤيتنا" : "Our Mission & Vision"}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-emerald-100" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <div className="h-px w-24 bg-emerald-100" />
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }} className="bg-white rounded-[40px] shadow-sm p-8 sm:p-12 border border-slate-100">
          <p className="text-lg text-slate-700 italic leading-relaxed text-center max-w-3xl mx-auto mb-16">
            {isBn
              ? "রহমানিয়া ইনস্টিটিউট-এর পথচলার মূল চালিকাশক্তি হলো একটি নৈতিক, যুগোপযোগী এবং আদর্শ সমাজ গঠন। শিক্ষার্থীদের ইহকালীন সফলতা এবং পরকালীন মুক্তির পথ সুগম করার লক্ষ্যে আমাদের সুনির্দিষ্ট কিছু লক্ষ্য ও উদ্দেশ্য রয়েছে:"
              : isAr
              ? "القوة الدافعة الرئيسية وراء مسيرة معهد الرحمانية هي بناء مجتمع أخلاقي ومعاصر ومثالي. لدينا أهداف وغايات محددة لتمهيد طريق النجاح في الدنيا والخلاص في الآخرة لطلابنا:"
              : "The main driving force behind Rahmania Institute's journey is building an ethical, contemporary, and ideal society. We have specific goals and objectives to pave the way for students' success in this world and salvation in the Hereafter:"}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {objectives.map((obj) => (
              <div key={obj.id} className="bg-emerald-50/30 border border-emerald-100/50 p-8 rounded-3xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <obj.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold italic text-slate-900 flex-1">{obj.id}. {obj.title}</h3>
                </div>
                <p className="text-slate-600 italic leading-relaxed text-sm">
                  {obj.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center relative overflow-hidden">
             <h3 className="text-xl font-bold italic text-emerald-900 mb-4">{isBn ? "উপসংহার:" : isAr ? "الخلاصة:" : "Conclusion:"}</h3>
             <p className="text-slate-700 italic leading-relaxed relative z-10">
                {isBn
                  ? 'সংক্ষেপে, রহমানিয়া ইনস্টিটিউট-এর মূল উদ্দেশ্য হলো—"ইলম (জ্ঞান), আখলাক (চরিত্র) এবং তাকওয়া (আল্লাহভীতি)"-র সমন্বয়ে এমন একটি প্রজন্ম গড়ে তোলা, যারা দুনিয়া ও আখেরাত উভয় জগতেই সফলকাম হবে।'
                  : isAr
                  ? 'باختصار، الهدف الأساسي لمعهد الرحمانية هو بناء جيل يجمع بين "العلم، والأخلاق، والتقوى" — جيل ناجح في الدنيا والآخرة.'
                  : 'In short, the core objective of Rahmania Institute is to build a generation combining "Ilm (Knowledge), Akhlaq (Character), and Taqwa (God-Consciousness)" — a generation that will succeed in both this world and the Hereafter.'}
             </p>
          </div>

          <div className="mt-16 flex flex-col items-center">
            <Link href="/admission-choice" className="group inline-flex items-center gap-4 bg-emerald-700 text-white px-10 py-5 rounded-2xl font-bold italic shadow-xl hover:bg-emerald-800 hover:-translate-y-1 transition-all animate-bounce">
              {isBn ? "ভর্তির জন্য আবেদন করুন" : isAr ? "قدم الآن للقبول" : "Apply for Admission"}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''} group-hover:translate-x-2 transition-transform`} />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

