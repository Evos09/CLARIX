import Link from "next/link";
import { Plus } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { StatsGrid, type Stat } from "@/components/dashboard/StatsGrid";
import { UpcomingMeetings } from "@/components/calendar/UpcomingMeetings";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MeetingTypeBreakdown } from "@/components/dashboard/MeetingTypeBreakdown";
import { MeetingCard } from "@/components/meetings/MeetingCard";
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

  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [monthCount, agg, totalActions, doneActions, grouped, recentMeetings] = await Promise.all([
        prisma.meeting.count({ where: { orgId: ctx.orgId, createdAt: { gte: monthStart } } }),
        prisma.meeting.aggregate({ where: { orgId: ctx.orgId }, _sum: { duration: true }, _avg: { duration: true } }),
        prisma.actionItem.count({ where: { orgId: ctx.orgId } }),
        prisma.actionItem.count({ where: { orgId: ctx.orgId, completed: true } }),
        prisma.meeting.groupBy({ by: ["meetingType"], where: { orgId: ctx.orgId }, _count: { _all: true } }),
        prisma.meeting.findMany({ where: { orgId: ctx.orgId }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);

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

  return (
    <>
      <TopNav title="Dashboard" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <section
          className="relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8"
          style={{ background: "linear-gradient(120deg,#0A1628,#122340)" }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle,rgba(0,200,180,.22),transparent 65%)" }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Welcome to CLARIX <span className="align-middle">👋</span>
              </h2>
              <p className="mt-1.5 text-[15px] text-white/70">
                Turn your next meeting into a summary and action items in ~12 seconds.
              </p>
            </div>
            <Link
              href="/meetings/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-bold text-navy shadow-[0_6px_18px_rgba(0,200,180,.32)] transition hover:-translate-y-0.5 hover:bg-teal-600"
            >
              <Plus className="size-4" /> Upload meeting
            </Link>
          </div>
        </section>
        <StatsGrid stats={stats} />
        <UpcomingMeetings />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Recent meetings</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <EmptyState
                  variant="hero"
                  icon="UploadCloud"
                  title="Upload your first meeting"
                  description="Drop an audio or video file or paste a link — CLARIX returns a summary and action items in ~12 seconds."
                  actionHref="/meetings/new"
                  actionLabel="Upload your first meeting"
                  chips={["MP3 · MP4 · WAV · M4A", "Zoom · Meet · Teams links", "10 free this month"]}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recent.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Meeting types</CardTitle></CardHeader>
            <CardContent><MeetingTypeBreakdown data={breakdown} /></CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
