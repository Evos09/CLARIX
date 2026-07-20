"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// The custom-series interactive sections are loaded client-only (ssr: false) so
// they never participate in the server render / RSC serialization for the
// series detail route. This keeps a render hiccup in these widgets from taking
// down the whole page with a 500 — the page shell, timeline, and action items
// still render server-side.

export const SeriesInsightsLazy = dynamic(
  () => import("./SeriesInsights").then((m) => m.SeriesInsights),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading series insights…
      </div>
    ),
  },
);

export const ManageSeriesMeetingsLazy = dynamic(
  () => import("./SeriesActions").then((m) => m.ManageSeriesMeetings),
  { ssr: false },
);
