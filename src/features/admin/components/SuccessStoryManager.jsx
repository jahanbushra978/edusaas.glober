import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Pencil, Trophy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function SuccessStoryManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_bn: "",
    title_en: "",
    title_ar: "",
    description: "",
    description_bn: "",
    description_en: "",
    description_ar: "",
    image_url: "",
    is_active: true,
  });

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["success-stories-admin"],
    queryFn: () => appClient.entities.SuccessStory.list("created_at", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: stories,
    fields: ["title", "title_bn", "title_en", "title_ar", "description", "description_bn", "description_en", "description_ar"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.SuccessStory.update(editingItem.id, data);
      } else {
        return appClient.entities.SuccessStory.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["success-stories-public"] });
      toast.success(editingItem ? "Success story updated!" : "Success story added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save success story");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.SuccessStory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["success-stories-public"] });
      toast.success("Success story deleted!");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.SuccessStory.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-stories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["success-stories-public"] });
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      title_bn: item.title_bn || item.title || "",
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      description: item.description || "",
      description_bn: item.description_bn || item.description || "",
      description_en: item.description_en || "",
      description_ar: item.description_ar || "",
      image_url: item.image_url || "",
      is_active: item.is_active !== false,
    });
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
      title_en: "",
      title_ar: "",
      description: "",
      description_bn: "",
      description_en: "",
      description_ar: "",
      image_url: "",
      is_active: true,
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete success story "${title}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title_bn.trim() && !formData.title_en.trim() && !formData.title_ar.trim()) {
      toast.error("At least one Title / Achievement is required");
      return;
    }
    if (!formData.description_bn.trim() && !formData.description_en.trim() && !formData.description_ar.trim()) {
      toast.error("At least one Detailed Description is required");
      return;
    }

    const fallbackTitle = formData.title_bn || formData.title_en || formData.title_ar;
    const fallbackDescription = formData.description_bn || formData.description_en || formData.description_ar;

    saveMut.mutate({
      ...formData,
      title: fallbackTitle,
      description: fallbackDescription,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Success Stories & Achievements</h2>
          <p className="text-xs text-muted-foreground">Manage achievements and highlights of outstanding student successes</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add Success Story
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by title or description..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No success stories found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-48 bg-slate-50 flex items-center justify-center border-b">
                    {item.image_url ? (
                      <img src={item.image_url} loading="lazy" alt={item.title_bn || item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="h-12 w-12 text-[#D4AF37]" />
                    )}
                    {item.is_active === false && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Inactive</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-[#052E2B] line-clamp-2 italic">{item.title_bn || item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{item.description_bn || item.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-slate-50 mt-3 flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMut.mutate({ id: item.id, is_active: !item.is_active })} title={item.is_active ? "Hide" : "Show"}>
                    {item.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id, item.title_bn || item.title)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center pt-4">
              <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} variant="outline" size="sm">Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} variant="outline" size="sm">Next</Button>
            </div>
          )}
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Success Story" : "Add Success Story"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Title / Achievement Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Title / Achievement</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title_bn" className="text-[10px] text-muted-foreground">Bangla *</Label>
                  <Input id="title_bn" value={formData.title_bn} onChange={e => setFormData(p => ({ ...p, title_bn: e.target.value }))} placeholder="উদা: আবদুল্লাহ ১ম স্থান পেয়েছে" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Input id="title_en" value={formData.title_en} onChange={e => setFormData(p => ({ ...p, title_en: e.target.value }))} placeholder="e.g. Abdullah got 1st place" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Input id="title_ar" value={formData.title_ar} onChange={e => setFormData(p => ({ ...p, title_ar: e.target.value }))} placeholder="مثال: حصل عبد الله على المركز الأول" />
                </div>
              </div>
            </div>

            {/* Detailed Description Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="description_bn">Detailed Description (Bangla) *</Label>
                <Textarea id="description_bn" value={formData.description_bn} onChange={e => setFormData(p => ({ ...p, description_bn: e.target.value }))} rows={4} placeholder="বিস্তারিত বিবরণ দিন..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description_en">Detailed Description (English)</Label>
                <Textarea id="description_en" value={formData.description_en} onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))} rows={4} placeholder="Provide detailed description..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description_ar">Detailed Description (Arabic)</Label>
                <Textarea id="description_ar" value={formData.description_ar} onChange={e => setFormData(p => ({ ...p, description_ar: e.target.value }))} rows={4} placeholder="اكتب تفاصيل الإنجاز..." />
              </div>
            </div>

            <ImageUpload label="Banner Image (Optional)" value={formData.image_url} onChange={url => setFormData(p => ({ ...p, image_url: url }))} />

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <Label className="font-semibold text-slate-800">Show on public website</Label>
                <p className="text-[10px] text-muted-foreground">Toggle visibility on the homepage Success Stories section</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Story" : "Add Story"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
