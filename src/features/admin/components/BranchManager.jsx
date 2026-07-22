import React, { useState, useMemo } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PermissionManager from "./PermissionManager";
import { permissionsToArray, arrayToPermissions } from "../../../lib/permissions-definitions";

const EMPTY = {
  branch_name: "",
  name_en: "",
  name_bn: "",
  name_ar: "",
  address_en: "",
  address_bn: "",
  address_ar: "",
  phone: "",
  email: "",
  head_teacher: "",
  established_year: "",
  establishment_date: "",
  logo: "",
  slider_images: [],
  map_embed_link: "",
  sort_order: 0,
  is_active: true,
  academic_structure: [],
  content_settings: {},
  content_data: {},
  metadata: {},
  admin_username: "",
  admin_password: "",
  boarding_enabled: false,
  boarding_manager_name: "",
  boarding_manager_username: "",
  boarding_manager_password: "",
  boarding_manager_mobile: "",
  allowed_features: ["students", "teachers", "student-attendance", "teacher-attendance", "daily-lesson-tracker", "exams"],
  custom_content_blocks: []
};

const SECTIONS = [
  { key: "intro", bn: "শাখা পরিচিতি", en: "Branch Introduction" },
  { key: "objective", bn: "শাখার উদ্দেশ্য", en: "Branch Objective" },
  { key: "vision", bn: "আমাদের দৃষ্টিভঙ্গি", en: "Our Vision" },
  { key: "target", bn: "আমাদের টার্গেট", en: "Our Target" },
  { key: "departments", bn: "আমাদের বিভাগসমূহ", en: "Our Departments" },
  { key: "features", bn: "আমাদের বৈশিষ্ট্যসমূহ", en: "Our Features" },
  { key: "teaching_method", bn: "পাঠদান কৌশল", en: "Teaching Method" },
  { key: "admission_process", bn: "ভর্তি প্রক্রিয়া", en: "Admission Process" },
  { key: "moral_discipline", bn: "নৈতিক মান সংক্রান্ত", en: "Moral & Discipline Policy" },
  { key: "leave_policy", bn: "দরখাস্ত ও ছুটি সংক্রান্ত", en: "Leave & Application Policy" },
  { key: "uniform", bn: "প্রতিষ্ঠানের ইউনিফর্ম", en: "Institution Uniform" },
  { key: "guardian_guidelines", bn: "অভিভাবকদের জ্ঞাতব্য", en: "Guardian Guidelines" }
];

const generateSlug = (name) => {
  if (!name) return `branch-${Date.now()}`;
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug === "-" || !slug ? `branch-${Date.now()}` : slug;
};

const hasAnyBranchName = (form) => [form.name_bn, form.name_en, form.name_ar, form.branch_name].some((value) => value?.trim());

export default function BranchManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadingSlider, setUploadingSlider] = useState(false);

  const permissionObj = useMemo(() => arrayToPermissions(form.allowed_features), [form.allowed_features]);
  const handlePermissionsChange = (newPerms) => {
    setForm((f) => ({ ...f, allowed_features: permissionsToArray(newPerms) }));
  };
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches-admin"],
    queryFn: () => appClient.entities.Branch.list("sort_order", 100),
  });

  const createMut = useMutation({
    mutationFn: (d) => appClient.entities.Branch.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches-admin"] });
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      // Invalidate server-side homepage cache so public pages reflect branch status immediately
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Branch added!");
      setShowForm(false);
      setForm(EMPTY);
    },
    onError: (err) => {
      const msg = err?.message || err?.error?.message || (typeof err === "object" && Object.keys(err).length ? JSON.stringify(err) : "Failed to add branch");
      toast.error(msg);
      console.error("Create branch error:", err, Object.keys(err));
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.Branch.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches-admin"] });
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      // Invalidate server-side homepage cache so public pages reflect branch status immediately
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Updated!");
      setShowForm(false);
      setEditing(null);
    },
    onError: (err) => {
      const msg = err?.message || err?.error?.message || (typeof err === "object" && Object.keys(err).length ? JSON.stringify(err) : "Failed to update branch");
      toast.error(msg);
      console.error("Update branch error:", err, Object.keys(err));
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Branch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches-admin"] });
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      // Invalidate server-side homepage cache so public pages reflect branch status immediately
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Deleted!");
    },
    onError: (err) => {
      const msg = err?.message || err?.error?.message || (typeof err === "object" && Object.keys(err).length ? JSON.stringify(err) : "Failed to delete branch");
      toast.error(msg);
      console.error("Delete branch error:", err, Object.keys(err));
    }
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Branch.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches-admin"] });
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      // Invalidate server-side homepage cache so public pages reflect branch status immediately
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setActiveTab("basic");
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      ...EMPTY,
      ...b,
      slider_images: Array.isArray(b.slider_images) ? b.slider_images : [],
      academic_structure: Array.isArray(b.academic_structure) ? b.academic_structure.map(cls => {
        if (!cls.sections) {
          return {
            id: cls.id,
            class_name: cls.class_name,
            sections: [
              {
                id: cls.id + "_sec",
                section: cls.section || { bn: "", en: "", ar: "" },
                shift: cls.shift || { bn: "", en: "", ar: "" },
                class_teacher_id: cls.class_teacher_id || "",
                show_on_web: true,
                subjects: cls.subjects || []
              }
            ]
          };
        }
        return cls;
      }) : [],
      content_settings: b.content_settings || {},
      content_data: b.content_data || {},
      metadata: b.metadata || {},
      allowed_features: Array.isArray(b.allowed_features) ? b.allowed_features : ["students", "teachers", "student-attendance", "teacher-attendance", "daily-lesson-tracker", "exams"],
      custom_content_blocks: Array.isArray(b.content_data?.custom_content_blocks) ? b.content_data.custom_content_blocks : []
    });
    setActiveTab("basic");
    setShowForm(true);
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("<iframe")) {
      const match = trimmed.match(/src="([^"]+)"/);
      if (match) return match[1];
    }
    return trimmed;
  };

  const handleSave = () => {
    if (!hasAnyBranchName(form)) {
      toast.error("Add a branch name");
      return;
    }

    if (form.map_embed_link) {
      try {
        new URL(getEmbedUrl(form.map_embed_link));
      } catch (e) {
        toast.error("Invalid Google Map Link provided.");
        return;
      }
    }

    if (form.boarding_enabled) {
      if (!form.boarding_manager_name?.trim()) {
        toast.error("Please enter Boarding Manager Name");
        return;
      }
      if (!form.boarding_manager_username?.trim()) {
        toast.error("Please enter Boarding Manager Username");
        return;
      }
      if (!form.boarding_manager_password?.trim()) {
        toast.error("Please enter Boarding Manager Password");
        return;
      }
    }

    const slugVal = form.slug?.trim() || generateSlug(form.name_en || form.branch_name || form.name_bn);
    
    // Deconstruct and omit UI-only 'address', academic_structure and database managed fields from the payload
    const { address, map_link, id, created_at, updated_at, custom_content_blocks, academic_structure, ...cleanForm } = form;

    const enriched = {
      ...cleanForm,
      map_embed_link: getEmbedUrl(form.map_embed_link),
      branch_name: form.branch_name || form.name_en || form.name_bn || "",
      name_en: form.name_en || form.branch_name || "",
      address_en: form.address_en || form.address_bn || "",
      slug: slugVal,
      content_data: {
        ...(cleanForm.content_data || {}),
        custom_content_blocks: custom_content_blocks || []
      },
      // If boarding is disabled, set all manager fields to null to avoid unique constraints violation
      ...(form.boarding_enabled ? {
        boarding_enabled: true,
        boarding_manager_name: form.boarding_manager_name?.trim() || null,
        boarding_manager_username: form.boarding_manager_username?.trim() || null,
        boarding_manager_password: form.boarding_manager_password || null,
        boarding_manager_mobile: form.boarding_manager_mobile?.trim() || null
      } : {
        boarding_enabled: false,
        boarding_manager_name: null,
        boarding_manager_username: null,
        boarding_manager_password: null,
        boarding_manager_mobile: null
      })
    };

    // Ensure custom_content_blocks is strictly deleted so it doesn't cause Supabase schema errors
    delete enriched.custom_content_blocks;

    if (editing) updateMut.mutate({ id: editing.id, d: enriched });
    else createMut.mutate(enriched);
  };

  const handleSliderUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingSlider(true);
    const urls = [];
    for (const file of files) {
      try {
        const res = await appClient.integrations.Core.UploadFile({ file, label: "Branch Slider Image" });
        if (res.file_url) urls.push(res.file_url);
      } catch (err) {
        toast.error(`Upload failed for ${file.name}`);
      }
    }
    if (urls.length > 0) {
      setForm(f => ({ ...f, slider_images: [...(f.slider_images || []), ...urls] }));
      toast.success("Slider images uploaded!");
    }
    setUploadingSlider(false);
  };

  const addCustomContentBlock = () => {
    const newBlock = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      heading: { bn: "", en: "", ar: "" },
      content: { bn: "", en: "", ar: "" },
      show: "Y"
    };
    setForm(f => ({ ...f, custom_content_blocks: [...(f.custom_content_blocks || []), newBlock] }));
  };

  const updateCustomContentBlock = (blockId, field, subField, value) => {
    setForm(f => ({
      ...f,
      custom_content_blocks: f.custom_content_blocks.map(b => {
        if (b.id === blockId) {
          if (subField) {
            return { ...b, [field]: { ...b[field], [subField]: value } };
          }
          return { ...b, [field]: value };
        }
        return b;
      })
    }));
  };

  const removeCustomContentBlock = (blockId) => {
    setForm(f => ({
      ...f,
      custom_content_blocks: f.custom_content_blocks.filter(b => b.id !== blockId)
    }));
  };

  const updateContentData = (secKey, lang, val) => {
    setForm(f => {
      const content_data = { ...f.content_data };
      if (!content_data[secKey]) content_data[secKey] = { bn: "", en: "", ar: "" };
      content_data[secKey] = { ...content_data[secKey], [lang]: val };
      return { ...f, content_data };
    });
  };

  const updateContentSetting = (secKey, val) => {
    setForm(f => ({
      ...f,
      content_settings: { ...f.content_settings, [secKey]: val }
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary">Branch Management</h3>
          <p className="text-xs text-muted-foreground">Add and manage institute branches (শাখা)</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[#052E2B] hover:bg-[#084540] text-white">
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : branches.length === 0 ? (
        <Card className="border-primary/10">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            No branches added yet. Click "Add Branch" to create one.
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
                      {(b.branch_name || b.name_bn) && <p className="font-bold text-slate-800">{b.branch_name || b.name_bn}</p>}
                      {b.name_en && b.name_en !== b.branch_name && <p className="text-sm text-slate-600">{b.name_en}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleMut.mutate({ id: b.id, is_active: !b.is_active })} title={b.is_active ? "Hide" : "Show"}>
                      {b.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#12715B]/10 hover:text-[#12715B]" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 hover:text-red-500" onClick={() => { if (window.confirm("Delete branch?")) deleteMut.mutate(b.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground mt-2 border-t pt-2 border-slate-100">
                  {b.slug && <p>🔗 Slug: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{b.slug}</span></p>}
                  {(b.address_bn || b.address_en) && <p>📍 {b.address_bn || b.address_en}</p>}
                  {b.phone && <p>📞 {b.phone}</p>}
                  {b.email && <p>✉️ {b.email}</p>}
                  {b.head_teacher && <p>👨‍🏫 {b.head_teacher}</p>}
                  {b.established_year && <p>📅 Est: {b.established_year}</p>}
                </div>
                <div className="mt-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {b.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-white dark:bg-[#0d1f17] border dark:border-green-900 rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b dark:border-green-900">
            <DialogTitle className="text-xl font-extrabold italic text-[#052E2B] dark:text-emerald-400">
              {editing ? "Edit Branch settings" : "Add New Branch"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            <div className="px-6 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-green-900">
              <TabsList className="bg-transparent border-0 gap-2 h-12 p-0">
                <TabsTrigger value="basic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#12715B] data-[state=active]:bg-transparent px-4 font-bold text-sm text-slate-600 data-[state=active]:text-[#12715B] dark:text-slate-400 dark:data-[state=active]:text-emerald-400">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="content" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#12715B] data-[state=active]:bg-transparent px-4 font-bold text-sm text-slate-600 data-[state=active]:text-[#12715B] dark:text-slate-400 dark:data-[state=active]:text-emerald-400">
                  Branch Content
                </TabsTrigger>
                <TabsTrigger value="permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#12715B] data-[state=active]:bg-transparent px-4 font-bold text-sm text-slate-600 data-[state=active]:text-[#12715B] dark:text-slate-400 dark:data-[state=active]:text-emerald-400">
                  ⚙️ Permissions
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[60vh] px-6 py-4">
              {/* TAB 1: BASIC INFO */}
              <TabsContent value="basic" className="space-y-4 m-0 focus:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Branch Name (BN) *</label>
                    <Input value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value, branch_name: e.target.value }))} placeholder="উত্তরা শাখা" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Branch Name (EN) *</label>
                    <Input value={form.name_en} onChange={e => {
                      const val = e.target.value;
                      setForm(f => ({
                        ...f,
                        name_en: val,
                        slug: f.slug ? f.slug : generateSlug(val)
                      }));
                    }} placeholder="Uttara Branch" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Branch Name (AR)</label>
                    <Input placeholder="فرع أوتارا" value={form.name_ar || ""} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Branch Slug (Auto Generate / Editable)</label>
                    <Input value={form.slug || ""} onChange={e => setForm(f => ({ ...f, slug: generateSlug(e.target.value) }))} placeholder="uttara-branch" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ImageUpload value={form.logo} onChange={val => setForm(f => ({ ...f, logo: val }))} label="Branch Logo" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Establishment Date / Year</label>
                    <Input value={form.established_year || ""} onChange={e => setForm(f => ({ ...f, established_year: e.target.value, establishment_date: e.target.value }))} placeholder="e.g. 2024" />
                  </div>
                </div>

                {/* Multi-Image Uploader for Slider */}
                <div className="space-y-2 border-t pt-4 dark:border-green-900">
                  <label className="text-xs font-bold text-[#052E2B] dark:text-emerald-400 block uppercase tracking-wider">Branch Slider Images (Multiple)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-3">
                    {form.slider_images?.map((url, idx) => (
                      <div key={idx} className="relative h-24 bg-slate-100 rounded-xl overflow-hidden border group shadow-sm">
                        <img src={url} loading="lazy" alt="Slider" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, slider_images: f.slider_images.filter((_, i) => i !== idx) }))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <label className={`border border-dashed rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors border-primary/20 ${uploadingSlider ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-xs font-bold text-[#12715B] dark:text-emerald-400">
                        {uploadingSlider ? "Uploading..." : "+ Add Images"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleSliderUpload}
                        disabled={uploadingSlider}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 dark:border-green-900">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Address (BN) *</label>
                    <Input value={form.address_bn} onChange={e => setForm(f => ({ ...f, address_bn: e.target.value, address: e.target.value }))} placeholder="উত্তরা, ঢাকা" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Address (EN)</label>
                    <Input value={form.address_en} onChange={e => setForm(f => ({ ...f, address_en: e.target.value }))} placeholder="Uttara, Dhaka" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Address (AR)</label>
                    <Input value={form.address_ar || ""} onChange={e => setForm(f => ({ ...f, address_ar: e.target.value }))} placeholder="أوتارا، دكا" dir="rtl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Contact Number</label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+8801700000000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Email Address</label>
                    <Input type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="uttara@rahmaniya.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Head Teacher</label>
                    <Input value={form.head_teacher} onChange={e => setForm(f => ({ ...f, head_teacher: e.target.value }))} placeholder="e.g. Hafez Rafiqul Islam" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Google Map Link (Short, Full URL, or Embed code)</label>
                    <Input value={form.map_embed_link || ""} onChange={e => setForm(f => ({ ...f, map_embed_link: e.target.value }))} placeholder="https://maps.app.goo.gl/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Sort Order</label>
                    <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
                  </div>
                </div>

                {/* Branch Admin Credentials & Feature Permissions Checklist */}
                <div className="border-t pt-4 dark:border-green-900 space-y-4">
                  <h4 className="text-xs font-extrabold text-[#052E2B] dark:text-emerald-400 uppercase tracking-wider">Branch Admin Login & Permissions</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">Admin Login Username / ID</label>
                      <Input 
                        value={form.admin_username || ""} 
                        onChange={e => setForm(f => ({ ...f, admin_username: e.target.value }))} 
                        placeholder="e.g. uttara_admin" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">Admin Login Password</label>
                      <Input 
                        type="text" 
                        value={form.admin_password || ""} 
                        onChange={e => setForm(f => ({ ...f, admin_password: e.target.value }))} 
                        placeholder="e.g. password123" 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <span>⚙️</span>
                      <span>Permissions configured in the <strong>Permissions</strong> tab above. Branch admin will have access based on selected features.</span>
                    </p>
                  </div>
                </div>

                {/* Boarding Manager Credentials */}
                <div className="border-t pt-4 dark:border-green-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#052E2B] dark:text-emerald-400 uppercase tracking-wider">Boarding Manager (বোর্ডিং ম্যানেজার)</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.boarding_enabled || false} 
                        onChange={e => setForm(f => ({ ...f, boarding_enabled: e.target.checked }))} 
                        className="rounded accent-[#12715B]" 
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Boarding Manager (সক্রিয় করুন)</span>
                    </label>
                  </div>

                  {form.boarding_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-green-900">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground block">Boarding Manager Name *</label>
                        <Input 
                          value={form.boarding_manager_name || ""} 
                          onChange={e => setForm(f => ({ ...f, boarding_manager_name: e.target.value }))} 
                          placeholder="e.g. Abdur Rahman" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground block">Boarding Manager Mobile</label>
                        <Input 
                          value={form.boarding_manager_mobile || ""} 
                          onChange={e => setForm(f => ({ ...f, boarding_manager_mobile: e.target.value }))} 
                          placeholder="e.g. 01700000000" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground block">Boarding Manager Username *</label>
                        <Input 
                          value={form.boarding_manager_username || ""} 
                          onChange={e => setForm(f => ({ ...f, boarding_manager_username: e.target.value }))} 
                          placeholder="e.g. harinal_boarding" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground block">Boarding Manager Password *</label>
                        <Input 
                          type="text" 
                          value={form.boarding_manager_password || ""} 
                          onChange={e => setForm(f => ({ ...f, boarding_manager_password: e.target.value }))} 
                          placeholder="e.g. password123" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded accent-[#12715B]" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active (Show on website)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.content_settings?.show_class_details === "Y"} onChange={e => setForm(f => ({
                      ...f,
                      content_settings: { ...f.content_settings, show_class_details: e.target.checked ? "Y" : "N" }
                    }))} className="rounded accent-[#12715B]" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Class details page/click</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.content_settings?.show_academy_structure !== "N"} onChange={e => setForm(f => ({
                      ...f,
                      content_settings: { ...f.content_settings, show_academy_structure: e.target.checked ? "Y" : "N" }
                    }))} className="rounded accent-[#12715B]" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show Academy Structure</span>
                  </label>
                </div>
              </TabsContent>

              {/* TAB 2: PERMISSIONS */}
              <TabsContent value="permissions" className="space-y-4 m-0 focus:outline-none">
                <div>
                  <h4 className="font-bold text-[#052E2B] dark:text-emerald-400">Granular Permission Control</h4>
                  <p className="text-[11px] text-muted-foreground">Configure what this branch admin can access. Expand each module to control individual actions.</p>
                </div>
                <PermissionManager value={permissionObj} onChange={handlePermissionsChange} />
              </TabsContent>

              {/* TAB 3: BRANCH CONTENT */}
              <TabsContent value="content" className="space-y-6 m-0 focus:outline-none">
                <div>
                  <h4 className="font-bold text-[#052E2B] dark:text-emerald-400">Branch Dynamic Content Sections</h4>
                  <p className="text-[11px] text-muted-foreground">Manage the content fields and control their visibility status on the branch page</p>
                </div>

                <div className="space-y-5">
                  {SECTIONS.map((sec) => (
                    <Card key={sec.key} className="border-primary/5 shadow-none p-3.5 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 mb-3 dark:border-green-900 gap-2">
                        <div>
                          <p className="font-bold text-sm text-[#052E2B] dark:text-emerald-400">{sec.bn}</p>
                          <p className="text-[10px] text-slate-400">{sec.en}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">Show on Branch Page:</span>
                          <select
                            value={form.content_settings?.[sec.key] || "N"}
                            onChange={e => updateContentSetting(sec.key, e.target.value)}
                            className="border rounded px-2.5 py-0.5 text-xs font-bold text-[#12715B] dark:bg-[#0d1f17] dark:border-green-800"
                          >
                            <option value="Y">Show (Y)</option>
                            <option value="N">Hide (N)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 block mb-1">বাংলা (Bangla)</label>
                          <textarea
                            value={form.content_data?.[sec.key]?.bn || ""}
                            onChange={e => updateContentData(sec.key, "bn", e.target.value)}
                            className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B] focus:border-transparent"
                            rows={3}
                            placeholder={`${sec.bn} বাংলা বিবরণ...`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 block mb-1">English</label>
                          <textarea
                            value={form.content_data?.[sec.key]?.en || ""}
                            onChange={e => updateContentData(sec.key, "en", e.target.value)}
                            className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B] focus:border-transparent"
                            rows={3}
                            placeholder={`${sec.en} description in English...`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 block mb-1">العربية (Arabic)</label>
                          <textarea
                            value={form.content_data?.[sec.key]?.ar || ""}
                            onChange={e => updateContentData(sec.key, "ar", e.target.value)}
                            className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B] focus:border-transparent text-right"
                            rows={3}
                            dir="rtl"
                            placeholder="الوصف باللغة العربية..."
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Dynamic Content Builder */}
                  <div className="pt-6 border-t dark:border-green-900">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-[#052E2B] dark:text-emerald-400">Custom Content Builder</h4>
                        <p className="text-[11px] text-muted-foreground">Add custom content sections specific to this branch</p>
                      </div>
                      <Button size="sm" onClick={addCustomContentBlock} className="bg-[#12715B] hover:bg-[#0e5746] text-white text-xs gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Content Block
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {form.custom_content_blocks?.map((block, idx) => (
                        <Card key={block.id || idx} className="border-emerald-100 dark:border-emerald-900/50 p-4 bg-emerald-50/30 dark:bg-emerald-950/20 relative">
                          <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => removeCustomContentBlock(block.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="mb-4 pr-10">
                            <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block mb-2">Block Heading (BN/EN/AR)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input size="sm" value={block.heading?.bn || ""} onChange={e => updateCustomContentBlock(block.id, "heading", "bn", e.target.value)} placeholder="Heading in Bangla" className="text-xs h-8" />
                              <Input size="sm" value={block.heading?.en || ""} onChange={e => updateCustomContentBlock(block.id, "heading", "en", e.target.value)} placeholder="Heading in English" className="text-xs h-8" />
                              <Input size="sm" value={block.heading?.ar || ""} onChange={e => updateCustomContentBlock(block.id, "heading", "ar", e.target.value)} placeholder="العنوان" className="text-xs h-8" dir="rtl" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block mb-2">Block Content (BN/EN/AR)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <textarea
                                value={block.content?.bn || ""}
                                onChange={e => updateCustomContentBlock(block.id, "content", "bn", e.target.value)}
                                className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B]"
                                rows={4}
                                placeholder="Content in Bangla..."
                              />
                              <textarea
                                value={block.content?.en || ""}
                                onChange={e => updateCustomContentBlock(block.id, "content", "en", e.target.value)}
                                className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B]"
                                rows={4}
                                placeholder="Content in English..."
                              />
                              <textarea
                                value={block.content?.ar || ""}
                                onChange={e => updateCustomContentBlock(block.id, "content", "ar", e.target.value)}
                                className="w-full text-xs border rounded-lg p-2 dark:bg-[#0d1f17] dark:border-green-800 outline-none focus:ring-1 focus:ring-[#12715B] text-right"
                                rows={4}
                                dir="rtl"
                                placeholder="المحتوى..."
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      {(!form.custom_content_blocks || form.custom_content_blocks.length === 0) && (
                        <div className="text-center py-6 border-2 border-dashed border-emerald-100 dark:border-emerald-900 rounded-xl text-emerald-600/50 text-xs italic">
                          No custom content blocks added.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>

            <div className="flex gap-2 p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-green-900">
              <Button onClick={handleSave} className="flex-1 bg-[#12715B] hover:bg-[#0e5746] text-white" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Branch settings"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-200 dark:border-green-900 hover:bg-slate-100">
                Cancel
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>


    </div>
  );
}
