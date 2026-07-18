import { icons } from "lucide-react";

export interface Stat {
  label: string;
  value: string;
  icon: string;
  hint?: string;
}

/**
 * Stripe-style stat band: one quiet card, cells separated by hairline
 * dividers. Icon chip + mono micro-label on top, large tabular value under.
 */
export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_0_rgb(16_24_40/0.04)] lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = icons[s.icon as keyof typeof icons] ?? icons.Activity;
        return (
          <div
            key={s.label}
            className={[
              "group p-5 transition-colors hover:bg-muted/40",
              i % 2 === 1 ? "border-l border-border" : "",
              i >= 2 ? "border-t border-border lg:border-t-0" : "",
              i > 0 ? "lg:border-l lg:border-border" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/[0.08] text-accent transition-colors group-hover:bg-accent/[0.14]">
                <Icon className="size-3.5" />
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </span>
            </div>
            <p className="mt-3.5 text-[28px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {s.value}
            </p>
            {s.hint && <p className="mt-2 text-xs text-muted-foreground/70">{s.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
