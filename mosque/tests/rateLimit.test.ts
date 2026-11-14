import { describe, expect, it } from "vitest";
import { rateLimit } from "../src/lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-allow-${Date.now()}`;
    expect(() => rateLimit(key, 3, 1000)).not.toThrow();
    expect(() => rateLimit(key, 3, 1000)).not.toThrow();
    expect(() => rateLimit(key, 3, 1000)).not.toThrow();
  });

  it("throws 429 when limit is exceeded", () => {
    const key = `test-exceed-${Date.now()}`;
    rateLimit(key, 2, 1000);
    rateLimit(key, 2, 1000);
    expect(() => rateLimit(key, 2, 1000)).toThrowError();
  });
});
