"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, ApiError, useApi } from "@/lib/client";
import { Controls } from "./Controls";
import { useT } from "./Providers";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t, err } = useT();
  const router = useRouter();
  const { data } = useApi<{ mosques: { slug: string; name: string }[] }>("/api/mosques");
  const [form, setForm] = useState({ mosqueSlug: "", name: "", loginId: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const slug = form.mosqueSlug || data?.mosques[0]?.slug || "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = mode === "login" ? { mosqueSlug: slug, loginId: form.loginId, password: form.password } : { ...form, mosqueSlug: slug };
      await api(`/api/auth/${mode}`, { method: "POST", body });
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
      <h1>{t(mode === "login" ? "signIn" : "createAccount")}</h1>
      <form onSubmit={submit} className="card">
        {error && <div className="msg err" role="alert">{err(error)}</div>}
        <label className="field">
          <span>{t("chooseMosque")}</span>
          <select value={slug} onChange={set("mosqueSlug")} required>
            {data?.mosques.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </label>
        {mode === "register" && (
          <label className="field"><span>{t("fullName")}</span><input value={form.name} onChange={set("name")} required minLength={2} autoComplete="name" /></label>
        )}
        <label className="field"><span>{t("loginId")}</span><input value={form.loginId} onChange={set("loginId")} required minLength={4} autoCapitalize="none" autoComplete="username" /></label>
        <label className="field">
          <span>{t("password")}{mode === "register" ? ` — ${t("passwordHint")}` : ""}</span>
          <input type="password" value={form.password} onChange={set("password")} required minLength={mode === "register" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        <button className="btn" disabled={busy || !slug}>{busy ? t("loading") : t(mode === "login" ? "signIn" : "createAccount")}</button>
      </form>
      <p className="state">
        {t(mode === "login" ? "noAccount" : "haveAccount")}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} style={{ color: "var(--pri)", fontWeight: 600 }}>
          {t(mode === "login" ? "createAccount" : "signIn")}
        </Link>
        <br />
        <Link href="/new-mosque" style={{ color: "var(--pri)", fontWeight: 600 }}>{t("openMosqueLink")}</Link>
      </p>
    </div>
  );
}
