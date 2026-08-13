"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyMeetingReady } from "@/lib/desktop";

const STEPS = [
  { key: "UPLOADING", label: "Uploading" },
  { key: "TRANSCRIBING", label: "Transcribing" },
  { key: "PROCESSING", label: "Analyzing" },
  { key: "COMPLETE", label: "Done" },
];

/** What the pipeline is actually doing right now, per stage. */
const STAGE_DETAIL: Record<string, string> = {
  UPLOADING: "Saving your audio.",
  TRANSCRIBING: "Turning speech into text and separating out who said what.",
  PROCESSING: "Writing the summary and pulling out action items.",
  // Between the status flipping to COMPLETE and router.refresh() swapping in
  // the finished view there is a beat where all four steps are ticked. Without
  // this it fell back to "CLARIX is working on your meeting", which reads as
  // wrong next to a completed row. Observed live, not theoretical.
  COMPLETE: "Done — loading your summary.",
};

/**
 * Past this many seconds, stop implying it's nearly done and say so plainly. A
 * spinner with no elapsed time reads as "stuck" long before it actually is.
 */
const SLOW_AFTER_SEC = 300;

function fmtElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function StatusPoller({
  meetingId,
  status,
  errorMessage,
  startedAt,
}: {
  meetingId: string;
  status: string;
  errorMessage?: string | null;
  /** ISO timestamp the meeting was created; drives the elapsed counter. */
  startedAt?: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [elapsed, setElapsed] = useState<number | null>(null);

  // Ticks once a second while work is in flight. Derived from the server's
  // createdAt rather than a local start time, so it stays honest across
  // reloads and when the user returns to the tab later.
  useEffect(() => {
    if (!startedAt || current === "COMPLETE" || current === "ERROR") return;
    const started = new Date(startedAt).getTime();
    if (Number.isNaN(started)) return;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, current]);

  useEffect(() => {
    if (current === "COMPLETE" || current === "ERROR") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`, { cache: "no-store" });
        if (!res.ok) return;
        const m = await res.json();
        if (m.status !== current) {
          setCurrent(m.status);
          if (m.status === "COMPLETE") notifyMeetingReady(m.title ?? "Your meeting");
          if (m.status === "COMPLETE" || m.status === "ERROR") router.refresh();
        }
      } catch {
        // transient; retry next tick
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [meetingId, current, router]);

  const activeIndex = STEPS.findIndex((s) => s.key === current);

  if (current === "ERROR") {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="font-medium text-destructive">Transcription failed</p>
        {/* The provider's own words, when we have them. A bare "it failed" tells
            the user nothing they can act on — "no spoken audio" tells them to
            check the microphone. */}
        {errorMessage ? (
          <p className="mx-auto mt-2 max-w-lg text-sm text-foreground">{errorMessage}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          Check that the audio is valid and your AssemblyAI key is configured, then try a new upload.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2",
                  done && "border-teal bg-teal text-white",
                  active && "border-teal text-teal-600",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : active ? <Loader2 className="size-4 animate-spin" /> : i + 1}
              </div>
              <span className={cn("text-xs", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 space-y-1 text-center text-sm">
        <p className="text-foreground">
          {STAGE_DETAIL[current] ?? "CLARIX is working on your meeting."}
          {elapsed !== null && (
            <span className="ml-2 font-mono text-xs text-muted-foreground">{fmtElapsed(elapsed)} elapsed</span>
          )}
        </p>
        <p className="text-muted-foreground">
          {elapsed !== null && elapsed >= SLOW_AFTER_SEC
            ? "This one is taking longer than most. It's still running — CLARIX keeps checking on its own, so you can safely close this page and come back."
            : "This page updates automatically, and you can safely leave — we'll keep working."}
        </p>
      </div>
    </div>
  );
}
