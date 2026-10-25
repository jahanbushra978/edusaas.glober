"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName } from "@/lib/academic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Plus, CreditCard, Loader2, Pencil, Trash2 } from "lucide-react";

import ExamForm from "./exam/ExamForm";
import ExamResultEntry from "./exam/ExamResultEntry";
import AdminResultDashboard from "./exam/AdminResultDashboard";

const AdmitCardManager = dynamic(() => import("./AdmitCardManager"), { ssr: false });

export {
  EXAM_TYPE_OPTIONS,
  RESULT_SYSTEM_OPTIONS,
  GRADE_COLORS,
  calcSubjectGradeAndGPA,
  calcOverallGrade,
  calcQawmiDarajah,
  calcQawmiOverallDarajah,
  calcQawmiDivision,
  getSubjectDisplayName,
  getFlatClassOptions,
  findStudentInList,
  RankBadge,
} from "./exam/examCalculations";

export {
  getPrintableMarksheetInnerContent,
  getFullTranscriptDocumentHTML,
  getPrintableMarksheetHTML,
  recalculateMeritRanks,
  printResultSheet,
  printBlankMarksheet,
} from "./exam/examMarksheetPrint";

export default function ExamManager({ students, currentUser }) {
  const { data: teachers = [] } = useQuery({
    queryKey: ["admin-teachers-for-results"],
    queryFn: () => appClient.entities.Teacher.listAll(),
  });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("exams");
  const [showExamForm, setShowExamForm] = useState(false);
  const [editExam, setEditExam] = useState(null);

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: () => appClient.entities.Exam.list("-academic_year", 200),
  });

  const { data: appSettings } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const settingsList = Array.isArray(appSettings) ? appSettings : (appSettings?.rows || []);
  const settingsObj = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  const createExamMut = useMutation({
    mutationFn: (d) => appClient.entities.Exam.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
  });

  const updateExamMut = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.Exam.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
    },
  });

  const deleteExamMut = useMutation({
    mutationFn: (id) => appClient.entities.Exam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      toast.success("Exam deleted successfully!");
    },
  });

  const handleSaveExam = async (d) => {
    try {
      if (editExam) {
        try {
          await updateExamMut.mutateAsync({ id: editExam.id, d });
        } catch (err) {
          if (err?.message?.includes("subject_schedules") || err?.code === "PGRST204" || err?.message?.includes("schema cache")) {
            const { subject_schedules: _subject_schedules, ...fallbackData } = d;
            await updateExamMut.mutateAsync({ id: editExam.id, d: fallbackData });
          } else {
            throw err;
          }
        }
        toast.success("Exam updated successfully!");
      } else {
        const branchObj = branches.find((b) => String(b.id) === String(d.branch_id));
        const branchClasses = branchObj && Array.isArray(branchObj.academic_structure) ? branchObj.academic_structure : [];
        const classObj = branchClasses.find((c) => c.id === d.class_id);
        const payload = {
          ...d,
          session: classObj?.class_name?.en || classObj?.class_name?.bn || "",
        };
        try {
          await createExamMut.mutateAsync(payload);
        } catch (err) {
          if (err?.message?.includes("subject_schedules") || err?.code === "PGRST204" || err?.message?.includes("schema cache")) {
            const { subject_schedules: _subject_schedules, ...fallbackPayload } = payload;
            await createExamMut.mutateAsync(fallbackPayload);
          } else {
            throw err;
          }
        }
        toast.success("Exam created successfully!");
      }
      setShowExamForm(false);
      setEditExam(null);
    } catch (err) {
      toast.error(err.message || "Failed to save exam");
    }
  };

  const handleDeleteExam = async (exam) => {
    if (window.confirm(`Are you sure you want to delete ${exam.title}? All linked results will be lost.`)) {
      await deleteExamMut.mutateAsync(exam.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B] flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#D4AF37]" /> Exam & Results Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create examinations, input subject-wise marks, print transcripts, and generate merit lists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "exams" && (
            <Button
              onClick={() => {
                setEditExam(null);
                setShowExamForm(true);
              }}
              className="bg-[#052E2B] hover:bg-[#031c1a] text-white gap-1.5 text-xs font-bold rounded-xl h-10"
              type="button"
            >
              <Plus className="h-4 w-4" /> Add Exam
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="exams" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1 bg-slate-100 rounded-xl max-w-lg mb-6">
          <TabsTrigger value="exams" className="rounded-lg text-xs font-bold py-2.5">
            Exams List
          </TabsTrigger>
          <TabsTrigger value="entry" className="rounded-lg text-xs font-bold py-2.5">
            Result Entry
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="rounded-lg text-xs font-bold py-2.5">
            Results Dashboard
          </TabsTrigger>
          <TabsTrigger value="admit-card" className="rounded-lg text-xs font-bold py-2.5 flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Admit Card &amp; Seating
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exams">
          {(() => {
            const visibleExams = currentUser?.role === "branch_admin" && currentUser?.branch_id
              ? exams.filter((e) => String(e.branch_id) === String(currentUser.branch_id))
              : exams;

            if (examsLoading) {
              return (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" />
                </div>
              );
            }

            if (visibleExams.length === 0) {
              return (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                  <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">No exams created yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the &quot;Add Exam&quot; button at the top to configure your first examination.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleExams.map((exam) => {
                  const branch = branches.find((b) => String(b.id) === String(exam.branch_id));
                  const fullClassLabel = resolveAcademicDisplayName(
                    exam.class_id,
                    exam.session_id,
                    exam.class_group_id,
                    branch?.academic_structure,
                    "bn"
                  ) || "All";

                  return (
                    <Card key={exam.id} className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl hover:shadow-md transition-all duration-300">
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#052E2B] to-[#D4AF37]" />
                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] uppercase font-extrabold">
                            {exam.exam_type}
                          </Badge>
                          <span className="text-[10px] font-bold text-yellow-600 font-mono">
                            Yr: {exam.academic_year}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{exam.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Branch: {branch?.name_en || branch?.name_bn || "All"} | Class: {fullClassLabel}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 border-t pt-3">
                          <div>
                            <span className="block text-slate-400 font-bold uppercase text-[8px]">Start Date</span>
                            <span className="font-semibold">{exam.start_date || "N/A"}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-bold uppercase text-[8px]">Publish Date</span>
                            <span className="font-semibold text-emerald-600">{exam.result_publish_date || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-1 border-t pt-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-slate-100"
                            onClick={() => {
                              setEditExam(exam);
                              setShowExamForm(true);
                            }}
                            type="button"
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 text-red-500"
                            onClick={() => handleDeleteExam(exam)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="entry">
          <ExamResultEntry branches={branches} exams={exams} students={students} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="dashboard">
          <AdminResultDashboard branches={branches} exams={exams} students={students} teachers={teachers} settings={settingsObj} currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="admit-card">
          <AdmitCardManager branches={branches} exams={exams} currentUser={currentUser} settings={settingsObj} />
        </TabsContent>
      </Tabs>

      <Dialog open={showExamForm} onOpenChange={(v) => { setShowExamForm(v); if (!v) setEditExam(null); }}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#052E2B]">
              {editExam ? "Edit Examination Details" : "Configure New Examination"}
            </DialogTitle>
          </DialogHeader>
          <ExamForm
            exam={editExam}
            branches={branches}
            onSave={handleSaveExam}
            onCancel={() => { setShowExamForm(false); setEditExam(null); }}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
