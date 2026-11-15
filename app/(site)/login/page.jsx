import { headers } from "next/headers";
import LoginPageClient from "./LoginPageClient";

export const metadata = {
  title: "লগইন | Portal Login",
  description: "শিক্ষার্থী ও শিক্ষক পোর্টালে লগইন করুন।",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  let isRahmania = false;
  try {
    const reqHeaders = await headers();
    const host = (reqHeaders.get("host") || "").split(":")[0].toLowerCase().trim();
    if (host === "rahmaniainstitute.org" || host === "www.rahmaniainstitute.org") {
      isRahmania = true;
    }
  } catch {}

  return <LoginPageClient isRahmania={isRahmania} />;
}
