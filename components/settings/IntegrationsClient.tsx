"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Loader2, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Status {
  googleConfigured: boolean;
  email: { provider: string; email: string; connected: boolean } | null;
  calendar: { provider: string; calDavUser: string | null; connected: boolean; syncedAt: string | null } | null;
}

export function IntegrationsClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [appleId, setAppleId] = useState("");
  const [appPass, setAppPass] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/integrations/status");
    if (r.ok) setStatus(await r.json());
  }
  useEffect(() => { void load(); }, []);

  function connectGoogle() {
    window.location.href = "/api/integrations/google/auth";
  }
  async function run(id: string, fn: () => Promise<void>) {
    setBusy(id);
    setError(null);
    try { await fn(); } finally { setBusy(null); }
  }

  const google = status?.email?.provider === "GMAIL" && status.email.connected;
  const apple = status?.calendar?.provider === "APPLE" && status.calendar.connected;
  const googleCal = status?.calendar?.provider === "GOOGLE" && status.calendar.connected;

  return (
    <div className="space-y-6">
      {status && !status.googleConfigured && (
        <p className="text-sm text-muted-foreground">
          Add <code className="font-mono">GOOGLE_CLIENT_ID</code> / <code className="font-mono">GOOGLE_CLIENT_SECRET</code> to enable Google.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="size-4" /> Gmail &amp; Google Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {google ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-green-600" /> Connected as {status?.email?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => run("g", async () => { await fetch("/api/integrations/google", { method: "DELETE" }); await load(); })} disabled={busy === "g"}>
                {busy === "g" ? <Loader2 className="size-4 animate-spin" /> : "Disconnect"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={connectGoogle} disabled={!status?.googleConfigured}>
              Connect Google
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="size-4" /> Apple Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {apple ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-green-600" /> Connected as {status?.calendar?.calDavUser}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => run("s", async () => { await fetch("/api/integrations/calendar/sync", { method: "POST" }); await load(); })} disabled={busy === "s"}>
                  <RefreshCw className={`size-4 ${busy === "s" ? "animate-spin" : ""}`} /> Sync
                </Button>
                <Button variant="outline" size="sm" onClick={() => run("dc", async () => { await fetch("/api/integrations/calendar", { method: "DELETE" }); await load(); })} disabled={busy === "dc"}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : googleCal ? (
            <p className="text-sm text-muted-foreground">Using your Google Calendar. Connect Apple below to switch.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Use an <a href="https://appleid.apple.com" target="_blank" rel="noreferrer" className="text-teal-600 underline">app-specific password</a> from your Apple ID.
              </p>
              <div className="flex flex-wrap gap-2">
                <Input placeholder="Apple ID email" value={appleId} onChange={(e) => setAppleId(e.target.value)} className="max-w-xs" />
                <Input placeholder="App-specific password" type="password" value={appPass} onChange={(e) => setAppPass(e.target.value)} className="max-w-xs" />
                <Button variant="accent" onClick={() => run("a", async () => {
                  const r = await fetch("/api/integrations/calendar/apple", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appleId, appPassword: appPass }) });
                  const d = await r.json();
                  if (!r.ok) setError(d.error ?? "Failed");
                  else { setAppleId(""); setAppPass(""); await load(); }
                })} disabled={busy === "a" || !appleId || !appPass}>
                  {busy === "a" ? <Loader2 className="size-4 animate-spin" /> : "Connect"}
                </Button>
              </div>
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">CLARIX only reads your calendar. It never creates, edits, or deletes events.</p>
        </CardContent>
      </Card>
    </div>
  );
}
