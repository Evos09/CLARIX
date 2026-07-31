"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, Sparkles, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeTranscriptionClient } from "@/lib/realtimeTranscription";

export function LiveAssistPanel({ meetingType = "GENERAL" }: { meetingType?: string }) {
  const [on, setOn] = useState(false);
  const [coachOn, setCoachOn] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState("");
  const [finals, setFinals] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  const clientRef = useRef<RealtimeTranscriptionClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef("");
  const shownRef = useRef<string[]>([]);

  function disable() {
    clientRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clientRef.current = null;
    streamRef.current = null;
    setOn(false);
    setPartial("");
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
