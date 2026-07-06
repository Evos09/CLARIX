/**
 * IP-based anti-abuse rate limiting for expensive API routes (transcription,
 * Claude processing, meeting bots). This is a ceiling on top of the per-plan
 * business limits in lib/plan.ts — it exists to stop scripted multi-account
 * abuse, not to meter normal usage.
 *
 * Implementation: in-memory sliding window. CLARIX runs as a single long-lived
 * Node process on Railway (`next start`), so process memory is a correct shared
 * store. If the app ever scales to multiple instances or serverless, swap the
 * internals for @upstash/ratelimit + Redis — the `limit(key)` interface below
 * matches Upstash's shape so call sites won't change.
 */

interface LimitResult {
  success: boolean;
  remaining: number;
}

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(windowMs: number) {
  // Occasionally drop empty/expired buckets so the map can't grow unbounded.
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => now - t < windowMs);
    if (alive.length === 0) buckets.delete(key);
    else buckets.set(key, alive);
  }
}

export function createLimiter(max: number, windowMs: number, prefix: string) {
  return {
    limit(key: string): LimitResult {
      sweep(windowMs);
      const now = Date.now();
      const id = `${prefix}:${key}`;
      const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
      if (hits.length >= max) {
        buckets.set(id, hits);
        return { success: false, remaining: 0 };
      }
      hits.push(now);
      buckets.set(id, hits);
      return { success: true, remaining: max - hits.length };
    },
  };
}

const HOUR = 60 * 60 * 1000;

/** Meeting creation (upload/link) — generous vs the Free plan's 10/month. */
export const meetingLimiter = createLimiter(20, HOUR, "meeting");
/** Signed-upload URL minting. */
export const uploadLimiter = createLimiter(30, HOUR, "upload");
/** Bot joins — each one costs real MeetingBaas + transcription money. */
export const botLimiter = createLimiter(10, HOUR, "bot");
/** Ask CLARIX chat messages — each is a Claude call. */
export const chatLimiter = createLimiter(60, HOUR, "chat");

/** Best-effort client IP (Railway sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 body shared by the guarded routes. */
export const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";
