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
      const cleanHost = host.split(":")[0];

      if (cleanHost && !cleanHost.includes("localhost") && !cleanHost.includes("127.0.0.1")) {
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
            resolvedFrom: "domain",
          };
        }
      }
    }
  } catch (error) {
    console.error("Error resolving tenant context:", error);
  }

  // Fallback to Rahmania Institute default tenant
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
    resolvedFrom: "fallback",
  };
});
