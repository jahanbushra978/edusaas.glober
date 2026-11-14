"use client";
import Link from "next/link";
import { useT } from "@/components/Providers";
import { Empty, ErrorBox, Loading, Money } from "@/components/ui";
import { useApi } from "@/lib/client";
import { periodLabel } from "@/lib/format";
import type { fundDetail } from "@/services/funds";

type Detail = NonNullable<Awaited<ReturnType<typeof fundDetail>>>;

export default function FundPage({ params }: { params: { id: string } }) {
  const { t, lang } = useT();
  const { data: f, error, reload } = useApi<Detail>(`/api/funds/${params.id}`);
  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!f) return <Loading />;
  return (
    <div className="stack">
      <Link href="/dashboard" className="lbl">‹ {t("home")}</Link>
      <div className="card">
        <div className="top"><b>{f.name}</b>{f.restricted && <span className="chip">{t("restricted")}</span>}</div>
        <div className="big" style={{ margin: "6px 0 12px" }}><Money v={f.totals.balance} currency={f.currency} /></div>
        <div className="grid2">
          <div><div className="lbl">{t("income")}</div><b className="pos"><Money v={f.totals.income} currency={f.currency} /></b></div>
          <div><div className="lbl">{t("expense")}</div><b className="neg"><Money v={f.totals.expense} currency={f.currency} /></b></div>
        </div>
      </div>
      <h2>{t("last12")}</h2>
      <div className="card">
        {f.months.length === 0 && <Empty />}
        {f.months.map((m) => (
          <div key={m.period} className="row">
            <div className="m"><b>{periodLabel(m.period, lang)}</b></div>
            <div className="r"><span className="pos">+<Money v={m.income} currency={f.currency} /></span><small className="neg">−<Money v={m.expense} currency={f.currency} /></small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
