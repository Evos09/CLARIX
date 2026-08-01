"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Dashboard header button that summons the desktop app's floating glass
 * overlay window. It renders only inside the Tauri shell — on the web there is
 * no second window to show, so browser visitors never see a dead control.
 */
export function GlassModeButton() {
  const [isDesktop, setIsDesktop] = useState(false);

  // Detected after mount so server and first client render match.
  useEffect(() => {
    setIsDesktop(typeof window !== "undefined" && Boolean((window as { __TAURI__?: unknown }).__TAURI__));
  }, []);

  if (!isDesktop) return null;

  async function enterGlassMode() {
    try {
      // Lazily imported so the Tauri bundle never ships to browser users.
      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      const overlay = await WebviewWindow.getByLabel("overlay");
      if (!overlay) return;
      await overlay.show();
      await overlay.setFocus();
    } catch {
      // Not running in the desktop shell, or the overlay window is gone.
    }
  }

  return (
    <button
      onClick={enterGlassMode}
      className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent/20 sm:self-auto"
    >
      <Sparkles className="size-4" /> Enter Glass Mode
    </button>
  );
}
