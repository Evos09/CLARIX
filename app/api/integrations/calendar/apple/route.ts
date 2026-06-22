import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";
import { verifyAppleCalDav, syncCalendar } from "@/lib/calendar";

const Body = z.object({ appleId: z.string().email(), appPassword: z.string().min(1) });

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid Apple ID and app password." }, { status: 400 });

  try {
    const serverUrl = await verifyAppleCalDav(parsed.data);
    await prisma.calendarConnection.upsert({
      where: { userId: ctx.userId },
      update: { provider: "APPLE", calDavUrl: serverUrl, calDavUser: parsed.data.appleId, calDavPass: encryptToken(parsed.data.appPassword), connected: true, accessToken: null, refreshToken: null },
      create: { userId: ctx.userId, provider: "APPLE", calDavUrl: serverUrl, calDavUser: parsed.data.appleId, calDavPass: encryptToken(parsed.data.appPassword) },
    });
    await syncCalendar(ctx.userId).catch(() => {});
    return NextResponse.json({ connected: true });
  } catch {
    return NextResponse.json({ error: "Could not connect. Check your Apple ID and app-specific password." }, { status: 400 });
  }
}
