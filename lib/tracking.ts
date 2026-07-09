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
  posthog?: { capture: (e: string, p?: Props) => void };
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
