import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isRecallConfigured, detectPlatform, createBot } from "@/lib/recall";
import { canCreateMeeting, canUseType, getOrgPlan } from "@/lib/plan";

const Body = z.object({ meetingUrl: z.string().url(), title: z.string().min(1).max(200), meetingType: z.string().default("GENERAL") });

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isRecallConfigured()) return NextResponse.json({ error: "Meeting bot not configured (MEETING_BAAS_API_KEY)" }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Paste a valid meeting URL" }, { status: 400 });

  const gate = await canCreateMeeting(ctx.orgId);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  const typeGate = canUseType(await getOrgPlan(ctx.orgId), parsed.data.meetingType);
  if (!typeGate.ok) return NextResponse.json({ error: typeGate.reason }, { status: 403 });

  const platform = detectPlatform(parsed.data.meetingUrl);
  if (platform === "UNKNOWN") return NextResponse.json({ error: "Unsupported meeting link. Use Zoom, Google Meet, or Teams." }, { status: 400 });

  const meeting = await prisma.meeting.create({
    data: { title: parsed.data.title, meetingType: parsed.data.meetingType, status: "TRANSCRIBING", orgId: ctx.orgId, userId: ctx.userId },
    select: { id: true },
  });

  try {
    const bot = await createBot(parsed.data.meetingUrl, parsed.data.title);
    await prisma.meetingBot.create({
      data: { recallBotId: bot.id, meetingId: meeting.id, platform, meetingUrl: parsed.data.meetingUrl, status: "JOINING" },
    });
    return NextResponse.json({ meetingId: meeting.id, botId: bot.id, status: "JOINING", platform });
  } catch (e) {
    await prisma.meeting.update({ where: { id: meeting.id }, data: { status: "ERROR" } });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Bot failed to join" }, { status: 500 });
  }
}
