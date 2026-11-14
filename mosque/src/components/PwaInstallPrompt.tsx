"use client";
import { useState, useEffect } from "react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
    } else {
      alert("অ্যাপটি ইনস্টল করতে আপনার ব্রাউজারের মেনু থেকে 'Add to Home Screen' অথবা 'Install' চাপুন।");
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 440, background: "var(--card)",
      border: "1px solid var(--bd)", borderRadius: 18, padding: "12px 16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.18)", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12, zIndex: 90
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>📱</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>মসজিদ SaaS অ্যাপ ইনস্টল করুন</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>সহজ ও দ্রুত ব্যবহারের জন্য হোম স্ক্রিনে যোগ করুন</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={handleInstall}
          style={{ background: "var(--pri)", color: "#fff", border: 0, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          ইনস্টল
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          style={{ background: "transparent", border: 0, fontSize: 16, color: "var(--muted)", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
