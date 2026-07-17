import Link from "next/link";
import { format as fmtDate } from "date-fns";
import { Repeat, ArrowRight } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getSeriesList } from "@/lib/series";

export const metadata = { title: "Series" };
export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  let series: Awaited<ReturnType<typeof getSeriesList>> = [];
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) series = await getSeriesList(ctx.orgId, ctx.userId);
  }

  return (
    <>
      <TopNav title="Series" />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Series"
          title={<>Recurring meetings, <Accent>rolled up</Accent>.</>}
          description="CLARIX groups your recurring meetings — standups, 1:1s, weekly syncs — so you can track decisions and still-open action items across the whole series in one place."
        />

        {series.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No recurring series yet. Once you have two or more completed meetings that share a name
              (e.g. “Weekly Standup — Jul 3” and “Weekly Standup — Jul 10”), they’ll show up here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {series.map((s) => (
              <Link key={s.slug} href={`/series/${s.slug}`}>
                <Card className="transition-colors hover:border-accent/50">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Repeat className="size-4 shrink-0 text-accent" />
                        <span className="truncate font-medium">{s.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.count} meetings · {fmtDate(s.firstAt, "MMM d")} – {fmtDate(s.lastAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
