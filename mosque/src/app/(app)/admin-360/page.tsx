"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { PaymentForm } from "@/components/PaymentForm";

interface MemberItem {
  id: string;
  name: string;
  loginId: string;
  role: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  pledge: number;
  due: number;
  paid: number;
}

export default function Admin360Page() {
  const [activeTab, setActiveTab] = useState<"members" | "finance" | "expenses" | "funds">("members");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<"all" | "pending" | "active" | "due">("all");
  const [selectedPayMember, setSelectedPayMember] = useState<{ id: string; name: string } | null>(null);
  const [msg, setMsg] = useState("");

  // Add member modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [newPledge, setNewPledge] = useState(500);
  const [newPass, setNewPass] = useState("Mosque@12345");
  const [savingMember, setSavingMember] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [memRes, expRes, dashRes] = await Promise.all([
        api<{ items: MemberItem[] }>("/api/members").catch(() => ({ items: [] })),
        api<{ items: any[] }>("/api/expenses").catch(() => ({ items: [] })),
        api<{ funds: any[]; totals: any }>("/api/dashboard").catch(() => ({ funds: [], totals: null })),
      ]);
      setMembers(memRes?.items || []);
      setExpenses(expRes?.items || []);
      setFunds(dashRes?.funds || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3500);
  };

  // Member Quick Actions
  const handleVerifyMember = async (id: string, name: string) => {
    const pledge = Number(prompt(`"${name}"-এর মাসিক চাঁদা (Pledge) নির্ধারণ করুন (টাকা):`, "500") || 500);
    try {
      await api(`/api/members/${id}`, { method: "PATCH", body: { status: "ACTIVE", monthlyPledge: pledge } });
      showToast(`সদস্য "${name}" সক্রিয় ও যাচাই করা হয়েছে!`);
      loadAllData();
    } catch {
      alert("যাচাই করতে সমস্যা হয়েছে");
    }
  };

  const handleChangePledge = async (id: string, name: string, currentPledge: number) => {
    const p = prompt(`"${name}"-এর নতুন মাসিক চাঁদা (টাকা):`, String(currentPledge));
    if (!p || isNaN(Number(p))) return;
    try {
      await api(`/api/members/${id}`, { method: "PATCH", body: { monthlyPledge: Number(p) } });
      showToast(`মাসিক চাঁদা ৳${p} আপডেট করা হয়েছে!`);
      loadAllData();
    } catch {
      alert("চাঁদার পরিমাণ আপডেট করা যায়নি");
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const pass = prompt(`"${name}"-এর নতুন পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর):`, "Mosque@12345");
    if (!pass || pass.trim().length < 8) return;
    try {
      await api(`/api/members/${id}`, { method: "PATCH", body: { password: pass.trim() } });
      showToast(`"${name}"-এর পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!`);
    } catch {
      alert("পাসওয়ার্ড আপডেট করা যায়নি");
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত সদস্য "${name}" মুছে ফেলতে চান?`)) return;
    try {
      await api(`/api/members/${id}`, { method: "DELETE" });
      showToast(`সদস্য "${name}" মুছে ফেলা হয়েছে!`);
      loadAllData();
    } catch {
      alert("আর্থিক লেনদেন থাকায় এই সদস্য মোছা যাবে না");
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLogin.trim()) return;
    setSavingMember(true);
    try {
      await api("/api/members", {
        method: "POST",
        body: { name: newName.trim(), loginId: newLogin.trim(), monthlyPledge: Number(newPledge), password: newPass.trim() || "Mosque@12345" },
      });
      showToast(`নতুন সদস্য "${newName}" সফলভাবে ভর্তি করা হয়েছে!`);
      setShowAddModal(false);
      setNewName("");
      setNewLogin("");
      setNewPledge(500);
      loadAllData();
    } catch {
      alert("সদস্য যুক্ত করতে সমস্যা হয়েছে (সম্ভবত এই আইডি আগেই আছে)");
    } finally {
      setSavingMember(false);
    }
  };

  // Expense Quick Actions
  const handleApproveExpense = async (id: string) => {
    const sig = prompt("ডিজিটাল স্বাক্ষর বা অনুমোদনকারীর নাম দিন:", "অনুমোদন: সভাপতি");
    if (sig === null) return;
    try {
      await api(`/api/expenses/${id}/decision`, { method: "POST", body: { decision: "APPROVE", approverSignature: sig || undefined } });
      showToast("বিল ডিজিটাল স্বাক্ষরে অনুমোদিত হয়েছে!");
      loadAllData();
    } catch {
      alert("নিজের বিল অনুমোদন করা যাবে না");
    }
  };

  const handleRejectExpense = async (id: string) => {
    const reason = prompt("বাতিল করার কারণ লিখুন:");
    if (!reason || reason.trim().length < 3) return;
    try {
      await api(`/api/expenses/${id}/decision`, { method: "POST", body: { decision: "REJECT", reason } });
      showToast("বিল বাতিল করা হয়েছে!");
      loadAllData();
    } catch {
      alert("বাতিল করা যায়নি");
    }
  };

  // Filtered members
  const pendingMembers = members.filter((m) => m.status === "PENDING");
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const defaulterMembers = members.filter((m) => Math.max(m.due - m.paid, 0) > 0);
  const pendingExpenses = expenses.filter((e) => e.status === "PENDING_APPROVAL");

  const displayedMembers = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.loginId.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (memberFilter === "pending") return m.status === "PENDING";
    if (memberFilter === "active") return m.status === "ACTIVE";
    if (memberFilter === "due") return Math.max(m.due - m.paid, 0) > 0;
    return true;
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Breadcrumb & Quick Jump */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--card)", border: "1px solid var(--bd)", padding: "8px 16px", borderRadius: 12, color: "var(--pri)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          <span>‹</span>
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAddModal(true)} style={{ background: "var(--pri)", color: "#fff", border: 0, padding: "8px 16px", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.2)" }}>
            + নতুন সদস্য যোগ
          </button>
          <Link href="/super-admin" style={{ background: "rgba(99,102,241,0.12)", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.3)", padding: "8px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            🌐 SaaS প্ল্যাটফর্ম ওনার
          </Link>
        </div>
      </div>

      {/* Hero 360 Header */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)", borderRadius: 24, padding: "24px 22px", color: "#fff", marginBottom: 20, boxShadow: "0 10px 30px rgba(6,78,59,0.25)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          <span>👑</span>
          <span>মসজিদের সকল কার্যক্রমের ৩৬০ ডিগ্রি সেন্ট্রাল কন্ট্রোল রুম</span>
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800 }}>
          মূল অ্যাডমিন ৩৬০ কমান্ড সেন্টার
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
          প্রতিটি সদস্যের হিসাব, চাঁদা গ্রহণ, পাসওয়ার্ড রিসেট, ব্যয় অনুমোদন এবং তহবিলের সার্বিক নিয়ন্ত্রণ এক ক্লিকে।
        </p>
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>মোট সদস্য</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{members.length} জন</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>সক্রিয় সদস্য</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{activeMembers.length} জন</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>অপেক্ষমাণ সদস্য</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: pendingMembers.length > 0 ? "var(--bad)" : "var(--muted)" }}>{pendingMembers.length} জন</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>বাকিদার সদস্য</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#e11d48" }}>{defaulterMembers.length} জন</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>অনুমোদনের বিল</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: pendingExpenses.length > 0 ? "#d97706" : "var(--muted)" }}>{pendingExpenses.length} টি</div>
        </div>
      </div>

      {msg && <div style={{ padding: "10px 14px", background: "var(--pri-light)", color: "var(--pri-dark)", borderRadius: 12, marginBottom: 14, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid var(--bd)", paddingBottom: 8, marginBottom: 16, overflowX: "auto" }}>
        {[
          { id: "members", label: `👥 সকল সদস্য ৩৬০ (${members.length})` },
          { id: "finance", label: "💰 চাঁদা গ্রহণ ও মাস্টার শিট" },
          { id: "expenses", label: `🧾 বিল ও ব্যয় অনুমোদন (${pendingExpenses.length})` },
          { id: "funds", label: `🏦 তহবিল ও ব্যালেন্স (${funds.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: "8px 16px", borderRadius: 12, border: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              background: activeTab === t.id ? "var(--pri)" : "var(--card)",
              color: activeTab === t.id ? "#fff" : "var(--text)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ALL MEMBERS 360 */}
      {activeTab === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Sub Filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "all", label: `সকল (${members.length})` },
                { id: "pending", label: `অপেক্ষমাণ (${pendingMembers.length})` },
                { id: "active", label: `সক্রিয় (${activeMembers.length})` },
                { id: "due", label: `বাকিদার (${defaulterMembers.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setMemberFilter(f.id as any)}
                  style={{
                    padding: "5px 12px", borderRadius: 999, border: "1px solid var(--bd)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: memberFilter === f.id ? "var(--text)" : "var(--card)",
                    color: memberFilter === f.id ? "var(--bg)" : "var(--muted)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="সদস্যের নাম বা আইডি খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 13, width: 220 }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>সদস্য তথ্য লোড হচ্ছে...</div>
          ) : displayedMembers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: "var(--card)", borderRadius: 16 }}>কোনো সদস্য পাওয়া যায়নি</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayedMembers.map((m) => {
                const owe = Math.max(m.due - m.paid, 0);
                return (
                  <div
                    key={m.id}
                    style={{
                      background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14,
                      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{m.name}</span>
                        <code style={{ fontSize: 11, background: "var(--bg)", padding: "2px 6px", borderRadius: 6 }}>@{m.loginId}</code>
                        <span style={{ fontSize: 11, background: "rgba(5,150,105,0.12)", color: "var(--pri-dark)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                          {m.role}
                        </span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 700, background: m.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: m.status === "ACTIVE" ? "#059669" : "var(--bad)" }}>
                          {m.status === "ACTIVE" ? "সক্রিয়" : "অপেক্ষমাণ"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span>মাসিক চাঁদা: <b>৳{m.pledge}</b></span>
                        <span>·</span>
                        <span>পরিশোধিত: <b style={{ color: "#059669" }}>৳{m.paid}</b></span>
                        <span>·</span>
                        <span>মোট বাকি: <b style={{ color: owe > 0 ? "var(--bad)" : "#059669" }}>৳{owe}</b></span>
                      </div>
                    </div>

                    {/* Member Action Buttons */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {m.status === "PENDING" && (
                        <button onClick={() => handleVerifyMember(m.id, m.name)} style={{ background: "#059669", color: "#fff", border: 0, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✓ যাচাই করুন
                        </button>
                      )}
                      <button onClick={() => setSelectedPayMember({ id: m.id, name: m.name })} style={{ background: "var(--pri-light)", color: "var(--pri-dark)", border: "1px solid var(--pri)", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        💵 চাঁদা গ্রহণ
                      </button>
                      <button onClick={() => handleChangePledge(m.id, m.name, m.pledge)} style={{ background: "var(--bg)", border: "1px solid var(--bd)", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer" }} title="চাঁদার পরিমাণ পরিবর্তন">
                        ✏️ চাঁদা
                      </button>
                      <button onClick={() => handleResetPassword(m.id, m.name)} style={{ background: "var(--bg)", border: "1px solid var(--bd)", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer" }} title="পাসওয়ার্ড রিসেট">
                        🔑 পাসওয়ার্ড
                      </button>
                      <Link href={`/members/${m.id}`} style={{ background: "var(--bg)", border: "1px solid var(--bd)", padding: "6px 10px", borderRadius: 8, fontSize: 12, color: "var(--text)", textDecoration: "none", fontWeight: 600 }}>
                        📋 হিসাব
                      </Link>
                      <button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--bad)", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer" }} title="সদস্য মুছুন">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FINANCE & DUES 360 */}
      {activeTab === "finance" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>আর্থিক হিসাব ও মাসিক কালেকশন</h3>
            <Link href="/months" style={{ fontSize: 13, color: "var(--pri)", fontWeight: 700, textDecoration: "none" }}>
              মাসওয়ারি পূর্ণাঙ্গ শিট দেখুন →
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
            যেকোনো সদস্যের নগদ, বিকাশ বা ব্যাংক পেমেন্ট সরাসরি রেকর্ড করুন। সাথে সাথে ডিজিটাল রসিদ তৈরি হবে।
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {members.slice(0, 8).map((m) => (
              <div key={m.id} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>বাকি: ৳{Math.max(m.due - m.paid, 0)}</div>
                </div>
                <button onClick={() => setSelectedPayMember({ id: m.id, name: m.name })} style={{ background: "var(--pri)", color: "#fff", border: 0, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + চাঁদা গ্রহণ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES & APPROVALS 360 */}
      {activeTab === "expenses" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>অনুমোদনের অপেক্ষায় বিলসমূহ ({pendingExpenses.length})</h3>
            <Link href="/expenses" style={{ fontSize: 13, color: "var(--pri)", fontWeight: 700, textDecoration: "none" }}>
              সকল খরচ ইতিহাস →
            </Link>
          </div>
          {pendingExpenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>কোনো বিল অনুমোদনের অপেক্ষায় নেই।</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingExpenses.map((exp) => (
                <div key={exp.id} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.description}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>পরিমাণ: <b>৳{exp.amount}</b> · ক্যাটাগরি: {exp.category}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleApproveExpense(exp.id)} style={{ background: "#059669", color: "#fff", border: 0, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      ✓ অনুমোদন
                    </button>
                    <button onClick={() => handleRejectExpense(exp.id)} style={{ background: "rgba(239,68,68,0.15)", color: "var(--bad)", border: "1px solid var(--bad)", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      ✕ বাতিল
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FUNDS 360 */}
      {activeTab === "funds" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800 }}>মসজিদের তহবিলসমূহ</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {funds.map((f) => (
              <div key={f.id} style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 10px" }}>{f.restricted ? "সংরক্ষিত তহবিল" : "সাধারণ তহবিল"}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>ব্যালেন্স: ৳{f.balance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {selectedPayMember && (
        <div className="modal-backdrop" onClick={() => setSelectedPayMember(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title"><span>💵</span><span>চাঁদা গ্রহণ: {selectedPayMember.name}</span></div>
              <button className="modal-close-btn" onClick={() => setSelectedPayMember(null)}>✕</button>
            </div>
            <div className="modal-body">
              <PaymentForm
                membershipId={selectedPayMember.id}
                memberName={selectedPayMember.name}
                onDone={() => {
                  setSelectedPayMember(null);
                  showToast("চাঁদা সফলভাবে গ্রহণ করা হয়েছে!");
                  loadAllData();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title"><span>+</span><span>নতুন সদস্য ভর্তি ফর্ম</span></div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateMember} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>পূর্ণ নাম:</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="যেমন: আব্দুর রহমান" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--bd)" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>লগইন আইডি (ইউজারনেম):</label>
                  <input type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} required placeholder="যেমন: rahman01" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--bd)" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>মাসিক চাঁদার পরিমাণ (টাকা):</label>
                  <input type="number" value={newPledge} onChange={(e) => setNewPledge(Number(e.target.value))} required min={0} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--bd)" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>প্রাথমিক পাসওয়ার্ড:</label>
                  <input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={8} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--bd)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "1px solid var(--bd)", padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>বাতিল</button>
                  <button type="submit" disabled={savingMember} className="btn" style={{ width: "auto" }}>
                    {savingMember ? "সংরক্ষণ হচ্ছে..." : "✓ সদস্য যুক্ত করুন"}
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
