"use client";
import { useState } from "react";

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  summary: string;
  content: string[];
  keyRules: string[];
}

const ARTICLES: ArticleItem[] = [
  {
    id: "khushu",
    title: "সালাতে একাগ্রতা ও খুশু-খুজু রক্ষার উপায়",
    category: "সালাতের মাসআলা",
    readTime: "৪ মিনিট",
    author: "মাওলানা মাহমুদ হাসান",
    summary: "সালাতে মন বিক্ষিপ্ত হওয়া থেকে রক্ষা পেয়ে গভীর আন্তরিকতা অর্জনের বাস্তবসম্মত দিকনির্দেশনা।",
    content: [
      "১. সালাতে প্রবেশের পূর্বে দুনিয়াবী চিন্তা ঝেড়ে ফেলা: সালাতে দাঁড়ানোর আগে কিছুক্ষণ শান্তভাবে বসে চিন্তা করুন যে আপনি সমস্ত জাহানের প্রতিপালক মহান আল্লাহর সামনে দাঁড়াতে যাচ্ছেন।",
      "২. পাঠকৃত সূরার অর্থ অনুধাবন: সূরা ফাতিহা ও তিলাওয়াতকৃত অন্যান্য সূরার অর্থ মনে মনে স্মরণ করার চেষ্টা করুন। অর্থ বুঝলে মন অন্যত্র ধাবিত হতে পারে না।",
      "৩. দৃষ্টি সেজদার স্থানে নিবদ্ধ রাখা: দাঁড়ানো অবস্থায় সেজদার জায়গায় দৃষ্টি স্থির রাখা এবং রুকু-সেজদায় সুন্নাহসম্মত স্থানে চোখ রাখা একাগ্রতা বৃদ্ধি করে।",
      "৪. ধীরস্থিরভাবে রুকু-সেজদা আদায় (তাদীলুল আরকান): তাড়াহুড়ো করে সালাত আদায় করলে খুশু বিনষ্ট হয়। প্রতি রুকনে শান্ত হওয়া আবশ্যক।"
    ],
    keyRules: [
      "সালাতের প্রতিটি তাসবীহ কমপক্ষে ৩ বার স্পষ্টভাবে পাঠ করা উত্তম।",
      "ওয়াসওয়াসা আসলে বাঁ দিকে তিনবার আলতো থুতু নিক্ষেপের ভাব করে আউজুবিল্লাহ পড়া সুন্নাহ।"
    ]
  },
  {
    id: "wudu-mistakes",
    title: "ওযুর সঠিক পদ্ধতি ও সাধারণ ভুলত্রুটি",
    category: "পবিত্রতা ও তাহরাত",
    readTime: "৫ মিনিট",
    author: "মুফতী আবদুল্লাহ আল-মারুফ",
    summary: "দৈনন্দিন ওযু করার সময় যেসব ভুলের কারণে ওযু অসম্পূর্ণ থেকে যায় তার সমাধান।",
    content: [
      "১. কনুই ও গোড়ালিতে শুকনো স্থান থেকে যাওয়া: শীতকালে বা তাড়াহুড়ায় ওযু করার সময় কনুই বা গোড়ালির পেছনের অংশ শুকনো থেকে যায়, যা ওযু নষ্ট হওয়ার কারণ।",
      "২. কুলি ও নাকে পানি দেওয়া উত্তমরূপে না করা: মুখের প্রতিটি কোনায় পানি পৌঁছানো এবং নাকের নরম অংশ পর্যন্ত পানি টেনে পরিষ্কার করা ওযুর গুরুত্বপূর্ণ সুন্নাত।",
      "৩. গর্দান মাসাহ করার বাড়াবাড়ি পরিহার: পুরো মাথা একবার ভালোভাবে মাসাহ করাই সহীহ সুন্নাহ। আলাদাভাবে গলায় হাত বুলানোর কোনো সহীহ ভিত্তি নেই।",
      "৪. পানির অপচয় রোধ: ওযু করার সময় কল অতিরিক্ত খুলে পানির অপচয় করা মাকরূহ। অল্প পানিতে সুন্নাহসম্মত ওযু করাই উত্তম।"
    ],
    keyRules: [
      "ওযুর ফরজ ৪টি: মুখমণ্ডল ধোয়া, উভয় হাত কনুইসহ ধোয়া, মাথার চারভাগের একভাগ মাসাহ করা, এবং উভয় পা টাখনুসহ ধোয়া।",
      "ওযু শেষে আশহাদু আল্লা ইলাহা ইল্লাল্লাহু... দো'আ পড়লে জান্নাতের ৮টি দরজাই খুলে দেওয়া হয়।"
    ]
  },
  {
    id: "halal-income",
    title: "হালাল জীবিকা ও আধুনিক ব্যবসায়িক লেনদেন",
    category: "মুআমালাত ও অর্থনীতি",
    readTime: "৬ মিনিট",
    author: "ড. খোন্দকার মোহাম্মাদ রফিক",
    summary: "অনলাইন ফ্রিল্যান্সিং, ই-কমার্স ও আধুনিক বিনিয়োগে হারাম ও সন্দেহযুক্ত উপাদান বর্জনের বিধান।",
    content: [
      "১. স্বচ্ছ চুক্তি ও পণ্যের সঠিক বিবরণ: পণ্যের কোনো গোপন ত্রুটি লুকিয়ে বিক্রি করা মারাত্মক গুনাহ। ক্রেতাকে সত্য তথ্য দেওয়া আবশ্যক।",
      "২. সুদের সর্বপ্রকার রূপ পরিহার: প্রচলিত ব্যাংকিং ডিপোজিটে নির্দিষ্ট সুদের হার হারাম। মুদারাবা ও শরীয়াহভিত্তিক পার্টনারশিপ অনুসরণযোগ্য।",
      "৩. এমন কাজের সার্ভিস না দেওয়া যা সরাসরি অনৈসলামিক: মিউজিক, জুয়া, সুদ বা অশ্লীলতার সাথে সংশ্লিষ্ট ফ্রিল্যান্স কাজ বর্জন করা আবশ্যক।"
    ],
    keyRules: [
      "যে শরীর হারাম খাদ্যে গড়ে ওঠে, তার জন্য জাহান্নামের আগুনই বেশি উপযুক্ত (হাদীস)।",
      "সৎ ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী ও শহীদদের সাথে থাকবেন।"
    ]
  },
  {
    id: "screen-habits",
    title: "সোশ্যাল মিডিয়া, গীবত ও সময়ের অপচয় থেকে সুরক্ষা",
    category: "আত্মশুদ্ধি ও সমাজ",
    readTime: "৩ মিনিট",
    author: "মাওলানা আবদুর রহমান",
    summary: "ডিজিটাল যুগে মানুষের সম্মান রক্ষা এবং মূল্যবান সময় নেক আমলে কাজে লাগানোর উপায়।",
    content: [
      "১. যাচাই না করে যেকোনো তথ্য শেয়ার করা মিথ্যাবাদী হওয়ার শামিল। কোনো খবর পেলে সত্যতা পরীক্ষা করুন।",
      "২. কমেন্ট সেকশনে কাউকে অপমান, তুচ্ছ-তাচ্ছিল্য বা ট্রল করা কবিরা গুনাহ।",
      "৩. দৈনিক নির্দিষ্ট সময় নির্ধারণ করে পর্দা ও দৃষ্টির হেফাজত নিশ্চিত করুন।"
    ],
    keyRules: [
      "একজন মানুষের উত্তম মুসলমান হওয়ার অন্যতম প্রমাণ হলো সে অনর্থক বিষয় ত্যাগ করে (হাদীস)।"
    ]
  }
];

export function ArticleModal({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string>("khushu");
  const current = ARTICLES.find((a) => a.id === selectedId) || ARTICLES[0]!;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">
            <span>✍️</span>
            <span>দ্বীনি প্রবন্ধ ও মাসআলা-মাসায়েল</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
          {/* Article tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
            {ARTICLES.map((art) => (
              <button
                key={art.id}
                onClick={() => setSelectedId(art.id)}
                style={{
                  border: 0,
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: selectedId === art.id ? "var(--pri)" : "var(--bg)",
                  color: selectedId === art.id ? "#fff" : "var(--text)",
                  boxShadow: selectedId === art.id ? "0 4px 10px rgba(5,150,105,0.25)" : "none",
                  transition: "all 0.15s"
                }}
              >
                {art.category}
              </button>
            ))}
          </div>

          {/* Article View */}
          <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, background: "var(--pri-soft)", color: "var(--pri-dark)", padding: "3px 8px", borderRadius: 999, fontWeight: 700 }}>
                {current.category}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>⏱️ পড়ার সময়: {current.readTime}</span>
            </div>

            <h3 style={{ margin: "6px 0 4px", fontSize: 17, fontWeight: 700, color: "var(--pri)" }}>
              {current.title}
            </h3>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>লেখক: {current.author}</div>

            <div style={{ background: "var(--bg)", padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "var(--text)", fontStyle: "italic", marginBottom: 16, borderLeft: "3px solid var(--pri)" }}>
              {current.summary}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {current.content.map((p, i) => (
                <p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ background: "var(--chip)", border: "1px solid var(--bd)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pri-dark)", marginBottom: 6 }}>
                📌 গুরুত্বপূর্ণ বিধান ও মূল পয়েন্ট:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>
                {current.keyRules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
