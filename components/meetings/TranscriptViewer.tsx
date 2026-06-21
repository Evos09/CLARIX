"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play, Pause, Search, MessageSquarePlus, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";

interface Comment {
  id: string;
  content: string;
  timestamp: number | null;
}

const SPEAKER_CLASSES = ["speaker-0", "speaker-1", "speaker-2", "speaker-3", "speaker-4", "speaker-5"];

/** Case-insensitive highlight without regex (heredoc/lexer safe). */
function highlight(text: string, q: string): ReactNode[] {
  if (!q) return [text];
  const out: ReactNode[] = [];
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  let i = 0;
  let key = 0;
  for (;;) {
    const idx = lower.indexOf(ql, i);
    if (idx === -1) {
      out.push(text.slice(i));
      break;
    }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark key={key++} className="bg-teal/30">
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    i = idx + q.length;
  }
  return out;
}

export function TranscriptViewer({
  meetingId,
  segments,
  audioUrl,
  rawTranscript,
}: {
  meetingId: string;
  segments: TranscriptSegment[];
  audioUrl: string | null;
  rawTranscript: string | null;
}) {
  const waveRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<{ playPause: () => void; setTime: (s: number) => void; play: () => void; destroy: () => void } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [query, setQuery] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [openComment, setOpenComment] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

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
        progressColor: "#00c8b4",
        cursorColor: "#0a1628",
        height: 64,
        barWidth: 2,
        barGap: 1,
      });
      ws.on("timeupdate", (t: number) => setCurrentTime(t));
      ws.on("play", () => setPlaying(true));
      ws.on("pause", () => setPlaying(false));
      ws.on("finish", () => setPlaying(false));
      wsRef.current = ws;
      inst = ws;
    });
    return () => {
      cancelled = true;
      inst?.destroy();
      wsRef.current = null;
    };
  }, [audioUrl]);

  function seek(seconds: number) {
    if (wsRef.current) {
      wsRef.current.setTime(seconds);
      wsRef.current.play();
    }
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
      if (res.ok) {
        const created = await res.json();
        setComments((c) => [...c, created]);
      }
    } catch {
      // ignore
    }
  }

  const speakerColor = new Map<string, string>();
  let ci = 0;
  for (const s of segments) {
    if (!speakerColor.has(s.speaker)) {
      speakerColor.set(s.speaker, SPEAKER_CLASSES[ci % SPEAKER_CLASSES.length]);
      ci++;
    }
  }

  const visible = query
    ? segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
    : segments;

  if (segments.length === 0) {
    return <p className="text-sm text-muted-foreground">{rawTranscript || "No transcript available."}</p>;
  }

  return (
    <div className="space-y-4">
      {audioUrl && (
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="accent" onClick={() => wsRef.current?.playPause()}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <div ref={waveRef} className="flex-1" />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {formatDuration(Math.floor(currentTime))}
            </span>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the transcript…"
          className="pl-9"
        />
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto font-mono text-sm">
        {visible.map((s, i) => {
          const active = currentTime >= s.start && currentTime < s.end;
          const segComments = comments.filter(
            (c) => c.timestamp !== null && c.timestamp >= s.start && c.timestamp < s.end,
          );
          return (
            <div key={i} className={cn("group -mx-2 rounded-md p-2", active && "bg-teal/10")}>
              <div className="flex items-baseline gap-2">
                <button
                  onClick={() => seek(s.start)}
                  className="shrink-0 font-sans text-xs text-muted-foreground hover:text-teal-600"
                  title="Jump to this moment"
                >
                  {formatDuration(s.start)}
                </button>
                <span className={`shrink-0 font-semibold ${speakerColor.get(s.speaker)}`}>Speaker {s.speaker}:</span>
                <span className="text-foreground/90">{highlight(s.text, query)}</span>
                <button
                  onClick={() => setOpenComment(openComment === i ? null : i)}
                  className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-teal-600 group-hover:opacity-100"
                  title="Add note"
                >
                  <MessageSquarePlus className="size-4" />
                </button>
              </div>
              {segComments.map((c) => (
                <p key={c.id} className="ml-12 mt-1 rounded bg-muted px-2 py-1 font-sans text-xs text-muted-foreground">
                  📝 {c.content}
                </p>
              ))}
              {openComment === i && (
                <div className="ml-12 mt-2 flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a note…"
                    className="h-8 font-sans text-xs"
                    onKeyDown={(e) => e.key === "Enter" && addComment(s)}
                  />
                  <Button size="icon" variant="accent" className="h-8 w-8" onClick={() => addComment(s)}>
                    <Send className="size-3" />
                  </Button>
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
