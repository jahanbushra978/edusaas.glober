"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useApi } from "@/lib/client";
import { num } from "@/lib/format";
import { useT } from "./Providers";

/** Unread badge; refreshes every minute while the app is open. Delivery itself never depends on this. */
export function Bell() {
  const { lang, t } = useT();
  const { data, reload } = useApi<{ unread: number }>("/api/notifications");
  useEffect(() => {
    const id = setInterval(reload, 60_000);
    return () => clearInterval(id);
  }, [reload]);
  return (
    <Link href="/notifications" className="iconbtn" aria-label={t("notifications")} style={{ position: "relative" }}>
      🔔
      {!!data?.unread && <span className="dot">{data.unread > 9 ? "9+" : num(data.unread, lang)}</span>}
    </Link>
  );
}
