import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Turns replayed into the overlay when it reopens. */
const RESUME_TURNS = 40;

/**
 * The conversation the overlay reopens into.
 *
 * Returns the user's most recently touched thread regardless of where it
 * started, so a question asked at your desk and one asked mid-meeting are one
 * continuous conversation rather than two histories that don't know about each
 * other.
 *
 * Read-only and deliberately ungated: it only ever returns the caller's own
 * messages. Plan limits belong on writing (overlayAskLimit, in the ask route)
 * and on composing from the dashboard (canSendGlobalChat) — metering someone's
 * access to text they already spent an allowance to generate would be punitive.
 */
export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await prisma.globalChatSession.findFirst({
    where: { userId: ctx.userId, orgId: ctx.orgId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" }, take: RESUME_TURNS } },
  });

  if (!session) return NextResponse.json({ sessionId: null, messages: [] });

  return NextResponse.json({
    sessionId: session.id,
    title: session.title,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      citations: m.citations ?? undefined,
    })),
  });
}
