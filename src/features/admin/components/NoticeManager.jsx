import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Image, X, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENT_SELECTION_OPTIONS } from "@/lib/departmentData";

function NoticeForm({ notice, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: notice?.title || "",
    title_bn: notice?.title_bn || "",
    title_en: notice?.title_en || "",
    title_ar: notice?.title_ar || "",
    body: notice?.body || "",
    body_bn: notice?.body_bn || "",
    body_en: notice?.body_en || "",
    body_ar: notice?.body_ar || "",
    notice_number: notice?.notice_number || "",
    publish_date: notice?.publish_date || "",
    type: notice?.type || "notice",
    department: notice?.department || "সকল",
    priority: notice?.priority || "normal",
    status: notice?.status || "published",
    badge_color: notice?.badge_color || "#2563eb",
    is_active: notice?.is_active ?? true,
    show_on_homepage: notice?.show_on_homepage ?? true,
    show_as_popup: notice?.show_as_popup ?? false,
    show_on_notice_page: notice?.show_on_notice_page ?? true,
    is_featured: notice?.is_featured ?? false,
    pin_to_top: notice?.pin_to_top ?? false,
    notify_students: notice?.notify_students ?? false,
    notify_teachers: notice?.notify_teachers ?? false,
    notify_guardians: notice?.notify_guardians ?? false,
    sort_order: notice?.sort_order || 0,
    image: notice?.image || "",
    attachment_url: notice?.attachment_url || "",
    attachment_name: notice?.attachment_name || "",
    category: notice?.category || "General",
  });
  
  const categoriesList = ["General", "Academic", "Admission", "Examination", "Holiday"];
  const isCustomCategory = notice?.category && !categoriesList.includes(notice?.category);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(
    isCustomCategory ? "Custom" : (notice?.category || "General")
  );
  const [customCategoryText, setCustomCategoryText] = useState(
    isCustomCategory ? notice.category : ""
  );
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(notice?.image || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [activeLang, setActiveLang] = useState("bn");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const firstFilled = (...values) => values.find((value) => value?.trim()) || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fallbackTitle = firstFilled(form.title_bn, form.title_en, form.title_ar, form.title);
    const fallbackBody = firstFilled(form.body_bn, form.body_en, form.body_ar, form.body);
    if (!fallbackTitle && !fallbackBody) {
      toast.error("Add notice content in at least one language");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, title: fallbackTitle, body: fallbackBody });
    } catch (error) {
      const msg = error?.message || error?.error?.message || JSON.stringify(error) || "Failed to save notice";
      toast.error(msg);
      console.error("Notice save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    
    try {
      const { file_url } = await appClient.integrations.Core.UploadFile({ file });
      setImagePreview(file_url);
      f("image", file_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    f("image", "");
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PDF or DOCX attachment");
      return;
    }
    setUploadingAttachment(true);
    try {
      const { file_url } = await appClient.integrations.Core.UploadFile({ file });
      f("attachment_url", file_url);
      f("attachment_name", file.name);
      toast.success("Attachment uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload attachment");
      console.error("Attachment upload error:", error);
    } finally {
      setUploadingAttachment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { key: "bn", label: "বাংলা" },
            { key: "en", label: "English" },
            { key: "ar", label: "العربية" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveLang(item.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${activeLang === item.key ? "bg-primary text-white shadow-md" : "border border-primary/15 bg-white text-primary"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeLang === "bn" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">Notice Title (বাংলা)</label>
              <Input placeholder="বাংলায় নোটিশ শিরোনাম" value={form.title_bn} onChange={e => f("title_bn", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">Notice Details (বাংলা)</label>
              <Textarea placeholder="বাংলায় নোটিশ বিস্তারিত" value={form.body_bn} onChange={e => f("body_bn", e.target.value)} rows={4} />
            </div>
          </div>
        )}

        {activeLang === "en" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">Notice Title (English)</label>
              <Input placeholder="Enter notice title" value={form.title_en} onChange={e => f("title_en", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">Notice Details (English)</label>
              <Textarea placeholder="Enter notice details" value={form.body_en} onChange={e => f("body_en", e.target.value)} rows={4} />
            </div>
          </div>
        )}

        {activeLang === "ar" && (
          <div className="space-y-3" dir="rtl">
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">عنوان الإشعار (العربية)</label>
              <Input className="text-right" placeholder="اكتب عنوان الإشعار" value={form.title_ar} onChange={e => f("title_ar", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-primary mb-1 block">تفاصيل الإشعار (العربية)</label>
              <Textarea className="text-right" placeholder="اكتب تفاصيل الإشعار" value={form.body_ar} onChange={e => f("body_ar", e.target.value)} rows={4} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Notice Number</label>
          <Input placeholder="e.g. RI-2026-01" value={form.notice_number} onChange={e => f("notice_number", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Publish Date</label>
          <Input type="date" value={form.publish_date} onChange={e => f("publish_date", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Type</label>
          <Select value={form.type} onValueChange={v => f("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="notice">📢 Notice</SelectItem>
              <SelectItem value="info">ℹ️ Info</SelectItem>
              <SelectItem value="warning">⚠️ Warning</SelectItem>
              <SelectItem value="event">🎉 Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Department</label>
          <Select value={form.department} onValueChange={v => f("department", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEPARTMENT_SELECTION_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Priority</label>
          <Select value={form.priority} onValueChange={v => f("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Status</label>
          <Select value={form.status} onValueChange={v => f("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Notice Badge/Color</label>
          <Input type="color" value={form.badge_color} onChange={e => f("badge_color", e.target.value)} className="h-10" />
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Sort Order</label>
          <Input type="number" value={form.sort_order} onChange={e => f("sort_order", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Category</label>
          <Select value={selectedCategoryOption} onValueChange={v => {
            setSelectedCategoryOption(v);
            if (v !== "Custom") {
              f("category", v);
            } else {
              f("category", customCategoryText || "");
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Admission">Admission</SelectItem>
              <SelectItem value="Examination">Examination</SelectItem>
              <SelectItem value="Holiday">Holiday</SelectItem>
              <SelectItem value="Custom">Custom (Write Below)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Show on Website</label>
          <Select value={form.is_active ? "Y" : "N"} onValueChange={v => f("is_active", v === "Y")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">Y (Show)</SelectItem>
              <SelectItem value="N">N (Hide)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedCategoryOption === "Custom" && (
          <div>
            <label className="text-xs font-bold text-primary mb-1 block">Custom Category Name</label>
            <Input 
              placeholder="e.g. Special Event" 
              value={customCategoryText} 
              onChange={e => {
                setCustomCategoryText(e.target.value);
                f("category", e.target.value);
              }} 
            />
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="text-xs font-bold text-primary mb-1 block">Notice Image (Optional)</label>
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative group">
              <img 
                src={imagePreview} loading="lazy" 
                alt="Notice preview" 
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </label>
            </div>
          )}
          {uploading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-primary mb-1 block">Attachment Upload (PDF/DOCX)</label>
        {form.attachment_url ? (
          <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-slate-50 p-3">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate">{form.attachment_name || "Uploaded attachment"}</span>
            </div>
            <button type="button" onClick={() => { f("attachment_url", ""); f("attachment_name", ""); }} className="text-xs font-bold text-red-500">
              Remove
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 text-center transition-all hover:border-primary/40">
            <Upload className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span className="text-sm font-bold text-primary">{uploadingAttachment ? "Uploading..." : "Upload PDF/DOCX"}</span>
            <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleAttachmentUpload} disabled={uploadingAttachment} className="hidden" />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-primary/10 bg-slate-50 p-3 sm:grid-cols-2">
        {[
          ["show_on_homepage", "Homepage-এ দেখাও"],
          ["show_as_popup", "Popup হিসেবে দেখাও"],
          ["show_on_notice_page", "Notice Page-এ দেখাও"],
          ["is_featured", "Featured Notice"],
          ["pin_to_top", "Pin to Top (উপরে পিন করুন)"],
          ["notify_students", "Notify Students"],
          ["notify_teachers", "Notify Teachers"],
          ["notify_guardians", "Notify Guardians"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
            <input type="checkbox" checked={!!form[key]} onChange={e => f(key, e.target.checked)} className="rounded border-primary/30 text-primary" />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {notice ? "Update" : "Add Notice"}
        </Button>
      </div>
    </form>
  );
}

const typeStyle = {
  notice: { bg: "bg-blue-100 text-blue-800", icon: "📢" },
  info: { bg: "bg-green-100 text-green-800", icon: "ℹ️" },
  warning: { bg: "bg-orange-100 text-orange-800", icon: "⚠️" },
  event: { bg: "bg-purple-100 text-purple-800", icon: "🎉" },
};

export default function NoticeManager({ currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const queryClient = useQueryClient();

  const { data: rawNotices = [], isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: () => appClient.entities.Notice.list("-created_date", 100),
    select: (data) => [...data].sort((a, b) => Number(b.pin_to_top || 0) - Number(a.pin_to_top || 0)),
  });

  const notices = currentUser?.role === "branch_admin"
    ? rawNotices.filter((n) => String(n.branch_id) === String(currentUser.branch_id))
    : rawNotices;

  const createMut = useMutation({
    mutationFn: d => appClient.entities.Notice.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); setShowForm(false); toast.success("Notice added!"); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.Notice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); setShowForm(false); setEditNotice(null); toast.success("Updated!"); },
  });
  const deleteMut = useMutation({
    mutationFn: id => appClient.entities.Notice.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notices"] }); toast.success("Deleted!"); },
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Notice.update(id, { is_active, is_published: is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notices"] }),
  });

  const handleSave = async (data) => {
    const enrichedData = {
      ...data,
      description: data.body || "",
      file_url: data.attachment_url || "",
      is_published: data.is_active ?? true,
    };
    if (currentUser?.role === "branch_admin") {
      enrichedData.branch_id = Number(currentUser.branch_id);
    }
    if (editNotice) await updateMut.mutateAsync({ id: editNotice.id, data: enrichedData });
    else await createMut.mutateAsync(enrichedData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Notice & Announcement Management</h2>
          <p className="text-sm text-muted-foreground">Control what appears on the homepage notice board</p>
        </div>
        <Button onClick={() => { setEditNotice(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Notice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : notices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No notices yet. Add your first notice.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notices.map(n => {
            const t = typeStyle[n.type] || typeStyle.notice;
            return (
              <Card key={n.id} className={`border-primary/10 ${!n.is_active ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Notice Image */}
                    {n.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={n.image} loading="lazy" 
                          alt={n.title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{t.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-primary">{n.title}</p>
                            <Badge className={`text-xs ${t.bg}`}>{n.type}</Badge>
                            <Badge variant="outline" className="text-xs">{n.department || "সকল"}</Badge>
                            {n.notice_number && <Badge variant="outline" className="text-xs">{n.notice_number}</Badge>}
                            {n.priority && <Badge variant="outline" className="text-xs">{n.priority}</Badge>}
                            {n.category && <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs border-purple-200">{n.category}</Badge>}
                            {n.pin_to_top && <Badge className="bg-amber-100 text-amber-800 text-xs">Pinned</Badge>}
                            {n.is_featured && <Badge className="bg-emerald-100 text-emerald-800 text-xs">Featured</Badge>}
                            {!n.is_active && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                          </div>
                          {n.body && <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title={n.is_active ? "Hide" : "Show"}
                            onClick={() => toggleMut.mutate({ id: n.id, is_active: !n.is_active })}>
                            {n.is_active ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditNotice(n); setShowForm(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.confirm("Delete this notice?") && deleteMut.mutate(n.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editNotice ? "Edit Notice" : "Add New Notice"}</DialogTitle>
          </DialogHeader>
          <NoticeForm notice={editNotice} onSave={handleSave} onCancel={() => { setShowForm(false); setEditNotice(null); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
