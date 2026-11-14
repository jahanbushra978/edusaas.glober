import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getAuth, toMe } from "@/lib/auth";
import { PendingNotice } from "@/components/PendingNotice";
import { Shell } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const a = await getAuth();
  if (!a) redirect("/login");
  const me = toMe(a);
  return <Shell me={me}>{me.status === "ACTIVE" ? children : <PendingNotice />}</Shell>;
}
