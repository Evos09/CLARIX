import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Clock, Users, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/Logo";
import { MeetingTypeBadge } from "@/components/meetings/MeetingTypeBadge";
import { MeetingTabs } from "@/components/meetings/MeetingTabs";
import { SiteFooter } from "@/components/site/site-footer";
import { SAMPLE_MEETING_DATA as SAMPLE } from "@/lib/site/sampleMeeting";
import type { TranscriptSegment } from "@/lib/transcription";
import type { BaseOutput } from "@/lib/outputTypes";
import { formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "See a real CLARIX meeting — no signup",
  description:
    "A real five-minute meeting run through CLARIX: full transcript with speakers, a summary, the decisions, and every action item with an owner. No account, no install, no card.",
};

/**
 * The public, no-signup demo. Renders SAMPLE_MEETING_DATA straight through the
 * same components the product uses, so what a stranger sees here is literally
 * the real output surface — not a screenshot or a mock of it.
 *
 * Deliberately writes nothing: no database row, no cookie, no anonymous
 * workspace. That is what makes it safe to link from every CTA on the site and
 * safe to let search engines crawl. The interactive "upload your own file"
 * path still lives at /demo/[id]; this page is the one you can link to.
 *
 * force-dynamic so the relative action-item due dates stay fresh rather than
 * being baked in at build time.
 */
export const dynamic = "force-dynamic";

export default function DemoPage() {
  const segments = SAMPLE.transcriptSegments as unknown as TranscriptSegment[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo renders its own <Link href="/">. Wrapping it in another one
              nests <a> inside <a> and fails hydration. */}
          <Logo className="hover:opacity-90" />
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Try it on your own meeting <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-3">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
            Live example
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            This is what CLARIX gives you back.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Below is a real five-minute product meeting after CLARIX processed it — the same screen
            you&rsquo;d see in your own workspace, with nothing hidden or touched up. Read the summary,
            check it against the transcript, and decide for yourself. No account needed.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{SAMPLE.title}</h2>
              <MeetingTypeBadge typeId={SAMPLE.detectedType} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{format(new Date(), "MMM d, yyyy")}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {formatDuration(SAMPLE.duration)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {SAMPLE.speakerCount}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="size-4" />
                {SAMPLE.language}
              </span>
            </div>
          </CardContent>
        </Card>

        <MeetingTabs
          meetingId="demo-sample"
          segments={segments}
          rawTranscript={SAMPLE.rawTranscript}
          audioUrl={null}
          keyPoints={SAMPLE.keyPoints}
          speakerMap={SAMPLE.speakerMap}
          meetingType={SAMPLE.meetingType}
          status={SAMPLE.status}
          structuredOutput={SAMPLE.structuredOutput as unknown as BaseOutput}
          claudeConfigured
          isDemo
          canEdit={false}
        />

        <Card className="border-accent/30 bg-accent/[0.04]">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">Now run it on one of yours.</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Upload a recording or record straight from your browser. The free plan covers 10 meetings
              a month and doesn&rsquo;t ask for a card.
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
              >
                Start free <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/security"
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                How your recordings are handled
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
