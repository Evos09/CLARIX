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
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    ...(customerId ? { customer: customerId } : {}),
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [{ price, quantity: 1 }],
    success_url: `${base}/chat?pack=success`,
    cancel_url: `${base}/chat?pack=cancel`,
    metadata: { type: "chat_pack", userId: ctx.userId, orgId: ctx.orgId, packSize: String(CHAT_PACK_SIZE) },
    payment_intent_data: { metadata: { type: "chat_pack", userId: ctx.userId } },
  });
  return NextResponse.json({ url: session.url });
}
