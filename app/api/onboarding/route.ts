import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext, hasDb } from "@/lib/auth";
import { cookies } from "next/headers";

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
  const user = await prisma.user.upsert({
    where: { clerkId: ctx.clerkUserId },
    update: { email: ctx.email, orgId: org.id },
    create: { clerkId: ctx.clerkUserId, email: ctx.email, role: "ADMIN", orgId: org.id },
  });

  // Auto-claim demo meeting if it exists in cookies
  const cookieStore = await cookies();
  const demoMeetingId = cookieStore.get("clarix_demo_meeting_id")?.value;
  if (demoMeetingId) {
    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id: demoMeetingId },
      });
      if (meeting) {
        const { getOrCreateAnonymousContext } = await import("@/lib/auth");
        const anonCtx = await getOrCreateAnonymousContext();
        if (meeting.userId === anonCtx.userId && meeting.orgId === anonCtx.orgId) {
          await prisma.$transaction([
            prisma.meeting.update({
              where: { id: demoMeetingId },
              data: {
                userId: user.id,
                orgId: org.id,
              },
            }),
            prisma.actionItem.updateMany({
              where: { meetingId: demoMeetingId },
              data: {
                orgId: org.id,
              },
            }),
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to auto-claim demo meeting during onboarding:", e);
    }
  }

  return NextResponse.json({ ok: true, orgId: org.id });
}

