import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { claudeText } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import type { BaseOutput } from "@/lib/outputTypes";

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getChatUsage(userId: string): Promise<number> {
  const u = await prisma.chatUsage.findUnique({ where: { userId } });
  return u && u.monthYear === monthKey() ? u.count : 0;
}

export async function bumpChatUsage(userId: string): Promise<number> {
  const mk = monthKey();
  const existing = await prisma.chatUsage.findUnique({ where: { userId } });
  if (!existing) return (await prisma.chatUsage.create({ data: { userId, monthYear: mk, count: 1 } })).count;
  if (existing.monthYear !== mk)
    return (await prisma.chatUsage.update({ where: { userId }, data: { monthYear: mk, count: 1 } })).count;
  return (await prisma.chatUsage.update({ where: { userId }, data: { count: { increment: 1 } } })).count;
}

export interface RelevantMeeting {
  id: string;
  title: string;
  meetingType: string;
  createdAt: Date;
  structuredOutput: unknown;
}

/** Finds up to 5 meetings relevant to the query (title/transcript keyword match, recency fallback). */
export async function findRelevantMeetings(orgId: string, query: string): Promise<RelevantMeeting[]> {
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 8);
  const select = { id: true, title: true, meetingType: true, createdAt: true, structuredOutput: true };

  if (words.length) {
    const matched = await prisma.meeting.findMany({
      where: {
        orgId,
        status: "COMPLETE",
        OR: words.flatMap((w) => [
          { title: { contains: w, mode: Prisma.QueryMode.insensitive } },
          { rawTranscript: { contains: w, mode: Prisma.QueryMode.insensitive } },
        ]),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select,
    });
    if (matched.length) return matched;
  }
  return prisma.meeting.findMany({
    where: { orgId, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select,
  });
}

export interface ChatTurn {
  role: string;
  content: string;
}

export async function answerGlobalChat(opts: {
  orgName: string;
  message: string;
  history: ChatTurn[];
  meetings: RelevantMeeting[];
}): Promise<string> {
  const ctx = opts.meetings
    .map((m) => {
      const o = (m.structuredOutput ?? {}) as BaseOutput;
      const decisions = (o.keyDecisions ?? []).join("; ");
      const actions = (o.actionItems ?? []).map((a) => a.task).join("; ");
      return `Meeting: "${m.title}" — ${getMeetingType(m.meetingType).label} — ${m.createdAt.toDateString()}
Summary: ${o.tldr ?? ""}
Key decisions: ${decisions}
Action items: ${actions}
---`;
    })
    .join("\n");

  const system = `You are CLARIX, an AI assistant with access to ${opts.orgName}'s meeting history. You help the team understand decisions, track commitments, and find information across all their recorded meetings.

GUIDELINES:
- Always cite which meeting your information comes from (meeting title + date).
- If you're not certain something was discussed, say so.
- Keep responses concise unless asked for details.
- Format lists as clean bullet points.

RELEVANT MEETING CONTEXT:
${ctx || "No completed meetings found yet."}`;

  const historyText = opts.history
    .slice(-8)
    .map((h) => `${h.role === "user" ? "User" : "CLARIX"}: ${h.content}`)
    .join("\n");
  const prompt = `${historyText ? historyText + "\n" : ""}User: ${opts.message}\nCLARIX:`;

  return claudeText({ system, prompt, maxTokens: 1024, temperature: 0.3 });
}
