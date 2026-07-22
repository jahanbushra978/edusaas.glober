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
import { Loader2, Plus, Trash2, Pencil, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function BlogManager() {
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
    slug: "",
    content: "",
    content_bn: "",
    content_en: "",
    content_ar: "",
    excerpt_bn: "",
    excerpt_en: "",
    excerpt_ar: "",
    author: "",
    reading_time: "",
    featured_image: "",
    is_published: true,
    is_featured: false,
  });

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs-admin"],
    queryFn: () => appClient.entities.Blog.list("created_at", 1000),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: blogs,
    fields: ["title", "title_bn", "title_en", "title_ar", "content", "content_bn", "content_en", "content_ar"],
  });

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return appClient.entities.Blog.update(editingItem.id, data);
      } else {
        return appClient.entities.Blog.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success(editingItem ? "Blog post updated!" : "Blog post added!");
      setIsOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save blog post");
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Blog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Blog post deleted!");
    },
  });

  const togglePublishMut = useMutation({
    mutationFn: ({ id, is_published }) => appClient.entities.Blog.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
      queryClient.invalidateQueries({ queryKey: ["blogs-public"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      fetch("/api/public/home", { method: "POST" }).catch(() => {});
      toast.success("Publish status updated!");
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      title_bn: item.title_bn || item.title || "",
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      slug: item.slug || "",
      content: item.content || "",
      content_bn: item.content_bn || item.content || "",
      content_en: item.content_en || "",
      content_ar: item.content_ar || "",
      excerpt_bn: item.excerpt_bn || "",
      excerpt_en: item.excerpt_en || "",
      excerpt_ar: item.excerpt_ar || "",
      author: item.author || "",
      reading_time: item.reading_time || "",
      featured_image: item.featured_image || "",
      is_published: item.is_published !== false,
      is_featured: item.is_featured === true,
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
      slug: "",
      content: "",
      content_bn: "",
      content_en: "",
      content_ar: "",
      excerpt_bn: "",
      excerpt_en: "",
      excerpt_ar: "",
      author: "",
      reading_time: "",
      featured_image: "",
      is_published: true,
      is_featured: false,
    });
  };

  const generateSlug = (titleText) => {
    return titleText
      .trim()
      .toLowerCase()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleBnChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const slugBase = prev.title_en.trim() || val.trim();
      const oldSlugBase = prev.title_en.trim() || prev.title_bn.trim();
      const isAutoSlug = prev.slug === generateSlug(oldSlugBase) || !prev.slug;
      return {
        ...prev,
        title_bn: val,
        slug: isAutoSlug ? generateSlug(slugBase) : prev.slug,
      };
    });
  };

  const handleTitleEnChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const slugBase = val.trim() || prev.title_bn.trim();
      const oldSlugBase = prev.title_en.trim() || prev.title_bn.trim();
      const isAutoSlug = prev.slug === generateSlug(oldSlugBase) || !prev.slug;
      return {
        ...prev,
        title_en: val,
        slug: isAutoSlug ? generateSlug(slugBase) : prev.slug,
      };
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete blog post "${title}"?`)) {
      deleteMut.mutate(id);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginated = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title_bn.trim() && !formData.title_en.trim() && !formData.title_ar.trim()) {
      toast.error("At least one Post Title is required");
      return;
    }
    if (!formData.content_bn.trim() && !formData.content_en.trim() && !formData.content_ar.trim()) {
      toast.error("At least one Article Content is required");
      return;
    }
    
    const fallbackTitle = formData.title_bn || formData.title_en || formData.title_ar;
    const fallbackContent = formData.content_bn || formData.content_en || formData.content_ar;
    const finalSlug = formData.slug.trim() || generateSlug(fallbackTitle);

    saveMut.mutate({
      ...formData,
      title: fallbackTitle,
      content: fallbackContent,
      slug: finalSlug,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#052E2B]">Blog Posts</h2>
          <p className="text-xs text-muted-foreground">Write and publish articles, news, and features for the website</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/90 rounded-xl gap-2 font-bold italic text-xs shadow-md shadow-[#052E2B]/10">
          <Plus className="h-4 w-4" /> Write Post
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by title or text..."
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200"><CardContent className="py-12 text-center text-slate-500 italic text-sm">No blog posts found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-44 bg-slate-50 flex items-center justify-center border-b">
                    {item.featured_image ? (
                      <img src={item.featured_image} loading="lazy" alt={item.title_bn || item.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="h-12 w-12 text-[#D4AF37]" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.is_featured && (
                        <Badge className="bg-amber-100 text-amber-800 border-0">
                          Featured
                        </Badge>
                      )}
                      <Badge className={item.is_published ? "bg-emerald-100 text-emerald-800 border-0" : "bg-slate-100 text-slate-700 border-0"}>
                        {item.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-[#052E2B] line-clamp-1 italic">{item.title_bn || item.title}</h4>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                      <span>slug: {item.slug}</span>
                      {item.author && <span>• Author: {item.author}</span>}
                      {item.reading_time && <span>• {item.reading_time} min read</span>}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mt-1">
                      {item.excerpt_bn || (item.content_bn || item.content)?.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-slate-50 mt-3 flex justify-between gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#052E2B]" onClick={() => togglePublishMut.mutate({ id: item.id, is_published: !item.is_published })} title={item.is_published ? "Unpublish to draft" : "Publish to site"}>
                      {item.is_published ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
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
            <DialogTitle className="text-[#052E2B] font-bold italic">{editingItem ? "Edit Blog Post" : "Write Blog Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Title Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Post Title</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title_bn" className="text-[10px] text-muted-foreground">Bangla *</Label>
                  <Input id="title_bn" value={formData.title_bn} onChange={handleTitleBnChange} placeholder="উদা: কুরআনি শিক্ষার গুরুত্ব" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Input id="title_en" value={formData.title_en} onChange={handleTitleEnChange} placeholder="e.g. Importance of Quranic Education" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="title_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Input id="title_ar" value={formData.title_ar} onChange={e => setFormData(p => ({ ...p, title_ar: e.target.value }))} placeholder="مثال: أهمية التعليم القرآني" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="author">Author Name</Label>
                <Input id="author" value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} placeholder="e.g. Mufti Muhammad Arfan" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reading_time">Reading Time (Minutes)</Label>
                <Input id="reading_time" type="number" value={formData.reading_time} onChange={e => setFormData(p => ({ ...p, reading_time: e.target.value ? Number(e.target.value) : "" }))} placeholder="e.g. 5" min="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Post Slug (URL path) *</Label>
              <Input id="slug" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required placeholder="e.g. importance-of-quranic-education" />
            </div>

            {/* Excerpt Inputs */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#052E2B] uppercase">Short Excerpt (Optional - 2-3 lines)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="excerpt_bn" className="text-[10px] text-muted-foreground">Bangla</Label>
                  <Textarea id="excerpt_bn" value={formData.excerpt_bn} onChange={e => setFormData(p => ({ ...p, excerpt_bn: e.target.value }))} rows={2} placeholder="সংক্ষিপ্ত সারসংক্ষেপ..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="excerpt_en" className="text-[10px] text-muted-foreground">English</Label>
                  <Textarea id="excerpt_en" value={formData.excerpt_en} onChange={e => setFormData(p => ({ ...p, excerpt_en: e.target.value }))} rows={2} placeholder="Brief summary in English..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="excerpt_ar" className="text-[10px] text-muted-foreground">Arabic</Label>
                  <Textarea id="excerpt_ar" value={formData.excerpt_ar} onChange={e => setFormData(p => ({ ...p, excerpt_ar: e.target.value }))} rows={2} placeholder="نبذة مختصرة..." />
                </div>
              </div>
            </div>

            {/* Article Content Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="content_bn">Article Content (Bangla) *</Label>
                <Textarea id="content_bn" value={formData.content_bn} onChange={e => setFormData(p => ({ ...p, content_bn: e.target.value }))} rows={6} placeholder="নিবন্ধের মূল বিষয়বস্তু লিখুন..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content_en">Article Content (English)</Label>
                <Textarea id="content_en" value={formData.content_en} onChange={e => setFormData(p => ({ ...p, content_en: e.target.value }))} rows={6} placeholder="Write the content in English..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content_ar">Article Content (Arabic)</Label>
                <Textarea id="content_ar" value={formData.content_ar} onChange={e => setFormData(p => ({ ...p, content_ar: e.target.value }))} rows={6} placeholder="اكتب محتوى المقال بالعربية..." />
              </div>
            </div>

            <ImageUpload label="Featured Cover Image" value={formData.featured_image} onChange={url => setFormData(p => ({ ...p, featured_image: url }))} />

            <div className="flex flex-col gap-2 pt-2 bg-slate-50 p-4 rounded-xl border">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={formData.is_published} onChange={e => setFormData(p => ({ ...p, is_published: e.target.checked }))} className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B]" />
                <Label htmlFor="is_published" className="cursor-pointer font-medium">Publish this article instantly</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={e => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="rounded border-slate-300 text-[#052E2B] focus:ring-[#052E2B]" />
                <Label htmlFor="is_featured" className="cursor-pointer font-medium text-amber-800">Feature this article on Homepage (Featured Blog)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95">
                {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? "Update Post" : "Publish Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
