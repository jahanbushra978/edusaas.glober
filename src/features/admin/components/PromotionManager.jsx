import React, { useState, useMemo, useCallback } from "react";
import { appClient } from "@/api/appClient";
import { resolveAcademicDisplayName, isStudentInClassOption } from "@/lib/academic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GraduationCap, Users, Search, ChevronRight,
  ArrowUpDown, Check, X, Download, Printer, FileText,
  Loader2, History, RotateCcw, Settings, Eye,
  AlertTriangle, BookOpen, Building2
} from "lucide-react";
import { format } from "date-fns";
import QRCode from "qrcode";
import { drawBengaliText, drawBengaliTextWrapped } from "../../../lib/pdf-utils";

async function apiPromotion(action, data) {
  const res = await fetch("/api/admin/promotion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}

const SESSION_OPTIONS = [
  "২০২৪", "২০২৫", "২০২৬", "২০২৭", "২০২৮",
  "2024", "2025", "2026", "2027", "2028"
];

export default function PromotionManager({ currentUser }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("promote");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-amber-500" />
            Promote to Next Class
          </h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-emerald-900/5 border border-emerald-900/10">
          <TabsTrigger value="promote" className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-2" />
            Promote Students
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-emerald-900 data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>

        </TabsList>

        <TabsContent value="promote">
          <PromoteStudents currentUser={currentUser} />
        </TabsContent>
        <TabsContent value="history">
          <PromotionHistory currentUser={currentUser} />
        </TabsContent>

      </Tabs>
    </div>
  );
}

function PromoteStudents({ currentUser }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    session: "",
    branchId: "",
    classId: "",
    section: "all"
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [promoteTo, setPromoteTo] = useState({
    session: "",
    branchId: "__same__",
    classId: "",
    section: "__same__"
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [promoting, setPromoting] = useState(false);

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["branches-admin"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const branches = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager"
    ? rawBranches.filter(b => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const branchIdNum = filters.branchId ? Number(filters.branchId) : null;

  const selectedBranch = branches.find(b => String(b.id) === String(filters.branchId));

  const classes = useMemo(() => {
    if (!selectedBranch?.academic_structure) return [];
    return selectedBranch.academic_structure.map(c => ({
      id: c.id,
      name: c.class_name?.bn || c.class_name?.en || c.class_name?.ar || String(c.id),
      nameEn: c.class_name?.en || "",
      nameBn: c.class_name?.bn || "",
      sections: c.sections || []
    }));
  }, [selectedBranch]);

  const selectedClass = classes.find(c => String(c.id) === String(filters.classId));

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["promotion-students", filters.branchId, filters.classId],
    queryFn: async () => {
      if (!filters.branchId) return [];
      let res;
      try {
        res = await appClient.entities.Student.filter({
          branch_id: branchIdNum,
          status: "active"
        });
        if (Array.isArray(res)) return res;
      } catch (e) {
        console.warn("[Promotion] filter failed, falling back to list:", e.message);
      }
      res = await appClient.entities.Student.listAll({ sort: "-created_date" });
      return res.filter(s => {
        if (String(s.branch_id) !== String(branchIdNum)) return false;
        if (s.status !== "active") return false;
        return true;
      });
    },
    enabled: !!filters.branchId,
    staleTime: 30000,
  });

  const filteredStudents = useMemo(() => {
    let result = students;
    if (filters.classId) {
      result = result.filter(s => isStudentInClassOption(s, filters.classId, selectedBranch?.academic_structure));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.full_name_en || "").toLowerCase().includes(q) ||
        (s.full_name_bn || "").toLowerCase().includes(q) ||
        (s.roll_number || "").toLowerCase().includes(q) ||
        (s.father_name || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [students, filters.classId, selectedBranch, searchQuery]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  }, [filteredStudents, selectedIds]);

  const toggleStudent = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedStudents = useMemo(() =>
    filteredStudents.filter(s => selectedIds.has(s.id)),
    [filteredStudents, selectedIds]
  );

  const handlePromoteClick = () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!promoteTo.classId) {
      toast.error("Please select the next class");
      return;
    }
    setShowConfirm(true);
  };

  const executePromotion = useCallback(async () => {
    setPromoting(true);
    try {
      const batchNumber = `PROMO-${format(new Date(), "yyyyMMdd-HHmmss")}`;
      const newClassName = classes.find(c => String(c.id) === String(promoteTo.classId))?.name || promoteTo.classId;
      const oldClassName = selectedClass?.name || filters.classId;
      const targetBranchId = promoteTo.branchId !== "__same__" ? promoteTo.branchId : String(filters.branchId);
      const targetSection = promoteTo.section !== "__same__" ? promoteTo.section : filters.section;
      const newBranchName = branches.find(b => String(b.id) === String(targetBranchId))?.name_en || "";

      const promoRes = await apiPromotion("create_promotion", {
        batch_number: batchNumber,
        academic_session: promoteTo.session || filters.session || "",
        branch_id: branchIdNum,
        previous_class: oldClassName,
        new_class: newClassName,
        previous_section: filters.section !== "all" ? filters.section : "",
        new_section: targetSection !== "all" ? targetSection : "",
        total_students: selectedStudents.length,
        performed_by: currentUser?.name || currentUser?.email || currentUser?.loginId || "admin",
        status: "completed",
      });

      if (!promoRes?.id) throw new Error("Failed to create promotion record");

      let successCount = 0;
      let failCount = 0;

      for (const student of selectedStudents) {
        try {
          await appClient.entities.Student.update(student.id, {
            class_id: String(promoteTo.classId),
            class_name: newClassName,
            branch_id: Number(targetBranchId),
            session: promoteTo.session || student.session || "",
          });

          await apiPromotion("create_promotion_student", {
            promotion_id: promoRes.id,
            student_id: student.id,
            old_class: student.class_name || oldClassName,
            new_class: newClassName,
            old_branch_id: student.branch_id,
            new_branch_id: Number(targetBranchId),
            old_session: student.session || "",
            new_session: promoteTo.session || student.session || "",
            status: "success",
          });
          successCount++;
        } catch (err) {
          failCount++;
          await apiPromotion("create_promotion_student", {
            promotion_id: promoRes.id,
            student_id: student.id,
            old_class: student.class_name || oldClassName,
            new_class: newClassName,
            old_branch_id: student.branch_id,
            new_branch_id: Number(targetBranchId),
            old_session: student.session || "",
            new_session: promoteTo.session || student.session || "",
            status: "failed",
            error_message: err.message,
          });
        }
      }

      await apiPromotion("update_promotion", {
        id: promoRes.id,
        successful_count: successCount,
        failed_count: failCount,
      });

      setResult({ success: successCount, failed: failCount, total: selectedStudents.length });
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["promotion-students"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-history"] });
      toast.success(`Successfully promoted ${successCount} students!`);
    } catch (err) {
      toast.error(err?.message || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  }, [selectedStudents, promoteTo, filters, classes, selectedClass, branches, branchIdNum, currentUser, queryClient]);

  if (result) {
    return (
      <SuccessReport
        result={result}
        onDone={() => {
          setResult(null);
          setSelectedIds(new Set());
          setPromoteTo({ session: "", branchId: "", classId: "", section: "" });
        }}
        selectedStudents={selectedStudents}
        promoteTo={promoteTo}
        filters={filters}
      />
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-emerald-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Input
                value={filters.session}
                onChange={e => setFilters(f => ({ ...f, session: e.target.value }))}
                placeholder="e.g. ২০২৬, 2026, or any session name"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={filters.branchId} onValueChange={v => {
                setFilters(f => ({ ...f, branchId: v, classId: "", section: "all" }));
                setSelectedIds(new Set());
              }}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en || b.branch_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={filters.classId} onValueChange={v => {
                setFilters(f => ({ ...f, classId: v, section: "all" }));
                setSelectedIds(new Set());
              }} disabled={!filters.branchId}>
                <SelectTrigger><SelectValue placeholder={!filters.branchId ? "Select branch first" : "Select class"} /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={filters.section} onValueChange={v => setFilters(f => ({ ...f, section: v }))} disabled={!selectedClass?.sections?.length}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClass?.sections?.length ? "No sections" : "All sections"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {selectedClass?.sections?.map(sec => (
                    <SelectItem key={sec.id} value={String(sec.id)}>
                      {sec.section_name?.bn || sec.section_name?.en || sec.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {studentsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filters.branchId ? (
        <>
          <Card className="border-emerald-900/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Students ({filteredStudents.length})
                  {selectedIds.size > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                      {selectedIds.size} selected
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll} className="border-emerald-900/20">
                    {selectedIds.size === filteredStudents.length ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                    {selectedIds.size === filteredStudents.length ? "Unselect All" : "Select All"}
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, roll, father..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-emerald-900/5 sticky top-0">
                    <tr>
                      <th className="p-3 text-left w-10">
                        <Checkbox
                          checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Photo</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Name</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">ID</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Roll</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Father</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Class</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Branch</th>
                      <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => (
                      <tr
                        key={s.id}
                        className={`border-t border-emerald-900/5 hover:bg-emerald-50/50 transition-colors cursor-pointer ${selectedIds.has(s.id) ? "bg-emerald-50/80" : ""}`}
                        onClick={() => toggleStudent(s.id)}
                      >
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selectedIds.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                        </td>
                        <td className="p-3">
                          <Avatar className="w-8 h-8 border border-emerald-900/10">
                            <AvatarImage src={s.photo_url} />
                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-800">
                              {(s.full_name_en?.[0] || s.full_name_bn?.[0] || "?").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium text-slate-800">{s.full_name_bn || s.full_name_en || "—"}</div>
                          {s.full_name_bn && s.full_name_en && s.full_name_en !== s.full_name_bn && (
                            <div className="text-xs text-muted-foreground">{s.full_name_en}</div>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{s.id}</td>
                        <td className="p-3 text-sm font-mono">{s.roll_number || "—"}</td>
                        <td className="p-3 text-sm text-muted-foreground">{s.father_name || "—"}</td>
                        <td className="p-3 text-sm max-w-[200px] break-words whitespace-normal text-xs">
                          {(() => {
                            const bObj = branches.find(b => String(b.id) === String(s.branch_id));
                            const academicStructure = bObj?.academic_structure || [];
                            return resolveAcademicDisplayName(s.class_id, s.session_id, s.class_group_id, academicStructure, 'bn') || s.class_name || selectedClass?.name || "—";
                          })()}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {branches.find(b => String(b.id) === String(s.branch_id))?.name_en || "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                          {filters.classId ? "No active students found in this class" : "Please select a class to view students"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedIds.size > 0 && (
            <Card className="border-amber-500/20 bg-amber-50/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-amber-500" />
                  Promote To
                  <Badge className="ml-2 bg-emerald-900 text-white">{selectedIds.size} student{selectedIds.size > 1 ? "s" : ""}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Next Academic Session</Label>
                    <Input
                      value={promoteTo.session}
                      onChange={e => setPromoteTo(p => ({ ...p, session: e.target.value }))}
                      placeholder="e.g. ২০২৬, 2026, or any session"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Branch</Label>
                    <Select value={promoteTo.branchId} onValueChange={v => setPromoteTo(p => ({ ...p, branchId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Same branch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__same__">Same Branch</SelectItem>
                        {branches.map(b => (
                          <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Next Class</Label>
                    <Select value={promoteTo.classId} onValueChange={v => setPromoteTo(p => ({ ...p, classId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select next class" /></SelectTrigger>
                      <SelectContent>
                        {classes.filter(c => c.id !== filters.classId).map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Next Section</Label>
                    <Select value={promoteTo.section} onValueChange={v => setPromoteTo(p => ({ ...p, section: v }))}>
                      <SelectTrigger><SelectValue placeholder="Same section" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__same__">Same Section</SelectItem>
                        {selectedClass?.sections?.map(sec => (
                          <SelectItem key={sec.id} value={String(sec.id)}>
                            {sec.section_name?.bn || sec.section_name?.en || sec.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handlePromoteClick} className="bg-emerald-900 hover:bg-emerald-800 text-white">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Promote to Next Class
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">Select a branch and class to view students</p>
        </div>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-900">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              Confirm Promotion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-900/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-emerald-900">Current</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-emerald-900">New</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Branch</p><p className="font-medium">{branches.find(b => String(b.id) === String(filters.branchId))?.name_en || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Branch</p><p className="font-medium">{promoteTo.branchId !== "__same__" ? (branches.find(b => String(b.id) === String(promoteTo.branchId))?.name_en || "—") : "Same Branch"}</p></div>
                <div><p className="text-muted-foreground text-xs">Class</p><p className="font-medium">{selectedClass?.name || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Class</p><p className="font-medium">{classes.find(c => String(c.id) === String(promoteTo.classId))?.name || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Session</p><p className="font-medium">{filters.session || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Session</p><p className="font-medium">{promoteTo.session || filters.session || "—"}</p></div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Students: <strong className="text-emerald-900">{selectedStudents.length}</strong>
            </div>
            <ScrollArea className="max-h-32 border rounded-lg">
              {selectedStudents.slice(0, 20).map(s => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-1 border-b last:border-0 text-sm">
                  <Check className="w-3 h-3 text-green-500 shrink-0" />
                  <span className="font-medium truncate">{s.full_name_bn || s.full_name_en}</span>
                  <span className="text-muted-foreground shrink-0">({s.roll_number || s.id})</span>
                </div>
              ))}
              {selectedStudents.length > 20 && (
                <div className="px-3 py-1.5 text-xs text-muted-foreground">...and {selectedStudents.length - 20} more</div>
              )}
            </ScrollArea>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>This will update student records. You can rollback later from History tab.</span>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={promoting}>Cancel</Button>
            <Button className="bg-emerald-900 hover:bg-emerald-800 text-white" onClick={executePromotion} disabled={promoting}>
              {promoting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GraduationCap className="w-4 h-4 mr-2" />}
              {promoting ? "Promoting..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuccessReport({ result, onDone, selectedStudents, promoteTo, filters }) {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-900 mb-2">Promotion Complete!</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{result.success}</div>
              <div className="text-sm text-muted-foreground">Promoted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{result.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-600">{result.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={onDone} className="bg-emerald-900 hover:bg-emerald-800 text-white">
              <GraduationCap className="w-4 h-4 mr-2" />
              Promote More Students
            </Button>
            <Button variant="outline" className="border-emerald-900/20" onClick={() => queryClient.invalidateQueries({ queryKey: ["promotion-history"] })}>
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromotionHistory({ currentUser }) {
  const queryClient = useQueryClient();
  const [rollbackId, setRollbackId] = useState(null);
  const [rollingBack, setRollingBack] = useState(false);

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["promotion-history"],
      queryFn: () => apiPromotion("list_promotions", { limit: 500 }),
    staleTime: 10000,
  });

  const handleRollback = async (promotion) => {
    if (!window.confirm(`Are you sure you want to rollback the promotion of ${promotion.total_students} students from ${promotion.new_class} back to ${promotion.previous_class}?`)) return;

    setRollingBack(true);
    setRollbackId(promotion.id);
    try {
      const students = await apiPromotion("list_promotion_students", { filters: { promotion_id: promotion.id } });
      const batch = Array.isArray(students) ? students : [];
      let restored = 0;

      for (const ps of batch) {
        if (ps.status !== "success") continue;
        try {
          const updates = {};
          if (ps.old_class) updates.class_name = ps.old_class;
          if (ps.old_class) updates.class_id = ps.old_class;
          if (ps.old_branch_id) updates.branch_id = ps.old_branch_id;
          if (ps.old_session) updates.session = ps.old_session;
          await apiPromotion("update_student", { id: ps.student_id, ...updates });
          restored++;
        } catch (err) {
          console.error("Rollback student failed:", ps.student_id, err);
        }
      }

      await apiPromotion("update_promotion", {
        id: promotion.id,
        status: "rolled_back",
        rolled_back_at: new Date().toISOString(),
        rolled_back_by: currentUser?.name || currentUser?.email || "admin",
      });

      queryClient.invalidateQueries({ queryKey: ["promotion-history"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-students"] });
      toast.success(`Rollback complete! ${restored} students restored.`);
    } catch (err) {
      toast.error(err?.message || "Rollback failed");
    } finally {
      setRollingBack(false);
      setRollbackId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-4 mt-6">
      <Card className="border-emerald-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Promotion History
            <Badge variant="secondary" className="ml-2">{promotions.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {promotions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No promotions yet.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-900/5 sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Date</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Batch</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Branch</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Previous Class</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">New Class</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Students</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">Status</th>
                    <th className="p-3 text-left text-xs font-semibold text-emerald-900 uppercase">By</th>
                    <th className="p-3 text-right text-xs font-semibold text-emerald-900 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(p => (
                    <tr key={p.id} className="border-t border-emerald-900/5 hover:bg-emerald-50/50 transition-colors">
                      <td className="p-3 text-sm">{format(new Date(p.created_date), "dd MMM yyyy")}</td>
                      <td className="p-3 text-sm font-mono text-xs">{p.batch_number}</td>
                      <td className="p-3 text-sm">{p.branch_name || "—"}</td>
                      <td className="p-3 text-sm">{p.previous_class}</td>
                      <td className="p-3 text-sm font-medium text-emerald-700">{p.new_class}</td>
                      <td className="p-3 text-sm">
                        <span className="font-medium">{p.successful_count || p.total_students}</span>
                        {p.failed_count > 0 && <span className="text-red-500 text-xs ml-1">({p.failed_count} failed)</span>}
                        <span className="text-muted-foreground text-xs ml-1">/ {p.total_students}</span>
                      </td>
                      <td className="p-3">
                        {p.status === "rolled_back" ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Rolled Back</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{p.performed_by || "—"}</td>
                      <td className="p-3 text-right">
                        {p.status !== "rolled_back" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleRollback(p)}
                            disabled={rollingBack && rollbackId === p.id}
                          >
                            {rollingBack && rollbackId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <RotateCcw className="w-3 h-3 mr-1" />
                            )}
                            Rollback
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CertificateGenerator({ currentUser }) {
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotion-history"],
    queryFn: () => apiPromotion("list_promotions", { limit: 200 }),
    staleTime: 10000,
  });

  const { data: promotionStudents = [] } = useQuery({
    queryKey: ["certificate-students", selectedPromotion],
    queryFn: async () => {
      const res = await apiPromotion("list_promotion_students", { filters: { promotion_id: Number(selectedPromotion) } });
      return Array.isArray(res) ? res : [];
    },
    enabled: !!selectedPromotion,
  });

  const studentIds = useMemo(() =>
    promotionStudents.filter(ps => ps.status === "success").map(ps => ps.student_id),
    [promotionStudents]
  );

  const { data: students = [] } = useQuery({
    queryKey: ["certificate-student-details", studentIds.join(",")],
    queryFn: async () => {
      if (studentIds.length > 100) {
        const all = await appClient.entities.Student.listAll({ sort: "-created_date" });
        return all.filter(s => studentIds.includes(s.id));
      }
      const results = [];
      for (const id of studentIds) {
        try {
          const s = await appClient.entities.Student.get(id);
          if (s) results.push(s);
        } catch { }
      }
      return results;
    },
    enabled: studentIds.length > 0,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-admin"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list().then(res =>
      Object.fromEntries(res.map(s => [s.key, s.value]))
    ),
  });

  const promotionData = promotions.find(p => String(p.id) === selectedPromotion);

  const filteredStudents = useMemo(() => {
    if (!selectedBranchFilter || selectedBranchFilter === "__all__") return students;
    return students.filter(s => String(s.branch_id) === String(selectedBranchFilter));
  }, [students, selectedBranchFilter]);

  const generateSinglePDF = async (student) => {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297;

    const certSettings = settings.promotion_certificate || {};
    const branchInfo = branches.find(b => String(b.id) === String(student.branch_id));
    const branchLogo = branchInfo?.logo_url || branchInfo?.logo;
    const logoUrl = branchLogo || certSettings.logo_url || settings.logo_url || "/rahmania-logo-v2.png";

    const bgColor = certSettings.bg_color || "#ffffff";
    const borderColor1 = certSettings.border_color_1 || "#005235";
    const borderColor2 = certSettings.border_color_2 || "#D4AF37";
    const titleColor = certSettings.title_color || "#005235";
    const fontColor = certSettings.font_color || "#1e293b";

    const titleTxt = certSettings.title_bn || "প্রশংসাপত্র";
    const bodyTemplate = certSettings.body_bn ||
      "অত্র প্রতিষ্ঠানের {{student_name}} পিতা/মাতা {{father_name}} ও {{mother_name}}কে জানানো যাচ্ছে যে, তিনি {{class}} শ্রেণী হতে {{next_class}} শ্রেণীতে উন্নীত হইয়াছেন। ইহা তাঁহার অগ্রগতির স্বীকৃতি স্বরূপ প্রদান করা হইল।";

    const body = bodyTemplate
      .replace(/{{student_name}}/g, student.full_name_bn || student.full_name_en || "")
      .replace(/{{father_name}}/g, student.father_name || "")
      .replace(/{{mother_name}}/g, student.mother_name || "")
      .replace(/{{class}}/g, promotionData?.previous_class || "")
      .replace(/{{next_class}}/g, promotionData?.new_class || "")
      .replace(/{{branch}}/g, branchInfo?.name_bn || branchInfo?.name_en || "")
      .replace(/{{session}}/g, promotionData?.academic_session || "")
      .replace(/{{date}}/g, format(new Date(), "dd MMMM yyyy"))
      .replace(/{{student_id}}/g, String(student.id))
      .replace(/{{roll_number}}/g, student.roll_number || "");

    const certNumber = `CERT-${format(new Date(), "yyyyMMdd")}-${String(promotionData?.id || 0).padStart(4, "0")}-${String(student.id).padStart(4, "0")}`;

    doc.setFillColor(hexToRgb(bgColor));
    doc.rect(0, 0, W, H, "F");

    doc.setDrawColor(...hexToRgb(borderColor1));
    doc.setLineWidth(1.5);
    doc.rect(5, 5, W - 10, H - 10, "D");
    doc.setDrawColor(...hexToRgb(borderColor2));
    doc.setLineWidth(0.5);
    doc.rect(7, 7, W - 14, H - 14, "D");

    try {
      const logoImg = await loadImageElement(logoUrl);
      if (logoImg) doc.addImage(logoImg, "PNG", 85, 15, 40, 40);
    } catch { }

    let currentY = 65;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...hexToRgb(titleColor));
    drawBengaliText(doc, titleTxt, W / 2, currentY, 26, titleColor, "center");
    currentY += 12;

    doc.setDrawColor(...hexToRgb(borderColor2));
    doc.setLineWidth(0.3);
    doc.line(40, currentY, W - 40, currentY);
    currentY += 10;

    if (student.photo_url && certSettings.show_student_photo !== false) {
      try {
        const photoImg = await loadImageElement(student.photo_url);
        if (photoImg) {
          doc.addImage(photoImg, "JPEG", W / 2 - 12, currentY, 24, 30);
          currentY += 38;
        }
      } catch { }
    }

    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(fontColor));
    const lines = drawBengaliTextWrapped(doc, body, W - 40, 11, fontColor, "center");
    for (const line of lines) {
      if (currentY > 260) break;
      drawBengaliText(doc, line, W / 2, currentY, 11, fontColor, "center");
      currentY += 7;
    }

    currentY = Math.max(currentY + 15, 230);

    const details = [
      ["Student ID", String(student.id)],
      ["Roll Number", student.roll_number || "—"],
      ["Certificate No", certNumber],
      ["Session", promotionData?.academic_session || "—"],
    ];
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    details.forEach(([label, value], i) => {
      doc.text(`${label}: ${value}`, 15, currentY + i * 5);
    });

    currentY += 5;

    const infoLines = [
      `Father's Name: ${student.father_name || "—"}`,
      `Mother's Name: ${student.mother_name || "—"}`,
      `Branch: ${branchInfo?.name_bn || branchInfo?.name_en || "—"}`,
      `From: ${promotionData?.previous_class || "—"} → To: ${promotionData?.new_class || "—"}`,
      `Date: ${format(new Date(), "dd/MM/yyyy")}`,
    ];
    infoLines.forEach((line, i) => {
      doc.text(line, 15, currentY + i * 5);
    });

    if (certSettings.show_qr_code !== false) {
      try {
        const verifyUrl = `https://rahmaniainstitute.org/verify-certificate?code=${certNumber}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 60, margin: 0 });
        doc.addImage(qrDataUrl, "PNG", W - 45, currentY + 5, 30, 30);
        doc.setFontSize(6);
        doc.text("Scan to verify", W - 30, currentY + 40, { align: "center" });
      } catch { }
    }

    currentY += 60;
    if (currentY < 255) currentY = 255;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.line(15, currentY, W / 2 - 10, currentY);
    drawBengaliText(doc, "Principal Signature", W / 4, currentY + 6, 10, "#505050", "center");
    doc.line(W / 2 + 10, currentY, W - 15, currentY);
    drawBengaliText(doc, "Head Teacher Signature", (W / 2 + W - 15) / 2, currentY + 6, 10, "#505050", "center");

    if (certSettings.show_seal !== false) {
      doc.setDrawColor(...hexToRgb(borderColor2));
      doc.setLineWidth(0.3);
      doc.circle(W - 30, 245, 10, "D");
      doc.setFontSize(5);
      doc.text("OFFICE SEAL", W - 30, 248, { align: "center" });
    }

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`, W / 2, H - 10, { align: "center" });

    return { doc, certNumber };
  };

  const handleOutput = async (mode) => {
    const targets = selectedPromotion
      ? promotionStudents.filter(ps => ps.status === "success" && selectedStudentIds.has(ps.student_id))
      : [];

    if (targets.length === 0) {
      toast.error("No students selected");
      return;
    }

    if (mode === "print") setPrinting(true);
    else setGenerating(true);
    setGeneratedCount(0);

    const pdfs = [];
    for (const ps of targets) {
      try {
        const student = filteredStudents.find(s => s.id === ps.student_id);
        if (!student) continue;
        const { doc, certNumber } = await generateSinglePDF(student);
        pdfs.push({ doc, certNumber, name: student.full_name_bn || student.full_name_en });
        setGeneratedCount(prev => prev + 1);
      } catch (err) {
        console.error("Certificate failed:", err);
      }
    }

    if (mode === "print") {
      setPrinting(false);
      if (pdfs.length === 0) { toast.error("No certificates generated"); return; }
      const printWin = window.open("", "_blank", "width=900,height=700");
      if (!printWin) { toast.error("Popup blocked! Allow popups for print."); return; }
      let html = `<!DOCTYPE html><html><head><title>Print Certificates</title>
<style>
  @page { margin: 0; size: A4 portrait; }
  body { margin: 0; padding: 0; }
  .cert-page { width: 210mm; height: 297mm; page-break-after: always; position: relative; overflow: hidden; }
  .cert-page:last-child { page-break-after: auto; }
</style></head><body>`;
      for (const p of pdfs) {
        const dataUrl = p.doc.output("datauristring");
        html += `<div class="cert-page"><embed src="${dataUrl}" type="application/pdf" width="100%" height="100%" /></div>`;
      }
      html += `<script>window.onload = function() { setTimeout(function() { window.print(); }, 1000); };<\/script></body></html>`;
      printWin.document.write(html);
      printWin.document.close();
    } else {
      for (const p of pdfs) {
        p.doc.save(`certificate-${p.certNumber}.pdf`);
      }
      setGenerating(false);
      if (pdfs.length > 0) toast.success(`${pdfs.length} certificate(s) downloaded!`);
    }
  };

  const handleGenerateAll = () => {
    const allSuccess = promotionStudents.filter(ps => ps.status === "success");
    const filtered = selectedBranchFilter && selectedBranchFilter !== "__all__"
      ? allSuccess.filter(ps => filteredStudents.some(s => s.id === ps.student_id))
      : allSuccess;
    setSelectedStudentIds(new Set(filtered.map(ps => ps.student_id)));
    setTimeout(() => handleOutput("download"), 200);
  };

  return (
    <div className="space-y-4 mt-6">
      <Card className="border-emerald-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Generate Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Promotion Batch</Label>
              <Select value={selectedPromotion} onValueChange={v => {
                setSelectedPromotion(v);
                setSelectedBranchFilter("");
                setSelectedStudentIds(new Set());
              }}>
                <SelectTrigger><SelectValue placeholder="Choose a promotion batch" /></SelectTrigger>
                <SelectContent>
                  {promotions.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.previous_class} → {p.new_class} ({format(new Date(p.created_date), "dd/MM/yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch Filter (optional)</Label>
              <Select value={selectedBranchFilter} onValueChange={v => { setSelectedBranchFilter(v); setSelectedStudentIds(new Set()); }}>
                <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Branches</SelectItem>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPromotion && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                  {filteredStudents.length} students eligible
                  {selectedBranchFilter && ` (filtered by branch)`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="border-emerald-900/20"
                    onClick={handleGenerateAll}
                    disabled={generating || printing || filteredStudents.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All ({filteredStudents.length})
                  </Button>
                </div>
              </div>

              {filteredStudents.length > 0 && (
                <ScrollArea className="max-h-80 border rounded-lg">
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-emerald-900/5 sticky top-0">
                      <tr>
                        <th className="p-2 text-left text-xs font-semibold text-emerald-900 uppercase w-10">
                          <Checkbox
                            checked={selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={() => {
                              if (selectedStudentIds.size === filteredStudents.length) setSelectedStudentIds(new Set());
                              else setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
                            }}
                          />
                        </th>
                        <th className="p-2 text-left text-xs font-semibold text-emerald-900 uppercase">Branch</th>
                        <th className="p-2 text-left text-xs font-semibold text-emerald-900 uppercase">Student</th>
                        <th className="p-2 text-left text-xs font-semibold text-emerald-900 uppercase">Class</th>
                        <th className="p-2 text-left text-xs font-semibold text-emerald-900 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => {
                        const sBranch = branches.find(b => String(b.id) === String(s.branch_id));
                        return (
                          <tr key={s.id} className="border-t border-emerald-900/5">
                            <td className="p-2">
                              <Checkbox
                                checked={selectedStudentIds.has(s.id)}
                                onCheckedChange={() => {
                                  setSelectedStudentIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(s.id)) next.delete(s.id);
                                    else next.add(s.id);
                                    return next;
                                  });
                                }}
                              />
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">{sBranch?.name_bn || sBranch?.name_en || "—"}</td>
                            <td className="p-2">
                              <div className="text-sm font-medium">{s.full_name_bn || s.full_name_en}</div>
                              <div className="text-xs text-muted-foreground">{s.roll_number || ""}</div>
                            </td>
                            <td className="p-2 text-sm">{promotionData?.previous_class} → {promotionData?.new_class}</td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-700 hover:text-emerald-900"
                                onClick={async () => {
                                  const { doc } = await generateSinglePDF(s);
                                  doc.save(`certificate-${s.id}.pdf`);
                                }}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </ScrollArea>
              )}

              {selectedStudentIds.size > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={() => handleOutput("download")} disabled={generating || printing} className="bg-emerald-900 hover:bg-emerald-800 text-white">
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {generating ? `${generatedCount}/${selectedStudentIds.size}` : `Download ${selectedStudentIds.size} PDF`}
                  </Button>
                  <Button onClick={() => handleOutput("print")} disabled={generating || printing} variant="outline" className="border-emerald-900/20">
                    {printing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                    {printing ? "Preparing..." : `Print ${selectedStudentIds.size}`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CertificateSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["app-settings-all"],
    queryFn: () => appClient.entities.AppSettings.list().then(res =>
      Object.fromEntries(res.map(s => [s.key, s.value]))
    ),
  });

  const certSettings = settings.promotion_certificate || {};

  const [form, setForm] = useState({
    title_bn: certSettings.title_bn || "প্রশংসাপত্র",
    title_en: certSettings.title_en || "Promotion Certificate",
    title_ar: certSettings.title_ar || "شهادة الترقية",
    body_bn: certSettings.body_bn ||
      "অত্র প্রতিষ্ঠানের {{student_name}} পিতা/মাতা {{father_name}} ও {{mother_name}}কে জানানো যাচ্ছে যে, তিনি {{class}} শ্রেণী হতে {{next_class}} শ্রেণীতে উন্নীত হইয়াছেন। ইহা তাঁহার অগ্রগতির স্বীকৃতি স্বরূপ প্রদান করা হইল।\n\nতাঁহার অগ্রগতি কামনায়,\n{{branch}}\n{{session}}",
    body_en: certSettings.body_en ||
      "This is to certify that {{student_name}}, son/daughter of {{father_name}} and {{mother_name}}, has been promoted from {{class}} to {{next_class}}.\n\nBest wishes for future progress.\n{{branch}}\n{{session}}",
    body_ar: certSettings.body_ar ||
      "يشهد المركز بأن الطالب {{student_name}} ابن {{father_name}} و{{mother_name}} قد انتقل من الصف {{class}} إلى الصف {{next_class}}.\n\nنسأل الله له دوام التوفيق.\n{{branch}}\n{{session}}",
    logo_url: certSettings.logo_url || settings.logo_url || "",
    bg_color: certSettings.bg_color || "#ffffff",
    border_color_1: certSettings.border_color_1 || "#005235",
    border_color_2: certSettings.border_color_2 || "#D4AF37",
    title_color: certSettings.title_color || "#005235",
    font_color: certSettings.font_color || "#1e293b",
    show_qr_code: certSettings.show_qr_code !== false,
    show_seal: certSettings.show_seal !== false,
    show_student_photo: certSettings.show_student_photo !== false,
  });

  React.useEffect(() => {
    if (certSettings && Object.keys(certSettings).length > 0) {
      setForm(prev => ({
        ...prev,
        title_bn: certSettings.title_bn || prev.title_bn,
        title_en: certSettings.title_en || prev.title_en,
        title_ar: certSettings.title_ar || prev.title_ar,
        body_bn: certSettings.body_bn || prev.body_bn,
        body_en: certSettings.body_en || prev.body_en,
        body_ar: certSettings.body_ar || prev.body_ar,
        logo_url: certSettings.logo_url || prev.logo_url,
        bg_color: certSettings.bg_color || prev.bg_color,
        border_color_1: certSettings.border_color_1 || prev.border_color_1,
        border_color_2: certSettings.border_color_2 || prev.border_color_2,
        title_color: certSettings.title_color || prev.title_color,
        font_color: certSettings.font_color || prev.font_color,
        show_qr_code: certSettings.show_qr_code !== false,
        show_seal: certSettings.show_seal !== false,
        show_student_photo: certSettings.show_student_photo !== false,
      }));
    }
  }, [certSettings]);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await appClient.entities.AppSettings.list();
      const promoSetting = existing.find(s => s.key === "promotion_certificate");
      if (promoSetting) {
        await appClient.entities.AppSettings.update(promoSetting.id, { value: form });
      } else {
        await appClient.entities.AppSettings.create({ key: "promotion_certificate", value: form });
      }
      queryClient.invalidateQueries({ queryKey: ["app-settings-all"] });
      queryClient.invalidateQueries({ queryKey: ["app-settings-public"] });
      toast.success("Certificate settings saved!");
    } catch (err) {
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="border-emerald-900/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Certificate Customization
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-900/20" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-900 hover:bg-emerald-800 text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </CardHeader>
      </Card>

      {previewMode ? (
        <CertificatePreview form={form} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-emerald-900/10">
            <CardHeader><CardTitle className="text-base">Text Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Title (Bangla)</Label>
                  <Input value={form.title_bn} onChange={e => update("title_bn", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input value={form.title_en} onChange={e => update("title_en", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Title (Arabic)</Label>
                  <Input value={form.title_ar} onChange={e => update("title_ar", e.target.value)} dir="rtl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Body (Bangla)</Label>
                <Textarea rows={6} value={form.body_bn} onChange={e => update("body_bn", e.target.value)} className="font-bn" />
              </div>
              <div className="space-y-2">
                <Label>Body (English)</Label>
                <Textarea rows={4} value={form.body_en} onChange={e => update("body_en", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Body (Arabic)</Label>
                <Textarea rows={4} value={form.body_ar} onChange={e => update("body_ar", e.target.value)} dir="rtl" className="font-ar" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Available variables:</strong>
                <code className="block mt-1 space-x-2">
                  {`{{student_name}} {{father_name}} {{mother_name}} {{class}} {{next_class}} {{branch}} {{session}} {{date}} {{student_id}} {{roll_number}}`}
                </code>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-emerald-900/10">
              <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input value={form.logo_url} onChange={e => update("logo_url", e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={form.bg_color} onChange={e => update("bg_color", e.target.value)} className="w-12 p-1" />
                      <Input value={form.bg_color} onChange={e => update("bg_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border 1</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={form.border_color_1} onChange={e => update("border_color_1", e.target.value)} className="w-12 p-1" />
                      <Input value={form.border_color_1} onChange={e => update("border_color_1", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border 2 (Gold)</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={form.border_color_2} onChange={e => update("border_color_2", e.target.value)} className="w-12 p-1" />
                      <Input value={form.border_color_2} onChange={e => update("border_color_2", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={form.title_color} onChange={e => update("title_color", e.target.value)} className="w-12 p-1" />
                      <Input value={form.title_color} onChange={e => update("title_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={form.font_color} onChange={e => update("font_color", e.target.value)} className="w-12 p-1" />
                      <Input value={form.font_color} onChange={e => update("font_color", e.target.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-900/10">
              <CardHeader><CardTitle className="text-base">Elements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.show_qr_code} onChange={e => update("show_qr_code", e.target.checked)} className="rounded" />
                  <span className="text-sm">Show QR Code (verification)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.show_seal} onChange={e => update("show_seal", e.target.checked)} className="rounded" />
                  <span className="text-sm">Show Office Seal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.show_student_photo} onChange={e => update("show_student_photo", e.target.checked)} className="rounded" />
                  <span className="text-sm">Show Student Photo</span>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CertificatePreview({ form }) {
  return (
    <Card className="border-emerald-900/10">
      <CardContent className="p-8">
        <div
          className="mx-auto border-2"
          style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundColor: form.bg_color,
            borderColor: form.border_color_1,
            padding: "15mm",
            position: "relative",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            fontFamily: "'Hind Siliguri', sans-serif"
          }}
        >
          <div style={{ border: `2px solid ${form.border_color_1}`, height: "100%", padding: "15px", position: "relative" }}>
            <div style={{ border: `1px solid ${form.border_color_2}`, height: "100%", padding: "20px" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#e5e7eb", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#9ca3af" }}>Logo</div>
              </div>
              <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: form.title_color, marginBottom: "10px" }}>
                {form.title_bn || "প্রশংসাপত্র"}
              </h1>
              <hr style={{ borderColor: form.border_color_2, margin: "10px 40px" }} />
              <div style={{ textAlign: "center", fontSize: "12px", lineHeight: "1.8", color: form.font_color, whiteSpace: "pre-line", marginTop: "20px" }}>
                {form.body_bn
                  ? form.body_bn.replace(/{{student_name}}/g, "মুহাম্মদ আরিফ")
                    .replace(/{{father_name}}/g, "আব্দুল করিম")
                    .replace(/{{mother_name}}/g, "ফাতেমা খাতুন")
                    .replace(/{{class}}/g, "পঞ্চম শ্রেণী")
                    .replace(/{{next_class}}/g, "ষষ্ঠ শ্রেণী")
                    .replace(/{{branch}}/g, "রহমানিয়া ইনস্টিটিউট")
                    .replace(/{{session}}/g, "২০২৬")
                    .replace(/{{date}}/g, "১৫ জুলাই ২০২৬")
                    .replace(/{{student_id}}/g, "১২৩৪")
                    .replace(/{{roll_number}}/g, "১০১")
                  : form.body_en
                    ? form.body_en
                      .replace(/{{student_name}}/g, "Muhammad Arif")
                      .replace(/{{father_name}}/g, "Abdul Karim")
                      .replace(/{{mother_name}}/g, "Fatema Khatun")
                      .replace(/{{class}}/g, "Class Five")
                      .replace(/{{next_class}}/g, "Class Six")
                      .replace(/{{branch}}/g, "Rahmania Institute")
                      .replace(/{{session}}/g, "2026")
                    : "Preview text"
                }
              </div>
              <div style={{ position: "absolute", bottom: "30px", left: "30px", right: "30px", display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: `1px solid ${form.border_color_1}`, width: "120px", paddingTop: "4px" }}>Principal Signature</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: `1px solid ${form.border_color_1}`, width: "120px", paddingTop: "4px" }}>Head Teacher Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function loadImageElement(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function hexToRgb(hex) {
  const c = hex.replace("#", "");
  return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)];
}
