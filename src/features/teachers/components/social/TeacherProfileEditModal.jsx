import React, { useState } from "react";
import { X, Camera, Image as ImageIcon, CheckCircle, Globe, MapPin, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";

export default function TeacherProfileEditModal({ teacher, onClose, onProfileUpdated }) {
  const [nameBn, setNameBn] = useState(teacher.nameBn || teacher.name_bn || "");
  const [nameEn, setNameEn] = useState(teacher.nameEn || teacher.name_en || "");
  const [titleBn, setTitleBn] = useState(teacher.titleBn || teacher.title_bn || "");
  const [username, setUsername] = useState(teacher.username || "");
  const [bio, setBio] = useState(teacher.bio || "");
  const [location, setLocation] = useState(teacher.location || "ঢাকা, বাংলাদেশ");
  const [avatarUrl, setAvatarUrl] = useState(teacher.avatar || teacher.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState(teacher.coverPhoto || teacher.cover_url || "");
  const [qualificationsText, setQualificationsText] = useState(
    Array.isArray(teacher.qualifications) ? teacher.qualifications.join("\n") : ""
  );
  const [specialtiesText, setSpecialtiesText] = useState(
    Array.isArray(teacher.specialties) ? teacher.specialties.join(", ") : ""
  );
  const [languagesText, setLanguagesText] = useState(
    Array.isArray(teacher.languages) ? teacher.languages.join(", ") : "বাংলা, العربية, English"
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Upload Photo to Cloudinary
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
        formData.append("folder", "teacher_profiles");
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
        // Cloudinary offline or unconfigured, fallback to Data URL
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      }

      if (type === "avatar") {
        setAvatarUrl(uploadedUrl);
        toast.success("প্রোফাইল ছবি সফলভাবে নির্বাচন ও লোড হয়েছে।");
      } else {
        setCoverUrl(uploadedUrl);
        toast.success("কভার ফটো সফলভাবে নির্বাচন ও লোড হয়েছে।");
      }
    } catch (err) {
      toast.error(err.message || "ছবি আপলোডে ত্রুটি ঘটেছে।");
    } finally {
      if (type === "avatar") setIsUploadingAvatar(false);
      if (type === "cover") setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const qualifications = qualificationsText
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean);

      const specialties = specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const languages = languagesText
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch("/api/teacher-marketplace/social/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacher.id || teacher.teacher_id,
          name_bn: nameBn,
          name_en: nameEn,
          title_bn: titleBn,
          username: username.trim(),
          bio,
          location,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          qualifications,
          specialties,
          languages,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে।");
      }

      toast.success(data.message || "প্রোফাইল সফলভাবে হালনাগাদ করা হয়েছে।");
      if (onProfileUpdated) onProfileUpdated(data.profile);
      onClose();
    } catch (err) {
      toast.error(err.message || "প্রোফাইল সংরক্ষণে ত্রুটি ঘটেছে।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>শিক্ষক প্রোফাইল ও সোশ্যাল তথ্য সম্পাদনা</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover Photo Upload & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center justify-between">
              <span>প্যানোরামিক কভার ফটো:</span>
              {isUploadingCover && <span className="text-[10px] text-emerald-600 animate-pulse">কভার আপলোড হচ্ছে...</span>}
            </label>
            <div className="h-40 w-full rounded-2xl relative bg-stone-800 overflow-hidden border border-stone-300 dark:border-stone-700 group">
              <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <div className="px-4 py-2 rounded-xl bg-white/90 text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-lg">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>কভার ফটো পরিবর্তন করুন</span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleUploadMedia(e.target.files?.[0], "cover")}
                  disabled={isUploadingCover}
                />
              </label>
            </div>
          </div>

          {/* Avatar Upload & Preview */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow-md"
              />
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleUploadMedia(e.target.files?.[0], "avatar")}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">প্রোফাইল ছবি</h4>
              <p className="text-[11px] text-slate-500">
                বৃত্তাকার ছবিটিতে ক্লিক করে নতুন ছবি সিলেক্ট করুন (সর্বোচ্চ ১০MB)
              </p>
              {isUploadingAvatar && (
                <p className="text-[10px] text-emerald-600 animate-pulse font-bold">
                  প্রোফাইল ছবি আপলোড হচ্ছে...
                </p>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">শিক্ষকের নাম (বাংলা):</label>
              <input
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">শিক্ষকের নাম (ইংরেজি):</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">উপাধি / পদবী (Title):</label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: সিনিয়র হিফজ উস্তাদ ও ক্বারী"
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>সোশ্যাল ইউজারনেম (@username):</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="qari_abdullah"
                  className="w-full pl-7 pr-3 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>অবস্থান / জেলা:</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: গাজীপুর, ঢাকা"
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-stone-300">ভাষাসমূহ (কমা দিয়ে পৃথক):</label>
              <input
                type="text"
                value={languagesText}
                onChange={(e) => setLanguagesText(e.target.value)}
                placeholder="বাংলা, العربية, English"
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300">পরিচিতি ও শিক্ষাদান দর্শন (Bio):</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="আপনার অভিজ্ঞতা, তারতীল পদ্ধতি ও শিক্ষার্থীদের প্রতি দিকনির্দেশনা লিখুন..."
              className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Qualifications & Sanad */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>শিক্ষাগত সনদ ও যোগ্যতা (প্রতি লাইনে একটি):</span>
            </label>
            <textarea
              value={qualificationsText}
              onChange={(e) => setQualificationsText(e.target.value)}
              rows={3}
              placeholder="দাওরায়ে হাদিস (মাস্টার্স)&#10;মুজাওয়িদ সনদ (আল-আজহার কারাত)&#10;১০ বছর হিফজ শিক্ষকতার অভিজ্ঞতা"
              className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Specialties */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-stone-300">বিশেষ পারদর্শিতার বিষয় (কমা দিয়ে পৃথক):</label>
            <input
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="হিফজুল কুরআন, নূরানী কায়দা, সহীহ মাখরাজ, ইলমে কিরাত"
              className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar || isUploadingCover}
              className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-lg shadow-emerald-700/20 transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSaving ? "সংরক্ষিত হচ্ছে..." : "প্রোফাইল সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

