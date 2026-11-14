import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/db", () => ({
  db: {},
}));

import { AuthCtx, canViewContributors, toMe } from "../src/lib/auth";

describe("auth helpers", () => {
  const baseCtx = (perms: string[], showContributors = false): AuthCtx => ({
    user: { id: "u1", name: "Ahmed" },
    membership: { id: "m1", status: "ACTIVE" },
    role: { key: "member", name: "Member" },
    mosque: {
      id: "mosque1",
      slug: "baitun-noor",
      name: "Baitun Noor",
      currency: "BDT",
      timezone: "Asia/Dhaka",
      startMonth: "2026-01",
      showContributors,
    },
    perms: new Set(perms),
  });

  it("canViewContributors respects showContributors flag", () => {
    const ordinary = baseCtx([], false);
    expect(canViewContributors(ordinary)).toBe(false);

    const mosqueOptIn = baseCtx([], true);
    expect(canViewContributors(mosqueOptIn)).toBe(true);
  });

  it("canViewContributors allows finance and member management permissions", () => {
    const finance = baseCtx(["finance.view_all"], false);
    expect(canViewContributors(finance)).toBe(true);

    const memberView = baseCtx(["members.view"], false);
    expect(canViewContributors(memberView)).toBe(true);

    const memberManage = baseCtx(["members.manage"], false);
    expect(canViewContributors(memberManage)).toBe(true);
  });

  it("toMe serializes context correctly", () => {
    const ctx = baseCtx(["members.view"], false);
    const me = toMe(ctx);
    expect(me.user.name).toBe("Ahmed");
    expect(me.canViewContributors).toBe(true);
    expect(me.status).toBe("ACTIVE");
  });

  it("toMe marks canViewContributors false if membership is not ACTIVE", () => {
    const ctx = baseCtx(["members.view"], false);
    ctx.membership.status = "PENDING";
    const me = toMe(ctx);
    expect(me.canViewContributors).toBe(false);
  });
});
