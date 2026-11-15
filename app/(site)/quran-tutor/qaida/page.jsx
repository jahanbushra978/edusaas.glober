import NoorQaidaBook from "@/features/quran/components/NoorQaidaBook";

export const metadata = {
  title: "নূর কায়দা — মক্তব শিক্ষা পাঠ্যপাঠিকা (হরফ থেকে নাজেরা) | Edusaas",
  description: "মক্তব শিক্ষা পাঠ্যপাঠিকা অনুসারে ১১টি পর্ব ও ৭৮টি ক্লাসে সাজানো ডিজিটাল নূর কায়দা। প্রতিটি হরফ ও শব্দের উপরে ক্লিক করলেই খাঁটি ক্বারীর মিষ্টি তিলাওয়াত শোনা যাবে।",
  keywords: ["নূর কায়দা", "মক্তব শিক্ষা পাঠ্যপাঠিকা", "নূরানী কায়দা", "হরকত শিক্ষা", "মাখরাজ ও তাজবীদ", "কুরআন শিক্ষা", "Edusaas"],
  robots: { index: true, follow: true },
};

export default function NoorQaidaPage() {
  return <NoorQaidaBook />;
}
