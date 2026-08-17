import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { isClaudeConfigured } from "@/lib/claude";
import { detectMeetingType } from "@/lib/detect";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  if (!isClaudeConfigured()) {
    return NextResponse.json({ error: "AI not configured (ANTHROPIC_API_KEY)" }, { status: 503 });
  }

  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!meeting.rawTranscript) {
    return NextResponse.json({ error: "No transcript to analyze yet" }, { status: 409 });
  }

  const result = await detectMeetingType(meeting.rawTranscript);
  const updated = await prisma.meeting.update({
    where: { id },
    data: { detectedType: result.type, meetingType: meeting.autoDetect ? result.type : meeting.meetingType },
  });
  return NextResponse.json({ ...result, meetingType: updated.meetingType });
}
