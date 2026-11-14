"use client";
import { useState, useEffect } from "react";

const QUICK_PROMPTS = [
  "📢 জুমার নামাজের বিশেষ নোটিশের খসড়া তৈরি করো",
  "💌 মাসিক ইনফাক আদায়ের জন্য বিনীত তাগিদ বার্তা",
  "📊 মসজিদের আয়-ব্যয় স্বচ্ছ রাখার অডিট পদ্ধতি",
  "🌙 রমজানের ইফতার ও তারাবীহ পরিচালনা পরিকল্পনা",
  "💰 মসজিদ ফান্ডে যাকাত ও সাদাকাহ ব্যয়ের শারয়ী নীতিমালা",
];

const KNOWLEDGE_RESPONSES = {
  notice: `📜 **জুমার নামাজের বিশেষ বিজ্ঞপ্তি (খসড়া)**:

আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।
সম্মানিত মুসল্লিয়ান কেরাম,
আগামী শুক্রবার পবিত্র জুমার নামাজে মসজিদের সার্বিক উন্নয়ন, বিশেষ পরিষ্কার-পরিচ্ছন্নতা ও দ্বীনি খেদমত উপলক্ষে বিশেষ আলোচনা ও বয়ান পেশ করা হবে ইনশাআল্লাহ।
সকলকে নির্ধারিত সময়ের পূর্বেই মসজিদে উপস্থিত হয়ে জুমার খুৎবা মনোযোগ সহকারে শোনার এবং মসজিদের পবিত্রতা বজায় রাখার জন্য অনুরোধ করা হচ্ছে।

— বিনীত, মসজিদ পরিচালনা কমিটি`,
  infaq: `💌 **মাসিক ইনফাক আদায়ের বিনীত আবেদন**:

আসসালামু আলাইকুম সম্মানিত সদস্য,
আল্লাহ তায়ালা বলেন: "যারা তাদের ধন-সম্পদ আল্লাহর রাস্তায় ব্যয় করে, তাদের দৃষ্টান্ত একটি শস্যবীজের মতো..." (সূরা বাক্বারা: ২৬১)।
আমাদের মসজিদের নিয়মিত বিদ্যুৎ, ইমাম-মুয়াজ্জিন সাহেবের বেতন ও রক্ষণাবেক্ষণ আপনারই নিয়মিত ইনফাকে পরিচালিত হয়। বিগত মাসের বকেয়া ইনফাক পরিশোধ করে মসজিদের খেদমতে শরিক থাকুন।
জাযাকাল্লাহু খাইরান।`,
  audit: `📊 **মসজিদ ফিন্যান্স ও অডিট নীতিমালা**:

১. প্রতিটি আয়ের জন্য ইউনিক ক্রমিকযুক্ত ডিজিটাল রিসিট প্রদান বাধ্যতামূলক।
২. খরচের ক্ষেত্রে আসল ক্যাশ মেমো/ভাউচার ছাড়া কোনো বিল পরিশোধ হবে না।
৩. প্রতি মাসের হিসাব পরবর্তী মাসের ৭ তারিখের মধ্যে নোটিশ বোর্ডে ও অ্যাপে প্রকাশ করুন।
৪. সাধারণ ফান্ড ও ওয়াকফ/যাকাত ফান্ড সম্পূর্ণ পৃথক ব্যাংক হিসেবে সংরক্ষণ করুন।`,
  ramadan: `🌙 **রমজানুল মুবারক পরিচালনা গাইডলাইন**:

১. খতমে তারাবীহ: হাফেজ সাহেবদের আবাসন ও হাদিয়া শুরুতেই সম্মানের সাথে নির্ধারণ করুন।
২. ইফতার ব্যবস্থাপনা: প্রত্যহ স্থানীয় দাতা ও মুসল্লিদের খাবার রোস্টার প্রস্তুত করে বোর্ডে ঝুলিয়ে দিন।
৩. ইতিকাফ: শেষ দশকের ইতিকাফকারীদের তালিকা ও সেহরি-ইফতারের দায়িত্বশীল দল গঠন করুন।`,
  zakat: `💰 **মসজিদ ফান্ডে যাকাত ব্যবহারের শারয়ী বিধান**:

১. মূল মসজিদ ভবন নির্মাণ, সংস্কার বা ইমামের নিয়মিত বেতনে যাকাতের অর্থ ব্যয় করা জায়েজ নয়; এতে গরীবের মালিকানা (তামলিক) শর্ত পূরণ হয় না।
২. তবে মসজিদের অধীনে পরিচালিত নূরানী মক্তব/মাদ্রাসার অসচ্ছল এতিম ছাত্রদের খাবার ও কিতাব ক্রয়ে পৃথক যাকাত ফান্ড ব্যবহার করা যায়।`,
};

export function ByokAiModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem("byok_ai_key");
    if (k) { setApiKey(k); setSaved(true); }
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem("byok_ai_key", apiKey.trim());
    setSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAsk = async (queryText?: string) => {
    const textToAsk = queryText || prompt;
    if (!textToAsk.trim()) return;
    setLoading(true);
    setAnswer("");
    setCopied(false);

    try {
      if (apiKey.trim() && provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are an expert Islamic Scholar and Mosque SaaS Administration Consultant. Answer in fluent, respectful Bengali: ${textToAsk}` }] }],
          }),
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        setAnswer(text || "উত্তর পাওয়া যায়নি। এপিআই কি সঠিক কি না যাচাই করুন।");
      } else {
        // Instant Islamic knowledge assistant matching keywords
        await new Promise((r) => setTimeout(r, 600));
        const q = textToAsk.toLowerCase();
        let matched = "";
        if (q.includes("নোটিশ") || q.includes("বিজ্ঞপ্তি") || q.includes("জুমা")) matched = KNOWLEDGE_RESPONSES.notice;
        else if (q.includes("ইনফাক") || q.includes("চাঁদা") || q.includes("আদায়") || q.includes("বকেয়া")) matched = KNOWLEDGE_RESPONSES.infaq;
        else if (q.includes("অডিট") || q.includes("হিসাব") || q.includes("স্বচ্ছ") || q.includes("ব্যয়")) matched = KNOWLEDGE_RESPONSES.audit;
        else if (q.includes("রমজান") || q.includes("তারাবীহ") || q.includes("ইফতার") || q.includes("ইতিকাফ")) matched = KNOWLEDGE_RESPONSES.ramadan;
        else if (q.includes("যাকাত") || q.includes("সাদাকাহ") || q.includes("ফিতরা")) matched = KNOWLEDGE_RESPONSES.zakat;
        else {
          matched = `💡 **মসজিদ পরিচালনা পরামর্শ**:

বিষয়: "${textToAsk}"

মসজিদ একটি পবিত্র প্রতিষ্ঠান। পরিচালনা কমিটির সিদ্ধান্তসমূহ স্বচ্ছতা, পারষ্পরিক পরামর্শ (শূরা) এবং কুরআন-সুন্নাহর বিধান মেনে গ্রহণ করা বাঞ্ছনীয়।
আপনার নিজস্ব Gemini বা OpenAI API Key সংযুক্ত করলে এই সহকারী সরাসরি লাইভ কাস্টম উত্তর ও নোটিশ ড্রাফট তৈরি করে দিতে পারবে।`;
        }
        setAnswer(matched);
      }
    } catch {
      setAnswer("এপিআই সংযোগে সমস্যা হয়েছে। ইন্টারনেট সংযোগ ও এপিআই কি সঠিক কি না পরীক্ষা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🤖</span>
            <span>মসজিদ ও ইসলামিক AI সহকারী (BYOK)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Quick Guidance Chips */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>দ্রুত প্রশ্ন বা নোটিশ টেমপ্লেট:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(qp); handleAsk(qp); }}
                  style={{
                    background: "var(--pri-soft)", color: "var(--pri-dark)", border: "1px solid var(--pri)",
                    borderRadius: 999, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>আপনার প্রশ্ন বা নোটিশের বিষয়:</label>
            <textarea
              rows={2}
              placeholder="যেমন: শবে বরাত উপলক্ষে মসজিদ পরিষ্কারের নোটিশ..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field"
              style={{ width: "100%", marginTop: 4, resize: "vertical" }}
            />
            <button onClick={() => handleAsk()} disabled={loading || !prompt.trim()} className="btn-pri" style={{ marginTop: 4 }}>
              {loading ? "AI উত্তর তৈরি করছে..." : "✨ AI উত্তর ও নোটিশ পান"}
            </button>
          </div>

          {/* AI Response Box */}
          {answer && (
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--bd)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid var(--bd)", paddingBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "var(--pri)" }}>🤖 AI সমাধান ও নোটিশ:</span>
                <button onClick={handleCopy} style={{ background: "none", border: 0, color: "var(--pri)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {copied ? "কপি হয়েছে ✓" : "📋 কপি করুন"}
                </button>
              </div>
              {answer}
            </div>
          )}

          {/* BYOK API Key Settings Accordion */}
          <details style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 10, padding: 10, fontSize: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--muted)" }}>
              ⚙️ নিজস্ব API Key সেটিং (অপশনাল Bring Your Own Key)
            </summary>
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>
                বিনামূল্যে আনলিমিটেড লাইভ উত্তরের জন্য আপনার নিজস্ব Google Gemini API Key যোগ করুন:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="password"
                  placeholder="Gemini API Key এখানে পেস্ট করুন..."
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
                  className="input-field"
                  style={{ marginBottom: 0, fontSize: 12 }}
                />
                <button onClick={handleSaveKey} style={{ background: "var(--pri)", color: "#fff", border: 0, borderRadius: 8, padding: "0 12px", cursor: "pointer", fontWeight: 600 }}>
                  {saved ? "সংরক্ষিত ✓" : "সেভ"}
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
