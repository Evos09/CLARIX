"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileAudio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadZone } from "./UploadZone";
import { Recorder } from "./Recorder";
import { MeetingTypeSelector } from "./MeetingTypeSelector";
import { createMeetingFromFile } from "@/lib/uploadClient";
import { track } from "@/lib/tracking";
import { cn } from "@/lib/utils";

type Phase = "select" | "config" | "uploading" | "error";

export function NewMeetingClient() {
  const router = useRouter();
  const [tab, setTab] = useState<"upload" | "record">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("GENERAL");
  const [autoDetect, setAutoDetect] = useState(true);
  const [phase, setPhase] = useState<Phase>("select");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // The Recorder only emits a file after its consent checkbox was ticked, so a
  // file from the "record" tab carries the acknowledgment; plain uploads don't.
  const [recordedConsent, setRecordedConsent] = useState(false);

  function onFile(f: File) {
    setRecordedConsent(tab === "record");
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    setPhase("config");
  }

  async function process() {
    if (!file) return;
    setPhase("uploading");
    setError(null);
    try {
      const id = await createMeetingFromFile(
        file,
        { title: title || "Untitled meeting", meetingType, autoDetect, consentAcknowledged: recordedConsent },
        setProgress,
      );
      // Deliberately does NOT send meetingType. The type list includes
      // "Medical Appointment", "Legal Deposition" and "Financial Advisory", and
      // shipping those to an ad platform is how hospitals ended up in Meta-pixel
      // lawsuits — under GDPR it is special-category data. The type is already in
      // our own database, so type distribution can be queried there instead of
      // handing it to a third party.
      track("meeting_created", { source: tab });
      router.push(`/meetings/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  }

  if (phase === "config" || phase === "uploading" || phase === "error") {
    const busy = phase === "uploading";
    return (
      <Card className="max-w-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm">
            <FileAudio className="size-5 text-teal-600" />
            <span className="truncate font-medium">{file?.name}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Meeting title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
          </div>
          <MeetingTypeSelector
            value={meetingType}
            autoDetect={autoDetect}
            onChange={setMeetingType}
            onAutoDetectChange={setAutoDetect}
          />
          {busy && (
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Uploading… {progress}%</p>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPhase("select"); setFile(null); }} disabled={busy}>
              Back
            </Button>
            <Button variant="accent" className="flex-1" onClick={process} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Process meeting"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="inline-flex rounded-md border border-border p-1">
        {(["upload", "record"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "upload" ? "Upload" : "Record"}
          </button>
        ))}
      </div>
      {tab === "upload" ? <UploadZone onFile={onFile} /> : <Recorder onFile={onFile} />}
    </div>
  );
}
