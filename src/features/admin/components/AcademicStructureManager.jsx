import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Plus, Trash2, Building2, Loader2, BookOpen, Users, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { clearAcademicCache } from "@/lib/academic";

export default function AcademicStructureManager({ currentUser }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [form, setForm] = useState({ academic_structure: [] });

  const { data: rawBranches = [], isLoading } = useQuery({
    queryKey: ["branches-admin"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const branches = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const { data: allTeachers = [] } = useQuery({
    queryKey: ["teachers-admin-all"],
    queryFn: () => appClient.entities.Teacher.list("full_name_en", 200),
  });

  const teachers = selectedBranch
    ? allTeachers.filter(t => String(t.branch_id) === String(selectedBranch.id))
    : allTeachers;

  const saveAcademicMut = useMutation({
    mutationFn: ({ id, academic_structure }) => appClient.entities.Branch.update(id, { academic_structure }),
    onSuccess: () => {
      clearAcademicCache();
      queryClient.invalidateQueries({ queryKey: ["branches-admin"] });
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      toast.success("Academic structure updated!");
      setShowDialog(false);
      setSelectedBranch(null);
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update academic structure");
    }
  });

  const openStructure = (b) => {
    setSelectedBranch(b);
    setForm({
      academic_structure: Array.isArray(b.academic_structure)
        ? JSON.parse(JSON.stringify(b.academic_structure))
        : []
    });
    setShowDialog(true);
  };

  const addClass = () => {
    const newClass = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      class_name: { bn: "", en: "", ar: "" },
      sections: [
        {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          section_name: { bn: "", en: "", ar: "" },
          shift: { bn: "", en: "", ar: "" },
          class_teacher_id: "",
          show_on_web: true,
          subjects: []
        }
      ]
    };
    setForm(f => ({ ...f, academic_structure: [...(f.academic_structure || []), newClass] }));
  };

  const addSection = (clsId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          const newSec = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            section_name: { bn: "", en: "", ar: "" },
            shift: { bn: "", en: "", ar: "" },
            class_teacher_id: "",
            show_on_web: true,
            subjects: []
          };
          return { ...c, sections: [...(c.sections || []), newSec] };
        }
        return c;
      })
    }));
  };

  // --- New Group Functions ---
  const addGroup = (clsId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          const newGrp = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            group_name: { bn: "", en: "", ar: "" }
          };
          return { ...c, groups: [...(c.groups || []), newGrp] };
        }
        return c;
      })
    }));
  };

  const updateGroup = (clsId, grpId, field, value) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return {
            ...c,
            groups: c.groups.map(g =>
              g.id === grpId ? { ...g, [field]: value } : g
            )
          };
        }
        return c;
      })
    }));
  };

  const removeGroup = (clsId, grpId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return { ...c, groups: (c.groups || []).filter(g => g.id !== grpId) };
        }
        return c;
      })
    }));
  };

  const updateSection = (clsId, secId, field, value) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return {
            ...c,
            sections: c.sections.map(s => s.id === secId ? { ...s, [field]: value } : s)
          };
        }
        return c;
      })
    }));
  };

  const removeSection = (clsId, secId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return { ...c, sections: c.sections.filter(s => s.id !== secId) };
        }
        return c;
      })
    }));
  };

  const updateClass = (clsId, field, value) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return { ...c, [field]: value };
        }
        return c;
      })
    }));
  };

  const removeClass = (clsId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.filter(c => c.id !== clsId)
    }));
  };

  const addSubject = (clsId, secId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return {
            ...c,
            sections: c.sections.map(s => {
              if (s.id === secId) {
                const newSub = {
                  id: Date.now() + Math.random().toString(36).substr(2, 9),
                  subject_name: { bn: "", en: "", ar: "" },
                  book_name: { bn: "", en: "", ar: "" },
                  full_marks: 100,
                  teacher_id: ""
                };
                return { ...s, subjects: [...(s.subjects || []), newSub] };
              }
              return s;
            })
          };
        }
        return c;
      })
    }));
  };

  const updateSubject = (clsId, secId, subId, field, value) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return {
            ...c,
            sections: c.sections.map(s => {
              if (s.id === secId) {
                return {
                  ...s,
                  subjects: s.subjects.map(sub => sub.id === subId ? { ...sub, [field]: value } : sub)
                };
              }
              return s;
            })
          };
        }
        return c;
      })
    }));
  };

  const removeSubject = (clsId, secId, subId) => {
    setForm(f => ({
      ...f,
      academic_structure: f.academic_structure.map(c => {
        if (c.id === clsId) {
          return {
            ...c,
            sections: c.sections.map(s => {
              if (s.id === secId) {
                return { ...s, subjects: s.subjects.filter(sub => sub.id !== subId) };
              }
              return s;
            })
          };
        }
        return c;
      })
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary">Academic Structure Management</h3>
          <p className="text-xs text-muted-foreground">Manage classes, sections, subjects per branch</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : branches.length === 0 ? (
        <Card className="border-primary/10">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            No branches found. Create a branch first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map(b => (
            <Card key={b.id} className="border-primary/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-[#12715B]" />
                    <div>
                      <p className="font-bold text-slate-800">{b.branch_name || b.name_bn}</p>
                      {b.name_en && b.name_en !== b.branch_name && <p className="text-sm text-slate-600">{b.name_en}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 border-t pt-3 border-slate-100">
                  <span className="text-xs text-slate-500">{b.academic_structure?.length || 0} classes configured</span>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-[#12715B] hover:bg-[#0e5746] text-white rounded-xl font-bold"
                    onClick={() => openStructure(b)}
                  >
                    <GraduationCap className="h-3.5 w-3.5" /> Manage Classes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-white dark:bg-[#0d1f17] border dark:border-green-900 rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b dark:border-green-900">
            <DialogTitle className="text-xl font-extrabold italic text-[#052E2B] dark:text-emerald-400">
              Manage Classes & Sections — {selectedBranch?.branch_name || selectedBranch?.name_en}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-6 py-4">
            <div className="space-y-6 m-0 focus:outline-none">
              <div className="flex items-center justify-between border-b pb-3 dark:border-green-900">
                <div>
                  <h4 className="font-bold text-[#052E2B] dark:text-emerald-400">Classes & Subject Management</h4>
                  <p className="text-[11px] text-muted-foreground">Manage classes, subjects, class teachers, and subject teachers of this branch</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addClass} className="gap-1.5 text-xs bg-[#12715B] hover:bg-[#004D3A] text-white font-bold rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95">
                    <Plus className="h-3.5 w-3.5" /> Add Class
                  </Button>
                </div>
              </div>

              {form.academic_structure?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic text-sm border rounded-2xl border-dashed">
                  No classes added yet. Click "Add Class" to start adding academic programs.
                </div>
              ) : (
                <div className="space-y-6">
                  {form.academic_structure.map((cls, cIdx) => (
                    <div 
                      key={cls.id || cIdx} 
                      className="bg-white dark:bg-[#0c1a13] border-2 border-slate-100 dark:border-green-900/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-[#12715B] overflow-hidden"
                    >
                      <div className="bg-[#12715B]/5 dark:bg-[#12715B]/10 p-3.5 px-5 flex items-center justify-between border-b dark:border-green-900/40">
                        <p className="font-extrabold text-sm text-[#052E2B] dark:text-emerald-400">Class #{cIdx + 1}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer rounded-full" 
                          onClick={() => removeClass(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Name (BN/EN/AR)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input 
                                size="sm" 
                                value={cls.class_name?.bn || ""} 
                                onChange={e => updateClass(cls.id, "class_name", { ...cls.class_name, bn: e.target.value })} 
                                placeholder="নূরানী ১ম শ্রেণী" 
                                className="text-xs h-9 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-xl" 
                              />
                              <Input 
                                size="sm" 
                                value={cls.class_name?.en || ""} 
                                onChange={e => updateClass(cls.id, "class_name", { ...cls.class_name, en: e.target.value })} 
                                placeholder="Noorani 1st Class" 
                                className="text-xs h-9 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-xl" 
                              />
                              <Input 
                                size="sm" 
                                value={cls.class_name?.ar || ""} 
                                onChange={e => updateClass(cls.id, "class_name", { ...cls.class_name, ar: e.target.value })} 
                                placeholder="الصف الأول نوراني" 
                                className="text-xs h-9 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-xl" 
                                dir="rtl" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-emerald-950/5 rounded-xl p-4 border border-slate-100 dark:border-green-950/20 space-y-4">
                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 p-5 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.008] hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-emerald-500/5 group">
                            <div className="flex items-start gap-3.5">
                              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-400/10 text-[#12715B] dark:text-emerald-400 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-500/15 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                <Layers className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-[#052E2B] dark:text-emerald-300 tracking-tight transition-colors duration-300 group-hover:text-[#12715B] dark:group-hover:text-emerald-400">Class Session Name (Sessions / Branches)</h4>
                                <p className="text-[11px] text-slate-500 dark:text-emerald-400/60 font-medium">Manage branch allocations, time sessions, and active cohorts for this academic class.</p>
                              </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-center">
                              <Button 
                                size="sm" 
                                onClick={() => addSection(cls.id)} 
                                className="h-9 text-xs px-4 bg-[#12715B] hover:bg-[#004D3A] text-white rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 hover:shadow-md"
                              >
                                + Add Session
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => addGroup(cls.id)} 
                                className="h-9 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 hover:shadow-md"
                              >
                                + Add Group
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {cls.sections?.map((sec, sIdx) => (
                              <div 
                                key={sec.id || sIdx} 
                                className="border border-emerald-100/80 dark:border-emerald-900/30 rounded-2xl p-5 bg-gradient-to-br from-white to-emerald-50/5 dark:from-[#0a1610] dark:to-[#081f12]/10 shadow-sm hover:border-[#12715B]/40 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 relative space-y-4"
                              >
                                {/* Header Bar for Session Card */}
                                <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 p-3 px-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/10">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-[#12715B]/10 text-[#12715B] dark:text-emerald-400 rounded-md">
                                      <Layers className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-extrabold text-[#052E2B] dark:text-emerald-300 uppercase tracking-wider">
                                      Session #{sIdx + 1}: {sec.section_name?.bn || sec.section_name?.en || "New Session"}
                                    </span>
                                  </div>
                                  
                                  {cls.sections.length > 1 && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer rounded-full" 
                                      onClick={() => removeSection(cls.id, sec.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">Section Name (BN / EN / AR)</label>
                                    <div className="space-y-1.5">
                                      <Input size="sm" value={sec.section_name?.bn || ""} onChange={e => updateSection(cls.id, sec.id, "section_name", { ...sec.section_name, bn: e.target.value })} placeholder="ক শাখা" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" />
                                      <Input size="sm" value={sec.section_name?.en || ""} onChange={e => updateSection(cls.id, sec.id, "section_name", { ...sec.section_name, en: e.target.value })} placeholder="Sec A" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" />
                                      <Input size="sm" value={sec.section_name?.ar || ""} onChange={e => updateSection(cls.id, sec.id, "section_name", { ...sec.section_name, ar: e.target.value })} placeholder="قسم أ" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" dir="rtl" />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-wider block mb-1">Shift (BN / EN / AR)</label>
                                    <div className="space-y-1.5">
                                      <Input size="sm" value={sec.shift?.bn || ""} onChange={e => updateSection(cls.id, sec.id, "shift", { ...sec.shift, bn: e.target.value })} placeholder="সকাল" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" />
                                      <Input size="sm" value={sec.shift?.en || ""} onChange={e => updateSection(cls.id, sec.id, "shift", { ...sec.shift, en: e.target.value })} placeholder="Morning" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" />
                                      <Input size="sm" value={sec.shift?.ar || ""} onChange={e => updateSection(cls.id, sec.id, "shift", { ...sec.shift, ar: e.target.value })} placeholder="صباحي" className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" dir="rtl" />
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 border-t pt-3 dark:border-green-900/40">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-extrabold text-[#052E2B] dark:text-emerald-400 uppercase tracking-wider block">Class Teacher</label>
                                        <select
                                          value={sec.class_teacher_id || ""}
                                          onChange={e => updateSection(cls.id, sec.id, "class_teacher_id", e.target.value)}
                                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 dark:bg-[#0d1f17] dark:border-green-800 focus:border-[#12715B] focus:ring-1 focus:ring-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-pointer outline-none font-medium text-slate-700 dark:text-slate-300"
                                        >
                                          <option value="">Select Teacher</option>
                                          {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name_bn || t.full_name_en}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <Button 
                                        size="xs" 
                                        onClick={() => addSubject(cls.id, sec.id)} 
                                        className="h-7 text-[10px] px-3 bg-[#12715B] hover:bg-[#004D3A] text-white rounded-xl font-bold cursor-pointer transition-colors duration-200"
                                      >
                                        + Add Subject
                                      </Button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Show on Web:</span>
                                      <button
                                        type="button"
                                        onClick={() => updateSection(cls.id, sec.id, "show_on_web", true)}
                                        className={`h-7 px-3 text-[10px] font-extrabold rounded-l-xl transition-all duration-200 border cursor-pointer ${
                                          sec.show_on_web !== false
                                            ? "bg-[#12715B] text-white border-[#12715B]"
                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-[#0d1f17] dark:text-slate-300 dark:border-green-800"
                                        }`}
                                      >
                                        YES
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateSection(cls.id, sec.id, "show_on_web", false)}
                                        className={`h-7 px-3 text-[10px] font-extrabold rounded-r-xl transition-all duration-200 border-y border-r cursor-pointer ${
                                          sec.show_on_web === false
                                            ? "bg-red-600 text-white border-red-600"
                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-[#0d1f17] dark:text-slate-300 dark:border-green-800"
                                        }`}
                                      >
                                        NO
                                      </button>
                                    </div>
                                  </div>

                                  {sec.subjects?.length > 0 && (
                                    <div className="mt-4 bg-slate-50/50 dark:bg-emerald-950/5 rounded-2xl border border-slate-150 dark:border-green-950/20 overflow-hidden transition-all duration-300 hover:scale-[1.008] hover:shadow-md hover:border-violet-200 dark:hover:border-violet-900/30 hover:shadow-violet-500/5 group/sub">
                                      <div className="bg-gradient-to-r from-violet-50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10 p-4 border-b border-slate-200 dark:border-green-950/20 flex items-center gap-3">
                                        <div className="p-2.5 bg-violet-500/10 dark:bg-violet-400/10 text-violet-700 dark:text-violet-400 rounded-lg transition-all duration-300 group-hover/sub:scale-105 group-hover/sub:bg-violet-500/15 group-hover/sub:shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                                          <BookOpen className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-400">Subject Management (Subjects Configuration)</p>
                                          <p className="text-[9px] text-slate-500 dark:text-violet-400/60 font-medium">Configure course names, book names, full mark distributions, and subject instructors.</p>
                                        </div>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-center border-collapse">
                                          <thead>
                                            <tr className="bg-white dark:bg-[#08120d] text-slate-500 border-b border-slate-200 dark:border-green-900/30">
                                              <th className="py-2 px-3 text-left font-bold uppercase tracking-wider text-[9px] w-[28%]">Subject Name (BN/EN/AR)</th>
                                              <th className="py-2 px-3 text-left font-bold uppercase tracking-wider text-[9px] w-[28%]">Book Name (BN/EN/AR)</th>
                                              <th className="py-2 px-2 text-center font-bold uppercase tracking-wider text-[9px] w-[16%]">Full Marks</th>
                                              <th className="py-2 px-3 text-left font-bold uppercase tracking-wider text-[9px] w-[24%]">Teacher</th>
                                              <th className="py-2 px-2 text-center font-bold uppercase tracking-wider text-[9px] w-[4%]"></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {sec.subjects.map((sub, subIdx) => (
                                              <tr key={sub.id || subIdx} className="border-b last:border-b-0 border-slate-200/50 dark:border-green-950/10 hover:bg-slate-50/50 dark:hover:bg-emerald-950/5 transition-colors">
                                                <td className="py-3 px-3 align-middle">
                                                  <div className="space-y-1.5">
                                                    <Input size="sm" value={sub.subject_name?.bn || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "subject_name", { ...sub.subject_name, bn: e.target.value })} placeholder="বিষয় (বাংলা)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" />
                                                    <Input size="sm" value={sub.subject_name?.en || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "subject_name", { ...sub.subject_name, en: e.target.value })} placeholder="Subject (English)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" />
                                                    <Input size="sm" value={sub.subject_name?.ar || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "subject_name", { ...sub.subject_name, ar: e.target.value })} placeholder="الموضوع (عربي)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" dir="rtl" />
                                                  </div>
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                  <div className="space-y-1.5">
                                                    <Input size="sm" value={sub.book_name?.bn || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "book_name", { ...sub.book_name, bn: e.target.value })} placeholder="বই (বাংলা)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" />
                                                    <Input size="sm" value={sub.book_name?.en || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "book_name", { ...sub.book_name, en: e.target.value })} placeholder="Book (English)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" />
                                                    <Input size="sm" value={sub.book_name?.ar || ""} onChange={e => updateSubject(cls.id, sec.id, sub.id, "book_name", { ...sub.book_name, ar: e.target.value })} placeholder="الكتاب (عربي)" className="text-xs h-8 w-full border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg shadow-sm bg-white dark:bg-[#0a1610]" dir="rtl" />
                                                  </div>
                                                </td>
                                                <td className="py-3 px-2 align-middle">
                                                  <div className="flex justify-center">
                                                    <Input 
                                                      size="sm" 
                                                      type="number" 
                                                      value={sub.full_marks || ""} 
                                                      onChange={e => updateSubject(cls.id, sec.id, sub.id, "full_marks", +e.target.value)} 
                                                      placeholder="100" 
                                                      className="text-xs h-8 w-full max-w-[85px] border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg text-center font-bold shadow-sm bg-white dark:bg-[#0a1610] text-slate-800 dark:text-slate-200" 
                                                    />
                                                  </div>
                                                </td>
                                                <td className="py-3 px-3 align-middle">
                                                  <select
                                                    value={sub.teacher_id || ""}
                                                    onChange={e => updateSubject(cls.id, sec.id, sub.id, "teacher_id", e.target.value)}
                                                    className="w-full text-xs h-8 border border-slate-300 rounded-lg px-2.5 bg-white dark:bg-[#0d1f17] dark:border-slate-700 focus:border-[#12715B] focus:ring-1 focus:ring-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-pointer outline-none text-slate-700 dark:text-slate-300 font-medium shadow-sm"
                                                  >
                                                    <option value="">Select Teacher</option>
                                                    {teachers.map(t => (
                                                      <option key={t.id} value={t.id}>{t.full_name_bn || t.full_name_en}</option>
                                                    ))}
                                                  </select>
                                                </td>
                                                <td className="py-3 px-2 align-middle text-center">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors duration-200 cursor-pointer" 
                                                    onClick={() => removeSubject(cls.id, sec.id, sub.id)}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Class Session Group Name (Groups) */}
                        <div className="bg-slate-50/50 dark:bg-blue-950/5 rounded-xl p-4 border border-slate-100 dark:border-blue-950/20 space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5 rounded-2xl border border-blue-100/80 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.008] hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-blue-500/5 group">
                            <div className="flex items-start gap-3.5">
                              <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500/15 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                <Users className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-slate-800 dark:text-blue-300 tracking-tight transition-colors duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Class Session Group Name (Groups)</h4>
                                <p className="text-[11px] text-slate-500 dark:text-blue-400/60 font-medium">Configure specialization groups (e.g. Science, Commerce, Arts, or Para divisions) for students in this class.</p>
                              </div>
                            </div>
                          </div>

                          {cls.groups && cls.groups.length > 0 ? (
                            <div className="space-y-3">
                              {cls.groups.map((grp, gIdx) => (
                                <div key={grp.id || gIdx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                  <span className="text-xs font-bold text-slate-400">#{gIdx + 1}</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                    <Input 
                                      size="sm" 
                                      value={grp.group_name?.bn || ""} 
                                      onChange={e => updateGroup(cls.id, grp.id, "group_name", { ...grp.group_name, bn: e.target.value })} 
                                      placeholder="গ্রুপের নাম (বাংলা)" 
                                      className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" 
                                    />
                                    <Input 
                                      size="sm" 
                                      value={grp.group_name?.en || ""} 
                                      onChange={e => updateGroup(cls.id, grp.id, "group_name", { ...grp.group_name, en: e.target.value })} 
                                      placeholder="Group Name (English)" 
                                      className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" 
                                    />
                                    <Input 
                                      size="sm" 
                                      value={grp.group_name?.ar || ""} 
                                      onChange={e => updateGroup(cls.id, grp.id, "group_name", { ...grp.group_name, ar: e.target.value })} 
                                      placeholder="اسم المجموعة (عربي)" 
                                      className="text-xs h-8 border-slate-200 focus-visible:ring-1 focus-visible:ring-[#12715B] focus:border-[#12715B] hover:border-[#12715B]/50 transition-all duration-200 cursor-text rounded-lg" 
                                      dir="rtl" 
                                    />
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer rounded-full" 
                                    onClick={() => removeGroup(cls.id, grp.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-xl">
                              No groups configured. (Optional)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-green-900 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer shadow-sm" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={() => saveAcademicMut.mutate({ id: selectedBranch.id, academic_structure: form.academic_structure })}
              className="bg-[#12715B] hover:bg-[#004D3A] text-white rounded-xl gap-2 font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              disabled={saveAcademicMut.isPending}
            >
              {saveAcademicMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}