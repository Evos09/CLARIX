"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DigestCard() {
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/digest")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setEnabled(Boolean(d.enabled));
          setFrequency(d.frequency === "DAILY" ? "DAILY" : "WEEKLY");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(next: { enabled?: boolean; frequency?: "DAILY" | "WEEKLY" }) {
    setSaving(true);
    if (next.enabled !== undefined) setEnabled(next.enabled);
    if (next.frequency) setFrequency(next.frequency);
    try {
      await fetch("/api/settings/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-4 text-teal-600" /> Action-item digest
          {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Get an email of everything still open across your meetings — overdue items flagged first — so
          nothing slips. Sent only when you have open action items.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-teal-600"
            checked={enabled}
            disabled={loading}
            onChange={(e) => save({ enabled: e.target.checked })}
          />
          Email me my open action items
        </label>
        {enabled && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Frequency</span>
            <select
              className="rounded-md border border-border bg-card px-2 py-1 text-sm"
              value={frequency}
              onChange={(e) => save({ frequency: e.target.value as "DAILY" | "WEEKLY" })}
            >
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
            </select>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Requires a configured email sender (Resend).</p>
      </CardContent>
    </Card>
  );
}
