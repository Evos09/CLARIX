import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { pushToLinear } from "@/lib/push/linear";
import type { BaseOutput } from "@/lib/outputTypes";

type Params = { params: Promise<{ id: string }> };
const Body = z.object({ teamId: z.string().min(1).optional() });

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const conn = await prisma.linearConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Connect Linear in Settings first." }, { status: 409 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  if (!output) return NextResponse.json({ error: "No analysis to push yet." }, { status: 409 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  
  const teamId = parsed.success && parsed.data.teamId ? parsed.data.teamId : conn.defaultTeamId;
  if (!teamId) return NextResponse.json({ error: "Pick a team or configure a default team in Settings." }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const count = await pushToLinear(decryptToken(conn.accessToken), teamId, meeting.title, `${base}/meetings/${id}`, output);
    await prisma.integrationPush.create({ data: { meetingId: id, userId: ctx.userId, platform: "LINEAR", destination: conn.organizationName } });
    return NextResponse.json({ success: true, issuesCreated: count });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Push failed" }, { status: 500 });
  }
}
