import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: ctx.userId,
      ...(from || to ? { startTime: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    },
    orderBy: { startTime: "asc" },
    take: 50,
    include: { meeting: { select: { id: true } } },
  });
  return NextResponse.json(events);
}
