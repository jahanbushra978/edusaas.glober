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
import { Loader2, Plus, Trash2, Pencil, Calendar, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ImageUpload from "./ImageUpload";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function EventManager() {
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
    event_date: "",
    event_time: "",
    location: "",
    organizer: "",
    registration_link: "",
    banner_url: "",
    is_active: true,
    is_featured: false,
    event_gallery: [],
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-admin"],
    queryFn: () => appClient.entities.Event.list("event_date", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: events,
    fields: ["title", "title_bn", "title_en", "title_ar", "description", "description_bn", "description_en", "description_ar"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.Event.update(editingItem.id, data);
      } else {
        return appClient.entities.Event.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-admin"] });
      queryClient.invalidateQueries({ queryKey: ["events-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success(editingItem ? "Event updated!" : "Event added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save event");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-admin"] });
      queryClient.invalidateQueries({ queryKey: ["events-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Event deleted!");
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Event.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-admin"] });
      queryClient.invalidateQueries({ queryKey: ["events-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    
    // Format date string for datetime-local input
    let formattedDate = "";
    if (item.event_date) {
      try {
        formattedDate = format(new Date(item.event_date), "yyyy-MM-dd'T'HH:mm");
      } catch (e) {
        console.error(e);
      }
    }

    setFormData({
      title: item.title || "",
      title_bn: item.title_bn || item.title || "",
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      description: item.description || "",
      description_bn: item.description_bn || item.description || "",
      description_en: item.description_en || "",
      description_ar: item.description_ar || "",
      event_date: formattedDate,
      event_time: item.event_time || "",
      location: item.location || "",
      organizer: item.organizer || "",
      registration_link: item.registration_link || "",
      banner_url: item.banner_url || "",
      is_active: item.is_active !== false,
      is_featured: item.is_featured === true,
      event_gallery: Array.isArray(item.event_gallery) ? item.event_gallery : [],
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
      event_date: "",
      event_time: "",
      location: "",
      organizer: "",
      registration_link: "",
      banner_url: "",
      is_active: true,
      is_featured: false,
      event_gallery: [],
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete event "${title}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title_bn.trim() && !formData.title_en.trim() && !formData.title_ar.trim()) {
      toast.error("At least one Event Title is required");
      return;
    }
    if (!formData.event_date) {
      toast.error("Event Date is required");
      return;
    }
    
    // Ensure standard ISO timestamp for Supabase
    const dateObj = new Date(formData.event_date);
    
    const fallbackTitle = formData.title_bn || formData.title_en || formData.title_ar;
    const fallbackDescription = formData.description_bn || formData.description_en || formData.description_ar;

    saveMut.mutate({
      ...formData,
      title: fallbackTitle,
      description: fallbackDescription,
      event_date: dateObj.toISOString(),
    });
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM dd, yyyy - hh:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Event Management</h2>
          <p className="text-xs text-muted-foreground">Schedule and publish school events, exams, and milestones</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by event title or details..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No events scheduled</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-slate-50 flex items-center justify-center border-b">
                    {item.banner_url ? (
                      <img src={item.banner_url} loading="lazy" alt={item.title_bn || item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="h-12 w-12 text-[#D4AF37]" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.is_featured && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Featured</span>
                      )}
                      {item.is_active === false && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-[#052E2B] line-clamp-1 italic">{item.title_bn || item.title}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                      {formatDateString(item.event_date)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.location && (
                        <span className="text-[9px] text-slate-500 bg-slate-50 border px-2 py-0.5 rounded">Loc: {item.location}</span>
                      )}
                      {item.organizer && (
                        <span className="text-[9px] text-slate-500 bg-slate-50 border px-2 py-0.5 rounded">Org: {item.organizer}</span>
                      )}
                      {item.registration_link && (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-semibold">Has Reg Link</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mt-2">{item.description_bn || item.description}</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Event Title Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Event Title</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title_bn" className="text-[10px] text-muted-foreground">Bangla *</Label>
                  <Input id="title_bn" value={formData.title_bn} onChange={e => setFormData(p => ({ ...p, title_bn: e.target.value }))} placeholder="উদা: বার্ষিক ক্রীড়া প্রতিযোগিতা" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Input id="title_en" value={formData.title_en} onChange={e => setFormData(p => ({ ...p, title_en: e.target.value }))} placeholder="e.g. Annual Sports" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Input id="title_ar" value={formData.title_ar} onChange={e => setFormData(p => ({ ...p, title_ar: e.target.value }))} placeholder="مثال: المسابقة الرياضية السنوية" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="event_date">Event Date & Time *</Label>
                <Input id="event_date" type="datetime-local" value={formData.event_date} onChange={e => setFormData(p => ({ ...p, event_date: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="event_time">Schedule Time (Optional override)</Label>
                <Input id="event_time" value={formData.event_time} onChange={e => setFormData(p => ({ ...p, event_time: e.target.value }))} placeholder="e.g. 10:00 AM - 02:00 PM" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Madrasah Hall Room" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="organizer">Organizer</Label>
                <Input id="organizer" value={formData.organizer} onChange={e => setFormData(p => ({ ...p, organizer: e.target.value }))} placeholder="e.g. Authority" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="registration_link">Registration Link</Label>
                <Input id="registration_link" value={formData.registration_link} onChange={e => setFormData(p => ({ ...p, registration_link: e.target.value }))} placeholder="e.g. https://forms.gle/..." />
              </div>
            </div>

            {/* Event Details Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="description_bn">Event Details (Bangla) *</Label>
                <Textarea id="description_bn" value={formData.description_bn} onChange={e => setFormData(p => ({ ...p, description_bn: e.target.value }))} rows={4} placeholder="বিস্তারিত বিবরণ..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description_en">Event Details (English)</Label>
                <Textarea id="description_en" value={formData.description_en} onChange={e => setFormData(p => ({ ...p, description_en: e.target.value }))} rows={4} placeholder="Event details in English..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description_ar">Event Details (Arabic)</Label>
                <Textarea id="description_ar" value={formData.description_ar} onChange={e => setFormData(p => ({ ...p, description_ar: e.target.value }))} rows={4} placeholder="تفاصيل الفعالية..." />
              </div>
            </div>

            <ImageUpload label="Event Banner Image" value={formData.banner_url} onChange={url => setFormData(p => ({ ...p, banner_url: url }))} />

            {/* Event Gallery Upload */}
            <div className="space-y-2 border p-3 rounded-xl bg-slate-50/50">
              <Label className="font-bold text-[#052E2B] text-xs uppercase">Event Photo Gallery (Multiple Images)</Label>
              <div className="flex gap-2">
                <Input id="new_gallery_url" placeholder="Paste image URL here..." />
                <Button 
                  type="button" 
                  onClick={() => {
                    const input = document.getElementById("new_gallery_url");
                    if (input && input.value.trim()) {
                      setFormData(p => ({ ...p, event_gallery: [...(p.event_gallery || []), input.value.trim()] }));
                      input.value = "";
                    }
                  }} 
                  className="bg-emerald-800 text-white text-xs hover:bg-emerald-900"
                >
                  Add URL
                </Button>
              </div>
              {formData.event_gallery && formData.event_gallery.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {formData.event_gallery.map((url, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded-lg bg-white text-xs text-slate-600">
                      <span className="truncate max-w-[150px]">{url}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500 hover:text-red-700" 
                        onClick={() => setFormData(p => ({ ...p, event_gallery: p.event_gallery.filter((_, idx) => idx !== i) }))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active and Featured Toggles */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-800">Show on public website</Label>
                  <p className="text-[10px] text-muted-foreground">Toggle visibility on the homepage Events section</p>
                </div>
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData(p => ({ ...p, is_active: v }))} />
              </div>
              <div className="flex items-center justify-between border-t pt-2 mt-1">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-[#052E2B] font-bold text-amber-800">Feature this event</Label>
                  <p className="text-[10px] text-muted-foreground">Mark this event as featured to stand out on the homepage</p>
                </div>
                <Switch checked={formData.is_featured} onCheckedChange={(v) => setFormData(p => ({ ...p, is_featured: v }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Event" : "Add Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
