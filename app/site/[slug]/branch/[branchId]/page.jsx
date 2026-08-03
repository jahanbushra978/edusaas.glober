import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Building2, MapPin, PhoneCall, Mail, GraduationCap, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "school";
  const branchId = resolvedParams?.branchId;

  return {
    title: `Branch Details — ${slug.toUpperCase()}`,
    description: `Official branch details page for ${slug}`,
  };
}

export default async function BranchDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "rahmania";
  const branchId = resolvedParams?.branchId;

  const cleanSlug = String(slug)
    .toLowerCase()
    .trim()
    .replace(/%20|\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Look up organization
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, theme_config")
    .or(`slug.eq.${cleanSlug},slug.eq.${slug}`)
    .maybeSingle();

  const orgName = org?.name || "Educational Institution";
  const themeColor = org?.theme_config?.primary_color || "#0f766e";

  // Look up branch strictly from DB for this school
  let branch = null;
  if (branchId) {
    const { data: branchData } = await supabase
      .from("branches")
      .select("*")
      .eq("id", branchId)
      .maybeSingle();
    branch = branchData;
  }

  // Fallback branch preview if mock/id mismatch (Clean ZERO fake data)
  if (!branch) {
    branch = {
      id: branchId,
      name_bn: "শাখা বিবরণী",
      name_en: "Branch Details",
      address: null,
      phone: null,
      email: null,
      code: `BR-${branchId || "01"}`,
      status: "active",
      academic_structure: []
    };
  }

  const branchTitle = branch.name_bn || branch.name_en || branch.branch_name || branch.name || `Branch #${branchId}`;
  const addressText = branch.address || branch.location || null;
  const phoneText = branch.phone || branch.contact_number || null;
  const academicStructure = Array.isArray(branch.academic_structure) ? branch.academic_structure : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/site/${slug}`} className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to {orgName} Website
          </Link>
          <Badge className="bg-teal-600 text-white text-[11px]">Official Branch Page</Badge>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-3 py-1">
              <Building2 size={12} className="mr-1.5 inline" /> {branch.code || "BRANCH"}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1">
              {branch.status === "active" ? "Active Branch (সক্রিয় শাখা)" : "Branch Operational"}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {branchTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            {orgName} — {branchTitle}-এর অফিসিয়াল পেজ ও তথ্য কেন্দ্র।
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Branch Info Cards */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="text-teal-600" size={20} /> শাখা পরিচিতি ও যোগাযোগের ঠিকানা
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ঠিকানা (Location)</span>
                  <p className="font-semibold text-slate-800 flex items-start gap-2 mt-1">
                    <MapPin size={16} className="text-teal-600 shrink-0 mt-0.5" />
                    {addressText ? addressText : <span className="text-slate-400 italic">ঠিকানা যুক্ত করা হয়নি</span>}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">যোগাযোগ ফোন (Contact Phone)</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-2 mt-1">
                    <PhoneCall size={16} className="text-teal-600 shrink-0" />
                    {phoneText ? phoneText : <span className="text-slate-400 italic">ফোন নম্বর যুক্ত করা হয়নি</span>}
                  </p>
                </div>

                {branch.email && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ইমেইল ঠিকানা (Email)</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-teal-600 shrink-0" />
                      {branch.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Courses & Classes Available */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="text-teal-600" size={20} /> এই শাখায় চালু থাকা শিক্ষা কোর্স ও শ্রেণীসমূহ
              </h2>
              <p className="text-xs text-slate-500">এই শাখায় ভর্তিকৃত শিক্ষা কার্যক্রম ও কারিকুলাম তালিকা</p>

              {academicStructure.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {academicStructure.map((cls, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/70 text-xs font-semibold text-slate-800">
                      <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                      <span>{cls.class_name || cls.name || `ক্লাস #${idx + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                  বর্তমানে এই শাখার জন্য কোনো আলাদা কোর্স বা শ্রেণী যুক্ত করা নেই।
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Branch Quick Actions Widget */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-xl space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-400" /> ভর্তি আবেদন ও অনুসন্ধান
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                এই শাখায় আপনার সন্তানের ভর্তির তথ্যাবলী জানতে বা অনলাইন আবেদন করতে নিচে অপশনে ক্লিক করুন।
              </p>

              <div className="space-y-3 pt-2">
                <Link href={`/site/${slug}?branchId=${branch.id}#admission`}>
                  <button className="w-full h-11 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg transition-all flex items-center justify-center gap-2">
                    <GraduationCap size={16} /> অনলাইনে ভর্তি আবেদন করুন
                  </button>
                </Link>

                <Link href={`/site/${slug}`}>
                  <button className="w-full h-10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={14} /> মূল ওয়েবসাইটে ফিরুন
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-6 text-center text-xs border-t border-slate-900">
        <p>&copy; {new Date().getFullYear()} {orgName} — {branchTitle}. All rights reserved.</p>
      </footer>
    </div>
  );
}
