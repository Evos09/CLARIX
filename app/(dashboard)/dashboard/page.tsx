import Link from "next/link";
import { format as fmtDate } from "date-fns";
import { Plus, Repeat, ArrowRight, FolderPlus, Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { StatsGrid, type Stat } from "@/components/dashboard/StatsGrid";
import { UpcomingMeetings } from "@/components/calendar/UpcomingMeetings";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MeetingTypeBreakdown } from "@/components/dashboard/MeetingTypeBreakdown";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { OnboardingChecklist, type OnboardingStep } from "@/components/dashboard/OnboardingChecklist";
import { GlassModeButton } from "@/components/desktop/GlassModeButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getMeetingType } from "@/lib/meetingTypes";
import { getSeriesList, type SeriesSummary } from "@/lib/series";
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
  let series: SeriesSummary[] = [];

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
      series = (await getSeriesList(ctx.orgId, ctx.userId)).slice(0, 4);
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
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 p-4 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
              Overview
            </p>
            <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Your meetings at a glance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmtDate(new Date(), "EEEE, MMMM d")} — everything from this month in one place.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            {/* Desktop app only — renders nothing in a browser. */}
            <GlassModeButton />
            <Link
              href="/meetings/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-600 hover:shadow-md"
            >
              <Plus className="size-4" /> Upload meeting
            </Link>
          </div>
        </header>

        {onboarding.length > 0 && onboarding.some((s) => !s.done) && (
          <OnboardingChecklist steps={onboarding} />
        )}

        <StatsGrid stats={stats} />

        {/* Recent meetings — primary focus */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-baseline gap-3">
              <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Recent meetings
              </h2>
              <span className="hidden h-px flex-1 bg-border sm:block sm:min-w-16" aria-hidden />
            </div>
            {hasMeetings && (
              <Link href="/meetings" className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors hover:text-accent">
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
              chips={["MP3 · MP4 · WAV · M4A", "Zoom · Meet · Teams links", "10 free this month"]}
            />
          )}
        </section>

        {/* Recurring series rollup */}
        {series.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-baseline gap-3">
                <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Series
                </h2>
                <span className="hidden h-px flex-1 bg-border sm:block sm:min-w-16" aria-hidden />
              </div>
              <Link href="/series" className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors hover:text-accent">
                View all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {series.map((s) => (
                <Link key={`${s.kind}-${s.slug}`} href={`/series/${s.slug}`} className="group">
                  <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/[0.08] text-accent">
                        {s.kind === "custom" ? <FolderPlus className="size-4" /> : <Repeat className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{s.title}</span>
                          {s.kind === "custom" && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-accent">
                              <Sparkles className="size-2.5" /> Custom
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {s.count} meeting{s.count === 1 ? "" : "s"} · last {fmtDate(s.lastAt, "MMM d")}
                        </span>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Secondary: upcoming + meeting mix */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              This month
            </h2>
            <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingMeetings />
            {breakdown.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Meeting mix</CardTitle></CardHeader>
                <CardContent><MeetingTypeBreakdown data={breakdown} /></CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
