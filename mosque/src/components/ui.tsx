"use client";
import { ReactNode } from "react";
import { useT } from "./Providers";
import { money } from "@/lib/format";
import type { Key } from "@/lib/i18n";

export function Money({ v, currency = "BDT" }: { v: number; currency?: string }) {
  const { lang } = useT();
  return <>{money(v, lang, currency)}</>;
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div className="prog" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>;
}

export function Badge({ status }: { status: "PAID" | "PARTIAL" | "UNPAID" | "PENDING" | "ACTIVE" | "SUSPENDED" }) {
  const { t } = useT();
  return <span className={`badge b-${status}`}>{t(status as Key)}</span>;
}

export function Loading() {
  const { t } = useT();
  return <div className="state"><div className="spin" />{t("loading")}</div>;
}

export function ErrorBox({ code, onRetry }: { code: string; onRetry?: () => void }) {
  const { t, err } = useT();
  return (
    <div className="state">
      <div>{err(code)}</div>
      {onRetry && <button className="iconbtn" style={{ marginTop: 10 }} onClick={onRetry}>{t("retry")}</button>}
    </div>
  );
}

export function Empty({ children }: { children?: ReactNode }) {
  const { t } = useT();
  return <div className="state">{children ?? t("empty")}</div>;
}

export function Avatar({ name }: { name: string }) {
  return <div className="avatar" aria-hidden>{name.trim().charAt(0).toUpperCase()}</div>;
}

export const statusClass = (s: string) => (s === "PAID" || s === "APPROVED" ? "PAID" : s === "REJECTED" || s === "CANCELLED" ? "UNPAID" : "PARTIAL");
