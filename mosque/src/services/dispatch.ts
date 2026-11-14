import { channelText, NotifData } from "../lib/notificationText";
import { deliver } from "./channels";

/**
 * Sends an already-created notification through the registered SMS/email/push channels.
 * Call it AFTER the database transaction has committed, so a rolled-back request never sends
 * a message. It never throws (a failing provider must not break the request) and with no
 * channel registered it does nothing. The in-app row is still created by `notify`.
 */
export async function dispatch(
  mosqueId: string,
  userIds: string[],
  n: { kind: string; data: NotifData; link?: string },
  currency = "BDT",
): Promise<void> {
  if (!userIds.length) return;
  try {
    const text = channelText(n.kind, n.data, currency);
    await Promise.allSettled(
      [...new Set(userIds)].map((userId) => deliver({ userId, mosqueId, kind: n.kind, text, ...(n.link ? { link: n.link } : {}) })),
    );
  } catch {
    /* best effort */
  }
}
