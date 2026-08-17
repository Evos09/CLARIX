import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

export async function DELETE() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  await prisma.calendarConnection.deleteMany({ where: { userId: ctx.userId } });
  await prisma.calendarEvent.deleteMany({ where: { userId: ctx.userId } });
  return NextResponse.json({ disconnected: true });
}
