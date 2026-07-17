"use client";

import { useEffect, useState } from "react";
import { UserPlus, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Collaborator {
  userId: string;
  role: "VIEWER" | "EDITOR";
  email: string;
  name: string | null;
}

/**
 * Owner-only control to share a meeting with other CLARIX users. Adds/removes
 * collaborators via /api/meetings/[id]/collaborators. Sharing is a paid-plan
 * feature — the API returns 403 for FREE plans, surfaced here as an error.
 */
export function ShareMeetingButton({ meetingId }: { meetingId: string }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const r = await fetch(`/api/meetings/${meetingId}/collaborators`);
    if (r.ok) {
      const d = await r.json();
      setList(d.collaborators ?? []);
    }
    setLoaded(true);
  }

  useEffect(() => {
    if (open && !loaded) void load();
  }, [open, loaded]);

  async function add() {
    const value = email.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/meetings/${meetingId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, role }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error ?? "Could not share.");
      } else {
        setEmail("");
        await load();
      }
    } catch {
      setError("Could not share.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string) {
    setBusy(true);
    await fetch(`/api/meetings/${meetingId}/collaborators?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }).catch(() => {});
    await load();
    setBusy(false);
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" /> Share
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Share this meeting</span>
              <button onClick={() => setOpen(false)}><X className="size-4" /></button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Add another CLARIX user by email. Editors can make changes; viewers get read-only access to the transcript, summary, and action items.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="teammate@company.com"
                className="h-9 flex-1 rounded-md border border-input bg-card px-2 text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "EDITOR" | "VIEWER")}
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <Button variant="accent" size="sm" onClick={add} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Add"}
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

            <div className="mt-4 space-y-1">
              {!loaded ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : list.length === 0 ? (
                <p className="text-xs text-muted-foreground">Not shared with anyone yet.</p>
              ) : (
                list.map((c) => (
                  <div key={c.userId} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted">
                    <span className="min-w-0 truncate">
                      {c.name ? `${c.name} · ` : ""}{c.email}
                      <span className="ml-2 text-xs text-muted-foreground">{c.role === "EDITOR" ? "Editor" : "Viewer"}</span>
                    </span>
                    <button onClick={() => remove(c.userId)} className="text-muted-foreground hover:text-destructive" disabled={busy}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
