"use client";

import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AIChatDrawer from "./AIChatDrawer";

export default function AIChatLauncher() {
  const { user } = useAuth() || {};
  return <AIChatDrawer currentUser={user} />;
}
