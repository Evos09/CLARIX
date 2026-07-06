"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export function Recorder({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stop() {
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
