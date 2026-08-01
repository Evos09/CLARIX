import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isClaudeConfigured } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan, globalChatLimit, chatModelForPlan, overlayAllowed } from "@/lib/plan";
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
});

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
 * Stateless "ask your meeting memory" endpoint powering the overlay surfaces
 * (desktop overlay window + browser companion). It reuses the same brain as
 * Clarix Chat — semantic retrieval over the org's transcripts, then a grounded,
 * cited answer — but without a chat session, and returns structured citations
 * so the overlay can render clickable links back to each source meeting.
 *
 * Gating + usage metering mirror the global chat so the overlay can't be used
 * to bypass plan caps.
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

  // The overlay is a Pro/Business perk — a step above Clarix Chat, which
  // Starter also gets. Free and Starter are refused outright.
  if (!overlayAllowed(plan)) {
    return NextResponse.json(
      { error: "The CLARIX overlay is available on Pro and Business plans. Upgrade to ask across your meetings.", locked: true },
      { status: 403 },
    );
  }

  // Beyond the plan gate, Pro is still metered against the shared chat cap.
  const limit = globalChatLimit(plan);
  if (limit !== null) {
    const [used, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
    if (used >= limit + bonus) {
      return NextResponse.json(
        { error: `You've used all ${limit + bonus} of this month's Clarix Chat messages. Upgrade or add a message pack to keep asking.`, overLimit: true },
        { status: 429 },
      );
    }
  }

  // Resolve the date window: an explicit UI chip wins; otherwise parse one out
  // of the question ("the Q3 meetings"). null → unscoped topic search.
  const now = new Date();
  const range: ResolvedRange | null = parsed.data.range
    ? resolvePreset(parsed.data.range, now)
    : parseDateFilter(parsed.data.query, now);

  try {
    const { meetings, excerpts } = await retrieveContext(ctx.orgId, parsed.data.query, range ?? undefined);

    const answer = await answerGlobalChat({
      orgId: ctx.orgId,
      orgName: org?.name ?? "your workspace",
      message: range ? `${parsed.data.query}\n\n(Scope: ${range.label}.)` : parsed.data.query,
      history: [],
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

    await bumpChatUsage(ctx.userId);

    return NextResponse.json({ answer, citations, range: range?.label ?? null });
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
