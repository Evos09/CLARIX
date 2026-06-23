import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRecallConfigured, detectPlatform, createBot } from "@/lib/recall";
import { canCreateMeeting } from "@/lib/plan";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Shared secret check — Bearer header, x-cron-secret header, or ?secret=. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret ||
    url.searchParams.get("secret") === secret
  );
}

const URL_RE =
  /(https?:\/\/[^\s"'<>]*(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com|teams\.live\.com|webex\.com)[^\s"'<>]*)/i;

function extractMeetingUrl(...parts: (string | null | undefined)[]): string | null {
  for (const part of parts) {
    const m = part?.match(URL_RE);
    if (m) return m[1];
  }
  return null;
}

async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRecallConfigured()) return NextResponse.json({ error: "Meeting bot not configured (RECALL_API_KEY)" }, { status: 503 });

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 10 * 60 * 1000); // join meetings starting within 10 min

  const conns = await prisma.calendarConnection.findMany({
    where: { autoJoin: true, connected: true },
    include: { user: { select: { orgId: true } } },
  });

  let considered = 0;
  let joined = 0;
  let skipped = 0;

  for (const conn of conns) {
    const events = await prisma.calendarEvent.findMany({
      where: { userId: conn.userId, meetingId: null, startTime: { gte: now, lte: windowEnd } },
      take: 10,
    });
    for (const ev of events) {
      considered++;
      const url = extractMeetingUrl(ev.location, ev.description, ev.title);
      if (!url || detectPlatform(url) === "UNKNOWN") {
        skipped++;
        continue;
      }
      const gate = await canCreateMeeting(conn.user.orgId);
      if (!gate.ok) {
        skipped++;
        continue;
      }
      try {
        const meeting = await prisma.meeting.create({
          data: {
            title: ev.title || "Meeting",
            meetingType: "GENERAL",
            autoDetect: true,
            status: "TRANSCRIBING",
            orgId: conn.user.orgId,
            userId: conn.userId,
          },
          select: { id: true },
        });
        const bot = await createBot(url, ev.title || "Meeting");
        await prisma.meetingBot.create({
          data: { recallBotId: bot.id, meetingId: meeting.id, platform: detectPlatform(url), meetingUrl: url, status: "JOINING" },
        });
        await prisma.calendarEvent.update({ where: { id: ev.id }, data: { meetingId: meeting.id } });
        joined++;
      } catch {
        skipped++;
      }
    }
  }

  return NextResponse.json({ ok: true, considered, joined, skipped });
}

export async function POST(req: Request) {
  return run(req);
}
export async function GET(req: Request) {
  return run(req);
}
