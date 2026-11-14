import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import type { AuthCtx } from "@/lib/auth";
import type { memberPatchSchema } from "@/lib/validation";
import { audit } from "./audit";
import { syncMemberDues } from "./dues";
import { assertAdminRemains } from "./roles";

type Patch = z.infer<typeof memberPatchSchema>;

export async function createMember(
  a: AuthCtx,
  input: { name: string; loginId: string; password?: string; monthlyPledge?: number; roleId?: string }
) {
  if (!a.perms.has("members.manage")) throw new HttpError(403, "FORBIDDEN");
  const cleanLoginId = input.loginId?.trim().toLowerCase();
  const cleanName = input.name?.trim();
  if (!cleanLoginId || cleanLoginId.length < 3) throw new HttpError(400, "INVALID_LOGIN_ID");
  if (!cleanName || cleanName.length < 2) throw new HttpError(400, "INVALID_NAME");

  let user = await db.user.findUnique({ where: { loginId: cleanLoginId } });
  if (!user) {
    const rawPass = input.password?.trim() || "Mosque@12345";
    const passwordHash = await bcrypt.hash(rawPass, 10);
    user = await db.user.create({
      data: { loginId: cleanLoginId, name: cleanName, passwordHash },
    });
  }

  const existing = await db.membership.findFirst({
    where: { mosqueId: a.mosque.id, userId: user.id },
  });
  if (existing) throw new HttpError(409, "MEMBER_ALREADY_EXISTS");

  let roleId = input.roleId;
  if (!roleId) {
    const defaultRole = await db.role.findFirst({
      where: { mosqueId: a.mosque.id, key: "member" },
    });
    roleId = defaultRole ? defaultRole.id : undefined;
  }
  if (!roleId) {
    const anyRole = await db.role.findFirst({ where: { mosqueId: a.mosque.id } });
    if (!anyRole) throw new HttpError(500, "NO_ROLE_AVAILABLE");
    roleId = anyRole.id;
  }

  const pledge = input.monthlyPledge !== undefined ? Math.max(0, Number(input.monthlyPledge)) : 500;

  const membership = await db.$transaction(async (tx) => {
    const m = await tx.membership.create({
      data: {
        mosqueId: a.mosque.id,
        userId: user!.id,
        roleId: roleId!,
        status: "ACTIVE",
        monthlyPledge: pledge,
      },
      include: { user: true, role: true },
    });
    await audit(tx, {
      mosqueId: a.mosque.id,
      actorId: a.user.id,
      action: "MEMBER_CREATED",
      entity: "Membership",
      entityId: m.id,
      meta: { name: cleanName, loginId: cleanLoginId, pledge, roleId },
    });
    return m;
  });

  await syncMemberDues(a.mosque, membership.id);
  return { membership };
}

export async function deleteMember(a: AuthCtx, membershipId: string) {
  if (!a.perms.has("members.manage")) throw new HttpError(403, "FORBIDDEN");
  const target = await db.membership.findFirst({
    where: { id: membershipId, mosqueId: a.mosque.id },
    include: { payments: true },
  });
  if (!target) throw new HttpError(404, "NOT_FOUND");
  if (target.id === a.membership.id) throw new HttpError(403, "CANNOT_DELETE_SELF");

  if (target.payments.length > 0) {
    throw new HttpError(400, "CANNOT_DELETE_MEMBER_WITH_PAYMENTS");
  }

  await db.$transaction(async (tx) => {
    await tx.monthlyDue.deleteMany({ where: { membershipId: target.id } });
    await tx.membership.delete({ where: { id: target.id } });
    await assertAdminRemains(tx, a.mosque.id);
    await audit(tx, {
      mosqueId: a.mosque.id,
      actorId: a.user.id,
      action: "MEMBER_DELETED",
      entity: "Membership",
      entityId: target.id,
      meta: { membershipId: target.id, userId: target.userId },
    });
  });

  return { ok: true };
}

export async function updateMember(a: AuthCtx, membershipId: string, patch: Patch) {
  if (!a.perms.has("members.manage")) throw new HttpError(403, "FORBIDDEN");
  if (patch.roleId && !a.perms.has("roles.manage")) throw new HttpError(403, "FORBIDDEN");
  const target = await db.membership.findFirst({ where: { id: membershipId, mosqueId: a.mosque.id } });
  if (!target) throw new HttpError(404, "NOT_FOUND");
  // Prevent self-promotion and self-lockout through this endpoint.
  if (target.id === a.membership.id && (patch.roleId || patch.status)) throw new HttpError(403, "CANNOT_EDIT_SELF");
  if (patch.roleId) {
    const role = await db.role.findFirst({ where: { id: patch.roleId, mosqueId: a.mosque.id } });
    if (!role) throw new HttpError(404, "ROLE_NOT_FOUND");
  }
  await db.$transaction(async (tx) => {
    await tx.membership.update({
      where: { id: target.id },
      data: { status: patch.status, monthlyPledge: patch.monthlyPledge, roleId: patch.roleId },
    });
    if (patch.status || patch.roleId) await assertAdminRemains(tx, a.mosque.id);
    await audit(tx, {
      mosqueId: a.mosque.id,
      actorId: a.user.id,
      action: "MEMBER_UPDATED",
      entity: "Membership",
      entityId: target.id,
      meta: {
        before: { status: target.status, monthlyPledge: target.monthlyPledge.toString(), roleId: target.roleId },
        after: patch,
      },
    });
  });
  if (patch.status === "ACTIVE" || patch.monthlyPledge !== undefined) await syncMemberDues(a.mosque, target.id);
  return { ok: true };
}

export async function updateMemberCredentials(
  a: AuthCtx,
  membershipId: string,
  input: { loginId?: string; password?: string }
) {
  if (!a.perms.has("members.manage")) throw new HttpError(403, "FORBIDDEN");
  const target = await db.membership.findFirst({
    where: { id: membershipId, mosqueId: a.mosque.id },
    include: { user: true },
  });
  if (!target) throw new HttpError(404, "NOT_FOUND");

  const cleanLoginId = input.loginId?.trim().toLowerCase();
  const cleanPassword = input.password?.trim();

  if (!cleanLoginId && !cleanPassword) {
    throw new HttpError(400, "NO_CREDENTIALS_PROVIDED");
  }

  if (cleanLoginId) {
    if (cleanLoginId.length < 3) throw new HttpError(400, "INVALID_LOGIN_ID");
    const existing = await db.user.findFirst({
      where: { loginId: cleanLoginId, id: { not: target.userId } },
    });
    if (existing) throw new HttpError(409, "LOGIN_ID_ALREADY_TAKEN");
  }

  if (cleanPassword && cleanPassword.length < 6) {
    throw new HttpError(400, "PASSWORD_TOO_SHORT");
  }

  await db.$transaction(async (tx) => {
    const updateData: { loginId?: string; passwordHash?: string } = {};
    if (cleanLoginId) updateData.loginId = cleanLoginId;
    if (cleanPassword) {
      updateData.passwordHash = await bcrypt.hash(cleanPassword, 10);
    }

    await tx.user.update({
      where: { id: target.userId },
      data: updateData,
    });

    await audit(tx, {
      mosqueId: a.mosque.id,
      actorId: a.user.id,
      action: "MEMBER_CREDENTIALS_UPDATED",
      entity: "Membership",
      entityId: target.id,
      meta: {
        membershipId: target.id,
        loginId: cleanLoginId || target.user.loginId,
        passwordChanged: !!cleanPassword,
      },
    });
  });

  return { ok: true, loginId: cleanLoginId || target.user.loginId };
}
