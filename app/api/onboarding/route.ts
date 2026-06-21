import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext, hasDb } from "@/lib/auth";

const Body = z.object({
  orgName: z.string().min(1).max(120),
  useCase: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { orgName, useCase } = parsed.data;

  const ctx = await getAuthContext();
  // Demo mode: Clerk / DB not configured — acknowledge without persisting.
  if (!ctx || !hasDb) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const clerkOrgId = ctx.clerkOrgId ?? `personal_${ctx.clerkUserId}`;
  const org = await prisma.organization.upsert({
    where: { clerkOrgId },
    update: { name: orgName, useCase },
    create: { clerkOrgId, name: orgName, useCase, plan: "FREE" },
  });
  await prisma.user.upsert({
    where: { clerkId: ctx.clerkUserId },
    update: { email: ctx.email, orgId: org.id },
    create: { clerkId: ctx.clerkUserId, email: ctx.email, role: "ADMIN", orgId: org.id },
  });

  return NextResponse.json({ ok: true, orgId: org.id });
}
