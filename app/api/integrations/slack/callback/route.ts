import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = (await cookies()).get("clarix_oauth_state")?.value;
  if (!code || state !== saved) return NextResponse.redirect(`${base}/settings?error=oauth`);
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.redirect(`${base}/settings?error=auth`);
  try {
    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.SLACK_CLIENT_ID ?? "", client_secret: process.env.SLACK_CLIENT_SECRET ?? "", code, redirect_uri: `${base}/api/integrations/slack/callback` }),
    });
    const d = await res.json();
    if (!d.ok) throw new Error(d.error);
    await prisma.slackConnection.upsert({
      where: { userId: ctx.userId },
      update: { accessToken: encryptToken(d.access_token), teamId: d.team.id, teamName: d.team.name, botUserId: d.bot_user_id ?? "", connected: true },
      create: { userId: ctx.userId, accessToken: encryptToken(d.access_token), teamId: d.team.id, teamName: d.team.name, botUserId: d.bot_user_id ?? "" },
    });
    return NextResponse.redirect(`${base}/settings?connected=slack`);
  } catch {
    return NextResponse.redirect(`${base}/settings?error=oauth`);
  }
}
