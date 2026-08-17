"use client";

import { useEffect } from "react";
import { identify } from "@/lib/tracking";

const DONE_KEY = "clarix_identified";

/**
 * Binds the browser's anonymous PostHog id to the signed-in user, once per
 * session.
 *
 * This is what makes the acquisition funnel measurable end to end. Landing
 * pageviews and the signup conversion are captured client-side against an
 * anonymous device id; `first_meeting_processed` — activation — is captured
 * server-side in lib/processing.ts against the internal User cuid. Until those
 * are the same person in PostHog you can count visitors and you can count
 * activations, but you cannot connect one to the other, which is exactly the
 * question a launch needs answered.
 *
 * Mounted in the dashboard layout, so it only runs where someone is signed in
 * and /api/me will answer.
 */
export function IdentifyUser() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DONE_KEY)) return;
    } catch {
      /* storage blocked — fall through and identify anyway */
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const me = await res.json();
        const id: string | undefined = me?.user?.id;
        if (!id) return;
        // Plan tier only — never email or name. See the PII rule in
        // lib/tracking-server.ts.
        identify(id, { plan: me?.plan?.id ?? "unknown" });
        try {
          sessionStorage.setItem(DONE_KEY, "1");
        } catch {
          /* ignore */
        }
      } catch {
        /* analytics must never break the dashboard */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
