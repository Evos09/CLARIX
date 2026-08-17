"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isSafeToRefresh } from "@/lib/refresh";

/**
 * Keeps a shared meeting live without a manual reload: every `intervalMs` it
 * calls router.refresh(), which re-runs the server component and streams in
 * fresh data (a collaborator's edits) while preserving client state like the
 * active tab and scroll position.
 *
 * Skipping a refresh mid-edit, mid-dialog, or while the tab is backgrounded is
 * shared with the dashboard's focus refresher — see isSafeToRefresh.
 *
 * This covers changes that arrive while you are watching (a collaborator's
 * edit, a meeting finishing processing). RevalidateOnFocus covers the other
 * case: a window you came back to after leaving it open.
 */
export function MeetingLiveRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (!isSafeToRefresh()) return;
      router.refresh();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
