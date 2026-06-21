import { TopNav } from "@/components/layout/TopNav";
import { PricingTable } from "@/components/marketing/PricingTable";
import { BillingActions } from "@/components/marketing/BillingActions";
import { PlanBadge } from "@/components/layout/PlanBadge";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getOrgPlan } from "@/lib/plan";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  let planId: "FREE" | "STARTER" | "PRO" | "ENTERPRISE" = "FREE";
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) planId = (await getOrgPlan(ctx.orgId)).id;
  }

  return (
    <>
      <TopNav title="Billing" />
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Plans</h2>
          <PlanBadge plan={planId} />
        </div>
        {!isStripeConfigured() && (
          <p className="text-sm text-muted-foreground">
            Add Stripe keys + price IDs to <code className="font-mono">.env.local</code> to enable checkout.
          </p>
        )}
        <BillingActions />
        <PricingTable highlight="PRO" />
      </main>
    </>
  );
}
