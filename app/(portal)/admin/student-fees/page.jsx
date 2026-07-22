'use client'

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { appClient } from "@/api/appClient";
import { SectionSkeleton } from "@/shared/components/progressive/ProgressiveSection";

const AdminDashboard = dynamic(() => import("@/lib/AdminDashboard"), {
  loading: () => <SectionSkeleton minHeight={720} />,
  ssr: true,
});

const AdminLogin = dynamic(() => import("@/lib/AdminLogin"), {
  loading: () => <SectionSkeleton minHeight={520} />,
  ssr: true,
});

export default function StudentFeesPage() {
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;

    appClient.auth
      .me()
      .then((user) => {
        if (!active) {
          return;
        }

        setState(user.role === "admin" || user.role === "branch_admin" || user.role === "boarding_manager" ? "dashboard" : "login");
      })
      .catch(() => {
        if (active) {
          setState("login");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return state === "dashboard" ? <AdminDashboard initialTab="fees" /> : <AdminLogin />;
}
