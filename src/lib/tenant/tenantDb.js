import { DEFAULT_TENANT_ID } from "./constants";

/**
 * Tenant DB Utility Helpers (Convenience & Optimization Layer)
 * Works alongside Supabase Database RLS policies.
 */

/**
 * Appends tenant filter to a Supabase query builder.
 */
export function withTenantFilter(query, organizationId = DEFAULT_TENANT_ID) {
  if (!query || typeof query.eq !== "function") {
    throw new Error("Invalid query builder passed to withTenantFilter");
  }
  return query.eq("organization_id", organizationId);
}

/**
 * Injects verified organization_id into insert/update payloads.
 */
export function withTenantPayload(payload, organizationId = DEFAULT_TENANT_ID) {
  if (Array.isArray(payload)) {
    return payload.map((item) => ({
      ...item,
      organization_id: organizationId,
    }));
  }
  return {
    ...payload,
    organization_id: organizationId,
  };
}

/**
 * Helper for Platform Owner operations requiring EXPLICIT target organization ID.
 */
export function requireExplicitTargetTenant(targetOrganizationId) {
  if (!targetOrganizationId) {
    throw new Error("Platform Owner operation requires explicit target organization ID");
  }
  return targetOrganizationId;
}
