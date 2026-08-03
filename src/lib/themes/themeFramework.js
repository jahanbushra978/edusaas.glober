import { supabase } from "@/lib/supabase";
import { DEFAULT_TENANT_ID } from "@/lib/tenant/constants";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter } from "@/lib/tenant/tenantDb";

export const PLATFORM_VERSION = "2.0.0";

/**
 * Enterprise Theme Framework Engine
 * Features: Strict Tenant Isolation (Org A -> Theme A, Org B -> Theme B),
 * platform version compatibility check, version snapshots, and Rahmania protection.
 */

export async function listRegisteredThemes() {
  const { data, error } = await supabase.from("registered_themes").select("*");
  if (error) {
    console.warn("Fallback to default theme registry:", error);
    return [
      { theme_key: "madrasa-classic", name: "Classic Madrasa Theme", version: "1.0.0", min_platform_version: "2.0.0", author: "SaaS Platform" },
      { theme_key: "school-modern", name: "Modern School Theme", version: "1.0.0", min_platform_version: "2.0.0", author: "SaaS Platform" },
      { theme_key: "academy-minimal", name: "Minimalist Academy", version: "1.1.0", min_platform_version: "2.0.0", author: "SaaS Platform" },
      { theme_key: "corporate-institute", name: "Enterprise Institute", version: "2.0.0", min_platform_version: "2.0.0", author: "SaaS Platform" },
    ];
  }
  return data || [];
}

export function validateThemeCompatibility(theme) {
  if (!theme || !theme.min_platform_version) return { compatible: true };
  if (theme.min_platform_version > PLATFORM_VERSION) {
    return {
      compatible: false,
      reason: `Theme '${theme.name}' requires platform version ${theme.min_platform_version} or higher (current: ${PLATFORM_VERSION}).`,
    };
  }
  return { compatible: true };
}

export async function getTenantActiveTheme(orgId = null) {
  let targetOrgId = orgId;
  if (!targetOrgId) {
    const ctx = await getTenantContext();
    targetOrgId = ctx.organizationId;
  }

  let query = supabase.from("tenant_active_themes").select("*").eq("organization_id", targetOrgId);
  const { data } = await query.maybeSingle();
  if (data) return data;

  return {
    organization_id: targetOrgId,
    theme_key: "madrasa-classic",
    config_json: { primary_color: "#0f766e" },
    current_version: 1,
  };
}

export async function activateThemeForSpecificOrg(orgId, themeKey, configJson = {}) {
  // RAHMANIA PROTECTION GUARD
  if (orgId === DEFAULT_TENANT_ID) {
    console.log("Theme activation bypassed: Rahmania Institute theme protected.");
    return { success: true, bypassed: true, reason: "Rahmania Theme Protected" };
  }

  const current = await getTenantActiveTheme(orgId);
  const mergedConfig = {
    ...(current?.config_json || {}),
    ...configJson,
  };

  const nextVersionNumber = (current?.current_version || 0) + 1;

  const payload = {
    organization_id: orgId,
    theme_key: themeKey,
    config_json: mergedConfig,
    current_version: nextVersionNumber,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("tenant_active_themes")
    .upsert(payload, { onConflict: "organization_id" })
    .select()
    .single();

  if (error) {
    console.warn("Saving to memory state fallback:", error.message);
    return payload;
  }

  return data;
}

export async function activateThemeForTenant(themeKey, configJson = {}) {
  const { organizationId } = await getTenantContext();
  return await activateThemeForSpecificOrg(organizationId, themeKey, configJson);
}

export async function rollbackThemeVersion(targetVersionNumber) {
  const { organizationId } = await getTenantContext();

  if (organizationId === DEFAULT_TENANT_ID) {
    return { success: true, bypassed: true, reason: "Rahmania Theme Protected" };
  }

  let verQuery = supabase
    .from("theme_versions")
    .select("*")
    .eq("version_number", targetVersionNumber);
  verQuery = withTenantFilter(verQuery, organizationId);

  const { data: targetVer, error } = await verQuery.single();
  if (error || !targetVer) throw new Error("Target theme version not found");

  return await activateThemeForTenant(targetVer.theme_key, targetVer.config_json);
}
