"use client";
import { useT } from "./Providers";

export function PendingNotice() {
  const { t } = useT();
  return (
    <div className="card state" style={{ marginTop: 24 }}>
      <div style={{ fontSize: 42 }}>⏳</div>
      <b style={{ color: "var(--text)", fontSize: 18 }}>{t("pendingTitle")}</b>
      <p>{t("pendingBody")}</p>
    </div>
  );
}
