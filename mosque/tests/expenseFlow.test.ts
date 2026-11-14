import { describe, expect, it } from "vitest";
import { canTransition, DEFAULT_REMINDER_STEPS, TRANSITIONS } from "../src/lib/expenseFlow";

describe("expense status transitions", () => {
  it("allows the normal path", () => {
    expect(canTransition("PENDING_APPROVAL", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "PAID")).toBe(true);
  });
  it("never allows skipping approval or leaving a terminal status", () => {
    expect(canTransition("PENDING_APPROVAL", "PAID")).toBe(false);
    expect(canTransition("DRAFT", "PAID")).toBe(false);
    for (const s of ["REJECTED", "CANCELLED", "REVERSED"] as const) expect(TRANSITIONS[s]).toEqual([]);
  });
  it("has no automatic approval step in the reminder schedule", () => {
    expect(DEFAULT_REMINDER_STEPS.every((s) => !/APPROVED/.test(s.kind))).toBe(true);
    expect(DEFAULT_REMINDER_STEPS.map((s) => s.afterMinutes)).toEqual([0, 120, 360, 1440, 2880]);
  });
});
