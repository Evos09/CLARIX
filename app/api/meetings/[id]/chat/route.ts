import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getAccessibleMeeting } from "@/lib/meetingAccess";
import { isClaudeConfigured, claudeChat } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan, chatModelForPlan } from "@/lib/plan";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const meeting = await getAccessibleMeeting(id, ctx);
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
  const meeting = await getAccessibleMeeting(id, ctx, { requireEdit: true });
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
  const meeting = await getAccessibleMeeting(id, ctx, { requireEdit: true });
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
    // Pro+ Clarix Chat runs on Sonnet; Free/Starter on Haiku (see chatModelForPlan).
    const model = chatModelForPlan(plan);
    reply = await claudeChat({ system, messages, maxTokens: 1024, model });
  } catch (err) {
    console.error("meeting chat failed:", err);
    // Never leak the raw SDK error (e.g. a 529 "overloaded_error" JSON blob) to
    // the UI. Map transient upstream overload/rate-limit to a clear retry hint.
    const status = (err as { status?: number })?.status;
    const busy = status === 429 || status === 529 || (typeof status === "number" && status >= 500);
    return NextResponse.json(
      {
        error: busy
          ? "CLARIX is briefly overloaded. Give it a few seconds and try again."
          : "CLARIX had trouble answering that. Please try again.",
      },
      { status: busy ? 503 : 500 },
    );
  }

  await prisma.chatMessage.createMany({
    data: [
      { meetingId: id, role: "user", content: parsed.data.message },
      { meetingId: id, role: "assistant", content: reply },
    ],
  });
  return NextResponse.json({ reply });
}
