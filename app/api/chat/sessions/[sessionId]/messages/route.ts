import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan, globalChatLimit } from "@/lib/plan";
import { isClaudeConfigured } from "@/lib/claude";
import { answerGlobalChat, bumpChatUsage, findRelevantMeetings, getChatUsage } from "@/lib/globalChat";

type Params = { params: Promise<{ sessionId: string }> };
const Body = z.object({ message: z.string().min(1).max(4000) });

export async function POST(req: Request, { params }: Params) {
  const { sessionId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isClaudeConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  if (limit === 0) return NextResponse.json({ error: "Upgrade to Pro for CLARIX AI." }, { status: 403 });
  if (limit !== null && (await getChatUsage(ctx.userId)) >= limit) {
    return NextResponse.json({ error: `You've used all ${limit} messages this month. Upgrade for more.` }, { status: 429 });
  }

  const session = await prisma.globalChatSession.findFirst({
    where: { id: sessionId, userId: ctx.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const message = parsed.data.message;

  const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
  const meetings = await findRelevantMeetings(ctx.orgId, message);
  const answer = await answerGlobalChat({
    orgName: org?.name ?? "your team",
    message,
    history: session.messages.map((m) => ({ role: m.role, content: m.content })),
    meetings,
  });

  const citations = meetings.map((m) => ({ id: m.id, title: m.title, date: m.createdAt }));
  await prisma.globalChatMessage.create({ data: { sessionId, role: "user", content: message } });
  const assistant = await prisma.globalChatMessage.create({
    data: { sessionId, role: "assistant", content: answer, citations },
  });
  await prisma.globalChatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date(), title: session.title ?? message.slice(0, 60) },
  });
  await bumpChatUsage(ctx.userId);

  return NextResponse.json({ message: assistant, citations });
}
