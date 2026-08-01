"use client";

/**
 * Overlay surface — a floating, always-on-top command bar + answer card for
 * asking your meeting memory. Loaded standalone by the desktop overlay window
 * (Tauri, always-on-top) and the browser companion; also reachable at /overlay.
 *
 * It is a thin surface over the existing memory brain: it POSTs to
 * /api/memory/ask (semantic retrieval + grounded, cited answer) and renders the
 * answer plus clickable citations that deep-link back to each source meeting.
 * No new search/auth/storage — it reuses Clarix's.
 *
 * The surface commits to a dark look (wrapped in `dark` so theme tokens resolve
 * to their dark values regardless of the viewer's app theme).
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, CornerDownLeft, FileText, Clock, Eye, EyeOff, Play, X } from "lucide-react";
import { MarkdownView } from "@/components/chat/MarkdownView";

const SOLID_KEY = "clarix-overlay-solid";

type Citation = { id: string; title: string; type: string; date: string; hl?: string; t?: number };
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

// Build the citation link. Prefer a second-precise jump (?t=) that seeks the
// audio to the cited moment; fall back to a phrase deep-link for legacy chunks
// with no timestamp; otherwise just open the meeting.
function citationHref(c: Citation): string {
  if (typeof c.t === "number") return `/meetings/${c.id}?tab=transcript&t=${c.t}`;
  if (c.hl) return `/meetings/${c.id}?tab=transcript&hl=${encodeURIComponent(c.hl)}`;
  return `/meetings/${c.id}`;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** True when this page is running inside the Tauri desktop shell. */
function inTauri(): boolean {
  return typeof window !== "undefined" && Boolean((window as { __TAURI__?: unknown }).__TAURI__);
}

/**
 * Hide the native overlay window (desktop only). The window is only hidden, not
 * closed, so the dashboard's "Enter Glass Mode" button can show it again.
 * Imported lazily so browser visitors never fetch the Tauri bundle.
 */
function hideDesktopOverlay() {
  if (!inTauri()) return;
  void import("@tauri-apps/api/window")
    .then(({ getCurrentWindow }) => getCurrentWindow().hide())
    .catch(() => {});
}

export default function OverlayPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangePreset | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeRange, setActiveRange] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Transparency: glass (default) lets the desktop/always-on-top overlay show
  // through; solid gives an opaque background for readability over busy screens.
  // A `?solid=1|0` param (set by the extension) wins on first load, else the
  // last saved preference for this surface.
  const [solid, setSolid] = useState(false);
  // Detected after mount (never during render) so SSR and the first client
  // render agree — otherwise the close button would trip hydration.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(inTauri());
    const param = new URLSearchParams(window.location.search).get("solid");
    if (param === "1" || param === "0") {
      const on = param === "1";
      setSolid(on);
      try { localStorage.setItem(SOLID_KEY, on ? "1" : "0"); } catch {}
    } else {
      try { setSolid(localStorage.getItem(SOLID_KEY) === "1"); } catch {}
    }
  }, []);

  function toggleSolid() {
    setSolid((prev) => {
      const next = !prev;
      try { localStorage.setItem(SOLID_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }

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

  // Glass vs. solid background, shared by the bar and the card.
  const surface = solid ? "bg-background" : "bg-background/80 backdrop-blur-xl";

  return (
    <main className={`dark flex min-h-screen justify-center p-4 sm:pt-8 ${solid ? "bg-background" : "bg-transparent"}`}>
      {/* The app shell paints a solid page background; the native overlay window
          is transparent, so clear it here or the "glass" look is lost. */}
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>
      <div className="flex w-full max-w-2xl flex-col items-center gap-3 text-foreground">
        {/* ── Command bar — drag the window by it (desktop overlay) ── */}
        <div
          data-tauri-drag-region
          className={`flex w-full items-stretch overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${surface}`}
        >
          <div data-tauri-drag-region className="flex cursor-grab items-center gap-2 px-3.5 active:cursor-grabbing">
            <span data-tauri-drag-region className="size-4 rounded-[5px] bg-gradient-to-br from-[#a78bfa] to-[#7c4fe8] shadow-[0_0_0_3px_rgba(167,139,250,0.18)]" />
            <span data-tauri-drag-region className="text-sm font-bold tracking-tight">CLARIX</span>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void ask(query); }}
            className="flex flex-1 items-center gap-2 border-l border-white/10 px-3.5 py-2.5"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your meetings…"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            />
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            ) : (
              <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                <CornerDownLeft className="size-3" /> ask
              </span>
            )}
          </form>

          <button
            onClick={toggleSolid}
            title={solid ? "Solid — tap for transparent" : "Transparent — tap for solid"}
            aria-pressed={solid}
            className="flex items-center gap-1.5 border-l border-white/10 px-3.5 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            {solid ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            <span className="hidden sm:inline">{solid ? "Solid" : "Glass"}</span>
          </button>

          {/* Desktop only: hide the overlay window (reopen it from the dashboard). */}
          {isDesktop && (
            <button
              onClick={hideDesktopOverlay}
              title="Close the overlay"
              aria-label="Close the overlay"
              className="flex items-center border-l border-white/10 px-3 text-muted-foreground transition hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ── Date-range chips (structured half of search) ── */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
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
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/10 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* ── Answer card ── */}
        <div className={`w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${surface}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" /> CLARIX · from your meetings
            </span>
            {activeRange && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-2.5" /> {activeRange}
              </span>
            )}
          </div>

          <div className="max-h-[56vh] overflow-y-auto px-4 py-4">
            {!answer && !error && !loading && (
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setQuery(ex); void ask(ex); }}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-xs transition hover:border-accent/40 hover:bg-accent/10"
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
                <div className="text-[15px] leading-relaxed">
                  <MarkdownView content={answer} />
                </div>

                {citations.length > 0 && (
                  <div className="space-y-1.5 border-t border-white/10 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Sources · jump to the moment
                    </p>
                    {citations.map((c) => (
                      <Link
                        key={c.id}
                        href={citationHref(c)}
                        target="_blank"
                        className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-accent/40 hover:bg-accent/10"
                      >
                        <FileText className="size-4 shrink-0 text-accent" />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="text-[13.5px] font-medium">{c.title}</span>
                          <span className="ml-1.5 text-xs text-muted-foreground">· {c.type} · {fmtDate(c.date)}</span>
                        </span>
                        {typeof c.t === "number" ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-md bg-teal-400/10 px-2 py-1 font-mono text-[11px] text-teal-300">
                            <Play className="size-2.5 fill-current" /> {fmtTime(c.t)}
                          </span>
                        ) : c.hl ? (
                          <span className="shrink-0 rounded-md bg-teal-400/10 px-2 py-1 font-mono text-[11px] text-teal-300">↳ jump</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><CornerDownLeft className="size-2.5" /> to ask</span>
            <span>answers from your workspace only</span>
          </div>
        </div>
      </div>
    </main>
  );
}
