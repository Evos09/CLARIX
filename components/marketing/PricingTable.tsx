"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/stripe";
import { track } from "@/lib/tracking";
import { cn } from "@/lib/utils";

const FEATURES: Record<PlanId, string[]> = {
  FREE: ["10 meetings / month", "General meeting type", "Summary + action items", "PDF export"],
  STARTER: ["20 meetings / month", "All standard meeting types", "25 Clarix Chat messages / month", "PDF, DOCX & CSV export", "Auto-join meeting bot", "Forever audio library"],
  PRO: ["Unlimited meetings", "All standard meeting types", "PDF, DOCX, CSV & JSON export", "100 Clarix Chat messages / month", "Auto-join meeting bot", "Forever audio library", "Voice Mode (Coming Soon)"],
  BUSINESS: ["Everything in Pro", "Unlimited Clarix Chat", "Custom AI templates", "Team sharing", "Priority support"],
  ENTERPRISE: ["Everything in Business", "Pro Verticals (Health/Legal/Finance)", "EHR / FHIR export", "SSO / SAML (Coming Soon)", "Salesforce & HubSpot CRM (Coming Soon)", "SLA & dedicated support"],
};

// ENTERPRISE is sales-led (talk to sales) — not shown as a self-serve checkout card.
const ORDER: PlanId[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

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
    track("InitiateCheckout", { plan, billingPeriod });
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
                featured && "border-accent ring-2 ring-accent/30 scale-105 md:scale-100 lg:scale-105"
              )}
            >
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {plan.name}
                    {featured && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
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
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
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
                      className="w-full border-accent text-accent hover:bg-accent/10"
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
                      featured ? "bg-accent hover:bg-accent/90 text-white" : "border-accent text-accent hover:bg-accent/10"
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
