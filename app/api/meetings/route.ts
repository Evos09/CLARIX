import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { canCreateMeeting, canUseType, getOrgPlan } from "@/lib/plan";
import { meetingLimiter, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

const CreateBody = z.object({
  title: z.string().min(1).max(200),
  meetingType: z.string().default("GENERAL"),
  autoDetect: z.boolean().default(false),
  storagePath: z.string().optional(),
  audioUrl: z.string().optional(),
  audioSize: z.number().int().positive().optional(),
  audioFilename: z.string().max(255).optional(),
  consentAcknowledged: z.boolean().optional(),
});

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [{ orgId: ctx.orgId }, { collaborators: { some: { userId: ctx.userId } } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      meetingType: true,
      detectedType: true,
      status: true,
      duration: true,
      speakerCount: true,
      language: true,
      createdAt: true,
    },
  });
  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  if (!meetingLimiter.limit(clientIp(req)).success) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { title, meetingType, autoDetect, storagePath, audioUrl, audioSize, audioFilename, consentAcknowledged } = parsed.data;

  const gate = await canCreateMeeting(ctx.orgId);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  if (!autoDetect) {
    const plan = await getOrgPlan(ctx.orgId);
    const typeGate = canUseType(plan, meetingType);
    if (!typeGate.ok) return NextResponse.json({ error: typeGate.reason }, { status: 403 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title,
      meetingType: autoDetect ? "GENERAL" : meetingType,
      autoDetect,
      storagePath,
      audioUrl,
      audioSize,
      audioFilename,
      consentAcknowledged: consentAcknowledged ?? false,
      consentAcknowledgedAt: consentAcknowledged ? new Date() : null,
      status: "UPLOADING",
      orgId: ctx.orgId,
      userId: ctx.userId,
    },
    select: { id: true, status: true },
  });
  return NextResponse.json(meeting, { status: 201 });
}
