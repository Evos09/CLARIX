"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const FEATURES: Record<PlanId, string[]> = {
  FREE: ["3 meetings / month", "General meeting type", "Summary + action items"],
  STARTER: ["20 meetings / month", "All standard meeting types", "PDF, DOCX & CSV export", "Auto-join meeting bot", "Forever audio library"],
  PRO: ["Unlimited meetings", "All standard meeting types", "PDF, DOCX, CSV & JSON export", "Ask CLARIX chat (200/mo)", "Auto-join meeting bot", "Forever audio library", "Voice Mode (Coming Soon)"],
  ENTERPRISE: ["Everything in Pro", "Pro Verticals (Health/Legal/Finance)", "Custom templates", "SSO / SAML (Coming Soon)", "EHR / FHIR export"],
};

const ORDER: PlanId[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export function PricingTable({
  highlight = "PRO",
  currentPlan = "FREE",
}: {
  highlight?: PlanId;
  currentPlan?: PlanId;
}) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: string) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingPeriod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initialize checkout");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to redirect to checkout");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open billing portal");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Monthly / Yearly Toggle */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
              billingPeriod === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5",
              billingPeriod === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setBillingPeriod("yearly")}
          >
            Yearly
            <span className="rounded-full bg-teal-500 text-white px-2 py-0.5 text-[9px] font-bold">
              Save ~20%
            </span>
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ORDER.map((id) => {
          const plan = PLANS[id];
          const featured = id === highlight;
          const isCurrent = id === currentPlan;
          const price = billingPeriod === "yearly" ? plan.annualPrice ?? plan.price : plan.price;

          return (
            <Card
              key={id}
              className={cn(
                "flex flex-col justify-between transition-all duration-200",
                featured && "border-teal ring-2 ring-teal/30 scale-105 md:scale-100 lg:scale-105"
              )}
            >
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {plan.name}
                    {featured && (
                      <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold tracking-tight">${price}</span>
                    <span className="text-sm font-normal text-muted-foreground">/user/mo</span>
                    {price > 0 && billingPeriod === "yearly" && (
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-sm">
                    {FEATURES[id].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-slate-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-teal-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
              <CardFooter className="pt-6">
                {isCurrent ? (
                  id === "FREE" ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full border-teal text-teal hover:bg-teal-50"
                      variant="outline"
                      onClick={handlePortal}
                      disabled={!!loading}
                    >
                      {loading === "portal" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Manage Billing"
                      )}
                    </Button>
                  )
                ) : id === "FREE" ? (
                  <Button className="w-full font-medium" variant="outline" disabled>
                    Basic Tier
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "w-full font-semibold",
                      featured ? "bg-teal hover:bg-teal-600 text-white" : "border-teal text-teal hover:bg-teal-50"
                    )}
                    variant={featured ? "default" : "outline"}
                    onClick={() => handleCheckout(id)}
                    disabled={!!loading}
                  >
                    {loading === id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      `Select ${plan.name}`
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
