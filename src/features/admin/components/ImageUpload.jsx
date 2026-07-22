import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { Upload, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ImageUpload({ value, onChange, label = "Upload Image" }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await appClient.integrations.Core.UploadFile({ file, label });
      onChange(file_url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error?.message || "Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold text-[#052E2B] uppercase tracking-wide">{label}</label>}
      <div className="flex items-center gap-4">
        {/* Preview Container */}
        <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 relative group">
          {value ? (
            <>
              <img src={value} loading="lazy" alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-red-400 hover:bg-transparent"
                  onClick={handleRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300" />
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <label className={`cursor-pointer inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-dashed border-[#052E2B]/30 hover:border-[#052E2B] text-sm text-[#052E2B] font-medium transition-all ${uploading ? 'pointer-events-none opacity-65' : ''}`}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Choose Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <p className="text-[10px] text-gray-400 mt-1">Recommended size: Square (1:1) or Landscape (16:9) image. PNG, JPG, WEBP.</p>
        </div>
      </div>
    </div>
  );
}
