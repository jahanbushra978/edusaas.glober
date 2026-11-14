"use client";
import { useState, useEffect } from "react";

interface MaktabHeroProps {
  totalStudents: number;
  presentCount: number;
  qaidaCount: number;
  advancedCount: number;
  onAddStudent: () => void;
}

const DEFAULT_HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80",
];

export function MaktabHero({
  totalStudents,
  presentCount,
  qaidaCount,
  advancedCount,
  onAddStudent,
}: MaktabHeroProps) {
  const [photos, setPhotos] = useState<string[]>(DEFAULT_HERO_PHOTOS);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("maktab_hero_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setPhotos(parsed);
      }
    } catch {}
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError("");
    }
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !newPhotoUrl.trim()) {
      setUploadError("অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন বা লিংক দিন");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      let finalUrl = newPhotoUrl.trim();

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error || "আপলোড ব্যর্থ হয়েছে");
        }
        const data = await res.json();
        finalUrl = data.url;
      }

      if (finalUrl) {
        const updated = [finalUrl, ...photos];
        setPhotos(updated);
        try {
          localStorage.setItem("maktab_hero_photos", JSON.stringify(updated));
        } catch {}
        setSelectedFile(null);
        setPreviewUrl(null);
        setNewPhotoUrl("");
        setShowPhotoModal(false);
      }
    } catch (err: any) {
      setUploadError(err?.message || "ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const handleResetPhotos = () => {
    setPhotos(DEFAULT_HERO_PHOTOS);
    try {
      localStorage.removeItem("maktab_hero_photos");
    } catch {}
    setShowPhotoModal(false);
  };

  const attendancePercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Hero Banner Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)",
          borderRadius: 24,
          padding: "24px 20px",
          color: "#fff",
          boxShadow: "0 12px 36px rgba(6, 78, 59, 0.22)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                <span>🏫</span>
                <span>নূরানী মক্তব ও হিফজ একাডেমি পোর্টাল</span>
              </div>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, margin: "0 0 8px", lineHeight: 1.25 }}>
                ছোটদের কুরআন শিক্ষা ও দ্বীনি তারবিয়াত
              </h1>
              <p style={{ fontSize: 13, opacity: 0.9, margin: 0, maxWidth: 480, lineHeight: 1.5 }}>
                প্রতিটি শিশুর সহীহ মাখরাজ ও তাজভীদসহ কুরআন তিলাওয়াত, মাসনুন দু&apos;আ, নামায শিক্ষা এবং দৈনিক উপস্থিতির ডিজিটাল মূল্যায়ন।
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowPhotoModal(true)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>📸</span>
                <span>হিরো ফটো আপলোড / গ্যালারি</span>
              </button>
              <button
                onClick={onAddStudent}
                style={{
                  background: "#fef08a",
                  border: 0,
                  color: "#854d0e",
                  padding: "8px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                }}
              >
                + নতুন শিক্ষার্থী ভর্তি
              </button>
            </div>
          </div>

          {/* Kids Photo Strip in Hero */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span>👥</span>
              <span>মক্তবের শিক্ষার্থীদের আলোকচিত্র (ছবি):</span>
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
              {photos.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 76,
                    height: 76,
                    minWidth: 76,
                    borderRadius: 16,
                    border: "2.5px solid rgba(255,255,255,0.8)",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    background: "#065f46",
                  }}
                >
                  <img src={src} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
              <button
                onClick={() => setShowPhotoModal(true)}
                style={{
                  width: 76,
                  height: 76,
                  minWidth: 76,
                  borderRadius: 16,
                  border: "2px dashed rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 20 }}>+</span>
                <span>ছবি আপলোড</span>
              </button>
            </div>
          </div>

          {/* KPI Statistics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 10,
              marginTop: 18,
              background: "rgba(0,0,0,0.18)",
              backdropFilter: "blur(4px)",
              padding: 12,
              borderRadius: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>মোট শিক্ষার্থী</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{totalStudents} জন</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>আজকের উপস্থিতি</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#a7f3d0" }}>
                {presentCount} ({attendancePercent}%)
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>কায়দা ও আমপারা</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{qaidaCount} জন</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>নাজেরা ও হিফজ</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{advancedCount} জন</div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Image Upload & Gallery Modal */}
      {showPhotoModal && (
        <div className="modal-backdrop" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title"><span>📸</span><span>সরাসরি ছবি আপলোড (Cloudinary)</span></div>
              <button className="modal-close-btn" onClick={() => setShowPhotoModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUploadAndSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {uploadError && (
                  <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "var(--bad)", borderRadius: 10, fontSize: 13 }}>
                    {uploadError}
                  </div>
                )}

                {/* File picker dropzone */}
                <label
                  style={{
                    border: "2px dashed var(--pri)",
                    borderRadius: 16,
                    padding: "20px 14px",
                    textAlign: "center",
                    background: "var(--pri-light)",
                    cursor: "pointer",
                    display: "block",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: 32, marginBottom: 6 }}>☁️ 📁</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pri-dark)" }}>
                    {selectedFile ? selectedFile.name : "📁 ডিভাইস বা ক্যামেরা থেকে ছবি বেছে নিন"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                    ক্লাউডিনারি (Cloudinary) স্টোরেজে সরাসরি আপলোড হবে
                  </div>
                </label>

                {previewUrl && (
                  <div style={{ width: "100%", height: 160, borderRadius: 12, overflow: "hidden", border: "1px solid var(--bd)", position: "relative" }}>
                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: 0, borderRadius: 999, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div style={{ fontSize: 11, textAlign: "center", color: "var(--muted)" }}>— অথবা ছবির URL লিংক দিন —</div>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => {
                    setNewPhotoUrl(e.target.value);
                    if (e.target.value) { setSelectedFile(null); setPreviewUrl(null); }
                  }}
                  placeholder="https://example.com/child-photo.jpg"
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 13 }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                  <button type="button" onClick={handleResetPhotos} style={{ background: "transparent", border: "1px solid var(--bd)", padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                    ডিফল্ট ছবি রিসেট
                  </button>
                  <button type="submit" disabled={uploading} className="btn" style={{ width: "auto" }}>
                    {uploading ? "⏳ ক্লাউডিনারিতে আপলোড হচ্ছে..." : "✓ সরাসরি আপলোড করুন"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
