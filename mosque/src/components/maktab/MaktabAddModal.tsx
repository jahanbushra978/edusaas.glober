"use client";
import { useState } from "react";

interface MaktabAddModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    guardianName: string;
    guardianPhone: string;
    batch: string;
    progressLevel: string;
    rollNo?: string;
    photoUrl?: string;
    currentLesson?: string;
  }) => Promise<void>;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595454223600-91fb5ac24458?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=200&auto=format&fit=crop&q=80",
];

export function MaktabAddModal({ onClose, onSubmit }: MaktabAddModalProps) {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0]!);
  const [customPhoto, setCustomPhoto] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [batch, setBatch] = useState("Morning");
  const [progressLevel, setProgressLevel] = useState("Qaida");
  const [currentLesson, setCurrentLesson] = useState("কায়দা পৃষ্ঠা ১");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "আপলোড ব্যর্থ হয়েছে");
      }
      const data = await res.json();
      setCustomPhoto(data.url);
      setPhotoUrl(data.url);
    } catch (e: any) {
      setErr(e?.message || "ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      setErr("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await onSubmit({
        name: name.trim(),
        rollNo: rollNo.trim() || undefined,
        photoUrl: customPhoto.trim() || photoUrl,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        batch,
        progressLevel,
        currentLesson: currentLesson.trim() || undefined,
      });
      onClose();
    } catch {
      setErr("ভর্তি করতে সমস্যা হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🏫</span>
            <span>+ নতুন শিক্ষার্থী ভর্তি ফর্ম</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {err && <div style={{ color: "var(--bad)", marginBottom: 8, fontSize: 13 }}>{err}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Photo Selection with Direct Upload */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                বাচ্চার ছবি আপলোড করুন বা সিলেক্ট করুন:
              </span>

              {/* Direct file upload button */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--pri-light)",
                    border: "1.5px dashed var(--pri)",
                    borderRadius: 10,
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--pri-dark)",
                  }}
                >
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  <span>📁 ছবি আপলোড (Cloudinary)</span>
                </label>
                {uploading && <span style={{ fontSize: 12, color: "var(--pri)" }}>⏳ আপলোড হচ্ছে...</span>}
                {customPhoto && !uploading && (
                  <span style={{ fontSize: 11, color: "var(--ok)", fontWeight: 700 }}>✓ ছবি আপলোড সম্পন্ন</span>
                )}
              </div>

              {customPhoto && (
                <div style={{ width: 64, height: 64, borderRadius: 14, overflow: "hidden", border: "2px solid var(--pri)", marginBottom: 8 }}>
                  <img src={customPhoto} alt="Uploaded student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              {/* Preset Avatars */}
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>বা পছন্দের অবতার নির্বাচন করুন:</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {PRESET_AVATARS.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setPhotoUrl(url); setCustomPhoto(""); }}
                    style={{
                      width: 48,
                      height: 48,
                      minWidth: 48,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: (photoUrl === url && !customPhoto) ? "3px solid var(--pri)" : "1.5px solid var(--bd)",
                      opacity: (photoUrl === url && !customPhoto) ? 1 : 0.65,
                    }}
                  >
                    <img src={url} alt="Preset avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
              <label className="field">
                <span>শিক্ষার্থীর পুরো নাম</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: মুহাম্মদ আব্দুল্লাহ" />
              </label>
              <label className="field">
                <span>রোল নং</span>
                <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="যেমন: ০৭" />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label className="field">
                <span>পড়ার বিভাগ / স্তর</span>
                <select value={progressLevel} onChange={(e) => setProgressLevel(e.target.value)}>
                  <option value="Qaida">নূরানী কায়দা</option>
                  <option value="Ampara">আমপারা</option>
                  <option value="Nazera">নাজেরা কুরআন</option>
                  <option value="Hifz">হিফজুল কুরআন</option>
                </select>
              </label>
              <label className="field">
                <span>শাখা / ব্যাচ</span>
                <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                  <option value="Morning">সকালের ব্যাচ (০৬:৩০ - ০৮:০০)</option>
                  <option value="Afternoon">বিকেলের ব্যাচ (আসর পর)</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>বর্তমান সবক বা পৃষ্ঠা</span>
              <input value={currentLesson} onChange={(e) => setCurrentLesson(e.target.value)} placeholder="যেমন: কায়দা পৃষ্ঠা ১৪ / সূরা নাবা" />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label className="field">
                <span>অভিভাবকের নাম</span>
                <input required value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="যেমন: হাজী রফিকুল ইসলাম" />
              </label>
              <label className="field">
                <span>অভিভাবকের মোবাইল</span>
                <input required value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="যেমন: 01711223344" />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--bd)", padding: "7px 14px", borderRadius: 10, cursor: "pointer" }}>
                বাতিল
              </button>
              <button type="submit" disabled={busy} className="btn" style={{ width: "auto" }}>
                {busy ? "ভর্তি হচ্ছে..." : "✓ শিক্ষার্থী ভর্তি নিশ্চিত করুন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
