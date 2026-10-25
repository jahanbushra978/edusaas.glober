'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, ChevronDown, LogOut, Settings,
  Building2, Inbox, X, ExternalLink, ShieldCheck, Loader2
} from 'lucide-react';

// ─── Global Search ────────────────────────────────────────────────────────────
function GlobalSearch() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router   = useRouter();

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Open with Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = useCallback(async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&scope=organizations`);
      const json = await res.json();
      setResults(Array.isArray(json.data) ? json.data.slice(0, 6) : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all group min-w-[180px] sm:min-w-[220px]"
      >
        <Search size={14} className="shrink-0 text-slate-400" />
        <span className="flex-1 text-left">প্রতিষ্ঠান, ডোমেইন খুঁজুন...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-300 rounded text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => { setOpen(false); setQuery(''); }} />

          {/* Search Box */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="প্রতিষ্ঠান নাম, ডোমেইন, ফোন নম্বর..."
                className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                autoComplete="off"
              />
              {query ? (
                <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
                  <X size={15} className="text-slate-400 hover:text-slate-600" />
                </button>
              ) : (
                <kbd className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded">Esc</kbd>
              )}
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={18} className="animate-spin text-teal-500" />
                  <span className="ml-2 text-sm text-slate-400">খোঁজা হচ্ছে...</span>
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  <Search size={24} className="mx-auto mb-2 text-slate-300" />
                  কোনো ফলাফল পাওয়া যায়নি
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-2">
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organizations</p>
                  {results.map((org) => (
                    <Link
                      key={org.id}
                      href={`/platform-console/organizations/${org.id}`}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <span
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: org.theme_color || '#0f766e' }}
                      >
                        {org.name?.charAt(0)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{org.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{org.slug || org.subdomain}.platform.com</p>
                      </div>
                      <ExternalLink size={13} className="text-slate-300 group-hover:text-teal-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {!query && (
                <div className="px-4 py-5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</p>
                  {[
                    { label: 'সকল প্রতিষ্ঠান',  href: '/platform-console/organizations', icon: Building2 },
                    { label: 'Central Inbox',     href: '/platform-console/inbox',         icon: Inbox },
                    { label: 'Platform Settings', href: '/platform-console/settings',      icon: Settings },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Icon size={15} className="text-slate-400" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch pending inbox count
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/admin/onboarding-requests');
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          const pending = json.data.filter((r) => !r.status || r.status === 'pending').length;
          setCount(pending);
        }
      } catch { /* silent */ }
    })();
  }, []);

  const alerts = [
    count > 0 && { label: `${count}টি নতুন আবেদন অপেক্ষমাণ`, href: '/platform-console/inbox?tab=applications', color: 'text-teal-700', dot: 'bg-teal-500' },
    { label: 'সিস্টেম স্বাভাবিক আছে', href: '/platform-console', color: 'text-emerald-700', dot: 'bg-emerald-400' },
  ].filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all"
        title="Notifications"
      >
        <Bell size={17} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1 shadow-sm border-2 border-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">Notifications</p>
            <span className="text-[10px] text-slate-400">{alerts.length} alerts</span>
          </div>
          <div className="divide-y divide-slate-50">
            {alerts.map((alert, i) => (
              <Link
                key={i}
                href={alert.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.dot}`} />
                <p className={`text-xs font-semibold ${alert.color}`}>{alert.label}</p>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100">
            <Link href="/platform-console/inbox" onClick={() => setOpen(false)} className="text-[11px] text-teal-600 font-bold hover:underline">
              সব Inbox দেখুন →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const ref    = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName  = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Super Admin';
  const displayEmail = user?.email || 'admin@edusaas.global';
  const initials     = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch('/api/platform/auth/logout', { method: 'POST' });
    } catch {
      // fallback
    }
    router.push('/platform-console/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-slate-800 leading-tight max-w-[100px] truncate">{displayName}</p>
          <p className="text-[10px] text-slate-400 leading-tight">Super Admin</p>
        </div>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{displayEmail}</p>
            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-[10px] font-bold">
              <ShieldCheck size={10} className="mr-1" /> Super Admin
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <Link href="/platform-console/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
              <Settings size={14} className="text-slate-400" /> Platform Settings
            </Link>
            <Link href="/platform-console/security" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
              <ShieldCheck size={14} className="text-slate-400" /> Security & Access
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              <LogOut size={14} /> Sign out (লগআউট)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ConsoleTopBar ───────────────────────────────────────────────────────
export default function ConsoleTopBar({ user }) {
  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 gap-4 z-40 shadow-sm">
      {/* Left — Breadcrumb / Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <ShieldCheck size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold text-slate-400">EduSaaS</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-700">Platform Console</span>
        </div>
      </div>

      {/* Center — Global Search */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>

      {/* Right — Bell + Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
