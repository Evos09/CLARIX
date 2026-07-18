"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

// Inline, unlimited meeting-title editing. The h1 stays a plain heading until an
// editor clicks the pencil; saving PATCHes /api/meetings/[id] { title } (which
// has no once-only guard) and refreshes so the tab title + list update too.
export function EditableMeetingTitle({
  meetingId,
  initialTitle,
  canEdit,
}: {
  meetingId: string;
  initialTitle: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local title in sync if the server value changes (e.g. after refresh).
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const headingClass = "text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl";

  function start() {
    setDraft(title);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    const next = draft.trim();
    if (!next) {
      setError("Title can't be empty");
      return;
    }
    if (next === title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't save");
      }
      setTitle(next);
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="group mt-3 flex items-start gap-2">
        <h1 className={headingClass}>{title}</h1>
        {canEdit && (
          <button
            onClick={start}
            title="Rename meeting"
            aria-label="Rename meeting"
            className="mt-1.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus:opacity-100 group-hover:opacity-100"
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
            if (e.key === "Escape") cancel();
          }}
          maxLength={200}
          disabled={saving}
          className={`${headingClass} min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 outline-none focus:border-accent`}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => void save()}
            disabled={saving}
            title="Save"
            aria-label="Save title"
            className="rounded-md border border-border p-1.5 text-green-600 hover:bg-muted disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          </button>
          <button
            onClick={cancel}
            disabled={saving}
            title="Cancel"
            aria-label="Cancel"
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
