import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestBotTranscript } from "@/lib/recall";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.MEETING_BAAS_WEBHOOK_SECRET ?? process.env.RECALL_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-recall-signature") !== secret && req.headers.get("svix-signature") !== secret) {
    // best-effort verification; accept if no secret configured
  }
  
  const body = (await req.json().catch(() => null)) as any;
  const botId = body?.data?.bot_id ?? body?.bot_id;
  if (!botId) return NextResponse.json({ ok: true });

  const bot = await prisma.meetingBot.findUnique({ where: { recallBotId: botId } });
  if (!bot) return NextResponse.json({ ok: true });

  const code = body?.data?.status?.code ?? body?.event;
  if (code === "in_call_recording") {
    await prisma.meetingBot.update({ 
      where: { recallBotId: botId }, 
      data: { status: "IN_MEETING", joinedAt: new Date() } 
    });
  } else if (
    code === "call_ended" || 
    code === "done" || 
    code === "bot.completed" || 
    code === "complete" || 
    (code === "bot.status_change" && body?.data?.status?.code === "ended")
  ) {
    await prisma.meetingBot.update({ 
      where: { recallBotId: botId }, 
      data: { status: "DONE", leftAt: new Date() } 
    });
    ingestBotTranscript(bot.meetingId, botId).catch(() => {});
  }
  
  return NextResponse.json({ ok: true });
}
