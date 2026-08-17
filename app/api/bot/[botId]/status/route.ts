import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getBot } from "@/lib/recall";

type Params = { params: Promise<{ botId: string }> };

const MAP: Record<string, "JOINING" | "IN_MEETING" | "DONE" | "FAILED"> = {
  joining_call: "JOINING",
  in_waiting_room: "JOINING",
  in_call_not_recording: "IN_MEETING",
  in_call_recording: "IN_MEETING",
  call_ended: "DONE",
  done: "DONE",
  fatal: "FAILED",
};

export async function GET(_req: Request, { params }: Params) {
  const { botId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const bot = await prisma.meetingBot.findUnique({ where: { recallBotId: botId } });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const data = await getBot(botId);
    const code = data.status?.code ?? data.status_changes?.[data.status_changes.length - 1]?.code;
    const mapped = code ? MAP[code] : undefined;
    if (mapped && mapped !== bot.status) {
      await prisma.meetingBot.update({ where: { recallBotId: botId }, data: { status: mapped } });
    }
    return NextResponse.json({ status: mapped ?? bot.status, platform: bot.platform, meetingId: bot.meetingId });
  } catch {
    return NextResponse.json({ status: bot.status, platform: bot.platform, meetingId: bot.meetingId });
  }
}
