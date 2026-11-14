/** Opaque keyset cursor for (name, id) ordering. */
export type Cursor = { n: string; i: string };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c)).toString("base64url");
}

export function decodeCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof v?.n === "string" && typeof v?.i === "string") return { n: v.n, i: v.i };
  } catch {
    /* fall through */
  }
  return null;
}
