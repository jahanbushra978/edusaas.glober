import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Image, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GALLERY_SELECTION_OPTIONS, matchesDepartmentValue } from "@/lib/departmentData";

const DEPARTMENTS = GALLERY_SELECTION_OPTIONS;
const KINDERGARTEN_ALIASES = { aliases: ["কিন্ডারগার্টেন", "কিন্ডার গার্ডেন", "Kindergarten"] };

function matchesFilter(itemCategory, filterCategoryName) {
  const normItem = String(itemCategory || "").trim().toLowerCase();
  const normFilter = String(filterCategoryName || "").trim().toLowerCase();
  
  if (normFilter === "kindergarten" || normFilter === "কিন্ডারগার্টেন") {
    return matchesDepartmentValue(itemCategory, KINDERGARTEN_ALIASES) || normItem === "kindergarten";
  }
  if ((normFilter === "general" && normItem === "সাধারণ") || (normFilter === "সাধারণ" && normItem === "general")) {
    return true;
  }
  if ((normFilter === "english version" && normItem === "english version") || (normFilter === "english version" && normItem === "ইংলিশ ভার্সন")) {
    return true;
  }
  return normItem === normFilter;
}

export default function GalleryManager({ currentUser }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [dept, setDept] = useState("General");
  const [uploading, setUploading] = useState(false);
  const [filterDept, setFilterDept] = useState("all");

  const [branchId, setBranchId] = useState("");
  const [classId, setClassId] = useState("all");
  const [showOnWebsite, setShowOnWebsite] = useState("Y");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["gallery-admin"],
    queryFn: () => appClient.entities.Gallery.list("-created_at", 500),
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["gallery-categories-admin"],
    queryFn: () => appClient.entities.GalleryCategory.list("sort_order", 100),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-admin-gallery"],
    queryFn: () => appClient.entities.Branch.list("name_en", 200),
  });

  React.useEffect(() => {
    if (currentUser?.role === "branch_admin") {
      setBranchId(String(currentUser.branch_id));
    } else if (branches.length > 0 && !branchId) {
      setBranchId(String(branches[0].id));
    }
  }, [currentUser, branches, branchId]);

  const activeBranch = branches.find(b => String(b.id) === String(branchId));
  const classes = activeBranch && Array.isArray(activeBranch.academic_structure) ? activeBranch.academic_structure : [];

  const categories = dbCategories.length > 0 ? dbCategories : [
    { id: 1, name_en: "Noorani", name_bn: "নূরানী", name_ar: "نوراني" },
    { id: 2, name_en: "Nazera", name_bn: "নাজেরা", name_ar: "ناظرة" },
    { id: 3, name_en: "Hifz", name_bn: "হিফয", name_ar: "تحفيظ" },
    { id: 4, name_en: "Hifz Shunani", name_bn: "হিফয শুনানি", name_ar: "تسميع تحفيظ" },
    { id: 5, name_en: "Kitab Khana", name_bn: "কিতাবখানা", name_ar: "كتاب خانة" },
    { id: 6, name_en: "Kindergarten", name_bn: "কিন্ডারগার্টেন", name_ar: "روضة الأطفال" },
    { id: 7, name_en: "General", name_bn: "সাধারণ", name_ar: "عام" },
    { id: 8, name_en: "English Version", name_bn: "ইংলিশ ভার্সন", name_ar: "النسخة الإنجليزية" }
  ];

  // Set default category to General if it is in the list
  React.useEffect(() => {
    if (categories.length > 0 && !dept) {
      const hasGeneral = categories.find(c => c.name_en === "General");
      setDept(hasGeneral ? "General" : categories[0].name_en);
    }
  }, [categories, dept]);

  const createMut = useMutation({
    mutationFn: (data) => appClient.entities.Gallery.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-admin"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-public"] });
      toast.success("Added!");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.Gallery.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-admin"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-public"] });
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, show_on_website }) => appClient.entities.Gallery.update(id, { show_on_website }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-admin"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-public"] });
    },
  });

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!title.trim() && files.length === 1) {
      toast.error("Please enter a title first");
      return;
    }

    setUploading(true);
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const { file_url } = await appClient.integrations.Core.UploadFile({ file });
      await createMut.mutateAsync({
        title: files.length > 1 && !title.trim() ? `${dept} - Photo ${Date.now() + index}` : title,
        title_bn: titleBn,
        title_ar: titleAr,
        image_url: file_url,
        category: dept,
        branch_id: branchId ? Number(branchId) : null,
        class_id: classId,
        show_on_website: showOnWebsite,
      });
    }
    setUploading(false);
    setTitle("");
    setTitleBn("");
    setTitleAr("");
  };

  const branchFilteredItems = currentUser?.role === "branch_admin"
    ? items.filter((item) => String(item.branch_id) === String(currentUser.branch_id))
    : items;

  const filtered =
    filterDept === "all"
      ? branchFilteredItems
      : branchFilteredItems.filter((item) => matchesFilter(item.category, filterDept));

  return (
    <div className="space-y-5">
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="h-4 w-4 text-primary" /> Add Gallery Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
            <Input placeholder="Caption (English)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Caption (Bengali)" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} />
            <Input placeholder="Caption (Arabic)" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Category / Department *</label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name_en}>
                      {cat.name_bn || cat.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Branch *</label>
              <Select value={branchId} onValueChange={setBranchId} disabled={currentUser?.role === "branch_admin"}>
                <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Class / Session *</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">General / All Classes</SelectItem>
                  {classes.map(c => {
                    const name = c.class_name?.bn || c.class_name?.en || String(c.id);
                    const secNames = Array.isArray(c.sections) 
                      ? c.sections.map(s => s.section_name?.bn || s.section_name?.en || s.section_name || s.section?.bn || s.section?.en || "").filter(Boolean).join(", ")
                      : "";
                    const label = `${name}${secNames ? ` (${secNames})` : ""}`;
                    return <SelectItem key={c.id} value={String(c.id)}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2 border-t pt-3 border-primary/10">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Show on Web</label>
              <Select value={showOnWebsite} onValueChange={setShowOnWebsite}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Upload Photo(s)</label>
              <label className="cursor-pointer block">
                <div className="flex h-9 items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/30 px-4 text-sm font-medium text-primary transition-all hover:border-primary">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Select & Upload Photos"}
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">You can select multiple photos at once. They will be added to the selected branch and session.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filterDept === "all" ? "default" : "outline"} onClick={() => setFilterDept("all")}>
          All ({branchFilteredItems.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={filterDept === cat.name_en ? "default" : "outline"}
            onClick={() => setFilterDept(cat.name_en)}
          >
            {cat.name_bn} ({branchFilteredItems.filter((item) => matchesFilter(item.category, cat.name_en)).length})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center italic text-muted-foreground">No photos yet. Upload some above.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-primary/10" style={{ aspectRatio: "4/3" }}>
              <img src={item.image_url} loading="lazy" alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "rgba(0,0,0,0.7)" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-center text-xs font-bold leading-tight text-white">{item.title}</p>
                  <p className="text-[10px] text-white/80 font-semibold">{item.category}</p>
                  <p className="text-[9px] text-white/60">Web: {item.show_on_website === "Y" ? "Yes" : (item.show_on_website === "N" ? "No" : "Yes")} | Session: {item.class_id === "all" ? "All" : (item.class_id || "All")}</p>
                  <div className="mt-1 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMut.mutate({ id: item.id, show_on_website: item.show_on_website === "Y" ? "N" : "Y" })} title={item.show_on_website === "Y" ? "Hide" : "Show"}>
                      {item.show_on_website === "Y" ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (window.confirm("Delete this photo?")) deleteMut.mutate(item.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
