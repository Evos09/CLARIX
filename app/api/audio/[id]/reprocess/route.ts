import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { canUseType, getOrgPlan } from "@/lib/plan";
import { isClaudeConfigured } from "@/lib/claude";
import { processMeeting } from "@/lib/processing";
import { startTranscription } from "@/lib/transcription";
import { isAssemblyConfigured } from "@/lib/assemblyai";

type Params = { params: Promise<{ id: string }> };
const Body = z.object({ meetingType: z.string().min(1) });

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const plan = await getOrgPlan(ctx.orgId);
  const gate = canUseType(plan, parsed.data.meetingType);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  await prisma.meeting.update({
    where: { id },
    data: { meetingType: parsed.data.meetingType, structuredOutput: undefined, processingCount: { increment: 1 } },
  });

  if (!meeting.rawTranscript) {
    if (!isAssemblyConfigured()) return NextResponse.json({ error: "Transcription not configured" }, { status: 503 });
    await startTranscription(id);
    return NextResponse.json({ meetingId: id, status: "TRANSCRIBING" });
  }
  if (!isClaudeConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  processMeeting(id).catch(() => {});
  return NextResponse.json({ meetingId: id, status: "PROCESSING" });
}
