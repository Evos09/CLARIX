"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type MeetingOption = { id: string; title: string; status: string; createdAt: string };

function useMeetings(open: boolean) {
  const [meetings, setMeetings] = useState<MeetingOption[]>([]);
  useEffect(() => {
    if (!open) return;
    fetch("/api/meetings")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: MeetingOption[]) => setMeetings(list.filter((m) => m.status === "COMPLETE")))
      .catch(() => {});
  }, [open]);
  return meetings;
}

function MeetingPicker({
  meetings,
  selected,
  onToggle,
}: {
  meetings: MeetingOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
      {meetings.length === 0 ? (
        <p className="p-2 text-xs text-muted-foreground">No completed meetings found.</p>
      ) : (
        meetings.map((m) => (
          <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted">
            <input type="checkbox" checked={selected.has(m.id)} onChange={() => onToggle(m.id)} className="rounded border-input" />
            <span className="min-w-0 flex-1 truncate">{m.title}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </label>
        ))
      )}
    </div>
  );
}

/** "New series" button + dialog: name it and hand-pick any meetings to combine. */
export function NewSeriesButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meetings = useMeetings(open);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function create() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), meetingIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      setOpen(false);
      setName("");
      setSelected(new Set());
      router.push(`/series/${data.series.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New series
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && setOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">New series</h3>
              <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Series name (e.g. Product Weekly)"
                maxLength={120}
                className="h-9 w-full rounded border border-input bg-background px-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Pick any meetings to combine. New meetings whose name matches the series name are added automatically.
              </p>
              <MeetingPicker meetings={meetings} selected={selected} onToggle={toggle} />
              <div className="flex items-center gap-3">
                <Button variant="accent" size="sm" onClick={create} disabled={saving || !name.trim()}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : "Create series"}
                </Button>
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                {error && <span className="text-xs text-destructive">{error}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Delete a custom series, or hide an auto-detected one. */
export function DeleteSeriesButton({ slug, kind, redirectAfter = false }: { slug: string; kind: "auto" | "custom"; redirectAfter?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function run() {
    setBusy(true);
    const qs = kind === "custom" ? `id=${slug}` : `slug=${encodeURIComponent(slug)}`;
    await fetch(`/api/series?${qs}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    if (redirectAfter) router.push("/series");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
        title={kind === "custom" ? "Delete series" : "Hide this series"}
        aria-label="Delete series"
        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        onClick={run}
        disabled={busy}
        className="rounded-md border border-border p-1.5 text-destructive hover:bg-muted disabled:opacity-50"
        title="Confirm"
        aria-label="Confirm delete"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted"
        title="Cancel"
        aria-label="Cancel"
      >
        <X className="size-4" />
      </button>
    </span>
  );
}

/** On a custom series page: add more meetings or remove current ones. */
export function ManageSeriesMeetings({ seriesId, memberIds }: { seriesId: string; memberIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const meetings = useMeetings(open);
  const members = new Set(memberIds);
  const candidates = meetings.filter((m) => !members.has(m.id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function patch(body: object) {
    setBusy(true);
    await fetch("/api/series", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: seriesId, ...body }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add meetings
        </Button>
      ) : (
        <div className="space-y-2 rounded-md border border-border p-3">
          <MeetingPicker meetings={candidates} selected={selected} onToggle={toggle} />
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              disabled={busy || selected.size === 0}
              onClick={async () => {
                await patch({ add: [...selected] });
                setSelected(new Set());
                setOpen(false);
              }}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : `Add ${selected.size || ""}`}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** On an auto-detected series page: convert it into a custom series (same
 *  meetings) so it gains AI compare/contrast + the notes list. */
export function ConvertToCustomButton({ name, meetingIds }: { name: string; meetingIds: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function convert() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, meetingIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to convert");
      router.push(`/series/${data.series.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert");
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button variant="outline" size="sm" onClick={convert} disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Save as custom series
      </Button>
    </span>
  );
}

/** Small × next to a meeting row on a custom series page. */
export function RemoveFromSeriesButton({ seriesId, meetingId }: { seriesId: string; meetingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        await fetch("/api/series", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: seriesId, remove: [meetingId] }),
        }).catch(() => {});
        setBusy(false);
        router.refresh();
      }}
      disabled={busy}
      title="Remove from series"
      aria-label="Remove from series"
      className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:opacity-50"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
    </button>
  );
}
