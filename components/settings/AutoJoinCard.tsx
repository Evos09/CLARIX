"use client";

import { useEffect, useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function AutoJoinCard() {
  const [autoJoin, setAutoJoin] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(true);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/auto-join")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setAutoJoin(Boolean(d.autoJoin));
          setCalendarConnected(Boolean(d.calendarConnected));
          setAvailable(d.available !== false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggle(next: boolean) {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/settings/auto-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoJoin: next }),
      });
      if (r.ok) {
        setAutoJoin(next);
      } else {
        const d = await r.json().catch(() => ({}));
        setMsg(d.error ?? "Could not save");
      }
    } catch {
      setMsg("Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="size-4 text-teal-600" /> Auto-join my meetings
          {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          When on, CLARIX automatically sends a notetaker bot to your scheduled Zoom, Google Meet, and
          Teams calls — no need to upload or press record. Notes appear when the meeting ends.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-teal-600"
            checked={autoJoin}
            disabled={loading || !calendarConnected || !available}
            onChange={(e) => toggle(e.target.checked)}
          />
          Auto-join meetings from my connected calendar
        </label>
        {!available ? (
          <p className="text-xs text-amber-600">Auto-join is available on Starter and above. <Link href="/settings/billing" className="font-semibold underline">Upgrade →</Link></p>
        ) : !calendarConnected ? (
          <p className="text-xs text-amber-600">Connect a calendar above to enable this.</p>
        ) : null}
        {msg && <p className="text-xs text-destructive">{msg}</p>}
        <p className="text-xs text-muted-foreground">CLARIX joins as a visible participant named &quot;CLARIX&quot;. By enabling auto-join, you confirm you have consent to record participants on these calls, where required by law (e.g. two-party-consent regions).</p>
      </CardContent>
    </Card>
  );
}
