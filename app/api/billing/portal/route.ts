import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { appBaseUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  if (!org?.stripeId) return NextResponse.json({ error: "No billing account yet" }, { status: 409 });

  const base = appBaseUrl(req);
  const session = await getStripe().billingPortal.sessions.create({
    customer: org.stripeId,
    return_url: `${base}/settings/billing`,
  });
  return NextResponse.json({ url: session.url });
}
