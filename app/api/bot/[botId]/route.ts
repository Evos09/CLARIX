import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { leaveBot, ingestBotTranscript } from "@/lib/recall";

type Params = { params: Promise<{ botId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { botId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const bot = await prisma.meetingBot.findUnique({ where: { recallBotId: botId } });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await leaveBot(botId);
  await prisma.meetingBot.update({ where: { recallBotId: botId }, data: { status: "DONE", leftAt: new Date() } });
  ingestBotTranscript(bot.meetingId, botId).catch(() => {});
  return NextResponse.json({ ok: true });
}
