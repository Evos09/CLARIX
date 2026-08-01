"use client";

/**
 * Overlay surface — a chromeless, transparent-friendly spotlight for asking your
 * meeting memory. Loaded standalone by the desktop overlay window (Tauri,
 * always-on-top) and the browser companion; also reachable at /overlay in a tab.
 *
 * It is a thin surface over the existing memory brain: it POSTs to
 * /api/memory/ask (semantic retrieval + grounded, cited answer) and renders the
 * answer plus clickable citations that deep-link back to each source meeting.
 * No new search/auth/storage — it reuses Clarix's.
 */
import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, CornerDownLeft, FileText, Clock } from "lucide-react";
import { MarkdownView } from "@/components/chat/MarkdownView";

type Citation = { id: string; title: string; type: string; date: string; hl?: string };
type RangePreset = "week" | "month" | "quarter" | "year";

const EXAMPLES = [
  "What happened in the Q3 meetings?",
  "What did we decide about pricing?",
  "Open action items for the launch",
];

const RANGES: { key: RangePreset; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "quarter", label: "This quarter" },
  { key: "year", label: "This year" },
];

// Build the citation link. When we have a distinctive phrase, deep-link into the
// transcript pre-filtered to that moment (each segment there is click-to-play);
// otherwise just open the meeting.
function citationHref(c: Citation): string {
  return c.hl
    ? `/meetings/${c.id}?tab=transcript&hl=${encodeURIComponent(c.hl)}`
    : `/meetings/${c.id}`;
}

export default function OverlayPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangePreset | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeRange, setActiveRange] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string, r: RangePreset | null = range) {
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    setActiveRange(null);
    try {
      const res = await fetch("/api/memory/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question, ...(r ? { range: r } : {}) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setAnswer(data.answer ?? "");
      setCitations(Array.isArray(data.citations) ? data.citations : []);
      setActiveRange(typeof data.range === "string" ? data.range : null);
    } catch {
      setError("Couldn't reach CLARIX. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function fmtDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-transparent p-4 sm:pt-10">
      <div className="w-full max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-background/85 shadow-2xl backdrop-blur-xl">
          {/* Ask bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(query);
            }}
            className="flex items-center gap-2 border-b border-border px-4 py-3"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your meetings anything…"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                <CornerDownLeft className="size-3" /> ask
              </span>
            )}
          </form>

          {/* Date-range filter chips — the structured half of search. Toggling
              one re-asks the current question scoped to that window. */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2">
            <Clock className="size-3 text-muted-foreground" />
            {RANGES.map((r) => {
              const on = range === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => {
                    const next = on ? null : r.key;
                    setRange(next);
                    if (query.trim()) void ask(query, next);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    on
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
            {!answer && !error && !loading && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setQuery(ex);
                        void ask(ex);
                      }}
                      className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-left text-xs transition hover:border-accent/40 hover:bg-accent/5"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching your meetings…
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {answer && (
              <div className="space-y-4">
                <div className="text-sm leading-relaxed">
                  <MarkdownView content={answer} />
                </div>

                {citations.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Sources
                      {activeRange && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-accent">
                          <Clock className="size-2.5" /> {activeRange}
                        </span>
                      )}
                    </p>
                    <ul className="space-y-1.5">
                      {citations.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={citationHref(c)}
                            target="_blank"
                            className="group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-accent/5"
                          >
                            <FileText className="mt-0.5 size-4 shrink-0 text-accent" />
                            <span className="min-w-0">
                              <span className="font-medium underline-offset-2 group-hover:underline">{c.title}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {c.type} · {fmtDate(c.date)}
                              </span>
                              {c.hl && (
                                <span className="mt-0.5 block text-[11px] text-accent/80">↳ jump to the cited moment</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          CLARIX overlay · answers come from your workspace&apos;s meetings only
        </p>
      </div>
    </main>
  );
}
