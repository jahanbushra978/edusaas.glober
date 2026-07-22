'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { 
  ArrowLeft, FileText, ChevronRight, Search, 
  Printer, AlertCircle, CheckCircle2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

import { calcSubjectGradeAndGPA, getPrintableMarksheetHTML } from "@/components/admin/ExamManager";
import { supabase } from "@/lib/supabase";

const GRADE_COLORS = {
  "A+": { bg: "rgba(0,192,96,0.12)", text: "#00a060", border: "rgba(0,192,96,0.25)" },
  "A":  { bg: "rgba(77,166,255,0.12)", text: "#0080ff", border: "rgba(77,166,255,0.25)" },
  "A-": { bg: "rgba(186,104,200,0.12)", text: "#ab47bc", border: "rgba(186,104,200,0.25)" },
  "B":  { bg: "rgba(212,175,55,0.12)", text: "#b8960a", border: "rgba(212,175,55,0.25)" },
  "C":  { bg: "rgba(255,136,0,0.12)", text: "#cc6600", border: "rgba(255,136,0,0.25)" },
  "D":  { bg: "rgba(255,100,0,0.12)", text: "#cc4400", border: "rgba(255,100,0,0.25)" },
  "F":  { bg: "rgba(255,50,50,0.12)", text: "#cc0000", border: "rgba(255,50,50,0.25)" },
};

export default function ResultsPage() {
  const { lang } = useLanguage();
  const t = useTranslation(lang);
  const isAr = lang === "ar";
  const isBn = lang === "bn";

  // Form states
  const [selBranchId, setSelBranchId] = useState("");
  const [selClassId, setSelClassId] = useState("");
  const [selExamId, setSelExamId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchStudent, setSearchStudent] = useState(null);

  // Queries
  const { data: branches = [] } = useQuery({
    queryKey: ["public-branches-results"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["public-exams-results"],
    queryFn: () => appClient.entities.Exam.list("-academic_year", 200),
  });

  const { data: appSettings = [] } = useQuery({
    queryKey: ["public-settings-results"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const settingsObj = Object.fromEntries(appSettings.map(s => [s.key, s.value]));

  // Dynamic selector items
  const selectedBranch = branches.find(b => String(b.id) === String(selBranchId));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  
  // Construct section-level class options to resolve duplicates and support full class names like Play (Safa)
  const classOptions = [];
  classes.forEach(c => {
    const className = c.class_name?.bn || c.class_name?.en || c.class_name || "";
    if (Array.isArray(c.sections) && c.sections.length > 0) {
      c.sections.forEach(sec => {
        const secName = sec.section_name?.bn || sec.section_name?.en || sec.section_name || sec.section?.bn || sec.section?.en || "";
        classOptions.push({
          id: sec.id,
          parentClassId: c.id,
          class_name_str: className,
          section_name_str: secName,
          label: `${className}${secName ? ` (${secName})` : ""}`.trim()
        });
      });
    } else {
      classOptions.push({
        id: c.id,
        parentClassId: c.id,
        class_name_str: className,
        section_name_str: "",
        label: className
      });
    }
  });

  const selectedOption = classOptions.find(o => String(o.id) === String(selClassId));
  const parentClassId = selectedOption ? selectedOption.parentClassId : selClassId;
  const filteredExams = exams.filter(e => String(e.branch_id) === String(selBranchId) && String(e.class_id) === String(parentClassId));

  const categories = [
    { title: { bn: "নূরানী", en: "Noorani", ar: "نوراني" }, slug: "noorani" },
    { title: { bn: "নাজেরা", en: "Nazera", ar: "ناظرة" }, slug: "najera" },
    { title: { bn: "হিফয", en: "Hifz", ar: "تحفيظ" }, slug: "hifz" },
    { title: { bn: "হিফয শুনানি", en: "Hifz Shunani", ar: "تسميع التحفيظ" }, slug: "hifz-shunani" },
    { title: { bn: "কিতাবখানা", en: "Kitab Khana", ar: "كتاب خانة" }, slug: "madani-nessab" },
    { title: { bn: "কিন্ডারগার্টেন", en: "Kindergarten", ar: "روضة الأطفال" }, slug: "kindergarten" }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selBranchId || !selClassId || !selExamId || !searchQuery.trim()) {
      return toast.error("Please fill in all fields");
    }

    setHasSearched(true);
    setSearchResult(null);
    setSearchStudent(null);

    try {
      // 1. Find the student by roll number / ID in the selected branch and class
      // Note: Since selClassId is now the Section ID directly from the select dropdown options, we can query it directly.
      const q = searchQuery.trim();
      const isNumeric = /^\d+$/.test(q);
      let orFilter = `roll_number.eq.${q}`;
      if (isNumeric) {
        orFilter += `,id.eq.${q}`;
      }

      let studentQuery = supabase
        .from("students")
        .select("id, roll_number, full_name_en, full_name_bn, branch_id, class_id, session_id, class_group_id, status")
        .eq("branch_id", Number(selBranchId))
        .or(orFilter);

      if (selectedOption) {
        if (selectedOption.id !== selectedOption.parentClassId) {
          studentQuery = studentQuery.or(`class_id.eq.${selectedOption.id},and(class_id.eq.${selectedOption.parentClassId},session_id.eq.${selectedOption.id})`);
        } else {
          studentQuery = studentQuery.eq("class_id", selectedOption.id);
        }
      }

      const { data: studentsFound, error: studentError } = await studentQuery;

      if (studentError) {
        throw studentError;
      }

      const student = studentsFound && studentsFound[0];

      if (!student) {
        setSearchResult(null);
        return;
      }

      setSearchStudent(student);

      // 2. Find the exam result for this student and exam
      const results = await appClient.entities.ExamResult.filter({
        exam_id: Number(selExamId),
        student_id: student.id
      });

      if (results && results.length > 0) {
        const res = results[0];
        const marksDetails = Array.isArray(res.marks_details) ? res.marks_details : [];
        const total_full_marks = marksDetails.reduce((sum, m) => sum + Number(m.full_marks || 0), 0);
        const total_obtained_marks = marksDetails.reduce((sum, m) => sum + Number(m.obtained_marks || 0), 0);
        
        const isFailed = marksDetails.some(m => m.obtained_marks === "" || Number(m.obtained_marks) < Number(m.pass_marks));
        const totalGpaPoints = marksDetails.reduce((sum, m) => {
          if (m.obtained_marks === "") return sum;
          // The GPA logic is basic here, mimicking ExamManager
          const ratio = Number(m.obtained_marks) / Number(m.full_marks);
          const p = ratio * 100;
          let gp = 0;
          if (p >= 80) gp = 5;
          else if (p >= 70) gp = 4;
          else if (p >= 60) gp = 3.5;
          else if (p >= 50) gp = 3;
          else if (p >= 40) gp = 2;
          else if (p >= 33) gp = 1;
          return sum + gp;
        }, 0);
        
        const gpa = marksDetails.length > 0 ? totalGpaPoints / marksDetails.length : 0;
        let grade = "F";
        if (!isFailed) {
          if (gpa === 5) grade = "A+";
          else if (gpa >= 4) grade = "A";
          else if (gpa >= 3.5) grade = "A-";
          else if (gpa >= 3) grade = "B";
          else if (gpa >= 2) grade = "C";
          else if (gpa >= 1) grade = "D";
        }

        setSearchResult({
          ...res,
          total_full_marks,
          total_obtained_marks,
          gpa,
          grade,
          status: isFailed ? "fail" : "pass"
        });
      } else {
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Result search error:", err);
      setSearchResult(null);
    }
  };

  const handlePrint = () => {
    if (!searchStudent || !searchResult) return;
    const examObj = exams.find(e => String(e.id) === String(selExamId));
    const fullClassName = selectedOption?.label || "Class";

    const html = getPrintableMarksheetHTML(
      searchStudent, 
      selectedBranch, 
      fullClassName, 
      examObj, 
      searchResult, 
      settingsObj
    );
    const printWindow = window.open("", "_blank");
    printWindow.document.open("text/html", "replace");
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className={`min-h-screen bg-slate-50 py-16 px-4 ${isAr ? 'direction-rtl' : ''}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`mb-12 ${isAr ? 'text-right' : ''}`}>
          <Link href="/" className={`inline-flex items-center gap-2 text-sm font-bold italic text-[#004D3A] hover:text-[#003d2b] transition-all ${isAr ? 'flex-row-reverse' : ''}`}>
            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            {t.common?.backHome || "Back to Home"}
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-4 uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700">
            {isBn ? "ফলাফল অনুসন্ধান" : isAr ? "البحث عن النتائج" : "Result Search"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold italic text-slate-900 mb-4">
            {isBn ? "পরীক্ষার ফলাফল ও মার্কশিট ডাউনলোড" : isAr ? "نتائج الامتحانات وتحميل ورقة العلامات" : "Exam Results & Marksheet Download"}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto italic">
            {isBn ? "আপনার শাখা, শ্রেণী এবং রোল নম্বর দিয়ে সার্চ করে আপনার মার্কশিট ডাউনলোড ও প্রিন্ট করুন।" : "Enter your branch, class, exam, and student roll number to view and download your marksheet."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-24 bg-emerald-100" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <div className="h-px w-24 bg-emerald-100" />
          </div>
        </motion.div>

        {/* ── Search Form Section ── */}
        <Card className="border-0 shadow-xl rounded-[24px] bg-white overflow-hidden max-w-3xl mx-auto mb-16">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Branch *</label>
                  <Select value={selBranchId} onValueChange={v => { setSelBranchId(v); setSelClassId(""); setSelExamId(""); setHasSearched(false); }}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Class *</label>
                  <Select value={selClassId} onValueChange={v => { setSelClassId(v); setSelExamId(""); setHasSearched(false); }} disabled={!selBranchId}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {classOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Exam *</label>
                  <Select value={selExamId} onValueChange={v => { setSelExamId(v); setHasSearched(false); }} disabled={!selClassId}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>
                      {filteredExams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Student Roll / ID *</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setHasSearched(false); }}
                      placeholder="e.g. 2024-001"
                      className="h-12 pl-10 rounded-xl border-slate-200 focus:border-[#004D3A] focus:ring-[#004D3A]/20"
                      required
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-[#004D3A] to-[#003d2b] text-white font-bold text-sm tracking-wide transition-transform hover:scale-[1.01] active:scale-95 shadow-md">
                <Search className="h-4.5 w-4.5 mr-2" /> {isBn ? "ফলাফল দেখুন" : "Search Result"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Results Preview Section ── */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto mb-16">
              {!searchStudent ? (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-800 space-y-3">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <h3 className="font-extrabold text-lg">{isBn ? "ছাত্র খুঁজে পাওয়া যায়নি" : "Student Not Found"}</h3>
                  <p className="text-xs text-red-600/80 max-w-sm mx-auto">
                    {isBn ? "প্রদত্ত রোল নম্বর এবং সিলেক্টেড শ্রেণী দিয়ে কোনো ছাত্র পাওয়া যায়নি। দয়া করে সঠিক রোল নম্বর দিন।" : "Please double check the Roll ID, Branch, and Class selections and try again."}
                  </p>
                </div>
              ) : !searchResult ? (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center text-amber-800 space-y-3">
                  <AlertCircle className="h-12 w-12 text-amber-600 mx-auto" />
                  <h3 className="font-extrabold text-lg">{isBn ? "ফলাফল এখনো প্রকাশ করা হয়নি" : "Result Not Found"}</h3>
                  <p className="text-xs text-amber-700/80 max-w-md mx-auto">
                    Student <strong>{searchStudent.full_name_en}</strong> found, but no marksheet has been submitted for this exam yet.
                  </p>
                </div>
              ) : (
                // Beautiful Marksheet Preview Card
                <Card className="border-0 shadow-2xl rounded-[32px] overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700"><CheckCircle2 className="h-6 w-6" /></div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{isBn ? "মার্কশিট প্রিভিউ" : "Marksheet Preview"}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Found and verified successfully</p>
                      </div>
                    </div>
                    <Button onClick={handlePrint} className="bg-[#004D3A] hover:bg-[#003d2b] text-white gap-2 font-bold rounded-xl h-11 px-6 shadow-md transition-transform active:scale-95">
                      <Printer className="h-4.5 w-4.5" /> {isBn ? "মার্কশিট প্রিন্ট / ডাউনলোড" : "Print / Download PDF"}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Student Profile Preview */}
                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Student Name</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{searchStudent.full_name_en}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Student ID / Roll</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5 font-mono">#{searchStudent.roll_number || searchStudent.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Branch</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedBranch?.name_bn || selectedBranch?.name_en}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-bold text-[9px]">Class / Section</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedOption?.label || "Class"}</p>
                      </div>
                    </div>

                    {/* Overall Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 rounded-xl p-3 text-center border border-slate-100">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Total Marks</p>
                        <p className="text-lg font-extrabold text-slate-800">{searchResult.total_obtained_marks} <span className="text-xs font-medium text-slate-400">/ {searchResult.total_full_marks}</span></p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">GPA</p>
                        <p className="text-lg font-extrabold text-slate-800" style={searchResult.status === "fail" ? { color: "red" } : {}}>{searchResult.status === "fail" ? "0.00" : searchResult.gpa?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Grade</p>
                        <p className="text-lg font-extrabold text-slate-800" style={searchResult.status === "fail" ? { color: "red" } : {}}>{searchResult.status === "fail" ? "F" : searchResult.grade}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Position</p>
                        <p className="text-lg font-extrabold text-[#004D3A]">#{searchResult.rank || "N/A"}</p>
                      </div>
                    </div>

                    {/* Subjects Marks List */}
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
                      <table className="w-full text-xs text-center">
                        <thead>
                          <tr className="bg-slate-50 border-b">
                            <th className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">Subject</th>
                            <th className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">Full Marks</th>
                            <th className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">Pass Marks</th>
                            <th className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">Obtained Marks</th>
                            <th className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">Letter Grade</th>
                            <th className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider">GP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(searchResult.marks_details || []).map(sub => {
                            const isSubFailed = sub.obtained_marks < sub.pass_marks;
                            const { grade, gpa } = calcSubjectGradeAndGPA(sub.obtained_marks, sub.full_marks);
                            return (
                              <tr key={sub.subject_id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 text-left font-bold text-slate-800">{sub.subject_name?.bn || sub.subject_name?.en || sub.subject_name}</td>
                                <td className="py-3 px-4 text-slate-500 font-semibold">{sub.full_marks}</td>
                                <td className="py-3 px-4 text-red-500/80 font-semibold">{sub.pass_marks}</td>
                                <td className="py-3 px-4 font-extrabold text-sm" style={isSubFailed ? { color: "red" } : { color: "#004D3A" }}>{sub.obtained_marks}</td>
                                <td className="py-3 px-4 font-bold">
                                  <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${isSubFailed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                    {isSubFailed ? "F" : grade}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-600">{isSubFailed ? "0.00" : gpa.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Legacy Department Results Grid List (Kept Intact) ── */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/departments/${cat.slug}#results`}
              className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold italic text-slate-900 group-hover:text-[#004D3A] transition-colors">
                  {isBn ? cat.title.bn : isAr ? cat.title.ar : cat.title.en}
                </h3>
              </div>
              <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#004D3A] group-hover:text-white transition-all ${isAr ? 'rotate-180' : ''}`}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
