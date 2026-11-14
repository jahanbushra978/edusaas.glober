"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "./TopHeader";
import { PrayerWidget } from "./PrayerWidget";
import { AdBanner } from "./AdBanner";
import { MasterDuesSheet } from "./MasterDuesSheet";
import { AdminPanelModal } from "./AdminPanelModal";
import { QuranReaderModal } from "./QuranReaderModal";
import { MaktabModal } from "./MaktabModal";
import { MealRosterModal } from "./MealRosterModal";
import { TasbeehModal } from "./TasbeehModal";
import { ZakatModal } from "./ZakatModal";
import { ByokAiModal } from "./ByokAiModal";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { PaymentForm } from "./PaymentForm";
import type { Me } from "@/lib/auth";

// Dedicated rich Islamic detail modals
import { KitabModal } from "./modals/KitabModal";
import { HadithModal } from "./modals/HadithModal";
import { ArticleModal } from "./modals/ArticleModal";
import { BayanModal } from "./modals/BayanModal";
import { JainamazModal } from "./modals/JainamazModal";
import { QiblaModal } from "./modals/QiblaModal";
import { PrayerTimesDetailModal } from "./modals/PrayerTimesDetailModal";
import { DuaModal } from "./modals/DuaModal";
import { AmalTrackerModal } from "./modals/AmalTrackerModal";
import { HajjModal } from "./modals/HajjModal";
import { IslamicQuizModal } from "./modals/IslamicQuizModal";
import { NikahModal } from "./modals/NikahModal";
import { HalalJobModal } from "./modals/HalalJobModal";
import { SupportModal } from "./modals/SupportModal";
import { NamesOfAllahModal } from "./modals/NamesOfAllahModal";
import { LiveStreamModal } from "./modals/LiveStreamModal";
import { RozaModal } from "./modals/RozaModal";

export function IslamicSuperApp({ me }: { me?: Me | null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ilm" | "amal" | "seba" | "bibidh">("ilm");
  const [modal, setModal] = useState<string | null>(null);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string | null>(null);

  const openModal = (id: string) => setModal(id);
  const closeModal = () => { setModal(null); setSelectedMemberForPayment(null); };

  // Definition of grid action cards per tab - Every button opens deep details!
  const ILM_ITEMS = [
    { id: "quran", icon: "📖", label: "কুরআন", action: () => openModal("quran") },
    { id: "kitab", icon: "📚", label: "কিতাব", action: () => openModal("kitab") },
    { id: "hadith", icon: "📜", label: "হাদীস", action: () => openModal("hadith") },
    { id: "article", icon: "✍️", label: "প্রবন্ধ", action: () => openModal("article") },
    { id: "bayan", icon: "🎙️", label: "বয়ান", action: () => openModal("bayan") },
    { id: "maktab", icon: "🏫", label: "মক্তব", action: () => router.push("/maktab") },
    { id: "jainamaz", icon: "🕌", label: "জায়নামাজ", action: () => openModal("jainamaz") },
    { id: "qibla", icon: "🧭", label: "কিবলা", action: () => openModal("qibla") },
  ];

  const AMAL_ITEMS = [
    { id: "prayer", icon: "⏱️", label: "নামাজের সময়", action: () => openModal("prayer-detail") },
    { id: "tilawat", icon: "🎧", label: "তিলাওয়াত", action: () => openModal("quran") },
    { id: "dua", icon: "🤲", label: "দু'আ", action: () => openModal("dua") },
    { id: "tasbeeh", icon: "📿", label: "তাসবীহ", action: () => openModal("tasbeeh") },
    { id: "tracker", icon: "📝", label: "আমল ট্রাকার", action: () => openModal("tracker") },
    { id: "roster", icon: "🍲", label: "খাবার রোস্টার", action: () => openModal("meal-roster") },
    { id: "hajj", icon: "🕋", label: "হজ্জ ও উমরা", action: () => openModal("hajj") },
    { id: "roza", icon: "🌙", label: "রোযা ও সাহরি", action: () => openModal("roza") },
  ];

  const SEBA_ITEMS = [
    { id: "zakat", icon: "💰", label: "যাকাত ফিতরা", action: () => openModal("zakat") },
    { id: "donation", icon: "🎁", label: "ইনফাক ও অনুদান", action: () => openModal("master-dues") },
    { id: "voucher", icon: "🧾", label: "ডিজিটাল ভাউচার", action: () => router.push("/expenses") },
    { id: "qa", icon: "📞", label: "দ্বীনি জিজ্ঞাসা", action: () => openModal("byok-ai") },
    { id: "quiz", icon: "💡", label: "তালীমে কুইজ", action: () => openModal("quiz") },
    { id: "nikah", icon: "💍", label: "বিবাহ", action: () => openModal("nikah") },
    { id: "job", icon: "📰", label: "চাকরি", action: () => openModal("job") },
    { id: "support", icon: "💬", label: "সাপোর্ট", action: () => openModal("support") },
  ];

  const BIBIDH_ITEMS = [
    { id: "mosque", icon: "🕌", label: "আমার মসজিদ", action: () => router.push("/dashboard") },
    { id: "master", icon: "📊", label: "মাসিক হিসাব", action: () => openModal("master-dues") },
    { id: "admin", icon: "⚙️", label: "অ্যাডমিন প্যানেল", action: () => openModal("admin") },
    { id: "ai", icon: "🤖", label: "BYOK AI সহকারী", action: () => openModal("byok-ai") },
    { id: "names", icon: "✨", label: "আসমাউল হুসনা", action: () => openModal("names") },
    { id: "live", icon: "🕋", label: "লাইভ", action: () => openModal("live") },
    { id: "roza", icon: "🌙", label: "রোযা ক্যালেন্ডার", action: () => openModal("roza") },
    { id: "settings", icon: "🔧", label: "অন্যান্য", action: () => router.push("/settings") },
  ];

  const currentItems =
    activeTab === "ilm" ? ILM_ITEMS :
    activeTab === "amal" ? AMAL_ITEMS :
    activeTab === "seba" ? SEBA_ITEMS : BIBIDH_ITEMS;

  const sectionTitle =
    activeTab === "ilm" ? "ইলম" :
    activeTab === "amal" ? "আমল" :
    activeTab === "seba" ? "সেবা" : "বিবিধ";

  return (
    <div className="app-wrapper">
      {/* Top Header */}
      <TopHeader
        userName={me?.user?.name}
        roleName={me?.role?.name}
        mosqueName={me?.mosque?.name}
        unreadNotifications={3}
        onOpenProfile={() => router.push("/members/me")}
      />

      {/* Hijri & Bangla Date + Prayer Widget */}
      <PrayerWidget />

      {/* Donation Ad Banner */}
      <AdBanner onDonateClick={() => openModal("master-dues")} />

      {/* Section Header with vertical green line */}
      <div className="section-header">
        <div className="section-title-wrap">
          <div className="section-line"></div>
          <div>{sectionTitle}</div>
        </div>
        <button className="section-icon-btn" onClick={() => openModal(activeTab === "bibidh" ? "admin" : "quran")}>
          🔍
        </button>
      </div>

      {/* App Action Cards Grid */}
      <div className="action-grid">
        {currentItems.map((item) => (
          <div key={item.id} className="action-card" onClick={item.action}>
            <div className="action-card-icon">{item.icon}</div>
            <div className="action-card-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav-bar">
        <button
          className={`bottom-nav-item ${activeTab === "ilm" ? "active" : ""}`}
          onClick={() => setActiveTab("ilm")}
        >
          <span>📖</span>
          <div>ইলম</div>
        </button>
        <button
          className={`bottom-nav-item ${activeTab === "amal" ? "active" : ""}`}
          onClick={() => setActiveTab("amal")}
        >
          <span>📝</span>
          <div>আমল</div>
        </button>
        <button
          className={`bottom-nav-item ${activeTab === "seba" ? "active" : ""}`}
          onClick={() => setActiveTab("seba")}
        >
          <span>🛍️</span>
          <div>সেবা</div>
        </button>
        <button
          className={`bottom-nav-item ${activeTab === "bibidh" ? "active" : ""}`}
          onClick={() => setActiveTab("bibidh")}
        >
          <span>⊞</span>
          <div>বিবিধ</div>
        </button>
      </nav>

      {/* PWA Prompt */}
      <PwaInstallPrompt />

      {/* Modals */}
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
                  closeModal();
                  openModal("master-dues");
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

      {/* Core existing modals */}
      {modal === "quran" && <QuranReaderModal onClose={closeModal} />}
      {modal === "maktab" && <MaktabModal onClose={closeModal} />}
      {modal === "meal-roster" && <MealRosterModal onClose={closeModal} />}
      {modal === "tasbeeh" && <TasbeehModal onClose={closeModal} />}
      {modal === "zakat" && <ZakatModal onClose={closeModal} />}
      {modal === "byok-ai" && <ByokAiModal onClose={closeModal} />}

      {/* New Rich Interactive Detail Modals */}
      {modal === "kitab" && <KitabModal onClose={closeModal} />}
      {modal === "hadith" && <HadithModal onClose={closeModal} />}
      {modal === "article" && <ArticleModal onClose={closeModal} />}
      {modal === "bayan" && <BayanModal onClose={closeModal} />}
      {modal === "jainamaz" && <JainamazModal onClose={closeModal} />}
      {modal === "qibla" && <QiblaModal onClose={closeModal} />}
      {modal === "prayer-detail" && <PrayerTimesDetailModal onClose={closeModal} />}
      {modal === "dua" && <DuaModal onClose={closeModal} />}
      {modal === "tracker" && <AmalTrackerModal onClose={closeModal} />}
      {modal === "hajj" && <HajjModal onClose={closeModal} />}
      {modal === "quiz" && <IslamicQuizModal onClose={closeModal} />}
      {modal === "nikah" && <NikahModal onClose={closeModal} />}
      {modal === "job" && <HalalJobModal onClose={closeModal} />}
      {modal === "support" && <SupportModal onClose={closeModal} />}
      {modal === "names" && <NamesOfAllahModal onClose={closeModal} />}
      {modal === "live" && <LiveStreamModal onClose={closeModal} />}
      {modal === "roza" && <RozaModal onClose={closeModal} />}
    </div>
  );
}
