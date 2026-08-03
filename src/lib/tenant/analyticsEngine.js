import { supabase } from "@/lib/supabase";
import { getTenantContext } from "./tenantContext";
import { withTenantFilter, withTenantPayload } from "./tenantDb";

/**
 * Event-Based Analytics Architecture Engine
 * Separates raw events from aggregated metrics.
 */

export async function trackEvent({ eventName, category = "general", userId = null, metadata = {} }) {
  try {
    const { organizationId } = await getTenantContext();
    const payload = withTenantPayload(
      {
        event_name: eventName,
        event_category: category,
        user_id: userId,
        metadata,
      },
      organizationId
    );

    const { data, error } = await supabase
      .from("platform_analytics_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Analytics event tracking warning:", error.message);
      return payload;
    }
    return data;
  } catch (err) {
    console.error("Error tracking analytics event:", err);
    return null;
  }
}

export async function getTenantAnalyticsSummary(organizationId) {
  try {
    let query = supabase
      .from("platform_analytics_daily")
      .select("*")
      .order("metric_date", { ascending: false })
      .limit(30);

    query = withTenantFilter(query, organizationId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error getting tenant analytics summary:", err);
    return [];
  }
}

export async function getPlatformConsoleAnalytics() {
  try {
    const { data: orgs } = await supabase.from("organizations").select("id, status");
    const { count: totalEvents } = await supabase
      .from("platform_analytics_events")
      .select("*", { count: "exact", head: true });

    return {
      totalOrganizations: orgs?.length || 1,
      activeOrganizations: orgs?.filter((o) => o.status === "active").length || 1,
      totalTrackedEvents: totalEvents || 0,
    };
  } catch (err) {
    console.error("Error getting Platform Console analytics:", err);
    return { totalOrganizations: 1, activeOrganizations: 1, totalTrackedEvents: 0 };
  }
}
