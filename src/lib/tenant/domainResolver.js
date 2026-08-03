import { supabase } from "@/lib/supabase";
import { getTenantContext } from "./tenantContext";
import { withTenantFilter, withTenantPayload } from "./tenantDb";

/**
 * Multi-Domain Mapping & SSL Lifecycle Engine
 * Enforces platform-wide domain_name uniqueness.
 */

export async function getTenantDomains() {
  const { organizationId } = await getTenantContext();
  let query = supabase.from("domain_mappings").select("*");
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function registerTenantDomain({ domainName, domainType = "secondary" }) {
  const { organizationId } = await getTenantContext();
  const cleanDomain = domainName.trim().toLowerCase();

  // Check platform-wide domain uniqueness
  const { data: existing } = await supabase
    .from("domain_mappings")
    .select("id, organization_id")
    .eq("domain_name", cleanDomain)
    .maybeSingle();

  if (existing) {
    throw new Error(`Domain '${cleanDomain}' is already registered on the platform.`);
  }

  const payload = withTenantPayload(
    {
      domain_name: cleanDomain,
      domain_type: domainType,
      verification_status: "pending",
      ssl_status: "pending",
      is_active_primary: domainType === "primary",
    },
    organizationId
  );

  const { data, error } = await supabase.from("domain_mappings").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function setPrimaryDomain(domainId) {
  const { organizationId } = await getTenantContext();

  // 1. Reset current primary domains
  let resetQuery = supabase
    .from("domain_mappings")
    .update({ is_active_primary: false, domain_type: "secondary" });
  resetQuery = withTenantFilter(resetQuery, organizationId);
  await resetQuery;

  // 2. Set target domain as primary
  let updateQuery = supabase
    .from("domain_mappings")
    .update({ is_active_primary: true, domain_type: "primary" })
    .eq("id", domainId);
  updateQuery = withTenantFilter(updateQuery, organizationId);

  const { data, error } = await updateQuery.select().single();
  if (error) throw error;
  return data;
}

export async function updateDomainVerificationStatus(domainId, verificationStatus, sslStatus = "active") {
  const { organizationId } = await getTenantContext();
  let query = supabase
    .from("domain_mappings")
    .update({
      verification_status: verificationStatus,
      ssl_status: sslStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", domainId);
  query = withTenantFilter(query, organizationId);

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}
