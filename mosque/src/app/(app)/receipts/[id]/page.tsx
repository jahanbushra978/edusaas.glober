"use client";
import Link from "next/link";
import { useT } from "@/components/Providers";
import { ErrorBox, Loading, Money } from "@/components/ui";
import { useApi } from "@/lib/client";
import { dateLabel, periodLabel } from "@/lib/format";
import type { Key } from "@/lib/i18n";

type R = { receiptNo: string; mosque: string; currency: string; member: string; amount: number; period: string | null; method: string; status: string; fund: string; collector: string; paidAt: string };

export default function Receipt({ params }: { params: { id: string } }) {
  const { t, lang } = useT();
  const { data: r, error, reload } = useApi<R>(`/api/receipts/${params.id}`);
  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!r) return <Loading />;
  const share = () => {
    const text = `${r.mosque} — ${t("receiptTitle")} ${r.receiptNo}`;
    if (navigator.share) void navigator.share({ title: text, text, url: location.href });
    else void navigator.clipboard?.writeText(location.href);
  };
  return (
    <div className="stack">
      <Link href="/members/me" className="lbl noprint">‹ {t("account")}</Link>
      <div className="card receipt">
        <div style={{ fontSize: 40 }}>🕌</div>
        <h2>{r.mosque}</h2>
        <div className="lbl">{t("receiptTitle")} · {r.receiptNo}</div>
        <div className="big" style={{ fontSize: 30, margin: "12px 0" }}><Money v={r.amount} currency={r.currency} /></div>
        <dl>
          <dt>{t("receivedFrom")}</dt><dd>{r.member}</dd>
          {r.period && <><dt>{t("forMonth")}</dt><dd>{periodLabel(r.period, lang)}</dd></>}
          <dt>{t("fund")}</dt><dd>{r.fund}</dd>
          <dt>{t("method")}</dt><dd>{t(r.method as Key)}</dd>
          <dt>{t("collectedBy")}</dt><dd>{r.collector}</dd>
          <dt>{t("status")}</dt><dd>{r.status}</dd>
          <dt>{dateLabel(r.paidAt, lang)}</dt><dd />
        </dl>
        <p className="lbl">{t("dua")}</p>
      </div>
      <div className="acts noprint">
        <button className="btn" onClick={() => window.print()}>{t("print")}</button>
        <button className="btn alt" onClick={share}>{t("share")}</button>
      </div>
    </div>
  );
}
