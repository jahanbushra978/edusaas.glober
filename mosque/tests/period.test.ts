import { describe, expect, it } from "vitest";
import { isPeriod, monthStatus, nextPeriod, periodOf, periodsBetween } from "../src/lib/period";
import { decodeCursor, encodeCursor } from "../src/lib/cursor";

describe("periods", () => {
  it("validates format", () => {
    expect(isPeriod("2026-10")).toBe(true);
    expect(isPeriod("2026-13")).toBe(false);
    expect(isPeriod("26-10")).toBe(false);
  });
  it("rolls over the year", () => expect(nextPeriod("2026-12")).toBe("2027-01"));
  it("lists inclusive ranges", () => {
    expect(periodsBetween("2026-11", "2027-02")).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
    expect(periodsBetween("2026-05", "2026-04")).toEqual([]);
  });
  it("uses the mosque time zone for the month boundary", () => {
    const d = new Date("2026-09-30T20:00:00Z"); // already 1 Oct in Dhaka (UTC+6)
    expect(periodOf(d, "Asia/Dhaka")).toBe("2026-10");
    expect(periodOf(d, "UTC")).toBe("2026-09");
  });
});

describe("monthStatus", () => {
  it("classifies", () => {
    expect(monthStatus(500, 500)).toBe("PAID");
    expect(monthStatus(500, 700)).toBe("PAID");
    expect(monthStatus(500, 200)).toBe("PARTIAL");
    expect(monthStatus(500, 0)).toBe("UNPAID");
  });
});

describe("cursor", () => {
  it("round-trips and rejects junk", () => {
    expect(decodeCursor(encodeCursor({ n: "Karim", i: "abc" }))).toEqual({ n: "Karim", i: "abc" });
    expect(decodeCursor("not-base64-json")).toBeNull();
    expect(decodeCursor(null)).toBeNull();
  });
});
