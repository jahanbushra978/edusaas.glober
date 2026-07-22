'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/appClient';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/lib/translations';
import {
  ArrowLeft, ArrowUpRight, Building2, MapPin, Calendar, Clock,
  Trophy, Award, BookOpen, Users, ChevronLeft, ChevronRight,
  GraduationCap, Book, CheckSquare, X, Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdmissionForm from '@/components/home/AdmissionForm';

export default function BranchPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === 'ar';
  const isBn = lang === 'bn';

  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch branch by slug or ID
  const { data: branchList = [], isLoading: loadingBranch } = useQuery({
    queryKey: ['branch-detail', slug],
    queryFn: async () => {
      if (!slug) return [];
      let res = await appClient.entities.Branch.filter({ slug });
      if (res && res.length > 0) return res;
      if (/^\d+$/.test(slug)) {
        const single = await appClient.entities.Branch.get(slug);
        if (single) return [single];
      }
      return [];
    },
    enabled: !!slug,
  });

  const fetchedBranch = branchList[0];
  const branch = fetchedBranch && fetchedBranch.is_active !== false ? fetchedBranch : null;

  // Fetch teachers for name lookup
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-list-public'],
    queryFn: () => appClient.entities.Teacher.list('full_name_en', 200),
  });

  // Fetch branch-specific Notices
  const { data: notices = [] } = useQuery({
    queryKey: ['notices-branch', branch?.id],
    queryFn: () => appClient.entities.Notice.filter({ branch_id: branch.id }),
    enabled: !!branch?.id,
    select: d => d.filter(n => n.is_active && n.status !== 'draft')
  });

  // Fetch branch-specific Gallery items
  const { data: galleryItems = [] } = useQuery({
    queryKey: ['gallery-branch', branch?.id],
    queryFn: () => appClient.entities.Gallery.filter({ branch_id: branch.id }),
    enabled: !!branch?.id,
    select: d => d.filter(i => i.is_published !== false)
  });

  // Fetch branch-specific Events
  const { data: events = [] } = useQuery({
    queryKey: ['events-branch', branch?.id],
    queryFn: () => appClient.entities.Event.filter({ branch_id: branch.id }),
    enabled: !!branch?.id
  });

  // Fetch branch-specific Achievements (Success Stories)
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements-branch', branch?.id],
    queryFn: () => appClient.entities.SuccessStory.filter({ branch_id: branch.id }),
    enabled: !!branch?.id
  });

  // Slide autoplay
  const slides = branch?.slider_images && branch.slider_images.length > 0
    ? branch.slider_images
    : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loadingBranch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-[#080f0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">
            {lang === 'bn' ? 'লোড হচ্ছে...' : isAr ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!branch || branch.is_active === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-[#080f0a] px-4">
        <div className="text-center bg-white dark:bg-[#0d1f17] p-12 rounded-3xl border border-slate-100 dark:border-green-900 max-w-md w-full shadow-lg">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-green-800 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
            {lang === 'bn' ? 'শাখাটি পাওয়া যায়নি' : isAr ? 'الفرع غير موجود' : 'Branch Not Found'}
          </h1>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#12715B] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
            {t.common.backHome}
          </Link>
        </div>
      </div>
    );
  }

  // Helper resolvers
  const getBranchName = () => {
    if (lang === 'bn') return branch.name_bn || branch.branch_name || branch.name_en || '';
    if (lang === 'ar') return branch.name_ar || branch.name_en || branch.name_bn || '';
    return branch.name_en || branch.branch_name || branch.name_bn || '';
  };

  const getBranchAddress = () => {
    if (lang === 'bn') return branch.address_bn || branch.address || branch.address_en || '';
    if (lang === 'ar') return branch.address_ar || branch.address_en || branch.address_bn || '';
    return branch.address_en || branch.address || branch.address_bn || '';
  };

  const getLocalizedField = (obj, field = '') => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['en'] || obj['bn'] || '';
  };

  const getTeacherName = (id) => {
    if (!id) return '';
    const tRecord = teachers.find(t => t.id === Number(id) || t.teacher_id === String(id));
    if (!tRecord) return '';
    return lang === 'bn' ? (tRecord.full_name_bn || tRecord.full_name_en) : (tRecord.full_name_en || tRecord.full_name_bn);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Sections config mapping for dynamic loops
  const CONTENT_SECTIONS = [
    { key: "intro", title: t.branchPage.intro, icon: BookOpen },
    { key: "objective", title: t.branchPage.objective, icon: CheckSquare },
    { key: "vision", title: t.branchPage.vision, icon: Info },
    { key: "target", title: t.branchPage.target, icon: Award },
    { key: "departments", title: t.branchPage.departments, icon: Building2 },
    { key: "features", title: t.branchPage.features, icon: Trophy },
    { key: "teaching_method", title: t.branchPage.teaching_method, icon: GraduationCap },
    { key: "admission_process", title: t.branchPage.admission_process, icon: Book },
    { key: "moral_discipline", title: t.branchPage.moral_discipline, icon: Award },
    { key: "leave_policy", title: t.branchPage.leave_policy, icon: Calendar },
    { key: "uniform", title: t.branchPage.uniform, icon: Users },
    { key: "guardian_guidelines", title: t.branchPage.guardian_guidelines, icon: Users }
  ];

  const activeContentSections = CONTENT_SECTIONS.filter(
    sec => branch.content_settings?.[sec.key] === 'Y' && branch.content_data?.[sec.key]?.[lang]
  );

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#080f0a] pb-20 ${isAr ? 'direction-rtl text-right' : ''}`}>
      {/* ── 1. HERO SLIDER SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {slides.length > 0 ? (
          <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-black/5 sm:h-[380px] lg:h-[450px]">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img src={slides[currentSlide]} loading="lazy" alt={getBranchName()} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,30,15,0.8) 0%, rgba(0,60,35,0.2) 60%, rgba(0,0,0,0.1) 100%)' }} />
                
                {/* Banner overlay text */}
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white">
                  <h1 className="text-2xl sm:text-4xl font-black drop-shadow-md">
                    {getBranchName()}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-yellow-400" /> {getBranchAddress()}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide(c => (c - 1 + slides.length) % slides.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white border border-white/10 transition-colors z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide(c => (c + 1) % slides.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 text-white border border-white/10 transition-colors z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-yellow-400' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback Banner */
          <div className="relative h-[200px] w-full overflow-hidden rounded-[24px] shadow-sm ring-1 ring-black/5 bg-[#0e2e1f] flex flex-col justify-center px-8 border border-green-800">
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/hero1.jpg')" }} />
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-3 mb-2">
                {branch.logo && <img src={branch.logo} loading="lazy" alt="Logo" className="w-10 h-10 object-contain rounded bg-white/10 p-1" />}
                <div>
                  <h1 className="text-xl sm:text-3xl font-black">{getBranchName()}</h1>
                  <p className="text-xs text-yellow-300/80">{getBranchAddress()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. WELCOME SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0d1f17] rounded-3xl p-8 border border-slate-100 dark:border-green-900 shadow-sm text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-500/5 -translate-x-10 -translate-y-10 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-black text-[#052E2B] dark:text-emerald-400">
            {t.branchPage.welcome.replace('{name}', getBranchName())}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-emerald-200" />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
            <div className="h-px w-12 bg-emerald-200" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {isBn ? 'দ্বীনি ও জাগতিক শিক্ষার সমন্বয়ে একটি আধুনিক দ্বীনি শিক্ষাপ্রতিষ্ঠান।' : isAr ? 'مؤسسة تعليمية حديثة تجمع بين التعليم الديني والأكاديمي.' : 'A modern educational institution combining religious and general academic streams.'}
          </p>
        </motion.div>
      </div>

      {/* ── 3. BRANCH INFORMATION SECTIONS (Alternating layout) ── */}
      {activeContentSections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-10 space-y-8">
          {activeContentSections.map((sec, idx) => {
            const IconComponent = sec.icon;
            const textContent = branch.content_data?.[sec.key]?.[lang] || '';
            const isOdd = idx % 2 !== 0;

            return (
              <motion.div
                key={sec.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col md:flex-row gap-6 p-6 sm:p-10 bg-white dark:bg-[#0d1f17] rounded-3xl border border-slate-100 dark:border-green-900 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ${isOdd ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex-shrink-0 flex items-center justify-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-emerald-950/50 border border-amber-200 dark:border-green-800 group-hover:scale-110 group-hover:bg-amber-100 dark:group-hover:bg-emerald-900 transition-all duration-500 shadow-sm">
                    <IconComponent className="w-7 h-7 text-[#12715B] dark:text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 space-y-3 relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#052E2B] dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {sec.title}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full group-hover:w-24 transition-all duration-500" />
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {textContent}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {branch.content_data?.custom_content_blocks && branch.content_data.custom_content_blocks.map((block, idx) => {
            if (block.show === "N") return null;
            const heading = block.heading?.[lang] || block.heading?.bn || block.heading?.en || '';
            const content = block.content?.[lang] || block.content?.bn || block.content?.en || '';
            if (!heading && !content) return null;
            
            const isOdd = (activeContentSections.length + idx) % 2 !== 0;

            return (
              <motion.div
                key={block.id || `custom-${idx}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col md:flex-row gap-6 p-6 sm:p-10 bg-white dark:bg-[#0d1f17] rounded-3xl border border-slate-100 dark:border-green-900 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ${isOdd ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex-shrink-0 flex items-center justify-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-green-800 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-all duration-500 shadow-sm">
                    <Building2 className="w-7 h-7 text-[#12715B] dark:text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 space-y-3 relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#052E2B] dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {heading}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full group-hover:w-24 transition-all duration-500" />
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 4. CLASSES / DEPARTMENTS SECTION ── */}
      {branch.content_settings?.show_academy_structure !== "N" && branch.academic_structure && branch.academic_structure.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#052E2B] dark:text-emerald-400">
              {t.branchPage.classSection}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const flattenedClasses = [];
              branch.academic_structure.forEach(cls => {
                if (cls.sections && cls.sections.length > 0) {
                  cls.sections.forEach(sec => {
                    if (sec.show_on_web !== false) {
                      flattenedClasses.push({
                        ...cls,
                        section: sec.section_name,
                        shift: sec.shift,
                        subjects: sec.subjects,
                        unique_key: `${cls.id}_${sec.id}`
                      });
                    }
                  });
                } else {
                  flattenedClasses.push({ ...cls, unique_key: cls.id });
                }
              });

              return flattenedClasses.map((cls, idx) => (
                <div
                  key={cls.unique_key || idx}
                  onClick={() => {
                    router.push(`/branch-gallery?branch_id=${branch.id}&class_id=${cls.id}`);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-5 border border-slate-100 dark:border-green-900 bg-white dark:bg-[#0d1f17] transition-all duration-300 shadow-sm ${
                    branch.content_settings?.show_class_details !== 'N' ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''
                  }`}
                >
                  <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-600 to-yellow-500" />
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950 border dark:border-green-900">
                      <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {cls.subjects && (
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-emerald-900/30 text-amber-700 dark:text-emerald-400 border border-amber-100 dark:border-green-800 px-2 py-0.5 rounded-full">
                        {cls.subjects.length} {isBn ? 'বিষয়' : isAr ? 'مواد' : 'Subjects'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {getLocalizedField(cls.class_name)}
                  </h3>
                  <div className="flex gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 font-semibold border-t pt-2 border-slate-100 dark:border-green-900">
                    <p>🏷️ {getLocalizedField(cls.section)}</p>
                    <p>⏰ {getLocalizedField(cls.shift)}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ── 5. NOTICE SECTION ── */}
      {notices.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#052E2B] dark:text-emerald-400">
              {t.branchPage.notices}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((n, idx) => (
              <Link href={`/notice/${n.id}`} key={n.id || idx} className="block group">
                <div className="bg-white dark:bg-[#0d1f17] border border-slate-100 dark:border-green-900 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 mb-2 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(n.publish_date || n.created_date)}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 transition-colors">
                    {n.translations?.title?.[lang] || (lang === 'bn' ? n.title_bn : lang === 'ar' ? n.title_ar : n.title_en) || n.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {n.translations?.body?.[lang] || (lang === 'bn' ? n.body_bn : lang === 'ar' ? n.body_ar : n.body_en) || n.body}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. GALLERY SECTION ── */}
      {galleryItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#052E2B] dark:text-emerald-400">
              {t.branchPage.gallery}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => setLightboxImage(item.image_url)}
                className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden cursor-pointer shadow-sm group border dark:border-green-900"
              >
                <img src={item.image_url} loading="lazy" alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                  {lang === 'bn' ? 'বড় করে দেখুন' : isAr ? 'عرض أكبر' : 'Zoom In'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. EVENTS SECTION ── */}
      {events.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#052E2B] dark:text-emerald-400">
              {t.branchPage.events}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((e, idx) => (
              <div key={e.id || idx} className="bg-white dark:bg-[#0d1f17] rounded-3xl border border-slate-100 dark:border-green-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="relative h-44 bg-slate-50 overflow-hidden flex items-center justify-center border-b dark:border-green-900">
                    {e.banner_url ? (
                      <img src={e.banner_url} loading="lazy" alt={e.title} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="h-16 w-16 text-emerald-700/20" />
                    )}
                    {e.event_date && (
                      <div className="absolute bottom-3 left-3 bg-[#052E2B] text-[#D4AF37] px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(e.event_date)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-[#052E2B] dark:text-emerald-400 line-clamp-2">
                      {e.translations?.title?.[lang] || e.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {e.translations?.description?.[lang] || e.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. ACHIEVEMENTS SECTION ── */}
      {achievements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#052E2B] dark:text-emerald-400">
              {t.branchPage.achievements}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((story, idx) => (
              <div key={story.id || idx} className="bg-white dark:bg-[#0d1f17] rounded-3xl border border-slate-100 dark:border-green-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="relative h-44 bg-slate-50 overflow-hidden flex items-center justify-center border-b dark:border-green-900">
                    {story.image_url ? (
                      <img src={story.image_url} loading="lazy" alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="h-16 w-16 text-emerald-700/20" />
                    )}
                  </div>
                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-[#052E2B] dark:text-emerald-400 line-clamp-2">
                      {story.translations?.title?.[lang] || story.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {story.translations?.description?.[lang] || story.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 9. ADMISSION FORM SECTION ── */}
      <div className="max-w-4xl mx-auto px-4 mt-20 border-t pt-16 dark:border-green-900">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#052E2B] dark:text-emerald-400">
            {t.branchPage.admissionForm}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-emerald-400/50" />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-400/50" />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isBn ? 'আপনার সন্তানকে উপযুক্ত শাখায় ভর্তি করাতে নিচের আবেদন ফর্মটি পূরণ করুন।' : isAr ? 'يرجى ملء النموذج أدناه لتسجيل طفلك في هذا الفرع.' : 'Please fill in the form below to apply for admission in this branch.'}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 dark:border-green-900 shadow-xl overflow-hidden bg-white dark:bg-[#0d1f17] p-1 sm:p-4">
          <AdmissionForm branchId={branch.id} />
        </div>
      </div>

      {/* ── CLASS DETAILS DIALOG (Modal Popup) ── */}
      <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
        {selectedClass && (
          <DialogContent className="max-w-2xl w-[95vw] bg-white dark:bg-[#0d1f17] dark:border-green-900 rounded-2xl p-6">
            <DialogHeader className="border-b pb-3 dark:border-green-900 mb-4">
              <DialogTitle className="text-lg font-black text-[#052E2B] dark:text-emerald-400">
                {getLocalizedField(selectedClass.class_name)} ({getLocalizedField(selectedClass.section)}) - {getLocalizedField(selectedClass.shift)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Class Teacher */}
              {selectedClass.class_teacher_id && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border dark:border-green-900">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t.branchPage.classTeacher}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{getTeacherName(selectedClass.class_teacher_id)}</p>
                  </div>
                </div>
              )}

              {/* Subject List */}
              {selectedClass.subjects && selectedClass.subjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-[#052E2B] dark:text-emerald-400 uppercase tracking-wider">
                    {t.branchPage.subjects}
                  </h4>
                  <div className="border rounded-xl dark:border-green-900 overflow-hidden divide-y dark:divide-green-900 bg-white dark:bg-transparent">
                    {selectedClass.subjects.map((sub, sIdx) => (
                      <div key={sub.id || sIdx} className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{getLocalizedField(sub.subject_name)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">{t.branchPage.bookName}:</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{getLocalizedField(sub.book_name) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">{t.branchPage.fullMarks}:</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{sub.full_marks || '100'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">{isBn ? 'শিক্ষক' : isAr ? 'المعلم' : 'Teacher'}:</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">{getTeacherName(sub.teacher_id) || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique Assigned Teachers List */}
              {(() => {
                const teacherIds = new Set();
                if (selectedClass.class_teacher_id) teacherIds.add(selectedClass.class_teacher_id);
                selectedClass.subjects?.forEach(s => {
                  if (s.teacher_id) teacherIds.add(s.teacher_id);
                });
                const list = Array.from(teacherIds).filter(Boolean);
                if (list.length === 0) return null;

                return (
                  <div className="space-y-2 border-t pt-3 dark:border-green-900">
                    <h4 className="text-xs font-extrabold text-[#052E2B] dark:text-emerald-400 uppercase tracking-wider">
                      {t.branchPage.assignedTeachers}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {list.map(tId => (
                        <span key={tId} className="text-xs bg-slate-100 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 border dark:border-green-900 px-3 py-1 rounded-full font-bold">
                          👨‍🏫 {getTeacherName(tId)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── 10. BRANCH LOCATION ── */}
      {branch.map_embed_link && (
        <div className="max-w-4xl mx-auto px-4 mt-20 border-t pt-16 dark:border-green-900">
          <div className="relative group bg-white dark:bg-[#0d1f17] border border-slate-200 dark:border-green-800/60 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 lg:p-10">
            {/* Top accent bar */}
            <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500 rounded-full opacity-80" />

            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 mt-1">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center ring-1 ring-emerald-100 dark:ring-emerald-900/50">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-[#052E2B] dark:text-emerald-400 flex items-center gap-2">
                  <span role="img" aria-label="location">📍</span>
                  {t.branchPage?.location || (isBn ? 'শাখার অবস্থান' : isAr ? 'موقع الفرع' : 'Branch Location')}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  {isBn
                    ? 'গুগল ম্যাপ ব্যবহার করে সহজেই আমাদের শাখা খুঁজে বের করুন। নেভিগেশন সরাসরি খুলতে নীচের বোতামে ক্লিক করুন।'
                    : isAr
                      ? 'اعثر على فرعنا بسهولة باستخدام خرائط جوجل. انقر على الزر أدناه لفتح الملاحة مباشرة.'
                      : 'Find our branch easily using Google Maps. Click the button below to open navigation directly.'}
                </p>
                <div className="mt-5">
                  <a
                    href={branch.map_embed_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={isBn ? 'গুগল ম্যাপে শাখার অবস্থান দেখুন' : isAr ? 'عرض موقع الفرع على خرائط جوجل' : 'Open branch location in Google Maps'}
                    className="inline-flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-[#0d1f17] active:scale-[0.97]"
                  >
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{isBn ? 'গুগল ম্যাপে খুলুন' : isAr ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX FOR GALLERY ── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <button aria-label="Close image" className="absolute top-4 right-4 text-white hover:text-slate-200">
            <X className="w-8 h-8" />
          </button>
          <img src={lightboxImage} loading="lazy" alt="Zoomed" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
