import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, Users, Globe } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { MeetingTypeBadge } from "@/components/meetings/MeetingTypeBadge";
import { StatusBadge } from "@/components/meetings/StatusBadge";
import { StatusPoller } from "@/components/meetings/StatusPoller";
import { ExportMenu } from "@/components/meetings/ExportMenu";
import { CRMPushButton } from "@/components/meetings/crm/CRMPushButton";
import { PushToIntegrationButton } from "@/components/meetings/integrations/PushToIntegrationButton";
import { getMeetingType } from "@/lib/meetingTypes";
import type { KeyPoint } from "@/lib/keyPoints";
import { MeetingTabs } from "@/components/meetings/MeetingTabs";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getAudioSignedUrl } from "@/lib/transcription";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";
import type { BaseOutput } from "@/lib/outputTypes";
import { isClaudeConfigured } from "@/lib/claude";

type Params = { params: Promise<{ id: string }> };

export default async function MeetingDetailPage({ params }: Params) {
  const { id } = await params;
  if (!hasDb) {
    return (
      <>
        <TopNav title="Meeting" />
        <main className="flex-1 p-6 text-sm text-muted-foreground">
          Configure <code className="font-mono">DATABASE_URL</code> to view meetings.
        </main>
      </>
    );
  }

  const ctx = await getOrCreateContext();
  const meeting = ctx ? await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } }) : null;
  if (!meeting) notFound();

  const segments = (meeting.transcriptSegments as unknown as TranscriptSegment[] | null) ?? [];
  let audioUrl: string | null = null;
  if (isSupabaseConfigured() && meeting.storagePath) {
    audioUrl = await getAudioSignedUrl(meeting.storagePath).catch(() => null);
  }

  return (
    <>
      <TopNav title={meeting.title} />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{meeting.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <MeetingTypeBadge typeId={meeting.detectedType ?? meeting.meetingType} />
                <StatusBadge status={meeting.status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{format(meeting.createdAt, "MMM d, yyyy")}</span>
              <span className="flex items-center gap-1"><Clock className="size-4" />{formatDuration(meeting.duration)}</span>
              <span className="flex items-center gap-1"><Users className="size-4" />{meeting.speakerCount ?? "—"}</span>
              {meeting.language && <span className="flex items-center gap-1"><Globe className="size-4" />{meeting.language}</span>}
            </div>
            {meeting.status === "COMPLETE" && <ExportMenu meetingId={meeting.id} showEhr={getMeetingType(meeting.meetingType).category === "PRO"} />}
            {meeting.status === "COMPLETE" && <CRMPushButton meetingId={meeting.id} />}
            {meeting.status === "COMPLETE" && <PushToIntegrationButton meetingId={meeting.id} />}
          </CardContent>
        </Card>

        {meeting.status !== "COMPLETE" ? (
          <StatusPoller meetingId={meeting.id} status={meeting.status} />
        ) : (
          <MeetingTabs
            meetingId={meeting.id}
            segments={segments}
            rawTranscript={meeting.rawTranscript}
            audioUrl={audioUrl}
            keyPoints={(meeting.keyPoints as unknown as KeyPoint[] | null) ?? []}
            speakerMap={(meeting.speakerMap as unknown as Record<string, string> | null) ?? {}}
            meetingType={meeting.meetingType}
            status={meeting.status}
            structuredOutput={(meeting.structuredOutput as unknown as BaseOutput | null) ?? null}
            claudeConfigured={isClaudeConfigured()}
          />
        )}
      </main>
    </>
  );
}
