/**
 * Client-side conversion tracking (marketing analytics).
 * Fires to Meta Pixel and PostHog when their NEXT_PUBLIC_* keys are configured;
 * silently no-ops otherwise — same dormant pattern as the integration connectors.
 * (Not to be confused with lib/analytics.ts, the meeting-analytics engine.)
 */

/** Meta standard events get `fbq("track")`; anything else goes to `trackCustom`. */
const META_STANDARD_EVENTS = new Set([
  "PageView",
  "CompleteRegistration",
  "InitiateCheckout",
  "Subscribe",
  "Purchase",
  "StartTrial",
  "Lead",
  "Contact",
]);

type Props = Record<string, string | number | boolean | undefined>;

type TrackingWindow = {
  posthog?: {
    capture: (e: string, p?: Props) => void;
    identify?: (distinctId: string, props?: Props) => void;
    get_distinct_id?: () => string;
  };
  fbq?: (...args: unknown[]) => void;
};

export function track(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const w = window as unknown as TrackingWindow;
  try {
    w.posthog?.capture(event, props);
  } catch {
    /* never break the app for analytics */
  }
  try {
    if (w.fbq) {
      if (META_STANDARD_EVENTS.has(event)) w.fbq("track", event, props);
      else w.fbq("trackCustom", event, props);
    }
  } catch {
    /* ignore */
  }
}

/** Pageview in each provider's native format. */
export function trackPageview() {
  if (typeof window === "undefined") return;
  const w = window as unknown as TrackingWindow;
  try {
    w.posthog?.capture("$pageview");
  } catch {
    /* ignore */
  }
  try {
    w.fbq?.("track", "PageView");
  } catch {
    /* ignore */
  }
}

/**
 * Bind this browser to the signed-in user.
 *
 * Without it the funnel breaks in half. Client events (pageviews, signup) are
 * attributed to PostHog's anonymous device id, while server events — including
 * `first_meeting_processed`, the only true activation signal — are sent with
 * the internal User cuid as their distinct id. To PostHog those are two
 * unrelated people, so "of the visitors who landed, how many activated?" is
 * unanswerable. Calling identify with the same cuid the server uses merges the
 * anonymous history into that user.
 *
 * Pass only coarse, non-identifying properties (plan tier) — see the PII rule
 * in lib/tracking-server.ts.
 */
export function identify(distinctId: string, props?: Props) {
  if (typeof window === "undefined" || !distinctId) return;
  const w = window as unknown as TrackingWindow;
  try {
    if (w.posthog?.get_distinct_id?.() === distinctId) return; // already bound
    w.posthog?.identify?.(distinctId, props);
  } catch {
    /* never break the app for analytics */
  }
}

/** Fire an event at most once per browser session (dedupes conversions on re-renders/reloads). */
export function trackOncePerSession(key: string, event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const storageKey = "clarix_evt_" + key;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* storage blocked — fire anyway rather than lose the conversion */
  }
  track(event, props);
}
