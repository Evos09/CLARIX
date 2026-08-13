"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";

/**
 * "Update available — restart to update", shown in the sidebar above the plan
 * card. Desktop app only; renders nothing in a browser.
 *
 * Why this exists: the Rust side installs updates automatically on launch, but
 * the periodic (6-hourly) check only fires a native notification. Leave CLARIX
 * running for a few days and it would tell you once that an update existed and
 * then offer no way to act on it — no button, no tray item. This is that way.
 *
 * It talks to the updater over `window.__TAURI__`, the same global bridge
 * lib/desktop.ts already uses for notifications, rather than the npm plugin
 * package. That matters: it means this works against the 1.0.5 binary people
 * already have installed, instead of needing the very update it advertises.
 *
 * Every failure path renders nothing. A banner that cannot actually update you
 * is worse than no banner, and this sits next to billing information where a
 * stray error would be alarming.
 */

type TauriUpdate = {
  version: string;
  downloadAndInstall: () => Promise<void>;
};

type UpdaterBridge = {
  updater?: { check?: () => Promise<TauriUpdate | null> };
  process?: { relaunch?: () => Promise<void> };
};

function bridge(): UpdaterBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __TAURI__?: UpdaterBridge }).__TAURI__;
}

type Phase = "hidden" | "available" | "installing" | "needs-restart" | "failed";

export function DesktopUpdateBanner() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const check = bridge()?.updater?.check;
        if (!check) return; // browser, or a shell without the updater
        const update = await check();
        if (!cancelled && update?.version) {
          setVersion(update.version);
          setPhase("available");
        }
      } catch {
        // Offline, feed unreachable, or IPC not permitted — stay silent.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function install() {
    setPhase("installing");
    try {
      const update = await bridge()?.updater?.check?.();
      if (!update) {
        setPhase("hidden");
        return;
      }
      await update.downloadAndInstall();
      // Relaunching needs the process plugin, which this build may not grant.
      // Either way the update is installed, so tell the user how to finish it
      // by hand rather than leaving the button looking stuck.
      try {
        await bridge()?.process?.relaunch?.();
      } catch {
        // Falls through to the same message; the relaunch was best-effort.
      }
      setPhase("needs-restart");
    } catch {
      setPhase("failed");
    }
  }

  if (phase === "hidden") return null;

  return (
    <div className="mb-2 rounded-lg border border-accent/30 bg-accent/[0.06] p-3">
      {phase === "available" && (
        <>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
            <Download className="size-3.5 text-accent" />
            Update available{version ? ` — ${version}` : ""}
          </p>
          <button
            onClick={install}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-2 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-teal-600"
          >
            <RefreshCw className="size-3" /> Restart to update
          </button>
        </>
      )}

      {phase === "installing" && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin text-accent" /> Downloading update…
        </p>
      )}

      {phase === "needs-restart" && (
        <p className="text-[12px] text-foreground">
          Update installed. Quit CLARIX from the system tray and reopen it to finish.
        </p>
      )}

      {phase === "failed" && (
        <p className="text-[12px] text-muted-foreground">
          Couldn&rsquo;t install the update. You can download it again from the CLARIX website.
        </p>
      )}
    </div>
  );
}
