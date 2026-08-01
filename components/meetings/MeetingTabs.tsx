"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";
import type { BaseOutput } from "@/lib/outputTypes";
import type { KeyPoint } from "@/lib/keyPoints";
import { StructuredOutputView } from "./StructuredOutput/StructuredOutputView";
import { RegenerateButton } from "./StructuredOutput/RegenerateButton";
import { TranscriptViewer } from "./TranscriptViewer";
import { AskClarix } from "./AskClarix";
import { AnalyticsTab } from "./analytics/AnalyticsTab";

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
  isDemo = false,
  canEdit = true,
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
  isDemo?: boolean;
  canEdit?: boolean;
}) {
  const tabsList = isDemo
    ? (["Summary", "Transcript", "Analytics 🔒", "Ask CLARIX 🔒", "Raw JSON"] as const)
    : (["Summary", "Transcript", "Analytics", "Ask CLARIX", "Raw JSON"] as const);

  type TabType = (typeof tabsList)[number];
  // Chat citations deep-link here with ?tab=transcript&hl=<phrase> — open the
  // transcript pre-filtered to the cited moment.
  const params = useSearchParams();
  // ?t=<seconds> deep-links to a second-precise moment; ?hl=<phrase> is the
  // legacy phrase fallback. Either one opens the transcript at that spot.
  const seekParam = params.get("t");
  const seekSec = seekParam !== null && seekParam !== "" && Number.isFinite(Number(seekParam)) ? Number(seekParam) : null;
  const wantsTranscript = params.get("tab")?.toLowerCase() === "transcript" || seekSec !== null;
  const highlight = params.get("hl") ?? "";
  const [tab, setTab] = useState<string>(
    wantsTranscript ? "Transcript" : structuredOutput ? "Summary" : "Transcript",
  );
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(structuredOutput ?? {}, null, 2);

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          You have view-only access to this shared meeting. Only the owner and editors can make changes.
        </div>
      )}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabsList.map((t) => {
          const isActive = tab === t || (t.startsWith("Analytics") && tab === "Analytics") || (t.startsWith("Ask CLARIX") && tab === "Ask CLARIX");
          return (
            <button
              key={t}
              onClick={() => {
                if (t.startsWith("Analytics")) setTab("Analytics");
                else if (t.startsWith("Ask CLARIX")) setTab("Ask CLARIX");
                else setTab(t);
              }}
              className={cn(
                "border-b-2 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider font-mono transition-colors whitespace-nowrap",
                isActive ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "Summary" &&
        (structuredOutput ? (
          <StructuredOutputView meetingId={meetingId} output={structuredOutput} isDemo={isDemo} meetingType={meetingType} canEdit={canEdit} />
        ) : (
          <Card>
            <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
              {claudeConfigured ? (
                <>
                  <p>No AI analysis yet. Run it to extract a summary, action items, and decisions.</p>
                  {!isDemo && canEdit && <RegenerateButton meetingId={meetingId} />}
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
              initialQuery={wantsTranscript ? highlight : ""}
              initialSeekSec={seekSec}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>
      )}

      {tab === "Ask CLARIX" &&
        (isDemo ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="grid size-12 place-items-center rounded-full bg-violet-100 text-violet-700">
                <Lock className="size-6" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-semibold">Unlock Ask CLARIX AI Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions, draft follow-up emails, extract specific lists, and search through your meeting transcripts using our powerful AI assistant.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AskClarix meetingId={meetingId} disabled={!claudeConfigured} meetingType={meetingType} status={status} />
        ))}

      {tab === "Analytics" &&
        (isDemo ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="grid size-12 place-items-center rounded-full bg-violet-100 text-violet-700">
                <Lock className="size-6" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-semibold">Unlock Meeting Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Get insights on team engagement, filler word usage, participant talk-time balance, and overall sentiment metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AnalyticsTab meetingId={meetingId} />
        ))}

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

