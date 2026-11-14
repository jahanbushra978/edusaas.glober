import { describe, expect, it } from "vitest";
import { dateLabel, fill, money, num, periodLabel } from "../src/lib/format";

describe("format helpers", () => {
  it("formats Bengali and English numbers", () => {
    expect(num(100, "en")).toBe("100");
    // In bn-BD locale, 100 formats as ১০০
    const bn100 = num(100, "bn");
    expect(bn100).toBe("১০০");
  });

  it("formats money with currency symbols", () => {
    expect(money(500, "en", "BDT")).toBe("৳500");
    expect(money(500, "bn", "BDT")).toBe("৳৫০০");
    expect(money(-250, "en", "BDT")).toBe("−৳250");
    expect(money(100, "en", "USD")).toBe("USD 100");
  });

  it("formats period labels correctly", () => {
    const enLabel = periodLabel("2026-10", "en", "long");
    expect(enLabel.toLowerCase()).toContain("october");
    expect(enLabel).toContain("2026");

    const shortLabel = periodLabel("2026-10", "en", "short");
    expect(shortLabel.toLowerCase()).toContain("oct");
  });

  it("fills template variables", () => {
    const tpl = "Hello {name}, your due is {amount}";
    expect(fill(tpl, { name: "Rafiq", amount: 500 })).toBe("Hello Rafiq, your due is 500");
  });

  it("formats dateLabel", () => {
    const d = new Date("2026-10-15T12:00:00Z").toISOString();
    const l = dateLabel(d, "en");
    expect(l).toBeDefined();
    expect(l.length).toBeGreaterThan(0);
  });
});
