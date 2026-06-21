import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlanLockedChat() {
  return (
    <div className="relative grid min-h-[80vh] place-items-center overflow-hidden p-6">
      <div className="pointer-events-none absolute -z-10 size-96 rounded-full bg-teal/10 blur-3xl" />
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-teal/15 text-teal-600">
          <Lock className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold">CLARIX AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask anything across all your meetings — decisions, action items, commitments, summaries — all in one
          conversation. Available on Pro and Max plans.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 opacity-60">
          {["What did we decide this week?", "Action items due Friday", "Summarize client calls"].map((s) => (
            <span key={s} className="rounded-full border border-border px-3 py-1 text-xs">{s}</span>
          ))}
        </div>
        <Link href="/settings/billing" className={cn(buttonVariants({ variant: "accent" }), "mt-6")}>
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
