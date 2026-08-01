"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Captions, Sparkles, X, Loader2, History, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeTranscriptionClient } from "@/lib/realtimeTranscription";

interface RecallSnippet {
  meetingId: string;
  title: string;
  type: string;
  date: string;
  text: string;
}

export function LiveAssistPanel({ meetingType = "GENERAL" }: { meetingType?: string }) {
  const [on, setOn] = useState(false);
  const [coachOn, setCoachOn] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState("");
  const [finals, setFinals] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [recall, setRecall] = useState<RecallSnippet[]>([]);

  const clientRef = useRef<RealtimeTranscriptionClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef("");
  const shownRef = useRef<string[]>([]);
  // Meetings we've already surfaced this session, so recall doesn't re-show the
  // same past meeting every poll as the conversation lingers on a topic.
  const recalledRef = useRef<Set<string>>(new Set());

  function disable() {
    clientRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clientRef.current = null;
    streamRef.current = null;
    setOn(false);
    setPartial("");
    setRecall([]);
    recalledRef.current = new Set();
  }

  async function enable() {
    setStarting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const client = new RealtimeTranscriptionClient((text, isFinal) => {
        if (isFinal) {
          setFinals((f) => [...f, text].slice(-40));
          transcriptRef.current += " " + text;
          setPartial("");
        } else {
          setPartial(text);
        }
      });
      await client.start(stream);
      clientRef.current = client;
      setOn(true);
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setError(e instanceof Error ? e.message : "Could not start. Allow microphone access.");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!on || !coachOn) return;
    const poll = async () => {
      if (transcriptRef.current.trim().length < 20) return;
      try {
        const r = await fetch("/api/coaching/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptRef.current, meetingType, shownSuggestions: shownRef.current }),
        });
        if (r.ok) {
          const d = await r.json();
          const fresh = (d.suggestions ?? []).filter((s: string) => !shownRef.current.includes(s));
          if (fresh.length) {
            shownRef.current = [...shownRef.current, ...fresh];
            setTips((t) => [...fresh, ...t].slice(0, 3));
          }
        }
      } catch { /* ignore */ }
    };
    // Poll every 25s (server throttles at 20s) so nudges keep pace with the
    // conversation instead of lagging a full minute behind.
    const id = setInterval(poll, 25000);
    return () => clearInterval(id);
  }, [on, coachOn, meetingType]);

  // Live surfacing: while recording, quietly pull relevant context from PAST
  // meetings based on what's being said now. Best-effort — the endpoint returns
  // nothing (no error) when the semantic index isn't live or the plan is Free,
  // so this simply stays empty in those cases.
  useEffect(() => {
    if (!on) return;
    const poll = async () => {
      if (transcriptRef.current.trim().length < 40) return;
      try {
        const r = await fetch("/api/memory/recall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptRef.current }),
        });
        if (!r.ok) return;
        const d = await r.json();
        const fresh: RecallSnippet[] = (d.snippets ?? []).filter(
          (s: RecallSnippet) => !recalledRef.current.has(s.meetingId),
        );
        if (fresh.length) {
          fresh.forEach((s) => recalledRef.current.add(s.meetingId));
          setRecall((prev) => [...fresh, ...prev].slice(0, 4));
        }
      } catch { /* ignore — recall is optional */ }
    };
    // Every 30s: slightly slower than coaching, since past-meeting context
    // shifts less often than the moment-to-moment coaching nudges.
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [on]);

  useEffect(() => () => disable(), []);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium"><Captions className="size-4 text-teal-600" /> Live Captions &amp; Coaching</span>
          <button
            onClick={() => (on ? disable() : enable())}
            className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-teal" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
        {starting && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Connecting…</p>}

        {on && (
          <>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={coachOn} onChange={(e) => setCoachOn(e.target.checked)} className="accent-teal-600" /> Live coaching tips
            </label>

            {tips.length > 0 && (
              <div className="space-y-2">
                {tips.map((t, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-md border-l-2 border-teal bg-navy px-3 py-2 text-white">
                    <span className="text-sm"><span className="mr-1 text-[10px] uppercase text-teal">CLARIX</span>{t}</span>
                    <button onClick={() => setTips((x) => x.filter((_, j) => j !== i))}><X className="size-3.5 opacity-70" /></button>
                  </div>
                ))}
              </div>
            )}

            {recall.length > 0 && (
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <History className="size-3" /> From your past meetings
                </span>
                {recall.map((s) => (
                  <div key={s.meetingId} className="rounded-md border border-teal/30 bg-teal/5 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/meetings/${s.meetingId}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
                      >
                        {s.title}
                        <ArrowUpRight className="size-3" />
                      </Link>
                      <button onClick={() => setRecall((x) => x.filter((r) => r.meetingId !== s.meetingId))}>
                        <X className="size-3.5 opacity-60" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.type} · {new Date(s.date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs text-foreground/80">&ldquo;{s.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm">
              {finals.length === 0 && !partial && <p className="text-xs italic text-muted-foreground">Listening… your words appear here live (not saved).</p>}
              {finals.map((f, i) => <p key={i}>{f}</p>)}
              {partial && <p className="italic text-muted-foreground">{partial}</p>}
            </div>
            <p className="text-right text-[10px] text-muted-foreground">{transcriptRef.current.split(/\s+/).filter(Boolean).length} words · display only</p>
          </>
        )}

        {!on && !starting && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3" /> Turn on for real-time captions and coaching tips while you record.</p>
        )}
      </CardContent>
    </Card>
  );
}
