import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText, Download, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import uploadToCloudinary from "@/lib/cloudinary";

export default function DownloadFormManager() {
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const getSetting = (key) => (Array.isArray(settings) ? settings : []).find((s) => s.key === key)?.value || "";
  const currentUrl = getSetting("admission_form_url");

  const [urlVal, setUrlVal] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const saveMut = useMutation({
    mutationFn: async ({ key, value }) => {
      const existing = (Array.isArray(settings) ? settings : []).find((s) => s.key === key);
      if (existing) {
        return appClient.entities.AppSettings.update(existing.id, { value });
      } else {
        return appClient.entities.AppSettings.create({ key, value });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-settings-public"] });
      toast.success("Form saved!");
    },
  });

  const handleUrlSave = () => {
    saveMut.mutateAsync({ key: "admission_form_url", value: urlVal });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const { file_url } = await uploadToCloudinary({
        file,
        folder: "rahmania/forms",
        label: "document",
        onProgress: (p) => setUploadProgress(p),
      });
      setUrlVal(file_url);
      await saveMut.mutateAsync({ key: "admission_form_url", value: file_url });
      toast.success("Form uploaded & saved!");
    } catch (err) {
      toast.error(err?.message || "Upload failed. Try again.");
    }
    setUploading(false);
    setUploadProgress(0);
  };

  // Use proxy API for reliable PDF download (avoids Cloudinary auth/CORS issues)
  const getDownloadUrl = (url) => {
    if (!url) return "#";
    return `/api/public/download-pdf?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-primary">Download Form Management</h2>
        <p className="text-sm text-muted-foreground">Upload the admission form PDF or file for public download.</p>
      </div>

      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Upload Admission Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {currentUrl && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800">Form uploaded</p>
                <p className="text-xs text-emerald-600 truncate">{currentUrl}</p>
              </div>
              <a
                href={getDownloadUrl(currentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wide">Upload Form File</label>
            <p className="text-xs text-muted-foreground">PDF, DOC, or Image file</p>
            <label className="cursor-pointer inline-flex flex-col gap-1">
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-md">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? `Uploading... ${uploadProgress}%` : "Choose File & Upload"}
              </span>
              {uploading && (
                <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wide">Or paste file URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/form.pdf"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUrlSave} className="gap-1.5">
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
