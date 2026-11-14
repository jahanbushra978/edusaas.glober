"use client";
import { useState } from "react";
import { api, ApiError, useApi } from "@/lib/client";
import { useMe } from "./Shell";
import { useT } from "./Providers";

type Status = "PENDING" | "ACTIVE" | "SUSPENDED";

export function ManagePanel({
  id,
  status,
  pledge,
  roleId,
  isSelf,
  onDone,
}: {
  id: string;
  status: Status;
  pledge: number;
  roleId: string;
  isSelf: boolean;
  onDone: () => void;
}) {
  const { t, err } = useT();
  const me = useMe();
  const [value, setValue] = useState(String(pledge));
  const canRoles = me.permissions.includes("roles.manage") && !isSelf;
  const canManageMembers = me.permissions.includes("members.manage");
  const roles = useApi<{ roles: { id: string; name: string }[] }>(canRoles ? "/api/roles" : null);
  const [role, setRole] = useState(roleId);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Member Login Credentials State
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [credBusy, setCredBusy] = useState(false);

  async function patch(body: { status?: Status; monthlyPledge?: number; roleId?: string }) {
    setMsg(null);
    try {
      await api(`/api/members/${id}`, { method: "PATCH", body });
      setMsg({ ok: true, text: t("updated") });
      onDone();
    } catch (e) {
      setMsg({ ok: false, text: err(e instanceof ApiError ? e.code : "SERVER_ERROR") });
    }
  }

  async function handleSaveCredentials() {
    if (!loginId.trim() && !password.trim()) {
      alert("ইউজার আইডি অথবা পাসওয়ার্ড অন্তত একটি প্রদান করুন");
      return;
    }
    setCredBusy(true);
    setMsg(null);
    try {
      await api(`/api/members/${id}/credentials`, {
        method: "POST",
        body: {
          loginId: loginId.trim() || undefined,
          password: password.trim() || undefined,
        },
      });
      setMsg({ ok: true, text: "সদস্যের লগইন আইডি ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!" });
      setLoginId("");
      setPassword("");
    } catch (e) {
      setMsg({ ok: false, text: err(e instanceof ApiError ? e.code : "SERVER_ERROR") });
    } finally {
      setCredBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই সদস্যকে মুছে ফেলতে চান?")) return;
    setMsg(null);
    try {
      await api(`/api/members/${id}`, { method: "DELETE" });
      alert("সদস্য সফলভাবে মুছে ফেলা হয়েছে।");
      window.location.href = "/members";
    } catch (e) {
      if (e instanceof ApiError && e.code === "CANNOT_DELETE_MEMBER_WITH_PAYMENTS") {
        setMsg({
          ok: false,
          text: "এই সদস্যের পরিশোধিত ইনফাক বা আর্থিক হিসাব রয়েছে, তাই স্থায়ীভাবে মোছা যাবে না। হিসাব সুরক্ষিত রাখতে সদস্যকে 'স্থগিত (SUSPEND)' করুন।",
        });
      } else {
        setMsg({ ok: false, text: err(e instanceof ApiError ? e.code : "SERVER_ERROR") });
      }
    }
  }

  return (
    <div className="card">
      <b>{t("memberSettings")}</b>
      {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`} style={{ marginTop: 10 }} role="status">{msg.text}</div>}

      <label className="field" style={{ marginTop: 10 }}>
        <span>{t("pledge")}</span>
        <input type="number" inputMode="decimal" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <button className="btn alt" onClick={() => patch({ monthlyPledge: Number(value) })} disabled={value === "" || Number(value) < 0}>
        {t("savePledge")}
      </button>

      {canRoles && roles.data && (
        <>
          <label className="field" style={{ marginTop: 10 }}>
            <span>{t("role")}</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.data.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <button className="btn alt" onClick={() => patch({ roleId: role })} disabled={role === roleId}>
            {t("saveRoleAssign")}
          </button>
        </>
      )}

      {/* Admin Login Credentials Setup */}
      {canManageMembers && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--bd)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔑</span>
            <span>সদস্যের লগইন আইডি ও পাসওয়ার্ড সেট করুন</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            সদস্যের জন্য ইউজার আইডি ও পাসওয়ার্ড তৈরি করে দিলে সদস্য শুধুমাত্র নিজস্ব ও মসজিদের হিসাব দেখতে পারবে (Read-only Mode)।
          </div>
          <label className="field">
            <span>নতুন লগইন আইডি (Login ID)</span>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="যেমন: member_01 বা ফোন নম্বর"
              autoCapitalize="none"
            />
          </label>
          <label className="field" style={{ marginTop: 8 }}>
            <span>নতুন পাসওয়ার্ড (Password)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
            />
          </label>
          <button
            className="btn"
            style={{ marginTop: 8 }}
            onClick={handleSaveCredentials}
            disabled={credBusy || (!loginId.trim() && !password.trim())}
          >
            {credBusy ? "সংরক্ষণ হচ্ছে..." : "আইডি ও পাসওয়ার্ড সংরক্ষণ করুন"}
          </button>
        </div>
      )}

      {!isSelf && (
        <div className="acts" style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--bd)", paddingTop: 12 }}>
          {status !== "ACTIVE" && (
            <button className="btn" onClick={() => patch({ status: "ACTIVE" })}>
              {status === "PENDING" ? t("verify") : t("reactivate")}
            </button>
          )}
          {status !== "SUSPENDED" && (
            <button className="btn bad" onClick={() => patch({ status: "SUSPENDED" })}>
              {t("suspend")}
            </button>
          )}
          <button className="btn alt" style={{ color: "var(--bad)", border: "1px solid rgba(239,68,68,0.3)" }} onClick={handleDelete}>
            সদস্য মুছুন
          </button>
        </div>
      )}
    </div>
  );
}
