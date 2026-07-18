"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Plus, X, StickyNote, GitCompareArrows } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownView } from "@/components/chat/MarkdownView";

type Note = { id: string; text: string; source: "ai" | "user" };

export function SeriesInsights({
  seriesId,
  initialComparison,
  initialNotes,
  insightsAt,
  meetingCount,
}: {
  seriesId: string;
  initialComparison: string | null;
  initialNotes: Note[];
  insightsAt: string | null;
  meetingCount: number;
}) {
  const router = useRouter();
  const [comparison, setComparison] = useState(initialComparison);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function post(body: object) {
    const res = await fetch(`/api/series/${seriesId}/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? "Request failed");
    return data;
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await post({ action: "generate" });
      setComparison(data.comparison);
      setNotes(data.notes);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setGenerating(false);
    }
  }

  async function addNote() {
    const text = newNote.trim();
    if (!text) return;
    setAddingNote(true);
    setError(null);
    try {
      const data = await post({ action: "addNote", text });
      setNotes(data.notes);
      setNewNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add note");
    } finally {
      setAddingNote(false);
    }
  }

  async function removeNote(noteId: string) {
    setRemovingId(noteId);
    try {
      const data = await post({ action: "removeNote", noteId });
      setNotes(data.notes);
    } catch {
      // leave list as-is on failure
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Compare & contrast */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="size-4 text-accent" /> Compare &amp; contrast
          </CardTitle>
          <Button variant="accent" size="sm" onClick={generate} disabled={generating || meetingCount < 2}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {comparison ? "Refresh" : "Compare meetings"}
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          {comparison ? (
            <>
              <MarkdownView content={comparison} />
              {insightsAt && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Generated {new Date(insightsAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {meetingCount < 2
                ? "Add at least 2 meetings to this series, then run a comparison."
                : "Run a comparison to see what changed across these meetings — evolving decisions, recurring themes, and blockers that keep coming back."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes list */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="size-4 text-accent" /> Series notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notes yet. Run a comparison to auto-generate takeaways, or add your own below.
            </p>
          ) : (
            <ul className="space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="group flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">{n.text}</span>
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                      n.source === "ai" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {n.source === "ai" ? "AI" : "You"}
                  </span>
                  <button
                    onClick={() => removeNote(n.id)}
                    disabled={removingId === n.id}
                    title="Delete note"
                    aria-label="Delete note"
                    className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                  >
                    {removingId === n.id ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void addNote();
              }}
              placeholder="Add a note…"
              maxLength={1000}
              className="h-9 min-w-0 flex-1 rounded border border-input bg-background px-2 text-sm"
            />
            <Button variant="outline" size="sm" onClick={addNote} disabled={addingNote || !newNote.trim()}>
              {addingNote ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
