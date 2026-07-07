import Link from "next/link";
import { Plus } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MeetingCard } from "@/components/meetings/MeetingCard";
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
        where: { orgId: ctx.orgId },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  return (
    <>
      <TopNav title="Meetings" />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Meetings"
          title={<>Every conversation, <Accent>captured</Accent>.</>}
          description="Your full meeting library — transcripts, summaries, and action items for everything CLARIX has processed."
        >
          <Link
            href="/meetings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/90"
          >
            <Plus className="size-4" /> New meeting
          </Link>
        </PageHeader>
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
