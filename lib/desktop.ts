interface TauriNotification {
  sendNotification?: (opts: { title: string; body: string }) => void;
}
interface TauriGlobal {
  notification?: TauriNotification;
}

/** True when the web app is running inside the CLARIX Tauri desktop shell. */
export const isDesktop = (): boolean =>
  typeof window !== "undefined" && "__TAURI__" in window;

/** Fires a native OS notification when running in the desktop app; no-op on web. */
export function notifyMeetingReady(title: string): void {
  if (!isDesktop()) return;
  const t = (window as unknown as { __TAURI__?: TauriGlobal }).__TAURI__;
  t?.notification?.sendNotification?.({ title: "CLARIX", body: `${title} is ready to view in CLARIX.` });
}
