"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Bridge page for the CLARIX Chrome extension. When a signed-in user lands here,
 * we mint a Clerk session token and drop it into a hidden #clarix-ext-token node.
 * The extension's content script (content-connect.js) reads that node, stores the
 * token, and closes this tab. If a "clarix-extension" JWT template exists it is
 * used (longer-lived); otherwise we fall back to the default session token.
 */
export default function ExtensionConnectPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "connected" | "signed-out" | "error">("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setStatus("signed-out");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        let t = await getToken({ template: "clarix-extension" }).catch(() => null);
        if (!t) t = await getToken();
        if (cancelled) return;
        if (!t) return setStatus("error");
        setToken(t);
        setStatus("connected");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper text-ink px-6">
      {token && <div id="clarix-ext-token" data-token={token} style={{ display: "none" }} />}
      <div className="max-w-sm text-center space-y-4">
        {status === "loading" && <p className="text-muted-foreground">Connecting your CLARIX account…</p>}

        {status === "connected" && (
          <>
            <h1 className="text-xl font-bold">Extension connected ✓</h1>
            <p className="text-muted-foreground">
              You can close this tab and start recording from the CLARIX extension.
            </p>
          </>
        )}

        {status === "signed-out" && (
          <>
            <h1 className="text-xl font-bold">Sign in to connect</h1>
            <p className="text-muted-foreground">Sign in to link the CLARIX extension to your account.</p>
            <Link
              href="/sign-in?redirect_url=/extension/connect"
              className="inline-block rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white"
            >
              Sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <p className="text-red-600">Couldn&apos;t issue a token. Reload this page or sign in again.</p>
        )}
      </div>
    </main>
  );
}
