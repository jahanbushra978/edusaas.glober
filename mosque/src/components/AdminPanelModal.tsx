"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

interface AdminPanelModalProps {
  onClose: () => void;
  onOpenMasterDues?: () => void;
}

export function AdminPanelModal({ onClose, onOpenMasterDues }: AdminPanelModalProps) {
  const [tab, setTab] = useState<"pending" | "all-members" | "add-member" | "expenses" | "funds">("pending");
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pledgeInputs, setPledgeInputs] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");

  // Add member form state
  const [newName, setNewName] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [newPledge, setNewPledge] = useState(500);
  const [newPass, setNewPass] = useState("Mosque@12345");
  const [addBusy, setAddBusy] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [membersRes, expRes, dashRes] = await Promise.all([
        api<{ items?: any[] }>("/api/members").catch(() => ({ items: [] as any[] })),
        api<{ items?: any[] }>("/api/expenses").catch(() => ({ items: [] as any[] })),
        api<{ funds?: any[] }>("/api/dashboard").catch(() => ({ funds: [] as any[] })),
      ]);
      const mList = (membersRes && "items" in membersRes ? membersRes.items : []) || [];
      const eList = (expRes && "items" in expRes ? expRes.items : []) || [];
      setAllMembers(mList);
      setPendingMembers(mList.filter((m: any) => m.status === "PENDING"));
      setPendingExpenses(eList.filter((e: any) => e.status === "PENDING_APPROVAL"));
      setFunds(dashRes?.funds || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleVerifyMember = async (membershipId: string) => {
    const pledge = pledgeInputs[membershipId] || 500;
    try {
      await api(`/api/members/${membershipId}`, {
        method: "PATCH",
        body: { status: "ACTIVE", monthlyPledge: pledge },
      });
      setMsg("সদস্য সফলভাবে যাচাই ও সক্রিয় করা হয়েছে!");
      refreshData();
    } catch {
      setMsg("অনুমোদনে সমস্যা হয়েছে");
    }
  };

  const handleSetCredentials = async (membershipId: string, memberName: string) => {
    const newLogin = prompt(`"${memberName}" এর নতুন লগইন আইডি (Login ID) লিখুন:`);
    if (!newLogin || newLogin.trim().length < 3) return;
    const newPass = prompt(`"${memberName}" এর নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর):`, "Mosque@12345");
    if (!newPass || newPass.trim().length < 6) {
      alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    try {
      await api(`/api/members/${membershipId}/credentials`, {
        method: "POST",
        body: { loginId: newLogin.trim(), password: newPass.trim() },
      });
      setMsg(`লগইন আইডি (${newLogin}) ও পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!`);
      refreshData();
    } catch {
      setMsg("আইডি বা পাসওয়ার্ড সেভ করা যায়নি");
    }
  };

  const handleDeleteMember = async (membershipId: string, memberName: string) => {
    if (!confirm(`আপনি কি সদস্য "${memberName}" কে মুছে ফেলতে চান?`)) return;
    try {
      await api(`/api/members/${membershipId}`, { method: "DELETE" });
      setMsg(`সদস্য "${memberName}" মুছে ফেলা হয়েছে!`);
      refreshData();
    } catch (err: any) {
      setMsg(err?.code === "CANNOT_DELETE_MEMBER_WITH_PAYMENTS" ? "পরিশোধিত আর্থিক হিসাব রয়েছে, তাই মোছা যাবে না।" : "সদস্য মোছা যায়নি");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLogin.trim()) return;
    setAddBusy(true);
    try {
      await api("/api/members", {
        method: "POST",
        body: { name: newName.trim(), loginId: newLogin.trim(), monthlyPledge: Number(newPledge), password: newPass.trim() || "Mosque@12345" },
      });
      setMsg(`নতুন সদস্য "${newName}" সফলভাবে যুক্ত হয়েছে!`);
      setNewName("");
      setNewLogin("");
      setNewPledge(500);
      setTab("all-members");
      refreshData();
    } catch {
      setMsg("সদস্য যোগ করতে সমস্যা হয়েছে (সম্ভবত এই আইডি আগেই আছে)");
    } finally {
      setAddBusy(false);
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    const sig = prompt("ডিজিটাল স্বাক্ষর বা নাম লিখুন:", "অনুমোদনকারী: সভাপতি / কোষাধ্যক্ষ");
    if (sig === null) return;
    try {
      await api(`/api/expenses/${expenseId}/decision`, {
        method: "POST",
        body: { decision: "APPROVE", approverSignature: sig || undefined },
      });
      setMsg("বিল ডিজিটাল স্বাক্ষরে অনুমোদিত হয়েছে!");
      refreshData();
    } catch {
      setMsg("অনুমোদন সম্ভব হয়নি (নিজের ব্যয় অনুমোদন নিষিদ্ধ)");
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    const reason = prompt("বাতিল করার কারণ লিখুন (কমপক্ষে ৩ অক্ষর):");
    if (!reason || reason.trim().length < 3) return;
    try {
      await api(`/api/expenses/${expenseId}/decision`, { method: "POST", body: { decision: "REJECT", reason } });
      setMsg("বিল বাতিল করা হয়েছে!");
      refreshData();
    } catch {
      setMsg("বাতিল করা যায়নি");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title"><span>⚙️</span><span>মসজিদ অ্যাডমিন কন্ট্রোল প্যানেল</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/super-admin"
              onClick={onClose}
              style={{
                fontSize: 12,
                background: "rgba(99,102,241,0.15)",
                color: "#4f46e5",
                padding: "4px 10px",
                borderRadius: 8,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              🌐 SaaS সুপার অ্যাডমিন
            </Link>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: "1px solid var(--bd)", overflowX: "auto" }}>
          <button onClick={() => setTab("pending")} style={{ padding: "6px 12px", borderRadius: 999, border: 0, fontSize: 13, cursor: "pointer", background: tab === "pending" ? "var(--pri)" : "var(--bg)", color: tab === "pending" ? "#fff" : "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            সদস্য যাচাই ({pendingMembers.length})
          </button>
          <button onClick={() => setTab("all-members")} style={{ padding: "6px 12px", borderRadius: 999, border: 0, fontSize: 13, cursor: "pointer", background: tab === "all-members" ? "var(--pri)" : "var(--bg)", color: tab === "all-members" ? "#fff" : "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            👥 সদস্য তালিকা ও পাসওয়ার্ড
          </button>
          <button onClick={() => setTab("add-member")} style={{ padding: "6px 12px", borderRadius: 999, border: 0, fontSize: 13, cursor: "pointer", background: tab === "add-member" ? "var(--pri)" : "var(--bg)", color: tab === "add-member" ? "#fff" : "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            + নতুন সদস্য
          </button>
          <button onClick={() => setTab("expenses")} style={{ padding: "6px 12px", borderRadius: 999, border: 0, fontSize: 13, cursor: "pointer", background: tab === "expenses" ? "var(--pri)" : "var(--bg)", color: tab === "expenses" ? "#fff" : "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            বিল অনুমোদন ({pendingExpenses.length})
          </button>
          <button onClick={() => setTab("funds")} style={{ padding: "6px 12px", borderRadius: 999, border: 0, fontSize: 13, cursor: "pointer", background: tab === "funds" ? "var(--pri)" : "var(--bg)", color: tab === "funds" ? "#fff" : "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
            তহবিল
          </button>
        </div>

        <div className="modal-body">
          {msg && <div style={{ padding: "8px 12px", background: "var(--pri-light)", color: "var(--pri-dark)", borderRadius: 10, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>তথ্য লোড হচ্ছে...</div>
          ) : tab === "pending" ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>অনুমোদনের অপেক্ষায় সদস্যবৃন্দ:</div>
              {pendingMembers.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>কোনো অপেক্ষমাণ সদস্য নেই। সব যাচাই সম্পন্ন!</div>
              ) : (
                pendingMembers.map((m) => (
                  <div key={m.id} style={{ border: "1px solid var(--bd)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name || m.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>ভূমিকা: {m.role || "সদস্য"}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" placeholder="মাসিক ইনফাক (৳)" defaultValue={500} onChange={(e) => setPledgeInputs({ ...pledgeInputs, [m.id]: Number(e.target.value) })} style={{ width: 120, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--bd)" }} />
                      <button onClick={() => handleVerifyMember(m.id)} style={{ background: "var(--pri)", color: "#fff", border: 0, borderRadius: 8, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                        অনুমোদন করুন
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : tab === "all-members" ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <b>সকল সদস্য ({allMembers.length} জন)</b>
                <button onClick={() => setTab("add-member")} style={{ background: "var(--pri)", color: "#fff", border: 0, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + নতুন সদস্য যুক্ত করুন
                </button>
              </div>
              {allMembers.map((m) => (
                <div key={m.id} style={{ border: "1px solid var(--bd)", borderRadius: 12, padding: 10, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      আইডি: <span style={{ fontFamily: "monospace", color: "var(--pri)" }}>{m.loginId || "—"}</span> · ইনফাক: ৳{m.pledge || 500}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleSetCredentials(m.id, m.name)} style={{ background: "var(--pri-light)", color: "var(--pri-dark)", border: "1px solid var(--pri)", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      🔑 পাসওয়ার্ড
                    </button>
                    <button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: "rgba(239,68,68,0.1)", color: "var(--bad)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "5px 8px", fontSize: 12, cursor: "pointer" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "add-member" ? (
            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <b>নতুন সদস্য ভর্তি ও রেজিস্ট্রেশন</b>
              <label className="field"><span>সদস্যের পুরো নাম</span><input required placeholder="যেমন: মো: আব্দুল্লাহ" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
              <label className="field"><span>ইউজার আইডি / মোবাইল নম্বর</span><input required placeholder="যেমন: 01711223344" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} /></label>
              <label className="field"><span>মাসিক ইনফাক (৳)</span><input type="number" min="0" required value={newPledge} onChange={(e) => setNewPledge(Number(e.target.value))} /></label>
              <label className="field"><span>লগইন পাসওয়ার্ড</span><input required value={newPass} onChange={(e) => setNewPass(e.target.value)} /></label>
              <button className="btn" disabled={addBusy} style={{ marginTop: 6 }}>{addBusy ? "সংরক্ষণ হচ্ছে..." : "✓ সদস্য যুক্ত করুন"}</button>
            </form>
          ) : tab === "expenses" ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>অনুমোদনের অপেক্ষায় বিল ও ব্যয়:</div>
              {pendingExpenses.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>কোনো অপেক্ষমাণ বিল নেই।</div>
              ) : (
                pendingExpenses.map((e) => (
                  <div key={e.id} style={{ border: "1px solid var(--bd)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><b>{e.description}</b><b style={{ color: "var(--bad)" }}>৳{e.amount}</b></div>
                    <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 8px" }}>ভাউচার: {e.voucherNo} · খাত: {e.category} · সাবমিটার: {e.submitter || "কমিটি"}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleApproveExpense(e.id)} style={{ background: "var(--ok)", color: "#fff", border: 0, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>✓ অনুমোদন</button>
                      <button onClick={() => handleRejectExpense(e.id)} style={{ background: "rgba(239,68,68,0.15)", color: "var(--bad)", border: 0, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>✕ বাতিল</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              <b>মসজিদের তহবিলসমূহ:</b>
              {funds.map((f) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--bd)" }}>
                  <div><b>{f.name}</b> {f.restricted && <span style={{ fontSize: 10, background: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: 999 }}>সীমাবদ্ধ</span>}</div>
                  <div style={{ fontWeight: 700, color: "var(--pri)" }}>৳{Number(f.balance || 0).toLocaleString("bn-BD")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
