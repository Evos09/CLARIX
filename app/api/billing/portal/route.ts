import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  if (!org?.stripeId) return NextResponse.json({ error: "No billing account yet" }, { status: 409 });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripeId,
    return_url: `${base}/settings/billing`,
  });
  return NextResponse.json({ url: session.url });
}
