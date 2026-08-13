import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isClaudeConfigured } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan, chatModelForPlan, overlayAskLimit } from "@/lib/plan";
import {
  retrieveContext,
  answerGlobalChat,
  getChatUsage,
  getChatBonus,
  bumpChatUsage,
  type Excerpt,
} from "@/lib/globalChat";
import { parseDateFilter, resolvePreset, type ResolvedRange } from "@/lib/dateFilters";

export const dynamic = "force-dynamic";

const Body = z.object({
  query: z.string().min(1).max(2000),
  mode: z.enum(["focused", "research", "writer"]).default("focused"),
  // Explicit UI filter chip; when omitted we still try to parse a range out of
  // the question itself (e.g. "the Q3 meetings").
  range: z.enum(["week", "month", "quarter", "year"]).optional(),
  // Continue an existing thread. Omitted on the first question of a
  // conversation, in which case we open one and hand the id back.
  sessionId: z.string().optional(),
});

/** How many prior turns to replay to the model on a follow-up. */
const HISTORY_TURNS = 20;

/**
 * A short, distinctive phrase from an excerpt, used to deep-link the citation
 * straight to the cited moment: /meetings/[id]?tab=transcript&hl=<phrase>. The
 * transcript viewer filters to the segment(s) containing it (and gracefully
 * clears if it isn't an exact match), so each segment's timestamp becomes a
 * one-click jump into the audio.
 */
function hlPhrase(text: string): string {
  const longest =
    text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] ?? text;
  return longest
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 8)
    .join(" ")
    .replace(/[^\p{L}\p{N} ]+$/u, "")
    .trim();
}

/**
 * "Ask your meeting memory" — the endpoint behind the overlay surfaces (desktop
 * overlay window + browser companion). Semantic retrieval over the org's
 * transcripts, then a grounded, cited answer, with structured citations so the
 * overlay can link back to each source meeting.
 *
 * Conversations are persisted into the SAME GlobalChatSession store the
 * dashboard's Clarix Chat uses. That is deliberate: a question asked
 * mid-meeting and a question asked at your desk are the same
 * conversation with the same assistant, so a thread started in one place can be
 * picked up in the other. It also means follow-ups actually work — before this,
 * every overlay question was stateless and "what about the other one?" had
 * nothing to refer back to.
 *
 * Gating + usage metering still run off overlayAskLimit, so Free keeps its
 * monthly overlay allowance and paid plans keep drawing on the chat allowance.
 * Persisting here does NOT grant dashboard send rights — see canSendGlobalChat.
 */
export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isClaudeConfigured()) {
    return NextResponse.json({ error: "AI not configured (ANTHROPIC_API_KEY)" }, { status: 503 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { id: ctx.orgId },
    select: { name: true },
  });
  const plan = await getOrgPlan(ctx.orgId);

  // Every plan can ask, including Free — the overlay is the reason to switch,
  // so it can't be the one thing nobody gets to try. Free draws on its own
  // monthly allowance; paid plans draw on Clarix Chat exactly as before.
  const limit = overlayAskLimit(plan);
  if (limit !== null) {
    const [used, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
    if (used >= limit + bonus) {
      const msg =
        plan.id === "FREE"
          ? `You've used all ${limit + bonus} overlay questions this month. Upgrade to keep asking.`
          : `You've used all ${limit + bonus} of this month's Clarix Chat messages. Upgrade or add a message pack to keep asking.`;
      return NextResponse.json({ error: msg, overLimit: true }, { status: 429 });
    }
  }

  // Resolve the date window: an explicit UI chip wins; otherwise parse one out
  // of the question ("the Q3 meetings"). null → unscoped topic search.
  const now = new Date();
  const range: ResolvedRange | null = parsed.data.range
    ? resolvePreset(parsed.data.range, now)
    : parseDateFilter(parsed.data.query, now);

  // Resolve the thread this question belongs to. An unknown or someone else's
  // sessionId falls through to a fresh thread rather than erroring — the
  // overlay caches the last id locally, and a stale one after a delete
  // shouldn't cost the user their question.
  let session = parsed.data.sessionId
    ? await prisma.globalChatSession.findFirst({
        where: { id: parsed.data.sessionId, userId: ctx.userId, orgId: ctx.orgId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: HISTORY_TURNS } },
      })
    : null;

  if (!session) {
    session = {
      ...(await prisma.globalChatSession.create({
        data: { userId: ctx.userId, orgId: ctx.orgId },
      })),
      messages: [],
    };
  }
  const sessionId = session.id;

  try {
    const { meetings, excerpts } = await retrieveContext(ctx.orgId, parsed.data.query, range ?? undefined);

    const answer = await answerGlobalChat({
      orgId: ctx.orgId,
      orgName: org?.name ?? "your workspace",
      message: range ? `${parsed.data.query}\n\n(Scope: ${range.label}.)` : parsed.data.query,
      history: session.messages.map((m) => ({ role: m.role, content: m.content })),
      meetings,
      excerpts,
      mode: parsed.data.mode,
      model: chatModelForPlan(plan),
    });

    // First excerpt per meeting → its jump-to-source second (preferred) and a
    // phrase fallback for legacy chunks that predate timed indexing.
    const jumpByMeeting = new Map<string, { t: number | null; hl: string }>();
    for (const e of excerpts as Excerpt[]) {
      if (!jumpByMeeting.has(e.meetingId)) jumpByMeeting.set(e.meetingId, { t: e.startSec, hl: hlPhrase(e.text) });
    }

    // Structured citations for the overlay UI. `t` (seconds) deep-links to the
    // exact moment in the audio; `hl` is the phrase fallback; absent both, the
    // link just opens the meeting.
    const citations = meetings.map((m) => {
      const j = jumpByMeeting.get(m.id);
      return {
        id: m.id,
        title: m.title,
        type: getMeetingType(m.meetingType).label,
        date: m.createdAt.toISOString(),
        t: j?.t ?? undefined,
        hl: j?.hl || undefined,
      };
    });

    // Persist the turn so it shows up in the dashboard's Clarix Chat. Written
    // after the answer succeeds, so a failed call leaves no orphan user message
    // hanging in the thread.
    await prisma.globalChatMessage.create({
      data: { sessionId, role: "user", content: parsed.data.query },
    });
    await prisma.globalChatMessage.create({
      data: { sessionId, role: "assistant", content: answer, citations },
    });
    await prisma.globalChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date(), title: session.title ?? parsed.data.query.slice(0, 60) },
    });

    await bumpChatUsage(ctx.userId);

    return NextResponse.json({ answer, citations, range: range?.label ?? null, sessionId });
  } catch (err) {
    console.error("memory ask failed:", err);
    const status = (err as { status?: number })?.status;
    const busy = status === 429 || status === 529 || (typeof status === "number" && status >= 500);
    return NextResponse.json(
      { error: busy ? "CLARIX is briefly overloaded. Try again in a few seconds." : "Couldn't answer that. Please try again." },
      { status: busy ? 503 : 500 },
    );
  }
}
