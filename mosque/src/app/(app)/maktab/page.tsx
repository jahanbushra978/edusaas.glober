"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { MaktabHero } from "@/components/maktab/MaktabHero";
import { MaktabStudentCard, type StudentData } from "@/components/maktab/MaktabStudentCard";
import { MaktabAddModal } from "@/components/maktab/MaktabAddModal";

export default function MaktabPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "morning" | "afternoon" | "qaida" | "ampara" | "advanced">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadData = () => {
    setLoading(true);
    api<{ students: StudentData[] }>("/api/maktab")
      .then((res) => setStudents(res.students))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT" | "EXCUSED", rating?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api("/api/maktab", {
        method: "POST",
        body: { type: "attendance", studentId, date: today, status, sabaqRating: rating || "GOOD" },
      });
      showToast("হাজিরা সংরক্ষিত হয়েছে!");
      loadData();
    } catch {
      showToast("হাজিরা নিতে সমস্যা হয়েছে");
    }
  };

  const handleUpdateLesson = async (studentId: string, currentLesson: string, progressLevel: string) => {
    try {
      await api("/api/maktab", {
        method: "PATCH",
        body: { id: studentId, currentLesson, progressLevel },
      });
      showToast("সবক ও স্তর আপডেট করা হয়েছে!");
      loadData();
    } catch {
      showToast("আপডেট করা যায়নি");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই শিক্ষার্থীকে মুছে ফেলতে চান?")) return;
    try {
      await api(`/api/maktab?id=${studentId}`, { method: "DELETE" });
      showToast("শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে!");
      loadData();
    } catch {
      showToast("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  const handleAddStudent = async (data: any) => {
    await api("/api/maktab", {
      method: "POST",
      body: data,
    });
    showToast("নতুন শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে!");
    loadData();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const presentCount = students.filter((s) => s.attendances?.some((a) => a.date === todayStr && a.status === "PRESENT")).length;
  const qaidaCount = students.filter((s) => s.progressLevel === "Qaida" || s.progressLevel === "Ampara").length;
  const advancedCount = students.filter((s) => s.progressLevel === "Nazera" || s.progressLevel === "Hifz").length;

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo && s.rollNo.includes(search)) ||
      s.guardianName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "morning") return s.batch === "Morning";
    if (filter === "afternoon") return s.batch === "Afternoon";
    if (filter === "qaida") return s.progressLevel === "Qaida";
    if (filter === "ampara") return s.progressLevel === "Ampara";
    if (filter === "advanced") return s.progressLevel === "Nazera" || s.progressLevel === "Hifz";
    return true;
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Breadcrumb & Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--card)",
            border: "1px solid var(--bd)",
            padding: "8px 16px",
            borderRadius: 12,
            color: "var(--pri)",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <span>←</span>
          <span>অ্যাপ ড্যাশবোর্ডে ফিরুন</span>
        </Link>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "var(--pri)",
              color: "#fff",
              border: 0,
              padding: "8px 16px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + নতুন শিক্ষার্থী ভর্তি
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{ padding: "10px 16px", background: "var(--pri-light)", color: "var(--pri-dark)", borderRadius: 12, marginBottom: 14, fontWeight: 600, fontSize: 13 }}>
          {toastMsg}
        </div>
      )}

      {/* Maktab Hero Section */}
      <MaktabHero
        totalStudents={students.length}
        presentCount={presentCount}
        qaidaCount={qaidaCount}
        advancedCount={advancedCount}
        onAddStudent={() => setShowAddModal(true)}
      />

      {/* Search and Filter Tabs */}
      <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 শিক্ষার্থীর নাম, রোল বা অভিভাবক খুঁজুন..."
            style={{ flex: 1, minWidth: 220, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 13 }}
          />

          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { id: "all", label: `সকল (${students.length})` },
              { id: "morning", label: "সকাল" },
              { id: "afternoon", label: "বিকেল" },
              { id: "qaida", label: "কায়দা" },
              { id: "ampara", label: "আমপারা" },
              { id: "advanced", label: "নাজেরা ও হিফজ" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id as any)}
                style={{
                  border: 0,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: filter === btn.id ? "var(--pri)" : "var(--bg)",
                  color: filter === btn.id ? "#fff" : "var(--muted)",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Grid Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <div>শিক্ষার্থীদের তথ্য লোড হচ্ছে...</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "var(--card)", borderRadius: 18, border: "1px solid var(--bd)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>কোনো শিক্ষার্থী পাওয়া যায়নি</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>অনুসন্ধান পরিবর্তন করুন বা নতুন শিক্ষার্থী যোগ করুন।</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filteredStudents.map((student) => (
            <MaktabStudentCard
              key={student.id}
              student={student}
              onMarkAttendance={handleMarkAttendance}
              onUpdateLesson={handleUpdateLesson}
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <MaktabAddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
        />
      )}
    </div>
  );
}
