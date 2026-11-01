import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Icon } from "@/components/ui/icon";
import { GardenCompanion } from "@/features/games/garden-companion";

const journeyPlaceholders = [
  { number: "০১", tone: "mint" },
  { number: "০২", tone: "lilac" },
  { number: "০৩", tone: "gold" },
] as const;

export function HomeScreen() {
  return (
    <main className="app-shell">
      <SiteHeader active="home" />
      <div className="home-content home-dashboard">
        <p className="home-demo-banner">
          <span aria-hidden="true">i</span>
          প্রোটোটাইপ ডেমো · শেখার পথ, progress ও star কেবল উদাহরণ।
        </p>

        <section className="home-garden-hero" aria-labelledby="welcome-title">
          <div className="home-garden-landscape" aria-hidden="true">
            <span className="home-garden-sun" />
            <span className="home-garden-hill home-garden-hill-back" />
            <span className="home-garden-hill home-garden-hill-front" />
            <span className="home-garden-flower home-garden-flower-one">✿</span>
            <span className="home-garden-flower home-garden-flower-two">✦</span>
          </div>
          <div className="home-welcome-copy">
            <span className="home-garden-kicker">
              <span className="eyebrow-dot" />
              তোমার শেখার ছোট্ট জগৎ
            </span>
            <h1 id="welcome-title">আসসালামু আলাইকুম, <span>নূর!</span></h1>
            <p>নূরি তোমাকে দেখে খুব খুশি। আজ একটু শিখি, একটু খেলি—নিজের গতিতে।</p>
            <Link className="button button-green home-continue-button" href="/games/demo">
              শেখা চালিয়ে যাই <Icon name="arrow" size={18} />
            </Link>
            <span className="home-demo-caption">গেম সেন্টারের ছোট্ট ডেমো অনুশীলন</span>
          </div>
          <div className="home-mascot" role="img" aria-label="নূরি তোমাকে শেখার জন্য স্বাগত জানাচ্ছে">
            <GardenCompanion feedback="idle" />
          </div>
          <div className="home-star-summary" aria-label="ডেমো তারকা, কেবল নমুনা">
            <span className="home-star-orb"><Icon name="star" size={20} /></span>
            <span><strong>১২টি ডেমো স্টার</strong><small>নমুনা উপস্থাপন · সংরক্ষিত reward নয়</small></span>
          </div>
        </section>

        <section className="home-journey-section" aria-labelledby="journey-title">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">তোমার শেখার পথ</span>
              <h2 id="journey-title">চলো, ধাপে ধাপে এগোই</h2>
            </div>
            <span className="home-placeholder-badge">ডেমো মানচিত্র · পাঠ্যক্রম নয়</span>
          </div>
          <div className="home-journey-map">
            <p className="home-journey-intro">
              Learning Journey Preview — সব ধাপই layout placeholder; এগুলো বাস্তব Quran lesson বা curriculum order নয়।
            </p>
            <ol className="home-journey-nodes" aria-label="উদাহরণ শেখার পথের placeholder ধাপ">
              {journeyPlaceholders.map((step) => (
                <li className={`home-journey-node home-journey-node-${step.tone}`} key={step.number}>
                  <span className="home-journey-number">{step.number}</span>
                  <span className="home-journey-label">Demo placeholder {step.number}</span>
                </li>
              ))}
            </ol>
            <p className="home-journey-note">
              <Icon name="book" size={15} />
              যোগ্য Quran Teacher-এর অনুমোদিত curriculum যুক্ত হলে এখানে প্রকৃত শেখার পথ দেখানো হবে।
            </p>
          </div>
        </section>

        <section className="home-feature-grid" aria-label="আজকের শেখা ও কার্যক্রম">
          <article className="home-feature-card home-today-card">
            <div className="home-feature-heading">
              <span className="home-feature-icon home-feature-icon-mint"><Icon name="book" size={20} /></span>
              <span className="home-section-kicker">TODAY&apos;S LEARNING · DEMO</span>
            </div>
            <h2>আজকের শেখা</h2>
            <p>শিক্ষক-অনুমোদিত পাঠ যোগ হলে এখানে আজকের শেখা দেখাবে। আপাতত এটি একটি demo placeholder।</p>
            <span className="home-feature-note">এখানে কোনো Quran verse বা lesson দেখানো হচ্ছে না।</span>
          </article>

          <article className="home-feature-card home-activity-card">
            <div className="home-feature-heading">
              <span className="home-feature-icon home-feature-icon-gold"><Icon name="target" size={20} /></span>
              <span className="home-section-kicker">DAILY ACTIVITY · DEMO</span>
            </div>
            <h2>আজকের ছোট্ট অভ্যাস</h2>
            <p>নমুনা activity card</p>
            <div
              className="home-demo-progress"
              role="progressbar"
              aria-label="নমুনা দৈনিক কার্যক্রমের অগ্রগতি"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={1}
            >
              <span />
            </div>
            <span className="home-feature-note">১ / ৩ · demo progress only, কোনো বাস্তব streak নয়</span>
          </article>

          <article className="home-feature-card home-game-card">
            <div className="home-feature-heading">
              <span className="home-feature-icon home-feature-icon-green"><Icon name="play" size={19} /></span>
              <span className="home-section-kicker">PLAY &amp; PRACTICE</span>
            </div>
            <h2>গেম সেন্টার</h2>
            <p>ডেমো গেমে মিল খোঁজো, অথবা সুরের নকশা শুনে দেখো।</p>
            <div className="home-game-links">
              <Link className="button button-green home-game-link" href="/games/demo">
                টেনে মেলাই <Icon name="arrow" size={16} />
              </Link>
              <Link className="button button-soft home-game-link" href="/games/demo?mode=listen">
                শুনে খুঁজি <Icon name="headphones" size={16} />
              </Link>
            </div>
            <span className="home-feature-note">ডেমো content · যাচাইকৃত Quran learning material নয়</span>
          </article>
        </section>

        <section id="parent-area" className="home-parent-area" aria-labelledby="parent-area-title">
          <span className="home-parent-icon"><Icon name="lock" size={18} /></span>
          <div>
            <h2 id="parent-area-title">অভিভাবক এলাকা</h2>
            <p>আলাদা, অভিভাবক-কেন্দ্রিক প্রবেশ · এই ডেমোতে dashboard বা account access চালু নেই।</p>
          </div>
          <span className="home-parent-status">পরবর্তী ধাপে</span>
        </section>

        <footer className="home-dashboard-footer">
          <Icon name="sparkle" size={16} />
          <span>শেখা হোক আনন্দের, নিজের মতো করে।</span>
          <span className="home-demo-footer-label">Demo experience</span>
        </footer>
      </div>
    </main>
  );
}
