'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowLeft, Building2, Phone, MapPin } from 'lucide-react';

export default function CampusPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => appClient.entities.Branch.list('sort_order', 100),
    select: (data) => data.filter((b) => b.is_active !== false),
  });

  const getName = (branch) => {
    if (lang === 'bn') return branch.name_bn || branch.name_en || branch.name_ar || '';
    if (lang === 'ar') return branch.name_ar || branch.name_bn || branch.name_en || '';
    return branch.name_en || branch.name_bn || branch.name_ar || '';
  };

  const getAddress = (branch) => {
    if (lang === 'bn') return branch.address_bn || branch.address_en || branch.address_ar || '';
    if (lang === 'ar') return branch.address_ar || branch.address_bn || branch.address_en || '';
    return branch.address_en || branch.address_bn || branch.address_ar || '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className={`min-h-screen ${isAr ? 'direction-rtl' : ''}`} style={{ background: "linear-gradient(to bottom, #02140e 0%, #052e2b 50%, #010f0a 100%)" }}>
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-sm font-bold transition-all duration-300 hover:text-white ${isAr ? 'flex-row-reverse' : ''}`}
          style={{ color: "#4afa9a" }}
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {lang === 'bn' ? 'হোমে ফিরুন' : isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>

      {/* Page Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 pt-12 pb-2 text-center"
      >
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
          {lang === 'bn' ? 'নিকটস্থ শাখা খুঁজে নিন' : isAr ? 'ابحث عن أقرب فرع' : 'Find the Nearest Branch'}
        </h1>
        <p className="text-sm sm:text-base text-yellow-400/90 max-w-xl mx-auto font-bold mt-2 leading-relaxed tracking-wide">
          {lang === 'bn' 
            ? 'বিস্তারিত দেখতে নিচে আপনার নিকটস্থ শাখাটি নির্বাচন করুন।' 
            : isAr 
            ? 'يرجى اختيار الفرع الأقرب إليك أدناه لعرض التفاصيل.' 
            : 'Please select your nearest branch below to view details.'}
        </p>
        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-20 bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
          <div className="h-px w-20 bg-yellow-500/20" />
        </div>
      </motion.div>

      {/* Branch Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="mt-4 text-white/50 text-sm">
              {lang === 'bn' ? 'লোড হচ্ছে...' : isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">
              {lang === 'bn' ? 'কোনো শাখা পাওয়া যায়নি।' : isAr ? 'لم يتم العثور على فروع.' : 'No branches found.'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {branches.map((branch, idx) => {
              const validSlug = branch.slug && branch.slug !== "-" ? branch.slug : branch.id;
              return (
                <Link href={`/branch/${encodeURIComponent(validSlug)}`} key={branch.id || idx} className="block cursor-pointer">
                  <motion.div
                    variants={cardVariants}
                    className="group rounded-3xl border shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col justify-between"
                    style={{
                      background: "rgba(5, 46, 43, 0.45)",
                      borderColor: "rgba(212, 175, 55, 0.22)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6), 0 0 15px rgba(212,175,55,0.05)",
                      transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                      e.currentTarget.style.background = "rgba(5, 46, 43, 0.7)";
                      e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.65)";
                      e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.7), 0 0 25px rgba(212,175,55,0.22)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.background = "rgba(5, 46, 43, 0.45)";
                      e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.22)";
                      e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.6), 0 0 15px rgba(212,175,55,0.05)";
                    }}
                  >
                    {/* Card Top Accent */}
                    <div
                      className="h-1.5 w-full"
                      style={{
                        background: branch.is_active !== false
                          ? 'linear-gradient(90deg, #D4AF37, #4afa9a, #D4AF37)'
                          : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                      }}
                    />

                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name & Status */}
                        <div className={`flex items-start justify-between gap-3 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-3.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'rgba(212,175,55,0.15)', border: "1px solid rgba(212,175,55,0.3)" }}
                            >
                              <Building2 className="w-5 h-5" style={{ color: "#D4AF37" }} />
                            </div>
                            <h3 className={`text-lg font-bold text-white leading-tight ${isAr ? 'text-right' : ''}`}>
                              {getName(branch)}
                            </h3>
                          </div>
                          <span
                            className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              branch.is_active !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {branch.is_active !== false
                              ? lang === 'bn' ? 'সক্রিয়' : isAr ? 'نشط' : 'Active'
                              : lang === 'bn' ? 'নিষ্ক্রিয়' : isAr ? 'غير نشط' : 'Inactive'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-3.5 mt-2">
                          {getAddress(branch) && (
                            <div className={`flex items-start gap-3 text-white/70 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D4AF37' }} />
                              <span className="text-xs leading-relaxed">{getAddress(branch)}</span>
                            </div>
                          )}

                          {branch.phone && (
                            <div className={`flex items-center gap-3 text-white/70 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <Phone className="w-4 h-4 shrink-0" style={{ color: '#D4AF37' }} />
                              <span className="text-xs">{branch.phone}</span>
                            </div>
                          )}

                          {branch.head_teacher && (
                            <div className={`flex items-center gap-3 text-white/70 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                              </div>
                              <span className="text-xs">
                                {lang === 'bn' ? 'প্রধান শিক্ষক: ' : isAr ? 'المعلم الرئيسي: ' : 'Head Teacher: '}
                                <span className="font-semibold text-white">{branch.head_teacher}</span>
                              </span>
                            </div>
                          )}

                          {branch.established_year && (
                            <div className={`flex items-center gap-3 text-white/70 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4afa9a' }} />
                              </div>
                              <span className="text-xs">
                                {lang === 'bn' ? 'প্রতিষ্ঠাকাল: ' : isAr ? 'প্রতিষ্ঠাকাল: ' : 'Established: '}
                                <span className="font-semibold text-white">{branch.established_year}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detail CTA text at bottom */}
                      <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 group-hover:text-yellow-400 transition-colors duration-300">
                          {lang === 'bn' ? 'বিস্তারিত দেখুন ➔' : isAr ? 'عرض التفاصيل ➔' : 'View Details ➔'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
