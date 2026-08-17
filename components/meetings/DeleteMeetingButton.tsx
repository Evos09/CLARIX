"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Delete a meeting for good — the row, its action items, key points, comments
 * and search index (all cascaded), plus the audio file in storage.
 *
 * The privacy policy promises users can delete their recordings, and the API
 * has done so all along; there was simply no control wired to it, so the only
 * way to honour a deletion request was a script.
 *
 * Rendered only for the owning org, matching the route, which scopes its lookup
 * to ctx.orgId and 404s for anyone else. Confirmation is a second step rather
 * than a window.confirm: this destroys the recording, and nothing else on this
 * page is irreversible.
 */
export function DeleteMeetingButton({ meetingId, title }: { meetingId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? `Couldn't delete (${res.status}).`);
        setBusy(false);
        return;
      }
      // Leave before refreshing — this page no longer has anything to show.
      router.push("/meetings");
      router.refresh();
    } catch {
      setError("Couldn't delete. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground hover:border-destructive/40 hover:text-destructive"
      >
        <Trash2 className="size-4" /> Delete
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Delete permanently?</span>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={run}
          disabled={busy}
          className="bg-destructive text-white hover:bg-destructive/90"
          aria-label={`Permanently delete ${title}`}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Delete
        </Button>
      </div>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : (
        <span className="text-[11px] text-muted-foreground">The recording and transcript can&apos;t be recovered.</span>
      )}
    </div>
  );
}
