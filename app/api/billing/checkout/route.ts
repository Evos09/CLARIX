import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { appBaseUrl, getStripe, isStripeConfigured, PLANS, type PlanId } from "@/lib/stripe";

const Body = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
  billingPeriod: z.enum(["monthly", "yearly"]).optional().default("monthly"),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const planId = parsed.data.plan as PlanId;
  const billingPeriod = parsed.data.billingPeriod;
  const planCfg = PLANS[planId];
  const priceEnv = billingPeriod === "yearly" ? planCfg.annualPriceEnv : planCfg.priceEnv;
  const price = priceEnv ? process.env[priceEnv] : undefined;
  if (!price) return NextResponse.json({ error: `Missing price id (${priceEnv})` }, { status: 503 });

  // Reuse this org's existing Stripe customer so repeat checkouts don't spawn
  // duplicates (which would break the portal + webhook stripeId lookup). Fall
  // back to prefilling the email so Stripe can still match/associate.
  const account = await prisma.user.findUnique({
    where: { id: ctx.userId },
    include: { org: true },
  });
  const customerId = account?.org.stripeId ?? undefined;
  const customerEmail = customerId ? undefined : account?.email || undefined;

  const stripe = getStripe();
  const base = appBaseUrl(req);
  // The 14-day trial is a first-time-only offer: anyone we've already created a
  // Stripe customer for has had their shot and pays immediately from here on.
  const isReturning = Boolean(customerId);

  try {
    // If they already have a live subscription, a plan change must go through
    // the Billing Portal — opening a second Checkout subscription would double
    // bill them (and hand out another trial). Send them there to switch.
    if (customerId) {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
      const hasLiveSub = subs.data.some((s) =>
        ["active", "trialing", "past_due", "unpaid"].includes(s.status),
      );
      if (hasLiveSub) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${base}/settings/billing`,
        });
        return NextResponse.json({ url: portal.url });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(customerId ? { customer: customerId } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      subscription_data: {
        // Trial only for genuinely new customers; returning ones are billed now.
        ...(isReturning
          ? {}
          : { trial_period_days: 14, trial_settings: { end_behavior: { missing_payment_method: "cancel" } } }),
        metadata: { orgId: ctx.orgId, plan: planId },
      },
      // Always capture a card, including for the trial: Stripe auto-charges when
      // the 14 days end, and cancelling before then charges nothing.
      payment_method_collection: "always",
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}/settings/billing?status=success`,
      cancel_url: `${base}/settings/billing?status=cancel`,
      metadata: { orgId: ctx.orgId, plan: planId },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    console.error("checkout failed:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
