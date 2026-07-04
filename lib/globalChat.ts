import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { claudeText } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import type { BaseOutput } from "@/lib/outputTypes";
import { searchChunks } from "@/lib/memory/search";
import { isEmbeddingsConfigured } from "@/lib/embeddings";

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

export interface Excerpt {
  title: string;
  date: Date;
  text: string;
}

/**
 * Semantic retrieval for the global chat: embeds the query and pulls the most
 * relevant transcript chunks (org-scoped), returning both the source meetings
 * (for summaries + citations) and the verbatim matched excerpts (for grounding).
 * Falls back to keyword search when embeddings aren't configured or return
 * nothing, so behavior is unchanged until the vector index is populated.
 */
export async function retrieveContext(
  orgId: string,
  query: string,
): Promise<{ meetings: RelevantMeeting[]; excerpts: Excerpt[] }> {
  if (isEmbeddingsConfigured()) {
    try {
      const hits = await searchChunks(orgId, query, 12);
      if (hits.length) {
        const excerpts: Excerpt[] = hits
          .slice(0, 6)
          .map((h) => ({ title: h.title, date: h.createdAt, text: h.content }));

        // Unique source meetings, in relevance order, capped at 5.
        const meetingIds: string[] = [];
        const seen = new Set<string>();
        for (const h of hits) {
          if (!seen.has(h.meetingId)) {
            seen.add(h.meetingId);
            meetingIds.push(h.meetingId);
          }
          if (meetingIds.length >= 5) break;
        }

        const rows = await prisma.meeting.findMany({
          where: { id: { in: meetingIds }, orgId },
          select: { id: true, title: true, meetingType: true, createdAt: true, structuredOutput: true },
        });
        const byId = new Map(rows.map((r) => [r.id, r]));
        const meetings = meetingIds
          .map((id) => byId.get(id))
          .filter((m): m is NonNullable<typeof m> => Boolean(m)) as RelevantMeeting[];

        return { meetings, excerpts };
      }
    } catch (err) {
      // Embeddings can fail (no OpenAI quota, rate limit, outage) — never break
      // the chat over it; fall through to keyword search below.
      console.error("Semantic retrieval failed; falling back to keyword search:", err);
    }
  }

  // Fallback: keyword search (embeddings unconfigured, no hits, or an error above).
  return { meetings: await findRelevantMeetings(orgId, query), excerpts: [] };
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
  excerpts?: Excerpt[];
  mode?: "focused" | "research" | "writer";
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

  const modeNote =
    opts.mode === "writer"
      ? "MODE: Writer. Produce polished, fully-formatted written output with no conversational filler."
      : opts.mode === "research"
        ? "MODE: Research. Supplement the meeting context with general knowledge where helpful, and clearly mark what came from meetings vs general knowledge."
        : "MODE: Focused. Answer only from the meeting context below. If the answer is not present, say you do not know.";

  const excerptBlock = (opts.excerpts ?? []).length
    ? `\n\nRELEVANT TRANSCRIPT EXCERPTS (verbatim, most relevant first):\n${opts
        .excerpts!.map((e) => `From "${e.title}" (${e.date.toDateString()}):\n"${e.text}"`)
        .join("\n---\n")}`
    : "";

  const system = `You are CLARIX, an AI assistant with access to ${opts.orgName}'s meeting history. You help the team understand decisions, track commitments, and find information across all their recorded meetings.

${modeNote}

GUIDELINES:
- Always cite which meeting your information comes from (meeting title + date).
- When transcript excerpts are provided, ground your answer in them and quote specifics where useful.
- If you're not certain something was discussed, say so.
- Keep responses concise unless asked for details.
- Format lists as clean bullet points.

RELEVANT MEETING CONTEXT:
${ctx || "No completed meetings found yet."}${excerptBlock}`;

  const historyText = opts.history
    .slice(-8)
    .map((h) => `${h.role === "user" ? "User" : "CLARIX"}: ${h.content}`)
    .join("\n");
  const prompt = `${historyText ? historyText + "\n" : ""}User: ${opts.message}\nCLARIX:`;

  return claudeText({ system, prompt, maxTokens: opts.mode === "writer" ? 2048 : 1024, temperature: 0.3 });
}
