import Link from "next/link";
import { format as fmtDate } from "date-fns";
import { Repeat, ArrowRight, FolderPlus } from "lucide-react";
import { NewSeriesButton, DeleteSeriesButton } from "@/components/series/SeriesActions";
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            eyebrow="Series"
            title={<>Recurring meetings, <Accent>rolled up</Accent>.</>}
            description="CLARIX auto-groups recurring meetings by name, and you can create your own series from any meetings you pick. New meetings matching a series name join it automatically."
          />
          <NewSeriesButton />
        </div>

        {series.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No series yet. Create one with “New series”, or upload two or more meetings that share a name
              (e.g. “Weekly Standup — Jul 3” and “Weekly Standup — Jul 10”) and they’ll be grouped automatically.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {series.map((s) => (
              <Link key={`${s.kind}-${s.slug}`} href={`/series/${s.slug}`}>
                <Card className="transition-colors hover:border-accent/50">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {s.kind === "custom" ? (
                          <FolderPlus className="size-4 shrink-0 text-accent" />
                        ) : (
                          <Repeat className="size-4 shrink-0 text-accent" />
                        )}
                        <span className="truncate font-medium">{s.title}</span>
                        {s.kind === "custom" && (
                          <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.count} meeting{s.count === 1 ? "" : "s"}
                        {s.count > 0 && <> · {fmtDate(s.firstAt, "MMM d")} – {fmtDate(s.lastAt, "MMM d, yyyy")}</>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <DeleteSeriesButton slug={s.slug} kind={s.kind} />
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
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
