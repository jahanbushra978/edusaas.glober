import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Layers } from "lucide-react";

export default function WelcomeSetupScreen({ orgName = "New Institution", slug = "school" }) {
  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 text-center z-10">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-teal-500/20 animate-pulse">
          {orgName ? orgName.charAt(0).toUpperCase() : "S"}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">{orgName}</h1>
          <p className="text-xs text-teal-400 font-medium mt-1">official.platform.com/{slug}</p>
        </div>

        <Card className="bg-slate-900/80 border-slate-800 text-slate-300 backdrop-blur shadow-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 border border-teal-700/50 text-teal-300 text-xs font-medium">
              <Sparkles size={14} /> Website Under Setup
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              স্বাগতম! আমাদের নতুন অফিসিয়াল ওয়েবসাইট তৈরির কাজ চলছে। কিছুক্ষণের মধ্যেই নো-কোড বিল্ডারের মাধ্যমে আমাদের তথ্যসমূহ পাবলিশ করা হবে।
            </p>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link href={`/AdminDashboard?slug=${slug}`}>
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs py-5">
                  <Layers size={16} className="mr-2" /> School Admin Panel <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
              <Link href={`/AdminDashboard?slug=${slug}`}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                  <ShieldCheck size={14} className="mr-1.5" /> Login to Admin Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-[11px] text-slate-500">Powered by Educational SaaS Platform</p>
      </div>
    </div>
  );
}
