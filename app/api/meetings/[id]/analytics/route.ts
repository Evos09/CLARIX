import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getAccessibleMeeting } from "@/lib/meetingAccess";
import { isClaudeConfigured } from "@/lib/claude";
import { generateAnalytics } from "@/lib/analytics";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const meeting = await getAccessibleMeeting(id, ctx);
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meeting.status !== "COMPLETE") return NextResponse.json({ notReady: true });

  const existing = await prisma.meetingAnalytics.findUnique({ where: { meetingId: id } });
  if (existing) return NextResponse.json(existing);
  if (!isClaudeConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  try {
    return NextResponse.json(await generateAnalytics(id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Analytics failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const meeting = await getAccessibleMeeting(id, ctx, { requireEdit: true });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.meetingAnalytics.deleteMany({ where: { meetingId: id } });
  try {
    return NextResponse.json(await generateAnalytics(id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Analytics failed" }, { status: 500 });
  }
}
