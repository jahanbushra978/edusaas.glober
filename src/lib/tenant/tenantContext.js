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
        cleanHost === "edusaas.global" ||
        cleanHost === "www.edusaas.global" ||
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
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error; // Re-throw so Next.js seamlessly flags the route as dynamic SSR without cluttering build logs
    }
    console.error("Error resolving tenant context:", error);
  }

  // Fallback / resolution for recognized default hosts
  let cleanHost = "";
  try {
    if (typeof window === "undefined") {
      const { headers } = await import("next/headers");
      const reqHeaders = await headers();
      cleanHost = (reqHeaders.get("host") || "").split(":")[0].toLowerCase().trim();
    }
  } catch {}

  const isEdusaasHost =
    !cleanHost ||
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "0.0.0.0" ||
    cleanHost === "::1" ||
    cleanHost === "edusaas.global" ||
    cleanHost === "www.edusaas.global" ||
    (process.env.NEXT_PUBLIC_APP_DOMAIN && cleanHost === process.env.NEXT_PUBLIC_APP_DOMAIN.toLowerCase().trim()) ||
    cleanHost.endsWith(".vercel.app");

  const isRahmaniaHost =
    cleanHost === "rahmaniainstitute.org" ||
    cleanHost === "www.rahmaniainstitute.org";

  if (!isEdusaasHost && !isRahmaniaHost) {
    // STRICT UNKNOWN DOMAIN POLICY:
    // If the hostname is neither an approved Edusaas host nor an approved Rahmania host,
    // and was NOT found as an active verified tenant in organizations, strictly return 404!
    // Never silently serve Edusaas or Rahmania data for an unknown domain.
    return {
      organizationId: null,
      org: null,
      isDefault: false,
      notFound: true,
      isUnknownDomain: true,
      resolvedFrom: "unknown_domain",
    };
  }

  return {
    organizationId: DEFAULT_TENANT_ID,
    org: {
      id: DEFAULT_TENANT_ID,
      name: isRahmaniaHost ? "Rahmania Institute" : "Edusaas Platform",
      slug: isRahmaniaHost ? "rahmania" : "edusaas",
      domain: isRahmaniaHost ? "rahmaniainstitute.org" : "edusaas.global",
      subdomain: isRahmaniaHost ? "rahmania" : "platform",
      status: "active",
    },
    isDefault: true,
    isPlatform: isEdusaasHost,
    notFound: false,
    isUnknownDomain: false,
    resolvedFrom: isRahmaniaHost ? "flagship_academy" : "default_host",
  };
});
