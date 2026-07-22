import "server-only";

import bcrypt from "bcryptjs";
import {
  MANAGED_PASSWORD_PLACEHOLDER,
  getManagedAuthEmail,
  hasUsableStoredPassword,
  normalizeLoginId,
  sanitizePasswordMarker,
} from "./auth-identity";
import { createSupabaseAdminClient, createSupabaseAuthClient } from "./supabase-admin";
import { safeCompare } from "./safe-compare";

// H2 fix (revised): Supabase's Admin API has no "get user by email" endpoint,
// so a full scan is unavoidable when we need a fresh answer. The only
// unambiguously safe optimization here is fetching larger pages (GoTrue
// supports up to 1000 per page vs. the original 200), which cuts round-trips
// without changing what data is returned.
//
// An earlier version of this fix added a persistent in-process cache across
// invocations. That is NOT safe on Vercel/serverless: module-level state is
// per-instance, and invalidateAuthUserCache() on one instance does not
// invalidate the cache on any other warm instance. Under concurrent
// requests hitting different instances, that could make findAuthUserByEmail
// return a stale "not found" for a user created moments earlier on another
// instance, causing upsertManagedAuthUser's create-path to collide with an
// already-existing email and fail. Since this function feeds auth
// create/update decisions, correctness takes priority over the (modest)
// extra latency saved by caching, so the cache has been removed. Every call
// does a fresh scan, exactly like before this optimization was attempted.
async function listAllAuthUsers(adminClient) {
  const users = [];
  let page = 1;
  // GoTrue's admin listUsers endpoint supports up to 1000 per page, so we
  // fetch in larger batches than before (was 200) to cut down round-trips.
  // This is safe: it only changes how many API calls are made to fetch the
  // SAME, always-fresh data — it does not introduce any staleness.
  const perPage = 1000;

  while (true) {
    const result = await adminClient.auth.admin.listUsers({ page, perPage });

    if (result.error) {
      throw result.error;
    }

    const batch = result.data?.users || [];
    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function findAuthUserByEmail(adminClient, email) {
  const users = await listAllAuthUsers(adminClient);
  const target = email.toLowerCase();
  return users.find((user) => user.email?.toLowerCase() === target) || null;
}

async function upsertManagedAuthUser({
  adminClient,
  role,
  loginId,
  password,
  profileId = null,
  metadata = {},
}) {
  const normalizedLoginId = normalizeLoginId(loginId);
  const email = getManagedAuthEmail(role, normalizedLoginId);
  const existing = await findAuthUserByEmail(adminClient, email);
  const userMetadata = {
    role,
    loginId: normalizedLoginId,
    profileId,
    ...metadata,
  };
  const payload = {
    email,
    email_confirm: true,
    user_metadata: userMetadata,
    app_metadata: { role },
  };

  if (password) {
    payload.password = password;
  }

  if (existing) {
    const updateResult = await adminClient.auth.admin.updateUserById(existing.id, payload);

    if (updateResult.error) {
      throw updateResult.error;
    }

    return updateResult.data.user;
  }

  if (!password) {
    throw new Error("A password is required to create a new managed auth user.");
  }

  const createResult = await adminClient.auth.admin.createUser(payload);

  if (createResult.error) {
    throw createResult.error;
  }

  return createResult.data.user;
}

export async function authenticatePortalUser({ role, loginId, password }) {
  const authClient = createSupabaseAuthClient();

  if (role === "admin") {
    const adminClient = createSupabaseAdminClient();
    let adminPassword = process.env.ADMIN_LOGIN_PASSWORD;
    if (adminPassword) adminPassword = adminPassword.trim();
    try {
      const { data: dbSetting } = await adminClient
        .from("app_settings")
        .select("value")
        .eq("key", "admin_login_password")
        .maybeSingle();
      if (dbSetting?.value) {
        adminPassword = dbSetting.value.trim();
      }
    } catch (e) {
      console.error("Failed to query DB for admin_login_password:", e);
    }

    let isPasswordValid = false;
    if (adminPassword) {
      if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
        isPasswordValid = await bcrypt.compare(password, adminPassword);
      } else {
        isPasswordValid = safeCompare(password, adminPassword);
      }
    }

    const isMainAdmin = isPasswordValid && (String(loginId).toLowerCase() === "main" || String(loginId).includes("@") || !loginId);

    if (isMainAdmin) {
      const adminEmail = getManagedAuthEmail("admin", "main");
      if (adminPassword) {
        await upsertManagedAuthUser({
          adminClient,
          role: "admin",
          loginId: "MAIN",
          password: adminPassword,
          metadata: { label: "Admin" },
        });
      }

      const signInResult = await authClient.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (signInResult.error || !signInResult.data.user) {
        throw new Error("Invalid admin password.");
      }

      return {
        user: signInResult.data.user,
        role: "admin",
        profile: null,
        loginId: "MAIN",
      };
    } else {
      // 2. Try to authenticate as Branch Admin/Boarding Manager
      const resolvedLoginId = normalizeLoginId(loginId);
      const lowercaseLoginId = String(loginId || "").trim().toLowerCase();
      const { data: branches, error: branchErr } = await adminClient
        .from("branches")
        .select("*");

      if (branchErr) {
        throw new Error("Database error occurred. Please try again.");
      }

      const branch = branches?.find(b => b.admin_username && b.admin_username.trim().toLowerCase() === lowercaseLoginId);

      if (branch && (safeCompare(branch.admin_password || "", password) || await bcrypt.compare(password, branch.admin_password || ''))) {
        if (branch.is_active === false) {
          throw new Error("This branch is inactive. Please contact the administrator.");
        }
        const email = getManagedAuthEmail("branch_admin", resolvedLoginId);
        let signInResult = await authClient.auth.signInWithPassword({ email, password });

        if (signInResult.error || !signInResult.data.user) {
          // Sync Auth user if not created yet
          await upsertManagedAuthUser({
            adminClient,
            role: "branch_admin",
            loginId: resolvedLoginId,
            password,
            profileId: branch.id,
            metadata: { fullName: branch.name_en || branch.branch_name, branchId: branch.id, allowedFeatures: branch.allowed_features },
          });
          signInResult = await authClient.auth.signInWithPassword({ email, password });
        }

        if (signInResult.error || !signInResult.data.user) {
          throw new Error("Invalid ID or password. Please try again.");
        }

        return {
          user: signInResult.data.user,
          role: "branch_admin",
          profile: {
            id: branch.id,
            full_name_en: branch.name_en || branch.branch_name,
            branch_id: branch.id,
            allowed_features: branch.allowed_features,
          },
          loginId: resolvedLoginId,
        };
      } else {
        const bBranch = branches?.find(b => b.boarding_enabled && b.boarding_manager_username && b.boarding_manager_username.trim().toLowerCase() === lowercaseLoginId);
        if (bBranch && (safeCompare(bBranch.boarding_manager_password || "", password) || await bcrypt.compare(password, bBranch.boarding_manager_password || ''))) {
          if (bBranch.is_active === false) {
            throw new Error("This branch is inactive. Please contact the administrator.");
          }
          const email = getManagedAuthEmail("boarding_manager", resolvedLoginId);
          let signInResult = await authClient.auth.signInWithPassword({ email, password });

          if (signInResult.error || !signInResult.data.user) {
            // Sync Auth user if not created yet
            await upsertManagedAuthUser({
              adminClient,
              role: "boarding_manager",
              loginId: resolvedLoginId,
              password,
              profileId: bBranch.id,
              metadata: { fullName: bBranch.boarding_manager_name || "Boarding Manager", branchId: bBranch.id },
            });
            signInResult = await authClient.auth.signInWithPassword({ email, password });
          }

          if (signInResult.error || !signInResult.data.user) {
            throw new Error("Invalid ID or password. Please try again.");
          }

          return {
            user: signInResult.data.user,
            role: "boarding_manager",
            profile: {
              id: bBranch.id,
              full_name_en: bBranch.boarding_manager_name || "Boarding Manager",
              branch_id: bBranch.id,
              allowed_features: ["boarding"],
            },
            loginId: resolvedLoginId,
          };
        } else {
          throw new Error("Invalid ID or password. Please try again.");
        }
      }
    }
  }

  const resolvedLoginId = normalizeLoginId(loginId);
  const tableName = role === "teacher" ? "teachers" : "students";
  const idField = role === "teacher" ? "teacher_id" : "roll_number";

  let adminClient;
  try { adminClient = createSupabaseAdminClient(); } catch { adminClient = null; }
  const dbClient = adminClient || authClient;

  const profileQuery = await dbClient
    .from(tableName)
    .select("*")
    .eq(idField, resolvedLoginId)
    .limit(1)
    .maybeSingle();

  if (profileQuery.error) {
    throw profileQuery.error;
  }

  const profile = profileQuery.data;

  if (!profile) {
    throw new Error("Invalid ID or password. Please try again.");
  }

  if (profile.status === "inactive") {
    throw new Error("This account is inactive. Please contact the administrator.");
  }

  const email = getManagedAuthEmail(role, resolvedLoginId);
  let signInResult = await authClient.auth.signInWithPassword({ email, password });

  if (signInResult.error || !signInResult.data.user) {
    if (adminClient && hasUsableStoredPassword(profile.password) && safeCompare(profile.password, password)) {
      await upsertManagedAuthUser({
        adminClient,
        role,
        loginId: resolvedLoginId,
        password,
        profileId: profile.id,
        metadata: { fullName: profile.full_name_en || "" },
      });

      await adminClient
        .from(tableName)
        .update({ password: MANAGED_PASSWORD_PLACEHOLDER })
        .eq("id", profile.id);

      signInResult = await authClient.auth.signInWithPassword({ email, password });
    }
  }

  if (signInResult.error || !signInResult.data.user) {
    throw new Error("Invalid ID or password. Please try again.");
  }

  return {
    user: signInResult.data.user,
    role,
    profile: {
      ...profile,
      password: sanitizePasswordMarker(profile.password),
    },
    loginId: resolvedLoginId,
  };
}

export async function syncManagedPortalUser({
  role,
  action,
  currentLoginId,
  nextLoginId,
  password,
  profileId = null,
  metadata = {},
}) {
  let adminClient;
  try { adminClient = createSupabaseAdminClient(); } catch { return null; }
  const existingEmail = currentLoginId ? getManagedAuthEmail(role, currentLoginId) : null;
  const targetLoginId = normalizeLoginId(nextLoginId || currentLoginId);

  if (action === "delete") {
    if (!existingEmail) {
      return;
    }

    const existingUser = await findAuthUserByEmail(adminClient, existingEmail);

    if (existingUser) {
      const deleteResult = await adminClient.auth.admin.deleteUser(existingUser.id);

      if (deleteResult.error) {
        throw deleteResult.error;
      }
    }

    return;
  }

  const existingUser = existingEmail
    ? await findAuthUserByEmail(adminClient, existingEmail)
    : await findAuthUserByEmail(adminClient, getManagedAuthEmail(role, targetLoginId));

  const targetEmail = getManagedAuthEmail(role, targetLoginId);
  const payload = {
    email: targetEmail,
    email_confirm: true,
    user_metadata: {
      role,
      loginId: targetLoginId,
      profileId,
      ...metadata,
    },
    app_metadata: { role },
  };

  if (password) {
    payload.password = password;
  }

  if (existingUser) {
    const updateResult = await adminClient.auth.admin.updateUserById(existingUser.id, payload);

    if (updateResult.error) {
      throw updateResult.error;
    }

    return updateResult.data.user;
  }

  if (!password) {
    return null;
  }

  const createResult = await adminClient.auth.admin.createUser(payload);

  if (createResult.error) {
    throw createResult.error;
  }

  return createResult.data.user;
}
