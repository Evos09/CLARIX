import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getAccessibleMeeting } from "@/lib/meetingAccess";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const meeting = await getAccessibleMeeting(id, ctx);
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { meetingId: id },
    orderBy: [{ timestamp: "asc" }, { createdAt: "asc" }],
    select: { id: true, content: true, timestamp: true, createdAt: true },
  });
  return NextResponse.json(comments);
}

const Body = z.object({
  content: z.string().min(1).max(2000),
  timestamp: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const meeting = await getAccessibleMeeting(id, ctx, { requireEdit: true });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      timestamp: parsed.data.timestamp,
      meetingId: id,
      userId: ctx.userId,
    },
    select: { id: true, content: true, timestamp: true, createdAt: true },
  });
  return NextResponse.json(comment, { status: 201 });
}
