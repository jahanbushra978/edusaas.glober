"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import { useT } from "@/components/Providers";
import { api, ApiError } from "@/lib/client";
import type { Key } from "@/lib/i18n";

const CATS = ["UTILITIES", "SALARY", "CLEANING", "MAINTENANCE", "EQUIPMENT", "EDUCATION", "MEALS", "OTHER"] as const;

export default function NewExpense() {
  const { t, err } = useT();
  const router = useRouter();
  const [f, setF] = useState({
    category: "UTILITIES",
    description: "",
    amount: "",
    spentAt: new Date().toISOString().slice(0, 10),
    buyerSignature: "",
    attachmentUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("ফাইলের আকার সর্বোচ্চ ২ মেগাবাইট হতে হবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setF((p) => ({ ...p, attachmentUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ id: string }>("/api/expenses", {
        method: "POST",
        body: {
          ...f,
          amount: Number(f.amount),
          attachmentUrl: f.attachmentUrl || undefined,
          buyerSignature: f.buyerSignature.trim() || undefined,
        },
      });
      router.replace(`/expenses/${r.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.code : "SERVER_ERROR");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 10 }}>
      <b>{t("newExpense")}</b>
      {error && <div className="msg err" role="alert">{err(error)}</div>}

      <label className="field">
        <span>{t("category")}</span>
        <select value={f.category} onChange={set("category")}>
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c === "OTHER" ? "অন্যান্য (Other)" : t(c as Key)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t("description")}</span>
        <input value={f.description} onChange={set("description")} placeholder="ব্যয়ের বিবরণ লিখুন..." required minLength={3} maxLength={500} />
      </label>

      <label className="field">
        <span>{t("amount")} (৳)</span>
        <input type="number" inputMode="decimal" min="1" step="1" value={f.amount} onChange={set("amount")} placeholder="টাকার পরিমাণ" required />
      </label>

      <label className="field">
        <span>{t("spentOn")}</span>
        <input type="date" value={f.spentAt} onChange={set("spentAt")} required />
      </label>

      <label className="field">
        <span>সাবমিটার বা ক্রেতার ডিজিটাল স্বাক্ষর / নাম</span>
        <input value={f.buyerSignature} onChange={set("buyerSignature")} placeholder="যেমন: মো: রফিক (সহ-কোষাধ্যক্ষ)" maxLength={150} />
      </label>

      {/* Voucher/Money Receipt Upload Section */}
      <div style={{ border: "1px dashed var(--bd)", borderRadius: 10, padding: 12, background: "var(--bg)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🧾 মানি রিসিট বা ভাউচার সংযোজন:</div>
        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} style={{ fontSize: 13 }} />
        {f.attachmentUrl && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            {f.attachmentUrl.startsWith("data:image") ? (
              <img src={f.attachmentUrl} alt="Voucher Receipt" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid var(--bd)" }} />
            ) : (
              <span style={{ fontSize: 13, color: "var(--pri)" }}>📄 ভাউচার ডকুমেন্ট সংযুক্ত হয়েছে</span>
            )}
            <button
              type="button"
              onClick={() => setF((p) => ({ ...p, attachmentUrl: "" }))}
              style={{ background: "none", border: 0, color: "var(--bad)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
            >
              মুছে ফেলুন
            </button>
          </div>
        )}
      </div>

      <button className="btn" disabled={busy || !Number(f.amount)} style={{ marginTop: 6 }}>
        {busy ? t("loading") : t("submitForApproval")}
      </button>
    </form>
  );
}
