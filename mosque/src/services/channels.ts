/**
 * Delivery channels beyond the in-app bell (SMS, email, push).
 * No provider is chosen yet: register one with `registerChannel` once an account exists.
 * `deliver` never throws — a failing provider must not break the request that triggered it.
 */
export type ChannelMessage = { userId: string; mosqueId: string; kind: string; text: string; link?: string };
export interface NotificationChannel {
  name: string;
  send(msg: ChannelMessage): Promise<void>;
}

const channels = new Map<string, NotificationChannel>();
export const registerChannel = (c: NotificationChannel) => void channels.set(c.name, c);
export const clearChannels = () => channels.clear();

/** Mock provider for development/tests: records instead of sending. */
export function memoryChannel(sink: ChannelMessage[] = []): NotificationChannel & { sink: ChannelMessage[] } {
  return { name: "memory", sink, async send(m) { sink.push(m); } };
}

export async function deliver(msg: ChannelMessage): Promise<{ ok: string[]; failed: string[] }> {
  const ok: string[] = [];
  const failed: string[] = [];
  for (const c of channels.values()) {
    try {
      await c.send(msg);
      ok.push(c.name);
    } catch {
      failed.push(c.name);
    }
  }
  return { ok, failed };
}
