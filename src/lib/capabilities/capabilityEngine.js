import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";

/**
 * Subscription Capability & Feature Gating Engine
 * Controls access to Students/Branches limits, Modules, Themes, and Plugins per Subscription Plan.
 */

export async function getTenantSubscriptionPlan() {
  const { org } = await getTenantContext();
  const planKey = org?.subscription_plan || "free";

  try {
    const { data } = await supabase
      .from("subscription_capabilities")
      .select("*")
      .eq("plan_key", planKey)
      .maybeSingle();

    if (data) return data;
  } catch (err) {
    console.error("Error fetching subscription capability:", err);
  }

  // Fallback defaults for Free / Enterprise
  if (planKey === "enterprise" || planKey === "premium") {
    return {
      plan_key: planKey,
      max_students: 5000,
      max_branches: 10,
      storage_quota_mb: 10240,
      allowed_themes_json: ["*"],
      allowed_plugins_json: ["*"],
    };
  }

  return {
    plan_key: "free",
    max_students: 200,
    max_branches: 1,
    storage_quota_mb: 1024,
    allowed_themes_json: ["madrasa-classic"],
    allowed_plugins_json: ["biometric-bridge"],
  };
}

export async function checkThemeCapability(themeKey) {
  const capabilities = await getTenantSubscriptionPlan();
  const allowedThemes = capabilities?.allowed_themes_json || [];

  if (allowedThemes.includes("*") || allowedThemes.includes(themeKey)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Theme '${themeKey}' requires a Premium or Enterprise subscription plan.`,
  };
}

export async function checkPluginCapability(pluginId) {
  const capabilities = await getTenantSubscriptionPlan();
  const allowedPlugins = capabilities?.allowed_plugins_json || [];

  if (allowedPlugins.includes("*") || allowedPlugins.includes(pluginId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Plugin '${pluginId}' requires a Premium or Enterprise subscription plan.`,
  };
}
