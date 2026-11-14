import { z } from "zod";
import { PERIOD_RE } from "./period";
import { PERMISSIONS } from "./permissions";

const loginId = z.string().trim().toLowerCase().min(4).max(32).regex(/^[a-z0-9._-]+$/, "letters, digits, . _ - only");

export const registerSchema = z.object({
  mosqueSlug: z.string().trim().toLowerCase().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(80),
  loginId,
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  mosqueSlug: z.string().trim().toLowerCase().min(2).max(60),
  loginId,
  password: z.string().min(1).max(100),
});

export const paymentSchema = z.object({
  membershipId: z.string().min(1),
  fundId: z.string().min(1).optional(),
  amount: z.number().positive().max(10_000_000),
  period: z.string().regex(PERIOD_RE),
  method: z.enum(["CASH", "BKASH", "NAGAD", "BANK"]),
  idempotencyKey: z.string().min(8).max(100),
  note: z.string().max(300).optional(),
});

export const memberPatchSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  monthlyPledge: z.number().min(0).max(10_000_000).optional(),
  roleId: z.string().min(1).optional(),
});

export const roleCreateSchema = z.object({
  name: z.string().trim().min(2).max(40),
  permissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length),
});

export const expenseSchema = z.object({
  fundId: z.string().min(1).optional(),
  category: z.enum(["UTILITIES", "SALARY", "CLEANING", "MAINTENANCE", "EQUIPMENT", "EDUCATION", "MEALS", "OTHER"]),
  description: z.string().trim().min(3).max(500),
  amount: z.number().positive().max(100_000_000),
  spentAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "invalid date"),
  attachmentUrl: z.string().max(2_500_000).optional(),
  buyerSignature: z.string().trim().max(200).optional(),
});

export const decisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().trim().max(500).optional(),
  approverSignature: z.string().trim().max(200).optional(),
  authPassword: z.string().trim().max(100).optional(),
});

export const paySchema = z.object({ paymentRef: z.string().trim().max(100).optional() });

export const mosqueCreateSchema = z.object({
  mosqueName: z.string().trim().min(3).max(80),
  mosqueSlug: z.string().trim().toLowerCase().min(3).max(40).regex(/^[a-z0-9-]+$/),
  startMonth: z.string().regex(PERIOD_RE).optional(),
  name: z.string().trim().min(2).max(80),
  loginId,
  password: z.string().min(8).max(100),
});

export const rolePatchSchema = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length).optional(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(3).max(80).optional(),
  showContributors: z.boolean().optional(),
  requireVerification: z.boolean().optional(),
});

export const fundCreateSchema = z.object({
  name: z.string().trim().min(2).max(60),
  restricted: z.boolean().optional(),
});
