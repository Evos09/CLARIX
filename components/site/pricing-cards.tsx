"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { plans } from "@/lib/site-data";

export function BillingToggle({
  isAnnual,
  onChange,
}: {
  isAnnual: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
        Monthly
      </span>
      <button
        type="button"
        onClick={() => onChange(!isAnnual)}
        className="relative w-14 h-7 bg-foreground/10 rounded-full p-1 transition-colors hover:bg-foreground/20"
        aria-label="Toggle annual billing"
      >
        <div
          className={`w-5 h-5 bg-foreground rounded-full transition-transform duration-300 ${
            isAnnual ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
        Annual
      </span>
    </div>
  );
}

export function PricingCards({ showToggle = true }: { showToggle?: boolean }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div>
      {showToggle && (
        <div className="mb-12">
          <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10 rounded-xl overflow-hidden">
        {plans.map((plan, idx) => {
          const price = isAnnual ? plan.price.annual : plan.price.monthly;
          return (
            <div
              key={plan.name}
              className={`relative bg-background p-7 flex flex-col ${
                plan.popular ? "ring-1 ring-inset ring-foreground" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 px-3 py-1 bg-brand text-brand-foreground text-[10px] font-mono uppercase tracking-widest">
                  Most popular
                </span>
              )}

              <div className="mb-6">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed min-h-[2.5rem]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 pb-6 border-b border-foreground/10">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl">${typeof price === "number" && !Number.isInteger(price) ? price.toFixed(2) : price}</span>
                  <span className="text-sm text-muted-foreground">{plan.unit}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                    <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-medium rounded-full transition-all group ${
                  plan.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
