import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import crypto from "crypto";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const meeting = await prisma.meeting.findFirst({
    where: { id, orgId: ctx.orgId },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  let shareToken = meeting.shareToken;
  if (!shareToken) {
    shareToken = crypto.randomUUID();
    await prisma.meeting.update({
      where: { id },
      data: { shareToken },
    });
  }

  return NextResponse.json({ shareToken });
}
