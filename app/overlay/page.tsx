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
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, CornerDownLeft, FileText, Clock, Eye, EyeOff, Play, X, Minus, Maximize2, Mic, Square, ShieldCheck } from "lucide-react";
import { MarkdownView } from "@/components/chat/MarkdownView";
import { createMeetingFromFile } from "@/lib/uploadClient";

const MODE_KEY = "clarix-overlay-mode";

/** Glass = frosted panels. Transparent = words only: no panel, border, or blur. */
type Mode = "glass" | "transparent";

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

/**
 * Open a meeting from a citation. In the desktop app a plain target="_blank"
 * link does nothing — WebView2 blocks new-window creation — so we spawn a real
 * Tauri window instead. In a browser the normal link is left alone.
 */
function openMeetingWindow(e: React.MouseEvent, href: string) {
  if (!inTauri()) return;
  e.preventDefault();
  void import("@tauri-apps/api/webviewWindow")
    .then(({ WebviewWindow }) => {
      new WebviewWindow(`meeting-${Date.now()}`, {
        url: href,
        width: 1100,
        height: 800,
        title: "CLARIX — Meeting",
      });
    })
    .catch(() => {});
}

/** The eight edges/corners you can grab to resize the borderless window. */
type ResizeDir = "North" | "South" | "East" | "West" | "NorthEast" | "NorthWest" | "SouthEast" | "SouthWest";

const RESIZE_HANDLES: { dir: ResizeDir; cls: string }[] = [
  { dir: "North", cls: "inset-x-4 top-0 h-1.5 cursor-ns-resize" },
  { dir: "South", cls: "inset-x-4 bottom-0 h-1.5 cursor-ns-resize" },
  { dir: "West", cls: "inset-y-4 left-0 w-1.5 cursor-ew-resize" },
  { dir: "East", cls: "inset-y-4 right-0 w-1.5 cursor-ew-resize" },
  { dir: "NorthWest", cls: "left-0 top-0 size-4 cursor-nwse-resize" },
  { dir: "NorthEast", cls: "right-0 top-0 size-4 cursor-nesw-resize" },
  { dir: "SouthWest", cls: "bottom-0 left-0 size-4 cursor-nesw-resize" },
  { dir: "SouthEast", cls: "bottom-0 right-0 size-4 cursor-nwse-resize" },
];

/** Height the window collapses to when minimized — just the command bar. */
const BAR_HEIGHT = 58;

/** Recording lifecycle for the overlay's built-in recorder. */
type RecState = "idle" | "consent" | "recording" | "saving" | "done" | "error";

function fmtElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${String(m).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

export default function OverlayPage() {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangePreset | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeRange, setActiveRange] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Look: "glass" (frosted panels, default) or "transparent" (just the words
  // floating over your screen — no panel, border, or blur). `?mode=` wins on
  // first load, otherwise the last saved choice.
  const [mode, setMode] = useState<Mode>("glass");
  // Detected after mount (never during render) so SSR and the first client
  // render agree — otherwise the close button would trip hydration.
  const [isDesktop, setIsDesktop] = useState(false);
  // Minimized = only the command bar is left on screen.
  const [collapsed, setCollapsed] = useState(false);
  const expandedHeight = useRef(600);

  // ── Built-in recorder ──
  const [rec, setRec] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recError, setRecError] = useState<string | null>(null);
  const [recMeetingId, setRecMeetingId] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsDesktop(inTauri());
    const param = new URLSearchParams(window.location.search).get("mode");
    if (param === "glass" || param === "transparent") {
      setMode(param);
      try { localStorage.setItem(MODE_KEY, param); } catch {}
    } else {
      try {
        const saved = localStorage.getItem(MODE_KEY);
        if (saved === "glass" || saved === "transparent") setMode(saved);
        // "clear" was the old middle mode; anyone still holding it gets glass.
        else if (saved === "clear") localStorage.setItem(MODE_KEY, "glass");
      } catch {}
    }
  }, []);

  /* ─────────── Recording ───────────
   * Captures the microphone and uploads through the same pipeline as the web
   * recorder, so the meeting lands in the library and gets transcribed exactly
   * like any other. Consent is confirmed before the mic ever opens.
   */
  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function beginRecording() {
    setRecError(null);
    setRecMeetingId(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => void saveRecording();
      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      setRec("recording");
    } catch {
      stopTracks();
      setRec("error");
      setRecError("Couldn't access the microphone. Check permissions and try again.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      setRec("saving");
      recorderRef.current.stop(); // fires onstop → saveRecording()
    }
    stopTracks();
  }

  async function saveRecording() {
    const type = chunksRef.current[0]?.type || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];
    if (!blob.size) { setRec("idle"); return; }
    try {
      const stamp = new Date();
      const file = new File([blob], `overlay-recording-${stamp.getTime()}.webm`, { type });
      const id = await createMeetingFromFile(
        file,
        {
          title: `Meeting — ${stamp.toLocaleString()}`,
          meetingType: "GENERAL",
          autoDetect: true,
          consentAcknowledged: true, // confirmed in the UI before recording started
        },
        () => {},
      );
      setRecMeetingId(id);
      setRec("done");
    } catch (e) {
      setRec("error");
      setRecError(e instanceof Error ? e.message : "Couldn't save the recording.");
    }
  }

  // Never leave the mic open if the overlay unmounts.
  useEffect(() => () => stopTracks(), []);

  /**
   * Drag the window from anywhere on the overlay — not just the command bar.
   * Interactive elements and anything marked data-no-drag (the answer text, so
   * it stays selectable) are excluded.
   */
  function startWindowDrag(e: React.MouseEvent) {
    if (!isDesktop || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select, [data-no-drag]")) return;
    void import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => getCurrentWindow().startDragging())
      .catch(() => {});
  }

  /** Grab an edge or corner to resize the borderless window freely. */
  function startResize(e: React.MouseEvent, direction: ResizeDir) {
    if (!isDesktop) return;
    e.stopPropagation(); // don't also start a window drag
    void import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => getCurrentWindow().startResizeDragging(direction))
      .catch(() => {});
  }

  /** Minimize to just the command bar (and restore the previous height). */
  async function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    if (!isDesktop) return;
    try {
      const { getCurrentWindow, LogicalSize } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      // innerWidth/innerHeight are CSS pixels, which are logical units.
      if (next) {
        expandedHeight.current = window.innerHeight;
        await win.setSize(new LogicalSize(window.innerWidth, BAR_HEIGHT));
      } else {
        await win.setSize(new LogicalSize(window.innerWidth, expandedHeight.current || 600));
      }
    } catch {
      // Not in the desktop shell — the UI still collapses on its own.
    }
  }

  function toggleMode() {
    setMode((prev) => {
      const next: Mode = prev === "glass" ? "transparent" : "glass";
      try { localStorage.setItem(MODE_KEY, next); } catch {}
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

  const glass = mode === "glass";
  // Glass draws a frosted panel. Transparent drops the panel entirely — no
  // background, border, blur or shadow — so only the words float over whatever
  // is underneath. Legibility there comes from a doubled text-shadow instead of
  // a scrim, which is what keeps light backgrounds readable.
  const surface = glass
    ? "rounded-2xl border border-white/10 bg-background/80 shadow-2xl backdrop-blur-xl"
    : "";
  const legible = glass
    ? ""
    : "[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_10px_rgba(0,0,0,0.85)]";

  return (
    <main
      onMouseDown={startWindowDrag}
      className={`dark flex h-screen justify-center bg-transparent p-3 ${legible} ${isDesktop ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {/* Grab any edge or corner to resize the borderless window. */}
      {isDesktop &&
        RESIZE_HANDLES.map((h) => (
          <div
            key={h.dir}
            onMouseDown={(e) => startResize(e, h.dir)}
            className={`fixed z-50 ${h.cls}`}
            aria-hidden
          />
        ))}

      {/* The app shell paints a solid page background; the native overlay window
          is transparent, so clear it here or the "glass" look is lost. */}
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>
      {/* No max width and full height: the overlay fills whatever size you drag
          the window to, so you can make it as small or as large as you like. */}
      <div className="flex h-full w-full flex-col gap-2 text-foreground">
        {/* ── Command bar — drag the window by it (desktop overlay) ── */}
        <div
          data-tauri-drag-region
          className={`flex w-full flex-none items-stretch overflow-hidden ${surface}`}
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

          {/* Record this meeting — mic capture, uploaded like any other meeting. */}
          <button
            onClick={() => (rec === "recording" ? stopRecording() : setRec("consent"))}
            disabled={rec === "saving"}
            title={rec === "recording" ? "Stop and save the recording" : "Record this meeting"}
            className={`flex items-center gap-1.5 px-3 text-[11px] transition disabled:opacity-60 ${
              rec === "recording" ? "text-red-400 hover:text-red-300" : "text-muted-foreground hover:text-foreground"
            } ${glass ? "border-l border-white/10" : ""}`}
          >
            {rec === "saving" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : rec === "recording" ? (
              <Square className="size-3 fill-current" />
            ) : (
              <Mic className="size-3.5" />
            )}
            <span className="hidden font-mono sm:inline">
              {rec === "recording" ? fmtElapsed(elapsed) : rec === "saving" ? "Saving" : "Record"}
            </span>
          </button>

          <button
            onClick={toggleMode}
            title={glass ? "Glass — tap for transparent (words only)" : "Transparent — tap for glass"}
            aria-pressed={!glass}
            className={`flex items-center gap-1.5 px-3.5 text-[11px] text-muted-foreground transition hover:text-foreground ${glass ? "border-l border-white/10" : ""}`}
          >
            {glass ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            <span className="hidden sm:inline">{glass ? "Glass" : "Transparent"}</span>
          </button>

          {/* Desktop only: minimize to just this bar, then restore. */}
          {isDesktop && (
            <button
              onClick={toggleCollapse}
              title={collapsed ? "Expand" : "Minimize to the bar"}
              aria-label={collapsed ? "Expand the overlay" : "Minimize the overlay"}
              className={`flex items-center px-3 text-muted-foreground transition hover:text-foreground ${glass ? "border-l border-white/10" : ""}`}
            >
              {collapsed ? <Maximize2 className="size-3.5" /> : <Minus className="size-4" />}
            </button>
          )}

          {/* Desktop only: hide the overlay window (reopen it from the dashboard). */}
          {isDesktop && (
            <button
              onClick={hideDesktopOverlay}
              title="Close the overlay"
              aria-label="Close the overlay"
              className={`flex items-center px-3 text-muted-foreground transition hover:text-foreground ${glass ? "border-l border-white/10" : ""}`}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ── Recording strip: consent gate, then live status ── */}
        {rec !== "idle" && !collapsed && (
          <div className={`w-full px-4 py-2.5 text-xs ${surface}`}>
            {rec === "consent" && (
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-accent" />
                <span className="min-w-0 flex-1 text-muted-foreground">
                  Everyone in this meeting must know they&apos;re being recorded — laws in many places require it.
                </span>
                <button
                  onClick={beginRecording}
                  className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-white transition hover:opacity-90"
                >
                  They know — start
                </button>
                <button onClick={() => setRec("idle")} className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            )}

            {rec === "recording" && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
                Recording · {fmtElapsed(elapsed)} — stop to transcribe and save it to your meetings.
              </span>
            )}

            {rec === "saving" && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Uploading and transcribing…
              </span>
            )}

            {rec === "done" && (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Saved — your notes are processing.</span>
                {recMeetingId && (
                  <Link
                    href={`/meetings/${recMeetingId}`}
                    target="_blank"
                    onClick={(e) => openMeetingWindow(e, `/meetings/${recMeetingId}`)}
                    className="font-semibold text-accent hover:underline"
                  >
                    Open meeting →
                  </Link>
                )}
                <button onClick={() => setRec("idle")} className="ml-auto text-muted-foreground hover:text-foreground">
                  Dismiss
                </button>
              </span>
            )}

            {rec === "error" && (
              <span className="flex items-center gap-2">
                <span className="text-destructive">{recError}</span>
                <button onClick={() => setRec("idle")} className="ml-auto text-muted-foreground hover:text-foreground">
                  Dismiss
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Date-range chips (structured half of search) ── */}
        <div className={`flex flex-wrap items-center justify-center gap-1.5 ${collapsed ? "hidden" : ""}`}>
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
                className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                  on
                    ? "border border-accent bg-accent/15 text-accent"
                    : `text-muted-foreground hover:text-foreground ${glass ? "border border-white/10 hover:border-accent/40" : ""}`
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* ── Answer card — grows to fill the window ── */}
        <div className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden ${surface} ${collapsed ? "hidden" : ""}`}>
          <div className={`flex flex-none items-center justify-between px-4 py-2.5 ${glass ? "border-b border-white/10" : ""}`}>
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" /> CLARIX · from your meetings
            </span>
            {activeRange && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-2.5" /> {activeRange}
              </span>
            )}
          </div>

          {/* data-no-drag: answers stay selectable instead of dragging the window. */}
          <div data-no-drag className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!answer && !error && !loading && (
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setQuery(ex); void ask(ex); }}
                      className={`rounded-full px-3 py-1.5 text-left text-xs transition hover:bg-accent/10 ${glass ? "border border-white/10 bg-white/[0.03] hover:border-accent/40" : ""}`}
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
                        onClick={(e) => openMeetingWindow(e, citationHref(c))}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-accent/10 ${glass ? "border border-white/10 bg-white/[0.03] hover:border-accent/40" : ""}`}
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

          <div className={`flex flex-none items-center justify-between px-4 py-2 text-[10px] text-muted-foreground ${glass ? "border-t border-white/10" : ""}`}>
            <span className="flex items-center gap-1"><CornerDownLeft className="size-2.5" /> to ask</span>
            <span>answers from your workspace only</span>
          </div>
        </div>
      </div>
    </main>
  );
}
