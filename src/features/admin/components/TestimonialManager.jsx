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
import { Loader2, Plus, Trash2, Pencil, Star, Quote, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function TestimonialManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    student_name: "",
    student_name_bn: "",
    student_name_en: "",
    student_name_ar: "",
    message: "",
    message_bn: "",
    message_en: "",
    message_ar: "",
    photo_url: "",
    rating: 5,
    is_active: true,
  });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials-admin"],
    queryFn: () => appClient.entities.Testimonial.list("created_at", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: testimonials,
    fields: ["student_name", "student_name_bn", "student_name_en", "student_name_ar", "message", "message_bn", "message_en", "message_ar"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.Testimonial.update(editingItem.id, data);
      } else {
        return appClient.entities.Testimonial.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-public"] });
      toast.success(editingItem ? "Testimonial updated!" : "Testimonial added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save testimonial");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-public"] });
      toast.success("Testimonial deleted successfully!");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Testimonial.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials-admin"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials-public"] });
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      student_name: item.student_name || "",
      student_name_bn: item.student_name_bn || item.student_name || "",
      student_name_en: item.student_name_en || "",
      student_name_ar: item.student_name_ar || "",
      message: item.message || "",
      message_bn: item.message_bn || item.message || "",
      message_en: item.message_en || "",
      message_ar: item.message_ar || "",
      photo_url: item.photo_url || "",
      rating: item.rating || 5,
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
      student_name: "",
      student_name_bn: "",
      student_name_en: "",
      student_name_ar: "",
      message: "",
      message_bn: "",
      message_en: "",
      message_ar: "",
      photo_url: "",
      rating: 5,
      is_active: true,
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete testimonial from "${name}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.student_name_bn.trim() && !formData.student_name_en.trim() && !formData.student_name_ar.trim()) {
      toast.error("At least one Student / Guardian Name is required");
      return;
    }
    if (!formData.message_bn.trim() && !formData.message_en.trim() && !formData.message_ar.trim()) {
      toast.error("At least one Message / Review is required");
      return;
    }
    
    // Sync legacy columns with the primary language values for backwards compatibility
    const fallbackName = formData.student_name_bn || formData.student_name_en || formData.student_name_ar;
    const fallbackMessage = formData.message_bn || formData.message_en || formData.message_ar;

    saveMut.mutate({
      ...formData,
      student_name: fallbackName,
      message: fallbackMessage,
      rating: Number(formData.rating),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Student Testimonials</h2>
          <p className="text-xs text-muted-foreground">Manage reviews and feedback from students and guardians</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by student name or message..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No testimonials found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((item) => (
              <Card key={item.id} className="p-5 border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-50 border flex items-center justify-center flex-shrink-0">
                        {item.photo_url ? (
                          <img src={item.photo_url} loading="lazy" alt={item.student_name_bn || item.student_name} className="h-full w-full object-cover" />
                        ) : (
                          <Quote className="h-5 w-5 text-[#052E2B]/30" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#052E2B] italic">{item.student_name_bn || item.student_name}</h4>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < (item.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {item.is_active === false && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{item.message_bn || item.message}"</p>
                </div>
                <div className="pt-3 border-t border-slate-50 mt-4 flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMut.mutate({ id: item.id, is_active: !item.is_active })} title={item.is_active ? "Hide" : "Show"}>
                    {item.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id, item.student_name_bn || item.student_name)}>
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

      {/* Testimonial Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            
            {/* Student Name Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Student / Guardian Name</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="student_name_bn" className="text-[10px] text-muted-foreground">Bangla *</Label>
                  <Input id="student_name_bn" value={formData.student_name_bn} onChange={e => setFormData(p => ({ ...p, student_name_bn: e.target.value }))} placeholder="উদা: আরফান আহমেদ" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="student_name_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Input id="student_name_en" value={formData.student_name_en} onChange={e => setFormData(p => ({ ...p, student_name_en: e.target.value }))} placeholder="e.g. Arfan Ahmed" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="student_name_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Input id="student_name_ar" value={formData.student_name_ar} onChange={e => setFormData(p => ({ ...p, student_name_ar: e.target.value }))} placeholder="مثال: عرفان أحمد" />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (Stars)</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, rating: i + 1 }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${i < formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages / Reviews */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="message_bn">Message / Review (Bangla) *</Label>
                <Textarea id="message_bn" value={formData.message_bn} onChange={e => setFormData(p => ({ ...p, message_bn: e.target.value }))} rows={3} placeholder="টাইপ করুন..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message_en">Message / Review (English)</Label>
                <Textarea id="message_en" value={formData.message_en} onChange={e => setFormData(p => ({ ...p, message_en: e.target.value }))} rows={3} placeholder="Type the review..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message_ar">Message / Review (Arabic)</Label>
                <Textarea id="message_ar" value={formData.message_ar} onChange={e => setFormData(p => ({ ...p, message_ar: e.target.value }))} rows={3} placeholder="اكتب التقييم..." />
              </div>
            </div>

            <ImageUpload label="Student Photo (Optional)" value={formData.photo_url} onChange={url => setFormData(p => ({ ...p, photo_url: url }))} />

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <Label className="font-semibold text-slate-800">Show on public website</Label>
                <p className="text-[10px] text-muted-foreground">Toggle visibility on the homepage Testimonials section</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Testimonial" : "Add Testimonial"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
