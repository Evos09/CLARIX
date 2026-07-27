"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { isDesktop, sendTokenToDesktop } from "@/lib/desktop";

/**
 * Token bridge for the CLARIX desktop shell (Tier B).
 *
 * When the web app runs inside the Tauri desktop app AND the user is signed in,
 * this pushes a fresh bearer token to the native layer so it can upload
 * natively-captured system audio through the same API the web app uses.
 *
 * Renders nothing. It is a complete no-op in a normal browser (guarded by
 * `isDesktop()`), so it is safe to mount app-wide.
 *
 * NOT YET MOUNTED: the native `store_bearer_token` command it targets lands with
 * Tier B (native system-audio capture). Mount this in the dashboard layout once
 * that command + its capability exist.
 */
export function DesktopBridge() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isDesktop() || !isSignedIn) return;
    let cancelled = false;

    const push = async () => {
      // Reuse the longer-lived extension JWT template so the token lasts ~1h.
      const token = await getToken({ template: "clarix-extension" }).catch(() => null);
      if (!cancelled && token) await sendTokenToDesktop(token);
    };

    push();
    // Refresh comfortably within the 1h token lifetime.
    const id = setInterval(push, 50 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isSignedIn, getToken]);

  return null;
}
