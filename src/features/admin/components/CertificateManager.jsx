import React, { useState, useMemo, useCallback, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, Printer, FileText, User, ArrowLeft, GraduationCap, Settings, Edit3, ImageIcon } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { format } from "date-fns";
import QRCode from "qrcode";
import { drawBengaliText, drawBengaliTextWrapped } from "../../../lib/pdf-utils";
import { resolveAcademicDisplayName, isStudentInClassOption } from "../../../lib/academic";

let cachedFontBase64 = null;

async function loadFont() {
  if (cachedFontBase64) return cachedFontBase64;
  try {
    const url = "https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf";
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedFontBase64 = reader.result.split(",")[1];
        resolve(cachedFontBase64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
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

function fillTemplate(tpl, student, branchInfo, extra = {}) {
  let className = "";
  let sessionName = "";
  let groupName = "";
  let academicFull = "";

  if (branchInfo?.academic_structure && student.class_id) {
    academicFull = resolveAcademicDisplayName(
      student.class_id,
      student.session_id,
      student.class_group_id,
      branchInfo.academic_structure,
      "bn"
    );

    const cls = branchInfo.academic_structure.find(c => String(c.id) === String(student.class_id));
    if (cls) {
      className = cls.class_name?.bn || cls.class_name?.en || "";
      if (student.session_id && Array.isArray(cls.sections)) {
        const sec = cls.sections.find(s => String(s.id) === String(student.session_id));
        if (sec) {
          sessionName = sec.section_name?.bn || sec.section_name?.en || sec.section?.bn || sec.section?.en || "";
        }
      }
      if (student.class_group_id && Array.isArray(cls.groups)) {
        const grp = cls.groups.find(g => String(g.id) === String(student.class_group_id));
        if (grp) {
          groupName = grp.group_name?.bn || grp.group_name?.en || "";
        }
      }
    }
  }

  if (!className) className = student.class_name || "";
  if (!sessionName) sessionName = student.session || "";

  return tpl
    .replace(/\{\{student_name\}\}/g, student.full_name_bn || student.full_name_en || "")
    .replace(/\{\{father_name\}\}/g, student.father_name || "")
    .replace(/\{\{mother_name\}\}/g, student.mother_name || "")
    .replace(/\{\{class\}\}/g, className)
    .replace(/\{\{session\}\}/g, sessionName)
    .replace(/\{\{group\}\}/g, groupName)
    .replace(/\{\{academic_full\}\}/g, academicFull)
    .replace(/\{\{next_class\}\}/g, extra.next_class || "")
    .replace(/\{\{branch\}\}/g, branchInfo?.name_bn || branchInfo?.name_en || "")
    .replace(/\{\{date\}\}/g, format(new Date(), "dd/MM/yyyy"))
    .replace(/\{\{student_id\}\}/g, String(student.id))
    .replace(/\{\{roll_number\}\}/g, student.roll_number || "")
    .replace(/\{\{address\}\}/g, student.address_bn || student.address || "");
}

const EMPTY_OBJ = {};

export default function CertificateManager({ currentUser }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create"); // "create" | "customize"
  const [step, setStep] = useState("select");
  const [filters, setFilters] = useState({ branchId: "", classId: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [generating, setGenerating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const isBranchAdmin = currentUser?.role === "branch_admin" || currentUser?.role === "boarding_manager";

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["branches-admin"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const branches = useMemo(() => {
    if (isBranchAdmin && currentUser?.branch_id) {
      return rawBranches.filter(b => String(b.id) === String(currentUser.branch_id));
    }
    return rawBranches;
  }, [rawBranches, isBranchAdmin, currentUser]);

  const selectedBranch = branches.find(b => String(b.id) === String(filters.branchId));

  const classes = useMemo(() => {
    if (!selectedBranch?.academic_structure) return [];
    return selectedBranch.academic_structure.map(c => ({
      id: c.id,
      name: c.class_name?.bn || c.class_name?.en || String(c.id),
    }));
  }, [selectedBranch]);

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["certificate-students", filters.branchId, filters.classId],
    queryFn: async () => {
      if (!filters.branchId) return [];
      let res;
      try {
        res = await appClient.entities.Student.filter({
          branch_id: Number(filters.branchId),
          status: "active",
        });
      } catch (e) {
        console.warn("[Certificate] filter failed, falling back to list:", e.message);
      }
      const list = res?.rows || (Array.isArray(res) ? res : []);
      if (list.length > 0) return list;
      
      const fallback = await appClient.entities.Student.listAll({ sort: "-created_date" });
      const fallbackList = fallback?.rows || (Array.isArray(fallback) ? fallback : []);
      return fallbackList.filter(s =>
        String(s.branch_id) === String(filters.branchId) &&
        s.status === "active"
      );
    },
    enabled: !!filters.branchId,
    staleTime: 30000,
  });

  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list().then(res =>
      Object.fromEntries((res || []).map(s => [s.key, s.value]))
    ),
  });

  const settings = settingsData || EMPTY_OBJ;

  const certSettings = useMemo(() => {
    let s = settings.certificate_manager_settings;
    if (typeof s === "string") {
      try { s = JSON.parse(s); } catch { s = {}; }
    }
    const legacy = settings.promotion_certificate || {};

    return {
      board_name: s?.board_name ?? "নূরানী তা'লীমুল কুরআন বোর্ড কর্তৃক পরিচালিত",
      institute_name_bn: s?.institute_name_bn ?? settings.institute_name_bn ?? "রহমানিয়া ইনস্টিটিউট",
      institute_name_en: s?.institute_name_en ?? settings.institute_name_en ?? "Rahmania Institute",
      address: s?.address ?? settings.address ?? "হরিণাল, গাজীপুর সিটি",
      established: s?.established ?? "স্থাপিত: ২০১৭ ইং",
      title_bn: s?.title_bn ?? legacy.title_bn ?? "প্রশংসা পত্র",
      body_bn: s?.body_bn ?? legacy.body_bn ?? "এই মর্মে প্রশংসা পত্র প্রদান করা যাচ্ছে যে, {{student_name}}, রোল নম্বর: {{roll_number}}, শ্রেণী: {{class}}, সেশন: {{session}}। পিতা: {{father_name}}, মাতা: {{mother_name}}, ঠিকানা: {{address}}। সে অত্র প্রতিষ্ঠানের একজন নিয়মিত শিক্ষার্থী ছিল। তাহার আচরণ ও চরিত্র অত্যন্ত সন্তোষজনক। আমি তাহার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও সাফল্য কামনা করি।",
      sig_left: s?.sig_left ?? "শ্রেণি শিক্ষকের স্বাক্ষর",
      sig_right: s?.sig_right ?? "মুহতামিম / পরিচালক",
      bg_color: s?.bg_color ?? legacy.bg_color ?? "#fcf9f2",
      border_color_1: s?.border_color_1 ?? legacy.border_color_1 ?? "#005235",
      border_color_2: s?.border_color_2 ?? legacy.border_color_2 ?? "#c9a84c",
      title_color: s?.title_color ?? legacy.title_color ?? "#b91c1c",
      font_color: s?.font_color ?? legacy.font_color ?? "#2d2d2d",
      show_watermark: s?.show_watermark ?? true,
      show_qr_code: s?.show_qr_code ?? true,
      certificate_logo_url: s?.certificate_logo_url ?? "",
      watermark_opacity: s?.watermark_opacity ?? 0.15,
    };
  }, [settings]);

  const [customForm, setCustomForm] = useState(certSettings);

  useEffect(() => {
    if (settingsData) {
      setCustomForm(certSettings);
    }
  }, [settingsData, certSettings]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const existing = await appClient.entities.AppSettings.list();
      const setting = existing.find(s => s.key === "certificate_manager_settings");
      if (setting) {
        await appClient.entities.AppSettings.update(setting.id, { value: JSON.stringify(customForm) });
      } else {
        await appClient.entities.AppSettings.create({ key: "certificate_manager_settings", value: JSON.stringify(customForm) });
      }
      await refetchSettings();
      toast.success("ডিজাইন সেটিংস সফলভাবে সেভ করা হয়েছে!");
    } catch (err) {
      toast.error(err?.message || "ডিজাইন সেটিংস সেভ করতে ব্যর্থ হয়েছে");
    } finally {
      setSavingSettings(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
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
        (s.roll_number || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [students, filters.classId, selectedBranch, searchQuery]);

  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent(student);
    const branchInfo = branches.find(b => String(b.id) === String(student.branch_id));
    const title = certSettings.title_bn || "প্রশংসা পত্র";
    const body = fillTemplate(certSettings.body_bn || "", student, branchInfo);
    setForm({ title, description: body });
    setStep("form");
  }, [branches, certSettings]);

  const handleBack = useCallback(() => {
    setStep("select");
    setSelectedStudent(null);
    setForm({ title: "", description: "" });
  }, []);

  const generatePDF = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error("দয়া করে একটি শিরোনাম দিন");
      return;
    }
    if (!form.description.trim()) {
      toast.error("দয়া করে বর্ণনা লিখুন");
      return;
    }
    setGenerating(true);
    try {
      const student = selectedStudent;
      const jsPDF = (await import("jspdf")).default;
      
      // Traditional Landscape orientation
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297, H = 210;

      const branchInfo = branches.find(b => String(b.id) === String(student.branch_id));
      const logoUrl = certSettings.certificate_logo_url || branchInfo?.logo_url || branchInfo?.logo || settings.logo_url || "/rahmania-logo-v2.png";

      const bgColor = certSettings.bg_color || "#fcf9f2";
      const borderColor1 = certSettings.border_color_1 || "#005235";
      const borderColor2 = certSettings.border_color_2 || "#c9a84c";
      const titleColor = certSettings.title_color || "#b91c1c";
      const fontColor = certSettings.font_color || "#2d2d2d";

      // ── Fill background ──
      doc.setFillColor(...hexToRgb(bgColor));
      doc.rect(0, 0, W, H, "F");

      // ── Decorative outer border ──
      doc.setDrawColor(...hexToRgb(borderColor1));
      doc.setLineWidth(1.8);
      doc.rect(6, 6, W - 12, H - 12, "D");

      // ── Golden secondary border ──
      doc.setDrawColor(...hexToRgb(borderColor2));
      doc.setLineWidth(0.6);
      doc.rect(9, 9, W - 18, H - 18, "D");

      // ── Inner thin border ──
      doc.setDrawColor(...hexToRgb(borderColor1));
      doc.setLineWidth(0.3);
      doc.rect(11, 11, W - 22, H - 22, "D");

      // ── Corner decorations ──
      const cd = 12;
      doc.setDrawColor(...hexToRgb(borderColor2));
      doc.setLineWidth(1.2);
      [6, W - 6].forEach((x) => {
        [6, H - 6].forEach((y) => {
          doc.line(x, y, x + cd * (x === 6 ? 1 : -1), y);
          doc.line(x, y, x, y + cd * (y === 6 ? 1 : -1));
        });
      });

      // ── Watermark Logo (Center — Elegant, Configurable Opacity) ──
      if (certSettings.show_watermark !== false) {
        try {
          const logoImg = await loadImageElement(logoUrl);
          if (logoImg) {
            if (typeof doc.GState === "function") {
              const wmOpacity = Math.max(0.05, Math.min(0.5, certSettings.watermark_opacity || 0.15));
              doc.saveGraphicsState();
              doc.setGState(new doc.GState({ opacity: wmOpacity }));
              doc.addImage(logoImg, "PNG", W / 2 - 40, H / 2 - 40, 80, 80);
              doc.restoreGraphicsState();
            }
          }
        } catch {}
      }

      // ── Top Logo ──
      try {
        const logoImg = await loadImageElement(logoUrl);
        if (logoImg) {
          doc.addImage(logoImg, "PNG", W / 2 - 13, 14, 26, 26);
        }
      } catch {}

      // ── Board Affiliation / Subtitle ──
      let y = 46;
      if (certSettings.board_name) {
        drawBengaliText(doc, certSettings.board_name, W / 2, y, 12.5, borderColor1, "center");
        y += 11;
      }

      // ── Institute name (Large Calligraphy Styling) ──
      const instNameBn = certSettings.institute_name_bn || settings.institute_name_bn || "রহমানিয়া ইনস্টিটিউট";
      drawBengaliText(doc, instNameBn, W / 2, y, 26, titleColor, "center");
      y += 7.5;

      // ── Address & Estd ──
      const addressStr = certSettings.address || settings.address || "হরিণাল, গাজীপুর সিটি";
      doc.setFontSize(9.5);
      doc.setTextColor(80, 80, 80);
      drawBengaliText(doc, addressStr, W / 2, y, 9.5, "#4b5563", "center");
      y += 5.5;

      if (certSettings.established) {
        drawBengaliText(doc, certSettings.established, W / 2, y, 8.5, "#4b5563", "center");
        y += 6.5;
      }

      // ── Title Ribbon/Badge ──
      doc.setFillColor(...hexToRgb(borderColor2));
      doc.setDrawColor(...hexToRgb(borderColor1));
      doc.setLineWidth(0.4);
      doc.roundedRect(W / 2 - 32, y, 64, 9.5, 1.2, 1.2, "FD");
      
      drawBengaliText(doc, form.title, W / 2, y + 6.4, 14, "#ffffff", "center");
      y += 18;

      // ── Description Dotted Lines ──
      const descLines = drawBengaliTextWrapped(doc, form.description, 240, 11, fontColor, "center");
      for (const line of descLines) {
        if (y > 158) break;
        drawBengaliText(doc, line, W / 2, y, 11, fontColor, "center");

        // Dotted/Underline for traditional look
        doc.setDrawColor(...hexToRgb(borderColor2));
        doc.setLineWidth(0.18);
        const lineW = Math.min(doc.getTextWidth(line) + 20, 240);
        doc.line(W / 2 - lineW / 2, y + 2.5, W / 2 + lineW / 2, y + 2.5);

        y += 11.5;
      }

      // ── QR Code Verification (Bottom Center) ──
      const certNumber = `CERT-${format(new Date(), "yyyyMMdd")}-${String(student.id).padStart(4, "0")}`;
      if (certSettings.show_qr_code !== false) {
        try {
          const verifyUrl = `https://rahmaniainstitute.org/verify?code=${certNumber}`;
          const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 45, margin: 0 });
          doc.addImage(qrDataUrl, "PNG", W / 2 - 8.5, 153, 17, 17);
        } catch {}
      }

      // ── Signatures ──
      const sigY = 179;
      doc.setDrawColor(...hexToRgb(borderColor1));
      doc.setLineWidth(0.4);

      // Left signature line
      doc.line(25, sigY, 75, sigY);
      drawBengaliText(doc, certSettings.sig_left, 50, sigY + 5.5, 9.5, "#374151", "center");

      // Right signature line
      doc.line(W - 75, sigY, W - 25, sigY);
      drawBengaliText(doc, certSettings.sig_right, W - 50, sigY + 5.5, 9.5, "#374151", "center");

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      toast.success("সার্টিফিকেট তৈরি হয়েছে!");
    } catch (err) {
      toast.error(err?.message || "সার্টিফিকেট তৈরি ব্যর্থ হয়েছে");
    } finally {
      setGenerating(false);
    }
  }, [selectedStudent, form, branches, certSettings, settings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-500" />
            সার্টিফিকেট ম্যানেজার
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            যেকোনো শিক্ষার্থীর জন্য প্রশংসা পত্র তৈরি ও প্রিন্ট করুন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "create"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> সার্টিফিকেট তৈরি
          </button>
          <button
            onClick={() => setActiveTab("customize")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "customize"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> ডিজাইন কাস্টমাইজেশন
          </button>
        </div>
      </div>

      {activeTab === "create" && (
        <>
          {step === "select" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>শাখা নির্বাচন করুন</Label>
                  <Select
                    value={filters.branchId}
                    onValueChange={(v) => setFilters({ branchId: v, classId: "" })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="শাখা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name_bn || b.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>শ্রেণী নির্বাচন করুন</Label>
                  <Select
                    value={filters.classId}
                    onValueChange={(v) => setFilters(prev => ({ ...prev, classId: v }))}
                    disabled={!filters.branchId}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="নাম বা রোল নম্বর দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {studentsLoading ? (
                <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {filters.branchId ? "কোনো শিক্ষার্থী পাওয়া যায়নি" : "শাখা নির্বাচন করুন"}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-emerald-100">
                          <AvatarImage src={student.photo_url} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-800">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-emerald-900 truncate">
                            {student.full_name_bn || student.full_name_en}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.roll_number ? `রোল: ${student.roll_number}` : ""}
                            {student.class_name ? ` • ${student.class_name}` : ""}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "form" && selectedStudent && (
            <div className="space-y-4">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </Button>

              <Card className="border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-emerald-200">
                      <AvatarImage src={selectedStudent.photo_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800">
                        <GraduationCap className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-900">
                        {selectedStudent.full_name_bn || selectedStudent.full_name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedStudent.roll_number ? `রোল: ${selectedStudent.roll_number} • ` : ""}
                        {selectedStudent.class_name || ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-emerald-50 rounded-xl p-4 mb-6">
                    <div>
                      <span className="text-muted-foreground">পিতার নাম:</span>
                      <p className="font-medium">{selectedStudent.father_name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">মাতার নাম:</span>
                      <p className="font-medium">{selectedStudent.mother_name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ঠিকানা:</span>
                      <p className="font-medium">{selectedStudent.address_bn || selectedStudent.address || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cert-title">সার্টিফিকেটের শিরোনাম</Label>
                      <Input
                        id="cert-title"
                        placeholder="যেমন: সম্মাননা সনদ, প্রশংসা পত্র"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-desc">বিবরণ / বক্তব্য</Label>
                      <Textarea
                        id="cert-desc"
                        placeholder="শিক্ষার্থী সম্পর্কে আপনার বক্তব্য লিখুন..."
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleBack}>
                  বাতিল
                </Button>
                <Button
                  onClick={generatePDF}
                  disabled={generating || !form.title.trim() || !form.description.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 gap-2"
                >
                  {generating ? (
                    <>তৈরি হচ্ছে...</>
                  ) : (
                    <><Printer className="w-4 h-4" /> সার্টিফিকেট তৈরি ও প্রিন্ট</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "customize" && (
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-6">
            {/* ── Certificate Logo Upload ── */}
            <div className="border-b pb-5">
              <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                সার্টিফিকেট লোগো
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                এই লোগো সার্টিফিকেটের শীর্ষে এবং জলছাপ হিসাবে ব্যবহার হবে। আপলোড না করলে শাখার ডিফল্ট লোগো ব্যবহার হবে।
              </p>
              <ImageUpload
                value={customForm.certificate_logo_url || ""}
                onChange={(url) => setCustomForm(p => ({ ...p, certificate_logo_url: url }))}
                label="সার্টিফিকেট লোগো আপলোড করুন"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">বোর্ড / অনুমোদিত বডি নাম</Label>
                <Input
                  value={customForm.board_name || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, board_name: e.target.value }))}
                  placeholder="যেমন: নূরানী তা'লীমুল কুরআন বোর্ড কর্তৃক পরিচালিত"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">মাদরাসা / স্কুলের নাম (বাংলা)</Label>
                <Input
                  value={customForm.institute_name_bn || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, institute_name_bn: e.target.value }))}
                  placeholder="মাদরাসার নাম লিখুন"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">মাদরাসা / স্কুলের ঠিকানা</Label>
                <Input
                  value={customForm.address || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="যেমন: হরিণাল, গাজীপুর সিটি"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">স্থাপিত সাল / টেক্সট</Label>
                <Input
                  value={customForm.established || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, established: e.target.value }))}
                  placeholder="যেমন: স্থাপিত: ২০১৭ ইং"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">সার্টিফিকেটের ডিফল্ট শিরোনাম</Label>
                <Input
                  value={customForm.title_bn || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, title_bn: e.target.value }))}
                  placeholder="যেমন: প্রশংসা পত্র"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">বাম স্বাক্ষর লেবেল</Label>
                <Input
                  value={customForm.sig_left || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, sig_left: e.target.value }))}
                  placeholder="যেমন: শ্রেণি শিক্ষকের স্বাক্ষর"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">ডান স্বাক্ষর লেবেল</Label>
                <Input
                  value={customForm.sig_right || ""}
                  onChange={(e) => setCustomForm(p => ({ ...p, sig_right: e.target.value }))}
                  placeholder="যেমন: মুহতামিম / পরিচালক"
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show_watermark_chk"
                      checked={customForm.show_watermark !== false}
                      onChange={(e) => setCustomForm(p => ({ ...p, show_watermark: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <Label htmlFor="show_watermark_chk" className="cursor-pointer">জলছাপ (Watermark) দেখান</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show_qr_chk"
                      checked={customForm.show_qr_code !== false}
                      onChange={(e) => setCustomForm(p => ({ ...p, show_qr_code: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <Label htmlFor="show_qr_chk" className="cursor-pointer">QR Code দেখান</Label>
                  </div>
                </div>

                {/* ── Watermark Opacity Slider ── */}
                {customForm.show_watermark !== false && (
                  <div className="bg-slate-50 border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-bold text-slate-700">জলছাপ স্বচ্ছতা (Opacity)</Label>
                      <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {Math.round((customForm.watermark_opacity || 0.15) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={Math.round((customForm.watermark_opacity || 0.15) * 100)}
                      onChange={(e) => setCustomForm(p => ({ ...p, watermark_opacity: Number(e.target.value) / 100 }))}
                      className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>৫% (হালকা)</span>
                      <span>৫০% (গাঢ়)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">সার্টিফিকেটের বিবরণ টেমপ্লেট</Label>
              <Textarea
                value={customForm.body_bn || ""}
                onChange={(e) => setCustomForm(p => ({ ...p, body_bn: e.target.value }))}
                placeholder="ডিফল্ট বডি টেমপ্লেট লিখুন"
                className="mt-1 min-h-[120px] text-xs font-mono"
              />
              <div className="mt-2 text-[10px] text-slate-500 leading-relaxed bg-slate-50 border p-3 rounded-lg">
                <strong>ব্যবহারযোগ্য টোকেনসমূহ:</strong><br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{student_name}}"}</code>: শিক্ষার্থীর নাম<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{roll_number}}"}</code>: রোল নম্বর<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{class}}"}</code>: শ্রেণী<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{session}}"}</code>: সেশন / শাখা<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{group}}"}</code>: সেশন গ্রুপ<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{academic_full}}"}</code>: সম্পূর্ণ ক্লাস নাম (শ্রেণী + শাখা + গ্রুপ)<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{father_name}}"}</code>: বাবার নাম<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{mother_name}}"}</code>: মায়ের নাম<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{address}}"}</code>: শিক্ষার্থীর ঠিকানা<br />
                - <code className="bg-white px-1 py-0.5 border rounded">{"{{date}}"}</code>: আজকের তারিখ
              </div>
            </div>

            {/* Colors */}
            <div className="border-t pt-4">
              <h4 className="text-xs font-bold text-slate-700 mb-3">সনদপত্র কালার স্কিম</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <Label className="text-[10px] text-slate-500">ব্যাকগ্রাউন্ড রঙ</Label>
                  <div className="flex gap-1.5 mt-1 items-center">
                    <Input
                      type="color"
                      value={customForm.bg_color || "#fcf9f2"}
                      onChange={(e) => setCustomForm(p => ({ ...p, bg_color: e.target.value }))}
                      className="w-8 h-8 p-0 cursor-pointer border rounded"
                    />
                    <Input
                      type="text"
                      value={customForm.bg_color || "#fcf9f2"}
                      onChange={(e) => setCustomForm(p => ({ ...p, bg_color: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-slate-500">প্রধান বর্ডার রঙ</Label>
                  <div className="flex gap-1.5 mt-1 items-center">
                    <Input
                      type="color"
                      value={customForm.border_color_1 || "#005235"}
                      onChange={(e) => setCustomForm(p => ({ ...p, border_color_1: e.target.value }))}
                      className="w-8 h-8 p-0 cursor-pointer border rounded"
                    />
                    <Input
                      type="text"
                      value={customForm.border_color_1 || "#005235"}
                      onChange={(e) => setCustomForm(p => ({ ...p, border_color_1: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-slate-500">দ্বিতীয় বর্ডার রঙ</Label>
                  <div className="flex gap-1.5 mt-1 items-center">
                    <Input
                      type="color"
                      value={customForm.border_color_2 || "#c9a84c"}
                      onChange={(e) => setCustomForm(p => ({ ...p, border_color_2: e.target.value }))}
                      className="w-8 h-8 p-0 cursor-pointer border rounded"
                    />
                    <Input
                      type="text"
                      value={customForm.border_color_2 || "#c9a84c"}
                      onChange={(e) => setCustomForm(p => ({ ...p, border_color_2: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-slate-500">মাদরাসা নাম রঙ</Label>
                  <div className="flex gap-1.5 mt-1 items-center">
                    <Input
                      type="color"
                      value={customForm.title_color || "#b91c1c"}
                      onChange={(e) => setCustomForm(p => ({ ...p, title_color: e.target.value }))}
                      className="w-8 h-8 p-0 cursor-pointer border rounded"
                    />
                    <Input
                      type="text"
                      value={customForm.title_color || "#b91c1c"}
                      onChange={(e) => setCustomForm(p => ({ ...p, title_color: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-slate-500 font-bold">বডি টেক্সট রঙ</Label>
                  <div className="flex gap-1.5 mt-1 items-center">
                    <Input
                      type="color"
                      value={customForm.font_color || "#2d2d2d"}
                      onChange={(e) => setCustomForm(p => ({ ...p, font_color: e.target.value }))}
                      className="w-8 h-8 p-0 cursor-pointer border rounded"
                    />
                    <Input
                      type="text"
                      value={customForm.font_color || "#2d2d2d"}
                      onChange={(e) => setCustomForm(p => ({ ...p, font_color: e.target.value }))}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("create")}
                disabled={savingSettings}
              >
                বাতিল
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="bg-emerald-700 hover:bg-emerald-800 min-w-[120px]"
              >
                {savingSettings ? "সেভ হচ্ছে..." : "ডিজাইন সেভ করুন"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
