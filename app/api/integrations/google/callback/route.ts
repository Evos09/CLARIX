import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { exchangeCode, getGoogleProfileEmail } from "@/lib/google";
import { encryptToken } from "@/lib/crypto";
import { syncCalendar } from "@/lib/calendar";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = (await cookies()).get("clarix_oauth_state")?.value;
  if (!code || !state || state !== saved) return NextResponse.redirect(`${base}/settings?error=oauth`);

  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.redirect(`${base}/settings?error=auth`);

  try {
    const tokens = await exchangeCode(code);
    const email = await getGoogleProfileEmail(tokens.accessToken);
    const enc = encryptToken(tokens.accessToken);
    const refreshEnc = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

    await prisma.emailConnection.upsert({
      where: { userId: ctx.userId },
      update: { provider: "GMAIL", email, accessToken: enc, ...(refreshEnc ? { refreshToken: refreshEnc } : {}), expiresAt: tokens.expiresAt, connected: true },
      create: { userId: ctx.userId, provider: "GMAIL", email, accessToken: enc, refreshToken: refreshEnc ?? enc, expiresAt: tokens.expiresAt },
    });
    await prisma.calendarConnection.upsert({
      where: { userId: ctx.userId },
      update: { provider: "GOOGLE", accessToken: enc, ...(refreshEnc ? { refreshToken: refreshEnc } : {}), connected: true },
      create: { userId: ctx.userId, provider: "GOOGLE", accessToken: enc, refreshToken: refreshEnc },
    });
    await syncCalendar(ctx.userId).catch(() => {});
    return NextResponse.redirect(`${base}/settings?connected=google`);
  } catch {
    return NextResponse.redirect(`${base}/settings?error=oauth`);
  }
}
