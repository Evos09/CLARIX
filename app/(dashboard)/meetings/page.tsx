import { TopNav } from "@/components/layout/TopNav";
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
      <main className="flex-1 p-4 md:p-6">
        {meetings.length === 0 ? (
          <EmptyState
            icon="Mic"
            title="No meetings yet"
            description="Upload a recording or record in your browser to get started."
            actionHref="/meetings/new"
            actionLabel="New meeting"
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
