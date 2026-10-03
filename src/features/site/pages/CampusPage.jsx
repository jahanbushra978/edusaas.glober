'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowLeft, Building2, Phone, MapPin, User, ChevronRight } from 'lucide-react';

export default function CampusPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const isBn = lang === 'bn';

  const { data: rawBranches = [], isLoading } = useQuery({
    queryKey: ['branches-public'],
    queryFn: () => appClient.entities.Branch.list('sort_order', 100),
    select: (data) => data.filter((b) => b.is_active !== false),
  });

  // Deduplicate by ID to guarantee fresh, unique branch items
  const branches = Array.from(new Map(rawBranches.map((b) => [b.id || b.slug || b.name_bn, b])).values());

  const getName = (branch) => {
    if (isBn) return branch.name_bn || branch.branch_name || branch.name_en || branch.name_ar || '';
    if (isAr) return branch.name_ar || branch.name_bn || branch.name_en || branch.branch_name || '';
    return branch.name_en || branch.branch_name || branch.name_bn || branch.name_ar || '';
  };

  const getAddress = (branch) => {
    if (isBn) return branch.address_bn || branch.address_en || branch.address_ar || '';
    if (isAr) return branch.address_ar || branch.address_bn || branch.address_en || '';
    return branch.address_en || branch.address_bn || branch.address_ar || '';
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 ${isAr ? 'direction-rtl' : ''}`} style={{ background: "linear-gradient(to bottom, #02140e 0%, #052e2b 50%, #010f0a 100%)" }}>
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-sm font-bold transition-all duration-300 hover:text-white ${isAr ? 'flex-row-reverse' : ''}`}
          style={{ color: "#4afa9a" }}
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {isBn ? 'হোমে ফিরুন' : isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
          {isBn ? 'নিকটস্থ শাখা খুঁজে নিন' : isAr ? 'ابحث عن أقرب فرع' : 'Find the Nearest Branch'}
        </h1>
        <p className="text-sm sm:text-base text-yellow-400/90 max-w-xl mx-auto font-bold mt-2 leading-relaxed tracking-wide">
          {isBn 
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
      </div>

      {/* Branch Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="mt-4 text-white/50 text-sm">
              {isBn ? 'লোড হচ্ছে...' : isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">
              {isBn ? 'কোনো শাখা পাওয়া যায়নি।' : isAr ? 'لم يتم العثور على فروع.' : 'No branches found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {branches.map((branch, idx) => {
              const validSlug = branch.slug && branch.slug !== "-" ? branch.slug : branch.id;
              const coverImage = branch.card_image_url || branch.image_url || (Array.isArray(branch.slider_images) && branch.slider_images.length > 0 ? branch.slider_images[0] : "") || branch.logo || "";
              
              return (
                <Link 
                  href={`/branch/${encodeURIComponent(validSlug)}`} 
                  key={branch.id || idx} 
                  className="flex flex-col h-full group cursor-pointer"
                >
                  <div 
                    className={`rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/20 bg-[#ecfdf5] shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-400/40 flex flex-col h-full w-full justify-between ${isAr ? 'text-right' : ''}`}
                  >
                    {/* Top Cover Image: Always equal fixed height container */}
                    <div className="w-full h-44 sm:h-48 overflow-hidden relative bg-slate-100 dark:bg-emerald-950/20 shrink-0">
                      {coverImage ? (
                        <>
                          <img
                            src={coverImage}
                            alt={getName(branch)}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-950/10">
                          <Building2 className="h-12 w-12 text-[#052E16]/30" />
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div className="flex-1 flex flex-col">
                        {/* Header: Logo + Branch Name & Established */}
                        <div className={`flex items-start gap-3.5 mb-4 min-h-[3.75rem] sm:min-h-[4.25rem] ${isAr ? 'flex-row-reverse' : ''}`}>
                          <div 
                            className="w-12 h-12 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden mt-0.5"
                          >
                            {branch.logo ? (
                              <img src={branch.logo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="h-6 w-6 text-[#052E16]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-[#052E16] text-base sm:text-lg leading-snug break-words" dir={isAr ? "rtl" : "auto"}>
                              {getName(branch)}
                            </h3>
                            {branch.established_year && (
                              <p className="text-xs text-[#052E16]/75 font-medium mt-1">
                                {isBn ? `Est. ${branch.established_year}` : isAr ? `تأسس عام: ${branch.established_year}` : `Est. ${branch.established_year}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-2.5 mt-auto pt-2 border-t border-emerald-500/10">
                          {getAddress(branch) && (
                            <div className={`flex items-start gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#052E16]" />
                              <span className="text-xs text-[#052E16]/85 font-medium leading-relaxed break-words" dir={isAr ? "rtl" : "auto"}>
                                {getAddress(branch)}
                              </span>
                            </div>
                          )}

                          {branch.phone && (
                            <div className={`flex items-center gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <Phone className="h-4 w-4 shrink-0 text-[#052E16]" />
                              <span className="text-xs text-[#052E16]/85 font-medium break-all">{branch.phone}</span>
                            </div>
                          )}

                          {branch.head_teacher && (
                            <div className={`flex items-start gap-2.5 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                              <User className="h-4 w-4 shrink-0 mt-0.5 text-[#052E16]" />
                              <span className="text-xs text-[#052E16]/85 font-medium leading-relaxed break-words">
                                {isBn ? `Head: ${branch.head_teacher}` : isAr ? `مدير الفرع: ${branch.head_teacher}` : `Head: ${branch.head_teacher}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="mt-5 pt-1 shrink-0">
                        <div 
                          className={`w-full py-2.5 px-4 rounded-xl bg-[#e5efe0] group-hover:bg-[#d8e8d2] text-[#1b4332] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs ${isAr ? 'flex-row-reverse' : ''}`}
                        >
                          <span>{isBn ? 'View Details' : isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                          <ChevronRight className={`h-4 w-4 text-[#1b4332] transition-transform duration-300 group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
