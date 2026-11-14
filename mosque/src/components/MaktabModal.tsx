"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/client";

import { useRouter } from "next/navigation";

export function MaktabModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [batch, setBatch] = useState("Morning");
  const [progressLevel, setProgressLevel] = useState("Qaida");
  const [rollNo, setRollNo] = useState("");
  const [currentLesson, setCurrentLesson] = useState("");
  const [msg, setMsg] = useState("");

  const loadStudents = () => {
    setLoading(true);
    api<{ students: any[] }>("/api/maktab")
      .then((res) => setStudents(res.students))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/maktab", {
        method: "POST",
        body: JSON.stringify({ name, guardianName, guardianPhone, batch, progressLevel, rollNo: rollNo || undefined, currentLesson: currentLesson || undefined }),
      });
      setMsg("শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে!");
      setShowAddForm(false);
      setName("");
      setGuardianName("");
      setGuardianPhone("");
      setRollNo("");
      setCurrentLesson("");
      loadStudents();
    } catch {
      setMsg("শিক্ষার্থী যোগ করা যায়নি");
    }
  };

  const handleMarkAttendance = async (studentId: string, status: "PRESENT" | "ABSENT") => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api("/api/maktab", {
        method: "POST",
        body: JSON.stringify({
          type: "attendance",
          studentId,
          date: today,
          status,
          sabaqRating: "GOOD",
        }),
      });
      setMsg("হাজিরা সংরক্ষিত হয়েছে!");
      loadStudents();
    } catch {
      setMsg("হাজিরা নিতে সমস্যা হয়েছে");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("শিক্ষার্থীকে তালিকা থেকে মুছে ফেলতে চান?")) return;
    try {
      await api(`/api/maktab?id=${studentId}`, { method: "DELETE" });
      setMsg("শিক্ষার্থী মুছে ফেলা হয়েছে!");
      loadStudents();
    } catch {
      setMsg("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🏫</span>
            <span>মসজিদ নূরানী মক্তব ও তালিম</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => { onClose(); router.push("/maktab"); }}
              style={{ background: "var(--pri-light)", border: "1px solid var(--pri)", color: "var(--pri-dark)", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              🌐 সম্পূর্ণ ওয়েবসাইটে যান ↗
            </button>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body">
          {msg && (
            <div style={{ padding: "8px 12px", background: "var(--pri-light)", color: "var(--pri-dark)", borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>শিক্ষার্থীদের তালিকা, ফটো ও হাজিরা</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>মোট শিক্ষার্থী: {students.length} জন</div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: "var(--pri)", color: "#fff", border: 0, padding: "8px 14px",
                borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {showAddForm ? "✕ বন্ধ করুন" : "+ নতুন শিক্ষার্থী"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddStudent} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>নতুন শিক্ষার্থী ভর্তি ফর্ম:</div>
              <input
                type="text" placeholder="শিক্ষার্থীর নাম" value={name} required
                onChange={(e) => setName(e.target.value)} className="input-field"
              />
              <input
                type="text" placeholder="অভিভাবকের নাম" value={guardianName} required
                onChange={(e) => setGuardianName(e.target.value)} className="input-field"
              />
              <input
                type="text" placeholder="অভিভাবকের মোবাইল নম্বর" value={guardianPhone} required
                onChange={(e) => setGuardianPhone(e.target.value)} className="input-field"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <select value={batch} onChange={(e) => setBatch(e.target.value)} className="input-field">
                  <option value="Morning">সকালের শিফট</option>
                  <option value="Afternoon">বিকালের শিফট</option>
                </select>
                <select value={progressLevel} onChange={(e) => setProgressLevel(e.target.value)} className="input-field">
                  <option value="Qaida">কায়েদা</option>
                  <option value="Ampara">আমপারা</option>
                  <option value="Nazera">নাজেরা</option>
                  <option value="Hifz">হিফজ</option>
                </select>
              </div>
              <button type="submit" className="btn-pri">ভর্তি নিশ্চিত করুন</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>শিক্ষার্থী লোড হচ্ছে...</div>
          ) : students.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
              কোনো শিক্ষার্থী নেই। নতুন শিক্ষার্থী যোগ করুন।
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {students.map((s) => (
                <div key={s.id} style={{ border: "1px solid var(--bd)", borderRadius: 14, padding: 12, background: "var(--card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        অভিভাবক: {s.guardianName} ({s.guardianPhone})
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, background: "var(--pri-light)", color: "var(--pri-dark)", padding: "2px 6px", borderRadius: 999, fontWeight: 700 }}>
                          {s.batch === "Morning" ? "সকাল" : "বিকাল"}
                        </span>
                        <span style={{ fontSize: 10, background: "rgba(5,150,105,0.1)", color: "var(--pri)", padding: "2px 6px", borderRadius: 999, fontWeight: 700 }}>
                          পাঠ: {s.progressLevel}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                        style={{ border: 0, background: "var(--ok)", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        উপস্থিত ✓
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                        style={{ border: 0, background: "rgba(239,68,68,0.15)", color: "var(--bad)", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        অনুপস্থিত ✕
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s.id)}
                        title="শিক্ষার্থী মুছুন"
                        style={{ border: "1px solid var(--bd)", background: "transparent", color: "var(--bad)", borderRadius: 8, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
