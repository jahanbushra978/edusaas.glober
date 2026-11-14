"use client";
import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/client";
import { periodLabel } from "@/lib/format";
import type { StatementMonth } from "@/services/reports";
import { useT } from "./Providers";
import type { Key } from "@/lib/i18n";

const METHODS = ["CASH", "BKASH", "NAGAD", "BANK"] as const;

export function PaymentForm({
  membershipId,
  months: initialMonths,
  memberName: initialName,
  onDone,
}: {
  membershipId: string;
  months?: StatementMonth[];
  memberName?: string;
  onDone: () => void;
}) {
  const { t, err, lang } = useT();
  const [months, setMonths] = useState<StatementMonth[]>(initialMonths || []);
  const [name, setName] = useState(initialName || "");
  const [totalRemaining, setTotalRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(!initialMonths || initialMonths.length === 0);

  const [period, setPeriod] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof METHODS)[number]>("CASH");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initialMonths || initialMonths.length === 0) {
      setLoading(true);
      api<{ member: { name: string }; totals: { remaining: number }; months: StatementMonth[] }>(`/api/members/${membershipId}`)
        .then((res) => {
          setName(res.member.name);
          setTotalRemaining(res.totals.remaining);
          setMonths(res.months);
          const firstDue = [...res.months].reverse().find((m) => m.remaining > 0) ?? res.months[0];
          if (firstDue) {
            setPeriod(firstDue.period);
            setAmount(String(firstDue.remaining > 0 ? firstDue.remaining : 500));
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      const firstDue = [...initialMonths].reverse().find((m) => m.remaining > 0) ?? initialMonths[0];
      if (firstDue) {
        setPeriod(firstDue.period);
        setAmount(String(firstDue.remaining > 0 ? firstDue.remaining : 500));
      }
    }
  }, [membershipId, initialMonths]);

  function pick(p: string) {
    setPeriod(p);
    const m = months.find((x) => x.period === p);
    if (m && m.remaining > 0) setAmount(String(m.remaining));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/payments", {
        method: "POST",
        body: { membershipId, period, amount: Number(amount), method, idempotencyKey: key },
      });
      setMsg({ ok: true, text: "ইনফাক সফলভাবে গৃহীত ও রসিদ তৈরি হয়েছে!" });
      setKey(crypto.randomUUID());
      setTimeout(() => onDone(), 800);
    } catch (e) {
      setMsg({ ok: false, text: err(e instanceof ApiError ? e.code : "SERVER_ERROR") });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: 20 }}>সদস্যের হিসাব লোড হচ্ছে...</div>;
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ borderBottom: "1px solid var(--bd)", paddingBottom: 8 }}>
        <b style={{ fontSize: 16 }}>{t("recordPayment")}</b>
        {name && (
          <div style={{ fontSize: 13, color: "var(--pri)", fontWeight: 700, marginTop: 2 }}>
            সদস্য: {name} {totalRemaining !== null ? `(মোট বকেয়া: ৳${totalRemaining.toLocaleString("bn-BD")})` : ""}
          </div>
        )}
      </div>

      {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`} role="status">{msg.text}</div>}

      <label className="field">
        <span>কোন মাসের ইনফাক</span>
        <select value={period} onChange={(e) => pick(e.target.value)}>
          {months.map((m) => (
            <option key={m.period} value={m.period}>
              {periodLabel(m.period, lang)} {m.remaining > 0 ? `(বাকি: ৳${m.remaining})` : "(পরিশোধিত)"}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t("amount")} (৳)</span>
        <input
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="টাকার পরিমাণ"
        />
      </label>

      <label className="field">
        <span>পরিশোধের মাধ্যম (পদ্ধতি)</span>
        <select value={method} onChange={(e) => setMethod(e.target.value as (typeof METHODS)[number])}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {t(m as Key)}
            </option>
          ))}
        </select>
      </label>

      <button className="btn" disabled={busy || !period || !Number(amount)} style={{ marginTop: 6 }}>
        {busy ? t("loading") : "✓ ইনফাক গ্রহণ ও রসিদ তৈরি করুন"}
      </button>
    </form>
  );
}
