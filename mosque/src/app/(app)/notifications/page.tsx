"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useT } from "@/components/Providers";
import { Empty, ErrorBox, Loading } from "@/components/ui";
import { api, useInfinite } from "@/lib/client";
import { dateLabel, fill, money } from "@/lib/format";
import type { Key } from "@/lib/i18n";
import { useMe } from "@/components/Shell";

type N = { id: string; kind: string; data: Record<string, string | number>; link: string | null; read: boolean; createdAt: string };

export default function Notifications() {
  const { t, lang } = useT();
  const cur = useMe().mosque.currency;
  const list = useInfinite<N>("/api/notifications");
  const marked = useRef(false);
  useEffect(() => {
    if (list.state !== "loading" && list.items.length && !marked.current) {
      marked.current = true;
      void api("/api/notifications/read", { method: "POST" }); // mark after the user has seen the list
    }
  }, [list.state, list.items.length]);
  const text = (n: N) =>
    fill((t(`n_${n.kind}` as Key) as string) || n.kind, {
      mosque: n.data.mosque ?? "", voucher: n.data.voucherNo ?? "", category: t((n.data.category as string) as Key) ?? "",
      amount: money(Number(n.data.amount ?? 0), lang, cur), hours: n.data.hoursPending ?? "",
    });
  return (
    <div>
      <h2 style={{ marginTop: 6 }}>{t("notifications")}</h2>
      <div className="card">
        {list.items.map((n) => (
          <Link key={n.id} href={n.link ?? "/notifications"} className={`row ${n.read ? "" : "unreadrow"}`}>
            <div className="m"><b style={{ fontWeight: n.read ? 500 : 700 }}>{text(n)}</b><small>{dateLabel(n.createdAt, lang)}</small></div>
          </Link>
        ))}
        {list.state === "loading" && <Loading />}
        {list.state === "error" && <ErrorBox code="SERVER_ERROR" onRetry={list.retry} />}
        {list.state === "done" && list.items.length === 0 && <Empty>{t("noNotifications")}</Empty>}
        <div ref={list.sentinel} style={{ height: 1 }} />
      </div>
    </div>
  );
}
