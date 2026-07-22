import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Loader2, Calculator, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DailyLessonEntry({ students, teacherName }) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessonDate, setLessonDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Standard Form State
  const [formData, setFormData] = useState({
    subject: "",
    lesson_content: "",
    pages_covered: "",
    quality_score: "",
    memorization: "good",
    teacher_notes: "",
  });

  // Hifz Detailed Form State
  const [hifzFormData, setHifzFormData] = useState({
    day: format(new Date(), "EEEE"),
    // 2. Sabaq (New Lesson)
    sabaq: { para: "", page: "", amount: "" },
    // 3. Sat Sabaq (Revision)
    satSabaq: { para: "", page: "", totalPages: "", lokma: "" },
    // 4. Amukta
    amukta: { para: "", page: "", totalPages: "", lokma: "" },
    // 5. Daily Tilawat
    dailyTilawat: "",
    // 6. Oral Test Questions
    oralQuestions: [
      { question: "", comment: "", para: "", page: "", totalPages: "", lokma: "" }
    ],
    // 7. Weekly Report
    weeklySobinaPara: "",
    weeklyReportDone: false,
    // 8. Custom Note
    customNote: "",
    // 9. Calculation Results
    calculation_results: {
      total_para_completed: 0,
      total_sabaq_pages: 0,
      total_sat_sabaq_para: 0,
      total_sat_sabaq_pages: 0,
      total_amukta_para: 0,
      total_amukta_pages: 0,
      total_sobina_para: 0,
      total_revision: 0,
      total_new_lesson: 0,
      total_mistakes: 0,
    }
  });

  const [isCalculated, setIsCalculated] = useState(false);
  const [isHifzStudent, setIsHifzStudent] = useState(false);
  const queryClient = useQueryClient();

  // Detect student type
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find(s => String(s.id) === String(selectedStudent));
      if (student && (student.session === "হিফজ" || student.session === "Hifz")) {
        setIsHifzStudent(true);
        setFormData(prev => ({ ...prev, subject: "Quran (Hifz)" }));
      } else {
        setIsHifzStudent(false);
      }
    }
  }, [selectedStudent, students]);

  // Handle Hifz calculations
  const calculateHifzProgress = () => {
    const sabaqPages = parseFloat(hifzFormData.sabaq.page) || 0;
    const satSabaqPages = parseFloat(hifzFormData.satSabaq.totalPages) || 0;
    const amuktaPages = parseFloat(hifzFormData.amukta.totalPages) || 0;
    const sobinaParaVal = parseFloat(hifzFormData.weeklySobinaPara) || 0;

    const sabaqPara = parseFloat(hifzFormData.sabaq.para) || 0;
    const satSabaqPara = parseFloat(hifzFormData.satSabaq.para) || 0;
    const amuktaPara = parseFloat(hifzFormData.amukta.para) || 0;

    const totalMistakes = 
      (parseInt(hifzFormData.satSabaq.lokma) || 0) + 
      (parseInt(hifzFormData.amukta.lokma) || 0) + 
      hifzFormData.oralQuestions.reduce((sum, q) => sum + (parseInt(q.lokma) || 0), 0);

    const totalRevisionVal = satSabaqPages + amuktaPages;
    const totalNewVal = sabaqPages;

    setHifzFormData(prev => ({
      ...prev,
      calculation_results: {
        total_para_completed: sabaqPara,
        total_sabaq_pages: sabaqPages,
        total_sat_sabaq_para: satSabaqPara,
        total_sat_sabaq_pages: satSabaqPages,
        total_amukta_para: amuktaPara,
        total_amukta_pages: amuktaPages,
        total_sobina_para: sobinaParaVal,
        total_revision: totalRevisionVal,
        total_new_lesson: totalNewVal,
        total_mistakes: totalMistakes,
      }
    }));
    setIsCalculated(true);
    toast.success("Hifz progression statistics calculated!");
  };

  // Add/Remove oral questions
  const addOralQuestion = () => {
    setHifzFormData(prev => ({
      ...prev,
      oralQuestions: [...prev.oralQuestions, { question: "", comment: "", para: "", page: "", totalPages: "", lokma: "" }]
    }));
  };

  const removeOralQuestion = (index) => {
    const list = [...hifzFormData.oralQuestions];
    list.splice(index, 1);
    setHifzFormData(prev => ({ ...prev, oralQuestions: list }));
  };

  const updateOralQuestion = (index, field, value) => {
    const list = [...hifzFormData.oralQuestions];
    list[index][field] = value;
    setHifzFormData(prev => ({ ...prev, oralQuestions: list }));
  };

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.DailyLesson.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Lesson recorded successfully!");
      
      // Update student's total pages covered if applicable
      const totalPagesAdded = isHifzStudent 
        ? hifzFormData.calculation_results.total_sabaq_pages 
        : (formData.pages_covered ? parseInt(formData.pages_covered) : 0);

      if (totalPagesAdded > 0) {
        const student = students.find(s => String(s.id) === String(selectedStudent));
        if (student) {
          const newTotal = (student.total_pages_read || 0) + totalPagesAdded;
          appClient.entities.Student.update(student.id, { total_pages_read: newTotal });
        }
      }

      // Reset
      setSelectedStudent("");
      setIsCalculated(false);
      setFormData({
        subject: "",
        lesson_content: "",
        pages_covered: "",
        quality_score: "",
        memorization: "good",
        teacher_notes: "",
      });
      setHifzFormData({
        day: format(new Date(), "EEEE"),
        sabaq: { para: "", page: "", amount: "" },
        satSabaq: { para: "", page: "", totalPages: "", lokma: "" },
        amukta: { para: "", page: "", totalPages: "", lokma: "" },
        dailyTilawat: "",
        oralQuestions: [{ question: "", comment: "", para: "", page: "", totalPages: "", lokma: "" }],
        weeklySobinaPara: "",
        weeklyReportDone: false,
        customNote: "",
        calculation_results: {
          total_para_completed: 0,
          total_sabaq_pages: 0,
          total_sat_sabaq_para: 0,
          total_sat_sabaq_pages: 0,
          total_amukta_para: 0,
          total_amukta_pages: 0,
          total_sobina_para: 0,
          total_revision: 0,
          total_new_lesson: 0,
          total_mistakes: 0,
        }
      });
    },
  });

  const handleSubmit = (e, isDraft = false) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please select a student.");
      return;
    }

    if (isHifzStudent && !isCalculated) {
      toast.error("Please click 'মোট অগ্রগতি গণনা' (Calculate Progress) before submitting.");
      return;
    }

    const lessonDataPayload = {
      student_id: selectedStudent,
      date: lessonDate,
      subject: isHifzStudent ? "Quran (Hifz)" : formData.subject,
      lesson_content: isHifzStudent 
        ? `হিফজ সবক: পারা ${hifzFormData.sabaq.para}, পৃষ্ঠা ${hifzFormData.sabaq.page}`
        : formData.lesson_content,
      pages_covered: isHifzStudent 
        ? hifzFormData.calculation_results.total_sabaq_pages 
        : (formData.pages_covered ? parseInt(formData.pages_covered) : 0),
      quality_score: isHifzStudent 
        ? (10 - Math.min(10, hifzFormData.calculation_results.total_mistakes)).toString() // Calculate score based on mistakes
        : formData.quality_score,
      memorization: isHifzStudent ? "Hifz Record" : formData.memorization,
      teacher_notes: isHifzStudent ? hifzFormData.customNote : formData.teacher_notes,
      recorded_by: teacherName,
      hifz_details: isHifzStudent ? { ...hifzFormData, status: isDraft ? "draft" : "final" } : {},
    };

    createMutation.mutate(lessonDataPayload);
  };

  const commonSubjects = ["Quran", "Hadith", "Fiqh", "Arabic", "Tafsir", "Aqeedah"];

  return (
    <Card className="border-gray-150 rounded-2xl bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-white border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-[#052E2B] text-lg font-bold">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          Record Daily Lesson / সবক
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Student selection & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Select Student *</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name_en} - {student.roll_number} ({student.session || "General"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Date</label>
              <Input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────
              HIFZ STUDENT DETAILED FORM
             ──────────────────────────────────────────────────────────── */}
          {selectedStudent && isHifzStudent ? (
            <div className="space-y-6 border-t pt-5">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  ⭐ Hifz Department Detailed Entry Form (হিফজ রেকর্ড)
                </h3>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  Hifz Student
                </Badge>
              </div>

              {/* Day input */}
              <div className="w-48 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">বার (Day)</label>
                <Input
                  value={hifzFormData.day}
                  onChange={(e) => setHifzFormData({ ...hifzFormData, day: e.target.value })}
                  placeholder="Saturday, Sunday..."
                  className="h-10 rounded-xl"
                />
              </div>

              {/* 2. Sabaq & 3. Sat Sabaq & 4. Amukta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sabaq (New Lesson) */}
                <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">১. সবক (New Lesson)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="পারা (Para)"
                      value={hifzFormData.sabaq.para}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        sabaq: { ...hifzFormData.sabaq, para: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="পৃষ্ঠা (Page)"
                      value={hifzFormData.sabaq.page}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        sabaq: { ...hifzFormData.sabaq, page: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <Input
                    placeholder="পরিমাণ (কতটুকু পড়া হয়েছে)"
                    value={hifzFormData.sabaq.amount}
                    onChange={(e) => setHifzFormData({
                      ...hifzFormData,
                      sabaq: { ...hifzFormData.sabaq, amount: e.target.value }
                    })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* Sat Sabaq (Revision) */}
                <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/10 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">২. সাত সবক (Revision)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="পারা (Para)"
                      value={hifzFormData.satSabaq.para}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        satSabaq: { ...hifzFormData.satSabaq, para: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="পৃষ্ঠা (Page)"
                      value={hifzFormData.satSabaq.page}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        satSabaq: { ...hifzFormData.satSabaq, page: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="মোট পৃষ্ঠা"
                      value={hifzFormData.satSabaq.totalPages}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        satSabaq: { ...hifzFormData.satSabaq, totalPages: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="লোকমা (Mistakes)"
                      value={hifzFormData.satSabaq.lokma}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        satSabaq: { ...hifzFormData.satSabaq, lokma: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {/* Amukta */}
                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/10 space-y-3">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">৩. আমূখতা (Memorization)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="পারা (Para)"
                      value={hifzFormData.amukta.para}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        amukta: { ...hifzFormData.amukta, para: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="পৃষ্ঠা (Page)"
                      value={hifzFormData.amukta.page}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        amukta: { ...hifzFormData.amukta, page: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="মোট পৃষ্ঠা"
                      value={hifzFormData.amukta.totalPages}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        amukta: { ...hifzFormData.amukta, totalPages: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                    <Input
                      placeholder="লোকমা (Mistakes)"
                      value={hifzFormData.amukta.lokma}
                      onChange={(e) => setHifzFormData({
                        ...hifzFormData,
                        amukta: { ...hifzFormData.amukta, lokma: e.target.value }
                      })}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Daily Tilawat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">৪. দৈনিক তিলাওয়াত (Tilawat Field)</label>
                <Input
                  placeholder="Daily Tilawat notes / chapters / count"
                  value={hifzFormData.dailyTilawat}
                  onChange={(e) => setHifzFormData({ ...hifzFormData, dailyTilawat: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>

              {/* 6. Oral Questions Section */}
              <div className="space-y-3 p-4 border border-gray-150 rounded-2xl bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#052E2B] uppercase tracking-wider">৫. দৈনিক প্রশ্ন (Oral Test Section)</h4>
                  <Button type="button" onClick={addOralQuestion} variant="outline" size="sm" className="h-7 text-[10px] font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    + Add Question Entry
                  </Button>
                </div>
                
                {hifzFormData.oralQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-b pb-1.5">
                      <span>Question #{idx + 1}</span>
                      {hifzFormData.oralQuestions.length > 1 && (
                        <button type="button" onClick={() => removeOralQuestion(idx)} className="text-red-500 hover:text-red-700">Delete</button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="প্রশ্ন (Question details)"
                        value={q.question}
                        onChange={(e) => updateOralQuestion(idx, "question", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                      <Input
                        placeholder="উত্তর / মন্তব্য (Answer comment)"
                        value={q.comment}
                        onChange={(e) => updateOralQuestion(idx, "comment", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        placeholder="পারা"
                        value={q.para}
                        onChange={(e) => updateOralQuestion(idx, "para", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                      <Input
                        placeholder="পৃষ্ঠা"
                        value={q.page}
                        onChange={(e) => updateOralQuestion(idx, "page", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                      <Input
                        placeholder="মোট পৃষ্ঠা"
                        value={q.totalPages}
                        onChange={(e) => updateOralQuestion(idx, "totalPages", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                      <Input
                        placeholder="লোকমা"
                        value={q.lokma}
                        onChange={(e) => updateOralQuestion(idx, "lokma", e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. Weekly Report & 8. Custom Note Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weekly Report Box */}
                <div className="p-4 border border-[#D4AF37]/25 rounded-2xl bg-amber-50/10 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">৬. সাপ্তাহিক রিপোর্ট (Weekly Sobina)</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-medium block">এই সপ্তাহে ছবিনা / রিভিশন পারা (সপ্তাহে ১ বার)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. 5"
                        value={hifzFormData.weeklySobinaPara}
                        onChange={(e) => setHifzFormData({ ...hifzFormData, weeklySobinaPara: e.target.value })}
                        disabled={hifzFormData.weeklyReportDone}
                        className="h-10 rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (hifzFormData.weeklySobinaPara) {
                            setHifzFormData({ ...hifzFormData, weeklyReportDone: true });
                            toast.success("Weekly Sobina Para report locked!");
                          } else {
                            toast.error("Please enter a value first.");
                          }
                        }}
                        disabled={hifzFormData.weeklyReportDone}
                        variant={hifzFormData.weeklyReportDone ? "ghost" : "premium"}
                        className="h-10 px-3 text-xs rounded-xl font-bold"
                      >
                        {hifzFormData.weeklyReportDone ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : "সাপ্তাহিক মোট আপডেট"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Custom Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">৭. Custom Note Box (মন্তব্য)</label>
                  <Textarea
                    placeholder="মন্তব্য লিখুন যা রিপোর্টে যুক্ত হবে..."
                    value={hifzFormData.customNote}
                    onChange={(e) => setHifzFormData({ ...hifzFormData, customNote: e.target.value })}
                    rows={4}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>

              {/* 9. Total Calculation System */}
              <div className="p-5 border border-emerald-100 rounded-2xl bg-emerald-50/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Calculator className="h-4 w-4" /> ৮. মোট অগ্রগতি হিসাব
                  </h4>
                  <Button
                    type="button"
                    onClick={calculateHifzProgress}
                    className="h-9 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    মোট অগ্রগতি গণনা
                  </Button>
                </div>

                {isCalculated && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-100 text-xs">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Total Para Completed</p>
                      <p className="font-bold text-slate-800">{hifzFormData.calculation_results.total_para_completed || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Sabaq Pages Completed</p>
                      <p className="font-bold text-slate-800">{hifzFormData.calculation_results.total_sabaq_pages || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Sat Sabaq Pages Completed</p>
                      <p className="font-bold text-slate-800">{hifzFormData.calculation_results.total_sat_sabaq_pages || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Amukta Pages Completed</p>
                      <p className="font-bold text-slate-800">{hifzFormData.calculation_results.total_amukta_pages || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Total Mistakes (Lokma)</p>
                      <p className="font-bold text-red-600">{hifzFormData.calculation_results.total_mistakes || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Total Revision Included</p>
                      <p className="font-bold text-[#052E2B]">{hifzFormData.calculation_results.total_revision || 0} pgs</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Total New Lesson Included</p>
                      <p className="font-bold text-emerald-700">{hifzFormData.calculation_results.total_new_lesson || 0} pgs</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-[10px]">Weekly Sobina Para</p>
                      <p className="font-bold text-slate-800">{hifzFormData.calculation_results.total_sobina_para || 0} para</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ────────────────────────────────────────────────────────────
                STANDARD STUDENT GENERAL LESSON FORM
               ──────────────────────────────────────────────────────────── */
            selectedStudent && (
              <div className="space-y-4 border-t pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold mb-2 block">Subject / বিষয় *</label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold mb-2 block">Pages Covered</label>
                    <Input
                      type="number"
                      placeholder="Number of pages"
                      value={formData.pages_covered}
                      onChange={(e) => setFormData({ ...formData, pages_covered: e.target.value })}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold mb-2 block">Lesson Content / পাঠ্য *</label>
                  <Textarea
                    placeholder="e.g., Surah Baqarah - Ayah 1-10, or Hadith 5-8 from Bukhari"
                    value={formData.lesson_content}
                    onChange={(e) => setFormData({ ...formData, lesson_content: e.target.value })}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold mb-2 block">Quality Score (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Rate student's performance"
                      value={formData.quality_score}
                      onChange={(e) => setFormData({ ...formData, quality_score: e.target.value })}
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold mb-2 block">Memorization Quality</label>
                    <Select
                      value={formData.memorization}
                      onValueChange={(value) => setFormData({ ...formData, memorization: value })}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">⭐ Excellent</SelectItem>
                        <SelectItem value="good">✅ Good</SelectItem>
                        <SelectItem value="average">➖ Average</SelectItem>
                        <SelectItem value="needs_improvement">⚠️ Needs Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold mb-2 block">Teacher's Notes</label>
                  <Textarea
                    placeholder="Additional feedback, observations, or recommendations"
                    value={formData.teacher_notes}
                    onChange={(e) => setFormData({ ...formData, teacher_notes: e.target.value })}
                    rows={2}
                    className="rounded-xl"
                  />
                </div>
              </div>
            )
          )}

          {/* Form Actions */}
          {selectedStudent && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedStudent("");
                  setIsCalculated(false);
                  setFormData({
                    subject: "",
                    lesson_content: "",
                    pages_covered: "",
                    quality_score: "",
                    memorization: "good",
                    teacher_notes: "",
                  });
                }}
                className="h-10 rounded-xl font-bold px-4"
              >
                Clear Form
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={createMutation.isPending}
                className="h-10 rounded-xl font-bold border-amber-200 text-amber-800 hover:bg-amber-50 px-4"
              >
                Save Draft
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl px-5"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Final Submit
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}