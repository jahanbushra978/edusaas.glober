import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "mosque_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to 32+ characters");
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string, mosqueId: string) {
  const token = await new SignJWT({ mid: mosqueId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export async function readSession(): Promise<{ userId: string; mosqueId: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub === "string" && typeof payload.mid === "string") {
      return { userId: payload.sub, mosqueId: payload.mid };
    }
  } catch {
    /* invalid or expired */
  }
  return null;
}
