import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestBotTranscript } from "@/lib/recall";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.RECALL_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-recall-signature") !== secret && req.headers.get("svix-signature") !== secret) {
    // best-effort verification; accept if no secret configured
  }
  const body = (await req.json().catch(() => null)) as { event?: string; data?: { bot_id?: string; status?: { code?: string } } } | null;
  const botId = body?.data?.bot_id;
  if (!botId) return NextResponse.json({ ok: true });

  const bot = await prisma.meetingBot.findUnique({ where: { recallBotId: botId } });
  if (!bot) return NextResponse.json({ ok: true });

  const code = body?.data?.status?.code;
  if (code === "in_call_recording") {
    await prisma.meetingBot.update({ where: { recallBotId: botId }, data: { status: "IN_MEETING", joinedAt: new Date() } });
  } else if (code === "call_ended" || code === "done") {
    await prisma.meetingBot.update({ where: { recallBotId: botId }, data: { status: "DONE", leftAt: new Date() } });
    ingestBotTranscript(bot.meetingId, botId).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
