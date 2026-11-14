"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Controls } from "@/components/Controls";
import { useT } from "@/components/Providers";
import { api, ApiError } from "@/lib/client";

export default function NewMosque() {
  const { t, err } = useT();
  const router = useRouter();
  const [f, setF] = useState({ mosqueName: "", mosqueSlug: "", startMonth: "", name: "", loginId: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...f, startMonth: f.startMonth || undefined };
      await api("/api/mosques", { method: "POST", body });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "SERVER_ERROR");
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <Controls />
      <div className="logo">🕌</div>
      <h1>{t("newMosque")}</h1>
      <form onSubmit={submit} className="card">
        {error && <div className="msg err" role="alert">{err(error)}</div>}
        <label className="field"><span>{t("mosqueName")}</span><input value={f.mosqueName} onChange={set("mosqueName")} required minLength={3} /></label>
        <label className="field"><span>{t("mosqueSlug")}</span><input value={f.mosqueSlug} onChange={set("mosqueSlug")} required minLength={3} pattern="[a-zA-Z0-9\-]+" autoCapitalize="none" /></label>
        <label className="field"><span>{t("startMonth")}</span><input value={f.startMonth} onChange={set("startMonth")} placeholder="2026-10" pattern="\d{4}-(0[1-9]|1[0-2])" /></label>
        <b>{t("yourAccount")}</b>
        <label className="field" style={{ marginTop: 10 }}><span>{t("fullName")}</span><input value={f.name} onChange={set("name")} required minLength={2} autoComplete="name" /></label>
        <label className="field"><span>{t("loginId")}</span><input value={f.loginId} onChange={set("loginId")} required minLength={4} autoCapitalize="none" autoComplete="username" /></label>
        <label className="field"><span>{t("password")} — {t("passwordHint")}</span><input type="password" value={f.password} onChange={set("password")} required minLength={8} autoComplete="new-password" /></label>
        <button className="btn" disabled={busy}>{busy ? t("loading") : t("createMosque")}</button>
      </form>
      <p className="state"><Link href="/login" style={{ color: "var(--pri)", fontWeight: 600 }}>{t("signIn")}</Link></p>
    </div>
  );
}
