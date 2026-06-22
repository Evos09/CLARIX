import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isGoogleConfigured } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const [email, calendar] = await Promise.all([
    prisma.emailConnection.findUnique({ where: { userId: ctx.userId }, select: { provider: true, email: true, connected: true } }),
    prisma.calendarConnection.findUnique({ where: { userId: ctx.userId }, select: { provider: true, calDavUser: true, connected: true, syncedAt: true } }),
  ]);
  return NextResponse.json({ googleConfigured: isGoogleConfigured(), email, calendar });
}
