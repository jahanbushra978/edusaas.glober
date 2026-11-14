"use client";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { ErrorBox, Loading, Money, statusClass } from "@/components/ui";
import { api, ApiError, useApi } from "@/lib/client";
import { dateLabel } from "@/lib/format";
import type { Key } from "@/lib/i18n";

type Detail = Awaited<ReturnType<typeof import("@/services/expenses").getExpense>>;

export default function ExpenseDetail({ params }: { params: { id: string } }) {
  const { t, err, lang } = useT();
  const me = useMe();
  const cur = me.mosque.currency;
  const { data: e, error, reload } = useApi<Detail>(`/api/expenses/${params.id}`);
  const [reason, setReason] = useState("");
  const [approverSig, setApproverSig] = useState(`অনুমোদনকারী: ${me.user.name}`);
  const [ref, setRef] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [showFullVoucher, setShowFullVoucher] = useState(false);

  async function act(path: string, body: object) {
    setMsg(null);
    try {
      await api(`/api/expenses/${params.id}/${path}`, { method: "POST", body });
      reload();
    } catch (x) {
      setMsg(err(x instanceof ApiError ? x.code : "SERVER_ERROR"));
    }
  }

  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!e) return <Loading />;

  return (
    <div className="stack">
      <Link href="/expenses" className="lbl">‹ {t("expenses")}</Link>
      <div className="card">
        <div className="top">
          <b>{e.category === "OTHER" ? "অন্যান্য (Other)" : t(e.category as Key)}</b>
          <span className={`badge b-${statusClass(e.status)}`}>{t(e.status as Key)}</span>
        </div>
        <div className="big" style={{ margin: "6px 0" }}><Money v={e.amount} currency={cur} /></div>
        <p style={{ margin: "0 0 8px" }}>{e.description}</p>
        <div className="lbl">{e.voucherNo} · {dateLabel(e.spentAt, lang)} · {e.fund.name}</div>
        {e.overdue && <p><span className="badge b-UNPAID">{t("overdue")}</span></p>}
        {e.submitter && <div className="lbl" style={{ marginTop: 4 }}>{t("submittedBy")}: {e.submitter}</div>}
        {e.buyerSignature && <div className="lbl" style={{ color: "var(--pri)" }}>✍️ সাবমিটার স্বাক্ষর: {e.buyerSignature}</div>}

        {/* Voucher Receipt Attachment */}
        {e.attachmentUrl && (
          <div style={{ marginTop: 12, borderTop: "1px solid var(--bd)", paddingTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🧾 সংযুক্ত মানি রিসিট / ভাউচার:</div>
            {e.attachmentUrl.startsWith("data:image") ? (
              <div>
                <img
                  src={e.attachmentUrl}
                  alt="Voucher receipt"
                  onClick={() => setShowFullVoucher(true)}
                  style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--bd)", cursor: "pointer", objectFit: "contain" }}
                />
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>ক্লিক করে পূর্ণ ভাউচার দেখুন</div>
              </div>
            ) : (
              <a href={e.attachmentUrl} target="_blank" rel="noreferrer" className="btn alt" style={{ display: "inline-block", fontSize: 13 }}>
                📄 ভাউচার ডাউনলোড / প্রদর্শন
              </a>
            )}
          </div>
        )}

        {/* Approval Digital Seal */}
        {(e.decider || e.approverSignature) && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ok)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>🛡️ ডিজিটাল অনুমোদন সম্পন্ন</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {e.approverSignature || e.decider} {e.decidedAt ? `(${dateLabel(e.decidedAt, lang)})` : ""}
            </div>
            {e.decisionReason && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>কারণ: {e.decisionReason}</div>}
          </div>
        )}
      </div>

      {msg && <div className="msg err" role="alert">{msg}</div>}

      {/* Expense Approval Action Box */}
      {e.can.decide && (
        <div className="card">
          <b>ব্যয় ও ভাউচার অনুমোদন</b>
          <label className="field" style={{ marginTop: 8 }}>
            <span>অনুমোদনকারীর ডিজিটাল স্বাক্ষর / পদবি</span>
            <input value={approverSig} onChange={(x) => setApproverSig(x.target.value)} maxLength={150} />
          </label>
          <label className="field">
            <span>{t("reason")} (বাতিলের জন্য আবশ্যক)</span>
            <input value={reason} onChange={(x) => setReason(x.target.value)} maxLength={500} placeholder="অনুমোদন বা বাতিলের মন্তব্য..." />
          </label>
          <div className="acts" style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => act("decision", { decision: "APPROVE", reason: reason || undefined, approverSignature: approverSig })}>
              ✓ {t("approve")}
            </button>
            <button className="btn bad" onClick={() => act("decision", { decision: "REJECT", reason, approverSignature: approverSig })}>
              ✕ {t("reject")}
            </button>
          </div>
        </div>
      )}

      {/* Payment Action Box */}
      {e.can.pay && (
        <div className="card">
          <label className="field">
            <span>{t("paymentRef")}</span>
            <input value={ref} onChange={(x) => setRef(x.target.value)} maxLength={100} placeholder="যেমন: চেক নং / বিকাশ ট্রানজ্যাকশন আইডি" />
          </label>
          <button className="btn" onClick={() => act("pay", { paymentRef: ref || undefined })} style={{ marginTop: 6 }}>
            {t("markPaid")}
          </button>
        </div>
      )}

      {e.history.length > 0 && (
        <>
          <h2>{t("history")}</h2>
          <div className="card">
            {e.history.map((h, i) => (
              <div key={i} className="row">
                <div className="m">
                  <b>{h.action.replace("EXPENSE_", "").replace("_", " ")}</b>
                  <small>{h.by ?? "—"} · {dateLabel(h.at, lang)}{h.reason ? ` · ${h.reason}` : ""}</small>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Full-view Modal for Voucher */}
      {showFullVoucher && e.attachmentUrl && (
        <div className="modal-backdrop" onClick={() => setShowFullVoucher(false)}>
          <div className="modal-dialog" onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 650, textAlign: "center" }}>
            <div className="modal-header">
              <b>ভাউচার ও মানি রিসিট পূর্ণ ভিউ</b>
              <button className="modal-close-btn" onClick={() => setShowFullVoucher(false)}>✕</button>
            </div>
            <div className="modal-body">
              <img src={e.attachmentUrl} alt="Full voucher" style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 10 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
