"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { Avatar, Badge, Empty, ErrorBox, Loading, Money } from "@/components/ui";
import { api, useInfinite } from "@/lib/client";
import type { MemberRow } from "@/services/reports";

export default function Members() {
  const { t } = useT();
  const me = useMe();
  const cur = me.mosque.currency;
  const canManage = me.permissions.includes("members.manage");

  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [pledge, setPledge] = useState(500);
  const [password, setPassword] = useState("Mosque@12345");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const list = useInfinite<MemberRow>(`/api/members?q=${encodeURIComponent(debounced)}`);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loginId.trim()) return;
    setSaving(true);
    setAddError("");
    try {
      await api("/api/members", {
        method: "POST",
        body: {
          name: name.trim(),
          loginId: loginId.trim(),
          monthlyPledge: Number(pledge),
          password: password.trim() || "Mosque@12345",
        },
      });
      setShowAddModal(false);
      setName("");
      setLoginId("");
      setPledge(500);
      list.retry();
    } catch (err: any) {
      setAddError(err?.code === "MEMBER_ALREADY_EXISTS" ? "এই আইডি দিয়ে ইতিমধ্যে সদস্য বিদ্যমান।" : "সদস্য যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>{t("members")}</h1>
        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: "var(--pri)", color: "#fff", border: 0, borderRadius: 12,
              padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(5,150,105,0.25)"
            }}
          >
            + নতুন সদস্য যোগ করুন
          </button>
        )}
      </div>

      <label className="field"><input type="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} /></label>

      <div className="card">
        {list.items.map((m) => {
          const owe = Math.max(m.due - m.paid, 0);
          return (
            <Link key={m.id} href={`/members/${m.id}`} className="row">
              <Avatar name={m.name} />
              <div className="m"><b>{m.name}</b><small>{m.role} {m.status !== "ACTIVE" && <Badge status={m.status as "PENDING" | "SUSPENDED"} />}</small></div>
              <div className="r" style={{ color: owe > 0 ? "var(--bad)" : "var(--ok)" }}><Money v={owe} currency={cur} /><small>{t("remaining")}</small></div>
            </Link>
          );
        })}
        {list.state === "loading" && <Loading />}
        {list.state === "error" && <ErrorBox code="SERVER_ERROR" onRetry={list.retry} />}
        {list.state === "done" && list.items.length === 0 && <Empty />}
        <div ref={list.sentinel} style={{ height: 1 }} />
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <div className="modal-title"><span>👤</span><span>নতুন সদস্য যোগ করুন</span></div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {addError && <div style={{ color: "var(--bad)", marginBottom: 12, fontSize: 13 }}>{addError}</div>}
              <form onSubmit={handleCreateMember} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label className="field">
                  <span>সদস্যের নাম</span>
                  <input required placeholder="যেমন: মোঃ আব্দুল্লাহ" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="field">
                  <span>ইউজারনেম / মোবাইল আইডি</span>
                  <input required placeholder="যেমন: abdullah বা 01712345678" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                </label>
                <label className="field">
                  <span>মাসিক ইনফাকের পরিমাণ (৳)</span>
                  <input type="number" min="0" required value={pledge} onChange={(e) => setPledge(Number(e.target.value))} />
                </label>
                <label className="field">
                  <span>লগইন পাসওয়ার্ড</span>
                  <input type="text" placeholder="Mosque@12345" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <button type="submit" disabled={saving} className="btn" style={{ marginTop: 8 }}>
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সদস্য যোগ করুন"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
