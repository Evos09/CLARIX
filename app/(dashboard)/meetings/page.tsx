import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { MeetingLiveRefresh } from "@/components/meetings/MeetingLiveRefresh";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";

export const metadata = { title: "Meetings" };
export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  let meetings: Awaited<ReturnType<typeof prisma.meeting.findMany>> = [];
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      meetings = await prisma.meeting.findMany({
        where: {
          OR: [{ orgId: ctx.orgId }, { collaborators: { some: { userId: ctx.userId } } }],
        },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  // Anything still in flight? Then keep the list live, so a meeting that
  // finishes while you're looking at it stops claiming to be transcribing.
  // Only polls while there is something to watch — an all-COMPLETE library
  // makes no requests at all.
  const hasInFlight = meetings.some((m) => m.status !== "COMPLETE" && m.status !== "ERROR");

  return (
    <>
      <TopNav title="Meetings" />
      {hasInFlight && <MeetingLiveRefresh intervalMs={5000} />}
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Meetings"
          title={<>Every conversation, <Accent>captured</Accent>.</>}
          description="Your full meeting library — transcripts, summaries, and action items for everything CLARIX has processed."
        />
        {meetings.length === 0 ? (
          <EmptyState
            variant="hero"
            icon="UploadCloud"
            title="Upload your first meeting"
            description="Drop an audio or video file, record in your browser, or paste a link — CLARIX returns a summary and action items in ~12 seconds."
            actionHref="/meetings/new"
            actionLabel="Upload your first meeting"
            chips={["MP3 · MP4 · WAV · M4A", "Zoom · Meet · Teams links", "10 free this month"]}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m) => (
              <MeetingCard key={m.id} meeting={{ ...m, createdAt: m.createdAt }} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
