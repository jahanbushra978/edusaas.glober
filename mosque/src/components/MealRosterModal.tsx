"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/client";

export function MealRosterModal({ onClose }: { onClose: () => void }) {
  const [rosters, setRosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dayName, setDayName] = useState("আজকের দিন");
  const [mealType, setMealType] = useState<"LUNCH" | "DINNER" | "BOTH">("BOTH");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const loadRoster = () => {
    setLoading(true);
    api<{ rosters: any[] }>("/api/meal-roster")
      .then((res) => setRosters(res.rosters))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoster();
  }, []);

  const handleAddRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/meal-roster", {
        method: "POST",
        body: JSON.stringify({
          date,
          dayName: dayName || "তারিখ নির্ধারিত",
          householdName,
          contactNumber,
          mealType,
          notes,
        }),
      });
      setMsg("খাবারের শিডিউল সফলভাবে বুকিং করা হয়েছে!");
      setShowAddForm(false);
      setHouseholdName("");
      setContactNumber("");
      loadRoster();
    } catch {
      setMsg("শিডিউল সংরক্ষণ করা যায়নি");
    }
  };

  const handleToggleDelivered = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "DELIVERED" ? "CONFIRMED" : "DELIVERED";
    try {
      await api("/api/meal-roster", {
        method: "POST",
        body: JSON.stringify({ action: "update-status", id, status: newStatus }),
      });
      setMsg(newStatus === "DELIVERED" ? "খাবার প্রাপ্তি নিশ্চিত করা হয়েছে!" : "স্ট্যাটাস পরিবর্তন হয়েছে");
      loadRoster();
    } catch {
      setMsg("স্ট্যাটাস আপডেট করা যায়নি");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("এই খাবার বুকিং বাতিল বা মুছে ফেলতে চান?")) return;
    try {
      await api(`/api/meal-roster?id=${id}`, { method: "DELETE" });
      setMsg("খাবার বুকিং মুছে ফেলা হয়েছে!");
      loadRoster();
    } catch {
      setMsg("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🍲</span>
            <span>ইমাম ও মুয়াজ্জিনের খাবার বণ্টন রোস্টার</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {msg && (
            <div style={{ padding: "8px 12px", background: "var(--pri-light)", color: "var(--pri-dark)", borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>দৈনিক খাবার বিতরণ ক্যালেন্ডার</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>কোন বাড়ি থেকে কোন দিন খাবার আসবে তার তালিকা</div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: "var(--pri)", color: "#fff", border: 0, padding: "8px 14px",
                borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {showAddForm ? "✕ বন্ধ করুন" : "+ খাবার বুকিং দিন"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddRoster} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>খাবার দেওয়ার দায়িত্ব গ্রহণ:</div>
              <input
                type="text" placeholder="বাড়ির প্রধান / পরিবারের নাম (যেমন: হাজী সাহেবের বাড়ি)"
                value={householdName} required onChange={(e) => setHouseholdName(e.target.value)} className="input-field"
              />
              <input
                type="text" placeholder="যোগাযোগের মোবাইল নম্বর"
                value={contactNumber} required onChange={(e) => setContactNumber(e.target.value)} className="input-field"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input
                  type="date" value={date} required onChange={(e) => setDate(e.target.value)} className="input-field"
                />
                <select value={mealType} onChange={(e) => setMealType(e.target.value as any)} className="input-field">
                  <option value="BOTH">দুপুর ও রাত উভয় বেলা</option>
                  <option value="LUNCH">শুধু দুপুরের খাবার</option>
                  <option value="DINNER">শুধু রাতের খাবার</option>
                </select>
              </div>
              <input
                type="text" placeholder="কোনো বিশেষ মন্তব্য বা মেনু (ঐচ্ছিক)"
                value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field"
              />
              <button type="submit" className="btn-pri">বুকিং নিশ্চিত করুন</button>
            </form>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>রোস্টার লোড হচ্ছে...</div>
          ) : rosters.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
              কোনো রোস্টার পাওয়া যায়নি। প্রথম খাবার বুকিং দিয়ে শুরু করুন।
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rosters.map((r) => (
                <div key={r.id} style={{ border: "1px solid var(--bd)", borderRadius: 14, padding: 12, background: "var(--card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.householdName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>মোবাইল: {r.contactNumber}</div>
                      <div style={{ fontSize: 12, color: "var(--pri)", fontWeight: 600, marginTop: 4 }}>
                        📅 তারিখ: {r.date} ({r.mealType === "BOTH" ? "দুপুর ও রাত" : r.mealType === "LUNCH" ? "দুপুর" : "রাত"})
                      </div>
                      {r.notes && <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", marginTop: 2 }}>মেনু: {r.notes}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => handleToggleDelivered(r.id, r.status)}
                        style={{
                          border: 0,
                          background: r.status === "DELIVERED" ? "var(--ok)" : "rgba(245,158,11,0.15)",
                          color: r.status === "DELIVERED" ? "#fff" : "var(--warn)",
                          borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        {r.status === "DELIVERED" ? "পৌঁছেছে ✔️" : "অপেক্ষমাণ ⏳"}
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(r.id)}
                        title="বুকিং মুছুন"
                        style={{ border: "1px solid var(--bd)", background: "transparent", color: "var(--bad)", borderRadius: 8, padding: "5px 8px", fontSize: 12, cursor: "pointer" }}
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
