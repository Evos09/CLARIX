import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateContext } from "@/lib/auth";
import { getStripe, isStripeConfigured, PLANS, type PlanId } from "@/lib/stripe";

const Body = z.object({ plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]) });

export async function POST(req: Request) {
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const planId = parsed.data.plan as PlanId;
  const priceEnv = PLANS[planId].priceEnv;
  const price = priceEnv ? process.env[priceEnv] : undefined;
  if (!price) return NextResponse.json({ error: `Missing price id (${priceEnv})` }, { status: 503 });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${base}/settings/billing?status=success`,
    cancel_url: `${base}/settings/billing?status=cancel`,
    metadata: { orgId: ctx.orgId, plan: planId },
  });
  return NextResponse.json({ url: session.url });
}
