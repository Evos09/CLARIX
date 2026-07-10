import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { CHAT_PACK_SIZE } from "@/lib/plan";

/**
 * One-time purchase of a Clarix Chat overage pack ($9 / 100 messages). Creates a
 * `payment`-mode Checkout Session; the webhook credits ChatUsage.bonusMessages
 * on checkout.session.completed (keyed by the userId in metadata).
 */
export async function POST(req: Request) {
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const price = process.env.STRIPE_CHAT_PACK_PRICE_ID;
  if (!price) return NextResponse.json({ error: "Chat pack price not configured" }, { status: 503 });

  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const account = await prisma.user.findUnique({
    where: { id: ctx.userId },
    include: { org: true },
  });
  const customerId = account?.org.stripeId ?? undefined;
  const customerEmail = customerId ? undefined : account?.email || undefined;

  const base = appBaseUrl(req);
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Stripe Tax adds sales tax/VAT on top, gated by STRIPE_TAX_ENABLED so it
      // stays off until Stripe Tax is activated in the dashboard.
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === "true" },
      // One-time payments need an explicit method: dynamic payment methods only
      // auto-resolve for subscriptions here, so payment mode errored with
      // "No valid payment method types". Card covers the $9 overage pack.
      payment_method_types: ["card"],
      ...(customerId ? { customer: customerId } : {}),
      ...(customerId && process.env.STRIPE_TAX_ENABLED === "true" ? { customer_update: { address: "auto" } } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}/chat?pack=success`,
      cancel_url: `${base}/chat?pack=cancel`,
      metadata: { type: "chat_pack", userId: ctx.userId, orgId: ctx.orgId, packSize: String(CHAT_PACK_SIZE) },
      payment_intent_data: { metadata: { type: "chat_pack", userId: ctx.userId } },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Surface the Stripe reason (e.g. a test/live-mode mismatch or a recurring
    // price used in one-time payment mode) instead of a blank 500.
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    console.error("chat pack checkout failed:", err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
