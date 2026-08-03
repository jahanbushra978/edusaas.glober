import { supabase } from "@/lib/supabase";
import { getTenantContext } from "@/lib/tenant/tenantContext";
import { withTenantFilter } from "@/lib/tenant/tenantDb";

/**
 * Multi-Country i18n & Translation Engine with Multi-Tier Fallback Hierarchy
 * Fallback Chain: Requested Lang -> Tenant Default Lang -> Global Fallback ('en') -> Raw Key
 */

const DICTIONARY = {
  bn: {
    dashboard: "ড্যাশবোর্ড",
    students: "শিক্ষার্থী ব্যবস্থাপনা",
    teachers: "শিক্ষকবৃন্দ",
    notices: "নোটিশ বোর্ড",
    biometric: "বায়োমেট্রিক হাজিরা",
    fees: "ফি ও হিসাব",
  },
  en: {
    dashboard: "Dashboard",
    students: "Student Management",
    teachers: "Teachers",
    notices: "Notice Board",
    biometric: "Biometric Attendance",
    fees: "Fees & Accounting",
  },
  ar: {
    dashboard: "لوحة التحكم",
    students: "إدارة الطلاب",
    teachers: "المعلمون",
    notices: "لوحة الإعلانات",
    biometric: "حضور البصمة",
    fees: "الرسوم والمحاسبة",
  },
};

export async function getTenantI18nSettings() {
  const { organizationId } = await getTenantContext();

  try {
    let query = supabase.from("tenant_i18n_settings").select("*");
    query = withTenantFilter(query, organizationId);
    const { data } = await query.maybeSingle();

    if (data) return data;
  } catch (err) {
    console.error("Error fetching i18n settings:", err);
  }

  return {
    organization_id: organizationId,
    default_language: "bn",
    currency_code: "BDT",
    timezone: "Asia/Dhaka",
  };
}

/**
 * Multi-tier Fallback Translation Lookup
 */
export function translate(key, requestedLang = null, tenantDefaultLang = "bn") {
  const targetLang = requestedLang || tenantDefaultLang;

  // Tier 1: Requested Language
  if (DICTIONARY[targetLang] && DICTIONARY[targetLang][key]) {
    return DICTIONARY[targetLang][key];
  }

  // Tier 2: Tenant Default Language
  if (DICTIONARY[tenantDefaultLang] && DICTIONARY[tenantDefaultLang][key]) {
    return DICTIONARY[tenantDefaultLang][key];
  }

  // Tier 3: Global English Fallback
  if (DICTIONARY.en && DICTIONARY.en[key]) {
    return DICTIONARY.en[key];
  }

  // Tier 4: Return Raw Key
  return key;
}

export function formatCurrency(amount, currencyCode = "BDT") {
  const symbols = { BDT: "৳", USD: "$", SAR: "﷼" };
  const symbol = symbols[currencyCode] || "৳";
  return `${symbol} ${Number(amount || 0).toLocaleString()}`;
}
