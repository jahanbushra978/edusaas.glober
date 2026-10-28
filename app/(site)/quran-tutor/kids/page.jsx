import KidsQuranBookPage from "@/features/site/pages/KidsQuranBookPage";

export const metadata = {
  title: "আমার প্রথম কুরআন শিক্ষা — ছবি ও গেমের ছলে কুরআন পাঠ | Noor AI Quran Kids",
  description: "ছোট বাচ্চাদের জন্য ছবি দেখে ও গেম খেলে কুরআন শিক্ষা। ২৯টি আরবি হরফ, পশু-পাখির ছবি, বাবল পপ হান্টার, ছবির সাথে হরফ মেলানো, ফিঙ্গার ট্রেসিং ব্ল্যাকবোর্ড, ছোট ৯টি সূরা ও সনদপত্র।",
  keywords: ["আমার প্রথম কুরআন শিক্ষা", "বাচ্চাদের কোরআন শিক্ষা", "Arabic for kids", "Quran games for children", "নূর এআই", "Rahmania Institute"],
  robots: { index: true, follow: true },
};

export default function KidsQuranRoute() {
  return <KidsQuranBookPage />;
}
