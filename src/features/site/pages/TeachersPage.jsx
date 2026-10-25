import React, { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { User, ArrowLeft, Phone, GraduationCap, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TeachersPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isBn = lang === "bn";
  const isAr = lang === "ar";

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [visibleCount, setVisibleCount] = useState(50);

  // Fetch branches dynamically
  const { data: branches = [] } = useQuery({
    queryKey: ["branches-public-list"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
    select: d => d.filter(b => b.is_active !== false)
  });

  // Fetch all active teachers (uses listAll so all teachers are retrieved even if > 200)
  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ["teachers-all-public"],
    queryFn: () => appClient.entities.Teacher.listAll({
      sort: "created_date",
      select: "id,teacher_id,user_email,full_name_en,full_name_bn,phone,photo_url,designation,bio,facebook,linkedin,is_active,full_name_ar,designation_bn,designation_ar,bio_bn,bio_ar,name,image_url,employee_code,branch,department,website_showing_serial,featured_teacher,cv_url,alt_phone,qualification,experience_years,special_skills,show_on_website,branch_id,assigned_batches,status"
    }).then(list => list.filter(t => t.status === "active" || t.is_active !== false)),
    staleTime: 15 * 60 * 1000,
  });

  // Sort: website_showing_serial ascending (nulls/undefined placed at the end)
  const sortedTeachers = [...teachers].sort((a, b) => {
    const sa = a.website_showing_serial !== null && a.website_showing_serial !== undefined ? Number(a.website_showing_serial) : 999999;
    const sb = b.website_showing_serial !== null && b.website_showing_serial !== undefined ? Number(b.website_showing_serial) : 999999;
    return sa - sb;
  });

  // Helper resolvers
  const getBranchName = (b) => {
    if (!b) return "";
    if (lang === "bn") return b.name_bn || b.branch_name || b.name_en || "";
    if (lang === "ar") return b.name_ar || b.name_en || b.name_bn || "";
    return b.name_en || b.branch_name || b.name_bn || "";
  };

  const getLocalizedField = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj["en"] || obj["bn"] || "";
  };

  const matchesBranch = (t, b) => {
    if (!t || !b) return false;
    if (t.branch_id && b.id && Number(t.branch_id) === Number(b.id)) return true;
    const bNameEn = b.name_en || b.branch_name || "";
    const bNameBn = b.name_bn || b.branch_name || "";
    const bNameAr = b.name_ar || b.branch_name || "";
    return (
      t.branch === bNameEn ||
      t.branch === bNameBn ||
      t.branch === bNameAr ||
      t.branch === b.branch_name
    );
  };

  const matchesClass = (t, b, c) => {
    if (!t || !c) return false;

    // 1. Check assigned_batches (selected during teacher creation/edit)
    const assignedStr = t.assigned_batches || "";
    if (assignedStr) {
      const assignedList = assignedStr.split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
      if (assignedList.includes("all classes")) {
        return true;
      }
      
      const cNames = [];
      if (typeof c.class_name === "string") {
        cNames.push(c.class_name.toLowerCase());
      } else if (c.class_name && typeof c.class_name === "object") {
        if (c.class_name.en) cNames.push(c.class_name.en.toLowerCase());
        if (c.class_name.bn) cNames.push(c.class_name.bn.toLowerCase());
        if (c.class_name.ar) cNames.push(c.class_name.ar.toLowerCase());
      }

      const matchFound = assignedList.some(assigned => cNames.includes(assigned));
      if (matchFound) {
        return true;
      }
    }

    // 2. Direct department string match
    const cNameEn = c.class_name?.en || "";
    const cNameBn = c.class_name?.bn || "";
    const cNameAr = c.class_name?.ar || "";
    if (
      t.department === cNameEn ||
      t.department === cNameBn ||
      t.department === cNameAr
    ) {
      return true;
    }
    // 3. Dynamic assignment in academic_structure
    if (Number(c.class_teacher_id) === Number(t.id) || String(c.class_teacher_id) === String(t.teacher_id)) {
      return true;
    }
    const hasSubject = c.subjects?.some(sub => 
      Number(sub.teacher_id) === Number(t.id) || String(sub.teacher_id) === String(t.teacher_id)
    );
    if (hasSubject) return true;

    return false;
  };

  // Client-side filtering logic
  const filteredTeachers = sortedTeachers.filter(t => {
    if (t.is_active === false) return false;
    if (!selectedBranch) return true; // All Teachers selected
    const branchMatch = matchesBranch(t, selectedBranch);
    if (!branchMatch) return false;

    if (selectedClass) {
      return matchesClass(t, selectedBranch, selectedClass);
    }
    return true;
  });

  const displayedTeachers = filteredTeachers.slice(0, visibleCount);

  return (
    <div className={`min-h-screen ${isAr ? 'direction-rtl' : ''}`} style={{ background: "linear-gradient(160deg,#0e2e1f 0%,#144733 50%,#0e2e1f 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Back Button */}
        <div className={isAr ? 'text-right' : ''}>
          <Link href="/"
            className={`inline-flex items-center gap-2 text-sm font-bold italic mb-10 transition-all duration-300 hover:text-white ${isAr ? 'flex-row-reverse' : ''}`}
            style={{ color: "#4afa9a" }}>
            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            {t?.common?.backHome || "মূল পাতায় ফিরুন"}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37" }}>
            {t?.teachersPage?.badge || "আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold italic text-white mb-4">
            {t?.teachersPage?.title || "দ্বীন ও আধুনিক শিক্ষার যোগ্য কারিগর"}
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto italic leading-relaxed">
            {t?.teachersPage?.subtitle || "যোগ্যতাসম্পন্ন, আন্তরিক ও যত্নশীল উস্তাদবৃন্দের তত্ত্বাবধানে পরিচালিত"}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-400/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-400/30" />
          </div>
        </div>
        {/* ── TEACHER PAGE NAVIGATION SYSTEM ── */}
        <div className="space-y-4 mb-12">
          {/* 1st Level: Branches */}
          <div className="flex flex-wrap gap-3 justify-center border-b border-white/10 pb-6 relative z-40">
            {/* All Teachers Tab */}
            <button
              onClick={() => {
                setSelectedBranch(null);
                setSelectedClass(null);
                setVisibleCount(50);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold italic transition-all duration-200 ${
                !selectedBranch
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-[0_4px_16px_rgba(245,158,11,0.3)] scale-105"
                  : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {lang === "bn" ? "সকল শিক্ষক" : lang === "ar" ? "كل المعلمين" : "All Teachers"}
            </button>

            {/* Dynamic Branches */}
            {branches.map(b => {
              const bName = getBranchName(b);
              const isSelectedBranch = selectedBranch?.id === b.id;

              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranch(b);
                    setSelectedClass(null);
                    setVisibleCount(50);
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold italic transition-all duration-200 ${
                    isSelectedBranch
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-[0_4px_16px_rgba(245,158,11,0.3)] scale-105"
                      : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {bName}
                </button>
              );
            })}
          </div>

          {/* 2nd Level: Classes (Visible only if a branch is selected and has classes) */}
          {selectedBranch && selectedBranch.academic_structure && selectedBranch.academic_structure.length > 0 && (
            <div className="flex flex-wrap gap-2.5 justify-center pt-2 pb-6 border-b border-white/5 animate-fade-in relative z-30">
              {/* All Classes in Selected Branch Tab */}
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setVisibleCount(50);
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold italic transition-all duration-200 ${
                  !selectedClass
                    ? "bg-emerald-500 text-[#0c2419] shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                    : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang === "bn" ? "সব শ্রেণী" : lang === "ar" ? "جميع الفصول" : "All Classes"}
              </button>

              {/* Individual Classes */}
              {selectedBranch.academic_structure.map((cls, cIdx) => {
                const clsName = getLocalizedField(cls.class_name);
                const secName = getLocalizedField(cls.section);
                const isSelectedClass = selectedClass?.id === cls.id;

                return (
                  <button
                    key={cls.id || cIdx}
                    onClick={() => {
                      setSelectedClass(cls);
                      setVisibleCount(50);
                    }}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold italic transition-all duration-200 ${
                      isSelectedClass
                        ? "bg-emerald-500 text-[#0c2419] shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {clsName} {secName && `(${secName})`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-red-500/20 backdrop-blur-sm">
            <p className="text-red-400 italic text-lg">{t.common?.error || "Failed to load teachers."}</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm animate-fade-in">
            <User className="h-16 w-16 mx-auto text-white/10 mb-4" />
            <p className="text-white/30 italic text-lg">{t.teachersPage.noTeachers}</p>
          </div>
        ) : (
          <>
            {/* Responsive Layout Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedTeachers.map(teacher => {
                // Apply show_on_website visibility checks
                const showOnWebsite = teacher.show_on_website || {};
                const showPhoto = showOnWebsite.photo !== "N";
                const showName = showOnWebsite.name !== "N";
                const showDesignation = showOnWebsite.designation !== "N";
                const showBranch = showOnWebsite.branch !== "N";
                const showDept = showOnWebsite.department !== "N";
                const showSubjects = showOnWebsite.subjects !== "N";
                const showQualification = showOnWebsite.qualification !== "N";
                const showExperience = showOnWebsite.experience !== "N";
                const showSkills = showOnWebsite.skills !== "N";
                const showBio = showOnWebsite.bio !== "N";
                const showPhone = showOnWebsite.phone !== "N";
                const showEmail = showOnWebsite.email !== "N";

                // Resolve name based on language rules
                const name = isBn ? (teacher.full_name_bn || teacher.full_name_en) 
                           : isAr ? (teacher.full_name_ar || teacher.full_name_en) 
                           : (teacher.full_name_en || teacher.full_name_bn);

                // Resolve designation based on language rules
                const designation = isBn ? (teacher.designation_bn || teacher.designation) 
                                 : isAr ? (teacher.designation_ar || teacher.designation) 
                                 : (teacher.designation || teacher.designation_bn);

                // Resolve bio based on language rules
                const bio = isBn ? (teacher.bio_bn || teacher.bio) 
                          : isAr ? (teacher.bio_ar || teacher.bio) 
                          : (teacher.bio || teacher.bio_bn);

                return (
                  <div key={teacher.id}
                    className="group relative rounded-3xl p-8 text-center bg-white/5 border border-[#D4AF37]/25 shadow-lg shadow-[#D4AF37]/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-[#D4AF37]/65 hover:shadow-xl hover:shadow-[#D4AF37]/15 flex flex-col justify-between animate-fade-in"
                  >
                    <div>
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] pointer-events-none" />
                      
                      <div className="relative w-28 h-28 rounded-3xl mx-auto mb-6 overflow-hidden border-2 border-white/20 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:border-amber-500/50 group-hover:rotate-3 flex items-center justify-center bg-emerald-900/40">
                        {teacher.photo_url && showPhoto ? (
                          <Image src={teacher.photo_url} alt={name} fill sizes="112px" className="object-cover" />
                        ) : (
                          <User className="h-12 w-12 text-white/20" />
                        )}
                      </div>

                      {showName && (
                        <h3 className="font-bold italic text-white text-lg leading-tight mb-2">
                          {name}
                        </h3>
                      )}
                      
                      {showDesignation && designation && (
                        <div className={`flex items-center justify-center gap-1.5 text-xs font-bold mb-2 ${isAr ? 'flex-row-reverse' : ''}`} style={{ color: "rgba(212,175,55,0.8)" }}>
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span className="italic">
                            {designation}
                          </span>
                        </div>
                      )}

                      {showQualification && teacher.qualification && (
                        <p className="text-xs text-white/70 mb-2 font-medium">
                          🎓 {teacher.qualification}
                        </p>
                      )}

                      {showExperience && teacher.experience_years && (
                        <p className="text-xs text-white/60 mb-2 italic">
                          💼 {teacher.experience_years} {isBn ? "বছর অভিজ্ঞতা" : isAr ? "سنوات خبرة" : "Years Experience"}
                        </p>
                      )}

                      {showSkills && teacher.special_skills && (
                        <p className="text-xs text-amber-300/80 mb-4 font-semibold">
                          ⚡ {teacher.special_skills}
                        </p>
                      )}

                      {showSubjects && teacher.subjects && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {teacher.subjects.split(",").map((s, i) => (
                            <span key={i} className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 group-hover:bg-amber-500/10 group-hover:text-amber-300 group-hover:border-amber-500/20 transition-all">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {showBio && bio && (
                        <p className="text-xs text-white/50 italic leading-relaxed mb-6 border-t border-white/5 pt-4">
                          &ldquo;{bio}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mt-auto">
                      {showBranch && teacher.branch && (
                        <div className="flex items-center justify-center gap-1 text-[11px] text-white/45 mb-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{teacher.branch}</span>
                        </div>
                      )}

                      {teacher.phone && showPhone && (
                        <a href={`tel:${teacher.phone}`} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold italic hover:bg-emerald-500 hover:text-white transition-all ${isAr ? 'flex-row-reverse' : ''}`}>
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-sans">{teacher.phone}</span>
                        </a>
                      )}

                      {teacher.user_email && showEmail && (
                        <a href={`mailto:${teacher.user_email}`} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold italic hover:bg-blue-500 hover:text-white transition-all ${isAr ? 'flex-row-reverse' : ''}`}>
                          <Mail className="w-3.5 h-3.5" />
                          <span className="font-sans truncate">{teacher.user_email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {filteredTeachers.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 50)}
                  className="px-8 py-3.5 rounded-full text-xs font-extrabold italic bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-950 shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider uppercase"
                >
                  {isBn ? `আরও শিক্ষক দেখুন (+৫০)` : isAr ? `عرض المزيد (+৫০)` : `Load More Teachers (+50)`}
                </button>
                <p className="text-xs text-white/40 italic mt-3">
                  {isBn ? `${filteredTeachers.length} জনের মধ্যে ${displayedTeachers.length} জন দেখানো হচ্ছে` : `Showing ${displayedTeachers.length} of ${filteredTeachers.length} teachers`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}