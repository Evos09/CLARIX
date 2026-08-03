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

export function StatusPoller({
  meetingId,
  status,
  errorMessage,
}: {
  meetingId: string;
  status: string;
  errorMessage?: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);

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
      <p className="mt-4 text-center text-sm text-muted-foreground">
        CLARIX is working on your meeting. This page updates automatically.
      </p>
    </div>
  );
}
