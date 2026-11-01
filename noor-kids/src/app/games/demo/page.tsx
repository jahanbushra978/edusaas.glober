import type { Metadata } from "next";

import { GameScreen } from "@/features/games/game-screen";

export const metadata: Metadata = {
  title: "গেম সেন্টার",
  description: "শুনে ও মিলিয়ে দেখার জন্য Noor Kids-এর ইন্টারঅ্যাকটিভ ডেমো গেম।",
};

export default async function GameDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode = mode === "listen" ? "listen" : "drag";

  return <GameScreen initialMode={initialMode} />;
}
