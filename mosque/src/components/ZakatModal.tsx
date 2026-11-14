"use client";
import { useState } from "react";

export function ZakatModal({ onClose }: { onClose: () => void }) {
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0); // in BDT value
  const [silver, setSilver] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [debts, setDebts] = useState(0);

  // Nisab threshold approx in BDT (silver 52.5 tola ~ 95,000 BDT)
  const NISAB = 95000;
  const totalAssets = cash + gold + silver + investments;
  const netWealth = Math.max(0, totalAssets - debts);
  const isEligible = netWealth >= NISAB;
  const zakatPayable = isEligible ? Math.round(netWealth * 0.025) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>💰</span>
            <span>যাকাত ও ফিতরা ক্যালকুলেটর</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>বর্তমান রূপার নেসাব (৫২.৫ তোলা):</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--pri)" }}>৳{NISAB.toLocaleString("bn-BD")}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              বৎসরান্তে মোট সম্পদ নেসাব অতিক্রম করলে ২.৫% যাকাত প্রযোজ্য।
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>নগদ টাকা ও ব্যাংক ব্যালেন্স (৳):</label>
            <input type="number" placeholder="০" onChange={(e) => setCash(Number(e.target.value))} className="input-field" />

            <label style={{ fontSize: 13, fontWeight: 600 }}>স্বর্ণের বর্তমান আনুমানিক বাজারমূল্য (৳):</label>
            <input type="number" placeholder="০" onChange={(e) => setGold(Number(e.target.value))} className="input-field" />

            <label style={{ fontSize: 13, fontWeight: 600 }}>রৌপ্য ও ব্যবসার পণ্যমূল্য (৳):</label>
            <input type="number" placeholder="০" onChange={(e) => setSilver(Number(e.target.value))} className="input-field" />

            <label style={{ fontSize: 13, fontWeight: 600 }}>ঋণ ও বাদযোগ্য দেনা (৳):</label>
            <input type="number" placeholder="০" onChange={(e) => setDebts(Number(e.target.value))} className="input-field" />
          </div>

          <div style={{ marginTop: 14, padding: "14px", borderRadius: 16, background: isEligible ? "rgba(16,185,129,0.1)" : "var(--bg)", border: isEligible ? "1px solid #6ee7b7" : "1px solid var(--bd)", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>আপনার প্রদেয় যাকাত:</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: isEligible ? "var(--ok)" : "var(--muted)", margin: "4px 0" }}>
              ৳{zakatPayable.toLocaleString("bn-BD")}
            </div>
            <div style={{ fontSize: 12, color: isEligible ? "var(--ok)" : "var(--muted)", fontWeight: 600 }}>
              {isEligible ? "✓ আপনার উপর যাকাত আবশ্যক" : "আপনার সম্পদ এখনো নেসাব পরিমাণে পৌঁছেনি"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
