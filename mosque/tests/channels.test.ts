import { beforeEach, describe, expect, it } from "vitest";
import { clearChannels, deliver, memoryChannel, registerChannel } from "../src/services/channels";

const msg = { userId: "u1", mosqueId: "m1", kind: "APPROVAL_REQUEST", text: "hi" };
describe("notification channels", () => {
  beforeEach(clearChannels);
  it("delivers to every registered channel", async () => {
    const mem = memoryChannel();
    registerChannel(mem);
    expect(await deliver(msg)).toEqual({ ok: ["memory"], failed: [] });
    expect(mem.sink).toHaveLength(1);
  });
  it("a failing provider never throws and does not block others", async () => {
    registerChannel({ name: "bad", send: async () => { throw new Error("down"); } });
    const mem = memoryChannel();
    registerChannel(mem);
    expect(await deliver(msg)).toEqual({ ok: ["memory"], failed: ["bad"] });
  });
  it("no channels is a no-op", async () => {
    expect(await deliver(msg)).toEqual({ ok: [], failed: [] });
  });
});
