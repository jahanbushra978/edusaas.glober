"use client";

import React, { useState } from "react";
import { X, Camera, MapPin, BookOpen, Tag, Save, User } from "lucide-react";
import { toast } from "sonner";

export default function StudentProfileEditModal({ student, onClose, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState(student.display_name || student.nameBn || student.name || "");
  const [bio, setBio] = useState(student.bio || "");
  const [location, setLocation] = useState(student.location || "ঢাকা, বাংলাদেশ");
  const [currentJuz, setCurrentJuz] = useState(student.current_juz || "পারা ১ (সূরা আল-বাকারাহ)");
  const [avatarUrl, setAvatarUrl] = useState(student.avatar_url || student.avatar || "");
  const [coverUrl, setCoverUrl] = useState(student.cover_url || student.coverPhoto || "");
  const [interestsText, setInterestsText] = useState(
    Array.isArray(student.learning_interests) ? student.learning_interests.join(", ") : "তাজবীদ ও মাখরাজ, নূরানী কায়দা, আমপারা হিফজ"
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Upload Photo to Cloudinary or base64 fallback
  const handleUploadMedia = async (file, type) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ছবির আকার সর্বোচ্চ ১০ মেগাবাইট হতে পারে।");
      return;
    }

    if (type === "avatar") setIsUploadingAvatar(true);
    if (type === "cover") setIsUploadingCover(true);

    try {
      let uploadedUrl = null;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "student_profiles");
        formData.append("image_type", type);

        const res = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.ok && (data.secure_url || data.file_url)) {
          uploadedUrl = data.secure_url || data.file_url;
        }
      } catch {
        // Fallback to data URL
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (type === "avatar") {
        setAvatarUrl(uploadedUrl);
        toast.success("প্রোফাইল ছবি প্রিভিউ সফল!");
      } else {
        setCoverUrl(uploadedUrl);
        toast.success("কভার ফটো প্রিভিউ সফল!");
      }
    } catch {
      toast.error("ছবি আপলোডে সমস্যা হয়েছে।");
    } finally {
      if (type === "avatar") setIsUploadingAvatar(false);
      if (type === "cover") setIsUploadingCover(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম প্রদান করুন।");
      return;
    }

    setIsSaving(true);
    const interestsList = interestsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updated = {
      ...student,
      display_name: displayName.trim(),
      nameBn: displayName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      current_juz: currentJuz.trim(),
      avatar_url: avatarUrl,
      avatar: avatarUrl,
      cover_url: coverUrl,
      coverPhoto: coverUrl,
      learning_interests: interestsList.length > 0 ? interestsList : ["তাজবীদ ও মাখরাজ", "সহজ নূরানী কায়েদা"],
    };

    try {
      // 1. Sync to backend API
      await fetch("/api/teacher-marketplace/public-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_public_id: student.student_public_id,
          username: student.username,
          display_name: updated.display_name,
          bio: updated.bio,
          location: updated.location,
          avatar_url: updated.avatar_url,
          cover_url: updated.cover_url,
          learning_interests: updated.learning_interests,
        }),
      }).catch(() => {});

      // 2. Persist local sessions
      try {
        const session = JSON.parse(localStorage.getItem("edusaas_public_student_session") || "{}");
        localStorage.setItem("edusaas_public_student_session", JSON.stringify({ ...session, ...updated }));
        localStorage.setItem("edusaas_public_student_profile", JSON.stringify(updated));
      } catch {}

      toast.success("মাশাআল্লাহ! আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।");
      if (onProfileUpdated) onProfileUpdated(updated);
      onClose();
    } catch {
      toast.error("প্রোফাইল সেভ করার সময় সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              শিক্ষার্থী প্রোফাইল সম্পাদনা (Facebook Style)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Cover & Avatar Visual Editor */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 dark:text-stone-300 uppercase tracking-wider block">
              কভার ও প্রোফাইল ছবি
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 h-36 sm:h-44 bg-slate-800">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                  কোনো কভার ছবি নেই
                </div>
              )}

              {/* Cover Upload Button */}
              <label
                htmlFor="modal-cover-upload"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer border border-white/20 transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUploadingCover ? "আপলোড হচ্ছে..." : "কভার পরিবর্তন"}</span>
                <input
                  id="modal-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadMedia(e.target.files?.[0], "cover")}
                />
              </label>

              {/* Avatar Inside Cover Preview */}
              <div className="absolute -bottom-2 left-6 transform translate-y-1/3">
                <div className="relative group">
                  <img
                    src={avatarUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=400&q=80"}
                    alt="Avatar Preview"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-xl"
                  />
                  <label
                    htmlFor="modal-avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-white dark:border-stone-900 shadow-md cursor-pointer transition active:scale-95"
                    title="ছবি পরিবর্তন"
                  >
                    <Camera className="w-3 h-3" />
                    <input
                      id="modal-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadMedia(e.target.files?.[0], "avatar")}
                    />
                  </label>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-3">
              কভার বা ছবির উপর ক্লিক করে সরাসরি আপনার কম্পিউটার বা ফোন থেকে ছবি আপলোড করতে পারেন।
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 block mb-1">
                আপনার নাম (Display Name) *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="যেমন: ফাতেমা জোহরা"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 block mb-1">
                অবস্থান / শহর (Location)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="যেমন: মিরপুর, ঢাকা"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300 block mb-1">
              বর্তমান পড়ার অবস্থা / হিফজ পারা (Current Juz / Status)
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                value={currentJuz}
                onChange={(e) => setCurrentJuz(e.target.value)}
                placeholder="যেমন: পারা ৩০ (আমপারা সম্পূর্ণ শেষ রুকু) বা নূরানী কায়দা"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300 block mb-1">
              পরিচিতি ও কুরআনিক লক্ষ্য (Bio / Status)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="আপনার কুরআন শিক্ষার লক্ষ্য, তাজবীদের আগ্রহ বা প্রতিদিনের পড়ার অভ্যাস লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300 block mb-1">
              আগ্রহের বিষয়সমূহ (ট্যাগ কমা দিয়ে আলাদা করুন)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="মহিলা বিভাগ, তাজবীদ ও মাখরাজ, আমপারা হিফজ"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
