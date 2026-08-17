import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { isSalesforceConfigured } from "@/lib/crm/salesforce";
import { isHubSpotConfigured } from "@/lib/crm/hubspot";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const conn = await prisma.cRMConnection.findUnique({ where: { userId: ctx.userId }, select: { provider: true, connected: true } });
  return NextResponse.json({ configured: { salesforce: isSalesforceConfigured(), hubspot: isHubSpotConfigured() }, connection: conn });
}

export async function DELETE() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  await prisma.cRMConnection.deleteMany({ where: { userId: ctx.userId } });
  return NextResponse.json({ disconnected: true });
}
