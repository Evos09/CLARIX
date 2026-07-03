"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Status {
  googleConfigured: boolean;
  email: { provider: string; email: string; connected: boolean } | null;
  calendar: { provider: string; calDavUser: string | null; connected: boolean; syncedAt: string | null } | null;
}

export function IntegrationsClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
    try { await fn(); } finally { setBusy(null); }
  }

  const google = status?.email?.provider === "GMAIL" && status.email.connected;

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
          <p className="mt-3 text-xs text-muted-foreground">CLARIX only reads your calendar. It never creates, edits, or deletes events.</p>
        </CardContent>
      </Card>
    </div>
  );
}
