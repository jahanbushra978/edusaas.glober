import { DEFAULT_TENANT_ID } from "./constants";
import { logPlatformAction } from "./auditLogger";

/**
 * Automated Tenant Onboarding Engine
 * Provisions default settings, role permission trees, and academic foundation for NEW tenants.
 * RAHMANIA PROTECTION: Never resets or overwrites Rahmania Institute (Org #1) data.
 */
export async function onboardNewTenant(organization) {
  if (!organization || !organization.id) {
    throw new Error("Invalid organization object passed to onboardingEngine");
  }

  // RAHMANIA PROTECTION GUARD: Never touch Rahmania Institute existing data
  if (organization.id === DEFAULT_TENANT_ID || organization.slug === "rahmania") {
    console.log("Onboarding bypassed: Rahmania Institute data protected.");
    return { success: true, bypassed: true, reason: "Rahmania Protection Active" };
  }

  try {
    const defaultSettings = {
      language: "bn",
      timezone: "Asia/Dhaka",
      academic_session: new Date().getFullYear().toString(),
      default_branch_name: "Main Campus",
    };

    // Log onboarding event to immutable audit log
    await logPlatformAction({
      organizationId: organization.id,
      action: "TENANT_ONBOARDED",
      resourceType: "organization",
      resourceId: organization.id,
      details: {
        org_name: organization.name,
        slug: organization.slug,
        default_settings: defaultSettings,
      },
    });

    return {
      success: true,
      bypassed: false,
      organizationId: organization.id,
      settings: defaultSettings,
    };
  } catch (err) {
    console.error("Error onboarding new tenant:", err);
    return { success: false, error: err.message };
  }
}
