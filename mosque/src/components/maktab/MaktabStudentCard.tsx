"use client";
import { useState } from "react";

export interface StudentData {
  id: string;
  name: string;
  guardianName: string;
  guardianPhone: string;
  batch: string;
  progressLevel: string;
  rollNo?: string | null;
  photoUrl?: string | null;
  currentLesson?: string | null;
  attendances?: Array<{
    id: string;
    date: string;
    status: string;
    sabaqRating?: string | null;
    notes?: string | null;
  }>;
}

interface MaktabStudentCardProps {
  student: StudentData;
  onMarkAttendance: (id: string, status: "PRESENT" | "ABSENT" | "EXCUSED", rating?: string) => void;
  onUpdateLesson: (id: string, lesson: string, level: string) => void;
  onDelete: (id: string) => void;
  onUpdatePhoto?: (id: string, photoUrl: string) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  Qaida: "নূরানী কায়দা",
  Ampara: "আমপারা",
  Nazera: "নাজেরা কুরআন",
  Hifz: "হিফজুল কুরআন",
};

export function MaktabStudentCard({
  student,
  onMarkAttendance,
  onUpdateLesson,
  onDelete,
  onUpdatePhoto,
}: MaktabStudentCardProps) {
  const [editingLesson, setEditingLesson] = useState(false);
  const [lessonText, setLessonText] = useState(student.currentLesson || "");
  const [level, setLevel] = useState(student.progressLevel || "Qaida");
  const [currentPhoto, setCurrentPhoto] = useState(student.photoUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = student.attendances?.find((a) => a.date === todayStr);
  const currentStatus = todayAttendance?.status || null;

  const handleSaveLesson = () => {
    onUpdateLesson(student.id, lessonText, level);
    setEditingLesson(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCurrentPhoto(data.url);
      if (onUpdatePhoto) {
        onUpdatePhoto(student.id, data.url);
      } else {
        await fetch("/api/maktab", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: student.id, photoUrl: data.url }),
        });
      }
    } catch {
      alert("ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80";

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--bd)",
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Top Header with Photo & Name */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label
          style={{
            width: 58,
            height: 58,
            minWidth: 58,
            borderRadius: 16,
            overflow: "hidden",
            border: "2px solid var(--pri)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            background: "var(--pri-light)",
            position: "relative",
            cursor: "pointer",
            display: "block",
          }}
          title="ক্লিক করে বাচ্চার নতুন ছবি আপলোড করুন"
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
          <img
            src={currentPhoto || defaultAvatar}
            alt={student.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultAvatar;
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 10,
              textAlign: "center",
              padding: "2px 0",
              fontWeight: 700,
            }}
          >
            {uploadingPhoto ? "⏳" : "📷"}
          </div>
        </label>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{student.name}</span>
            {student.rollNo && (
              <span style={{ background: "var(--pri-light)", color: "var(--pri-dark)", fontSize: 11, fontWeight: 800, padding: "1px 6px", borderRadius: 6 }}>
                রোল: {student.rollNo}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: "rgba(16,185,129,0.12)", color: "#059669", fontWeight: 700, padding: "2px 7px", borderRadius: 6 }}>
              {LEVEL_LABELS[student.progressLevel] || student.progressLevel}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {student.batch === "Morning" ? "সকালের ব্যাচ" : "বিকেলের ব্যাচ"}
            </span>
          </div>
        </div>
      </div>

      {/* Current Sabaq & Reading Progress */}
      <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 12, padding: "10px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>📖 বর্তমান সবক ও পড়ার মান:</span>
          <button
            onClick={() => setEditingLesson(!editingLesson)}
            style={{ background: "none", border: 0, color: "var(--pri)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            {editingLesson ? "বন্ধ" : "✏️ পরিবর্তন"}
          </button>
        </div>

        {editingLesson ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: 6, borderRadius: 8, fontSize: 12, border: "1px solid var(--bd)" }}>
              <option value="Qaida">নূরানী কায়দা</option>
              <option value="Ampara">আমপারা</option>
              <option value="Nazera">নাজেরা কুরআন</option>
              <option value="Hifz">হিফজুল কুরআন</option>
            </select>
            <input
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              placeholder="যেমন: কায়দা পৃষ্ঠা ১৪ / সূরা নাবা"
              style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, border: "1px solid var(--bd)" }}
            />
            <button onClick={handleSaveLesson} style={{ background: "var(--pri)", color: "#fff", border: 0, padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ✓ সবক সংরক্ষণ করুন
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {student.currentLesson || "সবক এখনও নির্ধারিত হয়নি"}
          </div>
        )}
      </div>

      {/* Today's Attendance Toggle */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
          📅 আজকের হাজিরা ({todayStr}):
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <button
            onClick={() => onMarkAttendance(student.id, "PRESENT", "EXCELLENT")}
            style={{
              padding: "7px 4px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: currentStatus === "PRESENT" ? "1.5px solid var(--ok)" : "1px solid var(--bd)",
              background: currentStatus === "PRESENT" ? "rgba(16,185,129,0.18)" : "var(--bg)",
              color: currentStatus === "PRESENT" ? "#047857" : "var(--text)",
            }}
          >
            ✓ উপস্থিত
          </button>
          <button
            onClick={() => onMarkAttendance(student.id, "ABSENT")}
            style={{
              padding: "7px 4px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: currentStatus === "ABSENT" ? "1.5px solid var(--bad)" : "1px solid var(--bd)",
              background: currentStatus === "ABSENT" ? "rgba(239,68,68,0.18)" : "var(--bg)",
              color: currentStatus === "ABSENT" ? "#b91c1c" : "var(--text)",
            }}
          >
            ✕ অনুপস্থিত
          </button>
          <button
            onClick={() => onMarkAttendance(student.id, "EXCUSED")}
            style={{
              padding: "7px 4px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: currentStatus === "EXCUSED" ? "1.5px solid var(--warn)" : "1px solid var(--bd)",
              background: currentStatus === "EXCUSED" ? "rgba(245,158,11,0.18)" : "var(--bg)",
              color: currentStatus === "EXCUSED" ? "#b45309" : "var(--text)",
            }}
          >
            ⊙ ছুটি
          </button>
        </div>
      </div>

      {/* Guardian Contact & Actions Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--bd)", paddingTop: 10, marginTop: 2 }}>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          <div>অভিভাবক: <b>{student.guardianName}</b></div>
          <a href={`tel:${student.guardianPhone}`} style={{ color: "var(--pri)", textDecoration: "none", fontWeight: 700 }}>
            📞 {student.guardianPhone}
          </a>
        </div>

        <button
          onClick={() => onDelete(student.id)}
          style={{ background: "rgba(239,68,68,0.08)", color: "var(--bad)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "5px 8px", fontSize: 12, cursor: "pointer" }}
          title="শিক্ষার্থী মুছুন"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
