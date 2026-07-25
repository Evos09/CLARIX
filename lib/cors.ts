import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS for the JSON API so non-web clients (Chrome extension, Tauri desktop)
 * can call it cross-origin. Those clients authenticate with an
 * `Authorization: Bearer <Clerk session token>` header — never cookies — so
 * reflecting the request Origin is safe: every /api call is still gated by
 * Clerk auth regardless of Origin, and no credentials ride on these requests.
 */
const CORS_METHODS = "GET, POST, PATCH, DELETE, OPTIONS";
const CORS_HEADERS = "Authorization, Content-Type";

function allowedOrigin(req: NextRequest): string {
  // Reflect the caller's Origin (extension/desktop origins are not known ahead
  // of time); fall back to "*" for origin-less clients.
  return req.headers.get("origin") ?? "*";
}

/** 204 response for an OPTIONS preflight, carrying the CORS headers. */
export function corsPreflight(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin(req),
      "Access-Control-Allow-Methods": CORS_METHODS,
      "Access-Control-Allow-Headers": CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

/** Attaches CORS headers to an API response (simple/non-preflight requests). */
export function applyCors(res: NextResponse, req: NextRequest): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin(req));
  res.headers.set("Access-Control-Allow-Methods", CORS_METHODS);
  res.headers.set("Access-Control-Allow-Headers", CORS_HEADERS);
  res.headers.set("Vary", "Origin");
  return res;
}
