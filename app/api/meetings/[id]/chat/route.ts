import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isClaudeConfigured, claudeChat } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan } from "@/lib/plan";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await getOrgPlan(ctx.orgId);
  if (!plan.askClarix) return NextResponse.json({ locked: true, messages: [] });

  const messages = await prisma.chatMessage.findMany({
    where: { meetingId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });
  return NextResponse.json({ locked: false, messages });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.chatMessage.deleteMany({ where: { meetingId: id } });
  return NextResponse.json({ ok: true });
}

const Body = z.object({ message: z.string().min(1).max(4000) });

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isClaudeConfigured()) {
    return NextResponse.json({ error: "AI not configured (ANTHROPIC_API_KEY)" }, { status: 503 });
  }
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await getOrgPlan(ctx.orgId);
  if (!plan.askClarix) return NextResponse.json({ error: "Ask CLARIX is a Pro feature." }, { status: 403 });
  if (!meeting.rawTranscript) {
    return NextResponse.json({ error: "No transcript to ask about yet" }, { status: 409 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const typeLabel = getMeetingType(meeting.meetingType).label;
  const system = `You are CLARIX, answering questions about a specific ${typeLabel}.
Use ONLY the transcript and structured analysis below. If the answer isn't present, say so.
When asked to draft an email or Slack message, produce ready-to-send text.
Format with Markdown when helpful (lists, bold, tables).

STRUCTURED ANALYSIS:
${JSON.stringify(meeting.structuredOutput ?? {}, null, 2)}

TRANSCRIPT:
"""
${meeting.rawTranscript}
"""`;

  const history = await prisma.chatMessage.findMany({
    where: { meetingId: id },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });
  const messages = [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: parsed.data.message },
  ];

  let reply: string;
  try {
    const { CLAUDE_SONNET, CLAUDE_HAIKU } = await import("@/lib/claude");
    const model = plan.id === "FREE" ? CLAUDE_HAIKU : CLAUDE_SONNET;
    reply = await claudeChat({ system, messages, maxTokens: 1024, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await prisma.chatMessage.createMany({
    data: [
      { meetingId: id, role: "user", content: parsed.data.message },
      { meetingId: id, role: "assistant", content: reply },
    ],
  });
  return NextResponse.json({ reply });
}
