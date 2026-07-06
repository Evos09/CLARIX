/**
 * Server-side funnel events (PostHog REST capture). Client-side tracking lives
 * in lib/tracking.ts; this covers steps that happen off the browser (meeting
 * processing, Stripe webhooks). Dormant until NEXT_PUBLIC_POSTHOG_KEY is set.
 *
 * PII rule: only event names, pseudonymous ids (user/org cuid), and coarse
 * props (plan, meetingType, error *name*) — never titles or transcript text.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function captureServer(
  event: string,
  distinctId: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!KEY) return;
  // Fire-and-forget: analytics must never slow down or break the pipeline.
  fetch(`${HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: KEY, event, distinct_id: distinctId, properties }),
  }).catch(() => {});
}
