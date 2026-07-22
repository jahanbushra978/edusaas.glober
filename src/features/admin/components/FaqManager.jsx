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
import { Loader2, Plus, Trash2, Pencil, HelpCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function FaqManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    question_bn: "",
    question_en: "",
    question_ar: "",
    answer: "",
    answer_bn: "",
    answer_en: "",
    answer_ar: "",
    sort_order: 0,
    is_active: true,
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs-admin"],
    queryFn: () => appClient.entities.Faq.list("sort_order", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: faqs,
    fields: ["question", "question_bn", "question_en", "question_ar", "answer", "answer_bn", "answer_en", "answer_ar"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.Faq.update(editingItem.id, data);
      } else {
        return appClient.entities.Faq.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs-public"] });
      toast.success(editingItem ? "FAQ updated!" : "FAQ added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save FAQ");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Faq.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs-public"] });
      toast.success("FAQ deleted!");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Faq.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["faqs-public"] });
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      question: item.question || "",
      question_bn: item.question_bn || item.question || "",
      question_en: item.question_en || "",
      question_ar: item.question_ar || "",
      answer: item.answer || "",
      answer_bn: item.answer_bn || item.answer || "",
      answer_en: item.answer_en || "",
      answer_ar: item.answer_ar || "",
      sort_order: item.sort_order !== undefined ? item.sort_order : 0,
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
      question: "",
      question_bn: "",
      question_en: "",
      question_ar: "",
      answer: "",
      answer_bn: "",
      answer_en: "",
      answer_ar: "",
      sort_order: 0,
      is_active: true,
    });
  };

  const handleDelete = (id, question) => {
    if (window.confirm(`Delete FAQ: "${question.substring(0, 50)}..."?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question_bn.trim() && !formData.question_en.trim() && !formData.question_ar.trim()) {
      toast.error("At least one Question is required");
      return;
    }
    if (!formData.answer_bn.trim() && !formData.answer_en.trim() && !formData.answer_ar.trim()) {
      toast.error("At least one Answer is required");
      return;
    }

    const fallbackQuestion = formData.question_bn || formData.question_en || formData.question_ar;
    const fallbackAnswer = formData.answer_bn || formData.answer_en || formData.answer_ar;

    saveMut.mutate({
      ...formData,
      question: fallbackQuestion,
      answer: fallbackAnswer,
      sort_order: Number(formData.sort_order) || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Frequently Asked Questions (FAQ)</h2>
          <p className="text-xs text-muted-foreground">Manage helpful questions and answers for prospective students and parents</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by question or answer..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No FAQs found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {paginated.map((item) => (
              <Card key={item.id} className="border border-slate-100 hover:shadow-sm transition-all p-4 flex items-start gap-4 justify-between">
                <div className="flex gap-3">
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-[#052E2B]/5 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-[#052E2B]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-sm text-[#052E2B] italic">
                      {item.question_bn || item.question}
                      <span className="ml-2 text-[10px] text-slate-400 font-mono">Order: {item.sort_order}</span>
                      {item.is_active === false && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Inactive</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.answer_bn || item.answer}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMut.mutate({ id: item.id, is_active: !item.is_active })} title={item.is_active ? "Hide" : "Show"}>
                    {item.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id, item.question_bn || item.question)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* FAQ Question Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Question</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="question_bn" className="text-[10px] text-muted-foreground">Bangla *</Label>
                  <Input id="question_bn" value={formData.question_bn} onChange={e => setFormData(p => ({ ...p, question_bn: e.target.value }))} placeholder="উদা: ভর্তি ফি কত?" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="question_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Input id="question_en" value={formData.question_en} onChange={e => setFormData(p => ({ ...p, question_en: e.target.value }))} placeholder="e.g. What is the fee?" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="question_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Input id="question_ar" value={formData.question_ar} onChange={e => setFormData(p => ({ ...p, question_ar: e.target.value }))} placeholder="مثال: ما هي الرسوم؟" />
                </div>
              </div>
            </div>

            {/* FAQ Answer Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="answer_bn">Answer (Bangla) *</Label>
                <Textarea id="answer_bn" value={formData.answer_bn} onChange={e => setFormData(p => ({ ...p, answer_bn: e.target.value }))} rows={4} placeholder="উত্তর লিখুন..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="answer_en">Answer (English)</Label>
                <Textarea id="answer_en" value={formData.answer_en} onChange={e => setFormData(p => ({ ...p, answer_en: e.target.value }))} rows={4} placeholder="Write answer in English..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="answer_ar">Answer (Arabic)</Label>
                <Textarea id="answer_ar" value={formData.answer_ar} onChange={e => setFormData(p => ({ ...p, answer_ar: e.target.value }))} rows={4} placeholder="اكتب الإجابة بالعربية..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order (Lower numbers show first)</Label>
              <Input id="sort_order" type="number" value={formData.sort_order} onChange={e => setFormData(p => ({ ...p, sort_order: e.target.value }))} placeholder="e.g. 0, 1, 2" />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <Label className="font-semibold text-slate-800">Show on public website</Label>
                <p className="text-[10px] text-muted-foreground">Toggle visibility on the homepage FAQ section</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update FAQ" : "Add FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
