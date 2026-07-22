'use client';

import React, { useState } from 'react'
import Link from "next/link"
import { ArrowLeft, ChevronRight, ExternalLink, LogIn, Loader2, User, Lock } from "lucide-react"
import { appClient } from "@/api/appClient"
import TurnstileWidget from "@/shared/components/ui-custom/TurnstileWidget"

export default function NooraniPage() {
  const isBn = true

  const [loginId, setLoginId] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [loginRole, setLoginRole] = useState("student")
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState("")
  const turnstileRef = React.useRef(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError("")
    if (!loginId.trim() || !loginPass.trim()) {
      setLoginError("আইডি ও পাসওয়ার্ড দিন")
      return
    }
    setLoggingIn(true)
    try {
      const result = await appClient.auth.portalLogin(loginRole, loginId.trim(), loginPass, turnstileToken)
      if (result?.profile) {
        setLoggedInUser(result.profile)
        setLoginId("")
        setLoginPass("")
      } else {
        setLoginError("লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।")
        setTurnstileToken("")
        turnstileRef.current?.reset()
      }
    } catch (err) {
      setLoginError(err.message || "লগইন করতে সমস্যা হয়েছে")
      setTurnstileToken("")
      turnstileRef.current?.reset()
    } finally {
      setLoggingIn(false)
    }
  }

  const features = [
    "তাজবিদসহ বিশুদ্ধ আল কুরআন তিলাওয়াত শিক্ষা।",
    "ইসলামের মৌলিক মাসনুন দোয়া ও সুন্নাহর বাস্তব আমল শিক্ষা।",
    "মনোরম ও সুন্দর পরিবেশে আধুনিক ডিজিটাল পাঠদান পদ্ধতি।",
  ]

  const stats = [
    { value: "১০০%", label: "পাস ও তাজবিদ যোগ্যতা", color: "#2E7D32" },
    { value: "৪৫০+", label: "অধ্যয়নরত ছাত্র-ছাত্রী", color: "#1565C0" },
    { value: "১২+", label: "প্রশিক্ষিত হাফেজ শিক্ষক", color: "#6A1B9A" },
    { value: "১ম মান", label: "জাতীয় নূরানী তালিম বোর্ড", color: "#EF6C00" },
  ]

  const quickLinks = [
    { href: "/notices", label: "নোটিশ বোর্ড", icon: "📢", bg: "#1565C0" },
    { href: "/gallery", label: "ফটোগ্রাফি গ্যালারি", icon: "📸", bg: "#6A1B9A" },
    { href: "/academics", label: "একাডেমিক তথ্য", icon: "📚", bg: "#2E7D32" },
    { href: "/", label: "পরীক্ষার ফলাফল", icon: "📋", bg: "#EF6C00" },
  ]

  return (
    <div style={{ background: "#F3F7F5" }} className="min-h-screen pb-24 md:pb-0 font-sans">

      {/* ── Back ── */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <Link
          href="/"
          style={{ color: "#128C7E" }}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          হোমপেজে ফিরে যান
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 mb-8">
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center"
          style={{
            background: "linear-gradient(135deg, #EBF5EE, #F4FAF6, #fff)",
            border: "1px solid #D5E5DB",
          }}
        >
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-[200px]" style={{ color: "#128C7E" }}>
            🕋
          </div>

          <div className="space-y-4 max-w-2xl relative">
            <h2
              className="text-3xl md:text-4xl leading-normal tracking-wide font-bold"
              style={{ color: "#1B5E20", fontFamily: "'Amiri', 'Noto Sans Arabic', serif" }}
            >
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </h2>
            <div
              className="inline-block px-6 py-3.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #E1EBE5" }}
            >
              <p className="font-bold text-sm md:text-lg leading-relaxed text-gray-700">
                &ldquo;পড়ো তোমার প্রভুর নামে, যিনি সৃষ্টি করেছেন।&rdquo;
              </p>
            </div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
              সূরা আল-আলাক্ব | আয়াত: ১
            </p>
          </div>
        </div>
      </section>

      {/* ── Title ── */}
      <section className="max-w-5xl mx-auto px-4 mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold" style={{ color: "#128C7E" }}>
          নূরানী বিভাগ
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">রহমানিয়া ইন্সটিটিউট</p>
      </section>

      {/* ── Quick Links Row ── */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="block text-white p-5 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden group"
              style={{ background: link.bg }}
            >
              <div className="absolute -right-3 -bottom-3 opacity-15 text-5xl group-hover:scale-110 transition-transform duration-300">
                {link.icon}
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <span className="opacity-90">{link.icon}</span>
              </div>
              <h3 className="font-bold text-sm md:text-base">{link.label}</h3>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-white/90 font-semibold">
                {i === 0 ? "দেখুন" : i === 1 ? "প্রবেশ করুন" : i === 2 ? "বিস্তারিত" : "ফলাফল খুঁজুন"}
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div
          className="bg-white rounded-3xl p-6 md:p-8"
          style={{ border: "1px solid #E1EBE5", boxShadow: "0 10px 30px -10px rgba(18, 140, 126, 0.06)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "#E8F5E9", color: "#128C7E", border: "1px solid #C8E6C9" }}
            >
              🕌
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider block uppercase" style={{ color: "#128C7E" }}>
                পরিচিতি ও লক্ষ্য
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                রহমানিয়া ইন্সটিটিউট (নূরানী বিভাগ)
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 text-justify">
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                দ্বীনি শিক্ষার সুবাস ছড়াতে এবং নতুন প্রজন্মকে সুন্দর নৈতিক ও আদর্শ সুনাগরিক হিসেবে গড়ে তোলার প্রত্যয় নিয়ে প্রতিষ্ঠিত <strong>রহমানিয়া ইন্সটিটিউট (নূরানী বিভাগ)</strong>। আমাদের এখানে কোমলমতি শিক্ষার্থীদের অত্যন্ত সুশৃঙ্খল ও আন্তরিক পরিবেশে বিশুদ্ধ আল-কুরআন শিক্ষা দেওয়া হয়।
              </p>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                অভিজ্ঞ শিক্ষক মণ্ডলীর সরাসরি তত্ত্বাবধানে তাজবিদ ও সুন্দর উচ্চারণে কুরআন তিলাওয়াত শিক্ষার পাশাপাশি শিক্ষার্থীদের মৌলিক বাংলা, ইংরেজি ও গণিত বিষয়ে দক্ষ করে তোলা হয়, যেন তারা দ্বীনি শিক্ষার পাশাপাশি জাগতিক শিক্ষায়ও প্রথম থেকেই এগিয়ে থাকতে পারে।
              </p>

              <div className="pt-2">
                <h4 className="font-bold text-sm text-gray-800 mb-2">আমাদের বিশেষ বৈশিষ্ট্যসমূহ:</h4>
                <ul className="space-y-2 text-xs md:text-sm text-gray-600">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <i className="text-lg" style={{ color: "#2E7D32" }}>✅</i>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Stats */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "#F8FAF9", border: "1px solid #E1EBE5" }}
            >
              <h3 className="font-bold text-gray-800 text-sm md:text-base mb-4">
                ⭐ আমাদের ইনস্টিটিউটের সাফল্যসমূহ
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow-sm"
                    style={{ border: "1px solid #f0f0f0" }}
                  >
                    <span className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                    <p className="text-[10px] text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notice Section ── */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div
          className="bg-white rounded-3xl p-6 md:p-8"
          style={{ border: "1px solid #E1EBE5", boxShadow: "0 10px 30px -10px rgba(18, 140, 126, 0.06)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "#E3F2FD", color: "#1565C0", border: "1px solid #BBDEFB" }}
            >
              📢
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider block uppercase" style={{ color: "#1565C0" }}>
                সর্বশেষ ঘোষণা
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">নোটিশ বোর্ড</h2>
            </div>
          </div>

          <Link
            href="/notices"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-4 transition-colors hover:underline"
            style={{ color: "#128C7E" }}
          >
            সকল নোটিশ দেখুন <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="p-5 rounded-2xl" style={{ background: "#F8FAFC", border: "1px solid #E3F2FD" }}>
            <span className="text-xs font-semibold block mb-1" style={{ color: "#1565C0" }}>
              🕐 সর্বশেষ আপডেট
            </span>
            <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2">
              রহমানিয়া নূরানী বিভাগে নতুন সেশনে ভর্তি চলছে!
            </h3>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              বিস্তারিত জানতে অফিসে যোগাযোগ করুন অথবা নোটিশ বোর্ড দেখুন।
            </p>
          </div>
        </div>
      </section>

      {/* ── Login Section ── */}
      <section className="max-w-5xl mx-auto px-4 mb-10">
        <div
          className="bg-white rounded-3xl p-6 md:p-8"
          style={{ border: "1px solid #E1EBE5", boxShadow: "0 10px 30px -10px rgba(18, 140, 126, 0.06)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "#E8F5E9", color: "#128C7E", border: "1px solid #C8E6C9" }}
            >
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider block uppercase" style={{ color: "#128C7E" }}>
                {loggedInUser ? "স্বাগতম" : "প্রবেশ করুন"}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {loggedInUser ? "আপনি লগইন করেছেন" : "আপনার অ্যাকাউন্টে লগইন করুন"}
              </h2>
            </div>
          </div>

          {loggedInUser ? (
            <div className="text-center p-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: "#E8F5E9", color: "#128C7E", border: "2px solid #C8E6C9" }}
              >
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {loggedInUser.full_name_bn || loggedInUser.full_name_en || "ব্যবহারকারী"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {loginRole === "student" ? "ছাত্র" : loginRole === "teacher" ? "শিক্ষক" : "অ্যাডমিন"}
              </p>
              <button
                onClick={() => setLoggedInUser(null)}
                className="text-sm font-semibold px-6 py-2 rounded-xl transition-colors"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                লগআউট
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="max-w-md mx-auto">
              {/* Role selector */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: "student", label: "ছাত্র" },
                  { key: "teacher", label: "শিক্ষক" },
                  { key: "admin", label: "অ্যাডমিন" },
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setLoginRole(r.key)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: loginRole === r.key ? "#128C7E" : "#F3F7F5",
                      color: loginRole === r.key ? "#fff" : "#666",
                      border: loginRole === r.key ? "none" : "1px solid #E1EBE5",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#F3F7F5", border: "1px solid #E1EBE5" }}
                >
                  <User className="w-5 h-5" style={{ color: "#128C7E" }} />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={loginRole === "student" ? "ছাত্র আইডি" : loginRole === "teacher" ? "শিক্ষক আইডি" : "অ্যাডমিন আইডি"}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#F3F7F5", border: "1px solid #E1EBE5" }}
                >
                  <Lock className="w-5 h-5" style={{ color: "#128C7E" }} />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="পাসওয়ার্ড"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-500 mt-2 text-center">{loginError}</p>
              )}

              <div className="flex justify-center mt-3">
                <TurnstileWidget ref={turnstileRef} onVerify={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full mt-4 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #128C7E, #0D6B5F)" }}
              >
                {loggingIn ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> লগইন হচ্ছে...</>
                ) : (
                  <><LogIn className="w-4 h-4" /> লগইন করুন</>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #128C7E, #0D6B5F)",
          }}
        >
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              আজই যুক্ত হোন নূরানী বিভাগে
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
              আপনার সন্তানকে একটি সুন্দর ও আদর্শ ভবিষ্যৎ উপহার দিন। তাজবিদসহ বিশুদ্ধ কুরআন শিক্ষার মাধ্যমে গড়ে তুলুন একজন আদর্শ সুনাগরিক।
            </p>
            <Link
              href="/admission-choice"
              className="inline-flex items-center gap-2 bg-white px-8 py-4 rounded-xl font-bold text-sm transition-all hover:shadow-lg"
              style={{ color: "#128C7E" }}
            >
              অনলাইনে ভর্তি হোন
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
