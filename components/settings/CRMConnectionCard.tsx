"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Status {
  configured: { salesforce: boolean; hubspot: boolean };
  connection: { provider: string; connected: boolean } | null;
}

export function CRMConnectionCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/integrations/crm");
    if (r.ok) setStatus(await r.json());
  }
  useEffect(() => { void load(); }, []);

  async function disconnect() {
    setBusy("d");
    await fetch("/api/integrations/crm", { method: "DELETE" }).catch(() => {});
    await load();
    setBusy(null);
  }

  const conn = status?.connection?.connected ? status.connection.provider : null;

  return (
    <Card>
      <CardHeader><CardTitle>CRM</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Push meeting summaries + action items to Salesforce or HubSpot. CLARIX only writes when you press push.
        </p>
        {conn ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-600" /> Connected to {conn === "SALESFORCE" ? "Salesforce" : "HubSpot"}
            </span>
            <Button variant="outline" size="sm" onClick={disconnect} disabled={busy === "d"}>
              {busy === "d" ? <Loader2 className="size-4 animate-spin" /> : "Disconnect"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { window.location.href = "/api/integrations/crm/salesforce/auth"; }} disabled={!status?.configured.salesforce}>
              {status?.configured.salesforce ? "Connect Salesforce" : "Salesforce not configured"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { window.location.href = "/api/integrations/crm/hubspot/auth"; }} disabled={!status?.configured.hubspot}>
              {status?.configured.hubspot ? "Connect HubSpot" : "HubSpot not configured"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
