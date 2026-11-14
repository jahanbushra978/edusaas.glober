import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./errors";

type Handler<C> = (req: NextRequest, ctx: C) => Promise<unknown>;

/** Wraps a route handler: JSON-only writes (CSRF guard), uniform errors, structured logs. */
export function route<C = unknown>(fn: Handler<C>) {
  return async (req: NextRequest, ctx: C) => {
    try {
      if (!["GET", "HEAD"].includes(req.method) && !req.headers.get("content-type")?.includes("application/json")) {
        throw new HttpError(415, "JSON_REQUIRED");
      }
      return NextResponse.json(await fn(req, ctx));
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.code }, { status: e.status });
      if (e instanceof ZodError) {
        return NextResponse.json({ error: "INVALID_INPUT", fields: e.flatten().fieldErrors }, { status: 400 });
      }
      console.error(JSON.stringify({ level: "error", route: req.nextUrl.pathname, msg: String((e as Error)?.message) }));
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }
  };
}

export async function jsonBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
}
