import Link from "next/link";
import { Plus } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { StatsGrid, type Stat } from "@/components/dashboard/StatsGrid";
import { UpcomingMeetings } from "@/components/calendar/UpcomingMeetings";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MeetingTypeBreakdown } from "@/components/dashboard/MeetingTypeBreakdown";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { OnboardingChecklist, type OnboardingStep } from "@/components/dashboard/OnboardingChecklist";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getMeetingType } from "@/lib/meetingTypes";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: Stat[] = [
    { label: "Meetings this month", value: "0", icon: "Mic" },
    { label: "Hours transcribed", value: "0.0", icon: "Clock" },
    { label: "Action items", value: "0 / 0", icon: "ListTodo", hint: "completed / created" },
    { label: "Avg duration", value: "—", icon: "Timer" },
  ];
  let breakdown: { name: string; value: number }[] = [];
  let recent: Awaited<ReturnType<typeof prisma.meeting.findMany>> = [];
  let onboarding: OnboardingStep[] = [];

  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [monthCount, agg, totalActions, doneActions, grouped, recentMeetings, totalMeetings, completedCount, calendarConn, digest] = await Promise.all([
        prisma.meeting.count({ where: { orgId: ctx.orgId, createdAt: { gte: monthStart } } }),
        prisma.meeting.aggregate({ where: { orgId: ctx.orgId }, _sum: { duration: true }, _avg: { duration: true } }),
        prisma.actionItem.count({ where: { orgId: ctx.orgId } }),
        prisma.actionItem.count({ where: { orgId: ctx.orgId, completed: true } }),
        prisma.meeting.groupBy({ by: ["meetingType"], where: { orgId: ctx.orgId }, _count: { _all: true } }),
        prisma.meeting.findMany({ where: { orgId: ctx.orgId }, orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.meeting.count({ where: { orgId: ctx.orgId } }),
        prisma.meeting.count({ where: { orgId: ctx.orgId, status: "COMPLETE" } }),
        prisma.calendarConnection.findUnique({ where: { userId: ctx.userId }, select: { connected: true } }),
        prisma.emailDigestSettings.findUnique({ where: { userId: ctx.userId }, select: { enabled: true } }),
      ]);

      onboarding = [
        { label: "Upload your first meeting", desc: "Drop an audio/video file or paste a link.", href: "/meetings/new", cta: "Upload", done: totalMeetings > 0 },
        { label: "Get your first summary", desc: "CLARIX returns a TL;DR + action items in ~12s.", href: "/meetings", cta: "View", done: completedCount > 0 },
        { label: "Connect your calendar", desc: "See upcoming meetings and enable auto-capture.", href: "/settings", cta: "Connect", done: Boolean(calendarConn?.connected) },
        { label: "Turn on your action-item digest", desc: "Get open + overdue items emailed to you.", href: "/settings", cta: "Enable", done: Boolean(digest?.enabled) },
      ];

      stats = [
        { label: "Meetings this month", value: String(monthCount), icon: "Mic" },
        { label: "Hours transcribed", value: ((agg._sum.duration ?? 0) / 3600).toFixed(1), icon: "Clock" },
        { label: "Action items", value: `${doneActions} / ${totalActions}`, icon: "ListTodo", hint: "completed / created" },
        { label: "Avg duration", value: formatDuration(Math.round(agg._avg.duration ?? 0)), icon: "Timer" },
      ];
      breakdown = grouped.map((g) => ({ name: getMeetingType(g.meetingType).label, value: g._count._all }));
      recent = recentMeetings;
    }
  }

  const hasMeetings = recent.length > 0;

  return (
    <>
      <TopNav title="Dashboard" showNewMeeting={false} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (document.cookie.includes("clarix_demo_meeting_id")) {
              document.cookie = "clarix_demo_meeting_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            }
          `,
        }}
      />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        {/* Editorial header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              <span className="size-1.5 rounded-full bg-accent" /> Dashboard
            </span>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Your meetings, <span className="font-display font-normal italic text-accent">handled</span>.
            </h1>
            <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
              Turn your next conversation into a summary and action items in about 12 seconds.
            </p>
          </div>
          <Link
            href="/meetings/new"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 sm:self-auto"
          >
            <Plus className="size-4" /> Upload meeting
          </Link>
        </header>

        {onboarding.length > 0 && onboarding.some((s) => !s.done) && (
          <OnboardingChecklist steps={onboarding} />
        )}

        <StatsGrid stats={stats} />

        {/* Recent meetings — primary focus */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent meetings</h2>
            {hasMeetings && (
              <Link href="/meetings" className="text-sm font-medium text-accent hover:underline">
                View all →
              </Link>
            )}
          </div>
          {hasMeetings ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((m) => <MeetingCard key={m.id} meeting={m} />)}
            </div>
          ) : (
            <EmptyState
              variant="hero"
              icon="UploadCloud"
              title="Upload your first meeting"
              description="Drop an audio or video file or paste a link — CLARIX returns a summary and action items in about 12 seconds."
              actionHref="/meetings/new"
              actionLabel="Upload your first meeting"
              chips={["MP3 · MP4 · WAV · M4A", "Zoom · Meet · Teams links", "3 free this month"]}
            />
          )}
        </section>

        {/* Secondary: upcoming + meeting mix */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingMeetings />
          {breakdown.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Meeting mix</CardTitle></CardHeader>
              <CardContent><MeetingTypeBreakdown data={breakdown} /></CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
