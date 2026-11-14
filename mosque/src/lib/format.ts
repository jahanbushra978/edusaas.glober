import type { Lang } from "./i18n";

const loc = (l: Lang) => (l === "bn" ? "bn-BD" : "en-US");

export const num = (n: number, l: Lang) => Math.round(n).toLocaleString(loc(l));

export function money(n: number, l: Lang, currency = "BDT") {
  const sym = currency === "BDT" ? "৳" : currency + " ";
  return `${n < 0 ? "−" : ""}${sym}${num(Math.abs(n), l)}`;
}

export function periodLabel(p: string, l: Lang, style: "long" | "short" = "long") {
  const [y, m] = p.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, 1)).toLocaleDateString(loc(l), {
    month: style,
    year: style === "long" ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

export const dateLabel = (iso: string, l: Lang) =>
  new Date(iso).toLocaleDateString(loc(l), { day: "numeric", month: "short", year: "numeric" });

/** Fills {name} placeholders in a translated template. */
export const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
