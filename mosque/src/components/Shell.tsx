"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext } from "react";
import type { Me } from "@/lib/auth";
import { api } from "@/lib/client";
import { Bell } from "./Bell";
import { Controls } from "./Controls";
import { useT } from "./Providers";

const MeCtx = createContext<Me | null>(null);
export const useMe = () => {
  const m = useContext(MeCtx);
  if (!m) throw new Error("Shell missing");
  return m;
};

export function Shell({ me, children }: { me: Me; children: ReactNode }) {
  const { t } = useT();
  const path = usePathname();
  const router = useRouter();
  const active = me.status === "ACTIVE";
  const isDashboard = path === "/dashboard";

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const navItems = [
    { href: "/dashboard", icon: "🏠", label: "হোম", show: active },
    { href: "/months", icon: "📅", label: "মাসিক", show: active },
    { href: "/expenses", icon: "💸", label: "ব্যয়", show: active },
    { href: "/members", icon: "👥", label: "সদস্য", show: me.canViewContributors },
    { href: "/settings", icon: "⚙️", label: "সেটিংস", show: active && me.permissions.includes("roles.manage") },
    { href: "/members/me", icon: "👤", label: "অ্যাকাউন্ট", show: active },
  ].filter((i) => i.show);

  return (
    <MeCtx.Provider value={me}>
      {isDashboard ? (
        children
      ) : (
        <>
          <div className="app-wrapper">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--pri)", fontSize: 14 }}>
                <span>←</span>
                <span>অ্যাপ হোম</span>
              </Link>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {active && <Bell />}
                <button
                  onClick={logout}
                  style={{ border: "1px solid var(--bd)", background: "var(--card)", padding: "5px 10px", borderRadius: 10, fontSize: 12, cursor: "pointer", color: "var(--muted)" }}
                >
                  {t("logout")}
                </button>
              </div>
            </div>
            <Controls />
            {children}
          </div>
          {navItems.length > 0 && (
            <nav className="bottom-nav-bar">
              {navItems.slice(0, 4).map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`bottom-nav-item ${path === i.href || (i.href !== "/dashboard" && path.startsWith(i.href)) ? "active" : ""}`}
                >
                  <span>{i.icon}</span>
                  <div>{i.label}</div>
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </MeCtx.Provider>
  );
}
