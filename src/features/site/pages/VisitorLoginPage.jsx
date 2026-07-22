'use client'

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useVisitorAuth } from '@/lib/VisitorAuthContext';

const DEPARTMENT_LINKS = [
  { href: '/departments/noorani', label: 'নূরানী' },
  { href: '/departments/najera', label: 'নাজেরা' },
  { href: '/departments/hifz', label: 'হিফয' },
  { href: '/departments/hifz-shunani', label: 'হিফয শুনানি' },
  { href: '/departments/kindergarten', label: 'কিন্ডারগার্টেন' },
];

const INITIAL_LOGIN_FORM = { email: '', password: '' };
const INITIAL_SIGNUP_FORM = { fullName: '', email: '', password: '' };

export default function VisitorLoginPage() {
  const router = useRouter();
  const {
    visitorProfile,
    isVisitorAuthenticated,
    isVisitorLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useVisitorAuth();

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [signupForm, setSignupForm] = useState(INITIAL_SIGNUP_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const googleEnabled = process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED === 'true';

  const headerTitle = useMemo(
    () => (mode === 'login' ? 'Visitor Login' : 'Create Visitor Account'),
    [mode],
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await signInWithEmail(loginForm);
      setMessage('Login successful. এখন আপনি department page-এ আপনার profile দেখতে পারবেন।');
      router.refresh();
    } catch (authError) {
      setError(authError.message || 'Login failed. আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const result = await signUpWithEmail(signupForm);

      if (result.data.session) {
        setMessage('Account তৈরি এবং login সম্পন্ন হয়েছে।');
      } else {
        setMessage('Account তৈরি হয়েছে। Email confirmation চালু থাকলে inbox চেক করুন।');
      }

      setSignupForm(INITIAL_SIGNUP_FORM);
      router.refresh();
    } catch (authError) {
      setError(authError.message || 'Account তৈরি করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleEnabled) {
      setError('Google login structure ready আছে, কিন্তু provider configuration এখনো চালু করা হয়নি।');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(authError.message || 'Google login শুরু করা যায়নি।');
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,113,91,0.12),_transparent_40%),linear-gradient(180deg,#f7fbfa_0%,#ffffff_38%,#f9fafb_100%)] px-4 py-10 md:px-6 md:py-14">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-[32px] border border-emerald-100 bg-white/75 p-6 shadow-[0_24px_80px_-42px_rgba(18,113,91,0.45)] backdrop-blur-xl md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Public Access
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {headerTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            এই login শুধুমাত্র সাধারণ visitor/user দের জন্য। Login optional, তাই account ছাড়া ও পুরো website browse করা যাবে।
            Login করলে department page-এ আপনার নাম ও avatar দেখাবে এবং session browser refresh-এর পরও থাকবে।
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-100 bg-white/80 p-5">
              <p className="text-sm font-bold text-slate-900">Department Access</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Visitor login হওয়ার পর প্রতিটি department page-এ personalized welcome block দেখা যাবে।
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DEPARTMENT_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.9),rgba(255,255,255,0.9))] p-5">
              <p className="text-sm font-bold text-slate-900">Existing Portals Unchanged</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Admin, Teacher, এবং Student login আগের মতোই আলাদা route-এ থাকবে। এই page শুধুই public visitor access-এর জন্য।
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <Link href="/admin" className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-700">
                  Admin
                </Link>
                <Link href="/TeacherLogin" className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-700">
                  Teacher
                </Link>
                <Link href="/StudentLogin" className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:border-emerald-200 hover:text-emerald-700">
                  Student
                </Link>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl md:p-8">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                mode === 'signup' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
          </div>

          {isVisitorAuthenticated && !isVisitorLoading ? (
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                Logged In
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{visitorProfile?.displayName}</h2>
              <p className="mt-2 text-sm text-slate-600">{visitorProfile?.email}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/departments/noorani" className="inline-flex items-center gap-2 rounded-2xl bg-[#12715B] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#0e5c4a]">
                  Department Pages
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700">
                  Homepage
                </Link>
              </div>
            </div>
          ) : mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="visitor-login-email">
                  Email Address
                </label>
                <input
                  id="visitor-login-email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="visitor-login-password">
                  Password
                </label>
                <input
                  id="visitor-login-password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12715B] px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0e5c4a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn className="h-4 w-4" />
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="visitor-signup-name">
                  Full Name
                </label>
                <input
                  id="visitor-signup-name"
                  type="text"
                  required
                  value={signupForm.fullName}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="visitor-signup-email">
                  Email Address
                </label>
                <input
                  id="visitor-signup-email"
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="visitor-signup-password">
                  Password
                </label>
                <input
                  id="visitor-signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={signupForm.password}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12715B] px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0e5c4a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {!isVisitorAuthenticated ? (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Optional</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Mail className="h-4 w-4" />
                Continue with Google
              </button>
            </>
          ) : null}

          {message ? (
            <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </article>
      </section>
    </main>
  );
}
