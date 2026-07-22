import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { appClient } from "@/api/appClient";
import { DEFAULT_LOGO } from "@/utils";

export default function Logo({ className, alt = "Rahmania Institute", style, ...props }) {
  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings-public"],
    queryFn: () => appClient.entities.AppSettings.list(),
  });

  const getSetting = (key) => (Array.isArray(settings) ? settings : []).find((s) => s.key === key)?.value;
  const logoUrl = getSetting("logo_url") || DEFAULT_LOGO;

  return (
    <Image
      src={logoUrl}
      alt={alt}
      width={180}
      height={80}
      className={className}
      style={style}
      sizes="180px"
      unoptimized={/^https?:\/\//.test(logoUrl)}
      {...props}
    />
  );
}
