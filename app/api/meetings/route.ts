import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { canCreateMeeting, canUseType, getOrgPlan } from "@/lib/plan";

const CreateBody = z.object({
  title: z.string().min(1).max(200),
  meetingType: z.string().default("GENERAL"),
  autoDetect: z.boolean().default(false),
  storagePath: z.string().optional(),
  audioUrl: z.string().optional(),
});

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const meetings = await prisma.meeting.findMany({
    where: { orgId: ctx.orgId },
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
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { title, meetingType, autoDetect, storagePath, audioUrl } = parsed.data;

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
      status: "UPLOADING",
      orgId: ctx.orgId,
      userId: ctx.userId,
    },
    select: { id: true, status: true },
  });
  return NextResponse.json(meeting, { status: 201 });
}
