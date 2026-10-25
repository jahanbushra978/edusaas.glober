import LiveVoiceClassroomPage from "@/features/site/pages/LiveVoiceClassroomPage";

export const metadata = {
  title: "লাইভ ভয়েস কুরআন ক্লাসরুম — সরাসরি মুখে মুখে তিলাওয়াত ও তাজবীদ শিক্ষা | Rahmania Institute",
  description: "সরাসরি মুখে কথা বলে কুরআন শিখুন। এআই উস্তাদ নূর আপনার তিলাওয়াত শুনবে, রিয়েল-টাইম তাজবীদ বিশ্লেষণ করবে এবং ১৭ মাখরাজের মাধ্যমে নির্ভুল উচ্চারণ শেখাবে।",
  keywords: ["লাইভ কুরআন ক্লাস", "ভয়েস কুরআন শিক্ষা", "নূর এআই উস্তাদ", "তাজবীদ লাইভ", "মাখরাজ শিক্ষা", "Rahmania Institute"],
  robots: { index: true, follow: true },
};

export default function LiveClassRoute() {
  return <LiveVoiceClassroomPage />;
}
