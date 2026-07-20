"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Route-scoped boundary: if a series detail page fails to render, degrade to a
// friendly retry inside the dashboard chrome instead of the global 500 page.
export default function SeriesDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Series detail render failed:", error);
  }, [error]);

  return (
    <main className="flex-1 p-4 md:p-8">
      <Link href="/series" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All series
      </Link>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <h1 className="text-lg font-semibold">This series couldn’t load</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Something went wrong building this series view. Your meetings and notes are safe — try again, or head back to all series.
        </p>
        {error.digest && <p className="font-mono text-[11px] text-muted-foreground">ref: {error.digest}</p>}
        <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" onClick={reset}>
            <RotateCw className="size-4" /> Try again
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/series">All series</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
