import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const conn = await prisma.calendarConnection.findUnique({
    where: { userId: ctx.userId },
    select: { autoJoin: true, connected: true },
  });
  return NextResponse.json({ autoJoin: conn?.autoJoin ?? false, calendarConnected: Boolean(conn?.connected) });
}

const Body = z.object({ autoJoin: z.boolean() });

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const conn = await prisma.calendarConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Connect a calendar first." }, { status: 409 });

  const updated = await prisma.calendarConnection.update({
    where: { userId: ctx.userId },
    data: { autoJoin: parsed.data.autoJoin },
    select: { autoJoin: true },
  });
  return NextResponse.json({ autoJoin: updated.autoJoin });
}
