import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appClient } from "@/api/appClient";
import { Upload, Loader2, User, Eye, EyeOff, Gift, DollarSign } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import BiometricInfoSection from "./BiometricInfoSection";
import { resolveAcademicDisplayName } from "@/lib/academic";


const SESSION_OPTIONS = [
  { value: "নূরানী", label: "📗 Noorani (নূরানী)" },
  { value: "নাজেরা", label: "📙 Nazera (নাজেরা)" },
  { value: "হিফয", label: "📘 Hifz (হিফয)" },
  { value: "হিফয শুনানি", label: "🎧 Hifz Shunani (হিফয শুনানি)" },
  { value: "কিন্ডার গার্ডেন", label: "🏫 Kindergarten (কিন্ডার গার্ডেন)" },
  { value: "কিতাবখানা", label: "📚 Kitab Khana (কিতাবখানা)" },
  { value: "English Version", label: "🇬🇧 English Version (ইংলিশ ভার্সন)" },
];

export default function StudentForm({ student, onSave, onCancel, currentUser }) {
  const [data, setData] = useState({
    roll_number: "",
    full_name_en: "",
    full_name_bn: "",
    full_name_ar: "",
    gender: "",
    date_of_birth: "",
    father_name: "",
    mother_name: "",
    mobile_number: "",
    address: "",
    address_bn: "",
    address_ar: "",
    admission_date: "",
    batch: "",
    session: "",
    class_name: "",
    class_id: "",
    session_id: "",
    class_group_id: "",
    admission_year: new Date().getFullYear().toString(),
    status: "active",
    notes: "",
    photo_url: "",
    custom_fields: "",
    password: "",
    hadiya_amount: "",
    hadiya_note: "",
    branch_id: currentUser?.role === "branch_admin" ? currentUser.branch_id : "",
  });

  // Local academic dropdown states
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Fee section state (for immediate payment)
  const [feeData, setFeeData] = useState({
    month: "",
    total_fee: "",
    paid_amount: "",
    notes: "",
  });

  const [studentFees, setStudentFees] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const originalRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch branches and classes dynamically
  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => appClient.entities.Branch.list(),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter(b => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const selectedBranch = branches.find(b => String(b.id) === String(data.branch_id));
  const rawClasses = selectedBranch && Array.isArray(selectedBranch.academic_structure) ? selectedBranch.academic_structure : [];

  // Fetch app settings for dynamic fee types
  const { data: appSettings = [] } = useQuery({
    queryKey: ["app-settings-admin-types"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const feeTypesSetting = appSettings.find(s => s.key === "fee_types")?.value;
  let feeTypes = ["Admission Fee", "Monthly Tuition Fee", "Exam Fee"];
  try { if (feeTypesSetting) feeTypes = JSON.parse(feeTypesSetting); } catch {};

  const isDropdownMandatory = (Array.isArray(appSettings) ? appSettings : []).find(s => s.key === "student_session_dropdown_mandatory")?.value === "true";

  const toggleDropdownSetting = async () => {
    const key = "student_session_dropdown_mandatory";
    const existing = (Array.isArray(appSettings) ? appSettings : []).find(s => s.key === key);
    const newValue = isDropdownMandatory ? "false" : "true";

    try {
      if (existing) {
        await appClient.entities.AppSettings.update(existing.id, { value: newValue });
      } else {
        await appClient.entities.AppSettings.create({ key, value: newValue });
      }
      queryClient.invalidateQueries({ queryKey: ["app-settings-admin-types"] });
      toast.success(newValue === "true" ? "ড্রপডাউন অন করা হয়েছে এবং ক্লাস সিলেক্ট করা বাধ্যতামূলক করা হয়েছে।" : "ড্রপডাউন বন্ধ করা হয়েছে।");
    } catch (err) {
      toast.error("সেটিং পরিবর্তন করা যায়নি।");
      console.error(err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (student && student.id) {
      appClient.entities.Student.get(student.id)
        .then(fullStudent => {
          if (cancelled || !fullStudent) return;

          try {
            const parsed = fullStudent.custom_fields ? JSON.parse(fullStudent.custom_fields) : {};
            setStudentFees(parsed.fees_setup || {});
          } catch (e) {
            setStudentFees({});
          }

          const studentData = {
            roll_number: fullStudent.roll_number || "",
            full_name_en: fullStudent.full_name_en || "",
            full_name_bn: fullStudent.full_name_bn || "",
            full_name_ar: fullStudent.full_name_ar || "",
            gender: fullStudent.gender || "",
            date_of_birth: fullStudent.date_of_birth || "",
            father_name: fullStudent.father_name || "",
            mother_name: fullStudent.mother_name || "",
            mobile_number: fullStudent.mobile_number || "",
            branch_id: fullStudent.branch_id || (currentUser?.role === "branch_admin" ? currentUser.branch_id : ""),
            class_id: fullStudent.class_id || "",
            session_id: fullStudent.session_id || "",
            class_group_id: fullStudent.class_group_id || "",
            class_name: fullStudent.class_name || "",
            session: fullStudent.session || "",
            batch: fullStudent.batch || "",
            admission_date: fullStudent.admission_date || "",
            admission_year: fullStudent.admission_year || new Date().getFullYear().toString(),
            address: fullStudent.address || "",
            address_bn: fullStudent.address_bn || "",
            address_ar: fullStudent.address_ar || "",
            status: fullStudent.status || "active",
            notes: fullStudent.notes || "",
            photo_url: fullStudent.photo_url || "",
            custom_fields: fullStudent.custom_fields || "",
            password: "",
            hadiya_amount: fullStudent.hadiya_amount || "",
            hadiya_note: fullStudent.hadiya_note || "",
          };

          if (!cancelled) {
            setData(studentData);
            originalRef.current = { ...studentData };
            fetch(`/api/attendance/manage?action=biometric_profile&user_type=student&user_id=${fullStudent.id}`)
              .then(res => res.json())
              .then(d => {
                if (!cancelled) {
                  if (d.ok && d.data) {
                    setBiometricData(d.data);
                  } else {
                    setBiometricData({
                      enable_biometric: false,
                      machine_user_id: "",
                      card_number: "",
                      fingerprint_enabled: true,
                      face_enabled: false,
                    });
                  }
                }
              })
              .catch(() => {});
          }
        })
        .catch(err => {
          if (!cancelled) console.error("Error fetching full student data:", err);
        });
    } else if (!student) {
      originalRef.current = null;
      setStudentFees({});
      setBiometricData({
        enable_biometric: false,
        machine_user_id: "",
        card_number: "",
        fingerprint_enabled: true,
        face_enabled: false,
      });
      setData({
        roll_number: "",
        full_name_en: "",
        full_name_bn: "",
        full_name_ar: "",
        date_of_birth: "",
        father_name: "",
        mother_name: "",
        mobile_number: "",
        address: "",
        address_bn: "",
        address_ar: "",
        admission_date: "",
        batch: "",
        session: "",
        class_name: "",
        class_id: "",
        session_id: "",
        class_group_id: "",
        admission_year: new Date().getFullYear().toString(),
        status: "active",
        notes: "",
        photo_url: "",
        custom_fields: "",
        password: "",
        hadiya_amount: "",
        hadiya_note: "",
        branch_id: currentUser?.role === "branch_admin" ? currentUser.branch_id : "",
      });
    }
    return () => { cancelled = true; };
  }, [student, currentUser]);

  // Synchronize dynamic local states from loaded student data
  useEffect(() => {
    if (!selectedBranch || !Array.isArray(selectedBranch.academic_structure) || !data.class_id) {
      setSelectedClassId("");
      setSelectedSessionId("");
      setSelectedGroupId("");
      return;
    }

    const rawClasses = selectedBranch.academic_structure;
    
    // Check if class_id is a section/session ID (backward compatible lookup)
    const classWithSection = rawClasses.find(c => 
      Array.isArray(c.sections) && c.sections.some(s => String(s.id) === String(data.class_id))
    );

    if (classWithSection) {
      setSelectedClassId(String(classWithSection.id));
      setSelectedSessionId(String(data.class_id));
    } else {
      // It is a base class ID
      setSelectedClassId(String(data.class_id));
      setSelectedSessionId(data.session_id || "");
    }
    
    setSelectedGroupId(data.class_group_id || "");
  }, [data.class_id, data.session_id, data.class_group_id, selectedBranch]);

  const updateAcademicSelection = (classId, sessionId, groupId) => {
    setSelectedClassId(classId);
    setSelectedSessionId(sessionId);
    setSelectedGroupId(groupId);

    const rawStructure = selectedBranch?.academic_structure || [];
    const resolvedName = resolveAcademicDisplayName(classId, sessionId, groupId, rawStructure, 'bn');

    setData(prev => ({
      ...prev,
      class_id: classId || "",
      session_id: sessionId || "",
      class_group_id: groupId || "",
      class_name: resolvedName,
      batch: resolvedName,
      session: resolvedName
    }));
  };

  
  const getClassNameStr = (c) => c.class_name?.en || c.class_name?.bn || Object.values(c.class_name || {}).find(v => v) || "";

  const classOptions = [];
  rawClasses.forEach(c => {
    const baseName = getClassNameStr(c);
    if (c.sections && c.sections.length > 0) {
      c.sections.forEach(sec => {
        const sectionLabel = sec.section_name?.en || sec.section_name?.bn || sec.section?.en || sec.section?.bn || (typeof sec.section_name === 'string' ? sec.section_name : '') || (typeof sec.section === 'string' ? sec.section : '') || "";
        classOptions.push({
          id: sec.id,
          class_name: c.class_name,
          class_name_str: baseName,
          section_name: sec.section_name || sec.section,
          label: `${baseName}${sectionLabel ? ` (${sectionLabel})` : ""}`.trim()
        });
      });
    } else {
      const sectionLabel = c.section?.en || c.section?.bn || (typeof c.section === 'string' ? c.section : '') || "";
      classOptions.push({
        id: c.id,
        class_name: c.class_name,
        class_name_str: baseName,
        section_name: c.section,
        label: `${baseName}${sectionLabel ? ` (${sectionLabel})` : ""}`.trim()
      });
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await appClient.integrations.Core.UploadFile({ file });
    setData((prev) => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      if (
        target.tagName === "TEXTAREA" || 
        target.type === "submit" || 
        target.role === "menuitem" ||
        target.role === "option"
      ) {
        return;
      }
      const isSelectTrigger = target.getAttribute("role") === "combobox";
      if (isSelectTrigger && target.getAttribute("aria-expanded") === "true") {
        return;
      }
      e.preventDefault();
      
      const formEl = e.currentTarget;
      const elements = Array.from(formEl.querySelectorAll(
        "input:not([type='hidden']):not([disabled]), textarea:not([disabled]), button[role='combobox']:not([disabled]), button[type='submit']:not([disabled])"
      ));
      
      const index = elements.indexOf(target);
      if (index > -1) {
        const remainingElements = elements.slice(index + 1);
        const hasMoreInputs = remainingElements.some(el => 
          el.tagName === "INPUT" || 
          el.tagName === "TEXTAREA" || 
          el.getAttribute("role") === "combobox"
        );
        
        if (!hasMoreInputs) {
          const submitBtn = elements.find(el => el.type === "submit");
          if (submitBtn) {
            submitBtn.click();
            return;
          }
        }
        
        let nextIndex = index + 1;
        while (nextIndex < elements.length) {
          const nextEl = elements[nextIndex];
          if (nextEl.offsetWidth > 0 && nextEl.offsetHeight > 0) {
            nextEl.focus();
            return;
          }
          nextIndex++;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!data.roll_number) {
        toast.error("Please enter a Roll Number.");
        setSaving(false);
        setTimeout(() => document.querySelector("input[name='roll_number']")?.focus(), 50);
        return;
      }
      if (!data.full_name_en) {
        toast.error("Please enter Full Name (English).");
        setSaving(false);
        setTimeout(() => document.querySelector("input[name='full_name_en']")?.focus(), 50);
        return;
      }
      if (!data.branch_id) {
        toast.error("Please select a Branch.");
        setSaving(false);
        setTimeout(() => document.querySelector("button[role='combobox']")?.focus(), 50);
        return;
      }
      if (!data.gender) {
        toast.error("Please select a Gender.");
        setSaving(false);
        return;
      }
      if (!selectedClassId) {
        toast.error("দয়া করে একটি ক্লাস নির্বাচন করুন।");
        setSaving(false);
        return;
      }
      const currentClass = rawClasses.find(c => String(c.id) === String(selectedClassId));
      if (currentClass) {
        const hasSessions = Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
        const hasGroups = Array.isArray(currentClass.groups) && currentClass.groups.length > 0;

        if (hasSessions && !selectedSessionId) {
          toast.error("দয়া করে ক্লাস সেশন (শাখা) নির্বাচন করুন।");
          setSaving(false);
          return;
        }
        if (hasGroups && !selectedGroupId) {
          toast.error("দয়া করে গ্রুপ নির্বাচন করুন।");
          setSaving(false);
          return;
        }
      }
      if (isDropdownMandatory && (!data.session || !SESSION_OPTIONS.some(o => o.value === data.session))) {
        toast.error("দয়া করে ক্লাস সেকশনে প্রদর্শিত করুন অপশনটি নির্বাচন করুন।");
        setSaving(false);
        return;
      }

      let existingCustomFields = {};
      if (data.custom_fields) {
        try {
          existingCustomFields = JSON.parse(data.custom_fields);
          if (typeof existingCustomFields !== "object" || existingCustomFields === null) {
            existingCustomFields = {};
          }
        } catch (err) {
          existingCustomFields = { legacy_text: data.custom_fields };
        }
      }

      const enrichedData = {
        ...data,
        custom_fields: JSON.stringify({
          ...existingCustomFields,
          fees_setup: studentFees
        })
      };

      const savedStudent = await onSave(enrichedData);

      // Save biometric profile if enabled
      const studentIdForBio = savedStudent?.id || student?.id;
      if (studentIdForBio && biometricData && biometricData.enable_biometric) {
        try {
          await fetch("/api/attendance/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_biometric_profile",
              data: {
                user_type: "student",
                user_id: studentIdForBio,
                machine_user_id: biometricData.machine_user_id,
                card_number: biometricData.card_number || null,
                fingerprint_enabled: biometricData.fingerprint_enabled || false,
                face_enabled: biometricData.face_enabled || false,
                enable_biometric: true,
              },
            }),
          });
        } catch (err) {
          console.error("Failed to save biometric profile:", err);
        }
      } else if (studentIdForBio && biometricData && !biometricData.enable_biometric) {
        try {
          await fetch("/api/attendance/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_biometric_profile",
              data: {
                user_type: "student",
                user_id: studentIdForBio,
                enable_biometric: false,
              },
            }),
          });
        } catch (err) {
          console.error("Failed to update biometric profile:", err);
        }
      }

      // If legacy fee data is filled in and we have a student ID, save the fee record
      if (feeData.month && feeData.total_fee) {
        const studentId = savedStudent?.id || student?.id;
        if (studentId) {
          const paid = Number(feeData.paid_amount) || 0;
          const total = Number(feeData.total_fee);
          const due = total - paid;
          const status = paid >= total ? "paid" : paid > 0 ? "partial" : "due";
          await appClient.entities.Fee.create({
            student_id: studentId,
            month: feeData.month,
            total_fee: total,
            paid_amount: paid,
            due_amount: Math.max(0, due),
            status,
            payment_date: feeData.payment_date || null,
            notes: feeData.notes || "",
            student_name: enrichedData.full_name_en,
            roll_number: enrichedData.roll_number,
            branch_name: selectedBranch ? (selectedBranch.name_bn || selectedBranch.name_en) : "",
            class_name: data.class_name || classOptions.find(c => c.id === data.class_id)?.class_name?.en || "",
          });
        }
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save student");
      console.error("Student save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const updateFee = (field, value) => setFeeData((prev) => ({ ...prev, [field]: value }));
  const handleFeeChange = (type, val) => setStudentFees(prev => ({ ...prev, [type]: Number(val) || 0 }));

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo + Status Section */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="h-32 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center mb-4">
              {data.photo_url ? (
                <img src={data.photo_url} loading="lazy" alt="Photo" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-indigo-300" />
              )}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <div className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Photo"}
              </div>
            </label>
            <div className="w-full mt-6 space-y-3">
              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <Select value={data.status || "active"} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Admin Notes</Label>
                <Textarea name="notes" value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} className="mt-1" rows={3} placeholder="Admin notes..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Info */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{student ? "Edit Student" : "Add New Student"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Roll Number *</Label>
                <Input name="roll_number" value={data.roll_number} onChange={(e) => update("roll_number", e.target.value)} required className="mt-1" placeholder="e.g. 2024-001" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Full Name (English) *</Label>
                <Input name="full_name_en" value={data.full_name_en} onChange={(e) => update("full_name_en", e.target.value)} required className="mt-1" placeholder="John Doe" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Full Name (Bengali)</Label>
                <Input name="full_name_bn" value={data.full_name_bn || ""} onChange={(e) => update("full_name_bn", e.target.value)} className="mt-1" placeholder="Bengali name" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Full Name (Arabic)</Label>
                <Input name="full_name_ar" value={data.full_name_ar || ""} onChange={(e) => update("full_name_ar", e.target.value)} className="mt-1" placeholder="الاسم العربي" dir="rtl" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Date of Birth</Label>
                <Input name="date_of_birth" type="date" value={data.date_of_birth || ""} onChange={(e) => update("date_of_birth", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Father's Name</Label>
                <Input name="father_name" value={data.father_name || ""} onChange={(e) => update("father_name", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Mother's Name</Label>
                <Input name="mother_name" value={data.mother_name || ""} onChange={(e) => update("mother_name", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Mobile Number</Label>
                <Input name="mobile_number" value={data.mobile_number || ""} onChange={(e) => update("mobile_number", e.target.value)} className="mt-1" placeholder="+880..." />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Gender (লিঙ্গ) *</Label>
                <Select value={data.gender || ""} onValueChange={(v) => update("gender", v)} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male (পুরুষ)</SelectItem>
                    <SelectItem value="Female">Female (মহিলা)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Branch *</Label>
                <Select value={data.branch_id ? String(data.branch_id) : ""} onValueChange={(v) => { update("branch_id", Number(v)); update("class_id", ""); }} required disabled={currentUser?.role === "branch_admin"}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Class Dropdown */}
              <div>
                <Label className="text-xs text-slate-500">Class *</Label>
                <Select
                  value={selectedClassId || ""}
                  onValueChange={(v) => {
                    updateAcademicSelection(v, "", "");
                  }}
                  required
                  disabled={!data.branch_id}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawClasses.map(c => {
                      const label = c.class_name?.bn || c.class_name?.en || c.class_name?.ar || "";
                      return <SelectItem key={c.id} value={String(c.id)}>{label}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Session Dropdown (Conditionally Visible) */}
              {(() => {
                const currentClass = rawClasses.find(c => String(c.id) === String(selectedClassId));
                const hasSessions = currentClass && Array.isArray(currentClass.sections) && currentClass.sections.length > 0;
                if (!hasSessions) return null;

                return (
                  <div>
                    <Label className="text-xs text-slate-500">Class Session (Section) *</Label>
                    <Select
                      value={selectedSessionId || ""}
                      onValueChange={(v) => {
                        updateAcademicSelection(selectedClassId, v, selectedGroupId);
                      }}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Session" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentClass.sections.map(sec => {
                          const label = sec.section_name?.bn || sec.section_name?.en || sec.section_name?.ar || sec.section?.bn || sec.section?.en || (typeof sec.section_name === 'string' ? sec.section_name : '') || (typeof sec.section === 'string' ? sec.section : '') || "";
                          return <SelectItem key={sec.id} value={String(sec.id)}>{label}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })()}

              {/* Class Session Group Dropdown (Conditionally Visible) */}
              {(() => {
                const currentClass = rawClasses.find(c => String(c.id) === String(selectedClassId));
                const hasGroups = currentClass && Array.isArray(currentClass.groups) && currentClass.groups.length > 0;
                if (!hasGroups) return null;

                return (
                  <div>
                    <Label className="text-xs text-slate-500">Class Session Group *</Label>
                    <Select
                      value={selectedGroupId || ""}
                      onValueChange={(v) => {
                        updateAcademicSelection(selectedClassId, selectedSessionId, v);
                      }}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentClass.groups.map(grp => {
                          const label = grp.group_name?.bn || grp.group_name?.en || grp.group_name?.ar || (typeof grp.group_name === 'string' ? grp.group_name : '') || "";
                          return <SelectItem key={grp.id} value={String(grp.id)}>{label}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })()}

              {/* Class section display dropdown and admin control */}
              {(isDropdownMandatory || currentUser?.role === "admin") && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ক্লাস সেকশনে প্রদর্শিত করুন {isDropdownMandatory && <span className="text-red-500">*</span>}
                      </Label>
                      <p className="text-[10px] text-slate-500">হোমপেজে কোন বক্সে স্টুডেন্টকে দেখানো হবে তা নির্বাচন করুন</p>
                    </div>
                    {currentUser?.role === "admin" && (
                      <Button
                        type="button"
                        size="sm"
                        variant={isDropdownMandatory ? "destructive" : "default"}
                        onClick={toggleDropdownSetting}
                        className="text-xs h-8"
                      >
                        {isDropdownMandatory ? "ড্রপডাউন বন্ধ করুন" : "ড্রপডাউন অন করুন"}
                      </Button>
                    )}
                  </div>
                  {isDropdownMandatory && (
                    <Select
                      value={SESSION_OPTIONS.some(o => o.value === data.session) ? data.session : ""}
                      onValueChange={(v) => update("session", v)}
                    >
                      <SelectTrigger className="w-full bg-white dark:bg-slate-950 mt-1">
                        <SelectValue placeholder="হোমপেজ ক্লাস সেকশন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-500">Admission Date</Label>
                <Input name="admission_date" type="date" value={data.admission_date || ""} onChange={(e) => update("admission_date", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Admission Year</Label>
                <Input name="admission_year" value={data.admission_year || ""} onChange={(e) => update("admission_year", e.target.value)} className="mt-1" placeholder="2024" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Address (English)</Label>
                <Textarea name="address" value={data.address || ""} onChange={(e) => update("address", e.target.value)} className="mt-1" rows={2} placeholder="Full address..." />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Address (Bengali)</Label>
                <Textarea name="address_bn" value={data.address_bn || ""} onChange={(e) => update("address_bn", e.target.value)} className="mt-1" rows={2} placeholder="ঠিকানা..." />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Address (Arabic)</Label>
                <Textarea name="address_ar" value={data.address_ar || ""} onChange={(e) => update("address_ar", e.target.value)} className="mt-1" rows={2} placeholder="العنوان" dir="rtl" />
              </div>
            </div>

            {/* Student Fee Configuration Section */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900 p-4">
              <Label className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4" /> Student Fee Configuration (Defaults Setup)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {feeTypes.map((type) => (
                  <div key={type}>
                    <Label className="text-xs text-slate-500">{type} (৳)</Label>
                    <Input
                      type="number"
                      value={studentFees[type] !== undefined ? studentFees[type] : ""}
                      onChange={(e) => handleFeeChange(type, e.target.value)}
                      placeholder="0"
                      className="mt-1 bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Section */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
              <Label className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4" /> Fee Payment (Optional — adds a fee record)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Month</Label>
                  <Input
                    type="month"
                    value={feeData.month}
                    onChange={(e) => updateFee("month", e.target.value)}
                    className="mt-1 bg-white dark:bg-slate-900"
                    placeholder="YYYY-MM"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Total Fee (Taka)</Label>
                  <Input
                    type="number"
                    value={feeData.total_fee}
                    onChange={(e) => updateFee("total_fee", e.target.value)}
                    placeholder="0"
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Amount Paid (Taka)</Label>
                  <Input
                    type="number"
                    value={feeData.paid_amount}
                    onChange={(e) => updateFee("paid_amount", e.target.value)}
                    placeholder="0"
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Fee Notes</Label>
                  <Input
                    value={feeData.notes}
                    onChange={(e) => updateFee("notes", e.target.value)}
                    placeholder="e.g. partial payment..."
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              {feeData.total_fee && feeData.paid_amount !== "" && (
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  Due: <strong>{Number(feeData.total_fee) - (Number(feeData.paid_amount) || 0)} Taka</strong> &nbsp;|&nbsp;
                  Status: <strong>{Number(feeData.paid_amount) >= Number(feeData.total_fee) ? "Paid" : Number(feeData.paid_amount) > 0 ? "Partial" : "Due"}</strong>
                </p>
              )}
            </div>

            {/* Hadiya Section */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4">
              <Label className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4" /> Hadiya (Monthly Stipend/Gift)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Hadiya Amount (Taka)</Label>
                  <Input
                    type="number"
                    value={data.hadiya_amount || ""}
                    onChange={(e) => update("hadiya_amount", e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Hadiya Type / Reason</Label>
                  <Input
                    value={data.hadiya_note || ""}
                    onChange={(e) => update("hadiya_note", e.target.value)}
                    placeholder="Scholarship, support..."
                    className="mt-1 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Biometric Information Section */}
            <BiometricInfoSection
              userType="student"
              userId={student?.id || null}
              onDataChange={setBiometricData}
            />

            {/* Password Section */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
              <Label className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
                🔒 Login Password {student && <span className="text-xs font-normal text-amber-600">(leave blank to keep existing)</span>}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={data.password || ""}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={student ? "Enter new password (leave blank to keep existing)" : "Set student login password"}
                  className="pr-10 bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {student?.password && (
                <p className="text-xs text-amber-600 mt-2">A secure login password is already set. Leave blank to keep it unchanged.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              )}
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : student ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
