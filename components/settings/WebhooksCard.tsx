"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Copy, Check, Webhook } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Hook {
  id: string;
  url: string;
  label: string | null;
  enabled: boolean;
  secret: string;
  lastFiredAt: string | null;
  lastStatus: number | null;
}

function statusLabel(h: Hook): string {
  if (h.lastStatus == null) return "Never fired";
  if (h.lastStatus === 0) return "Last: failed to connect";
  const ok = h.lastStatus >= 200 && h.lastStatus < 300;
  return `Last: ${h.lastStatus}${ok ? " ✓" : ""}`;
}

export function WebhooksCard() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  async function load() {
    const r = await fetch("/api/integrations/webhooks");
    if (r.ok) setHooks((await r.json()).hooks ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    void load();
  }, []);

  async function add() {
    setAdding(true);
    setError(null);
    try {
      const r = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), label: label.trim() || undefined }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to add");
      setUrl("");
      setLabel("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(id: string) {
    setBusy(id);
    await fetch("/api/integrations/webhooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle" }),
    }).catch(() => {});
    await load();
    setBusy(null);
  }

  async function test(id: string) {
    setBusy(id);
    setTestResult((s) => ({ ...s, [id]: "" }));
    try {
      const r = await fetch("/api/integrations/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "test" }),
      });
      const data = await r.json();
      setTestResult((s) => ({
        ...s,
        [id]: data.ok ? `Delivered (${data.status})` : data.status ? `Endpoint returned ${data.status}` : "Could not reach endpoint",
      }));
    } catch {
      setTestResult((s) => ({ ...s, [id]: "Test failed" }));
    } finally {
      await load();
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    await fetch(`/api/integrations/webhooks?id=${id}`, { method: "DELETE" }).catch(() => {});
    await load();
    setBusy(null);
  }

  function copySecret(h: Hook) {
    navigator.clipboard.writeText(h.secret);
    setCopied(h.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="size-4" /> Outbound webhooks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          POST a signed JSON payload to any URL when a meeting finishes processing. Wire CLARIX into Zapier,
          Make, n8n, or your own endpoint. Verify deliveries with the <code className="font-mono text-xs">X-Clarix-Signature</code> header
          (HMAC-SHA256 of the raw body using the secret below).
        </p>

        {loaded && hooks.length > 0 && (
          <div className="space-y-2">
            {hooks.map((h) => (
              <div key={h.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{h.label || h.url}</div>
                    {h.label && <div className="truncate text-xs text-muted-foreground">{h.url}</div>}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {h.enabled ? "Enabled" : "Disabled"} · {statusLabel(h)}
                      {testResult[h.id] ? ` · ${testResult[h.id]}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => test(h.id)} disabled={busy === h.id}>
                      {busy === h.id ? <Loader2 className="size-3 animate-spin" /> : "Test"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => toggle(h.id)} disabled={busy === h.id}>
                      {h.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => remove(h.id)} disabled={busy === h.id}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-[11px]">{h.secret}</code>
                  <button
                    onClick={() => copySecret(h)}
                    className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] hover:bg-muted"
                  >
                    {copied === h.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied === h.id ? "Copied" : "Secret"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="h-9 w-full rounded border border-input bg-card px-2 text-sm"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional)"
              className="h-9 w-full rounded border border-input bg-card px-2 text-sm sm:w-40"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="accent" size="sm" onClick={add} disabled={adding || !url.trim()}>
              {adding ? <Loader2 className="size-4 animate-spin" /> : "Add webhook"}
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
