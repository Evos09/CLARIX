import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isClaudeConfigured } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan, globalChatLimit, chatModelForPlan } from "@/lib/plan";
import {
  retrieveContext,
  answerGlobalChat,
  getChatUsage,
  getChatBonus,
  bumpChatUsage,
} from "@/lib/globalChat";

export const dynamic = "force-dynamic";

const Body = z.object({
  query: z.string().min(1).max(2000),
  mode: z.enum(["focused", "research", "writer"]).default("focused"),
});

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

  // Same access ladder as Clarix Chat: Free is locked, paid tiers are capped.
  const limit = globalChatLimit(plan);
  if (limit === 0) {
    return NextResponse.json({ error: "Memory search is a paid feature. Upgrade to use the overlay.", locked: true }, { status: 403 });
  }
  if (limit !== null) {
    const [used, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
    if (used >= limit + bonus) {
      return NextResponse.json(
        { error: `You've used all ${limit + bonus} of this month's Clarix Chat messages. Upgrade or add a message pack to keep asking.`, overLimit: true },
        { status: 429 },
      );
    }
  }

  try {
    const { meetings, excerpts } = await retrieveContext(ctx.orgId, parsed.data.query);

    const answer = await answerGlobalChat({
      orgId: ctx.orgId,
      orgName: org?.name ?? "your workspace",
      message: parsed.data.query,
      history: [],
      meetings,
      excerpts,
      mode: parsed.data.mode,
      model: chatModelForPlan(plan),
    });

    // Structured citations for the overlay UI (clickable → the source meeting).
    const citations = meetings.map((m) => ({
      id: m.id,
      title: m.title,
      type: getMeetingType(m.meetingType).label,
      date: m.createdAt.toISOString(),
    }));

    await bumpChatUsage(ctx.userId);

    return NextResponse.json({ answer, citations });
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
