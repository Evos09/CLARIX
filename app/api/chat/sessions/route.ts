import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { canSendGlobalChat, getOrgPlan, globalChatLimit } from "@/lib/plan";
import { getChatBonus, getChatUsage } from "@/lib/globalChat";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);

  // Listing is not gated. Free can't compose here (see canSend below), but it
  // CAN ask questions in the overlay, and those threads land in this same
  // store — so returning an empty list for Free would hide a user's own
  // conversations from them. Read your history on any plan; sending is what
  // costs.
  const sessions = await prisma.globalChatSession.findMany({
    where: { userId: ctx.userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "asc" }, select: { content: true } } },
  });
  const [usageThisMonth, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
  return NextResponse.json({
    canSend: canSendGlobalChat(plan),
    usageThisMonth,
    usageLimit: limit === null ? null : limit + bonus,
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title ?? s.messages[0]?.content.slice(0, 60) ?? "New chat",
      updatedAt: s.updatedAt,
    })),
  });
}

export async function POST() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const plan = await getOrgPlan(ctx.orgId);
  if (globalChatLimit(plan) === 0) return NextResponse.json({ error: "Upgrade to Pro for CLARIX AI." }, { status: 403 });
  const s = await prisma.globalChatSession.create({ data: { userId: ctx.userId, orgId: ctx.orgId } });
  return NextResponse.json({ sessionId: s.id }, { status: 201 });
}
