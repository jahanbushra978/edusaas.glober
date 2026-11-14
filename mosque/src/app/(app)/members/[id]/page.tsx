"use client";
import Link from "next/link";
import { ManagePanel } from "@/components/ManagePanel";
import { PaymentForm } from "@/components/PaymentForm";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { Avatar, Badge, Empty, ErrorBox, Loading, Money } from "@/components/ui";
import { useApi } from "@/lib/client";
import { dateLabel, periodLabel } from "@/lib/format";
import type { Key } from "@/lib/i18n";
import type { StatementMonth } from "@/services/reports";

type Statement = {
  member: { id: string; name: string; role: string; roleId: string; status: "PENDING" | "ACTIVE" | "SUSPENDED"; pledge: number };
  totals: { due: number; paid: number; remaining: number };
  months: StatementMonth[];
  canManage: boolean;
  canRecord: boolean;
};

/** Month-by-month account of one member. `/members/me` is the signed-in member's own view. */
export default function MemberDetail({ params }: { params: { id: string } }) {
  const { t, lang } = useT();
  const me = useMe();
  const cur = me.mosque.currency;
  const { data: s, error, reload } = useApi<Statement>(`/api/members/${params.id}`);
  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!s) return <Loading />;
  const isSelf = s.member.id === me.membershipId;
  return (
    <div className="stack">
      {!isSelf && me.canViewContributors && <Link href="/members" className="lbl">‹ {t("members")}</Link>}
      <div className="card">
        <div className="row" style={{ border: 0, padding: 0 }}>
          <Avatar name={s.member.name} />
          <div className="m"><b>{s.member.name}</b><small>{s.member.role} · {t("pledge")}: <Money v={s.member.pledge} currency={cur} /></small></div>
          <Badge status={s.member.status} />
        </div>
        <div className="grid2" style={{ marginTop: 14 }}>
          <div><div className="lbl">{t("youPaid")}</div><div className="big pos"><Money v={s.totals.paid} currency={cur} /></div></div>
          <div><div className="lbl">{t("remaining")}</div><div className="big" style={{ color: s.totals.remaining > 0 ? "var(--bad)" : "var(--ok)" }}><Money v={s.totals.remaining} currency={cur} /></div></div>
        </div>
      </div>

      {s.canRecord && s.member.status === "ACTIVE" && <PaymentForm membershipId={s.member.id} months={s.months} onDone={reload} />}
      {s.canManage && <ManagePanel id={s.member.id} status={s.member.status} pledge={s.member.pledge} roleId={s.member.roleId} isSelf={isSelf} onDone={reload} />}

      <h2>{t("months")}</h2>
      {s.months.length === 0 && <Empty />}
      {s.months.map((m) => (
        <details key={m.period} className="card acc">
          <summary>
            <div className="m" style={{ flex: 1 }}>
              <b>{periodLabel(m.period, lang)}</b>
              <div className="lbl"><Money v={m.paid} currency={cur} /> / <Money v={m.due} currency={cur} /></div>
            </div>
            <div className="r">{m.remaining > 0 && <div style={{ color: "var(--bad)" }}><Money v={m.remaining} currency={cur} /></div>}<Badge status={m.status} /></div>
          </summary>
          <div className="more">
            {m.payments.length === 0 && <span className="lbl">{t("noPayments")}</span>}
            {m.payments.map((p) => (
              <div key={p.id} className="top" style={{ padding: "4px 0" }}>
                <span>{t(p.method as Key)} · <span className="lbl">{dateLabel(p.paidAt, lang)}</span><br /><Link href={`/receipts/${p.id}`} className="lbl" style={{ color: "var(--pri)" }}>{t("receipt")}: {p.receiptNo}</Link></span>
                <b><Money v={p.amount} currency={cur} /></b>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
