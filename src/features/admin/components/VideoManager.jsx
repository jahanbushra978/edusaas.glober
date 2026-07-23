import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit2, Film, ListPlus } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import { captureVideoFrame } from "../../../lib/video-optimizer";
import uploadToCloudinary from "../../../lib/cloudinary";

export default function VideoManager({ currentUser }) {
  const queryClient = useQueryClient();
  
  // Tab states: 'videos' or 'categories'
  const [activeTab, setActiveTab] = useState("videos");

  // Form states - Video
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoTitleEn, setVideoTitleEn] = useState("");
  const [videoTitleBn, setVideoTitleBn] = useState("");
  const [videoTitleAr, setVideoTitleAr] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Active");
  const [showOnWebsite, setShowOnWebsite] = useState("Y");
  const [isFeatured, setIsFeatured] = useState("N");
  const [showingSerial, setShowingSerial] = useState(0);
  const [branchId, setBranchId] = useState("");
  const [classId, setClassId] = useState("all");

  // Form states - Category
  const [editingCategory, setEditingCategory] = useState(null);
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameBn, setCatNameBn] = useState("");
  const [catNameAr, setCatNameAr] = useState("");
  const [catSortOrder, setCatSortOrder] = useState(0);

  // Fetch queries
  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["videos-admin"],
    queryFn: () => appClient.entities.Video.list("-created_date", 500),
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["video-categories-admin"],
    queryFn: () => appClient.entities.VideoCategory.list("sort_order", 100),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches-admin-videos"],
    queryFn: () => appClient.entities.Branch.list("name_en", 200),
  });

  // Set default branch for branch admin or first branch for super admin
  React.useEffect(() => {
    if (currentUser?.role === "branch_admin") {
      setBranchId(String(currentUser.branch_id));
    } else if (branches.length > 0 && !branchId) {
      setBranchId(String(branches[0].id));
    }
  }, [currentUser, branches, branchId]);

  // Resolve classes for the selected branch
  const activeBranch = branches.find(b => String(b.id) === String(branchId));
  const classes = activeBranch && Array.isArray(activeBranch.academic_structure) ? activeBranch.academic_structure : [];

  // Mutations - Videos
  const saveVideoMut = useMutation({
    mutationFn: async (data) => {
      if (editingVideo) {
        return appClient.entities.Video.update(editingVideo.id, data);
      }
      return appClient.entities.Video.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["videos-public"] });
      toast.success(editingVideo ? "Video updated successfully!" : "Video added successfully!");
      resetVideoForm();
    },
    onError: (err) => {
      toast.error("Failed to save video: " + err.message);
    }
  });

  const deleteVideoMut = useMutation({
    mutationFn: (id) => appClient.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["videos-public"] });
      toast.success("Video deleted!");
    },
  });

  // Mutations - Categories
  const saveCategoryMut = useMutation({
    mutationFn: async (data) => {
      if (editingCategory) {
        return appClient.entities.VideoCategory.update(editingCategory.id, data);
      }
      return appClient.entities.VideoCategory.create({ ...data, slug: data.name_en.toLowerCase().replace(/\s+/g, "-") });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["video-categories-public"] });
      toast.success(editingCategory ? "Category updated!" : "Category added!");
      resetCategoryForm();
    },
    onError: (err) => {
      toast.error("Failed to save category: " + err.message);
    }
  });

  const deleteCategoryMut = useMutation({
    mutationFn: (id) => appClient.entities.VideoCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["video-categories-public"] });
      toast.success("Category deleted!");
    },
  });

  // Video Form operations
  const resetVideoForm = () => {
    setEditingVideo(null);
    setVideoTitleEn("");
    setVideoTitleBn("");
    setVideoTitleAr("");
    setVideoCategory("");
    setVideoThumbnail("");
    setVideoUrl("");
    setVideoDesc("");
    setUploadDate(new Date().toISOString().split("T")[0]);
    setStatus("Active");
    setShowOnWebsite("Y");
    setIsFeatured("N");
    setShowingSerial(0);
    setClassId("all");
  };

  const handleEditVideo = (v) => {
    setEditingVideo(v);
    setVideoTitleEn(v.title_en || "");
    setVideoTitleBn(v.title_bn || "");
    setVideoTitleAr(v.title_ar || "");
    setVideoCategory(v.category_id ? String(v.category_id) : "");
    setVideoThumbnail(v.thumbnail_url || "");
    setVideoUrl(v.youtube_url || "");
    setVideoDesc(v.description || "");
    setUploadDate(v.upload_date || new Date().toISOString().split("T")[0]);
    setStatus(v.status || "Active");
    setShowOnWebsite(v.show_on_website === true || v.show_on_website === "Y" || v.show_on_website === "true" ? "Y" : "N");
    setIsFeatured(v.is_featured === true || v.is_featured === "Y" || v.is_featured === "true" ? "Y" : "N");
    setShowingSerial(v.showing_serial || 0);
    setBranchId(v.branch_id ? String(v.branch_id) : "");
    setClassId(v.class_id || "all");
  };

  const handleSaveVideo = (e) => {
    e.preventDefault();
    if (!videoTitleEn.trim() || !videoUrl.trim() || !videoCategory) {
      toast.error("Please fill in English title, category, and video URL.");
      return;
    }

    const isShowWeb = showOnWebsite === "Y" || showOnWebsite === true || showOnWebsite === "true";
    const isFeaturedBool = isFeatured === "Y" || isFeatured === true || isFeatured === "true";

    saveVideoMut.mutate({
      title_en: videoTitleEn.trim(),
      title_bn: videoTitleBn.trim() || null,
      title_ar: videoTitleAr.trim() || null,
      category_id: Number(videoCategory),
      thumbnail_url: videoThumbnail || null,
      youtube_url: videoUrl,
      description: videoDesc.trim() || null,
      upload_date: uploadDate || new Date().toISOString().split("T")[0],
      status: status || "Active",
      show_on_website: isShowWeb,
      is_featured: isFeaturedBool,
      showing_serial: Number(showingSerial) || 0,
      branch_id: branchId ? Number(branchId) : null,
      class_id: classId && classId !== "all" ? classId : null,
    });
  };

  const handleUploadVideo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type & size (500MB max)
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
    const isAllowed = allowedTypes.includes(file.type) || /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file.name);
    if (!isAllowed) {
      toast.error("Invalid file type. Please upload MP4, WebM, OGG, MOV, AVI, or MKV files.");
      event.target.value = null;
      return;
    }

    const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`Video file is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum allowed raw size is 500MB.`);
      event.target.value = null;
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(0);
    try {
      // 1. Start frame capture in background
      const framePromise = captureVideoFrame(file, 1.5).catch(() => null);

      // 2. Upload video with percentage progress callback
      const { file_url, thumbnail_url } = await appClient.integrations.Core.UploadFile({
        file,
        folder: "videos",
        onProgress: (pct) => setUploadProgress(pct),
      });
      setVideoUrl(file_url);

      // 3. Auto-populate or extract frame thumbnail if not already set
      if (thumbnail_url) {
        setVideoThumbnail(thumbnail_url);
      } else {
        const frameFile = await framePromise;
        if (frameFile) {
          try {
            const thumbRes = await uploadToCloudinary({ file: frameFile, folder: "video-thumbnails" });
            if (thumbRes?.file_url) setVideoThumbnail(thumbRes.file_url);
          } catch (_) {}
        }
      }

      toast.success("Video file uploaded successfully!");
    } catch (err) {
      toast.error("Video upload failed: " + err.message);
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
      event.target.value = null;
    }
  };

  // Category Form operations
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCatNameEn("");
    setCatNameBn("");
    setCatNameAr("");
    setCatSortOrder(0);
  };

  const handleEditCategory = (c) => {
    setEditingCategory(c);
    setCatNameEn(c.name_en || "");
    setCatNameBn(c.name_bn || "");
    setCatNameAr(c.name_ar || "");
    setCatSortOrder(c.sort_order || 0);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catNameEn.trim() || !catNameBn.trim()) {
      toast.error("Please provide category names in English and Bengali.");
      return;
    }
    saveCategoryMut.mutate({
      name_en: catNameEn,
      name_bn: catNameBn,
      name_ar: catNameAr,
      sort_order: Number(catSortOrder)
    });
  };

  // Filter video list for Branch isolation
  const branchFilteredVideos = currentUser?.role === "branch_admin"
    ? videos.filter(v => String(v.branch_id) === String(currentUser.branch_id))
    : videos;

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Navigation */}
      <div className="flex gap-2 border-b border-primary/10 pb-2">
        <Button
          size="sm"
          variant={activeTab === "videos" ? "default" : "outline"}
          onClick={() => setActiveTab("videos")}
          className="flex items-center gap-1.5"
        >
          <Film className="h-4 w-4" /> Video Manager
        </Button>
        <Button
          size="sm"
          variant={activeTab === "categories" ? "default" : "outline"}
          onClick={() => setActiveTab("categories")}
          className="flex items-center gap-1.5"
        >
          <ListPlus className="h-4 w-4" /> Video Categories
        </Button>
      </div>

      {activeTab === "videos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full overflow-hidden">
          {/* Video upload form */}
          <div className="lg:col-span-5 xl:col-span-5 w-full min-w-0">
            <Card className="border-primary/10 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-b border-emerald-100 dark:border-emerald-900/40">
                <CardTitle className="text-base font-extrabold flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                  <Film className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  {editingVideo ? "Edit Video Entry" : "Add New Video"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <form onSubmit={handleSaveVideo} className="space-y-4 w-full min-w-0">
                  <div className="w-full min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Video Title (English) *</label>
                    <Input value={videoTitleEn} onChange={e => setVideoTitleEn(e.target.value)} placeholder="Enter English Title" className="w-full min-w-0" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title (Bengali)</label>
                      <Input value={videoTitleBn} onChange={e => setVideoTitleBn(e.target.value)} placeholder="বাংলা শিরোনাম" className="w-full min-w-0" />
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title (Arabic)</label>
                      <Input value={videoTitleAr} onChange={e => setVideoTitleAr(e.target.value)} placeholder="العنوان بالعربية" dir="rtl" className="w-full min-w-0" />
                    </div>
                  </div>
                  <div className="w-full min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Video Category *</label>
                    <Select value={videoCategory} onValueChange={setVideoCategory}>
                      <SelectTrigger className="w-full min-w-0"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name_bn || c.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Video File *</label>
                    <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-all w-full min-w-0 ${videoUrl ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/50'}`}>
                      {uploadingVideo ? (
                        <div className="flex flex-col items-center gap-2 py-2 w-full">
                          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            Uploading video... {uploadProgress}%
                          </span>
                          <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-1 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">Streaming video chunks ({uploadProgress}%)</span>
                        </div>
                      ) : videoUrl ? (
                        <div className="flex flex-col items-center gap-2 py-2 w-full min-w-0">
                          <Film className="h-8 w-8 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ Video File Attached</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-full px-2">{videoUrl.split('/').pop()}</span>
                          <span className="text-[10px] text-emerald-700 underline font-semibold">Click to replace file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Film className="h-8 w-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to select video file</span>
                          <span className="text-[10px] text-slate-400">MP4, WebM, MOV, AVI, MKV (Up to 500MB)</span>
                        </div>
                      )}
                      <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.ogg,.mov,.avi,.mkv" className="hidden" onChange={handleUploadVideo} disabled={uploadingVideo} />
                    </label>
                  </div>
                  <div className="w-full min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Video Thumbnail Image (Auto-captured from video, or upload custom image)
                    </label>
                    <ImageUpload
                      value={videoThumbnail || ""}
                      onChange={(url) => setVideoThumbnail(url)}
                      label="Upload Custom Thumbnail"
                    />
                  </div>
                  <div className="w-full min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Short Description</label>
                    <Input value={videoDesc} onChange={e => setVideoDesc(e.target.value)} placeholder="Enter short description" className="w-full min-w-0" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Date</label>
                      <Input type="date" value={uploadDate} onChange={e => setUploadDate(e.target.value)} className="w-full min-w-0" />
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Showing Serial</label>
                      <Input type="number" value={showingSerial} onChange={e => setShowingSerial(e.target.value)} className="w-full min-w-0" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Web Show</label>
                      <Select value={showOnWebsite} onValueChange={setShowOnWebsite}>
                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Y">Yes</SelectItem>
                          <SelectItem value="N">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Featured</label>
                      <Select value={isFeatured} onValueChange={setIsFeatured}>
                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N">No</SelectItem>
                          <SelectItem value="Y">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Branch Selection (isolated for branch admins) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                      <Select value={branchId} onValueChange={setBranchId} disabled={currentUser?.role === "branch_admin"}>
                        <SelectTrigger className="w-full min-w-0"><SelectValue placeholder="Branch" /></SelectTrigger>
                        <SelectContent>
                          {branches.map(b => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name_bn || b.name_en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full min-w-0">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Class / Session</label>
                      <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger className="w-full min-w-0"><SelectValue /></SelectTrigger>
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

                  <div className="flex gap-2 pt-3 w-full min-w-0">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-sm" disabled={saveVideoMut.isPending}>
                      {saveVideoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingVideo ? "Update Video Entry" : "Save Video Entry"}
                    </Button>
                    {editingVideo && (
                      <Button type="button" variant="outline" className="rounded-xl" onClick={resetVideoForm}>Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Videos Grid */}
          <div className="lg:col-span-7 xl:col-span-7 w-full min-w-0">
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Uploaded Videos ({branchFilteredVideos.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingVideos ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : branchFilteredVideos.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic">No videos uploaded yet. Upload one on the left.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branchFilteredVideos.map(v => {
                      const catObj = categories.find(c => c.id === v.category_id);
                      const branchObj = branches.find(b => b.id === v.branch_id);
                      return (
                        <div key={v.id} className="relative overflow-hidden rounded-xl border border-primary/10 bg-card p-3 flex flex-col justify-between hover:shadow-sm transition-shadow">
                          <div>
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-2">
                              {v.thumbnail_url ? (
                                <img src={v.thumbnail_url} loading="lazy" alt={v.title_en} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400"><Film className="h-8 w-8" /></div>
                              )}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900">
                                {catObj ? catObj.name_en : "Uncategorized"}
                              </span>
                              {v.is_featured === "Y" && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#12715B] text-white">
                                  ★ Featured
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm line-clamp-1">{v.title_en}</h4>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">🇧🇩 {v.title_bn || "N/A"}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground font-bold border-t pt-2 border-primary/5">
                              <span>Serial: {v.showing_serial}</span>
                              <span>Status: {v.status}</span>
                              <span>Web: {v.show_on_website === "Y" ? "Show" : "Hide"}</span>
                              {branchObj && <span className="text-[#12715B]">Branch: {branchObj.name_en}</span>}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 border-t pt-2 border-primary/5">
                            <Button size="xs" variant="outline" className="flex-1 text-xs" onClick={() => handleEditVideo(v)}>
                              <Edit2 className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button size="xs" variant="destructive" className="flex-1 text-xs" onClick={() => { if (window.confirm("Delete this video?")) deleteVideoMut.mutate(v.id); }}>
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category upload form */}
          <div className="md:col-span-1">
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ListPlus className="h-4 w-4 text-primary" />
                  {editingCategory ? "Edit Category" : "Add Video Category"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category Name (English) *</label>
                    <Input value={catNameEn} onChange={e => setCatNameEn(e.target.value)} placeholder="e.g. Documentary" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category Name (Bengali) *</label>
                    <Input value={catNameBn} onChange={e => setCatNameBn(e.target.value)} placeholder="e.g. ডকুমেন্টারি" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category Name (Arabic)</label>
                    <Input value={catNameAr} onChange={e => setCatNameAr(e.target.value)} placeholder="e.g. الوثائقيات" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Sort Order</label>
                    <Input type="number" value={catSortOrder} onChange={e => setCatSortOrder(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1" disabled={saveCategoryMut.isPending}>
                      {saveCategoryMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Category"}
                    </Button>
                    {editingCategory && (
                      <Button type="button" variant="outline" onClick={resetCategoryForm}>Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Categories list */}
          <div className="md:col-span-2">
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Video Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingCategories ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : categories.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic">No categories created. Create one on the left.</div>
                ) : (
                  <div className="border rounded-xl overflow-hidden divide-y divide-primary/5">
                    {categories.map(c => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-[#0a1812] transition-colors">
                        <div>
                          <h4 className="font-bold text-sm">{c.name_en}</h4>
                          <p className="text-xs text-muted-foreground font-semibold">🇧🇩 {c.name_bn} | 🇸🇦 {c.name_ar || "N/A"}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-amber-100 dark:border-green-900">
                            Sort Order: {c.sort_order}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline" onClick={() => handleEditCategory(c)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="xs" variant="destructive" onClick={() => { if (window.confirm("Delete this category? This might affect existing videos.")) deleteCategoryMut.mutate(c.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
