"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export function Recorder({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  // Live captions (Web Speech API) — shown while recording so the user can see
  // the transcription happening in real time. Best-effort: recording works the
  // same in browsers without speech recognition.
  const [liveLines, setLiveLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const recordingRef = useRef(false);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLines, interim]);

  function startLiveCaptions() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return; // unsupported browser — recording still works
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          if (text.trim()) setLiveLines((lines) => [...lines.slice(-40), text.trim()]);
        } else {
          interimText += text;
        }
      }
      setInterim(interimText);
    };
    // Chrome ends recognition periodically — restart while still recording.
    rec.onend = () => {
      if (recordingRef.current) {
        try { rec.start(); } catch { /* already restarting */ }
      }
    };
    rec.onerror = () => { /* captions are best-effort; keep recording */ };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* ignore */ }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onFile(new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" }));
      };
      rec.start();
      recRef.current = rec;
      recordingRef.current = true;
      setRecording(true);
      setSeconds(0);
      setLiveLines([]);
      setInterim("");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      startLiveCaptions();
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stop() {
    recordingRef.current = false;
    recognitionRef.current?.stop?.();
    setInterim("");
    recRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border p-12 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-teal/10 text-teal-600">
        <Mic className="size-7" />
      </div>
      {recording ? (
        <>
          <p className="font-mono text-lg">{formatDuration(seconds)}</p>
          {/* Live transcription while recording */}
          <div className="max-h-40 w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-left">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> Live transcription
            </p>
            {liveLines.length === 0 && !interim ? (
              <p className="text-xs text-muted-foreground/70">Start talking — your words appear here in real time.</p>
            ) : (
              <div className="space-y-1 text-[13px] leading-relaxed text-foreground">
                {liveLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                {interim && <p className="text-muted-foreground">{interim}</p>}
                <div ref={captionsEndRef} />
              </div>
            )}
          </div>
          <Button variant="destructive" onClick={stop} disabled={disabled}>
            <Square className="size-4" /> Stop &amp; use recording
          </Button>
        </>
      ) : (
        <>
          <p className="font-medium">Record in your browser</p>
          <p className="text-sm text-muted-foreground">No upload needed — capture live.</p>
          <label className="flex max-w-sm cursor-pointer items-start gap-2 text-left text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-3.5 shrink-0 accent-teal-600"
            />
            <span>
              I confirm I have permission to record this meeting, including consent from all
              participants where required by law.{" "}
              <a href="/legal/recording-consent" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                Learn more
              </a>
            </span>
          </label>
          <Button variant="accent" onClick={start} disabled={disabled || !consent}>
            <Mic className="size-4" /> Start recording
          </Button>
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
