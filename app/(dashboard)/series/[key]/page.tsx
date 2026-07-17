import Link from "next/link";
import { notFound } from "next/navigation";
import { format as fmtDate } from "date-fns";
import { CheckSquare, ListTodo, Gavel, ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getSeriesDetail } from "@/lib/series";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ key: string }> };

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "text-red-600",
  MEDIUM: "text-amber-600",
  LOW: "text-muted-foreground",
};

export default async function SeriesDetailPage({ params }: Params) {
  const { key } = await params;
  if (!hasDb) notFound();
  const ctx = await getOrCreateContext();
  if (!ctx) notFound();

  const detail = await getSeriesDetail(ctx.orgId, ctx.userId, decodeURIComponent(key));
  if (!detail) notFound();

  const { title, meetings, openItems, doneCount } = detail;
  const first = meetings[meetings.length - 1];
  const last = meetings[0];

  return (
    <>
      <TopNav title="Series" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div>
          <Link href="/series" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All series
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meetings.length} meetings · {fmtDate(first.createdAt, "MMM d")} – {fmtDate(last.createdAt, "MMM d, yyyy")}
            {" · "}
            {openItems.length} open · {doneCount} completed action items
          </p>
        </div>

        {/* Open action items across the whole series */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="size-4 text-accent" /> Open action items ({openItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openItems.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckSquare className="size-4 text-green-600" /> Nothing outstanding — every action item in this series is done.
              </p>
            ) : (
              <ul className="space-y-2">
                {openItems.map((it) => (
                  <li key={it.id} className="flex items-start justify-between gap-3 border-b border-border pb-2 text-sm last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="font-medium">{it.task}</span>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        {it.owner && <span>👤 {it.owner}</span>}
                        {it.dueDate && <span>📅 {it.dueDate}</span>}
                        {it.priority && <span className={PRIORITY_COLOR[it.priority] ?? ""}>{it.priority}</span>}
                        <Link href={`/meetings/${it.meetingId}`} className="hover:text-foreground">
                          from {fmtDate(it.meetingAt, "MMM d")}
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Decisions + summaries over time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gavel className="size-4 text-accent" /> Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {meetings.map((m) => (
              <div key={m.id} className="relative border-l-2 border-border pl-4">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <Link href={`/meetings/${m.id}`} className="font-medium hover:text-accent">
                    {m.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">{fmtDate(m.createdAt, "MMM d, yyyy")}</span>
                </div>
                {m.tldr && <p className="mt-1 text-sm text-muted-foreground">{m.tldr}</p>}
                {m.decisions.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {m.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
