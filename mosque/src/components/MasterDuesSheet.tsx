"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/client";
import { useMe } from "./Shell";

interface MasterDuesData {
  periods: string[];
  items: Array<{
    membershipId: string;
    name: string;
    loginId: string;
    role: string;
    monthlyPledge: number;
    totalDue: number;
    totalPaid: number;
    totalOutstanding: number;
    periods: Array<{
      period: string;
      due: number;
      paid: number;
      outstanding: number;
      status: "PAID" | "PARTIAL" | "UNPAID" | "EXEMPT";
    }>;
  }>;
  totals: {
    due: number;
    paid: number;
    outstanding: number;
    memberCount: number;
  };
}

export function MasterDuesSheet({ onRecordPayment }: { onRecordPayment?: (membershipId: string, name: string) => void }) {
  const me = useMe();
  const canRecord = me.permissions.includes("payments.record");
  const canManageMembers = me.permissions.includes("members.manage");

  const [data, setData] = useState<MasterDuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "paid">("all");

  // Add member modal inside Master Sheet
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [pledge, setPledge] = useState(500);
  const [password, setPassword] = useState("Mosque@12345");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const refreshData = () => {
    setLoading(true);
    api<MasterDuesData>("/api/master-dues")
      .then(setData)
      .catch((e) => console.error("Master dues error:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim()) return;
    setAdding(true);
    setAddMsg("");
    try {
      await api("/api/members", {
        method: "POST",
        body: { name: name.trim(), loginId: loginId.trim(), monthlyPledge: Number(pledge), password: password.trim() || "Mosque@12345" },
      });
      setAddMsg("সদস্য যুক্ত হয়েছে!");
      setName("");
      setLoginId("");
      setShowAdd(false);
      refreshData();
    } catch {
      setAddMsg("সদস্য যুক্ত করা যায়নি (সম্ভবত এই আইডি আগেই আছে)");
    } finally {
      setAdding(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: "center", padding: 30 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
        <div>মাসিক মাস্টার হিসাব লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "var(--bad)", padding: 20 }}>হিসাব লোড করা যায়নি।</div>;
  }

  const filteredItems = data.items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.loginId && item.loginId.toLowerCase().includes(search.toLowerCase()));
    if (!matchSearch) return false;
    if (filter === "due") return item.totalOutstanding > 0;
    if (filter === "paid") return item.totalOutstanding === 0;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Read-only indicator for general members */}
      {!canRecord && (
        <div style={{ padding: "6px 12px", background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 10, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>👀</span>
          <span>সাধারণ সদস্য মোড (Read-only): আপনি শুধুমাত্র মসজিদের সার্বিক ইনফাক ও হিসাব দেখতে পারবেন।</span>
        </div>
      )}

      {/* Grand Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 14, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>মোট নির্ধারিত</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>৳{data.totals.due.toLocaleString("bn-BD")}</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #a7f3d0", borderRadius: 14, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "var(--ok)" }}>মোট আদায়</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ok)" }}>৳{data.totals.paid.toLocaleString("bn-BD")}</div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #fecaca", borderRadius: 14, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "var(--bad)" }}>মোট বকেয়া</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--bad)" }}>৳{data.totals.outstanding.toLocaleString("bn-BD")}</div>
        </div>
      </div>

      {/* Search, Filters and Add Member Button */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="সদস্যের নাম বা আইডি খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ flex: 1, minWidth: 160, marginBottom: 0 }}
        />

        <div style={{ display: "flex", gap: 4, background: "var(--bg)", padding: 3, borderRadius: 12, border: "1px solid var(--bd)" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              border: 0, padding: "6px 12px", borderRadius: 10, fontSize: 12, cursor: "pointer",
              background: filter === "all" ? "var(--pri)" : "transparent",
              color: filter === "all" ? "#fff" : "var(--muted)", fontWeight: 600,
            }}
          >
            সব ({data.items.length})
          </button>
          <button
            onClick={() => setFilter("due")}
            style={{
              border: 0, padding: "6px 12px", borderRadius: 10, fontSize: 12, cursor: "pointer",
              background: filter === "due" ? "var(--bad)" : "transparent",
              color: filter === "due" ? "#fff" : "var(--muted)", fontWeight: 600,
            }}
          >
            বকেয়া
          </button>
          <button
            onClick={() => setFilter("paid")}
            style={{
              border: 0, padding: "6px 12px", borderRadius: 10, fontSize: 12, cursor: "pointer",
              background: filter === "paid" ? "var(--ok)" : "transparent",
              color: filter === "paid" ? "#fff" : "var(--muted)", fontWeight: 600,
            }}
          >
            পরিশোধিত
          </button>
        </div>

        {canManageMembers && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: "var(--pri)", color: "#fff", border: 0, borderRadius: 10, padding: "7px 12px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            + নতুন সদস্য
          </button>
        )}
      </div>

      {/* Add Member Inline Modal */}
      {showAdd && (
        <form onSubmit={handleAddMember} style={{ background: "var(--pri-light)", border: "1.5px solid var(--pri)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b style={{ color: "var(--pri-dark)", fontSize: 14 }}>+ নতুন সদস্যের তথ্য এন্ট্রি করুন:</b>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: 700 }}>✕</button>
          </div>
          {addMsg && <div style={{ fontSize: 12, color: "var(--bad)" }}>{addMsg}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input required placeholder="সদস্যের পুরো নাম" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--bd)" }} />
            <input required placeholder="ইউজার আইডি / মোবাইল নং" value={loginId} onChange={(e) => setLoginId(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--bd)" }} />
            <input type="number" min="0" required placeholder="মাসিক ইনফাক (৳)" value={pledge} onChange={(e) => setPledge(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--bd)" }} />
            <input required placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--bd)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "1px solid var(--bd)", padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>বাতিল</button>
            <button type="submit" disabled={adding} style={{ background: "var(--pri)", color: "#fff", border: 0, padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{adding ? "যোগ হচ্ছে..." : "✓ সদস্য যোগ করুন"}</button>
          </div>
        </form>
      )}

      {/* Unified Master Table */}
      <div className="master-table-wrapper" style={{ maxHeight: "55vh", overflowY: "auto" }}>
        <table className="master-table">
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, zIndex: 2, background: "var(--bg)" }}>সদস্য</th>
              <th>মাসিক ইনফাক</th>
              {data.periods.slice(0, 4).map((p) => (
                <th key={p}>{p}</th>
              ))}
              <th>মোট আদায়</th>
              <th>মোট বাকি</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.membershipId}>
                <td style={{ position: "sticky", left: 0, background: "var(--card)", zIndex: 1, fontWeight: 600 }}>
                  <div>{item.name}</div>
                  <small style={{ color: "var(--muted)", fontSize: 11 }}>
                    {item.loginId ? `@${item.loginId} · ` : ""}{item.role}
                  </small>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>৳{item.monthlyPledge}</td>
                {item.periods.slice(0, 4).map((p) => (
                  <td key={p.period} style={{ whiteSpace: "nowrap" }}>
                    <span className={`badge badge-${p.status}`}>
                      {p.status === "PAID" ? "পরিশোধিত" : p.status === "PARTIAL" ? `৳${p.paid}` : "বাকি"}
                    </span>
                  </td>
                ))}
                <td style={{ color: "var(--ok)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  ৳{item.totalPaid.toLocaleString("bn-BD")}
                </td>
                <td style={{ color: item.totalOutstanding > 0 ? "var(--bad)" : "var(--muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  ৳{item.totalOutstanding.toLocaleString("bn-BD")}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {canRecord ? (
                    <button
                      onClick={() => onRecordPayment && onRecordPayment(item.membershipId, item.name)}
                      style={{
                        border: "1px solid var(--pri)", background: "var(--pri-light)",
                        color: "var(--pri-dark)", borderRadius: 8, padding: "4px 8px",
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      + ইনফাক গ্রহণ
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Read-only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
