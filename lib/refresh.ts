/**
 * Shared guard for background `router.refresh()` calls.
 *
 * A refresh re-runs the server component and swaps in fresh data. That is
 * usually invisible, but it will clobber a half-typed field or yank the ground
 * out from under an open dialog, so anything that revalidates on its own has to
 * agree on when it's rude to do it. Both the interval-based refresher on shared
 * meetings and the focus-based one on the dashboard call this.
 */
export function isSafeToRefresh(): boolean {
  if (typeof document === "undefined") return false;

  // Nothing worth updating if the user isn't looking at it.
  if (document.visibilityState !== "visible") return false;

  const el = document.activeElement as HTMLElement | null;
  const isEditing =
    !!el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.tagName === "SELECT" ||
      el.isContentEditable);
  if (isEditing) return false;

  // Any of our overlays/dialogs open → someone is mid-action; don't yank data.
  if (document.querySelector('[role="dialog"], .fixed.inset-0.z-50')) return false;

  return true;
}
