import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";
import { Icon } from "@/components/ui/icon";

export function SiteHeader({ active = "home" }: { active?: "home" | "games" }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="প্রধান নেভিগেশন">
          <Link className={active === "home" ? "nav-link is-active" : "nav-link"} href="/">
            শেখার জগৎ
          </Link>
          <Link className={active === "games" ? "nav-link is-active" : "nav-link"} href="/games/demo">
            গেম সেন্টার
          </Link>
          {active === "home" ? (
            <a className="nav-link nav-link-muted" href="#parent-area" aria-label="অভিভাবক এলাকা, পরবর্তী ধাপে">
              <Icon name="lock" size={15} />
              অভিভাবক
            </a>
          ) : (
            <span className="nav-link nav-link-muted" aria-label="অভিভাবক ড্যাশবোর্ড, পরবর্তী ধাপে">
              <Icon name="lock" size={15} />
              অভিভাবক
            </span>
          )}
        </nav>
        <div className="profile-chip" role="group" aria-label="ডেমো শিক্ষার্থীর প্রোফাইল">
          <span className="profile-avatar" aria-hidden="true">ন</span>
          <span className="profile-name">নূর</span>
          <span className="profile-demo-label">ডেমো</span>
        </div>
      </div>
    </header>
  );
}
