"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { Avatar, Badge, Empty, ErrorBox, Loading, Money, Progress } from "@/components/ui";
import { useApi, useInfinite } from "@/lib/client";
import { num, periodLabel } from "@/lib/format";
import type { MonthOverview, PersonRow } from "@/services/reports";

const FILTERS = ["all", "paid", "partial", "unpaid"] as const;

export default function MonthDetail({ params }: { params: { period: string } }) {
  const { t, lang } = useT();
  const cur = useMe().mosque.currency;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);
  const head = useApi<{ summary: MonthOverview | null; restricted: boolean }>(`/api/months/${params.period}?filter=all`);
  const list = useInfinite<PersonRow>(
    `/api/months/${params.period}?filter=${filter}&q=${encodeURIComponent(debounced)}`,
  );
  if (head.error) return <ErrorBox code={head.error} onRetry={head.reload} />;
  const s = head.data?.summary;
  return (
    <div>
      <Link href="/months" className="lbl">‹ {t("months")}</Link>
      <h2 style={{ marginTop: 6 }}>{periodLabel(params.period, lang)}</h2>
      {s && (
        <div className="card">
          <div className="grid2">
            <div><div className="lbl">{t("collected")}</div><div className="big pos"><Money v={s.collected} currency={cur} /></div></div>
            <div><div className="lbl">{t("remaining")}</div><div className="big" style={{ color: s.remaining > 0 ? "var(--bad)" : "var(--ok)" }}><Money v={s.remaining} currency={cur} /></div></div>
          </div>
          <Progress value={s.collected} max={s.expected} />
          <div className="lbl">{num(s.paidCount, lang)} / {num(s.members, lang)} {t("paidMembers")} · {t("expected")} <Money v={s.expected} currency={cur} /></div>
        </div>
      )}
      {head.data?.restricted ? (
        <p className="state">{t("restrictedList")}</p>
      ) : (
        <>
          <label className="field" style={{ margin: "10px 0 6px" }}>
            <input type="search" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="chips" role="tablist">
            {FILTERS.map((f) => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{t(f)}</button>
            ))}
          </div>
          <div className="card">
            {list.items.map((p) => (
              <Link key={p.id} href={`/members/${p.membershipId}`} className="row">
                <Avatar name={p.name} />
                <div className="m"><b>{p.name}</b><small><Badge status={p.status} /></small></div>
                <div className="r"><Money v={p.paid} currency={cur} /><small>/ <Money v={p.due} currency={cur} /></small></div>
              </Link>
            ))}
            {list.state === "loading" && <Loading />}
            {list.state === "error" && <ErrorBox code="SERVER_ERROR" onRetry={list.retry} />}
            {list.state === "done" && list.items.length === 0 && <Empty />}
            <div ref={list.sentinel} style={{ height: 1 }} />
          </div>
        </>
      )}
    </div>
  );
}
