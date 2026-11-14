"use client";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { Empty, ErrorBox, Loading, Money, statusClass } from "@/components/ui";
import { useInfinite } from "@/lib/client";
import { dateLabel } from "@/lib/format";
import type { Key } from "@/lib/i18n";
import type { ExpenseRow } from "@/services/expenses";

const FILTERS = ["", "PENDING_APPROVAL", "APPROVED", "PAID", "REJECTED"] as const;

export default function Expenses() {
  const { t, lang } = useT();
  const me = useMe();
  const privileged = ["expenses.submit", "expenses.approve", "expenses.pay", "finance.view_all"].some((p) => me.permissions.includes(p));
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("");
  const list = useInfinite<ExpenseRow>(`/api/expenses?status=${status}`);
  return (
    <div>
      <div className="top" style={{ marginBottom: 8 }}>
        <b>{t("expenses")}</b>
        {me.permissions.includes("expenses.submit") && <Link href="/expenses/new" className="iconbtn" style={{ color: "var(--pri)", fontWeight: 600 }}>+ {t("newExpense")}</Link>}
      </div>
      {privileged && (
        <div className="chips">
          {FILTERS.map((f) => <button key={f} className={status === f ? "on" : ""} onClick={() => setStatus(f)}>{f ? t(f as Key) : t("allStatuses")}</button>)}
        </div>
      )}
      <div className="card">
        {list.items.map((e) => (
          <Link key={e.id} href={`/expenses/${e.id}`} className="row">
            <div className="m">
              <b>{t(e.category as Key)}</b>
              <small>{e.voucherNo} · {dateLabel(e.spentAt, lang)}{e.submitter ? ` · ${e.submitter}` : ""}</small>
              <small><span className={`badge b-${statusClass(e.status)}`}>{t(e.status as Key)}</span>{e.overdue && <span className="badge b-UNPAID" style={{ marginInlineStart: 6 }}>{t("overdue")}</span>}</small>
            </div>
            <div className="r"><Money v={e.amount} currency={me.mosque.currency} /></div>
          </Link>
        ))}
        {list.state === "loading" && <Loading />}
        {list.state === "error" && <ErrorBox code="SERVER_ERROR" onRetry={list.retry} />}
        {list.state === "done" && list.items.length === 0 && <Empty />}
        <div ref={list.sentinel} style={{ height: 1 }} />
      </div>
    </div>
  );
}
