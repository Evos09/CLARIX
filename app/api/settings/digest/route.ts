import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

const Body = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(["DAILY", "WEEKLY"]).optional(),
});

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const s = await prisma.emailDigestSettings.findUnique({ where: { userId: ctx.userId } });
  return NextResponse.json({ enabled: s?.enabled ?? false, frequency: s?.frequency ?? "WEEKLY" });
}

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { enabled, frequency } = parsed.data;

  const s = await prisma.emailDigestSettings.upsert({
    where: { userId: ctx.userId },
    create: { userId: ctx.userId, enabled: enabled ?? true, frequency: frequency ?? "WEEKLY" },
    update: {
      ...(enabled !== undefined ? { enabled } : {}),
      ...(frequency ? { frequency } : {}),
    },
  });
  return NextResponse.json({ enabled: s.enabled, frequency: s.frequency });
}
