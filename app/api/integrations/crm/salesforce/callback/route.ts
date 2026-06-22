import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";
import { exchangeSalesforceCode } from "@/lib/crm/salesforce";

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
    const t = await exchangeSalesforceCode(code);
    await prisma.cRMConnection.upsert({
      where: { userId: ctx.userId },
      update: { provider: "SALESFORCE", accessToken: encryptToken(t.accessToken), refreshToken: encryptToken(t.refreshToken ?? ""), instanceUrl: t.instanceUrl, expiresAt: t.expiresAt, connected: true },
      create: { userId: ctx.userId, provider: "SALESFORCE", accessToken: encryptToken(t.accessToken), refreshToken: encryptToken(t.refreshToken ?? ""), instanceUrl: t.instanceUrl, expiresAt: t.expiresAt },
    });
    return NextResponse.redirect(`${base}/settings?connected=salesforce`);
  } catch {
    return NextResponse.redirect(`${base}/settings?error=oauth`);
  }
}
