"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";
import type { BaseOutput } from "@/lib/outputTypes";
import type { KeyPoint } from "@/lib/keyPoints";
import { StructuredOutputView } from "./StructuredOutput/StructuredOutputView";
import { RegenerateButton } from "./StructuredOutput/RegenerateButton";
import { TranscriptViewer } from "./TranscriptViewer";
import { AskClarix } from "./AskClarix";

const TABS = ["Summary", "Transcript", "Ask CLARIX", "Raw JSON"] as const;
type Tab = (typeof TABS)[number];

export function MeetingTabs({
  meetingId,
  segments,
  rawTranscript,
  audioUrl,
  structuredOutput,
  claudeConfigured,
  keyPoints,
  speakerMap,
  meetingType,
  status,
}: {
  meetingId: string;
  segments: TranscriptSegment[];
  rawTranscript: string | null;
  audioUrl: string | null;
  structuredOutput: BaseOutput | null;
  claudeConfigured: boolean;
  keyPoints?: KeyPoint[];
  speakerMap?: Record<string, string>;
  meetingType?: string;
  status?: string;
}) {
  const [tab, setTab] = useState<Tab>(structuredOutput ? "Summary" : "Transcript");
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(structuredOutput ?? {}, null, 2);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "border-teal text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Summary" &&
        (structuredOutput ? (
          <StructuredOutputView meetingId={meetingId} output={structuredOutput} />
        ) : (
          <Card>
            <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
              {claudeConfigured ? (
                <>
                  <p>No AI analysis yet. Run it to extract a summary, action items, and decisions.</p>
                  <RegenerateButton meetingId={meetingId} />
                </>
              ) : (
                <p>Add <code className="font-mono">ANTHROPIC_API_KEY</code> to enable AI analysis.</p>
              )}
            </CardContent>
          </Card>
        ))}

      {tab === "Transcript" && (
        <Card>
          <CardContent className="p-6">
            <TranscriptViewer
              meetingId={meetingId}
              segments={segments}
              audioUrl={audioUrl}
              rawTranscript={rawTranscript}
              keyPoints={keyPoints}
              speakerMap={speakerMap}
            />
          </CardContent>
        </Card>
      )}

      {tab === "Ask CLARIX" && <AskClarix meetingId={meetingId} disabled={!claudeConfigured} meetingType={meetingType} status={status} />}

      {tab === "Raw JSON" && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(json);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-4 font-mono text-xs">{json}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
