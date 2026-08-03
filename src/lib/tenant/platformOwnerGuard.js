import { supabase } from "@/lib/supabase";

/**
 * Platform Owner Access Guard
 * Verifies server session for Platform Owner credentials.
 * Restricts access to /platform-console routes.
 */
export async function verifyPlatformOwner(sessionToken) {
  if (!sessionToken) {
    return { authorized: false, reason: "No session token provided" };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      return { authorized: false, reason: "Invalid session" };
    }

    // Check user metadata or custom claim for platform_owner
    const isPlatformOwner = user.user_metadata?.is_platform_owner === true ||
                           user.app_metadata?.is_platform_owner === true;

    if (!isPlatformOwner) {
      return { authorized: false, reason: "User does not have Platform Owner privileges" };
    }

    return { authorized: true, user };
  } catch (err) {
    console.error("Error verifying platform owner guard:", err);
    return { authorized: false, reason: "Guard verification error" };
  }
}
