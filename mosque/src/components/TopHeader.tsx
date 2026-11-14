"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

interface TopHeaderProps {
  userName?: string;
  roleName?: string;
  mosqueName?: string;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

const BANGLADESH_DISTRICTS = [
  "গাজীপুর",
  "ঢাকা",
  "নারায়ণগঞ্জ",
  "নরসিংদী",
  "মানিকগঞ্জ",
  "মুন্সীগঞ্জ",
  "চট্টগ্রাম",
  "কক্সবাজার",
  "কুমিল্লা",
  "নোয়াখালী",
  "ফেনী",
  "ব্রাহ্মণবাড়িয়া",
  "সিলেট",
  "মৌলভীবাজার",
  "হবিগঞ্জ",
  "সুনামগঞ্জ",
  "রাজশাহী",
  "বগুড়া",
  "পাবনা",
  "খুলনা",
  "যশোর",
  "কুষ্টিয়া",
  "বরিশাল",
  "পটুয়াখালী",
  "রংপুর",
  "দিনাজপুর",
  "ময়মনসিংহ",
  "জামালপুর",
];

function getBanglaDate(): string {
  const now = new Date();
  const day = now.getDate();
  const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
  const bngDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const dayStr = String(day).split("").map((d) => bngDigits[parseInt(d, 10)] ?? d).join("");
  return `${dayStr} ${months[now.getMonth()]}`;
}

export function TopHeader({
  userName = "মুসাল্লি",
  roleName = "সদস্য",
  mosqueName = "বাইতুন নূর জামে মসজিদ",
  unreadNotifications = 3,
  onOpenNotifications,
  onOpenProfile,
}: TopHeaderProps) {
  const router = useRouter();
  const [location, setLocation] = useState("গাজীপুর");
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [currentMosqueName, setCurrentMosqueName] = useState(mosqueName);
  const [mosqueLogo, setMosqueLogo] = useState<string | null>(null);
  const [showMosqueModal, setShowMosqueModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState(mosqueName);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [modalErr, setModalErr] = useState("");

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "A";
  const dynamicDate = getBanglaDate();

  // Load saved location & logo from localStorage
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("user_selected_district");
      if (savedLoc) setLocation(savedLoc);

      const savedLogo = localStorage.getItem("mosque_custom_logo");
      if (savedLogo) setMosqueLogo(savedLogo);

      const savedName = localStorage.getItem("mosque_custom_name");
      if (savedName) {
        setCurrentMosqueName(savedName);
        setEditNameInput(savedName);
      } else if (mosqueName) {
        setCurrentMosqueName(mosqueName);
        setEditNameInput(mosqueName);
      }
    } catch {}
  }, [mosqueName]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocation(val);
    try {
      localStorage.setItem("user_selected_district", val);
      window.dispatchEvent(new CustomEvent("mosque_location_changed", { detail: val }));
    } catch {}
    setShowLocationToast(true);
    setTimeout(() => setShowLocationToast(false), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setModalErr("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "আপলোড ব্যর্থ হয়েছে");
      }
      const data = await res.json();
      setMosqueLogo(data.url);
      try {
        localStorage.setItem("mosque_custom_logo", data.url);
      } catch {}
    } catch (err: any) {
      setModalErr(err?.message || "লোগো আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveMosqueInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameInput.trim()) {
      setModalErr("মসজিদের নাম খালি রাখা যাবে না");
      return;
    }
    const trimmed = editNameInput.trim();
    setCurrentMosqueName(trimmed);
    try {
      localStorage.setItem("mosque_custom_name", trimmed);
      // Attempt backend update if permitted
      await api("/api/settings", {
        method: "PATCH",
        body: { name: trimmed },
      }).catch(() => {});
    } catch {}
    setShowMosqueModal(false);
  };

  const handleResetLogo = () => {
    setMosqueLogo(null);
    try {
      localStorage.removeItem("mosque_custom_logo");
    } catch {}
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Main Top Header Bar */}
      <header className="super-header" style={{ alignItems: "center", marginBottom: 8 }}>
        {/* Left: Mosque Logo & Mosque Name */}
        <div
          onClick={() => setShowMosqueModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            flex: 1,
            minWidth: 0,
            padding: "4px 8px 4px 4px",
            borderRadius: 14,
            transition: "background 0.2s ease",
          }}
          title="মসজিদের নাম ও লোগো পরিবর্তন করতে ক্লিক করুন"
        >
          {/* Mosque Logo Avatar */}
          <div
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%)",
              border: "2px solid rgba(250, 204, 21, 0.7)",
              boxShadow: "0 3px 10px rgba(6, 95, 70, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {mosqueLogo ? (
              <img src={mosqueLogo} alt={currentMosqueName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 24 }}>🕌</span>
            )}
          </div>

          {/* Mosque Name & Identity */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.2px",
                }}
              >
                {currentMosqueName}
              </span>
              <span
                style={{
                  background: "rgba(16,185,129,0.18)",
                  color: "#059669",
                  borderRadius: "50%",
                  width: 17,
                  height: 17,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
                title="ভেরিফাইড মসজিদ"
              >
                ✓
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
              <span>স্মার্ট মসজিদ পোর্টাল</span>
              <span>·</span>
              <span style={{ color: "var(--pri)", fontWeight: 700 }}>{location}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>✏️</span>
            </div>
          </div>
        </div>

        {/* Right: Notifications & User Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            className="bell-icon-btn"
            onClick={onOpenNotifications || (() => router.push("/notifications"))}
            aria-label="Notifications"
            title="বিজ্ঞপ্তি"
          >
            <span>🔔</span>
            {unreadNotifications > 0 && <span className="bell-badge">{unreadNotifications}</span>}
          </button>

          <button
            className="user-avatar-btn"
            title={`${userName} (${roleName}) - প্রোফাইল দেখুন`}
            onClick={onOpenProfile || (() => router.push("/members/me"))}
          >
            {firstLetter}
          </button>
        </div>
      </header>

      {/* Row 2: Dynamic Date & Location Selector Pill */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Dynamic Date badge */}
          <div className="header-pill">
            <span>📅</span>
            <span style={{ fontWeight: 600 }}>{dynamicDate}</span>
          </div>

          {/* Location picker */}
          <div className="header-pill" style={{ position: "relative" }}>
            <span>📍</span>
            <select
              value={location}
              onChange={handleLocationChange}
              aria-label="Location"
              style={{ fontWeight: 700, color: "var(--text)" }}
            >
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span>▾</span>
          </div>

          {showLocationToast && (
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
              ✓ অবস্থান সংরক্ষিত!
            </span>
          )}
        </div>

        <button
          onClick={() => setShowMosqueModal(true)}
          style={{
            background: "transparent",
            border: "1px dashed var(--bd)",
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: 11,
            color: "var(--muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>🕌</span>
          <span>মসজিদের নাম ও লোগো পরিবর্তন</span>
        </button>
      </div>

      {/* Modal: Edit Mosque Name & Logo */}
      {showMosqueModal && (
        <div className="modal-backdrop" onClick={() => setShowMosqueModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">
                <span>🕌</span>
                <span>মসজিদের নাম ও লোগো কাস্টমাইজ</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowMosqueModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {modalErr && (
                <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.12)", color: "var(--bad)", borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
                  {modalErr}
                </div>
              )}

              <form onSubmit={handleSaveMosqueInfo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Logo Section with Direct Upload */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                    মসজিদের অফিশিয়াল লোগো (ছবি আপলোড):
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        minWidth: 64,
                        borderRadius: 18,
                        background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%)",
                        border: "2px solid #fbbf24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {mosqueLogo ? (
                        <img src={mosqueLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>🕌</span>
                      )}
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: "var(--pri-light)",
                          border: "1.5px dashed var(--pri)",
                          borderRadius: 10,
                          padding: "8px 14px",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--pri-dark)",
                        }}
                      >
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                        <span>📁 ডিভাইস থেকে লোগো আপলোড (Cloudinary)</span>
                      </label>

                      {uploadingLogo && (
                        <span style={{ fontSize: 11, color: "var(--pri)", fontWeight: 600 }}>
                          ⏳ ক্লাউডিনারিতে আপলোড হচ্ছে...
                        </span>
                      )}

                      {mosqueLogo && !uploadingLogo && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          style={{ background: "none", border: 0, color: "var(--bad)", fontSize: 11, textAlign: "left", cursor: "pointer", textDecoration: "underline" }}
                        >
                          ডিফল্ট লোগো রিসেট
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mosque Name Input */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                    মসজিদের পূর্ণাঙ্গ নাম:
                  </label>
                  <input
                    type="text"
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    placeholder="যেমন: রহমানিয়া জামে মসজিদ"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 14, fontWeight: 600 }}
                  />
                </div>

                {/* District / Location */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                    মসজিদের অবস্থান (জেলা):
                  </label>
                  <select
                    value={location}
                    onChange={handleLocationChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--bd)", fontSize: 14 }}
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowMosqueModal(false)} style={{ background: "transparent", border: "1px solid var(--bd)", padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                    বাতিল
                  </button>
                  <button type="submit" className="btn" style={{ width: "auto" }}>
                    ✓ সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
