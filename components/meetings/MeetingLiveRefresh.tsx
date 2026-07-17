"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps a shared meeting live without a manual reload: every `intervalMs` it
 * calls router.refresh(), which re-runs the server component and streams in
 * fresh data (a collaborator's edits) while preserving client state like the
 * active tab and scroll position.
 *
 * It deliberately skips a refresh when the user is mid-edit — a text field is
 * focused, or a modal/dialog is open — because a server refresh would clobber
 * an in-progress edit. It also pauses while the tab is in the background.
 * Rendered only for shared meetings (see the meeting detail page).
 */
export function MeetingLiveRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;

      const el = document.activeElement as HTMLElement | null;
      const isEditing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (isEditing) return;

      // Any of our overlays/dialogs open → someone is acting; don't yank data.
      const modalOpen = !!document.querySelector('[role="dialog"], .fixed.inset-0.z-50');
      if (modalOpen) return;

      router.refresh();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
