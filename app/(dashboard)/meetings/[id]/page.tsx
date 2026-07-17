import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, Users, Globe } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { MeetingTypeBadge } from "@/components/meetings/MeetingTypeBadge";
import { StatusBadge } from "@/components/meetings/StatusBadge";
import { StatusPoller } from "@/components/meetings/StatusPoller";
import { ExportMenu } from "@/components/meetings/ExportMenu";
import { PushToIntegrationButton } from "@/components/meetings/integrations/PushToIntegrationButton";
import { ShareChecklistButton } from "@/components/meetings/ShareChecklistButton";
import { ShareMeetingButton } from "@/components/meetings/ShareMeetingButton";
import { MeetingLiveRefresh } from "@/components/meetings/MeetingLiveRefresh";
import { getAccessibleMeeting } from "@/lib/meetingAccess";
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

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  if (!hasDb) return { title: "Meeting" };
  const ctx = await getOrCreateContext();
  const meeting = ctx
    ? await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId }, select: { title: true } })
    : null;
  return { title: meeting?.title ?? "Meeting" };
}

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
  const meeting = ctx ? await getAccessibleMeeting(id, ctx) : null;
  if (!meeting || !ctx) notFound();
  const isOwner = meeting.orgId === ctx.orgId;
  // Live-refresh only matters when someone else can be editing: a collaborator
  // is viewing, or the owner has shared this meeting with at least one person.
  const isShared = !isOwner || (await prisma.meetingCollaborator.count({ where: { meetingId: id } })) > 0;

  const segments = (meeting.transcriptSegments as unknown as TranscriptSegment[] | null) ?? [];
  let audioUrl: string | null = null;
  if (isSupabaseConfigured() && meeting.storagePath) {
    audioUrl = await getAudioSignedUrl(meeting.storagePath).catch(() => null);
  }

  return (
    <>
      <TopNav title={meeting.title} />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <header className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <MeetingTypeBadge typeId={meeting.detectedType ?? meeting.meetingType} />
                <StatusBadge status={meeting.status} />
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                {meeting.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{format(meeting.createdAt, "MMM d, yyyy")}</span>
                <span className="flex items-center gap-1"><Clock className="size-3.5" />{formatDuration(meeting.duration)}</span>
                <span className="flex items-center gap-1"><Users className="size-3.5" />{meeting.speakerCount ?? "—"} speakers</span>
                {meeting.language && <span className="flex items-center gap-1"><Globe className="size-3.5" />{meeting.language}</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && <ShareMeetingButton meetingId={meeting.id} />}
              {meeting.status === "COMPLETE" && <ExportMenu meetingId={meeting.id} showEhr={getMeetingType(meeting.meetingType).category === "PRO"} />}
              {meeting.status === "COMPLETE" && <PushToIntegrationButton meetingId={meeting.id} />}
              {meeting.status === "COMPLETE" && <ShareChecklistButton meetingId={meeting.id} initialShareToken={meeting.shareToken} />}
            </div>
          </div>
        </header>

        {isShared && meeting.status === "COMPLETE" && <MeetingLiveRefresh intervalMs={4000} />}
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
