"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMe } from "@/components/Shell";
import { useT } from "@/components/Providers";
import { Badge, ErrorBox, Loading, Money, Progress } from "@/components/ui";
import { useApi } from "@/lib/client";
import { num, periodLabel } from "@/lib/format";
import { TopHeader } from "@/components/TopHeader";
import { PrayerWidget } from "@/components/PrayerWidget";
import { MasterDuesSheet } from "@/components/MasterDuesSheet";
import { AdminPanelModal } from "@/components/AdminPanelModal";
import { QuranReaderModal } from "@/components/QuranReaderModal";
import { MaktabModal } from "@/components/MaktabModal";
import { MealRosterModal } from "@/components/MealRosterModal";
import { TasbeehModal } from "@/components/TasbeehModal";
import { ZakatModal } from "@/components/ZakatModal";
import { ByokAiModal } from "@/components/ByokAiModal";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { PaymentForm } from "@/components/PaymentForm";
import type { MonthOverview } from "@/services/reports";

type Dash = {
  currency: string;
  currentPeriod: string;
  funds: { id: string; name: string; restricted: boolean; income: number; expense: number; balance: number }[];
  totals: { income: number; expense: number; balance: number; pendingApproval: number };
  thisMonth: MonthOverview | null;
  series: MonthOverview[];
  mine: { due: number; paid: number; remaining: number };
};

export default function DashboardPage() {
  const router = useRouter();
  const me = useMe();
  const { t, lang } = useT();
  const { data: d, error, reload } = useApi<Dash>("/api/dashboard");

  const [modal, setModal] = useState<string | null>(null);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string | null>(null);

  const openModal = (m: string) => setModal(m);
  const closeModal = () => { setModal(null); setSelectedMemberForPayment(null); };

  if (error) return <ErrorBox code={error} onRetry={reload} />;
  if (!d) return <Loading />;

  const cur = d.currency;
  const max = Math.max(1, ...d.series.map((s) => s.expected));

  const FEATURE_BUTTONS = [
    { id: "admin-360", icon: "👑", label: "মূল অ্যাডমিন ৩৬০", highlight: true, action: () => router.push("/admin-360") },
    { id: "super-app", icon: "📱", label: "ইসলামিক সুপার অ্যাপ", highlight: true, action: () => router.push("/super-app") },
    { id: "master", icon: "📊", label: "মাস্টার হিসাব", highlight: true, action: () => openModal("master-dues") },
    { id: "admin", icon: "⚙️", label: "কুইক প্যানেল", action: () => openModal("admin") },
    { id: "quran", icon: "📖", label: "কুরআন শরীফ", action: () => openModal("quran") },
    { id: "maktab", icon: "🏫", label: "নূরানী মক্তব", action: () => router.push("/maktab") },
    { id: "roster", icon: "🍲", label: "খাবার রোস্টার", action: () => openModal("meal-roster") },
    { id: "tasbeeh", icon: "📿", label: "ডিজিটাল তাসবীহ", action: () => openModal("tasbeeh") },
    { id: "zakat", icon: "💰", label: "যাকাত ফিতরা", action: () => openModal("zakat") },
    { id: "super-admin", icon: "🌐", label: "SaaS সুপার অ্যাডমিন", highlight: true, action: () => router.push("/super-admin") },
    { id: "ai", icon: "🤖", label: "BYOK AI সহকারী", action: () => openModal("byok-ai") },
  ];

  return (
    <div className="app-wrapper">
      {/* Top Header matching screenshots */}
      <TopHeader
        userName={me.user.name}
        roleName={me.role.name}
        mosqueName={me.mosque.name}
        unreadNotifications={3}
      />

      {/* Prayer Times & Hijri Date Widget */}
      <PrayerWidget />

      {/* Separate APK Feature Buttons Grid */}
      <div style={{ margin: "16px 0 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 4, height: 18, background: "var(--pri)", borderRadius: 999, display: "inline-block" }}></span>
          <span>স্মার্ট ইসলামিক ও মসজিদ সেবা</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>আলাদা ফিচার বোতাম</span>
      </div>

      <div className="action-grid">
        {FEATURE_BUTTONS.map((btn) => (
          <div
            key={btn.id}
            className="action-card"
            onClick={btn.action}
            style={{
              background: btn.highlight ? "linear-gradient(180deg, var(--card), var(--pri-soft))" : "var(--card)",
              borderColor: btn.highlight ? "var(--pri)" : "var(--bd)",
            }}
          >
            <div className="action-card-icon">{btn.icon}</div>
            <div className="action-card-label" style={{ color: btn.highlight ? "var(--pri-dark)" : "var(--text)" }}>
              {btn.label}
            </div>
          </div>
        ))}
      </div>

      {/* --- Complete Mosque SaaS Dashboard from AGENT.md --- */}
      <div style={{ margin: "20px 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 4, height: 18, background: "var(--pri)", borderRadius: 999, display: "inline-block" }}></span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{me.mosque.name} — ফিন্যান্স ড্যাশবোর্ড</span>
      </div>

      {/* Hero Card */}
      <div className="hero">
        <small>{t("assalamu")} · {t("available")}</small>
        <div className="amt"><Money v={d.totals.balance} currency={cur} /></div>
        <div className="hrow">
          <Link href="/months">{t("income")}<b><Money v={d.totals.income} currency={cur} /></b></Link>
          <Link href="/expenses">{t("expense")}<b><Money v={d.totals.expense} currency={cur} /></b></Link>
        </div>
      </div>

      {/* My Account */}
      <h2>{t("myAccount")}</h2>
      <Link href="/members/me" className="card grid2">
        <div>
          <div className="lbl">{t("youPaid")}</div>
          <div className="big pos"><Money v={d.mine.paid} currency={cur} /></div>
        </div>
        <div>
          <div className="lbl">{t("youOwe")}</div>
          <div className="big" style={{ color: d.mine.remaining > 0 ? "var(--bad)" : "var(--ok)" }}>
            <Money v={d.mine.remaining} currency={cur} />
          </div>
        </div>
      </Link>

      {/* This Month Collection Overview */}
      {d.thisMonth && (
        <>
          <h2>{t("thisMonth")} · {periodLabel(d.currentPeriod, lang)}</h2>
          <Link href={`/months/${d.currentPeriod}`} className="card">
            <div className="lbl">{t("collected")}</div>
            <div className="big">
              <Money v={d.thisMonth.collected} currency={cur} />{" "}
              <span className="lbl">/ <Money v={d.thisMonth.expected} currency={cur} /></span>
            </div>
            <Progress value={d.thisMonth.collected} max={d.thisMonth.expected} />
            <div className="lbl">
              {num(d.thisMonth.paidCount, lang)} / {num(d.thisMonth.members, lang)} {t("paidMembers")}
            </div>
          </Link>
        </>
      )}

      {/* Mosque Funds */}
      <h2>{t("funds")}</h2>
      <div className="funds">
        {d.funds.map((f) => (
          <Link key={f.id} href={`/funds/${f.id}`} className="card fund">
            <div className="lbl">{f.name}</div>
            <div className="big"><Money v={f.balance} currency={cur} /></div>
            {f.restricted && <span className="chip">{t("restricted")}</span>}
          </Link>
        ))}
      </div>

      {/* Pending Bill Approval Alert */}
      {d.totals.pendingApproval > 0 && (
        <Link href="/expenses" className="card" style={{ borderLeft: "4px solid var(--warn)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Badge status="PENDING" />
            <span style={{ marginLeft: 8, fontWeight: 600 }}>{t("pendingApproval")}</span>
          </div>
          <div style={{ fontWeight: 700, color: "var(--warn)" }}>
            <Money v={d.totals.pendingApproval} currency={cur} />
          </div>
        </Link>
      )}

      {/* 12-Month Trends */}
      {d.series.length > 0 && (
        <>
          <h2>{t("trend")}</h2>
          <div className="card">
            <div className="bars">
              {d.series.map((s) => (
                <Link key={s.period} href={`/months/${s.period}`} aria-label={periodLabel(s.period, lang)}>
                  <i style={{ height: `${Math.max(3, (s.collected / max) * 100)}%` }} />
                  {periodLabel(s.period, lang, "short")}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="bottom-nav-bar">
        <Link href="/dashboard" className="bottom-nav-item active">
          <span>🏠</span>
          <div>হোম</div>
        </Link>
        <Link href="/months" className="bottom-nav-item">
          <span>📅</span>
          <div>মাসিক</div>
        </Link>
        <Link href="/expenses" className="bottom-nav-item">
          <span>💸</span>
          <div>ব্যয়</div>
        </Link>
        <Link href="/members" className="bottom-nav-item">
          <span>👥</span>
          <div>সদস্য</div>
        </Link>
        <Link href="/settings" className="bottom-nav-item">
          <span>⚙️</span>
          <div>সেটিংস</div>
        </Link>
      </nav>

      {/* PWA Prompt */}
      <PwaInstallPrompt />

      {/* Interactive Modals */}
      {modal === "master-dues" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div className="modal-title">
                <span>📊</span>
                <span>মাসিক হিসাব মাস্টার শিট (এক সাথে সব হিসাব)</span>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <MasterDuesSheet
                onRecordPayment={(id) => {
                  setSelectedMemberForPayment(id);
                  setModal("payment");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {modal === "payment" && selectedMemberForPayment && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><span>💳</span><span>ইনফাক গ্রহণ করুন</span></div>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <PaymentForm
                membershipId={selectedMemberForPayment}
                onDone={() => {
                  setModal("master-dues");
                  reload();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {modal === "admin" && (
        <AdminPanelModal
          onClose={closeModal}
          onOpenMasterDues={() => openModal("master-dues")}
        />
      )}

      {modal === "quran" && <QuranReaderModal onClose={closeModal} />}
      {modal === "maktab" && <MaktabModal onClose={closeModal} />}
      {modal === "meal-roster" && <MealRosterModal onClose={closeModal} />}
      {modal === "tasbeeh" && <TasbeehModal onClose={closeModal} />}
      {modal === "zakat" && <ZakatModal onClose={closeModal} />}
      {modal === "byok-ai" && <ByokAiModal onClose={closeModal} />}
    </div>
  );
}
