import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured, PLANS, type PlanId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function planFromPriceId(priceId: string | undefined): PlanId | null {
  if (!priceId) return null;
  for (const id of ["STARTER", "PRO", "BUSINESS"] as PlanId[]) {
    if (process.env[PLANS[id].priceEnv!] === priceId) return id;
  }
  return null;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const orgId = s.metadata?.orgId;
      const plan = (s.metadata?.plan as PlanId) ?? "PRO";
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan,
            stripeId: typeof s.customer === "string" ? s.customer : undefined,
            verticals: plan === "ENTERPRISE" ? ["HEALTHCARE", "LEGAL", "FINANCIAL"] : [],
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const plan = planFromPriceId(sub.items.data[0]?.price.id);
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      if (plan) {
        await prisma.organization.updateMany({ where: { stripeId: customer }, data: { plan } });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await prisma.organization.updateMany({ where: { stripeId: customer }, data: { plan: "FREE", verticals: [] } });
      break;
    }
    case "invoice.payment_failed": {
      // Hook for dunning email (Phase 9 / Resend). No plan change here.
      break;
    }
  }
  return NextResponse.json({ received: true });
}
