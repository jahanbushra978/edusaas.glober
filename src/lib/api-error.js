import { NextResponse } from "next/server";
import { logger } from "./logger";

export function apiError(error, options = {}) {
  const status = options.status || 500;
  const logLevel = options.logLevel || "error";
  const context = options.context || "API";

  if (logLevel === "error") {
    logger.api.error(`${context}: ${error instanceof Error ? error.message : error}`, { status });
  } else if (logLevel === "warn") {
    logger.api.warn(`${context}: ${error instanceof Error ? error.message : error}`, { status });
  }

  const isProd = process.env.NODE_ENV === "production";
  const message = isProd && status >= 500
    ? "An internal server error occurred."
    : error instanceof Error
      ? error.message
      : String(error);

  return NextResponse.json(
    { ok: false, message },
    { status },
  );
}

export function apiSuccess(data, options = {}) {
  return NextResponse.json(
    { ok: true, ...data },
    { status: options.status || 200, headers: options.headers || {} },
  );
}
