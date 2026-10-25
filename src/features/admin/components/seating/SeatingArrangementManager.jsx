import React, { useState, useEffect, useMemo } from "react";
import { appClient } from "@/api/appClient";
import { supabaseAdmin } from "@/lib/supabase-admin-client";
import { resolveAcademicDisplayName } from "@/lib/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Save, Printer, Settings, Layout,
  Layers, Users, CheckCircle2, AlertTriangle, X, ShieldCheck,
  Grid3X3, FileText, Plus, Trash2, RefreshCw, BarChart2, Unlock,
  Maximize2, Minimize2, Tag, CheckSquare
} from "lucide-react";
import { toast } from "sonner";
import HallVisualMap from "./HallVisualMap";
import {
  DEFAULT_RULES,
  DEFAULT_HALL,
  calculateHallCapacity,
  generateBestSeatPlan
} from "./allocationEngine";
import {
  printHallChart,
  printHallDoorPoster,
  printStudentSeatList,
  printBenchWiseSlips,
  printBenchSerialStickers
} from "./seatingPrintUtils";

export default function SeatingArrangementManager({
  isOpen,
  onClose,
  exams = [],
  branches = [],
  currentUser,
  settings,
  initialExamId = null,
  onPlanSaved,
}) {
  const isBranchAdmin = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager";
  const userBranchId = isBranchAdmin && currentUser?.branch_id ? String(currentUser.branch_id) : "";

  // Custom Exam Title (Type Exam Headline) — used in all printouts, slips and banners
  const [customExamTitle, setCustomExamTitle] = useState(() => {
    const match = (initialExamId && exams.find(e => String(e.id) === String(initialExamId))) || exams[0];
    return match?.title || "পরীক্ষার সিট প্ল্যান";
  });

  // Start with the requested exam; additional exams can be selected explicitly.
  const [selectedExamIds, setSelectedExamIds] = useState(() => {
    if (initialExamId && initialExamId !== "all" && exams.some(e => String(e.id) === String(initialExamId))) {
      return [String(initialExamId)];
    }
    if (exams.length > 0) return [String(exams[0].id)];
    if (initialExamId && initialExamId !== "all") return [String(initialExamId)];
    return [];
  });

  // Backward-compatible primary selectedExamId
  const _selectedExamId = selectedExamIds[0] || (exams[0] && String(exams[0].id)) || "";

  // Selected Branch
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    if (userBranchId) return userBranchId;
    if (exams.length > 0 && exams[0].branch_id) return String(exams[0].branch_id);
    return "all";
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Full Screen Mode state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Halls state
  const [halls, setHalls] = useState([DEFAULT_HALL]);
  const [activeHallId, setActiveHallId] = useState(DEFAULT_HALL.id);

  // Rules state
  const [rules, setRules] = useState(DEFAULT_RULES);

  // Allocations & Results
  const [allocations, setAllocations] = useState([]);
  const [qualityScore, setQualityScore] = useState(100);
  const [conflictReport, setConflictReport] = useState({ hasConflicts: false, reasons: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto Generate Hall Numbers Modal state
  const [showAutoNumberModal, setShowAutoNumberModal] = useState(false);
  const [autoNumberConfig, setAutoNumberConfig] = useState({
    prefix: "Hall-",
    startingNum: 1,
    digits: 2,
    count: 3,
  });

  // Active base selected exam object
  const selectedExam = useMemo(() => {
    return exams.find(e => selectedExamIds.includes(String(e.id))) || exams[0] || null;
  }, [exams, selectedExamIds]);

  // Effective Exam object: incorporates user's typed customExamTitle for all printouts and headlines!
  const effectiveExam = useMemo(() => {
    const base = selectedExam || exams[0] || {};
    return {
      ...base,
      title: customExamTitle.trim() || base.title || "পরীক্ষা",
    };
  }, [selectedExam, exams, customExamTitle]);

  // Selected Branch object
  const selectedBranch = useMemo(() => {
    const bId = selectedExam?.branch_id || selectedBranchId;
    return branches.find(b => String(b.id) === String(bId)) || branches[0];
  }, [branches, selectedExam, selectedBranchId]);

  // Resolve readable class name for an exam
  const getExamClassLabel = (exam) => {
    if (!exam) return "";
    const b = branches.find(branch => String(branch.id) === String(exam.branch_id)) || selectedBranch;
    const structure = b?.academic_structure || [];
    let resolved = resolveAcademicDisplayName(
      exam.class_id,
      exam.session_id,
      exam.class_group_id,
      structure,
      'bn'
    );
    if (!resolved) {
      resolved = resolveAcademicDisplayName(
        exam.class_id,
        exam.session_id,
        exam.class_group_id,
        structure,
        'en'
      );
    }
    if (!resolved && Array.isArray(structure) && exam.class_id) {
      const cls = structure.find(c => String(c.id) === String(exam.class_id));
      if (cls) {
        resolved = typeof cls.class_name === "string" 
          ? cls.class_name 
          : (cls.class_name?.bn || cls.class_name?.en || cls.name || cls.title || "");
      }
    }
    if (!resolved) {
      resolved = exam.class_name || exam.className || exam.session || exam.class || "";
    }
    return (resolved || "").replace(/\s+/g, ' ').trim();
  };

  // Sync selected branch if exam changes
  useEffect(() => {
    if (selectedExam && selectedExam.branch_id) {
      setSelectedBranchId(String(selectedExam.branch_id));
    }
  }, [selectedExam]);

  // Load the selected exam's saved plan; only use the local backup when it includes this exam.
  useEffect(() => {
    const parseConfig = (value) => {
      if (value && typeof value === "object") return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return parsed && typeof parsed === "object" ? parsed : null;
        } catch {
          return null;
        }
      }
      return null;
    };

    let parsed = parseConfig(selectedExam?.seating_config);
    if (!parsed && selectedExam) {
      try {
        const stored = localStorage.getItem("latest_seating_config");
        const localConfig = parseConfig(stored);
        if (localConfig?.selected_exam_ids?.map(String).includes(String(selectedExam.id))) {
          parsed = localConfig;
        }
      } catch {}
    }

    if (!parsed) {
      setCustomExamTitle(selectedExam?.title || "পরীক্ষার সিট প্ল্যান");
      setHalls([DEFAULT_HALL]);
      setActiveHallId(DEFAULT_HALL.id);
      setRules(DEFAULT_RULES);
      setAllocations([]);
      setQualityScore(100);
      setConflictReport({ hasConflicts: false, reasons: [] });
      return;
    }

    setCustomExamTitle(typeof parsed.custom_exam_title === "string" && parsed.custom_exam_title
      ? parsed.custom_exam_title
      : selectedExam?.title || "পরীক্ষার সিট প্ল্যান");
    const savedHalls = Array.isArray(parsed.halls) && parsed.halls.length > 0 ? parsed.halls : [DEFAULT_HALL];
    setHalls(savedHalls);
    setActiveHallId(savedHalls[0].id);
    setRules(parsed.rules && typeof parsed.rules === "object" ? { ...DEFAULT_RULES, ...parsed.rules } : DEFAULT_RULES);
    setAllocations(Array.isArray(parsed.allocations) ? parsed.allocations : []);
    setQualityScore(typeof parsed.qualityScore === "number" ? parsed.qualityScore : 100);
    setConflictReport(parsed.conflictReport || { hasConflicts: false, reasons: [] });

    if (Array.isArray(parsed.selected_exam_ids) && parsed.selected_exam_ids.length > 0) {
      setSelectedExamIds(parsed.selected_exam_ids.map(String));
    }
  }, [selectedExam]);

  // Keep localStorage in sync whenever allocations update in real-time
  useEffect(() => {
    if (allocations && allocations.length > 0) {
      try {
        localStorage.setItem("active_seating_allocations", JSON.stringify(allocations));
        const partialConfig = {
          custom_exam_title: customExamTitle,
          selected_exam_ids: selectedExamIds,
          halls,
          rules,
          allocations,
          qualityScore,
        };
        localStorage.setItem("latest_seating_config", JSON.stringify(partialConfig));
      } catch {}
    }
  }, [allocations, customExamTitle, selectedExamIds, halls, rules, qualityScore]);

  // State for fetched students
  const [loadedStudents, setLoadedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // In-memory cache for loaded students to protect Supabase API quota
  const studentsCacheRef = React.useRef(new Map());

  // Fetch students for all selected Exam(s) with caching to protect Supabase quota
  useEffect(() => {
    if (selectedExamIds.length === 0 || exams.length === 0) {
      setLoadedStudents([]);
      return;
    }

    let isCancelled = false;
    async function fetchStudents() {
      try {
        const targetExams = exams.filter(e => selectedExamIds.includes(String(e.id)));
        if (targetExams.length === 0) {
          setLoadedStudents([]);
          return;
        }

        const branchId = Number(targetExams[0]?.branch_id || selectedBranch?.id || branches[0]?.id);
        const targetIdsKey = targetExams.map(e => e.id).sort().join('_');
        const cacheKey = `${branchId}_exams_${targetIdsKey}`;

        // Return cached students instantly without hitting Supabase!
        if (studentsCacheRef.current.has(cacheKey)) {
          if (!isCancelled) {
            setLoadedStudents(studentsCacheRef.current.get(cacheKey));
          }
          return;
        }

        setStudentsLoading(true);

        // Fetch active students for this branch
        let query = supabaseAdmin
          .from("students")
          .select("id,roll_number,full_name_en,full_name_bn,branch_id,class_id,session_id,class_group_id,class_name,photo_url,status")
          .eq("branch_id", branchId)
          .eq("status", "active")
          .order("roll_number", { ascending: true });

        const { data, error } = await query;
        if (error) throw error;

        if (!isCancelled) {
          const academicStructure = selectedBranch?.academic_structure || [];

          // Match students to the target exams based on class_id, session_id, class_group_id
          const matchedStudents = [];
          const seenStudentIds = new Set();

          (data || []).forEach(s => {
            // Find which target exam this student belongs to
            const matchingExam = targetExams.find(ex => {
              const classMatches = !ex.class_id || String(s.class_id) === String(ex.class_id);
              const sessionMatches = !ex.session_id || String(s.session_id) === String(ex.session_id);
              const groupMatches = !ex.class_group_id || String(s.class_group_id) === String(ex.class_group_id);
              return classMatches && sessionMatches && groupMatches;
            });

            if (matchingExam && !seenStudentIds.has(String(s.id))) {
              seenStudentIds.add(String(s.id));
              const resolvedName = resolveAcademicDisplayName(
                s.class_id, s.session_id, s.class_group_id, academicStructure, 'bn'
              ) || s.class_name || matchingExam.title || "General";

              matchedStudents.push({
                ...s,
                class_key: `${s.class_id || ''}_${s.session_id || ''}_${s.class_group_id || ''}`,
                class_display_name: resolvedName,
                class_name: resolvedName,
                exam_id: matchingExam.id,
                exam_title: matchingExam.title,
              });
            }
          });

          // Cache in memory
          studentsCacheRef.current.set(cacheKey, matchedStudents);
          setLoadedStudents(matchedStudents);
        }
      } catch (err) {
        console.error("Failed to load students for seating:", err);
        toast.error("Failed to load students for this exam");
      } finally {
        if (!isCancelled) setStudentsLoading(false);
      }
    }

    fetchStudents();
    return () => { isCancelled = true; };
  }, [selectedExamIds, selectedBranch, exams, branches]);

  // Auto-generate seat plan if students are loaded and allocations are empty or mismatched
  useEffect(() => {
    if (loadedStudents.length === 0 || halls.length === 0) return;

    const currentStudentIds = new Set(loadedStudents.map(s => String(s.id)));
    // ONLY auto-generate if allocations is completely empty on initial first load
    // NEVER re-auto-allocate when students are unassigned by deleting a bench/seat!
    const needsAutoAllocation = allocations.length === 0;

    if (needsAutoAllocation) {
      try {
        const lockedAllocations = allocations.filter(a => a.locked && currentStudentIds.has(String(a.student_id)));
        const result = generateBestSeatPlan({
          students: loadedStudents,
          halls,
          rules,
          lockedAllocations,
          passes: 3,
        });

        if (result && Array.isArray(result.allocations) && result.allocations.length > 0) {
          setAllocations(result.allocations);
          setQualityScore(result.qualityScore);
          setConflictReport(result.conflictReport);
        }
      } catch (err) {
        console.error("Auto seat plan allocation error:", err);
      }
    }
  }, [loadedStudents, halls, rules]);

  // Compute live student statistics
  const stats = useMemo(() => {
    const total = loadedStudents.length;
    const classCounts = {};
    const sectionCounts = {};
    const groupCounts = {};
    const rolls = [];

    loadedStudents.forEach(s => {
      const c = s.class_display_name || "Unknown Class";
      classCounts[c] = (classCounts[c] || 0) + 1;

      if (s.session_id) {
        sectionCounts[s.session_id] = (sectionCounts[s.session_id] || 0) + 1;
      }
      if (s.class_group_id) {
        groupCounts[s.class_group_id] = (groupCounts[s.class_group_id] || 0) + 1;
      }
      if (s.roll_number) {
        const parsed = parseInt(s.roll_number, 10);
        if (!isNaN(parsed)) rolls.push(parsed);
      }
    });

    const assignedCount = allocations.length;
    const unassignedCount = Math.max(0, total - assignedCount);

    rolls.sort((a, b) => a - b);
    const rollRange = rolls.length > 0 ? `${rolls[0]} - ${rolls[rolls.length - 1]}` : "—";

    // Total Hall Capacity
    const totalCapacity = halls.reduce((acc, h) => acc + calculateHallCapacity(h), 0);

    return {
      total,
      classCounts,
      sectionCounts,
      groupCounts,
      rollRange,
      assignedCount,
      unassignedCount,
      totalCapacity,
      capacityShortage: Math.max(0, total - totalCapacity),
    };
  }, [loadedStudents, allocations, halls]);

  // Execute Seat Allocation
  const handleGeneratePlan = () => {
    if (loadedStudents.length === 0) {
      toast.error("No students loaded for this exam. Please ensure students are enrolled.");
      return;
    }
    if (halls.length === 0) {
      toast.error("Please configure at least one hall.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        // Collect locked allocations
        const lockedAllocations = allocations.filter(a => a.locked);

        const result = generateBestSeatPlan({
          students: loadedStudents,
          halls,
          rules,
          lockedAllocations,
          passes: 5,
        });

        setAllocations(result.allocations);
        setQualityScore(result.qualityScore);
        setConflictReport(result.conflictReport);

        if (result.conflictReport.hasConflicts) {
          toast.warning(`Seat Plan generated with Score ${result.qualityScore}/100. Review conflict audit.`);
        } else {
          toast.success(`🎉 Seat Plan Generated Perfectly! Quality Score: ${result.qualityScore}/100`);
        }
      } catch (err) {
        console.error("Allocation failed:", err);
        toast.error(err.message || "Failed to generate seat plan");
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  // Save Seating Plan to Database & Link with Admit Cards
  const handleSavePlan = async () => {
    if (selectedExamIds.length === 0) {
      toast.error("Select at least one exam before saving the seat plan");
      return;
    }
    if (!selectedExam) {
      toast.error("No exam selected");
      return;
    }

    setIsSaving(true);
    try {
      const existingCfg = (() => {
        const config = selectedExam.seating_config;
        if (config && typeof config === "object") return config;
        if (typeof config === "string") {
          try {
            const parsed = JSON.parse(config);
            return parsed && typeof parsed === "object" ? parsed : {};
          } catch {
            return {};
          }
        }
        return {};
      })();
      const updatedConfig = {
        ...existingCfg,
        custom_exam_title: customExamTitle,
        selected_exam_ids: selectedExamIds,
        halls,
        rules,
        allocations,
        qualityScore,
        conflictReport,
        last_generated_at: new Date().toISOString(),
      };

      // Persist to Supabase exams table for ALL selected exams (so any exam's admit card picks it up!)
      const targetExamIds = Array.from(new Set([String(selectedExam.id), ...selectedExamIds.map(String)]));
      await Promise.all(targetExamIds.map(eid =>
        appClient.entities.Exam.update(eid, {
          seating_config: updatedConfig,
        })
      ));

      // Persist to localStorage for immediate sync across tabs/components
      try {
        localStorage.setItem("latest_seating_config", JSON.stringify(updatedConfig));
        localStorage.setItem("active_seating_allocations", JSON.stringify(allocations));
      } catch {}

      toast.success("✅ সিট প্ল্যান সফলভাবে সেভ হয়েছে! অ্যাডমিট কার্ডে স্বয়ংক্রিয়ভাবে সিট নম্বর, কক্ষ ও সেট যুক্ত হয়েছে।");
      if (onPlanSaved) onPlanSaved(updatedConfig, targetExamIds);
    } catch (err) {
      console.error("Failed to save seating plan:", err);
      toast.error(err.message || "Failed to save seating plan");
    } finally {
      setIsSaving(false);
    }
  };

  // Hall Management helpers
  const handleAddHall = () => {
    const nextNum = halls.length + 1;
    const newHall = {
      id: `hall-${Date.now()}`,
      name: `Hall-${String(nextNum).padStart(2, "0")}`,
      room_number: String(100 + nextNum),
      rows: 8,
      tables_per_row: 5,
      seats_per_table: 2,
      empty_seat_pattern: "none",
      empty_bench_pattern: "none",
    };
    const updated = [...halls, newHall];
    setHalls(updated);
    setActiveHallId(newHall.id);
    toast.success(`Added ${newHall.name}`);
  };

  const handleDeleteHall = (id) => {
    if (halls.length <= 1) {
      toast.error("At least one hall is required.");
      return;
    }
    const updated = halls.filter(h => h.id !== id);
    setHalls(updated);
    if (activeHallId === id) setActiveHallId(updated[0].id);
    toast.success("Hall removed");
  };

  const handleUpdateHall = (id, key, value) => {
    setHalls(prev => prev.map(h => (h.id === id ? { ...h, [key]: value } : h)));
  };

  // Apply Auto-Generated Hall Numbering
  const applyAutoNumbering = () => {
    const count = Math.max(1, Number(autoNumberConfig.count) || 1);
    const start = Math.max(1, Number(autoNumberConfig.startingNum) || 1);
    const prefix = autoNumberConfig.prefix || "Hall-";
    const digits = Math.max(1, Number(autoNumberConfig.digits) || 2);

    const newHalls = Array.from({ length: count }, (_, idx) => {
      const num = start + idx;
      const formattedNum = String(num).padStart(digits, "0");
      return {
        id: `hall_${Date.now()}_${idx}`,
        name: `${prefix}${formattedNum}`,
        room_number: String(100 + num),
        rows: 8,
        tables_per_row: 5,
        seats_per_table: 2,
        empty_seat_pattern: "none",
        empty_bench_pattern: "none",
      };
    });

    setHalls(newHalls);
    setActiveHallId(newHalls[0].id);
    setShowAutoNumberModal(false);
    toast.success(`Generated ${count} Halls with prefix "${prefix}"`);
  };

  // Reset or Unlock all seats
  const handleUnlockAll = () => {
    const updated = allocations.map(a => ({ ...a, locked: false }));
    setAllocations(updated);
    toast.info("All student seats unlocked.");
  };

  // Fullscreen toggle with native browser fullscreen support
  const toggleFullScreen = () => {
    const next = !isFullScreen;
    setIsFullScreen(next);
    try {
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in ${
      isFullScreen ? "p-0" : "p-2 sm:p-4"
    }`}>
      <div className={`bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-200 ${
        isFullScreen ? "w-screen h-screen rounded-none max-w-none" : "w-full max-w-7xl h-[94vh] rounded-3xl"
      }`}>
        
        {/* TOP HEADER */}
        <div className="bg-gradient-to-r from-[#052E2B] via-[#031d1b] to-[#052E2B] text-white p-4 px-6 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] flex items-center justify-center text-[#052E2B] font-bold shadow-md">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-wide">Exam Seating Arrangement &amp; Allocation</h2>
                <Badge className="bg-[#D4AF37] text-[#052E2B] border-0 text-[10px] font-black uppercase">
                  Engine v2.0
                </Badge>
              </div>
              <p className="text-[11px] text-emerald-200">
                Constraint-based exam seating allocation, hall charts, and automatic admit card integration
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGenerating || loadedStudents.length === 0}
              className="bg-[#D4AF37] hover:bg-[#bfa035] text-[#052E2B] font-extrabold text-xs rounded-xl h-9 px-4 shadow-md"
            >
              {isGenerating ? "Optimizing..." : "Generate Seat Plan"}
            </Button>

            <Button
              size="sm"
              onClick={handleSavePlan}
              disabled={isSaving || allocations.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4 shadow-md gap-1.5"
            >
              <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? "Saving..." : "Save Seating Plan"}
            </Button>

            {/* Prominent Fullscreen Toggle Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullScreen}
              className={`h-9 px-3 text-xs font-bold rounded-xl gap-1.5 transition-all shadow-xs ${
                isFullScreen 
                  ? "bg-[#D4AF37] text-[#052E2B] border-[#D4AF37] hover:bg-[#bfa035]" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }`}
              title={isFullScreen ? "Exit Fullscreen (ছোট করুন)" : "Full Screen (পূর্ণাঙ্গ স্ক্রিন)"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{isFullScreen ? "Exit Fullscreen" : "Full Screen"}</span>
            </Button>

            {/* Close Modal Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* EXAM TITLE (HEADLINE) & MULTI-CLASS INCLUDED EXAMS BAR */}
        <div className="bg-slate-50 border-b p-2.5 px-4 sm:px-6 space-y-2 text-xs">
          {/* Row 1: Type Exam Headline Input + Real-time Student & Capacity Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] whitespace-nowrap flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-[#052E2B]" />
                পরীক্ষার নাম / শিরোনাম (Type Exam Title):
              </span>
              <Input
                type="text"
                value={customExamTitle}
                onChange={(e) => setCustomExamTitle(e.target.value)}
                placeholder="যেমন: ১ম সাময়িক পরীক্ষা - ২০২৪ (প্রতিটি প্রিন্ট হেডলাইনে বসবে)"
                className="h-8 bg-white text-xs rounded-xl border-slate-300 font-bold flex-1 max-w-sm shadow-xs focus:ring-1 focus:ring-[#052E2B]"
              />
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                (স্লিপ ও রিপোর্টের মূল শিরোনাম)
              </span>
            </div>

            {/* Real-time Student & Capacity Pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant="outline" className="bg-white border-slate-300 text-slate-800 text-[10.5px] font-bold py-0.5">
                Students: <strong className="ml-1 text-[#052E2B]">{studentsLoading ? "Loading..." : stats.total}</strong>
              </Badge>
              <Badge variant="outline" className={`text-[10.5px] font-bold py-0.5 ${stats.capacityShortage > 0 ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                Capacity: <strong className="ml-1">{stats.totalCapacity}</strong>
              </Badge>
              <Badge className="bg-[#052E2B] text-white border-0 text-[10.5px] font-black py-0.5">
                Score: {qualityScore}/100
              </Badge>
            </div>
          </div>

          {/* Row 2: Multi-Exam / Multi-Class Selection (Includes ALL exams!) */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
              <span className="text-[10.5px] text-slate-700 font-extrabold uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5 text-[#052E2B]" />
                অন্তর্ভুক্ত পরীক্ষা সমূহ ({selectedExamIds.length}/{exams.length}):
              </span>
              <button
                type="button"
                onClick={() => setSelectedExamIds(exams.map(e => String(e.id)))}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline px-1"
                title="সকল পরীক্ষা একসাথে অন্তর্ভুক্ত করুন"
              >
                সবগুলো
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedExamIds([])}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline px-1"
                title="সব পরীক্ষা বাদ দিন"
              >
                মুছুন
              </button>
            </div>

            {/* All Exam Pills */}
            <div className="flex items-center gap-1 flex-wrap max-h-14 overflow-y-auto pr-1 flex-1">
              {exams.map(e => {
                const isChecked = selectedExamIds.includes(String(e.id));
                const cLabel = getExamClassLabel(e);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setSelectedExamIds(prev =>
                        isChecked ? prev.filter(x => x !== String(e.id)) : [...prev, String(e.id)]
                      );
                    }}
                    className={`text-[10.5px] px-2 py-0.5 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                      isChecked
                        ? "bg-[#052E2B] text-white border-[#052E2B] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-bold truncate max-w-[140px]">{e.title}</span>
                    {cLabel && (
                      <span className={`text-[9.5px] px-1 py-0.2 rounded font-medium ${
                        isChecked
                          ? "bg-white/20 text-emerald-100"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>
                        {cLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* WORKSPACE MAIN TABS */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100/60">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            {/* Tab Triggers */}
            <div className="bg-white border-b px-4 sm:px-6 pt-1.5 pb-1.5">
              <TabsList className="bg-slate-100 p-0.5 rounded-xl h-auto gap-1">
                <TabsTrigger value="overview" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <BarChart2 className="h-3.5 w-3.5" /> Overview &amp; Stats
                </TabsTrigger>
                <TabsTrigger value="visual-map" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <Layout className="h-3.5 w-3.5" /> Hall Visual Map
                </TabsTrigger>
                <TabsTrigger value="halls" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> Hall &amp; Benches
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5" /> Seating Rules
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Validation &amp; Conflicts
                </TabsTrigger>
                <TabsTrigger value="print" className="text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" /> Print &amp; Reports
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: OVERVIEW & STATS */}
            <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-5 m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-4">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Students</span>
                  <div className="text-2xl font-black text-[#052E2B] mt-1">{stats.total}</div>
                  <span className="text-[10px] text-slate-500">Roll Range: {stats.rollRange}</span>
                </Card>
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-4">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Assigned Seats</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{stats.assignedCount}</div>
                  <span className="text-[10px] text-slate-500">Unassigned: {stats.unassignedCount}</span>
                </Card>
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-4">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Capacity</span>
                  <div className="text-2xl font-black text-[#D4AF37] mt-1">{stats.totalCapacity}</div>
                  <span className="text-[10px] text-slate-500">{halls.length} Hall(s) Configured</span>
                </Card>
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-4">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Quality Score</span>
                  <div className="text-2xl font-black text-[#052E2B] mt-1">{qualityScore}/100</div>
                  <span className="text-[10px] text-slate-500">
                    {conflictReport.hasConflicts ? "Review Soft Conflicts" : "Zero Violations ✓"}
                  </span>
                </Card>
              </div>

              {/* Class-wise Breakdown Grid */}
              <Card className="border-0 shadow-sm rounded-2xl bg-white p-6">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                    <span>Class-wise Student Distribution (শ্রেণীভিত্তিক শিক্ষার্থী সংখ্যা)</span>
                    <Badge variant="outline" className="text-[10px]">{Object.keys(stats.classCounts).length} Classes</Badge>
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  {Object.entries(stats.classCounts).map(([className, count]) => (
                    <div key={className} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-800 truncate">{className}</div>
                        <div className="text-[10px] text-slate-400">Enrolled in Exam</div>
                      </div>
                      <Badge className="bg-[#052E2B] text-white text-xs font-extrabold">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Capacity Warning Banner */}
              {stats.capacityShortage > 0 && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800">
                  <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">Hall Capacity Warning: Additional Seats Needed!</h4>
                    <p className="text-[11px] mt-0.5 text-rose-700">
                      Total students ({stats.total}) exceeds current hall capacity ({stats.totalCapacity}) by {stats.capacityShortage} seat(s).
                      Please add another hall or increase rows/benches in the &ldquo;Hall &amp; Benches&rdquo; tab.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: VISUAL HALL MAP */}
            <TabsContent value="visual-map" className="flex-1 overflow-hidden p-2 sm:p-3 m-0 flex flex-col min-h-0 data-[state=active]:flex">
              <HallVisualMap
                halls={halls}
                activeHallId={activeHallId}
                onSelectHall={setActiveHallId}
                allocations={allocations}
                onUpdateAllocations={setAllocations}
                rules={rules}
                isFullScreen={isFullScreen}
                onToggleFullScreen={toggleFullScreen}
                onAutoGenerate={handleGeneratePlan}
                studentsTotal={stats.total}
                availableStudents={loadedStudents}
                exam={effectiveExam}
                branch={selectedBranch}
                settings={settings}
                onSavePlan={handleSavePlan}
                isSaving={isSaving}
                onUpdateHalls={setHalls}
              />
            </TabsContent>

            {/* TAB 3: HALL & BENCH CONFIGURATION */}
            <TabsContent value="halls" className="flex-1 overflow-y-auto p-6 space-y-6 m-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Hall &amp; Room Layout Management</h3>
                  <p className="text-[11px] text-slate-400">Configure hall names, numbers, rows, and seats per bench</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAutoNumberModal(true)}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Auto Generate Halls
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddHall}
                    className="bg-[#052E2B] hover:bg-[#031d1b] text-white h-8 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Hall
                  </Button>
                </div>
              </div>

              {/* Halls Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {halls.map((hall, idx) => {
                  const capacity = calculateHallCapacity(hall);
                  return (
                    <Card key={hall.id} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all">
                      <div className="h-1.5 bg-gradient-to-r from-[#052E2B] to-[#D4AF37]" />
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                            Hall #{idx + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#052E2B]">Capacity: {capacity}</span>
                            {halls.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                                onClick={() => handleDeleteHall(hall.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Hall Name</label>
                            <Input
                              value={hall.name}
                              onChange={e => handleUpdateHall(hall.id, "name", e.target.value)}
                              className="h-8 text-xs font-bold rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Room Number</label>
                            <Input
                              value={hall.room_number}
                              onChange={e => handleUpdateHall(hall.id, "room_number", e.target.value)}
                              className="h-8 text-xs font-bold rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs border-t pt-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Rows</label>
                            <Input
                              type="number"
                              min="1"
                              value={hall.rows}
                              onChange={e => handleUpdateHall(hall.id, "rows", Number(e.target.value))}
                              className="h-8 text-xs rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Benches/Row</label>
                            <Input
                              type="number"
                              min="1"
                              value={hall.tables_per_row}
                              onChange={e => handleUpdateHall(hall.id, "tables_per_row", Number(e.target.value))}
                              className="h-8 text-xs rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Seats/Bench</label>
                            <Select
                              value={String(hall.seats_per_table || 2)}
                              onValueChange={v => handleUpdateHall(hall.id, "seats_per_table", Number(v))}
                            >
                              <SelectTrigger className="h-8 text-xs rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Seat</SelectItem>
                                <SelectItem value="2">2 Seats</SelectItem>
                                <SelectItem value="3">3 Seats</SelectItem>
                                <SelectItem value="4">4 Seats</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Empty Seat Rule</label>
                            <Select
                              value={hall.empty_seat_pattern || "none"}
                              onValueChange={v => handleUpdateHall(hall.id, "empty_seat_pattern", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Fill All Seats</SelectItem>
                                <SelectItem value="alternate">Alternate Seats</SelectItem>
                                <SelectItem value="right_empty">Right Seat Empty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Empty Bench Rule</label>
                            <Select
                              value={hall.empty_bench_pattern || "none"}
                              onValueChange={v => handleUpdateHall(hall.id, "empty_bench_pattern", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Fill All Benches</SelectItem>
                                <SelectItem value="alternate_bench">Every 2nd Bench Empty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 4: SEATING RULES */}
            <TabsContent value="rules" className="flex-1 overflow-y-auto p-6 space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* HARD RULES CARD */}
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Hard Rules (বাধ্যতামূলক নিয়ম)</h4>
                      <p className="text-[10px] text-slate-400">এগুলো কোনো অবস্থাতেই ভাঙা যাবে না</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">Same Class Separation (একই শ্রেণী একই বেঞ্চে বসবে না)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Bench 01: C6 + C6 is strictly forbidden; C6 + C7 allowed.</div>
                      </div>
                      <Switch
                        checked={rules.sameClassSameBench}
                        onCheckedChange={v => setRules(r => ({ ...r, sameClassSameBench: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">Preserve Locked Students (ম্যানুয়াল লক অপরিবর্তিত রাখা)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Admin-locked student seats never move during regeneration.</div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 font-extrabold text-[10px]">Strict</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">One Seat Per Student (এক সিটে একজন শিক্ষার্থী)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">No duplication or dual assignment allowed.</div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 font-extrabold text-[10px]">Strict</Badge>
                    </div>
                  </div>
                </Card>

                {/* SOFT RULES CARD */}
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-5 space-y-4">
                  <div className="border-b pb-3">
                    <h4 className="font-bold text-sm text-slate-800">Soft Rules (অপটিমাইজেশন নিয়ম)</h4>
                    <p className="text-[10px] text-slate-400">যথাসম্ভব সর্বোচ্চভাবে মানা হবে</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">Adjacent Bench Separation (পাশাপাশি বেঞ্চে একই শ্রেণী নয়)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Spread same class students as far apart as possible.</div>
                      </div>
                      <Switch
                        checked={rules.sameClassAdjacentBench}
                        onCheckedChange={v => setRules(r => ({ ...r, sameClassAdjacentBench: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">Row Spacing &amp; Mixing (রো ভিত্তিক ব্যবধান)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Spread same class students across alternating rows.</div>
                      </div>
                      <Switch
                        checked={rules.sameClassRowSeparation}
                        onCheckedChange={v => setRules(r => ({ ...r, sameClassRowSeparation: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">Question Paper Set Mixing (প্রশ্নপত্রের সেট বিন্যাস)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Same set students should not sit side-by-side.</div>
                      </div>
                      <Switch
                        checked={rules.sameSetAdjacent}
                        onCheckedChange={v => setRules(r => ({ ...r, sameSetAdjacent: v }))}
                      />
                    </div>
                  </div>
                </Card>

                {/* STUDENT SORTING & SERIALS CARD */}
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-5 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b pb-2">Student Seating Order &amp; Serials</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Sorting Method</label>
                      <Select
                        value={rules.sortingMethod || "class_mix"}
                        onValueChange={v => setRules(r => ({ ...r, sortingMethod: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class_mix">Smart Class Mixing</SelectItem>
                          <SelectItem value="roll_asc">Roll Ascending (১, ২, ৩...)</SelectItem>
                          <SelectItem value="roll_desc">Roll Descending</SelectItem>
                          <SelectItem value="name_asc">Name A-Z</SelectItem>
                          <SelectItem value="random">Random Valid Shuffle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Starting Exam Serial</label>
                      <Input
                        type="number"
                        value={rules.serialStart || 1}
                        onChange={e => setRules(r => ({ ...r, serialStart: Number(e.target.value) }))}
                        className="h-8 text-xs rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Serial Prefix</label>
                      <Input
                        placeholder="e.g. S- or EX-"
                        value={rules.serialPrefix || ""}
                        onChange={e => setRules(r => ({ ...r, serialPrefix: e.target.value }))}
                        className="h-8 text-xs rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Serial Padding Digits</label>
                      <Select
                        value={String(rules.serialDigits || 3)}
                        onValueChange={v => setRules(r => ({ ...r, serialDigits: Number(v) }))}
                      >
                        <SelectTrigger className="h-8 text-xs rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (e.g. 1, 2)</SelectItem>
                          <SelectItem value="2">2 (e.g. 01, 02)</SelectItem>
                          <SelectItem value="3">3 (e.g. 001, 002)</SelectItem>
                          <SelectItem value="4">4 (e.g. 0001)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* QUESTION SETS CARD */}
                <Card className="border-0 shadow-sm rounded-2xl bg-white p-5 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b pb-2">Question Paper Sets (সেট কনফিগারেশন)</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Active Sets</label>
                      <div className="flex items-center gap-2">
                        {["Set A", "Set B", "Set C", "Set D"].map(setName => {
                          const isSetOn = (rules.sets || []).includes(setName);
                          return (
                            <button
                              key={setName}
                              type="button"
                              onClick={() => {
                                const current = rules.sets || [];
                                const next = isSetOn ? current.filter(s => s !== setName) : [...current, setName];
                                if (next.length === 0) return toast.error("At least one set is required");
                                setRules(r => ({ ...r, sets: next }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                isSetOn ? "bg-[#052E2B] text-white border-[#052E2B]" : "bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                            >
                              {setName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Set Distribution Pattern</label>
                      <Select
                        value={rules.setDistribution || "alternate"}
                        onValueChange={v => setRules(r => ({ ...r, setDistribution: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alternate">Alternate (A, B, A, B...)</SelectItem>
                          <SelectItem value="random">Randomized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

              </div>
            </TabsContent>

            {/* TAB 5: VALIDATION & CONFLICTS */}
            <TabsContent value="audit" className="flex-1 overflow-y-auto p-6 space-y-6 m-0">
              <div className="bg-white rounded-2xl border p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Seat Plan Audit &amp; Quality Report</h3>
                    <p className="text-[11px] text-slate-400">Automated verification of hard and soft seating constraints</p>
                  </div>
                  <Badge className="bg-[#052E2B] text-white font-extrabold text-xs px-3 py-1">
                    Quality Score: {qualityScore}/100
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-50 rounded-xl p-4 border text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Same Class Violations</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {conflictReport.unavoidableHardViolations || 0}
                    </div>
                    <span className="text-[10px] text-slate-500">Same Class on Same Bench</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Capacity Status</span>
                    <div className="text-xl font-black text-slate-800 mt-1">
                      {stats.assignedCount} / {stats.total}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {stats.unassignedCount === 0 ? "All Students Assigned ✓" : `${stats.unassignedCount} Unassigned`}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border text-center flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Locked Seats Status</span>
                      <div className="text-xl font-black text-[#D4AF37] mt-1">
                        {allocations.filter(a => a.locked).length}
                      </div>
                      <span className="text-[10px] text-slate-500">Manually Fixed in Place</span>
                    </div>
                    {allocations.some(a => a.locked) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUnlockAll}
                        className="mt-2 h-7 text-[10px] font-bold rounded-lg border-slate-300 gap-1 mx-auto"
                      >
                        <Unlock className="h-3 w-3" /> Unlock All
                      </Button>
                    )}
                  </div>
                </div>

                {/* Conflict diagnosis details */}
                {conflictReport.hasConflicts ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Seating Conflict Report &amp; Diagnostic Details:</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-1">
                      {conflictReport.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs">All Seating Constraints Successfully Met!</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Zero hard rule violations. Same class students are fully separated across benches.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 6: PRINT & REPORTS */}
            <TabsContent value="print" className="flex-1 overflow-y-auto p-6 space-y-6 m-0">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">Printable Exam Seating Reports &amp; Posters</h3>
                <p className="text-[11px] text-slate-400">Professional print layouts for notice boards, hall doors, and individual desks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. বেঞ্চের স্লিপ ও নম্বর স্টিকার (Bench Slips & Stickers) */}
                <Card className="border-2 border-emerald-600/40 shadow-sm bg-gradient-to-br from-emerald-50/30 to-white rounded-3xl p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#052E2B] text-[#D4AF37] flex items-center justify-center font-bold shadow-sm">
                      <Tag className="h-6 w-6" />
                    </div>
                    <Badge className="bg-[#D4AF37] text-[#052E2B] text-[10px] px-2 py-0.5 font-black border-0">
                      বেঞ্চে লাগানোর জন্য
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">বেঞ্চের স্লিপ ও নম্বর স্টিকার</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      হলের প্রতিটি কাঠের বেঞ্চে লাগানোর জন্য বেঞ্চ নম্বর (Bench 1, Bench 2) স্টিকার এবং রোল ও নাম সংবলিত বিস্তারিত সিট স্লিপ।
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-[#D4AF37] hover:bg-[#bfa035] text-[#052E2B] rounded-xl h-10 text-xs font-black gap-1.5 shadow-sm"
                      disabled={allocations.length === 0}
                      onClick={() => printBenchSerialStickers({ exam: effectiveExam, branch: selectedBranch, settings, allocations, halls, selectedHallId: activeHallId })}
                    >
                      <Tag className="h-3.5 w-3.5" /> বেঞ্চ নম্বর স্টিকার প্রিন্ট
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#052E2B] hover:bg-[#031d1b] text-white rounded-xl h-10 text-xs font-bold gap-1.5 shadow-sm"
                      disabled={allocations.length === 0}
                      onClick={() => printBenchWiseSlips({ exam: effectiveExam, branch: selectedBranch, settings, allocations, halls, selectedHallId: activeHallId })}
                    >
                      <Printer className="h-3.5 w-3.5 text-[#D4AF37]" /> বিস্তারিত বেঞ্চ স্লিপ প্রিন্ট
                    </Button>
                  </div>
                </Card>

                {/* 2. নোটিশ বোর্ড হল চার্ট (Exam Hall Notice Chart) */}
                <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#052E2B] flex items-center justify-center font-bold">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">নোটিশ বোর্ড হল চার্ট</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      পরীক্ষার হলের নোটিশ বোর্ডে টানানোর জন্য পূর্ণাঙ্গ ছাত্র-তালিকা, রোল, সিরিয়াল ও বরাদ্দকৃত সিট চার্ট।
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full bg-[#052E2B] hover:bg-[#031d1b] text-white rounded-xl h-10 text-xs font-bold gap-1.5 shadow-sm"
                      disabled={allocations.length === 0}
                      onClick={() => printHallChart({ exam: effectiveExam, branch: selectedBranch, settings, allocations, halls, selectedHallId: activeHallId })}
                    >
                      <Printer className="h-3.5 w-3.5 text-[#D4AF37]" /> নোটিশ বোর্ড চার্ট প্রিন্ট
                    </Button>
                  </div>
                </Card>

                {/* 3. হলের দরজার ব্যানার (Hall Door Notice Banner) */}
                <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Layout className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">হলের দরজার ব্যানার ও নোটিশ</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      হলের প্রবেশদ্বারে লাগানোর জন্য শিক্ষার্থীদের রোল রেঞ্জ, সিরিয়াল রেঞ্জ ও বেঞ্চের জোড় বিবরণ পোস্টার।
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl h-10 text-xs font-bold gap-1.5 shadow-sm"
                      disabled={allocations.length === 0}
                      onClick={() => printHallDoorPoster({ exam: effectiveExam, branch: selectedBranch, settings, allocations, halls, selectedHallId: activeHallId })}
                    >
                      <Printer className="h-3.5 w-3.5" /> দরজার পোস্টার প্রিন্ট
                    </Button>
                  </div>
                </Card>

                {/* 4. মাস্টার সিট অডিট ও উপস্থিতি শিট (Master Attendance & Audit) */}
                <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800">মাস্টার শিট ও উপস্থিতি রিপোর্ট</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      পরীক্ষার হল পরিদর্শকের জন্য স্বাক্ষরযুক্ত উপস্থিতি শিট এবং প্রশাসনের অডিট রিপোর্ট।
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full bg-[#052E2B] hover:bg-[#031d1b] text-white rounded-xl h-10 text-xs font-bold gap-1.5 shadow-sm"
                      disabled={allocations.length === 0}
                      onClick={() => printStudentSeatList({ exam: effectiveExam, branch: selectedBranch, settings, allocations })}
                    >
                      <Printer className="h-3.5 w-3.5 text-[#D4AF37]" /> মাস্টার শিট প্রিন্ট
                    </Button>
                  </div>
                </Card>

              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>

      {/* AUTO GENERATE HALL NUMBER MODAL */}
      <Dialog open={showAutoNumberModal} onOpenChange={setShowAutoNumberModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#052E2B]">
              Auto Generate Halls &amp; Room Numbers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Prefix (e.g. Hall-, Room-, A-)</label>
              <Input
                value={autoNumberConfig.prefix}
                onChange={e => setAutoNumberConfig(c => ({ ...c, prefix: e.target.value }))}
                placeholder="Hall-"
                className="h-8 text-xs rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Starting Number</label>
                <Input
                  type="number"
                  value={autoNumberConfig.startingNum}
                  onChange={e => setAutoNumberConfig(c => ({ ...c, startingNum: Number(e.target.value) }))}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Total Halls to Create</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={autoNumberConfig.count}
                  onChange={e => setAutoNumberConfig(c => ({ ...c, count: Number(e.target.value) }))}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setShowAutoNumberModal(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={applyAutoNumbering} className="bg-[#052E2B] text-white rounded-xl text-xs font-bold">
              Generate Halls
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
