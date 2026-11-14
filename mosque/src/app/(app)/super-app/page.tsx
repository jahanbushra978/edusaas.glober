"use client";
import { useMe } from "@/components/Shell";
import { IslamicSuperApp } from "@/components/IslamicSuperApp";

export default function SuperAppPage() {
  const me = useMe();
  return <IslamicSuperApp me={me} />;
}
