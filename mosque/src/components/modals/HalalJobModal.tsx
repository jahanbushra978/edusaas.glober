"use client";
import { useState } from "react";

interface JobItem {
  id: string;
  role: string;
  institution: string;
  location: string;
  salary: string;
  deadline: string;
  qualifications: string[];
  contact: string;
}

const JOBS_DATA: JobItem[] = [
  {
    id: "job-1",
    role: "ইমাম ও খতিব",
    institution: "বাইতুল ফালাহ জামে মসজিদ",
    location: "মিরপুর-১০, ঢাকা",
    salary: "২২,০০০ — ২৫,০০০ ৳",
    deadline: "৩০শে নভেম্বর",
    qualifications: ["দাওরায়ে হাদীস সম্পন্ন (মাওলানা)", "হাফেজে কুরআন অগ্রাধিকার", "মধুর তিলাওয়াত ও সুন্নতি আখলাক"],
    contact: "০১৭১১-XXXXXX (মসজিদ সেক্রেটারি)"
  },
  {
    id: "job-2",
    role: "মুয়াজ্জিন ও খাদেম",
    institution: "মদিনাতুল উলুম জামে মসজিদ",
    location: "উত্তরা সেক্টর ৭, ঢাকা",
    salary: "১৫,০০০ — ১৮,০০০ ৳ + থাকা-খাওয়া",
    deadline: "২৫শে নভেম্বর",
    qualifications: ["সহীহ-শুদ্ধ সুরললিত আযান", "মসজিদের পবিত্রতা ও পরিষ্কার-পরিচ্ছন্নতায় যত্নশীল", "নিয়মানুবর্তিতা ও বিনয়ী স্বভাব"],
    contact: "০১৮১২-XXXXXX (কোষাধ্যক্ষ)"
  },
  {
    id: "job-3",
    role: "নূরানী ও নাজেরা শিক্ষক",
    institution: "রহমানিয়া দারুল কুরআন মাদরাসা",
    location: "মোহাম্মদপুর, ঢাকা",
    salary: "১৬,০০০ — ২০,০০০ ৳",
    deadline: "১৫ই ডিসেম্বর",
    qualifications: ["নূরানী মুয়াল্লিম প্রশিক্ষণ সনদপ্রাপ্ত", "শিশুদের স্নেহ ও দরদের সাথে পাঠদানে অভিজ্ঞ", "তাজভীদসহ বিশুদ্ধ মাখরাজ"],
    contact: "০১৯৩৪-XXXXXX (মুহতামিম)"
  },
  {
    id: "job-4",
    role: "মসজিদ হিসাবরক্ষক ও আইটি সহকারী",
    institution: "কেন্দ্রীয় মডেল মসজিদ কমপ্লেক্স",
    location: "ধানমন্ডি, ঢাকা",
    salary: "১৮,০০০ — ২২,০০০ ৳",
    deadline: "১০ই ডিসেম্বর",
    qualifications: ["মসজিদ SaaS ও একাউন্টিং সফটওয়্যার চালনায় পারদর্শী", "দৈনন্দিন চাঁদা ও ভাউচার এন্ট্রিতে অভিজ্ঞ", "সততা ও বিশ্বস্ততা"],
    contact: "০১৫২১-XXXXXX (সভাপতি)"
  }
];

export function HalalJobModal({ onClose }: { onClose: () => void }) {
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string>("");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>📰</span>
            <span>হালাল কর্মসংস্থান ও খেদমত নোটিশ বোর্ড</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {appliedMsg && (
            <div style={{ background: "rgba(16,185,129,0.15)", color: "var(--ok)", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              ✓ {appliedMsg}
            </div>
          )}

          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
            মসজিদ, মাদরাসা ও দ্বীনি প্রতিষ্ঠানে খেদমতের হালনাগাদ সার্কুলার:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {JOBS_DATA.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--bd)",
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "var(--sh)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--pri)" }}>
                      {job.role}
                    </h4>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
                      {job.institution}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "4px 10px", borderRadius: 999, fontWeight: 800 }}>
                    {job.salary}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
                  <span>📍 {job.location}</span>
                  <span>📅 সময়সীমা: {job.deadline}</span>
                </div>

                <div style={{ background: "var(--bg)", padding: 10, borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>যোগ্যতাসমূহ:</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                    {job.qualifications.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--bd)", paddingTop: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    যোগাযোগ: <b>{job.contact}</b>
                  </span>
                  <button
                    onClick={() => {
                      setAppliedMsg(`আপনার আবেদন '${job.institution}'-এ সফলভাবে গ্রহণ করা হয়েছে! কর্তৃপক্ষ দ্রুত যোগাযোগ করবে।`);
                      setTimeout(() => setAppliedMsg(""), 4000);
                    }}
                    style={{
                      border: 0,
                      background: "var(--pri)",
                      color: "#fff",
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    আবেদন করুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
