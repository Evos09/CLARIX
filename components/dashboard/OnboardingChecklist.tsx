"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

export interface OnboardingStep {
  label: string;
  desc: string;
  href: string;
  cta: string;
  done: boolean;
}

const DISMISS_KEY = "clarix_onboarding_dismissed";

export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  if (dismissed) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Get the most out of CLARIX</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {doneCount}/{steps.length} done · finish setup to put CLARIX on autopilot.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ol className="space-y-2.5">
        {steps.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3"
          >
            <span
              className={
                s.done
                  ? "grid size-6 shrink-0 place-items-center rounded-full bg-teal text-white"
                  : "grid size-6 shrink-0 place-items-center rounded-full border-2 border-border text-transparent"
              }
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <div className={s.done ? "text-sm font-medium text-muted-foreground line-through" : "text-sm font-medium text-foreground"}>
                {s.label}
              </div>
              {!s.done && <div className="text-xs text-muted-foreground">{s.desc}</div>}
            </div>
            {!s.done && (
              <Link
                href={s.href}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700"
              >
                {s.cta} <ArrowRight className="size-3" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
