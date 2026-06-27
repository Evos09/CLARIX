"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Status {
  configured: { slack: boolean; notion: boolean; linear: boolean };
  slack: { teamName: string; connected: boolean; autoPostEnabled?: boolean; autoPostChannelId?: string | null } | null;
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

  const [slackAutoPost, setSlackAutoPost] = useState(false);
  const [slackChannel, setSlackChannel] = useState("");
  const [savingSlack, setSavingSlack] = useState(false);

  async function load() {
    const r = await fetch("/api/integrations/push");
    if (r.ok) {
      const data = await r.json();
      setStatus(data);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (status?.slack) {
      setSlackAutoPost(Boolean(status.slack.autoPostEnabled));
      setSlackChannel(status.slack.autoPostChannelId ?? "");
    }
  }, [status]);

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

  async function saveSlackSettings() {
    setSavingSlack(true);
    await fetch("/api/integrations/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "slack",
        autoPostEnabled: slackAutoPost,
        autoPostChannelId: slackChannel,
      }),
    }).catch(() => {});
    setSavingSlack(false);
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
                <div className="space-y-3">
                  <span className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-green-600" /> {conn}
                  </span>
                  {p.key === "slack" && (
                    <div className="space-y-2 border-t border-border pt-2 text-xs">
                      <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slackAutoPost}
                          onChange={(e) => setSlackAutoPost(e.target.checked)}
                          className="rounded border-input text-teal-600 focus:ring-teal"
                        />
                        Auto-post summaries
                      </label>
                      <div className="space-y-1">
                        <label className="text-muted-foreground block font-medium">Slack Channel ID (e.g. C12345)</label>
                        <input
                          type="text"
                          value={slackChannel}
                          onChange={(e) => setSlackChannel(e.target.value)}
                          placeholder="C06ABC123"
                          className="h-8 w-full rounded border border-input bg-card px-2 text-xs"
                        />
                      </div>
                      <Button variant="accent" size="sm" className="h-7 px-2 text-[10px]" onClick={saveSlackSettings} disabled={savingSlack}>
                        {savingSlack ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  )}
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
