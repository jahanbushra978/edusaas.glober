"use client";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/Providers";
import { ErrorBox, Loading, Empty, Money, Progress } from "@/components/ui";
import { useMe } from "@/components/Shell";
import { useApi } from "@/lib/client";
import { num, periodLabel } from "@/lib/format";
import type { MonthOverview } from "@/services/reports";

type Resp = { year: number; currentPeriod: string; startYear: number; months: MonthOverview[] };

export default function Months() {
  const { t, lang } = useT();
  const me = useMe();
  const [year, setYear] = useState<number | null>(null);
  const { data, error, reload } = useApi<Resp>(`/api/months${year ? `?year=${year}` : ""}`);
  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!data) return <Loading />;
  const cur = me.mosque.currency;
  const thisYear = Number(data.currentPeriod.slice(0, 4));
  return (
    <div>
      <div className="top" style={{ marginBottom: 12 }}>
        <b>{t("months")}</b>
        <div className="seg">
          <button disabled={data.year <= data.startYear} onClick={() => setYear(data.year - 1)} aria-label="previous year">‹</button>
          <button className="on" style={{ pointerEvents: "none" }}>{num(data.year, lang).replace(/,/g, "")}</button>
          <button disabled={data.year >= thisYear} onClick={() => setYear(data.year + 1)} aria-label="next year">›</button>
        </div>
      </div>
      {data.months.length === 0 && <Empty />}
      <div className="stack">
        {data.months.map((m) => (
          <Link key={m.period} href={`/months/${m.period}`} className="card">
            <div className="top"><b>{periodLabel(m.period, lang)}</b><span className="lbl">{num(m.paidCount, lang)} / {num(m.members, lang)} {t("paidMembers")}</span></div>
            <Progress value={m.collected} max={m.expected} />
            <div className="top">
              <span><span className="lbl">{t("collected")} </span><b className="pos"><Money v={m.collected} currency={cur} /></b></span>
              <span><span className="lbl">{t("remaining")} </span><b style={{ color: m.remaining > 0 ? "var(--bad)" : "var(--ok)" }}><Money v={m.remaining} currency={cur} /></b></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
