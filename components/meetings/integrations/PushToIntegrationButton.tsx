"use client";

import { useEffect, useState } from "react";
import { Share2, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conn { connected: boolean }
interface Status { slack: Conn | null; notion: Conn | null; linear: Conn | null }
interface Option { id: string; name: string }

export function PushToIntegrationButton({ meetingId }: { meetingId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [picker, setPicker] = useState<"slack" | "linear" | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/integrations/push").then((r) => (r.ok ? r.json() : null)).then(setStatus).catch(() => {});
  }, []);

  async function openPicker(platform: "slack" | "linear") {
    setOpen(false);
    setPicker(platform);
    setOptions([]);
    const url = platform === "slack" ? "/api/integrations/slack/channels" : "/api/integrations/linear/teams";
    const r = await fetch(url);
    if (r.ok) setOptions(await r.json());
  }

  async function push(platform: string, body: Record<string, string>) {
    setBusy(true);
    try {
      const r = await fetch(`/api/meetings/${meetingId}/push/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      setMsg(r.ok ? `Sent to ${platform}` : d.error ?? "Failed");
    } catch {
      setMsg("Failed");
    } finally {
      setBusy(false);
      setPicker(null);
      setOpen(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const connected = {
    slack: status?.slack?.connected,
    notion: status?.notion?.connected,
    linear: status?.linear?.connected,
  };
  const any = connected.slack || connected.notion || connected.linear;

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />} Push
      </Button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-52 rounded-md border border-border bg-card p-1 shadow-lg">
          {connected.slack && <button onClick={() => openPicker("slack")} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">Send to Slack</button>}
          {connected.notion && <button onClick={() => push("notion", {})} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">Save to Notion</button>}
          {connected.linear && <button onClick={() => openPicker("linear")} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">Create Linear issues</button>}
          {!any && <a href="/settings" className="block rounded px-3 py-2 text-left text-sm text-teal-600 hover:bg-muted">Connect in Settings →</a>}
        </div>
      )}

      {picker && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setPicker(null)}>
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{picker === "slack" ? "Choose a channel" : "Choose a team"}</span>
              <button onClick={() => setPicker(null)}><X className="size-4" /></button>
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => push(picker, picker === "slack" ? { channelId: o.id } : { teamId: o.id })}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {picker === "slack" ? `#${o.name}` : o.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {msg && (
        <p className="absolute right-0 mt-2 flex items-center gap-1 whitespace-nowrap text-xs text-teal-600">
          <Check className="size-3" /> {msg}
        </p>
      )}
    </div>
  );
}
