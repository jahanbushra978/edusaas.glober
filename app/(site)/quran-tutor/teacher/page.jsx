import NurAITeacherPage from "@/features/site/pages/NurAITeacherPage";

export const metadata = {
  title: "নূর এআই কুরআন শিক্ষক — ছোটদের মুখস্থ ও মাখরাজ পাঠশালা | Rahmania Institute",
  description: "৬-স্তরের পেডাগজিক্যাল লুপ (ব্যাখ্যা, ডেমো, অনুশীলন, মূল্যায়ন, সংশোধন ও সমাপ্তি) সহ নূর এআই শিক্ষকের সাথে সরাসরি মুখে মুখে তাজবীদ ও মাখরাজ শিখুন।",
  keywords: ["নূর এআই শিক্ষক", "কুরআন শিক্ষা", "তাজবীদ লার্নিং", "মাখরাজ শিক্ষা", "বাচ্চাদের কুরআন শিক্ষা"],
  robots: { index: true, follow: true },
};

export default function TeacherRoute() {
  return <NurAITeacherPage />;
}
