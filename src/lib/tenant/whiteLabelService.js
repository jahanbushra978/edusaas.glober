import { supabase } from "@/lib/supabase";
import { DEFAULT_TENANT_ID } from "./constants";
import { getTenantContext } from "./tenantContext";
import { withTenantFilter, withTenantPayload } from "./tenantDb";

/**
 * Versioned Deep White Label Branding System with Rollback Support
 * RAHMANIA PROTECTION: Rahmania Institute (Org #1) branding is protected against overwrites.
 */

export async function getTenantWhiteLabelConfig() {
  const { organizationId, org } = await getTenantContext();

  try {
    let query = supabase.from("white_label_configs").select("*");
    query = withTenantFilter(query, organizationId);
    const { data } = await query.maybeSingle();

    if (data) return data;
  } catch (err) {
    console.error("Error loading white label config:", err);
  }

  return {
    organization_id: organizationId,
    browser_title: org?.name || "Rahmania Institute ERP",
    favicon_url: "/favicon.ico",
    current_version: 1,
    branding_json: {
      institute_name: org?.name || "Rahmania Institute",
      logo_url: "/logo.png",
      support_email: "support@rahmaniainstitute.org",
      footer_copyright: `© ${new Date().getFullYear()} ${org?.name || "Rahmania Institute"}. All rights reserved.`,
    },
    theme_colors_json: {
      primary: "#0f766e",
      secondary: "#0d9488",
    },
  };
}

export async function saveTenantWhiteLabelConfig(configPayload) {
  const { organizationId } = await getTenantContext();

  // RAHMANIA PROTECTION GUARD
  if (organizationId === DEFAULT_TENANT_ID) {
    console.log("White Label update bypassed: Rahmania Institute branding protected.");
    return { success: true, bypassed: true, reason: "Rahmania Protection Active" };
  }

  const current = await getTenantWhiteLabelConfig();
  const nextVersionNumber = (current?.current_version || 0) + 1;

  const mainPayload = withTenantPayload(
    {
      ...configPayload,
      current_version: nextVersionNumber,
      updated_at: new Date().toISOString(),
    },
    organizationId
  );

  const { data: config, error } = await supabase
    .from("white_label_configs")
    .upsert(mainPayload, { onConflict: "organization_id" })
    .select()
    .single();

  if (error) throw error;

  // Insert version snapshot
  const versionPayload = withTenantPayload(
    {
      config_id: config.id,
      version_number: nextVersionNumber,
      branding_json: configPayload.branding_json || {},
      theme_colors_json: configPayload.theme_colors_json || {},
      login_style_json: configPayload.login_style_json || {},
    },
    organizationId
  );

  await supabase.from("white_label_versions").insert(versionPayload);

  return config;
}

export async function rollbackWhiteLabelConfig(targetVersionNumber) {
  const { organizationId } = await getTenantContext();

  // RAHMANIA PROTECTION GUARD
  if (organizationId === DEFAULT_TENANT_ID) {
    return { success: true, bypassed: true, reason: "Rahmania Protection Active" };
  }

  let verQuery = supabase
    .from("white_label_versions")
    .select("*")
    .eq("version_number", targetVersionNumber);
  verQuery = withTenantFilter(verQuery, organizationId);

  const { data: targetVer, error } = await verQuery.single();
  if (error || !targetVer) throw new Error("Target white label version not found");

  return await saveTenantWhiteLabelConfig({
    branding_json: targetVer.branding_json,
    theme_colors_json: targetVer.theme_colors_json,
    login_style_json: targetVer.login_style_json,
  });
}
