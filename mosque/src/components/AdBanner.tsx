"use client";

interface AdBannerProps {
  onDonateClick?: () => void;
}

export function AdBanner({ onDonateClick }: AdBannerProps) {
  return (
    <div className="sadaqah-banner">
      <div style={{ flex: 1 }}>
        <div className="sadaqah-badge">
          <span>💚</span>
          <span>সাদাকায়ে জারিয়াহ</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 2px", color: "var(--text)" }}>
          মুসলিম বাংলার সাথী হোন
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}>
          দশ্যের লাঠি একের বোঝা — প্রতি মাসে সামান্য সাদাকাহর মাধ্যমে মসজিদের অগ্রযাত্রার সাথী হন।
        </div>
      </div>
      <div>
        <button className="sadaqah-btn" onClick={onDonateClick}>
          <span>দান করুন</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
