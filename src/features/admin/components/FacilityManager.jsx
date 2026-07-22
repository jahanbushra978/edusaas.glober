import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const EMPTY = { title_en: "", title_bn: "", title_ar: "", description_en: "", description_bn: "", description_ar: "", image_url: "", icon_name: "", is_active: true, sort_order: 0 };

export default function FacilityManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [isUploading, setIsUploading] = useState(false);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ["facilities-admin"],
    queryFn: () => appClient.entities.Facility.list("sort_order", 100),
  });

  const createMut = useMutation({
    mutationFn: (d) => appClient.entities.Facility.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["facilities-admin"] }); queryClient.invalidateQueries({ queryKey: ["facilities-public"] }); toast.success("Facility added!"); setShowForm(false); setForm(EMPTY); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => appClient.entities.Facility.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["facilities-admin"] }); queryClient.invalidateQueries({ queryKey: ["facilities-public"] }); toast.success("Updated!"); setShowForm(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Facility.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["facilities-admin"] }); queryClient.invalidateQueries({ queryKey: ["facilities-public"] }); },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Facility.update(id, { is_active }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["facilities-admin"] }); queryClient.invalidateQueries({ queryKey: ["facilities-public"] }); },
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (f) => { setEditing(f); setForm({ ...f }); setShowForm(true); };

  const handleSave = () => {
    if (!form.title_en.trim()) { toast.error("English title required"); return; }
    if (editing) updateMut.mutate({ id: editing.id, d: form });
    else createMut.mutate(form);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await appClient.integrations.Core.UploadFile({ file, folder: "facilities" });
      setForm(f => ({ ...f, image_url: res.url }));
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary">Facilities Management</h3>
          <p className="text-xs text-muted-foreground">Add and manage institute facilities</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Facility</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : facilities.length === 0 ? (
        <Card className="border-primary/10">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            No facilities added yet. Click "Add Facility" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(f => (
            <Card key={f.id} className="border-primary/10 overflow-hidden">
              {f.image_url && (
                <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                  <img src={f.image_url} loading="lazy" alt={f.title_en} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-slate-800">{f.title_en}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleMut.mutate({ id: f.id, is_active: !f.is_active })} title={f.is_active ? "Hide" : "Show"}>
                      {f.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(f)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (window.confirm("Delete facility?")) deleteMut.mutate(f.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {f.title_bn && <p>{f.title_bn}</p>}
                  {f.title_ar && <p className="text-right" dir="rtl">{f.title_ar}</p>}
                  <p className="line-clamp-2 mt-2">{f.description_en}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${f.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {f.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Order: {f.sort_order}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Facility" : "Add New Facility"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            
            <div className="flex gap-4 items-center">
              {form.image_url ? (
                <img src={form.image_url} loading="lazy" alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                </div>
              )}
              <div className="flex-1">
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Facility Image</label>
                <div className="relative">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="pl-10 h-10" />
                  {isUploading ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" /> : <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Title (English) *</label>
                <Input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} /></div>
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">নাম (বাংলা)</label>
                <Input value={form.title_bn} onChange={e => setForm(f => ({ ...f, title_bn: e.target.value }))} /></div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">الاسم (Arabic)</label>
              <Input value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} dir="rtl" />
            </div>
            <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Description (EN)</label>
                <Textarea value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} rows={2} /></div>
            <div><label className="text-xs font-bold text-muted-foreground mb-1 block">বিবরণ (বাংলা)</label>
                <Textarea value={form.description_bn} onChange={e => setForm(f => ({ ...f, description_bn: e.target.value }))} rows={2} /></div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">الوصف (Arabic)</label>
              <Textarea value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} dir="rtl" rows={2} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Icon Name (lucide)</label>
                <Input value={form.icon_name} onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))} placeholder="e.g. Building2" /></div>
              <div><label className="text-xs font-bold text-muted-foreground mb-1 block">Sort Order</label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} /></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
              <span className="text-sm">Active (show on website)</span>
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1" disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Facility"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
