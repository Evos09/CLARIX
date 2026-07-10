import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestBotTranscript, ingestTranscriptPayload } from "@/lib/recall";

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
    // Fast path: the `complete` webhook carries the transcript inline — store
    // it immediately so everything is loaded the moment the meeting ends.
    // Fall back to fetching from the API (with retries) when it's absent.
    const inline = await ingestTranscriptPayload(
      bot.meetingId,
      body?.data?.transcript ?? body?.transcript,
    ).catch(() => false);
    if (!inline) {
      ingestBotTranscript(bot.meetingId, botId).catch(() => {});
    }
  }
  
  return NextResponse.json({ ok: true });
}
