import { describe, expect, it } from "vitest";
import {
  decisionSchema,
  expenseSchema,
  fundCreateSchema,
  loginSchema,
  memberPatchSchema,
  mosqueCreateSchema,
  paymentSchema,
  registerSchema,
  roleCreateSchema,
  settingsSchema,
} from "../src/lib/validation";

describe("validation schemas", () => {
  it("validates registerSchema", () => {
    const valid = {
      mosqueSlug: "baitun-noor",
      name: "Abdullah",
      loginId: "abdullah_1",
      password: "securepassword123",
    };
    expect(registerSchema.parse(valid)).toMatchObject(valid);

    // Invalid loginId
    expect(() =>
      registerSchema.parse({ ...valid, loginId: "ab" }),
    ).toThrow();
    // Invalid characters in loginId
    expect(() =>
      registerSchema.parse({ ...valid, loginId: "ab dullah" }),
    ).toThrow();
  });

  it("validates loginSchema", () => {
    expect(
      loginSchema.parse({
        mosqueSlug: "baitun-noor",
        loginId: "treasurer",
        password: "any",
      }),
    ).toBeDefined();

    expect(() =>
      loginSchema.parse({ mosqueSlug: "b", loginId: "tr", password: "" }),
    ).toThrow();
  });

  it("validates paymentSchema", () => {
    const valid = {
      membershipId: "mem123",
      amount: 500,
      period: "2026-10",
      method: "BKASH" as const,
      idempotencyKey: "unique-key-12345",
    };
    expect(paymentSchema.parse(valid)).toMatchObject(valid);

    // negative amount rejected
    expect(() => paymentSchema.parse({ ...valid, amount: -10 })).toThrow();
    // invalid period rejected
    expect(() => paymentSchema.parse({ ...valid, period: "2026/10" })).toThrow();
    // short idempotency key rejected
    expect(() => paymentSchema.parse({ ...valid, idempotencyKey: "short" })).toThrow();
  });

  it("validates memberPatchSchema", () => {
    expect(memberPatchSchema.parse({ status: "ACTIVE", monthlyPledge: 500 })).toMatchObject({
      status: "ACTIVE",
      monthlyPledge: 500,
    });
    expect(() => memberPatchSchema.parse({ monthlyPledge: -50 })).toThrow();
  });

  it("validates expenseSchema", () => {
    const valid = {
      category: "UTILITIES" as const,
      description: "Electricity bill for mosque",
      amount: 4500,
      spentAt: "2026-10-01T12:00:00Z",
    };
    expect(expenseSchema.parse(valid)).toMatchObject(valid);
    expect(() => expenseSchema.parse({ ...valid, amount: 0 })).toThrow();
    expect(() => expenseSchema.parse({ ...valid, spentAt: "not-a-date" })).toThrow();
  });

  it("validates decisionSchema", () => {
    expect(decisionSchema.parse({ decision: "APPROVE" })).toEqual({ decision: "APPROVE" });
    expect(decisionSchema.parse({ decision: "REJECT", reason: "Budget exceeded" })).toEqual({
      decision: "REJECT",
      reason: "Budget exceeded",
    });
  });

  it("validates mosqueCreateSchema", () => {
    const valid = {
      mosqueName: "Baitun Noor Jame Masjid",
      mosqueSlug: "baitun-noor",
      name: "Haji Rafiq",
      loginId: "president1",
      password: "strongpassword123",
    };
    expect(mosqueCreateSchema.parse(valid)).toMatchObject(valid);
    expect(() => mosqueCreateSchema.parse({ ...valid, mosqueSlug: "Baitun Noor!" })).toThrow();
  });

  it("validates roleCreateSchema", () => {
    expect(
      roleCreateSchema.parse({
        name: "Accountant",
        permissions: ["finance.view_all", "payments.record"],
      }),
    ).toBeDefined();

    expect(() =>
      roleCreateSchema.parse({
        name: "Bad",
        permissions: ["non_existent_perm" as any],
      }),
    ).toThrow();
  });

  it("validates settingsSchema and fundCreateSchema", () => {
    expect(settingsSchema.parse({ showContributors: true, requireVerification: false })).toEqual({
      showContributors: true,
      requireVerification: false,
    });
    expect(fundCreateSchema.parse({ name: "Zakat Fund", restricted: true })).toEqual({
      name: "Zakat Fund",
      restricted: true,
    });
  });
});
