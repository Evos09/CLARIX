import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getStripe, isStripeConfigured, PLANS, type PlanId } from "@/lib/stripe";

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

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    ...(customerId ? { customer: customerId } : {}),
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    subscription_data: {
      trial_period_days: 14,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    },
    payment_method_collection: "if_required",
    line_items: [{ price, quantity: 1 }],
    success_url: `${base}/settings/billing?status=success`,
    cancel_url: `${base}/settings/billing?status=cancel`,
    metadata: { orgId: ctx.orgId, plan: planId },
  });
  return NextResponse.json({ url: session.url });
}
