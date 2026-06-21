"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to your error tracker (e.g. Sentry) here when configured.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or head back to your dashboard.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className={cn(buttonVariants({ variant: "accent" }))}>Try again</button>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
