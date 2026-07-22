import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function HeroSlideManager() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_bn: "",
    title_ar: "",
    subtitle: "",
    subtitle_bn: "",
    subtitle_ar: "",
    caption_bn: "",
    caption_ar: "",
    button_text: "",
    button_link: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });
  const [activeLang, setActiveLang] = useState("bn");

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["hero-slides-admin"],
    queryFn: () => appClient.entities.HeroSlide.list("sort_order", 100),
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.HeroSlide.update(editingItem.id, data);
      } else {
        return appClient.entities.HeroSlide.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides-admin"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast.success(editingItem ? "Slide updated!" : "Slide added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save slide");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.HeroSlide.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides-admin"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast.success("Slide deleted!");
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.HeroSlide.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides-admin"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || item.caption_en || "",
      title_bn: item.title_bn || "",
      title_ar: item.title_ar || "",
      subtitle: item.subtitle || item.caption_bn || "",
      subtitle_bn: item.subtitle_bn || "",
      subtitle_ar: item.subtitle_ar || "",
      caption_bn: item.caption_bn || "",
      caption_ar: item.caption_ar || "",
      button_text: item.button_text || "",
      button_link: item.button_link || "",
      image_url: item.image_url || "",
      is_active: item.is_active !== false,
      sort_order: item.sort_order || 0,
    });
    setActiveLang("bn");
    setIsOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    resetForm();
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_bn: "",
      title_ar: "",
      subtitle: "",
      subtitle_bn: "",
      subtitle_ar: "",
      caption_bn: "",
      caption_ar: "",
      button_text: "",
      button_link: "",
      image_url: "",
      is_active: true,
      sort_order: slides.length,
    });
    setActiveLang("bn");
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this slide?")) {
      deleteMut.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Please upload or provide a slide image");
      return;
    }
    saveMut.mutate({
      ...formData,
      sort_order: Number(formData.sort_order) || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Hero Slider Management</h2>
          <p className="text-xs text-muted-foreground">Manage the homepage hero banner slides (supports custom captions and buttons)</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add Slide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 text-slate-500 italic text-sm border-2 border-dashed rounded-xl">
          No custom slides yet. Add a slide above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`rounded-xl overflow-hidden border transition-all ${slide.is_active ? "border-primary/20" : "border-slate-200 opacity-60"}`}>
              <div className="relative h-44">
                <img src={slide.image_url} loading="lazy" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052E2B]/90 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold italic">{slide.title_bn || slide.title || "No Title"}</p>
                  <p className="text-[10px] text-white/75 mt-0.5">{slide.subtitle_bn || slide.subtitle || "No Subtitle"}</p>
                  {slide.button_text && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[9px] bg-[#D4AF37] text-[#052E2B] font-bold rounded">
                      {slide.button_text}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 flex items-center justify-between bg-white border-t">
                <span className="text-xs text-muted-foreground">Order: {slide.sort_order}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleStatusMut.mutate({ id: slide.id, is_active: !slide.is_active })} title={slide.is_active ? "Hide slide" : "Show slide"}>
                    {slide.is_active ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600" onClick={() => handleEdit(slide)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Slide" : "Add Slide"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <div className="mb-3 flex gap-2">
                {[{ key: "bn", label: "বাংলা" }, { key: "en", label: "English" }, { key: "ar", label: "العربية" }].map(lang => (
                  <button key={lang.key} type="button" onClick={() => setActiveLang(lang.key)} className={`rounded-full px-4 py-1 text-xs font-bold ${activeLang === lang.key ? "bg-[#052E2B] text-white" : "border border-[#052E2B]/20 text-[#052E2B] bg-white"}`}>
                    {lang.label}
                  </button>
                ))}
              </div>
              {activeLang === "bn" && (
                <div className="space-y-3">
                  <div><Label>Slide Title (বাংলা)</Label><Input value={formData.title_bn} onChange={e => setFormData(p => ({ ...p, title_bn: e.target.value }))} placeholder="শিরোনাম" /></div>
                  <div><Label>Slide Subtitle (বাংলা)</Label><Input value={formData.subtitle_bn} onChange={e => setFormData(p => ({ ...p, subtitle_bn: e.target.value }))} placeholder="সাবটাইটেল" /></div>
                </div>
              )}
              {activeLang === "en" && (
                <div className="space-y-3">
                  <div><Label>Slide Title (English)</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Title" /></div>
                  <div><Label>Slide Subtitle (English)</Label><Input value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} placeholder="Subtitle" /></div>
                </div>
              )}
              {activeLang === "ar" && (
                <div className="space-y-3" dir="rtl">
                  <div><Label>عنوان الشريحة (العربية)</Label><Input value={formData.title_ar} onChange={e => setFormData(p => ({ ...p, title_ar: e.target.value }))} className="text-right" /></div>
                  <div><Label>عنوان فرعي (العربية)</Label><Input value={formData.subtitle_ar} onChange={e => setFormData(p => ({ ...p, subtitle_ar: e.target.value }))} className="text-right" /></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Button Label</Label>
                <Input id="button_text" value={formData.button_text} onChange={e => setFormData(p => ({ ...p, button_text: e.target.value }))} placeholder="e.g. Enroll Now" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_link">Button Link (URL)</Label>
                <Input id="button_link" value={formData.button_link} onChange={e => setFormData(p => ({ ...p, button_link: e.target.value }))} placeholder="e.g. /admission-choice" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" value={formData.sort_order} onChange={e => setFormData(p => ({ ...p, sort_order: e.target.value }))} />
            </div>

            <ImageUpload label="Slide Image" value={formData.image_url} onChange={url => setFormData(p => ({ ...p, image_url: url }))} />

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B]" />
              <Label htmlFor="is_active" className="cursor-pointer font-medium">Active slide (visible in slider)</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}