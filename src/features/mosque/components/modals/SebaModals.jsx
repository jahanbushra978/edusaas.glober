"use client";
import React, { useState, useEffect } from "react";
import {
  Coins,
  GraduationCap,
  UtensilsCrossed,
  HelpCircle,
  Heart,
  Briefcase,
  Headphones,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Calculator,
  Search,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

// ── 1. ZAKAT & FITRA MODAL ──
export function ZakatModal({ onClose }) {
  const [cash, setCash] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [debts, setDebts] = useState(0);

  // Nisab threshold approx in BDT (silver 52.5 tola ~ 95,000 BDT)
  const NISAB = 95000;
  const totalAssets = Number(cash || 0) + Number(gold || 0) + Number(silver || 0);
  const netWealth = Math.max(0, totalAssets - Number(debts || 0));
  const isEligible = netWealth >= NISAB;
  const zakatPayable = isEligible ? Math.round(netWealth * 0.025) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Coins className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">যাকাত ও ফিতরা ক্যালকুলেটর</h2>
              <p className="text-xs text-emerald-100">হানাফী ফিকহ অনুযায়ী নেসাব ও ২.৫% যাকাত হিসাব</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-stone-700 dark:text-stone-300 space-y-1">
            <div className="flex justify-between items-center">
              <span>বর্তমান রূপার নেসাব (৫২.৫ তোলা):</span>
              <b className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">৳{NISAB.toLocaleString("bn-BD")}</b>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              বৎসরান্তে মোট উদ্বৃত্ত সম্পদ নেসাব অতিক্রম করলে ২.৫% যাকাত আদায় করা ফরজ।
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">নগদ টাকা ও ব্যাংক ব্যালেন্স (৳):</label>
              <input
                type="number"
                placeholder="০"
                value={cash || ""}
                onChange={(e) => setCash(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">স্বর্ণের বর্তমান আনুমানিক বাজারমূল্য (৳):</label>
              <input
                type="number"
                placeholder="০"
                value={gold || ""}
                onChange={(e) => setGold(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">রৌপ্য ও ব্যবসার বিক্রয়যোগ্য পণ্যমূল্য (৳):</label>
              <input
                type="number"
                placeholder="০"
                value={silver || ""}
                onChange={(e) => setSilver(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">তাত্ক্ষণিক প্রদেয় ঋণ ও বাদযোগ্য দেনা (৳):</label>
              <input
                type="number"
                placeholder="০"
                value={debts || ""}
                onChange={(e) => setDebts(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Result Card */}
          <div
            className={`p-4 rounded-2xl text-center space-y-1 ${
              isEligible
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700"
                : "bg-stone-100 dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/50"
            }`}
          >
            <div className="text-xs text-stone-500 dark:text-stone-400 font-semibold">আপনার মোট প্রদেয় যাকাত (২.৫%):</div>
            <div className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              ৳{zakatPayable.toLocaleString("bn-BD")}
            </div>
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
              {isEligible ? "✓ আপনার উপর যাকাত ফরজ হয়েছে" : "আপনার নিট সম্পদ এখনো নেসাব পরিমাণে পৌঁছেনি"}
            </p>
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2. MAKTAB MODAL ──
export function MaktabModal({ onClose }) {
  const [students, setStudents] = useState([
    { id: "1", name: "আব্দুল্লাহ আল-আমিন", roll: "০১", batch: "সকাল (নূরানী)", progress: "কায়দা মাশক", present: true },
    { id: "2", name: "ফাতিমা বিনতে তাহের", roll: "০২", batch: "সকাল (নূরানী)", progress: "আমপারা তিলাওয়াত", present: true },
    { id: "3", name: "মুহাম্মদ হাসান", roll: "০৩", batch: "বিকাল (হিফজ)", progress: "নাজেরা শেষ পর্ব", present: false },
    { id: "4", name: "উমর ফারুক", roll: "০৪", batch: "সকাল (নূরানী)", progress: "হরকত ও তানভীন", present: true },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBatch, setNewBatch] = useState("সকাল (নূরানী)");

  const handleToggleAttendance = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s))
    );
    toast.info("হাজিরা আপডেট করা হয়েছে");
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newStudent = {
      id: String(Date.now()),
      name: newName.trim(),
      roll: String(students.length + 1).padStart(2, "0"),
      batch: newBatch,
      progress: "নূরানী কায়দা ১ম পাঠ",
      present: true,
    };
    setStudents([...students, newStudent]);
    setNewName("");
    setShowAdd(false);
    toast.success("নতুন শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মসজিদ ভিত্তিক নূরানী মক্তব</h2>
              <p className="text-xs text-emerald-100">শিক্ষার্থী হাজিরা ও পড়া অগ্রগতি ট্রাকার</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-b border-stone-200 dark:border-emerald-900/60 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            মোট শিক্ষার্থী: <b className="text-emerald-700 dark:text-emerald-400">{students.length} জন</b>
          </span>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ভর্তি</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {showAdd && (
            <form onSubmit={handleAddStudent} className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200">নতুন শিক্ষার্থী ভর্তি ফরম:</h4>
              <input
                type="text"
                placeholder="শিক্ষার্থীর পূর্ণ নাম..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="flex-1 text-xs font-bold px-2 py-1.5 rounded-xl border border-stone-200 dark:border-emerald-700 bg-white dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
                >
                  <option value="সকাল (নূরানী)">সকাল (নূরানী)</option>
                  <option value="বিকাল (নাজেরা)">বিকাল (নাজেরা)</option>
                  <option value="সান্ধ্যকালীন (হিফজ)">সান্ধ্যকালীন (হিফজ)</option>
                </select>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">
                  ভর্তি নিশ্চিত করুন
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {students.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-400">#{s.roll}</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{s.name}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {s.batch} · বর্তমান পাঠ: <b className="text-emerald-700 dark:text-emerald-400">{s.progress}</b>
                  </p>
                </div>

                <button
                  onClick={() => handleToggleAttendance(s.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    s.present
                      ? "bg-emerald-600 text-white"
                      : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.present ? "উপস্থিত" : "অনুপস্থিত"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. MEAL ROSTER MODAL ──
export function MealRosterModal({ onClose }) {
  const [roster, setRoster] = useState([
    { id: "1", date: "১৫ নভেম্বর", donor: "হাজী রফিকুল ইসলাম", meal: "দুপুর ও রাত", students: 15, status: "নিশ্চিত" },
    { id: "2", date: "১৬ নভেম্বর", donor: "জনাব আব্দুল করিম", meal: "দুপুর", students: 15, status: "নিশ্চিত" },
    { id: "3", date: "১৭ নভেম্বর", donor: "উম্মে আয়মান", meal: "রাত", students: 15, status: "নিশ্চিত" },
    { id: "4", date: "১৮ নভেম্বর", donor: "বুকিং উন্মুক্ত", meal: "উভয় বেলা", students: 15, status: "উন্মুক্ত" },
  ]);

  const [donorName, setDonorName] = useState("");
  const [pledgeDate, setPledgeDate] = useState("১৮ নভেম্বর");

  const handleBook = (e) => {
    e.preventDefault();
    if (!donorName.trim()) return;
    setRoster(
      roster.map((r) =>
        r.date === pledgeDate ? { ...r, donor: donorName.trim(), status: "নিশ্চিত" } : r
      )
    );
    setDonorName("");
    toast.success("তালিবুল ইলমদের খাবার স্পন্সর সফলভাবে বুকিং হয়েছে!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">খাবার রোস্টার ও মেহমানদারী</h2>
              <p className="text-xs text-emerald-100">মাদরাসা ও তালিবুল ইলমদের খাবার স্পন্সর সূচি</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 <b>রাসূলুল্লাহ (সা.) বলেছেন:</b> "শ্রেষ্ঠ মানুষ সে যে অন্যকে খাদ্য দান করে এবং সালামের বিস্তার ঘটায়।" (আহমাদ)
          </div>

          {/* Quick Pledge Form */}
          <form onSubmit={handleBook} className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-2 text-xs shadow-2xs">
            <h4 className="font-bold text-stone-900 dark:text-stone-100">এক বেলার খাবার স্পন্সর করুন:</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="আপনার নাম / পরিবারের নাম..."
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
              />
              <select
                value={pledgeDate}
                onChange={(e) => setPledgeDate(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-stone-200 dark:border-emerald-700 bg-stone-50 dark:bg-[#07130e] text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="১৮ নভেম্বর">১৮ নভেম্বর</option>
                <option value="১৯ নভেম্বর">১৯ নভেম্বর</option>
                <option value="২০ নভেম্বর">২০ নভেম্বর</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl whitespace-nowrap cursor-pointer">
                বুকিং দিন
              </button>
            </div>
          </form>

          {/* Roster Cards */}
          <div className="space-y-2">
            {roster.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100">{r.date}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-emerald-950 font-bold text-stone-600 dark:text-stone-300">
                      {r.meal}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    স্পন্সর: <b className="text-emerald-700 dark:text-emerald-400">{r.donor}</b>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                    r.status === "নিশ্চিত"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. ISLAMIC QUIZ MODAL ──
export function IslamicQuizModal({ onClose }) {
  const QUESTIONS = [
    {
      id: 1,
      question: "পবিত্র কুরআনে সর্বমোট কতটি সূরা রয়েছে?",
      options: ["১১২টি", "১১৪টি", "১১৬টি", "১২০টি"],
      correct: 1,
      explanation: "কুরআনুল কারীমে সর্বমোট ১১৪টি সূরা রয়েছে; যার মধ্যে ৮৬টি মাক্কী এবং ২৮টি মাদানী সূরা।"
    },
    {
      id: 2,
      question: "কুরআনের কোন সূরাটিকে 'কুরআনের হৃদয়' বলা হয়?",
      options: ["সূরা আর-রহমান", "সূরা আল-মুলক", "সূরা ইয়াসীন", "সূরা আল-ওয়াকিয়াহ"],
      correct: 2,
      explanation: "রাসূলুল্লাহ (সা.) বলেছেন, 'প্রত্যেক বস্তুরই একটি হৃদয় থাকে, আর কুরআনের হৃদয় হলো সূরা ইয়াসীন' (তিরমিযী)।"
    },
    {
      id: 3,
      question: "কোন নবীকে 'খলীলুল্লাহ' (আল্লাহর বন্ধু) উপাধিতে ভূষিত করা হয়েছে?",
      options: ["হযরত মূসা (আ.)", "হযরত ঈসা (আ.)", "হযরত ইবরাহীম (আ.)", "হযরত নূহ (আ.)"],
      correct: 2,
      explanation: "মহান আল্লাহ কুরআনে ঘোষণা করেছেন: 'আর আল্লাহ ইবরাহীমকে অন্তরঙ্গ বন্ধুরূপে গ্রহণ করেছেন' (আন-নিসা: ১২৫)।"
    },
    {
      id: 4,
      question: "ইসলামের সবচেয়ে দীর্ঘতম আয়াত কোন সূরায় অবস্থিত?",
      options: ["সূরা বাক্বারা (২৮২ নং)", "সূরা আলে ইমরান", "সূরা নিসা", "সূরা মায়িদাহ"],
      correct: 0,
      explanation: "সূরা আল-বাক্বারার ২৮২ নম্বর আয়াত (আয়াতুদ দাইয়ন / ঋণের আয়াত) কুরআনের সর্ববৃহৎ আয়াত।"
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    if (idx === q.correct) {
      setScore((s) => s + 1);
      toast.success("মাশাআল্লাহ! সঠিক উত্তর!");
    } else {
      toast.error("ভুল উত্তর, সঠিকটি জেনে নিন।");
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">তালীমে দ্বীন কুইজ</h2>
              <p className="text-xs text-emerald-100">ইসলামিক সাধারণ জ্ঞান চর্চা ও পুরষ্কার</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!finished ? (
            <>
              <div className="flex justify-between items-center text-xs text-stone-500 font-bold">
                <span>প্রশ্ন: {currentIdx + 1} / {QUESTIONS.length}</span>
                <span>স্কোর: <b className="text-emerald-700 dark:text-emerald-400">{score}</b></span>
              </div>

              <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 leading-relaxed">{q.question}</h3>

              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  let btnColor = "bg-stone-50 dark:bg-[#0f1d17] border-stone-200 dark:border-emerald-900/60 text-stone-800 dark:text-stone-200";
                  if (answered) {
                    if (idx === q.correct) btnColor = "bg-emerald-600 text-white border-emerald-600";
                    else if (idx === selectedOpt) btnColor = "bg-red-600 text-white border-red-600";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={answered}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${btnColor}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">💡 ব্যাখ্যা:</p>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}

              {answered && (
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {currentIdx + 1 < QUESTIONS.length ? "পরবর্তী প্রশ্ন →" : "ফলাফল দেখুন 🏆"}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl">🏆</span>
              <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-300">মাশাআল্লাহ! কুইজ সম্পন্ন!</h3>
              <p className="text-sm text-stone-700 dark:text-stone-300 font-bold">
                আপনার স্কোর: {score} / {QUESTIONS.length}
              </p>
              <button
                onClick={handleRestart}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                আবার শুরু করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5. NIKAH MODAL ──
export function NikahModal({ onClose }) {
  const [goldGrams, setGoldGrams] = useState(30);

  // Mohre Fatemi is approx 131.25 tolas of silver = 1,530 grams of silver ~ 1,80,000 BDT
  const MOHRE_FATEMI = 180000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💍</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">সুন্নাহ বিবাহ ও মোহরানা</h2>
              <p className="text-xs text-emerald-100">হানাফী ফিকহ অনুযায়ী মোহরে ফাতেমী ও বিধান</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200">💎 মোহরে ফাতেমীর আনুমানিক বর্তমান মূল্য:</h4>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              ৳{MOHRE_FATEMI.toLocaleString("bn-BD")}
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              হযরত ফাতিমা (রা.)-এর মোহর ছিল ৫০০ দিরহাম খাঁটি রূপা (প্রায় ১,৫৩০ গ্রাম রূপা)।
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-stone-800 dark:text-stone-200">📜 সুন্নাহসম্মত বিবাহের শর্তাবলী:</h4>
            {[
              "১. ইজাব ও কবুল: বর ও কনের পারস্পরিক স্পষ্ট সম্মতি।",
              "২. দুজন প্রাপ্তবয়স্ক বিশ্বস্ত মুসলিম সাক্ষী উপস্থিতি।",
              "৩. সুনির্দিষ্ট ও পরিশোধযোগ্য মোহরানা ধার্য করা।",
              "৪. বিবাহের ঘোষণা ও ওলিমা (খাবারের আয়োজন) করা সুন্নাত।"
            ].map((rule, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 shadow-2xs">
                {rule}
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 6. HALAL JOB MODAL ──
export function HalalJobModal({ onClose }) {
  const JOBS = [
    { title: "হিফজ শিক্ষক / মুহাফ্ফিজ", org: "দারুল উলুম মাদরাসা", loc: "গাজীপুর", salary: "৳১৮,০০০ - ২৫,০০০" },
    { title: "খতীব ও ইমাম", org: "বাইতুস সালাম জামে মসজিদ", loc: "ঢাকা", salary: "৳২৫,০০০ - ৩৫,০০০" },
    { title: "অ্যাকাউন্টিং ও মসজিদ হিসাবরক্ষক", org: "ইসলামিক ফাউন্ডেশন ট্রাস্ট", loc: "ঢাকা", salary: "৳২০,০০০ - ২৮,০০০" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">হালাল চাকরি ও নিয়োগ বিজ্ঞপ্তি</h2>
              <p className="text-xs text-emerald-100">মসজিদ ও মাদরাসা ভিত্তিক কর্মসংস্থান</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          {JOBS.map((j, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1d17] border border-stone-200 dark:border-emerald-900/60 space-y-1 text-xs shadow-2xs">
              <h4 className="font-bold text-stone-900 dark:text-stone-100">{j.title}</h4>
              <p className="text-stone-500 dark:text-stone-400">{j.org} · {j.loc}</p>
              <div className="flex justify-between items-center pt-1 border-t border-stone-100 dark:border-emerald-950">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{j.salary}</span>
                <button
                  onClick={() => toast.info("মসজিদ কমিটির সাথে সরাসরি যোগাযোগ করুন")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  আবেদন
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-[#07130e] border-t border-stone-200 dark:border-emerald-900/60 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 7. SUPPORT MODAL ──
export function SupportModal({ onClose }) {
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    toast.success("আপনার বার্তা মসজিদ কমিটির নিকট পাঠানো হয়েছে। জাযাকাল্লাহ!");
    setMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1612] border border-emerald-200 dark:border-emerald-800/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">মসজিদ হেল্পডেস্ক ও পরামর্শ</h2>
              <p className="text-xs text-emerald-100">কমিটির নিকট পরামর্শ বা অভিযোগ জমা দিন</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <textarea
            rows={4}
            placeholder="আপনার মূল্যবান পরামর্শ বা প্রশ্ন লিখুন..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="w-full text-xs font-medium p-3 rounded-xl border border-stone-200 dark:border-emerald-800/60 bg-stone-50 dark:bg-[#0f1d17] text-stone-900 dark:text-stone-100 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            পাঠিয়ে দিন
          </button>
        </form>
      </div>
    </div>
  );
}
