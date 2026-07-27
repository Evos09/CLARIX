interface TauriNotification {
  sendNotification?: (opts: { title: string; body: string }) => void;
}
interface TauriGlobal {
  notification?: TauriNotification;
  core?: { invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> };
}

const tauri = (): TauriGlobal | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__;

/** True when the web app is running inside the CLARIX Tauri desktop shell. */
export const isDesktop = (): boolean =>
  typeof window !== "undefined" && "__TAURI__" in window;

/** Fires a native OS notification when running in the desktop app; no-op on web. */
export function notifyMeetingReady(title: string): void {
  if (!isDesktop()) return;
  tauri()?.notification?.sendNotification?.({
    title: "CLARIX",
    body: `${title} is ready to view in CLARIX.`,
  });
}

/**
 * Hand a short-lived bearer token to the native (Rust) layer so it can upload
 * natively-captured system audio via the same API the web app uses. The native
 * `store_bearer_token` command is part of Tier B; until it exists this is a
 * safe no-op, and it is always a no-op in a normal browser.
 */
export async function sendTokenToDesktop(token: string): Promise<void> {
  const invoke = tauri()?.core?.invoke;
  if (!invoke) return;
  try {
    await invoke("store_bearer_token", { token });
  } catch {
    // Older shell without the command, or IPC not permitted for this origin.
  }
}
