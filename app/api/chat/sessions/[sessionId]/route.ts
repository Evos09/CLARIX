import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

type Params = { params: Promise<{ sessionId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { sessionId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const session = await prisma.globalChatSession.findFirst({
    where: { id: sessionId, userId: ctx.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { sessionId } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const session = await prisma.globalChatSession.findFirst({ where: { id: sessionId, userId: ctx.userId } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.globalChatSession.delete({ where: { id: sessionId } });
  return NextResponse.json({ ok: true });
}
