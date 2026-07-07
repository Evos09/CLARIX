import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { chatModelForPlan, getOrgPlan, globalChatLimit } from "@/lib/plan";
import { isClaudeConfigured } from "@/lib/claude";
import { answerGlobalChat, bumpChatUsage, getChatBonus, getChatUsage, retrieveContext } from "@/lib/globalChat";
import { chatLimiter, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

type Params = { params: Promise<{ sessionId: string }> };
const Body = z.object({ message: z.string().min(1).max(4000), mode: z.enum(["focused", "research", "writer"]).optional() });

export async function POST(req: Request, { params }: Params) {
  if (!chatLimiter.limit(clientIp(req)).success) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }
  const { sessionId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isClaudeConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  if (limit === 0) return NextResponse.json({ error: "Upgrade to Starter for CLARIX AI." }, { status: 403 });
  if (limit !== null) {
    // Effective allowance = plan cap + any packs bought this cycle.
    const [used, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
    if (used >= limit + bonus) {
      // Pro can buy $9/100-message packs (wires in with Stripe) or upgrade to Business.
      const nextStep =
        plan.id === "PRO"
          ? "Add a 100-message pack ($9) or upgrade to Business for unlimited Clarix Chat."
          : plan.id === "STARTER"
            ? "Add a 100-message pack ($9), or upgrade to Pro (100/mo) or Business (unlimited)."
            : "Upgrade for more.";
      return NextResponse.json(
        { error: `You've used all ${limit + bonus} Clarix Chat messages this month. ${nextStep}` },
        { status: 429 },
      );
    }
  }

  const session = await prisma.globalChatSession.findFirst({
    where: { id: sessionId, userId: ctx.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const message = parsed.data.message;

  try {
    const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
    const { meetings, excerpts } = await retrieveContext(ctx.orgId, message);
    const answer = await answerGlobalChat({
      orgName: org?.name ?? "your team",
      message,
      history: session.messages.map((m) => ({ role: m.role, content: m.content })),
      meetings,
      excerpts,
      mode: parsed.data.mode,
      model: chatModelForPlan(plan),
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
  } catch (err) {
    console.error("global chat message failed:", err);
    return NextResponse.json(
      { error: "CLARIX had trouble answering that. Please try again." },
      { status: 500 },
    );
  }
}
