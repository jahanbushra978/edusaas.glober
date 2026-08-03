import { DEFAULT_TENANT_ID } from "@/lib/tenant/constants";
import { saveTenantMenu } from "./menuBuilder";
import { saveTenantFormDefinition } from "./formBuilder";

/**
 * Template Library & Instantiation Engine
 * RAHMANIA PROTECTION: Rahmania Institute (Org #1) site or data is NEVER overwritten.
 */

export const READY_TEMPLATES = [
  {
    id: "madrasa-classic",
    name: "Classic Madrasa Template",
    category: "Madrasa",
    defaultMenu: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Departments", href: "/academics" },
      { label: "Notices", href: "/notices" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "school-modern",
    name: "Modern School Template",
    category: "School",
    defaultMenu: [
      { label: "Home", href: "/" },
      { label: "Academics", href: "/academics" },
      { label: "Facilities", href: "/facilities" },
      { label: "Notices", href: "/notices" },
      { label: "Admissions", href: "/admission" },
    ],
  },
];

export async function applyTemplateToTenant(targetOrganizationId, templateId) {
  // RAHMANIA PROTECTION GUARD
  if (targetOrganizationId === DEFAULT_TENANT_ID) {
    console.log("Template instantiation bypassed: Rahmania Institute data protected.");
    return { success: true, bypassed: true, reason: "Rahmania Data Protected" };
  }

  const template = READY_TEMPLATES.find((t) => t.id === templateId) || READY_TEMPLATES[0];

  try {
    // Instantiate menu & forms for new organization
    await saveTenantMenu("main_header", template.defaultMenu);
    await saveTenantFormDefinition("online_admission", [
      { name: "applicant_name", type: "text", required: true, label: "Applicant Name" },
      { name: "phone", type: "tel", required: true, label: "Phone Number" },
    ]);

    return { success: true, templateId: template.id, targetOrganizationId };
  } catch (err) {
    console.error("Error applying template to tenant:", err);
    return { success: false, error: err.message };
  }
}
