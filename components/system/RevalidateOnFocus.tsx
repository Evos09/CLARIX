"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSafeToRefresh } from "@/lib/refresh";

/**
 * Re-fetch the current dashboard page when the user comes back to it.
 *
 * Dashboard pages are force-dynamic, and Next's client cache already treats
 * dynamic segments as stale immediately, so *navigating* always got fresh data.
 * What nothing covered was a window left open and not navigated: the desktop
 * app in particular sits in the tray for hours, and the server components
 * rendered on load stayed on screen no matter what changed underneath — deleted
 * meetings still listed, counts hours out of date — until a manual reload.
 *
 * Refreshing on focus / tab-visible / back-online closes that gap. The throttle
 * stops a burst of refreshes while alt-tabbing, and isSafeToRefresh keeps it
 * from interrupting an edit or an open dialog.
 */
export function RevalidateOnFocus({ minIntervalMs = 15_000 }: { minIntervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Seed with mount time: the page has just rendered, so it isn't stale yet.
    let lastRefresh = Date.now();

    const maybeRefresh = () => {
      if (Date.now() - lastRefresh < minIntervalMs) return;
      if (!isSafeToRefresh()) return;
      lastRefresh = Date.now();
      router.refresh();
    };

    window.addEventListener("focus", maybeRefresh);
    document.addEventListener("visibilitychange", maybeRefresh);
    window.addEventListener("online", maybeRefresh);
    return () => {
      window.removeEventListener("focus", maybeRefresh);
      document.removeEventListener("visibilitychange", maybeRefresh);
      window.removeEventListener("online", maybeRefresh);
    };
  }, [router, minIntervalMs]);

  return null;
}
