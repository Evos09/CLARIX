"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Status {
  configured: { slack: boolean; notion: boolean; linear: boolean };
  slack: { teamName: string; connected: boolean } | null;
  notion: { workspaceName: string; connected: boolean } | null;
  linear: { organizationName: string; connected: boolean } | null;
}

const PROVIDERS = [
  { key: "slack", label: "Slack", desc: "Post summaries + action items to a channel" },
  { key: "notion", label: "Notion", desc: "Save meeting notes as a Notion page" },
  { key: "linear", label: "Linear", desc: "Create issues from action items" },
] as const;

export function IntegrationsHub() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/integrations/push");
    if (r.ok) setStatus(await r.json());
  }
  useEffect(() => { void load(); }, []);

  function connected(key: string): string | null {
    if (!status) return null;
    if (key === "slack") return status.slack?.connected ? status.slack.teamName : null;
    if (key === "notion") return status.notion?.connected ? status.notion.workspaceName : null;
    if (key === "linear") return status.linear?.connected ? status.linear.organizationName : null;
    return null;
  }

  async function disconnect(key: string) {
    setBusy(key);
    await fetch(`/api/integrations/push?platform=${key}`, { method: "DELETE" }).catch(() => {});
    await load();
    setBusy(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PROVIDERS.map((p) => {
        const conn = connected(p.key);
        const isConfigured = status?.configured[p.key];
        return (
          <Card key={p.key}>
            <CardHeader><CardTitle>{p.label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              {conn ? (
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-green-600" /> {conn}</span>
                  <Button variant="outline" size="sm" onClick={() => disconnect(p.key)} disabled={busy === p.key}>
                    {busy === p.key ? <Loader2 className="size-4 animate-spin" /> : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { window.location.href = `/api/integrations/${p.key}/auth`; }} disabled={!isConfigured}>
                  {isConfigured ? `Connect ${p.label}` : "Not configured"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
