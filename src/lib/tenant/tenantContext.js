import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_TENANT_ID } from "./constants";

export { DEFAULT_TENANT_ID };

/**
 * Server-Side Zero-Trust Tenant Context Resolver
 * Uses React cache() for request-level memoization across the lifecycle.
 * Dynamic server import of next/headers prevents client component bundling errors.
 */
export const getTenantContext = cache(async () => {
  try {
    if (typeof window === "undefined") {
      const { headers } = await import("next/headers");
      const reqHeaders = await headers();
      const host = reqHeaders.get("host") || "";
      const cleanHost = host.split(":")[0].toLowerCase().trim();

      const isDefaultHost =
        !cleanHost ||
        cleanHost === "localhost" ||
        cleanHost === "127.0.0.1" ||
        cleanHost === "0.0.0.0" ||
        cleanHost === "::1" ||
        cleanHost === "rahmaniainstitute.org" ||
        cleanHost === "www.rahmaniainstitute.org" ||
        (process.env.NEXT_PUBLIC_APP_DOMAIN && cleanHost === process.env.NEXT_PUBLIC_APP_DOMAIN.toLowerCase().trim()) ||
        cleanHost.endsWith(".vercel.app");

      if (!isDefaultHost) {
        const { data: org } = await supabase
          .from("organizations")
          .select("id, name, slug, domain, subdomain, status, theme_config, modules_config")
          .or(`domain.eq.${cleanHost},subdomain.eq.${cleanHost.split(".")[0]}`)
          .eq("status", "active")
          .maybeSingle();

        if (org) {
          return {
            organizationId: org.id,
            org,
            isDefault: false,
            notFound: false,
            isUnknownDomain: false,
            resolvedFrom: "domain",
          };
        }

        // Unknown domain fallback: Unrecognized custom domains MUST NOT serve default tenant data!
        return {
          organizationId: null,
          org: null,
          isDefault: false,
          notFound: true,
          isUnknownDomain: true,
          resolvedFrom: "unknown_domain",
        };
      }
    }
  } catch (error) {
    console.error("Error resolving tenant context:", error);
  }

  // Fallback to Rahmania Institute default tenant for recognized default hosts
  return {
    organizationId: DEFAULT_TENANT_ID,
    org: {
      id: DEFAULT_TENANT_ID,
      name: "Rahmania Institute",
      slug: "rahmania",
      domain: "rahmaniainstitute.org",
      subdomain: "rahmania",
      status: "active",
    },
    isDefault: true,
    notFound: false,
    isUnknownDomain: false,
    resolvedFrom: "default_host",
  };
});
