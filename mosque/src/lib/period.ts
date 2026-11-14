export const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isPeriod(p: string): boolean {
  return PERIOD_RE.test(p);
}

/** The YYYY-MM of an instant, as seen in the mosque's time zone. */
export function periodOf(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

export function nextPeriod(p: string): string {
  const [y = 1970, m = 1] = p.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** Inclusive list of periods; empty when from > to. */
export function periodsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let p = from; p <= to && out.length < 600; p = nextPeriod(p)) out.push(p);
  return out;
}

export const maxPeriod = (a: string, b: string) => (a > b ? a : b);
export const minPeriod = (a: string, b: string) => (a < b ? a : b);

export type MonthStatus = "PAID" | "PARTIAL" | "UNPAID";

export function monthStatus(due: number, paid: number): MonthStatus {
  if (paid >= due) return "PAID";
  return paid > 0 ? "PARTIAL" : "UNPAID";
}
