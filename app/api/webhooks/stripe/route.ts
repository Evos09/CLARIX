import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured, PLANS, type PlanId } from "@/lib/stripe";
import { addChatBonus, resetChatUsageForOrg } from "@/lib/globalChat";
import { CHAT_PACK_SIZE } from "@/lib/plan";
import { captureServer } from "@/lib/tracking-server";

export const dynamic = "force-dynamic";

function planFromPriceId(priceId: string | undefined): PlanId | null {
  if (!priceId) return null;
  for (const id of ["STARTER", "PRO", "BUSINESS"] as PlanId[]) {
    const cfg = PLANS[id];
    const monthly = cfg.priceEnv ? process.env[cfg.priceEnv] : undefined;
    const annual = cfg.annualPriceEnv ? process.env[cfg.annualPriceEnv] : undefined;
    if (priceId === monthly || priceId === annual) return id;
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

  // At-least-once delivery: Stripe retries and can redeliver. Skip anything we
  // already finished. The id is recorded only after success below, so a
  // mid-flight failure is retried rather than silently dropped.
  if (await prisma.stripeEvent.findUnique({ where: { id: event.id } })) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;

        if (s.metadata?.type === "chat_pack") {
          // One-time $9 overage pack — credit the buyer's current cycle.
          const userId = s.metadata.userId;
          const size = Number(s.metadata.packSize) || CHAT_PACK_SIZE;
          if (userId) {
            await addChatBonus(userId, size);
            captureServer("bought_chat_pack", s.metadata.orgId ?? userId, { size });
          }
          // Remember the customer so the portal + future checkouts reuse it.
          if (customerId && s.metadata.orgId) {
            await prisma.organization.updateMany({
              where: { id: s.metadata.orgId, stripeId: null },
              data: { stripeId: customerId },
            });
          }
          break;
        }

        // Subscription upgrade.
        const orgId = s.metadata?.orgId;
        const plan = (s.metadata?.plan as PlanId) ?? "PRO";
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan,
              stripeId: customerId ?? undefined,
              verticals: plan === "ENTERPRISE" ? ["HEALTHCARE", "LEGAL", "FINANCIAL"] : [],
            },
          });
          captureServer("upgraded_to_paid_plan", orgId, { plan });
          await resetChatUsageForOrg(orgId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = planFromPriceId(sub.items.data[0]?.price.id);
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        if (plan) {
          const orgs = await prisma.organization.findMany({ where: { stripeId: customer }, select: { id: true } });
          await prisma.organization.updateMany({ where: { stripeId: customer }, data: { plan } });
          for (const o of orgs) await resetChatUsageForOrg(o.id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const orgs = await prisma.organization.findMany({ where: { stripeId: customer }, select: { id: true } });
        await prisma.organization.updateMany({ where: { stripeId: customer }, data: { plan: "FREE", verticals: [] } });
        for (const o of orgs) await resetChatUsageForOrg(o.id);
        break;
      }
      case "invoice.payment_failed": {
        // Hook for dunning email (Phase 9 / Resend). No plan change here.
        break;
      }
    }
  } catch (err) {
    // Leave the event unrecorded so Stripe retries it.
    console.error(`stripe webhook ${event.type} failed:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } }).catch(() => {});
  return NextResponse.json({ received: true });
}
