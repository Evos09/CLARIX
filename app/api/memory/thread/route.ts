import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Turns replayed into the overlay when it reopens or switches conversation. */
const RESUME_TURNS = 40;

/** Conversations offered in the overlay's history picker. */
const RECENT_SESSIONS = 25;

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
export async function GET(req: Request) {
  const ctx = await getOrCreateContext();
  // Null context here means "not signed in" far more often than it means the
  // database is missing, so say so — the overlay renders this verbatim.
  if (!ctx) return NextResponse.json({ error: "Sign in to CLARIX to load your conversations." }, { status: 401 });

  // ?id= loads a specific conversation (history picker); omitted resumes the
  // most recently touched one, from the overlay or the dashboard alike.
  const wanted = new URL(req.url).searchParams.get("id");

  const [session, recent] = await Promise.all([
    prisma.globalChatSession.findFirst({
      where: wanted
        ? { id: wanted, userId: ctx.userId, orgId: ctx.orgId }
        : { userId: ctx.userId, orgId: ctx.orgId },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: RESUME_TURNS } },
    }),
    prisma.globalChatSession.findMany({
      where: { userId: ctx.userId, orgId: ctx.orgId },
      orderBy: { updatedAt: "desc" },
      take: RECENT_SESSIONS,
      include: { messages: { take: 1, orderBy: { createdAt: "asc" }, select: { content: true } } },
    }),
  ]);

  const sessions = recent.map((s) => ({
    id: s.id,
    title: s.title ?? s.messages[0]?.content.slice(0, 60) ?? "New conversation",
    updatedAt: s.updatedAt,
  }));

  if (!session) return NextResponse.json({ sessionId: null, messages: [], sessions });

  return NextResponse.json({
    sessionId: session.id,
    title: session.title,
    sessions,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      citations: m.citations ?? undefined,
    })),
  });
}
