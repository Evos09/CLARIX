import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan, globalChatLimit } from "@/lib/plan";
import { getChatBonus, getChatUsage } from "@/lib/globalChat";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  if (limit === 0) return NextResponse.json({ locked: true, sessions: [], usageThisMonth: 0, usageLimit: 0 });

  const sessions = await prisma.globalChatSession.findMany({
    where: { userId: ctx.userId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "asc" }, select: { content: true } } },
  });
  const [usageThisMonth, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
  return NextResponse.json({
    locked: false,
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
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const plan = await getOrgPlan(ctx.orgId);
  if (globalChatLimit(plan) === 0) return NextResponse.json({ error: "Upgrade to Pro for CLARIX AI." }, { status: 403 });
  const s = await prisma.globalChatSession.create({ data: { userId: ctx.userId, orgId: ctx.orgId } });
  return NextResponse.json({ sessionId: s.id }, { status: 201 });
}
