import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

describe("Permissions Policy Verification", () => {
  it("proxy.js allows microphone and camera for self origin", () => {
    const proxyContent = fs.readFileSync("proxy.js", "utf8");
    assert.ok(
      proxyContent.includes("microphone=(self)"),
      "proxy.js must allow microphone=(self)"
    );
    assert.ok(
      proxyContent.includes("camera=(self)"),
      "proxy.js must allow camera=(self)"
    );
    assert.equal(
      proxyContent.includes("microphone=()"),
      false,
      "proxy.js must not forbid microphone with microphone=()"
    );
  });

  it("next.config.mjs allows microphone and camera for self origin", () => {
    const nextConfigContent = fs.readFileSync("next.config.mjs", "utf8");
    assert.ok(
      nextConfigContent.includes("microphone=(self)"),
      "next.config.mjs must allow microphone=(self)"
    );
    assert.ok(
      nextConfigContent.includes("camera=(self)"),
      "next.config.mjs must allow camera=(self)"
    );
  });
});

