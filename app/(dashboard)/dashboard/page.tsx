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
        <StatsGrid stats={stats} />
        <UpcomingMeetings />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Recent meetings</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <EmptyState icon="Mic" title="No meetings yet" description="Upload or record to get started." actionHref="/meetings/new" actionLabel="New meeting" />
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
