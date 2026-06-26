import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ shareToken: string }> };

const PatchBody = z.object({
  actionItemId: z.string(),
  completed: z.boolean(),
});

export async function GET(_req: Request, { params }: Params) {
  const { shareToken } = await params;
  if (!shareToken) return NextResponse.json({ error: "Invalid share token" }, { status: 400 });

  const meeting = await prisma.meeting.findUnique({
    where: { shareToken },
    select: {
      id: true,
      title: true,
      createdAt: true,
      actionItemRecords: {
        select: {
          id: true,
          task: true,
          owner: true,
          dueDate: true,
          priority: true,
          completed: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json(meeting);
}

export async function PATCH(req: Request, { params }: Params) {
  const { shareToken } = await params;
  if (!shareToken) return NextResponse.json({ error: "Invalid share token" }, { status: 400 });

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { actionItemId, completed } = parsed.data;

  // Verify the action item belongs to the meeting matching the share token
  const actionItem = await prisma.actionItem.findFirst({
    where: {
      id: actionItemId,
      meeting: { shareToken },
    },
  });

  if (!actionItem) {
    return NextResponse.json({ error: "Action item not found" }, { status: 404 });
  }

  const updated = await prisma.actionItem.update({
    where: { id: actionItemId },
    data: { completed },
  });

  return NextResponse.json({ ok: true, completed: updated.completed });
}
