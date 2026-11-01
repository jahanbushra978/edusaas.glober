"use client";

import { useState } from "react";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Icon } from "@/components/ui/icon";
import { DragDropGame } from "@/features/games/drag-drop/drag-drop-game";
import { ListenFindGame } from "@/features/games/listen-find/listen-find-game";
import type { GameMode } from "@/types/game";

export function GameScreen({ initialMode }: { initialMode: GameMode }) {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [soundEnabled, setSoundEnabled] = useState(true);

  function toggleSound() {
    setSoundEnabled((enabled) => !enabled);
  }

  return (
    <main className="app-shell game-app-shell">
      <SiteHeader active="games" />
      <div className="game-page-content">
        <div className="learning-garden">
          <svg
            className="learning-garden-landscape"
            viewBox="0 0 1200 360"
            preserveAspectRatio="xMidYMax slice"
            aria-hidden="true"
          >
            <circle cx="1020" cy="78" r="35" fill="#F4D889" opacity=".82" />
            <path d="M0 204c110-48 173-23 268 13 113 43 198-76 316-51 108 22 177 80 276 39 117-48 206-42 340 9v146H0z" fill="#D6E8C9" />
            <path d="M0 261c126-61 223 16 333-4 116-21 168-61 279-28 109 33 164 83 283 50 121-34 201-39 305 1v91H0z" fill="#B9D7A9" />
            <path d="M0 300c125-24 219-6 337 13 143 23 243-33 373-13 145 22 280 14 490-10v80H0z" fill="#9DBF8D" />
            <g fill="#789E6F" opacity=".72">
              <path d="M79 300c0-28 18-48 39-48s39 20 39 48z" />
              <path d="M90 300v-47h11v47z" />
              <path d="M1041 303c0-29 19-51 42-51s42 22 42 51z" />
              <path d="M1056 303v-50h12v50z" />
            </g>
            <g fill="#F7F1D9">
              <circle cx="196" cy="294" r="4" />
              <circle cx="206" cy="290" r="4" />
              <circle cx="216" cy="294" r="4" />
              <circle cx="943" cy="321" r="4" />
              <circle cx="953" cy="317" r="4" />
              <circle cx="963" cy="321" r="4" />
              <circle cx="725" cy="290" r="3" />
              <circle cx="734" cy="286" r="3" />
              <circle cx="743" cy="290" r="3" />
            </g>
          </svg>
          <div className="learning-garden-content">
            <div className="game-breadcrumb">
              <Link href="/" aria-label="শেখার জগতে ফিরে যাও">
                <Icon name="chevron" size={16} /> শেখার জগৎ
              </Link>
              <span aria-hidden="true">/</span>
              <span>গেম সেন্টার</span>
              <span className="demo-badge"><span /> খেলার ডেমো</span>
            </div>
            <section className="game-intro" aria-labelledby="game-page-title">
              <div>
                <span className="eyebrow"><span className="eyebrow-dot" /> আজকের অনুশীলন</span>
                <h1 id="game-page-title">চলো, <span>মিল খুঁজি!</span></h1>
                <p>মন দিয়ে দেখো, শুনে দেখো—ভুল হলে আবার চেষ্টা করা যাবে।</p>
              </div>
              <div className="game-session-chip">
                <span className="session-sparkle">✦</span>
                <span><strong>ছোট্ট সেশন</strong><small>প্রায় ৩ মিনিট</small></span>
              </div>
            </section>

            <div className="game-layout">
              <section className="game-main-column" aria-label="ইন্টারঅ্যাকটিভ গেম">
                <div className="game-tabs" role="group" aria-label="গেম বেছে নাও">
                  <button
                    className={`game-tab ${mode === "drag" ? "is-selected" : ""}`}
                    type="button"
                    aria-pressed={mode === "drag"}
                    onClick={() => setMode("drag")}
                  >
                    <span className="tab-icon tab-icon-green"><Icon name="target" size={19} /></span>
                    <span><strong>টেনে মেলাই</strong><small>Drag &amp; Drop</small></span>
                  </button>
                  <button
                    className={`game-tab ${mode === "listen" ? "is-selected" : ""}`}
                    type="button"
                    aria-pressed={mode === "listen"}
                    onClick={() => setMode("listen")}
                  >
                    <span className="tab-icon tab-icon-purple"><Icon name="headphones" size={19} /></span>
                    <span><strong>শুনে খুঁজি</strong><small>Listen &amp; Find</small></span>
                  </button>
                </div>

                <div id="game-panel">
                  {mode === "drag" ? (
                    <DragDropGame soundEnabled={soundEnabled} onToggleSound={toggleSound} />
                  ) : (
                    <ListenFindGame soundEnabled={soundEnabled} onToggleSound={toggleSound} />
                  )}
                </div>
              </section>

              <aside className="game-side-column" aria-label="গেমের তথ্য">
                <article className="side-note-card">
                  <div className="side-note-icon"><Icon name="sparkle" size={20} /></div>
                  <span className="section-kicker">মনে রেখো</span>
                  <h2>ভুল মানেই শেখার আরেকটি সুযোগ।</h2>
                  <p>ধীরে করো, দরকার হলে আবার চেষ্টা করো। কোনো তাড়া নেই।</p>
                  <div className="side-note-doodle" aria-hidden="true">✿</div>
                </article>
                <article className="session-note-card">
                  <div className="session-note-top"><Icon name="star" size={18} /><span>আজকের ছোট্ট লক্ষ্য</span></div>
                  <strong>একসাথে ৩টি মেলাই</strong>
                  <div className="session-dots" aria-label="০টি ৩টির মধ্যে সম্পন্ন">
                    <span className="dot-filled" /><span /><span />
                  </div>
                  <small>যতটুকু ভালো লাগে, ততটুকুই।</small>
                </article>
              </aside>
            </div>
            <p className="game-page-foot">
              <Icon name="lock" size={14} /> এটি একটি নিরাপদ, স্থানীয় ডেমো। কোনো ব্যক্তিগত তথ্য সংরক্ষণ হয় না।
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
