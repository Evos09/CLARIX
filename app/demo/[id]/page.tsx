import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Clock, Users, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MeetingTypeBadge } from "@/components/meetings/MeetingTypeBadge";
import { StatusBadge } from "@/components/meetings/StatusBadge";
import { DemoStatusPoller } from "@/components/meetings/DemoStatusPoller";
import { ClaimButton } from "@/components/meetings/ClaimButton";
import { MeetingTabs } from "@/components/meetings/MeetingTabs";
import { prisma } from "@/lib/prisma";
import { getOrCreateAnonymousContext, getAuthContext } from "@/lib/auth";
import { getAudioSignedUrl } from "@/lib/transcription";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/lib/transcription";
import type { BaseOutput } from "@/lib/outputTypes";
import { isClaudeConfigured } from "@/lib/claude";
import { Logo } from "@/components/layout/Logo";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function DemoDetailPage({ params }: Params) {
  const { id } = await params;
  const anonCtx = await getOrCreateAnonymousContext();
  const authCtx = await getAuthContext();
  const isLoggedIn = authCtx !== null;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    notFound();
  }

  if (meeting.orgId !== anonCtx.orgId) {
    if (authCtx) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: authCtx.clerkUserId },
      });
      if (dbUser && meeting.userId === dbUser.id) {
        redirect(`/meetings/${id}`);
      }
    }
    notFound();
  }

  const segments = (meeting.transcriptSegments as unknown as TranscriptSegment[] | null) ?? [];
  let audioUrl: string | null = null;
  if (isSupabaseConfigured() && meeting.storagePath) {
    audioUrl = await getAudioSignedUrl(meeting.storagePath).catch(() => null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom simplified demo header */}
      <header className="border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo renders its own <Link href="/">; nesting another one here
                puts <a> inside <a> and fails hydration. */}
            <Logo className="hover:opacity-90" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              Interactive Demo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mr-4"
            >
              <ArrowLeft className="size-4" /> Back to Home
            </Link>
            <ClaimButton meetingId={meeting.id} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </header>

      {/* Floating Demo Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 text-center text-sm font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span>
            This is a temporary preview space. Claim this meeting to save it permanently, edit details, and export reports.
          </span>
          <ClaimButton meetingId={meeting.id} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
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
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {formatDuration(meeting.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {meeting.speakerCount ?? "—"}
              </span>
              {meeting.language && (
                <span className="flex items-center gap-1">
                  <Globe className="size-4" />
                  {meeting.language}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {meeting.status !== "COMPLETE" ? (
          <DemoStatusPoller meetingId={meeting.id} status={meeting.status} />
        ) : (
          <MeetingTabs
            meetingId={meeting.id}
            segments={segments}
            rawTranscript={meeting.rawTranscript}
            audioUrl={audioUrl}
            keyPoints={(meeting.keyPoints as unknown as any[] | null) ?? []}
            speakerMap={(meeting.speakerMap as unknown as Record<string, string> | null) ?? {}}
            meetingType={meeting.meetingType}
            status={meeting.status}
            structuredOutput={(meeting.structuredOutput as unknown as BaseOutput | null) ?? null}
            claudeConfigured={isClaudeConfigured()}
            isDemo={true}
          />
        )}
      </main>
    </div>
  );
}
