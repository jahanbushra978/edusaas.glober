"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

interface MosqueItem {
  id: string;
  name: string;
  slug: string;
  currency: string;
  startMonth: string;
  status: "ACTIVE" | "SUSPENDED";
  membersCount: number;
  paymentsCount: number;
  createdAt: string;
}

interface SuperAdminData {
  currentMosqueId: string;
  stats: {
    totalMosques: number;
    activeMosques: number;
    suspendedMosques: number;
    totalUsers: number;
  };
  mosques: MosqueItem[];
}

export default function SuperAdminPage() {
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const loadData = () => {
    setLoading(true);
    api<SuperAdminData>("/api/super-admin")
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (mosqueId: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const msg = nextStatus === "SUSPENDED"
      ? "আপনি কি নিশ্চিত এই মসজিদ টেন্যান্ট সাময়িকভাবে স্থগিত করতে চান?"
      : "আপনি কি নিশ্চিত এই মসজিদ টেন্যান্ট সক্রিয় করতে চান?";
    if (!confirm(msg)) return;

    setBusyId(mosqueId);
    try {
      await api("/api/super-admin", {
        method: "PATCH",
        body: { mosqueId, status: nextStatus },
      });
      loadData();
    } catch {
      alert("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    } finally {
      setBusyId(null);
    }
  };

  const filteredMosques = data?.mosques.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
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
          }}
        >
          <span>‹</span>
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>

        <Link
          href="/new-mosque"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "linear-gradient(135deg, #059669, #0d9488)",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 13,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
          }}
        >
          <span>+</span>
          <span>নতুন মসজিদ টেন্যান্ট তৈরি</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          borderRadius: 24,
          padding: "24px 22px",
          color: "#fff",
          marginBottom: 20,
          boxShadow: "0 10px 30px rgba(49, 46, 129, 0.25)",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.16)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          <span>🌐</span>
          <span>SaaS প্ল্যাটফর্ম ওনার ড্যাশবোর্ড</span>
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800 }}>
          সুপার অ্যাডমিন কন্ট্রোল প্যানেল
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9, maxWidth: 620, lineHeight: 1.5 }}>
          এই প্ল্যাটফর্মে চলমান সকল মসজিদ (Tenant), সদস্য সংখ্যা, অ্যাক্টিভেশন স্ট্যাটাস ও প্ল্যাটফর্মের কেন্দ্রীয় নিয়ন্ত্রণ।
        </p>
      </div>

      {/* KPI Cards */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>মোট মসজিদ (ট্যানেন্ট)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
              {data.stats.totalMosques} টি
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>সক্রিয় মসজিদ</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>
              {data.stats.activeMosques} টি
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>স্থগিত মসজিদ</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--bad)", marginTop: 4 }}>
              {data.stats.suspendedMosques} টি
            </div>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>নিবন্ধিত মোট ইউজার</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1", marginTop: 4 }}>
              {data.stats.totalUsers} জন
            </div>
          </div>
        </div>
      )}

      {/* Explainer Guide Accordion */}
      <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setShowGuide(!showGuide)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
            <span>💡</span>
            <span>সদস্যরা কীভাবে লগইন করবে এবং হিসাব দেখবে? (SaaS আর্কিটেকচার নির্দেশিকা)</span>
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{showGuide ? "লুকান ▲" : "দেখুন ▼"}</span>
        </div>

        {showGuide && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bd)", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12 }}>
              <b>১. সদস্য রেজিস্ট্রেশন (/register):</b>
              <div style={{ color: "var(--muted)", marginTop: 2 }}>
                সাধারণ মুসল্লি ড্রপডাউন থেকে নিজের মসজিদ সিলেক্ট করবে, নাম, লগইন আইডি ও পাসওয়ার্ড দিবে। শুরুতে স্ট্যাটাস থাকবে <code>PENDING</code> (যাচাইয়ের অপেক্ষায়)।
              </div>
            </div>
            <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12 }}>
              <b>২. মসজিদ কমিটি কর্তৃক যাচাই ও চাঁদা নির্ধারণ (/members):</b>
              <div style={{ color: "var(--muted)", marginTop: 2 }}>
                মসজিদের সভাপতি বা কোষাধ্যক্ষ অ্যাডমিন প্যানেল থেকে সদস্যকে যাচাই করে <code>ACTIVE</code> করবে এবং তার মাসিক চাঁদার পরিমাণ (Pledge) নির্ধারণ করবে।
              </div>
            </div>
            <div style={{ background: "var(--bg)", padding: 12, borderRadius: 12 }}>
              <b>৩. সদস্য লগইন ও ব্যক্তিগত হিসাব (/members/me):</b>
              <div style={{ color: "var(--muted)", marginTop: 2 }}>
                সদস্য <code>/login</code> পেজে গিয়ে নিজের মসজিদ বেছে নিয়ে লগইন করবে। সে সরাসরি <code>/members/me</code> পেজে নিজের প্রতি মাসের পাওনা, পরিশোধিত চাঁদা, বাকি ও ডিজিটাল রসিদ দেখতে পাবে। অন্যের হিসাব সে দেখতে পারবে না (গোপনীয়তা সংরক্ষিত)।
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Mosques Directory */}
      <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 18, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>সকল মসজিদ তালিকা (Tenants)</div>
          <input
            type="text"
            placeholder="নাম বা স্লাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 13, width: 220 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>তথ্য লোড হচ্ছে...</div>
        ) : filteredMosques.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>কোনো মসজিদ পাওয়া যায়নি</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredMosques.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--bd)",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🕌</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontWeight: 700,
                        background: m.status === "ACTIVE" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                        color: m.status === "ACTIVE" ? "#059669" : "var(--bad)",
                      }}
                    >
                      {m.status === "ACTIVE" ? "সক্রিয়" : "স্থগিত"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>স্লাগ: <code>{m.slug}</code></span>
                    <span>·</span>
                    <span>সদস্য: <b>{m.membersCount} জন</b></span>
                    <span>·</span>
                    <span>শুরুর মাস: {m.startMonth}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link
                    href={`/login`}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--bd)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                      textDecoration: "none",
                    }}
                  >
                    লগইন পেজ
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(m.id, m.status)}
                    disabled={busyId === m.id}
                    style={{
                      background: m.status === "ACTIVE" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                      border: `1px solid ${m.status === "ACTIVE" ? "var(--bad)" : "var(--ok)"}`,
                      color: m.status === "ACTIVE" ? "var(--bad)" : "var(--ok)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {busyId === m.id ? "অপেক্ষা..." : m.status === "ACTIVE" ? "স্থগিত করুন" : "সক্রিয় করুন"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
