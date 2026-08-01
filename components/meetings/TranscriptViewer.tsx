"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, Pause, Search, MessageSquarePlus, Send, Sparkles, ChevronDown, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";
import { KP_CATEGORY_CLASS, type KeyPoint } from "@/lib/keyPoints";

interface Comment {
  id: string;
  content: string;
  timestamp: number | null;
}

const SPEAKER_CLASSES = ["speaker-0", "speaker-1", "speaker-2", "speaker-3", "speaker-4", "speaker-5"];

function highlight(text: string, q: string): ReactNode[] {
  if (!q) return [text];
  const out: ReactNode[] = [];
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  let i = 0;
  let key = 0;
  for (;;) {
    const idx = lower.indexOf(ql, i);
    if (idx === -1) { out.push(text.slice(i)); break; }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(<mark key={key++} className="bg-teal/30">{text.slice(idx, idx + q.length)}</mark>);
    i = idx + q.length;
  }
  return out;
}

export function TranscriptViewer({
  meetingId,
  segments,
  audioUrl,
  rawTranscript,
  keyPoints = [],
  speakerMap = {},
  initialQuery = "",
  initialSeekSec = null,
  canEdit = true,
}: {
  meetingId: string;
  segments: TranscriptSegment[];
  audioUrl: string | null;
  rawTranscript: string | null;
  keyPoints?: KeyPoint[];
  speakerMap?: Record<string, string>;
  /** Pre-filled search (chat citation deep-links) — cleared if nothing matches. */
  initialQuery?: string;
  /** Second-precise deep-link (?t=): seek the audio here and flash the segment. */
  initialSeekSec?: number | null;
  /** VIEWER collaborators get a read-only transcript (no speaker rename). */
  canEdit?: boolean;
}) {
  const waveRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<{ playPause: () => void; setTime: (s: number) => void; play: () => void; destroy: () => void } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [query, setQuery] = useState(initialQuery);

  // A citation phrase that doesn't literally appear in any segment would hide
  // the whole transcript — drop it instead.
  useEffect(() => {
    if (initialQuery && !segments.some((s) => s.text.toLowerCase().includes(initialQuery.toLowerCase()))) {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [openComment, setOpenComment] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const [names, setNames] = useState<Record<string, string>>(speakerMap);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  // Second-precise deep-link: which segment to flash, and refs to scroll to it.
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const seekedRef = useRef(false);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const speakerName = (s: string) => names[s] ?? `Speaker ${s}`;

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}/comments`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setComments)
      .catch(() => {});
  }, [meetingId]);

  useEffect(() => {
    if (!audioUrl || !waveRef.current) return;
    let inst: { destroy: () => void } | null = null;
    let cancelled = false;
    import("wavesurfer.js").then(({ default: WaveSurfer }) => {
      if (cancelled || !waveRef.current) return;
      const ws = WaveSurfer.create({
        container: waveRef.current,
        url: audioUrl,
        waveColor: "#94a3b8",
        progressColor: "#6d28d9",
        cursorColor: "#0b0b14",
        height: 64,
        barWidth: 2,
        barGap: 1,
      });
      ws.on("timeupdate", (t: number) => setCurrentTime(t));
      ws.on("play", () => setPlaying(true));
      ws.on("pause", () => setPlaying(false));
      ws.on("finish", () => setPlaying(false));
      // Second-precise deep-link (?t=): once the waveform is ready, jump the
      // audio to the cited moment and start playing. Guarded so it fires once.
      ws.on("ready", () => {
        if (initialSeekSec != null && !seekedRef.current) {
          seekedRef.current = true;
          ws.setTime(initialSeekSec);
          ws.play();
        }
      });
      wsRef.current = ws;
      inst = ws;
    });
    return () => { cancelled = true; inst?.destroy(); wsRef.current = null; };
  }, [audioUrl]);

  function seek(seconds: number) {
    if (wsRef.current) { wsRef.current.setTime(seconds); wsRef.current.play(); }
  }

  // On a ?t= deep-link, scroll the containing segment into view and flash it, so
  // the cited moment is obvious even before (or without) audio playback.
  useEffect(() => {
    if (initialSeekSec == null || segments.length === 0) return;
    let idx = segments.findIndex((s) => initialSeekSec >= s.start && initialSeekSec < s.end);
    if (idx === -1) {
      idx = 0; // nearest preceding segment when the exact second falls in a gap
      for (let i = 0; i < segments.length; i++) if (segments[i].start <= initialSeekSec) idx = i;
    }
    rowRefs.current[idx]?.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlashIdx(idx);
    const to = setTimeout(() => setFlashIdx(null), 2600);
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSpeaker(s: string) {
    const next = { ...names, [s]: editVal.trim() || `Speaker ${s}` };
    setNames(next);
    setEditing(null);
    await fetch(`/api/meetings/${meetingId}/speakers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speakerMap: next }),
    }).catch(() => {});
  }

  async function addComment(seg: TranscriptSegment) {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    setOpenComment(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, timestamp: seg.start }),
      });
      if (res.ok) { const created = await res.json(); setComments((c) => [...c, created]); }
    } catch { /* ignore */ }
  }

  const speakerColor = new Map<string, string>();
  let ci = 0;
  for (const s of segments) {
    if (!speakerColor.has(s.speaker)) { speakerColor.set(s.speaker, SPEAKER_CLASSES[ci % SPEAKER_CLASSES.length]); ci++; }
  }

  const visible = query ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())) : segments;

  if (segments.length === 0) {
    return <p className="text-sm text-muted-foreground">{rawTranscript || "No transcript available."}</p>;
  }

  return (
    <div className="space-y-4">
      {keyPoints.length > 0 && (
        <div className="rounded-lg border border-border">
          <button onClick={() => setShowKeyPoints((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
            <span className="flex items-center gap-2"><Sparkles className="size-4 text-teal-600" /> Key Points <Badge className="bg-teal-100 text-teal-700 ring-teal-600/20">{keyPoints.length}</Badge></span>
            <ChevronDown className={cn("size-4 transition-transform", showKeyPoints && "rotate-180")} />
          </button>
          {showKeyPoints && (
            <div className="space-y-2 border-t border-border p-3">
              {keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted">
                  <Badge className={cn("shrink-0", KP_CATEGORY_CLASS[kp.category] ?? KP_CATEGORY_CLASS.INSIGHT)}>{kp.category}</Badge>
                  <button onClick={() => seek(kp.time)} className="shrink-0 font-mono text-xs text-muted-foreground hover:text-teal-600" title="Jump to this moment">
                    {formatDuration(Math.round(kp.time))}
                  </button>
                  <div className="min-w-0 text-sm">
                    <span>{kp.description}</span>
                    {kp.speaker && <span className="ml-1 text-xs text-muted-foreground">— {speakerName(kp.speaker)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {audioUrl && (
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="accent" onClick={() => wsRef.current?.playPause()}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <div ref={waveRef} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">{formatDuration(Math.floor(currentTime))}</span>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the transcript…" className="pl-9" />
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto font-mono text-sm">
        {visible.map((s, i) => {
          const active = currentTime >= s.start && currentTime < s.end;
          const segComments = comments.filter((c) => c.timestamp !== null && c.timestamp >= s.start && c.timestamp < s.end);
          return (
            <div
              key={i}
              ref={(el) => { rowRefs.current[i] = el; }}
              className={cn(
                "group -mx-2 rounded-md p-2 transition-colors",
                active && "bg-teal/10",
                flashIdx === i && "bg-teal/15 ring-1 ring-teal",
              )}
            >
              <div className="flex items-baseline gap-2">
                <button onClick={() => seek(s.start)} className="shrink-0 font-sans text-xs text-muted-foreground hover:text-teal-600" title="Jump to this moment">
                  {formatDuration(s.start)}
                </button>
                {!canEdit ? (
                  <span className={`inline-flex shrink-0 items-center font-semibold ${speakerColor.get(s.speaker)}`}>
                    {speakerName(s.speaker)}:
                  </span>
                ) : editing === s.speaker ? (
                  <span className="flex items-center gap-1">
                    <input value={editVal} onChange={(e) => setEditVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveSpeaker(s.speaker)} autoFocus className="w-28 rounded border border-input bg-card px-1 font-sans text-xs" />
                    <button onClick={() => saveSpeaker(s.speaker)}><Check className="size-3 text-teal-600" /></button>
                  </span>
                ) : (
                  <button
                    onClick={() => { setEditing(s.speaker); setEditVal(names[s.speaker] ?? ""); }}
                    className={`group/sp inline-flex shrink-0 items-center gap-1 font-semibold ${speakerColor.get(s.speaker)}`}
                    title="Rename speaker"
                  >
                    {speakerName(s.speaker)}:
                    <Pencil className="size-3 opacity-0 group-hover/sp:opacity-60" />
                  </button>
                )}
                <span className="text-foreground/90">{highlight(s.text, query)}</span>
                {canEdit && (
                  <button onClick={() => setOpenComment(openComment === i ? null : i)} className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-teal-600 group-hover:opacity-100" title="Add note">
                    <MessageSquarePlus className="size-4" />
                  </button>
                )}
              </div>
              {segComments.map((c) => (
                <p key={c.id} className="ml-12 mt-1 rounded bg-muted px-2 py-1 font-sans text-xs text-muted-foreground">📝 {c.content}</p>
              ))}
              {openComment === i && (
                <div className="ml-12 mt-2 flex gap-2">
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note…" className="h-8 font-sans text-xs" onKeyDown={(e) => e.key === "Enter" && addComment(s)} />
                  <Button size="icon" variant="accent" className="h-8 w-8" onClick={() => addComment(s)}><Send className="size-3" /></Button>
                </div>
              )}
            </div>
          );
        })}
        {visible.length === 0 && <p className="text-muted-foreground">No matches for “{query}”.</p>}
      </div>
    </div>
  );
}
