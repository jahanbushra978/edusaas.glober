import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil, Eye, EyeOff, BookOpen, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function CourseManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    fee: "",
    duration: "",
    is_active: true,
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses-admin"],
    queryFn: () => appClient.entities.Course.list("-created_at", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: courses,
    fields: ["name", "description"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.Course.update(editingItem.id, data);
      } else {
        return appClient.entities.Course.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-admin"] });
      queryClient.invalidateQueries({ queryKey: ["courses-public"] });
      toast.success(editingItem ? "Course updated!" : "Course added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save course");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-admin"] });
      queryClient.invalidateQueries({ queryKey: ["courses-public"] });
      toast.success("Course deleted successfully!");
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.Course.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-admin"] });
      queryClient.invalidateQueries({ queryKey: ["courses-public"] });
      toast.success("Status toggled!");
    },
  });

  const handleEdit = (course) => {
    setEditingItem(course);
    setFormData({
      name: course.name || "",
      description: course.description || "",
      image_url: course.image_url || "",
      fee: course.fee !== undefined ? course.fee.toString() : "",
      duration: course.duration || "",
      is_active: course.is_active !== false,
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
      name: "",
      description: "",
      image_url: "",
      fee: "",
      duration: "",
      is_active: true,
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete course "${name}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    saveMut.mutate({
      ...formData,
      fee: formData.fee ? Number(formData.fee) : 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Course Management</h2>
          <p className="text-xs text-muted-foreground">Manage courses/programs that are visible on the website homepage</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by course name or description..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No courses found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-slate-100 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-slate-50 flex items-center justify-center border-b">
                    {item.image_url ? (
                      <img src={item.image_url} loading="lazy" alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-12 w-12 text-[#052E2B]/20" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={item.is_active ? "bg-emerald-100 text-emerald-800 border-0" : "bg-slate-100 text-slate-700 border-0"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-[#052E2B] line-clamp-1 italic">{item.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{item.description}</p>
                    <div className="pt-2 flex flex-col gap-1 border-t border-slate-50">
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>Duration: <strong>{item.duration || "N/A"}</strong></span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Fee: <strong>৳{(item.fee || 0).toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-slate-50 mt-3 flex justify-between gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#052E2B]" onClick={() => toggleStatusMut.mutate({ id: item.id, is_active: !item.is_active })}>
                      {item.is_active ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id, item.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 items-center pt-4">
              <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} variant="outline" size="sm">Previous</Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} variant="outline" size="sm">Next</Button>
            </div>
          )}
        </div>
      )}

      {/* Course Edit/Create Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Noorani (নূরানী বিভাগ)" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 1 Year / 6 Months" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Fee (৳ Taka)</Label>
                <Input id="fee" type="number" value={formData.fee} onChange={e => setFormData(p => ({ ...p, fee: e.target.value }))} placeholder="e.g. 1500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Describe the course curriculum, target audience, etc." />
            </div>

            <ImageUpload label="Course Thumbnail Image" value={formData.image_url} onChange={url => setFormData(p => ({ ...p, image_url: url }))} />

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B]" />
              <Label htmlFor="is_active" className="cursor-pointer font-medium">Publish this course on the homepage</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Course" : "Add Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
