import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { syncCalendar } from "@/lib/calendar";

export async function POST() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const conn = await prisma.calendarConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "No calendar connected" }, { status: 409 });
  if (conn.syncedAt && Date.now() - conn.syncedAt.getTime() < 5 * 60 * 1000) {
    return NextResponse.json({ error: "Synced recently. Try again in a few minutes." }, { status: 429 });
  }
  try {
    const result = await syncCalendar(ctx.userId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sync failed" }, { status: 500 });
  }
}
