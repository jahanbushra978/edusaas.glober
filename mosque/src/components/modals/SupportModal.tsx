"use client";
import { useState } from "react";

export function SupportModal({ onClose }: { onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const FAQS = [
    {
      q: "কীভাবে নতুন সদস্য নিবন্ধন বা ভেরিফাই করব?",
      a: "অ্যাডমিন প্যানেল থেকে 'সদস্য তালিকা' পেজে গিয়ে পেন্ডিং সদস্যদের ভেরিফাই করতে পারবেন। অনুমোদনের সময় সদস্যের মাসিক চাঁদার হার (Pledge) নির্ধারণ করে দেওয়া যায়।"
    },
    {
      q: "সদস্যের মাসিক চাঁদা কীভাবে জমা করব?",
      a: "ড্যাশবোর্ডের 'মাস্টার হিসাব' বা 'ইনফাক গ্রহণ' বোতামে চাপুন। সদস্য নির্বাচন করে নগদ/বিকাশ/ব্যাংক মাধ্যমে পেমেন্ট এন্ট্রি করলেই স্বয়ংক্রিয় রসিদ তৈরি হবে।"
    },
    {
      q: "মসজিদের আয়-ব্যয় কি সকল সদস্য দেখতে পারবে?",
      a: "হ্যাঁ, সাধারণ সদস্যরা ফিন্যান্স ড্যাশবোর্ডে মোট আয়-ব্যয় এবং নিজের ব্যক্তিগত হিসাব দেখতে পান। Mosque.showContributors সেটিং চালু থাকলে দাতাদের তালিকাও দেখতে পারেন।"
    },
    {
      q: "পাসওয়ার্ড ভুলে গেলে করণীয় কী?",
      a: "মসজিদের অ্যাডমিন বা কোষাধ্যক্ষের সাথে যোগাযোগ করলে তিনি অ্যাডমিন প্যানেল থেকে সদস্যের পাসওয়ার্ড রিসেট করে দিতে পারেন।"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setTimeout(() => {
      setName("");
      setPhone("");
      setMessage("");
      setSent(false);
    }, 4000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>💬</span>
            <span>মসজিদ SaaS হেল্পলাইন ও সহায়তা কেন্দ্র</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Contact info row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "var(--pri-soft)", border: "1px solid var(--pri)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--pri-dark)", fontWeight: 700 }}>২৪/৭ সরাসরি হেল্পলাইন</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--pri)", marginTop: 2 }}>০১৭০০-০০০০০০</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>সকাল ৯টা হতে রাত ১০টা</div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--bd)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>হোয়াটসঅ্যাপ সাপোর্ট</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>+৮৮০১৭১২-৩৪৫৬৭৮</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>ইনস্ট্যান্ট মেসেজ সহায়তা</div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--pri)" }}>
              সাধারণ জিজ্ঞাসা ও সমাধান (FAQ):
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FAQS.map((faq, idx) => (
                <div key={idx} style={{ borderBottom: idx < FAQS.length - 1 ? "1px solid var(--bd)" : "none", paddingBottom: 8 }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: "100%", background: "none", border: 0, padding: "4px 0", textAlign: "left",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>{openFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6, padding: "6px 0 2px" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback / Ticket Form */}
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 14 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>সরাসরি বার্তা বা অভিযোগ পাঠান:</h4>
            {sent ? (
              <div style={{ background: "rgba(16,185,129,0.15)", color: "var(--ok)", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                ✓ আপনার বার্তাটি সফলভাবে পৌঁছানো হয়েছে! টেকনিক্যাল টিম দ্রুত সমাধান করবে।
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="মোবাইল নম্বর"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                />
                <textarea
                  placeholder="আপনার জিজ্ঞাসা বা সমস্যা বিস্তারিত লিখুন..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--pri)", color: "#fff", border: 0, padding: "10px", borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  বার্তা পাঠান ➔
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
