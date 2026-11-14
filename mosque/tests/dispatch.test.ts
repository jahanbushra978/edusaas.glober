import { beforeEach, describe, expect, it } from "vitest";
import { clearChannels, memoryChannel, registerChannel } from "../src/services/channels";
import { dispatch } from "../src/services/dispatch";
import { channelText, notificationText } from "../src/lib/notificationText";

const data = { voucherNo: "EXP-0007", category: "electricity", amount: 2500, mosque: "Baitun Noor", hoursPending: 6 };

describe("notificationText", () => {
  it("renders the same templates as the in-app list, in both languages", () => {
    const en = notificationText("APPROVAL_REQUEST", data, "en");
    expect(en).toContain("Baitun Noor");
    expect(en).toContain("EXP-0007");
    expect(en).toContain("৳2,500");
    const bn = notificationText("APPROVAL_REQUEST", data, "bn");
    expect(bn).toContain("EXP-0007");
    expect(bn).toContain("২,৫০০");
    expect(bn).not.toBe(en);
  });
  it("fills the hours of a reminder", () => {
    expect(notificationText("APPROVAL_REMINDER", data, "en")).toContain("6h");
  });
  it("an unknown kind falls back to the kind, never to empty text", () => {
    expect(notificationText("SOMETHING_NEW", data, "en")).toBe("SOMETHING_NEW");
  });
  it("uses the mosque's currency", () => {
    expect(notificationText("EXPENSE_PAID", data, "en", "USD")).toContain("USD 2,500");
  });
  it("channel text carries Bengali and English together", () => {
    const t = channelText("EXPENSE_PAID", data);
    expect(t.split("\n")).toHaveLength(2);
    expect(t).toContain("paid");
  });
});

describe("dispatch (SMS / email / push after commit)", () => {
  beforeEach(clearChannels);
  const n = { kind: "APPROVAL_REQUEST", data, link: "/expenses/e1" };

  it("sends one message per recipient, tagged with the mosque it came from", async () => {
    const mem = memoryChannel();
    registerChannel(mem);
    await dispatch("mosque-A", ["u1", "u2"], n);
    expect(mem.sink.map((m) => m.userId).sort()).toEqual(["u1", "u2"]);
    expect(mem.sink.every((m) => m.mosqueId === "mosque-A" && m.kind === "APPROVAL_REQUEST" && m.link === "/expenses/e1")).toBe(true);
  });
  it("never sends to anyone it was not given (no recipients = nothing sent)", async () => {
    const mem = memoryChannel();
    registerChannel(mem);
    await dispatch("mosque-A", [], n);
    expect(mem.sink).toHaveLength(0);
  });
  it("a recipient listed twice gets one message", async () => {
    const mem = memoryChannel();
    registerChannel(mem);
    await dispatch("mosque-A", ["u1", "u1"], n);
    expect(mem.sink).toHaveLength(1);
  });
  it("a failing provider never throws and does not stop the others", async () => {
    registerChannel({ name: "down", send: async () => { throw new Error("provider down"); } });
    const mem = memoryChannel();
    registerChannel(mem);
    await expect(dispatch("mosque-A", ["u1"], n)).resolves.toBeUndefined();
    expect(mem.sink).toHaveLength(1);
  });
  it("with no provider registered it is a harmless no-op", async () => {
    await expect(dispatch("mosque-A", ["u1"], n)).resolves.toBeUndefined();
  });
  it("omits `link` instead of sending undefined", async () => {
    const mem = memoryChannel();
    registerChannel(mem);
    await dispatch("mosque-A", ["u1"], { kind: "EXPENSE_PAID", data });
    expect("link" in mem.sink[0]!).toBe(false);
  });
});
