"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXAM_TYPE_OPTIONS,
  RESULT_SYSTEM_OPTIONS,
  getSubjectDisplayName,
} from "./examCalculations";

export default function ExamForm({ exam, branches, onSave, onCancel, currentUser }) {
  const defaultSeatingConfig = {
    examTitle: "", cardTitle: "ADMIT CARD / প্রবেশপত্র", centerName: "",
    startingSeat: "1", seatPrefix: "", seatDigits: "3",
    startingRoom: "1", studentsPerRoom: "20",
  };
  const [seatingCfg, setSeatingCfg] = useState(() => {
    const stored = exam?.seating_config;
    if (stored) {
      if (typeof stored === "string") { try { return { ...defaultSeatingConfig, ...JSON.parse(stored) }; } catch { return defaultSeatingConfig; } }
      if (typeof stored === "object") return { ...defaultSeatingConfig, ...stored };
    }
    return defaultSeatingConfig;
  });
  const updateSeat = (k, v) => setSeatingCfg(p => ({ ...p, [k]: v }));

  const [form, setForm] = useState({
    title: exam?.title || "",
    exam_type: exam?.exam_type || EXAM_TYPE_OPTIONS[0],
    academic_year: exam?.academic_year || new Date().getFullYear().toString(),
    start_date: exam?.start_date || format(new Date(), "yyyy-MM-dd"),
    end_date: exam?.end_date || format(new Date(), "yyyy-MM-dd"),
    result_publish_date: exam?.result_publish_date || format(new Date(), "yyyy-MM-dd"),
    is_active: exam?.is_active ?? true,
    result_system: exam?.result_system || "general",
    branch_id: exam?.branch_id ? String(exam.branch_id) : (currentUser?.role === "branch_admin" ? String(currentUser.branch_id) : ""),
    class_id: exam?.class_id || "",
    session_id: exam?.session_id || "",
    class_group_id: exam?.class_group_id || "",
  });

  const [subjectSchedules, setSubjectSchedules] = useState(() => {
    if (Array.isArray(exam?.subject_schedules)) return exam.subject_schedules;
    if (typeof exam?.subject_schedules === "string") {
      try { return JSON.parse(exam.subject_schedules); } catch { return []; }
    }
    return [];
  });
  
  const [saving, setSaving] = useState(false);
  
  const selectedBranch = branches.find(b => String(b.id) === String(form.branch_id));
  const classes = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];
  
  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Compute available subjects for selected Class / Session / Group
  const currentClass = classes.find(c => String(c.id) === String(form.class_id));
  let availableSubjects = [];
  if (currentClass) {
    if (form.session_id && Array.isArray(currentClass.sections) && currentClass.sections.length > 0) {
      const sec = currentClass.sections.find(s => String(s.id) === String(form.session_id));
      if (sec && Array.isArray(sec.subjects) && sec.subjects.length > 0) {
        availableSubjects = sec.subjects;
      }
    }
    if (availableSubjects.length === 0 && form.class_group_id && Array.isArray(currentClass.groups) && currentClass.groups.length > 0) {
      const grp = currentClass.groups.find(g => String(g.id) === String(form.class_group_id));
      if (grp && Array.isArray(grp.subjects) && grp.subjects.length > 0) {
        availableSubjects = grp.subjects;
      }
    }
    if (availableSubjects.length === 0 && Array.isArray(currentClass.subjects) && currentClass.subjects.length > 0) {
      availableSubjects = currentClass.subjects;
    }
  }

  return (
    <form onSubmit={async e => {
      e.preventDefault();
      if (!form.branch_id) {
        return toast.error("Please select a Branch");
      }
      if (!form.class_id) {
        return toast.error("Please select a Class");
      }
      
      if (currentClass) {
        const hasSessions = Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
        const hasGroups = Array.isArray(currentClass.groups) && currentClass.groups.length > 0;

        if (hasSessions && !form.session_id) {
          return toast.error("Please select a Class Session (Section)");
        }
        if (hasGroups && !form.class_group_id) {
          return toast.error("Please select a Group");
        }
      }

      // Build finalized subject_schedules array ensuring every available subject has an entry
      const finalSchedules = availableSubjects.map((sub, idx) => {
        const subName = getSubjectDisplayName(sub);
        const subId = sub.id || idx;
        const existing = subjectSchedules.find(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
        return {
          subject_id: subId,
          subject_name: subName,
          date: existing?.date || form.start_date || "",
          time: existing?.time || "9:00 AM - 12:00 PM",
        };
      });
      
      setSaving(true);
      try {
        const payload = {
          ...form,
          branch_id: Number(form.branch_id),
          is_active: form.is_active === true || String(form.is_active) === "true",
          session: classes.find(c => c.id === form.class_id)?.class_name?.en || classes.find(c => c.id === form.class_id)?.class_name?.bn || "",
          total_marks: 100,
          subject_schedules: finalSchedules
        };
        await onSave({ ...payload, seating_config: seatingCfg });
      } catch (err) {
        toast.error(err.message || "Failed to save exam");
      } finally {
        setSaving(false);
      }
    }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Name (English/Bengali) *</label>
          <Input value={form.title} onChange={e => updateForm("title", e.target.value)} required placeholder="e.g. Annual Examination - 2026" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Type *</label>
          <Select value={form.exam_type} onValueChange={v => updateForm("exam_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXAM_TYPE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Branch *</label>
          <Select value={form.branch_id} onValueChange={v => { updateForm("branch_id", v); updateForm("class_id", ""); updateForm("session_id", ""); updateForm("class_group_id", ""); }} disabled={currentUser?.role === "branch_admin"}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Class *</label>
          <Select value={form.class_id} onValueChange={v => { updateForm("class_id", v); updateForm("session_id", ""); updateForm("class_group_id", ""); }} disabled={!form.branch_id}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => {
                const label = c.class_name?.bn || c.class_name?.en || c.class_name || "";
                return <SelectItem key={c.id} value={String(c.id)}>{label}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        {(() => {
          const hasSessions = currentClass && Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
          if (!hasSessions) return null;
          return (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class Session (Section) *</label>
              <Select value={form.session_id} onValueChange={v => updateForm("session_id", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Session" /></SelectTrigger>
                <SelectContent>
                  {currentClass.sections.map(sec => {
                    const label = sec.section_name?.bn || sec.section_name?.en || sec.section?.bn || sec.section?.en || "";
                    return <SelectItem key={sec.id} value={String(sec.id)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          );
        })()}
        {(() => {
          const hasGroups = currentClass && Array.isArray(currentClass.groups) && currentClass.groups.length > 0;
          if (!hasGroups) return null;
          return (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Class Session Group *</label>
              <Select value={form.class_group_id} onValueChange={v => updateForm("class_group_id", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
                <SelectContent>
                  {currentClass.groups.map(grp => {
                    const label = grp.group_name?.bn || grp.group_name?.en || "";
                    return <SelectItem key={grp.id} value={String(grp.id)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          );
        })()}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Academic Year *</label>
          <Input 
            type="text" 
            value={form.academic_year || ""} 
            onChange={e => updateForm("academic_year", e.target.value)} 
            placeholder="e.g. 2026"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[#052E2B] block mb-1 font-semibold">Status</label>
          <Select value={form.is_active ? "Active" : "Inactive"} onValueChange={v => updateForm("is_active", v === "Active")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Result System <span className="text-emerald-700 font-extrabold">*</span>
          </label>
          <Select value={form.result_system} onValueChange={v => updateForm("result_system", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RESULT_SYSTEM_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
            {form.result_system === "qawmi"
              ? "কওমি মোড: রেজাল্টে GPA/Grade-এর বদলে দারাজাহ (মুমতাজ, জায়্যিদ-জিদ্দান, জায়্যিদ, মাকবুল, রাসিব) প্রদর্শিত হবে।"
              : "General: সাধারণ শিক্ষা পদ্ধতি — GPA ও Grade (A+, A, A-, B, C, D, F) দেখাবে।"}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam Start Date</label>
          <Input type="date" value={form.start_date} onChange={e => updateForm("start_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Exam End Date</label>
          <Input type="date" value={form.end_date} onChange={e => updateForm("end_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Result Publish Date</label>
          <Input type="date" value={form.result_publish_date} onChange={e => updateForm("result_publish_date", e.target.value)} />
        </div>
      </div>

      {/* ── Subject-Wise Exam Routine Setup ── */}
      {availableSubjects.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-[#052E2B] uppercase tracking-wider block">
              📅 বিষয়ভিত্তিক পরীক্ষার সময়সূচী (Subject Exam Routine)
            </label>
            <span className="text-[11px] text-slate-500 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              মোট বিষয়: {availableSubjects.length} টি
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-white">
                  <th className="p-2 w-8 text-center">#</th>
                  <th className="p-2 min-w-[130px]">বিষয় (Subject)</th>
                  <th className="p-2 min-w-[135px]">তারিখ (Date)</th>
                  <th className="p-2 min-w-[145px]">সময় (Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {availableSubjects.map((sub, idx) => {
                  const subName = getSubjectDisplayName(sub);
                  const subId = sub.id || idx;
                  const schedule = subjectSchedules.find(s => String(s.subject_id) === String(subId) || s.subject_name === subName) || {};
                  const curDate = schedule.date || form.start_date || "";
                  const curTime = schedule.time || "9:00 AM - 12:00 PM";

                  return (
                    <tr key={subId} className="hover:bg-white/80 transition-colors">
                      <td className="p-2 text-center font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-800 break-words max-w-[160px]">{subName}</td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={curDate}
                          onChange={e => {
                            const newDate = e.target.value;
                            setSubjectSchedules(prev => {
                              const exists = prev.some(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
                              if (exists) {
                                return prev.map(s => (String(s.subject_id) === String(subId) || s.subject_name === subName) ? { ...s, date: newDate } : s);
                              }
                              return [...prev, { subject_id: subId, subject_name: subName, date: newDate, time: curTime }];
                            });
                          }}
                          className="h-8 text-xs rounded-lg bg-white border-slate-300"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={curTime}
                          placeholder="9:00 AM - 12:00 PM"
                          onChange={e => {
                            const newTime = e.target.value;
                            setSubjectSchedules(prev => {
                              const exists = prev.some(s => String(s.subject_id) === String(subId) || s.subject_name === subName);
                              if (exists) {
                                return prev.map(s => (String(s.subject_id) === String(subId) || s.subject_name === subName) ? { ...s, time: newTime } : s);
                              }
                              return [...prev, { subject_id: subId, subject_name: subName, date: curDate, time: newTime }];
                            });
                          }}
                          className="h-8 text-xs rounded-lg bg-white border-slate-300 font-sans"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Seating & Admit Card Configuration ── */}
      <div className="border-t pt-4 mt-2 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold text-[#052E2B] uppercase tracking-wider">🎓 Admit Card &amp; Seating Configuration</span>
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">Used in Admit Card &amp; Serial Sheet</span>
        </div>
        <div className="bg-[#052E2B]/5 rounded-2xl border border-[#052E2B]/15 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">পরীক্ষার নাম / Exam Title (Admit Card)</label>
              <Input value={seatingCfg.examTitle} onChange={e => updateSeat("examTitle", e.target.value)} placeholder="e.g. বার্ষিক পরীক্ষা ২০২৬" className="h-9 text-xs rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">কার্ডের শিরোনাম / Card Title</label>
              <Input value={seatingCfg.cardTitle} onChange={e => updateSeat("cardTitle", e.target.value)} placeholder="e.g. প্রবেশপত্র" className="h-9 text-xs rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">পরীক্ষা কেন্দ্র / Exam Center Name</label>
              <Input value={seatingCfg.centerName} onChange={e => updateSeat("centerName", e.target.value)} placeholder="e.g. রহমানিয়া মাদরাসা পরীক্ষা কেন্দ্র" className="h-9 text-xs rounded-xl" />
            </div>
          </div>
          <div className="border-t border-[#052E2B]/10 pt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Seat / Room Auto-Assignment</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Starting Seat #</label>
                <Input type="number" value={seatingCfg.startingSeat} onChange={e => updateSeat("startingSeat", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Seat Prefix</label>
                <Input value={seatingCfg.seatPrefix} onChange={e => updateSeat("seatPrefix", e.target.value)} placeholder="e.g. S-" className="h-9 text-xs rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Digit Padding</label>
                <Input type="number" value={seatingCfg.seatDigits} onChange={e => updateSeat("seatDigits", e.target.value)} className="h-9 text-xs rounded-xl" min="1" max="6" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Starting Room #</label>
                <Input type="number" value={seatingCfg.startingRoom} onChange={e => updateSeat("startingRoom", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">Students Per Room</label>
                <Input type="number" value={seatingCfg.studentsPerRoom} onChange={e => updateSeat("studentsPerRoom", e.target.value)} className="h-9 text-xs rounded-xl" min="1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#052E2B] hover:bg-[#031c1a] text-white" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {exam ? "Update Exam" : "Create Exam"}
        </Button>
      </div>
    </form>
  );
}