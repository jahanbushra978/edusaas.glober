"use client";
import { FormEvent, useState } from "react";
import { useT } from "@/components/Providers";
import { useMe } from "@/components/Shell";
import { ErrorBox, Loading } from "@/components/ui";
import { api, ApiError, useApi } from "@/lib/client";
import type { Key } from "@/lib/i18n";
import { PERMISSIONS } from "@/lib/permissions";

type Settings = { name: string; showContributors: boolean; requireVerification: boolean };
type RoleRow = { id: string; key: string; name: string; permissions: string[]; isSystem: boolean };
type FundRow = { id: string; name: string; restricted: boolean; isMonthly: boolean };

export default function SettingsPage() {
  const { t, err } = useT();
  const me = useMe();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const settings = useApi<Settings>(me.permissions.includes("roles.manage") ? "/api/settings" : null);
  const roles = useApi<{ roles: RoleRow[] }>(me.permissions.includes("roles.manage") ? "/api/roles" : null);
  const funds = useApi<{ funds: FundRow[] }>(me.permissions.includes("roles.manage") ? "/api/funds" : null);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });
  const [newFund, setNewFund] = useState({ name: "", restricted: false });

  if (!me.permissions.includes("roles.manage")) return <p className="state">{t("noAccess")}</p>;
  if (settings.error) return <ErrorBox code={settings.error} onRetry={settings.reload} />;
  if (!settings.data || !roles.data || !funds.data) return <Loading />;

  async function run(fn: () => Promise<unknown>, after: () => void) {
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: t("updated") });
      after();
    } catch (e) {
      setMsg({ ok: false, text: err(e instanceof ApiError ? e.code : "SERVER_ERROR") });
    }
  }
  const toggle = (list: string[], p: string) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]);
  const s = settings.data;

  return (
    <div className="stack">
      <h2 style={{ marginTop: 0 }}>{t("settings")}</h2>
      {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`} role="status">{msg.text}</div>}

      <div className="card">
        <b>{t("mosqueSettings")}</b>
        <label className="field" style={{ marginTop: 10 }}>
          <span>{t("showContributors")}</span>
          <input type="checkbox" checked={s.showContributors} onChange={(e) => run(() => api("/api/settings", { method: "PATCH", body: { showContributors: e.target.checked } }), settings.reload)} style={{ width: 22, height: 22 }} />
          <small className="lbl">{t("showContributorsHint")}</small>
        </label>
        <label className="field">
          <span>{t("requireVerification")}</span>
          <input type="checkbox" checked={s.requireVerification} onChange={(e) => run(() => api("/api/settings", { method: "PATCH", body: { requireVerification: e.target.checked } }), settings.reload)} style={{ width: 22, height: 22 }} />
        </label>
      </div>

      <h2>{t("rolesTitle")}</h2>
      {roles.data.roles.map((r) => (
        <RoleCard key={r.id} role={r} onSave={(perms) => run(() => api(`/api/roles/${r.id}`, { method: "PATCH", body: { permissions: perms } }), roles.reload)} onDelete={() => run(() => api(`/api/roles/${r.id}`, { method: "DELETE" }), roles.reload)} />
      ))}
      <form
        className="card"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(() => api("/api/roles", { method: "POST", body: newRole }), () => { setNewRole({ name: "", permissions: [] }); roles.reload(); });
        }}
      >
        <b>{t("newRole")}</b>
        <label className="field" style={{ marginTop: 10 }}><span>{t("roleName")}</span><input value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} required minLength={2} /></label>
        {PERMISSIONS.map((p) => (
          <label key={p} className="row" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={newRole.permissions.includes(p)} onChange={() => setNewRole({ ...newRole, permissions: toggle(newRole.permissions, p) })} style={{ width: 20, height: 20 }} />
            <span className="m">{t(`perm.${p}` as Key)}</span>
          </label>
        ))}
        <button className="btn" style={{ marginTop: 10 }}>{t("saveRole")}</button>
      </form>

      <h2>{t("fundsTitle")}</h2>
      <div className="card">
        {funds.data.funds.map((f) => (
          <div key={f.id} className="row"><div className="m"><b>{f.name}</b></div>{f.restricted && <span className="chip">{t("restricted")}</span>}</div>
        ))}
      </div>
      <form
        className="card"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(() => api("/api/funds", { method: "POST", body: newFund }), () => { setNewFund({ name: "", restricted: false }); funds.reload(); });
        }}
      >
        <b>{t("addFund")}</b>
        <label className="field" style={{ marginTop: 10 }}><span>{t("fundName")}</span><input value={newFund.name} onChange={(e) => setNewFund({ ...newFund, name: e.target.value })} required minLength={2} /></label>
        <label className="row" style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={newFund.restricted} onChange={(e) => setNewFund({ ...newFund, restricted: e.target.checked })} style={{ width: 20, height: 20 }} />
          <span className="m">{t("restrictedFund")}</span>
        </label>
        <button className="btn" style={{ marginTop: 10 }}>{t("addFund")}</button>
      </form>
    </div>
  );
}

function RoleCard({ role, onSave, onDelete }: { role: RoleRow; onSave: (p: string[]) => void; onDelete: () => void }) {
  const { t } = useT();
  const [perms, setPerms] = useState<string[]>(role.permissions);
  const dirty = perms.length !== role.permissions.length || perms.some((p) => !role.permissions.includes(p));
  return (
    <details className="card acc">
      <summary><div className="m" style={{ flex: 1 }}><b>{role.name}</b><div className="lbl">{role.permissions.length} / {PERMISSIONS.length}</div></div></summary>
      <div className="more">
        {PERMISSIONS.map((p) => (
          <label key={p} className="row" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={perms.includes(p)} onChange={() => setPerms(perms.includes(p) ? perms.filter((x) => x !== p) : [...perms, p])} style={{ width: 20, height: 20 }} />
            <span className="m">{t(`perm.${p}` as Key)}</span>
          </label>
        ))}
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn" disabled={!dirty} onClick={() => onSave(perms)}>{t("saveRole")}</button>
          {!role.isSystem && <button className="btn bad" onClick={onDelete}>{t("deleteRole")}</button>}
        </div>
      </div>
    </details>
  );
}
