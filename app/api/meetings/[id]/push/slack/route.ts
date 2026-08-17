import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { pushToSlack } from "@/lib/push/slack";
import type { BaseOutput } from "@/lib/outputTypes";

type Params = { params: Promise<{ id: string }> };
const Body = z.object({ channelId: z.string().min(1) });

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const conn = await prisma.slackConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Connect Slack in Settings first." }, { status: 409 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  if (!output) return NextResponse.json({ error: "No analysis to push yet." }, { status: 409 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick a channel" }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    await pushToSlack(decryptToken(conn.accessToken), parsed.data.channelId, meeting.title, `${base}/meetings/${id}`, output);
    await prisma.integrationPush.create({ data: { meetingId: id, userId: ctx.userId, platform: "SLACK", destination: parsed.data.channelId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Push failed" }, { status: 500 });
  }
}
