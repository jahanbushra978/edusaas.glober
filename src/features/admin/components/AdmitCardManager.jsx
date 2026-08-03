import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin-client";
import { useQuery } from "@tanstack/react-query";
import { resolveAcademicDisplayName } from "@/lib/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LOGO } from "@/utils";
import ImageUpload from "./ImageUpload";
import { drawBengaliText, drawBengaliTextWrapped, containsBengali } from "@/lib/pdf-utils";
import QRCode from "qrcode";
import {
  Search, Printer, Download, Eye, ChevronLeft, ChevronRight,
  CreditCard, Grid3X3, Settings, Palette, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Loader2, User, X, Check, Save,
  CheckSquare, Square, ArrowUpDown, Trash2, Copy, Plus,
  FileText, Image, Type, Layout, Monitor, AlertCircle, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const PAGE_SIZE = 30;
const TEMPLATE_STORAGE_KEY = "admit_card_templates";
const DEFAULT_TEMPLATE_KEY = "admit_card_default_template";
const SEATING_CONFIG_STORAGE_KEY = "admit_card_seating_config";

function getStoredSeatingConfig() {
  if (typeof window === "undefined") return getDefaultSeatingConfig();
  try {
    const raw = localStorage.getItem(SEATING_CONFIG_STORAGE_KEY);
    return raw ? { ...getDefaultSeatingConfig(), ...JSON.parse(raw) } : getDefaultSeatingConfig();
  } catch { return getDefaultSeatingConfig(); }
}

function saveSeatingConfig(cfg) {
  try {
    localStorage.setItem(SEATING_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

function getDefaultSeatingConfig() {
  return {
    examTitle: "",
    cardTitle: "ADMIT CARD / প্রবেশপত্র",
    centerName: "",
    startingSeat: 1,
    seatPrefix: "",
    seatDigits: 3,
    startingRoom: "1",
    studentsPerRoom: 20,
  };
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function resolveLogoUrl(tpl, branch, settings) {
  return tpl?.customLogoUrl || branch?.logo || branch?.logo_url || settings?.logo_url || DEFAULT_LOGO;
}

function getFlatClassOptions(academicStructure) {
  const options = [];
  (academicStructure || []).forEach(c => {
    if (c.sections && c.sections.length > 0) {
      c.sections.forEach(sec => {
        options.push({
          id: sec.id,
          classId: c.id,
          class_name: c.class_name,
          section_name: sec.section_name || sec.section,
          subjects: sec.subjects || [],
          label: `${c.class_name?.bn || c.class_name?.en}${sec.section_name?.bn ? ` (${sec.section_name.bn})` : sec.section_name?.en ? ` (${sec.section_name.en})` : ""}`.trim()
        });
      });
    } else {
      options.push({
        id: c.id,
        classId: c.id,
        class_name: c.class_name,
        section_name: c.section,
        subjects: c.subjects || [],
        label: `${c.class_name?.bn || c.class_name?.en}${c.section?.bn ? ` (${c.section.bn})` : c.section?.en ? ` (${c.section.en})` : ""}`.trim()
      });
    }
  });
  return options;
}

function getDefaultTemplate() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DEFAULT_TEMPLATE_KEY);
    return saved || null;
  } catch { return null; }
}

function getStoredTemplates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch {}
}

function createDefaultTemplate(name) {
  return {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Template 1",
    primaryColor: "#052E2B",
    secondaryColor: "#D4AF37",
    borderStyle: "solid",
    borderColor: "#052E2B",
    fontFamily: "Inter, sans-serif",
    fontSize: 12,
    banglaFont: "Noto Sans Bengali",
    englishFont: "Inter",
    showLogo: true,
    showWatermark: false,
    watermarkText: "ADMIT CARD",
    studentPhotoSize: 70,
    qrCodePosition: "right-bottom",
    barcodePosition: "right-bottom",
    signaturePosition: "bottom",
    sealPosition: "bottom",
    headerLayout: "center",
    footerLayout: "center",
    cardMargin: 10,
    cardPadding: 15,
    layout: "portrait",
    singlePerPage: true,
    showFields: {
      studentPhoto: true,
      studentName: true,
      studentId: true,
      roll: true,
      registrationNumber: true,
      fatherName: true,
      motherName: true,
      className: true,
      section: true,
      group: true,
      session: true,
      examDate: true,
      examTime: true,
      subjectList: true,
      principalSignature: true,
      controllerSignature: true,
      instituteSeal: true,
      barcode: true,
      qrCode: true,
      instructions: true,
    },
    customHeader: "",
    customFooter: "",
    customInstructions: "1. This admit card must be carried to the examination hall.\n2. Without admit card, entry to the examination hall is strictly prohibited.\n3. Students must follow the exam rules and regulations.\n4. Mobile phones and electronic devices are strictly prohibited.",
    bgColor: "#ffffff",
    showBorder: true,
    borderWidth: 2,
    showCuttingGuide: false,
  };
}

const SERIAL_TEMPLATE_STORAGE_KEY = "admit_card_serial_template";

function getStoredSerialTemplate() {
  if (typeof window === "undefined") return getDefaultSerialSheetTemplate();
  try {
    const raw = localStorage.getItem(SERIAL_TEMPLATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultSerialSheetTemplate();
  } catch { return getDefaultSerialSheetTemplate(); }
}

function saveSerialTemplate(tpl) {
  try {
    localStorage.setItem(SERIAL_TEMPLATE_STORAGE_KEY, JSON.stringify(tpl));
  } catch {}
}

const STUDENT_AVATAR_SVG = `<svg viewBox="0 0 24 24" width="36" height="36" fill="#94a3b8" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

function getDefaultSerialSheetTemplate() {
  return {
    id: `serial_${Date.now()}`,
    name: "Serial Sheet Default",
    cardsPerPage: 20,
    showLogo: true,
    showStudentPhoto: true,
    showQRCode: true,
    showCuttingGuide: true,
    primaryColor: "#052E2B",
    secondaryColor: "#D4AF37",
    bgColor: "#ffffff",
    borderColor: "#e2e8f0",
    fontFamily: "Inter, sans-serif",
    banglaFont: "Noto Sans Bengali",
    cardMargin: 4,
    cardPadding: 6,
    fontSize: 8,
    customLogoUrl: "",
  };
}

export default function AdmitCardManager({ branches, exams, currentUser, settings }) {
  const isBranchAdmin = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager";

  const [activeModule, setActiveModule] = useState("admit-card");

  const [filters, setFilters] = useState({
    branchId: isBranchAdmin && currentUser?.branch_id ? String(currentUser.branch_id) : "all",
    examId: "all",
    classId: "all",
    sectionId: "all",
    group: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [serialTemplate, setSerialTemplate] = useState(() => getStoredSerialTemplate());
  const [seatingConfig, setSeatingConfig] = useState(() => getStoredSeatingConfig());
  const [studentOverrides, setStudentOverrides] = useState({});
  const [editingStudentSeating, setEditingStudentSeating] = useState(null);

  const [generating, setGenerating] = useState({ admitCard: false, serialSheet: false, preview: false, bulkDownload: false });

  const searchTimeoutRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const stored = getStoredTemplates();
    if (stored.length === 0) {
      const defaultTpl = createDefaultTemplate("Template 1");
      const tpl2 = createDefaultTemplate("Template 2");
      tpl2.primaryColor = "#1a365d";
      tpl2.secondaryColor = "#e2ab3b";
      tpl2.borderColor = "#1a365d";
      const tpl3 = createDefaultTemplate("Template 3");
      tpl3.primaryColor = "#702459";
      tpl3.secondaryColor = "#c9a84c";
      tpl3.borderColor = "#702459";
      const newTemplates = [defaultTpl, tpl2, tpl3];
      saveTemplates(newTemplates);
      setTemplates(newTemplates);
      setActiveTemplateId(newTemplates[0].id);
    } else {
      setTemplates(stored);
      const defaultId = getDefaultTemplate();
      if (defaultId && stored.find(t => t.id === defaultId)) {
        setActiveTemplateId(defaultId);
      } else {
        setActiveTemplateId(stored[0]?.id);
      }
    }
  }, []);

  useEffect(() => {
    if (isBranchAdmin && currentUser?.branch_id) {
      setFilters(prev => ({ ...prev, branchId: String(currentUser.branch_id) }));
    }
  }, [isBranchAdmin, currentUser]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setSelectedIds(new Set());
      setSelectAll(false);
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [filters.branchId, filters.examId, filters.classId, filters.sectionId, filters.group]);

  // When exam selection changes, load seating_config from that exam (if available)
  useEffect(() => {
    if (filters.examId === "all") return;
    const selectedExam = exams.find(e => String(e.id) === String(filters.examId));
    if (!selectedExam?.seating_config) return;
    const cfg = typeof selectedExam.seating_config === "string"
      ? (() => { try { return JSON.parse(selectedExam.seating_config); } catch { return null; } })()
      : selectedExam.seating_config;
    if (cfg && typeof cfg === "object") {
      setSeatingConfig(prev => ({ ...prev, ...cfg }));
    }
  }, [filters.examId, exams]);

  const activeTemplate = useMemo(() => templates.find(t => t.id === activeTemplateId) || templates[0], [templates, activeTemplateId]);

  const selectedBranch = branches.find(b => String(b.id) === String(filters.branchId));
  const academicStructure = selectedBranch?.academic_structure || [];
  const flatClassOptions = useMemo(() => getFlatClassOptions(academicStructure), [academicStructure]);
  const selectedFlatClass = flatClassOptions.find(o => o.id === filters.classId);

  const filteredExams = exams.filter(e => {
    const bMatch = filters.branchId === "all" || String(e.branch_id) === String(filters.branchId);
    return bMatch;
  });

  const groupOptions = useMemo(() => {
    if (!selectedFlatClass) return [];
    const classObj = academicStructure.find(c => String(c.id) === String(selectedFlatClass.classId));
    if (classObj && Array.isArray(classObj.groups)) {
      return classObj.groups.map(g => ({
        value: String(g.id),
        label: g.group_name?.bn || g.group_name?.en || String(g.id)
      }));
    }
    return [];
  }, [academicStructure, selectedFlatClass]);

  const studentColumns = "id,roll_number,full_name_en,full_name_bn,father_name,mother_name,photo_url,branch_id,class_id,session,status,class_name,session_id,class_group_id";

  const { data: studentData, isLoading: studentsLoading } = useQuery({
    queryKey: ["admit-card-students", filters.branchId, filters.examId, filters.classId, filters.sectionId, filters.group, debouncedSearch, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const branchIdForQuery = filters.branchId !== "all"
        ? Number(filters.branchId)
        : (isBranchAdmin && currentUser?.branch_id ? Number(currentUser.branch_id) : null);

      let dataQuery = supabaseAdmin.from("students").select(studentColumns, { count: "exact" });
      if (branchIdForQuery) {
        dataQuery = dataQuery.eq("branch_id", branchIdForQuery);
      }
      dataQuery = dataQuery.eq("status", "active");

      // Apply class filter (supporting both legacy and new student formats)
      if (filters.classId !== "all") {
        let isSection = false;
        let parentClassId = "";
        for (const c of academicStructure) {
          if (c.sections && c.sections.some(sec => String(sec.id) === String(filters.classId))) {
            isSection = true;
            parentClassId = String(c.id);
            break;
          }
        }
        if (isSection) {
          dataQuery = dataQuery.or(`class_id.eq.${filters.classId},and(class_id.eq.${parentClassId},session_id.eq.${filters.classId})`);
        } else {
          dataQuery = dataQuery.eq("class_id", filters.classId);
        }
      }

      // Apply group filter using class_group_id column instead of non-existent group column
      if (filters.group !== "all" && filters.group !== "") {
        dataQuery = dataQuery.eq("class_group_id", filters.group);
      }

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim();
        const searchFields = ["full_name_en", "full_name_bn", "roll_number"];
        const orFilter = searchFields.map(f => `${f}.ilike.%${q}%`).join(",");
        dataQuery = dataQuery.or(orFilter);
      }

      dataQuery = dataQuery.order("roll_number", { ascending: true }).range(from, to);

      const { data, count, error } = await dataQuery;
      if (error) throw error;
      return { rows: data || [], total: count || 0, page, pageSize: PAGE_SIZE, totalPages: Math.ceil((count || 0) / PAGE_SIZE) };
    },
    // Students load as soon as branch + class are selected; exam is optional
    enabled: filters.branchId !== "all" && filters.classId !== "all",
  });

  const totalStudents = studentData?.total || 0;
  const totalPages = studentData?.totalPages || 0;
  const students = studentData?.rows || [];

  const allCurrentPageSelected = useMemo(() => {
    if (students.length === 0) return false;
    return students.every(s => selectedIds.has(String(s.id)));
  }, [students, selectedIds]);

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(students.map(s => String(s.id))));
    }
  }, [selectAll, students]);

  const handleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const newIds = new Set(students.map(s => String(s.id)));
      setSelectedIds(newIds);
      setSelectAll(true);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });
    setSelectAll(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      if (key === "branchId") { updated.classId = "all"; updated.sectionId = "all"; updated.examId = "all"; }
      if (key === "classId") { updated.sectionId = "all"; updated.group = "all"; }
      return updated;
    });
  };

  const handleAddTemplate = () => {
    const newTpl = createDefaultTemplate(`Template ${templates.length + 1}`);
    const updated = [...templates, newTpl];
    setTemplates(updated);
    saveTemplates(updated);
    setActiveTemplateId(newTpl.id);
    toast.success(`Template "${newTpl.name}" created`);
  };

  const handleDeleteTemplate = (id) => {
    if (templates.length <= 1) return toast.error("At least one template is required");
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    if (activeTemplateId === id) setActiveTemplateId(updated[0]?.id);
    toast.success("Template deleted");
  };

  const handleDuplicateTemplate = (tpl) => {
    const newTpl = { ...createDefaultTemplate(`${tpl.name} (Copy)`), ...JSON.parse(JSON.stringify(tpl)), id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: `${tpl.name} (Copy)` };
    const updated = [...templates, newTpl];
    setTemplates(updated);
    saveTemplates(updated);
    setActiveTemplateId(newTpl.id);
    toast.success(`Template "${newTpl.name}" created`);
  };

  const handleSetDefaultTemplate = (id) => {
    try { localStorage.setItem(DEFAULT_TEMPLATE_KEY, id); } catch {}
    toast.success("Default template updated");
  };

  const updateTemplateField = (field, value) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === activeTemplateId ? { ...t, [field]: value } : t);
      saveTemplates(updated);
      return updated;
    });
  };

  const toggleShowField = (field) => {
    if (!activeTemplate) return;
    updateTemplateField("showFields", {
      ...activeTemplate.showFields,
      [field]: !activeTemplate.showFields[field],
    });
  };

  const generateAdmitCardHTML = useCallback((student, branch, exam, tpl, options = { fullDocument: true }, idx = 0) => {
    const logoUrl = resolveLogoUrl(tpl, branch, settings);
    const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || branch?.name_en || "RAHMANIA INSTITUTE";
    const branchName = branch?.name_en || branch?.name_bn || "";
    const address = branch?.address_bn || branch?.address_en || settings?.address || "";
    const pc = tpl?.primaryColor || "#052E2B";
    const sc = tpl?.secondaryColor || "#D4AF37";
    const fields = tpl?.showFields || {};

    const override = studentOverrides[student?.id] || {};
    const resolvedExamTitle = seatingConfig.examTitle || exam?.title || "Exam";
    const resolvedCenterName = override.centerName || seatingConfig.centerName || branchName || settings?.institute_name_bn || "";

    let resolvedSeatNumber = override.seatNumber;
    if (!resolvedSeatNumber) {
      const rawNum = Number(seatingConfig.startingSeat || 1) + (idx || 0);
      const padded = String(rawNum).padStart(Number(seatingConfig.seatDigits || 3), "0");
      resolvedSeatNumber = `${seatingConfig.seatPrefix || ""}${padded}`;
    }

    let resolvedRoomNumber = override.roomNumber;
    if (!resolvedRoomNumber) {
      const startRm = Number(seatingConfig.startingRoom) || 1;
      const perRm = Math.max(1, Number(seatingConfig.studentsPerRoom) || 20);
      const rmOffset = Math.floor((idx || 0) / perRm);
      resolvedRoomNumber = String(startRm + rmOffset);
    }

    const classNameVal = (() => {
      const structure = branch?.academic_structure || [];
      return resolveAcademicDisplayName(student?.class_id, student?.session_id, student?.class_group_id, structure, 'bn') || student?.class_name || "";
    })();

    const sectionNameVal = (() => {
      if (!filters.sectionId || filters.sectionId === "all" || !branch?.academic_structure) return "";
      for (const c of branch.academic_structure) {
        if (c.sections) {
          const s = c.sections.find(sec => String(sec.id) === String(filters.sectionId));
          if (s) return s.section_name?.bn || s.section_name?.en || "";
        }
      }
      return "";
    })();

    const groupNameVal = (() => {
      if (!student?.class_group_id || !branch?.academic_structure) return "";
      for (const c of branch.academic_structure) {
        if (c.groups) {
          const g = c.groups.find(grp => String(grp.id) === String(student.class_group_id));
          if (g) return g.group_name?.bn || g.group_name?.en || "";
        }
      }
      return "";
    })();

    // Build subject rows
    let schedulesArr = exam?.subject_schedules || [];
    if (typeof schedulesArr === "string") { try { schedulesArr = JSON.parse(schedulesArr); } catch { schedulesArr = []; } }
    const subjectRows = (selectedFlatClass?.subjects || []).map((sub, i) => {
      const subjectName = typeof sub.subject_name === "string" ? sub.subject_name : sub.subject_name?.bn || sub.subject_name?.en || sub.name_bn || sub.name_en || String(sub);
      const subId = sub.id || i;
      const match = Array.isArray(schedulesArr) ? schedulesArr.find(s => String(s.subject_id) === String(subId) || s.subject_name === subjectName) : null;
      const subDate = match?.date || exam?.start_date || "—";
      const subTime = match?.time || "9:00 AM - 12:00 PM";
      const bg = i % 2 === 0 ? "#f8fffe" : "#ffffff";
      return `<tr style="background:${bg};">
        <td style="padding:5px 8px;text-align:center;border-bottom:1px solid #e2eef0;font-weight:700;color:${pc};">${i + 1}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e2eef0;font-weight:600;">${subjectName}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e2eef0;">${subDate}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e2eef0;">${subTime}</td>
      </tr>`;
    }).join("");

    const resolvedCardTitle = seatingConfig.cardTitle || tpl?.watermarkText || "ADMIT CARD / প্রবেশপত্র";
    const instructions = tpl?.customInstructions || "";

    const PHOTO_W = 72, PHOTO_H = 90;
    const cardMarkup = `
<div class="admit-card" style="width:595px;max-width:100%;background:#fff;border:2px solid ${pc};border-radius:10px;overflow:hidden;position:relative;font-family:'Noto Sans Bengali',Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,0.10);">
  ${tpl?.showWatermark ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:60px;font-weight:900;color:rgba(0,0,0,0.03);white-space:nowrap;pointer-events:none;z-index:0;">${tpl.watermarkText || "ADMIT CARD"}</div>` : ""}
  <!-- TOP STRIPE -->
  <div style="height:6px;background:linear-gradient(90deg,${pc} 0%,${sc} 50%,${pc} 100%);"></div>
  <!-- HEADER -->
  <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 18px 8px;text-align:center;border-bottom:2px solid ${sc};background:linear-gradient(180deg,rgba(5,46,43,0.04) 0%,#fff 100%);">
    ${tpl?.showLogo !== false ? `<img src="${logoUrl}" alt="Logo" style="width:56px;height:56px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'" />` : ""}
    <div style="text-align:center;">
      <div style="font-size:18px;font-weight:700;color:${pc};line-height:1.2;">${instNameBn}</div>
      <div style="font-size:11px;font-weight:500;color:#555;">${instNameEn}</div>
      ${branchName ? `<div style="font-size:9px;color:#888;margin-top:1px;">${branchName}${address ? " | " + address : ""}</div>` : ""}
    </div>
  </div>
  <!-- EXAM BADGE -->
  <div style="text-align:center;padding:4px 16px;font-size:11px;font-weight:700;color:${pc};background:${sc}25;border-bottom:1px solid ${sc}66;">${resolvedExamTitle}</div>
  <!-- TITLE BAR -->
  <div style="background:linear-gradient(135deg,${pc},${pc}cc);padding:9px 16px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,${sc}33,transparent);"></div>
    <span style="font-size:15px;font-weight:900;color:#fff;letter-spacing:2px;text-transform:uppercase;position:relative;z-index:1;">${resolvedCardTitle}</span>
  </div>
  <!-- BODY -->
  <div style="display:flex;flex-direction:row;gap:10px;padding:14px 18px;align-items:flex-start;">
    <!-- LEFT: PHOTO + INFO -->
    <div style="flex:1;display:flex;flex-direction:row;gap:10px;min-width:0;align-items:flex-start;">
      <!-- PHOTO -->
      ${fields.studentPhoto !== false ? `<div style="flex-shrink:0;width:${PHOTO_W}px;text-align:center;">
        ${student?.photo_url
          ? `<img src="${student.photo_url}" alt="Photo" width="${PHOTO_W}" height="${PHOTO_H}" style="width:${PHOTO_W}px;height:${PHOTO_H}px;max-width:${PHOTO_W}px;object-fit:cover;border-radius:5px;border:2px solid ${sc};display:block;" onerror="this.style.display='none'" />`
          : `<div style="width:${PHOTO_W}px;height:${PHOTO_H}px;border-radius:5px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;color:#bbb;background:#f9f9f9;text-align:center;box-sizing:border-box;">No Photo</div>`}
        <div style="font-size:8px;color:#bbb;margin-top:2px;">Student Photo</div>
      </div>` : ""}
      <!-- INFO GRID -->
      <div style="flex:1;min-width:0;">
        ${fields.studentName !== false ? `<div style="margin-bottom:6px;padding-bottom:5px;border-bottom:1.5px solid ${sc}66;">
          <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">শিক্ষার্থীর নাম / Student Name</div>
          <div style="font-size:14px;font-weight:700;color:${pc};word-break:break-word;">${student?.full_name_bn || student?.full_name_en || ""}</div>
        </div>` : ""}
        <table style="width:100%;border-collapse:collapse;font-size:0;">
          <tbody>
            <tr>
              ${fields.fatherName !== false ? `<td style="padding:3px 4px 3px 0;width:50%;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">পিতার নাম / Father's</div>
                <div style="font-weight:600;color:#222;word-break:break-word;">${student?.father_name || "—"}</div>
              </td>` : "<td></td>"}
              ${fields.motherName !== false ? `<td style="padding:3px 0 3px 4px;width:50%;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">মাতার নাম / Mother's</div>
                <div style="font-weight:600;color:#222;word-break:break-word;">${student?.mother_name || "—"}</div>
              </td>` : "<td></td>"}
            </tr>
            <tr>
              ${fields.studentId !== false ? `<td style="padding:3px 4px 3px 0;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Student ID / আইডি</div>
                <div style="font-weight:600;color:#222;">${student?.id || "—"}</div>
              </td>` : "<td></td>"}
              ${fields.roll !== false ? `<td style="padding:3px 0 3px 4px;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Roll / রোল</div>
                <div style="font-weight:600;color:#222;">${student?.roll_number || "—"}</div>
              </td>` : "<td></td>"}
            </tr>
            <tr>
              ${fields.registrationNumber !== false ? `<td style="padding:3px 4px 3px 0;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Reg. No / রেজি.</div>
                <div style="font-weight:600;color:#222;">${student?.registration_number || student?.id || "—"}</div>
              </td>` : "<td></td>"}
              ${fields.className !== false ? `<td style="padding:3px 0 3px 4px;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Class / ক্লাস</div>
                <div style="font-weight:600;color:#222;">${classNameVal || "—"}</div>
              </td>` : "<td></td>"}
            </tr>
            <tr>
              ${fields.session !== false ? `<td style="padding:3px 4px 3px 0;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Session / সেশন</div>
                <div style="font-weight:600;color:#222;">${exam?.session || exam?.academic_year || "—"}</div>
              </td>` : "<td></td>"}
              ${(sectionNameVal && fields.section !== false) ? `<td style="padding:3px 0 3px 4px;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Section / শাখা</div>
                <div style="font-weight:600;color:#222;">${sectionNameVal}</div>
              </td>` : (groupNameVal && fields.group !== false ? `<td style="padding:3px 0 3px 4px;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Group / গ্রুপ</div>
                <div style="font-weight:600;color:#222;">${groupNameVal}</div>
              </td>` : "<td></td>")}
            </tr>
            <tr>
              ${fields.examDate !== false ? `<td style="padding:3px 4px 3px 0;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Exam Date / তারিখ</div>
                <div style="font-weight:600;color:#222;">${exam?.start_date || "—"}</div>
              </td>` : "<td></td>"}
              ${fields.examTime !== false ? `<td style="padding:3px 0 3px 4px;vertical-align:top;font-size:10px;">
                <div style="font-size:8px;color:#999;text-transform:uppercase;margin-bottom:1px;">Time / সময়</div>
                <div style="font-weight:600;color:#222;">${exam?.exam_time || "9:00 AM - 12:00 PM"}</div>
              </td>` : "<td></td>"}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- SEATING BOX -->
    <div style="width:110px;flex-shrink:0;border:2px solid ${pc};border-radius:7px;overflow:hidden;align-self:flex-start;">
      <div style="background:${pc};color:#fff;font-size:9px;font-weight:700;text-align:center;padding:5px 4px;letter-spacing:0.5px;">পরীক্ষার তথ্য</div>
      <div style="padding:6px 8px;border-bottom:1px dashed #ddd;text-align:center;">
        <div style="font-size:8px;color:#888;margin-bottom:2px;">Seat No / আসন</div>
        <div style="font-size:22px;font-weight:900;color:${pc};line-height:1.1;">${resolvedSeatNumber}</div>
      </div>
      <div style="padding:5px 8px;border-bottom:1px dashed #ddd;text-align:center;">
        <div style="font-size:8px;color:#888;margin-bottom:1px;">Room / কক্ষ</div>
        <div style="font-size:12px;font-weight:700;color:#222;">${resolvedRoomNumber}</div>
      </div>
      <div style="padding:5px 8px;text-align:center;">
        <div style="font-size:8px;color:#888;margin-bottom:1px;">Center / কেন্দ্র</div>
        <div style="font-size:9px;font-weight:600;color:#222;word-break:break-word;">${resolvedCenterName}</div>
      </div>
    </div>
  </div>
  <!-- SUBJECT TABLE -->
  ${fields.subjectList !== false && subjectRows ? `<div style="padding:0 18px 10px;">
    <div style="font-size:9px;font-weight:700;color:${pc};text-transform:uppercase;margin-bottom:4px;border-left:3px solid ${sc};padding-left:5px;">Subjects / বিষয়সমূহ</div>
    <table style="width:100%;border-collapse:collapse;font-size:9.5px;table-layout:fixed;">
      <thead><tr>
        <th style="background:${pc};color:#fff;padding:4px 7px;text-align:center;width:28px;font-size:9px;">#</th>
        <th style="background:${pc};color:#fff;padding:4px 7px;text-align:left;font-size:9px;">Subject / বিষয়</th>
        <th style="background:${pc};color:#fff;padding:4px 7px;text-align:left;width:90px;font-size:9px;">Date / তারিখ</th>
        <th style="background:${pc};color:#fff;padding:4px 7px;text-align:left;width:125px;font-size:9px;">Time / সময়</th>
      </tr></thead>
      <tbody>${subjectRows}</tbody>
    </table>
  </div>` : ""}
  <!-- INSTRUCTIONS -->
  ${instructions ? `<div style="margin:0 18px 10px;background:#fffbeb;border-left:3px solid ${sc};border-radius:3px;padding:6px 9px;">
    <div style="font-size:9px;font-weight:700;color:${pc};margin-bottom:3px;">গুরুত্বপূর্ণ নির্দেশনা</div>
    <div style="font-size:9px;color:#555;line-height:1.5;white-space:pre-line;">${instructions}</div>
  </div>` : ""}
  <!-- SIGNATURES -->
  <div style="display:flex;justify-content:space-around;align-items:flex-end;padding:10px 18px 12px;border-top:1px solid #e2e8f0;">
    ${fields.principalSignature !== false ? `<div style="text-align:center;">
      <div style="width:90px;height:1px;border-top:1.5px solid #333;margin:0 auto 3px;"></div>
      <div style="font-size:8.5px;color:#555;">অধ্যক্ষ / Principal</div>
    </div>` : ""}
    ${fields.controllerSignature !== false ? `<div style="text-align:center;">
      <div style="width:90px;height:1px;border-top:1.5px solid #333;margin:0 auto 3px;"></div>
      <div style="font-size:8.5px;color:#555;line-height:1.4;">পরীক্ষা নিয়ন্ত্রক<br/>Controller of Exam</div>
    </div>` : ""}
    ${fields.qrCode !== false ? `<div style="text-align:center;">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=52x52&data=${encodeURIComponent(`ID:${student?.id}|Seat:${resolvedSeatNumber}|Room:${resolvedRoomNumber}`)}" alt="QR" style="width:52px;height:52px;" />
      <div style="font-size:8px;color:#aaa;margin-top:1px;">Verify</div>
    </div>` : ""}
  </div>
  <!-- BOTTOM STRIPE -->
  <div style="height:5px;background:linear-gradient(90deg,${sc} 0%,${pc} 50%,${sc} 100%);"></div>
</div>`;

    if (options && options.fullDocument === false) return cardMarkup;

    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8">
<title>Admit Card</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
@page{size:A4 portrait;margin:10mm;}
body{font-family:'Noto Sans Bengali','Inter',sans-serif;background:#f0f4f8;padding:20px;display:flex;justify-content:center;align-items:flex-start;}
@media print{
  body{background:white;padding:0;display:block;}
  .admit-card{box-shadow:none!important;width:100%!important;border-radius:0!important;page-break-inside:avoid;break-inside:avoid;}
}
.admit-card{width:595px;max-width:100%;background:#fff;border:2px solid ${pc};border-radius:10px;overflow:hidden;position:relative;box-shadow:0 6px 24px rgba(0,0,0,0.10);display:flex;flex-direction:column;}
.watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:60px;font-weight:900;color:rgba(0,0,0,0.03);white-space:nowrap;pointer-events:none;z-index:0;}
.top-stripe{height:6px;background:linear-gradient(90deg,${pc} 0%,${sc} 50%,${pc} 100%);}
.header{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 18px 10px;text-align:center;background:linear-gradient(180deg,rgba(5,46,43,0.04) 0%,#fff 100%);border-bottom:1.5px solid ${sc}55;position:relative;z-index:1;}
.logo{width:58px;height:58px;object-fit:contain;flex-shrink:0;}
.inst-info{text-align:center;}
.inst-name-bn{font-size:18px;font-weight:700;color:${pc};line-height:1.2;}
.inst-name-en{font-size:11px;font-weight:500;color:#555;letter-spacing:0.4px;}
.inst-branch{font-size:9.5px;color:#888;margin-top:1px;}
.exam-badge{text-align:center;padding:4px 16px;font-size:11px;font-weight:700;color:${pc};background:${sc}25;border-bottom:1px solid ${sc}44;position:relative;z-index:1;}
.title-bar{background:linear-gradient(135deg,${pc} 0%,${pc}ee 100%);padding:9px 16px;text-align:center;position:relative;overflow:hidden;z-index:1;}
.title-bar::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,${sc}33,transparent);}
.title-bar-text{font-size:15px;font-weight:900;color:#fff;letter-spacing:2px;text-transform:uppercase;position:relative;z-index:1;}
.body{display:flex;gap:12px;padding:14px 18px;flex:1;position:relative;z-index:1;align-items:flex-start;}
.left-col{flex:1;display:flex;gap:12px;min-width:0;}
.photo-box{flex-shrink:0;text-align:center;width:70px;}
.photo-box img{width:70px;height:88px;object-fit:cover;border-radius:5px;border:2px solid ${sc};display:block;}
.photo-fallback{width:70px;height:88px;border-radius:5px;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:9px;color:#bbb;background:#f9f9f9;text-align:center;}
.photo-label{font-size:8px;color:#bbb;margin-top:2px;text-align:center;}
.info-grid{flex:1;min-width:0;display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;align-content:start;}
.info-full{grid-column:1/-1;border-bottom:1.5px solid ${sc}55;padding-bottom:5px;margin-bottom:2px;}
.info-half{min-width:0;}
.info-label{font-size:8px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.2px;margin-bottom:1px;}
.info-value{font-size:10.5px;font-weight:600;color:#1a1a1a;word-break:break-word;overflow-wrap:break-word;line-height:1.3;}
.info-value.big{font-size:13.5px;font-weight:700;color:${pc};}
.seating-box{width:115px;flex-shrink:0;border:1.5px solid ${pc};border-radius:7px;overflow:hidden;align-self:flex-start;}
.seating-header{background:${pc};color:#fff;font-size:9px;font-weight:700;text-align:center;padding:4px;letter-spacing:0.5px;}
.seating-row{padding:6px 8px;border-bottom:1px dashed #ddd;text-align:center;}
.seating-row:last-child{border-bottom:none;}
.seating-label{font-size:8px;color:#888;font-weight:500;margin-bottom:1px;}
.seating-num{font-size:20px;font-weight:900;color:${pc};line-height:1.1;}
.seating-val{font-size:11px;font-weight:700;color:#1a1a1a;}
.center-name{font-size:9px;font-weight:600;}
.subject-section{padding:0 18px 10px;position:relative;z-index:1;}
.section-title{font-size:9px;font-weight:700;color:${pc};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;border-left:3px solid ${sc};padding-left:5px;}
.subject-table{width:100%;border-collapse:collapse;font-size:9.5px;table-layout:fixed;}
.subject-table th{background:${pc};color:#fff;padding:4px 7px;text-align:left;font-size:9px;font-weight:700;}
.subject-table td{padding:3.5px 7px;border-bottom:1px solid #edf2f7;word-break:break-word;vertical-align:middle;}
.instructions-box{margin:0 18px 10px;background:#fffbeb;border-left:3px solid ${sc};border-radius:3px;padding:6px 9px;position:relative;z-index:1;}
.instructions-title{font-size:9px;font-weight:700;color:${pc};margin-bottom:3px;}
.instructions-text{font-size:9px;color:#555;line-height:1.5;white-space:pre-line;}
.signature-row{display:flex;justify-content:space-around;align-items:flex-end;padding:10px 18px 12px;border-top:1px solid #e2e8f0;margin-top:auto;position:relative;z-index:1;}
.sig-box{text-align:center;}.sig-line{width:90px;height:1px;border-top:1.5px solid #333;margin:0 auto 3px;}.sig-label{font-size:8.5px;color:#555;font-weight:500;line-height:1.4;}
.qr-box{text-align:center;}.qr-box img{width:52px;height:52px;}.qr-label{font-size:8px;color:#aaa;margin-top:1px;}
.bottom-stripe{height:5px;background:linear-gradient(90deg,${sc} 0%,${pc} 50%,${sc} 100%);}
</style>
</head>
<body>${cardMarkup}</body>
</html>`;
  }, [settings, filters.sectionId, filters.group, selectedFlatClass, seatingConfig, studentOverrides]);

  const generateSerialCardHTML = useCallback((studentsList, branch, exam, tpl) => {
    const logoUrl = resolveLogoUrl(tpl, branch, settings);
    const instNameBn = settings?.institute_name_bn || branch?.name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || branch?.name_en || "RAHMANIA INSTITUTE";
    const branchName = branch?.name_en || branch?.name_bn || "";
    const pc = tpl?.primaryColor || "#052E2B";
    const sc = tpl?.secondaryColor || "#D4AF37";
    const resolvedExamTitle = seatingConfig.examTitle || exam?.title || "";
    const PHOTO_W = 44, PHOTO_H = 54;

    const cardsHtml = studentsList.map((student, idx) => {
      const override = studentOverrides[student?.id] || {};
      const resolvedCenterName = override.centerName || seatingConfig.centerName || branchName;

      let seatNumber = override.seatNumber;
      if (!seatNumber) {
        const rawNum = Number(seatingConfig.startingSeat || 1) + idx;
        const padded = String(rawNum).padStart(Number(seatingConfig.seatDigits || 3), "0");
        seatNumber = `${seatingConfig.seatPrefix || ""}${padded}`;
      }

      let roomNumber = override.roomNumber;
      if (!roomNumber) {
        const startRm = Number(seatingConfig.startingRoom) || 1;
        const perRm = Math.max(1, Number(seatingConfig.studentsPerRoom) || 20);
        roomNumber = String(startRm + Math.floor(idx / perRm));
      }

      const classNameVal = (() => {
        const structure = branch?.academic_structure || [];
        return resolveAcademicDisplayName(student?.class_id, student?.session_id, student?.class_group_id, structure, 'bn') || student?.class_name || "";
      })();

      const isEven = idx % 2 === 0;
      const cardBg = isEven ? "#ffffff" : "#f9fffe";

      return `<div style="
        background:${cardBg};
        border:1.5px solid ${pc}44;
        border-top:3px solid ${pc};
        border-radius:8px;
        overflow:hidden;
        position:relative;
        page-break-inside:avoid;
        break-inside:avoid;
        font-family:'Noto Sans Bengali',Arial,sans-serif;
        box-shadow:0 2px 8px rgba(0,0,0,0.07);
      ">
        <!-- TOP STRIPE -->
        <div style="height:3px;background:linear-gradient(90deg,${pc},${sc},${pc});"></div>

        <!-- HEADER -->
        <div style="display:flex;align-items:center;gap:5px;padding:5px 7px 4px;border-bottom:1px solid ${sc}55;background:linear-gradient(180deg,${pc}08 0%,transparent 100%);">
          ${tpl?.showLogo !== false ? `<img src="${logoUrl}" alt="" width="22" height="22" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'" />` : ""}
          <div style="flex:1;min-width:0;">
            <div style="font-size:8.5px;font-weight:700;color:${pc};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${instNameBn}</div>
            <div style="font-size:7px;color:#666;line-height:1.1;">${instNameEn}${branchName ? " · " + branchName : ""}</div>
          </div>
          <!-- SEAT BADGE -->
          <div style="background:${pc};color:#fff;border-radius:5px;padding:2px 6px;text-align:center;flex-shrink:0;">
            <div style="font-size:6.5px;font-weight:600;opacity:0.85;">আসন</div>
            <div style="font-size:14px;font-weight:900;line-height:1;">${seatNumber}</div>
          </div>
        </div>

        <!-- EXAM BADGE -->
        ${resolvedExamTitle ? `<div style="text-align:center;font-size:7.5px;font-weight:700;color:${pc};background:${sc}22;padding:2px 6px;border-bottom:1px solid ${sc}44;">${resolvedExamTitle}</div>` : ""}

        <!-- BODY -->
        <div style="display:flex;gap:5px;padding:6px 7px;">
          <!-- PHOTO -->
          ${tpl?.showStudentPhoto !== false ? `<div style="flex-shrink:0;width:${PHOTO_W}px;">
            ${student?.photo_url
              ? `<img src="${student.photo_url}" alt="" width="${PHOTO_W}" height="${PHOTO_H}" style="width:${PHOTO_W}px;height:${PHOTO_H}px;max-width:${PHOTO_W}px;object-fit:cover;border-radius:4px;border:1.5px solid ${sc};display:block;" onerror="this.style.display='none'" />`
              : `<div style="width:${PHOTO_W}px;height:${PHOTO_H}px;border-radius:4px;border:1.5px dashed #ccc;background:#f5f5f5;display:flex;align-items:center;justify-content:center;box-sizing:border-box;"><span style="font-size:7px;color:#ccc;">Photo</span></div>`}
          </div>` : ""}

          <!-- INFO -->
          <div style="flex:1;min-width:0;">
            <div style="font-size:9.5px;font-weight:700;color:${pc};line-height:1.2;margin-bottom:3px;word-break:break-word;">${student?.full_name_bn || student?.full_name_en || ""}</div>

            <div style="display:flex;justify-content:space-between;margin-bottom:1.5px;">
              <span style="font-size:7px;color:#888;">পিতা</span>
              <span style="font-size:7.5px;font-weight:600;color:#222;text-align:right;max-width:70%;word-break:break-word;">${student?.father_name || "—"}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:1.5px;">
              <span style="font-size:7px;color:#888;">Roll</span>
              <span style="font-size:7.5px;font-weight:700;color:${pc};">${student?.roll_number || "—"}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:1.5px;">
              <span style="font-size:7px;color:#888;">Class</span>
              <span style="font-size:7.5px;font-weight:600;color:#222;text-align:right;">${classNameVal || "—"}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0;">
              <span style="font-size:7px;color:#888;">ID</span>
              <span style="font-size:7.5px;font-weight:600;color:#555;">${student?.id || "—"}</span>
            </div>
          </div>
        </div>

        <!-- ROOM / CENTER -->
        <div style="display:flex;border-top:1px dashed ${pc}33;margin:0 7px;">
          <div style="flex:1;text-align:center;padding:3px 4px;border-right:1px dashed ${pc}33;">
            <div style="font-size:6.5px;color:#888;">কক্ষ / Room</div>
            <div style="font-size:10px;font-weight:700;color:${pc};">${roomNumber}</div>
          </div>
          <div style="flex:2;text-align:center;padding:3px 4px;">
            <div style="font-size:6.5px;color:#888;">কেন্দ্র / Center</div>
            <div style="font-size:7.5px;font-weight:600;color:#333;word-break:break-word;">${resolvedCenterName}</div>
          </div>
        </div>

        <!-- QR + BOTTOM -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 7px 5px;border-top:1px dashed ${sc}66;">
          <div style="font-size:6.5px;color:#aaa;font-style:italic;">#${idx + 1}</div>
          ${tpl?.showQRCode !== false ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=28x28&data=${encodeURIComponent(`ID:${student?.id}|Seat:${seatNumber}|Room:${roomNumber}`)}" alt="QR" width="28" height="28" style="width:28px;height:28px;" />` : ""}
        </div>

        <!-- BOTTOM STRIPE -->
        <div style="height:2.5px;background:linear-gradient(90deg,${sc},${pc},${sc});"></div>
      </div>`;
    }).join("");

    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8">
<title>Exam Serial Sheet</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
@page{size:A4 portrait;margin:8mm;}
body{font-family:'Noto Sans Bengali','Inter',sans-serif;background:#eef2f7;padding:16px;display:flex;justify-content:center;}
@media print{body{background:white;padding:0;display:block;}}
.wrapper{width:100%;max-width:794px;}
.serial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;}
</style>
</head>
<body>
<div class="wrapper">
  <!-- UNIFIED CONTAINER -->
  <div style="background:#fff;border:2px solid ${pc};border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">
    <!-- TOP STRIPE -->
    <div style="height:5px;background:linear-gradient(90deg,${pc},${sc},${pc});"></div>
    <!-- PAGE HEADER -->
    <div style="display:flex;align-items:center;gap:14px;padding:12px 20px;border-bottom:2px solid ${sc}66;background:linear-gradient(180deg,${pc}06 0%,#fff 100%);">
      <img src="${logoUrl}" alt="" width="54" height="54" style="width:54px;height:54px;object-fit:contain;flex-shrink:0;" onerror="this.style.display='none'" />
      <div style="flex:1;">
        <div style="font-size:20px;font-weight:700;color:${pc};line-height:1.2;">${instNameBn}</div>
        <div style="font-size:11px;color:#666;margin-top:1px;">${instNameEn}${branchName ? " | " + branchName : ""}</div>
      </div>
      <div style="text-align:center;background:${pc};color:#fff;border-radius:8px;padding:8px 18px;flex-shrink:0;">
        <div style="font-size:8px;font-weight:600;opacity:0.85;text-transform:uppercase;letter-spacing:0.8px;">Exam Serial Sheet</div>
        <div style="font-size:14px;font-weight:700;margin-top:1px;">${resolvedExamTitle || exam?.title || ""}</div>
        <div style="font-size:8.5px;opacity:0.8;margin-top:1px;">মোট: ${studentsList.length} জন শিক্ষার্থী</div>
      </div>
    </div>
    <!-- SUBHEADER STRIPE -->
    <div style="height:3px;background:linear-gradient(90deg,${sc},${pc},${sc});"></div>
    <!-- CARD GRID -->
    <div class="serial-grid">
${cardsHtml}
    </div>
    <!-- BOTTOM STRIPE -->
    <div style="height:4px;background:linear-gradient(90deg,${pc},${sc},${pc});"></div>
  </div>
</div>
</body>
</html>`;
  }, [settings, filters, seatingConfig, studentOverrides]);

  const handlePrintAdmitCards = useCallback(async (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      return toast.error("Please select at least one student");
    }
    if (filters.classId === "all" || filters.examId === "all") {
      return toast.error("Please select a specific Class and Exam");
    }
    setGenerating(prev => ({ ...prev, admitCard: true }));
    try {
      const branch = branches.find(b => String(b.id) === String(filters.branchId));
      const exam = exams.find(e => String(e.id) === String(filters.examId));
      if (!branch || !exam) return toast.error("Branch or Exam not found");

      const branchIdNum = branch?.id ? Number(branch.id) : null;
      const batchSize = 20;
      const allHtml = [];
      for (let i = 0; i < studentIds.length; i += batchSize) {
        const batch = studentIds.slice(i, i + batchSize);
        let query = supabaseAdmin.from("students").select(studentColumns).in("id", batch.map(Number));
        if (branchIdNum) query = query.eq("branch_id", branchIdNum);
        const { data } = await query;
        const batchStudents = data || [];
        for (let idx = 0; idx < batchStudents.length; idx++) {
          const student = batchStudents[idx];
          allHtml.push(generateAdmitCardHTML(student, branch, exam, activeTemplate, { fullDocument: false }, i + idx));
        }
      }

      const pc = activeTemplate.primaryColor;
      const sc = activeTemplate.secondaryColor;
      const tpl = activeTemplate;
      const fields = tpl.showFields || {};

      const bulkStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&family=Inter:wght@400;500;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
          width: 100% !important;
        }
        .admit-card-page {
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 10px 0 !important;
        }
        .admit-card-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .admit-card {
          width: ${tpl.layout === "landscape" ? "842px" : "595px"};
          max-width: 100%;
          background: ${tpl.bgColor};
          border: ${tpl.showBorder ? `${tpl.borderWidth}px ${tpl.borderStyle} ${tpl.borderColor}` : "none"};
          border-radius: 12px;
          padding: ${tpl.cardPadding}px;
          margin: 0 auto;
          box-shadow: none;
          position: relative;
          overflow: hidden;
        }
        ${tpl.showWatermark ? `.watermark {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg);
          font-size: 80px; font-weight: 900; color: rgba(0,0,0,0.03); pointer-events: none;
          white-space: nowrap; letter-spacing: 10px;
        }` : ""}
        .header { text-align: ${tpl.headerLayout}; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid ${sc}; }
        .header .logo { ${tpl.headerLayout === "center" ? "margin: 0 auto;" : ""} width: 60px; height: 60px; object-fit: contain; }
        .header h1 { font-size: 16px; font-weight: 700; color: ${pc}; margin-top: 6px; line-height: 1.3; }
        .header h2 { font-size: 13px; font-weight: 500; color: #444; line-height: 1.3; }
        .header p { font-size: 10px; color: #666; line-height: 1.3; }
        .title-bar { background: linear-gradient(135deg, ${pc}, ${sc}); color: white; text-align: center; padding: 8px; border-radius: 6px; margin-bottom: 12px; }
        .title-bar h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .body-section { display: flex; gap: 12px; margin-bottom: 10px; }
        ${fields.studentPhoto ? `.photo-section { width: ${tpl.studentPhotoSize + 20}px; flex-shrink: 0; }
        .photo-section img { width: ${tpl.studentPhotoSize}px; height: ${tpl.studentPhotoSize}px; object-fit: cover; border-radius: 8px; border: 2px solid ${sc}; }` : `.photo-section { display: none; }`}
        .info-section { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: ${tpl.fontSize}px; line-height: 1.4; }
        .info-section .label { color: #666; font-size: ${tpl.fontSize - 2}px; display: block; margin-bottom: 2px; }
        .info-section .value { font-weight: 600; color: #1a1a1a; word-break: break-word; overflow-wrap: break-word; }
        .info-section .full-width { grid-column: 1 / -1; }
        .subject-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: ${tpl.fontSize - 1}px; table-layout: fixed; }
        .subject-table th { background: ${pc}; color: white; padding: 5px 8px; text-align: left; font-weight: 700; font-size: ${tpl.fontSize - 1}px; }
        .subject-table td { padding: 5px 8px; border-bottom: 1px solid #eee; word-break: break-word; overflow-wrap: break-word; vertical-align: middle; line-height: 1.3; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
        .signature-section .sig { text-align: center; font-size: ${tpl.fontSize - 2}px; }
        .signature-section .sig .line { width: 120px; height: 1px; border-top: 1px solid #333; margin: 0 auto 4px; }
        .seal-section { text-align: center; margin: 8px 0; }
        .seal-section img { height: 50px; }
        .footer { text-align: ${tpl.footerLayout}; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: ${tpl.fontSize - 2}px; color: #666; }
        .instructions { margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; font-size: ${tpl.fontSize - 3}px; border-left: 3px solid ${sc}; }
        .instructions h4 { color: ${pc}; margin-bottom: 4px; }
        .instructions p { color: #555; line-height: 1.5; white-space: pre-line; }
        .qr-section { text-align: center; margin-top: 6px; }
        .qr-section img { width: 50px; height: 50px; }
        @media print {
          @page { size: A4 ${activeTemplate.layout}; margin: 5mm; }
          body { margin: 0; padding: 0; background: white; }
          .admit-card-page { page-break-after: always !important; break-after: page !important; }
          .admit-card-page:last-child { page-break-after: auto !important; break-after: auto !important; }
        }
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.open("text/html", "replace");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Admit Cards - ${exam.title}</title>
          <style>${bulkStyles}</style>
        </head>
        <body>
          ${allHtml.map((cardMarkup) => `<div class="admit-card-page">${cardMarkup}</div>`).join("\n")}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      const printWhenReady = () => {
        try {
          printWindow.print();
        } catch (err) {
          console.warn("Print window not ready yet", err);
        }
      };
      if (printWindow.document.readyState === "complete") {
        printWhenReady();
      } else {
        printWindow.onload = printWhenReady;
      }
      toast.success(`${studentIds.length} admit card(s) generated`);
    } catch (err) {
      toast.error(err.message || "Failed to generate admit cards");
    } finally {
      setGenerating(prev => ({ ...prev, admitCard: false }));
    }
  }, [filters, branches, exams, activeTemplate, generateAdmitCardHTML, studentColumns]);

  const handlePrintSerialSheet = useCallback(async (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      return toast.error("Please select at least one student");
    }
    setGenerating(prev => ({ ...prev, serialSheet: true }));
    try {
      const branch = branches.find(b => String(b.id) === String(filters.branchId));
      const exam = exams.find(e => String(e.id) === String(filters.examId));
      if (!branch || !exam) return toast.error("Branch or Exam not found");

      const branchIdNum = branch?.id ? Number(branch.id) : null;
      let studentQuery = supabaseAdmin.from("students").select(studentColumns).in("id", studentIds.map(Number));
      if (branchIdNum) studentQuery = studentQuery.eq("branch_id", branchIdNum);
      const { data } = await studentQuery;
      const studentList = data || [];

      const html = generateSerialCardHTML(studentList, branch, exam, serialTemplate);

      const printWindow = window.open("", "_blank");
      printWindow.document.open("text/html", "replace");
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      const printWhenReady = () => {
        try {
          printWindow.print();
        } catch (err) {
          console.warn("Print window not ready yet", err);
        }
      };
      if (printWindow.document.readyState === "complete") {
        printWhenReady();
      } else {
        printWindow.onload = printWhenReady;
      }
      toast.success(`${studentIds.length} serial card(s) generated`);
    } catch (err) {
      toast.error(err.message || "Failed to generate serial sheet");
    } finally {
      setGenerating(prev => ({ ...prev, serialSheet: false }));
    }
  }, [filters, branches, exams, serialTemplate, generateSerialCardHTML, studentColumns]);

  const generateAdmitCardPdfBlob = useCallback(async (student, branch, exam, tpl) => {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: tpl.layout === "landscape" ? "l" : "p" });
    const W = tpl.layout === "landscape" ? 297 : 210;
    const H = tpl.layout === "landscape" ? 210 : 297;

    const logoUrl = resolveLogoUrl(tpl, branch, settings);
    const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
    const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
    const branchName = branch?.name_en || branch?.name_bn || "";
    const address = branch?.address_en || branch?.address_bn || settings?.address || "";
    const pc = tpl.primaryColor;
    const sc = tpl.secondaryColor;

    let y = tpl.cardMargin;
    const logoSize = 16;
    try {
      const logoImg = await loadImageElement(logoUrl);
      if (logoImg && tpl.showLogo) {
        const lx = tpl.headerLayout === "center" ? (W - logoSize) / 2 : tpl.cardMargin;
        doc.addImage(logoImg, "PNG", lx, y, logoSize, logoSize);
        y += logoSize + 3;
      }
    } catch {}

    doc.setFontSize(11);
    doc.setTextColor(...hexToRgb(pc));
    doc.setFont("helvetica", "bold");
    drawBengaliText(doc, instNameBn, W / 2, y, 11, pc, "center");
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(sc));
    doc.setFont("helvetica", "normal");
    drawBengaliText(doc, instNameEn, W / 2, y, 8, sc, "center");
    y += 4;
    if (branchName || address) {
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(`${branchName}${address ? " | " + address : ""}`, W / 2, y, { align: "center" });
      y += 4;
    }

    y += 2;
    doc.setFillColor(...hexToRgb(pc));
    doc.rect(tpl.cardMargin, y, W - tpl.cardMargin * 2, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(exam?.title || "ADMIT CARD", W / 2, y + 4, { align: "center" });
    y += 10;

    const photoSize = tpl.studentPhotoSize / 3;
    const col1 = tpl.cardMargin;

    if (tpl.showFields.studentPhoto && student?.photo_url) {
      try {
        const photoImg = await loadImageElement(student.photo_url);
        if (photoImg) {
          doc.addImage(photoImg, "JPEG", col1, y, photoSize, photoSize);
        }
      } catch {}
    }

    const photoOffset = (tpl.showFields.studentPhoto && student?.photo_url) ? photoSize + 5 : 0;
    const infoX = tpl.showFields.studentPhoto && student?.photo_url ? col1 + photoSize + 3 : col1;

    const renderInfo = (label, value, x) => {
      if (!value) return;
      doc.setFontSize(tpl.fontSize - 1);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(label, x, y + 3);
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold");
      const valText = String(value || "");
      if (containsBengali(valText)) {
        drawBengaliText(doc, valText, x, y + 7, tpl.fontSize - 1, "#141414", "left");
      } else {
        doc.text(valText, x, y + 7);
      }
      y += 9;
    };

    const classNameVal = resolveAcademicDisplayName(
      student?.class_id, student?.session_id, student?.class_group_id, branch?.academic_structure, 'bn'
    ) || student?.class_name || "";
    if (tpl.showFields.studentName) renderInfo("Student Name:", student?.full_name_bn || student?.full_name_en, infoX);
    if (tpl.showFields.fatherName) renderInfo("Father's Name:", student?.father_name, infoX);
    if (tpl.showFields.motherName) renderInfo("Mother's Name:", student?.mother_name, infoX);
    if (tpl.showFields.studentId) renderInfo("Student ID:", String(student?.id), infoX);
    if (tpl.showFields.roll) renderInfo("Roll:", student?.roll_number, infoX);
    if (tpl.showFields.className) renderInfo("Class:", classNameVal, infoX);
    if (tpl.showFields.session) renderInfo("Session:", exam?.session || exam?.academic_year, infoX);
    if (tpl.showFields.examDate) renderInfo("Exam Date:", exam?.exam_date || exam?.start_date, infoX);

    y = Math.max(y + 3, y + photoOffset + 5);

    if (tpl.showFields.instructions && tpl.customInstructions) {
      y += 3;
      doc.setDrawColor(...hexToRgb(sc));
      doc.setLineWidth(0.5);
      doc.line(tpl.cardMargin, y, tpl.cardMargin + 3, y);
      doc.setFontSize(7);
      doc.setTextColor(...hexToRgb(pc));
      doc.setFont("helvetica", "bold");
      doc.text("Important Instructions:", tpl.cardMargin + 5, y + 1);
      y += 4;
      doc.setFontSize(6);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      const instrLines = drawBengaliTextWrapped(doc, tpl.customInstructions, W - tpl.cardMargin * 2 - 10, 6, "#505050", "left");
      for (const line of instrLines) {
        if (y > H - 30) break;
        drawBengaliText(doc, line, tpl.cardMargin + 5, y, 6, "#505050", "left");
        y += 4;
      }
    }

    if (y > H - 35) y = H - 35;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    const sigY = H - 20;
    if (tpl.showFields.principalSignature) {
      doc.line(tpl.cardMargin + 5, sigY, tpl.cardMargin + 50, sigY);
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      drawBengaliText(doc, "Principal / অধ্যক্ষ", tpl.cardMargin + 28, sigY + 4, 6, "#646464", "center");
    }
    if (tpl.showFields.controllerSignature) {
      doc.line(W - tpl.cardMargin - 50, sigY, W - tpl.cardMargin - 5, sigY);
      drawBengaliText(doc, "Controller of Exam\nপরীক্ষা নিয়ন্ত্রক", W - tpl.cardMargin - 28, sigY + 4, 6, "#646464", "center");
    }

    if (tpl.showFields.qrCode) {
      try {
        const qrDataUrl = await QRCode.toDataURL(`https://rahmaniainstitute.org/verify?student=${student?.id}`, { width: 30, margin: 0 });
        doc.addImage(qrDataUrl, "PNG", W - tpl.cardMargin - 12, H - 28, 10, 10);
      } catch {}
    }

    if (tpl.customFooter) {
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      drawBengaliText(doc, tpl.customFooter, W / 2, H - 5, 6, "#787878", "center");
    }

    return doc.output("blob");
  }, [settings]);

  const _handleBulkDownloadAdmitCards = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.error("Please select at least one student");
    if (filters.classId === "all" || filters.examId === "all") {
      return toast.error("Please select a specific Class and Exam");
    }
    setGenerating(prev => ({ ...prev, bulkDownload: true }));
    try {
      const branch = branches.find(b => String(b.id) === String(filters.branchId));
      const exam = exams.find(e => String(e.id) === String(filters.examId));
      if (!branch || !exam) return toast.error("Branch or Exam not found");

      const branchIdNum = branch?.id ? Number(branch.id) : null;
      let query = supabaseAdmin.from("students").select(studentColumns).in("id", ids.map(Number));
      if (branchIdNum) query = query.eq("branch_id", branchIdNum);
      const { data } = await query;
      const studentsList = data || [];

      for (const student of studentsList) {
        const pdfBlob = await generateAdmitCardPdfBlob(student, branch, exam, activeTemplate);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `admit-card-${student?.roll_number || student?.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`${studentsList.length} admit card PDF(s) downloaded`);
    } catch (err) {
      toast.error(err.message || "Failed to download admit cards");
    } finally {
      setGenerating(prev => ({ ...prev, bulkDownload: false }));
    }
  }, [selectedIds, filters, branches, exams, activeTemplate, studentColumns, generateAdmitCardPdfBlob]);

  const handlePreviewStudent = useCallback(async (student) => {
    setPreviewStudent(student);
    setShowPreview(true);
    setZoomLevel(100);
  }, []);

  const handlePreviewPrint = useCallback(() => {
    const iframe = previewRef.current;
    if (iframe) {
      iframe.contentWindow.print();
    }
  }, []);

  const handlePreviewDownloadPDF = useCallback(async () => {
    if (!previewStudent) return;
    setGenerating(prev => ({ ...prev, preview: true }));
    try {
      const branch = branches.find(b => String(b.id) === String(filters.branchId));
      const exam = exams.find(e => String(e.id) === String(filters.examId));
      if (!branch || !exam) return toast.error("Branch or Exam not found");

      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: activeTemplate.layout === "landscape" ? "l" : "p" });
      const W = activeTemplate.layout === "landscape" ? 297 : 210;
      const H = activeTemplate.layout === "landscape" ? 210 : 297;

      const tpl = activeTemplate;
      const logoUrl = resolveLogoUrl(activeTemplate, branch, settings);
      const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
      const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
      const branchName = branch?.name_en || branch?.name_bn || "";
      const address = branch?.address_en || branch?.address_bn || settings?.address || "";
      const pc = tpl.primaryColor;
      const sc = tpl.secondaryColor;

      let y = tpl.cardMargin;

      const logoSize = 16;
      try {
        const logoImg = await loadImageElement(logoUrl);
        if (logoImg && tpl.showLogo) {
          const lx = tpl.headerLayout === "center" ? (W - logoSize) / 2 : tpl.cardMargin;
          doc.addImage(logoImg, "PNG", lx, y, logoSize, logoSize);
          y += logoSize + 3;
        }
      } catch {}

      doc.setFontSize(11);
      doc.setTextColor(...hexToRgb(pc));
      doc.setFont("helvetica", "bold");
      drawBengaliText(doc, instNameBn, W / 2, y, 11, pc, "center");
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(sc));
      doc.setFont("helvetica", "normal");
      drawBengaliText(doc, instNameEn, W / 2, y, 8, sc, "center");
      y += 4;
      if (branchName || address) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(`${branchName}${address ? " | " + address : ""}`, W / 2, y, { align: "center" });
        y += 4;
      }

      y += 2;
      doc.setFillColor(...hexToRgb(pc));
      doc.rect(tpl.cardMargin, y, W - tpl.cardMargin * 2, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(exam?.title || "ADMIT CARD", W / 2, y + 4, { align: "center" });
      y += 10;

      const photoSize = tpl.studentPhotoSize / 3;
      const col1 = tpl.cardMargin;

      if (tpl.showFields.studentPhoto && previewStudent?.photo_url) {
        try {
          const photoImg = await loadImageElement(previewStudent.photo_url);
          if (photoImg) {
            doc.addImage(photoImg, "JPEG", col1, y, photoSize, photoSize);
          }
        } catch {}
      }

      const photoOffset = (tpl.showFields.studentPhoto && previewStudent?.photo_url) ? photoSize + 5 : 0;
      const infoX = tpl.showFields.studentPhoto && previewStudent?.photo_url ? col1 + photoSize + 3 : col1;
      const infoW = W - infoX - tpl.cardMargin;

      const renderInfo = (label, value, x, _w) => {
        if (!value) return;
        doc.setFontSize(tpl.fontSize - 1);
        doc.setTextColor(120, 120, 120);
        doc.setFont("helvetica", "normal");
        doc.text(label, x, y + 3);
        doc.setTextColor(20, 20, 20);
        doc.setFont("helvetica", "bold");
        const valText = String(value || "");
        if (containsBengali(valText)) {
          drawBengaliText(doc, valText, x, y + 7, tpl.fontSize - 1, "#141414", "left");
        } else {
          doc.text(valText, x, y + 7);
        }
        y += 9;
      };

      const startY = y;
      const classNameVal = resolveAcademicDisplayName(
        previewStudent?.class_id, previewStudent?.session_id, previewStudent?.class_group_id, branch?.academic_structure, 'bn'
      ) || previewStudent?.class_name || "";
      if (tpl.showFields.studentName) renderInfo("Student Name:", previewStudent?.full_name_bn || previewStudent?.full_name_en, infoX, infoW);
      if (tpl.showFields.fatherName) renderInfo("Father's Name:", previewStudent?.father_name, infoX, infoW);
      if (tpl.showFields.motherName) renderInfo("Mother's Name:", previewStudent?.mother_name, infoX, infoW);
      if (tpl.showFields.studentId) renderInfo("Student ID:", String(previewStudent?.id), infoX, infoW);
      if (tpl.showFields.roll) renderInfo("Roll:", previewStudent?.roll_number, infoX, infoW);
      if (tpl.showFields.className) renderInfo("Class:", classNameVal, infoX, infoW);
      if (tpl.showFields.session) renderInfo("Session:", exam?.session || exam?.academic_year, infoX, infoW);
      if (tpl.showFields.examDate) renderInfo("Exam Date:", exam?.exam_date || exam?.start_date, infoX, infoW);

      y = Math.max(startY + photoOffset + 5, y + 3);

      if (tpl.showFields.instructions && tpl.customInstructions) {
        y += 3;
        doc.setDrawColor(...hexToRgb(sc));
        doc.setLineWidth(0.5);
        doc.line(tpl.cardMargin, y, tpl.cardMargin + 3, y);
        doc.setFontSize(7);
        doc.setTextColor(...hexToRgb(pc));
        doc.setFont("helvetica", "bold");
        doc.text("Important Instructions:", tpl.cardMargin + 5, y + 1);
        y += 4;
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        const instrLines = drawBengaliTextWrapped(doc, tpl.customInstructions, W - tpl.cardMargin * 2 - 10, 6, "#505050", "left");
        for (const line of instrLines) {
          if (y > H - 30) break;
          drawBengaliText(doc, line, tpl.cardMargin + 5, y, 6, "#505050", "left");
          y += 4;
        }
      }

      if (y > H - 35) y = H - 35;

      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      const sigY = H - 20;
      if (tpl.showFields.principalSignature) {
        doc.line(tpl.cardMargin + 5, sigY, tpl.cardMargin + 50, sigY);
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        drawBengaliText(doc, "Principal / অধ্যক্ষ", tpl.cardMargin + 28, sigY + 4, 6, "#646464", "center");
      }
      if (tpl.showFields.controllerSignature) {
        doc.line(W - tpl.cardMargin - 50, sigY, W - tpl.cardMargin - 5, sigY);
        drawBengaliText(doc, "Controller of Exam\nপরীক্ষা নিয়ন্ত্রক", W - tpl.cardMargin - 28, sigY + 4, 6, "#646464", "center");
      }

      if (tpl.showFields.qrCode) {
        try {
          const qrDataUrl = await QRCode.toDataURL(`https://rahmaniainstitute.org/verify?student=${previewStudent?.id}`, { width: 30, margin: 0 });
          doc.addImage(qrDataUrl, "PNG", W - tpl.cardMargin - 12, H - 28, 10, 10);
        } catch {}
      }

      if (tpl.customFooter) {
        doc.setFontSize(6);
        doc.setTextColor(120, 120, 120);
        drawBengaliText(doc, tpl.customFooter, W / 2, H - 5, 6, "#787878", "center");
      }

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admit-card-${previewStudent?.roll_number || previewStudent?.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err.message || "Failed to generate PDF");
    } finally {
      setGenerating(prev => ({ ...prev, preview: false }));
    }
  }, [previewStudent, filters, branches, exams, activeTemplate, settings]);

  const handleBulkPrint = async (type) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.error("Please select at least one student");

    if (filters.classId === "all" || filters.examId === "all") {
      return toast.error("Please select a specific Class and Exam");
    }

    if (type === "admit-card") {
      await handlePrintAdmitCards(ids);
    } else {
      await handlePrintSerialSheet(ids);
    }
  };

  const handleIndividualAction = async (student, action, type) => {
    if (type === "preview") {
      handlePreviewStudent(student);
    } else if (type === "print") {
      if (activeModule === "admit-card") {
        await handlePrintAdmitCards([String(student.id)]);
      } else {
        await handlePrintSerialSheet([String(student.id)]);
      }
    } else if (type === "download") {
      setPreviewStudent(student);
      setShowPreview(true);
      setTimeout(async () => {
        try {
          const branch = branches.find(b => String(b.id) === String(filters.branchId));
          const exam = exams.find(e => String(e.id) === String(filters.examId));
          if (!branch || !exam) return toast.error("Branch or Exam not found");
          const jsPDF = (await import("jspdf")).default;
          const doc = new jsPDF({ unit: "mm", format: "a4", orientation: activeTemplate.layout === "landscape" ? "l" : "p" });
          const W = activeTemplate.layout === "landscape" ? 297 : 210;
          const H = activeTemplate.layout === "landscape" ? 210 : 297;
          const tpl = activeTemplate;
          const logoUrl = resolveLogoUrl(activeTemplate, branch, settings);
          const instNameBn = settings?.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
          const instNameEn = settings?.institute_name_en || "RAHMANIA INSTITUTE";
          const branchName = branch?.name_en || branch?.name_bn || "";
          const address = branch?.address_en || branch?.address_bn || settings?.address || "";
          const pc = tpl.primaryColor;
          const sc = tpl.secondaryColor;

          let y = tpl.cardMargin;
          const logoSize = 16;
          try {
            const logoImg = await loadImageElement(logoUrl);
            if (logoImg && tpl.showLogo) {
              const lx = tpl.headerLayout === "center" ? (W - logoSize) / 2 : tpl.cardMargin;
              doc.addImage(logoImg, "PNG", lx, y, logoSize, logoSize);
              y += logoSize + 3;
            }
          } catch {}

          doc.setFontSize(11);
          doc.setTextColor(...hexToRgb(pc));
          doc.setFont("helvetica", "bold");
          drawBengaliText(doc, instNameBn, W / 2, y, 11, pc, "center");
          y += 5;
          doc.setFontSize(8);
          doc.setTextColor(...hexToRgb(sc));
          doc.setFont("helvetica", "normal");
          drawBengaliText(doc, instNameEn, W / 2, y, 8, sc, "center");
          y += 4;
          if (branchName || address) {
            doc.setFontSize(6);
            doc.setTextColor(100, 100, 100);
            doc.text(`${branchName}${address ? " | " + address : ""}`, W / 2, y, { align: "center" });
            y += 4;
          }

          y += 2;
          doc.setFillColor(...hexToRgb(pc));
          doc.rect(tpl.cardMargin, y, W - tpl.cardMargin * 2, 6, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(exam?.title || "ADMIT CARD", W / 2, y + 4, { align: "center" });
          y += 10;

          const photoSize = tpl.studentPhotoSize / 3;
          if (tpl.showFields.studentPhoto && student?.photo_url) {
            try {
              const photoImg = await loadImageElement(student.photo_url);
              if (photoImg) doc.addImage(photoImg, "JPEG", tpl.cardMargin, y, photoSize, photoSize);
            } catch {}
          }

          const photoOffset = (tpl.showFields.studentPhoto && student?.photo_url) ? photoSize + 5 : 0;
          const infoX = tpl.showFields.studentPhoto && student?.photo_url ? tpl.cardMargin + photoSize + 3 : tpl.cardMargin;

          const renderInfo = (label, value) => {
            if (!value) return;
            doc.setFontSize(tpl.fontSize - 1);
            doc.setTextColor(120, 120, 120);
            doc.setFont("helvetica", "normal");
            doc.text(label, infoX, y + 3);
            doc.setTextColor(20, 20, 20);
            doc.setFont("helvetica", "bold");
            const valText = String(value || "");
            if (containsBengali(valText)) drawBengaliText(doc, valText, infoX, y + 7, tpl.fontSize - 1, "#141414", "left");
            else doc.text(valText, infoX, y + 7);
            y += 9;
          };

          const startY = y;
          const classNameVal = resolveAcademicDisplayName(
            student?.class_id, student?.session_id, student?.class_group_id, branch?.academic_structure, 'bn'
          ) || student?.class_name || "";
          if (tpl.showFields.studentName) renderInfo("Student Name:", student?.full_name_bn || student?.full_name_en);
          if (tpl.showFields.fatherName) renderInfo("Father's Name:", student?.father_name);
          if (tpl.showFields.motherName) renderInfo("Mother's Name:", student?.mother_name);
          if (tpl.showFields.studentId) renderInfo("Student ID:", String(student?.id));
          if (tpl.showFields.roll) renderInfo("Roll:", student?.roll_number);
          if (tpl.showFields.className) renderInfo("Class:", classNameVal);
          if (tpl.showFields.session) renderInfo("Session:", exam?.session || exam?.academic_year);
          if (tpl.showFields.examDate) renderInfo("Exam Date:", exam?.exam_date || exam?.start_date);

          y = Math.max(startY + photoOffset + 5, y + 3);

          if (tpl.showFields.instructions && tpl.customInstructions) {
            y += 3;
            doc.setDrawColor(...hexToRgb(sc));
            doc.setLineWidth(0.5);
            doc.line(tpl.cardMargin, y, tpl.cardMargin + 3, y);
            doc.setFontSize(7);
            doc.setTextColor(...hexToRgb(pc));
            doc.setFont("helvetica", "bold");
            doc.text("Important Instructions:", tpl.cardMargin + 5, y + 1);
            y += 4;
            doc.setFontSize(6);
            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");
            const instrLines = drawBengaliTextWrapped(doc, tpl.customInstructions, W - tpl.cardMargin * 2 - 10, 6, "#505050", "left");
            for (const line of instrLines) {
              if (y > H - 30) break;
              drawBengaliText(doc, line, tpl.cardMargin + 5, y, 6, "#505050", "left");
              y += 4;
            }
          }

          if (y > H - 35) y = H - 35;

          doc.setDrawColor(150, 150, 150);
          doc.setLineWidth(0.3);
          const sigY = H - 20;
          if (tpl.showFields.principalSignature) {
            doc.line(tpl.cardMargin + 5, sigY, tpl.cardMargin + 50, sigY);
            doc.setFontSize(6);
            doc.setTextColor(100, 100, 100);
            drawBengaliText(doc, "Principal / অধ্যক্ষ", tpl.cardMargin + 28, sigY + 4, 6, "#646464", "center");
          }
          if (tpl.showFields.controllerSignature) {
            doc.line(W - tpl.cardMargin - 50, sigY, W - tpl.cardMargin - 5, sigY);
            drawBengaliText(doc, "Controller of Exam\nপরীক্ষা নিয়ন্ত্রক", W - tpl.cardMargin - 28, sigY + 4, 6, "#646464", "center");
          }

          if (tpl.showFields.qrCode) {
            try {
              const qrDataUrl = await QRCode.toDataURL(`https://rahmaniainstitute.org/verify?student=${student?.id}`, { width: 30, margin: 0 });
              doc.addImage(qrDataUrl, "PNG", W - tpl.cardMargin - 12, H - 28, 10, 10);
            } catch {}
          }

          if (tpl.customFooter) {
            doc.setFontSize(6);
            doc.setTextColor(120, 120, 120);
            drawBengaliText(doc, tpl.customFooter, W / 2, H - 5, 6, "#787878", "center");
          }

          const pdfBlob = doc.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `admit-card-${student?.roll_number || student?.id}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("PDF downloaded");
        } catch (err) {
          toast.error(err.message || "Failed to generate PDF");
        }
      }, 500);
    }
  };

  const renderFilters = () => (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#052E2B] uppercase tracking-wider flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" /> Search & Filters
        </h3>
        {filters.branchId !== "all" && filters.classId !== "all" && filters.examId !== "all" && (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
            {totalStudents} Students Found
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {!isBranchAdmin && (
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Branch / শাখা</label>
            <Select value={filters.branchId} onValueChange={v => handleFilterChange("branchId", v)}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Exam / পরীক্ষা</label>
          <Select value={filters.examId} onValueChange={v => handleFilterChange("examId", v)} disabled={filters.branchId === "all"}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Exam" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {filteredExams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Class / শ্রেণী</label>
          <Select value={filters.classId} onValueChange={v => handleFilterChange("classId", v)} disabled={filters.branchId === "all"}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {flatClassOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {groupOptions.length > 0 && (
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Group / গ্রুপ</label>
            <Select value={filters.group} onValueChange={v => handleFilterChange("group", v)} disabled={filters.classId === "all"}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব গ্রুপ (All Groups)</SelectItem>
                {groupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentList = () => (
    <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold h-9 px-3 hover:bg-slate-100 rounded-xl"
            >
              {allCurrentPageSelected ? <CheckSquare className="h-4 w-4 text-[#052E2B]" /> : <Square className="h-4 w-4" />}
              Select All
            </Button>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Roll or ID..."
                className="w-full pl-9 h-10 bg-slate-50 border-slate-200 focus:border-[#052E2B] focus:bg-white rounded-xl text-xs outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px] font-bold">Total: {totalStudents}</Badge>
            {selectedIds.size > 0 && (
              <Badge className="bg-[#052E2B] text-white border-0 text-[10px] font-bold">Selected: {selectedIds.size}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {studentsLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No students found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filters.branchId === "all" || filters.classId === "all" || filters.examId === "all"
                ? "Please select Branch, Class, and Exam to load students"
                : "No students match the current filters"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b">
                    <th className="py-3 px-4 w-10">
                      <Checkbox checked={allCurrentPageSelected} onCheckedChange={handleSelectAll} />
                    </th>
                    <th className="py-3 px-4 text-left font-bold text-slate-500">Photo</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-500">Student ID</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-500">Roll</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-500">Name</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-500">Father's Name</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-500">Class</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-500">Seat #</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-500">Room</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-500">Status</th>
                    <th className="py-3 px-4 text-center font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const override = studentOverrides[student.id] || {};
                    const globalIdx = (page - 1) * PAGE_SIZE + idx;
                    const seatNum = override.seatNumber || `${seatingConfig.seatPrefix || ""}${String(Number(seatingConfig.startingSeat || 1) + globalIdx).padStart(Number(seatingConfig.seatDigits || 3), "0")}`;
                    const roomNum = override.roomNumber || String(Number(seatingConfig.startingRoom || 1) + Math.floor(globalIdx / Math.max(1, Number(seatingConfig.studentsPerRoom || 20))));
                    return (
                    <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.has(String(student.id)) ? "bg-[#052E2B]/5" : ""}`}>
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedIds.has(String(student.id))}
                          onCheckedChange={() => handleSelectStudent(String(student.id))}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Avatar className="h-9 w-9 border-2 border-slate-200">
                          <AvatarImage src={student.photo_url} alt="" />
                          <AvatarFallback className="bg-[#052E2B]/10 text-[#052E2B] text-xs font-bold">
                            {(student.full_name_en || "S")[0]}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 font-bold">{student.id}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{student.roll_number || "—"}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{student.full_name_en || ""}</p>
                        {student.full_name_bn && <p className="text-[10px] text-slate-400">{student.full_name_bn}</p>}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{student.father_name || "—"}</td>
                      <td className="py-3 px-4">
                        {resolveAcademicDisplayName(
                          student.class_id, student.session_id, student.class_group_id, selectedBranch?.academic_structure, 'bn'
                        ) || student.class_name || "—"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#052E2B]">
                        <Badge className="bg-[#052E2B]/10 text-[#052E2B] border-0 text-[10px]">{seatNum}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        <Badge className="bg-amber-50 text-amber-700 border-0 text-[10px]">Rm {roomNum}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-[10px] font-bold border-0 ${student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {student.status || "active"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-50" onClick={() => setEditingStudentSeating(student)} title="Edit Seating (Seat/Room/Center)">
                            <Pencil className="h-3.5 w-3.5 text-purple-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" onClick={() => handleIndividualAction(student, "preview")} title="Preview">
                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50" onClick={() => handleIndividualAction(student, "print", activeModule)} title="Print">
                            <Printer className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50" onClick={() => handleIndividualAction(student, "download")} title="Download PDF">
                            <Download className="h-3.5 w-3.5 text-amber-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                  Page {page} of {totalPages} ({totalStudents} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 rounded-xl text-xs gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 rounded-xl text-xs gap-1"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderOutputCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${activeModule === "admit-card" ? "ring-2 ring-[#D4AF37]" : ""}`} onClick={() => setActiveModule("admit-card")}>
        <div className="h-2 bg-gradient-to-r from-[#052E2B] to-[#D4AF37]" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#052E2B]/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-[#052E2B]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-slate-800">Admit Card</h3>
              <p className="text-xs text-slate-400 mt-0.5">প্রবেশপত্র তৈরি ও প্রিন্ট করুন</p>
            </div>
            <Badge className="bg-[#052E2B] text-white border-0 text-[10px]">{selectedIds.size} Selected</Badge>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="flex-1 bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-9 text-xs font-bold gap-1.5"
              onClick={(e) => { e.stopPropagation(); setActiveModule("admit-card"); setShowCustomizer(true); }}
            >
              <Palette className="h-3.5 w-3.5" /> Customize
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#D4AF37] hover:bg-[#b8960a] text-white rounded-xl h-9 text-xs font-bold gap-1.5"
              onClick={(e) => { e.stopPropagation(); handleBulkPrint("admit-card"); }}
              disabled={generating.admitCard || selectedIds.size === 0}
            >
              {generating.admitCard ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
              Print All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md ${activeModule === "serial-sheet" ? "ring-2 ring-[#D4AF37]" : ""}`} onClick={() => setActiveModule("serial-sheet")}>
        <div className="h-2 bg-gradient-to-r from-[#D4AF37] to-[#052E2B]" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Grid3X3 className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-slate-800">Exam Serial Sheet</h3>
              <p className="text-xs text-slate-400 mt-0.5">সিরিয়াল শিট তৈরি ও প্রিন্ট করুন</p>
            </div>
            <Badge className="bg-amber-600 text-white border-0 text-[10px]">{selectedIds.size} Selected</Badge>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="flex-1 bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl h-9 text-xs font-bold gap-1.5"
              onClick={(e) => { e.stopPropagation(); setActiveModule("serial-sheet"); setShowCustomizer(true); }}
            >
              <Settings className="h-3.5 w-3.5" /> Settings
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#D4AF37] hover:bg-[#b8960a] text-white rounded-xl h-9 text-xs font-bold gap-1.5"
              onClick={(e) => { e.stopPropagation(); handleBulkPrint("serial-sheet"); }}
              disabled={generating.serialSheet || selectedIds.size === 0}
            >
              {generating.serialSheet ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Print All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomizer = () => (
    <AnimatePresence>
      {showCustomizer && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-white shadow-2xl border-l overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b z-10 p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveModule("admit-card")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeModule === "admit-card"
                    ? "bg-[#052E2B] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                Admit Card Customizer
              </button>
              <button
                type="button"
                onClick={() => setActiveModule("serial-sheet")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeModule === "serial-sheet"
                    ? "bg-[#D4AF37] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Serial Sheet Settings
              </button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowCustomizer(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-5 space-y-6">
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
              <Settings className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-700 leading-relaxed">
                <strong>Seating &amp; Exam Configuration</strong> (Exam Title, Card Title, Center Name, Seat/Room numbering) is now configured when <strong>creating or editing an Exam</strong> from the <em>Exams List</em> tab.<br />
                Use the <strong>✏️ pencil icon</strong> in the student table to override values for individual students.
              </p>
            </div>

            {activeModule === "admit-card" ? (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Templates</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {templates.map(tpl => (
                      <Badge
                        key={tpl.id}
                        className={`cursor-pointer text-[10px] px-3 py-1.5 ${
                          activeTemplateId === tpl.id
                            ? "bg-[#052E2B] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        onClick={() => setActiveTemplateId(tpl.id)}
                      >
                        {tpl.name}
                        {tpl.id === getDefaultTemplate() && " ★"}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1" onClick={handleAddTemplate}>
                      <Plus className="h-3 w-3" /> New
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1" onClick={() => activeTemplate && handleDuplicateTemplate(activeTemplate)}>
                      <Copy className="h-3 w-3" /> Duplicate
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1 text-red-500 hover:text-red-600" onClick={() => handleDeleteTemplate(activeTemplateId)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1" onClick={() => handleSetDefaultTemplate(activeTemplateId)}>
                      <Check className="h-3 w-3" /> Set Default
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Palette className="h-3.5 w-3.5" /> Colors & Style</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Primary Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={activeTemplate?.primaryColor || "#052E2B"} onChange={e => updateTemplateField("primaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={activeTemplate?.primaryColor || ""} onChange={e => updateTemplateField("primaryColor", e.target.value)} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Secondary Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={activeTemplate?.secondaryColor || "#D4AF37"} onChange={e => updateTemplateField("secondaryColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={activeTemplate?.secondaryColor || ""} onChange={e => updateTemplateField("secondaryColor", e.target.value)} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Border Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={activeTemplate?.borderColor || "#052E2B"} onChange={e => updateTemplateField("borderColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={activeTemplate?.borderColor || ""} onChange={e => updateTemplateField("borderColor", e.target.value)} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Background Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={activeTemplate?.bgColor || "#ffffff"} onChange={e => updateTemplateField("bgColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={activeTemplate?.bgColor || ""} onChange={e => updateTemplateField("bgColor", e.target.value)} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Layout className="h-3.5 w-3.5" /> Layout</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Layout</label>
                      <Select value={activeTemplate?.layout || "portrait"} onValueChange={v => updateTemplateField("layout", v)}>
                        <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Cards Per Page</label>
                      <Select value={activeTemplate?.singlePerPage ? "single" : "multiple"} onValueChange={v => updateTemplateField("singlePerPage", v === "single")}>
                        <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Card</SelectItem>
                          <SelectItem value="multiple">Multiple Cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Border Style</label>
                      <Select value={activeTemplate?.borderStyle || "solid"} onValueChange={v => updateTemplateField("borderStyle", v)}>
                        <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Header Layout</label>
                      <Select value={activeTemplate?.headerLayout || "center"} onValueChange={v => updateTemplateField("headerLayout", v)}>
                        <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Card Padding (px)</label>
                      <Input type="number" value={activeTemplate?.cardPadding || 15} onChange={e => updateTemplateField("cardPadding", Number(e.target.value))} className="h-9 text-xs rounded-xl" min="5" max="50" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Photo Size (px)</label>
                      <Input type="number" value={activeTemplate?.studentPhotoSize || 70} onChange={e => updateTemplateField("studentPhotoSize", Number(e.target.value))} className="h-9 text-xs rounded-xl" min="30" max="150" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Type className="h-3.5 w-3.5" /> Font & Text</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Bangla Font</label>
                      <Input value={activeTemplate?.banglaFont || "Noto Sans Bengali"} onChange={e => updateTemplateField("banglaFont", e.target.value)} className="h-9 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">English Font</label>
                      <Input value={activeTemplate?.englishFont || "Inter"} onChange={e => updateTemplateField("englishFont", e.target.value)} className="h-9 text-xs rounded-xl" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Font Size (px)</label>
                      <Input type="number" value={activeTemplate?.fontSize || 12} onChange={e => updateTemplateField("fontSize", Number(e.target.value))} className="h-9 text-xs rounded-xl" min="8" max="20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Show / Hide Fields</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activeTemplate?.showFields && Object.entries(activeTemplate.showFields).map(([key, val]) => (
                      <label key={key} className="flex items-center gap-1.5 text-[10px] cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                        <input type="checkbox" checked={val} onChange={() => toggleShowField(key)} className="rounded" />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Logo Customization / লোগো</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={activeTemplate?.showLogo !== false} onChange={e => updateTemplateField("showLogo", e.target.checked)} className="rounded" />
                      Show Logo on Card
                    </label>
                  </div>
                  {activeTemplate?.showLogo !== false && (
                    <div className="space-y-2">
                      <ImageUpload
                        value={activeTemplate?.customLogoUrl || ""}
                        onChange={url => updateTemplateField("customLogoUrl", url)}
                        label="Custom Logo Image"
                      />
                      <div className="flex gap-2 items-center">
                        <Input
                          value={activeTemplate?.customLogoUrl || ""}
                          onChange={e => updateTemplateField("customLogoUrl", e.target.value)}
                          placeholder="Or paste image URL..."
                          className="h-9 text-xs rounded-xl flex-1"
                        />
                        {activeTemplate?.customLogoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => updateTemplateField("customLogoUrl", "")}
                          >
                            Reset Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Image className="h-3.5 w-3.5" /> Watermark & Extras</h4>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={activeTemplate?.showWatermark || false} onChange={e => updateTemplateField("showWatermark", e.target.checked)} className="rounded" />
                      Show Watermark
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={activeTemplate?.showBorder !== false} onChange={e => updateTemplateField("showBorder", e.target.checked)} className="rounded" />
                      Show Border
                    </label>
                  </div>
                  {activeTemplate?.showWatermark && (
                    <Input value={activeTemplate?.watermarkText || ""} onChange={e => updateTemplateField("watermarkText", e.target.value)} placeholder="Watermark text" className="h-9 text-xs rounded-xl" />
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Custom Text</h4>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Custom Header</label>
                    <Input value={activeTemplate?.customHeader || ""} onChange={e => updateTemplateField("customHeader", e.target.value)} placeholder="Optional custom header text" className="h-9 text-xs rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Custom Footer</label>
                    <Input value={activeTemplate?.customFooter || ""} onChange={e => updateTemplateField("customFooter", e.target.value)} placeholder="Optional custom footer text" className="h-9 text-xs rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Instructions</label>
                    <textarea
                      value={activeTemplate?.customInstructions || ""}
                      onChange={e => updateTemplateField("customInstructions", e.target.value)}
                      className="w-full min-h-[80px] p-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#052E2B] resize-y"
                      placeholder="Important instructions for the exam..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Serial Sheet Settings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Cards Per Page</label>
                      <Input type="number" value={serialTemplate.cardsPerPage} onChange={e => setSerialTemplate(prev => ({ ...prev, cardsPerPage: Number(e.target.value) }))} className="h-9 text-xs rounded-xl" min="8" max="30" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Font Size (px)</label>
                      <Input type="number" value={serialTemplate.fontSize} onChange={e => setSerialTemplate(prev => ({ ...prev, fontSize: Number(e.target.value) }))} className="h-9 text-xs rounded-xl" min="6" max="14" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Primary Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={serialTemplate.primaryColor} onChange={e => setSerialTemplate(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={serialTemplate.primaryColor} onChange={e => setSerialTemplate(prev => ({ ...prev, primaryColor: e.target.value }))} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Border Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={serialTemplate.borderColor} onChange={e => setSerialTemplate(prev => ({ ...prev, borderColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border" />
                        <Input value={serialTemplate.borderColor} onChange={e => setSerialTemplate(prev => ({ ...prev, borderColor: e.target.value }))} className="h-9 text-xs rounded-xl flex-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={serialTemplate.showLogo} onChange={e => setSerialTemplate(prev => ({ ...prev, showLogo: e.target.checked }))} className="rounded" />
                      Show Logo
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={serialTemplate.showStudentPhoto} onChange={e => setSerialTemplate(prev => ({ ...prev, showStudentPhoto: e.target.checked }))} className="rounded" />
                      Show Photo
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={serialTemplate.showQRCode} onChange={e => setSerialTemplate(prev => ({ ...prev, showQRCode: e.target.checked }))} className="rounded" />
                      Show QR Code
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={serialTemplate.showCuttingGuide} onChange={e => setSerialTemplate(prev => ({ ...prev, showCuttingGuide: e.target.checked }))} className="rounded" />
                      Cutting Guide
                    </label>
                  </div>

                  {serialTemplate.showLogo && (
                    <div className="space-y-2 border-t pt-3 mt-3">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Serial Sheet Custom Logo</label>
                      <ImageUpload
                        value={serialTemplate.customLogoUrl || ""}
                        onChange={url => setSerialTemplate(prev => ({ ...prev, customLogoUrl: url }))}
                        label="Custom Logo Image"
                      />
                      <div className="flex gap-2 items-center">
                        <Input
                          value={serialTemplate.customLogoUrl || ""}
                          onChange={e => setSerialTemplate(prev => ({ ...prev, customLogoUrl: e.target.value }))}
                          placeholder="Or paste image URL..."
                          className="h-9 text-xs rounded-xl flex-1"
                        />
                        {serialTemplate.customLogoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => setSerialTemplate(prev => ({ ...prev, customLogoUrl: "" }))}
                          >
                            Reset Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4">
            <Button className="w-full bg-[#052E2B] hover:bg-[#031c1a] text-white rounded-xl gap-2" onClick={() => { saveSerialTemplate(serialTemplate); setShowCustomizer(false); toast.success("Settings saved"); }}>
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPreview = () => (
    <AnimatePresence>
      {showPreview && previewStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-[#052E2B] text-sm">Preview: {previewStudent.full_name_en || previewStudent.full_name_bn}</h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px]">Roll: {previewStudent.roll_number}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setZoomLevel(z => Math.min(200, z + 10))} title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold text-slate-500 w-10 text-center">{zoomLevel}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setZoomLevel(z => Math.max(30, z - 10))} title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setPreviewMode(m => m === "desktop" ? "mobile" : "desktop")} title="Toggle Mobile/Desktop">
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setIsFullScreen(f => !f)} title="Full Screen">
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={handlePreviewPrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={handlePreviewDownloadPDF} disabled={generating.preview}>
                  {generating.preview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  PDF
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => setShowPreview(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className={`flex-1 overflow-auto p-4 ${previewMode === "mobile" ? "flex justify-center" : ""}`}>
              <div
                ref={previewRef}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  width: previewMode === "mobile" ? "375px" : "100%",
                  minHeight: previewMode === "mobile" ? "667px" : "auto",
                }}
              >
                <iframe
                  srcDoc={(() => {
                    const branch = branches.find(b => String(b.id) === String(filters.branchId));
                    const exam = exams.find(e => String(e.id) === String(filters.examId));
                    if (!branch || !exam) return "<p>Select branch and exam</p>";
                    return generateAdmitCardHTML(previewStudent, branch, exam, activeTemplate);
                  })()}
                  className="w-full h-full min-h-[500px] border-0 rounded-xl"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const needsFiltering = filters.branchId === "all" || filters.classId === "all" || filters.examId === "all";

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#052E2B] flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#D4AF37]" />
            {activeModule === "admit-card" ? "Admit Card Manager" : "Exam Serial Sheet"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeModule === "admit-card"
              ? "Design, preview, and print professional admit cards"
              : "Generate seating arrangement serial sheets"}
          </p>
        </div>
      </div>

      {renderFilters()}
      {renderOutputCards()}
      {!needsFiltering && renderStudentList()}

      {needsFiltering && (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
          <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Please select Branch, Class, and Exam</p>
          <p className="text-xs text-slate-400 mt-1">Students will load once all filters are applied</p>
        </div>
      )}

      {renderCustomizer()}
      {renderPreview()}

      {/* ── Per-student Seating Override Dialog ── */}
      {editingStudentSeating && (() => {
        const stu = editingStudentSeating;
        const existing = studentOverrides[stu.id] || {};
        const globalIdx = students.findIndex(s => s.id === stu.id);
        const autoSeat = `${seatingConfig.seatPrefix || ""}${String(Number(seatingConfig.startingSeat || 1) + Math.max(0, globalIdx)).padStart(Number(seatingConfig.seatDigits || 3), "0")}`;
        const autoRoom = String(Number(seatingConfig.startingRoom || 1) + Math.floor(Math.max(0, globalIdx) / Math.max(1, Number(seatingConfig.studentsPerRoom || 20))));
        return (
          <Dialog open={!!editingStudentSeating} onOpenChange={open => !open && setEditingStudentSeating(null)}>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold text-[#052E2B] flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-purple-600" />
                  {"Override Seating \u2014 "}{stu.full_name_en || stu.full_name_bn || `Student #${stu.id}`}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <p className="text-[10px] text-slate-400">Leave a field blank to use the auto-calculated value. Auto: Seat <strong>{autoSeat}</strong>, Room <strong>{autoRoom}</strong>, Center <strong>{seatingConfig.centerName || "(global default)"}</strong></p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1 font-medium">আসন নম্বর / Seat Number</label>
                    <Input
                      defaultValue={existing.seatNumber || ""}
                      placeholder={`Auto: ${autoSeat}`}
                      className="h-9 text-xs rounded-xl"
                      id="override-seat"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1 font-medium">কক্ষ নম্বর / Room Number</label>
                    <Input
                      defaultValue={existing.roomNumber || ""}
                      placeholder={`Auto: ${autoRoom}`}
                      className="h-9 text-xs rounded-xl"
                      id="override-room"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1 font-medium">পরীক্ষা কেন্দ্র / Center Name</label>
                    <Input
                      defaultValue={existing.centerName || ""}
                      placeholder={seatingConfig.centerName || "Global center name"}
                      className="h-9 text-xs rounded-xl"
                      id="override-center"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 h-9 text-xs rounded-xl bg-[#052E2B] hover:bg-[#052E2B]/90 text-white"
                    onClick={() => {
                      const seatVal = document.getElementById("override-seat")?.value.trim() || "";
                      const roomVal = document.getElementById("override-room")?.value.trim() || "";
                      const centerVal = document.getElementById("override-center")?.value.trim() || "";
                      setStudentOverrides(prev => ({
                        ...prev,
                        [stu.id]: {
                          seatNumber: seatVal || null,
                          roomNumber: roomVal || null,
                          centerName: centerVal || null,
                        },
                      }));
                      setEditingStudentSeating(null);
                    }}
                  >
                    Save Override
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setStudentOverrides(prev => {
                        const next = { ...prev };
                        delete next[stu.id];
                        return next;
                      });
                      setEditingStudentSeating(null);
                    }}
                  >
                    Clear Override
                  </Button>
                  <Button variant="ghost" className="h-9 text-xs rounded-xl" onClick={() => setEditingStudentSeating(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}
