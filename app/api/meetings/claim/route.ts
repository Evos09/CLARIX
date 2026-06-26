import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, getOrCreateAnonymousContext } from "@/lib/auth";

const ClaimBody = z.object({
  meetingId: z.string().min(1),
});

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ClaimBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { meetingId } = parsed.data;

  // Find meeting
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const anonCtx = await getOrCreateAnonymousContext();

  // Security check: Only allow claiming meetings owned by the anonymous user
  if (meeting.userId !== anonCtx.userId || meeting.orgId !== anonCtx.orgId) {
    return NextResponse.json(
      { error: "This meeting has already been claimed or does not belong to the demo environment." },
      { status: 403 },
    );
  }

  // Update meeting and its action items in a transaction
  await prisma.$transaction([
    prisma.meeting.update({
      where: { id: meetingId },
      data: {
        userId: ctx.userId,
        orgId: ctx.orgId,
      },
    }),
    prisma.actionItem.updateMany({
      where: { meetingId },
      data: {
        orgId: ctx.orgId,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, id: meetingId });
}
