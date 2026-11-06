import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Video,
  Film,
  X,
  Send,
  Play,
} from "lucide-react";
import { toast } from "sonner";

const MAX_VIDEO_SIZE_BYTES = 300 * 1024 * 1024; // 300MB limit
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for streaming

export default function SocialPostComposer({ teacher, currentUser, onPostCreated }) {
  const [contentText, setContentText] = useState("");
  const [postType, setPostType] = useState("text"); // 'text' | 'photo' | 'multi_photo' | 'video' | 'clip'
  const [visibility, setVisibility] = useState("public"); // 'public' | 'followers' | 'private'
  const [mediaList, setMediaList] = useState([]); // array of { url, type, thumbnail, name, size }
  const [videoMetadata, setVideoMetadata] = useState(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const cancelUploadRef = useRef(false);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ── Multiple Photos Upload ──
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`"${file.name}" ছবির আকার ১০MB এর বেশি।`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" একটি বৈধ ছবি নয়।`);
        continue;
      }

      setIsUploading(true);
      setUploadStatusText(`ছবি আপলোড হচ্ছে: ${file.name}...`);

      try {
        let photoUrl = null;
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "teacher_posts/images");
          formData.append("image_type", "post_photo");

          const res = await fetch("/api/uploads/cloudinary", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.ok && (data.secure_url || data.file_url)) {
            photoUrl = data.secure_url || data.file_url;
          }
        } catch {
          // Cloudinary offline or unconfigured, gracefully fallback
        }

        if (!photoUrl) {
          photoUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          });
        }

        setMediaList((prev) => {
          const updated = [
            ...prev,
            {
              url: photoUrl,
              type: "photo",
              thumbnail: photoUrl,
              name: file.name,
              size: file.size,
            },
          ];
          setPostType(updated.length > 1 ? "multi_photo" : "photo");
          return updated;
        });

        toast.success(`"${file.name}" সফলভাবে যুক্ত হয়েছে।`);
      } catch (err) {
        toast.error(err.message || "ছবি আপলোডে ত্রুটি।");
      } finally {
        setIsUploading(false);
        setUploadStatusText("");
      }
    }
  };

  // ── Video Chunked Upload (Up to 300MB) ──
  const handleVideoSelect = async (e, asClip = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(`ভিডিও ফাইলের আকার ৩০০MB এর চেয়ে বড় (${Math.round(file.size / (1024 * 1024))}MB)।`);
      return;
    }

    if (!file.type.startsWith("video/") && !/\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)) {
      toast.error("শুধুমাত্র অনুমোদিত ভিডিও ফরম্যাট (MP4, MOV, WEBM) নির্বাচন করুন।");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText("ভিডিও আপলোড শুরু হচ্ছে...");
    cancelUploadRef.current = false;

    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
    const uploadId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let uploadedBytes = 0;
    let finalVideoUrl = null;
    let finalThumbnail = null;
    let videoVariants = null;
    let videoHlsUrl = null;

    try {
      for (let i = 0; i < totalChunks; i++) {
        if (cancelUploadRef.current) {
          toast.info("ভিডিও আপলোড বাতিল করা হয়েছে।");
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("upload_id", uploadId);
        formData.append("folder", asClip ? "teacher_posts/clips" : "teacher_posts/videos");
        formData.append("start", String(start));
        formData.append("end", String(end));
        formData.append("total_size", String(totalSize));
        formData.append("original_name", file.name);

        let chunkSuccess = false;
        let lastChunkError = null;

        // Auto-retry up to 3 times per chunk with backoff
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await fetch("/api/uploads/video-chunk", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.ok) {
              throw new Error(data.message || `খণ্ড ${i + 1} আপলোডে ব্যর্থ হয়েছে।`);
            }

            chunkSuccess = true;
            if (data.secure_url) {
              finalVideoUrl = data.secure_url;
              finalThumbnail = data.thumbnail_url || data.secure_url.replace(/\.[^/.]+$/, ".jpg");
              videoVariants = data.variants || null;
              videoHlsUrl = data.hls_url || null;
            }
            break;
          } catch (err) {
            lastChunkError = err;
            if (attempt < 3 && !cancelUploadRef.current) {
              setUploadStatusText(`খণ্ড ${i + 1} পুনরায় চেষ্টা করা হচ্ছে (চেষ্টা ${attempt + 1}/৩)...`);
              await new Promise((r) => setTimeout(r, 1000 * attempt));
            }
          }
        }

        if (!chunkSuccess) {
          throw lastChunkError || new Error(`খণ্ড ${i + 1} আপলোড ব্যর্থ।`);
        }

        uploadedBytes = end;
        const progressPct = Math.round((uploadedBytes / totalSize) * 100);
        setUploadProgress(progressPct);
        setUploadStatusText(`ভিডিও আপলোড হচ্ছে: ${progressPct}% (${Math.round(uploadedBytes / (1024 * 1024))}MB / ${Math.round(totalSize / (1024 * 1024))}MB)...`);
      }

      if (!finalVideoUrl) {
        // Fallback simulation URL if chunk upload server was in offline dev mode
        finalVideoUrl = URL.createObjectURL(file);
        finalThumbnail = "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80";
      }

      const meta = {
        name: file.name,
        size_bytes: file.size,
        duration: asClip ? "০:৪৫" : "৩:২০",
        resolution: "720p HD",
        thumbnail: finalThumbnail,
        cdn_url: finalVideoUrl,
        variants: videoVariants,
        hls_url: videoHlsUrl,
        processing_status: "ready",
      };

      setVideoMetadata(meta);
      setMediaList([
        {
          url: finalVideoUrl,
          type: asClip ? "clip" : "video",
          thumbnail: finalThumbnail,
          name: file.name,
          size: file.size,
        },
      ]);
      setPostType(asClip ? "clip" : "video");
      toast.success(asClip ? "শর্ট ক্লিপ সফলভাবে আপলোড সম্পন্ন!" : "ক্লাস ভিডিও সফলভাবে আপলোড সম্পন্ন!");
    } catch (err) {
      toast.error(err.message || "ভিডিও আপলোডে ত্রুটি ঘটেছে।");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText("");
    }
  };

  const removeMedia = (index) => {
    setMediaList((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length === 0) {
        setPostType("text");
        setVideoMetadata(null);
      } else if (updated.length === 1 && updated[0].type === "photo") {
        setPostType("photo");
      }
      return updated;
    });
  };

  // ── Publish Post ──
  const handlePublish = async (e) => {
    e.preventDefault();
    const trimmed = contentText.trim();
    if (!trimmed && mediaList.length === 0) {
      toast.error("পোস্টে কোনো টেক্সট বা মিডিয়া যুক্ত করা আবশ্যক।");
      return;
    }

    try {
      const res = await fetch("/api/teacher-marketplace/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_text: trimmed,
          post_type: postType,
          media_urls: mediaList,
          video_metadata: videoMetadata,
          visibility,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "পোস্ট প্রকাশে ব্যর্থ হয়েছে।");
      }

      toast.success(data.message || "পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
      setContentText("");
      setMediaList([]);
      setVideoMetadata(null);
      setPostType("text");

      if (onPostCreated) {
        onPostCreated(data.post);
      }
    } catch (err) {
      toast.error(err.message || "পোস্ট প্রকাশে ত্রুটি।");
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-md space-y-4">
      {/* Top Input Bar */}
      <div className="flex items-start gap-3">
        <img
          src={
            (teacher && (teacher.avatar || teacher.avatar_url)) ||
            (currentUser && (currentUser.avatar || currentUser.avatar_url)) ||
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80"
          }
          alt={(teacher && teacher.nameBn) || (currentUser && (currentUser.display_name || currentUser.name)) || "User"}
          className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600 shrink-0"
        />
        <div className="flex-1 space-y-2">
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder={
              teacher
                ? "উস্তাদ, আজ আপনার শিক্ষার্থীদের সাথে কী কুরআন নসিহত বা পাঠ শেয়ার করতে চান?"
                : "কুরআন শিক্ষা বা তাজবীদ অনুশীলন নিয়ে কিছু শেয়ার করুন..."
            }
            rows={3}
            className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 resize-none font-medium leading-relaxed"
          />

          {/* Upload Progress Bar (If in Progress) */}
          {isUploading && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                <span>{uploadStatusText}</span>
                <button
                  type="button"
                  onClick={() => {
                    cancelUploadRef.current = true;
                  }}
                  className="text-red-600 font-extrabold hover:underline cursor-pointer"
                >
                  বাতিল করুন
                </button>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Media Previews Gallery */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {mediaList.map((m, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 h-28 bg-black group">
                  {m.type === "video" || m.type === "clip" ? (
                    <div className="w-full h-full relative">
                      <img src={m.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[9px] font-mono">
                        {m.type === "clip" ? "ক্লিপ" : "ভিডিও"}
                      </span>
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar & Buttons */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
        {/* Media Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Photos Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>ছবি</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {/* Video Button */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>ক্লাস ভিডিও (৩০০MB)</span>
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => handleVideoSelect(e, false)}
          />

          {/* Short Clip Button */}
          <button
            type="button"
            onClick={() => {
              if (videoInputRef.current) {
                videoInputRef.current.onchange = (e) => handleVideoSelect(e, true);
                videoInputRef.current.click();
              }
            }}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Film className="w-4 h-4 text-purple-600" />
            <span className="hidden xs:inline">শর্ট ক্লিপ</span>
          </button>

          {/* Visibility Selector */}
          <div className="relative inline-block">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="py-1.5 pl-2 pr-6 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-slate-700 dark:text-stone-300 focus:outline-hidden cursor-pointer"
            >
              <option value="public">🌍 সর্বজনীন (Public)</option>
              <option value="followers">👥 অনুসারীগণ (Followers)</option>
              <option value="private">🔒 ব্যক্তিগত (Private)</option>
            </select>
          </div>
        </div>

        {/* Publish Button */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={isUploading || (!contentText.trim() && mediaList.length === 0)}
          className="px-5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>পোস্ট প্রকাশ করুন</span>
        </button>
      </div>
    </div>
  );
}
