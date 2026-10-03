import React, { useState, useEffect, useRef } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, UserCheck, UserX, Users, Loader2, Eye, EyeOff,
  Gift, Upload, Briefcase, Phone, Award
} from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import BiometricInfoSection from "./BiometricInfoSection";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

/* ── CV Upload Component ── */
function CVUpload({ value, onChange, label = "Upload CV (PDF/DOC/DOCX)" }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type by extension
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
      toast.error("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await appClient.integrations.Core.UploadFile({ file });
      onChange(file_url);
      toast.success("CV uploaded successfully!");
    } catch (error) {
      toast.error(error?.message || "Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">{label}</label>}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {value ? (
            <div className="flex items-center gap-2 p-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200">
              <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                📄 CV Uploaded
              </span>
              <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-bold ml-1">
                View
              </a>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 ml-auto" onClick={handleRemove}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className={`cursor-pointer inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-[#052E2B]/30 hover:border-[#052E2B] text-sm text-[#052E2B] font-medium transition-all ${uploading ? 'pointer-events-none opacity-65' : ''}`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Choose CV File"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )}
          <p className="text-[10px] text-gray-400 mt-1">Acceptable formats: PDF, DOC, DOCX.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Web Toggle Item ── */
const WebToggleItem = React.memo(({ field, label, value, onToggle }) => {
  const handleCheckedChange = React.useCallback(
    (checked) => onToggle(field, checked),
    [field, onToggle]
  );

  return (
    <div className="flex items-center justify-between border rounded-xl p-2 bg-slate-50 dark:bg-slate-900 border-slate-100">
      <span className="text-[11px] text-slate-500 font-medium font-sans">Show {label} on Website</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 font-bold">{value === "Y" ? "Y" : "N"}</span>
        <Switch
          checked={value === "Y"}
          onCheckedChange={handleCheckedChange}
        />
      </div>
    </div>
  );
});

/* ── Teacher Add/Edit Form ── */
function TeacherForm({ teacher, teachers, branches, onSave, onCancel, currentUser }) {
  const [form, setForm] = useState({
    teacher_id: teacher?.teacher_id || "",
    employee_code: teacher?.employee_code || "",
    user_email: teacher?.user_email || "",
    full_name_en: teacher?.full_name_en || teacher?.name || "",
    full_name_bn: teacher?.full_name_bn || "",
    full_name_ar: teacher?.full_name_ar || "",
    designation: teacher?.designation || "",
    designation_bn: teacher?.designation_bn || "",
    designation_ar: teacher?.designation_ar || "",
    branch: teacher?.branch || (currentUser?.role === "branch_admin" ? (branches.find(b => String(b.id) === String(currentUser.branch_id))?.name_en || branches.find(b => String(b.id) === String(currentUser.branch_id))?.branch_name || "") : ""),
    branch_id: teacher?.branch_id || (currentUser?.role === "branch_admin" ? currentUser.branch_id : ""),
    joining_date: teacher?.joining_date || "",
    status: teacher?.status || "active",
    website_showing_serial: teacher?.website_showing_serial || "",
    featured_teacher: teacher?.featured_teacher || false,
    nid_number: teacher?.nid_number || "",
    cv_url: teacher?.cv_url || "",
    assigned_batches: teacher?.assigned_batches || "",
    
    // Contact Info
    phone: teacher?.phone || "",
    alt_phone: teacher?.alt_phone || "",
    present_address: teacher?.present_address || "",
    permanent_address: teacher?.permanent_address || "",
    
    // Professional Info
    subjects: teacher?.subjects || "",
    qualification: teacher?.qualification || "",
    experience_years: teacher?.experience_years || "",
    special_skills: teacher?.special_skills || "",
    bio: teacher?.bio || "",
    bio_bn: teacher?.bio_bn || "",
    bio_ar: teacher?.bio_ar || "",
    department: teacher?.department || "",
    
    // Media
    photo_url: teacher?.photo_url || teacher?.image_url || "",
    password: "",

    // Salary/Hadiya direct input fields
    salary_amount: "",
    hadiya_type: "",
    effective_date: "",
    payment_cycle: "Monthly",
    salary_notes: "",
  });

  const classOptions = React.useMemo(() => {
    const batchesSet = new Set();
    
    // If "All Branches" or no branch is selected, show classes from all branches
    if (!form.branch || form.branch === "All Branches") {
      branches.forEach(b => {
        if (Array.isArray(b.academic_structure)) {
          b.academic_structure.forEach(c => {
            if (c.class_name) {
              const name = typeof c.class_name === "string"
                ? c.class_name
                : (c.class_name.en || c.class_name.bn || c.class_name.ar);
              if (name) batchesSet.add(name.trim());
            }
          });
        }
      });
    } else {
      // Find selected branch and extract only its classes
      const selectedB = branches.find(b => (b.name_en || b.branch_name) === form.branch);
      if (selectedB && Array.isArray(selectedB.academic_structure)) {
        selectedB.academic_structure.forEach(c => {
          if (c.class_name) {
            const name = typeof c.class_name === "string"
              ? c.class_name
              : (c.class_name.en || c.class_name.bn || c.class_name.ar);
            if (name) batchesSet.add(name.trim());
          }
        });
      }
    }
    
    return Array.from(batchesSet);
  }, [branches, form.branch]);

  const [showOnWebsite, setShowOnWebsite] = useState(() => {
    const defaults = {
      photo: "Y",
      name: "Y",
      designation: "Y",
      branch: "Y",
      subjects: "Y",
      qualification: "Y",
      experience: "Y",
      skills: "Y",
      bio: "Y",
      phone: "Y",
      email: "Y",
      department: "Y",
    };
    if (teacher && teacher.show_on_website) {
      return { ...defaults, ...teacher.show_on_website };
    }
    return defaults;
  });


  const handleToggleShowOnWebsite = React.useCallback((field, checked) => {
    setShowOnWebsite(p => ({ ...p, [field]: checked ? "Y" : "N" }));
  }, []);

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const originalRef = useRef(null);

  // Auto-generate teacher ID if new
  useEffect(() => {
    if (!teacher && !form.teacher_id) {
      let maxNum = 0;
      teachers.forEach((t) => {
        const match = t.teacher_id?.match(/^TCH-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      const nextId = `TCH-${String(nextNum).padStart(3, "0")}`;
      f("teacher_id", nextId);
    }
     
  }, [teacher]);

  // Auto-set branch details if branch admin adding new teacher
  useEffect(() => {
    if (!teacher && currentUser?.role === "branch_admin" && !form.branch_id) {
      const myBranch = branches.find(b => String(b.id) === String(currentUser.branch_id));
      if (myBranch) {
        setForm(prev => ({
          ...prev,
          branch: myBranch.name_en || myBranch.branch_name,
          branch_id: myBranch.id
        }));
      }
    }
     
  }, [teacher, currentUser]);

  // Load full teacher data + salary profile + show_on_website configs
  useEffect(() => {
    if (teacher && teacher.id) {
      // Fetch full record from DB to get all fields (list may return partial data)
      appClient.entities.Teacher.get(teacher.id)
        .then(fullTeacher => {
          if (!fullTeacher) return;

          if (fullTeacher.show_on_website) {
            setShowOnWebsite(p => ({ ...p, ...fullTeacher.show_on_website }));
          }

          const teacherData = {
            teacher_id: fullTeacher.teacher_id || "",
            employee_code: fullTeacher.employee_code || "",
            user_email: fullTeacher.user_email || "",
            full_name_en: fullTeacher.full_name_en || fullTeacher.name || "",
            full_name_bn: fullTeacher.full_name_bn || "",
            full_name_ar: fullTeacher.full_name_ar || "",
            designation: fullTeacher.designation || "",
            designation_bn: fullTeacher.designation_bn || "",
            designation_ar: fullTeacher.designation_ar || "",
            branch: fullTeacher.branch || "",
            branch_id: fullTeacher.branch_id || "",
            joining_date: fullTeacher.joining_date || "",
            status: fullTeacher.status || "active",
            website_showing_serial: fullTeacher.website_showing_serial || "",
            featured_teacher: fullTeacher.featured_teacher || false,
            nid_number: fullTeacher.nid_number || "",
            cv_url: fullTeacher.cv_url || "",
            assigned_batches: fullTeacher.assigned_batches || "",
            phone: fullTeacher.phone || "",
            alt_phone: fullTeacher.alt_phone || "",
            present_address: fullTeacher.present_address || "",
            permanent_address: fullTeacher.permanent_address || "",
            subjects: fullTeacher.subjects || "",
            qualification: fullTeacher.qualification || "",
            experience_years: fullTeacher.experience_years || "",
            special_skills: fullTeacher.special_skills || "",
            bio: fullTeacher.bio || "",
            bio_bn: fullTeacher.bio_bn || "",
            bio_ar: fullTeacher.bio_ar || "",
            department: fullTeacher.department || "",
            photo_url: fullTeacher.photo_url || fullTeacher.image_url || "",
            password: "",
            salary_amount: "",
            hadiya_type: "",
            effective_date: "",
            payment_cycle: "Monthly",
            salary_notes: "",
          };

          setForm(teacherData);
          originalRef.current = { ...teacherData };

          // Fetch salary profile details
          appClient.entities.TeacherSalaryProfile.filter({ teacher_id: fullTeacher.teacher_id, status: "active" })
            .then((res) => {
              const profile = res[0];
              if (profile) {
                const salaryData = {
                  salary_amount: profile.amount || "",
                  hadiya_type: profile.hadiya_type || "",
                  effective_date: profile.effective_date || "",
                  payment_cycle: profile.payment_cycle || "Monthly",
                  salary_notes: profile.notes || "",
                };
                setForm(prev => ({ ...prev, ...salaryData }));
                originalRef.current = { ...originalRef.current, ...salaryData };
              }
            })
            .catch(err => console.error("Error fetching salary profile:", err));
        })
        .catch(err => console.error("Error fetching full teacher data:", err));
    }
  }, [teacher]);

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

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.full_name_en) {
      toast.error("Please enter Name (English).");
      setSaving(false);
      setTimeout(() => document.querySelector("input[name='full_name_en']")?.focus(), 50);
      return;
    }

    if (!form.assigned_batches || form.assigned_batches.trim() === "") {
      toast.error("Assigned Classes / Batches: অনুগ্রহ করে অন্তত একটি ক্লাস বা ব্যাচ নির্বাচন করুন!");
      setSaving(false);
      return;
    }

    // Duplicate Protection check
    const isDuplicate = teachers.some((t) => {
      if (teacher && t.id === teacher.id) return false;
      const sameCode = form.employee_code && t.employee_code && t.employee_code.trim().toLowerCase() === form.employee_code.trim().toLowerCase();
      const samePhone = form.phone && t.phone && t.phone.trim() === form.phone.trim();
      const sameNid = form.nid_number && t.nid_number && t.nid_number.trim() === form.nid_number.trim();
      return sameCode || samePhone || sameNid;
    });

    if (isDuplicate) {
      const dupFields = [];
      teachers.forEach((t) => {
        if (teacher && t.id === teacher.id) return;
        if (form.employee_code && t.employee_code && t.employee_code.trim().toLowerCase() === form.employee_code.trim().toLowerCase()) dupFields.push("Employee Code");
        if (form.phone && t.phone && t.phone.trim() === form.phone.trim()) dupFields.push("Mobile Number");
        if (form.nid_number && t.nid_number && t.nid_number.trim() === form.nid_number.trim()) dupFields.push("NID Number");
      });
      const translatedFields = [...new Set(dupFields)].map(f => {
        if (f === "Employee Code") return "শিক্ষক আইডি/কোড";
        if (f === "Mobile Number") return "মোবাইল নাম্বার";
        if (f === "NID Number") return "এনআইডি (NID) নাম্বার";
        return f;
      }).join(", ");

      setTimeout(() => {
        if (dupFields.includes("Employee Code")) {
          document.querySelector("input[name='employee_code']")?.focus();
        } else if (dupFields.includes("Mobile Number")) {
          document.querySelector("input[name='phone']")?.focus();
        } else if (dupFields.includes("NID Number")) {
          document.querySelector("input[name='nid_number']")?.focus();
        }
      }, 50);

      toast.error(`ডুপ্লিকেট প্রোটেকশন: এই ${translatedFields} দিয়ে ইতিমধ্যেই একজন শিক্ষক নিবন্ধিত আছেন!`);
      setSaving(false);
      return;
    }

    if (currentUser?.role !== "branch_admin" && !form.branch) {
      toast.error("Please select a Branch.");
      setSaving(false);
      setTimeout(() => document.querySelector("button[role='combobox']")?.focus(), 50);
      return;
    }

    try {
      const payload = {
        ...form,
        name: form.full_name_en,
        image_url: form.photo_url,
        is_active: form.status === "active",
        show_on_website: showOnWebsite,
        website_showing_serial: form.website_showing_serial ? Number(form.website_showing_serial) : null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        joining_date: form.joining_date || null,
      };

      // Auto-set branch_id and branch name based on login role
      if (currentUser?.role === "branch_admin") {
        const myBranch = branches.find(b => String(b.id) === String(currentUser.branch_id));
        if (myBranch) {
          payload.branch = myBranch.name_en || myBranch.branch_name;
          payload.branch_id = myBranch.id;
        }
      } else {
        if (form.branch === "All Branches") {
          payload.branch = "All Branches";
          payload.branch_id = null;
        } else {
          const selectedB = branches.find(b => (b.name_en || b.branch_name) === form.branch);
          if (selectedB) {
            payload.branch_id = selectedB.id;
          }
        }
      }

      const savedTeacher = await onSave(payload);

      const teacherIdForBio = savedTeacher?.id || teacher?.id;
      if (teacherIdForBio && biometricData && biometricData.enable_biometric) {
        try {
          await fetch("/api/attendance/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_biometric_profile",
              data: {
                user_type: "teacher",
                user_id: teacherIdForBio,
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
      } else if (teacherIdForBio && biometricData && !biometricData.enable_biometric) {
        try {
          await fetch("/api/attendance/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_biometric_profile",
              data: {
                user_type: "teacher",
                user_id: teacherIdForBio,
                enable_biometric: false,
              },
            }),
          });
        } catch (err) {
          console.error("Failed to update biometric profile:", err);
        }
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save teacher");
    } finally {
      setSaving(false);
    }
  };

  const renderWebToggle = (field, label) => (
    <WebToggleItem
      field={field}
      label={label}
      value={showOnWebsite[field]}
      onToggle={handleToggleShowOnWebsite}
    />
  );

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      {/* 1. Basic Information */}
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <Briefcase className="h-4.5 w-4.5 text-primary" /> 1. Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Teacher ID * (Auto Generated)</Label>
              <Input name="teacher_id" value={form.teacher_id} onChange={e => f("teacher_id", e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Employee Code</Label>
              <Input name="employee_code" placeholder="e.g. EMP1001" value={form.employee_code} onChange={e => f("employee_code", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Name (English) *</Label>
              <Input name="full_name_en" placeholder="English full name" value={form.full_name_en} onChange={e => f("full_name_en", e.target.value)} required />
              <div className="mt-1.5">{renderWebToggle("name", "Name")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Name (Bengali)</Label>
              <Input name="full_name_bn" placeholder="Bengali full name" value={form.full_name_bn} onChange={e => f("full_name_bn", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Name (Arabic)</Label>
              <Input name="full_name_ar" placeholder="Arabic full name" value={form.full_name_ar} onChange={e => f("full_name_ar", e.target.value)} dir="rtl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Designation (English)</Label>
              <Input name="designation" placeholder="e.g. Senior Lecturer" value={form.designation} onChange={e => f("designation", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("designation", "Designation")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Designation (Bengali)</Label>
              <Input name="designation_bn" placeholder="পদবি (বাংলা)" value={form.designation_bn} onChange={e => f("designation_bn", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Designation (Arabic)</Label>
              <Input name="designation_ar" placeholder="المنصب (عربي)" value={form.designation_ar} onChange={e => f("designation_ar", e.target.value)} dir="rtl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Branch</Label>
              <Select value={form.branch || undefined} onValueChange={v => f("branch", v)} disabled={currentUser?.role === "branch_admin"}>
                <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Branches">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.name_en || b.branch_name || `branch-${b.id}`}>
                      {b.name_en || b.branch_name || b.name_bn || `Branch ${b.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1.5">{renderWebToggle("branch", "Branch")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Department / Section</Label>
              <Input name="department" placeholder="e.g. Hifz, Hadith, Female Section" value={form.department} onChange={e => f("department", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("department", "Department")}</div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-355 block mb-1.5">Assigned Classes / Batches *</Label>
              <div className="border rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 max-h-56 overflow-y-auto space-y-2.5 transition-all">
                {/* All Classes option */}
                {(() => {
                  const isAllClasses = (form.assigned_batches || "").split(",").map(b => b.trim().toLowerCase()).includes("all classes");
                  return (
                    <div 
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all select-none ${
                        isAllClasses 
                          ? "bg-[#12715B]/10 border-[#12715B]/30 dark:bg-[#12715B]/20 dark:border-[#12715B]/40 hover:bg-[#12715B]/15" 
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <Checkbox
                        id="batch-all-classes"
                        checked={isAllClasses}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            f("assigned_batches", "All Classes");
                          } else {
                            f("assigned_batches", "");
                          }
                        }}
                        className="h-5 w-5 rounded border-slate-300 text-[#12715B] focus:ring-[#12715B]"
                      />
                      <label 
                        htmlFor="batch-all-classes" 
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none flex-1 py-1"
                      >
                        All Classes (সব ক্লাস)
                      </label>
                    </div>
                  );
                })()}

                {/* Individual Classes options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {classOptions.filter(c => c && typeof c === "string" && c.toLowerCase() !== "all classes").map((cName, idx) => {
                    const selectedList = (form.assigned_batches || "").split(",").map(b => b.trim()).filter(Boolean);
                    const isAllSelected = selectedList.map(x => x.toLowerCase()).includes("all classes");
                    const isChecked = isAllSelected || selectedList.map(x => x.toLowerCase()).includes(cName.toLowerCase());
                    const inputId = `batch-checkbox-${idx}`;

                    return (
                      <div 
                        key={cName} 
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isAllSelected 
                            ? "opacity-60 cursor-not-allowed" 
                            : "select-none"
                        } ${
                          isChecked 
                            ? "bg-[#12715B]/5 border-[#12715B]/20 dark:bg-[#12715B]/10 dark:border-[#12715B]/30 hover:bg-[#12715B]/10" 
                            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Checkbox
                          id={inputId}
                          checked={isChecked}
                          disabled={isAllSelected}
                          onCheckedChange={(checked) => {
                            let newList = [...selectedList].filter(x => x.toLowerCase() !== "all classes" && x !== "");
                            if (checked) {
                              newList.push(cName);
                            } else {
                              newList = newList.filter(x => x.toLowerCase() !== cName.toLowerCase());
                            }
                            f("assigned_batches", newList.join(", "));
                          }}
                          className="h-5 w-5 rounded border-slate-300 text-[#12715B] focus:ring-[#12715B]"
                        />
                        <label 
                          htmlFor={inputId} 
                          className={`text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex-1 py-1 ${
                            isAllSelected ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          {cName}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Joining Date</Label>
              <Input name="joining_date" type="date" value={form.joining_date} onChange={e => f("joining_date", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Status</Label>
              <Select value={form.status} onValueChange={v => f("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Website Showing Serial</Label>
              <Input name="website_showing_serial" type="number" min="1" placeholder="e.g. 1, 2, 3" value={form.website_showing_serial} onChange={e => f("website_showing_serial", e.target.value)} />
            </div>
            <div className="flex flex-col justify-end">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Featured Teacher</Label>
              <div className="flex items-center gap-3 border rounded-xl p-2.5 bg-slate-50 dark:bg-slate-900 border-slate-100 h-10">
                <Switch checked={form.featured_teacher} onCheckedChange={v => f("featured_teacher", v)} />
                <span className="text-xs font-medium text-slate-700">{form.featured_teacher ? "Yes (Show in Featured)" : "No (Hide from Featured)"}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">NID Number</Label>
              <Input name="nid_number" placeholder="National ID card number" value={form.nid_number} onChange={e => f("nid_number", e.target.value)} />
            </div>
            <CVUpload value={form.cv_url} onChange={url => f("cv_url", url)} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Contact Information */}
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <Phone className="h-4.5 w-4.5 text-primary" /> 2. Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Mobile Number</Label>
              <Input name="phone" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => f("phone", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("phone", "Mobile Number")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Alternative Mobile Number</Label>
              <Input name="alt_phone" placeholder="Alternative mobile number" value={form.alt_phone} onChange={e => f("alt_phone", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Contact Email</Label>
              <Input name="user_email" type="email" placeholder="email@domain.com" value={form.user_email} onChange={e => f("user_email", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("email", "Email")}</div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Present Address</Label>
              <Textarea name="present_address" placeholder="Current address details" value={form.present_address} onChange={e => f("present_address", e.target.value)} rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Permanent Address</Label>
              <Textarea name="permanent_address" placeholder="Permanent address details" value={form.permanent_address} onChange={e => f("permanent_address", e.target.value)} rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Professional Information */}
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <Award className="h-4.5 w-4.5 text-primary" /> 3. Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Subjects taught (comma separated)</Label>
              <Input placeholder="Quran, Tajweed, Sahih Bukhari" value={form.subjects} onChange={e => f("subjects", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("subjects", "Subjects")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Qualification</Label>
              <Input placeholder="e.g. Dawra-e-Hadith, Kamil" value={form.qualification} onChange={e => f("qualification", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("qualification", "Qualification")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Experience (Years)</Label>
              <Input type="number" min="0" placeholder="Years of experience" value={form.experience_years} onChange={e => f("experience_years", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("experience", "Experience")}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Special Skills</Label>
              <Input placeholder="e.g. Arabic Calligraphy, Qira'at" value={form.special_skills} onChange={e => f("special_skills", e.target.value)} />
              <div className="mt-1.5">{renderWebToggle("skills", "Special Skills")}</div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Short Biography (English)</Label>
              <Textarea placeholder="Short teacher biography in English" value={form.bio} onChange={e => f("bio", e.target.value)} rows={3} />
              <div className="mt-1.5">{renderWebToggle("bio", "Biography")}</div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Short Biography (Bengali)</Label>
              <Textarea placeholder="শিক্ষকের সংক্ষিপ্ত পরিচিতি (বাংলা)" value={form.bio_bn} onChange={e => f("bio_bn", e.target.value)} rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600 block mb-1">Short Biography (Arabic)</Label>
              <Textarea placeholder="السيرة الذاتية القصيرة للمعلم (عربي)" value={form.bio_ar} onChange={e => f("bio_ar", e.target.value)} rows={3} dir="rtl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Media */}
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <Upload className="h-4.5 w-4.5 text-primary" /> 4. Media
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <ImageUpload label="Profile Photo" value={form.photo_url} onChange={url => f("photo_url", url)} />
          <div className="mt-1.5">{renderWebToggle("photo", "Photo")}</div>
        </CardContent>
      </Card>

      {/* 5. Salary/Hadiya Information (Auto Integrated) */}
      <Card className="border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/10 dark:border-emerald-900 shadow-sm rounded-2xl">
        <CardHeader className="bg-emerald-100/40 p-4 border-b border-emerald-200 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Gift className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" /> 5. Hadiya / Salary Profile Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">This configuration establishes the monthly Hadiya contract. Hadiya profile will auto-create and sync when this teacher is saved.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">Monthly Salary / Hadiya Amount (Taka)</Label>
              <Input type="number" placeholder="0" value={form.salary_amount} onChange={e => f("salary_amount", e.target.value)} className="bg-white dark:bg-slate-900" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">Hadiya Type / Reason</Label>
              <Input placeholder="e.g. Monthly allowance, Senior Lecturer Stipend" value={form.hadiya_type} onChange={e => f("hadiya_type", e.target.value)} className="bg-white dark:bg-slate-900" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">Effective Date</Label>
              <Input type="date" value={form.effective_date} onChange={e => f("effective_date", e.target.value)} className="bg-white dark:bg-slate-900" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">Payment Cycle</Label>
              <Select value={form.payment_cycle} onValueChange={v => f("payment_cycle", v)}>
                <SelectTrigger className="bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Half Yearly">Half Yearly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">Notes</Label>
              <Input placeholder="Additional salary/allowance details" value={form.salary_notes} onChange={e => f("salary_notes", e.target.value)} className="bg-white dark:bg-slate-900" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5.5 Biometric Information */}
      <BiometricInfoSection
        userType="teacher"
        userId={teacher?.id || null}
        onDataChange={setBiometricData}
      />

      {/* 6. Security Account */}
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            🔒 Account & Login Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div>
            <Label className="text-xs font-semibold text-slate-600 block mb-1">Login Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={teacher ? "Leave blank to keep current password" : "Set login password for teacher"}
                value={form.password}
                onChange={e => f("password", e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/95 text-white">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {teacher ? "Update Teacher" : "Add Teacher"}
        </Button>
      </div>
    </form>
  );
}

function AssignStudentsDialog({ teacher, students, teachers = [], branches, onClose }) {
  const queryClient = useQueryClient();

  const assignMut = useMutation({
    mutationFn: ({ studentId, teacherId }) =>
      appClient.entities.Student.update(studentId, { assigned_teacher_id: teacherId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast.success("Updated student assignment!");
    },
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const assigned = students.filter(s => String(s.assigned_teacher_id) === String(teacher.id) || (teacher.teacher_id && String(s.assigned_teacher_id) === String(teacher.teacher_id)));
  const { search: studentSearch, setSearch: setStudentSearch, query } = useSearch({ data: [], debounceMs: 300 });

  const branchObj = branches.find(b => String(b.id) === String(teacher.branch_id));
  const classOptions = React.useMemo(() => {
    const struct = branchObj?.academic_structure || [];
    const list = [];
    struct.forEach(c => {
      const name = typeof c.class_name === "string" ? c.class_name : (c.class_name?.bn || c.class_name?.en || "");
      if (name) list.push({ id: String(c.id), label: name });
    });
    return list;
  }, [branchObj]);

  const filteredStudents = students.filter(student => {
    // 1. Branch match
    const isAllBranches = !teacher.branch_id || teacher.branch === "All Branches";
    const sameBranch = isAllBranches || !student.branch_id || String(student.branch_id) === String(teacher.branch_id);
    if (!sameBranch) return false;

    // 2. Class dropdown filter
    if (selectedClassFilter !== "all") {
      const clsObj = classOptions.find(c => c.id === selectedClassFilter);
      const cLabel = (clsObj?.label || "").toLowerCase();
      const sCls = (student.class_name || "").toLowerCase();
      const sBatch = (student.batch || "").toLowerCase();
      const matchCls = String(student.class_id) === selectedClassFilter || (cLabel && (sCls.includes(cLabel) || sBatch.includes(cLabel)));
      if (!matchCls) return false;
    }

    // 3. Search query filter
    if (query) {
      const nameEn = (student.full_name_en || "").toLowerCase();
      const nameBn = (student.full_name_bn || "").toLowerCase();
      const roll = (student.roll_number || "").toLowerCase();
      const sid = String(student.id || "").toLowerCase();
      const stCode = String(student.student_id || "").toLowerCase();
      if (!nameEn.includes(query) && !nameBn.includes(query) && !roll.includes(query) && !sid.includes(query) && !stCode.includes(query)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-primary">{teacher.full_name_en} — <span className="underline font-bold">{assigned.length} students assigned</span></p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Click a student to assign or unassign from this teacher.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SearchInput
          value={studentSearch}
          onChange={setStudentSearch}
          placeholder="Search by ID, Name, or Roll..."
          className="h-10 text-xs bg-slate-50"
        />
        {classOptions.length > 0 && (
          <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
            <SelectTrigger className="h-10 text-xs bg-slate-50">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes (সব ক্লাস)</SelectItem>
              {classOptions.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {filteredStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No students found in this branch/class.
          </p>
        ) : (
          filteredStudents.map(student => {
            const isAssigned = String(student.assigned_teacher_id) === String(teacher.id);
            const otherTeacher = student.assigned_teacher_id && String(student.assigned_teacher_id) !== String(teacher.id)
              ? teachers.find(t => String(t.id) === String(student.assigned_teacher_id))
              : null;

            return (
              <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isAssigned ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-100"}`}>
                <div>
                  <p className="text-sm font-medium text-slate-800">{student.full_name_en}</p>
                  <p className="text-xs text-muted-foreground">
                    #{student.roll_number} • {student.class_name || student.batch}
                    {otherTeacher && (
                      <span className="block mt-0.5 text-[10px] text-amber-600 font-medium">
                        Assigned to: {otherTeacher.full_name_en}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isAssigned ? "default" : "outline"}
                  onClick={() => assignMut.mutate({
                    studentId: student.id,
                    teacherId: isAssigned ? null : teacher.id,
                  })}
                  disabled={assignMut.isPending}
                  className="gap-1 rounded-xl"
                >
                  {isAssigned ? (
                    <><UserX className="h-3 w-3" /> Unassign</>
                  ) : otherTeacher ? (
                    <><UserCheck className="h-3 w-3" /> Reassign</>
                  ) : (
                    <><UserCheck className="h-3 w-3" /> Assign</>
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ── Main TeacherManager Component ── */
export default function TeacherManager({ students, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assignTeacher, setAssignTeacher] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(50);
  const queryClient = useQueryClient();

  const { data: rawTeachers = [], isLoading } = useQuery({
    queryKey: ["admin-teachers", currentUser?.branch_id, visibleLimit],
    queryFn: async () => {
      try {
        if (currentUser?.role === "branch_admin" && currentUser?.branch_id) {
          return await appClient.entities.Teacher.filter({ branch_id: Number(currentUser.branch_id) }, "-id", visibleLimit);
        }
        const res = await appClient.entities.Teacher.list("-id", visibleLimit);
        if (Array.isArray(res)) return res;
        return [];
      } catch (err) {
        console.warn("Notice loading teachers:", err?.message || err);
        return [];
      }
    },
  });

  const teachers = currentUser?.role === "branch_admin"
    ? rawTeachers.filter((t) => !t.branch_id || t.branch === "All Branches" || String(t.branch_id) === String(currentUser.branch_id))
    : rawTeachers;

  const { search: searchQuery, setSearch: setSearchQuery, filteredData: filteredTeachers } = useSearch({
    data: teachers,
    filterFn: (t, query) => {
      const nameEn = (t.full_name_en || "").toLowerCase();
      const nameBn = (t.full_name_bn || "").toLowerCase();
      const nameAr = (t.full_name_ar || "").toLowerCase();
      const tid = (t.teacher_id || "").toLowerCase();
      const code = (t.employee_code || "").toLowerCase();
      const phone = (t.phone || "").toLowerCase();
      return nameEn.includes(query) || nameBn.includes(query) || nameAr.includes(query) || tid.includes(query) || code.includes(query) || phone.includes(query);
    },
  });

  const { data: rawBranches = [] } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => appClient.entities.Branch.list("name_en", 100),
  });

  const branches = currentUser?.role === "branch_admin"
    ? rawBranches.filter((b) => String(b.id) === String(currentUser.branch_id))
    : rawBranches;

  const createMut = useMutation({
    mutationFn: async (payload) => {
      const { salary_amount, hadiya_type, effective_date, payment_cycle, salary_notes, ...teacherData } = payload;
      
      // Convert any remaining empty strings to null to prevent Postgres type errors
      Object.keys(teacherData).forEach(key => {
        if (teacherData[key] === "") teacherData[key] = null;
      });

      // Save teacher
      const teacher = await appClient.entities.Teacher.create(teacherData);
      
      // Save/create salary profile
      await appClient.entities.TeacherSalaryProfile.create({
        teacher_id: teacher.teacher_id,
        amount: salary_amount ? Number(salary_amount) : 0,
        hadiya_type: hadiya_type || "",
        effective_date: effective_date || null,
        payment_cycle: payment_cycle || "Monthly",
        notes: salary_notes || "",
        status: "active",
      });
      
      return teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers-overview"] });
      setShowForm(false);
      toast.success("Teacher added!");
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data: payload }) => {
      const { salary_amount, hadiya_type, effective_date, payment_cycle, salary_notes, ...teacherData } = payload;
      
      // Convert empty strings to null so they are updated correctly in the database,
      // except for password which should be omitted if empty to prevent resetting it.
      Object.keys(teacherData).forEach(key => {
        if (key === "password") {
          if (teacherData[key] === "" || teacherData[key] === null) {
            delete teacherData[key];
          }
        } else {
          if (teacherData[key] === "") {
            teacherData[key] = null;
          }
        }
      });

      // Update teacher
      const teacher = await appClient.entities.Teacher.update(id, teacherData);
      
      // Sync salary profile
      const res = await appClient.entities.TeacherSalaryProfile.filter({ teacher_id: teacher.teacher_id });
      const existingProfile = res.find(p => p.status === "active") || res[0];
      
      const salaryData = {
        teacher_id: teacher.teacher_id,
        amount: salary_amount ? Number(salary_amount) : 0,
        hadiya_type: hadiya_type || "",
        effective_date: effective_date || null,
        payment_cycle: payment_cycle || "Monthly",
        notes: salary_notes || "",
        status: "active",
      };
      
      if (existingProfile) {
        await appClient.entities.TeacherSalaryProfile.update(existingProfile.id, salaryData);
      } else {
        await appClient.entities.TeacherSalaryProfile.create(salaryData);
      }
      
      return teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers-overview"] });
      setShowForm(false);
      setEditingTeacher(null);
      toast.success("Teacher updated!");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (teacher) => {
      // Archive salary profile first
      try {
        const res = await appClient.entities.TeacherSalaryProfile.filter({ teacher_id: teacher.teacher_id });
        for (const profile of res) {
          await appClient.entities.TeacherSalaryProfile.update(profile.id, { status: "archived" });
        }
      } catch (err) {
        console.error("Error archiving salary profile:", err);
      }
      // Delete teacher
      await appClient.entities.Teacher.delete(teacher.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers-overview"] });
      toast.success("Teacher removed! Hadiya records archived.");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Teacher.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers-overview"] });
    },
  });

  const handleSave = async (data) => {
    if (editingTeacher) {
      await updateMut.mutateAsync({ id: editingTeacher.id, data });
    } else {
      await createMut.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-100 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-primary">Teacher Management</h2>
          <p className="text-xs text-muted-foreground">{teachers.length} teachers registered</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-initial">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Name, ID, Mobile..."
            className="h-9 text-xs"
          />
          <Button onClick={() => { setEditingTeacher(null); setShowForm(true); }} className="gap-2 text-xs h-9 rounded-xl bg-primary hover:bg-primary/95 text-white">
            <Plus className="h-4 w-4" /> Add Teacher
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filteredTeachers.length === 0 ? (
        <Card className="rounded-2xl border-slate-100">
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            {searchQuery ? "No teachers match your search query." : "No teachers registered yet. Click 'Add Teacher' to create one."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeachers.map(teacher => {
            const teacherBatches = teacher.assigned_batches
              ? teacher.assigned_batches.split(",").map(b => b.trim().toLowerCase()).filter(Boolean)
              : [];
            const assignedCount = students.filter((s) => {
              const studentTeacherId = s.assigned_teacher_id !== null && s.assigned_teacher_id !== undefined ? String(s.assigned_teacher_id) : "";
              const matchesTeacherId = studentTeacherId !== "" && (
                studentTeacherId === String(teacher.id) || 
                (teacher.teacher_id && studentTeacherId === String(teacher.teacher_id))
              );

              const studentBatch = s.batch ? s.batch.toLowerCase() : "";
              const studentDept = s.department ? s.department.toLowerCase() : "";

              const matchesBatch = teacherBatches.length > 0 && (
                teacherBatches.includes("all classes") || 
                teacherBatches.some(tb => tb && (studentBatch.includes(tb) || studentDept.includes(tb)))
              );

              const isActive = !s.status || s.status.toLowerCase() === "active";

              return (matchesTeacherId || matchesBatch) && isActive;
            }).length;
            return (
              <Card key={teacher.id} className={`border-slate-100 rounded-2xl hover:shadow-md transition-all duration-300 ${teacher.status === "inactive" ? "opacity-60 bg-slate-50/50" : ""}`}>
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {teacher.photo_url ? (
                          <img src={teacher.photo_url} loading="lazy" alt={teacher.full_name_en || "Teacher photo"} className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {teacher.full_name_en?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{teacher.full_name_en}</p>
                            {teacher.featured_teacher && (
                              <Badge className="bg-amber-100 text-amber-800 text-[9px] hover:bg-amber-100 border-none font-bold py-0 px-1.5 h-4 flex items-center">Featured</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-mono">
                            <span>ID: {teacher.teacher_id}</span>
                            {teacher.employee_code && <span>• Emp: {teacher.employee_code}</span>}
                          </div>
                        </div>
                      </div>
                      <Badge className={teacher.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200"}>
                        {teacher.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-2 mb-4">
                      {teacher.designation && <p>💼 <strong>{teacher.designation}</strong> ({teacher.department || "General"})</p>}
                      {teacher.branch && <p>📍 {teacher.branch}</p>}
                      {teacher.phone && <p>📱 {teacher.phone}</p>}
                      {teacher.subjects && <p>📚 {teacher.subjects}</p>}
                      <p>🎓 <strong className="text-primary">{assignedCount}</strong> students assigned</p>
                      {teacher.website_showing_serial !== null && teacher.website_showing_serial !== undefined && (
                        <p className="font-mono text-[10px]">🔢 Show Serial: {teacher.website_showing_serial}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t pt-3 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs rounded-xl" onClick={() => setAssignTeacher(teacher)}>
                      <Users className="h-3 w-3" /> Assign Students
                    </Button>
                    <Link href={`${createPageUrl("TeacherProfile")}?id=${teacher.id}`}>
                      <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-emerald-50">
                        <Eye className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => { setEditingTeacher(teacher); setShowForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl" onClick={() => toggleMut.mutate({ id: teacher.id, is_active: !teacher.is_active })} title={teacher.is_active ? "Hide" : "Show"}>
                      {teacher.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-red-50" onClick={() => window.confirm(`Remove ${teacher.full_name_en}? All of their Hadiya/Salary contracts will be archived.`) && deleteMut.mutate(teacher)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && rawTeachers.length === visibleLimit && (
        <div className="flex justify-center pt-2 pb-6">
          <Button
            onClick={() => setVisibleLimit((prev) => prev + 50)}
            variant="outline"
            className="rounded-xl px-8 py-2 font-bold text-xs gap-2 border-[#1E6B52] text-[#1E6B52] hover:bg-[#1E6B52] hover:text-white transition-all shadow-sm"
          >
            Load More Teachers
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-primary">
              {editingTeacher ? `Edit Teacher Profile: ${editingTeacher.full_name_en}` : "Add New Teacher"}
            </DialogTitle>
          </DialogHeader>
          {showForm && (
            <TeacherForm
              key={editingTeacher?.id || 'new'}
              teacher={editingTeacher}
              teachers={teachers}
              branches={branches}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingTeacher(null); }}
              currentUser={currentUser}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={!!assignTeacher} onOpenChange={() => setAssignTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Assign Students to Teacher</DialogTitle>
          </DialogHeader>
          {assignTeacher && (
            <AssignStudentsDialog
              teacher={assignTeacher}
              students={students}
              teachers={teachers}
              branches={branches}
              onClose={() => setAssignTeacher(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
