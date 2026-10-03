import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Image as ImageIcon, Globe, Save, Eye, EyeOff, FileText, Download, Lock, Users, Power, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

function SettingRow({ label, settingKey, value, onSave, type = "text", hint }) {
  const [val, setVal] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settingKey, val);
    } catch (error) {
      toast.error(error?.message || "Failed to save setting");
      console.error("Setting save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Compress image before upload for faster speed
  const compressImage = (file, maxWidth = 800, quality = 0.85) => {
    return new Promise((resolve) => {
      // If file is not an image or is SVG, skip compression
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/webp' }));
          }, 'image/webp', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const { file_url } = await appClient.integrations.Core.UploadFile({ file: compressed });
      setVal(file_url);
      await onSave(settingKey, file_url);
      toast.success("Uploaded & saved!");
    } catch {
      toast.error("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-primary uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {type === "image" ? (
        <div className="space-y-3">
          {val && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-primary/3">
              <img src={val} loading="lazy" alt="Preview" className="h-14 w-auto max-w-[140px] object-contain rounded" onError={e => { e.target.style.display = "none"; }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{val}</p>
                <p className="text-xs text-emerald-600 mt-1">✓ Current logo</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 text-sm text-primary font-medium transition-all">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload New Logo"}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Or paste image URL..." value={val} onChange={e => setVal(e.target.value)} className="flex-1 text-xs" />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 w-full items-center">
          <div className="relative flex-1">
            <Input
              value={val}
              onChange={e => setVal(e.target.value)}
              type={type === "password" ? (showPassword ? "text" : "password") : type}
              className="w-full pr-10"
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 flex-shrink-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

function DepartmentCountsForm({ appSettings, onSave }) {
  const getSettingVal = (key) => {
    const list = Array.isArray(appSettings) ? appSettings : [];
    const item = list.find((s) => (s.key || s.setting_key) === key);
    return item ? (item.value ?? item.setting_value ?? "") : "";
  };

  const [enabled, setEnabled] = useState(() => getSettingVal("dept_counts_override_enabled") === "Y");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const departments = [
    { label: "নূরানী বিভাগ", icon: "📗", activeKey: "dept_active_noorani", inactiveKey: "dept_inactive_noorani" },
    { label: "নাজেরা বিভাগ", icon: "📙", activeKey: "dept_active_nazera", inactiveKey: "dept_inactive_nazera" },
    { label: "হিফয বিভাগ", icon: "📘", activeKey: "dept_active_hifz", inactiveKey: "dept_inactive_hifz" },
    { label: "হিফয শুনানি বিভাগ", icon: "🎧", activeKey: "dept_active_hifz_shunani", inactiveKey: "dept_inactive_hifz_shunani" },
    { label: "কিন্ডারগার্টেন বিভাগ", icon: "🏫", activeKey: "dept_active_kindergarten", inactiveKey: "dept_inactive_kindergarten" },
    { label: "কিতাবখানা / কিতাব বিভাগ", icon: "📚", activeKey: "dept_active_kitabkhana", inactiveKey: "dept_inactive_kitabkhana" },
    { label: "ইংলিশ ভার্সন বিভাগ", icon: "🇬🇧", activeKey: "dept_active_english_version", inactiveKey: "dept_inactive_english_version" },
  ];

  const [formValues, setFormValues] = useState(() => {
    const init = {};
    departments.forEach((d) => {
      init[d.activeKey] = getSettingVal(d.activeKey);
      init[d.inactiveKey] = getSettingVal(d.inactiveKey);
    });
    return init;
  });

  // Sync state if appSettings query refetches
  React.useEffect(() => {
    setEnabled(getSettingVal("dept_counts_override_enabled") === "Y");
    const updated = {};
    departments.forEach((d) => {
      updated[d.activeKey] = getSettingVal(d.activeKey);
      updated[d.inactiveKey] = getSettingVal(d.inactiveKey);
    });
    setFormValues(updated);
  }, [appSettings]);

  const handleToggleEnable = async () => {
    const nextState = !enabled;
    setToggling(true);
    try {
      await onSave("dept_counts_override_enabled", nextState ? "Y" : "N");
      setEnabled(nextState);
      toast.success(nextState ? "কাস্টম শিক্ষার্থী সংখ্যা চালু করা হয়েছে!" : "কাস্টম শিক্ষার্থী সংখ্যা বন্ধ করা হয়েছে! (ডাটাবেস থেকে ডাইনামিক দেখাবে)");
    } catch {
      toast.error("সেটিং পরিবর্তন ব্যর্থ হয়েছে");
    } finally {
      setToggling(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(formValues).map(([key, val]) => onSave(key, val || ""));
      await Promise.all(promises);
      toast.success("বিভাগভিত্তিক শিক্ষার্থী সংখ্যা সফলভাবে সেভ করা হয়েছে!");
    } catch {
      toast.error("সেভ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-slate-50/50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-[#052E2B]">
              <Users className="h-5 w-5 text-primary" /> বিভাগভিত্তিক শিক্ষার্থী সংখ্যা কাস্টমাইজেশন (Department Student Counts)
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              হোমপেজের "ক্লাস সেকশন" কার্ডে দেখানো সংখ্যা এখান থেকে সেট করতে পারবেন। চালু থাকলে কাস্টম সংখ্যা এবং বন্ধ থাকলে ডাটাবেসের আসল সংখ্যা দেখাবে।
            </p>
          </div>

          {/* Toggle Button */}
          <Button
            type="button"
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleEnable}
            disabled={toggling}
            className={`gap-2 h-9 rounded-xl font-bold transition-all ${
              enabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            }`}
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : enabled ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            {enabled ? "কাস্টম সংখ্যা: চালু (ON)" : "কাস্টম সংখ্যা: বন্ধ (OFF)"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {!enabled && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <Power className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>বর্তমানে কাস্টম সংখ্যা <b>বন্ধ (OFF)</b> রয়েছে। হোমপেজে ডাটাবেসের আসল ছাত্র সংখ্যা দেখানো হচ্ছে। কাস্টম সংখ্যা দেখাতে উপরের বাটন চেপে <b>চালু (ON)</b> করুন।</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.activeKey} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs space-y-3 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-2 border-b pb-2">
                <span className="text-xl">{dept.icon}</span>
                <p className="text-xs font-bold text-[#052E2B]">{dept.label}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">সক্রিয় ছাত্র</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formValues[dept.activeKey] ?? ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [dept.activeKey]: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200 focus:border-[#052E2B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">নিষ্ক্রিয় ছাত্র</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formValues[dept.inactiveKey] ?? ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [dept.inactiveKey]: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200 focus:border-[#052E2B]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full sm:w-auto bg-[#052E2B] hover:bg-[#031c1a] text-white font-bold h-10 px-6 rounded-xl gap-2 text-xs shadow-md"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            বিভাগভিত্তিক শিক্ষার্থী সংখ্যা সেভ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurePasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters.");
    if (!currentPassword) return toast.error("Please enter your current password.");
    setIsUpdating(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Failed to change password");
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">Current Password</label>
          <Input 
            type="password" 
            placeholder="Verify current password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">New Password</label>
          <Input 
            type="password" 
            placeholder="At least 6 characters" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="mt-1"
          />
        </div>
      </div>
      <Button 
        onClick={handleChangePassword} 
        disabled={isUpdating || newPassword.length < 6 || !currentPassword}
        className="w-full md:w-auto bg-slate-900 hover:bg-slate-800"
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
        {isUpdating ? "Updating..." : "Update Password"}
      </Button>
    </div>
  );
}

export default function BrandingSettings() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const getVal = (key) => (Array.isArray(settings) ? settings : []).find(s => s.key === key)?.value || "";

  const saveMut = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = (Array.isArray(settings) ? settings : []).find(s => s.key === key);
      if (existing) {
        return appClient.entities.AppSettings.update(existing.id, { value });
      } else {
        return appClient.entities.AppSettings.create({ key, value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings-public"] });
      toast.success("Setting saved!");
    },
  });

  const handleSave = (key, value) => saveMut.mutateAsync({ key, value });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Branding & Settings</h2>
        <p className="text-sm text-muted-foreground">Changes apply site-wide: Home, PDF reports, and all pages.</p>
      </div>

      {/* Logo */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" /> Logo Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Main Logo (Header, PDF, Login)"
            settingKey="logo_url"
            value={getVal("logo_url")}
            onSave={handleSave}
            type="image"
            hint="PNG / JPG / SVG — shown on navbar and PDF reports"
          />
          <SettingRow
            label="Favicon URL"
            settingKey="favicon_url"
            value={getVal("favicon_url")}
            onSave={handleSave}
            type="image"
            hint="Small icon shown in browser tab (32x32 or 64x64 PNG)"
          />
        </CardContent>
      </Card>

      {/* Site Identity */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Site Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Institute Name (Bengali)"
            settingKey="institute_name_bn"
            value={getVal("institute_name_bn")}
            onSave={handleSave}
            hint="Shown on homepage header and PDF"
          />
          <SettingRow
            label="Institute Name (English)"
            settingKey="institute_name_en"
            value={getVal("institute_name_en")}
            onSave={handleSave}
          />
          <SettingRow
            label="Institute Name (Arabic)"
            settingKey="institute_name_ar"
            value={getVal("institute_name_ar")}
            onSave={handleSave}
            hint="Shown on homepage header and footer when Arabic is selected"
          />
          <SettingRow
            label="Address"
            settingKey="address"
            value={getVal("address")}
            onSave={handleSave}
            hint="Shown on homepage and PDF footer"
          />
          <SettingRow
            label="Footer Text"
            settingKey="footer_text"
            value={getVal("footer_text")}
            onSave={handleSave}
            hint='e.g., "Maintained with care, discipline & responsibility"'
          />
          <SettingRow
            label="Contact Phone"
            settingKey="contact_phone"
            value={getVal("contact_phone")}
            onSave={handleSave}
          />
        </CardContent>
      </Card>

      {/* Admission Form */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Admission Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Admission Form File (PDF/DOC/Image)"
            settingKey="admission_form_url"
            value={getVal("admission_form_url")}
            onSave={handleSave}
            type="image"
            hint="PDF, DOC, or Image file for download on admission page"
          />
          {getVal("admission_form_url") && (
            <div className="flex gap-2">
              <a
                href={`/api/public/download-pdf?url=${encodeURIComponent(getVal("admission_form_url"))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
              >
                <Download className="h-4 w-4" />
                Download Current File
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Student Counts Customization */}
      <DepartmentCountsForm appSettings={settings} onSave={handleSave} />

      {/* Admin Password Settings */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Admin Password Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-slate-500">
            For security reasons, you must provide your current password to set a new one. The password will not be shown in plain text.
          </p>
          <SecurePasswordChange />
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Eye className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Live Preview</p>
            <p className="text-xs text-amber-600">Changes take effect immediately after saving. Refresh the page to see updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}