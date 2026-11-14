import { fill, money } from "./format";
import { DICT, Key, Lang } from "./i18n";

export type NotifData = Record<string, unknown>;

/** Renders one notification as plain text in `lang` (same templates as the in-app list). */
export function notificationText(kind: string, data: NotifData, lang: Lang, currency = "BDT"): string {
  const t = (k: string) => (DICT[lang][k as Key] as string | undefined) ?? "";
  const cat = String(data.category ?? "");
  return fill(t(`n_${kind}`) || kind, {
    mosque: String(data.mosque ?? ""),
    voucher: String(data.voucherNo ?? ""),
    category: (cat && t(cat)) || cat,
    amount: money(Number(data.amount ?? 0), lang, currency),
    hours: String(data.hoursPending ?? ""),
  });
}

/**
 * Text for SMS / email / push. A user's language is a browser setting today, so the server
 * does not know it: send Bengali and English together instead of guessing.
 */
export const channelText = (kind: string, data: NotifData, currency = "BDT") =>
  `${notificationText(kind, data, "bn", currency)}\n${notificationText(kind, data, "en", currency)}`;
