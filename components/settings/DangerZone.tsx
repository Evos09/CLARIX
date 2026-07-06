"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DangerZone() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Deletion failed");
      // Clerk session is gone with the user — hard redirect out of the app.
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
      setBusy(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" /> Danger zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently delete your account, all meetings, transcripts, and audio files. If you are
          the only member of this workspace, the entire workspace is deleted and any active
          subscription is cancelled. <strong className="text-foreground">This cannot be undone.</strong>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder='Type "DELETE" to confirm'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="max-w-xs"
            disabled={busy}
          />
          <Button
            variant="destructive"
            onClick={deleteAccount}
            disabled={busy || confirm !== "DELETE"}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Delete account"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
