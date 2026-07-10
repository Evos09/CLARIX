import { icons } from "lucide-react";

export interface Stat {
  label: string;
  value: string;
  icon: string;
  hint?: string;
}

/**
 * Stripe-style stat band: one quiet card, cells separated by hairline
 * dividers. Label + tiny icon on top, large tabular value underneath.
 */
export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = icons[s.icon as keyof typeof icons] ?? icons.Activity;
        return (
          <div
            key={s.label}
            className={[
              "p-5",
              i % 2 === 1 ? "border-l border-border" : "",
              i >= 2 ? "border-t border-border lg:border-t-0" : "",
              i > 0 ? "lg:border-l lg:border-border" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Icon className="size-3.5 text-muted-foreground/70" />
              {s.label}
            </div>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {s.value}
            </p>
            {s.hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{s.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
