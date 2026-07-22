import React from "react";
import { Home, School } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { motion } from "framer-motion";

export default function FacilitiesSection() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";

  const FACILITIES = [
    {
      icon: Home,
      title: t.facilities.hostelTitle,
      desc: t.facilities.hostelDesc,
      color: "#9933cc",
      bg: "rgba(153,51,204,0.06)",
    },
    {
      icon: School,
      title: t.facilities.classroomTitle,
      desc: t.facilities.classroomDesc,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.06)",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section id="facilities-section" className="py-16 scroll-mt-24 overflow-x-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl sm:text-4xl font-extrabold italic text-[#006400] mb-3 tracking-tight ${isAr ? 'text-right md:text-center' : ''}`}>
            {t.facilities.badge}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-blue-500/50" />
            <div className="w-2 h-2 rounded-full bg-[#006400]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-blue-500/50" />
          </div>
          <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto italic">
            {t.facilities.subtitle}
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {FACILITIES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} variants={itemVariants} className={`rounded-2xl p-6 flex gap-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 group ${isAr ? 'flex-row-reverse text-right' : ''}`}
                style={{ background: "#ffffff", border: "1px solid rgba(37,99,235,0.12)", boxShadow: "0 6px 20px rgba(37,99,235,0.06)", willChange: "transform, opacity" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: f.bg, border: `1.5px solid ${f.color}30` }}>
                  <Icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-bold italic text-slate-800 text-base mb-2 group-hover:text-[#006400] transition-colors duration-300">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link href="/facilities" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold italic text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#006400,#1D4ED8)", border: "1.5px solid rgba(37,99,235,0.35)" }}>
            {t.facilities.viewAll}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


