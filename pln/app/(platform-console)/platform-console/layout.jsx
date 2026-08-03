import ConsoleSidebar from "@/features/platform-console/components/ConsoleSidebar";

/**
 * এই layout শুধু /platform-console/* route-এর জন্য।
 * এটা ইচ্ছাকৃতভাবে organization ERP-র (portal) layout থেকে সম্পূর্ণ আলাদা —
 * আলাদা auth flow, আলাদা session cookie (Phase 2-এ: `platform_owner_session`,
 * বর্তমান `rahmania_session` cookie থেকে সম্পূর্ণ আলাদা)।
 *
 * middleware.js-এ (Phase 2 কাজ) এই route pattern public route list-এ থাকবে না,
 * বরং একটা সম্পূর্ণ আলাদা auth-check চালু হবে যেটা organization-level role
 * (`admin`, `branch_admin`) কে কখনো পাস করাবে না — শুধু `platform_owner = true`
 * claim থাকা user-কেই ঢুকতে দেবে।
 */
export default function PlatformConsoleLayout({ children }) {
  return (
    <div className="h-[100dvh] flex bg-slate-50 text-slate-900">
      <ConsoleSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
